/* BYOXY Pflanzen-Steckbrief: Licht, Temperatur, Gießen, Luftfeuchtigkeit und Giftigkeit der beliebtesten Zimmerpflanzen,
   aus den Pflegetabellen unserer Ratgeber; die Giftigkeit für Katzen und Hunde folgt den Listen der ASPCA. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "steckbrief") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var P = {
    monstera: ["Monstera", "Hell, ohne pralle Mittagssonne", "18 bis 25 °C, nicht unter 15 °C", "Wenn die oberen 3 bis 5 cm Erde trocken sind", "", "Leicht giftig für Menschen und Haustiere (Calciumoxalat, Reizungen im Mund)", "monstera-pflege", true],
    efeutute: ["Efeutute", "Hell bis halbschattig, keine pralle Sonne", "18 bis 25 °C, nicht unter 15 °C", "Wenn die oberen 2 bis 3 cm Erde trocken sind", "", "Giftig für Haustiere und Kleinkinder (Calciumoxalat)", "efeutute-pflege", true],
    friedenslilie: ["Friedenslilie (Spathiphyllum)", "Hell bis halbschattig, keine direkte Mittagssonne", "18 bis 25 °C, nicht unter etwa 15 °C", "Gleichmäßig leicht feucht, ohne Staunässe", "Mittel bis hoch", "Leicht giftig für Menschen und Haustiere (Calciumoxalat)", "friedenslilie-pflege", true],
    zamioculcas: ["Glücksfeder (Zamioculcas)", "Hell bis schattig, keine pralle Mittagssonne", "18 bis 26 °C, nicht unter 15 °C", "Erst, wenn die Erde fast vollständig trocken ist", "", "Giftig für Menschen und Haustiere (Calciumoxalat); beim Umtopfen Handschuhe", "gluecksfeder-zamioculcas-pflege", true],
    sansevieria: ["Bogenhanf (Sansevieria)", "Hell bis halbschattig, verträgt auch Sonne", "18 bis 27 °C, nicht unter 12 °C", "Erst, wenn die Erde vollständig trocken ist", "", "Leicht giftig für Haustiere (Saponine)", "bogenhanf-sansevieria-pflege", true],
    calathea: ["Calathea (Korbmarante)", "Hell bis halbschattig, keine direkte Sonne", "18 bis 25 °C, nicht unter 16 °C", "Erde gleichmäßig leicht feucht halten", "Möglichst über 50 Prozent", "Gilt als ungiftig für Menschen und Haustiere", "calathea-pflege", false],
    ficus: ["Geigenfeige (Ficus lyrata)", "Sehr hell, gern mit etwas Morgen- oder Abendsonne", "18 bis 26 °C, nicht unter 15 °C", "Wenn die oberen 3 bis 5 cm Erde trocken sind", "", "Milchsaft reizt Haut und Schleimhäute, leicht giftig für Haustiere", "geigenfeige-ficus-lyrata-pflege", true],
    orchidee: ["Orchidee (Phalaenopsis)", "Hell, ohne direkte Mittagssonne", "18 bis 26 °C, nachts gern einige Grad kühler", "Tauchen statt gießen, sobald die Wurzeln silbrig aussehen", "", "Gilt als ungiftig für Menschen und Haustiere", "orchideen-phalaenopsis-pflege", false],
    kakteen: ["Kakteen und Sukkulenten", "Sonnig", "warm im Sommer, kühle und trockene Winterruhe", "Durchtränken, dann vollständig abtrocknen lassen; im Winter kaum", "", "Die meisten Kakteen ungiftig (Dornen verletzen); manche Euphorbien, Kalanchoe und Aloe giftig für Haustiere", "kakteen-und-sukkulenten-pflege", null],
  };
  var sel = el("select", { id: "wz-pflanze" }, Object.keys(P).map(function (k) { return el("option", { value: k }, [P[k][0]]); }));
  var tier = el("input", { type: "checkbox", id: "wz-tiere" });
  var out = el("div", { class: "garten-wz-ergebnis", "aria-live": "polite" });
  root.className += " garten-wz";
  root.appendChild(el("p", { class: "garten-wz-titel" }, ["Pflanzen-Steckbrief"]));
  root.appendChild(el("p", { class: "garten-wz-hilfe" }, ["Wähle eine Pflanze und lies auf einen Blick, wo sie stehen möchte, wann sie Wasser braucht und ob sie für Kinder und Haustiere ein Thema ist."]));
  root.appendChild(el("div", { class: "garten-wz-felder" }, [el("label", { for: "wz-pflanze" }, ["Pflanze", sel]), el("label", { for: "wz-tiere", class: "garten-wz-haken" }, [tier, "Nur Pflanzen zeigen, die für Haustiere als ungiftig gelten"])]));
  root.appendChild(out);
  function fill() {
    var keep = sel.value;
    sel.innerHTML = "";
    Object.keys(P).filter(function (k) { return !tier.checked || P[k][7] === false; }).forEach(function (k) { sel.appendChild(el("option", { value: k }, [P[k][0]])); });
    if ([].some.call(sel.options, function (o) { return o.value === keep; })) sel.value = keep;
    render();
  }
  function row(k, v) { return v ? el("tr", {}, [el("th", { scope: "row" }, [k]), el("td", {}, [v])]) : null; }
  function render() {
    var p = P[sel.value]; out.innerHTML = "";
    out.appendChild(el("p", { class: "garten-wz-kopf" }, [p[0]]));
    out.appendChild(el("table", {}, [el("tbody", {}, [row("Licht", p[1]), row("Temperatur", p[2]), row("Gießen", p[3]), row("Luftfeuchtigkeit", p[4]), row("Kinder und Haustiere", p[5])].filter(Boolean))]));
    var more = el("p", { class: "garten-wz-mehr" }, ["Ausführlich: "]);
    more.appendChild(el("a", { href: "/ratgeber/" + p[6] + "/" }, ["der Pflegeratgeber"]));
    out.appendChild(more);
    if (p[7]) out.appendChild(el("p", { class: "garten-wz-notiz" }, ["Hat ein Kind oder Tier daran gekaut: Mund ausspülen, bei Beschwerden den Giftnotruf deines Bundeslandes oder die Tierarztpraxis anrufen."]));
  }
  sel.addEventListener("change", render); tier.addEventListener("change", fill);
  render();
})();
