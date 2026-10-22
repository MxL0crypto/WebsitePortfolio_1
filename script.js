const $ = (s, r = document) => [...r.querySelectorAll(s)];
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
document.getElementById("year").textContent = new Date().getFullYear();

// Name Buchstabe für Buchstabe einblenden
const name = document.getElementById("name");
name.innerHTML = [...name.textContent].map((c, i) => `<span class="ch" style="--i:${i}" aria-hidden="true">${c}</span>`).join("");

// Einblenden beim Scrollen + Zahlen hochzählen
function count(el) {
  const to = +el.dataset.count, suffix = el.dataset.suffix || "", t0 = performance.now();
  (function step(now) {
    const k = Math.min((now - t0) / 1400, 1);
    el.textContent = Math.round(to * (1 - (1 - k) ** 3)) + suffix;
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    e.target.classList.add("in");
    $("[data-count]", e.target).forEach(count);
    io.unobserve(e.target);
  }
}, { threshold: 0.15 });
$(".reveal").forEach((el) => io.observe(el));
if (still) $("[data-count]").forEach((el) => (el.textContent = el.dataset.count + (el.dataset.suffix || "")));

// Scroll-Fortschritt
const bar = document.querySelector(".progress");
let scrollY = 0;
addEventListener("scroll", () => {
  scrollY = window.scrollY;
  bar.style.setProperty("--p", scrollY / (document.documentElement.scrollHeight - innerHeight || 1));
}, { passive: true });

// Maus: Glow-Ring, Magnet-Buttons, 3D-Neigung
const mouse = { x: -999, y: -999, sx: -999, sy: -999 };
const glow = document.querySelector(".cursor");
addEventListener("pointermove", (e) => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  glow.classList.add("on");
  glow.classList.toggle("big", !!e.target.closest("a, .btn"));
});
document.addEventListener("pointerleave", () => glow.classList.remove("on"));

$(".magnetic").forEach((b) => {
  b.addEventListener("pointermove", (e) => {
    const r = b.getBoundingClientRect();
    b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
  });
  b.addEventListener("pointerleave", () => (b.style.translate = ""));
});

function tilt(el, max) {
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty("--ry", `${((e.clientX - r.left) / r.width - 0.5) * max}deg`);
    el.style.setProperty("--rx", `${-((e.clientY - r.top) / r.height - 0.5) * max}deg`);
  });
  el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
}
if (!still) { tilt(document.getElementById("tilt"), 24); $(".tilt-card").forEach((c) => tilt(c, 5)); }

// Topo-Linien: Sinuswellen, die mit Zeit, Scroll und Maus reagieren
const canvas = document.getElementById("topo");
const ctx = canvas.getContext("2d");
const LINES = 46;
let w, h;

function resize() {
  const dpr = devicePixelRatio || 1;
  w = innerWidth; h = innerHeight;
  canvas.width = w * dpr; canvas.height = h * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw(t) {
  mouse.sx += (mouse.x - mouse.sx) * 0.08;
  mouse.sy += (mouse.y - mouse.sy) * 0.08;
  glow.style.transform = `translate(${mouse.sx}px, ${mouse.sy}px)`;
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 1;
  for (let i = 0; i < LINES; i++) {
    const base = (i / (LINES - 1)) * h * 1.1 - h * 0.05;
    // jede 12. Linie in Akzentblau, der Rest weiß und dezent
    ctx.strokeStyle = i % 12 === 5 ? "rgba(51,150,255,.7)" : "rgba(255,255,255,.18)";
    ctx.beginPath();
    for (let x = 0; x <= w; x += 8) {
      const dx = x - mouse.sx, dy = base - mouse.sy;
      const bump = -90 * Math.exp(-(dx * dx + dy * dy) / 40000) * Math.sign(dy || 1); // Linien weichen dem Cursor aus
      const y = base + bump
        + Math.sin(x * 0.004 + i * 0.18 + t) * (60 + scrollY * 0.03 % 40)
        + Math.sin(x * 0.011 - i * 0.1 + t * 1.3) * 22;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
  }
}

function loop(ms) {
  draw(ms / 4000 + scrollY * 0.0015);
  if (!still) requestAnimationFrame(loop);
}

addEventListener("resize", () => { resize(); if (still) draw(0); });
resize();
requestAnimationFrame(loop);
