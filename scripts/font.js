// font.js – Font Size Management
class DHEFont {
    constructor() {
        this.prefix = window.DHEPagePrefix || 'index';
        this.globalPrefix = 'index';
        this.storageKey = 'DHEIndexSettings'; // kept for reference, but not used directly
        this.defaultMultiplier = 1.0;
        this.multiplier = this.defaultMultiplier;
        this.min = 0.6;
        this.max = 1.8;
        this.apply(); // apply default
        this.loadSettingAsync().catch(err => console.warn('Font: async load failed', err));
    }

    async loadSettingAsync() {
        try {
            const settings = await window.DHEDataSync.getSettings();
            if (typeof settings.fontSizeMultiplier === 'number') {
                this.multiplier = Math.min(this.max, Math.max(this.min, settings.fontSizeMultiplier));
                this.apply();
            }
        } catch (e) {
            console.warn('DHEFont: Failed to load settings via dataSync, using default', e);
            this._notify('localStorageError', 'Could not load font size. Using default.');
        }
    }

    saveSetting() {
        // Delegate to dataSync via notifications or directly?
        // Use notifications if available, otherwise direct.
        if (window.DHEIndexNotifications) {
            // notifications.updateSetting will handle saving via dataSync
            // But we need to store multiplier in settings. notifications.updateSetting expects setting name.
            // So we'll use a direct save via dataSync for simplicity.
            this._saveDirectly();
        } else {
            this._saveDirectly();
        }
    }

    async _saveDirectly() {
        try {
            const settings = await window.DHEDataSync.getSettings();
            settings.fontSizeMultiplier = this.multiplier;
            settings._meta = settings._meta || {};
            settings._meta.lastSaved = new Date().toISOString();
            await window.DHEDataSync.saveSettings(settings);
        } catch (e) {
            console.warn('DHEFont: Failed to save settings via dataSync', e);
            this._notify('localStorageError', 'Could not save font size. Changes will not persist after this session.');
        }
    }

    apply() {
        document.documentElement.style.setProperty(
            `--DHE-${this.prefix}-font-scale`,
            this.multiplier
        );
        document.documentElement.style.setProperty(
            `--DHE-${this.globalPrefix}-font-scale`,
            this.multiplier
        );
    }

    increase() {
        this.multiplier = Math.min(this.max, this.multiplier * 1.1);
        this.saveSetting();
        this.apply();
        this._dispatchEvent('increase');
    }

    decrease() {
        this.multiplier = Math.max(this.min, this.multiplier * 0.9);
        this.saveSetting();
        this.apply();
        this._dispatchEvent('decrease');
    }

    reset() {
        this.multiplier = this.defaultMultiplier;
        this.saveSetting();
        this.apply();
        this._dispatchEvent('reset');
    }

    setFontSize(action) {
        switch (action) {
            case 'increase': this.increase(); break;
            case 'decrease': this.decrease(); break;
            case 'reset':    this.reset();    break;
            default: console.warn(`DHEFont: unknown action "${action}"`);
        }
    }

    _dispatchEvent(action) {
        document.dispatchEvent(new CustomEvent('fontSizeChanged', {
            detail: { multiplier: this.multiplier, action }
        }));
    }

    _notify(key, fallback) {
        if (window.DHEIndexNotifications) {
            window.DHEIndexNotifications.instance.show(
                `font-${key}`,
                `notifications.${key}`,
                fallback,
                'warning'
            );
        }
    }
}

window.DHEFont = new DHEFont();