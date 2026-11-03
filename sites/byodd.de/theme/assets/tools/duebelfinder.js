/* BYODD Dübel- und Bohrer-Finder: Wandbaustoff und Last → passender Dübeltyp, Bohrmodus und Hinweise. Lasten in Kilogramm
   nennt nur der Hersteller oder die Zulassung des Dübels; hier geht es um die richtige Art. Läuft im Browser. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "duebelfinder") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var WAND = {
    beton: { name: "Beton", erkennen: "sehr hart, graues Bohrmehl, der Bohrer kommt nur mit Schlag voran", bohren: "Schlag- oder Hammerbohren, Steinbohrer", d: { leicht: "Spreizdübel oder Universaldübel, 5 bis 6 mm", mittel: "Spreizdübel, 6 bis 8 mm", schwer: "Spreizdübel 8 bis 10 mm oder ein Langschaftdübel" } },
    vollziegel: { name: "Vollziegel oder Kalksandstein", erkennen: "rotes (Ziegel) oder helles (Kalksandstein) Bohrmehl, gleichmäßiger Widerstand", bohren: "Schlagbohren, Steinbohrer", d: { leicht: "Spreizdübel oder Universaldübel, 5 bis 6 mm", mittel: "Spreizdübel, 8 mm", schwer: "Spreiz- oder Langschaftdübel, 10 mm" } },
    lochziegel: { name: "Lochziegel (Hochlochziegel)", erkennen: "rotes Bohrmehl, der Bohrer fällt immer wieder ins Leere", bohren: "ohne Schlag drehend bohren, sonst brechen die Stege und das Loch wird zu groß", d: { leicht: "Universaldübel, der sich in den Hohlräumen verknotet", mittel: "langer Universal- oder Rahmendübel", schwer: "Injektionsmörtel mit Siebhülse und Ankerstange" } },
    porenbeton: { name: "Porenbeton (Gasbeton)", erkennen: "weich, hell, fast weißes Bohrmehl, sehr leicht zu bohren", bohren: "ohne Schlag, oft mit kleinerem Bohrer als dem Dübeldurchmesser – Herstellerangabe beachten", d: { leicht: "Porenbetondübel oder Universaldübel", mittel: "Porenbetondübel mit Rippen oder Spirale", schwer: "Injektionsmörtel für Porenbeton" } },
    gipskarton: { name: "Gipskarton oder Hohlwand", erkennen: "klingt hohl, weißes Gipsmehl, nach 1 bis 2 cm Hohlraum", bohren: "ohne Schlag, Holz- oder Mehrzweckbohrer", d: { leicht: "Hohlraumdübel aus Kunststoff oder Universaldübel", mittel: "Hohlraumdübel aus Metall oder Kippdübel", schwer: "nicht in die Platte allein: in den Ständer schrauben oder eine Traverse einbauen lassen" } },
    holz: { name: "Holz, Spanplatte, Holzbalken", erkennen: "Holzspäne beim Bohren", bohren: "Holzbohrer, kein Schlag", d: { leicht: "kein Dübel: Holzschraube, bei Hartholz und nahe am Rand vorbohren", mittel: "Holzschraube in passender Länge, vorbohren", schwer: "lange Holzschrauben in tragendes Holz, nicht in dünne Plattenkanten" } },
  };
  var LAST = { leicht: "leicht – Bild, Haken, kleines Regalbrett", mittel: "mittel – Wandregal, Spiegel, Gardinenstange", schwer: "schwer – Hängeschrank, TV-Halter, Waschbecken" };
  var wand = el("select", { id: "wz-wand" }, Object.keys(WAND).map(function (k) { return el("option", { value: k }, [WAND[k].name]); }));
  var last = el("select", { id: "wz-last" }, Object.keys(LAST).map(function (k) { return el("option", { value: k }, [LAST[k]]); }));
  var out = el("div", { class: "zeder-wz-ergebnis", "aria-live": "polite" });
  root.className += " zeder-wz";
  root.appendChild(el("p", { class: "zeder-wz-titel" }, ["Dübel- und Bohrer-Finder"]));
  root.appendChild(el("p", { class: "zeder-wz-hilfe" }, ["Wähle die Wand und was daran hängen soll. Unsicher, welche Wand es ist? Eine Probebohrung an unauffälliger Stelle und das Bohrmehl verraten es."]));
  root.appendChild(el("div", { class: "zeder-wz-felder" }, [el("label", { for: "wz-wand" }, ["Wand", wand]), el("label", { for: "wz-last" }, ["Last", last])]));
  root.appendChild(out);
  function render() {
    var w = WAND[wand.value], l = last.value;
    out.innerHTML = "";
    out.appendChild(el("table", {}, [el("tbody", {}, [
      el("tr", {}, [el("th", { scope: "row" }, ["Dübel"]), el("td", {}, [w.d[l]])]),
      el("tr", {}, [el("th", { scope: "row" }, ["Bohren"]), el("td", {}, [w.bohren])]),
      el("tr", {}, [el("th", { scope: "row" }, ["So erkennst du die Wand"]), el("td", {}, [w.erkennen])]),
    ])]));
    var notes = ["Vor jedem Loch Leitungen orten: nicht senkrecht über und unter Steckdosen und Schaltern und nicht waagerecht daneben bohren.", "Bohrloch aussaugen, Dübel bündig setzen, Schraube in der Länge Dübel + Anbauteil + etwa ein Schraubendurchmesser.", "Wie viel Kilogramm ein Dübel trägt, steht beim Hersteller oder in der Zulassung des Deutschen Instituts für Bautechnik – nicht auf einem Etikett im Regal."];
    if (l === "schwer") notes.unshift("Schwere Lasten an Decken, über Betten und Sofas oder an unbekannten Wänden: lieber eine Fachkraft fragen.");
    out.appendChild(el("ul", { class: "zeder-wz-notizen" }, notes.map(function (n) { return el("li", {}, [n]); })));
  }
  wand.addEventListener("change", render); last.addEventListener("change", render);
  render();
})();
