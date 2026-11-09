/* DAWO · Zonas de frecuencia cardiaca / Heart-rate zones.
   Frecuencia máxima medida o estimada (208 − 0,7 × edad, fórmula de Tanaka; 220 − edad es la clásica y más tosca).
   Con la frecuencia en reposo, zonas por reserva de frecuencia (Karvonen); sin ella, porcentaje de la máxima. */
EngineTool.mount("zonas-fc", function (lang, u) {
  var en = lang === "en";
  var Z = en
    ? [["1 · Very easy", "recovery, warm-up, walking"], ["2 · Easy", "conversational running, base endurance"], ["3 · Moderate", "steady pace, breathing faster"], ["4 · Hard", "intervals, race pace over 5–10 km"], ["5 · Maximum", "short sprints, only a few minutes in total"]]
    : [["1 · Muy suave", "recuperación, calentamiento, caminar"], ["2 · Suave", "rodaje de conversación, resistencia de base"], ["3 · Moderada", "ritmo sostenido, respiración más rápida"], ["4 · Intensa", "series, ritmo de carrera de 5 a 10 km"], ["5 · Máxima", "esfuerzos cortos, pocos minutos en total"]];
  var RES = [[0.5, 0.6], [0.6, 0.7], [0.7, 0.8], [0.8, 0.9], [0.9, 1]];
  var MAX = [[0.5, 0.6], [0.6, 0.7], [0.7, 0.8], [0.8, 0.9], [0.9, 1]];
  var T = en
    ? { title: "Heart-rate zones", intro: "Enter your age and, if you know them, your measured maximum and your resting heart rate (taken in bed on waking). A measured maximum is always better than a formula.",
        age: "Age", max: "Measured maximum (bpm, optional)", rest: "Resting heart rate (bpm, optional)", empty: "Enter your age, or your measured maximum heart rate.",
        cols: ["Zone", "Beats per minute", "What it is for"], head: ["Maximum used: ", " bpm"], est: " (estimated from your age)", meas: " (measured)",
        nK: "With your resting heart rate the zones are worked out on the heart-rate reserve (Karvonen), which fits trained and untrained people better.",
        nP: "Without a resting heart rate the zones are percentages of the maximum.",
        nF: "Formulas can be 10 to 15 beats out either way. If you have a heart condition or take medicines that change your pulse, such as beta blockers, ask your doctor before training by heart rate.",
        n2: "Most of the week's training, around eight sessions in ten, is best done in zones 1 and 2." }
    : { title: "Zonas de frecuencia cardiaca", intro: "Escribe tu edad y, si las conoces, tu frecuencia máxima medida y tu frecuencia en reposo (tomada en la cama al despertar). Una máxima medida siempre es mejor que una fórmula.",
        age: "Edad", max: "Máxima medida (ppm, opcional)", rest: "Frecuencia en reposo (ppm, opcional)", empty: "Escribe tu edad o tu frecuencia cardiaca máxima medida.",
        cols: ["Zona", "Pulsaciones por minuto", "Para qué sirve"], head: ["Máxima usada: ", " ppm"], est: " (estimada por la edad)", meas: " (medida)",
        nK: "Con tu frecuencia en reposo, las zonas se calculan sobre la reserva de frecuencia (Karvonen), que se ajusta mejor a personas entrenadas y no entrenadas.",
        nP: "Sin frecuencia en reposo, las zonas son porcentajes de la máxima.",
        nF: "Las fórmulas pueden fallar 10 o 15 pulsaciones arriba o abajo. Si tienes una enfermedad del corazón o tomas medicamentos que cambian el pulso, como los betabloqueantes, consulta con tu médico antes de entrenar por pulsaciones.",
        n2: "La mayor parte del entrenamiento de la semana, unas ocho sesiones de cada diez, conviene hacerla en las zonas 1 y 2." };
  return {
    title: T.title,
    intro: T.intro,
    fields: [
      { id: "age", label: T.age, value: "40", placeholder: "40" },
      { id: "max", label: T.max, placeholder: "182" },
      { id: "rest", label: T.rest, placeholder: "60" },
    ],
    compute: function (v) {
      var measured = v.max >= 120 && v.max <= 230;
      if (!measured && !(v.age >= 10 && v.age <= 100)) return { empty: T.empty };
      var hrMax = measured ? v.max : Math.round(208 - 0.7 * v.age);
      var rest = v.rest >= 30 && v.rest < hrMax - 40 ? v.rest : 0;
      var rows = Z.map(function (z, i) {
        var lo, hi;
        if (rest) { lo = rest + (hrMax - rest) * RES[i][0]; hi = rest + (hrMax - rest) * RES[i][1]; }
        else { lo = hrMax * MAX[i][0]; hi = hrMax * MAX[i][1]; }
        return [z[0], Math.round(lo) + "–" + Math.round(hi), z[1]];
      });
      return {
        head: [T.head[0], { strong: String(hrMax) }, T.head[1] + (measured ? T.meas : T.est) + "."],
        tables: [{ cols: T.cols, numeric: [1], rows: rows }],
        notes: [rest ? T.nK : T.nP, T.n2, T.nF],
      };
    },
  };
});
