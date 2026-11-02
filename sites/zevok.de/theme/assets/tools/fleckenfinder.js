/* ZEVOK Fleckenfinder: Fleck + Material → was sofort zu tun ist, wie behandelt wird, was du lassen solltest.
   Die Regeln sind dieselben wie in unseren Ratgebern (Grundregeln, Rotwein, Fett, Blut, Gras, Kugelschreiber/Wachs/
   Kaugummi, Teppich/Polster). Läuft ganz im Browser; es wird nichts gesendet oder gespeichert. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "fleckenfinder") return;

  // Fleckarten. "uses" sagt, welche Mittel die Behandlung braucht, damit das Material sie streichen oder ersetzen kann.
  var STAINS = {
    rotwein: { name: "Rotwein", art: "Gerbstoff", link: "rotweinflecken-entfernen",
      first: ["Sofort mit einem hellen Tuch abtupfen, nicht reiben.", "Von der Rückseite mit kaltem Wasser ausspülen."],
      treat: ["Einige Minuten in kaltem Wasser mit etwas Waschmittel einweichen.", "Auf weißen und farbechten Stoffen Sauerstoffbleiche (Fleckensalz) nach Packungsangabe einarbeiten.", "Danach so warm waschen, wie das Etikett erlaubt, und vor dem Trocknen prüfen."],
      no: ["Kein Salz einreiben: Es verteilt den Fleck und raut die Fasern auf.", "Kein heißes Wasser, solange der Fleck noch sichtbar ist."], uses: { bleach: 1, soak: 1 } },
    kaffee: { name: "Kaffee oder Tee", art: "Gerbstoff (mit Milch auch Eiweiß)", link: "rotweinflecken-entfernen",
      first: ["Abtupfen und von der Rückseite kalt ausspülen.", "Mit Milch: unbedingt kalt bleiben, Milch ist Eiweiß."],
      treat: ["Mit etwas Feinwaschmittel oder Gallseife kalt einweichen.", "Bei weißen, farbechten Stoffen: Sauerstoffbleiche nach Packungsangabe.", "Waschen, wie das Etikett erlaubt."],
      no: ["Nicht mit heißem Wasser ausspülen.", "Nicht in den Trockner, bevor der Fleck weg ist."], uses: { bleach: 1, soak: 1 } },
    obst: { name: "Obst, Beeren, Saft", art: "Farbstoff", link: "flecken-entfernen-grundregeln",
      first: ["Fruchtreste abheben, abtupfen.", "Kalt ausspülen, solange der Fleck frisch ist."],
      treat: ["Frische Flecken gehen oft schon mit Wasser und etwas Seife oder Spülmittel heraus.", "Hartnäckige Reste auf weißen, farbechten Stoffen mit Sauerstoffbleiche behandeln.", "Mit Pulver-Vollwaschmittel waschen: Es enthält Bleiche, Flüssigwaschmittel meist nicht."],
      no: ["Nicht heiß ausspülen.", "Keine Chlorbleiche."], uses: { bleach: 1, soak: 1 } },
    fett: { name: "Öl, Butter, Bratfett", art: "Fett", link: "fettflecken-entfernen",
      first: ["Überschüssiges Fett mit Küchenpapier abtupfen.", "Eine saugfähige Unterlage unterlegen."],
      treat: ["Ein paar Tropfen Spülmittel oder etwas Gallseife einarbeiten und einige Minuten wirken lassen.", "Mit warmem Wasser ausspülen, so warm das Etikett erlaubt.", "Normal waschen; Fett auf Polyester braucht oft einen zweiten Durchgang."],
      no: ["Nicht mit kaltem Wasser allein: Fett löst sich darin nicht.", "Kein Bügeln, solange noch ein Rand zu sehen ist."], uses: { warm: 1 } },
    makeup: { name: "Make-up, Lippenstift, Creme", art: "Fett und Pigment", link: "fettflecken-entfernen",
      first: ["Reste mit einem stumpfen Messer abheben, nicht verschmieren.", "Abtupfen, von außen nach innen."],
      treat: ["Spülmittel oder Gallseife einarbeiten, kurz wirken lassen, ausspülen.", "Lippenstift auf farbechten, robusten Stoffen: zuerst einen Tropfen Alkohol (Isopropanol) an verdeckter Stelle testen.", "Waschen, wie das Etikett erlaubt."],
      no: ["Nicht reiben: Pigmente wandern tiefer.", "Alkohol nur bei offenem Fenster, fern von Flammen."], uses: { alcohol: 1, warm: 1 } },
    blut: { name: "Blut", art: "Eiweiß", link: "blutflecken-entfernen",
      first: ["Sofort mit kaltem Wasser von der Rückseite ausspülen.", "Abtupfen, nicht reiben."],
      treat: ["In kaltem Wasser einweichen, gern mit einem enzymhaltigen Waschmittel.", "Reste mit Gallseife kalt einarbeiten und ausspülen.", "Erst wenn nichts mehr zu sehen ist, warm waschen."],
      no: ["Niemals heißes Wasser: Eiweiß gerinnt und sitzt dann fest.", "Kein Trockner und kein Bügeleisen, solange noch etwas zu sehen ist."], uses: { enzyme: 1, soak: 1, cold: 1 } },
    eiweiss: { name: "Ei, Milch, Babybrei", art: "Eiweiß", link: "blutflecken-entfernen",
      first: ["Grobes abheben.", "Kalt ausspülen."],
      treat: ["Kalt mit enzymhaltigem Waschmittel einweichen.", "Fettige Anteile (Butter, Sahne) danach mit Spülmittel lösen.", "Waschen, wie das Etikett erlaubt."],
      no: ["Kein heißes Wasser zu Beginn."], uses: { enzyme: 1, soak: 1, cold: 1 } },
    schweiss: { name: "Schweiß und Deo", art: "Eiweiß und Salze", link: "flecken-entfernen-grundregeln",
      first: ["Kalt ausspülen."],
      treat: ["Kalt einweichen und Gallseife einarbeiten.", "Gelbliche Deoränder an weißer Baumwolle: eine Zitronensäure-Lösung oder Sauerstoffbleiche nach Packungsangabe, vorher testen.", "Waschen; Trocknen bei Tageslicht hilft, Reste aufzuhellen."],
      no: ["Nicht heiß einweichen.", "Keine Chlorbleiche: Sie macht Deoränder oft noch gelber."], uses: { bleach: 1, acid: 1, soak: 1, cold: 1 } },
    gras: { name: "Gras", art: "Farbstoff und Eiweiß", link: "grasflecken-entfernen",
      first: ["Ausklopfen, abtupfen.", "Kalt ausspülen."],
      treat: ["Spülmittel oder Gallseife einarbeiten und wirken lassen.", "Hartnäckige Reste auf farbechter Baumwolle mit etwas Alkohol (Brennspiritus) betupfen, vorher testen.", "Bei Weißem: Sauerstoffbleiche nach Packungsangabe; dann waschen."],
      no: ["Nicht heiß behandeln, bevor der Fleck weg ist."], uses: { alcohol: 1, bleach: 1, cold: 1 } },
    erde: { name: "Erde, Schlamm, Ruß", art: "Pigment", link: "grasflecken-entfernen",
      first: ["Trocknen lassen, nicht nass verreiben.", "Ausbürsten oder absaugen."],
      treat: ["Kalt vorspülen, dann Gallseife einarbeiten.", "Normal waschen, wie das Etikett erlaubt."],
      no: ["Nicht im nassen Zustand reiben: Das drückt die Partikel ins Gewebe."], uses: {} },
    kugelschreiber: { name: "Kugelschreiber", art: "Farbstoff in Öl", link: "kugelschreiber-wachs-kaugummi",
      first: ["Ein saugfähiges Tuch unterlegen.", "Nicht nass machen, bevor du behandelst."],
      treat: ["Alkohol (Isopropanol oder Brennspiritus) auf ein weißes Tuch geben und tupfen, Unterlage oft wechseln.", "Danach Spülmittel einarbeiten, ausspülen und waschen.", "Immer erst an einer verdeckten Stelle testen."],
      no: ["Kein Haarspray: Heutige Sprays enthalten wenig Alkohol, dafür Haftmittel, die neue Flecken hinterlassen können.", "Alkohol nur bei offenem Fenster, fern von Flammen."], uses: { alcohol: 1 } },
    wachs: { name: "Kerzenwachs", art: "Fett (oft mit Farbe)", link: "kugelschreiber-wachs-kaugummi",
      first: ["Wachs hart werden lassen, notfalls mit einem Kühlakku in einem Beutel.", "Vorsichtig abbrechen und abheben."],
      treat: ["Den Rest zwischen zwei Lagen Küchenpapier mit dem Bügeleisen anwärmen, so warm das Etikett erlaubt, Papier oft wechseln.", "Farbige Reste mit Spülmittel und, bei farbechten Stoffen, etwas Alkohol behandeln.", "Waschen, wie das Etikett erlaubt."],
      no: ["Nicht kratzen, solange das Wachs weich ist."], uses: { alcohol: 1, iron: 1 } },
    kaugummi: { name: "Kaugummi", art: "Kunststoff und Zucker", link: "kugelschreiber-wachs-kaugummi",
      first: ["Das Teil in einem Beutel ins Gefrierfach legen, bis der Kaugummi hart ist."],
      treat: ["Hart gefrorenen Kaugummi abbrechen.", "Reste mit Spülmittel oder Gallseife einarbeiten und auswaschen."],
      no: ["Nicht im weichen Zustand ziehen: Er verteilt sich nur."], uses: { freeze: 1 } },
    schokolade: { name: "Schokolade, Kakao", art: "Eiweiß, Fett und Farbe", link: "flecken-entfernen-grundregeln",
      first: ["Fest werden lassen und abheben.", "Kalt ausspülen."],
      treat: ["Zuerst kalt mit enzymhaltigem Waschmittel einweichen (Milch).", "Dann Spülmittel gegen das Fett.", "Restfarbe bei Weißem mit Sauerstoffbleiche; waschen."],
      no: ["Nicht zuerst heiß ausspülen: Die Milch gerinnt und hält die Farbe fest."], uses: { enzyme: 1, bleach: 1, soak: 1, cold: 1 } },
    tomate: { name: "Tomatensoße, Ketchup, Curry", art: "Fett und Farbstoff", link: "fettflecken-entfernen",
      first: ["Reste abheben, abtupfen."],
      treat: ["Zuerst das Fett: Spülmittel einarbeiten und kalt ausspülen.", "Dann den Farbstoff: bei Weißem Sauerstoffbleiche nach Packungsangabe.", "Waschen; Reste verblassen oft beim Trocknen im Tageslicht."],
      no: ["Nicht heiß fixieren, bevor der Farbstoff draußen ist."], uses: { bleach: 1 } },
    rost: { name: "Rost", art: "Metall", link: "zitronensaeure",
      first: ["Trocken behandeln, nicht verreiben."],
      treat: ["Auf weißer Baumwolle oder Leinen: Zitronensäure-Lösung auftupfen, wirken lassen, gründlich ausspülen.", "Vorher an verdeckter Stelle testen."],
      no: ["Keine Chlorbleiche: Sie kann Rost dunkler machen.", "Säure nicht auf Naturstein, Marmor oder empfindlichen Farben."], uses: { acid: 1 } },
  };

  // Materialien: was gestrichen wird und was hinzukommt.
  var MATERIALS = {
    baumwolle: { name: "Baumwolle, Leinen, Mischgewebe (waschbar)", note: "Robust: Alle genannten Schritte sind möglich, solange das Pflegeetikett es erlaubt." },
    synthetik: { name: "Polyester, Polyamid, Viskose", note: "Höchstens so warm, wie das Etikett erlaubt. Viskose ist nass empfindlich: nicht wringen. Fett hält auf Polyester besonders fest, plane zwei Durchgänge ein." },
    wolle: { name: "Wolle, Seide, Kaschmir", note: "Wolle und Seide bestehen selbst aus Eiweiß.", banned: ["bleach", "enzyme"], extra: ["Nur lauwarm oder kalt und nur tupfen, nie reiben oder wringen.", "Woll- oder Feinwaschmittel ohne eiweißspaltende Enzyme verwenden.", "Bei großen, alten oder unbekannten Flecken: Textilreinigung."] },
    polster: { name: "Teppich, Sofa, Matratze", note: "Nicht durchnässen: Feuchtigkeit in der Polsterung riecht und hinterlässt Ränder. Abnehmbare Bezüge nur waschen, wenn ihr eigenes Etikett das erlaubt.", banned: ["soak"],
      rinse: "Mit wenig kaltem Wasser betupfen und mit einem trockenen, hellen Tuch aufnehmen, von außen nach innen.",
      extra: ["Zuerst an einer verdeckten Stelle testen, etwa an der Rückseite eines Kissens.", "Jedes Mittel sparsam mit einem Tuch oder aus einer Sprühflasche auftragen, nie gießen."],
      after: ["Mit klarem Wasser nachtupfen, bis kein Mittel mehr im Gewebe ist, und mit einem trockenen Handtuch das Wasser aufnehmen.", "Gut trocknen lassen, Fenster auf; erst danach wieder benutzen."], link: "flecken-teppich-polster" },
    reinigung: { name: "Nur professionelle Pflege (Bottich durchgestrichen)", note: "Hier behandelst du nichts selbst.", only: true },
  };

  var USE_WORDS = { bleach: /Sauerstoffbleiche|Fleckensalz|Bleiche/, enzyme: /enzymhaltig/, soak: /einweichen/i };
  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  };
  var options = function (map) {
    return Object.keys(map).map(function (k) { return el("option", { value: k }, [map[k].name]); });
  };

  var stainSel = el("select", { id: "wz-fleck" }, [el("option", { value: "" }, ["Fleck wählen …"])].concat(options(STAINS)));
  var matSel = el("select", { id: "wz-material" }, options(MATERIALS));
  var out = el("div", { class: "erz-wz-ergebnis", "aria-live": "polite" });
  root.className += " erz-wz";
  root.appendChild(el("p", { class: "erz-wz-titel" }, ["Fleckenfinder"]));
  root.appendChild(el("p", { class: "erz-wz-hilfe" }, ["Wähle den Fleck und das Material. Du bekommst die Sofortmaßnahme, die Behandlung in der richtigen Reihenfolge und was du besser lässt."]));
  root.appendChild(el("div", { class: "erz-wz-felder" }, [
    el("label", { for: "wz-fleck" }, ["Was ist es?", stainSel]),
    el("label", { for: "wz-material" }, ["Worauf?", matSel]),
  ]));
  root.appendChild(out);

  function list(title, items, cls) {
    return el("section", { class: "erz-wz-block " + (cls || "") }, [el("h3", {}, [title]), el("ol", {}, items.map(function (t) { return el("li", {}, [t]); }))]);
  }
  function render() {
    out.innerHTML = "";
    var s = STAINS[stainSel.value], m = MATERIALS[matSel.value];
    if (!s) { out.appendChild(el("p", { class: "erz-wz-leer" }, ["Noch kein Fleck gewählt. Weißt du nicht, was es ist? Dann behandle ihn wie Eiweiß: kalt, ohne Hitze, nur tupfen."])); return; }
    out.appendChild(el("p", { class: "erz-wz-kopf" }, [s.name + " auf " + m.name + " · Fleckart: " + s.art]));
    if (m.only) {
      out.appendChild(list("Sofort", ["Grobes vorsichtig abheben.", "Mit einem hellen, trockenen Tuch abtupfen, ohne Wasser und ohne Mittel."], "erz-wz-sofort"));
      out.appendChild(list("Dann", ["Bring das Teil möglichst bald in die Textilreinigung.", "Sag dort, was den Fleck verursacht hat und ob du schon etwas versucht hast.", "Zeig das Pflegeetikett: Der Kreis darauf sagt der Reinigung, welches Verfahren sie verwenden darf."]));
    } else {
      // Ausspülen geht nur bei Stoff, der sich umdrehen lässt; Polster und Teppich werden betupft.
      var first = m.rinse ? s.first.map(function (t) { return /ausspülen|ausspülen\.|Ausspülen/.test(t) ? m.rinse : t; }) : s.first;
      out.appendChild(list("Sofort", first.filter(function (t, i) { return first.indexOf(t) === i; }), "erz-wz-sofort"));
      var treat = s.treat.filter(function (t) {
        return !(m.banned || []).some(function (b) { return s.uses[b] && USE_WORDS[b] && USE_WORDS[b].test(t); });
      });
      // Teppich und Polster kommen nicht in die Maschine: Waschschritte entfallen, das Nachtupfen ersetzt sie.
      if (matSel.value === "polster") treat = treat.filter(function (t) { return !/wasch/i.test(t); });
      if (m.extra) treat = m.extra.concat(treat).concat(m.after || []);
      out.appendChild(list("Behandlung", treat));
      out.appendChild(list("Lieber nicht", s.no.concat(s.uses.alcohol ? ["Alkohol, Spülmittel und Bleiche nie mischen; vor jedem neuen Mittel mit Wasser ausspülen."] : ["Immer nur ein Mittel auf einmal, vor dem nächsten gründlich " + (m.rinse ? "mit klarem Wasser nachtupfen." : "ausspülen.")]), "erz-wz-nicht"));
    }
    out.appendChild(el("p", { class: "erz-wz-notiz" }, [m.note]));
    var more = el("p", { class: "erz-wz-mehr" }, ["Ausführlich: "]);
    more.appendChild(el("a", { href: "/ratgeber/" + (m.link || s.link) + "/" }, [m.link ? "Flecken auf Teppich und Polster" : "der passende Ratgeber"]));
    if (m.link) { more.appendChild(document.createTextNode(" · ")); more.appendChild(el("a", { href: "/ratgeber/" + s.link + "/" }, ["Ratgeber zu dieser Fleckart"])); }
    out.appendChild(more);
    try { history.replaceState(null, "", "#" + stainSel.value + "-" + matSel.value); } catch (e) {}
  }
  stainSel.addEventListener("change", render);
  matSel.addEventListener("change", render);
  var h = (location.hash || "").slice(1).split("-");
  if (STAINS[h[0]]) stainSel.value = h[0];
  if (MATERIALS[h[1]]) matSel.value = h[1];
  render();
})();
