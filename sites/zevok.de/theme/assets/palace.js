/* ZEVOK — water in the bronze basin. Decoration and small comforts only:
   every page works without this file, and under prefers-reduced-motion
   nothing moves. */
(function () {
  "use strict";
  var doc = document;
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile menu: a real button with aria-expanded; Escape closes it.
  var haupt = doc.querySelector(".erz-haupt");
  var schalter = doc.querySelector(".erz-schalter");
  if (haupt && schalter) {
    var wort = schalter.querySelector(".erz-schalter__wort");
    var setze = function (offen) {
      haupt.classList.toggle("erz-offen", offen);
      schalter.setAttribute("aria-expanded", offen ? "true" : "false");
      if (wort) wort.textContent = offen ? "Schließen" : "Menü";
    };
    schalter.addEventListener("click", function () {
      setze(schalter.getAttribute("aria-expanded") !== "true");
    });
    doc.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && schalter.getAttribute("aria-expanded") === "true") {
        setze(false);
        schalter.focus();
      }
    });
  }

  // On small screens the contents list starts folded, so the text comes first.
  var klappe = doc.querySelector(".erz-inhalt__klappe");
  if (klappe && window.matchMedia && window.matchMedia("(max-width: 960px)").matches) klappe.removeAttribute("open");

  // The contents list follows the reader.
  var punkte = Array.prototype.slice.call(doc.querySelectorAll(".erz-inhalt a"));
  if (punkte.length && "IntersectionObserver" in window) {
    var nachId = {};
    punkte.forEach(function (a) { nachId[decodeURIComponent(a.getAttribute("href").slice(1))] = a; });
    var spaeher = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting || !nachId[e.target.id]) return;
        punkte.forEach(function (a) { a.classList.remove("erz-hier"); });
        nachId[e.target.id].classList.add("erz-hier");
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(nachId).forEach(function (id) { var h = doc.getElementById(id); if (h) spaeher.observe(h); });
  }

  // Reading gauge: the water line at the top rises as you read a guide.
  var text = doc.querySelector(".erz-ratgeber .erz-text");
  var pegel = doc.querySelector(".erz-lesepegel");
  if (text && pegel) {
    var wartet = false;
    var miss = function () {
      wartet = false;
      var r = text.getBoundingClientRect();
      var weg = Math.max(1, r.height - window.innerHeight * 0.6);
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.2 - r.top) / weg));
      pegel.style.setProperty("--p", p.toFixed(4));
    };
    var bitte = function () { if (!wartet) { wartet = true; requestAnimationFrame(miss); } };
    window.addEventListener("scroll", bitte, { passive: true });
    window.addEventListener("resize", bitte);
    miss();
  }

  if (ruhig) return;

  // Cards and basins rise gently into view, once.
  if ("IntersectionObserver" in window) {
    var zeige = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("erz-da"); zeige.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -5% 0px" });
    var stufe = 0;
    doc.querySelectorAll(".erz-schale, .erz-tafel, .erz-regel, .erz-verzeichnis section").forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) return; // already on screen: never hide it
      el.classList.add("erz-auftauchen");
      el.style.transitionDelay = (stufe++ % 3) * 90 + "ms";
      zeige.observe(el);
    });
  }

  // Spanien, Weltmeister 2026: once per visit, red, yellow and golden soap
  // bubbles and a few lily petals burst from the trophy, drift and pop.
  // About 2.5 seconds, never clickable, never in the way.
  try {
    if (sessionStorage.getItem("zevok-wm26")) return;
    sessionStorage.setItem("zevok-wm26", "1");
  } catch (e) { /* storage blocked: show it anyway */ }
  var pokal = doc.querySelector(".erz-wm__pokal");
  if (!pokal) return;
  var start = pokal.getBoundingClientRect();
  var cv = doc.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90";
  doc.body.appendChild(cv);
  var g = cv.getContext && cv.getContext("2d");
  if (!g) { cv.remove(); return; }
  var k = Math.min(2, window.devicePixelRatio || 1);
  var W = (cv.width = Math.round(window.innerWidth * k));
  var H = (cv.height = Math.round(window.innerHeight * k));
  var ox = (start.left + start.width / 2) * k;
  var oy = (start.top + start.height / 2) * k;
  var farben = ["198,11,30", "255,196,0", "242,194,48", "198,11,30", "255,196,0", "217,162,95"];
  var teile = [];
  for (var i = 0; i < 54; i++) {
    var winkel = Math.PI * (0.06 + Math.random() * 0.88); // a fan opening downwards
    var tempo = (4 + Math.random() * 9) * k;
    teile.push({
      blatt: i % 4 === 3, // every fourth piece is a golden lily petal
      x: ox + (Math.random() * 2 - 1) * 60 * k,
      y: oy,
      vx: Math.cos(winkel) * tempo * (Math.random() < 0.5 ? -1 : 1) * 1.4,
      vy: Math.sin(winkel) * tempo * 0.75,
      r: (5 + Math.random() * 9) * k,
      c: farben[i % farben.length],
      dreh: Math.random() * Math.PI * 2,
      drehV: (Math.random() - 0.5) * 0.12,
      phase: Math.random() * Math.PI * 2,
      platzt: 1700 + Math.random() * 700,
    });
  }
  function blase(p, a) {
    var grad = g.createRadialGradient(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.1, p.x, p.y, p.r);
    grad.addColorStop(0, "rgba(255,255,255," + 0.55 * a + ")");
    grad.addColorStop(0.55, "rgba(" + p.c + "," + 0.12 * a + ")");
    grad.addColorStop(0.92, "rgba(" + p.c + "," + 0.75 * a + ")");
    grad.addColorStop(1, "rgba(" + p.c + ",0)");
    g.fillStyle = grad;
    g.beginPath(); g.arc(p.x, p.y, p.r, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255," + 0.9 * a + ")";
    g.beginPath(); g.arc(p.x - p.r * 0.38, p.y - p.r * 0.4, p.r * 0.16, 0, Math.PI * 2); g.fill();
  }
  function blatt(p, a) {
    g.save();
    g.translate(p.x, p.y);
    g.rotate(p.dreh);
    g.fillStyle = "rgba(" + (p.c === "198,11,30" ? "198,11,30" : "233,190,125") + "," + a + ")";
    g.beginPath();
    g.moveTo(0, -p.r);
    g.bezierCurveTo(p.r * 0.7, -p.r * 0.4, p.r * 0.6, p.r * 0.5, 0, p.r);
    g.bezierCurveTo(-p.r * 0.6, p.r * 0.5, -p.r * 0.7, -p.r * 0.4, 0, -p.r);
    g.fill();
    g.restore();
  }
  var t0 = performance.now();
  (function bild(t) {
    var alter = t - t0;
    g.clearRect(0, 0, W, H);
    var lebend = 0;
    teile.forEach(function (p) {
      p.vx *= 0.955; p.vy = p.vy * 0.955 + (p.blatt ? 0.11 : -0.035) * k; // petals sink, bubbles float
      p.phase += 0.06;
      p.x += p.vx + Math.sin(p.phase) * 0.6 * k;
      p.y += p.vy;
      p.dreh += p.drehV;
      var a = 1;
      if (alter > p.platzt) {
        var f = (alter - p.platzt) / 260; // the pop: a quick swell, then gone
        if (f >= 1) return;
        a = 1 - f;
        if (!p.blatt) p.r *= 1.03;
      }
      lebend++;
      if (p.blatt) blatt(p, a); else blase(p, a);
    });
    if (lebend && alter < 2700) requestAnimationFrame(bild); else cv.remove();
  })(t0);
})();
