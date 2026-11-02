/* BYOY Gemüse-Aussaatkalender: Vorziehen, Direktsaat und Pflanzen für zwölf Gemüse, aus unserem Aussaatkalender. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "gemuesekalender") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var MON = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  // [Gemüse, vorziehen [von,bis], direktsaat [[von,bis],…], pflanzen [von,bis]] — Monate 1–12
  var K = [
    ["Tomaten", [3, 4], [], [5, 5]], ["Paprika", [2, 3], [], [5, 5]], ["Zucchini, Kürbis", [4, 4], [[5, 5]], [5, 5]], ["Buschbohnen", null, [[5, 7]], null],
    ["Erbsen", null, [[3, 5]], null], ["Möhren", null, [[3, 6]], null], ["Rote Bete", null, [[4, 6]], null], ["Salat", [2, 7], [[3, 8]], [4, 8]],
    ["Kohlrabi", [2, 7], [[4, 7]], [4, 8]], ["Grünkohl", [5, 6], [], [6, 7]], ["Feldsalat", null, [[8, 9]], null], ["Spinat", null, [[3, 4], [8, 9]], null],
  ];
  var nowM = new Date().getMonth() + 1;
  var inR = function (r, m) { return r && m >= r[0] && m <= r[1]; };
  var tab = el("table", { class: "hamon-wz-kalender" });
  tab.appendChild(el("thead", {}, [el("tr", {}, [el("th", { scope: "col" }, ["Gemüse"])].concat(MON.map(function (m, i) { return el("th", { scope: "col", class: i + 1 === nowM ? "hamon-wz-jetzt" : null }, [m]); })))]));
  var body = el("tbody");
  K.forEach(function (k) {
    var tr = el("tr", {}, [el("th", { scope: "row" }, [k[0]])]);
    for (var m = 1; m <= 12; m++) {
      var v = inR(k[1], m), d = k[2].some(function (r) { return inR(r, m); }), p = inR(k[3], m), sym = (v ? "V" : "") + (d ? "S" : "") + (p ? "P" : "");
      tr.appendChild(el("td", { class: sym ? "hamon-wz-" + (d ? "saat" : v ? "vor" : "pflanz") : null, title: [v ? "vorziehen" : "", d ? "direkt säen" : "", p ? "pflanzen" : ""].filter(Boolean).join(", ") }, [sym]));
    }
    body.appendChild(tr);
  });
  tab.appendChild(body);
  var jetzt = function (i) { return K.filter(function (k) { return [k[1]].concat(k[2]).concat([k[3]]).filter(Boolean)[0] && (inR(k[1], nowM) || inR(k[3], nowM) || k[2].some(function (r) { return inR(r, nowM); })); }).map(function (k) { return k[0]; }); };
  var out = el("div", { class: "hamon-wz-ergebnis" }, [el("p", { class: "hamon-wz-kopf" }, ["Im " + MON[nowM - 1] + " ist dran: " + (jetzt().join(", ") || "Planen, Saatgut prüfen, Beete mulchen")])]);
  root.className += " hamon-wz";
  root.appendChild(el("p", { class: "hamon-wz-titel" }, ["Gemüse-Aussaatkalender"]));
  root.appendChild(el("p", { class: "hamon-wz-hilfe" }, ["V = vorziehen auf der Fensterbank · S = direkt ins Beet säen · P = auspflanzen. Wärmeliebendes erst nach den Eisheiligen Mitte Mai. Der aktuelle Monat ist hervorgehoben."]));
  root.appendChild(el("div", { class: "hamon-wz-scroll" }, [tab]));
  root.appendChild(out);
})();
