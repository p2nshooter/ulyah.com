// XDAILY — small, dependency-free behaviour: menu toggle, the reading gauge
// (a ring that fills as you read and takes you back to the top), reveal-on-
// scroll for cards and fields, the "you are here" mark on the flight path,
// the sun held still for reduced motion, and one burst of red-gold stars per
// session for Spain's 2026 title. Without it the page is plain and fully
// readable.
(function () {
  var doc = document.documentElement;
  doc.classList.add("js");
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The sun travels its arc with SMIL, which CSS cannot stop: pause it.
  if (still) document.querySelectorAll("svg.vane-szene").forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });

  var toggle = document.querySelector(".orbit-toggle");
  var nav = document.getElementById("orbit-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
        toggle.focus();
      }
    });
  }

  var here = location.pathname;
  document.querySelectorAll(".orbit-nav__item, .orbit-service a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === here || (href !== "/" && here.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
  });

  var gauge = document.querySelector(".orbit-gauge");
  var arc = gauge && gauge.querySelector(".orbit-gauge__arc");
  var text = document.querySelector(".orbit-text");
  if (gauge && arc && text) {
    var tick = false;
    var update = function () {
      var r = text.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      arc.setAttribute("stroke-dasharray", (p * 100).toFixed(1) + " 100");
      gauge.classList.toggle("is-on", window.scrollY > 400);
      tick = false;
    };
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    gauge.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" }); });
    update();
  }

  var items = document.querySelectorAll(".gyre-card, .orbit-field");
  if ("IntersectionObserver" in window && !still) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-seen"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 90 + "ms"; io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-seen"); });
  }

  var links = document.querySelectorAll(".orbit-toc a");
  if (links.length && "IntersectionObserver" in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (a) { a.classList.remove("is-here"); });
          map[en.target.id].classList.add("is-here");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var h = document.getElementById(id); if (h) spy.observe(h); });
  }

  var shown = false;
  try { shown = sessionStorage.getItem("xdaily-burst") === "1"; } catch (e) { shown = true; }
  if (!still && !shown) {
    try { sessionStorage.setItem("xdaily-burst", "1"); } catch (e) {}
    var box = document.createElement("div");
    box.className = "orbit-party";
    box.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 30; i++) {
      var s = document.createElement("i");
      var angle = (i / 30) * Math.PI * 2 + Math.random() * 0.3;
      var dist = 140 + Math.random() * 220;
      s.style.setProperty("--x", Math.round(Math.cos(angle) * dist) + "px");
      s.style.setProperty("--y", Math.round(Math.sin(angle) * dist) + "px");
      s.style.setProperty("--d", (Math.random() * 0.3).toFixed(2) + "s");
      s.style.setProperty("--t", (1.3 + Math.random() * 0.8).toFixed(2) + "s");
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 2800);
  }
})();
