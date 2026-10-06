/* QURM — small life around the watchtower. Decoration only: every page
   works without it, and all motion stops under prefers-reduced-motion. */
(function () {
  "use strict";
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Mobile: the "Wege" button opens the signposts.
  var kopf = document.querySelector(".warte-kopf");
  var knopf = document.querySelector(".warte-knopf");
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

  // The signpost of the path you are on stays lit.
  var pfadLink = document.querySelector(".warte-pfad a[href^='/wegweiser/']");
  var hier = pfadLink ? pfadLink.getAttribute("href") : location.pathname;
  document.querySelectorAll(".pfosten").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === hier || (href !== "/" && hier.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
  });

  // Reading progress: the route profile under the header fills to the summit.
  var text = document.querySelector(".warte-text__inhalt");
  var hoehe = document.querySelector(".warte-hoehe");
  if (text && hoehe) {
    var wartet = false;
    var miss = function () {
      wartet = false;
      var r = text.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.3 - r.top) / Math.max(1, r.height - window.innerHeight * 0.4)));
      hoehe.style.setProperty("--p", p.toFixed(4));
    };
    var bitte = function () { if (!wartet) { wartet = true; requestAnimationFrame(miss); } };
    addEventListener("scroll", bitte, { passive: true });
    addEventListener("resize", bitte);
    miss();
  }

  // The waypoint list in the summit log follows the reader.
  var punkte = Array.prototype.slice.call(document.querySelectorAll(".gipfelbuch__inhalt a"));
  if (punkte.length && "IntersectionObserver" in window) {
    var nachId = {};
    punkte.forEach(function (k) { nachId[decodeURIComponent(k.getAttribute("href").slice(1))] = k; });
    var spaeher = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        punkte.forEach(function (k) { k.classList.remove("an"); });
        if (nachId[e.target.id]) nachId[e.target.id].classList.add("an");
      });
    }, { rootMargin: "-22% 0px -68% 0px" });
    Object.keys(nachId).forEach(function (id) { var h = document.getElementById(id); if (h) spaeher.observe(h); });
  }

  if (ruhig) return;

  // Boards and stage cards come up the path as they scroll into view.
  if ("IntersectionObserver" in window) {
    var zeig = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("da"); zeig.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".wegtafel, .etappe, .warte-netz__spalten > section").forEach(function (el, i) {
      el.classList.add("warte-erscheint");
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      zeig.observe(el);
    });
  }

  // Spanien, Weltmeister 2026: once per visit, small summit pennants in red
  // and yellow flutter down from the tower and are gone after three seconds.
  try {
    if (sessionStorage.getItem("qurm-wm26")) return;
    sessionStorage.setItem("qurm-wm26", "1");
  } catch (e) { /* storage blocked: show it anyway */ }
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:90";
  document.body.appendChild(cv);
  var g = cv.getContext("2d");
  if (!g) { cv.remove(); return; }
  var k = Math.min(2, window.devicePixelRatio || 1);
  var W = (cv.width = innerWidth * k), H = (cv.height = innerHeight * k);
  var farben = ["#c60b1e", "#ffc400", "#c60b1e", "#ffc400", "#e8a400"];
  var wimpel = [];
  for (var i = 0; i < 52; i++) {
    wimpel.push({
      x: Math.random() * W, y: -Math.random() * H * 0.55 - 24 * k,
      s: (0.7 + Math.random() * 0.7) * k, vy: (1.5 + Math.random() * 2.1) * k,
      dreh: Math.random() * Math.PI * 2, drehV: (Math.random() - 0.5) * 0.09,
      wind: Math.random() * Math.PI * 2, flattern: Math.random() * Math.PI * 2,
      c: farben[i % farben.length], streifen: i % 3 === 0,
    });
  }
  // A pennant: a short pole and a triangular flag; every third one in the
  // rojigualda stripes (red, yellow, red).
  function zeichne(p) {
    g.save();
    g.translate(p.x, p.y);
    g.rotate(p.dreh);
    g.scale(p.s, p.s);
    var f = Math.sin(p.flattern) * 2.2;
    g.fillStyle = "#f8f9f7";
    g.fillRect(-1, -9, 1.6, 20);
    g.beginPath();
    g.moveTo(0.6, -9);
    g.quadraticCurveTo(8, -7 + f, 15, -3.5 + f);
    g.quadraticCurveTo(8, -0 + f, 0.6, 2);
    g.closePath();
    if (p.streifen) {
      var gr = g.createLinearGradient(0, -9, 0, 2);
      gr.addColorStop(0, "#c60b1e"); gr.addColorStop(0.25, "#c60b1e");
      gr.addColorStop(0.25, "#ffc400"); gr.addColorStop(0.75, "#ffc400");
      gr.addColorStop(0.75, "#c60b1e"); gr.addColorStop(1, "#c60b1e");
      g.fillStyle = gr;
    } else g.fillStyle = p.c;
    g.fill();
    g.restore();
  }
  var t0 = performance.now();
  (function bild(t) {
    var alter = t - t0;
    g.clearRect(0, 0, W, H);
    g.globalAlpha = alter > 2300 ? Math.max(0, 1 - (alter - 2300) / 700) : 1;
    wimpel.forEach(function (p) {
      p.wind += 0.028; p.flattern += 0.25; p.dreh += p.drehV;
      p.y += p.vy; p.x += Math.sin(p.wind) * 1.2 * k;
      zeichne(p);
    });
    if (alter < 3000) requestAnimationFrame(bild); else cv.remove();
  })(t0);
})();
