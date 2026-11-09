/* VELNIXO · Wartungsplaner. Aus deinen Kilometern pro Woche wird, wann Kette, Bremsbeläge und Reifen dran sind — mit den
   groben Lebensdauern aus dem Ratgeber „Fahrrad-Wartung: der Jahresplan“ (Kette 2.000–5.000 km, Beläge Felgenbremse
   1.000–3.000 km, Scheibenbremse 1.000–4.000 km, Reifen 3.000–8.000 km). Pedelecs, Regen und Winter verkürzen sie. */
EngineTool.mount("wartungsplan", function (lang, u) {
  // [Arbeit, km von, km bis] — Spannen für Alltagsräder ohne Motor
  var JOBS = [
    ["Kette reinigen und ölen", 200, 300],
    ["Kettenverschleiß mit Kettenlehre messen", 500, 1000],
    ["Gründliche Reinigung, Laufräder und Lager prüfen", 1000, 2000],
    ["Kette wechseln (nach Messung)", 2000, 5000],
    ["Bremsbeläge wechseln", 1000, 3000],
    ["Reifen wechseln", 3000, 8000],
  ];
  var weeks = function (km, perWeek) { return km / perWeek; };
  var when = function (w) {
    if (w < 1.5) return "jede Woche";
    if (w < 8) return "alle " + u.fmt(Math.round(w), 0) + " Wochen";
    var m = w / 4.35;
    if (m < 18) return "alle " + u.fmt(Math.round(m), 0) + " Monate";
    return "alle " + u.fmt(m / 12, 1) + " Jahre";
  };
  return {
    title: "Wartungsplaner für dein Fahrrad",
    intro: "Gib ein, wie viel du fährst, und sieh, wann die wichtigsten Arbeiten ungefähr anstehen. Notiere dir den Kilometerstand beim Wechsel: So lernst du, wie lange die Teile bei dir halten.",
    fields: [
      { id: "km", label: "Kilometer pro Woche", value: "60", placeholder: "60" },
      { id: "rad", label: "Fahrrad", type: "select", options: [["normal", "Fahrrad ohne Motor"], ["pedelec", "Pedelec / E-Bike"]], value: "normal" },
      { id: "bremse", label: "Bremsen", type: "select", options: [["felge", "Felgenbremse"], ["scheibe", "Scheibenbremse"]], value: "scheibe" },
      { id: "wetter", label: "Fahre auch oft bei Regen und im Winter", type: "check", value: false },
    ],
    compute: function (v) {
      if (!(v.km > 0)) return { empty: "Gib ein, wie viele Kilometer du pro Woche ungefähr fährst." };
      // Pedelec: mehr Kraft und Gewicht; Nässe und Streusalz: mehr Verschleiß an Kette und Belägen.
      var f = (v.rad === "pedelec" ? 0.7 : 1) * (v.wetter ? 0.75 : 1);
      var rows = JOBS.map(function (j) {
        var lo = j[1], hi = j[2], name = j[0];
        if (name === "Bremsbeläge wechseln" && v.bremse === "scheibe") hi = 4000;
        if (name !== "Kette reinigen und ölen" && name !== "Kettenverschleiß mit Kettenlehre messen" && name.indexOf("Reinigung") < 0) { lo *= f; hi *= f; }
        var mid = (lo + hi) / 2;
        return [name, u.fmt(lo, 0) + "–" + u.fmt(hi, 0) + " km", when(weeks(mid, v.km))];
      });
      rows.push(["Inspektion in der Werkstatt" + (v.rad === "pedelec" ? " (mit Software-Update des Antriebs)" : ""), "—", "einmal im Jahr, am besten vor der Saison"]);
      var notes = [
        "Nach Regenfahrten die Kette abwischen und neu ölen: Nässe wäscht das Öl aus, und eine trockene Kette verschleißt schnell.",
        "Eine Kette rechtzeitig zu wechseln schont Kassette und Kettenblätter: Mit einer zu lang gewordenen Kette verschleißen sie mit.",
        "Bremsen, die schleifen, quietschen oder deren Hebel bis zum Lenker durchgehen, gehören sofort in die Werkstatt, unabhängig vom Plan.",
      ];
      if (v.rad === "pedelec") notes.push("Bei Pedelecs halten Kette, Ritzel und Bremsbeläge wegen der höheren Kräfte meist deutlich kürzer; der Rechner hat die Spannen um 30 % gekürzt.");
      return {
        head: ["Bei " + u.fmt(v.km, 0) + " km pro Woche fährst du rund ", { strong: u.fmt(v.km * 52, 0) + " km im Jahr" }, "."],
        tables: [{ cols: ["Arbeit", "Spanne", "Ungefähr"], rows: rows }],
        notes: notes,
      };
    },
  };
});
