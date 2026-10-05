/* RUBIY — small life in the royal pantry. Decoration only: every page
   works without it, and all motion stops under prefers-reduced-motion. */
(function () {
  "use strict";
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var kopf = document.querySelector(".spk-kopf");
  var knopf = document.querySelector(".spk-knopf");
  if (knopf && kopf) {
    knopf.addEventListener("click", function () {
      var offen = kopf.classList.toggle("offen");
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
    });
  }

  // The jar of the season you are in stays filled.
  var pfad = document.querySelector(".spk-pfad a[href^='/jahreszeiten/']");
  var hier = pfad ? pfad.getAttribute("href") : location.pathname;
  document.querySelectorAll(".glas").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === hier || (href !== "/" && hier.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
  });

  // The jar gauge under the header fills as you read.
  var text = document.querySelector(".spk-rezept__text");
  var faden = document.querySelector(".spk-pegel");
  if (text && faden) {
    var miss = function () {
      var r = text.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.3 - r.top) / Math.max(1, r.height - window.innerHeight * 0.4)));
      faden.style.setProperty("--p", p.toFixed(4));
    };
    addEventListener("scroll", miss, { passive: true });
    addEventListener("resize", miss);
    miss();
  }

  // The contents list follows the reader.
  var punkte = Array.prototype.slice.call(document.querySelectorAll(".spk-zettel__inhalt a"));
  if (punkte.length && "IntersectionObserver" in window) {
    var nachId = {};
    punkte.forEach(function (k) { nachId[k.getAttribute("href").slice(1)] = k; });
    var spaeher = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        punkte.forEach(function (k) { k.classList.remove("an"); });
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
    document.querySelectorAll(".etikett, .spk-fach, .spk-verzeichnis section").forEach(function (el, i) {
      el.classList.add("spk-erscheint");
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      zeig.observe(el);
    });
  }

  // Spanien, Weltmeister 2026: once per visit, red peppers and lemon slices
  // tumble down from the pantry shelf.
  try {
    if (sessionStorage.getItem("rubiy-wm26")) return;
    sessionStorage.setItem("rubiy-wm26", "1");
  } catch (e) { /* storage blocked: show it anyway */ }
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90";
  document.body.appendChild(cv);
  var g = cv.getContext("2d");
  if (!g) { cv.remove(); return; }
  var k = Math.min(2, window.devicePixelRatio || 1);
  var W = (cv.width = innerWidth * k), H = (cv.height = innerHeight * k);
  var teile = [];
  for (var i = 0; i < 44; i++) {
    teile.push({
      x: Math.random() * W, y: -Math.random() * H * 0.5 - 30 * k,
      s: (0.8 + Math.random() * 0.6) * k, vy: (1.5 + Math.random() * 2.1) * k,
      dreh: Math.random() * Math.PI * 2, drehV: (Math.random() - 0.5) * 0.09,
      wind: Math.random() * Math.PI * 2, art: i % 3 === 0 ? "zitrone" : "paprika",
    });
  }
  function zeichne(t) {
    g.save();
    g.translate(t.x, t.y);
    g.rotate(t.dreh);
    g.scale(t.s, t.s);
    if (t.art === "paprika") {
      g.fillStyle = "#c60b1e";
      g.beginPath(); g.ellipse(0, 2, 5, 10, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = "rgba(255,255,255,0.35)";
      g.beginPath(); g.ellipse(-2, -1, 1.4, 5, 0, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#3f7a2a"; g.lineWidth = 2;
      g.beginPath(); g.moveTo(0, -8); g.quadraticCurveTo(2, -13, 5, -13); g.stroke();
    } else {
      g.fillStyle = "#ffc400";
      g.beginPath(); g.arc(0, 0, 8, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#fff3b0";
      g.beginPath(); g.arc(0, 0, 6, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#ffc400"; g.lineWidth = 1.2;
      for (var j = 0; j < 6; j++) { g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(j * Math.PI / 3) * 6, Math.sin(j * Math.PI / 3) * 6); g.stroke(); }
    }
    g.restore();
  }
  var t0 = performance.now();
  (function bild(t) {
    var alter = t - t0;
    g.clearRect(0, 0, W, H);
    g.globalAlpha = alter > 2400 ? Math.max(0, 1 - (alter - 2400) / 700) : 1;
    teile.forEach(function (p) {
      p.wind += 0.03; p.dreh += p.drehV;
      p.y += p.vy; p.x += Math.sin(p.wind) * 1.1 * k;
      zeichne(p);
    });
    if (alter < 3100) requestAnimationFrame(bild); else cv.remove();
  })(t0);
})();
