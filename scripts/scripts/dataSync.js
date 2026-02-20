// scripts/dataSync.js – Data Synchronization with unified user_data table
// Uses a single queue item 'saveUserData' that stores the full { settings, progress }.

(function() {
    const STORAGE_KEY_SETTINGS = 'DHEIndexSettings';
    const STORAGE_KEY_PROGRESS = 'DHEProgress';
    const QUEUE_KEY = 'DHEPendingUpdates';

    let currentUser = null;
    let online = navigator.onLine;
    let pendingQueue = [];
    let saveSettingsTimeout, saveProgressTimeout;

    // ------------------------------------------------------------------
    // Initialisation
    // ------------------------------------------------------------------
    function init() {
        loadQueue();
        if (window.DHESupabase) {
            window.DHESupabase.onAuthStateChange((event, session) => {
                const user = session?.user ?? null;
                const wasLoggedIn = !!currentUser;
                const isLoggedIn = !!user;
                currentUser = user;
                if (isLoggedIn && !wasLoggedIn) {
                    syncOnSignIn().catch(err => console.warn('Sync on sign-in failed:', err));
                } else if (!isLoggedIn && wasLoggedIn) {
                    syncOnSignOut().catch(err => console.warn('Sync on sign-out failed:', err));
                }
            });
        } else {
            console.warn('DHEDataSync: DHESupabase not available. Sync disabled.');
        }

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', () => { online = false; });
        online = navigator.onLine;
        if (online && currentUser) processQueue();
    }

    async function handleOnline() {
        online = true;
        if (currentUser) {
            await fullSync();
            processQueue();
        }
    }

    // ------------------------------------------------------------------
    // Local Storage Helpers (keep separate keys for settings & progress)
    // ------------------------------------------------------------------
    function getLocalSettings() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.warn('Failed to read local settings', e);
            return {};
        }
    }

    function saveLocalSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save local settings', e);
        }
    }

    function getLocalProgress() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.warn('Failed to read local progress', e);
            return {};
        }
    }

    function saveLocalProgress(progress) {
        try {
            localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
        } catch (e) {
            console.warn('Failed to save local progress', e);
        }
    }

    // Build full user data object from local storage (with timestamps)
    function getLocalUserData() {
        return {
            settings: getLocalSettings(),
            progress: getLocalProgress()
        };
    }

    // Save both settings and progress locally (atomic)
    function saveLocalUserData(settings, progress) {
        saveLocalSettings(settings);
        saveLocalProgress(progress);
    }

    // ------------------------------------------------------------------
    // Timestamp helpers (uses _meta.lastSaved inside each object)
    // ------------------------------------------------------------------
    function getTimestamp(obj) {
        return obj?._meta?.lastSaved || '1970-01-01T00:00:00.000Z';
    }

    // ------------------------------------------------------------------
    // Queue management (single operation type: 'saveUserData')
    // ------------------------------------------------------------------
    function loadQueue() {
        try {
            const stored = localStorage.getItem(QUEUE_KEY);
            pendingQueue = stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.warn('Failed to load queue', e);
            pendingQueue = [];
        }
    }

    function saveQueue() {
        try {
            localStorage.setItem(QUEUE_KEY, JSON.stringify(pendingQueue));
        } catch (e) {
            console.warn('Failed to save queue', e);
        }
    }

    // Replace any existing 'saveUserData' operation with the new full data
    function queueUserData(fullData) {
        pendingQueue = pendingQueue.filter(item => item.operation !== 'saveUserData');
        pendingQueue.push({
            operation: 'saveUserData',
            data: fullData,
            timestamp: new Date().toISOString()
        });
        saveQueue();
    }

    // Process queue – upload the full user_data snapshot
    async function processQueue() {
        if (!online || !currentUser) return;
        while (pendingQueue.length > 0) {
            const item = pendingQueue[0];
            if (item.operation !== 'saveUserData') {
                // Should not happen, but remove unknown operations
                pendingQueue.shift();
                saveQueue();
                continue;
            }
            try {
                await window.DHESupabase.saveUserData(
                    currentUser.id,
                    item.data.settings,
                    item.data.progress
                );
                pendingQueue.shift(); // success → remove
                saveQueue();
            } catch (err) {
                console.warn('Queue processing failed, will retry later', err);
                break;
            }
        }
    }

    // ------------------------------------------------------------------
    // Remote fetch (always returns full { settings, progress })
    // ------------------------------------------------------------------
    async function fetchRemoteUserData() {
        if (!currentUser) throw new Error('No user signed in');
        return await window.DHESupabase.fetchUserData(currentUser.id);
    }

    // ------------------------------------------------------------------
    // Public: getSettings / saveSettings
    // ------------------------------------------------------------------
    async function getSettings() {
        if (currentUser && online) {
            try {
                const remote = await fetchRemoteUserData();
                const local = getLocalSettings();

                const remoteTime = getTimestamp(remote.settings);
                const localTime = getTimestamp(local);

                if (remoteTime > localTime) {
                    saveLocalSettings(remote.settings);
                    return remote.settings;
                } else {
                    return local;
                }
            } catch (err) {
                console.warn('Failed to fetch remote settings, using local', err);
                return getLocalSettings();
            }
        } else {
            return getLocalSettings();
        }
    }

    async function saveSettings(settings) {
        // Update local immediately (with timestamp)
        const localSettings = getLocalSettings();
        const newSettings = { ...localSettings, ...settings };
        if (!newSettings._meta) newSettings._meta = {};
        newSettings._meta.lastSaved = new Date().toISOString();
        saveLocalSettings(newSettings);

        if (currentUser && online) {
            // Get current remote progress (to preserve it) or use local if offline but we are online
            try {
                const remote = await fetchRemoteUserData();
                await window.DHESupabase.saveUserData(
                    currentUser.id,
                    newSettings,
                    remote.progress  // keep remote progress
                );
                // Success – remove any queued operation
                pendingQueue = pendingQueue.filter(item => item.operation !== 'saveUserData');
                saveQueue();
            } catch (err) {
                console.warn('Failed to upload settings, queueing', err);
                // Queue full snapshot: combine new settings with local progress
                const localProgress = getLocalProgress();
                queueUserData({ settings: newSettings, progress: localProgress });
            }
        } else if (currentUser && !online) {
            // Offline but signed in – queue full snapshot
            const localProgress = getLocalProgress();
            queueUserData({ settings: newSettings, progress: localProgress });
        }
        // If not signed in, we only save locally – no queue
    }

    // ------------------------------------------------------------------
    // Public: getProgress / saveProgress
    // ------------------------------------------------------------------
    async function getProgress() {
        if (currentUser && online) {
            try {
                const remote = await fetchRemoteUserData();
                const local = getLocalProgress();

                const remoteTime = getTimestamp(remote.progress);
                const localTime = getTimestamp(local);

                if (remoteTime > localTime) {
                    saveLocalProgress(remote.progress);
                    return remote.progress;
                } else {
                    return local;
                }
            } catch (err) {
                console.warn('Failed to fetch remote progress, using local', err);
                return getLocalProgress();
            }
        } else {
            return getLocalProgress();
        }
    }

    async function saveProgress(progress) {
        // Update local immediately
        const localProgress = getLocalProgress();
        const newProgress = { ...localProgress, ...progress };
        if (!newProgress._meta) newProgress._meta = {};
        newProgress._meta.lastSaved = new Date().toISOString();
        saveLocalProgress(newProgress);

        if (currentUser && online) {
            try {
                const remote = await fetchRemoteUserData();
                await window.DHESupabase.saveUserData(
                    currentUser.id,
                    remote.settings, // keep remote settings
                    newProgress
                );
                pendingQueue = pendingQueue.filter(item => item.operation !== 'saveUserData');
                saveQueue();
            } catch (err) {
                console.warn('Failed to upload progress, queueing', err);
                const localSettings = getLocalSettings();
                queueUserData({ settings: localSettings, progress: newProgress });
            }
        } else if (currentUser && !online) {
            const localSettings = getLocalSettings();
            queueUserData({ settings: localSettings, progress: newProgress });
        }
    }

    // ------------------------------------------------------------------
    // Sync on sign-in (merge local and remote)
    // ------------------------------------------------------------------
    async function syncOnSignIn() {
        if (!currentUser) return;
        try {
            const remote = await fetchRemoteUserData();
            const local = getLocalUserData();

            // Merge settings
            const remoteSettingsTime = getTimestamp(remote.settings);
            const localSettingsTime = getTimestamp(local.settings);
            const finalSettings = remoteSettingsTime > localSettingsTime ? remote.settings : local.settings;

            // Merge progress
            const remoteProgressTime = getTimestamp(remote.progress);
            const localProgressTime = getTimestamp(local.progress);
            const finalProgress = remoteProgressTime > localProgressTime ? remote.progress : local.progress;

            // Save merged result locally
            saveLocalUserData(finalSettings, finalProgress);

            // Upload merged result to cloud (overwrites remote with our merged version)
            if (online) {
                await window.DHESupabase.saveUserData(currentUser.id, finalSettings, finalProgress);
                // Clear any pending queue
                pendingQueue = [];
                saveQueue();
            } else {
                // Offline – queue the merged data
                queueUserData({ settings: finalSettings, progress: finalProgress });
            }
        } catch (err) {
            console.warn('Sync on sign-in failed', err);
        }
        document.dispatchEvent(new CustomEvent('dataSynced'));
    }

    async function syncOnSignOut() {
        // Before sign-out, try to flush queue if online
        if (online && currentUser) {
            await processQueue();
        }
        // No further action – local data remains
    }

    async function fullSync() {
        if (!currentUser || !online) return;
        await syncOnSignIn(); // same logic as sign-in
    }

    // ------------------------------------------------------------------
    // Expose public API
    // ------------------------------------------------------------------
    window.DHEDataSync = {
        getSettings,
        saveSettings,
        getProgress,
        saveProgress,
        syncOnSignIn,
        syncOnSignOut
    };

    init();
})();