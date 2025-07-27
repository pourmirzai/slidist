// Utility functions
import { CONFIG } from './config.js';

/**
 * Convert English numbers to Persian numbers
 */
export const toPersianNum = (num) => {
    return num.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
};

/**
 * Debounce function to limit function calls
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Validate image file type
 */
export const isValidImageType = (file) => {
    return CONFIG.SUPPORTED_IMAGE_TYPES.includes(file.type);
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get text width for canvas measurement
 */
export const getTextWidth = (ctx, text, font) => {
    ctx.font = font;
    return ctx.measureText(text).width;
};

/**
 * Create a promise that resolves after specified milliseconds
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sanitize text input to prevent XSS
 */
export const sanitizeText = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Generate unique ID
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if device is mobile
 */
export const isMobile = () => {
    return window.innerWidth <= 768;
};

/**
 * Show toast notification
 */
export const showToast = (message, type = 'info', duration = 3000) => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add toast styles if not already present
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-family: ${CONFIG.FONT_FAMILY}, sans-serif;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            }
            .toast-info { background: #007bff; }
            .toast-success { background: #28a745; }
            .toast-warning { background: #ffc107; color: #000; }
            .toast-error { background: #dc3545; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
};