// Local storage management
import { CONFIG } from './config.js';
import { showToast } from './utils.js';

export class StorageManager {
    constructor() {
        this.storageKey = CONFIG.STORAGE_KEY;
    }

    /**
     * Save settings to localStorage with error handling
     */
    saveSettings(settings) {
        try {
            const settingsToSave = {
                ...settings,
                timestamp: Date.now(),
                version: '2.0'
            };
            localStorage.setItem(this.storageKey, JSON.stringify(settingsToSave));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            showToast('خطا در ذخیره تنظیمات', 'error');
            return false;
        }
    }

    /**
     * Load settings from localStorage with validation
     */
    loadSettings() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (!saved) return null;

            const settings = JSON.parse(saved);
            
            // Validate settings structure
            if (!this.validateSettings(settings)) {
                console.warn('Invalid settings structure, using defaults');
                return null;
            }

            return settings;
        } catch (error) {
            console.error('Failed to load settings:', error);
            showToast('خطا در بارگیری تنظیمات', 'warning');
            return null;
        }
    }

    /**
     * Validate settings object structure
     */
    validateSettings(settings) {
        const requiredFields = ['fontSize', 'padding', 'lineHeightMultiplier'];
        return requiredFields.every(field => settings.hasOwnProperty(field));
    }

    /**
     * Clear all saved settings
     */
    clearSettings() {
        try {
            localStorage.removeItem(this.storageKey);
            showToast('تنظیمات پاک شد', 'success');
            return true;
        } catch (error) {
            console.error('Failed to clear settings:', error);
            showToast('خطا در پاک کردن تنظیمات', 'error');
            return false;
        }
    }


    /**
     * Import settings from JSON file
     */
    async importSettings(file) {
        try {
            const text = await file.text();
            const settings = JSON.parse(text);
            
            if (!this.validateSettings(settings)) {
                throw new Error('Invalid settings format');
            }
            
            this.saveSettings(settings);
            showToast('تنظیمات وارد شد', 'success');
            return settings;
        } catch (error) {
            console.error('Failed to import settings:', error);
            showToast('خطا در وارد کردن تنظیمات', 'error');
            return null;
        }
    }

    /**
     * Get storage usage information
     */
    getStorageInfo() {
        try {
            const used = new Blob([localStorage.getItem(this.storageKey) || '']).size;
            const total = 5 * 1024 * 1024; // 5MB typical localStorage limit
            
            return {
                used,
                total,
                percentage: (used / total) * 100
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return null;
        }
    }
}