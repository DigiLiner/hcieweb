/**
 * Theme Manager
 * Handles manual theme toggling and persists the choice in localStorage.
 */

export function setupThemeToggle() {
    const themeBtn = document.getElementById('toggle-dark-mode');
    if (!themeBtn) {
        console.warn('Theme toggle button not found');
        return;
    }

    // Initialize theme based on preference or system
    const savedTheme = localStorage.getItem('hcie-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    } else {
        // Default to automatic (managed by CSS media queries)
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        updateThemeIcon(isDark ? 'dark' : 'light');
    }

    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        let newTheme: string;

        if (currentTheme === 'dark') {
            newTheme = 'light';
        } else if (currentTheme === 'light') {
            newTheme = 'dark';
        } else {
            // If currently automatic, we need to determine what it currently is
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            newTheme = isDark ? 'light' : 'dark';
        }

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('hcie-theme', newTheme);
        updateThemeIcon(newTheme);
        
        console.log(`Theme manually set to: ${newTheme}`);
    });

    // Listen for system theme changes to update icon if in auto mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('hcie-theme')) {
            updateThemeIcon(e.matches ? 'dark' : 'light');
        }
    });

    console.log('[THEME] Toggle initialized');
}

function updateThemeIcon(theme: string) {
    const themeBtn = document.getElementById('toggle-dark-mode');
    if (!themeBtn) return;

    // We can swap text or icon here. Since index.html doesn't have an icon inside the button yet:
    // <button id="toggle-dark-mode" title="Toggle Dark/Light Theme" class="button theme-toggle-btn">
    
    // Let's assume there's an emoji or we can just set the button content if it's empty
    if (theme === 'dark') {
        themeBtn.textContent = '🌙';
    } else {
        themeBtn.textContent = '☀️';
    }
}
