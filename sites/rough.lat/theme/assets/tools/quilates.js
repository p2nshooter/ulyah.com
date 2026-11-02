/* ROUGH.LAT · Calculadora de quilates: 1 quilate = 0,2 g = 100 puntos (GIA), y peso estimado de una gema a partir de
   sus medidas, su forma y su densidad (peso específico). Las fórmulas son las estimaciones habituales del oficio:
   orientan, no sustituyen a la báscula. Funciona en tu navegador. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "quilates") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var num = function (i) { var v = parseFloat(String(i.value).replace(",", ".")); return isFinite(v) ? v : NaN; };
  var f = function (n, d) { return n.toLocaleString("es", { minimumFractionDigits: d, maximumFractionDigits: d }); };
  // Peso específico típico de cada gema.
  var GEMAS = [["diamante", "Diamante", 3.52], ["corindon", "Rubí o zafiro", 4.0], ["esmeralda", "Esmeralda", 2.72], ["aguamarina", "Aguamarina", 2.72], ["topacio", "Topacio", 3.53], ["turmalina", "Turmalina", 3.06], ["cuarzo", "Amatista, citrino y otros cuarzos", 2.65], ["espinela", "Espinela", 3.6], ["alejandrita", "Alejandrita o crisoberilo", 3.73], ["piropo", "Granate piropo", 3.78], ["almandino", "Granate almandino", 4.05], ["peridoto", "Peridoto", 3.34], ["tanzanita", "Tanzanita", 3.35], ["opalo", "Ópalo", 2.15]];
  // Factor de forma (mm³ → quilates, multiplicado por el peso específico).
  var FORMAS = [["redonda", "Redonda (brillante)", 0.0018, false], ["oval", "Oval", 0.002, true], ["esmeralda", "Talla esmeralda o rectangular", 0.0025, true], ["pera", "Pera", 0.00175, true], ["marquesa", "Marquesa", 0.0016, true]];
  root.className += " granada-wz";
  root.appendChild(el("p", { class: "granada-wz-titulo" }, ["Calculadora de quilates"]));
  // 1. Conversión
  var ct = el("input", { id: "wz-ct", type: "text", inputmode: "decimal", placeholder: "quilates" });
  var g = el("input", { id: "wz-g", type: "text", inputmode: "decimal", placeholder: "gramos" });
  var pt = el("input", { id: "wz-pt", type: "text", inputmode: "decimal", placeholder: "puntos" });
  root.appendChild(el("section", { class: "granada-wz-parte" }, [
    el("h3", {}, ["1. Quilates, gramos y puntos"]),
    el("p", { class: "granada-wz-ayuda" }, ["Escribe en cualquier casilla: las otras se calculan solas. El quilate de las gemas es una unidad de peso; el quilate del oro es otra cosa (su ley)."]),
    el("div", { class: "granada-wz-campos" }, [el("label", { for: "wz-ct" }, ["Quilates (ct)", ct]), el("label", { for: "wz-g" }, ["Gramos", g]), el("label", { for: "wz-pt" }, ["Puntos", pt])]),
  ]));
  function sync(src) {
    var v = num(src); if (!(v >= 0)) return;
    var q = src === ct ? v : src === g ? v / 0.2 : v / 100;
    // Sin separador de miles, para que la casilla se pueda volver a editar.
    var plain = function (n, d) { return String(Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).replace(".", ","); };
    if (src !== ct) ct.value = plain(q, 3);
    if (src !== g) g.value = plain(q * 0.2, 4);
    if (src !== pt) pt.value = plain(q * 100, 1);
  }
  [ct, g, pt].forEach(function (i) { i.addEventListener("input", function () { sync(i); }); });
  // 2. Estimación por medidas
  var gema = el("select", { id: "wz-gema" }, GEMAS.map(function (x) { return el("option", { value: x[0] }, [x[1] + " (" + f(x[2], 2) + ")"]); }));
  var forma = el("select", { id: "wz-forma" }, FORMAS.map(function (x) { return el("option", { value: x[0] }, [x[1]]); }));
  var largo = el("input", { id: "wz-largo", type: "text", inputmode: "decimal", placeholder: "mm" });
  var ancho = el("input", { id: "wz-ancho", type: "text", inputmode: "decimal", placeholder: "mm" });
  var prof = el("input", { id: "wz-prof", type: "text", inputmode: "decimal", placeholder: "mm" });
  var out = el("div", { class: "granada-wz-resultado", "aria-live": "polite" });
  var anchoLabel = el("label", { for: "wz-ancho" }, ["Ancho", ancho]);
  var largoLabel = el("label", { for: "wz-largo" }, ["Largo (o diámetro)", largo]);
  root.appendChild(el("section", { class: "granada-wz-parte" }, [
    el("h3", {}, ["2. Peso estimado por medidas"]),
    el("p", { class: "granada-wz-ayuda" }, ["Para una gema engastada que no se puede pesar. Mide en milímetros con un calibre; la profundidad va de la mesa al culet."]),
    el("div", { class: "granada-wz-campos" }, [el("label", { for: "wz-gema" }, ["Gema (peso específico)", gema]), el("label", { for: "wz-forma" }, ["Forma", forma]), largoLabel, anchoLabel, el("label", { for: "wz-prof" }, ["Profundidad", prof])]),
    out,
  ]));
  function render() {
    out.innerHTML = "";
    var fo = FORMAS.filter(function (x) { return x[0] === forma.value; })[0], ge = GEMAS.filter(function (x) { return x[0] === gema.value; })[0];
    anchoLabel.hidden = !fo[3];
    var L = num(largo), W = fo[3] ? num(ancho) : L, D = num(prof);
    if (!(L > 0) || !(W > 0) || !(D > 0)) { out.appendChild(el("p", { class: "granada-wz-vacio" }, ["Escribe las medidas en milímetros."])); return; }
    var est = L * W * D * fo[2] * ge[2];
    out.appendChild(el("p", { class: "granada-wz-cabeza" }, ["Peso estimado: ", el("strong", {}, [f(est, 2) + " ct"]), " (" + f(est * 0.2, 3) + " g)"]));
    out.appendChild(el("p", {}, ["Margen habitual de estas fórmulas: alrededor de un 10 a 15 %, más si la gema tiene un pabellón abultado, un filetín grueso o una talla irregular. Solo una báscula de quilates da el peso real."]));
  }
  [gema, forma, largo, ancho, prof].forEach(function (i) { i.addEventListener("input", render); i.addEventListener("change", render); });
  render();
})();
