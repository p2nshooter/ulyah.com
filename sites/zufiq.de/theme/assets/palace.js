/* ZUFIQ — quiet life in the house without a hammer. Decoration only: every
   page works without this file, and under prefers-reduced-motion nothing
   moves (the menu and the contents list still work). */
(function () {
  "use strict";
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The menu on small screens: a real button with aria-expanded.
  var kopf = document.querySelector(".still-kopf");
  var knopf = document.querySelector(".still-knopf");
  if (kopf && knopf) {
    var setzen = function (offen) {
      kopf.classList.toggle("offen", offen);
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
    };
    knopf.addEventListener("click", function () {
      setzen(knopf.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && knopf.getAttribute("aria-expanded") === "true") {
        setzen(false);
        knopf.focus();
      }
    });
  }

  // The contents list follows the reader: a thin gold line marks the section.
  var punkte = Array.prototype.slice.call(document.querySelectorAll(".still-inhalt a"));
  if (punkte.length && "IntersectionObserver" in window) {
    var nachId = {};
    punkte.forEach(function (k) { nachId[decodeURIComponent(k.getAttribute("href").slice(1))] = k; });
    var spaeher = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting) return;
        punkte.forEach(function (k) { k.classList.remove("an"); });
        if (nachId[e.target.id]) nachId[e.target.id].classList.add("an");
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(nachId).forEach(function (id) {
      var h = document.getElementById(id);
      if (h) spaeher.observe(h);
    });
  }

  if (ruhig) return;

  // Cards and rooms are laid in place as they come into view, like stones.
  if ("IntersectionObserver" in window) {
    var zeigen = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("da");
          zeigen.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -5% 0px" });
    document.querySelectorAll(".quader, .raeume > li, .still-verzeichnis__raum, .still-tafel").forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95) return; // already on screen: leave it alone
      el.classList.add("still-auftritt");
      el.style.transitionDelay = (i % 3) * 110 + "ms";
      zeigen.observe(el);
    });
  }

  // Spanien, Weltmeister 2026: once per visit, red and gold ribbons rise
  // from the cup and drift down through the header — never over the text.
  try {
    if (sessionStorage.getItem("zufiq-wm26")) return;
    sessionStorage.setItem("zufiq-wm26", "1");
  } catch (e) { /* storage blocked: show it anyway, it is short */ }
  var pokal = document.querySelector(".still-wm__pokal");
  if (!pokal || !kopf) return;
  var unten = kopf.getBoundingClientRect().bottom + window.pageYOffset;
  if (unten < 60) return;
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:absolute;left:0;top:0;width:100%;height:" + unten + "px;pointer-events:none;z-index:40";
  document.body.appendChild(cv);
  var g = cv.getContext && cv.getContext("2d");
  if (!g) { cv.remove(); return; }
  var k = Math.min(2, window.devicePixelRatio || 1);
  var W = (cv.width = Math.round(document.documentElement.clientWidth * k));
  var H = (cv.height = Math.round(unten * k));
  var pr = pokal.getBoundingClientRect();
  var x0 = (pr.left + pr.width / 2) * k, y0 = (pr.top + window.pageYOffset + pr.height / 2) * k;
  var farben = ["#b0151e", "#f1bf00", "#c8102e", "#e3c88a", "#d9b25c", "#b0151e"];
  var baender = [];
  for (var i = 0; i < 54; i++) {
    var winkel = (-165 + Math.random() * 150) * Math.PI / 180;
    var tempo = (2.6 + Math.random() * 5.2) * k;
    baender.push({
      x: x0, y: y0,
      vx: Math.cos(winkel) * tempo * 1.25, vy: Math.sin(winkel) * tempo,
      len: (12 + Math.random() * 16) * k, breite: (2.4 + Math.random() * 1.8) * k,
      dreh: Math.random() * Math.PI * 2, drehV: (Math.random() - 0.5) * 0.09,
      phase: Math.random() * Math.PI * 2, c: farben[i % farben.length],
    });
  }
  function band(b) {
    g.save();
    g.translate(b.x, b.y);
    g.rotate(b.dreh);
    g.strokeStyle = b.c;
    g.lineWidth = b.breite;
    g.lineCap = "round";
    g.beginPath();
    for (var s = 0; s <= 8; s++) {
      var t = s / 8, px = (t - 0.5) * b.len, py = Math.sin(t * Math.PI * 2 + b.phase) * b.breite * 1.4;
      if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.stroke();
    g.restore();
  }
  var t0 = performance.now(), vorher = t0;
  (function bild(t) {
    var alter = t - t0, f = Math.min(3, (t - vorher) / 16.7);
    vorher = t;
    g.clearRect(0, 0, W, H);
    g.globalAlpha = alter > 1800 ? Math.max(0, 1 - (alter - 1800) / 700) : 1;
    baender.forEach(function (b) {
      b.vx *= Math.pow(0.975, f);
      b.vy = b.vy * Math.pow(0.975, f) + 0.11 * k * f;
      b.x += b.vx * f;
      b.y += b.vy * f;
      b.dreh += b.drehV * f;
      b.phase += 0.16 * f;
      if (b.y < H + b.len) band(b);
    });
    if (alter < 2500) requestAnimationFrame(bild);
    else cv.remove();
  })(t0);
})();
