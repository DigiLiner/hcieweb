/**
 * ModifierModal: A reusable modal for selection modifications (Feather, Expand, etc.)
 * Provides both a slider and a numeric input for precision.
 */

export function showModifierModal(title, initialValue, min, max, unit, onApply) {
    // Create modal elements
    const overlay = document.createElement('div');
    overlay.id = 'modifier-modal-overlay';
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '20000',
        backdropFilter: 'blur(2px)'
    });

    const modal = document.createElement('div');
    modal.className = 'modifier-modal';
    Object.assign(modal.style, {
        backgroundColor: '#2d2d2d',
        border: '1px solid #444',
        borderRadius: '8px',
        padding: '24px',
        width: '320px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        color: '#eee',
        fontFamily: "'Roboto', sans-serif"
    });

    const h3 = document.createElement('h3');
    h3.textContent = title;
    Object.assign(h3.style, {
        marginTop: '0',
        marginBottom: '20px',
        fontSize: '18px',
        fontWeight: '500'
    });

    const controlGroup = document.createElement('div');
    Object.assign(controlGroup.style, {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        marginBottom: '25px'
    });

    const sliderRow = document.createElement('div');
    Object.assign(sliderRow.style, {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    });

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.value = initialValue;
    Object.assign(slider.style, {
        flex: '1',
        cursor: 'pointer'
    });

    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.min = min;
    numberInput.max = max;
    numberInput.value = initialValue;
    Object.assign(numberInput.style, {
        width: '60px',
        backgroundColor: '#1e1e1e',
        border: '1px solid #555',
        color: '#fff',
        padding: '5px',
        borderRadius: '4px',
        textAlign: 'center'
    });

    const unitSpan = document.createElement('span');
    unitSpan.textContent = unit;
    Object.assign(unitSpan.style, {
        fontSize: '13px',
        color: '#aaa'
    });

    sliderRow.appendChild(slider);
    sliderRow.appendChild(numberInput);
    sliderRow.appendChild(unitSpan);
    controlGroup.appendChild(sliderRow);

    const buttonRow = document.createElement('div');
    Object.assign(buttonRow.style, {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px'
    });

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'İptal';
    Object.assign(cancelBtn.style, {
        backgroundColor: 'transparent',
        border: '1px solid #555',
        color: '#eee',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
    });

    const applyBtn = document.createElement('button');
    applyBtn.textContent = 'Uygula';
    Object.assign(applyBtn.style, {
        backgroundColor: '#0078d7',
        border: 'none',
        color: '#fff',
        padding: '8px 20px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
    });

    buttonRow.appendChild(cancelBtn);
    buttonRow.appendChild(applyBtn);

    modal.appendChild(h3);
    modal.appendChild(controlGroup);
    modal.appendChild(buttonRow);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Sync slider and input
    slider.addEventListener('input', () => {
        numberInput.value = slider.value;
    });

    numberInput.addEventListener('input', () => {
        slider.value = numberInput.value;
    });

    // Button actions
    const close = () => {
        document.body.removeChild(overlay);
    };

    cancelBtn.onclick = close;
    applyBtn.onclick = () => {
        const val = parseInt(numberInput.value);
        if (!isNaN(val)) {
            onApply(val);
        }
        close();
    };

    // Close on escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            close();
            window.removeEventListener('keydown', escHandler);
        }
    };
    window.addEventListener('keydown', escHandler);

    // Initial focus
    numberInput.focus();
    numberInput.select();
}
