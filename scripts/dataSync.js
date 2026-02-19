// scripts/dataSync.js – Data Synchronization Module
// Centralises all settings & progress reads/writes, with automatic cloud sync when signed in.
// Depends on: supabase.js (window.DHESupabase)
// Provides: window.DHEDataSync
(function() {
    // -------------------------------------------------------------
    // Constants & state
    // -------------------------------------------------------------
    const STORAGE_KEY_SETTINGS = 'DHEIndexSettings';
    const STORAGE_KEY_PROGRESS = 'DHEProgress';          // unified progress object
    const QUEUE_KEY = 'DHEPendingUpdates';
    let currentUser = null;
    let online = navigator.onLine;
    // In-memory queue for pending updates (also persisted to localStorage)
    let pendingQueue = [];
let saveSettingsTimeout;
let saveProgressTimeout;
let saveProgressTimeout;

    // -------------------------------------------------------------
    // Initialisation – load queue, listen to auth & network
    // -------------------------------------------------------------
    function init() {
        loadQueue();
        // Auth state listener
        if (window.DHESupabase) {
            window.DHESupabase.onAuthStateChange((event, session) => {
                const user = session?.user ?? null;
                const wasLoggedIn = !!currentUser;
                const isLoggedIn = !!user;
                currentUser = user;
                if (isLoggedIn && !wasLoggedIn) {
                    // User just signed in → trigger sync (merge)
                    syncOnSignIn().catch(err => console.warn('Sync on sign-in failed:', err));
                } else if (!isLoggedIn && wasLoggedIn) {
                    // User just signed out → optionally flush pending changes
                    syncOnSignOut().catch(err => console.warn('Sync on sign-out failed:', err));
                }
            });
        } else {
            console.warn('DHEDataSync: DHESupabase not available. Sync disabled.');
        }
        // Network listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', () => { online = false; });
        online = navigator.onLine;
        if (online && currentUser) {
            // If already online and logged in, process queue
            processQueue();
        }
    }

    // MODIFIED: Sync order – first full sync, then process queue
    function handleOnline() {
        online = true;
        if (currentUser) {
            // First sync remote to get latest data (merge)
            fullSync().catch(err => console.warn('Full sync after online failed:', err))
                .finally(() => {
                    // Then process any pending updates (they will be applied on top of synced data)
                    processQueue();
                });
        }
    }

    // -------------------------------------------------------------
    // Queue management
    // -------------------------------------------------------------
    function loadQueue() {
        try {
            const stored = localStorage.getItem(QUEUE_KEY);
            if (stored) pendingQueue = JSON.parse(stored);
        } catch (e) {
            console.warn('DHEDataSync: Failed to load queue', e);
            pendingQueue = [];
        }
    }

    function saveQueue() {
        try {
            localStorage.setItem(QUEUE_KEY, JSON.stringify(pendingQueue));
        } catch (e) {
            console.warn('DHEDataSync: Failed to save queue', e);
        }
    }

    function addToQueue(operation, data) {
        pendingQueue.push({ operation, data, timestamp: new Date().toISOString() });
        saveQueue();
    }

    // MODIFIED: Remove all items of a given operation type from the queue
    function removeFromQueue(operation) {
        pendingQueue = pendingQueue.filter(item => item.operation !== operation);
        saveQueue();
    }

    // MODIFIED: Replace any existing items of the given operation with a new one
    function replaceInQueue(operation, data) {
        pendingQueue = pendingQueue.filter(item => item.operation !== operation);
        pendingQueue.push({ operation, data, timestamp: new Date().toISOString() });
        saveQueue();
    }

    async function processQueue() {
        if (!online || !currentUser) return; // can't process while offline or not logged in
        while (pendingQueue.length > 0) {
            const item = pendingQueue[0];
            try {
                if (item.operation === 'saveSettings') {
                    await uploadSettings(item.data);
                } else if (item.operation === 'saveProgress') {
                    await uploadProgress(item.data);
                }
                // success → remove from queue
                pendingQueue.shift();
                saveQueue();
            } catch (err) {
                console.warn('Queue processing failed, will retry later', err);
                break; // stop on error, retry next time
            }
        }
    }

    // -------------------------------------------------------------
    // Internal read/write from localStorage (fallback)
    // -------------------------------------------------------------
    function getLocalSettings() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.warn('DHEDataSync: Failed to read local settings', e);
            return {};
        }
    }

    function saveLocalSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
        } catch (e) {
            console.warn('DHEDataSync: Failed to save local settings', e);
        }
    }

    function getLocalProgress() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.warn('DHEDataSync: Failed to read local progress', e);
            return {};
        }
    }

    function saveLocalProgress(progress) {
        try {
            localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
        } catch (e) {
            console.warn('DHEDataSync: Failed to save local progress', e);
        }
    }

    // -------------------------------------------------------------
    // Supabase upload/download (assumes signed in)
    // -------------------------------------------------------------
    async function uploadSettings(settings) {
        if (!currentUser) throw new Error('No user signed in');
        await window.DHESupabase.saveSettings(currentUser.id, settings);
    }

    async function downloadSettings() {
        if (!currentUser) throw new Error('No user signed in');
        const remote = await window.DHESupabase.fetchSettings(currentUser.id);
        return remote || {};
    }

    async function uploadProgress(progress) {
        if (!currentUser) throw new Error('No user signed in');
        await window.DHESupabase.saveProgress(currentUser.id, progress);
    }

    async function downloadProgress() {
        if (!currentUser) throw new Error('No user signed in');
        const remote = await window.DHESupabase.fetchProgress(currentUser.id);
        return remote || {};
    }

    // -------------------------------------------------------------
    // Timestamp helpers
    // -------------------------------------------------------------
    function getTimestamp(obj) {
        return obj?._meta?.lastSaved || '1970-01-01T00:00:00.000Z';
    }

    // -------------------------------------------------------------
    // Public API: getSettings / saveSettings
    // -------------------------------------------------------------
    async function getSettings() {
        // If signed in and online, try to fetch remote (but keep local fallback)
        if (currentUser && online) {
            try {
                const remote = await downloadSettings();
                const local = getLocalSettings();
                // Compare timestamps – use newer (or merge later)
                const remoteTime = getTimestamp(remote);
                const localTime = getTimestamp(local);
                if (remoteTime > localTime) {
                    // Remote is newer – overwrite local
                    saveLocalSettings(remote);
                    return remote;
                } else {
                    // Local is newer or equal – return local
                    return local;
                }
            } catch (err) {
                console.warn('DHEDataSync: Failed to fetch remote settings, using local', err);
                return getLocalSettings();
            }
        } else {
            // Not signed in or offline → return local
            return getLocalSettings();
        }
    }

async function saveSettings(settings) {
    // Always update local immediately
    saveLocalSettings(settings);

    // Debounce the remote upload
    if (saveSettingsTimeout) clearTimeout(saveSettingsTimeout);
    saveSettingsTimeout = setTimeout(async () => {
        if (currentUser && online) {
            try {
                await uploadSettings(settings);
                removeFromQueue('saveSettings');
            } catch (err) {
                console.warn('DHEDataSync: Failed to upload settings, queueing', err);
                replaceInQueue('saveSettings', settings);
            }
        } else if (currentUser && !online) {
            replaceInQueue('saveSettings', settings);
        }
    }, 500); // Wait 500ms after the last call before actually uploading
}

    // -------------------------------------------------------------
    // Public API: getProgress / saveProgress
    // -------------------------------------------------------------
    async function getProgress() {
        if (currentUser && online) {
            try {
                const remote = await downloadProgress();
                const local = getLocalProgress();
                const remoteTime = getTimestamp(remote);
                const localTime = getTimestamp(local);
                if (remoteTime > localTime) {
                    saveLocalProgress(remote);
                    return remote;
                } else {
                    return local;
                }
            } catch (err) {
                console.warn('DHEDataSync: Failed to fetch remote progress, using local', err);
                return getLocalProgress();
            }
        } else {
            return getLocalProgress();
        }
    }

async function saveProgress(progress) {
    const progressWithMeta = { ...progress };
    if (!progressWithMeta._meta) progressWithMeta._meta = {};
    progressWithMeta._meta.lastSaved = new Date().toISOString();
    saveLocalProgress(progressWithMeta);

    if (saveProgressTimeout) clearTimeout(saveProgressTimeout);
    saveProgressTimeout = setTimeout(async () => {
        if (currentUser && online) {
            try {
                await uploadProgress(progressWithMeta);
                removeFromQueue('saveProgress');
            } catch (err) {
                console.warn('DHEDataSync: Failed to upload progress, queueing', err);
                replaceInQueue('saveProgress', progressWithMeta);
            }
        } else if (currentUser && !online) {
            replaceInQueue('saveProgress', progressWithMeta);
        }
    }, 500);
}

    // -------------------------------------------------------------
    // Sync on sign‑in: merge local and remote, then set final state
    // -------------------------------------------------------------
    async function syncOnSignIn() {
        if (!currentUser) return;

        // Settings
        try {
            const local = getLocalSettings();
            const remote = await downloadSettings().catch(() => null);
            const finalSettings = mergeSettings(local, remote);
            saveLocalSettings(finalSettings);

            if (online) {
                await uploadSettings(finalSettings).catch(err => {
                    console.warn('Upload after merge failed, will queue', err);
                    replaceInQueue('saveSettings', finalSettings);
                });
                // If upload succeeded, remove any pending settings from queue
                removeFromQueue('saveSettings');
            } else {
                // offline, queue for later
                replaceInQueue('saveSettings', finalSettings);
            }
        } catch (err) {
            console.warn('DHEDataSync: Settings sync failed', err);
        }

        // Progress (similar)
        try {
            const local = getLocalProgress();
            const remote = await downloadProgress().catch(() => null);
            const finalProgress = mergeProgress(local, remote);
            saveLocalProgress(finalProgress);

            if (online) {
                await uploadProgress(finalProgress).catch(err => {
                    console.warn('Upload after merge failed, will queue', err);
                    replaceInQueue('saveProgress', finalProgress);
                });
                removeFromQueue('saveProgress');
            } else {
                replaceInQueue('saveProgress', finalProgress);
            }
        } catch (err) {
            console.warn('DHEDataSync: Progress sync failed', err);
        }

        // Notify the rest of the app that data has been synced
        document.dispatchEvent(new CustomEvent('dataSynced'));
    }

    // Merge using timestamp: whichever is newer, or if one missing, use the other
    function mergeSettings(local, remote) {
        if (!remote) return local;
        if (!local) return remote;
        const localTime = getTimestamp(local);
        const remoteTime = getTimestamp(remote);
        return localTime >= remoteTime ? local : remote;
    }

    function mergeProgress(local, remote) {
        if (!remote) return local;
        if (!local) return remote;
        const localTime = getTimestamp(local);
        const remoteTime = getTimestamp(remote);
        return localTime >= remoteTime ? local : remote;
    }

    // -------------------------------------------------------------
    // Sync on sign‑out: upload any pending changes (optional)
    // -------------------------------------------------------------
    async function syncOnSignOut() {
        // Flush queue if online
        if (online && currentUser) {
            await processQueue();
        }
        // No further action – user will lose ability to sync after sign-out
    }

    // -------------------------------------------------------------
    // Full sync (used when coming online)
    // -------------------------------------------------------------
    async function fullSync() {
        if (!currentUser || !online) return;
        await syncOnSignIn(); // same logic: merge remote into local
    }

    // -------------------------------------------------------------
    // Expose public API
    // -------------------------------------------------------------
    window.DHEDataSync = {
        getSettings,
        saveSettings,
        getProgress,
        saveProgress,
        // For internal use by other modules if needed
        syncOnSignIn,
        syncOnSignOut,
    };

    // Start listening
    init();
})();