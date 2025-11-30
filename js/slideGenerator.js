// Main slide generator class with enhanced functionality
import { CONFIG, COLOR_THEMES } from './config.js';
import { StorageManager } from './storage.js';
import { ImageHandler } from './imageHandler.js';
import { TextProcessor } from './textProcessor.js';
import { toPersianNum, showToast, debounce } from './utils.js';

export class SlideGenerator {
    constructor() {
        this.storageManager = new StorageManager();
        this.imageHandler = new ImageHandler();
        this.textProcessor = new TextProcessor();
        this.generatedSlides = [];
        this.currentTheme = 'minimal_clean';

        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupEventListeners();
        this.setupThemeSelector();
        this.imageHandler.setupDragAndDrop();
        this.loadSettings();

        showToast('اسلایدساز آماده است', 'success');
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Form inputs with debounced auto-save
        const inputs = [
            'inputText', 'fontSize', 'padding', 'lineHeight',
            'bgColor1', 'bgColor2', 'textColor', 'titleText',
            'subtitleText', 'footerText', 'bgImageOpacity'
        ];

        const saveHandler = debounce(() => {
            this.exportSettings();
        }, 1000);

        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', saveHandler);
            }
        });

        // Update opacity display
        const opacityInput = document.getElementById('bgImageOpacity');
        if (opacityInput) {
            opacityInput.addEventListener('input', (e) => {
                const val = document.getElementById('opacityValue');
                if (val) val.textContent = e.target.value;
                saveHandler();
            });
        }

        // Format selection
        const formatInputs = document.querySelectorAll('input[name="slideFormat"]');
        formatInputs.forEach(input => {
            input.addEventListener('change', saveHandler);
        });

        // Background image mode
        const bgMode = document.getElementById('bgImageMode');
        if (bgMode) {
            bgMode.addEventListener('change', saveHandler);
        }
    }

    setupThemeSelector() {
        const themeContainer = document.getElementById('themeSelector');
        if (!themeContainer) return;

        themeContainer.innerHTML = '';
        Object.entries(COLOR_THEMES).forEach(([key, theme]) => {
            const btn = document.createElement('div');
            btn.className = `theme-option ${this.currentTheme === key ? 'active' : ''}`;
            btn.style.background = `linear-gradient(135deg, ${theme.bg1}, ${theme.bg2})`;
            btn.title = theme.name;
            btn.onclick = () => this.applyTheme(key);
            themeContainer.appendChild(btn);
        });
    }

    applyTheme(themeName) {
        this.currentTheme = themeName;
        const theme = COLOR_THEMES[themeName];
        if (!theme) return;

        document.getElementById('bgColor1').value = theme.bg1;
        document.getElementById('bgColor2').value = theme.bg2;
        document.getElementById('textColor').value = theme.text;

        this.setupThemeSelector(); // Re-render to update active state
        this.exportSettings();
    }

    setupAutoSave() {
        // Already handled in event listeners
    }

    /**
     * Get current settings from UI
     */
    getSettings() {
        return {
            text: document.getElementById('inputText').value,
            fontSize: parseInt(document.getElementById('fontSize').value) || CONFIG.DEFAULT_FONT_SIZE,
            padding: parseInt(document.getElementById('padding').value) || CONFIG.DEFAULT_PADDING,
            lineHeight: parseFloat(document.getElementById('lineHeight').value) || CONFIG.DEFAULT_LINE_HEIGHT,
            bgColor1: document.getElementById('bgColor1').value,
            bgColor2: document.getElementById('bgColor2').value,
            textColor: document.getElementById('textColor').value,
            titleText: document.getElementById('titleText').value,
            subtitleText: document.getElementById('subtitleText').value,
            footerText: document.getElementById('footerText').value,
            bgOpacity: parseFloat(document.getElementById('bgImageOpacity').value) || 0.3,
            bgImage: this.imageHandler.bgImage,
            authImage: this.imageHandler.authImage,
            bgImageMode: document.getElementById('bgImageMode')?.value || 'cover-center',
            theme: this.currentTheme,
            format: document.querySelector('input[name="slideFormat"]:checked')?.value || 'post',
            bulletChar: document.getElementById('bulletChar')?.value || '•',
            lineHeightMultiplier: parseFloat(document.getElementById('lineHeight')?.value) || 1.6
        };
    }

    /**
     * Load settings into UI
     */
    loadSettings() {
        const settings = this.storageManager.loadSettings();
        if (!settings) return;

        try {
            if (settings.text) document.getElementById('inputText').value = settings.text;
            if (settings.fontSize) document.getElementById('fontSize').value = settings.fontSize;
            if (settings.padding) document.getElementById('padding').value = settings.padding;
            if (settings.lineHeight) document.getElementById('lineHeight').value = settings.lineHeight;
            if (settings.bgColor1) document.getElementById('bgColor1').value = settings.bgColor1;
            if (settings.bgColor2) document.getElementById('bgColor2').value = settings.bgColor2;
            if (settings.textColor) document.getElementById('textColor').value = settings.textColor;
            if (settings.titleText) document.getElementById('titleText').value = settings.titleText;
            if (settings.subtitleText) document.getElementById('subtitleText').value = settings.subtitleText;
            if (settings.footerText) document.getElementById('footerText').value = settings.footerText;
            if (settings.bgOpacity) {
                document.getElementById('bgImageOpacity').value = settings.bgOpacity;
                const opVal = document.getElementById('opacityValue');
                if (opVal) opVal.textContent = settings.bgOpacity;
            }
            if (settings.theme) {
                this.currentTheme = settings.theme;
                this.setupThemeSelector();
            }
            if (settings.format) {
                const formatEl = document.querySelector(`input[name="slideFormat"][value="${settings.format}"]`);
                if (formatEl) formatEl.checked = true;
            }

            const bgModeEl = document.getElementById('bgImageMode');
            if (bgModeEl && settings.bgImageMode) {
                bgModeEl.value = settings.bgImageMode;
            }

            showToast('تنظیمات بارگیری شد', 'success');
        } catch (error) {
            console.error('Error loading settings:', error);
            showToast('خطا در بارگیری تنظیمات', 'error');
        }
    }

    /**
     * Export settings
     */
    exportSettings() {
        const settings = this.getSettings();
        this.storageManager.exportSettings(settings);
    }

    /**
     * Import settings
     */
    async importSettings(file) {
        const settings = await this.storageManager.importSettings(file);
        if (settings) {
            this.loadSettings();
        }
    }

    /**
     * Generate slide preview with enhanced error handling
     */
    async previewSlides() {
        try {
            const settings = this.getSettings();

            // Validation
            if (!settings.text.trim() && !settings.titleText) {
                showToast('لطفاً عنوان یا متنی را وارد کنید', 'warning');
                return;
            }

            // Check image loading status
            if (settings.titleText && settings.bgImage && !settings.bgImage.complete) {
                showToast('در حال بارگذاری تصویر پس‌زمینه، لطفا صبر کنید', 'info');
                return;
            }

            if (settings.titleText && settings.authImage && !settings.authImage.complete) {
                showToast('در حال بارگذاری تصویر نویسنده، لطفا صبر کنید', 'info');
                return;
            }

            // Parse content
            this.generatedSlides = this.textProcessor.parseAndStructureContent(settings);

            // Add title slide if needed
            if (settings.titleText) {
                this.generatedSlides.unshift({ type: 'title' });
            }

            if (this.generatedSlides.length === 0) {
                showToast('محتوایی برای نمایش وجود ندارد', 'warning');
                return;
            }

            await this.renderPreview(settings);

        } catch (error) {
            console.error('Preview generation failed:', error);
            showToast('خطا در ایجاد پیش‌نمایش', 'error');
        }
    }

    /**
     * Render preview with progress indication
     */
    async renderPreview(settings) {
        const previewDiv = document.getElementById('preview');
        if (!previewDiv) return;

        // Show loading state
        previewDiv.innerHTML = `
            <h3>در حال ساخت پیش‌نمایش...</h3>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        `;

        const previewLimit = Math.min(CONFIG.MAX_PREVIEW_SLIDES, this.generatedSlides.length);
        let slidePreviewsHTML = '';

        // Generate previews with progress updates
        for (let i = 0; i < previewLimit; i++) {
            const progress = ((i + 1) / previewLimit) * 100;
            const progressFill = document.querySelector('.progress-fill');
            if (progressFill) {
                progressFill.style.width = `${progress}%`;
            }

            const dataURL = await this.createSlide(this.generatedSlides[i], this.generatedSlides.length, i, settings);
            slidePreviewsHTML += `<img src="${dataURL}" alt="پیش‌نمایش اسلاید ${i + 1}" loading="lazy">`;
        }

        // Show final preview
        previewDiv.innerHTML = `
            <h2>پیش‌نمایش (${toPersianNum(previewLimit)} اسلاید از ${toPersianNum(this.generatedSlides.length)})</h2>
            <p>برای بزرگنمایی روی هر اسلاید کلیک کنید.</p>
            <div class="preview-container">${slidePreviewsHTML}</div>
            <div style="margin-top: 20px;">
                <button onclick="slideGenerator.downloadAllSlides()" class="btn-success">
                    ✅ تأیید و دانلود همه (${toPersianNum(this.generatedSlides.length)}) اسلاید
                </button>
                <button onclick="slideGenerator.clearPreview()" class="btn-secondary" style="margin-right: 10px;">
                    🗑️ پاک کردن پیش‌نمایش
                </button>
            </div>
        `;

        showToast('پیش‌نمایش آماده شد', 'success');
    }

    /**
     * Create individual slide with enhanced rendering
     */
    async createSlide(slideContent, totalSlides, currentSlideIndex, settings) {
        const formatConfig = CONFIG.SLIDE_FORMATS[settings.format] || CONFIG.SLIDE_FORMATS.post;
        const width = formatConfig.width;
        const height = formatConfig.height;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw background
        this.drawBackground(ctx, settings, width, height);

        // Draw background image for title slides
        if (slideContent.type === 'title' && settings.bgImage && settings.bgImage.complete) {
            this.drawBackgroundImage(ctx, settings, width, height);
        }

        // Set text properties
        ctx.fillStyle = settings.textColor;
        ctx.direction = 'rtl';

        // Draw content based on slide type
        if (slideContent.type === 'title') {
            this.drawTitleSlide(ctx, settings, width, height);
        } else {
            this.drawContentSlide(ctx, slideContent, settings, width, height);
        }

        // Draw footer
        this.drawFooter(ctx, currentSlideIndex, totalSlides, settings, width, height);

        return canvas.toDataURL('image/png', 0.95);
    }

    /**
     * Draw background with gradient support
     */
    drawBackground(ctx, settings, width, height) {
        if (settings.bgColor1 !== settings.bgColor2) {
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, settings.bgColor1);
            gradient.addColorStop(1, settings.bgColor2);
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = settings.bgColor1;
        }
        ctx.fillRect(0, 0, width, height);
    }

    /**
     * Draw background image
     */
    drawBackgroundImage(ctx, settings, width, height) {
        if (!settings.bgImage || !settings.bgImage.complete) {
            console.log('Background image not available or not loaded');
            return;
        }

        ctx.globalAlpha = settings.bgOpacity;
        const params = this.imageHandler.getBgImageDrawParams(
            settings.bgImage,
            width,
            height,
            settings.bgImageMode
        );

        console.log('Drawing background image with params:', params);
        ctx.drawImage(
            settings.bgImage,
            params.sx, params.sy, params.sw, params.sh,
            params.dx, params.dy, params.dw, params.dh
        );
        ctx.globalAlpha = 1.0;
    }

    /**
     * Draw title slide with enhanced layout
     */
    drawTitleSlide(ctx, settings, width, height) {
        const theme = COLOR_THEMES[this.currentTheme] || COLOR_THEMES['minimal_clean'];
        const safeZone = CONFIG.SAFE_ZONES[settings.format] || CONFIG.SAFE_ZONES.post;

        let currentY = height / 2;
        if (settings.format === 'story') {
            const safeHeight = height - safeZone.top - safeZone.bottom;
            currentY = safeZone.top + (safeHeight / 2);
        }

        if (settings.subtitleText) {
            currentY -= 50;
        }

        // Draw author image if available
        if (settings.authImage && settings.authImage.complete) {
            currentY = this.drawAuthorImage(ctx, settings.authImage, currentY, width);
        }

        // Draw title - properly centered
        const titleParts = this.textProcessor.parseMarkdown(settings.titleText);
        ctx.save();
        ctx.font = `bold ${settings.fontSize * 1.5}px ${CONFIG.FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = settings.textColor;

        // Calculate total width for proper centering
        let totalTitleWidth = 0;
        for (const part of titleParts) {
            const font = part.formatting && part.formatting.bold ?
                `bold ${settings.fontSize * 1.5}px ${CONFIG.FONT_FAMILY}` :
                `${settings.fontSize * 1.5}px ${CONFIG.FONT_FAMILY}`;
            ctx.font = font;
            totalTitleWidth += ctx.measureText(part.text).width;
        }

        // Draw title parts centered
        let currentX = width / 2 - totalTitleWidth / 2;
        for (const part of titleParts) {
            const font = part.formatting && part.formatting.bold ?
                `bold ${settings.fontSize * 1.5}px ${CONFIG.FONT_FAMILY}` :
                `${settings.fontSize * 1.5}px ${CONFIG.FONT_FAMILY}`;
            ctx.font = font;
            ctx.fillText(part.text, currentX + ctx.measureText(part.text).width / 2, currentY);
            currentX += ctx.measureText(part.text).width;
        }
        ctx.restore();

        // Draw separator line
        if (settings.subtitleText) {
            ctx.strokeStyle = settings.textColor;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(width / 2 - 100, currentY + 35);
            ctx.lineTo(width / 2 + 100, currentY + 35);
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            // Draw subtitle - properly centered
            const subtitleParts = this.textProcessor.parseMarkdown(settings.subtitleText);
            ctx.save();
            ctx.font = `${settings.fontSize * 0.8}px ${CONFIG.FONT_FAMILY}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = settings.textColor;

            // Calculate total width for proper centering
            let totalSubtitleWidth = 0;
            for (const part of subtitleParts) {
                const font = part.formatting && part.formatting.bold ?
                    `bold ${settings.fontSize * 0.8}px ${CONFIG.FONT_FAMILY}` :
                    `${settings.fontSize * 0.8}px ${CONFIG.FONT_FAMILY}`;
                ctx.font = font;
                totalSubtitleWidth += ctx.measureText(part.text).width;
            }

            // Draw subtitle parts centered
            let subtitleX = width / 2 - totalSubtitleWidth / 2;
            for (const part of subtitleParts) {
                const font = part.formatting && part.formatting.bold ?
                    `bold ${settings.fontSize * 0.8}px ${CONFIG.FONT_FAMILY}` :
                    `${settings.fontSize * 0.8}px ${CONFIG.FONT_FAMILY}`;
                ctx.font = font;
                ctx.fillText(part.text, subtitleX + ctx.measureText(part.text).width / 2, currentY + 70);
                subtitleX += ctx.measureText(part.text).width;
            }
            ctx.restore();
        }
    }

    /**
     * Draw author image with circular crop
     */
    drawAuthorImage(ctx, authImage, currentY, width) {
        const imgSize = 300;
        const imgX = width / 2 - imgSize / 2;
        const imgY = currentY - imgSize - 10;

        // Calculate crop for cover effect
        const imgRatio = authImage.width / authImage.height;
        let sx, sy, sWidth, sHeight;

        if (imgRatio > 1) {
            sHeight = authImage.height;
            sWidth = sHeight;
            sx = (authImage.width - sWidth) / 2;
            sy = 0;
        } else {
            sWidth = authImage.width;
            sHeight = sWidth;
            sx = 0;
            sy = (authImage.height - sHeight) / 2;
        }

        // Draw circular clipped image
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(authImage, sx, sy, sWidth, sHeight, imgX, imgY, imgSize, imgSize);
        ctx.restore();

        return currentY + imgSize / 2 + 15;
    }

    /**
     * Draw content slide
     */
    drawContentSlide(ctx, slideContent, settings, width, height) {
        const safeZone = CONFIG.SAFE_ZONES[settings.format] || CONFIG.SAFE_ZONES.post;
        let y = settings.padding + safeZone.top;

        ctx.save();
        ctx.font = `${settings.fontSize}px ${CONFIG.FONT_FAMILY}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.direction = 'rtl';

        const rightMargin = settings.padding + safeZone.side;

        for (const item of slideContent) {
            if (item.type === 'heading') {
                const fontSize = settings.fontSize * (item.level === 1 ? 1.5 : item.level === 2 ? 1.3 : 1.2);
                ctx.font = `bold ${fontSize}px ${CONFIG.FONT_FAMILY}`;
                ctx.fillText(item.text, width - rightMargin, y);
                y += fontSize * settings.lineHeightMultiplier;
                ctx.font = `${settings.fontSize}px ${CONFIG.FONT_FAMILY}`;
            } else if (item.type === 'body' || item.type === 'list') {
                let text = item.text;
                if (item.useBullet && item.isFirstLineOfPara) {
                    text = `${settings.bulletChar} ${text}`;
                }
                ctx.fillText(text, width - rightMargin, y);
                y += settings.fontSize * settings.lineHeightMultiplier;
            } else if (item.type === 'quote') {
                ctx.save();
                ctx.fillStyle = COLOR_THEMES[this.currentTheme]?.accent || '#6c757d';
                ctx.font = `italic ${settings.fontSize}px ${CONFIG.FONT_FAMILY}`;
                ctx.fillText(`"${item.text}"`, width - rightMargin, y);
                ctx.restore();
                y += settings.fontSize * settings.lineHeightMultiplier;
            } else if (item.type === 'spacer') {
                y += settings.fontSize * 0.5;
            }
        }
        ctx.restore();
    }

    /**
     * Draw footer with progress bar
     */
    drawFooter(ctx, currentSlideIndex, totalSlides, settings, width, height) {
        const theme = COLOR_THEMES[this.currentTheme] || COLOR_THEMES['minimal_clean'];
        const safeZone = CONFIG.SAFE_ZONES[settings.format] || CONFIG.SAFE_ZONES.post;

        ctx.save();
        ctx.font = `${settings.fontSize * 0.7}px ${CONFIG.FONT_FAMILY}`;
        ctx.fillStyle = settings.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        let footerY = height - (settings.padding / 2) - safeZone.bottom;

        // Draw footer text
        if (settings.footerText) {
            ctx.fillText(settings.footerText, width / 2, footerY);
            footerY -= settings.fontSize * 0.8;
        }

        // Draw slide number
        ctx.font = `${settings.fontSize * 0.6}px ${CONFIG.FONT_FAMILY}`;
        ctx.globalAlpha = 0.7;
        ctx.fillText(
            `${toPersianNum(currentSlideIndex + 1)} / ${toPersianNum(totalSlides)}`,
            width / 2,
            height - 20 - safeZone.bottom
        );
        ctx.globalAlpha = 1.0;

        // Draw progress bar
        const barWidth = width - 2 * (settings.padding + safeZone.side);
        const barHeight = 12;
        const progress = totalSlides > 1 ? (currentSlideIndex + 1) / totalSlides : 1;
        const barX = settings.padding + safeZone.side;
        const barY = height - 12 - safeZone.bottom;

        // Background
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = '#888';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progress fill (RTL)
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = theme.primary || '#007bff';
        ctx.fillRect(barX + barWidth - (barWidth * progress), barY, barWidth * progress, barHeight);
        ctx.globalAlpha = 1.0;

        ctx.restore();
    }

    /**
     * Download all slides with progress indication
     */
    async downloadAllSlides() {
        if (this.generatedSlides.length === 0) {
            showToast('ابتدا یک پیش‌نمایش ایجاد کنید', 'warning');
            return;
        }

        const settings = this.getSettings();
        const button = document.querySelector('button[onclick="slideGenerator.downloadAllSlides()"]');

        if (!button) return;

        const originalText = button.innerHTML;
        button.disabled = true;

        try {
            for (let i = 0; i < this.generatedSlides.length; i++) {
                button.innerHTML = `در حال آماده‌سازی اسلاید ${toPersianNum(i + 1)}...`;

                const dataURL = await this.createSlide(
                    this.generatedSlides[i],
                    this.generatedSlides.length,
                    i,
                    settings
                );

                // Convert to blob and download
                const response = await fetch(dataURL);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = `slide_${String(i + 1).padStart(2, '0')}.png`;
                link.click();

                URL.revokeObjectURL(url);

                // Small delay to prevent overwhelming the browser
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            showToast('همه اسلایدها دانلود شدند', 'success');
        } catch (error) {
            console.error('Download failed:', error);
            showToast('خطا در دانلود اسلایدها', 'error');
        } finally {
            button.innerHTML = originalText;
            button.disabled = false;
        }
    }

    /**
     * Clear preview
     */
    clearPreview() {
        const previewDiv = document.getElementById('preview');
        if (previewDiv) {
            previewDiv.innerHTML = '';
        }
        this.generatedSlides = [];
        showToast('پیش‌نمایش پاک شد', 'info');
    }

    /**
     * Get application statistics
     */
    getStats() {
        const settings = this.getSettings();
        const outline = this.textProcessor.extractOutline(settings.text);

        return {
            wordCount: this.textProcessor.countWords(settings.text),
            readingTime: this.textProcessor.estimateReadingTime(settings.text),
            slideCount: this.generatedSlides.length,
            outline: outline,
            hasTitle: !!settings.titleText,
            hasImages: !!(settings.bgImage || settings.authImage)
        };
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.slideGenerator = new SlideGenerator();
});