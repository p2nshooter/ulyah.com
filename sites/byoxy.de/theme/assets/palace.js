/* BYOXY — the quiet motion of the hanging gardens. Decoration only: every page
   works without it, and all motion stops under prefers-reduced-motion. */
(function () {
  "use strict";
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var kopf = document.querySelector(".garten-kopf");
  var knopf = document.querySelector(".garten-knopf");
  if (knopf && kopf) {
    knopf.addEventListener("click", function () {
      var offen = kopf.classList.toggle("offen");
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
    });
  }

  // The leaf under the garden you are in stays unfolded.
  var pfad = document.querySelector(".garten-pfad a[href^='/gaerten/']");
  var hier = pfad ? pfad.getAttribute("href") : location.pathname;
  document.querySelectorAll(".garten-menue__blatt").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === hier || (href !== "/" && hier.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
  });

  // A vine grows down the left edge as you read a Ratgeber.
  var text = document.querySelector(".garten-ratgeber__text");
  var blase = document.querySelector(".garten-ranke");
  if (text && blase) {
    var miss = function () {
      var r = text.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.35 - r.top) / Math.max(1, r.height)));
      blase.style.setProperty("--p", p.toFixed(4));
    };
    addEventListener("scroll", miss, { passive: true });
    miss();
  }

  // The work-step list follows the reader.
  var schritte = Array.prototype.slice.call(document.querySelectorAll(".garten-pflanzschild__inhalt a"));
  if (schritte.length && "IntersectionObserver" in window) {
    var nachId = {};
    schritte.forEach(function (s) { nachId[s.getAttribute("href").slice(1)] = s; });
    var spaeher = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        schritte.forEach(function (s) { s.classList.remove("an"); });
        if (nachId[e.target.id]) nachId[e.target.id].classList.add("an");
      });
    }, { rootMargin: "-25% 0px -65% 0px" });
    Object.keys(nachId).forEach(function (id) { var h = document.getElementById(id); if (h) spaeher.observe(h); });
  }

  if (ruhig) return;

  if ("IntersectionObserver" in window) {
    var steig = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("da"); steig.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".blatt, .garten-terrasse, .garten-verzeichnis section").forEach(function (el, i) {
      el.classList.add("garten-steigt");
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      steig.observe(el);
    });
  }

  // Spanien, Weltmeister 2026: once per visit, red and gold petals drift
  // down from the terraces, tumbling as they fall.
  try {
    if (sessionStorage.getItem("byoxy-wm26")) return;
    sessionStorage.setItem("byoxy-wm26", "1");
  } catch (e) { /* storage blocked: show it anyway */ }
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90";
  document.body.appendChild(cv);
  var g = cv.getContext("2d");
  if (!g) { cv.remove(); return; }
  var k = Math.min(2, window.devicePixelRatio || 1);
  var W = (cv.width = innerWidth * k), H = (cv.height = innerHeight * k);
  var farben = ["#c60b1e", "#ffc400", "#7cc576", "#c60b1e", "#ffc400", "#f0d899"];
  var spaene = [];
  for (var i = 0; i < 64; i++) {
    spaene.push({
      x: Math.random() * W, y: -Math.random() * H * 0.5 - 20 * k,
      r: (6 + Math.random() * 7) * k, vy: (1.4 + Math.random() * 2) * k,
      dreh: Math.random() * Math.PI * 2, drehV: 0.05 + Math.random() * 0.08,
      wind: Math.random() * Math.PI * 2, c: farben[i % farben.length],
    });
  }
  var t0 = performance.now();
  (function bild(t) {
    var alter = t - t0;
    g.clearRect(0, 0, W, H);
    g.globalAlpha = alter > 2300 ? Math.max(0, 1 - (alter - 2300) / 700) : 1;
    spaene.forEach(function (s) {
      s.wind += 0.03; s.dreh += s.drehV;
      s.y += s.vy; s.x += Math.sin(s.wind) * 1.3 * k;
      g.save();
      g.translate(s.x, s.y);
      g.rotate(s.dreh);
      g.fillStyle = s.c;
      g.beginPath();
      g.ellipse(0, 0, s.r, s.r * 0.5, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    });
    if (alter < 3000) requestAnimationFrame(bild); else cv.remove();
  })(t0);
})();
