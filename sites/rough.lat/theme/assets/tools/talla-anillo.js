/* ROUGH.LAT · Convertidor de talla de anillo: diámetro interior, circunferencia interior (talla europea, ISO 8653) y
   talla de EE. UU., Canadá y México (diámetro = 11,63 mm + 0,8128 mm por talla). Funciona en tu navegador. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "talla-anillo") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var num = function (i) { var v = parseFloat(String(i.value).replace(",", ".")); return isFinite(v) ? v : NaN; };
  var f = function (n, d) { return n.toLocaleString("es", { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var tipo = el("select", { id: "wz-tipo" }, [el("option", { value: "d" }, ["Diámetro interior (mm)"]), el("option", { value: "c" }, ["Circunferencia interior (mm)"]), el("option", { value: "us" }, ["Talla de EE. UU., Canadá o México"]), el("option", { value: "eu" }, ["Talla europea (ISO)"])]);
  var valor = el("input", { id: "wz-valor", type: "text", inputmode: "decimal", placeholder: "p. ej. 17,3" });
  var out = el("div", { class: "granada-wz-resultado", "aria-live": "polite" });
  root.className += " granada-wz";
  root.appendChild(el("p", { class: "granada-wz-titulo" }, ["Convertidor de talla de anillo"]));
  root.appendChild(el("p", { class: "granada-wz-ayuda" }, ["Mide el diámetro interior de un anillo que te quede bien, o usa la talla que ya conoces. Al final del día los dedos suelen estar algo más gruesos que por la mañana."]));
  root.appendChild(el("div", { class: "granada-wz-campos" }, [el("label", { for: "wz-tipo" }, ["Lo que conozco", tipo]), el("label", { for: "wz-valor" }, ["Valor", valor])]));
  root.appendChild(out);
  function render() {
    out.innerHTML = "";
    var v = num(valor), d;
    if (!(v > 0)) { out.appendChild(el("p", { class: "granada-wz-vacio" }, ["Escribe una medida o una talla."])); return; }
    if (tipo.value === "d") d = v;
    if (tipo.value === "c") d = v / Math.PI;
    if (tipo.value === "us") d = 11.63 + 0.8128 * v;
    if (tipo.value === "eu") d = v / Math.PI;
    if (!(d >= 12 && d <= 26)) { out.appendChild(el("p", { class: "granada-wz-vacio" }, ["Esa medida queda fuera de las tallas habituales (diámetro de 12 a 26 mm). Revisa la unidad."])); return; }
    var c = d * Math.PI, us = (d - 11.63) / 0.8128, usMedia = Math.round(us * 2) / 2;
    out.appendChild(el("p", { class: "granada-wz-cabeza" }, ["Talla EE. UU./México ", el("strong", {}, [f(usMedia, usMedia % 1 ? 1 : 0)]), " · talla europea ", el("strong", {}, [f(Math.round(c), 0)])]));
    out.appendChild(el("table", {}, [
      el("thead", {}, [el("tr", {}, [el("th", {}, ["Diámetro interior"]), el("th", {}, ["Circunferencia interior"]), el("th", {}, ["Talla EE. UU./México"]), el("th", {}, ["Talla europea (ISO)"])])]),
      el("tbody", {}, [el("tr", {}, [el("td", {}, [f(d, 1) + " mm"]), el("td", {}, [f(c, 1) + " mm"]), el("td", {}, [f(us, 2) + " (≈ " + f(usMedia, usMedia % 1 ? 1 : 0) + ")"]), el("td", {}, [f(Math.round(c), 0)])])]),
    ]));
    out.appendChild(el("ul", { class: "granada-wz-notas" }, [
      el("li", {}, ["Para bandas anchas (6 mm o más) suele hacer falta media talla más."]),
      el("li", {}, ["Si el nudillo es ancho, la talla debe pasar el nudillo; un anillo de confort o un tope interior ayudan."]),
      el("li", {}, ["Las equivalencias son aproximadas: confirma con un medidor de joyería antes de un encargo definitivo."]),
    ]));
  }
  tipo.addEventListener("change", render); valor.addEventListener("input", render);
  render();
})();
