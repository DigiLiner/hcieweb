import fs from 'node:fs';

const buf = fs.readFileSync('/home/hc/Belgeler/00_PROJECTS/Tauri/hcie/layer_binary');

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

const dataMarker = Buffer.from("DATA ");
let dataPos = buf.indexOf(dataMarker);
const newlinePos = buf.indexOf(0x0A, dataPos);
let offset = newlinePos + 1;

// Tile (0,0) might not be first? Data search:
let found = false;
while (offset < buf.length) {
    const nextNewline = buf.indexOf(0x0A, offset);
    if (nextNewline === -1) break;
    const header = buf.subarray(offset, nextNewline).toString().trim();
    const [tx, ty, tcomp, tlen] = header.split(',');
    if (tx === '0' && ty === '0') {
        const binaryLen = parseInt(tlen);
        const payload = buf.subarray(nextNewline + 1, nextNewline + 1 + binaryLen);
        const tileData = new Uint8Array(20000); // Plenty
        // TRY WITH FLAG SKIP
        const dLen = decompressLZF(payload.subarray(1), tileData);
        fs.writeFileSync('tile00_raw.bin', tileData.subarray(0, dLen));
        console.log(`Tile 0,0 dumped. Size: ${dLen}`);
        found = true;
        break;
    }
    offset = nextNewline + 1 + parseInt(tlen);
}
if (!found) console.log("Tile 0,0 not found.");
