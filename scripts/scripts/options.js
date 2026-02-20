// options.js - Options/Toggle Button Handler
class DHEIndexOptions {
    constructor() {
        this.init();
    }

    init() {
        // --- Hamburger menu ---
        const hamburgBtn = document.getElementById('hamburgBtn');
        const dropdownMenu = document.getElementById('dropdownMenu');
        if (hamburgBtn && dropdownMenu) {
            hamburgBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            document.addEventListener('click', (e) => {
                if (!hamburgBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
            dropdownMenu.addEventListener('click', (e) => e.stopPropagation());
        }
        this.initToggleButtons();
        this.initDoButtons();
        this.initComingSoonLinks();
        this.loadSettings();
        document.addEventListener('modeChanged', (e) => {
            this.setActiveButtonForSetting('mode', e.detail.mode);
        });
    }

    // ------------------------------------------------------------
    // Coming soon links – show notification and prevent navigation
    // ------------------------------------------------------------
    initComingSoonLinks() {
        if (!this._comingSoonRetry) this._comingSoonRetry = 0;
        if (this._comingSoonRetry++ > 10) {
            console.error('❌ Coming-soon: notifications system failed to load');
            return;
        }
        if (!window.DHEIndexNotifications || !DHEIndexNotifications.instance) {
            setTimeout(() => this.initComingSoonLinks(), 100);
            return;
        }
        this._comingSoonRetry = 0;
        if (this._boundComingSoonHandler) {
            document.removeEventListener('click', this._boundComingSoonHandler);
        }
        this._boundComingSoonHandler = (e) => {
            const link = e.target.closest('[data-flag="coming-soon"]');
            if (!link) return;
            e.preventDefault();
            try {
                DHEIndexNotifications.instance.show(
                    'coming-soon-generic',
                    'notifications.comingSoonGeneric',
                    'Coming soon! This feature is under development.',
                    'important'
                );
            } catch (err) {
                console.error('Failed to show coming-soon notification:', err);
            }
        };
        document.addEventListener('click', this._boundComingSoonHandler);
    }

    // ------------------------------------------------------------
    // Toggle buttons: change visual selection ONLY
    // ------------------------------------------------------------
    initToggleButtons() {
        const toggleButtons = document.querySelectorAll('.DHE-index-toggle-btn');
        toggleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (button.classList.contains('active')) return;
                DHEIndexNotifications.instance.setActiveButton(button);
            });
        });
    }

    // ------------------------------------------------------------
    // Do buttons: read the active button and ACT on the setting
    // ------------------------------------------------------------
    initDoButtons() {
        const doButtons = document.querySelectorAll('.DHE-index-do-btn');
        doButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const setting = button.dataset.setting;
                const activeValue = this.getActiveValue(setting);
                const value = activeValue || this.getDefaultSetting(setting);
                this.applySetting(setting, value);
            });
        });
    }

    // ------------------------------------------------------------
    // Get the currently selected (active) value for a setting
    // ------------------------------------------------------------
    getActiveValue(setting) {
        const activeBtn = document.querySelector(`[data-setting="${setting}"].active`);
        return activeBtn ? activeBtn.dataset.value : null;
    }

    // ------------------------------------------------------------
    // Apply the setting – now with Done notification + close dropdown
    // ------------------------------------------------------------
    applySetting(setting, value) {
        switch (setting) {
            case 'language':
                window.DHEIndexTranslator.setLanguage(value);
                DHEIndexNotifications.instance.updateSetting('language', value);
                this.setActiveButtonForSetting(setting, value);
                this.showDoneNotification(setting, value);
                this.closeDropdown();
                break;
            case 'mode':
                if (window.DHEModes) {
                    window.DHEModes.setMode(value);
                }
                DHEIndexNotifications.instance.updateSetting('mode', value);
                this.setActiveButtonForSetting(setting, value);
                this.showDoneNotification(setting, value);
                this.closeDropdown();
                break;
            case 'fullscreen':
                if (window.DHEScreen) {
                    window.DHEScreen.setFullscreen(value);
                }
                DHEIndexNotifications.instance.updateSetting('fullscreen', value);
                this.setActiveButtonForSetting(setting, value);
                this.showDoneNotification(setting, value);
                this.closeDropdown();
                break;
            case 'notifications':
                DHEIndexNotifications.instance.updateSetting('notifications', value);
                this.setActiveButtonForSetting(setting, value);
                this.showDoneNotification(setting, value);
                this.closeDropdown();
                break;
            case 'fontsize':
                if (window.DHEFont) {
                    window.DHEFont.setFontSize(value);
                }
                DHEIndexNotifications.instance.updateSetting('fontsize', value);
                this.setActiveButtonForSetting(setting, value);
                this.showDoneNotification(setting, value);
                this.closeDropdown();
                break;
            case 'export':
                if (window.DHEExport) {
                    // exportData is now async, but we don't need to await
                    window.DHEExport.exportData(value).catch(err =>
                        console.warn('Export failed', err)
                    );
                }
                DHEIndexNotifications.instance.updateSetting('export', value);
                this.setActiveButtonForSetting(setting, value);
                this.showDoneNotification(setting, value);
                this.closeDropdown();
                break;
            default:
                DHEIndexNotifications.instance.showComingSoon(setting, value);
                break;
        }
    }

    // ------------------------------------------------------------
    // Show a localized "Done" notification
    // ------------------------------------------------------------
    showDoneNotification(setting, value) {
        if (!window.DHEIndexNotifications || !DHEIndexNotifications.instance) return;
        const names = this.getLocalizedNames(setting, value);
        DHEIndexNotifications.instance.show(
            `done-${setting}-${Date.now()}`,
            'notifications.done',
            `Done! ${names.settingName} set to ${names.valueName}.`,
            'success',
            [names.settingName, names.valueName]
        );
    }

    // ------------------------------------------------------------
    // Close the hamburger dropdown
    // ------------------------------------------------------------
    closeDropdown() {
        const dropdown = document.getElementById('dropdownMenu');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }

    // ------------------------------------------------------------
    // Get localized names for setting and value
    // ------------------------------------------------------------
    getLocalizedNames(setting, value) {
        const settingKey = `dropdown.${setting}`;
        const valueKey = `dropdown.${value}`;
        let settingName = setting;
        let valueName = value;
        if (window.DHEIndexTranslator) {
            const settingTrans = window.DHEIndexTranslator.getTranslation(settingKey);
            const valueTrans = window.DHEIndexTranslator.getTranslation(valueKey);
            if (settingTrans) settingName = settingTrans;
            if (valueTrans) valueName = valueTrans;
        }
        return { settingName, valueName };
    }

    // ------------------------------------------------------------
    // Helper: set the active button for a given setting/value
    // ------------------------------------------------------------
    setActiveButtonForSetting(setting, value) {
        const button = document.querySelector(`[data-setting="${setting}"][data-value="${value}"]`);
        if (button) {
            DHEIndexNotifications.instance.setActiveButton(button);
        }
    }

    // ------------------------------------------------------------
    // Default values (used when no button is active)
    // ------------------------------------------------------------
    getDefaultSetting(setting) {
        const defaults = {
            language: 'en',
            mode: 'light',
            fontsize: 'reset',
            fullscreen: 'no',
            notifications: 'yes',
            export: 'txt'
        };
        return defaults[setting] || '';
    }

    // ------------------------------------------------------------
    // Load settings from dataSync via notifications (async)
    // ------------------------------------------------------------
    loadSettings() {
        // Settings are already loaded asynchronously by notifications.
        // We just need to set active buttons based on current settings.
        // Use a small delay to allow async load to complete, or listen for changes.
        // For simplicity, we'll set them after a short timeout.
        setTimeout(() => {
            const settings = DHEIndexNotifications.instance.currentSettings;
            if (settings.language) {
                this.setActiveButtonForSetting('language', settings.language);
            }
            if (settings.mode) {
                this.setActiveButtonForSetting('mode', settings.mode);
            }
            if (settings.fullscreen) {
                this.setActiveButtonForSetting('fullscreen', settings.fullscreen);
            }
            if (settings.notifications) {
                this.setActiveButtonForSetting('notifications', settings.notifications);
            }
            if (settings.export) {
                this.setActiveButtonForSetting('export', settings.export);
            }
        }, 100); // enough for async load
    }
}

let DHEIndexOptionsInstance;
document.addEventListener('DOMContentLoaded', () => {
    DHEIndexOptionsInstance = new DHEIndexOptions();
    window.DHEIndexOptions = DHEIndexOptionsInstance;
});