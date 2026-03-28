import { g } from '../core/globals';
import { hslToHex } from '../utils/math';

/**
 * Core Painting Tools
 * Provides basic drawing routines for pen, brush, eraser, and shapes.
 * Ported from legacy tools.js.
 */

/**
 * Updates the global pen color if cyclic_color mode is enabled.
 * Increments the hue based on the defined speed.
 */
export function updateCyclicColor(): void {
    if (!g.cyclic_color) return;
    
    // Increment hue
    g.pen_hue = (g.pen_hue + (g.cyclic_color_speed || 5)) % 360;
    
    // Update global color
    g.pen_color = hslToHex(g.pen_hue, 100, 50);
    
    // Dispatch event to update UI indicators
    window.dispatchEvent(new CustomEvent('colorChanged', { 
        detail: { color: g.pen_color, source: 'cyclic' } 
    }));
}

export function drawPen(_e: MouseEvent, ctx: CanvasRenderingContext2D): void {
    const tip = g.pen_tip || 'round';
    
    if (tip === 'round') {
        // Standard high-performance round stroke
        updateCyclicColor();
        ctx.beginPath();
        ctx.lineWidth = g.pen_width;
        ctx.strokeStyle = g.pen_color;
        ctx.globalAlpha = g.pen_opacity || 1.0;
        ctx.lineCap = g.pen_cap || "round";
        ctx.lineJoin = g.pen_join || "round";
        ctx.moveTo(g.startX, g.startY);
        ctx.lineTo(g.pX, g.pY);
        ctx.stroke();
    } else {
        // Custom stamp-based stroke for Square, Ellipse, Soft
        const dist = Math.hypot(g.pX - g.startX, g.pY - g.startY);
        const steps = Math.max(1, Math.ceil(dist / Math.max(1, g.pen_width / 4)));
        
        for (let i = 0; i <= steps; i++) {
            const x = g.startX + (g.pX - g.startX) * (i / steps);
            const y = g.startY + (g.pY - g.startY) * (i / steps);
            updateCyclicColor();
            drawPenTip(ctx, x, y);
        }
    }
    
    g.startX = g.pX;
    g.startY = g.pY;
}

function drawPenTip(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const size = g.pen_width;
    const color = g.pen_color;
    const alpha = g.pen_opacity || 1.0;
    const tip = g.pen_tip || 'round';
    const angle = (g.pen_angle || 0) * (Math.PI / 180);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.translate(x, y);

    // Apply Tilt rotation for all shapes that aren't perfectly circular
    if (tip !== 'round' && tip !== 'soft') {
        ctx.rotate(angle);
    }

    if (tip === 'square') {
        ctx.fillRect(-size/2, -size/2, size, size);
    } else if (tip === 'ellipse') {
        ctx.beginPath();
        ctx.ellipse(0, 0, size/2, size/4, 0, 0, Math.PI * 2);
        ctx.fill();
    } else if (tip === 'soft') {
        const rad = size / 2;
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rad);
        const rgba = hexToRgba(color);
        grad.addColorStop(0, `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 1)`);
        grad.addColorStop(1, `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2);
        ctx.fill();
    } else if (tip === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.lineTo(size/2, 0);
        ctx.lineTo(0, size/2);
        ctx.lineTo(-size/2, 0);
        ctx.closePath();
        ctx.fill();
    } else if (tip === 'vertical') {
        // Rotated via ctx.rotate above
        ctx.fillRect(-1.5, -size/2, 3, size);
    } else if (tip === 'horizontal') {
        // Rotated via ctx.rotate above
        ctx.fillRect(-size/2, -1.5, size, 3);
    } else if (tip === 'star') {
        const spikes = 5;
        const outerRadius = size / 2;
        const innerRadius = size / 4;
        let rot = Math.PI / 2 * 3;
        let cx, cy;
        let step = Math.PI / spikes;
        ctx.beginPath();
        ctx.moveTo(0, -outerRadius);
        for (let i = 0; i < spikes; i++) {
            cx = Math.cos(rot) * outerRadius;
            cy = Math.sin(rot) * outerRadius;
            ctx.lineTo(cx, cy);
            rot += step;
            cx = Math.cos(rot) * innerRadius;
            cy = Math.sin(rot) * innerRadius;
            ctx.lineTo(cx, cy);
            rot += step;
        }
        ctx.lineTo(0, -outerRadius);
        ctx.closePath();
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.arc(0, 0, size/2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

export function drawLine(_e: MouseEvent, ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.lineWidth = g.pen_width;
    ctx.strokeStyle = g.pen_color;
    ctx.globalAlpha = g.pen_opacity || 1.0;
    ctx.lineCap = g.pen_cap || "round";
    ctx.lineJoin = g.pen_join || "round";
    
    ctx.moveTo(g.startX, g.startY);
    ctx.lineTo(g.pX, g.pY);
    ctx.stroke();
    ctx.closePath();
}

export function drawRect(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    ctx.beginPath();
    ctx.lineWidth = g.pen_width;
    ctx.strokeStyle = g.pen_color;
    ctx.fillStyle = g.pen_secondary_color;
    ctx.globalAlpha = g.pen_opacity || 1.0;
    
    const width = x2 - x1;
    const height = y2 - y1;
    ctx.rect(x1, y1, width, height);
    if (g.shape_fill) ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

export function drawCircle(_e: MouseEvent, ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.lineWidth = g.pen_width;
    ctx.strokeStyle = g.pen_color;
    ctx.fillStyle = g.pen_secondary_color;
    ctx.globalAlpha = g.pen_opacity || 1.0;
    
    const radius = Math.hypot(g.pX - g.startX, g.pY - g.startY);
    ctx.arc(g.startX, g.startY, radius, 0, 2 * Math.PI);
    if (g.shape_fill) ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

export function drawBrush(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const size = g.pen_width;
    const hardness = (g.brush_hardness !== undefined) ? g.brush_hardness : 0.5;
    const color = g.pen_color;
    const flow = (g.brush_flow !== undefined) ? g.brush_flow : 1.0;
    const style = g.brush_style || 'default';

    updateCyclicColor();
    ctx.save();
    ctx.globalAlpha = (g.pen_opacity || 1.0) * flow;

    if (style === 'oil') {
        // Realistic Oil: Simulate bristles with multiple small strokes
        const bristleCount = Math.max(5, Math.floor(size / 3));
        const rgba = hexToRgba(color);
        
        for (let i = 0; i < bristleCount; i++) {
            const offsetX = (Math.random() - 0.5) * size;
            const offsetY = (Math.random() - 0.5) * size;
            const bristleRadius = (Math.random() * 2 + 1) * (size / 20);
            
            // Subtle color variation for each bristle
            const r = Math.min(255, Math.max(0, rgba.r + (Math.random() - 0.5) * 20));
            const g_val = Math.min(255, Math.max(0, rgba.g + (Math.random() - 0.5) * 20));
            const b = Math.min(255, Math.max(0, rgba.b + (Math.random() - 0.5) * 20));
            
            ctx.fillStyle = `rgba(${r}, ${g_val}, ${b}, ${0.4 + Math.random() * 0.4})`;
            ctx.beginPath();
            ctx.arc(x + offsetX, y + offsetY, bristleRadius, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (style === 'leaf') {
        // Nature: Leaf Stamp
        const angle = Math.random() * Math.PI * 2;
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillStyle = color;
        
        const w = size;
        const h = size * 0.6;
        
        ctx.beginPath();
        ctx.moveTo(0, -h/2);
        ctx.bezierCurveTo(w/2, -h/2, w/2, h/2, 0, h/2);
        ctx.bezierCurveTo(-w/2, h/2, -w/2, -h/2, 0, -h/2);
        ctx.fill();
        
        // Leaf vein
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -h/2);
        ctx.lineTo(0, h/2);
        ctx.stroke();
    } else if (style === 'rock') {
        // Nature: Rock Texture
        const sides = 5 + Math.floor(Math.random() * 3);
        const radius = size / 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < sides; i++) {
            const a = (i / sides) * Math.PI * 2;
            const r = radius * (0.7 + Math.random() * 0.3);
            const px = x + Math.cos(a) * r;
            const py = y + Math.sin(a) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        
        // Rock highlight
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(x - radius/3, y - radius/3, radius/4, 0, Math.PI * 2);
        ctx.fill();
    } else if (style === 'charcoal') {
        // Charcoal: Grainy, rough texture with random particles
        const radius = size / 2;
        const particleCount = Math.max(12, Math.floor(size)); // More particles for better coverage
        const rgba = hexToRgba(color);
        
        for (let i = 0; i < particleCount; i++) {
            // Random position within circle (using proper distribution)
            const r = Math.sqrt(Math.random()) * radius;
            const theta = Math.random() * 2 * Math.PI;
            const px = x + r * Math.cos(theta);
            const py = y + r * Math.sin(theta);
            
            // Random grain size
            const pSize = (Math.random() * 2.5 + 0.5) * (size / 20); // Scale grain with brush size
            
            // Random opacity for each grain to create depth
            const pAlpha = 0.05 + Math.random() * 0.35;
            
            ctx.fillStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${pAlpha})`;
            ctx.beginPath();
            ctx.arc(px, py, pSize, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (style === 'meadow') {
        // Nature: Meadow/Grass
        const bladeCount = 3;
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        for (let i = 0; i < bladeCount; i++) {
            const offsetX = (Math.random() - 0.5) * size;
            const height = size * (0.5 + Math.random() * 0.5);
            const lean = (Math.random() - 0.5) * 10;
            
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(x + offsetX, y);
            ctx.quadraticCurveTo(x + offsetX + lean, y - height/2, x + offsetX + lean*2, y - height);
            ctx.stroke();
        }
    } else if (style === 'wood') {
        // Nature: Wood Grain
        const w = size * 1.5;
        const h = size * 0.4;
        ctx.translate(x, y);
        // Rotate slightly based on direction if we had it, but random for now
        ctx.rotate((Math.random() - 0.5) * 0.2);
        
        const rgba = hexToRgba(color);
        ctx.fillStyle = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0.8)`;
        ctx.fillRect(-w/2, -h/2, w, h);
        
        // Grain lines
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
            const gy = (Math.random() - 0.5) * h;
            ctx.beginPath();
            ctx.moveTo(-w/2, gy);
            ctx.bezierCurveTo(-w/4, gy + 2, w/4, gy - 2, w/2, gy);
            ctx.stroke();
        }
    } else {
        // Default Soft Brush
        const radius = size / 2;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        const rgba = hexToRgba(color);
        const centerColor = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 1)`;
        const edgeColor = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, 0)`;

        gradient.addColorStop(0, centerColor);
        if (hardness > 0) {
            gradient.addColorStop(Math.min(0.99, hardness), centerColor);
        }
        gradient.addColorStop(1.0, edgeColor);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

export function drawEraser(ctx: CanvasRenderingContext2D, startX: number, startY: number, endX: number, endY: number): void {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    
    const length = Math.hypot(endX - startX, endY - startY);
    let numSteps = 1;
    if (length >= 1) {
        const spacing = g.pen_width / 4.0; // Tighter spacing for smoother erasing
        numSteps = Math.floor(length / spacing) + 1;
    }
    
    for (let i = 0; i <= numSteps; i++) {
        const t = i / numSteps;
        const currentX = startX * (1.0 - t) + endX * t;
        const currentY = startY * (1.0 - t) + endY * t;
        
        const size = g.pen_width;
        const hardness = (g.brush_hardness !== undefined) ? g.brush_hardness : 0.8;
        const opacity = g.pen_opacity || 1.0;
        
        const radius = size / 2;
        const gradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, radius);
        
        const centerColor = `rgba(0, 0, 0, ${opacity})`;
        const edgeColor = 'rgba(0, 0, 0, 0)';
        
        gradient.addColorStop(0, centerColor);
        if (hardness > 0) {
            gradient.addColorStop(Math.min(0.99, hardness), centerColor);
        }
        gradient.addColorStop(1.0, edgeColor);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(currentX, currentY, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

export function drawRoundedRect(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    const x = Math.min(x1, x2);
    const y = Math.min(y1, y2);
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    
    let radius = g.round_rect_corner_radius || 10;
    if (radius > width / 2) radius = width / 2;
    if (radius > height / 2) radius = height / 2;

    ctx.beginPath();
    ctx.lineWidth = g.pen_width;
    ctx.strokeStyle = g.pen_color;
    ctx.fillStyle = g.pen_secondary_color;
    ctx.globalAlpha = g.pen_opacity || 1.0;
    ctx.lineJoin = g.pen_join || "round";

    if ((ctx as any).roundRect) {
        (ctx as any).roundRect(x, y, width, height, radius);
    } else {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
    }

    ctx.closePath();
    if (g.shape_fill) ctx.fill();
    ctx.stroke();
}

export function drawEllipse(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number): void {
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;
    
    ctx.beginPath();
    ctx.lineWidth = g.pen_width;
    ctx.strokeStyle = g.pen_color;
    ctx.fillStyle = g.pen_secondary_color;
    ctx.globalAlpha = g.pen_opacity || 1.0;
    
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    if (g.shape_fill) ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

// ─── Helpers ──────────────────────────────────────────────

function hexToRgba(hex: string): { r: number, g: number, b: number } {
    let r = 0, g = 0, b = 0;
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    return { r, g, b };
}

// Global exposure for legacy interop
(window as any).updateCyclicColor = updateCyclicColor;
(window as any).drawPen = drawPen;
(window as any).drawLine = drawLine;
(window as any).drawRect = drawRect;
(window as any).drawCircle = drawCircle;
(window as any).drawBrush = drawBrush;
(window as any).drawEraser = drawEraser;
(window as any).drawRoundedRect = drawRoundedRect;
(window as any).drawEllipse = drawEllipse;
