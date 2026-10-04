/* QKB — the movement of the copper workshop. Decoration only: the page works
   without it, and all motion stops under prefers-reduced-motion. */
(function () {
  "use strict";
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var head = document.querySelector(".cobre-cabecera");
  var open = document.querySelector(".cobre-abrir");
  if (open && head) {
    open.addEventListener("click", function () {
      var on = head.classList.toggle("abierta");
      open.setAttribute("aria-expanded", on ? "true" : "false");
    });
  }

  // Current section lights its menu item (and the article's section too).
  var path = location.pathname;
  var crumb = document.querySelector(".receta .cobre-migas a[href^='/despensa/']");
  var current = crumb ? crumb.getAttribute("href") : path;
  document.querySelectorAll(".cobre-menu__item").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === current || (href !== "/" && current.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
  });

  // The copper thermometer: how far through the recipe you are.
  var text = document.querySelector(".receta__texto");
  var bar = document.querySelector(".cobre-termometro");
  if (text && bar && document.body.classList.contains("cobre--receta")) {
    var fill = function () {
      var r = text.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.4 - r.top) / Math.max(1, r.height)));
      bar.style.setProperty("--p", p.toFixed(4));
    };
    addEventListener("scroll", fill, { passive: true });
    fill();
  }

  // The step list follows the reader.
  var steps = Array.prototype.slice.call(document.querySelectorAll(".ficha-tecnica__pasos a"));
  if (steps.length && "IntersectionObserver" in window) {
    var map = {};
    steps.forEach(function (s) { map[s.getAttribute("href").slice(1)] = s; });
    var watch = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        steps.forEach(function (s) { s.classList.remove("activo"); });
        if (map[e.target.id]) map[e.target.id].classList.add("activo");
      });
    }, { rootMargin: "-25% 0px -65% 0px" });
    Object.keys(map).forEach(function (id) { var h = document.getElementById(id); if (h) watch.observe(h); });
  }

  if (calm) return;

  if ("IntersectionObserver" in window) {
    var rise = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("listo"); rise.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".ficha, .olla, .indice-cobre section").forEach(function (el, i) {
      el.classList.add("sube");
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      rise.observe(el);
    });
  }

  // España, campeona del mundo 2026: once per visit, copper and gold sparks
  // fly up from the hearth, the way they leave a forge. Never clickable,
  // gone in under three seconds.
  try {
    if (sessionStorage.getItem("qkb-copa26")) return;
    sessionStorage.setItem("qkb-copa26", "1");
  } catch (e) { /* storage blocked */ }
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90";
  document.body.appendChild(cv);
  var g = cv.getContext("2d");
  var k = Math.min(2, devicePixelRatio || 1);
  var W = (cv.width = innerWidth * k), H = (cv.height = innerHeight * k);
  var tones = ["#c60b1e", "#ffc400", "#e39b5c", "#ffcf94", "#b8642f"];
  var sparks = [];
  for (var i = 0; i < 120; i++) {
    sparks.push({
      x: W * (0.2 + Math.random() * 0.6), y: H + Math.random() * 40 * k,
      vx: (Math.random() - 0.5) * 6 * k, vy: -(7 + Math.random() * 9) * k,
      w: (3 + Math.random() * 5) * k, h: (6 + Math.random() * 8) * k,
      a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 0.3, c: tones[i % tones.length],
    });
  }
  var t0 = performance.now();
  (function draw(t) {
    var age = t - t0;
    g.clearRect(0, 0, W, H);
    g.globalAlpha = age > 2100 ? Math.max(0, 1 - (age - 2100) / 700) : 1;
    sparks.forEach(function (s) {
      s.vy += 0.22 * k; s.x += s.vx; s.y += s.vy; s.a += s.va;
      g.save(); g.translate(s.x, s.y); g.rotate(s.a);
      g.fillStyle = s.c; g.fillRect(-s.w / 2, -s.h / 2, s.w, s.h);
      g.restore();
    });
    if (age < 2800) requestAnimationFrame(draw); else cv.remove();
  })(t0);
})();
