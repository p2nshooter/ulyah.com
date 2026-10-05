/* ZOLUN — life aboard the Tarshish ships. Decoration and comfort only: every
   page works without this file, and all motion stops under
   prefers-reduced-motion. */
(function () {
  "use strict";
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var deck = document.querySelector(".tar-deck");
  var ruder = document.querySelector(".tar-ruder");

  // The helm opens and closes the menu on small screens.
  if (deck && ruder) {
    var setzen = function (offen) {
      deck.classList.toggle("offen", offen);
      ruder.setAttribute("aria-expanded", offen ? "true" : "false");
    };
    ruder.addEventListener("click", function () {
      setzen(!deck.classList.contains("offen"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && deck.classList.contains("offen")) {
        setzen(false);
        ruder.focus();
      }
    });
  }

  // The brand compass turns its needle towards the course you point at,
  // and back to the course of the page you are on when you leave the menu.
  var rose = document.querySelector(".tar-marke__rose");
  var nadel = rose && rose.querySelector(".tar-marke__nadel");
  var kurse = Array.prototype.slice.call(document.querySelectorAll(".tar-steuer .kurs"));
  if (rose && nadel && !ruhig) {
    var peilung = function (el) {
      var r = rose.getBoundingClientRect();
      var z = el.getBoundingClientRect();
      if (!z.width || !r.width) return 0;
      var dx = z.left + z.width / 2 - (r.left + r.width / 2);
      var dy = z.top + z.height / 2 - (r.top + r.height / 2);
      return (Math.atan2(dx, -dy) * 180) / Math.PI;
    };
    var aktuell = 0;
    var drehen = function (grad) {
      // Take the short way round, like a real needle.
      var d = ((grad - aktuell + 540) % 360) - 180;
      aktuell += d;
      nadel.style.setProperty("--peilung", aktuell.toFixed(1) + "deg");
    };
    var heimat = kurse.filter(function (k) { return k.hasAttribute("aria-current"); })[0];
    var zurueck = function () { drehen(heimat ? peilung(heimat) : 0); };
    kurse.forEach(function (k) {
      k.addEventListener("pointerenter", function () { drehen(peilung(k)); });
      k.addEventListener("focus", function () { drehen(peilung(k)); });
      k.addEventListener("pointerleave", zurueck);
      k.addEventListener("blur", zurueck);
    });
    // After the needle has settled on load, it finds the current course.
    setTimeout(zurueck, 2500);
  }

  // The little ship sails along the route as you read a guide.
  var text = document.querySelector(".tar-logbuch__text");
  var fahrt = document.querySelector(".tar-kursbuch__fahrt");
  if (text && fahrt) {
    var messen = function () {
      var r = text.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (window.innerHeight * 0.35 - r.top) / Math.max(1, r.height - window.innerHeight * 0.4)));
      fahrt.style.setProperty("--p", p.toFixed(4));
    };
    addEventListener("scroll", messen, { passive: true });
    addEventListener("resize", messen);
    messen();
  }

  // The table of contents follows the reader.
  var punkte = Array.prototype.slice.call(document.querySelectorAll(".tar-kursbuch__inhalt a"));
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

  // Cards come in like sails over the horizon.
  if ("IntersectionObserver" in window) {
    var zeigen = new IntersectionObserver(function (eintraege) {
      eintraege.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("da");
          zeigen.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".segel, .tar-kompasse li, .tar-seekarte__spalten section, .tar-anbord__liste li").forEach(function (el, i) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight) return; // already in view: never hide it
      el.classList.add("tar-erscheint");
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      zeigen.observe(el);
    });
  }

  // Spanien, Weltmeister 2026: once per visit the fleet fires a salute of
  // red-and-gold pennants and gold coins from the trophy. It stays inside
  // the header, cannot be clicked and is gone after about 2.5 seconds.
  try {
    if (sessionStorage.getItem("zolun-wm26")) return;
    sessionStorage.setItem("zolun-wm26", "1");
  } catch (e) { /* storage blocked: show it anyway */ }
  var oben = document.querySelector(".tar-oben");
  var pokal = document.querySelector(".tar-wm__pokal");
  if (!oben || !pokal) return;
  var cv = document.createElement("canvas");
  cv.className = "tar-feier";
  cv.setAttribute("aria-hidden", "true");
  oben.appendChild(cv);
  var g = cv.getContext && cv.getContext("2d");
  if (!g) { cv.remove(); return; }
  var k = Math.min(2, window.devicePixelRatio || 1);
  var box = oben.getBoundingClientRect();
  var W = (cv.width = Math.round(box.width * k));
  var H = (cv.height = Math.round(box.height * k));
  var pr = pokal.getBoundingClientRect();
  var ox = (pr.left + pr.width / 2 - box.left) * k;
  var oy = (pr.top + pr.height / 2 - box.top) * k;
  var teile = [];
  for (var i = 0; i < 64; i++) {
    var winkel = Math.PI * (0.06 + Math.random() * 0.88); // a fan opening downwards
    var tempo = (2.2 + Math.random() * 5.2) * k;
    teile.push({
      x: ox, y: oy,
      vx: Math.cos(winkel) * tempo * (Math.random() < 0.5 ? -1 : 1) * 1.6,
      vy: Math.sin(winkel) * tempo * 0.55 - 1.2 * k,
      s: (0.75 + Math.random() * 0.55) * k,
      dreh: Math.random() * Math.PI * 2,
      drehV: (Math.random() - 0.5) * 0.22,
      art: i % 3, // 0 Spanish pennant, 1 gold coin, 2 brass pennant
      phase: Math.random() * Math.PI * 2,
    });
  }
  function wimpel(farbig) {
    if (farbig) {
      g.fillStyle = "#c60b1e";
      g.beginPath(); g.moveTo(-7, -5); g.lineTo(9, 0); g.lineTo(-7, 5); g.closePath(); g.fill();
      g.fillStyle = "#ffc400";
      g.beginPath(); g.moveTo(-7, -2.4); g.lineTo(4.5, 0); g.lineTo(-7, 2.4); g.closePath(); g.fill();
    } else {
      g.fillStyle = "#e2c27a";
      g.beginPath(); g.moveTo(-7, -5); g.lineTo(9, 0); g.lineTo(-7, 5); g.closePath(); g.fill();
    }
    g.fillStyle = "#7a5622";
    g.fillRect(-8, -6, 1.6, 12);
  }
  function taler(p) {
    var flip = Math.abs(Math.cos(p.phase));
    g.scale(Math.max(0.15, flip), 1);
    g.fillStyle = "#e9b543";
    g.beginPath(); g.arc(0, 0, 5.2, 0, Math.PI * 2); g.fill();
    g.strokeStyle = "#fff1c2"; g.lineWidth = 1.2;
    g.beginPath(); g.arc(0, 0, 3.3, 0, Math.PI * 2); g.stroke();
  }
  var t0 = performance.now();
  (function bild(t) {
    var alter = t - t0;
    g.clearRect(0, 0, W, H);
    g.globalAlpha = alter > 1900 ? Math.max(0, 1 - (alter - 1900) / 600) : 1;
    teile.forEach(function (p) {
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.09 * k;
      p.x += p.vx; p.y += p.vy;
      p.dreh += p.drehV; p.phase += 0.16;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.dreh);
      g.scale(p.s, p.s);
      if (p.art === 1) taler(p); else wimpel(p.art === 0);
      g.restore();
    });
    if (alter < 2500) requestAnimationFrame(bild);
    else cv.remove();
  })(t0);
})();
