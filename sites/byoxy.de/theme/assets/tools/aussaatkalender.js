/* BYOXY Aussaatkalender für Balkon und Fensterbank: wann vorziehen, bei welcher Keimtemperatur, ob Licht- oder
   Dunkelkeimer und wann nach draußen – aus unserem Ratgeber „Aussaat auf der Fensterbank". */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "aussaatkalender") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var MON = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  // [Name, Aussaat drinnen (Monate, 1–12; .5 = Monatsmitte), nach draußen ab, Keimtemperatur, Keimtyp]
  var A = [
    ["Chili und Paprika", [2.5, 3.5], 5.5, "25 bis 28 °C", "neutral"],
    ["Tomaten", [3.5, 4], 5.5, "20 bis 25 °C", "Dunkelkeimer: mit Erde bedecken"],
    ["Auberginen", [2.5, 3.5], 5.8, "25 bis 28 °C", "neutral"],
    ["Basilikum", [4, 4.9], 5.8, "20 bis 25 °C", "Lichtkeimer: nur andrücken"],
    ["Gurken und Zucchini", [4.7, 5.1], 5.8, "über 20 °C", "neutral"],
    ["Kapuzinerkresse", [4, 4.9], 5.5, "18 bis 22 °C", "Dunkelkeimer: mit Erde bedecken"],
    ["Sommerblumen (Zinnien, Tagetes)", [4, 4.9], 5.5, "18 bis 22 °C", "je nach Art; Tütenangabe beachten"],
    ["Salat", [2, 8], 4, "15 bis 18 °C, über 20 °C schlecht", "Lichtkeimer: nur andrücken"],
  ];
  var nowM = new Date().getMonth() + 1;
  var tab = el("table", { class: "garten-wz-kalender" });
  var head = el("tr", {}, [el("th", { scope: "col" }, ["Pflanze"])].concat(MON.map(function (m, i) { return el("th", { scope: "col", class: i + 1 === nowM ? "garten-wz-jetzt" : null }, [m]); })));
  tab.appendChild(el("thead", {}, [head]));
  var body = el("tbody");
  A.forEach(function (a) {
    var tr = el("tr", {}, [el("th", { scope: "row" }, [a[0]])]);
    for (var m = 1; m <= 12; m++) {
      var drin = m + 0.99 > a[1][0] && m <= a[1][1] + 0.01, raus = m >= Math.floor(a[2]) && m <= 9;
      var cls = drin ? "garten-wz-drin" : raus ? "garten-wz-raus" : null;
      tr.appendChild(el("td", { class: cls, title: drin ? "vorziehen" : raus ? "draußen" : "" }, [drin ? "●" : raus ? "○" : ""]));
    }
    body.appendChild(tr);
  });
  tab.appendChild(body);
  var jetzt = el("div", { class: "garten-wz-ergebnis", "aria-live": "polite" });
  var due = A.filter(function (a) { return nowM + 0.99 > a[1][0] && nowM <= a[1][1] + 0.01; });
  jetzt.appendChild(el("p", { class: "garten-wz-kopf" }, ["Jetzt (" + MON[nowM - 1] + ") vorziehen: " + (due.length ? due.map(function (a) { return a[0]; }).join(", ") : "nichts aus dieser Liste – Zeit für Kräuter auf der Fensterbank")]));
  due.forEach(function (a) { jetzt.appendChild(el("p", {}, [a[0] + ": Keimtemperatur " + a[3] + "; " + a[4] + "."])); });
  root.className += " garten-wz";
  root.appendChild(el("p", { class: "garten-wz-titel" }, ["Aussaatkalender für Balkon und Fensterbank"]));
  root.appendChild(el("p", { class: "garten-wz-hilfe" }, ["● vorziehen auf der Fensterbank · ○ draußen, nach den Eisheiligen Mitte Mai. Der aktuelle Monat ist hervorgehoben."]));
  root.appendChild(el("div", { class: "garten-wz-scroll" }, [tab]));
  root.appendChild(jetzt);
})();
