/* XKO · Cuánto cuesta cada aparato / What each appliance costs to run.
   kWh = watts × hours on × share of the time at full power ÷ 1,000, plus standby for the rest of the day; cost = kWh ×
   your price per kWh with taxes. Typical ratings come from the table in our guide to appliance consumption: the rating
   plate of your own appliance is what counts. */
EngineTool.mount("coste-aparatos", function (lang, u) {
  var en = lang === "en";
  // [id, Spanish name, English name, watts, hours a day, days a week, % of the time at full power, months a year]
  var P = [
    ["fridge", "Frigorífico combi moderno (120 W, a ciclos)", "Modern fridge-freezer (120 W, cycling)", 120, 24, 7, 25, 12],
    ["oldfridge", "Frigorífico antiguo (200 W, a ciclos)", "Old fridge (200 W, cycling)", 200, 24, 7, 35, 12],
    ["oven", "Horno eléctrico (2.400 W)", "Electric oven (2,400 W)", 2400, 1, 3, 50, 12],
    ["induction", "Placa de inducción, una zona (1.500 W)", "Induction hob, one zone (1,500 W)", 1500, 1, 7, 70, 12],
    ["kettle", "Hervidor (2.000 W)", "Kettle (2,000 W)", 2000, 0.1, 7, 100, 12],
    ["washer", "Lavadora a 40 °C (2.000 W al calentar)", "Washing machine at 40 °C (2,000 W heating)", 2000, 1.5, 4, 30, 12],
    ["dryer", "Secadora de resistencia (2.500 W)", "Vented/condenser dryer (2,500 W)", 2500, 1.5, 3, 80, 12],
    ["hpdryer", "Secadora de bomba de calor (900 W)", "Heat-pump dryer (900 W)", 900, 2, 3, 80, 12],
    ["boiler", "Termo eléctrico de 80 l (1.500 W)", "80-litre electric water heater (1,500 W)", 1500, 3, 7, 100, 12],
    ["ac", "Aire acondicionado split (1.000 W)", "Split air conditioner (1,000 W)", 1000, 6, 7, 60, 3],
    ["radiator", "Radiador eléctrico (1.500 W)", "Electric radiator (1,500 W)", 1500, 5, 7, 70, 4],
    ["tv", "Televisor LED de 55\" (100 W)", "55\" LED TV (100 W)", 100, 4, 7, 100, 12],
    ["router", "Router (12 W, 24 h)", "Router (12 W, 24 h)", 12, 24, 7, 100, 12],
    ["pc", "Ordenador de sobremesa (200 W)", "Desktop computer (200 W)", 200, 4, 5, 100, 12],
    ["led", "Bombilla LED (8 W)", "LED bulb (8 W)", 8, 5, 7, 100, 12],
  ];
  var T = en
    ? {
        title: "What does each appliance cost to run?",
        intro: "Pick an appliance or type the power on its rating plate, how long you use it and your price per kWh with taxes. The result is per use, per month and per year.",
        preset: "Example appliance (optional)", none: "Choose an example…", w: "Power when on (W)", h: "Hours on per day", d: "Days used per week",
        f: "Time at full power (%)", m: "Months used a year", sb: "Standby power (W)", p: "Your price (€/kWh, with taxes)",
        empty: "Enter the power in watts, the hours a day and your price per kWh.",
        cols: ["Period", "kWh", "€"], rows: ["One day of use", "A month (average over the year)", "A year"],
        head1: "About ", head2: " a year (", head3: " kWh).",
        nSb: function (x) { return "Standby alone costs " + x + " a year: a switched power strip stops it."; },
        nHigh: "High-power appliances cost most per hour: when and for how long you run them matters more than anything else.",
        nDuty: "Appliances with a thermostat or motor (fridges, ovens, air conditioners, heaters) do not draw their full power all the time: that is what the percentage is for. If you are unsure, a plug-in energy meter tells you the real figure.",
        nPrice: "With time-of-use prices, run what you can in off-peak hours and use your off-peak price here.",
      }
    : {
        title: "¿Cuánto cuesta cada aparato?",
        intro: "Elige un aparato o escribe la potencia de su placa de características, cuánto lo usas y tu precio del kWh con impuestos. El resultado sale por uso, por mes y por año.",
        preset: "Aparato de ejemplo (opcional)", none: "Elige un ejemplo…", w: "Potencia encendido (W)", h: "Horas encendido al día", d: "Días de uso por semana",
        f: "Tiempo a plena potencia (%)", m: "Meses de uso al año", sb: "Potencia en espera (W)", p: "Tu precio (€/kWh, con impuestos)",
        empty: "Escribe la potencia en vatios, las horas al día y tu precio del kWh.",
        cols: ["Periodo", "kWh", "€"], rows: ["Un día de uso", "Un mes (media del año)", "Un año"],
        head1: "Unos ", head2: " al año (", head3: " kWh).",
        nSb: function (x) { return "Solo el modo de espera cuesta " + x + " al año: una regleta con interruptor lo corta."; },
        nHigh: "Los aparatos de mucha potencia son los que más cuestan por hora: cuándo y cuánto tiempo los usas importa más que nada.",
        nDuty: "Los aparatos con termostato o motor (frigoríficos, hornos, aire acondicionado, radiadores) no gastan su potencia máxima todo el tiempo: para eso sirve el porcentaje. Si dudas, un medidor de enchufe te da la cifra real.",
        nPrice: "Con discriminación horaria, pon en valle lo que puedas y usa aquí tu precio de valle.",
      };
  var e = function (n) { return u.fmt(n, 2) + " €"; };
  return {
    title: T.title,
    intro: T.intro,
    fields: [
      { id: "preset", label: T.preset, type: "select", wide: true, options: [["", T.none]].concat(P.map(function (p) { return [p[0], en ? p[2] : p[1]]; })) },
      { id: "w", label: T.w, value: "2000", placeholder: "2000" },
      { id: "h", label: T.h, value: "1,5", placeholder: "1,5" },
      { id: "d", label: T.d, value: "4", placeholder: "1–7" },
      { id: "f", label: T.f, value: "30", placeholder: "100" },
      { id: "m", label: T.m, value: "12", placeholder: "12" },
      { id: "sb", label: T.sb, value: "0", placeholder: "1" },
      { id: "p", label: T.p, value: "0,15", placeholder: "0,15" },
    ],
    wire: function (inputs, render) {
      inputs.preset.addEventListener("change", function () {
        var p = P.filter(function (x) { return x[0] === inputs.preset.value; })[0];
        if (!p) return;
        var dec = function (n) { return String(n).replace(".", en ? "." : ","); };
        inputs.w.value = dec(p[3]); inputs.h.value = dec(p[4]); inputs.d.value = dec(p[5]); inputs.f.value = dec(p[6]); inputs.m.value = dec(p[7]);
        render();
      });
    },
    compute: function (v) {
      var w = v.w, h = v.h, d = Math.min(7, Math.max(0, isFinite(v.d) ? v.d : 7)), f = Math.min(100, Math.max(0, isFinite(v.f) ? v.f : 100)) / 100, sb = v.sb > 0 ? v.sb : 0, p = v.p;
      if (!(w >= 0) || !(h >= 0) || h > 24 || !(p > 0)) return { empty: T.empty };
      var m = Math.min(12, Math.max(0, isFinite(v.m) ? v.m : 12)) / 12;
      var dayOn = (w * h * f) / 1000; // kWh on a day of use
      var onHoursYear = h * d * (365 / 7) * m;
      var sbYear = (sb * Math.max(0, 8760 - onHoursYear)) / 1000;
      var year = dayOn * d * (365 / 7) * m + sbYear;
      return {
        head: [T.head1, { strong: e(year * p) }, T.head2, u.fmt(year, 0), T.head3],
        tables: [{ cols: T.cols, numeric: [1, 2], rows: [[T.rows[0], u.fmt(dayOn + (sb * (24 - h)) / 1000, 2), e((dayOn + (sb * (24 - h)) / 1000) * p)], [T.rows[1], u.fmt(year / 12, 1), e((year / 12) * p)], [T.rows[2], u.fmt(year, 0), e(year * p)]] }],
        notes: [sb > 0 ? T.nSb(e(sbYear * p)) : null, w >= 1500 ? T.nHigh : null, T.nDuty, T.nPrice].filter(Boolean),
      };
    },
  };
});
