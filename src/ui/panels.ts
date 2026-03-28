import { g, Tool } from '../core/globals';


/**
 * Panel System - Collapsible/Resizable Panels
 * Photopea-style right sidebar
 */

export class Panel {
    panelId: string;
    element: HTMLElement | null;
    collapsed: boolean;
    height: number;
    activeTab: string | null = null;

    constructor(panelId: string) {
        this.panelId = panelId;
        this.element = document.getElementById(panelId);
        if (!this.element) {
            console.warn(`Panel ${panelId} not found`);
            this.collapsed = false;
            this.height = 300;
            return;
        }

        this.collapsed = localStorage.getItem(`panel-${panelId}-collapsed`) === 'true';
        this.height = parseInt(localStorage.getItem(`panel-${panelId}-height`) || '300') || 300;
        this.activeTab = localStorage.getItem(`panel-${panelId}-tab`) || null;

        this.init();
    }

    init() {
        if (!this.element) return;
        // Set initial state
        if (this.collapsed) {
            this.element.classList.remove('expanded');
        } else {
            this.element.classList.add('expanded');
            if (this.height) {
                this.element.style.flexBasis = this.height + 'px';
            }
        }

        // Initialize tabs
        this.initTabs();

        // Initialize collapse button
        const collapseBtn = this.element.querySelector('.panel-collapse-btn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => this.toggle());
            this.updateCollapseIcon();
        }

        // Initialize resize handle
        const resizeHandle = this.element.querySelector('.panel-resize');
        if (resizeHandle) {
            this.initResize(resizeHandle as HTMLElement);
        }
    }

    initTabs() {
        if (!this.element) return;
        const tabs = this.element.querySelectorAll('.panel-tab') as NodeListOf<HTMLElement>;
        const panes = this.element.querySelectorAll('.panel-pane') as NodeListOf<HTMLElement>;

        if (tabs.length === 0) return;

        // Clear all active classes first to prevent content doubling from HTML
        tabs.forEach(tab => tab.classList.remove('active'));
        panes.forEach(pane => pane.classList.remove('active'));

        // Set active tab
        let activeTabFound = false;
        tabs.forEach((tab, index) => {
            const tabName = tab.dataset.tab;

            tab.addEventListener('click', () => {
                if (tabName) this.switchTab(tabName);
            });

            if (this.activeTab === tabName || (!activeTabFound && index === 0)) {
                tab.classList.add('active');
                if (panes[index]) panes[index].classList.add('active');
                activeTabFound = true;
            }
        });
    }

    switchTab(tabName: string) {
        if (!this.element) return;
        const tabs = this.element.querySelectorAll('.panel-tab') as NodeListOf<HTMLElement>;
        const panes = this.element.querySelectorAll('.panel-pane') as NodeListOf<HTMLElement>;

        tabs.forEach((tab, index) => {
            if (tab.dataset.tab === tabName) {
                tab.classList.add('active');
                if (panes[index]) panes[index].classList.add('active');
            } else {
                tab.classList.remove('active');
                if (panes[index]) panes[index].classList.remove('active');
            }
        });

        this.activeTab = tabName;
        localStorage.setItem(`panel-${this.panelId}-tab`, tabName);
    }

    toggle() {
        if (!this.element) return;
        this.collapsed = !this.collapsed;

        if (this.collapsed) {
            this.element.classList.remove('expanded');
        } else {
            this.element.classList.add('expanded');
        }

        this.updateCollapseIcon();
        localStorage.setItem(`panel-${this.panelId}-collapsed`, this.collapsed.toString());
    }

    updateCollapseIcon() {
        if (!this.element) return;
        const btn = this.element.querySelector('.panel-collapse-btn');
        if (btn) {
            btn.textContent = this.collapsed ? '▲' : '▼';
        }
    }

    initResize(handle: HTMLElement) {
        let startY = 0;
        let startHeight = 0;

        const onMouseDown = (e: MouseEvent) => {
            startY = e.clientY;
            startHeight = this.element?.offsetHeight || 0;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            e.preventDefault();
        };

        const onMouseMove = (e: MouseEvent) => {
            const deltaY = e.clientY - startY;
            const newHeight = Math.max(40, startHeight + deltaY);

            if (this.element) {
                this.element.style.flexBasis = newHeight + 'px';
            }
            this.height = newHeight;
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            localStorage.setItem(`panel-${this.panelId}-height`, this.height.toString());
        };

        handle.addEventListener('mousedown', onMouseDown);
    }
}

// Initialize panels when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    const panelIds = ['historyPanel', 'propertiesPanel', 'layersPanel'];

    panelIds.forEach(id => {
        const panelElement = document.getElementById(id);
        if (panelElement) {
            new Panel(id);
        }
    });

    console.log('Panel system initialized');
});

// TEMPORARY WINDOW BINDINGS
if (typeof window !== 'undefined') {
  (window as any).Panel = Panel;
}
