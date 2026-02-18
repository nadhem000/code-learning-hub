// notifications.js - Notification System
class DHEIndexNotifications {
    constructor() {
        this.container = document.getElementById('notificationContainer');
        this.defaultSettings = {
            language: 'en',
            mode: 'light',
            fullscreen: 'no',
            fontsize: 'reset',
            export: 'txt',
            notifications: 'yes'
        };
        this.currentSettings = { ...this.defaultSettings };
        // In‑memory fallback for when localStorage fails
        this.memorySettings = null;
        this.init();
    }

    init() {
        // Load saved settings into memory (no DOM changes)
        this.loadSettings();
        // Show initial notification if enabled
        if (this.currentSettings.notifications === 'yes') {
            setTimeout(() => {
                this.show('welcome', 'notifications.welcome', 'Welcome to Code Learning Platform!', 'info');
            }, 1000);
        }
        // Listen for language changes
        document.addEventListener('languageChanged', () => {
            this.retranslateNotifications();
        });
        // Listen for app install
        window.addEventListener('appinstalled', () => {
            this.updateInstallStatus(true);
        });
    }

    // Simple placeholder replacement: replaces {0}, {1}, … with given values
    _formatString(str, params = []) {
        return str.replace(/{(\d+)}/g, (match, index) => {
            return params[index] !== undefined ? params[index] : match;
        });
    }

    retranslateNotifications() {
        const notifications = this.container.querySelectorAll('.DHE-index-notification');
        notifications.forEach(notification => {
            const messageDiv = notification.querySelector('.DHE-index-notification-message');
            const key = messageDiv.getAttribute('data-i18n');
            const paramsAttr = messageDiv.getAttribute('data-i18n-params');
            const fallback = messageDiv.getAttribute('data-fallback');
            if (key && window.DHEIndexTranslator) {
                const translation = window.DHEIndexTranslator.getTranslation(key);
                if (translation !== undefined) {
                    // Parse stored parameters (default to empty array)
                    let params = [];
                    if (paramsAttr) {
                        try { params = JSON.parse(paramsAttr); } catch(e) {}
                    }
                    // Format the translation with the parameters
                    messageDiv.textContent = this._formatString(translation, params);
                }
            }
        });
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('DHEIndexSettings');
            if (saved) {
                this.currentSettings = { ...this.defaultSettings, ...JSON.parse(saved) };
                this.memorySettings = null; // no fallback needed
            } else {
                this.currentSettings = { ...this.defaultSettings };
            }
        } catch (e) {
            console.warn('DHEIndexNotifications: Failed to load settings, using defaults and in‑memory fallback', e);
            this.currentSettings = { ...this.defaultSettings };
            this.memorySettings = { ...this.currentSettings }; // for potential saves
            this.show('localStorageError', 'notifications.localStorageError', 'Could not access saved settings. Changes will not persist.', 'warning');
        }
    }

    saveSettings() {
        // Always add metadata timestamp
        const settingsToSave = { ...this.currentSettings };
        settingsToSave._meta = settingsToSave._meta || {};
        settingsToSave._meta.lastSaved = new Date().toISOString();

        try {
            localStorage.setItem('DHEIndexSettings', JSON.stringify(settingsToSave));
            this.memorySettings = null; // clear fallback
        } catch (e) {
            console.warn('DHEIndexNotifications: Failed to save settings, keeping in memory only', e);
            this.memorySettings = { ...settingsToSave }; // store in memory
            this.show('localStorageError', 'notifications.localStorageError', 'Could not save settings. Changes will not persist after this session.', 'warning');
        }
    }

    // --- Update only the in‑memory setting and persist it ---
    updateSetting(setting, value) {
        this.currentSettings[setting] = value;
        this.saveSettings();
    }

    // --- UI ONLY: set the active class on a button ---
    setActiveButton(activeBtn) {
        const setting = activeBtn.dataset.setting;
        const buttons = document.querySelectorAll(`[data-setting="${setting}"]`);
        buttons.forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    // --- Revert the visual selection to the default value (UI only) ---
    resetToDefault(setting) {
        const defaultBtn = document.querySelector(
            `[data-setting="${setting}"][data-value="${this.defaultSettings[setting]}"]`
        );
        if (defaultBtn) {
            this.setActiveButton(defaultBtn);
        }
    }

    // --- Show a notification (type can be info, warning, error, important, success) ---
    show(id, translationKey, fallbackMessage, type = 'info', params = []) {
        if (this.currentSettings.notifications === 'no') return;
        if (this.currentSettings.notifications === 'important' && type !== 'important') return;
        const existing = document.getElementById(`notification-${id}`);
        if (existing) existing.remove();

        // --- Determine the message with placeholders replaced ---
        let message = fallbackMessage;
        if (window.DHEIndexTranslator && translationKey) {
            const translated = window.DHEIndexTranslator.getTranslation(translationKey);
            if (translated !== undefined) {
                message = this._formatString(translated, params);
            }
        } else {
            // Fallback may also contain placeholders; format it too.
            message = this._formatString(fallbackMessage, params);
        }

        // --- Create notification ---
        const notification = document.createElement('div');
        notification.id = `notification-${id}`;
        notification.className = 'DHE-index-notification';
        // Set border color based on type (unchanged) ...
        notification.innerHTML = `
        <div class="DHE-index-notification-message" 
        data-i18n="${translationKey}"
        data-i18n-params='${JSON.stringify(params)}'
        data-fallback="${fallbackMessage.replace(/"/g, '&quot;')}">${message}</div>
        <button class="DHE-index-notification-close" onclick="DHEIndexNotifications.instance.remove('${id}')">×</button>
        `;
        this.container.appendChild(notification);

        if (type !== 'important') {
            setTimeout(() => this.remove(id), 5000);
        }
    }

    showComingSoon(setting, value) {
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
        this.show(
            `coming-soon-${Date.now()}`,
            'notifications.comingSoon',
            `Setting "${settingName}" to "${valueName}" - Coming soon! Feature is under development.`,
            'warning',
            [settingName, valueName]
        );
    }

    showDoAction(setting, value) {
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
        this.show(
            `do-${setting}-${Date.now()}`,
            'notifications.doAction',
            `Activating "${settingName}" with value "${valueName}" - Coming soon! Feature is under development.`,
            'info',
            [settingName, valueName]
        );
    }

    // --- Update install status in metadata ---
    updateInstallStatus(installed) {
        this.currentSettings._meta = this.currentSettings._meta || {};
        this.currentSettings._meta.installed = installed;
        this.saveSettings();
    }

    remove(id) {
        const notification = document.getElementById(`notification-${id}`);
        if (notification) {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) notification.parentNode.removeChild(notification);
            }, 300);
        }
    }
}

// Initialize notifications
DHEIndexNotifications.instance = new DHEIndexNotifications();
window.DHEIndexNotifications = DHEIndexNotifications;