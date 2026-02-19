// export.js - Export Management System (PDF, CSV/Sheet, TXT)
class DHEExport {
    constructor() {
        this.prefix = window.DHEPagePrefix || 'index';
    }

    // Public API – called from options.js (now async)
    async exportData(format) {
        switch (format) {
            case 'pdf':  await this.exportToPDF();  break;
            case 'sheet': await this.exportToSheet(); break;
            case 'txt':  await this.exportToTXT();  break;
            default: console.warn(`DHEExport: Unknown format "${format}"`);
        }
    }

    async exportToPDF() {
        const text = await this._extractText();
        this._printDocument(text);
        this._showNotification('exportPDF', 'Opening PDF export...', 'info');
    }

    async exportToTXT() {
        const text = await this._extractText();
        this._download(text, `${this.prefix}-settings.json`, 'application/json');
        this._showNotification('exportTXT', 'Text export completed.', 'success');
    }

    async exportToSheet() {
        const data = await this._extractSheetData();
        const csv = this._arrayToCSV(data);
        this._download(csv, `${this.prefix}-settings.csv`, 'text/csv');
        this._showNotification('exportSheet', 'CSV export completed.', 'success');
    }

    async _extractText() {
        // Allow page‑specific override
        if (typeof window.DHEPageExportTextExtractor === 'function') {
            try {
                return await window.DHEPageExportTextExtractor();
            } catch (e) {
                console.warn('DHEExport: Custom text extractor failed, using default', e);
                this._showNotification('exportError', 'Custom export failed, using default data.', 'warning');
            }
        }

        // Default extractor: include settings and, if signed in, user info
        const settings = await this._getSettings();
        const result = { settings };

        // Include user information if signed in
        try {
            if (window.DHESupabase && typeof window.DHESupabase.getCurrentUser === 'function') {
                const { data } = await window.DHESupabase.getCurrentUser();
                const user = data?.user;
                if (user) {
                    result.user = {
                        id: user.id,
                        email: user.email,
                        synced: true,
                        note: 'This data is synchronised with the cloud.'
                    };
                }
            }
        } catch (e) {
            console.warn('DHEExport: Failed to retrieve user info for export', e);
            // Continue without user info
        }

        return JSON.stringify(result, null, 2);
    }

    async _extractSheetData() {
        // Allow page‑specific override
        if (typeof window.DHEPageExportSheetExtractor === 'function') {
            try {
                return await window.DHEPageExportSheetExtractor();
            } catch (e) {
                console.warn('DHEExport: Custom sheet extractor failed, using default', e);
                this._showNotification('exportError', 'Custom export failed, using default data.', 'warning');
            }
        }

        // Default sheet extractor
        const settings = await this._getSettings();
        const data = [];

        // Add user info rows if signed in
        try {
            if (window.DHESupabase && typeof window.DHESupabase.getCurrentUser === 'function') {
                const { data: userData } = await window.DHESupabase.getCurrentUser();
                const user = userData?.user;
                if (user) {
                    data.push(['User ID', user.id]);
                    data.push(['Email', user.email]);
                    data.push(['Sync Status', 'Synced with cloud']);
                    data.push([]); // blank separator
                }
            }
        } catch (e) {
            console.warn('DHEExport: Failed to retrieve user info for sheet export', e);
            // Continue without user info
        }

        // Header row
        data.push(['Setting', 'Value']);

        // Flatten settings
        Object.entries(settings).forEach(([key, value]) => {
            const val = (typeof value === 'object' && value !== null)
                ? JSON.stringify(value)
                : String(value);
            data.push([key, val]);
        });

        return data;
    }

    async _getSettings() {
        try {
            return await window.DHEDataSync.getSettings();
        } catch (e) {
            console.warn('DHEExport: Failed to read settings via dataSync', e);
            this._showNotification('localStorageError', 'Could not access saved settings. Using defaults.', 'warning');
            return {};
        }
    }

    _printDocument(content) {
        const originalBody = document.body.innerHTML;
        const originalTitle = document.title;
        const printContainer = document.createElement('div');
        printContainer.innerHTML = `
            <style>
                body { font-family: monospace; white-space: pre-wrap; padding: 2rem; }
                pre { margin: 0; }
            </style>
            <pre>${this._escapeHTML(content)}</pre>
        `;
        document.body.innerHTML = printContainer.innerHTML;
        document.title = `${this.prefix} Settings Export`;
        window.print();
        document.body.innerHTML = originalBody;
        document.title = originalTitle;
    }

    _escapeHTML(str) {
        return str.replace(/[&<>"]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return m;
        });
    }

    _arrayToCSV(data) {
        return data.map(row =>
            row.map(cell => {
                if (typeof cell === 'string' && /[,"\n]/.test(cell)) {
                    return `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
            }).join(',')
        ).join('\n');
    }

    _download(content, fileName, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    _showNotification(translationKey, fallback, type) {
        if (window.DHEIndexNotifications) {
            window.DHEIndexNotifications.instance.show(
                `export-${translationKey}`,
                `notifications.${translationKey}`,
                fallback,
                type
            );
        }
    }
}

window.DHEExport = new DHEExport();