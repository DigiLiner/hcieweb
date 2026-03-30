import fs from 'node:fs';

const buf = fs.readFileSync('/home/hc/Belgeler/00_PROJECTS/Tauri/hcie/layer_binary');
console.log("File loaded. Size:", buf.length);

// 1. Identify format
const signature = Buffer.from("VERSION 2");
if (!buf.subarray(0, 9).equals(signature)) {
    console.log("Not VERSION 2");
    process.exit(1);
}

const dataMarker = Buffer.from("DATA ");
let dataPos = buf.indexOf(dataMarker);
if (dataPos === -1) {
    console.log("DATA marker not found.");
    process.exit(1);
}

// Find newline after DATA
const newlinePos = buf.indexOf(0x0A, dataPos);
let offset = newlinePos + 1;

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
                // Garbage or invalid reference
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


// Reconstruct 1 tile
function processTile(x, y, compression, length, payload) {
    const planeSize = 64 * 64;
    const pixelSize = 4;
    const tileData = new Uint8Array(planeSize * pixelSize);

    let decompressedLen = 0;
    if (compression === 'LZF') {
        decompressedLen = decompressLZF(payload, tileData);
    } else {
        tileData.set(payload.subarray(0, planeSize * pixelSize));
        decompressedLen = payload.length;
    }
    
    if (x === 0 && y === 0) {
        console.log(`Tile 0,0 decompressed size: ${decompressedLen} bytes`);
        console.log("Tile 0,0 first 64 bytes (internal header?):", Array.from(tileData.subarray(0, 64)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    }

    // Skip 48-byte KisTileData header if present
    let dataOffsetInsideTile = 0;
    if (decompressedLen > 16384) {
        dataOffsetInsideTile = decompressedLen - 16384;
    }

    // Reconstruct: Planar BGR A (Skipping header)
    const pixels = new Uint8Array(planeSize * 4);
    for (let i = 0; i < planeSize; i++) {
        const srcIdx = dataOffsetInsideTile + i;
        pixels[i*4 + 0] = tileData[srcIdx + 2 * planeSize]; // R
        pixels[i*4 + 1] = tileData[srcIdx + 1 * planeSize]; // G
        pixels[i*4 + 2] = tileData[srcIdx + 0 * planeSize]; // B
        pixels[i*4 + 3] = tileData[srcIdx + 3 * planeSize]; // A
    }
    return pixels;
}



// Global Reconstruction
const width = 1024;
const height = 1024;
const finalImage = new Uint8Array(width * height * 4);

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
    const payload = buf.subarray(nextNewline + 1, nextNewline + 1 + binaryLen);

    const tilePixels = processTile(x, y, tcomp, binaryLen, payload);

    // Copy to final image
    for (let row = 0; row < 64; row++) {
        for (let col = 0; col < 64; col++) {
            const docX = x + col;
            const docY = y + row;
            if (docX < width && docY < height) {
                const docIdx = (docY * width + docX) * 4;
                const tileIdx = (row * 64 + col) * 4;
                finalImage[docIdx] = tilePixels[tileIdx];
                finalImage[docIdx + 1] = tilePixels[tileIdx + 1];
                finalImage[docIdx + 2] = tilePixels[tileIdx + 2];
                finalImage[docIdx + 3] = tilePixels[tileIdx + 3];
            }
        }
    }
    offset = nextNewline + 1 + binaryLen;
}

// Save as raw RGBA for comparison or PPM
// Let's save as PPM (Binary P6) - only RGB, ignoring alpha for easy viewing
const ppmHeader = `P6\n${width} ${height}\n255\n`;
const ppmData = Buffer.alloc(width * height * 3);
for (let i = 0; i < width * height; i++) {
    ppmData[i*3 + 0] = finalImage[i*4 + 0];
    ppmData[i*3 + 1] = finalImage[i*4 + 1];
    ppmData[i*3 + 2] = finalImage[i*4 + 2];
}
fs.writeFileSync('./io-format-tests/krita_solved.ppm', Buffer.concat([Buffer.from(ppmHeader), ppmData]));
console.log("PPM result saved to ./io-format-tests/krita_solved.ppm");
