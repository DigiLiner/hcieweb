import fs from 'node:fs';

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

const dataMarker = Buffer.from("DATA ");
let offset = buf.indexOf(dataMarker) + 5;
offset = buf.indexOf(0x0A, offset) + 1;

let targetTilePayload = null;
while (offset < buf.length) {
    const nextNewline = buf.indexOf(0x0A, offset);
    if (nextNewline === -1) break;
    const header = buf.subarray(offset, nextNewline).toString().trim();
    const parts = header.split(',');
    if (parts[0] === '512' && parts[1] === '576') {
        targetTilePayload = buf.subarray(nextNewline + 1, nextNewline + 1 + parseInt(parts[3]));
        break;
    }
    offset = nextNewline + 1 + parseInt(parts[3]);
}

if (!targetTilePayload) { console.log("Tile 512,576 not found"); process.exit(1); }

const tileWidth = 64, tileHeight = 64, planeSize = 4096;
const rawTileData = new Uint8Array(30000);
const dLen = decompressLZF(targetTilePayload.subarray(1), rawTileData);

console.log(`Decompressed size: ${dLen}`);

// BRUTE FORCE PARAMETERS
const skips = [0, 48, 320, dLen - 16384];
const deltas = ['none', 'planar_h', 'interleaved_4_h'];
const orders = [
    [0,1,2,3], [2,1,0,3], [3,0,1,2], [3,2,1,0] // RGBA, BGRA, ARGB, ABGR
];

for (const skip of skips) {
    for (const delta of deltas) {
        for (const order of orders) {
            const data = new Uint8Array(rawTileData.subarray(0, dLen));
            
            // Apply delta
            if (delta === 'planar_h') {
                for (let c = 0; c < 4; c++) {
                    const start = skip + c * planeSize;
                    for (let i = 1; i < planeSize; i++) data[start + i] = (data[start + i] + data[start + i - 1]) & 0xFF;
                }
            } else if (delta === 'interleaved_4_h') {
                for (let i = 4; i < 16384; i++) data[skip + i] = (data[skip + i] + data[skip + i - 4]) & 0xFF;
            }

            // Test pixel 32,32 in tile (center of tile)
            const ty = 32, tx = 32, pi = ty * 64 + tx;
            let pR, pG, pB, pA;
            
            // Assume Planar
            pB = data[skip + pi + order[0] * planeSize];
            pG = data[skip + pi + order[1] * planeSize];
            pR = data[skip + pi + order[2] * planeSize];
            pA = data[skip + pi + order[3] * planeSize];

            if (pR === 255 && pG === 255 && pB === 255 && pA === 255) {
                console.log(`MATCH! Skip: ${skip}, Delta: ${delta}, Order Index: ${order}, Values: ${pR} ${pG} ${pB} ${pA}`);
            }
        }
    }
}
