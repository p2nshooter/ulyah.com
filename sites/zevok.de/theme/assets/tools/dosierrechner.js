/* ZEVOK Wasserhärte- und Dosierrechner.
   1. Wasserhärte umrechnen (°dH, mmol/l, °fH, mg/l CaCO3) und dem Härtebereich nach § 9 WRMG zuordnen.
   2. Die Dosierangabe von der eigenen Packung auf die eigene Beladung umrechnen.
   Läuft ganz im Browser. Die letzte Eingabe merkt sich nur dein eigener Browser. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "dosierrechner") return;

  // 1 mmol/l Calciumcarbonat = 5,6 °dH = 10 °fH = 100 mg/l CaCO3.
  var UNITS = { dh: { name: "°dH (deutsche Härte)", perMmol: 5.6 }, mmol: { name: "mmol/l", perMmol: 1 }, fh: { name: "°fH (französische Härte)", perMmol: 10 }, mg: { name: "mg/l CaCO₃ (ppm)", perMmol: 100 } };
  var fmt = function (n, d) { return n.toLocaleString("de-DE", { maximumFractionDigits: d, minimumFractionDigits: 0 }); };
  var store = {
    get: function () { try { return JSON.parse(localStorage.getItem("zevok-dosier") || "{}"); } catch (e) { return {}; } },
    set: function (v) { try { localStorage.setItem("zevok-dosier", JSON.stringify(v)); } catch (e) {} },
  };
  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  };
  var num = function (input) { var v = parseFloat(String(input.value).replace(",", ".")); return isFinite(v) ? v : NaN; };
  var saved = store.get();

  root.className += " erz-wz";
  root.appendChild(el("p", { class: "erz-wz-titel" }, ["Wasserhärte- und Dosierrechner"]));

  // ── 1. Wasserhärte ──
  var hVal = el("input", { id: "wz-haerte", type: "text", inputmode: "decimal", autocomplete: "off", value: saved.h || "", placeholder: "z. B. 16,8" });
  var hUnit = el("select", { id: "wz-einheit" }, Object.keys(UNITS).map(function (k) { return el("option", { value: k }, [UNITS[k].name]); }));
  if (saved.u && UNITS[saved.u]) hUnit.value = saved.u;
  var hOut = el("div", { class: "erz-wz-ergebnis", "aria-live": "polite" });
  root.appendChild(el("section", { class: "erz-wz-teil" }, [
    el("h3", {}, ["1. Wie hart ist dein Wasser?"]),
    el("p", { class: "erz-wz-hilfe" }, ["Den Wert nennt dein Wasserversorger, meist auf seiner Webseite oder der Jahresabrechnung. Er muss den Härtebereich mindestens einmal im Jahr mitteilen."]),
    el("div", { class: "erz-wz-felder" }, [el("label", { for: "wz-haerte" }, ["Wert", hVal]), el("label", { for: "wz-einheit" }, ["Einheit", hUnit])]),
    hOut,
  ]));

  // ── 2. Dosierung ──
  var dose = el("input", { id: "wz-dosis", type: "text", inputmode: "decimal", autocomplete: "off", value: saved.d || "", placeholder: "z. B. 75" });
  var doseUnit = el("select", { id: "wz-dosis-einheit" }, [el("option", { value: "ml" }, ["ml (flüssig)"]), el("option", { value: "g" }, ["g (Pulver)"])]);
  if (saved.du) doseUnit.value = saved.du;
  var ref = el("select", { id: "wz-bezug" }, [el("option", { value: "4.5" }, ["Voll-, Universal- oder Colorwaschmittel (4,5 kg)"]), el("option", { value: "2.5" }, ["Fein- oder Wollwaschmittel (2,5 kg)"]), el("option", { value: "x" }, ["andere Menge laut Packung …"])]);
  if (saved.r) ref.value = saved.r;
  var refKg = el("input", { id: "wz-bezug-kg", type: "text", inputmode: "decimal", value: saved.rk || "", placeholder: "kg laut Packung" });
  var load = el("input", { id: "wz-beladung", type: "range", min: "1", max: "12", step: "0.5", value: saved.l || "4.5" });
  var loadLabel = el("output", { for: "wz-beladung" });
  var dOut = el("div", { class: "erz-wz-ergebnis", "aria-live": "polite" });
  root.appendChild(el("section", { class: "erz-wz-teil" }, [
    el("h3", {}, ["2. Wie viel Waschmittel für deine Ladung?"]),
    el("p", { class: "erz-wz-hilfe" }, ["Schau in die Dosiertabelle auf deiner Packung: Zeile für deinen Härtebereich, Spalte für den Verschmutzungsgrad. Die Menge dort gilt für eine Normalbeladung, meist 4,5 kg bei Voll- und Colorwaschmitteln und 2,5 kg bei Fein- und Wollwaschmitteln."]),
    el("div", { class: "erz-wz-felder" }, [
      el("label", { for: "wz-dosis" }, ["Menge laut Packung", dose]),
      el("label", { for: "wz-dosis-einheit" }, ["Einheit", doseUnit]),
      el("label", { for: "wz-bezug" }, ["Gilt für", ref]),
      el("label", { for: "wz-bezug-kg", class: "erz-wz-bezug-kg" }, ["Normalbeladung in kg", refKg]),
      el("label", { for: "wz-beladung", class: "erz-wz-breit" }, ["Deine Wäsche (trocken gewogen): ", loadLabel, load]),
    ]),
    dOut,
  ]));

  function zone(mmol) {
    // § 9 WRMG: weich < 1,5; mittel 1,5 bis 2,5; hart > 2,5 mmol/l Calciumcarbonat.
    if (mmol < 1.5) return { name: "weich", text: "Du brauchst die kleinste Menge aus der Dosiertabelle. Kalk setzt sich nur langsam ab." };
    if (mmol <= 2.5) return { name: "mittel", text: "Nimm die mittlere Zeile der Dosiertabelle. Wasserkocher und Kaffeemaschine brauchen regelmäßig eine Entkalkung." };
    return { name: "hart", text: "Nimm die Zeile für hartes Wasser. Ein Enthärter extra ist meist überflüssig: Heutige Waschmittel enthalten Enthärter, die bis etwa 30 °dH reichen. Gerät und Bad brauchen öfter eine Entkalkung." };
  }
  function renderHardness() {
    hOut.innerHTML = "";
    var v = num(hVal);
    if (!(v >= 0) || v > 2000) { hOut.appendChild(el("p", { class: "erz-wz-leer" }, ["Gib den Wert deines Wasserversorgers ein."])); return; }
    var mmol = v / UNITS[hUnit.value].perMmol;
    var z = zone(mmol);
    var t = el("table", {}, [
      el("thead", {}, [el("tr", {}, [el("th", {}, ["°dH"]), el("th", {}, ["mmol/l"]), el("th", {}, ["°fH"]), el("th", {}, ["mg/l CaCO₃"])])]),
      el("tbody", {}, [el("tr", {}, [el("td", {}, [fmt(mmol * 5.6, 1)]), el("td", {}, [fmt(mmol, 2)]), el("td", {}, [fmt(mmol * 10, 1)]), el("td", {}, [fmt(mmol * 100, 0)])])]),
    ]);
    hOut.appendChild(el("p", { class: "erz-wz-kopf" }, ["Härtebereich: ", el("strong", {}, [z.name])]));
    hOut.appendChild(t);
    hOut.appendChild(el("p", {}, [z.text]));
    if (mmol * 5.6 > 30) hOut.appendChild(el("p", { class: "erz-wz-notiz" }, ["Über 30 °dH reicht der Enthärter im Waschmittel nicht mehr ganz. Dann kann ein separater Enthärter nach Packungsangabe sinnvoll sein."]));
  }
  function renderDose() {
    dOut.innerHTML = "";
    refKg.parentNode.hidden = ref.value !== "x";
    var kg = parseFloat(load.value);
    loadLabel.textContent = fmt(kg, 1) + " kg";
    var d = num(dose), rk = ref.value === "x" ? num(refKg) : parseFloat(ref.value);
    if (!(d > 0) || !(rk > 0)) { dOut.appendChild(el("p", { class: "erz-wz-leer" }, ["Trag die Menge von deiner Packung ein."])); return; }
    // Ein Drittel der Menge hängt am Wasser in der Maschine, zwei Drittel an der Wäsche. Bei halber Ladung ergibt das zwei
    // Drittel der Packungsmenge, wie Forum Waschen es empfiehlt; bei voller Normalbeladung genau die Packungsmenge.
    var r = Math.min(3, Math.max(0.15, kg / rk));
    var amount = d * (1 / 3 + (2 / 3) * r);
    var step = amount < 40 ? 1 : 5;
    var rounded = Math.round(amount / step) * step;
    dOut.appendChild(el("p", { class: "erz-wz-kopf" }, ["Für " + fmt(kg, 1) + " kg: etwa ", el("strong", {}, [fmt(rounded, 0) + " " + doseUnit.value])]));
    dOut.appendChild(el("p", {}, ["Das ist " + fmt(Math.round((amount / d) * 100), 0) + " % der Packungsmenge für " + fmt(rk, 1) + " kg."]));
    var notes = [];
    if (r < 0.75) notes.push("Bei kleiner Ladung nicht einfach halbieren: Das Wasser in der Trommel braucht seinen Anteil.");
    if (r > 1.3) notes.push("Volle große Trommel: Lass eine Handbreit Platz über der Wäsche, sonst wird sie nicht sauber.");
    notes.push("Caps und Tabs lassen sich nicht teilen: eins pro Ladung, wie auf der Packung.");
    notes.push("Mehr hilft nicht: Zu viel Waschmittel spült schlechter aus, belastet Haut und Abwasser und kostet Geld.");
    dOut.appendChild(el("ul", {}, notes.map(function (n) { return el("li", {}, [n]); })));
  }
  function save() { store.set({ h: hVal.value, u: hUnit.value, d: dose.value, du: doseUnit.value, r: ref.value, rk: refKg.value, l: load.value }); }
  [hVal, hUnit].forEach(function (x) { x.addEventListener("input", function () { renderHardness(); save(); }); x.addEventListener("change", function () { renderHardness(); save(); }); });
  [dose, doseUnit, ref, refKg, load].forEach(function (x) { x.addEventListener("input", function () { renderDose(); save(); }); x.addEventListener("change", function () { renderDose(); save(); }); });
  renderHardness();
  renderDose();
})();
