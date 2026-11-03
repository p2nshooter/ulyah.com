/* BYOY Mischkultur-Nachbarn: gute und ungünstige Nachbarn für 13 Gemüse, aus unserem Mischkultur-Ratgeber. Die
   Bayerische Gartenakademie erinnert daran, dass solche Listen auf Erfahrung beruhen und sich teils widersprechen. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "nachbarn") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var N = {
    "Tomate": ["Salat, Spinat, Möhren, Petersilie, Kohl, Ringelblume", "Kartoffel, Fenchel, Erbse"],
    "Möhre": ["Zwiebel, Lauch, Knoblauch, Salat, Radieschen, Erbse", "Dill in großer Menge"],
    "Zwiebel, Knoblauch": ["Möhre, Erdbeere, Rote Bete, Salat, Tomate", "Bohne, Erbse, Kohl"],
    "Buschbohne": ["Bohnenkraut, Gurke, Kohl, Salat, Rote Bete, Kartoffel", "Zwiebel, Lauch, Knoblauch, Erbse, Fenchel"],
    "Erbse": ["Möhre, Radieschen, Salat, Kohlrabi, Gurke", "Bohne, Zwiebelgewächse, Tomate"],
    "Kohl (alle)": ["Sellerie, Salat, Spinat, Tomate, Bohne, Rote Bete", "Erdbeere, Zwiebel, Senf und andere Kreuzblütler"],
    "Gurke": ["Dill, Bohne, Salat, Erbse, Zwiebel", "Kartoffel, Tomate (unterschiedliche Klimaansprüche im Gewächshaus)"],
    "Salat": ["fast alle, besonders Möhre, Radieschen, Erdbeere, Tomate", "Petersilie, Sellerie"],
    "Kartoffel": ["Buschbohne, Kohlrabi, Spinat, Kapuzinerkresse", "Tomate, Kürbis, Sonnenblume"],
    "Lauch": ["Möhre, Sellerie, Erdbeere, Tomate", "Bohne, Erbse"],
    "Rote Bete": ["Zwiebel, Kohl, Salat, Buschbohne", "Spinat, Mangold (gleiche Familie)"],
    "Erdbeere": ["Knoblauch, Zwiebel, Lauch, Salat, Spinat", "Kohl"],
    "Spinat": ["Kohl, Kartoffel, Tomate, Erdbeere, Radieschen", "Rote Bete, Mangold"],
  };
  var a = el("select", { id: "wz-a" }, Object.keys(N).map(function (k) { return el("option", { value: k }, [k]); }));
  var b = el("select", { id: "wz-b" }, [el("option", { value: "" }, ["– optional: zweites Gemüse –"])].concat(Object.keys(N).map(function (k) { return el("option", { value: k }, [k]); })));
  var out = el("div", { class: "hamon-wz-ergebnis", "aria-live": "polite" });
  root.className += " hamon-wz";
  root.appendChild(el("p", { class: "hamon-wz-titel" }, ["Mischkultur-Nachbarn"]));
  root.appendChild(el("p", { class: "hamon-wz-hilfe" }, ["Wähle ein Gemüse und sieh, was daneben gut passt und was lieber Abstand hält. Mit einem zweiten Gemüse prüfst du ein Paar."]));
  root.appendChild(el("div", { class: "hamon-wz-felder" }, [el("label", { for: "wz-a" }, ["Gemüse", a]), el("label", { for: "wz-b" }, ["Daneben", b])]));
  root.appendChild(out);
  var key = function (k) { return k.split(/[ ,(]/)[0].toLowerCase(); };
  // Ganze Wörter vergleichen: „Kohl“ ist nicht „Kohlrabi“, aber „Bohne“ gilt für Buschbohne, „Zwiebelgewächse“ für Zwiebel.
  function has(list, name) {
    var k = key(name);
    return list.split(",").some(function (t) {
      var w = t.trim().split(/[ (]/)[0].toLowerCase();
      return w === k || w === k + "n" || w === k + "e" || w + "n" === k || w.indexOf(k + "gewächs") === 0 || (w.length >= 5 && k.length > w.length && k.slice(-w.length) === w);
    });
  }
  function render() {
    var x = N[a.value]; out.innerHTML = "";
    out.appendChild(el("table", {}, [el("tbody", {}, [el("tr", {}, [el("th", { scope: "row" }, ["Gute Nachbarn"]), el("td", {}, [x[0]])]), el("tr", { class: "hamon-wz-nein" }, [el("th", { scope: "row" }, ["Ungünstig"]), el("td", {}, [x[1]])])])]));
    if (b.value && b.value !== a.value) {
      var y = N[b.value], gut = has(x[0], b.value) || has(y[0], a.value), schlecht = has(x[1], b.value) || has(y[1], a.value);
      out.appendChild(el("p", { class: "hamon-wz-kopf" }, [a.value + " neben " + b.value + ": " + (schlecht ? "lieber nicht" : gut ? "passt gut" : "neutral – keine Angabe in unserer Liste")]));
    }
    out.appendChild(el("p", { class: "hamon-wz-notiz" }, ["Mischkultur-Tabellen beruhen vor allem auf Gärtnererfahrung; wissenschaftlich belegt ist wenig. Wichtiger als jede Liste: genug Platz für die Endgröße, Licht für alle und kein Gemüse aus derselben Familie am selben Platz wie im Vorjahr."]));
  }
  a.addEventListener("change", render); b.addEventListener("change", render);
  render();
})();
