function drawSpray(ctx: CanvasRenderingContext2D, e: MouseEvent) {
    const r = Math.floor(g.spray_radius / 4);

    for (let i = 0; i <g.spray_density; i++) {
        const x2 = Math.floor(g.pX + gaussianRandom(0, r));
        const y2 = Math.floor(g.pY + gaussianRandom(0, r));
        // x = int(x1 + random.gauss(0, r))
        //y = int(y1 + random.gauss(0, r))
        ctx.beginPath();
        ctx.fillStyle = g.pen_color;
        if (g.pen_width < 2) {
            ctx.fillRect(x2, y2,1,1);
        } else {
            //console.log(x2,y2,g.pencil_width/2);
            ctx.arc(x2, y2, g.pen_width / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
            //ctx.stroke(); // İsteğe bağlı: Dairenin kenarlarını çizin
        }

    }
}
// Standard Normal variate using Box-Muller transform.
function gaussianRandom(mean = -1, stdev = 1) {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    // Transform to the desired mean and standard deviation:
    return z * stdev + mean;
}