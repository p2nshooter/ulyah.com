/* BYOY Beetplaner: Wie viele Pflanzen und wie viel Fläche für einen Haushalt? Mengen und Platzbedarf aus unserem
   Ratgeber „Beetplan erstellen". Läuft im Browser. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "beetplaner") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var f = function (n, d) { return n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d }); };
  // [Gemüse, Pflanzen oder Reihenmeter für n Personen, Fläche in m² für diese Menge, Text]
  var P = [
    ["Zucchini", function (n) { return Math.ceil(n / 3); }, function (q) { return q * 1; }, "Pflanzen à etwa 1 m²"],
    ["Tomaten", function (n) { return Math.ceil(n * 2.5); }, function (q) { return q * 0.48; }, "Pflanzen à 60 × 80 cm"],
    ["Salat (je Satz)", function (n) { return Math.ceil(n * 5); }, function (q) { return q * 0.0625; }, "Pflanzen à 25 × 25 cm, alle 2 bis 3 Wochen neu"],
    ["Buschbohnen", function (n) { return Math.ceil(n * 1.5); }, function (q) { return q * 0.4; }, "Meter Reihe, Reihenabstand 40 cm"],
    ["Möhren", function (n) { return Math.ceil(n * 2.5); }, function (q) { return q * 0.25; }, "Meter Reihe, Reihenabstand 25 cm"],
    ["Kohlrabi (Saison)", function (n) { return Math.ceil(n * 8); }, function (q) { return q * 0.09; }, "Pflanzen à 30 × 30 cm, über die Saison verteilt"],
    ["Mangold", function (n) { return Math.ceil(n * 2.5); }, function (q) { return q * 0.12; }, "Pflanzen à 30 × 40 cm"],
    ["Kürbis", function (n) { return Math.ceil(n / 3); }, function (q) { return q * 2.5; }, "Pflanzen à 2 bis 3 m²"],
  ];
  var pers = el("select", { id: "wz-pers" }, [1, 2, 3, 4, 5, 6].map(function (n) { return el("option", { value: String(n) }, [String(n)]); })); pers.value = "2";
  var box = el("fieldset", { class: "hamon-wz-auswahl" }, [el("legend", {}, ["Was soll wachsen?"])]);
  P.forEach(function (p, i) { var c = el("input", { type: "checkbox", id: "wz-p" + i, value: String(i) }); c.checked = i < 5; c.addEventListener("change", render); box.appendChild(el("label", { for: "wz-p" + i }, [c, p[0]])); });
  var out = el("div", { class: "hamon-wz-ergebnis", "aria-live": "polite" });
  root.className += " hamon-wz";
  root.appendChild(el("p", { class: "hamon-wz-titel" }, ["Beetplaner"]));
  root.appendChild(el("p", { class: "hamon-wz-hilfe" }, ["Für frischen Verzehr in der Saison, nicht fürs Einlagern. Die Mengen sind Richtwerte aus der Praxis."]));
  root.appendChild(el("div", { class: "hamon-wz-felder" }, [el("label", { for: "wz-pers" }, ["Personen im Haushalt", pers])]));
  root.appendChild(box);
  root.appendChild(out);
  function render() {
    var n = Number(pers.value), sum = 0; out.innerHTML = "";
    var rows = [].filter.call(box.querySelectorAll("input"), function (c) { return c.checked; }).map(function (c) {
      var p = P[Number(c.value)], q = p[1](n), a = p[2](q); sum += a;
      return el("tr", {}, [el("th", { scope: "row" }, [p[0]]), el("td", {}, [q + " " + p[3]]), el("td", {}, [f(a, 1) + " m²"])]);
    });
    if (!rows.length) { out.appendChild(el("p", { class: "hamon-wz-leer" }, ["Wähle mindestens ein Gemüse."])); return; }
    out.appendChild(el("table", {}, [el("thead", {}, [el("tr", {}, [el("th", {}, ["Gemüse"]), el("th", {}, ["Menge"]), el("th", {}, ["Fläche"])])]), el("tbody", {}, rows)]));
    out.appendChild(el("p", { class: "hamon-wz-kopf" }, ["Zusammen etwa " + f(sum, 1) + " m² reine Pflanzfläche, mit Wegen gut " + f(sum * 1.4, 0) + " m²."]));
    out.appendChild(el("p", { class: "hamon-wz-notiz" }, ["Viele Beete werden doppelt genutzt: Nach frühem Salat oder Spinat ist Platz für Bohnen, nach Erbsen für Feldsalat."]));
  }
  pers.addEventListener("change", render);
  render();
})();
