import fs from 'node:fs';
import { createCanvas } from 'canvas';

const buf = fs.readFileSync('/home/hc/Belgeler/00_PROJECTS/Tauri/hcie/layer_binary');
console.log("File loaded. Size:", buf.length);

// LZF Decompressor
function decompressLZF(input, output) {
    let i = 0;
    let j = 0;
    const inputLimit = input.length;
    const outputLimit = output.length;
    
    while (i < inputLimit && j < outputLimit) {
        const ctrl = input[i++];
        if (ctrl < 32) {
            let n = ctrl + 1;
            if (i + n > inputLimit || j + n > outputLimit) break;
            for (let k = 0; k < n; k++) output[j++] = input[i++];
        } else {
            let n = ctrl >> 5;
            let offsetBack = ((ctrl & 0x1f) << 8) + input[i++];
            if (n === 7) n += input[i++];
            n += 2;
            const start = j - offsetBack - 1;
            if (start < 0) {
                j += n;
                continue;
            }
            for (let k = 0; k < n; k++) {
                output[j] = output[start + k];
                j++;
            }
        }
    }
    return j;
}

const width = 1024;
const height = 1024;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');
const imageData = ctx.createImageData(width, height);
const pixels = imageData.data;

const dataMarker = Buffer.from("DATA ");
let dataPos = buf.indexOf(dataMarker);
const newlinePos = buf.indexOf(0x0A, dataPos);
let offset = newlinePos + 1;

while (offset < buf.length) {
    const nextNewline = buf.indexOf(0x0A, offset);
    if (nextNewline === -1) break;
    const header = buf.subarray(offset, nextNewline).toString().trim();
    if (!header) {
        offset = nextNewline + 1;
        continue;
    }
    const [tx, ty, tcomp, tlen] = header.split(',');
    const x = parseInt(tx);
    const y = parseInt(ty);
    const binaryLen = parseInt(tlen);
    const tilePayload = buf.subarray(nextNewline + 1, nextNewline + 1 + binaryLen);

    const planeSize = 64 * 64;
    const tileData = new Uint8Array(planeSize * 4 + 1024); // Extra space just in case

    // Skip flag byte
    let dLen = 0;
    if (tcomp === 'LZF') {
        dLen = decompressLZF(tilePayload.subarray(1), tileData);
    } else {
        tileData.set(tilePayload.subarray(1, Math.min(tilePayload.length, planeSize * 4 + 1)));
        dLen = tilePayload.length - 1;
    }

    // Skip possible internal header
    let skip = 0;
    if (dLen > 16384) {
        skip = dLen - 16384;
    }

    // REVERSE DELTA (Horizontal)
    // For each channel (0, 1, 2, 3), for each row, undo the sum
    for (let channel = 0; channel < 4; channel++) {
        const chanOffset = skip + channel * planeSize;
        for (let row = 0; row < 64; row++) {
            const rowOffset = chanOffset + row * 64;
            let lastVal = 0;
            for (let col = 0; col < 64; col++) {
                const idx = rowOffset + col;
                tileData[idx] = (tileData[idx] + lastVal) & 0xFF;
                lastVal = tileData[idx];
            }
        }
    }

    for (let row = 0; row < 64; row++) {
        for (let col = 0; col < 64; col++) {
            const docX = x + col;
            const docY = y + row;
            if (docX < width && docY < height) {
                const docIdx = (docY * width + docX) * 4;
                const srcIdx = skip + row * 64 + col;
                
                // Try BGR A (Common in Krita RGBA8)
                pixels[docIdx + 0] = tileData[srcIdx + 2 * planeSize]; // R
                pixels[docIdx + 1] = tileData[srcIdx + 1 * planeSize]; // G
                pixels[docIdx + 2] = tileData[srcIdx + 0 * planeSize]; // B
                pixels[docIdx + 3] = tileData[srcIdx + 3 * planeSize]; // A
            }
        }
    }
    offset = nextNewline + 1 + binaryLen;
}

ctx.putImageData(imageData, 0, 0);
const out = fs.createWriteStream('./io-format-tests/krita_solved_final.png');
const stream = canvas.createPNGStream();
stream.pipe(out);
out.on('finish', () => console.log('Final result saved to ./io-format-tests/krita_solved_final.png'));
