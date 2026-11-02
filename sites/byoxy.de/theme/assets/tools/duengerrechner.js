/* BYOXY Dünger-Dosierrechner: Flüssigdünger nach Packungsangabe auf die eigene Gießkanne umrechnen, auf Wunsch in halber
   Stärke. Läuft im Browser. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "duengerrechner") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var num = function (i) { var v = parseFloat(String(i.value).replace(",", ".")); return isFinite(v) ? v : NaN; };
  var f = function (n, d) { return n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var ML = el("input", { id: "wz-ml", type: "text", inputmode: "decimal", placeholder: "z. B. 5" }), PRO = el("input", { id: "wz-pro", type: "text", inputmode: "decimal", value: "1" }), KANNE = el("input", { id: "wz-kanne", type: "text", inputmode: "decimal", placeholder: "z. B. 2" });
  var st = el("select", { id: "wz-staerke" }, [el("option", { value: "1" }, ["volle Stärke laut Packung"]), el("option", { value: "0.5" }, ["halbe Stärke (empfindliche Pflanzen, Jungpflanzen, Winter)"])]);
  var out = el("div", { class: "garten-wz-ergebnis", "aria-live": "polite" });
  root.className += " garten-wz";
  root.appendChild(el("p", { class: "garten-wz-titel" }, ["Dünger-Dosierrechner"]));
  root.appendChild(el("p", { class: "garten-wz-hilfe" }, ["Lies auf der Flasche ab, wie viel Milliliter auf wie viel Liter Wasser kommen, und trag ein, wie viel deine Gießkanne fasst."]));
  root.appendChild(el("div", { class: "garten-wz-felder" }, [el("label", { for: "wz-ml" }, ["Milliliter Dünger laut Packung", ML]), el("label", { for: "wz-pro" }, ["… auf Liter Wasser", PRO]), el("label", { for: "wz-kanne" }, ["Wasser in der Kanne (l)", KANNE]), el("label", { for: "wz-staerke" }, ["Stärke", st])]));
  root.appendChild(out);
  function render() {
    out.innerHTML = "";
    var ml = num(ML), pro = num(PRO), k = num(KANNE), s = Number(st.value);
    if (!(ml > 0 && pro > 0 && k > 0)) { out.appendChild(el("p", { class: "garten-wz-leer" }, ["Trag Packungsangabe und Kanneninhalt ein."])); return; }
    var dose = (ml / pro) * k * s;
    out.appendChild(el("p", { class: "garten-wz-kopf" }, ["In die Kanne: ", el("strong", {}, [f(dose, dose < 10 ? 1 : 0) + " ml"]), " Dünger auf " + f(k, 1) + " l Wasser"]));
    out.appendChild(el("p", {}, ["Das entspricht etwa " + f(dose / 5, 1) + " Teelöffeln (1 TL ≈ 5 ml) oder " + f(dose / 15, 1) + " Esslöffeln (1 EL ≈ 15 ml)."]));
    out.appendChild(el("ul", { class: "garten-wz-notiz" }, [el("li", {}, ["Nur auf feuchte Erde düngen, nie auf völlig ausgetrocknete Wurzeln."]), el("li", {}, ["Frisch umgetopfte Pflanzen brauchen 6 bis 8 Wochen keinen Dünger, die neue Erde ist vorgedüngt; im Winter weniger oder gar nicht düngen."]), el("li", {}, ["Mehr ist nicht besser: Zu viel Dünger verbrennt Wurzeln und lässt Salzkrusten auf der Erde entstehen."])]));
  }
  [ML, PRO, KANNE, st].forEach(function (i) { i.addEventListener("input", render); i.addEventListener("change", render); });
  render();
})();
