// ZOEVIAN — small, dependency-free behaviour: menu toggle, the reading flight
// (a bird along a golden line), reveal-on-scroll for cards and topics, the
// "you are here" mark in the contents, and one short drift of red-gold
// feathers per session for Spain's 2026 title. Without it the page is plain
// and fully readable.
(function () {
  var doc = document.documentElement;
  doc.classList.add("js");
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var toggle = document.querySelector(".zedern-schalter");
  var nav = document.getElementById("zedern-nav");
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
  document.querySelectorAll(".zedern-nav__item").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === here || (href !== "/" && here.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
  });

  var bar = document.querySelector(".zedern-flugbahn span");
  var text = document.querySelector(".zedern-text");
  if (bar && text) {
    var tick = false;
    var update = function () {
      var r = text.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      bar.style.setProperty("--p", p.toFixed(4));
      tick = false;
    };
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  var items = document.querySelectorAll(".feder-karte, .zedern-thema");
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

  var links = document.querySelectorAll(".zedern-inhalt a");
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
  try { shown = sessionStorage.getItem("zoevian-feier") === "1"; } catch (e) { shown = true; }
  if (!still && !shown) {
    try { sessionStorage.setItem("zoevian-feier", "1"); } catch (e) {}
    var box = document.createElement("div");
    box.className = "zedern-feier";
    box.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 24; i++) {
      var f = document.createElement("i");
      f.style.left = Math.round(Math.random() * 100) + "vw";
      f.style.setProperty("--x", Math.round(Math.random() * 90 - 45) + "px");
      f.style.setProperty("--d", (Math.random() * 0.9).toFixed(2) + "s");
      f.style.setProperty("--t", (2.4 + Math.random() * 1.4).toFixed(2) + "s");
      box.appendChild(f);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 4600);
  }
})();
