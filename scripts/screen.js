// screen.js - Fullscreen Management (reusable, persistent, with error handling)
class DHEScreen {
    constructor() {
        this.prefix = window.DHEPagePrefix || 'index';
        this.currentFullscreen = 'no';   // default
        this.init();
    }

    // -------------------------------------------------------------
    // Initialisation: load saved setting, apply, and listen
    // -------------------------------------------------------------
    init() {
        this.loadSetting();
        // Apply the saved setting – but only if it differs from current browser state
        this.applyFullscreen(this.currentFullscreen);
        this.addEventListeners();
    }

    // Read saved fullscreen setting from DHEIndexSettings (localStorage)
    loadSetting() {
        const saved = localStorage.getItem('DHEIndexSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.fullscreen) {
                this.currentFullscreen = settings.fullscreen;
            }
        }
    }

    // -------------------------------------------------------------
    // Public method – called from options.js (Do button)
    // Accepts only 'yes' or 'no'
    // -------------------------------------------------------------
    setFullscreen(value) {
        if (value !== 'yes' && value !== 'no') {
            console.warn(`DHEScreen: invalid value "${value}" – use 'yes' or 'no'`);
            return;
        }
        if (value === this.currentFullscreen) return;
        this.applyFullscreen(value);
        // The fullscreenchange event will handle persistence and UI update
    }

    // -------------------------------------------------------------
    // Safe fullscreen API calls – only request/exit if necessary
    // -------------------------------------------------------------
    applyFullscreen(value) {
        const isCurrentlyFullscreen = this.isFullscreen();

        // --- Enter fullscreen ---
        if (value === 'yes') {
            if (isCurrentlyFullscreen) {
                // Already in fullscreen – nothing to do
                return;
            }
            const enterFS = this._getEnterFS();
            if (enterFS) {
                enterFS.call(document.documentElement).catch(err => {
                    console.warn('Failed to enter fullscreen:', err);
                });
            } else {
                console.warn('Fullscreen API not supported');
            }
        }

        // --- Exit fullscreen ---
        else if (value === 'no') {
            if (!isCurrentlyFullscreen) {
                // Already not in fullscreen – nothing to do
                return;
            }
            const exitFS = this._getExitFS();
            if (exitFS) {
                exitFS.call(document).catch(err => {
                    console.warn('Failed to exit fullscreen:', err);
                });
            }
        }
    }

    // -------------------------------------------------------------
    // Fullscreen change handler – persists the new state and notifies
    // -------------------------------------------------------------
    handleFullscreenChange = () => {
        const newValue = this.isFullscreen() ? 'yes' : 'no';
        if (newValue === this.currentFullscreen) return;

        this.currentFullscreen = newValue;

        // Persist via the existing notifications system (single source of truth)
        if (window.DHEIndexNotifications) {
            window.DHEIndexNotifications.instance.updateSetting('fullscreen', newValue);
        } else {
            // Fallback – should never happen because notifications.js is loaded first
            const saved = localStorage.getItem('DHEIndexSettings');
            let settings = saved ? JSON.parse(saved) : {};
            settings.fullscreen = newValue;
            localStorage.setItem('DHEIndexSettings', JSON.stringify(settings));
        }

        // Notify other components (especially the toggle button in options.js)
        document.dispatchEvent(new CustomEvent('fullscreenChanged', {
            detail: { fullscreen: newValue }
        }));
    };

    // -------------------------------------------------------------
    // Utility: detect current fullscreen state (cross‑browser)
    // -------------------------------------------------------------
    isFullscreen() {
        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
    }

    // -------------------------------------------------------------
    // Vendor‑prefixed fullscreen methods (cached)
    // -------------------------------------------------------------
    _getEnterFS() {
        const docEl = document.documentElement;
        return docEl.requestFullscreen ||
               docEl.webkitRequestFullscreen ||
               docEl.webkitEnterFullscreen ||    // iOS Safari
               docEl.mozRequestFullScreen ||
               docEl.msRequestFullscreen;
    }

    _getExitFS() {
        return document.exitFullscreen ||
               document.webkitExitFullscreen ||
               document.mozCancelFullScreen ||
               document.msExitFullscreen;
    }

    // -------------------------------------------------------------
    // Attach all possible fullscreenchange events
    // -------------------------------------------------------------
    addEventListeners() {
        const events = [
            'fullscreenchange',
            'webkitfullscreenchange',
            'mozfullscreenchange',
            'MSFullscreenChange'
        ];
        events.forEach(eventName => {
            document.addEventListener(eventName, this.handleFullscreenChange);
        });
    }
}

// Instantiate globally – available as window.DHEScreen
window.DHEScreen = new DHEScreen();