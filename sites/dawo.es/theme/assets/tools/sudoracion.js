/* DAWO · Calculadora de sudoración / Sweat-rate calculator, como la prueba de peso de nuestra guía de hidratación:
   sudor = (peso antes − peso después) + lo bebido − orina eliminada; por hora; pérdida en % del peso corporal. */
EngineTool.mount("sudoracion", function (lang, u) {
  var en = lang === "en";
  var T = en
    ? { title: "Sweat-rate calculator", intro: "Weigh yourself before and after a training session, without wet clothes and after going to the toilet, and note what you drank. Repeat it in the heat and in the cold.",
        before: "Weight before (kg)", after: "Weight after (kg)", drank: "Drunk during it (litres)", min: "Duration (minutes)", urine: "Toilet stop during it (litres, if any)",
        empty: "Enter both weights, what you drank and how long you trained.", cols: ["", "Value"],
        r: ["Sweat lost", "Sweat per hour", "Weight lost", "Weight lost as % of body weight"], head: ["You sweated about ", " litres an hour."],
        ok: "You lost less than 2 % of your body weight: what you drank was about right for this session.",
        hi: "You lost 2 % or more of your body weight: in similar conditions, drink a little more during the session and start it well hydrated.",
        gain: "You weighed more after than before: you drank more than you sweated. In long efforts, drinking far more than you lose can be dangerous (hyponatraemia); let thirst guide you.",
        long: "In efforts of more than an hour or two with heavy sweating, a drink with sodium helps.",
        after2: "After training, rehydrate gradually over the following hours, a little more than you lost, with a meal or something slightly salty." }
    : { title: "Calculadora de sudoración", intro: "Pésate antes y después de un entrenamiento, sin ropa mojada y después de ir al baño, y apunta lo que has bebido. Repite la prueba con calor y con frío.",
        before: "Peso antes (kg)", after: "Peso después (kg)", drank: "Bebido durante el ejercicio (litros)", min: "Duración (minutos)", urine: "Orina durante el ejercicio (litros, si la hubo)",
        empty: "Escribe los dos pesos, lo que has bebido y cuánto has entrenado.", cols: ["", "Valor"],
        r: ["Sudor perdido", "Sudor por hora", "Peso perdido", "Peso perdido en % del peso corporal"], head: ["Has sudado unos ", " litros por hora."],
        ok: "Has perdido menos del 2 % de tu peso: lo que has bebido ha sido adecuado para esta sesión.",
        hi: "Has perdido el 2 % de tu peso o más: en condiciones parecidas, bebe algo más durante la sesión y empiézala bien hidratado.",
        gain: "Pesas más después que antes: has bebido más de lo que has sudado. En esfuerzos largos, beber mucho más de lo que se pierde puede ser peligroso (hiponatremia); guíate por la sed.",
        long: "En esfuerzos de más de una o dos horas con mucho sudor, una bebida con sodio ayuda.",
        after2: "Después del ejercicio, rehidrátate poco a poco en las horas siguientes, algo más de lo perdido, con una comida o algo salado." };
  return {
    title: T.title,
    intro: T.intro,
    fields: [
      { id: "before", label: T.before, value: "75", placeholder: "75" },
      { id: "after", label: T.after, value: "74,5", placeholder: "74,5" },
      { id: "drank", label: T.drank, value: "0,5", placeholder: "0,5" },
      { id: "min", label: T.min, value: "60", placeholder: "60" },
      { id: "urine", label: T.urine, value: "0", placeholder: "0" },
    ],
    compute: function (v) {
      if (!(v.before > 20) || !(v.after > 20) || !(v.min > 0)) return { empty: T.empty };
      var lost = v.before - v.after;
      var sweat = lost + (v.drank > 0 ? v.drank : 0) - (v.urine > 0 ? v.urine : 0);
      var perH = sweat / (v.min / 60);
      var pct = (lost / v.before) * 100;
      var notes = [lost < 0 ? T.gain : pct >= 2 ? T.hi : T.ok];
      if (v.min >= 60 && perH >= 1) notes.push(T.long);
      notes.push(T.after2);
      return {
        head: [T.head[0], { strong: u.fmt(Math.max(0, perH), 1) }, T.head[1]],
        tables: [{ cols: T.cols, numeric: [1], rows: [[T.r[0], u.fmt(Math.max(0, sweat), 2) + " l"], [T.r[1], u.fmt(Math.max(0, perH), 2) + " l/h"], [T.r[2], u.fmt(lost, 2) + " kg"], [T.r[3], u.fmt(pct, 1) + " %"]] }],
        notes: notes,
      };
    },
  };
});
