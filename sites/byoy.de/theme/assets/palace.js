/* BYOY — life on the vineyard terraces. Decoration only: every page works
   without it, and all motion stops under prefers-reduced-motion. */
(function () {
  "use strict";
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var kopf = document.querySelector(".hamon-kopf");
  var knopf = document.querySelector(".hamon-knopf");
  if (knopf && kopf) {
    knopf.addEventListener("click", function () {
      var offen = kopf.classList.toggle("offen");
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && kopf.classList.contains("offen")) {
        kopf.classList.remove("offen");
        knopf.setAttribute("aria-expanded", "false");
        knopf.focus();
      }
    });
  }

  // The vine row of the topic you are in keeps its tendril grown.
  var pfad = document.querySelector(".hamon-pfad a[href^='/themen/']");
  var hier = pfad ? pfad.getAttribute("href") : location.pathname;
  document.querySelectorAll(".rebzeile").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === hier || (href !== "/" && hier.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
  });

  // Reading progress: a tendril grows along the terrace wall.
  var text = document.querySelector(".hamon-wissen__text");
  var spross = document.querySelector(".hamon-fortschritt i");
  if (text && spross) {
    var miss = function () {
      var r = text.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.3 - r.top) / Math.max(1, r.height - window.innerHeight * 0.4)));
      spross.style.setProperty("--p", p.toFixed(4));
    };
    addEventListener("scroll", miss, { passive: true });
    addEventListener("resize", miss);
    miss();
  }

  // The contents list follows the reader.
  var punkte = Array.prototype.slice.call(document.querySelectorAll(".hamon-tafel__inhalt a"));
  if (punkte.length && "IntersectionObserver" in window) {
    var nachId = {};
    punkte.forEach(function (k) { nachId[decodeURIComponent(k.getAttribute("href").slice(1))] = k; });
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
    document.querySelectorAll(".lese, .hamon-lage, .hamon-kelter__spalten > section").forEach(function (el, i) {
      el.classList.add("hamon-erscheint");
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      zeig.observe(el);
    });
  }

  // Spanien, Weltmeister 2026: once per visit, red and yellow tomatoes fall
  // from the vine and are gone after about three seconds.
  try {
    if (sessionStorage.getItem("byoy-wm26")) return;
    sessionStorage.setItem("byoy-wm26", "1");
  } catch (e) { /* storage blocked: show it anyway */ }
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90";
  document.body.appendChild(cv);
  var g = cv.getContext("2d");
  if (!g) { cv.remove(); return; }
  var k = Math.min(2, window.devicePixelRatio || 1);
  var W = (cv.width = innerWidth * k), H = (cv.height = innerHeight * k);
  var farben = ["#c60b1e", "#ffc400"];
  var tomaten = [];
  for (var i = 0; i < 48; i++) {
    tomaten.push({
      x: Math.random() * W, y: -Math.random() * H * 0.5 - 30 * k,
      s: (0.6 + Math.random() * 0.7) * k, vy: (1.7 + Math.random() * 2.1) * k,
      dreh: Math.random() * Math.PI * 2, drehV: (Math.random() - 0.5) * 0.07,
      wind: Math.random() * Math.PI * 2, c: farben[i % 2], kirsch: i % 3 === 0,
    });
  }
  function tomate(t) {
    g.save();
    g.translate(t.x, t.y);
    g.rotate(t.dreh);
    g.scale(t.s, t.s);
    var r = t.kirsch ? 6 : 9;
    g.fillStyle = t.c;
    g.beginPath(); g.ellipse(0, 0, r * 1.12, r, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.4)";
    g.beginPath(); g.ellipse(-r * 0.4, -r * 0.35, r * 0.25, r * 0.18, -0.5, 0, Math.PI * 2); g.fill();
    // The green calyx: a five-pointed star on top.
    g.fillStyle = "#3f6a2c";
    g.beginPath();
    for (var z = 0; z < 10; z++) {
      var w = (z * Math.PI) / 5 - Math.PI / 2;
      var l = z % 2 ? r * 0.18 : r * 0.55;
      g.lineTo(Math.cos(w) * l, -r * 0.82 + Math.sin(w) * l * 0.6);
    }
    g.closePath(); g.fill();
    g.restore();
  }
  var t0 = performance.now();
  (function bild(t) {
    var alter = t - t0;
    g.clearRect(0, 0, W, H);
    g.globalAlpha = alter > 2400 ? Math.max(0, 1 - (alter - 2400) / 700) : 1;
    tomaten.forEach(function (p) {
      p.wind += 0.03; p.dreh += p.drehV;
      p.y += p.vy; p.x += Math.sin(p.wind) * 1.1 * k;
      tomate(p);
    });
    if (alter < 3100) requestAnimationFrame(bild); else cv.remove();
  })(t0);
})();
