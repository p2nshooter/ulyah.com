/* BYODD Bodenbelag-Rechner: Laminat, Vinyl oder Parkett – Fläche, Verschnitt nach Verlegeart, Pakete, Trittschalldämmung
   und Sockelleisten. Läuft im Browser. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "bodenrechner") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var num = function (i) { var v = parseFloat(String(i.value).replace(",", ".")); return isFinite(v) ? v : NaN; };
  var f = function (n, d) { return n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var inp = function (id, val, ph) { return el("input", { id: id, type: "text", inputmode: "decimal", value: val || "", placeholder: ph }); };
  var L = inp("wz-l", "", "z. B. 5,2"), B = inp("wz-b", "", "z. B. 3,8"), P = inp("wz-p", "", "z. B. 2,22"), T = inp("wz-t", "0,9", "z. B. 0,9"), SL = inp("wz-sl", "2,4", "z. B. 2,4");
  var art = el("select", { id: "wz-art" }, [el("option", { value: "5" }, ["gerade, Restestück als Anfang der nächsten Reihe (+5 %)"]), el("option", { value: "10" }, ["Wildverband oder viele Ecken (+10 %)"]), el("option", { value: "15" }, ["diagonal (+15 %)"])]);
  var out = el("div", { class: "zeder-wz-ergebnis", "aria-live": "polite" });
  root.className += " zeder-wz";
  root.appendChild(el("p", { class: "zeder-wz-titel" }, ["Bodenbelag-Rechner"]));
  root.appendChild(el("p", { class: "zeder-wz-hilfe" }, ["Für Laminat, Klick-Vinyl und Fertigparkett. Den Paketinhalt in m² findest du auf dem Paket oder im Datenblatt."]));
  root.appendChild(el("div", { class: "zeder-wz-felder" }, [
    el("label", { for: "wz-l" }, ["Raumlänge (m)", L]), el("label", { for: "wz-b" }, ["Raumbreite (m)", B]), el("label", { for: "wz-p" }, ["Inhalt je Paket (m²)", P]),
    el("label", { for: "wz-art", class: "zeder-wz-breit" }, ["Verlegeart", art]), el("label", { for: "wz-t" }, ["Türbreite gesamt (m)", T]), el("label", { for: "wz-sl" }, ["Länge je Sockelleiste (m)", SL]),
  ]));
  root.appendChild(out);
  function render() {
    out.innerHTML = "";
    var l = num(L), b = num(B), p = num(P), t = Math.max(0, num(T) || 0), sl = num(SL), v = Number(art.value) / 100;
    if (!(l > 0 && b > 0)) { out.appendChild(el("p", { class: "zeder-wz-leer" }, ["Trag Länge und Breite des Raums ein."])); return; }
    var flaeche = l * b, bedarf = flaeche * (1 + v);
    var zeilen = [el("tr", {}, [el("th", { scope: "row" }, ["Raumfläche"]), el("td", {}, [f(flaeche, 2) + " m²"])]), el("tr", {}, [el("th", { scope: "row" }, ["Mit Verschnitt"]), el("td", {}, [f(bedarf, 2) + " m²"])])];
    if (p > 0) zeilen.push(el("tr", {}, [el("th", { scope: "row" }, ["Pakete"]), el("td", {}, [Math.ceil(bedarf / p) + " (= " + f(Math.ceil(bedarf / p) * p, 2) + " m²)"])]));
    zeilen.push(el("tr", {}, [el("th", { scope: "row" }, ["Trittschalldämmung"]), el("td", {}, [f(Math.ceil(flaeche * 1.05), 0) + " m² (wenn nicht schon am Belag)"])]));
    var umfang = Math.max(0, 2 * (l + b) - t);
    if (sl > 0) zeilen.push(el("tr", {}, [el("th", { scope: "row" }, ["Sockelleisten"]), el("td", {}, [f(umfang, 1) + " m → " + Math.ceil((umfang * 1.1) / sl) + " Leisten à " + f(sl, 2) + " m"])]));
    out.appendChild(el("table", {}, [el("tbody", {}, zeilen)]));
    out.appendChild(el("ul", { class: "zeder-wz-notizen" }, [
      el("li", {}, ["Lass die Pakete vor dem Verlegen so lange im Raum liegen, wie der Hersteller angibt, meist mindestens 48 Stunden."]),
      el("li", {}, ["Halte rundum die Dehnungsfuge ein, die der Hersteller nennt; die Sockelleiste deckt sie ab."]),
      el("li", {}, ["Ein Paket als Reserve hilft bei späteren Reparaturen, weil Dekore aus dem Programm genommen werden."]),
    ]));
  }
  [L, B, P, T, SL, art].forEach(function (i) { i.addEventListener("input", render); i.addEventListener("change", render); });
  render();
})();
