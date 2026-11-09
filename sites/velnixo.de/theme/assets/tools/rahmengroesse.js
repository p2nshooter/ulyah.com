/* VELNIXO · Rahmengrößen-Rechner: Schrittlänge × Faktor je Fahrradtyp, wie im Ratgeber „Rahmengröße richtig bestimmen“.
   Die Faktoren sind Erfahrungswerte für typische Geometrien; die Größentabelle des Herstellers und die Probefahrt gehen vor. */
EngineTool.mount("rahmengroesse", function (lang, u) {
  // [Wert, Bezeichnung, Faktor cm, Zoll-Faktor oder 0, Hinweis]
  var TYPES = [
    ["trekking", "City- und Trekkingrad", 0.66, 0, "Zwischen zwei Größen: bei aufrechter, komfortabler Haltung eher die größere, bei sportlicher eher die kleinere."],
    ["renn", "Rennrad", 0.665, 0, "Rennräder werden oft in Zentimetern der Sitzrohrlänge angegeben; die Oberrohrlänge entscheidet mit über die Streckung."],
    ["gravel", "Gravelbike", 0.665, 0, "Zwischen zwei Größen eher die kleinere: Sie ist im Gelände wendiger."],
    ["mtb", "Mountainbike", 0.574, 0.226, "Viele Hersteller nennen nur S, M, L oder XL: Vergleiche die Zoll- oder Zentimeterangabe in ihrer Tabelle."],
  ];
  return {
    title: "Rahmengrößen-Rechner",
    intro: "Miss deine Schrittlänge barfuß an der Wand (Buch zwischen die Beine, Oberkante markieren, Abstand zum Boden messen) und wähle den Fahrradtyp.",
    fields: [
      { id: "sl", label: "Schrittlänge (cm)", value: "84", placeholder: "84" },
      { id: "typ", label: "Fahrradtyp", type: "select", options: TYPES.map(function (t) { return [t[0], t[1]]; }), value: "trekking" },
    ],
    compute: function (v) {
      var sl = v.sl;
      if (!(sl >= 50 && sl <= 110)) return { empty: "Gib deine Schrittlänge in Zentimetern ein (meist zwischen 65 und 95 cm)." };
      var t = TYPES.filter(function (x) { return x[0] === v.typ; })[0] || TYPES[0];
      var cm = sl * t[2];
      var rows = [["Rechnerische Rahmenhöhe", u.fmt(sl, 0) + " cm × " + String(t[2]).replace(".", ","), u.fmt(cm, 1) + " cm"]];
      if (t[3]) rows.push(["in Zoll", u.fmt(sl, 0) + " cm × " + String(t[3]).replace(".", ","), u.fmt(sl * t[3], 1) + " Zoll"]);
      rows.push(["Guter Ausgangspunkt", "", u.fmt(Math.round(cm) - 1, 0) + "–" + u.fmt(Math.round(cm) + 1, 0) + " cm"]);
      return {
        head: ["Rahmenhöhe für dein " + t[1] + ": etwa ", { strong: u.fmt(cm, 1) + " cm" }, t[3] ? " (" + u.fmt(sl * t[3], 1) + " Zoll)." : "."],
        tables: [{ cols: ["", "Rechnung", "Ergebnis"], numeric: [2], rows: rows }],
        notes: [
          t[4],
          "Die Formel ist ein Startpunkt: Herstellertabellen sind auf die eigene Geometrie abgestimmt und genauer. Steht dort die Schrittlänge, hat sie Vorrang vor der Körpergröße.",
          "Bei der Probefahrt: Über dem Oberrohr stehend sollten einige Zentimeter Luft bleiben, die Arme leicht gebeugt sein und das Knie in der untersten Pedalstellung leicht gebeugt.",
        ],
      };
    },
  };
});
