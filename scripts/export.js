// export.js - Export Management System (PDF, CSV/Sheet, TXT)
// Now exports localStorage data (DHEIndexSettings) instead of screen content.
class DHEExport {
    constructor() {
        this.prefix = window.DHEPagePrefix || 'index';
    }

    // Public API – called from options.js
    exportData(format) {
        switch (format) {
            case 'pdf':  this.exportToPDF();  break;
            case 'sheet': this.exportToSheet(); break;
            case 'txt':  this.exportToTXT();  break;
            default: console.warn(`DHEExport: Unknown format "${format}"`);
        }
    }

    // ---------- PDF (print settings as a clean document) ----------
    exportToPDF() {
        const text = this._extractText();
        this._printDocument(text);
        this._showNotification('exportPDF', 'Opening PDF export...', 'info');
    }

    // ---------- TXT (JSON) ----------
    exportToTXT() {
        const text = this._extractText();
        this._download(text, `${this.prefix}-settings.json`, 'application/json');
        this._showNotification('exportTXT', 'Text export completed.', 'success');
    }

    // ---------- Sheet (CSV) ----------
    exportToSheet() {
        const data = this._extractSheetData();
        const csv = this._arrayToCSV(data);
        this._download(csv, `${this.prefix}-settings.csv`, 'text/csv');
        this._showNotification('exportSheet', 'CSV export completed.', 'success');
    }

    // -------------------------------------------------------------
    // Content extraction – now reads from localStorage by default
    // Override via window.DHEPageExportTextExtractor / SheetExtractor
    // -------------------------------------------------------------
    _extractText() {
        // Allow custom override (kept for backward compatibility)
        if (typeof window.DHEPageExportTextExtractor === 'function') {
            try {
                return window.DHEPageExportTextExtractor();
            } catch (e) {
                console.warn('DHEExport: Custom text extractor failed, using default', e);
                this._showNotification('exportError', 'Custom export failed, using default data.', 'warning');
            }
        }
        // Default: return pretty‑printed settings JSON
        const settings = this._getSettings();
        return JSON.stringify(settings, null, 2);
    }

    _extractSheetData() {
        // Allow custom override
        if (typeof window.DHEPageExportSheetExtractor === 'function') {
            try {
                return window.DHEPageExportSheetExtractor();
            } catch (e) {
                console.warn('DHEExport: Custom sheet extractor failed, using default', e);
                this._showNotification('exportError', 'Custom export failed, using default data.', 'warning');
            }
        }
        // Default: convert settings object to key‑value CSV
        const settings = this._getSettings();
        const data = [['Setting', 'Value']];
        Object.entries(settings).forEach(([key, value]) => {
            // If value is an object/array, stringify it
            const val = (typeof value === 'object' && value !== null)
                ? JSON.stringify(value)
                : String(value);
            data.push([key, val]);
        });
        return data;
    }

    // -------------------------------------------------------------
    // Helper: retrieve and parse DHEIndexSettings from localStorage
    // -------------------------------------------------------------
    _getSettings() {
        try {
            const saved = localStorage.getItem('DHEIndexSettings');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('DHEExport: Failed to read settings from localStorage', e);
            this._showNotification('localStorageError', 'Could not access saved settings. Using defaults.', 'warning');
        }
        return {};
    }

    // -------------------------------------------------------------
    // Print a document with the given text (PDF via print dialog)
    // -------------------------------------------------------------
    _printDocument(content) {
        // Save original body
        const originalBody = document.body.innerHTML;
        const originalTitle = document.title;

        // Build a simple printable document
        const printContainer = document.createElement('div');
        printContainer.innerHTML = `
            <style>
                body { font-family: monospace; white-space: pre-wrap; padding: 2rem; }
                pre { margin: 0; }
            </style>
            <pre>${this._escapeHTML(content)}</pre>
        `;

        // Replace body, print, restore
        document.body.innerHTML = printContainer.innerHTML;
        document.title = `${this.prefix} Settings Export`;
        window.print();
        document.body.innerHTML = originalBody;
        document.title = originalTitle;
    }

    // -------------------------------------------------------------
    // Utility: escape HTML for safe printing
    // -------------------------------------------------------------
    _escapeHTML(str) {
        return str.replace(/[&<>"]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            if (m === '"') return '&quot;';
            return m;
        });
    }

    // ---------- unchanged helpers ----------
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

// Instantiate globally
window.DHEExport = new DHEExport();