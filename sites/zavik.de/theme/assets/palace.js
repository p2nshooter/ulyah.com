/* ZAVIK — small life on the steps of the throne. Decoration only: every page
   works without it, and all motion stops under prefers-reduced-motion. */
(function () {
  "use strict";
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var kopf = document.querySelector(".thr-kopf");
  var knopf = document.querySelector(".thr-knopf");
  if (knopf && kopf) {
    knopf.addEventListener("click", function () {
      var offen = kopf.classList.toggle("offen");
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
    });
  }

  // The step of the topic you are on keeps its eyes open.
  var pfad = document.querySelector(".thr-pfad a[href^='/themen/']");
  var hier = pfad ? pfad.getAttribute("href") : location.pathname;
  document.querySelectorAll(".stufe").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === hier || (href !== "/" && hier.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
  });

  // A thread of yarn unrolls under the header as you read a guide.
  var text = document.querySelector(".thr-wissen__text");
  var faden = document.querySelector(".thr-faden");
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
  var punkte = Array.prototype.slice.call(document.querySelectorAll(".thr-blick__inhalt a"));
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
    document.querySelectorAll(".kissen, .thr-tritt, .thr-verzeichnis section").forEach(function (el, i) {
      el.classList.add("thr-erscheint");
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      zeig.observe(el);
    });
  }

  // Spanien, Weltmeister 2026: once per visit, paw prints in red and gold
  // tumble down the steps.
  try {
    if (sessionStorage.getItem("zavik-wm26")) return;
    sessionStorage.setItem("zavik-wm26", "1");
  } catch (e) { /* storage blocked: show it anyway */ }
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90";
  document.body.appendChild(cv);
  var g = cv.getContext("2d");
  if (!g) { cv.remove(); return; }
  var k = Math.min(2, window.devicePixelRatio || 1);
  var W = (cv.width = innerWidth * k), H = (cv.height = innerHeight * k);
  var farben = ["#c60b1e", "#ffc400", "#e0a02b", "#c60b1e", "#f5c86a"];
  var pfoten = [];
  for (var i = 0; i < 46; i++) {
    pfoten.push({
      x: Math.random() * W, y: -Math.random() * H * 0.5 - 30 * k,
      s: (0.7 + Math.random() * 0.6) * k, vy: (1.6 + Math.random() * 2) * k,
      dreh: Math.random() * Math.PI * 2, drehV: (Math.random() - 0.5) * 0.08,
      wind: Math.random() * Math.PI * 2, c: farben[i % farben.length],
    });
  }
  function pfote(p) {
    g.save();
    g.translate(p.x, p.y);
    g.rotate(p.dreh);
    g.scale(p.s, p.s);
    g.fillStyle = p.c;
    g.beginPath(); g.ellipse(0, 4, 7, 6, 0, 0, Math.PI * 2); g.fill();
    [[-8, -4], [-3, -9], [3, -9], [8, -4]].forEach(function (z) {
      g.beginPath(); g.ellipse(z[0], z[1], 2.6, 3.3, 0, 0, Math.PI * 2); g.fill();
    });
    g.restore();
  }
  var t0 = performance.now();
  (function bild(t) {
    var alter = t - t0;
    g.clearRect(0, 0, W, H);
    g.globalAlpha = alter > 2400 ? Math.max(0, 1 - (alter - 2400) / 700) : 1;
    pfoten.forEach(function (p) {
      p.wind += 0.03; p.dreh += p.drehV;
      p.y += p.vy; p.x += Math.sin(p.wind) * 1.1 * k;
      pfote(p);
    });
    if (alter < 3100) requestAnimationFrame(bild); else cv.remove();
  })(t0);
})();
