/*
 * The ecosystem band's AXTO rail (owner, 23 Nov 2026: „Promosikan axto.io dengan bahasa yg elegan, profesional … NFT
 * bergulir random misal 5-10 NFT random bergulir semua stock NFT exclusive, promosikan di seluruh website artikel").
 *
 * Every page view draws 5–10 works at random from the whole exclusive stock (five collections × 10,000) and lets them
 * glide past; each opens its own page on axto.io. The images (axto.io's own animated SVG, cached for a year) are only
 * requested once the band comes near the screen, the glide stops while the band is off screen, on hover and on
 * keyboard focus, and with prefers-reduced-motion the row simply scrolls by hand.
 */
(function () {
  "use strict";
  var rail = document.querySelector("[data-eco-rail]");
  if (!rail) return;
  var COLLECTIONS = ["ex-time", "ex-stamp", "ex-quran", "ex-model", "ex-hadith"];
  var STOCK = 10000;
  var labels = {};
  try {
    labels = JSON.parse(rail.getAttribute("data-labels") || "{}");
  } catch (e) {
    labels = {};
  }
  var lang = rail.getAttribute("data-axto-lang") === "id" ? "id" : "en";

  function below(n) {
    var a = new Uint32Array(1);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return a[0] % n;
  }

  // 5–10 distinct works, the collections taking turns so one row shows the range of the edition.
  var count = 5 + below(6);
  var start = below(COLLECTIONS.length);
  var picks = [];
  var seen = {};
  while (picks.length < count) {
    var c = COLLECTIONS[(start + picks.length) % COLLECTIONS.length];
    var id = 1 + below(STOCK);
    if (seen[c + id]) continue;
    seen[c + id] = 1;
    picks.push({ c: c, id: id });
  }

  var track = document.createElement("div");
  track.className = "eco-rail__track";
  function tile(p, copy) {
    var a = document.createElement("a");
    a.className = "eco-nft";
    a.href = "https://axto.io/" + lang + "/nft/" + p.c + "/" + p.id;
    a.target = "_blank";
    a.rel = "noopener";
    var name = (labels[p.c] || "AXTO") + " #" + p.id;
    if (copy) {
      a.setAttribute("aria-hidden", "true");
      a.tabIndex = -1;
    } else {
      a.setAttribute("aria-label", name);
    }
    var img = document.createElement("img");
    img.width = 160;
    img.height = 160;
    img.alt = copy ? "" : name;
    img.decoding = "async";
    img.setAttribute("data-src", "https://axto.io/img/" + p.c + "/" + p.id + ".svg?v=9");
    var cap = document.createElement("span");
    cap.className = "eco-nft__cap";
    cap.textContent = name;
    a.appendChild(img);
    a.appendChild(cap);
    return a;
  }
  // The row twice, so the glide loops without a seam; the second copy is decoration for assistive technology.
  for (var i = 0; i < picks.length; i++) track.appendChild(tile(picks[i], false));
  for (var j = 0; j < picks.length; j++) track.appendChild(tile(picks[j], true));
  track.style.setProperty("--eco-dur", picks.length * 6 + "s");
  rail.textContent = "";
  rail.appendChild(track);

  function load() {
    var imgs = track.querySelectorAll("img[data-src]");
    for (var k = 0; k < imgs.length; k++) {
      imgs[k].src = imgs[k].getAttribute("data-src");
      imgs[k].removeAttribute("data-src");
    }
  }
  if (!("IntersectionObserver" in window)) {
    load();
    rail.classList.add("is-on");
    return;
  }
  var loaded = false;
  new IntersectionObserver(
    function (entries) {
      for (var n = 0; n < entries.length; n++) {
        if (entries[n].isIntersecting && !loaded) {
          loaded = true;
          load();
        }
        rail.classList.toggle("is-on", entries[n].isIntersecting);
      }
    },
    { rootMargin: "400px 0px" }
  ).observe(rail);
})();
