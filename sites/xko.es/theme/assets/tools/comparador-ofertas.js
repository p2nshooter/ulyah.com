/* XKO · Comparador de ofertas de luz / Electricity offer comparer.
   Your own year of consumption (kWh split into peak, standard and off-peak) priced with up to three offers: energy,
   power P1 and P2 (kW × €/kW per day × 365), services you cannot remove, and a promotional price for the first months
   if an offer has one. Then the electricity tax on power + energy, the regulated meter rental (the same for every
   offer) and VAT. The defaults are the worked example in our guide to switching supplier. */
EngineTool.mount("comparador-ofertas", function (lang, u) {
  var en = lang === "en";
  var T = en
    ? {
        title: "Compare up to three electricity offers",
        intro: "Enter your year of consumption once and the prices of each offer. A single-price offer only needs the first energy price; leave the other two empty. Every figure is per year.",
        gHome: "Your household", kwh: "kWh a year", sP: "% in peak hours", sL: "% in standard hours", p1: "Power P1 (kW)", p2: "Power P2 (kW)",
        offer: function (x) { return "Offer " + x; },
        eP: "Energy €/kWh (peak or single)", eL: "Standard €/kWh (empty = same)", eV: "Off-peak €/kWh (empty = same)", pr1: "P1 €/kW per day", pr2: "P2 €/kW per day",
        svc: "Services you cannot remove (€/month)", promo: "Months at a promotional price", after: "€/kWh after the promotion (all hours)",
        empty: "Enter your kWh a year, your power and the energy price of at least one offer.",
        cols: ["Offer", "Energy", "Power", "Services", "Before taxes", "With taxes"],
        head1: "Cheapest for your consumption: ", head2: ", about ", head3: " a year with taxes.",
        diff: function (n, x) { return n + " costs " + x + " more a year."; },
        nShare: "The split between peak, standard and off-peak hours decides which offer wins: a household that uses a lot at night favours time-of-use prices, one that uses it in the evening does not. Your distributor's website shows your hourly consumption.",
        nPromo: "A promotional price only counts for the months it lasts: put the date it ends in your calendar.",
        nTax: "With taxes: electricity tax 5.11269632 % on power + energy, meter rental about €0.81 a month (the same whatever the offer) and VAT 21 % on everything. Check the rates in force.",
      }
    : {
        title: "Compara hasta tres ofertas de luz",
        intro: "Escribe una vez tu consumo del año y los precios de cada oferta. Si una oferta tiene precio único, basta con el primer precio de energía y dejar vacíos los otros dos. Todas las cifras son anuales.",
        gHome: "Tu hogar", kwh: "kWh al año", sP: "% en punta", sL: "% en llano", p1: "Potencia P1 (kW)", p2: "Potencia P2 (kW)",
        offer: function (x) { return "Oferta " + x; },
        eP: "Energía €/kWh (punta o único)", eL: "€/kWh llano (vacío = igual)", eV: "€/kWh valle (vacío = igual)", pr1: "€/kW día P1", pr2: "€/kW día P2",
        svc: "Servicios que no puedes quitar (€/mes)", promo: "Meses con precio promocional", after: "€/kWh tras la promoción (todas las horas)",
        empty: "Escribe tus kWh al año, tu potencia y el precio de la energía de al menos una oferta.",
        cols: ["Oferta", "Energía", "Potencia", "Servicios", "Antes de impuestos", "Con impuestos"],
        head1: "La más barata para tu consumo: ", head2: ", unos ", head3: " al año con impuestos.",
        diff: function (n, x) { return "La " + n.replace("Oferta", "oferta") + " cuesta " + x + " más al año."; },
        nShare: "El reparto entre punta, llano y valle decide qué oferta gana: un hogar que consume mucho de noche sale ganando con discriminación horaria; uno que consume por la tarde, no. La web de tu distribuidora muestra tu consumo por horas.",
        nPromo: "Un precio promocional solo cuenta los meses que dura: apunta en el calendario la fecha en que termina.",
        nTax: "Con impuestos: impuesto eléctrico del 5,11269632 % sobre potencia y energía, alquiler del contador de unos 0,81 € al mes (igual sea cual sea la oferta) e IVA del 21 % sobre todo. Comprueba los tipos vigentes.",
      };
  var e = function (n) { return u.fmt(n, 0) + " €"; };
  var L = ["A", "B", "C"];
  // The worked example of our guide: A single price, B three periods, C a six-month promotion.
  var D = { A: ["0,13", "", "", "0,09", "", "0", "", ""], B: ["0,18", "0,12", "0,08", "0,08", "", "0", "", ""], C: ["0,11", "", "", "0,11", "", "0", "6", "0,15"] };
  var fields = [
    { group: T.gHome },
    { id: "kwh", label: T.kwh, value: "3400", placeholder: "3400" },
    { id: "sP", label: T.sP, value: "30" },
    { id: "sL", label: T.sL, value: "30" },
    { id: "p1", label: T.p1, value: "4,6" },
    { id: "p2", label: T.p2, value: "4,6" },
  ];
  L.forEach(function (x) {
    var d = D[x];
    fields.push(
      { group: T.offer(x) },
      { id: x + "eP", label: T.eP, value: d[0] },
      { id: x + "eL", label: T.eL, value: d[1] },
      { id: x + "eV", label: T.eV, value: d[2] },
      { id: x + "pr1", label: T.pr1, value: d[3] },
      { id: x + "pr2", label: T.pr2, value: d[4], placeholder: "0,02" },
      { id: x + "svc", label: T.svc, value: d[5] },
      { id: x + "promo", label: T.promo, value: d[6], placeholder: "0" },
      { id: x + "after", label: T.after, value: d[7] }
    );
  });
  return {
    title: T.title,
    intro: T.intro,
    fields: fields,
    compute: function (v) {
      var kwh = v.kwh, sP = (isFinite(v.sP) ? v.sP : 100) / 100, sL = (isFinite(v.sL) ? v.sL : 0) / 100, sV = Math.max(0, 1 - sP - sL);
      if (!(kwh > 0) || !(v.p1 > 0) || sP + sL > 1.0001) return { empty: T.empty };
      var res = [];
      L.forEach(function (x) {
        var pP = v[x + "eP"];
        if (!(pP > 0)) return;
        var pL = v[x + "eL"] > 0 ? v[x + "eL"] : pP, pV = v[x + "eV"] > 0 ? v[x + "eV"] : pP;
        var mix = sP * pP + sL * pL + sV * pV;
        var promo = Math.min(12, Math.max(0, v[x + "promo"] || 0)), after = v[x + "after"] > 0 ? v[x + "after"] : 0;
        var energy = promo > 0 && after > 0 ? kwh * mix * (promo / 12) + kwh * after * ((12 - promo) / 12) : kwh * mix;
        var power = v.p1 * (v[x + "pr1"] || 0) * 365 + (v.p2 || 0) * (v[x + "pr2"] || 0) * 365;
        var svc = (v[x + "svc"] || 0) * 12;
        var pre = energy + power + svc;
        var taxed = ((energy + power) * 1.0511269632 + 0.81 * 12 + svc) * 1.21;
        res.push({ name: T.offer(x), energy: energy, power: power, svc: svc, pre: pre, taxed: taxed, promo: promo > 0 && after > 0 });
      });
      if (!res.length) return { empty: T.empty };
      var best = res.reduce(function (b, r, i) { return r.taxed < res[b].taxed ? i : b; }, 0);
      var notes = res.filter(function (r, i) { return i !== best; }).map(function (r) { return T.diff(r.name, e(r.taxed - res[best].taxed)); });
      notes.push(T.nShare);
      if (res.some(function (r) { return r.promo; })) notes.push(T.nPromo);
      notes.push(T.nTax);
      return {
        head: [T.head1, { strong: res[best].name }, T.head2, e(res[best].taxed), T.head3],
        tables: [{ cols: T.cols, numeric: [1, 2, 3, 4, 5], best: best, rows: res.map(function (r) { return [r.name, e(r.energy), e(r.power), e(r.svc), e(r.pre), e(r.taxed)]; }) }],
        notes: notes,
      };
    },
  };
});
