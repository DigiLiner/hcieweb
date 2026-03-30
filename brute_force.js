import fs from 'node:fs';
import { createCanvas } from 'canvas';

const buf = fs.readFileSync('/home/hc/Belgeler/00_PROJECTS/Tauri/hcie/layer_binary');
const refBuf = fs.readFileSync('/home/hc/Belgeler/00_PROJECTS/Tauri/hcie/io-format-tests/mergedimage_ref.png');

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
            if (start < 0) { j += n; continue; }
            for (let k = 0; k < n; k++) { output[j] = output[start + k]; j++; }
        }
    }
    return j;
}

const combinations = [
    { name: 'planar_skip0_nodelta', skip: 0, planar: true, delta: false },
    { name: 'planar_skip1_nodelta', skip: 1, planar: true, delta: false },
    { name: 'planar_skip48_nodelta', skip: 48, planar: true, delta: false },
    { name: 'planar_skip1+48_nodelta', skip: 49, planar: true, delta: false },
    { name: 'planar_skip1_hdelta', skip: 1, planar: true, delta: 'h' },
    { name: 'interleaved_skip1_nodelta', skip: 1, planar: false, delta: false },
    { name: 'interleaved_skip1_hdelta', skip: 1, planar: false, delta: 'h' },
    { name: 'interleaved_skip0_hdelta', skip: 0, planar: false, delta: 'h' },
];

const width = 1024;
const height = 1024;

const dataMarker = Buffer.from("DATA ");
let dataPos = buf.indexOf(dataMarker);
const newlinePos = buf.indexOf(0x0A, dataPos);
const baseOffset = newlinePos + 1;

for (const combo of combinations) {
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    const pixels = imageData.data;
    const planeSize = 64 * 64;

    let offset = baseOffset;
    while (offset < buf.length) {
        const nextNewline = buf.indexOf(0x0A, offset);
        if (nextNewline === -1) break;
        const header = buf.subarray(offset, nextNewline).toString().trim();
        const parts = header.split(',');
        const x = parseInt(parts[0]);
        const y = parseInt(parts[1]);
        const tlen = parseInt(parts[3]);
        const tilePayload = buf.subarray(nextNewline + 1, nextNewline + 1 + tlen);

        const tileData = new Uint8Array(20000);
        const dLen = decompressLZF(tilePayload.subarray(combo.skip), tileData);

        if (combo.delta === 'h') {
          if (combo.planar) {
            for (let c = 0; c < 4; c++) {
              for (let row = 0; row < 64; row++) {
                let last = 0;
                for (let col = 0; col < 64; col++) {
                  const idx = c * planeSize + row * 64 + col;
                  tileData[idx] = (tileData[idx] + last) & 0xFF;
                  last = tileData[idx];
                }
              }
            }
          } else {
            for (let row = 0; row < 64; row++) {
              for (let col = 0; col < 64; col++) {
                const idx = (row * 64 + col) * 4;
                const prevIdx = idx - 4;
                if (col > 0) {
                  for (let c = 0; c < 4; c++) tileData[idx+c] = (tileData[idx+c] + tileData[prevIdx+c]) & 0xFF;
                }
              }
            }
          }
        }

        for (let row = 0; row < 64; row++) {
            for (let col = 0; col < 64; col++) {
                const docIdx = ((y + row) * width + (x + col)) * 4;
                const srcIdx = row * 64 + col;
                if (combo.planar) {
                  pixels[docIdx + 0] = tileData[srcIdx + 2 * planeSize]; // R
                  pixels[docIdx + 1] = tileData[srcIdx + 1 * planeSize]; // G
                  pixels[docIdx + 2] = tileData[srcIdx + 0 * planeSize]; // B
                  pixels[docIdx + 3] = tileData[srcIdx + 3 * planeSize]; // A
                } else {
                  pixels[docIdx + 0] = tileData[srcIdx * 4 + 2]; // BGR to RGB? or RGB?
                  pixels[docIdx + 1] = tileData[srcIdx * 4 + 1];
                  pixels[docIdx + 2] = tileData[srcIdx * 4 + 0];
                  pixels[docIdx + 3] = tileData[srcIdx * 4 + 3];
                }
            }
        }
        offset = nextNewline + 1 + tlen;
    }
    ctx.putImageData(imageData, 0, 0);
    const outName = `./io-format-tests/test_${combo.name}.png`;
    const out = fs.createWriteStream(outName);
    canvas.createPNGStream().pipe(out);
    console.log(`Saved ${outName}`);
}
