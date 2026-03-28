
const colorBoxCanvas = document.getElementById('colorBoxCanvas') as HTMLCanvasElement   ;
if (!colorBoxCanvas) {
    console.error('ColorBox canvas not found');
   }
const colorBoxCtx = colorBoxCanvas.getContext('2d') as CanvasRenderingContext2D;

const colors =[ // Standard HCIE colors
 '#FFFFFF', '#FFC0C0', "#FFE0C0", "#FFFFC0",
 "#E0E0E0", "#FF8080", "#FFC080", "#FFFF80",
 "#C0C0C0", "#FF0000", "#FF8000", "#FFFF00",
 "#808080", "#C00000", "#C04000", "#C0C000",
 "#404040", "#800000", "#804000", "#808000",
 "#000000", "#400000", "#646464", "#404000",

 "#C0FFC0", "#C0FFFF", "#D3D5F5", "#FFC0FF",
 "#80FF80", "#80FFFF", "#AAAEEB", "#FF80FF",
 "#00FF00", "#00FFFF", "#8389E0", "#FF00FF",
 "#00C000", "#00C0C0", "#232B99", "#C000C0",
 "#008000", "#008080", "#101566", "#800080",
 "#004000", "#004040", "#04051A", "#400040",
  ]


function drawColorBoxes() {
    const colorWidth = 21
    const colorHeight = 25

    for (let i =0 ;i<12;i++) {
        for (let j=0 ; j<4;j++) {              
            colorBoxCtx.fillStyle = colors[i * 4 + j];
            colorBoxCtx.fillRect(j * colorWidth, i * colorHeight, colorWidth, colorHeight);
            colorBoxCtx.strokeStyle = "#404040"
            colorBoxCtx.strokeRect(j * colorWidth, i * colorHeight, colorWidth, colorHeight);
    
        }
    }
}


colorBoxCanvas.addEventListener('click', (e) => {
    const x = e.offsetX;
    const y = e.offsetY;
    const pixel = colorBoxCtx.getImageData(x, y, 1, 1).data;
    const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    g.pen_color = color;
    console.log(`Selected color: ${color}`);
});

function degreesToRadians(degrees: number) {
    return degrees * (Math.PI / 180);
}

function drawColorWheel(canvas: HTMLCanvasElement | null, size = 150) {
    if (!canvas) {
        console.error('Color wheel canvas not found');
        return;
    }
    const context = canvas.getContext('2d');
    if (!context) {
        console.error('Color wheel context not found');
        return;
    }
    canvas.width = size;
    canvas.height = size;

    const centerColor = 'white';

    // Initiate variables
    let angle = 0;
    const hexCode = [0, 0, 255];
    let pivotPointer = 0;
    const colorOffsetByDegree = 4.322;
    const radius = size / 2;

    // For each degree in circle, perform operation
    while (angle < 360) {
        // find index immediately before and after our pivot
        const pivotPointerbefore = (pivotPointer + 3 - 1) % 3;

        // Modify colors
        if (hexCode[pivotPointer] < 255) {
            // If main points isn't full, add to main pointer
            hexCode[pivotPointer] =
                hexCode[pivotPointer] + colorOffsetByDegree > 255 ?
                    255 :
                    hexCode[pivotPointer] + colorOffsetByDegree;
        } else if (hexCode[pivotPointerbefore] > 0) {
            // If color before main isn't zero, subtract
            hexCode[pivotPointerbefore] =
                hexCode[pivotPointerbefore] > colorOffsetByDegree ?
                    hexCode[pivotPointerbefore] - colorOffsetByDegree :
                    0;
        } else if (hexCode[pivotPointer] >= 255) {
            // If main color is full, move pivot
            hexCode[pivotPointer] = 255;
            pivotPointer = (pivotPointer + 1) % 3;
        }

        const rgb = `rgb(${hexCode.map(h => Math.floor(h)).join(',')})`;
        const grad = context.createRadialGradient(
            radius,
            radius,
            0,
            radius,
            radius,
            radius
        );
        grad.addColorStop(0, centerColor);
        grad.addColorStop(1, rgb);
        context.fillStyle = grad;

        // draw circle portion
        context.globalCompositeOperation = 'source-over';
        context.beginPath();
        context.moveTo(radius, radius);
        context.arc(
            radius,
            radius,
            radius,
            degreesToRadians(angle),
            degreesToRadians(360)
        );
        context.closePath();
        context.fill();
        angle++;
    }
}

//todo: add color wheel / color picker selective option in global.ts

drawColorBoxes();
//drawColorWheel(colorBoxCanvas, 50);