// NEXVILO — small, dependency-free behaviour: menu toggle, the reading trail
// (an ant walking down a dotted road), reveal-on-scroll for cards and
// chambers, the "you are here" mark on the contents road, the terrace ants
// held still for reduced motion, and one short spring of red-gold grains per
// session for Spain's 2026 title. Without it the page is plain and fully
// readable.
(function () {
  var doc = document.documentElement;
  doc.classList.add("js");
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The ants on the terrace walk with SMIL, which CSS cannot stop: pause them.
  if (still) document.querySelectorAll("svg.ameise-szene").forEach(function (s) { if (s.pauseAnimations) s.pauseAnimations(); });

  var toggle = document.querySelector(".pfad-schalter");
  var nav = document.getElementById("pfad-nav");
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
  document.querySelectorAll(".pfad-nav__item, .pfad-dienst a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === here || (href !== "/" && here.indexOf(href) === 0)) a.setAttribute("aria-current", "page");
  });

  var trail = document.querySelector(".pfad-spur");
  var text = document.querySelector(".pfad-text");
  if (trail && text) {
    var tick = false;
    var update = function () {
      var r = text.getBoundingClientRect();
      var total = r.height - window.innerHeight * 0.6;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
      trail.style.setProperty("--p", p.toFixed(4));
      tick = false;
    };
    window.addEventListener("scroll", function () { if (!tick) { tick = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  var items = document.querySelectorAll(".korn-karte, .pfad-kammer");
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

  var links = document.querySelectorAll(".pfad-inhalt a");
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
  try { shown = sessionStorage.getItem("nexvilo-feier") === "1"; } catch (e) { shown = true; }
  if (!still && !shown) {
    try { sessionStorage.setItem("nexvilo-feier", "1"); } catch (e) {}
    var box = document.createElement("div");
    box.className = "pfad-feier";
    box.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 26; i++) {
      var g = document.createElement("i");
      g.style.left = Math.round(35 + Math.random() * 30) + "vw";
      g.style.setProperty("--x", Math.round(Math.random() * 300 - 150) + "px");
      g.style.setProperty("--h", Math.round(45 + Math.random() * 40));
      g.style.setProperty("--d", (Math.random() * 0.7).toFixed(2) + "s");
      g.style.setProperty("--t", (2.2 + Math.random() * 1.2).toFixed(2) + "s");
      box.appendChild(g);
    }
    document.body.appendChild(box);
    setTimeout(function () { box.remove(); }, 4400);
  }
})();
