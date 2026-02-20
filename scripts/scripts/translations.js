// translations.js - Translation System
class DHEIndexTranslator {
    constructor() {
        this.translations = window.DHEtranslations || {};
        this.pagePrefix = window.DHEPagePrefix || 'index';   // fallback
        this.currentLang = 'en';
        this.init();
    }

    init() {
        this.loadLanguage();
        this.translatePage();
        document.addEventListener('languageChanged', () => this.translatePage());
    }

    loadLanguage() {
        try {
            const saved = localStorage.getItem('DHEIndexSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                if (settings.language && this.translations[settings.language]) {
                    this.currentLang = settings.language;
                }
            }
        } catch (e) {
            console.warn('DHEIndexTranslator: Failed to load language from localStorage, using default', e);
            if (window.DHEIndexNotifications) {
                window.DHEIndexNotifications.instance.show(
                    'localStorageError',
                    'notifications.localStorageError',
                    'Could not load language preference. Using default.',
                    'warning'
                );
            }
        }
        this.setDocumentDirection();
        this.setDocumentLang();
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            // Save to settings
            try {
                const saved = localStorage.getItem('DHEIndexSettings');
                let settings = saved ? JSON.parse(saved) : {};
                settings.language = lang;
                settings._meta = settings._meta || {};
                settings._meta.lastSaved = new Date().toISOString();
                localStorage.setItem('DHEIndexSettings', JSON.stringify(settings));
            } catch (e) {
                console.warn('DHEIndexTranslator: Failed to save language', e);
                if (window.DHEIndexNotifications) {
                    window.DHEIndexNotifications.instance.show(
                        'localStorageError',
                        'notifications.localStorageError',
                        'Could not save language preference.',
                        'warning'
                    );
                }
            }
            // Update UI
            this.translatePage();
            this.setDocumentDirection();
            this.setDocumentLang();
            document.dispatchEvent(new Event('languageChanged'));
        }
    }

    setDocumentDirection() {
        document.documentElement.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    }

    setDocumentLang() {
        document.documentElement.lang = this.currentLang;
    }

    translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => this.translateElement(el));
    }

    translateElement(element) {
        const key = element.getAttribute('data-i18n');
        const fallback = element.textContent || element.innerHTML;
        const translation = this.getTranslation(key);
        if (translation !== undefined) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.value = translation;
            } else if (element.hasAttribute('placeholder')) {
                element.setAttribute('placeholder', translation);
            } else if (element.hasAttribute('title')) {
                element.setAttribute('title', translation);
            } else if (element.hasAttribute('alt')) {
                element.setAttribute('alt', translation);
            } else {
                element.textContent = translation;
            }
        } else {
            console.warn(`Translation key not found: ${key}`);
        }
    }

    getTranslation(key) {
        // If key already has the full prefix, use it directly
        if (key.startsWith('DHE.translation.')) {
            const parts = key.split('.');
            const path = parts.slice(2); // remove 'DHE', 'translation'
            let current = this.translations[this.currentLang];
            for (const part of path) {
                if (current && current[part] !== undefined) {
                    current = current[part];
                } else {
                    return undefined;
                }
            }
            return current;
        }

        // Key does not start with DHE.translation. – we need to build the full path
        // If the key already starts with the current page prefix (e.g., "index.installButton" on the homepage),
        // then we only need to prepend "DHE.translation."
        if (key.startsWith(this.pagePrefix + '.')) {
            // Key is already prefixed with the page, so we just add DHE.translation.
            const fullKey = `DHE.translation.${key}`;
            const parts = fullKey.split('.');
            const path = parts.slice(2); // remove 'DHE', 'translation'
            let current = this.translations[this.currentLang];
            for (const part of path) {
                if (current && current[part] !== undefined) {
                    current = current[part];
                } else {
                    return undefined;
                }
            }
            return current;
        } else {
            // Key does not start with page prefix, so we add both page prefix and the key
            const fullKey = `DHE.translation.${this.pagePrefix}.${key}`;
            const parts = fullKey.split('.');
            const path = parts.slice(2); // remove 'DHE', 'translation'
            let current = this.translations[this.currentLang];
            for (const part of path) {
                if (current && current[part] !== undefined) {
                    current = current[part];
                } else {
                    return undefined;
                }
            }
            return current;
        }
    }

    _formatString(str, params = []) {
        return str.replace(/{(\d+)}/g, (match, index) => {
            return params[index] !== undefined ? params[index] : match;
        });
    }

    getTranslatedString(key, fallback = '') {
        const translation = this.getTranslation(key);
        return translation !== undefined ? translation : fallback;
    }
}

// Instantiate the translator globally
window.DHEIndexTranslator = new DHEIndexTranslator();