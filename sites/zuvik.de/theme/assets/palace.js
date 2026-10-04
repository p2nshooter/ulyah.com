/* ZUVIK — the quiet life of the courtyard. Decoration only: every page works
   without it, and all motion stops under prefers-reduced-motion. */
(function () {
  "use strict";
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var kopf = document.querySelector(".hof-kopf");
  var knopf = document.querySelector(".hof-knopf");
  if (knopf && kopf) {
    knopf.addEventListener("click", function () {
      var offen = kopf.classList.toggle("offen");
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
    });
  }

  // The window of the room you are in stays lit.
  var pfad = document.querySelector(".hof-pfad a[href^='/raeume/']");
  var hier = pfad ? pfad.getAttribute("href") : location.pathname;
  document.querySelectorAll(".fenster").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === hier || (href !== "/" && hier.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
  });

  // The reading lamp in the header grows brighter as you read a story.
  var text = document.querySelector(".hof-geschichte__text");
  var lampe = document.querySelector(".hof-lesekerze");
  if (text && lampe) {
    var miss = function () {
      var r = text.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.35 - r.top) / Math.max(1, r.height)));
      lampe.style.setProperty("--p", p.toFixed(4));
    };
    addEventListener("scroll", miss, { passive: true });
    miss();
  }

  // The chapter list follows the reader.
  var kapitel = Array.prototype.slice.call(document.querySelectorAll(".hof-sims__inhalt a"));
  if (kapitel.length && "IntersectionObserver" in window) {
    var nachId = {};
    kapitel.forEach(function (k) { nachId[k.getAttribute("href").slice(1)] = k; });
    var spaeher = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        kapitel.forEach(function (k) { k.classList.remove("an"); });
        if (nachId[e.target.id]) nachId[e.target.id].classList.add("an");
      });
    }, { rootMargin: "-25% 0px -65% 0px" });
    Object.keys(nachId).forEach(function (id) { var h = document.getElementById(id); if (h) spaeher.observe(h); });
  }

  if (ruhig) return;

  if ("IntersectionObserver" in window) {
    var zeig = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("da"); zeig.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".granat-karte, .hof-tuer, .hof-verzeichnis section").forEach(function (el, i) {
      el.classList.add("hof-erscheint");
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      zeig.observe(el);
    });
  }

  // Spanien, Weltmeister 2026: once per visit, pomegranate seeds and saffron
  // petals in red and gold tumble down across the courtyard.
  try {
    if (sessionStorage.getItem("zuvik-wm26")) return;
    sessionStorage.setItem("zuvik-wm26", "1");
  } catch (e) { /* storage blocked: show it anyway */ }
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90";
  document.body.appendChild(cv);
  var g = cv.getContext("2d");
  if (!g) { cv.remove(); return; }
  var k = Math.min(2, window.devicePixelRatio || 1);
  var W = (cv.width = innerWidth * k), H = (cv.height = innerHeight * k);
  var farben = ["#c60b1e", "#ffc400", "#9e2b3c", "#f3cf7a", "#c60b1e", "#e3a72f"];
  var kerne = [];
  for (var i = 0; i < 70; i++) {
    kerne.push({
      x: Math.random() * W, y: -Math.random() * H * 0.5 - 20 * k,
      rx: (3 + Math.random() * 3) * k, ry: (5 + Math.random() * 4) * k,
      vy: (1.5 + Math.random() * 2.2) * k, dreh: Math.random() * Math.PI * 2,
      drehV: 0.04 + Math.random() * 0.07, wind: Math.random() * Math.PI * 2,
      c: farben[i % farben.length],
    });
  }
  var t0 = performance.now();
  (function bild(t) {
    var alter = t - t0;
    g.clearRect(0, 0, W, H);
    g.globalAlpha = alter > 2300 ? Math.max(0, 1 - (alter - 2300) / 700) : 1;
    kerne.forEach(function (s) {
      s.wind += 0.03; s.dreh += s.drehV;
      s.y += s.vy; s.x += Math.sin(s.wind) * 1.2 * k;
      g.save();
      g.translate(s.x, s.y);
      g.rotate(s.dreh);
      g.fillStyle = s.c;
      g.beginPath();
      g.ellipse(0, 0, s.rx, s.ry, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(255,255,255,0.45)";
      g.beginPath();
      g.ellipse(-s.rx * 0.3, -s.ry * 0.35, s.rx * 0.3, s.ry * 0.25, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    });
    if (alter < 3000) requestAnimationFrame(bild); else cv.remove();
  })(t0);
})();
