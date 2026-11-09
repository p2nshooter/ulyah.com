/* XKO · Calculadora de la factura de la luz / Electricity bill calculator.
   The order of the Spanish domestic bill (2.0TD): power term (P1 and P2 × days × €/kW day) + energy term (kWh × €/kWh,
   one price or peak / standard / off-peak) → electricity tax on the sum of both → meter rental → VAT on everything.
   The default tax rates are the general ones described in our guide to the taxes on the bill; they can be changed. */
EngineTool.mount("factura-luz", function (lang, u) {
  var en = lang === "en";
  var T = en
    ? {
        title: "Electricity bill calculator",
        intro: "Copy the figures from your bill or from an offer: contracted power, days, kWh and prices. The calculator applies the electricity tax, the meter rental and VAT in the same order as the bill.",
        gPower: "Power term", p1: "Power P1 (kW)", p2: "Power P2 (kW)", pr1: "P1 price (€/kW per day)", pr2: "P2 price (€/kW per day)", days: "Days billed",
        gEnergy: "Energy term", mode: "How your energy is priced", one: "One price for every hour", three: "Peak, standard and off-peak prices",
        kwh: "Total kWh (one price)", price: "Price (€/kWh)", kP: "Peak kWh", kL: "Standard kWh", kV: "Off-peak kWh", pP: "Peak €/kWh", pL: "Standard €/kWh", pV: "Off-peak €/kWh",
        gTax: "Taxes and rental", iee: "Electricity tax (%)", meter: "Meter rental (€/day)", vat: "VAT (%)", extra: "Other services (€, before VAT)",
        empty: "Enter at least the power, the days and the energy with its price.",
        cols: ["Item", "How it is worked out", "€"], rows: ["Power P1", "Power P2", "Energy", "Electricity tax", "Meter rental", "Other services", "Tax base for VAT", "VAT", "Total"],
        head1: "Your bill comes to ", head2: " — about ", head3: " a day.",
        nPower: function (s) { return "Power is " + s + " of the bill before taxes: it is paid even if you use nothing, so contracting only what you need is a permanent saving."; },
        nEnergy: function (s) { return "Energy is " + s + " of the bill before taxes: the cheapest kWh is the one you do not use, and with time-of-use prices, moving it to off-peak hours."; },
        nTax: "Every euro of power or energy carries a little more than €1.30 into the total once the electricity tax and VAT are added.",
        nCheck: "Check the current tax rates: temporary reductions have changed them in some periods. The bill and the contract always have the final say.",
      }
    : {
        title: "Calculadora de la factura de la luz",
        intro: "Copia los datos de tu factura o de una oferta: potencia contratada, días, kWh y precios. La calculadora aplica el impuesto eléctrico, el alquiler del contador y el IVA en el mismo orden que la factura.",
        gPower: "Término de potencia", p1: "Potencia P1 (kW)", p2: "Potencia P2 (kW)", pr1: "Precio P1 (€/kW día)", pr2: "Precio P2 (€/kW día)", days: "Días facturados",
        gEnergy: "Término de energía", mode: "Cómo te cobran la energía", one: "Un precio para todas las horas", three: "Precios de punta, llano y valle",
        kwh: "kWh totales (precio único)", price: "Precio (€/kWh)", kP: "kWh en punta", kL: "kWh en llano", kV: "kWh en valle", pP: "€/kWh punta", pL: "€/kWh llano", pV: "€/kWh valle",
        gTax: "Impuestos y alquiler", iee: "Impuesto eléctrico (%)", meter: "Alquiler del contador (€/día)", vat: "IVA (%)", extra: "Otros servicios (€, antes de IVA)",
        empty: "Escribe al menos la potencia, los días y la energía con su precio.",
        cols: ["Concepto", "Cómo se calcula", "€"], rows: ["Potencia P1", "Potencia P2", "Energía", "Impuesto eléctrico", "Alquiler del contador", "Otros servicios", "Base imponible del IVA", "IVA", "Total"],
        head1: "Tu factura sale por ", head2: ": unos ", head3: " al día.",
        nPower: function (s) { return "La potencia es el " + s + " de la factura antes de impuestos: se paga aunque no consumas nada, así que contratar solo la que necesitas es un ahorro permanente."; },
        nEnergy: function (s) { return "La energía es el " + s + " de la factura antes de impuestos: el kWh más barato es el que no se consume y, con discriminación horaria, el que pasas a las horas valle."; },
        nTax: "Cada euro de potencia o de energía arrastra algo más de 1,30 € al total cuando se suman el impuesto eléctrico y el IVA.",
        nCheck: "Comprueba los tipos vigentes: en algunos periodos ha habido rebajas temporales. La factura y el contrato son los que mandan.",
      };
  var e = function (n) { return u.fmt(n, 2) + " €"; };
  var pct = function (n) { return u.fmt(n, 0) + " %"; };
  var pr = function (n) { return (n || 0).toLocaleString(EngineTool.locale, { maximumFractionDigits: 6 }); };
  return {
    title: T.title,
    intro: T.intro,
    fields: [
      { group: T.gPower },
      { id: "p1", label: T.p1, value: "4,6", placeholder: "4,6" },
      { id: "p2", label: T.p2, value: "4,6", placeholder: "4,6" },
      { id: "pr1", label: T.pr1, value: "0,09", placeholder: "0,09" },
      { id: "pr2", label: T.pr2, value: "0,02", placeholder: "0,02" },
      { id: "days", label: T.days, value: "30", placeholder: "30" },
      { group: T.gEnergy },
      { id: "mode", label: T.mode, type: "select", wide: true, options: [["one", T.one], ["three", T.three]], value: "one" },
      { id: "kwh", label: T.kwh, value: "280", placeholder: "280" },
      { id: "price", label: T.price, value: "0,13", placeholder: "0,13" },
      { id: "kP", label: T.kP, placeholder: "75" },
      { id: "pP", label: T.pP, placeholder: "0,20" },
      { id: "kL", label: T.kL, placeholder: "75" },
      { id: "pL", label: T.pL, placeholder: "0,13" },
      { id: "kV", label: T.kV, placeholder: "100" },
      { id: "pV", label: T.pV, placeholder: "0,09" },
      { group: T.gTax },
      { id: "iee", label: T.iee, value: "5,11269632" },
      { id: "meter", label: T.meter, value: "0,0266" },
      { id: "vat", label: T.vat, value: "21" },
      { id: "extra", label: T.extra, value: "0" },
    ],
    wire: function (inputs, render) {
      // Only the energy fields that belong to the chosen way of pricing are shown.
      function show() {
        var three = inputs.mode.value === "three";
        ["kwh", "price"].forEach(function (k) { inputs[k].parentNode.hidden = three; });
        ["kP", "pP", "kL", "pL", "kV", "pV"].forEach(function (k) { inputs[k].parentNode.hidden = !three; });
      }
      inputs.mode.addEventListener("change", show);
      show();
    },
    compute: function (v) {
      var days = v.days, three = v.mode === "three";
      var pow1 = (v.p1 || 0) * (v.pr1 || 0) * days, pow2 = (v.p2 || 0) * (v.pr2 || 0) * days;
      var energy = three ? (v.kP || 0) * (v.pP || 0) + (v.kL || 0) * (v.pL || 0) + (v.kV || 0) * (v.pV || 0) : (v.kwh || 0) * (v.price || 0);
      var kwh = three ? (v.kP || 0) + (v.kL || 0) + (v.kV || 0) : v.kwh || 0;
      if (!(days > 0) || !(v.p1 > 0) || !(energy >= 0) || !(kwh > 0)) return { empty: T.empty };
      var iee = isFinite(v.iee) ? v.iee : 0, vat = isFinite(v.vat) ? v.vat : 0, meterDay = isFinite(v.meter) ? v.meter : 0, extra = isFinite(v.extra) ? v.extra : 0;
      var tax = (pow1 + pow2 + energy) * iee / 100;
      var meter = meterDay * days;
      var base = pow1 + pow2 + energy + tax + meter + extra;
      var vatE = base * vat / 100;
      var total = base + vatE;
      var energyHow = three
        ? u.fmt(v.kP || 0, 0) + " × " + pr(v.pP) + " + " + u.fmt(v.kL || 0, 0) + " × " + pr(v.pL) + " + " + u.fmt(v.kV || 0, 0) + " × " + pr(v.pV)
        : u.fmt(kwh, 0) + " kWh × " + pr(v.price) + " €";
      var rows = [
        [T.rows[0], u.fmt(v.p1, 2) + " kW × " + u.fmt(days, 0) + " × " + pr(v.pr1), e(pow1)],
        [T.rows[1], u.fmt(v.p2 || 0, 2) + " kW × " + u.fmt(days, 0) + " × " + pr(v.pr2), e(pow2)],
        [T.rows[2], energyHow, e(energy)],
        [T.rows[3], e(pow1 + pow2 + energy) + " × " + pr(iee) + " %", e(tax)],
        [T.rows[4], u.fmt(days, 0) + " × " + pr(meterDay) + " €", e(meter)],
      ];
      if (extra) rows.push([T.rows[5], "", e(extra)]);
      rows.push([T.rows[6], "", e(base)], [T.rows[7], e(base) + " × " + u.fmt(vat, 0) + " %", e(vatE)], [T.rows[8], "", e(total)]);
      var pre = pow1 + pow2 + energy;
      return {
        head: [T.head1, { strong: e(total) }, T.head2, e(total / days), T.head3],
        tables: [{ cols: T.cols, rows: rows, numeric: [2], total: rows.length - 1 }],
        notes: [T.nPower(pct(((pow1 + pow2) / pre) * 100)), T.nEnergy(pct((energy / pre) * 100)), T.nTax, T.nCheck],
      };
    },
  };
});
