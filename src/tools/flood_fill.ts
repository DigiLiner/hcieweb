import type { RgbaColor, CanvasContextLike } from '../core/types';

/**
 * Image Flood Fill Tool
 * Optimized stack-based implementation for high-performance fills.
 * Supports separate target (write) and source (read) contexts for multi-layer fills.
 */

export interface FillTolerance {
    r: number;
    g: number;
    b: number;
    a: number;
}

export const floodFill = (
    x: number,
    y: number,
    targetCtx: CanvasContextLike,
    fillColor: RgbaColor,
    tolerance: FillTolerance = { r: 32, g: 32, b: 32, a: 32 },
    sourceCtx: CanvasContextLike | null = null
) => {
    const canvas = targetCtx.canvas;
    const width = canvas.width;
    const height = canvas.height;

    // We read colors from sourceCtx (or targetCtx if source is null)
    // but we always write to targetCtx.
    const effectiveSourceCtx = sourceCtx || targetCtx;

    // Round coordinates for pixel indexing
    const startX = Math.floor(x);
    const startY = Math.floor(y);

    if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

    // Get image data for sampling and for output
    // willReadFrequently optimization should be set on the canvas contexts before calling this
    const sourceData = effectiveSourceCtx.getImageData(0, 0, width, height).data;
    const targetImageData = targetCtx.getImageData(0, 0, width, height);
    const targetData = targetImageData.data;
    
    const startIndex = (startY * width + startX) * 4;
    const startR = sourceData[startIndex];
    const startG = sourceData[startIndex + 1];
    const startB = sourceData[startIndex + 2];
    const startA = sourceData[startIndex + 3];

    // If the start color is already very similar to the fill color, do nothing
    if (isColorSimilar(startR, startG, startB, startA, fillColor.r, fillColor.g, fillColor.b, fillColor.a, { r: 1, g: 1, b: 1, a: 1 })) {
        console.log("[FLOOD_FILL] Start color is same as fill color. Skipping.");
        return;
    }

    // Use a stack for fast O(1) processing
    const stack: number[] = [startY * width + startX];
    const visited = new Uint8ClampedArray(width * height);
    visited[startY * width + startX] = 1;

    while (stack.length > 0) {
        const index = stack.pop()!;
        const cy = Math.floor(index / width);
        const cx = index % width;

        const pixelIndex = index * 4;
        
        // Apply fill color to the target pixel data
        targetData[pixelIndex] = fillColor.r;
        targetData[pixelIndex + 1] = fillColor.g;
        targetData[pixelIndex + 2] = fillColor.b;
        targetData[pixelIndex + 3] = fillColor.a;

        // Check 4 neighbors
        // North
        if (cy > 0) {
            const nIndex = (cy - 1) * width + cx;
            if (visited[nIndex] === 0 && shouldFill(nIndex, sourceData, startR, startG, startB, startA, tolerance)) {
                visited[nIndex] = 1;
                stack.push(nIndex);
            }
        }
        // South
        if (cy < height - 1) {
            const sIndex = (cy + 1) * width + cx;
            if (visited[sIndex] === 0 && shouldFill(sIndex, sourceData, startR, startG, startB, startA, tolerance)) {
                visited[sIndex] = 1;
                stack.push(sIndex);
            }
        }
        // West
        if (cx > 0) {
            const wIndex = cy * width + (cx - 1);
            if (visited[wIndex] === 0 && shouldFill(wIndex, sourceData, startR, startG, startB, startA, tolerance)) {
                visited[wIndex] = 1;
                stack.push(wIndex);
            }
        }
        // East
        if (cx < width - 1) {
            const eIndex = cy * width + (cx + 1);
            if (visited[eIndex] === 0 && shouldFill(eIndex, sourceData, startR, startG, startB, startA, tolerance)) {
                visited[eIndex] = 1;
                stack.push(eIndex);
            }
        }
    }

    targetCtx.putImageData(targetImageData, 0, 0);
    console.log(`[FLOOD_FILL] Completed fill at ${startX}, ${startY}`);
};

/**
 * Helper to determine if a pixel should be filled based on color similarity.
 */
function shouldFill(
    index: number, 
    data: Uint8ClampedArray | Uint8Array, 
    sr: number, sg: number, sb: number, sa: number, 
    tol: FillTolerance
): boolean {
    const i = index * 4;
    return isColorSimilar(data[i], data[i+1], data[i+2], data[i+3], sr, sg, sb, sa, tol);
}

/**
 * Helper function to check if two colors are "similar" within a tolerance.
 */
export const isColorSimilar = (
    r1: number, g1: number, b1: number, a1: number,
    r2: number, g2: number, b2: number, a2: number,
    tolerance: FillTolerance
): boolean => {
    return (
        Math.abs(r1 - r2) <= tolerance.r &&
        Math.abs(g1 - g2) <= tolerance.g &&
        Math.abs(b1 - b2) <= tolerance.b &&
        Math.abs(a1 - a2) <= tolerance.a
    );
};

// Global exposure for legacy interop
(window as any).isColorSimilar = isColorSimilar;
(window as any).floodFill = floodFill;
