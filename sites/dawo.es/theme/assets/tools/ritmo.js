/* DAWO · Calculadora de ritmo de carrera / Running pace calculator.
   Ritmo = tiempo ÷ distancia; velocidad = distancia ÷ tiempo; tiempos previstos en otras distancias con la fórmula de
   Riegel (T2 = T1 × (D2 ÷ D1)^1,06), una estimación clásica que supone un entrenamiento adecuado para la distancia. */
EngineTool.mount("ritmo", function (lang, u) {
  var en = lang === "en";
  var T = en
    ? { title: "Running pace calculator", intro: "Enter a distance and the time it took you, from a race or a hard training run, to see your pace, your speed and an estimate for other distances.",
        d: "Distance (km)", h: "Hours", m: "Minutes", s: "Seconds", empty: "Enter the distance and your time.", cols: ["Distance", "Estimated time", "Pace"],
        head: ["Your pace: ", " per km — ", " km/h."], half: "Half marathon", mar: "Marathon",
        n1: "The estimates assume you have trained for each distance: for a half or full marathon, long runs matter more than a fast 5K.",
        n2: "Easy runs should be clearly slower than this race pace — about one to two minutes per kilometre slower is common for beginners.",
        n3: "In the heat, on hills or with wind your pace will be slower for the same effort: run by feel, not by the watch." }
    : { title: "Calculadora de ritmo de carrera", intro: "Escribe una distancia y el tiempo que tardaste, en una carrera o un entrenamiento exigente, y verás tu ritmo, tu velocidad y una estimación para otras distancias.",
        d: "Distancia (km)", h: "Horas", m: "Minutos", s: "Segundos", empty: "Escribe la distancia y tu tiempo.", cols: ["Distancia", "Tiempo estimado", "Ritmo"],
        head: ["Tu ritmo: ", " por km — ", " km/h."], half: "Media maratón", mar: "Maratón",
        n1: "Las estimaciones suponen que has entrenado para cada distancia: en una media o una maratón, las tiradas largas importan más que un 5K rápido.",
        n2: "Los rodajes suaves deben ir claramente más lentos que este ritmo de carrera: entre uno y dos minutos por kilómetro más despacio es habitual al empezar.",
        n3: "Con calor, cuestas o viento tu ritmo será más lento con el mismo esfuerzo: corre por sensaciones, no por el reloj." };
  var clock = function (sec) {
    sec = Math.round(sec);
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s;
  };
  return {
    title: T.title,
    intro: T.intro,
    fields: [
      { id: "d", label: T.d, value: "5", placeholder: "5" },
      { id: "h", label: T.h, value: "0", placeholder: "0" },
      { id: "m", label: T.m, value: "32", placeholder: "32" },
      { id: "s", label: T.s, value: "0", placeholder: "0" },
    ],
    compute: function (v) {
      var sec = (v.h || 0) * 3600 + (v.m || 0) * 60 + (v.s || 0);
      if (!(v.d > 0) || !(sec > 0)) return { empty: T.empty };
      var pace = sec / v.d, kmh = v.d / (sec / 3600);
      var rows = [[5, "5 km"], [10, "10 km"], [21.0975, T.half], [42.195, T.mar]].map(function (x) {
        var t = sec * Math.pow(x[0] / v.d, 1.06);
        return [x[1], clock(t), clock(t / x[0]) + " /km"];
      });
      return { head: [T.head[0], { strong: clock(pace) }, T.head[1], u.fmt(kmh, 1), T.head[2]], tables: [{ cols: T.cols, numeric: [1, 2], rows: rows }], notes: [T.n1, T.n2, T.n3] };
    },
  };
});
