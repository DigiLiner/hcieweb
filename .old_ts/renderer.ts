//region THEMES
// @ts-ignore
document.getElementById('toggle-dark-mode').addEventListener('click', async () => {
    // @ts-ignore
    const isDarkMode = await window["darkMode"].toggle()
    // @ts-ignore
    document.getElementById('theme-source').innerHTML = isDarkMode ? 'Dark' : 'Light'
})

// @ts-ignore
document.getElementById('reset-to-system').addEventListener('click', async () => {
    // @ts-ignore
    await window["darkMode"].system()
    // @ts-ignore
    document.getElementById('theme-source').innerHTML = 'System'
});
//endregion

//region OPEN DIALOG
//@ts-ignore
const btn = document.getElementById('btn-open');
const filePathElement = document.getElementById('filePath');
//@ts-ignore
const api = window.electronAPI;
//@ts-ignore
btn.addEventListener('click', async () => {
    const filePath = await api.openFile(); //defined in preload
    const el = document.getElementById('filePath');
    //@ts-ignore
    el.innerText = filePath;
    g.filepath = filePath;
    openImage(filePath); // In drawing_canvas
})
//endregion

//region SAVE DIALOG
const btnsave = document.getElementById('btn-save');
//@ts-ignore
btnsave.addEventListener('click', async () => {
    const dataURL = getCanvasImageDataURL();
    console.log(dataURL);
    if (dataURL) {
        await api.saveFile(dataURL, g.filepath, false);

    } else {
        console.error('Canvas resmi alınamadı.');
    }
})
//endregion

//region SAVE AS DIALOG
const btnsaveas = document.getElementById('btn-save-as');
//@ts-ignore
btnsaveas.addEventListener('click', async () => {
    const dataURL = getCanvasImageDataURL();
    console.log(dataURL);
    if (dataURL) {
        await api.saveFile(dataURL, g.filepath, true);
    } else {
        console.error('Canvas resmi alınamadı.');
    }
})
//endregion