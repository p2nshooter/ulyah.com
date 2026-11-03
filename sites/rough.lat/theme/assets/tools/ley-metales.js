/* ROUGH.LAT · Calculadora de ley de los metales: cuánto oro, plata o platino puro contiene una pieza según su ley
   (quilates o milésimas) y su peso. No da precios ni consejos de inversión. Funciona en tu navegador. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "ley-metales") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var num = function (i) { var v = parseFloat(String(i.value).replace(",", ".")); return isFinite(v) ? v : NaN; };
  var f = function (n, d) { return n.toLocaleString("es", { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var LEYES = [["oro", "Oro 24 quilates (999)", 999], ["oro", "Oro 22 quilates (916)", 916], ["oro", "Oro 18 quilates (750)", 750], ["oro", "Oro 14 quilates (585)", 585], ["oro", "Oro 10 quilates (417)", 417], ["oro", "Oro 9 quilates (375)", 375], ["plata", "Plata fina (999)", 999], ["plata", "Plata 950", 950], ["plata", "Plata de ley (925)", 925], ["platino", "Platino 950", 950], ["platino", "Platino 900", 900], ["otra", "Otra ley (milésimas) …", 0]];
  var ley = el("select", { id: "wz-ley" }, LEYES.map(function (x, i) { return el("option", { value: String(i) }, [x[1]]); }));
  var mil = el("input", { id: "wz-mil", type: "text", inputmode: "decimal", placeholder: "p. ej. 800" });
  var peso = el("input", { id: "wz-peso", type: "text", inputmode: "decimal", placeholder: "gramos" });
  var kt = el("input", { id: "wz-kt", type: "text", inputmode: "decimal", placeholder: "p. ej. 18" });
  var out = el("div", { class: "granada-wz-resultado", "aria-live": "polite" });
  var conv = el("p", { class: "granada-wz-cabeza", "aria-live": "polite" });
  var milLabel = el("label", { for: "wz-mil" }, ["Milésimas", mil]);
  root.className += " granada-wz";
  root.appendChild(el("p", { class: "granada-wz-titulo" }, ["Calculadora de ley de los metales"]));
  root.appendChild(el("p", { class: "granada-wz-ayuda" }, ["La ley es la proporción de metal precioso en la aleación, en milésimas: 750 significa 750 partes de oro por cada 1.000. Suele ir grabada en el interior de la pieza."]));
  root.appendChild(el("div", { class: "granada-wz-campos" }, [el("label", { for: "wz-ley" }, ["Metal y ley", ley]), milLabel, el("label", { for: "wz-peso" }, ["Peso de la pieza", peso])]));
  root.appendChild(out);
  root.appendChild(el("section", { class: "granada-wz-parte" }, [el("h3", {}, ["Quilates del oro ↔ milésimas"]), el("div", { class: "granada-wz-campos" }, [el("label", { for: "wz-kt" }, ["Quilates del oro", kt])]), conv]));
  function render() {
    out.innerHTML = "";
    var l = LEYES[Number(ley.value)];
    milLabel.hidden = l[0] !== "otra";
    var m = l[0] === "otra" ? num(mil) : l[2], p = num(peso);
    if (!(m > 0 && m <= 1000)) { out.appendChild(el("p", { class: "granada-wz-vacio" }, ["Indica la ley en milésimas (de 1 a 1.000)."])); return; }
    if (!(p > 0)) { out.appendChild(el("p", { class: "granada-wz-vacio" }, ["Escribe el peso de la pieza en gramos."])); return; }
    var puro = (p * m) / 1000;
    out.appendChild(el("p", { class: "granada-wz-cabeza" }, ["Metal puro: ", el("strong", {}, [f(puro, 2) + " g"]), " de " + f(p, 2) + " g (" + f(m / 10, 1) + " %)"]));
    var notas = ["Si la pieza tiene piedras, el peso total las incluye: el metal puro real es menor."];
    if (l[0] === "oro" || l[0] === "otra") notas.push("En quilates del oro, esta ley equivale a unos " + f((m * 24) / 1000, 1) + " quilates.");
    if (l[0] === "plata" && m < 925) notas.push("Por debajo de 925 no se suele hablar de plata de ley.");
    notas.push("La alpaca o «plata alemana» no contiene plata: es cobre, níquel y zinc.");
    out.appendChild(el("ul", { class: "granada-wz-notas" }, notas.map(function (n) { return el("li", {}, [n]); })));
  }
  function convertir() { var k = num(kt); conv.textContent = k > 0 && k <= 24 ? f(k, k % 1 ? 1 : 0) + " quilates = " + f((k / 24) * 1000, 0) + " milésimas (" + f((k / 24) * 100, 1) + " % de oro)" : ""; }
  [ley, mil, peso].forEach(function (i) { i.addEventListener("input", render); i.addEventListener("change", render); });
  kt.addEventListener("input", convertir);
  render();
})();
