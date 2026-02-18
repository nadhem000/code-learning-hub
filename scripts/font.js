// font.js – Font Size Management (scalable, persistent)
// Now sets both page‑specific and global (index) CSS custom properties
class DHEFont {
    constructor() {
        this.prefix = window.DHEPagePrefix || 'index';   // for page‑specific variable
        this.globalPrefix = 'index';                      // for global variable (header/footer)
        this.storageKey = 'DHEIndexSettings';
        this.defaultMultiplier = 1.0;
        this.multiplier = this.defaultMultiplier;
        this.min = 0.6;
        this.max = 1.8;
        this.init();
    }

    init() {
        this.loadSetting();
        this.apply();
    }

    loadSetting() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                const settings = JSON.parse(saved);
                if (typeof settings.fontSizeMultiplier === 'number') {
                    this.multiplier = Math.min(this.max, Math.max(this.min, settings.fontSizeMultiplier));
                }
            }
        } catch (e) {
            console.warn('DHEFont: Failed to parse settings, using default multiplier', e);
            this._notify('localStorageError', 'Could not load font size. Using default.');
        }
    }

    saveSetting() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            let settings = saved ? JSON.parse(saved) : {};
            settings.fontSizeMultiplier = this.multiplier;
            // Add metadata timestamp
            settings._meta = settings._meta || {};
            settings._meta.lastSaved = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(settings));
        } catch (e) {
            console.warn('DHEFont: Failed to save settings to localStorage', e);
            this._notify('localStorageError', 'Could not save font size. Changes will not persist after this session.');
        }
    }

    apply() {
        // Set both page‑specific and global font scale variables
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

// Instantiate globally
window.DHEFont = new DHEFont();