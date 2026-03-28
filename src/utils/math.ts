import type { RgbaColor } from '../core/types';

/**
 * Standard Normal variate using Box-Muller transform.
 * @param mean The mean value (default -1 to match legacy behavior)
 * @param stdev The standard deviation
 * @returns A random number following a Gaussian distribution
 */
export function gaussianRandom(mean = -1, stdev = 1): number {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}

/**
 * Converts a hex color string to an RgbaColor object.
 * Supports #RGB, #RGBA, #RRGGBB, #RRGGBBAA.
 * @param hex The hex color string
 * @returns RgbaColor object
 */
export function hexToRgba(hex: string): RgbaColor {
    // Remove the hash if it's there
    hex = hex.replace(/^#/, '');

    let r = 0, g = 0, b = 0, a = 255;

    if (hex.length === 3 || hex.length === 4) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
        if (hex.length === 4) a = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 6 || hex.length === 8) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
        if (hex.length === 8) a = parseInt(hex.substring(6, 8), 16);
    }

    return { r, g, b, a };
}

/**
 * Converts HSL values to a Hex color string.
 * @param h Hue (0-359)
 * @param s Saturation (0-100)
 * @param l Lightness (0-100)
 * @returns Hex color string (#RRGGBB)
 */
export function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}
