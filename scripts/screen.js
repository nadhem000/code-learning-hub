// screen.js - Fullscreen Management
class DHEScreen {
    constructor() {
        this.prefix = window.DHEPagePrefix || 'index';
        this.currentFullscreen = 'no';   // default
        this.addEventListeners();
        this.loadSettingAsync().catch(err => console.warn('Screen: async load failed', err));
    }

    async loadSettingAsync() {
        try {
            const settings = await window.DHEDataSync.getSettings();
            if (settings.fullscreen) {
                this.currentFullscreen = settings.fullscreen;
                this.applyFullscreen(this.currentFullscreen);
            }
        } catch (e) {
            console.warn('DHEScreen: Failed to load settings via dataSync, using default', e);
        }
    }

    setFullscreen(value) {
        if (value !== 'yes' && value !== 'no') {
            console.warn(`DHEScreen: invalid value "${value}" – use 'yes' or 'no'`);
            return;
        }
        if (value === this.currentFullscreen) return;
        this.applyFullscreen(value);
        // The fullscreenchange event will handle persistence and UI update
    }

    applyFullscreen(value) {
        const isCurrentlyFullscreen = this.isFullscreen();
        if (value === 'yes') {
            if (isCurrentlyFullscreen) return;
            const enterFS = this._getEnterFS();
            if (enterFS) {
                enterFS.call(document.documentElement).catch(err => {
                    console.warn('Failed to enter fullscreen:', err);
                });
            } else {
                console.warn('Fullscreen API not supported');
            }
        } else if (value === 'no') {
            if (!isCurrentlyFullscreen) return;
            const exitFS = this._getExitFS();
            if (exitFS) {
                exitFS.call(document).catch(err => {
                    console.warn('Failed to exit fullscreen:', err);
                });
            }
        }
    }

    handleFullscreenChange = () => {
        const newValue = this.isFullscreen() ? 'yes' : 'no';
        if (newValue === this.currentFullscreen) return;
        this.currentFullscreen = newValue;
        // Persist via notifications (which uses dataSync)
        if (window.DHEIndexNotifications) {
            window.DHEIndexNotifications.instance.updateSetting('fullscreen', newValue);
        } else {
            // Fallback – save directly via dataSync
            window.DHEDataSync.getSettings().then(settings => {
                settings.fullscreen = newValue;
                return window.DHEDataSync.saveSettings(settings);
            }).catch(e => console.warn('Failed to save fullscreen', e));
        }
        document.dispatchEvent(new CustomEvent('fullscreenChanged', {
            detail: { fullscreen: newValue }
        }));
    };

    isFullscreen() {
        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
    }

    _getEnterFS() {
        const docEl = document.documentElement;
        return docEl.requestFullscreen ||
               docEl.webkitRequestFullscreen ||
               docEl.webkitEnterFullscreen ||
               docEl.mozRequestFullScreen ||
               docEl.msRequestFullscreen;
    }

    _getExitFS() {
        return document.exitFullscreen ||
               document.webkitExitFullscreen ||
               document.mozCancelFullScreen ||
               document.msExitFullscreen;
    }

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

window.DHEScreen = new DHEScreen();