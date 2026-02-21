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
        // Start with defaults; will be updated after async load
        this.currentSettings = { ...this.defaultSettings };
        // In‑memory fallback for when localStorage fails (used by dataSync)
        this.memorySettings = null;
        this.init();
        // Trigger async load of saved settings
        this.loadSettingsAsync().catch(err => console.warn('Notifications: async load failed', err));
    }

    init() {
        // Show initial notification if enabled (defaults to 'yes' until loaded)
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

    async loadSettingsAsync() {
        try {
            const settings = await window.DHEDataSync.getSettings();
            // Merge with defaults (settings may be partial)
            this.currentSettings = { ...this.defaultSettings, ...settings };
        } catch (e) {
            console.warn('DHEIndexNotifications: Failed to load settings via dataSync, using defaults', e);
            this.currentSettings = { ...this.defaultSettings };
        }
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
                    let params = [];
                    if (paramsAttr) {
                        try { params = JSON.parse(paramsAttr); } catch(e) {}
                    }
                    messageDiv.textContent = this._formatString(translation, params);
                }
            }
        });
    }

    // loadSettings() is replaced by async version above – kept for backward compatibility? Not needed.
    // Save settings via dataSync
    async saveSettings() {
        const settingsToSave = { ...this.currentSettings };
        settingsToSave._meta = settingsToSave._meta || {};
        settingsToSave._meta.lastSaved = new Date().toISOString();
        try {
            await window.DHEDataSync.saveSettings(settingsToSave);
        } catch (e) {
            console.warn('DHEIndexNotifications: Failed to save settings via dataSync', e);
            this.show('localStorageError', 'notifications.localStorageError', 'Could not save settings. Changes will not persist after this session.', 'warning');
        }
    }

    // --- Update only the in‑memory setting and persist it ---
    updateSetting(setting, value) {
        this.currentSettings[setting] = value;
        this.saveSettings(); // async, fire and forget
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

    // --- Show a notification ---
    show(id, translationKey, fallbackMessage, type = 'info', params = []) {
        // Use currentSettings (may still be defaults if async not finished)
        if (this.currentSettings.notifications === 'no') return;
        if (this.currentSettings.notifications === 'important' && type !== 'important') return;
        const existing = document.getElementById(`notification-${id}`);
        if (existing) existing.remove();

        let message = fallbackMessage;
        if (window.DHEIndexTranslator && translationKey) {
            const translated = window.DHEIndexTranslator.getTranslation(translationKey);
            if (translated !== undefined) {
                message = this._formatString(translated, params);
            }
        } else {
            message = this._formatString(fallbackMessage, params);
        }

        const notification = document.createElement('div');
        notification.id = `notification-${id}`;
        notification.className = 'DHE-index-notification';
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

    // If the app was just installed, increment the cloud counter
    if (installed && window.DHESupabase) {
        window.DHESupabase.client.rpc('increment_installations')
            .then(({ error }) => {
                if (error) console.warn('Failed to increment installation counter:', error);
            });
    }
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