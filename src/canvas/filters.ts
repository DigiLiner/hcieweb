/**
 * Image Filters Module
 * Ported from legacy filters.js with full TypeScript support.
 * All filters work on ImageData and use Uint8ClampedArray for performance.
 */

/**
 * Applies sepia filter to image data
 */
export function applySepia(imageData: ImageData): void {
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        // Sepia transformation matrix
        d[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        d[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        d[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
}

/**
 * Applies negative/invert filter to image data
 */
export function applyNegative(imageData: ImageData): void {
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 - d[i];
        d[i + 1] = 255 - d[i + 1];
        d[i + 2] = 255 - d[i + 2];
    }
}

/**
 * Applies grayscale filter to image data
 */
export function applyGrayscale(imageData: ImageData): void {
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
        const avg = (d[i] + d[i+1] + d[i+2]) / 3;
        d[i] = avg;
        d[i+1] = avg;
        d[i+2] = avg;
    }
}

/**
 * Applies box blur filter to image data
 */
export function applyBoxBlur(imageData: ImageData, radius = 3): ImageData {
    if (radius <= 0) return imageData;
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    const dst = new Uint8ClampedArray(src.length);
    const kernelSize = radius * 2 + 1;
    const kernelArea = kernelSize * kernelSize;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let r = 0, g = 0, b = 0, a = 0;
            for (let ky = -radius; ky <= radius; ky++) {
                for (let kx = -radius; kx <= radius; kx++) {
                    const px = Math.min(width - 1, Math.max(0, x + kx));
                    const py = Math.min(height - 1, Math.max(0, y + ky));
                    const idx = (py * width + px) * 4;
                    r += src[idx];
                    g += src[idx + 1];
                    b += src[idx + 2];
                    a += src[idx + 3];
                }
            }
            const dstIdx = (y * width + x) * 4;
            dst[dstIdx] = r / kernelArea;
            dst[dstIdx + 1] = g / kernelArea;
            dst[dstIdx + 2] = b / kernelArea;
            dst[dstIdx + 3] = a / kernelArea;
        }
    }
    return new ImageData(dst, width, height);
}

/**
 * Applies melt effect - vertical pixel dripping
 */
export function applyMelt(imageData: ImageData, amount = 30): ImageData {
    if (amount <= 0) return imageData;
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    const dst = new Uint8ClampedArray(src.length);
    dst.set(src);

    for (let x = 0; x < width; x++) {
        const shift = Math.floor(Math.random() * amount);
        if (shift > 0) {
            for (let y = height - 1; y >= 0; y--) {
                const srcY = (y - shift + height) % height;
                const srcIdx = (srcY * width + x) * 4;
                const dstIdx = (y * width + x) * 4;
                dst[dstIdx] = src[srcIdx];
                dst[dstIdx + 1] = src[srcIdx + 1];
                dst[dstIdx + 2] = src[srcIdx + 2];
                dst[dstIdx + 3] = src[srcIdx + 3];
            }
        }
    }
    return new ImageData(dst, width, height);
}

/**
 * Applies shear effect
 */
export function applyShear(imageData: ImageData, amount = 40, horizontal = true, direction = 1): ImageData {
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    const dst = new Uint8ClampedArray(src.length);
    dst.set(src);

    if (horizontal) {
        for (let y = 0; y < height; y++) {
            const shift = Math.floor((y / height) * amount) * direction;
            for (let x = 0; x < width; x++) {
                const srcX = (x - shift + width) % width;
                const srcIdx = (y * width + srcX) * 4;
                const dstIdx = (y * width + x) * 4;
                dst[dstIdx] = src[srcIdx];
                dst[dstIdx + 1] = src[srcIdx + 1];
                dst[dstIdx + 2] = src[srcIdx + 2];
                dst[dstIdx + 3] = src[srcIdx + 3];
            }
        }
    } else {
        for (let x = 0; x < width; x++) {
            const shift = Math.floor((x / width) * amount) * direction;
            for (let y = 0; y < height; y++) {
                const srcY = (y - shift + height) % height;
                const srcIdx = (srcY * width + x) * 4;
                const dstIdx = (y * width + x) * 4;
                dst[dstIdx] = src[srcIdx];
                dst[dstIdx + 1] = src[srcIdx + 1];
                dst[dstIdx + 2] = src[srcIdx + 2];
                dst[dstIdx + 3] = src[srcIdx + 3];
            }
        }
    }
    return new ImageData(dst, width, height);
}

/**
 * Applies mosaic/pixelation effect
 */
export function applyMosaic(imageData: ImageData, blockSize = 10): ImageData {
    if (blockSize <= 1) return imageData;
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;
    const dst = new Uint8ClampedArray(src.length);

    for (let by = 0; by < height; by += blockSize) {
        for (let bx = 0; bx < width; bx += blockSize) {
            let r = 0, g = 0, b = 0, a = 0, count = 0;
            for (let y = by; y < Math.min(by + blockSize, height); y++) {
                for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
                    const idx = (y * width + x) * 4;
                    r += src[idx];
                    g += src[idx + 1];
                    b += src[idx + 2];
                    a += src[idx + 3];
                    count++;
                }
            }
            r = Math.floor(r / count);
            g = Math.floor(g / count);
            b = Math.floor(b / count);
            a = Math.floor(a / count);

            for (let y = by; y < Math.min(by + blockSize, height); y++) {
                for (let x = bx; x < Math.min(bx + blockSize, width); x++) {
                    const idx = (y * width + x) * 4;
                    dst[idx] = r;
                    dst[idx + 1] = g;
                    dst[idx + 2] = b;
                    dst[idx + 3] = a;
                }
            }
        }
    }
    return new ImageData(dst, width, height);
}

// Global exposure for legacy interop
(window as any).applySepia = applySepia;
(window as any).applyNegative = applyNegative;
(window as any).applyGrayscale = applyGrayscale;
(window as any).applyBoxBlur = applyBoxBlur;
(window as any).applyMelt = applyMelt;
(window as any).applyShear = applyShear;
(window as any).applyMosaic = applyMosaic;
