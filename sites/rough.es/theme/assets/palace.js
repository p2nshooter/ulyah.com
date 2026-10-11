// ROUGH — mobile menu, reading progress (articles only), table-of-contents
// highlight, and a once-per-session shower of red and gold gem facets for
// España, campeona del mundo 2026.
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var btn = document.querySelector(".lapida-abrir");
  var menu = document.getElementById("lapida-menu");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("esta-abierto");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("esta-abierto")) {
        menu.classList.remove("esta-abierto");
        btn.setAttribute("aria-expanded", "false");
        btn.focus();
      }
    });
  }

  var bar = document.querySelector(".lapida-progreso span");
  var text = document.querySelector(".lapida-texto");
  if (bar && text && document.body.classList.contains("lapida--articulo")) {
    var tick = function () {
      var r = text.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      bar.style.width = (p * 100).toFixed(1) + "%";
    };
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick);
    tick();
  }

  var links = document.querySelectorAll(".lapida-ficha__indice a");
  if (links.length && "IntersectionObserver" in window) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && byId[en.target.id]) {
          links.forEach(function (a) { a.classList.remove("es-actual"); });
          byId[en.target.id].classList.add("es-actual");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(byId).forEach(function (id) { var h = document.getElementById(id); if (h) io.observe(h); });
  }

  // España 2026 — facets of ruby and gold, once per session, gone in ~3 s.
  var KEY = "rough-wm26";
  var seen = false;
  try { seen = sessionStorage.getItem(KEY) === "1"; sessionStorage.setItem(KEY, "1"); } catch (e) { seen = true; }
  if (seen || reduce) return;
  var cv = document.createElement("canvas");
  cv.className = "lapida-confeti";
  cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);
  var ctx = cv.getContext("2d");
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var W = 0, H = 0;
  var size = function () { W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size();
  var colors = ["#c60b1e", "#ffc400", "#d6b979", "#c60b1e", "#ffc400"];
  var parts = [];
  for (var i = 0; i < 90; i++) {
    parts.push({ x: Math.random() * W, y: -20 - Math.random() * H * 0.5, s: 6 + Math.random() * 8, vx: -1 + Math.random() * 2, vy: 2 + Math.random() * 3, r: Math.random() * 6.28, vr: -0.08 + Math.random() * 0.16, c: colors[i % colors.length] });
  }
  var facet = function (p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.fillStyle = p.c;
    ctx.beginPath();
    ctx.moveTo(-p.s, -p.s * 0.3);
    ctx.lineTo(-p.s * 0.55, -p.s * 0.8);
    ctx.lineTo(p.s * 0.55, -p.s * 0.8);
    ctx.lineTo(p.s, -p.s * 0.3);
    ctx.lineTo(0, p.s);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.55)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-p.s, -p.s * 0.3);
    ctx.lineTo(p.s, -p.s * 0.3);
    ctx.moveTo(0, -p.s * 0.8);
    ctx.lineTo(0, p.s);
    ctx.stroke();
    ctx.restore();
  };
  var start = performance.now();
  var frame = function (t) {
    var el = t - start;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = el > 2200 ? Math.max(0, 1 - (el - 2200) / 800) : 1;
    parts.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vy += 0.03; facet(p); });
    if (el < 3000) requestAnimationFrame(frame); else cv.remove();
  };
  window.addEventListener("resize", size);
  requestAnimationFrame(frame);
})();
