// Configuration and constants
export const CONFIG = {
    SLIDE_SIZE: 1080,
    DEFAULT_FONT_SIZE: 30,
    DEFAULT_PADDING: 90,
    DEFAULT_LINE_HEIGHT: 2,
    MAX_PREVIEW_SLIDES: 5,
    SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    FONT_FAMILY: 'Vazirmatn',
    STORAGE_KEY: 'slideGenSettings'
};

export const COLOR_THEMES = {
    minimal_clean: { 
        name: 'مینیمال روشن', 
        bg1: '#f5f5f5', 
        bg2: '#e0e0e0', 
        text: '#212121', 
        primary: '#007bff',
        accent: '#28a745'
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