import { g } from '../core/globals';

/**
 * Color Box UI Component
 * Manages the color palette and recent colors logic.
 * Ported from legacy colorbox.js.
 */

const COLS = 16; 
const ROWS = 8;  
let g_colors: string[] = []; 

/**
 * Generates the color palette with grayscale and hues.
 */
export function generatePalette(): void {
    g_colors = [];

    for (let r = 0; r < ROWS; r++) {
        // 1. Grayscale pixel for this row
        const grayVal = 255 - (r * (255 / (ROWS - 1)));
        g_colors.push(rgbToHex(Math.round(grayVal), Math.round(grayVal), Math.round(grayVal)));

        // 2. Hue pixels for this row
        const lightness = 95 - (r * (80 / (ROWS - 1)));

        for (let c = 0; c < COLS - 1; c++) {
            const hue = (c * (360 / (COLS - 1)));
            g_colors.push(hslToHex(hue, 85, lightness));
        }
    }
}

/**
 * Draws the color boxes to the specified canvas.
 * @param canvas The canvas to draw on
 */
export function drawColorBoxes(canvas: HTMLCanvasElement): void {
    if (!canvas) return;
    if (g_colors.length === 0) generatePalette();

    const parent = canvas.parentElement;
    const containerWidth = parent ? parent.clientWidth : 200;
    const avgBoxSize = containerWidth / COLS;
    const totalHeight = Math.floor(ROWS * avgBoxSize);

    canvas.width = containerWidth;
    canvas.height = totalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const getPos = (idx: number, total: number, size: number) => Math.floor(idx * size / total);

    for (let i = 0; i < g_colors.length; i++) {
        const col = i % COLS;
        const row = Math.floor(i / COLS);

        const x0 = getPos(col, COLS, containerWidth);
        const x1 = getPos(col + 1, COLS, containerWidth);
        const w = x1 - x0;

        const y0 = getPos(row, ROWS, totalHeight);
        const y1 = getPos(row + 1, ROWS, totalHeight);
        const h = y1 - y0;

        ctx.fillStyle = g_colors[i];
        ctx.fillRect(x0, y0, w, h);
    }
}

// ─── Helpers ──────────────────────────────────────────────

function componentToHex(c: number): string {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number): string {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hslToHex(h: number, s: number, l: number): string {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

// ─── Recent Colors ────────────────────────────────────────

let g_recent_colors: string[] = [];

try {
    const saved = localStorage.getItem('recentColors');
    if (saved) {
        g_recent_colors = JSON.parse(saved);
        if (!Array.isArray(g_recent_colors)) g_recent_colors = [];
    }
    if (g_recent_colors.length === 0) {
        g_recent_colors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'];
    }
} catch (e) {
    g_recent_colors = ['#000000', '#ffffff'];
}

export function addColorToRecent(color: string): void {
    if (!color) return;
    g_recent_colors = g_recent_colors.filter(c => c.toLowerCase() !== color.toLowerCase());
    g_recent_colors.unshift(color);
    if (g_recent_colors.length > 16) {
        g_recent_colors = g_recent_colors.slice(0, 16);
    }
    localStorage.setItem('recentColors', JSON.stringify(g_recent_colors));
    renderRecentColors();
}

export function renderRecentColors(): void {
    const grid = document.getElementById('recentColorsGrid');
    if (!grid) return;

    grid.innerHTML = '';
    g_recent_colors.forEach(color => {
        const tile = document.createElement('div');
        tile.className = 'recent-color-tile';
        tile.style.backgroundColor = color;
        tile.title = color;
        
        tile.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left click
                g.pen_color = color;
                window.dispatchEvent(new CustomEvent('colorChanged', { detail: { color: color } }));
                addColorToRecent(color);
            } else if (e.button === 2) { // Right click
                g.pen_secondary_color = color;
                window.dispatchEvent(new CustomEvent('secondaryColorChanged', { detail: { color: color } }));
                addColorToRecent(color);
            }
        });
        
        tile.addEventListener('contextmenu', (e) => e.preventDefault());
        grid.appendChild(tile);
    });
}

/**
 * Initializes the color box module, binding events and performing the first draw.
 */
export function initializeColorBox(): void {
    const canvas = document.getElementById('colorBoxCanvas') as HTMLCanvasElement | null;
    if (!canvas) {
        console.error("[DEBUG] ColorBox: colorBoxCanvas element not found in DOM!");
        return;
    }

    const resizeObserver = new ResizeObserver(() => {
        drawColorBoxes(canvas);
    });
    resizeObserver.observe(canvas.parentElement!);

    canvas.addEventListener('mousedown', (e) => {
        if (g_colors.length === 0) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const boxSize = canvas.width / COLS;
        const col = Math.floor(x / boxSize);
        const row = Math.floor(y / boxSize);
        const index = row * COLS + col;

        if (index >= 0 && index < g_colors.length) {
            const color = g_colors[index];
            if (e.button === 0) { // Left click
                g.pen_color = color;
                window.dispatchEvent(new CustomEvent('colorChanged', { detail: { color: color } }));
            } else if (e.button === 2) { // Right click
                g.pen_secondary_color = color;
                window.dispatchEvent(new CustomEvent('secondaryColorChanged', { detail: { color: color } }));
            }
            addColorToRecent(color);
        }
    });

    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    function updateColorIndicators() {
        // Find or create color preview elements
        const primaryPreview = document.getElementById('primary-color-preview');
        const secondaryPreview = document.getElementById('secondary-color-preview');
        
        if (primaryPreview) primaryPreview.style.backgroundColor = g.pen_color;
        if (secondaryPreview) secondaryPreview.style.backgroundColor = g.pen_secondary_color;
    }

    window.addEventListener('colorChanged', (e: any) => {
        if (e.detail.source === 'eye-dropper') {
            addColorToRecent(e.detail.color);
        }
        updateColorIndicators();
    });

    window.addEventListener('secondaryColorChanged', (_e: any) => {
        updateColorIndicators();
    });

    updateColorIndicators(); // Initial call
    renderRecentColors();
    drawColorBoxes(canvas);
}

// Global exposure for legacy interop
(window as any).initializeColorBox = initializeColorBox;
(window as any).drawColorBoxes = drawColorBoxes;
(window as any).addColorToRecent = addColorToRecent;
