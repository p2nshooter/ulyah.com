/* ZEVOK Putzplan-Generator: Räume, Haushalt und freie Tage wählen → ein Wochenplan mit täglichen Handgriffen,
   Aufgaben pro Wochentag, Monats- und Saisonaufgaben, zum Ausdrucken und Abhaken. Die Aufgaben und Häufigkeiten
   stammen aus unserem Ratgeber „Putzplan erstellen“. Läuft ganz im Browser; die Auswahl merkt sich nur dein Browser. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "putzplan") return;

  // Aufgaben: Bereich, wie oft, Minuten (grob, für eine durchschnittliche Wohnung) und für wen sie gilt.
  var ROOMS = {
    kueche: { name: "Küche", daily: ["Spüle und Arbeitsfläche abwischen", "Kochfeld nach dem Kochen kurz säubern", "Geschirr erledigen"],
      weekly: [["Herd und Schrankfronten gründlich", 15], ["Mikrowelle innen", 5], ["Mülleimer leeren und auswischen", 5], ["Spüllappen und Geschirrtücher wechseln (60 °C waschen)", 2], ["Küchenboden wischen", 10]],
      monthly: ["Kühlschrank ausräumen und auswischen", "Siebe im Geschirrspüler reinigen", "Fettfilter der Dunstabzugshaube (je nach Gebrauch)", "Backofen, wenn nötig"],
      rare: ["Schränke innen auswischen", "Oberseite der Hängeschränke", "Gefrierfach abtauen, wenn sich Eis bildet"] },
    bad: { name: "Bad", daily: ["Lüften", "Duschwand abziehen", "Waschbecken kurz abwischen"],
      weekly: [["WC gründlich", 10], ["Waschbecken und Armaturen", 5], ["Dusche oder Wanne", 10], ["Spiegel", 3], ["Badboden wischen", 5], ["Handtücher wechseln", 2]],
      monthly: ["Haarsieb im Abfluss", "Lüftergitter", "Mülleimer auswaschen", "Zahnputzbecher und Seifenspender", "Duschvorhang"],
      rare: ["Fugen gründlich reinigen", "Schränke innen auswischen", "Silikonfugen auf dunkle Punkte prüfen"] },
    wc: { name: "Gäste-WC", daily: [],
      weekly: [["Gäste-WC: Toilette, Waschbecken, Boden", 10]],
      monthly: ["Gäste-WC: Lüftergitter, Mülleimer"], rare: [] },
    wohnen: { name: "Wohnzimmer", daily: ["Lüften", "Dinge an ihren Platz zurücklegen"],
      weekly: [["Wohnzimmer: Staub wischen", 10], ["Wohnzimmer: saugen", 10]],
      monthly: ["Heizkörper abstauben", "Lichtschalter und Türgriffe", "Polster absaugen"],
      rare: ["Fenster putzen", "Gardinen waschen", "Hinter und unter den Möbeln", "Lampen abstauben"] },
    schlafen: { name: "Schlafzimmer", daily: ["Lüften", "Bett aufschlagen und auslüften lassen"],
      weekly: [["Schlafzimmer: Staub wischen und saugen", 15], ["Bettwäsche wechseln (alle ein bis zwei Wochen)", 10]],
      monthly: ["Matratze absaugen", "Unter dem Bett saugen"], rare: ["Matratze wenden, wenn sie dafür gemacht ist", "Kleiderschrank innen auswischen"] },
    kinder: { name: "Kinderzimmer", daily: ["Spielzeug in die Kisten räumen (gemeinsam)"],
      weekly: [["Kinderzimmer: Staub wischen und saugen", 15]], monthly: ["Spielzeug abwaschen, was waschbar ist"], rare: ["Spielzeug aussortieren"] },
    arbeit: { name: "Arbeitszimmer", daily: [], weekly: [["Arbeitszimmer: Schreibtisch, Tastatur, Staub", 10]], monthly: ["Bildschirm und Kabel abstauben"], rare: [] },
    flur: { name: "Flur", daily: ["Schuhe wegstellen"],
      weekly: [["Flur: Boden saugen und wischen", 10], ["Fußmatte ausschütteln", 2]],
      monthly: ["Wohnungstür innen, Garderobe, Spiegel"], rare: ["Schuhschrank auswischen", "Fußmatte waschen, wenn das Material es erlaubt"] },
    balkon: { name: "Balkon oder Terrasse", daily: [], weekly: [["Balkon fegen", 5]], monthly: ["Balkonmöbel abwischen"], rare: ["Balkon gründlich reinigen (Frühjahr)"] },
  };
  var FLOORS = { weekly: [["Alle Räume saugen", 20], ["Nass wischen passend zur Bodenart", 20]], monthly: ["Fußleisten und Ecken"], rare: ["Teppiche gründlich reinigen", "Bodenpflege nach Herstellerangabe"] };
  var SEASONS = [
    ["Frühjahr", "Fenster und Rahmen, Gardinen, Balkon und Balkonmöbel, Wintersachen nach Etikett waschen und verstauen"],
    ["Sommer", "Insektenschutzgitter, Ventilatoren abstauben, Kühlschrank öfter kontrollieren"],
    ["Herbst", "Heizkörper vor der Heizperiode gründlich abstauben, Fußmatten bereitlegen, Sommerkleidung waschen und wegräumen"],
    ["Winter", "Streusalz- und Schmutzränder im Flur häufiger wischen, Backofen und Dunstabzug nach der Plätzchenzeit"],
  ];
  var DAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

  var store = {
    get: function () { try { return JSON.parse(localStorage.getItem("zevok-putzplan") || "null"); } catch (e) { return null; } },
    set: function (v) { try { localStorage.setItem("zevok-putzplan", JSON.stringify(v)); } catch (e) {} },
  };
  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  };
  var state = store.get() || { rooms: ["kueche", "bad", "wohnen", "schlafen", "flur"], people: 2, pets: "keine", allergy: false, days: [0, 2, 5] };

  root.className += " erz-wz";
  root.appendChild(el("p", { class: "erz-wz-titel" }, ["Putzplan-Generator"]));
  root.appendChild(el("p", { class: "erz-wz-hilfe" }, ["Wähle deine Räume, wer mitwohnt und an welchen Tagen du putzen kannst. Der Plan verteilt die Wochenaufgaben gleichmäßig auf diese Tage."]));

  var roomBox = el("fieldset", { class: "erz-wz-auswahl" }, [el("legend", {}, ["Räume"])]);
  Object.keys(ROOMS).forEach(function (k) {
    var c = el("input", { type: "checkbox", value: k, id: "wz-r-" + k });
    c.checked = state.rooms.indexOf(k) >= 0;
    c.addEventListener("change", function () { state.rooms = Array.prototype.filter.call(roomBox.querySelectorAll("input"), function (i) { return i.checked; }).map(function (i) { return i.value; }); update(); });
    roomBox.appendChild(el("label", { for: "wz-r-" + k }, [c, ROOMS[k].name]));
  });
  var dayBox = el("fieldset", { class: "erz-wz-auswahl" }, [el("legend", {}, ["Putztage"])]);
  DAYS.forEach(function (d, i) {
    var c = el("input", { type: "checkbox", value: String(i), id: "wz-d-" + i });
    c.checked = state.days.indexOf(i) >= 0;
    c.addEventListener("change", function () { state.days = Array.prototype.filter.call(dayBox.querySelectorAll("input"), function (x) { return x.checked; }).map(function (x) { return Number(x.value); }); update(); });
    dayBox.appendChild(el("label", { for: "wz-d-" + i }, [c, d]));
  });
  var people = el("select", { id: "wz-personen" }, [1, 2, 3, 4, 5, 6].map(function (n) { return el("option", { value: String(n) }, [n === 6 ? "6 oder mehr" : String(n)]); }));
  people.value = String(state.people);
  people.addEventListener("change", function () { state.people = Number(people.value); update(); });
  var pets = el("select", { id: "wz-tiere" }, ["keine", "Katze", "Hund", "Katze und Hund"].map(function (n) { return el("option", { value: n }, [n]); }));
  pets.value = state.pets;
  pets.addEventListener("change", function () { state.pets = pets.value; update(); });
  var allergy = el("input", { type: "checkbox", id: "wz-allergie" });
  allergy.checked = !!state.allergy;
  allergy.addEventListener("change", function () { state.allergy = allergy.checked; update(); });

  root.appendChild(el("div", { class: "erz-wz-felder" }, [
    el("label", { for: "wz-personen" }, ["Personen im Haushalt", people]),
    el("label", { for: "wz-tiere" }, ["Haustiere", pets]),
    el("label", { for: "wz-allergie", class: "erz-wz-haken" }, [allergy, "Jemand hat eine Hausstauballergie"]),
  ]));
  root.appendChild(roomBox);
  root.appendChild(dayBox);
  var out = el("div", { class: "erz-wz-ergebnis erz-wz-plan", "aria-live": "polite" });
  root.appendChild(out);

  function check(text) { return el("li", {}, [el("span", { class: "erz-wz-kaestchen", "aria-hidden": "true" }), text]); }
  function update() {
    store.set(state);
    out.innerHTML = "";
    var rooms = state.rooms.map(function (k) { return ROOMS[k]; });
    if (!rooms.length) { out.appendChild(el("p", { class: "erz-wz-leer" }, ["Wähle mindestens einen Raum."])); return; }
    var days = state.days.slice().sort();
    if (!days.length) { out.appendChild(el("p", { class: "erz-wz-leer" }, ["Wähle mindestens einen Putztag."])); return; }
    var hasPets = state.pets !== "keine", many = state.people >= 4;

    var daily = [];
    rooms.forEach(function (r) { r.daily.forEach(function (t) { if (daily.indexOf(t) < 0) daily.push(t); }); });
    daily.push("Krümel in Küche und Essbereich wegfegen");
    if (hasPets) daily.push("Tierhaare an Liegeplätzen absaugen oder abbürsten");
    if (state.pets.indexOf("Katze") >= 0) daily.push("Katzenklo säubern");

    // Wochenaufgaben: je Raum, dazu die Böden; bei Kindern, Tieren oder Allergie öfter gesaugt.
    var weekly = [];
    rooms.forEach(function (r) { r.weekly.forEach(function (t) { weekly.push({ t: t[0], m: t[1] }); }); });
    FLOORS.weekly.forEach(function (t) { weekly.push({ t: t[0], m: t[1] }); });
    if (hasPets || state.allergy || many) weekly.push({ t: "Zusätzlich saugen" + (hasPets ? " (Tierhaare)" : state.allergy ? " (mit Feinstaubfilter, Staub feucht wischen)" : " (viel Betrieb)"), m: 15 });
    if (hasPets) weekly.push({ t: "Näpfe heiß spülen, Decke vom Liegeplatz waschen", m: 5 });
    // Gleichmäßig verteilen: immer an den Tag mit den wenigsten Minuten.
    var load = days.map(function () { return 0; }), plan = days.map(function () { return []; });
    weekly.sort(function (a, b) { return b.m - a.m; }).forEach(function (w) {
      var i = load.indexOf(Math.min.apply(null, load));
      plan[i].push(w); load[i] += w.m;
    });

    var monthly = [], rare = [];
    rooms.forEach(function (r) { monthly = monthly.concat(r.monthly); rare = rare.concat(r.rare); });
    monthly = monthly.concat(FLOORS.monthly); rare = rare.concat(FLOORS.rare);
    if (state.allergy) monthly.push("Polster und Matratzen gründlich absaugen");

    var total = load.reduce(function (a, b) { return a + b; }, 0);
    out.appendChild(el("p", { class: "erz-wz-kopf" }, ["Dein Plan: etwa " + Math.round(total / 5) * 5 + " Minuten pro Woche an " + days.length + " Tag" + (days.length > 1 ? "en" : "") + ", dazu jeden Tag ein paar Handgriffe."]));
    out.appendChild(el("section", { class: "erz-wz-block" }, [el("h3", {}, ["Jeden Tag (5 bis 15 Minuten)"]), el("ul", { class: "erz-wz-liste" }, daily.map(check))]));
    var grid = el("div", { class: "erz-wz-tage" });
    days.forEach(function (d, i) {
      grid.appendChild(el("section", { class: "erz-wz-tag" }, [el("h3", {}, [DAYS[d] + " · ca. " + Math.round(load[i] / 5) * 5 + " Min."]), el("ul", { class: "erz-wz-liste" }, plan[i].map(function (w) { return check(w.t); }))]));
    });
    out.appendChild(grid);
    out.appendChild(el("section", { class: "erz-wz-block" }, [el("h3", {}, ["Einmal im Monat"]), el("ul", { class: "erz-wz-liste" }, monthly.map(check))]));
    out.appendChild(el("section", { class: "erz-wz-block" }, [el("h3", {}, ["Halbjährlich oder jährlich"]), el("ul", { class: "erz-wz-liste" }, rare.map(check))]));
    out.appendChild(el("section", { class: "erz-wz-block" }, [el("h3", {}, ["Nach Jahreszeit"]), el("ul", {}, SEASONS.map(function (s) { return el("li", {}, [el("strong", {}, [s[0] + ": "]), s[1]]); }))]));
    if (state.people > 1) out.appendChild(el("p", { class: "erz-wz-notiz" }, ["Mehrere Personen: Verteilt die Tage oder rotiert die Bereiche jede Woche. Das Bad ist mehr Arbeit als der Müll; kombiniert leichte Aufgaben, damit die Pakete ungefähr gleich groß sind."]));
    var print = el("button", { type: "button", class: "erz-wz-knopf" }, ["Plan drucken"]);
    print.addEventListener("click", function () { window.print(); });
    out.appendChild(print);
  }
  update();
})();
