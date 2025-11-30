// Global configuration and constants
export const CONFIG = {
    // Slide formats
    SLIDE_FORMATS: {
        post: { width: 1080, height: 1080, name: 'پست (۱:۱)' },
        story: { width: 1080, height: 1920, name: 'استوری (۹:۱۶)' }
    },

    // Safe zones for content (padding from edges)
    SAFE_ZONES: {
        post: { top: 0, bottom: 0, side: 0 },
        story: { top: 250, bottom: 350, side: 40 } // Space for Instagram UI elements
    },

    // Default settings
    DEFAULT_FONT_SIZE: 30,
    DEFAULT_PADDING: 90,
    DEFAULT_LINE_HEIGHT: 1.6,
    FONT_FAMILY: 'Vazirmatn, Tahoma, sans-serif',
    MAX_PREVIEW_SLIDES: 10,

    // Image constraints
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp']
};

export const COLOR_THEMES = {
    minimal_clean: {
        name: 'مینیمال تمیز',
        bg1: '#ffffff',
        bg2: '#f8f9fa',
        text: '#212121',
        primary: '#007bff',
        accent: '#6c757d'
    },
    modern_slate: {
        name: 'مدرن خاکستری',
        bg1: '#eceff1',
        bg2: '#cfd8dc',
        text: '#37474f',
        primary: '#007bff',
        accent: '#17a2b8'
    },
    light_pink_blue: {
        name: 'صورتی به آبی',
        bg1: '#FFDEE9',
        bg2: '#B5FFFC',
        text: '#000000',
        primary: '#23a6d5',
        accent: '#e91e63'
    },
    light_yellow_green: {
        name: 'زرد به سبز',
        bg1: '#FEF9C3',
        bg2: '#C1FFD7',
        text: '#000000',
        primary: '#23d5ab',
        accent: '#ffc107'
    },
    dark_grey_matte: {
        name: 'خاکستری مات',
        bg1: '#232526',
        bg2: '#414345',
        text: '#FFFFFF',
        primary: '#007bff',
        accent: '#6c757d'
    },
    dark_indigo_deep: {
        name: 'نیلی عمیق',
        bg1: '#0F2027',
        bg2: '#203A43',
        text: '#FFFFFF',
        primary: '#007bff',
        accent: '#17a2b8'
    },
    custom: {
        name: 'سفارشی',
        bg1: '#ffffff',
        bg2: '#e0e0e0',
        text: '#000000',
        primary: '#007bff',
        accent: '#28a745'
    }
};

export const BULLET_OPTIONS = [
    { value: '✅', label: '✅ تیک سبز' },
    { value: '🔹', label: '🔹 لوزی آبی' },
    { value: '⚫️', label: '⚫️ دایره سیاه' },
    { value: '➡️', label: '➡️ فلش' },
    { value: '🔸', label: '🔸 لوزی نارنجی' },
    { value: '📌', label: '📌 پین' },
    { value: '⭐', label: '⭐ ستاره' },
    { value: 'custom', label: 'سفارشی...' }
];