// Enhanced text processing with better markdown support
import { CONFIG } from './config.js';
import { getTextWidth } from './utils.js';

export class TextProcessor {
    constructor() {
        this.markdownPatterns = {
            bold: /\*\*([^*]+)\*\*/g,
            italic: /(?<!\*)\*([^*]+)\*(?!\*)/g,
            underline: /__([^_]+)__/g,
            strikethrough: /~~([^~]+)~~/g,
            code: /`([^`]+)`/g,
            highlight: /==([^=]+)==/g
        };
    }

    /**
     * Enhanced markdown parsing with more formatting options
     */
    parseMarkdown(text) {
        if (!text) return [];
        
        let result = [];
        let processedText = text;
        
        // Process bold first to avoid conflicts with italic
        const boldMatches = [];
        let boldMatch;
        const boldRegex = /\*\*([^*]+)\*\*/g;
        
        while ((boldMatch = boldRegex.exec(text)) !== null) {
            boldMatches.push({
                type: 'bold',
                start: boldMatch.index,
                end: boldMatch.index + boldMatch[0].length,
                content: boldMatch[1],
                fullMatch: boldMatch[0]
            });
        }
        
        // Process italic, avoiding bold regions
        const italicMatches = [];
        let italicMatch;
        const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
        
        while ((italicMatch = italicRegex.exec(text)) !== null) {
            // Check if this italic match overlaps with any bold match
            const overlapsWithBold = boldMatches.some(bold => 
                (italicMatch.index >= bold.start && italicMatch.index < bold.end) ||
                (italicMatch.index + italicMatch[0].length > bold.start && italicMatch.index + italicMatch[0].length <= bold.end) ||
                (italicMatch.index < bold.start && italicMatch.index + italicMatch[0].length > bold.end)
            );
            
            if (!overlapsWithBold) {
                italicMatches.push({
                    type: 'italic',
                    start: italicMatch.index,
                    end: italicMatch.index + italicMatch[0].length,
                    content: italicMatch[1],
                    fullMatch: italicMatch[0]
                });
            }
        }
        
        // Process other patterns
        const otherMatches = [];
        const otherPatterns = {
            underline: /__([^_]+)__/g,
            strikethrough: /~~([^~]+)~~/g,
            code: /`([^`]+)`/g,
            highlight: /==([^=]+)==/g
        };
        
        for (const [type, pattern] of Object.entries(otherPatterns)) {
            let match;
            const regex = new RegExp(pattern.source, pattern.flags);
            
            while ((match = regex.exec(text)) !== null) {
                otherMatches.push({
                    type,
                    start: match.index,
                    end: match.index + match[0].length,
                    content: match[1],
                    fullMatch: match[0]
                });
            }
        }
        
        // Combine all matches and sort by position
        const allMatches = [...boldMatches, ...italicMatches, ...otherMatches];
        allMatches.sort((a, b) => a.start - b.start);
        
        // Process text with formatting
        let currentIndex = 0;
        for (const match of allMatches) {
            // Add plain text before this match
            if (match.start > currentIndex) {
                const plainText = text.slice(currentIndex, match.start);
                if (plainText) {
                    result.push({ text: plainText, formatting: {} });
                }
            }
            
            // Add formatted text
            const formatting = {};
            formatting[match.type] = true;
            
            result.push({
                text: match.content,
                formatting
            });
            
            currentIndex = match.end;
        }
        
        // Add remaining plain text
        if (currentIndex < text.length) {
            const plainText = text.slice(currentIndex);
            if (plainText) {
                result.push({ text: plainText, formatting: {} });
            }
        }
        
        // If no matches found, return plain text
        if (result.length === 0 && text) {
            result.push({ text, formatting: {} });
        }
        
        return result;
    }

    /**
     * Enhanced text wrapping with better word breaking
     */
    textWrap(ctx, text, maxWidth, fontSize) {
        const words = text.split(/\s+/);
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const testWidth = getTextWidth(ctx, testLine, `${fontSize}px ${CONFIG.FONT_FAMILY}`);
            
            if (testWidth > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        
        if (currentLine) {
            lines.push(currentLine);
        }
        
        return lines;
    }

    /**
     * Parse and structure content with enhanced pagination
     */
    parseAndStructureContent(settings) {
        const { text, useBullets, bulletChar, fontSize, padding, lineHeightMultiplier } = settings;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const contentWidth = CONFIG.SLIDE_SIZE - 2 * padding;
        
        const allLines = [];
        const rawLines = text.split('\n');
        
        for (const line of rawLines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine.startsWith('### ')) {
                // New slide header
                allLines.push({
                    type: 'heading',
                    text: trimmedLine.substring(4),
                    level: 3
                });
            } else if (trimmedLine.startsWith('## ')) {
                // Section header
                allLines.push({
                    type: 'heading',
                    text: trimmedLine.substring(3),
                    level: 2
                });
            } else if (trimmedLine.startsWith('# ')) {
                // Main header
                allLines.push({
                    type: 'heading',
                    text: trimmedLine.substring(2),
                    level: 1
                });
            } else if (trimmedLine.startsWith('> ')) {
                // Quote
                allLines.push({
                    type: 'quote',
                    text: trimmedLine.substring(2)
                });
            } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                // List item
                const listText = trimmedLine.substring(2);
                const effectiveWidth = contentWidth - (useBullets ? getTextWidth(tempCtx, `${bulletChar} `, `${fontSize}px ${CONFIG.FONT_FAMILY}`) : 0);
                const wrappedLines = this.textWrap(tempCtx, listText, effectiveWidth, fontSize);
                
                wrappedLines.forEach((paraLine, index) => {
                    allLines.push({
                        type: 'list',
                        text: paraLine,
                        isFirstLineOfPara: index === 0,
                        useBullet: useBullets
                    });
                });
            } else if (trimmedLine !== '') {
                // Regular paragraph
                const effectiveWidth = contentWidth - (useBullets ? getTextWidth(tempCtx, `${bulletChar} `, `${fontSize}px ${CONFIG.FONT_FAMILY}`) : 0);
                const wrappedLines = this.textWrap(tempCtx, trimmedLine, effectiveWidth, fontSize);
                
                wrappedLines.forEach((paraLine, index) => {
                    allLines.push({
                        type: 'body',
                        text: paraLine,
                        isFirstLineOfPara: index === 0,
                        useBullet: useBullets
                    });
                });
                
                // Add spacer after paragraph
                allLines.push({ type: 'spacer' });
            }
        }
        
        return this.paginateContent(allLines, settings);
    }

    /**
     * Enhanced pagination with better slide breaks
     */
    paginateContent(allLines, settings) {
        const { fontSize, padding, lineHeightMultiplier } = settings;
        const finalSlides = [];
        
        if (allLines.length === 0) return finalSlides;
        
        let currentSlide = [];
        const maxContentHeight = CONFIG.SLIDE_SIZE - padding - 80;
        let currentY = padding;
        
        const getItemHeight = (item) => {
            switch (item.type) {
                case 'heading':
                    if (item.level === 1) return fontSize * 1.5 * lineHeightMultiplier;
                    if (item.level === 2) return fontSize * 1.3 * lineHeightMultiplier;
                    return fontSize * 1.2 * lineHeightMultiplier;
                case 'quote':
                    return fontSize * 1.1 * lineHeightMultiplier;
                case 'spacer':
                    return fontSize * 0.5;
                default:
                    return fontSize * lineHeightMultiplier;
            }
        };
        
        for (const line of allLines) {
            // Force new slide for level 3 headings
            if (line.type === 'heading' && line.level === 3) {
                if (currentSlide.length > 0) {
                    finalSlides.push(currentSlide);
                }
                currentSlide = [line];
                currentY = padding + getItemHeight(line);
                continue;
            }
            
            const itemHeight = getItemHeight(line);
            
            // Check if item fits on current slide
            if (currentY + itemHeight > maxContentHeight && currentSlide.length > 0) {
                finalSlides.push(currentSlide);
                currentSlide = [line];
                currentY = padding + itemHeight;
            } else {
                currentSlide.push(line);
                currentY += itemHeight;
            }
        }
        
        if (currentSlide.length > 0) {
            finalSlides.push(currentSlide);
        }
        
        return finalSlides;
    }

    /**
     * Draw rich text with enhanced formatting support
     */
    drawRichText(ctx, parts, x, y, maxWidth, baseFont, color, align = 'right') {
        ctx.save();
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.textBaseline = 'top';
        
        // Calculate total width for alignment
        let totalWidth = 0;
        for (const part of parts) {
            const font = this.getFontString(baseFont, part.formatting);
            ctx.font = font;
            totalWidth += ctx.measureText(part.text).width;
        }
        
        // Calculate starting position based on alignment
        let startX = x;
        if (align === 'center') {
            startX = x - totalWidth / 2;
        } else if (align === 'right') {
            startX = x - totalWidth;
        }
        
        let currentX = startX;
        
        // Draw each part with its formatting
        for (const part of parts) {
            const font = this.getFontString(baseFont, part.formatting);
            ctx.font = font;
            
            // Apply special formatting
            if (part.formatting.highlight) {
                ctx.fillStyle = '#ffff00';
                ctx.fillRect(currentX, y - 2, ctx.measureText(part.text).width, parseInt(baseFont) + 4);
                ctx.fillStyle = color;
            }
            
            if (part.formatting.strikethrough) {
                const textWidth = ctx.measureText(part.text).width;
                ctx.beginPath();
                ctx.moveTo(currentX, y + parseInt(baseFont) / 2);
                ctx.lineTo(currentX + textWidth, y + parseInt(baseFont) / 2);
                ctx.stroke();
            }
            
            if (part.formatting.underline) {
                const textWidth = ctx.measureText(part.text).width;
                ctx.beginPath();
                ctx.moveTo(currentX, y + parseInt(baseFont));
                ctx.lineTo(currentX + textWidth, y + parseInt(baseFont));
                ctx.stroke();
            }
            
            ctx.fillText(part.text, currentX, y);
            currentX += ctx.measureText(part.text).width;
        }
        
        ctx.restore();
    }

    /**
     * Generate font string with formatting
     */
    getFontString(baseFont, formatting) {
        let fontStyle = '';
        
        if (formatting.italic) fontStyle += 'italic ';
        if (formatting.bold) fontStyle += 'bold ';
        
        return fontStyle + baseFont;
    }

    /**
     * Count words in text
     */
    countWords(text) {
        return text.trim().split(/\s+/).length;
    }

    /**
     * Estimate reading time
     */
    estimateReadingTime(text, wordsPerMinute = 200) {
        const wordCount = this.countWords(text);
        return Math.ceil(wordCount / wordsPerMinute);
    }

    /**
     * Extract headings for outline
     */
    extractOutline(text) {
        const lines = text.split('\n');
        const outline = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('### ')) {
                outline.push({ level: 3, text: trimmed.substring(4), type: 'slide' });
            } else if (trimmed.startsWith('## ')) {
                outline.push({ level: 2, text: trimmed.substring(3), type: 'section' });
            } else if (trimmed.startsWith('# ')) {
                outline.push({ level: 1, text: trimmed.substring(2), type: 'chapter' });
            }
        }
        
        return outline;
    }
}