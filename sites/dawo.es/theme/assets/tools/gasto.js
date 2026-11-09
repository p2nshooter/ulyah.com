/* DAWO · Gasto energético por actividad / Energy used by activity.
   kcal ≈ MET × peso (kg) × horas. Valores MET orientativos del Compendio de Actividades Físicas (adultos); el gasto real
   varía con la técnica, el terreno, la intensidad y la persona. */
EngineTool.mount("gasto", function (lang, u) {
  var en = lang === "en";
  // [id, español, english, MET]
  var A = [
    ["walk", "Caminar a paso ligero (unos 5,5 km/h)", "Brisk walking (about 5.5 km/h)", 4.3],
    ["run8", "Correr suave (8 km/h)", "Easy running (8 km/h)", 8.3],
    ["run10", "Correr (10 km/h)", "Running (10 km/h)", 9.8],
    ["run12", "Correr rápido (12 km/h)", "Fast running (12 km/h)", 11.8],
    ["bike", "Bicicleta por ciudad o paseo (16–19 km/h)", "Cycling in town or for leisure (16–19 km/h)", 6.8],
    ["swim", "Nadar crol a ritmo moderado", "Front crawl at a moderate pace", 5.8],
    ["padel", "Pádel o tenis de dobles", "Padel or doubles tennis", 6],
    ["tennis", "Tenis individual", "Singles tennis", 8],
    ["football", "Fútbol informal", "Casual football", 7],
    ["badminton", "Bádminton de club", "Club badminton", 5.5],
    ["strength", "Fuerza con pesas, esfuerzo moderado", "Weight training, moderate effort", 3.5],
    ["hike", "Senderismo por montaña", "Hill walking", 6],
  ];
  var T = en
    ? { title: "Energy used by activity", intro: "Choose an activity, your weight and how long you do it. The result is an estimate of the energy used, useful for comparing activities, not for counting calories to the unit.",
        act: "Activity", kg: "Your weight (kg)", min: "Minutes", week: "Times a week", empty: "Enter your weight and the minutes.", cols: ["", "kcal"],
        r: ["This session", "A week", "Per hour"], head: ["About ", " kcal in this session."],
        n1: "MET values are averages from the Compendium of Physical Activities: technique, terrain, intensity and fitness change the real figure, sometimes by a fifth or more.",
        n2: "Exercise uses less energy than it seems: a 30-minute run is roughly a sandwich. For health, what counts most is moving regularly, not the calories.",
        n3: "Wearables estimate energy in a similar way and can be just as far out." }
    : { title: "Gasto energético por actividad", intro: "Elige una actividad, tu peso y cuánto tiempo la haces. El resultado es una estimación del gasto, útil para comparar actividades, no para contar calorías al detalle.",
        act: "Actividad", kg: "Tu peso (kg)", min: "Minutos", week: "Veces por semana", empty: "Escribe tu peso y los minutos.", cols: ["", "kcal"],
        r: ["Esta sesión", "Una semana", "Por hora"], head: ["Unas ", " kcal en esta sesión."],
        n1: "Los valores MET son medias del Compendio de Actividades Físicas: la técnica, el terreno, la intensidad y la forma física cambian la cifra real, a veces una quinta parte o más.",
        n2: "El ejercicio gasta menos energía de lo que parece: media hora de carrera equivale más o menos a un bocadillo. Para la salud, lo que más cuenta es moverse con regularidad, no las calorías.",
        n3: "Los relojes y pulseras estiman el gasto de forma parecida y pueden fallar igual." };
  return {
    title: T.title,
    intro: T.intro,
    fields: [
      { id: "act", label: T.act, type: "select", wide: true, options: A.map(function (a) { return [a[0], en ? a[2] : a[1]]; }), value: "run8" },
      { id: "kg", label: T.kg, value: "70", placeholder: "70" },
      { id: "min", label: T.min, value: "30", placeholder: "30" },
      { id: "week", label: T.week, value: "3", placeholder: "3" },
    ],
    compute: function (v) {
      if (!(v.kg > 20) || !(v.min > 0)) return { empty: T.empty };
      var a = A.filter(function (x) { return x[0] === v.act; })[0] || A[1];
      var perH = a[3] * v.kg;
      var session = perH * (v.min / 60);
      var week = session * (v.week > 0 ? v.week : 1);
      return {
        head: [T.head[0], { strong: u.fmt(session, 0) }, T.head[1]],
        tables: [{ cols: T.cols, numeric: [1], rows: [[T.r[0], u.fmt(session, 0)], [T.r[1], u.fmt(week, 0)], [T.r[2] + " (MET " + u.fmt(a[3], 1) + ")", u.fmt(perH, 0)]] }],
        notes: [T.n1, T.n2, T.n3],
      };
    },
  };
});
