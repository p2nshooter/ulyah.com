/* VELNIXO · E-Bike-Reichweitenrechner. Reichweite = nutzbare Akkuenergie ÷ Verbrauch pro Kilometer. Die Verbrauchswerte
   sind angenommene, typische Größenordnungen wie im Ratgeber „E-Bike-Reichweite verlängern“ (Eco in der Ebene etwa 5 Wh/km,
   Sport im Mittelgebirge etwa 11 Wh/km, Lastenrad im Winter 15 Wh/km und mehr) — keine Herstellerangaben. */
EngineTool.mount("reichweite", function (lang, u) {
  var LEVEL = [["eco", "Eco (niedrigste Stufe)", 5], ["tour", "Tour", 7], ["sport", "Sport", 9], ["turbo", "Turbo (höchste Stufe)", 13]];
  var TERRAIN = [["flach", "flach", 1], ["huegelig", "hügelig, Mittelgebirge", 1.25], ["bergig", "bergig, viele Höhenmeter", 1.6]];
  var TEMP = [["warm", "über 10 °C", 1], ["kuehl", "0 bis 10 °C", 0.9], ["kalt", "unter 0 °C", 0.8]];
  var pick = function (list, v) { return list.filter(function (x) { return x[0] === v; })[0] || list[0]; };
  return {
    title: "E-Bike-Reichweitenrechner",
    intro: "Wie weit kommst du mit deinem Akku? Gib die Kapazität in Wattstunden (auf dem Akku aufgedruckt) und deine typischen Bedingungen ein.",
    fields: [
      { id: "wh", label: "Akkukapazität (Wh)", value: "500", placeholder: "500" },
      { id: "stufe", label: "Meist genutzte Stufe", type: "select", options: LEVEL.map(function (x) { return [x[0], x[1]]; }), value: "eco" },
      { id: "gelaende", label: "Gelände", type: "select", options: TERRAIN.map(function (x) { return [x[0], x[1]]; }), value: "flach" },
      { id: "gewicht", label: "Gesamtgewicht: du, Rad, Gepäck (kg)", value: "100", placeholder: "100" },
      { id: "temp", label: "Temperatur", type: "select", options: TEMP.map(function (x) { return [x[0], x[1]]; }), value: "warm" },
      { id: "stadt", label: "Viel Stadtverkehr mit Ampeln", type: "check", value: false },
      { id: "strecke", label: "Deine Strecke, einfach (km, optional)", value: "15", placeholder: "15" },
    ],
    compute: function (v) {
      if (!(v.wh > 0)) return { empty: "Gib die Akkukapazität in Wattstunden ein (meist 400 bis 750 Wh)." };
      var lv = pick(LEVEL, v.stufe), tr = pick(TERRAIN, v.gelaende), tp = pick(TEMP, v.temp);
      var kg = v.gewicht > 0 ? v.gewicht : 100;
      // Mehr Gewicht kostet vor allem am Berg und beim Anfahren: ein Teil des Verbrauchs wächst mit dem Gewicht.
      var whKm = lv[2] * tr[2] * (0.6 + 0.4 * (kg / 100)) * (v.stadt ? 1.2 : 1);
      var usable = v.wh * tp[2] * 0.9; // 10 % Reserve, damit du nicht mit leerem Akku ankommst
      var km = usable / whKm;
      var rows = [
        ["Verbrauch (geschätzt)", u.fmt(whKm, 1) + " Wh/km"],
        ["Nutzbare Energie mit 10 % Reserve" + (tp[2] < 1 ? " und Kälteabzug" : ""), u.fmt(usable, 0) + " Wh"],
        ["Reichweite", u.fmt(km, 0) + " km"],
      ];
      var notes = [];
      if (v.strecke > 0) {
        var trips = Math.floor(km / v.strecke);
        rows.push(["Einfache Strecken von " + u.fmt(v.strecke, 0) + " km pro Ladung", String(trips)]);
        notes.push(trips >= 2 ? "Für Hin- und Rückweg reicht eine Ladung " + (trips >= 4 ? "mehrere Tage." : "einen Tag.") : "Hin und zurück wird knapp: in der Ebene eine Stufe niedriger fahren oder am Ziel nachladen.");
      }
      if (lv[0] === "turbo" || lv[0] === "sport") notes.push("Die Stufe ist der größte Hebel: In der Ebene eine Stufe niedriger und die hohe Stufe nur am Berg bringt oft ein Drittel mehr Reichweite.");
      notes.push("Rechtzeitig herunterschalten, 60 bis 80 Kurbelumdrehungen pro Minute, gut aufgepumpte Reifen und 20 statt 25 km/h verlängern die Reichweite spürbar.");
      notes.push("Die Werte sind typische Größenordnungen, keine Herstellerangabe. Dein Display zeigt nach einigen Fahrten, wie viel dein Rad bei dir wirklich verbraucht.");
      return { head: ["Reichweite etwa ", { strong: u.fmt(km, 0) + " km" }, " (" + u.fmt(whKm, 1) + " Wh pro Kilometer)."], tables: [{ cols: ["", "Wert"], numeric: [1], rows: rows }], notes: notes };
    },
  };
});
