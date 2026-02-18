// modes.js - Mode Management System (Light/Dark/High Contrast)
class DHEModes {
    constructor() {
        this.prefix = window.DHEPagePrefix || 'index';
        this.globalPrefix = 'index';
        this.modeClasses = {
            dark: `DHE-${this.prefix}-mode-dark`,
            highcontrast: `DHE-${this.prefix}-mode-highcontrast`
        };
        this.globalModeClasses = {
            dark: `DHE-${this.globalPrefix}-mode-dark`,
            highcontrast: `DHE-${this.globalPrefix}-mode-highcontrast`
        };
        this.currentMode = 'light'; // default
        // Apply default immediately (light)
        this.applyMode(this.currentMode);
        // Then load saved mode asynchronously
        this.loadModeAsync().catch(err => console.warn('Modes: async load failed', err));
    }

    async loadModeAsync() {
        try {
            const settings = await window.DHEDataSync.getSettings();
            if (settings.mode) {
                this.setMode(settings.mode); // will re-apply if different
            }
        } catch (e) {
            console.warn('DHEModes: Failed to load mode via dataSync, using light', e);
            this._notify('localStorageError', 'Could not load theme mode. Using light.');
        }
    }

    applyMode(mode) {
        // Remove all possible mode classes
        const allClasses = [
            ...Object.values(this.modeClasses),
            ...Object.values(this.globalModeClasses)
        ];
        allClasses.forEach(cls => {
            document.body.classList.remove(cls);
        });
        if (mode === 'dark' || mode === 'highcontrast') {
            document.body.classList.add(this.modeClasses[mode]);
            document.body.classList.add(this.globalModeClasses[mode]);
        }
    }

    setMode(mode) {
        if (mode === this.currentMode) return;
        this.currentMode = mode;
        this.applyMode(mode);
        // Persist via notifications (which uses dataSync)
        if (window.DHEIndexNotifications) {
            window.DHEIndexNotifications.instance.updateSetting('mode', mode);
        } else {
            this._saveModeDirectly(mode); // fallback (should not happen)
        }
        document.dispatchEvent(new CustomEvent('modeChanged', { detail: { mode } }));
    }

    _saveModeDirectly(mode) {
        // Fallback if notifications not available – uses dataSync directly
        window.DHEDataSync.getSettings().then(settings => {
            settings.mode = mode;
            return window.DHEDataSync.saveSettings(settings);
        }).catch(e => {
            console.warn('DHEModes: Failed to save mode directly', e);
            this._notify('localStorageError', 'Could not save theme mode.');
        });
    }

    getMode() {
        return this.currentMode;
    }

    _notify(key, fallback) {
        if (window.DHEIndexNotifications) {
            window.DHEIndexNotifications.instance.show(
                `modes-${key}`,
                `notifications.${key}`,
                fallback,
                'warning'
            );
        }
    }
}

window.DHEModes = new DHEModes();