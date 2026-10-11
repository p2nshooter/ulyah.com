// DAI — menu toggle, reading progress (guides only), active entry in the
// "memoria" table of contents, and for España 2026 a once-per-session rain of
// small red-and-gold azulejo tiles that settles and fades within ~3 seconds.
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var b = document.querySelector(".cedro-menu-boton");
  var nav = document.getElementById("cedro-nav");
  if (b && nav) {
    b.addEventListener("click", function () {
      var o = nav.classList.toggle("abierta");
      b.setAttribute("aria-expanded", o ? "true" : "false");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("abierta")) { nav.classList.remove("abierta"); b.setAttribute("aria-expanded", "false"); b.focus(); }
    });
  }

  var bar = document.querySelector(".cedro-avance span");
  var txt = document.querySelector(".cedro--guia .cedro-texto");
  if (bar && txt) {
    var go = function () {
      var r = txt.getBoundingClientRect(), span = r.height - window.innerHeight * 0.5;
      bar.style.width = (span > 0 ? Math.min(1, Math.max(0, -r.top / span)) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", go, { passive: true });
    window.addEventListener("resize", go);
    go();
  }

  var idx = document.querySelectorAll(".cedro-memoria__indice a");
  if (idx.length && "IntersectionObserver" in window) {
    var refs = {};
    idx.forEach(function (a) { refs[decodeURIComponent(a.hash.slice(1))] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && refs[e.target.id]) { idx.forEach(function (a) { a.classList.remove("aqui"); }); refs[e.target.id].classList.add("aqui"); }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(refs).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  var KEY = "dai-lat-wm26";
  var shown = true;
  try { shown = sessionStorage.getItem(KEY) === "1"; sessionStorage.setItem(KEY, "1"); } catch (e) { shown = true; }
  if (shown || reduce) return;
  var c = document.createElement("canvas");
  c.className = "cedro-confeti";
  c.setAttribute("aria-hidden", "true");
  document.body.appendChild(c);
  var x = c.getContext("2d");
  var dpr = Math.min(2, window.devicePixelRatio || 1), W, H;
  var size = function () { W = window.innerWidth; H = window.innerHeight; c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size();
  var tiles = [];
  for (var i = 0; i < 70; i++) tiles.push({ x: Math.random() * W, y: -30 - Math.random() * H * 0.6, s: 8 + Math.random() * 7, vy: 2 + Math.random() * 2.5, vx: -0.6 + Math.random() * 1.2, a: Math.random() * 6.28, va: -0.06 + Math.random() * 0.12, red: i % 2 === 0 });
  var tile = function (t) {
    x.save(); x.translate(t.x, t.y); x.rotate(t.a);
    x.fillStyle = t.red ? "#c60b1e" : "#ffc400";
    x.fillRect(-t.s / 2, -t.s / 2, t.s, t.s);
    x.fillStyle = t.red ? "#ffc400" : "#c60b1e";
    x.beginPath(); x.moveTo(0, -t.s * 0.38); x.lineTo(t.s * 0.38, 0); x.lineTo(0, t.s * 0.38); x.lineTo(-t.s * 0.38, 0); x.closePath(); x.fill();
    x.restore();
  };
  var st = performance.now();
  var loop = function (now) {
    var el = now - st;
    x.clearRect(0, 0, W, H);
    x.globalAlpha = el > 2200 ? Math.max(0, 1 - (el - 2200) / 800) : 1;
    tiles.forEach(function (t) { t.x += t.vx; t.y += t.vy; t.a += t.va; tile(t); });
    if (el < 3000) requestAnimationFrame(loop); else c.remove();
  };
  window.addEventListener("resize", size);
  requestAnimationFrame(loop);
})();
