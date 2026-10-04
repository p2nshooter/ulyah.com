/* XKO — the current running through the amber hall. Decoration only: the
   page works without it, and all motion stops under prefers-reduced-motion. */
(function () {
  "use strict";
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var head = document.querySelector(".kilo-cabecera");
  var sw = document.querySelector(".kilo-interruptor");
  if (sw && head) {
    sw.addEventListener("click", function () {
      var on = head.classList.toggle("abierta");
      sw.setAttribute("aria-expanded", on ? "true" : "false");
    });
  }

  // The section you are in lights its lamp in the menu.
  var crumb = document.querySelector(".kilo-guia .kilo-migas a[href^='/temas/']");
  var here = crumb ? crumb.getAttribute("href") : location.pathname;
  document.querySelectorAll(".kilo-menu__item").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === here || (href !== "/" && here.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
  });

  // The meter under the header fills as you read a guide.
  var text = document.querySelector(".kilo-guia__texto");
  var bar = document.querySelector(".kilo-medidor span");
  if (text && bar && document.body.classList.contains("kilo--guia")) {
    var fill = function () {
      var r = text.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.35 - r.top) / Math.max(1, r.height)));
      bar.style.setProperty("--p", p.toFixed(4));
    };
    addEventListener("scroll", fill, { passive: true });
    fill();
  }

  // The table of contents follows the reader.
  var links = Array.prototype.slice.call(document.querySelectorAll(".kilo-lectura__indice a"));
  if (links.length && "IntersectionObserver" in window) {
    var byId = {};
    links.forEach(function (l) { byId[l.getAttribute("href").slice(1)] = l; });
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove("activo"); });
        if (byId[e.target.id]) byId[e.target.id].classList.add("activo");
      });
    }, { rootMargin: "-25% 0px -65% 0px" });
    Object.keys(byId).forEach(function (id) { var h = document.getElementById(id); if (h) spy.observe(h); });
  }

  // Switch plates and breakers switch on as they come into view.
  if ("IntersectionObserver" in window) {
    var on = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("visto", "encendido");
        on.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".voltio, .kilo-diferencial").forEach(function (el, i) {
      if (!calm) {
        el.classList.add("kilo-sube");
        el.style.transitionDelay = (i % 3) * 80 + "ms";
      }
      on.observe(el);
    });
  }

  if (calm) return;

  // España, campeona del mundo 2026: once per visit, a firework of amber,
  // red and gold sparks with trails bursts from the trophy and falls away.
  try {
    if (sessionStorage.getItem("xko-copa26")) return;
    sessionStorage.setItem("xko-copa26", "1");
  } catch (e) { /* storage blocked: show it anyway */ }
  var cup = document.querySelector(".ambar-contador__copa");
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90";
  document.body.appendChild(cv);
  var g = cv.getContext("2d");
  if (!g) { cv.remove(); return; }
  var k = Math.min(2, window.devicePixelRatio || 1);
  var W = (cv.width = innerWidth * k), H = (cv.height = innerHeight * k);
  var box = cup ? cup.getBoundingClientRect() : { left: innerWidth / 2, top: 10, width: 0, height: 0 };
  var ox = (box.left + box.width / 2) * k, oy = (box.top + box.height / 2) * k;
  var tones = ["#c60b1e", "#ffc400", "#ffd28a", "#f2a33a", "#ffffff"];
  var sparks = [];
  for (var i = 0; i < 140; i++) {
    var ang = Math.random() * Math.PI * 2, sp = (3 + Math.random() * 9) * k;
    sparks.push({ x: ox, y: oy, px: ox, py: oy, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp * 0.7 + 2 * k, c: tones[i % tones.length], w: (1.2 + Math.random() * 2) * k });
  }
  var t0 = performance.now();
  (function frame(t) {
    var age = t - t0;
    g.globalCompositeOperation = "destination-out";
    g.fillStyle = "rgba(0,0,0,0.28)";
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = "lighter";
    g.globalAlpha = age > 1900 ? Math.max(0, 1 - (age - 1900) / 700) : 1;
    sparks.forEach(function (s) {
      s.px = s.x; s.py = s.y;
      s.vx *= 0.985; s.vy = s.vy * 0.985 + 0.16 * k;
      s.x += s.vx; s.y += s.vy;
      g.strokeStyle = s.c; g.lineWidth = s.w; g.lineCap = "round";
      g.beginPath(); g.moveTo(s.px, s.py); g.lineTo(s.x, s.y); g.stroke();
    });
    if (age < 2600) requestAnimationFrame(frame); else cv.remove();
  })(t0);
})();
