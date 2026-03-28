function applySepiaEffect(zoomCtx: CanvasRenderingContext2D | null) {
  if (zoomCtx === null) {
    return false;
  }
  const imageData = zoomCtx.getImageData(
    0,
    0,
    zoomCtx.canvas.width,
    zoomCtx.canvas.height
  );
  let data: Uint8ClampedArray<ArrayBuffer> = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    data[i] = r * 0.393 + g * 0.769 + b * 0.189; // Red
    data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168; // Green
    data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131; // Blue
  }

  zoomCtx.putImageData(imageData, 0, 0);
}

function applyBlurEffect() {
  const zoomCanvas = document.getElementById("zoomCanvas") as HTMLCanvasElement;
  if (zoomCanvas === null) {
    return false;
  }
  const zoomCtx = zoomCanvas.getContext("2d");
  if (zoomCtx === null) {
    return false;
  }
  const imageData = zoomCtx.getImageData(
    0,
    0,
    zoomCanvas.width,
    zoomCanvas.height
  );
  const data = imageData.data;

  for (let y = 1; y < zoomCanvas.height - 1; y++) {
    for (let x = 1; x < zoomCanvas.width - 1; x++) {
      for (let c = 0; c < 3; c++) {
        const i = (y * zoomCanvas.width + x) * 4 + c;
        data[i] =
          (data[i] +
            data[i - 4] +
            data[i + 4] +
            data[i - zoomCanvas.width * 4] +
            data[i + zoomCanvas.width * 4]) /
          5;
      }
    }
  }

  zoomCtx.putImageData(imageData, 0, 0);
}
