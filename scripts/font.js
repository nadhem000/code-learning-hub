// modes.js - Mode Management System (Light/Dark/High Contrast)
// Now applies both page‑specific and global (index) mode classes
class DHEModes {
    constructor() {
        this.prefix = window.DHEPagePrefix || 'index';          // for page‑specific classes
        this.globalPrefix = 'index';                             // for global (header/footer) classes
        this.modeClasses = {
            dark: `DHE-${this.prefix}-mode-dark`,
            highcontrast: `DHE-${this.prefix}-mode-highcontrast`
        };
        this.globalModeClasses = {
            dark: `DHE-${this.globalPrefix}-mode-dark`,
            highcontrast: `DHE-${this.globalPrefix}-mode-highcontrast`
        };
        this.currentMode = 'light';
        this.init();
    }

    init() {
        this.loadMode();
        this.applyMode(this.currentMode);
    }

    loadMode() {
        const saved = localStorage.getItem('DHEIndexSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            if (settings.mode) {
                this.currentMode = settings.mode;
            }
        }
    }

    applyMode(mode) {
        // Remove all possible mode classes (both page and global)
        const allClasses = [
            ...Object.values(this.modeClasses),
            ...Object.values(this.globalModeClasses)
        ];
        allClasses.forEach(cls => {
            document.body.classList.remove(cls);
        });

        if (mode === 'dark' || mode === 'highcontrast') {
            // Add both page‑specific and global classes
            document.body.classList.add(this.modeClasses[mode]);
            document.body.classList.add(this.globalModeClasses[mode]);
        }
        // Light mode: no extra classes (both removed)
    }

    setMode(mode) {
        if (mode === this.currentMode) return;

        this.currentMode = mode;
        this.applyMode(mode);

        // Persist using the existing settings system
        if (window.DHEIndexNotifications) {
            window.DHEIndexNotifications.instance.updateSetting('mode', mode);
        } else {
            const saved = localStorage.getItem('DHEIndexSettings');
            let settings = saved ? JSON.parse(saved) : {};
            settings.mode = mode;
            localStorage.setItem('DHEIndexSettings', JSON.stringify(settings));
        }

        // Notify the rest of the application
        document.dispatchEvent(new CustomEvent('modeChanged', { detail: { mode } }));
    }

    getMode() {
        return this.currentMode;
    }
}

// Instantiate globally
window.DHEModes = new DHEModes();