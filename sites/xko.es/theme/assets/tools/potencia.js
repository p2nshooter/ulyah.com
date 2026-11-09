/* XKO · Qué potencia contratar / How much power to contract.
   Two ways, as in our guide: add up what can be on at the same moment, or start from the highest demand your
   distributor's meter recorded and leave a margin of about 15 %. The saving uses your P1 and P2 prices over a year,
   with the electricity tax and VAT. */
EngineTool.mount("potencia", function (lang, u) {
  var en = lang === "en";
  // [id, Spanish, English, watts, ticked by default]
  var A = [
    ["base", "Frigorífico, luces, tele y router (siempre)", "Fridge, lights, TV and router (always on)", 400, true],
    ["oven", "Horno", "Oven", 2000, true],
    ["hob", "Placa de inducción (dos zonas)", "Induction hob (two zones)", 3000, false],
    ["micro", "Microondas", "Microwave", 1000, false],
    ["kettle", "Hervidor", "Kettle", 2000, false],
    ["washer", "Lavadora calentando agua", "Washing machine heating water", 2000, false],
    ["dish", "Lavavajillas calentando agua", "Dishwasher heating water", 2000, true],
    ["dryer", "Secadora", "Tumble dryer", 2500, false],
    ["boiler", "Termo eléctrico", "Electric water heater", 1500, false],
    ["ac", "Aire acondicionado", "Air conditioner", 1000, false],
    ["radiator", "Radiador eléctrico", "Electric radiator", 1500, false],
    ["iron", "Plancha", "Iron", 2200, false],
    ["hair", "Secador de pelo", "Hair dryer", 1800, false],
    ["ev", "Coche eléctrico cargando (enchufe de 10 A)", "Electric car charging (10 A socket)", 2300, false],
  ];
  var NORM = [2.3, 3.45, 4.6, 5.75, 6.9, 8.05, 9.2];
  var T = en
    ? {
        title: "How much power should you contract?",
        intro: "Tick what could be switched on at the same moment at the busiest time of your day — dinner time, for many homes. If you know the highest demand your meter recorded, enter it too: it is the more reliable figure.",
        gA: "Switched on at the same moment", other: "Other appliances at the same time (W)", gB: "Your contract", max: "Highest demand recorded (kW, optional)",
        cur: "Power contracted now (kW)", pr1: "P1 price (€/kW per day)", pr2: "P2 price (€/kW per day)",
        cols: ["", "kW"], rows: ["Everything ticked at once", "Suggested power", "Nearest standard value at or above it"], rowMax: "From your recorded maximum + 15 %",
        head1: "Suggested power: ", head2: ".",
        save: function (kw, x) { return "Going from your current power to " + kw + " would save about " + x + " a year, taxes included (P1 and P2 lowered alike)."; },
        more: function (kw) { return "Your current power is below the suggestion: with everything ticked on at once, the meter's limiter could trip. Either spread the big appliances out or raise the power to about " + kw + "."; },
        nTimer: "Spreading the big consumers out — the dishwasher or washing machine on a timer, the oven not at the same time as the dryer — lets you contract less and pay less every month.",
        nSmart: "With a smart meter you can usually contract values between the old standard steps; the standard ones are shown for reference. Your distributor's customer website shows your highest demand.",
        nEv: "For an electric car, a wallbox can be set to charge at a lower power or only at night, so that it does not force you up a step.",
      }
    : {
        title: "¿Qué potencia contratar?",
        intro: "Marca lo que podría estar encendido a la vez en el momento de más uso del día, que en muchas casas es la hora de la cena. Si conoces la potencia máxima que registró tu contador, escríbela también: es el dato más fiable.",
        gA: "Encendido a la vez", other: "Otros aparatos a la vez (W)", gB: "Tu contrato", max: "Potencia máxima registrada (kW, opcional)",
        cur: "Potencia contratada ahora (kW)", pr1: "Precio P1 (€/kW día)", pr2: "Precio P2 (€/kW día)",
        cols: ["", "kW"], rows: ["Todo lo marcado a la vez", "Potencia aconsejada", "Valor normalizado igual o superior"], rowMax: "Según tu máximo registrado + 15 %",
        head1: "Potencia aconsejada: ", head2: ".",
        save: function (kw, x) { return "Pasar de tu potencia actual a " + kw + " ahorraría unos " + x + " al año con impuestos (bajando P1 y P2 por igual)."; },
        more: function (kw) { return "Tu potencia actual está por debajo de lo aconsejado: con todo lo marcado encendido a la vez podría saltar el limitador del contador. Reparte los aparatos grandes o sube la potencia a unos " + kw + "."; },
        nTimer: "Repartir los grandes consumos (el lavavajillas o la lavadora programados, el horno sin la secadora a la vez) permite contratar menos y pagar menos todos los meses.",
        nSmart: "Con contador inteligente se suelen poder contratar valores intermedios entre los escalones de siempre; los normalizados se muestran como referencia. La web de clientes de tu distribuidora muestra tu potencia máxima.",
        nEv: "Para el coche eléctrico, un punto de recarga puede limitarse a menos potencia o a la noche, para que no te obligue a subir de escalón.",
      };
  var kw = function (n) { return u.fmt(n, 2) + " kW"; };
  var fields = [{ group: T.gA }].concat(A.map(function (a) { return { id: a[0], label: (en ? a[2] : a[1]) + " · " + u.fmt(a[3], 0) + " W", type: "check", value: a[4] }; }));
  fields.push(
    { id: "other", label: T.other, value: "0" },
    { group: T.gB },
    { id: "max", label: T.max, placeholder: "3,4" },
    { id: "cur", label: T.cur, value: "5,75", placeholder: "5,75" },
    { id: "pr1", label: T.pr1, value: "0,09" },
    { id: "pr2", label: T.pr2, value: "0,02" }
  );
  return {
    title: T.title,
    intro: T.intro,
    fields: fields,
    compute: function (v) {
      var w = (v.other > 0 ? v.other : 0) + A.reduce(function (s, a) { return s + (v[a[0]] ? a[3] : 0); }, 0);
      var peak = w / 1000;
      var fromMax = v.max > 0 ? Math.ceil(v.max * 1.15 * 10) / 10 : 0;
      var suggest = fromMax || Math.max(2.3, Math.ceil(peak * 10) / 10);
      var norm = NORM.filter(function (n) { return n >= suggest - 1e-9; })[0] || suggest;
      var rows = [[T.rows[0], u.fmt(peak, 2)]];
      if (fromMax) rows.push([T.rowMax, u.fmt(fromMax, 2)]);
      rows.push([T.rows[1], u.fmt(suggest, 2)], [T.rows[2], u.fmt(norm, 2)]);
      var notes = [];
      if (v.cur > 0) {
        var diff = v.cur - suggest;
        var perKw = ((v.pr1 > 0 ? v.pr1 : 0) + (v.pr2 > 0 ? v.pr2 : 0)) * 365 * 1.0511269632 * 1.21;
        if (diff > 0.05) notes.push(T.save(kw(suggest), u.fmt(diff * perKw, 0) + " €"));
        else if (diff < -0.05) notes.push(T.more(kw(suggest)));
      }
      notes.push(T.nTimer, T.nSmart);
      if (v.ev) notes.push(T.nEv);
      return { head: [T.head1, { strong: kw(suggest) }, T.head2], tables: [{ cols: T.cols, rows: rows, numeric: [1], best: rows.length - 2 }], notes: notes };
    },
  };
});
