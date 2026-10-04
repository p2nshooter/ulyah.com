/* BYODD — the quiet motion of the cedar hall. Decoration only: every page
   works without it, and all motion stops under prefers-reduced-motion. */
(function () {
  "use strict";
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var kopf = document.querySelector(".zeder-kopf");
  var knopf = document.querySelector(".zeder-knopf");
  if (knopf && kopf) {
    knopf.addEventListener("click", function () {
      var offen = kopf.classList.toggle("offen");
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
    });
  }

  // The arch of the workshop you are in stays raised.
  var pfad = document.querySelector(".zeder-pfad a[href^='/themen/']");
  var hier = pfad ? pfad.getAttribute("href") : location.pathname;
  document.querySelectorAll(".zeder-menue__bogen").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === hier || (href !== "/" && hier.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
  });

  // The spirit level: its bubble travels as you read an Anleitung.
  var text = document.querySelector(".zeder-anleitung__text");
  var blase = document.querySelector(".zeder-wasserwaage");
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
  var schritte = Array.prototype.slice.call(document.querySelectorAll(".zeder-werkbank__inhalt a"));
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
    document.querySelectorAll(".bogen, .zeder-nische, .zeder-verzeichnis section").forEach(function (el, i) {
      el.classList.add("zeder-steigt");
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      steig.observe(el);
    });
  }

  // Spanien, Weltmeister 2026: once per visit, curled wood shavings in red
  // and gold drift down from the cedar beams, spinning as they fall.
  try {
    if (sessionStorage.getItem("byodd-wm26")) return;
    sessionStorage.setItem("byodd-wm26", "1");
  } catch (e) { /* storage blocked: show it anyway */ }
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90";
  document.body.appendChild(cv);
  var g = cv.getContext("2d");
  if (!g) { cv.remove(); return; }
  var k = Math.min(2, window.devicePixelRatio || 1);
  var W = (cv.width = innerWidth * k), H = (cv.height = innerHeight * k);
  var farben = ["#c60b1e", "#ffc400", "#e2c98a", "#c60b1e", "#ffc400", "#b77b45"];
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
      g.strokeStyle = s.c;
      g.lineWidth = 3 * k;
      g.lineCap = "round";
      g.beginPath();
      g.arc(0, 0, s.r, 0, Math.PI * 1.4);
      g.stroke();
      g.restore();
    });
    if (alter < 3000) requestAnimationFrame(bild); else cv.remove();
  })(t0);
})();
