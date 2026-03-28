

/**
 * Sets up listeners for custom window controls (minimize, maximize, close).
 * These buttons are integrated into the application menu bar.
 */
export async function setupWindowControls() {
    // Run after DOM is fully loaded
    const init = async () => {
        try {
            const hasTauri = !!(window as any).__TAURI__;
            
            const minBtn = document.getElementById('window-minimize');
            const maxBtn = document.getElementById('window-maximize');
            const closeBtn = document.getElementById('window-close');
            const controls = document.querySelector('.window-controls');

            if (!hasTauri) {
                console.log("[WINDOW CONTROLS] Web Mode: Hiding window controls.");
                if (controls) (controls as HTMLElement).style.display = 'none';
                return;
            }

            const { getCurrentWindow } = await import('@tauri-apps/api/window');
            const appWindow = getCurrentWindow();

            console.log("[WINDOW CONTROLS] Buttons found:", {
                minimize: !!minBtn,
                maximize: !!maxBtn,
                close: !!closeBtn
            });

            if (minBtn) {
                minBtn.onclick = async () => {
                    await appWindow.minimize();
                };
            }

            if (maxBtn) {
                maxBtn.onclick = async () => {
                    await appWindow.toggleMaximize();
                };
            }

            if (closeBtn) {
                closeBtn.onclick = async () => {
                    await appWindow.close();
                };
            }

            const updateIcon = async () => {
                const isMaximized = await appWindow.isMaximized();
                updateMaximizeIcon(isMaximized);
            };

            await updateIcon();
            appWindow.onResized(updateIcon);

        } catch (error) {
            console.error("[WINDOW CONTROLS] Error:", error);
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}

function updateMaximizeIcon(isMaximized: boolean) {
    const maxBtn = document.getElementById('window-maximize');
    if (!maxBtn) return;

    if (isMaximized) {
        // Restore icon (double square)
        maxBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2.1,0v2H0v8h8V7.9h2V0H2.1z M7,9H1V3h6V9z M9,7H8V3H3V1h6V7z" fill="currentColor"/></svg>`;
        maxBtn.title = "Restore";
    } else {
        // Maximize icon (single square)
        maxBtn.innerHTML = `<svg width="10" height="10" viewBox="0 0 10 10"><path d="M0,0v10h10V0H0z M9,9H1V1h8V9z" fill="currentColor"/></svg>`;
        maxBtn.title = "Maximize";
    }
}
