/* VELNIXO · Übersetzungsrechner. Entfaltung = Radumfang × Kettenblatt-Zähne ÷ Ritzel-Zähne (Meter pro Kurbelumdrehung);
   Geschwindigkeit = Entfaltung × Trittfrequenz × 60 ÷ 1.000. Radumfänge nach ETRTO-Reifengröße, gerundet. */
EngineTool.mount("uebersetzung", function (lang, u) {
  // [Wert, Bezeichnung, Umfang in mm]
  var WHEELS = [
    ["2155", "28 Zoll, 700 × 35C (37-622)", 2155],
    ["2105", "28 Zoll, 700 × 28C (28-622)", 2105],
    ["2200", "28 Zoll, 700 × 45C (47-622)", 2200],
    ["2290", "29 Zoll MTB, 2,25\" (57-622)", 2290],
    ["2180", "27,5 Zoll MTB, 2,25\" (57-584)", 2180],
    ["2075", "26 Zoll, 2,1\" (54-559)", 2075],
    ["1590", "20 Zoll, 1,75\" (47-406), Falt- und Kinderrad", 1590],
  ];
  return {
    title: "Übersetzungsrechner: Entfaltung und Geschwindigkeit",
    intro: "Zähne von Kettenblatt und Ritzel stehen meist eingeprägt auf den Zahnrädern; die Reifengröße steht auf der Reifenflanke. Für den Vergleich zweier Gänge rechnest du beide nacheinander.",
    fields: [
      { id: "blatt", label: "Kettenblatt (Zähne)", value: "38", placeholder: "38" },
      { id: "ritzel", label: "Ritzel (Zähne)", value: "16", placeholder: "16" },
      { id: "rad", label: "Laufrad und Reifen", type: "select", wide: true, options: WHEELS.map(function (w) { return [w[0], w[1]]; }), value: "2155" },
      { id: "kadenz", label: "Trittfrequenz (Umdrehungen pro Minute)", value: "70", placeholder: "70" },
    ],
    compute: function (v) {
      if (!(v.blatt > 0) || !(v.ritzel > 0)) return { empty: "Gib die Zähne von Kettenblatt und Ritzel ein." };
      var w = (WHEELS.filter(function (x) { return x[0] === v.rad; })[0] || WHEELS[0])[2];
      var ratio = v.blatt / v.ritzel;
      var m = (w / 1000) * ratio;
      var cad = v.kadenz > 0 ? v.kadenz : 70;
      var rows = [60, 70, 80, 90].map(function (c) {
        return [u.fmt(c, 0) + " U/min" + (c === Math.round(cad) ? " (deine)" : ""), u.fmt((m * c * 60) / 1000, 1) + " km/h"];
      });
      return {
        head: ["Pro Kurbelumdrehung ", { strong: u.fmt(m, 2) + " m" }, " — bei " + u.fmt(cad, 0) + " U/min etwa " + u.fmt((m * cad * 60) / 1000, 1) + " km/h."],
        tables: [
          { cols: ["", "Wert"], numeric: [1], rows: [["Übersetzungsverhältnis", u.fmt(ratio, 2) + " : 1"], ["Entfaltung", u.fmt(m, 2) + " m"], ["Radumfang", u.fmt(w, 0) + " mm"]] },
          { cols: ["Trittfrequenz", "Geschwindigkeit"], numeric: [1], rows: rows },
        ],
        notes: [
          "Unter etwa 2 m Entfaltung ist ein Gang ein leichter Berggang, über etwa 7 m ein schneller Gang für die Ebene oder bergab.",
          "60 bis 80 Umdrehungen pro Minute schonen Knie und Antrieb; bei Pedelecs arbeitet der Mittelmotor in diesem Bereich am effizientesten.",
          "Die Bandbreite einer Schaltung ist der Abstand zwischen leichtestem und schwerstem Gang: Rechne beide Gänge aus und teile den größeren durch den kleineren.",
        ],
      };
    },
  };
});
