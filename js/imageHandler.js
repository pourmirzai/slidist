// Enhanced image handling with validation and optimization
import { CONFIG } from './config.js';
import { isValidImageType, formatFileSize, showToast } from './utils.js';

export class ImageHandler {
    constructor() {
        this.backgroundImage = null;
        this.authorImage = null;
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.maxDimensions = { width: 4000, height: 4000 };
    }

    /**
     * Handle image upload with validation and optimization
     */
    async handleImageUpload(file, imageType) {
        try {
            // Validate file
            if (!this.validateImageFile(file)) {
                return false;
            }

            // Show loading state
            this.showLoadingState(imageType, true);

            // Process image
            const processedImage = await this.processImage(file);
            
            // Store image
            if (imageType === 'background') {
                this.backgroundImage = processedImage;
            } else if (imageType === 'author') {
                this.authorImage = processedImage;
            }

            this.showLoadingState(imageType, false);
            showToast(`تصویر ${imageType === 'background' ? 'پس‌زمینه' : 'نویسنده'} بارگذاری شد`, 'success');
            
            return true;
        } catch (error) {
            console.error('Image upload failed:', error);
            this.showLoadingState(imageType, false);
            showToast('خطا در بارگذاری تصویر', 'error');
            return false;
        }
    }

    /**
     * Validate image file
     */
    validateImageFile(file) {
        // Check file type
        if (!isValidImageType(file)) {
            showToast('فرمت تصویر پشتیبانی نمی‌شود', 'error');
            return false;
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            showToast(`حجم تصویر نباید بیشتر از ${formatFileSize(this.maxFileSize)} باشد`, 'error');
            return false;
        }

        return true;
    }

    /**
     * Process and optimize image
     */
    async processImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    // Check dimensions
                    if (img.width > this.maxDimensions.width || img.height > this.maxDimensions.height) {
                        // Resize if too large
                        const resizedImage = this.resizeImage(img);
                        resolve(resizedImage);
                    } else {
                        resolve(img);
                    }
                };
                
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Resize image if it's too large
     */
    resizeImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions
        const ratio = Math.min(
            this.maxDimensions.width / img.width,
            this.maxDimensions.height / img.height
        );
        
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Create new image from canvas
        const resizedImg = new Image();
        resizedImg.src = canvas.toDataURL('image/jpeg', 0.9);
        
        return resizedImg;
    }

    /**
     * Show loading state for image upload
     */
    showLoadingState(imageType, isLoading) {
        const dropZoneId = imageType === 'background' ? 'bgDropZone' : 'authorDropZone';
        const dropZone = document.getElementById(dropZoneId);
        
        if (dropZone) {
            if (isLoading) {
                dropZone.innerHTML = '<div class="loading-spinner"></div>در حال بارگذاری...';
                dropZone.style.pointerEvents = 'none';
            } else {
                dropZone.innerHTML = 'یا تصویر را اینجا بکشید و رها کنید';
                dropZone.style.pointerEvents = 'auto';
            }
        }
    }

    /**
     * Setup drag and drop functionality with enhanced feedback
     */
    setupDragAndDrop() {
        this.setupDropZone('authorDropZone', 'authorImageFile', 'author');
        this.setupDropZone('bgDropZone', 'bgImageFile', 'background');
    }

    /**
     * Setup individual drop zone
     */
    setupDropZone(zoneId, inputId, type) {
        const zone = document.getElementById(zoneId);
        const input = document.getElementById(inputId);
        
        if (!zone || !input) return;

        // File input change handler
        input.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                await this.handleImageUpload(e.target.files[0], type);
            }
        });

        // Drag and drop handlers
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', async (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                await this.handleImageUpload(e.dataTransfer.files[0], type);
            }
        });

        // Click to upload
        zone.addEventListener('click', () => {
            input.click();
        });
    }

    /**
     * Get background image draw parameters with enhanced modes
     */
    getBgImageDrawParams(bgImage, slideSize, mode) {
        let sx = 0, sy = 0, sw = bgImage.width, sh = bgImage.height;
        let dx = 0, dy = 0, dw = slideSize, dh = slideSize;

        switch (mode) {
            case 'cover-top':
                const scaleTop = Math.max(slideSize / bgImage.width, slideSize / bgImage.height);
                sw = slideSize / scaleTop;
                sh = slideSize / scaleTop;
                sx = (bgImage.width - sw) / 2;
                sy = 0;
                break;
                
            case 'cover-center':
                const scaleCenter = Math.max(slideSize / bgImage.width, slideSize / bgImage.height);
                sw = slideSize / scaleCenter;
                sh = slideSize / scaleCenter;
                sx = (bgImage.width - sw) / 2;
                sy = (bgImage.height - sh) / 2;
                break;
                
            case 'cover-bottom':
                const scaleBottom = Math.max(slideSize / bgImage.width, slideSize / bgImage.height);
                sw = slideSize / scaleBottom;
                sh = slideSize / scaleBottom;
                sx = (bgImage.width - sw) / 2;
                sy = bgImage.height - sh;
                break;
                
            case 'contain':
                const scaleContain = Math.min(slideSize / bgImage.width, slideSize / bgImage.height);
                dw = bgImage.width * scaleContain;
                dh = bgImage.height * scaleContain;
                dx = (slideSize - dw) / 2;
                dy = (slideSize - dh) / 2;
                break;
                
            case 'stretch':
                // Use default values (stretch to fill)
                break;
        }

        return { sx, sy, sw, sh, dx, dy, dw, dh };
    }

    /**
     * Clear image
     */
    clearImage(imageType) {
        if (imageType === 'background') {
            this.backgroundImage = null;
            document.getElementById('bgImageFile').value = '';
        } else if (imageType === 'author') {
            this.authorImage = null;
            document.getElementById('authorImageFile').value = '';
        }
        
        showToast(`تصویر ${imageType === 'background' ? 'پس‌زمینه' : 'نویسنده'} حذف شد`, 'info');
    }

    /**
     * Get image info
     */
    getImageInfo(imageType) {
        const image = imageType === 'background' ? this.backgroundImage : this.authorImage;
        
        if (!image) return null;
        
        return {
            width: image.width,
            height: image.height,
            loaded: image.complete,
            aspectRatio: image.width / image.height
        };
    }
}