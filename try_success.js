import fs from 'node:fs';
import { createCanvas } from 'canvas';

const buf = fs.readFileSync('/home/hc/Belgeler/00_PROJECTS/Tauri/hcie/layer_binary');

function decompressLZF(input, output) {
    let i = 0, j = 0;
    while (i < input.length && j < output.length) {
        const ctrl = input[i++];
        if (ctrl < 32) {
            let n = ctrl + 1;
            for (let k = 0; k < n; k++) output[j++] = input[i++];
        } else {
            let n = ctrl >> 5;
            let offsetBack = ((ctrl & 0x1f) << 8) + input[i++];
            if (n === 7) n += input[i++];
            n += 2;
            const start = j - offsetBack - 1;
            for (let k = 0; k < n; k++) { output[j] = output[start + k]; j++; }
        }
    }
    return j;
}

const width = 1024, height = 1024;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
const imageData = ctx.createImageData(width, height);
const pixels = imageData.data;
const planeSize = 64 * 64;

let offset = buf.indexOf(Buffer.from("DATA ")) + 5;
offset = buf.indexOf(0x0A, offset) + 1;

while (offset < buf.length) {
    const nextNewline = buf.indexOf(0x0A, offset);
    if (nextNewline === -1) break;
    const header = buf.subarray(offset, nextNewline).toString().trim();
    const parts = header.split(',');
    const x = parseInt(parts[0]), y = parseInt(parts[1]), tlen = parseInt(parts[3]);
    const tilePayload = buf.subarray(nextNewline + 1, nextNewline + 1 + tlen);

    const tileData = new Uint8Array(30000);
    const dLen = decompressLZF(tilePayload.subarray(1), tileData);

    // TRY WITHOUT SKIP, PLANAR DELTA
    for (let c = 0; c < 4; c++) {
        const start = c * planeSize;
        for (let i = 1; i < planeSize; i++) {
            tileData[start + i] = (tileData[start + i] + tileData[start + i - 1]) & 0xFF;
        }
    }

    for (let row = 0; row < 64; row++) {
        for (let col = 0; col < 64; col++) {
            const dy = y + row, dx = x + col;
            if (dx < width && dy < height) {
                const docIdx = (dy * width + dx) * 4;
                const srcIdx = row * 64 + col;
                // Using ARGB or BGRA? Let's check with BGR A
                pixels[docIdx + 0] = tileData[srcIdx + 2 * planeSize]; // R
                pixels[docIdx + 1] = tileData[srcIdx + 1 * planeSize]; // G
                pixels[docIdx + 2] = tileData[srcIdx + 0 * planeSize]; // B
                pixels[docIdx + 3] = tileData[srcIdx + 3 * planeSize]; // A
            }
        }
    }
    offset = nextNewline + 1 + tlen;
}

ctx.putImageData(imageData, 0, 0);
canvas.createPNGStream().pipe(fs.createWriteStream('./io-format-tests/krita_success_potential.png')).on('finish', () => {
    console.log("Image saved to krita_success_potential.png");
});
