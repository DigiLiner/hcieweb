/**
 * Tooltip Manager
 * Handles floating warnings and tooltips that follow the mouse.
 */

class TooltipManager {
    private tooltip: HTMLDivElement | null = null;
    private timeoutId: any = null;

    constructor() {
        this.init();
    }

    private init() {
        if (typeof document === 'undefined') return;
        
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'hcie-floating-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            pointer-events: none;
            z-index: 10000;
            background: rgba(220, 53, 69, 0.95);
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: none;
            white-space: nowrap;
            transition: opacity 0.2s;
            transform: translate(15px, 15px);
        `;
        document.body.appendChild(this.tooltip);

        window.addEventListener('mousemove', (e) => {
            if (this.tooltip && this.tooltip.style.display === 'block') {
                this.tooltip.style.left = e.clientX + 'px';
                this.tooltip.style.top = e.clientY + 'px';
            }
        });
    }

    public showWarning(message: string, duration: number = 2000) {
        if (!this.tooltip) return;

        this.tooltip.innerText = message;
        this.tooltip.style.display = 'block';
        this.tooltip.style.opacity = '1';

        if (this.timeoutId) clearTimeout(this.timeoutId);
        
        this.timeoutId = setTimeout(() => {
            this.tooltip!.style.opacity = '0';
            setTimeout(() => {
                this.tooltip!.style.display = 'none';
            }, 200);
        }, duration);
    }
}

export const tooltipManager = new TooltipManager();
(window as any).tooltipManager = tooltipManager;
