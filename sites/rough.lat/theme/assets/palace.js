// ROUGH.LAT — the palace in motion: menu, compact header on scroll, golden
// reading thread (articles only), sections and cards that rise into place as
// they enter the view, a soft gold light that follows the pointer over the
// cards, the active table-of-contents entry, and for España 2026 a
// once-per-session burst of pomegranate seeds in red and gold.
(function () {
  "use strict";
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The inline script in <head> hides what is about to rise into view; it
  // shows everything again by itself if this file never arrives.
  window.granadaListo = true;
  doc.classList.add("granada-js");

  // Menu
  var toggle = document.querySelector(".granada-boton-menu");
  var nav = document.getElementById("granada-menu");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("abierto");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("abierto")) {
        nav.classList.remove("abierto");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  // Compact header + reading thread, one passive scroll handler
  var header = document.querySelector(".granada-cabecera");
  var bar = document.querySelector(".granada-lectura span");
  var prose = document.querySelector(".granada--nota .granada-prosa");
  var ticking = false;
  var onScroll = function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (header) header.classList.toggle("compacta", window.scrollY > 40);
      if (bar && prose) {
        var r = prose.getBoundingClientRect();
        var span = r.height - window.innerHeight * 0.5;
        var f = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
        bar.style.width = (f * 100).toFixed(1) + "%";
        bar.parentNode.classList.toggle("en-marcha", f > 0);
      }
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // Rise into view
  var reveal = document.querySelectorAll("[data-revelar], .granada-prosa h2");
  if (reduce || !("IntersectionObserver" in window)) {
    reveal.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var io = new IntersectionObserver(function (items) {
      items.forEach(function (it) {
        if (it.isIntersecting) { it.target.classList.add("visible"); io.unobserve(it.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveal.forEach(function (el) { io.observe(el); });
  }

  // Gold light that follows the pointer over rooms and cards
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".sala, .semilla__enlace").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
    });
  }

  // Active table-of-contents entry
  var tocLinks = document.querySelectorAll(".granada-indice a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[decodeURIComponent(a.hash.slice(1))] = a; });
    var obs = new IntersectionObserver(function (items) {
      items.forEach(function (it) {
        if (it.isIntersecting && map[it.target.id]) {
          tocLinks.forEach(function (a) { a.classList.remove("activo"); });
          map[it.target.id].classList.add("activo");
        }
      });
    }, { rootMargin: "-15% 0px -75% 0px" });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) obs.observe(el); });
  }

  // España 2026 — once per session
  var KEY = "rough-lat-wm26";
  var done = true;
  try { done = sessionStorage.getItem(KEY) === "1"; sessionStorage.setItem(KEY, "1"); } catch (e) { done = true; }
  if (done || reduce) return;
  var canvas = document.createElement("canvas");
  canvas.className = "granada-confeti";
  canvas.setAttribute("aria-hidden", "true");
  document.body.appendChild(canvas);
  var g = canvas.getContext("2d");
  var ratio = Math.min(2, window.devicePixelRatio || 1);
  var w = 0, h = 0;
  var fit = function () { w = window.innerWidth; h = window.innerHeight; canvas.width = w * ratio; canvas.height = h * ratio; g.setTransform(ratio, 0, 0, ratio, 0, 0); };
  fit();
  var palette = ["#c60b1e", "#ffc400", "#9e1b33", "#ffc400", "#d8bc7a"];
  var seeds = [];
  for (var i = 0; i < 80; i++) {
    seeds.push({ x: w / 2 + (Math.random() - 0.5) * 120, y: h * 0.15, vx: (Math.random() - 0.5) * 9, vy: -3 - Math.random() * 6, r: 3 + Math.random() * 4, a: Math.random() * 6.28, c: palette[i % palette.length] });
  }
  var t0 = performance.now();
  var draw = function (now) {
    var t = now - t0;
    g.clearRect(0, 0, w, h);
    g.globalAlpha = t > 2200 ? Math.max(0, 1 - (t - 2200) / 800) : 1;
    seeds.forEach(function (s) {
      s.x += s.vx; s.y += s.vy; s.vy += 0.22; s.vx *= 0.99; s.a += 0.05;
      g.save();
      g.translate(s.x, s.y);
      g.rotate(s.a);
      g.fillStyle = s.c;
      g.beginPath();
      g.ellipse(0, 0, s.r * 0.8, s.r * 1.15, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(255,255,255,.45)";
      g.beginPath();
      g.ellipse(-s.r * 0.25, -s.r * 0.35, s.r * 0.22, s.r * 0.32, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    });
    if (t < 3000) requestAnimationFrame(draw); else canvas.remove();
  };
  window.addEventListener("resize", fit);
  requestAnimationFrame(draw);
})();
