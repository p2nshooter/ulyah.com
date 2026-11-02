/* ZEVOK Pflegesymbole-Decoder: Tippe die Symbole an, die auf deinem Etikett stehen, und lies, was sie bedeuten und
   was du tun musst. Reihenfolge und Bedeutung nach der internationalen Pflegekennzeichnung (ISO 3758, GINETEX):
   Waschen, Bleichen, Trocknen, Bügeln, professionelle Pflege. Die Zeichen sind eigene Zeichnungen von ZEVOK. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "pflegesymbole") return;
  var NS = "http://www.w3.org/2000/svg";

  // ── Zeichnungen (viewBox 0 0 48 48, Strich in currentColor) ──
  function svg(parts) {
    var s = document.createElementNS(NS, "svg");
    s.setAttribute("viewBox", "0 0 48 48");
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("focusable", "false");
    parts.forEach(function (p) {
      var n = document.createElementNS(NS, p[0]);
      for (var k in p[1]) n.setAttribute(k, p[1][k]);
      if (p[2]) n.textContent = p[2];
      s.appendChild(n);
    });
    return s;
  }
  var line = function (x1, y1, x2, y2) { return ["line", { x1: x1, y1: y1, x2: x2, y2: y2 }]; };
  var cross = [line(6, 6, 42, 42), line(42, 6, 6, 42)];
  var bars = function (n, y) { var out = []; for (var i = 0; i < n; i++) out.push(line(9, y + i * 4, 39, y + i * 4)); return out; };
  var tub = function (label, n, hand) {
    var p = [["path", { d: "M5 14q4.5-4 9 0t9.5 0 9.5 0 9 0" }], ["path", { d: "M7 14l4 22h26l4-22" }]];
    if (label) p.push(["text", { x: 24, y: 31, "text-anchor": "middle", "font-size": 12, stroke: "none", fill: "currentColor" }, label]);
    if (hand) p.push(["path", { d: "M18 32v-9m3 9v-11m3 11v-11m3 11v-9m-12 6l3 3h9" }]);
    return p.concat(bars(n || 0, 40));
  };
  var tri = function (lines) { var p = [["path", { d: "M24 7l18 32H6z" }]]; if (lines) p.push(line(21, 37, 29, 20), line(26, 37, 34, 23)); return p; };
  var square = [["rect", { x: 7, y: 7, width: 34, height: 34 }]];
  var tumble = function (dots) {
    var p = square.concat([["circle", { cx: 24, cy: 24, r: 11 }]]);
    for (var i = 0; i < dots; i++) p.push(["circle", { cx: dots === 1 ? 24 : 20 + i * 8, cy: 24, r: 1.8, fill: "currentColor" }]);
    return p;
  };
  var air = function (kind, shade) {
    var p = square.slice();
    if (kind === "v1") p.push(line(24, 12, 24, 36));
    if (kind === "v2") p.push(line(20, 12, 20, 36), line(28, 12, 28, 36));
    if (kind === "h1") p.push(line(12, 24, 36, 24));
    if (kind === "h2") p.push(line(12, 20, 36, 20), line(12, 28, 36, 28));
    if (shade) p.push(line(7, 17, 17, 7));
    return p;
  };
  var iron = function (dots, noSteam) {
    var p = [["path", { d: "M6 34h36c0-10-5-16-14-16H16c-3 0-4 2-4 5" }], ["path", { d: "M16 18l-2-6h18" }]];
    for (var i = 0; i < dots; i++) p.push(["circle", { cx: 24 - (dots - 1) * 4 + i * 8, cy: 28, r: 1.8, fill: "currentColor" }]);
    if (noSteam) p.push(line(12, 38, 18, 44), line(20, 38, 26, 44), line(28, 38, 34, 44), line(10, 44, 36, 38));
    return p;
  };
  var circle = function (letter, n) {
    var p = [["circle", { cx: 24, cy: 22, r: 15 }]];
    if (letter) p.push(["text", { x: 24, y: 27, "text-anchor": "middle", "font-size": 14, stroke: "none", fill: "currentColor" }, letter]);
    return p.concat(bars(n || 0, 41));
  };

  // ── Bedeutung: was das Symbol sagt und was du tun musst ──
  var GROUPS = [
    { key: "waschen", name: "Waschen", items: [
      { id: "w95", d: tub("95"), t: "Bis 95 °C, normales Programm", do: "Koch- oder Buntwäsche bis 95 °C. Weiße Baumwolle und Leinen vertragen das." },
      { id: "w60", d: tub("60"), t: "Bis 60 °C, normales Programm", do: "Bunt- oder Kochwäsche bis 60 °C, zum Beispiel für Handtücher und Bettwäsche." },
      { id: "w60b", d: tub("60", 1), t: "Bis 60 °C, Pflegeleicht", do: "Programm für Pflegeleichtes: mildere Mechanik, Trommel nur etwa halb voll." },
      { id: "w40", d: tub("40"), t: "Bis 40 °C, normales Programm", do: "Buntwäsche bis 40 °C." },
      { id: "w40b", d: tub("40", 1), t: "Bis 40 °C, Pflegeleicht", do: "Pflegeleicht-Programm bis 40 °C, nicht voll beladen, schonend schleudern." },
      { id: "w40bb", d: tub("40", 2), t: "Bis 40 °C, sehr schonend", do: "Fein- oder Wollprogramm bis 40 °C, sanft schleudern." },
      { id: "w30", d: tub("30"), t: "Bis 30 °C, normales Programm", do: "Waschen bis 30 °C." },
      { id: "w30b", d: tub("30", 1), t: "Bis 30 °C, Pflegeleicht", do: "Pflegeleicht-Programm bis 30 °C." },
      { id: "w30bb", d: tub("30", 2), t: "Bis 30 °C, sehr schonend", do: "Fein- oder Wollprogramm bis 30 °C, kaum schleudern." },
      { id: "hand", d: tub("", 0, true), t: "Handwäsche", do: "Von Hand, lauwarm (höchstens 40 °C), drücken statt reiben, nicht wringen. Viele Maschinen haben ein Handwäsche-Programm." },
      { id: "wx", d: tub("").concat(cross), t: "Nicht waschen", do: "Weder Maschine noch Hand: Das Teil gehört in die Textilreinigung." },
    ] },
    { key: "bleichen", name: "Bleichen", items: [
      { id: "b", d: tri(false), t: "Bleichen erlaubt", do: "Jede Bleiche ist erlaubt, auch Chlor. Im Haushalt reicht fast immer Sauerstoffbleiche." },
      { id: "bo", d: tri(true), t: "Nur Sauerstoffbleiche", do: "Fleckensalz oder Vollwaschmittel mit Sauerstoffbleiche ja, Chlorbleiche nein." },
      { id: "bx", d: tri(false).concat(cross), t: "Nicht bleichen", do: "Kein Fleckensalz, kein Vollwaschmittel mit Bleiche: Color- oder Feinwaschmittel nehmen." },
    ] },
    { key: "trockner", name: "Wäschetrockner", items: [
      { id: "t2", d: tumble(2), t: "Trockner, normale Temperatur", do: "Normales Trocknerprogramm." },
      { id: "t1", d: tumble(1), t: "Trockner, reduzierte Temperatur", do: "Nur das Schonprogramm mit reduzierter Temperatur." },
      { id: "tx", d: tumble(0).concat(cross), t: "Nicht in den Trockner", do: "Wolle kann verfilzen, Kunstfasern verformen sich, Baumwolle läuft ein. An der Luft trocknen ist erlaubt." },
    ] },
    { key: "luft", name: "Lufttrocknen", items: [
      { id: "v1", d: air("v1"), t: "Auf der Leine", do: "Geschleudert auf die Leine oder auf einen Bügel." },
      { id: "v2", d: air("v2"), t: "Tropfnass aufhängen", do: "Ohne Schleudern aufhängen, damit es nicht knittert." },
      { id: "h1", d: air("h1"), t: "Liegend trocknen", do: "Flach auf einem Handtuch oder Trockengitter, damit Strick sich nicht in die Länge zieht." },
      { id: "h2", d: air("h2"), t: "Tropfnass liegend", do: "Ungeschleudert flach auslegen." },
      { id: "v1s", d: air("v1", true), t: "Auf der Leine, im Schatten", do: "Aufhängen, aber nicht in die Sonne: Die Farbe kann ausbleichen." },
      { id: "h1s", d: air("h1", true), t: "Liegend, im Schatten", do: "Flach trocknen, ohne direkte Sonne." },
    ] },
    { key: "buegeln", name: "Bügeln", items: [
      { id: "i3", d: iron(3), t: "Bügeln bis etwa 200 °C", do: "Drei Punkte am Regler: Baumwolle, Leinen. Leicht feucht bügelt es sich am besten." },
      { id: "i2", d: iron(2), t: "Bügeln bis etwa 150 °C", do: "Zwei Punkte: Polyester, Wolle, Seide, Viskose. Wolle und Seide von links oder mit Tuch dazwischen." },
      { id: "i1", d: iron(1), t: "Bügeln bis etwa 110 °C", do: "Ein Punkt: Polyacryl, Polyamid, Acetat, Elastan-Mischungen. Dampf kann empfindliche Fasern dauerhaft schädigen." },
      { id: "inosteam", d: iron(0, true), t: "Ohne Dampf bügeln", do: "Dampfstoß ausschalten." },
      { id: "ix", d: iron(0).concat(cross), t: "Nicht bügeln", do: "Etwa bei Beschichtung, Aufdruck oder Pailletten: Knitter lieber aushängen lassen." },
    ] },
    { key: "profi", name: "Professionelle Pflege", items: [
      { id: "P", d: circle("P"), t: "Chemische Reinigung, übliche Lösemittel", do: "Hinweis für die Reinigung. Für dich zu Hause ändert er nichts: Ob du waschen darfst, sagt nur der Bottich." },
      { id: "Pb", d: circle("P", 1), t: "Chemische Reinigung, schonend", do: "Hinweis für die Reinigung: schonendes Verfahren." },
      { id: "F", d: circle("F"), t: "Chemische Reinigung, nur schonendere Lösemittel", do: "Hinweis für die Reinigung." },
      { id: "Fb", d: circle("F", 1), t: "Schonendere Lösemittel, schonend", do: "Hinweis für die Reinigung." },
      { id: "cx", d: circle("").concat(cross), t: "Keine chemische Reinigung", do: "Die Reinigung darf keine Lösemittel verwenden." },
      { id: "W", d: circle("W"), t: "Professionelle Nassreinigung", do: "Ein schonendes Verfahren mit Wasser in der Reinigung." },
      { id: "Wb", d: circle("W", 1), t: "Nassreinigung, schonend", do: "Hinweis für die Reinigung." },
      { id: "Wbb", d: circle("W", 2), t: "Nassreinigung, sehr schonend", do: "Hinweis für die Reinigung." },
      { id: "Wx", d: circle("W").concat(cross), t: "Keine Nassreinigung", do: "Die Reinigung darf das Teil nicht nass reinigen." },
    ] },
  ];

  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  };
  var chosen = {};
  var summary = el("div", { class: "erz-wz-ergebnis", "aria-live": "polite" });
  root.className += " erz-wz";
  root.appendChild(el("p", { class: "erz-wz-titel" }, ["Pflegesymbole-Decoder"]));
  root.appendChild(el("p", { class: "erz-wz-hilfe" }, ["Tippe in jeder Reihe das Symbol an, das auf deinem Etikett steht. Fehlt eine Reihe auf dem Etikett, lass sie leer. Unten steht, was du tun musst."]));

  GROUPS.forEach(function (g) {
    var row = el("div", { class: "erz-wz-symbole", role: "group", "aria-label": g.name });
    g.items.forEach(function (it) {
      var b = el("button", { type: "button", class: "erz-wz-symbol", "aria-pressed": "false", title: it.t }, [svg(it.d), el("span", {}, [it.t])]);
      b.addEventListener("click", function () {
        var on = chosen[g.key] !== it;
        chosen[g.key] = on ? it : undefined;
        Array.prototype.forEach.call(row.children, function (c) { c.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", on ? "true" : "false");
        render();
      });
      row.appendChild(b);
    });
    root.appendChild(el("section", { class: "erz-wz-teil" }, [el("h3", {}, [g.name]), row]));
  });
  root.appendChild(summary);

  function render() {
    summary.innerHTML = "";
    var picked = GROUPS.filter(function (g) { return chosen[g.key]; });
    if (!picked.length) { summary.appendChild(el("p", { class: "erz-wz-leer" }, ["Noch nichts gewählt."])); return; }
    summary.appendChild(el("p", { class: "erz-wz-kopf" }, ["So pflegst du dieses Teil"]));
    summary.appendChild(el("dl", {}, picked.reduce(function (acc, g) {
      return acc.concat([el("dt", {}, [g.name + ": " + chosen[g.key].t]), el("dd", {}, [chosen[g.key].do])]);
    }, [])));
    var w = chosen.waschen && chosen.waschen.id, notes = [];
    if (w === "wx" && !chosen.profi) notes.push("Nicht waschen und kein Kreis für die Reinigung: Zeig das Etikett in der Reinigung und frag, bevor du etwas versuchst.");
    if (w && /bb$|hand/.test(w) && chosen.trockner && chosen.trockner.id !== "tx") notes.push("Fein- oder Handwäsche, aber Trockner erlaubt: Im Zweifel lieber an der Luft trocknen.");
    if (chosen.bleichen && chosen.bleichen.id === "bx") notes.push("Für Flecken auf diesem Teil keine Sauerstoffbleiche: Spülmittel, Gallseife oder die Reinigung.");
    if (!w) notes.push("Ohne Waschsymbol weißt du nicht, ob gewaschen werden darf. Fehlt das Etikett ganz: kalt von Hand oder im Feinprogramm, nicht in den Trockner.");
    if (notes.length) summary.appendChild(el("ul", { class: "erz-wz-notiz" }, notes.map(function (n) { return el("li", {}, [n]); })));
  }
  render();
})();
