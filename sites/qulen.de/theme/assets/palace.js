/* QULEN — das hörende Herz. Nur Komfort und Dekoration: Jede Seite
   funktioniert ohne dieses Skript, und unter prefers-reduced-motion bleibt
   alles still (kein Erscheinen, keine Feier). */
(function () {
  "use strict";
  var doc = document.documentElement;
  var ruhig = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // ── Menü auf schmalen Bildschirmen ────────────────────────────────────
  var kopf = document.querySelector(".hh-kopf");
  var knopf = document.querySelector(".hh-knopf");
  if (kopf && knopf) {
    var setze = function (offen) {
      kopf.classList.toggle("offen", offen);
      knopf.setAttribute("aria-expanded", offen ? "true" : "false");
    };
    knopf.addEventListener("click", function () {
      setze(knopf.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if ((e.key === "Escape" || e.key === "Esc") && knopf.getAttribute("aria-expanded") === "true") {
        setze(false);
        knopf.focus();
      }
    });
  }

  // ── Inhaltsverzeichnis: auf dem Handy eingeklappt, folgt dem Lesen ────
  var klappe = document.querySelector(".hh-inhalt__klappe");
  if (klappe && window.matchMedia && window.matchMedia("(max-width: 880px)").matches) klappe.open = false;

  var punkte = Array.prototype.slice.call(document.querySelectorAll(".hh-inhalt a"));
  if (punkte.length && "IntersectionObserver" in window) {
    var nachId = {};
    punkte.forEach(function (p) { nachId[decodeURIComponent(p.getAttribute("href").slice(1))] = p; });
    var spaeher = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (!e.isIntersecting || !nachId[e.target.id]) return;
        punkte.forEach(function (p) { p.classList.remove("an"); });
        nachId[e.target.id].classList.add("an");
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(nachId).forEach(function (id) {
      var h = document.getElementById(id);
      if (h) spaeher.observe(h);
    });
  }

  // ── Lesefaden: die Tintenspur zeigt, wie weit du gelesen hast ─────────
  var text = document.querySelector(".hh-text");
  var faden = document.querySelector(".hh-lesefaden");
  if (text && faden) {
    var plan = false;
    var miss = function () {
      plan = false;
      var r = text.getBoundingClientRect();
      var weg = Math.max(1, r.height - window.innerHeight * 0.5);
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.25 - r.top) / weg));
      faden.style.setProperty("--p", p.toFixed(4));
    };
    var bitte = function () {
      if (!plan) { plan = true; window.requestAnimationFrame(miss); }
    };
    window.addEventListener("scroll", bitte, { passive: true });
    window.addEventListener("resize", bitte);
    miss();
  }

  if (ruhig) return;

  // ── Sanftes Erscheinen beim Scrollen ──────────────────────────────────
  if ("IntersectionObserver" in window) {
    doc.classList.add("hh-bewegt");
    var zeige = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("da"); zeige.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".hh-karte, .hh-trenn > li, .hh-weg__schritte > li, .hh-verzeichnis section").forEach(function (el, i) {
      el.classList.add("hh-erscheint");
      el.style.transitionDelay = (i % 3) * 110 + "ms";
      zeige.observe(el);
    });
    document.querySelectorAll(".hh-ueber").forEach(function (el) { zeige.observe(el); });
  }

  // ── Spanien, Weltmeister 2026: einmal pro Besuch steigen rot-gelbe
  //    Papierflieger und Goldsterne aus dem Pokal auf. Nur über Band und
  //    Kopf, nie über dem Text, nie anklickbar. ─────────────────────────
  try {
    if (window.sessionStorage.getItem("qulen-wm26")) return;
    window.sessionStorage.setItem("qulen-wm26", "1");
  } catch (e) { /* Speicher gesperrt: dann eben trotzdem einmal feiern */ }
  var pokal = document.querySelector(".hh-wm__pokal");
  if (!pokal || !kopf) return;

  var hoehe = Math.round(kopf.getBoundingClientRect().bottom + window.pageYOffset);
  var breite = doc.clientWidth;
  if (hoehe < 40 || breite < 200) return;
  var cv = document.createElement("canvas");
  cv.setAttribute("aria-hidden", "true");
  cv.style.cssText = "position:absolute;left:0;top:0;width:" + breite + "px;height:" + hoehe + "px;pointer-events:none;z-index:30";
  var g = cv.getContext && cv.getContext("2d");
  if (!g) return;
  var k = Math.min(2, window.devicePixelRatio || 1);
  cv.width = Math.round(breite * k);
  cv.height = Math.round(hoehe * k);
  document.body.appendChild(cv);
  g.scale(k, k);

  var pr = pokal.getBoundingClientRect();
  var ox = pr.left + pr.width / 2;
  var oy = pr.top + window.pageYOffset + pr.height / 2;
  var farben = ["#b3141c", "#f2bf1a", "#c69a3e", "#ecc874", "#cf4a2c"];
  var teile = [];
  for (var i = 0; i < 56; i++) {
    var winkel = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.25;
    var tempo = 2.2 + Math.random() * 5.2;
    teile.push({
      x: ox, y: oy,
      vx: Math.cos(winkel) * tempo * (breite > 700 ? 1.6 : 1),
      vy: Math.sin(winkel) * tempo,
      dreh: Math.random() * Math.PI * 2,
      drehV: (Math.random() - 0.5) * 0.16,
      s: 0.7 + Math.random() * 0.7,
      art: i % 3 === 0 ? "stern" : "flieger",
      c: farben[i % farben.length],
    });
  }
  function flieger(t) {
    g.fillStyle = t.c;
    g.beginPath(); g.moveTo(-7, -4.5); g.lineTo(8, 0); g.lineTo(-7, 4.5); g.lineTo(-3.5, 0); g.closePath(); g.fill();
    g.fillStyle = t.c === "#f2bf1a" ? "#b3141c" : "#f2bf1a";
    g.beginPath(); g.moveTo(-3.5, 0); g.lineTo(8, 0); g.lineTo(-7, 4.5); g.closePath(); g.fill();
  }
  function stern(t) {
    g.fillStyle = t.c === "#b3141c" ? "#ecc874" : t.c;
    g.beginPath();
    for (var n = 0; n < 10; n++) {
      var r = n % 2 ? 2.6 : 6;
      var w = -Math.PI / 2 + (n * Math.PI) / 5;
      if (n) g.lineTo(Math.cos(w) * r, Math.sin(w) * r); else g.moveTo(Math.cos(w) * r, Math.sin(w) * r);
    }
    g.closePath(); g.fill();
  }
  var dauer = 2500;
  var start = 0;
  var zuletzt = 0;
  function bild(t) {
    if (!start) { start = t; zuletzt = t; }
    var alter = t - start;
    var f = Math.min(3, (t - zuletzt) / 16.7);
    zuletzt = t;
    g.clearRect(0, 0, breite, hoehe);
    g.globalAlpha = alter > dauer - 650 ? Math.max(0, (dauer - alter) / 650) : 1;
    teile.forEach(function (p) {
      p.vy += 0.13 * f;
      p.vx *= Math.pow(0.986, f);
      p.vy *= Math.pow(0.992, f);
      p.x += p.vx * f;
      p.y += p.vy * f;
      p.dreh += p.drehV * f;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.art === "flieger" ? Math.atan2(p.vy, p.vx) : p.dreh);
      g.scale(p.s, p.s);
      if (p.art === "flieger") flieger(p); else stern(p);
      g.restore();
    });
    if (alter < dauer) window.requestAnimationFrame(bild);
    else if (cv.parentNode) cv.parentNode.removeChild(cv);
  }
  window.requestAnimationFrame(bild);
})();
