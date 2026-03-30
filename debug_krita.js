import fs from 'node:fs';

const buf = fs.readFileSync('/home/hc/Belgeler/00_PROJECTS/Tauri/hcie/layer_binary');
console.log("File loaded. Size:", buf.length);

// VERSION 2 is at offset 0
const layerData = buf;
const signature = Buffer.from("VERSION 2");
if (!layerData.subarray(0, 9).equals(signature)) {
    console.log("File does not start with VERSION 2 signature.");
    process.exit(1);
}

const dataMarker = Buffer.from("DATA ");
let dataPos = layerData.indexOf(dataMarker);
if (dataPos === -1) {
    console.log("DATA marker not found.");
    process.exit(1);
}

// Find newline after DATA
let newlinePos = layerData.indexOf(0x0A, dataPos);
let offset = newlinePos + 1;

function decompressLZF(input, startOffset, outputBuffer, outputOffset) {
    let i = startOffset;
    let j = outputOffset;
    const outputLimit = outputBuffer.length; // No per-plane limit
    while (i < input.length && j < outputLimit) {
        const ctrl = input[i++];
        if (ctrl < 32) {
            let n = ctrl + 1;
            for (let k = 0; k < n; k++) outputBuffer[j++] = input[i++];
        } else {
            let n = ctrl >> 5;
            let offsetBack = ((ctrl & 0x1f) << 8) + input[i++];
            if (n === 7) n += input[i++];
            n += 2;
            const start = j - offsetBack - 1;
            for (let k = 0; k < n; k++) outputBuffer[j++] = outputBuffer[start + k];
        }
    }
    return [i, j - outputOffset]; // Return [newInputIdx, bytesDecompressed]
}

// Diagnostic: Scan all tiles to find colors
console.log("Scanning tiles for primary color verification...");
let currentOffset = offset;
while (currentOffset < layerData.length) {
    const nextNewline = layerData.indexOf(0x0A, currentOffset);
    if (nextNewline === -1) break;
    const header = layerData.subarray(currentOffset, nextNewline).toString().trim();
    const [tx, ty, tcomp, tlen] = header.split(',');
    const binaryLen = parseInt(tlen);

    const block = layerData.subarray(nextNewline + 1, nextNewline + 1 + binaryLen);
    const dec = new Uint8Array(16384);
    decompressLZF(block, 0, dec, 0);
    
    // Interleaved Delta Undo
    for (let ty = 0; ty < 64; ty++) {
        const rowStart = ty * 64 * 4;
        for (let tx = 1; tx < 64; tx++) {
            for (let c = 0; c < 4; c++) {
                const idx = rowStart + (tx * 4) + c;
                dec[idx] = (dec[idx] + dec[idx - 4]) & 0xFF;
            }
        }
    }

    if (tx === "512" && ty === "576") {
        console.log(`\n--- Tile ${tx},${ty} (White Quadrant Check) ---`);
        console.log(`Pixel 32,32 (RGBA?): ${dec[32*64*4 + 32*4]} ${dec[32*64*4 + 32*4 + 1]} ${dec[32*64*4 + 32*4 + 2]} ${dec[32*64*4 + 32*4 + 3]}`);
    }
    
    currentOffset = nextNewline + 1 + binaryLen;
}

process.exit(0);
