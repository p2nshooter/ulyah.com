/* BYOXY Erd- und Topfrechner: Volumen eines runden oder eckigen Topfs oder Balkonkastens in Litern, Säcke Erde und die
   nächste Topfgröße beim Umtopfen. Läuft im Browser. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "topfrechner") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var num = function (i) { var v = parseFloat(String(i.value).replace(",", ".")); return isFinite(v) ? v : NaN; };
  var f = function (n, d) { return n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var inp = function (id, ph) { return el("input", { id: id, type: "text", inputmode: "decimal", placeholder: ph }); };
  var form = el("select", { id: "wz-form" }, [el("option", { value: "rund" }, ["runder Topf"]), el("option", { value: "eckig" }, ["Balkonkasten oder eckiger Kübel"])]);
  var D = inp("wz-d", "oben, in cm"), DB = inp("wz-db", "unten, in cm (optional)"), L = inp("wz-l", "in cm"), B = inp("wz-b", "in cm"), H = inp("wz-h", "in cm"), N = el("input", { id: "wz-n", type: "text", inputmode: "numeric", value: "1" }), SACK = el("input", { id: "wz-sack", type: "text", inputmode: "decimal", value: "40" });
  var lab = function (id, t, i, cls) { return el("label", { for: id, class: cls || null }, [t, i]); };
  var lD = lab("wz-d", "Durchmesser oben (cm)", D), lDB = lab("wz-db", "Durchmesser unten (cm)", DB), lL = lab("wz-l", "Länge (cm)", L), lB = lab("wz-b", "Breite (cm)", B);
  var out = el("div", { class: "garten-wz-ergebnis", "aria-live": "polite" });
  root.className += " garten-wz";
  root.appendChild(el("p", { class: "garten-wz-titel" }, ["Erd- und Topfrechner"]));
  root.appendChild(el("p", { class: "garten-wz-hilfe" }, ["Miss innen. Für leicht konische Töpfe den Durchmesser oben und unten eintragen."]));
  root.appendChild(el("div", { class: "garten-wz-felder" }, [lab("wz-form", "Gefäß", form), lD, lDB, lL, lB, lab("wz-h", "Höhe (cm)", H), lab("wz-n", "Anzahl Gefäße", N), lab("wz-sack", "Sackgröße (l)", SACK)]));
  root.appendChild(out);
  function render() {
    var rund = form.value === "rund";
    lD.hidden = lDB.hidden = !rund; lL.hidden = lB.hidden = rund;
    out.innerHTML = "";
    var h = num(H), n = Math.max(1, Math.round(num(N) || 1)), sack = num(SACK) || 40, liter;
    if (rund) {
      var d1 = num(D), d2 = num(DB) || d1;
      if (!(d1 > 0 && h > 0)) { out.appendChild(el("p", { class: "garten-wz-leer" }, ["Trag Durchmesser und Höhe ein."])); return; }
      var r1 = d1 / 2, r2 = d2 / 2; liter = (Math.PI * h * (r1 * r1 + r1 * r2 + r2 * r2)) / 3 / 1000;
    } else {
      var l = num(L), b = num(B);
      if (!(l > 0 && b > 0 && h > 0)) { out.appendChild(el("p", { class: "garten-wz-leer" }, ["Trag Länge, Breite und Höhe ein."])); return; }
      liter = (l * b * h) / 1000;
    }
    var fuell = liter * 0.9 * n; // bis etwa 2 cm unter den Rand
    out.appendChild(el("p", { class: "garten-wz-kopf" }, ["Volumen: ", el("strong", {}, [f(liter, 1) + " l"]), " je Gefäß · zum Befüllen etwa " + f(fuell, 0) + " l → " + Math.ceil(fuell / sack) + " Sack à " + f(sack, 0) + " l"]));
    if (rund) out.appendChild(el("p", {}, ["Beim Umtopfen: der neue Topf etwa 2 bis 4 cm größer im Durchmesser, also rund " + f(num(D) + 2, 0) + " bis " + f(num(D) + 4, 0) + " cm."]));
    out.appendChild(el("ul", { class: "garten-wz-notiz" }, [el("li", {}, ["Torffreie Erde erkennst du an der Zutatenliste, nicht an Begriffen wie „torfreduziert“."]), el("li", {}, ["Ein Abzugsloch und eine Drainageschicht aus Blähton verhindern Staunässe."])]));
  }
  [form, D, DB, L, B, H, N, SACK].forEach(function (i) { i.addEventListener("input", render); i.addEventListener("change", render); });
  render();
})();
