/* DAWO — the movement of the glass hall. Everything here is decoration on top
   of a page that already works without it, and all of it stops when the
   reader asks the system for reduced motion. */
(function () {
  "use strict";
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var header = document.querySelector(".cupula");

  // Menu on small screens.
  var btn = document.querySelector(".menu-boton");
  if (btn && header) {
    btn.addEventListener("click", function () {
      var open = header.classList.toggle("abierta");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Mark the section the reader is in.
  var here = location.pathname;
  document.querySelectorAll(".baldosa").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === here || (href !== "/" && here.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
    // A ripple spreads from the point the pointer enters, like a touch on water.
    a.addEventListener("pointerenter", function (e) {
      var r = a.getBoundingClientRect();
      a.style.setProperty("--x", e.clientX - r.left + "px");
      a.style.setProperty("--y", e.clientY - r.top + "px");
      a.classList.remove("onda");
      void a.offsetWidth;
      a.classList.add("onda");
    });
  });
  // On an article, its section's tile lights up too.
  var crumb = document.querySelector(".lectura .migas a[href^='/seccion/']");
  if (crumb) {
    var tile = document.querySelector('.baldosa[href="' + crumb.getAttribute("href") + '"]');
    if (tile) tile.setAttribute("aria-current", "page");
  }

  // The water level: reading progress through an article.
  var prose = document.querySelector(".prosa");
  var level = document.querySelector(".nivel-agua");
  if (prose && level && document.body.classList.contains("es-articulo")) {
    var update = function () {
      var r = prose.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var p = Math.min(1, Math.max(0, -r.top / Math.max(1, total)));
      level.style.setProperty("--p", p.toFixed(4));
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  // The table of contents follows the reader.
  var links = Array.prototype.slice.call(document.querySelectorAll(".indice a"));
  if (links.length && "IntersectionObserver" in window) {
    var byId = {};
    links.forEach(function (l) { byId[l.getAttribute("href").slice(1)] = l; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove("activo"); });
        var l = byId[en.target.id];
        if (l) l.classList.add("activo");
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(byId).forEach(function (id) { var h = document.getElementById(id); if (h) io.observe(h); });
  }

  if (calm) return;

  // Cards rise gently into view.
  if ("IntersectionObserver" in window) {
    var rise = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visto"); rise.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".lamina, .sala, .primeros__lista li, .archivo__col").forEach(function (el, i) {
      el.classList.add("aparece");
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      rise.observe(el);
    });
  }

  // España, campeona del mundo 2026: once per visit, a short rain of gold and
  // red drops falls through the hall. It cannot be clicked and never covers
  // anything for more than three seconds.
  try {
    if (sessionStorage.getItem("dawo-copa26")) return;
    sessionStorage.setItem("dawo-copa26", "1");
  } catch (e) { /* storage blocked: celebrate anyway */ }
  var canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:70";
  document.body.appendChild(canvas);
  var ctx = canvas.getContext("2d");
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var W = (canvas.width = innerWidth * dpr), H = (canvas.height = innerHeight * dpr);
  var colors = ["#c60b1e", "#ffc400", "#e2bd63", "#6fe3e1", "#fff2c4"];
  var drops = [];
  for (var i = 0; i < 110; i++) {
    drops.push({
      x: Math.random() * W, y: -Math.random() * H * 0.6,
      r: (3 + Math.random() * 5) * dpr, vy: (2.2 + Math.random() * 3.2) * dpr,
      sway: Math.random() * Math.PI * 2, c: colors[i % colors.length],
    });
  }
  var start = performance.now();
  (function frame(t) {
    var age = t - start;
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = age > 2200 ? Math.max(0, 1 - (age - 2200) / 700) : 1;
    drops.forEach(function (d) {
      d.y += d.vy; d.sway += 0.05; d.x += Math.sin(d.sway) * 0.8 * dpr;
      // A drop of water: round below, pointed above.
      ctx.beginPath();
      ctx.moveTo(d.x, d.y - d.r * 1.8);
      ctx.bezierCurveTo(d.x + d.r, d.y - d.r * 0.4, d.x + d.r, d.y + d.r, d.x, d.y + d.r);
      ctx.bezierCurveTo(d.x - d.r, d.y + d.r, d.x - d.r, d.y - d.r * 0.4, d.x, d.y - d.r * 1.8);
      ctx.fillStyle = d.c; ctx.fill();
    });
    if (age < 2900) requestAnimationFrame(frame); else canvas.remove();
  })(start);
})();
