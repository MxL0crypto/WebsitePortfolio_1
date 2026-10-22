document.getElementById("year").textContent = new Date().getFullYear();

// Topo-Linien: übereinander gelegte Sinuswellen, die langsam driften.
const canvas = document.getElementById("topo");
const ctx = canvas.getContext("2d");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const LINES = 46;
let w, h;

function resize() {
  const dpr = devicePixelRatio || 1;
  w = innerWidth; h = innerHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw(t) {
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1;
  for (let i = 0; i < LINES; i++) {
    const base = (i / (LINES - 1)) * h * 1.1 - h * 0.05;
    // jede 12. Linie in Akzentblau, der Rest weiß und dezent
    ctx.strokeStyle = i % 12 === 5 ? "rgba(51,150,255,.7)" : "rgba(255,255,255,.18)";
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const y = base
        + Math.sin(x * 0.004 + i * 0.18 + t) * 60
        + Math.sin(x * 0.011 - i * 0.1 + t * 1.3) * 22;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
}

function loop(ms) {
  draw(ms / 4000);
  if (!still) requestAnimationFrame(loop);
}

addEventListener("resize", () => { resize(); if (still) draw(0); });
resize();
requestAnimationFrame(loop);
