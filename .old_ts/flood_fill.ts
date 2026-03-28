const floodFill = (
  x: number,
  y: number,
  ctx: CanvasRenderingContext2D,
  fillColor: { r: number; g: number; b: number; a: number },
  tolerance: { r: number; g: number; b: number; a: number } = {
    r: 32,
    g: 32,
    b: 32,
    a: 32,
  }
) => {
  const canvas = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const visited = new Uint8Array(canvas.width * canvas.height);

  const queue = [{ x, y }];
  const startIndex = (y * canvas.width + x) * 4;
  const startR = data[startIndex];
  const startG = data[startIndex + 1];
  const startB = data[startIndex + 2];
  const startA = data[startIndex + 3];

  // Avoid filling if the start color is already the fill color
  if (
    isColorSimilar(
      startR,
      startG,
      startB,
      startA,
      fillColor.r,
      fillColor.g,
      fillColor.b,
      fillColor.a,
      { r: 0, g: 0, b: 0, a: 0 } // Exact match check
    )
  )
    return;

  while (queue.length > 0) {
    const { x: cx, y: cy } = queue.shift()!;

    if (cx < 0 || cx >= canvas.width || cy < 0 || cy >= canvas.height) continue;

    const pixelIndex = (cy * canvas.width + cx) * 4;
    const r = data[pixelIndex];
    const g = data[pixelIndex + 1];
    const b = data[pixelIndex + 2];
    const a = data[pixelIndex + 3];

    if (
      visited[cy * canvas.width + cx] === 1 ||
      !isColorSimilar(r, g, b, a, startR, startG, startB, startA, tolerance)
    )
      continue;

    visited[cy * canvas.width + cx] = 1;

    // Blend the fill color with the original alpha
    const blended = blendColor(a, fillColor);
    data[pixelIndex] = blended.r;
    data[pixelIndex + 1] = blended.g;
    data[pixelIndex + 2] = blended.b;
    data[pixelIndex + 3] = blended.a;

    // Include diagonal neighbors (8-direction fill)
    queue.push({ x: cx - 1, y: cy });
    queue.push({ x: cx + 1, y: cy });
    queue.push({ x: cx, y: cy - 1 });
    queue.push({ x: cx, y: cy + 1 });
    queue.push({ x: cx - 1, y: cy - 1 });
    queue.push({ x: cx + 1, y: cy - 1 });
    queue.push({ x: cx - 1, y: cy + 1 });
    queue.push({ x: cx + 1, y: cy + 1 });
  }
  const optional_step = false; //extra blur - problem
  if (optional_step) {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCtx.putImageData(imageData, 0, 0);

    // Apply a slight blur to anti-aliased edges
    tempCtx.filter = "blur(1px)";
    tempCtx.drawImage(tempCanvas, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);
  } else {
    ctx.putImageData(imageData, 0, 0);
  }
};

// Helper function to check if two colors are "similar" within a tolerance

const isColorSimilar = (
  r1: number,
  g1: number,
  b1: number,
  a1: number,
  r2: number,
  g2: number,
  b2: number,
  a2: number,
  tolerance: { r: number; g: number; b: number; a: number }
) => {
  return (
    Math.abs(r1 - r2) <= tolerance.r &&
    Math.abs(g1 - g2) <= tolerance.g &&
    Math.abs(b1 - b2) <= tolerance.b &&
    Math.abs(a1 - a2) <= tolerance.a
  );
};

// Blend fill color with the original pixel's alpha
const blendColor = (
  originalAlpha: number,
  fillColor: { r: number; g: number; b: number; a: number }
) => {
  const alphaRatio = originalAlpha / 255;
  return {
    r: fillColor.r * alphaRatio + fillColor.r * (1 - alphaRatio), // Adjust as needed
    g: fillColor.g * alphaRatio + fillColor.g * (1 - alphaRatio),
    b: fillColor.b * alphaRatio + fillColor.b * (1 - alphaRatio),
    a: fillColor.a * alphaRatio + fillColor.a * (1 - alphaRatio),
  };
};
