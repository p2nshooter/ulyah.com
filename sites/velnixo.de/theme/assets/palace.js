// VELNIXO — small, dependency-free behaviour: menu toggle, the reading chain,
// reveal-on-scroll for cards and rubrics, the "you are here" mark in the
// contents, and one short shower of red-gold sprockets per session for Spain's
// 2026 title. Everything degrades to a plain readable page without it.
(function () {
  var doc = document.documentElement;
  doc.classList.add("js");
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var toggle = document.querySelector(".nabe-schalter");
  var nav = document.getElementById("nabe-nav");
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
  document.querySelectorAll(".nabe-nav__item").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === here || (href !== "/" && here.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
  });

  var bar = document.querySelector(".nabe-kette span");
  var text = document.querySelector(".nabe-text");
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

  var items = document.querySelectorAll(".speiche-karte, .nabe-rubrik");
  if ("IntersectionObserver" in window && !still) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-seen"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 80 + "ms"; io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("is-seen"); });
  }

  var links = document.querySelectorAll(".nabe-inhalt a");
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
  try { shown = sessionStorage.getItem("velnixo-feier") === "1"; } catch (e) { shown = true; }
  if (!still && !shown) {
    try { sessionStorage.setItem("velnixo-feier", "1"); } catch (e) {}
    var box = document.createElement("div");
    box.className = "nabe-feier";
    box.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 28; i++) {
      var s = document.createElement("i");
      s.style.left = Math.round(Math.random() * 100) + "vw";
      s.style.setProperty("--x", Math.round(Math.random() * 120 - 60) + "px");
      s.style.setProperty("--d", (Math.random() * 0.8).toFixed(2) + "s");
      s.style.setProperty("--t", (1.8 + Math.random() * 1.2).toFixed(2) + "s");
      box.appendChild(s);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 3400);
  }
})();
