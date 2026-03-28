import { g } from '../core/globals';
import { gaussianRandom } from '../utils/math';
import { updateCyclicColor } from './painting_tools';

/**
 * Image Spray Tool
 * Simulates a spray can effect by drawing random pixels/circles in a radius.
 * Ported from legacy spray.js.
 * @param ctx The canvas context to draw on
 * @param _e The mouse event (reserved for future use)
 */
export function drawSpray(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, _e?: MouseEvent): void {
    const r = Math.floor(g.spray_radius / 4);
    updateCyclicColor();
    for (let i = 0; i < g.spray_density; i++) {
        const x2 = Math.floor(g.pX + gaussianRandom(0, r));
        const y2 = Math.floor(g.pY + gaussianRandom(0, r));

        ctx.beginPath();
        ctx.fillStyle = g.pen_color;
        if (g.pen_width < 2) {
            ctx.fillRect(x2, y2, 1, 1);
        }
        else {
            ctx.arc(x2, y2, g.pen_width / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }
    }
}

// Global exposure for legacy interop
(window as any).drawSpray = drawSpray;
