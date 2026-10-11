// PAB — Tadmor in motion: destinations menu, compact header on scroll, a gold
// reading route with a small sun at its head (guides only), cards and sections
// that rise into place as they enter the view, a warm light that follows the
// pointer over destinations and postcards, the active itinerary entry, and
// for España 2026 a once-per-session flurry of little red and gold passport
// stamps that drift down and fade within ~3 seconds.
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // The inline script in <head> hides what is about to rise into view; it
  // shows everything again by itself if this file never arrives.
  window.tadmorListo = true;
  document.documentElement.classList.add("tadmor-js");

  var btn = document.querySelector(".tadmor-desplegar");
  var nav = document.getElementById("tadmor-nav");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var o = nav.classList.toggle("abierta");
      btn.setAttribute("aria-expanded", o ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("abierta")) { nav.classList.remove("abierta"); btn.setAttribute("aria-expanded", "false"); btn.focus(); }
    });
  }

  // Compact header + reading route, one passive scroll handler
  var bar0 = document.querySelector(".tadmor-barra");
  var bar = document.querySelector(".tadmor-ruta span");
  var story = document.querySelector(".tadmor--bitacora .tadmor-relato");
  var queued = false;
  var track = function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () {
      queued = false;
      if (bar0) bar0.classList.toggle("compacta", window.scrollY > 40);
      if (bar && story) {
        var r = story.getBoundingClientRect(), span = r.height - window.innerHeight * 0.5;
        var f = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
        bar.style.width = (f * 100).toFixed(1) + "%";
        bar.parentNode.classList.toggle("en-marcha", f > 0);
      }
    });
  };
  window.addEventListener("scroll", track, { passive: true });
  window.addEventListener("resize", track);
  track();

  // Rise into view
  var rise = document.querySelectorAll("[data-revelar], .tadmor-relato h2");
  if (reduce || !("IntersectionObserver" in window)) {
    rise.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visible"); ro.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    rise.forEach(function (el) { ro.observe(el); });
  }

  // Warm light that follows the pointer over destinations and postcards
  if (!reduce && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".rumbo, .postal__enlace").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
      });
    });
  }

  var stops = document.querySelectorAll(".tadmor-pasaporte__itinerario a");
  if (stops.length && "IntersectionObserver" in window) {
    var byId = {};
    stops.forEach(function (a) { byId[decodeURIComponent(a.hash.slice(1))] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && byId[e.target.id]) { stops.forEach(function (a) { a.classList.remove("aqui"); }); byId[e.target.id].classList.add("aqui"); }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(byId).forEach(function (id) { var h = document.getElementById(id); if (h) io.observe(h); });
  }

  var KEY = "pab-lat-wm26";
  var seen = true;
  try { seen = sessionStorage.getItem(KEY) === "1"; sessionStorage.setItem(KEY, "1"); } catch (e) { seen = true; }
  if (seen || reduce) return;
  var cv = document.createElement("canvas");
  cv.className = "tadmor-confeti";
  cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);
  var g = cv.getContext("2d");
  var dpr = Math.min(2, window.devicePixelRatio || 1), W, H;
  var fit = function () { W = window.innerWidth; H = window.innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  fit();
  var stamps = [];
  for (var i = 0; i < 46; i++) stamps.push({ x: Math.random() * W, y: -40 - Math.random() * H * 0.5, r: 9 + Math.random() * 8, vy: 1.6 + Math.random() * 2.4, vx: -0.8 + Math.random() * 1.6, a: Math.random() * 6.28, va: -0.05 + Math.random() * 0.1, c: i % 2 ? "#c60b1e" : "#ffc400" });
  var stamp = function (s) {
    g.save(); g.translate(s.x, s.y); g.rotate(s.a);
    g.strokeStyle = s.c; g.lineWidth = 2;
    g.beginPath(); g.arc(0, 0, s.r, 0, Math.PI * 2); g.stroke();
    g.setLineDash([2, 2]); g.beginPath(); g.arc(0, 0, s.r * 0.7, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
    g.fillStyle = s.c === "#c60b1e" ? "#ffc400" : "#c60b1e";
    g.beginPath();
    for (var k = 0; k < 10; k++) { var rr = k % 2 ? s.r * 0.22 : s.r * 0.5, an = -Math.PI / 2 + k * Math.PI / 5; g.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    g.closePath(); g.fill();
    g.restore();
  };
  var t0 = performance.now();
  var run = function (now) {
    var el = now - t0;
    g.clearRect(0, 0, W, H);
    g.globalAlpha = el > 2200 ? Math.max(0, 1 - (el - 2200) / 800) : 1;
    stamps.forEach(function (s) { s.x += s.vx; s.y += s.vy; s.a += s.va; stamp(s); });
    if (el < 3000) requestAnimationFrame(run); else cv.remove();
  };
  window.addEventListener("resize", fit);
  requestAnimationFrame(run);
})();
