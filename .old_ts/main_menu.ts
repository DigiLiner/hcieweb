// @ts-ignore

import electron, {app, Menu} from "electron";

import path from "path";

const isMac = process.platform === 'darwin'


const mainMenuTemplate =
    [
        // { role: 'appMenu' }
        ...(isMac
            ? [{
                label: app.name,
                submenu: [
                    {role: 'about'},
                    {type: 'separator'},
                    {role: 'services'},
                    {type: 'separator'},
                    {role: 'hide'},
                    {role: 'hideOthers'},
                    {role: 'unhide'},
                    {type: 'separator'},
                    {role: 'quit'}
                ]
            }]
            : []),
        // { role: 'fileMenu' }
        {
            label: 'File',
            submenu: [
                {
                    label: 'New',
                    icon: path.join(__dirname, '/toolbar_images/open-gray_32x32.png'),
                    click() {
                        console.log('New File');
                    }
                },
                {
                    label: 'Open',
                    click() {
                        electron.dialog.showOpenDialog({
                            properties: ['openFile']
                        }).then((result: any) => {
                            if (!result.canceled) {
                                console.log(result.filePaths);

                            }
                        }).catch((err: any) => {
                            console.log(err);
                        });
                    },
                },
                {
                    label: 'Close',
                    click() {
                        console.log('Close');
                    }
                },
                {
                    label: 'Save',
                    click() {
                        console.log('Save');
                    }
                },
                {
                    label: 'Save As',
                    click() {
                        console.log('Save As');
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Print',
                    click() {
                        console.log('Print');
                    }
                },
                isMac ? {role: 'close'} : {role: 'quit'}
            ]
        },
        // { role: 'editMenu' }
        {
            label: 'Edit',
            submenu: [
                {role: 'undo'},
                {role: 'redo'},
                {type: 'separator'},
                {role: 'cut'},
                {role: 'copy'},
                {role: 'paste'},
                ...(isMac
                    ? [
                        {role: 'pasteAndMatchStyle'},
                        {role: 'delete'},
                        {role: 'selectAll'},
                        {type: 'separator'},
                        {
                            label: 'Speech',
                            submenu: [
                                {role: 'startSpeaking'},
                                {role: 'stopSpeaking'}
                            ]
                        }
                    ]
                    : [
                        {role: 'delete'},
                        {type: 'separator'},
                        {role: 'selectAll'}
                    ])
            ]
        },
        // { role: 'viewMenu' }
        {
            label: 'View',
            submenu: [
                {role: 'reload'},
                {role: 'forceReload'},
                {role: 'toggleDevTools'},
                {type: 'separator'},
                {role: 'resetZoom'},
                {role: 'zoomIn'},
                {role: 'zoomOut'},
                {type: 'separator'},
                {role: 'togglefullscreen'}
            ]
        },
        // { role: 'imageMenu' }
        {
            label: 'Image',
            submenu: [
                {label: 'Flip Horizontal'},
                {label: 'Flip Vertical'},
                {label: 'Negative'},
                {label: 'Grayscale'},
                {label: 'Sepia'},
                {label: 'Color Invert'},
                {label: 'Rotate'},
                {label: 'Crop'},
                {label: 'Resize Image'},
                {label: 'Resize Canvas'},
                {label: 'Attributes'},
                {type: 'separator'},
                {label: 'Image Info'},
                {label: 'Image Histogram'},
                {label: 'Image Smoothing'},
                {label: 'Image Filters'},
                {label: 'Image Effects'},
                {label: 'Image Adjustments'},
                {label: 'Image Masking'},
                {label: 'Image Composition'},
                {label: 'Image Layers'},
                {label: 'Image Compositing'}
            ]

        },
        // { role: 'toolsMenu' }
        {
            label: 'Tools',
            submenu: [
                {label: 'Draw Pen'},
                {label: 'Draw Line'},
                {label: 'Draw Rectangle'},
                {label: 'Draw Ellipse'},
                {label: 'Draw Polygon'},
                {label: 'Draw Bezier'},
                {label: 'Draw Text'},
                {label: 'Draw Arrow'},
                {label: 'Draw Marker'},
                {label: 'Draw Path'}
            ]
        },
        // role: filterMenu
        {
            label: 'Filter',
            submenu: [
                {label: 'Soften'},

                {label: 'Blur'},
                {label: 'Sharpen'},
                {label: 'Emboss'},
                {label: 'Edge Detect'},
                {label: 'Find Edges'},
                {label: 'Enhance'},
                {label: 'High Pass'},
                {label: 'Add Noise'},
                {label: 'Mosaic'},
                {label: 'Moderate'},
                {label: 'Oil Paint'},
                {label: 'Border'},
                {label: 'Frame'},
                {label: 'Black White'},
                {label: 'Grayscale'},
                {label: 'Posterize'},
                {label: 'Solarize'},
                {label: 'Soft'},
                {label: 'Soft Light'},
                {label: 'Vignette'},
                {label: 'Sepia'},
                {label: 'Emboss'}

            ]
        },
        // { role: 'windowMenu' }
        {
            label: 'Window',
            submenu: [
                {role: 'minimize'},
                {role: 'zoom'},
                ...(isMac
                    ? [
                        {type: 'separator'},
                        {role: 'front'},
                        {type: 'separator'},
                        {role: 'window'}
                    ]
                    : [
                        {role: 'close'}
                    ])
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: async () => {
                        const {shell} = require('electron')
                        await shell.openExternal('https://electronjs.org')
                    }
                }
            ]
        }
    ];


export default mainMenuTemplate;
//if (isMac) {
//    mainMenuTemplate.unshift();
//}