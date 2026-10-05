/* QARF — the caravan's small lights. Decoration only: every page works
   without it, and all motion stops under prefers-reduced-motion. */
(function () {
  "use strict";
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile menu.
  var kopf = document.querySelector(".krw-kopf");
  var knopf = document.querySelector(".krw-knopf");
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

  // The glass of the topic you are in stays filled with tea.
  var pfad = document.querySelector(".krw-pfad a[href^='/themen/']");
  var hier = pfad ? pfad.getAttribute("href") : location.pathname;
  document.querySelectorAll(".krw-glas").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === hier || (href !== "/" && hier.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
  });

  // Reading progress: a line of saffron fills under the header.
  var text = document.querySelector(".krw--ratgeber .krw-ratgeber__text");
  var spur = document.querySelector(".krw-spur");
  if (text && spur) {
    var miss = function () {
      var r = text.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.3 - r.top) / Math.max(1, r.height - window.innerHeight * 0.4)));
      spur.style.setProperty("--p", p.toFixed(4));
    };
    addEventListener("scroll", miss, { passive: true });
    addEventListener("resize", miss);
    miss();
  }

  // The contents list follows the reader.
  var punkte = Array.prototype.slice.call(document.querySelectorAll(".krw-fracht__inhalt a"));
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

  // Tiles and sacks arrive one after another, like a caravan over a dune.
  if ("IntersectionObserver" in window) {
    var zeig = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("da"); zeig.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".krw-kachel, .krw-saecke li, .krw-ladeliste section, .krw-spick__liste li").forEach(function (el, i) {
      el.classList.add("krw-erscheint");
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      zeig.observe(el);
    });
  }

  // Spanien, Weltmeister 2026: once per visit, red and yellow coffee beans
  // pour down as if a sack had burst open.
  try {
    if (sessionStorage.getItem("qarf-wm26")) return;
    sessionStorage.setItem("qarf-wm26", "1");
  } catch (e) { /* storage blocked: show it anyway */ }
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90";
  document.body.appendChild(cv);
  var g = cv.getContext("2d");
  if (!g) { cv.remove(); return; }
  var k = Math.min(2, window.devicePixelRatio || 1);
  var W = (cv.width = innerWidth * k), H = (cv.height = innerHeight * k);
  var farben = [["#c60b1e", "#7a0712"], ["#ffc400", "#a07400"]];
  var bohnen = [];
  for (var i = 0; i < 54; i++) {
    bohnen.push({
      x: Math.random() * W, y: -Math.random() * H * 0.6 - 24 * k,
      s: (0.8 + Math.random() * 0.7) * k, vy: (1.8 + Math.random() * 2.2) * k,
      dreh: Math.random() * Math.PI * 2, drehV: (Math.random() - 0.5) * 0.12,
      wind: Math.random() * Math.PI * 2, f: farben[i % 2],
    });
  }
  function bohne(b) {
    g.save();
    g.translate(b.x, b.y);
    g.rotate(b.dreh);
    g.scale(b.s, b.s);
    g.fillStyle = b.f[0];
    g.beginPath(); g.ellipse(0, 0, 8, 5.4, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = b.f[1];
    g.lineWidth = 1.4;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(-6.4, 0.4);
    g.bezierCurveTo(-3.2, -1.8, -2, 1.8, 0, 0);
    g.bezierCurveTo(2, -1.8, 3.2, 1.8, 6.4, -0.4);
    g.stroke();
    g.restore();
  }
  var t0 = performance.now();
  (function bild(t) {
    var alter = t - t0;
    g.clearRect(0, 0, W, H);
    g.globalAlpha = alter > 2300 ? Math.max(0, 1 - (alter - 2300) / 700) : 1;
    bohnen.forEach(function (b) {
      b.wind += 0.03; b.dreh += b.drehV;
      b.y += b.vy; b.x += Math.sin(b.wind) * 1.2 * k;
      bohne(b);
    });
    if (alter < 3000) requestAnimationFrame(bild); else cv.remove();
  })(t0);
})();
