/* ROUGH.LAT · Guía de cuidado de gemas: dureza, tenacidad, cómo limpiarla (agua tibia con jabón, ultrasonidos, vapor) y
   si conviene para un anillo de uso diario. Los datos son los de nuestras guías de dureza y de limpieza, que siguen las
   indicaciones de cuidado del GIA. Un tratamiento o una fisura cambian la respuesta: ante la duda, pregunta al joyero. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "cuidado-gemas") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var SI = "sí", NO = "no", PREC = "con precaución: solo si el joyero confirma que no tiene fisuras ni tratamientos";
  // [nombre, dureza, tenacidad, agua tibia con jabón, ultrasonidos, vapor, anillo diario, nota]
  var G = {
    diamante: ["Diamante", "10", "buena (puede astillarse por su exfoliación)", SI, "en general sí, si no tiene fisuras ni rellenos", "en general sí, si no tiene fisuras ni rellenos", SI, "La grasa le quita brillo: límpialo a menudo."],
    corindon: ["Rubí y zafiro", "9", "excelente", SI, "en general sí si no tiene tratamiento o solo calentamiento; no si está relleno de vidrio o teñido", "igual que los ultrasonidos", SI, "Los rellenos de vidrio son sensibles incluso a ácidos suaves como el limón."],
    crisoberilo: ["Crisoberilo y alejandrita", "8,5", "excelente", SI, PREC, PREC, SI, "Muy resistentes para joyas de uso diario."],
    espinela: ["Espinela", "8", "buena", SI, PREC, PREC, SI, "Resistente y estable."],
    topacio: ["Topacio", "8", "regular (exfoliación perfecta)", "sí, evitando cambios bruscos de temperatura", NO, NO, "con engaste protector", "Un golpe en la dirección de exfoliación puede partirlo."],
    aguamarina: ["Aguamarina", "7,5 a 8", "buena", "sí, evitando cambios bruscos de temperatura", PREC, NO, SI, "Apta para uso diario."],
    esmeralda: ["Esmeralda", "7,5 a 8", "regular a pobre", "solo un enjuague breve, sin remojo", NO, NO, "con engaste protector", "Casi todas llevan aceites o resinas en sus fisuras: el calor y los ultrasonidos los sacan."],
    turmalina: ["Turmalina", "7 a 7,5", "regular", "sí, evitando cambios bruscos de temperatura", NO, NO, "con cuidado", "Apta para anillos con un engaste que la proteja."],
    cuarzo: ["Amatista, citrino y otros cuarzos", "7", "buena", SI, "en general sí, si no tiene fisuras ni tinte", NO, SI, "La amatista puede aclararse con mucha luz solar."],
    granate: ["Granates", "6,5 a 7,5", "regular a buena", SI, PREC, NO, "con cuidado", "Aptos en general."],
    peridoto: ["Peridoto", "6,5 a 7", "regular", "sí, evitando cambios bruscos de temperatura", NO, NO, "con engaste protector", "Sensible a los ácidos y a los cambios de temperatura."],
    tanzanita: ["Tanzanita", "6 a 7", "regular", "sí, con cuidado", "con mucha precaución", NO, "con engaste protector", "Evita cambios bruscos de temperatura."],
    opalo: ["Ópalo", "5,5 a 6,5", "pobre a regular", "paño humedecido, sin remojo", NO, NO, "mejor en colgantes y aretes", "No lo expongas al calor ni a la sequedad extrema."],
    turquesa: ["Turquesa", "5 a 6", "regular", "paño seco o apenas húmedo", NO, NO, "mejor en colgantes y aretes", "Porosa: absorbe aceites, cremas y perfumes."],
    lapis: ["Lapislázuli", "5 a 5,5", "regular", "paño seco o apenas húmedo", NO, NO, "mejor en colgantes y aretes", "Sensible a los productos químicos."],
    blandas: ["Malaquita y rodocrosita", "3,5 a 4", "pobre", "paño seco o apenas húmedo", NO, NO, NO, "Muy blandas: se rayan con el polvo del día a día."],
    perla: ["Perlas", "2,5 a 4,5", "regular", "paño suave apenas húmedo, nunca jabón fuerte", NO, NO, "con cuidado, mejor en collares y aretes", "Póntelas al final, después del perfume y la laca, y guárdalas aparte."],
    organica: ["Ámbar y coral", "2 a 4", "pobre a regular", "paño humedecido", NO, NO, "mejor en colgantes y aretes", "Sensibles a disolventes y ácidos."],
  };
  var sel = el("select", { id: "wz-gema" }, Object.keys(G).map(function (k) { return el("option", { value: k }, [G[k][0]]); }));
  var out = el("div", { class: "granada-wz-resultado", "aria-live": "polite" });
  root.className += " granada-wz";
  root.appendChild(el("p", { class: "granada-wz-titulo" }, ["Guía de cuidado de gemas"]));
  root.appendChild(el("p", { class: "granada-wz-ayuda" }, ["Elige la gema y verás cómo de dura y tenaz es, cómo limpiarla y para qué joya conviene. Si la piedra está tratada, rellena o fisurada, manda lo que diga el informe o tu joyero."]));
  root.appendChild(el("div", { class: "granada-wz-campos" }, [el("label", { for: "wz-gema" }, ["Gema", sel])]));
  root.appendChild(out);
  function fila(k, v) { var mal = /^no\b/.test(v); return el("tr", { class: mal ? "granada-wz-no" : null }, [el("th", { scope: "row" }, [k]), el("td", {}, [v])]); }
  function render() {
    var g = G[sel.value];
    out.innerHTML = "";
    out.appendChild(el("p", { class: "granada-wz-cabeza" }, [g[0] + " · dureza " + g[1] + " en la escala de Mohs"]));
    out.appendChild(el("table", {}, [el("tbody", {}, [fila("Tenacidad", g[2]), fila("Agua tibia con jabón", g[3]), fila("Ultrasonidos", g[4]), fila("Vapor", g[5]), fila("Anillo de uso diario", g[6])])]));
    out.appendChild(el("p", { class: "granada-wz-notas" }, [g[7]]));
    try { history.replaceState(null, "", "#" + sel.value); } catch (e) {}
  }
  var h = (location.hash || "").slice(1); if (G[h]) sel.value = h;
  sel.addEventListener("change", render);
  render();
})();
