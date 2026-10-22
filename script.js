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

// 3D-Kopfhörer (three.js), drehbar per Maus/Finger
(function () {
  const box = document.getElementById("viewer"), cv = document.getElementById("gl");
  const hint = box.querySelector(".hint");
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); }
  catch { hint.textContent = "3D-Ansicht nicht verfügbar"; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
  cam.position.set(0, 0.2, 8.5);
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 0.9); key.position.set(3, 4, 5); scene.add(key);
  const blue = new THREE.PointLight(0x3396ff, 2.2, 20); blue.position.set(-4, 1, 4); scene.add(blue);

  const dark = new THREE.MeshStandardMaterial({ color: 0x15151a, metalness: 0.85, roughness: 0.35 });
  const soft = new THREE.MeshStandardMaterial({ color: 0x202026, metalness: 0.1, roughness: 0.9 });
  const glowM = new THREE.MeshBasicMaterial({ color: 0x3396ff });
  const white = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 });
  const blueLine = new THREE.LineBasicMaterial({ color: 0x3396ff });
  const g = new THREE.Group(); scene.add(g);

  const wire = (geo, parent) => parent.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), white));
  const circle = (r, mat) => new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, r, r).getPoints(64).map((p) => new THREE.Vector3(p.x, p.y, 0))), mat);

  // Bügel: Halbkreis über dem Kopf
  const bandGeo = new THREE.TorusGeometry(1.7, 0.09, 16, 90, Math.PI);
  const band = new THREE.Mesh(bandGeo, dark); wire(bandGeo, band); g.add(band);
  const padGeo = new THREE.TorusGeometry(1.7, 0.16, 12, 40, Math.PI / 2.2);
  const pad = new THREE.Mesh(padGeo, soft); pad.rotation.z = Math.PI / 2 - Math.PI / 4.4; g.add(pad);

  // Ohrmuscheln (links und rechts gespiegelt)
  for (const s of [-1, 1]) {
    const cup = new THREE.Group(); cup.position.x = 1.7 * s; cup.rotation.y = (Math.PI / 2) * s;
    const body = new THREE.CylinderGeometry(0.72, 0.72, 0.34, 56); body.rotateX(Math.PI / 2);
    const m = new THREE.Mesh(body, dark); wire(body, m); cup.add(m);
    const cushion = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.17, 14, 48), soft); cushion.position.z = -0.3; cup.add(cushion);
    [0.6, 0.48, 0.36].forEach((r) => { const c = circle(r, white); c.position.z = 0.18; cup.add(c); }); // Topo-Ringe
    const c = circle(0.24, blueLine); c.position.z = 0.19; cup.add(c);
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.1, 32), glowM); dot.position.z = 0.2; cup.add(dot);
    g.add(cup);
  }
  g.rotation.set(0.15, -0.6, 0);

  function resize() {
    const s = box.clientWidth;
    renderer.setSize(s, s, false);
    cam.aspect = 1; cam.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(box); resize();

  // Ziehen zum Drehen, mit Schwung
  let drag = false, lx = 0, ly = 0, vy = 0, vx = 0;
  box.addEventListener("pointerdown", (e) => { drag = true; lx = e.clientX; ly = e.clientY; box.setPointerCapture(e.pointerId); });
  box.addEventListener("pointermove", (e) => {
    if (!drag) return;
    vy = (e.clientX - lx) * 0.008; vx = (e.clientY - ly) * 0.005;
    g.rotation.y += vy; g.rotation.x = Math.max(-0.8, Math.min(0.8, g.rotation.x + vx));
    lx = e.clientX; ly = e.clientY;
  });
  const up = () => { drag = false; };
  box.addEventListener("pointerup", up); box.addEventListener("pointercancel", up);

  let visible = false, raf = 0;
  function frame(ms) {
    raf = 0;
    if (!drag) { vy *= 0.95; g.rotation.y += vy + (still ? 0 : 0.004); }
    g.position.y = still ? 0 : Math.sin(ms / 900) * 0.08;
    renderer.render(scene, cam);
    if (visible && !still) raf = requestAnimationFrame(frame);
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(frame); }).observe(box);
  frame(0);
})();
