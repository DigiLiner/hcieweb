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

while (offset < buf.length) {
    const nextNewline = buf.indexOf(0x0A, offset);
    if (nextNewline === -1) break;
    const header = buf.subarray(offset, nextNewline).toString().trim();
    if (header.startsWith("512,576")) {
        const binaryLen = parseInt(header.split(',')[3]);
        const payload = buf.subarray(nextNewline + 1, nextNewline + 1 + binaryLen);
        const tileData = new Uint8Array(20000);
        const dLen = decompressLZF(payload.subarray(1), tileData);
        fs.writeFileSync('tile512_raw.bin', tileData.subarray(0, dLen));
        console.log(`Tile 512,576 dumped. Size: ${dLen}`);
        break;
    }
    offset = nextNewline + 1 + parseInt(header.split(',')[3]);
}
