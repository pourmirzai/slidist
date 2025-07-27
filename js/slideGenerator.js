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
        this.setupAutoSave();
        
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

        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', debounce(() => {
                    this.saveSettings();
                }, 500));
            }
        });

        // Checkboxes and selects
        const controls = ['useBullets', 'bulletSelect', 'bgImageMode'];
        controls.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.saveSettings();
                    this.handleControlChange(id);
                });
            }
        });

        // Custom bullet input
        const customBulletInput = document.getElementById('customBulletInput');
        if (customBulletInput) {
            customBulletInput.addEventListener('input', debounce(() => {
                this.saveSettings();
            }, 300));
        }

        // Opacity slider
        const opacitySlider = document.getElementById('bgImageOpacity');
        if (opacitySlider) {
            opacitySlider.addEventListener('input', (e) => {
                document.getElementById('opacityValue').textContent = e.target.value;
            });
        }

        // Lightbox
        this.setupLightbox();

        // Keyboard shortcuts
        this.setupKeyboardShortcuts();
    }

    /**
     * Handle control changes
     */
    handleControlChange(controlId) {
        switch (controlId) {
            case 'bulletSelect':
                const bulletSelect = document.getElementById('bulletSelect');
                const customInput = document.getElementById('customBulletInput');
                customInput.style.display = bulletSelect.value === 'custom' ? 'block' : 'none';
                break;
        }
    }

    /**
     * Setup theme selector with enhanced functionality
     */
    setupThemeSelector() {
        const selector = document.getElementById('theme-selector');
        if (!selector) return;

        selector.innerHTML = '';

        Object.entries(COLOR_THEMES).forEach(([key, theme]) => {
            const div = document.createElement('div');
            div.className = 'theme-preview';
            div.dataset.themeKey = key;
            div.tabIndex = 0; // Make focusable for accessibility
            
            div.innerHTML = `
                <div class="colors" style="background: linear-gradient(45deg, ${theme.bg1}, ${theme.bg2});">
                    <span class="text-sample" style="color: ${theme.text};">Aa</span>
                </div>
                <span class="theme-name">${theme.name}</span>
            `;

            // Click and keyboard event handlers
            const applyTheme = () => this.applyColorTheme(key);
            div.addEventListener('click', applyTheme);
            div.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    applyTheme();
                }
            });

            selector.appendChild(div);
        });

        // Set default theme
        this.applyColorTheme('minimal_clean');
    }

    /**
     * Apply color theme with enhanced functionality
     */
    applyColorTheme(key) {
        // Update UI selection
        document.querySelectorAll('.theme-preview').forEach(el => {
            el.classList.remove('selected');
        });
        
        const selectedTheme = document.querySelector(`.theme-preview[data-theme-key="${key}"]`);
        if (selectedTheme) {
            selectedTheme.classList.add('selected');
        }

        const theme = COLOR_THEMES[key];
        if (!theme) return;

        this.currentTheme = key;
        
        // Show/hide custom color controls
        const customControls = document.getElementById('customColorControls');
        if (customControls) {
            customControls.style.display = key === 'custom' ? 'grid' : 'none';
        }

        // Update color inputs if not custom theme
        if (key !== 'custom') {
            const colorInputs = {
                'bgColor1': theme.bg1,
                'bgColor2': theme.bg2,
                'textColor': theme.text
            };

            Object.entries(colorInputs).forEach(([id, value]) => {
                const input = document.getElementById(id);
                if (input) input.value = value;
            });
        }

        this.saveSettings();
        showToast(`تم "${theme.name}" اعمال شد`, 'info');
    }

    /**
     * Setup lightbox functionality
     */
    setupLightbox() {
        const lightbox = document.getElementById('lightbox');
        const closeLightbox = document.getElementById('closeLightbox');
        const lightboxImg = document.getElementById('lightboxImg');

        if (!lightbox || !closeLightbox || !lightboxImg) return;

        // Close lightbox
        const closeLightboxFn = () => lightbox.classList.remove('show');
        
        closeLightbox.addEventListener('click', closeLightboxFn);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightboxFn();
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('show')) {
                closeLightboxFn();
            }
        });

        // Preview click handler
        const preview = document.getElementById('preview');
        if (preview) {
            preview.addEventListener('click', (e) => {
                if (e.target.tagName === 'IMG') {
                    lightboxImg.src = e.target.src;
                    lightbox.classList.add('show');
                }
            });
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Enter: Generate preview
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.previewSlides();
            }
            
            // Ctrl/Cmd + S: Save settings
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.exportSettings();
            }
        });
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveSettings();
        }, 30000);

        // Save before page unload
        window.addEventListener('beforeunload', () => {
            this.saveSettings();
        });
    }

    /**
     * Get current settings
     */
    getSettings() {
        const bulletSelect = document.getElementById('bulletSelect');
        let bulletChar = bulletSelect?.value || '✅';
        
        if (bulletChar === 'custom') {
            bulletChar = document.getElementById('customBulletInput')?.value || '•';
        }

        return {
            fontSize: parseInt(document.getElementById('fontSize')?.value || CONFIG.DEFAULT_FONT_SIZE),
            padding: parseInt(document.getElementById('padding')?.value || CONFIG.DEFAULT_PADDING),
            lineHeightMultiplier: parseFloat(document.getElementById('lineHeight')?.value || CONFIG.DEFAULT_LINE_HEIGHT),
            bgColor1: document.getElementById('bgColor1')?.value || '#f5f5f5',
            bgColor2: document.getElementById('bgColor2')?.value || '#e0e0e0',
            textColor: document.getElementById('textColor')?.value || '#212121',
            useBullets: document.getElementById('useBullets')?.checked || false,
            bulletChar,
            text: document.getElementById('inputText')?.value || '',
            titleText: document.getElementById('titleText')?.value?.trim() || '',
            subtitleText: document.getElementById('subtitleText')?.value?.trim() || '',
            footerText: document.getElementById('footerText')?.value?.trim() || '',
            bgImage: this.imageHandler.backgroundImage,
            authImage: this.imageHandler.authorImage,
            bgOpacity: parseFloat(document.getElementById('bgImageOpacity')?.value || 0.3),
            bgImageMode: document.getElementById('bgImageMode')?.value || 'cover-center',
            theme: this.currentTheme
        };
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        const settings = this.getSettings();
        this.storageManager.saveSettings(settings);
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        const settings = this.storageManager.loadSettings();
        if (!settings) return;

        try {
            // Apply loaded settings to form
            const settingsMap = {
                'fontSize': settings.fontSize,
                'padding': settings.padding,
                'lineHeight': settings.lineHeightMultiplier,
                'bgColor1': settings.bgColor1,
                'bgColor2': settings.bgColor2,
                'textColor': settings.textColor,
                'inputText': settings.text,
                'titleText': settings.titleText,
                'subtitleText': settings.subtitleText,
                'footerText': settings.footerText,
                'bgImageOpacity': settings.bgOpacity
            };

            Object.entries(settingsMap).forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element && value !== undefined) {
                    element.value = value;
                }
            });

            // Handle checkboxes and selects
            const useBulletsEl = document.getElementById('useBullets');
            if (useBulletsEl) useBulletsEl.checked = !!settings.useBullets;

            const bulletSelectEl = document.getElementById('bulletSelect');
            if (bulletSelectEl && settings.bulletChar) {
                bulletSelectEl.value = settings.bulletChar;
                this.handleControlChange('bulletSelect');
            }

            const customBulletEl = document.getElementById('customBulletInput');
            if (customBulletEl) customBulletEl.value = settings.bulletChar || '';

            const bgModeEl = document.getElementById('bgImageMode');
            if (bgModeEl && settings.bgImageMode) {
                bgModeEl.value = settings.bgImageMode;
            }

            // Apply theme
            if (settings.theme) {
                this.applyColorTheme(settings.theme);
            }

            // Update opacity display
            const opacityValue = document.getElementById('opacityValue');
            if (opacityValue) opacityValue.textContent = settings.bgOpacity || 0.3;

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
            slidePreviewsHTML += `<img src="${dataURL}" alt="پیش‌نمایش اسلاید ${i+1}" loading="lazy">`;
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
        const canvas = document.createElement('canvas');
        canvas.width = CONFIG.SLIDE_SIZE;
        canvas.height = CONFIG.SLIDE_SIZE;
        const ctx = canvas.getContext('2d');

        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw background
        this.drawBackground(ctx, settings);

        // Draw background image for title slides
        if (slideContent.type === 'title' && settings.bgImage && settings.bgImage.complete) {
            this.drawBackgroundImage(ctx, settings);
        }

        // Set text properties
        ctx.fillStyle = settings.textColor;
        ctx.direction = 'rtl';

        // Draw content based on slide type
        if (slideContent.type === 'title') {
            this.drawTitleSlide(ctx, settings);
        } else {
            this.drawContentSlide(ctx, slideContent, settings);
        }

        // Draw footer
        this.drawFooter(ctx, currentSlideIndex, totalSlides, settings);

        return canvas.toDataURL('image/png', 0.95);
    }

    /**
     * Draw background with gradient support
     */
    drawBackground(ctx, settings) {
        if (settings.bgColor1 !== settings.bgColor2) {
            const gradient = ctx.createLinearGradient(0, 0, 0, CONFIG.SLIDE_SIZE);
            gradient.addColorStop(0, settings.bgColor1);
            gradient.addColorStop(1, settings.bgColor2);
            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = settings.bgColor1;
        }
        ctx.fillRect(0, 0, CONFIG.SLIDE_SIZE, CONFIG.SLIDE_SIZE);
    }

    /**
     * Draw background image
     */
    drawBackgroundImage(ctx, settings) {
        ctx.globalAlpha = settings.bgOpacity;
        const params = this.imageHandler.getBgImageDrawParams(
            settings.bgImage, 
            CONFIG.SLIDE_SIZE, 
            settings.bgImageMode
        );
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
    drawTitleSlide(ctx, settings) {
        const theme = COLOR_THEMES[this.currentTheme] || COLOR_THEMES['minimal_clean'];
        let currentY = settings.subtitleText ? CONFIG.SLIDE_SIZE / 2 - 50 : CONFIG.SLIDE_SIZE / 2;

        // Draw author image if available
        if (settings.authImage && settings.authImage.complete) {
            currentY = this.drawAuthorImage(ctx, settings.authImage, currentY);
        }

        // Draw title
        const titleParts = this.textProcessor.parseMarkdown(settings.titleText);
        ctx.font = `bold ${settings.fontSize * 1.5}px ${CONFIG.FONT_FAMILY}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = settings.textColor;

        this.textProcessor.drawRichText(
            ctx, titleParts, CONFIG.SLIDE_SIZE / 2, currentY,
            undefined, `bold ${settings.fontSize * 1.5}px ${CONFIG.FONT_FAMILY}`,
            settings.textColor, 'center'
        );

        // Draw separator line
        if (settings.subtitleText) {
            ctx.strokeStyle = settings.textColor;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.moveTo(CONFIG.SLIDE_SIZE / 2 - 100, currentY + 35);
            ctx.lineTo(CONFIG.SLIDE_SIZE / 2 + 100, currentY + 35);
            ctx.stroke();
            ctx.globalAlpha = 1.0;

            // Draw subtitle
            const subtitleParts = this.textProcessor.parseMarkdown(settings.subtitleText);
            ctx.font = `${settings.fontSize * 0.8}px ${CONFIG.FONT_FAMILY}`;
            this.textProcessor.drawRichText(
                ctx, subtitleParts, CONFIG.SLIDE_SIZE / 2, currentY + 70,
                undefined, `${settings.fontSize * 0.8}px ${CONFIG.FONT_FAMILY}`,
                settings.textColor, 'center'
            );
        }
    }

    /**
     * Draw author image with circular crop
     */
    drawAuthorImage(ctx, authImage, currentY) {
        const imgSize = 300;
        const imgX = CONFIG.SLIDE_SIZE / 2 - imgSize / 2;
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
        ctx.arc(CONFIG.SLIDE_SIZE / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(authImage, sx, sy, sWidth, sHeight, imgX, imgY, imgSize, imgSize);
        ctx.restore();

        return currentY + imgSize / 2 + 15;
    }

    /**
     * Draw content slide
     */
    drawContentSlide(ctx, slideContent, settings) {
        let y = settings.padding;
        ctx.save();
        ctx.font = `${settings.fontSize}px ${CONFIG.FONT_FAMILY}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.direction = 'rtl';

        for (const item of slideContent) {
            if (item.type === 'heading') {
                const fontSize = settings.fontSize * (item.level === 1 ? 1.5 : item.level === 2 ? 1.3 : 1.2);
                ctx.font = `bold ${fontSize}px ${CONFIG.FONT_FAMILY}`;
                ctx.fillText(item.text, CONFIG.SLIDE_SIZE - settings.padding, y);
                y += fontSize * settings.lineHeightMultiplier;
                ctx.font = `${settings.fontSize}px ${CONFIG.FONT_FAMILY}`;
            } else if (item.type === 'body' || item.type === 'list') {
                let text = item.text;
                if (item.useBullet && item.isFirstLineOfPara) {
                    text = `${settings.bulletChar} ${text}`;
                }
                ctx.fillText(text, CONFIG.SLIDE_SIZE - settings.padding, y);
                y += settings.fontSize * settings.lineHeightMultiplier;
            } else if (item.type === 'quote') {
                ctx.save();
                ctx.fillStyle = COLOR_THEMES[this.currentTheme]?.accent || '#6c757d';
                ctx.font = `italic ${settings.fontSize}px ${CONFIG.FONT_FAMILY}`;
                ctx.fillText(`"${item.text}"`, CONFIG.SLIDE_SIZE - settings.padding, y);
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
    drawFooter(ctx, currentSlideIndex, totalSlides, settings) {
        const theme = COLOR_THEMES[this.currentTheme] || COLOR_THEMES['minimal_clean'];
        
        ctx.save();
        ctx.font = `${settings.fontSize * 0.7}px ${CONFIG.FONT_FAMILY}`;
        ctx.fillStyle = settings.textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        let footerY = CONFIG.SLIDE_SIZE - settings.padding / 2;

        // Draw footer text
        if (settings.footerText) {
            ctx.fillText(settings.footerText, CONFIG.SLIDE_SIZE / 2, footerY);
            footerY -= settings.fontSize * 0.8;
        }

        // Draw slide number
        ctx.font = `${settings.fontSize * 0.6}px ${CONFIG.FONT_FAMILY}`;
        ctx.globalAlpha = 0.7;
        ctx.fillText(
            `${toPersianNum(currentSlideIndex + 1)} / ${toPersianNum(totalSlides)}`,
            CONFIG.SLIDE_SIZE / 2,
            CONFIG.SLIDE_SIZE - 20
        );
        ctx.globalAlpha = 1.0;

        // Draw progress bar
        const barWidth = CONFIG.SLIDE_SIZE - 2 * settings.padding;
        const barHeight = 12;
        const progress = totalSlides > 1 ? (currentSlideIndex + 1) / totalSlides : 1;
        const barX = settings.padding;
        const barY = CONFIG.SLIDE_SIZE - 12;

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