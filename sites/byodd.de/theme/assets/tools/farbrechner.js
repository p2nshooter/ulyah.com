/* BYODD Farbrechner: Wandfläche eines Raums abzüglich Türen und Fenster, Anstriche, Ergiebigkeit laut Eimer → Liter und
   eine Gebindekombination. Läuft im Browser; die letzte Eingabe merkt sich nur dein Browser. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "farbrechner") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var num = function (i) { var v = parseFloat(String(i.value).replace(",", ".")); return isFinite(v) ? v : NaN; };
  var f = function (n, d) { return n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var store = { get: function () { try { return JSON.parse(localStorage.getItem("byodd-farbe") || "{}"); } catch (e) { return {}; } }, set: function (v) { try { localStorage.setItem("byodd-farbe", JSON.stringify(v)); } catch (e) {} } };
  var s = store.get();
  var inp = function (id, val, ph) { return el("input", { id: id, type: "text", inputmode: "decimal", value: val || "", placeholder: ph }); };
  var L = inp("wz-l", s.l, "z. B. 4,5"), B = inp("wz-b", s.b, "z. B. 3,6"), H = inp("wz-h", s.h || "2,5", "z. B. 2,5");
  var T = inp("wz-t", s.t || "1", "Anzahl"), FE = inp("wz-fe", s.fe || "1", "Anzahl"), FM = inp("wz-fm", s.fm || "1,5", "m² je Fenster");
  var A = inp("wz-a", s.a || "2", "1 bis 3"), E = inp("wz-e", s.e || "", "z. B. 7");
  var decke = el("input", { id: "wz-decke", type: "checkbox" }); decke.checked = !!s.d;
  var out = el("div", { class: "zeder-wz-ergebnis", "aria-live": "polite" });
  root.className += " zeder-wz";
  root.appendChild(el("p", { class: "zeder-wz-titel" }, ["Farbrechner"]));
  root.appendChild(el("p", { class: "zeder-wz-hilfe" }, ["Raummaße in Metern. Die Ergiebigkeit (m² pro Liter) steht auf dem Eimer; sie hängt von Farbe und Untergrund ab."]));
  root.appendChild(el("div", { class: "zeder-wz-felder" }, [
    el("label", { for: "wz-l" }, ["Raumlänge (m)", L]), el("label", { for: "wz-b" }, ["Raumbreite (m)", B]), el("label", { for: "wz-h" }, ["Raumhöhe (m)", H]),
    el("label", { for: "wz-t" }, ["Türen", T]), el("label", { for: "wz-fe" }, ["Fenster", FE]), el("label", { for: "wz-fm" }, ["Fläche je Fenster (m²)", FM]),
    el("label", { for: "wz-a" }, ["Anstriche", A]), el("label", { for: "wz-e" }, ["Ergiebigkeit laut Eimer (m²/l)", E]),
    el("label", { for: "wz-decke", class: "zeder-wz-haken" }, [decke, "Decke mitstreichen"]),
  ]));
  root.appendChild(out);
  // Gebinde: möglichst wenig Rest, mit den üblichen Größen.
  function gebinde(liter) {
    var sizes = [10, 5, 2.5, 1], best = null;
    for (var a = 0; a <= Math.ceil(liter / 10); a++) for (var b = 0; b <= 2; b++) for (var c = 0; c <= 2; c++) for (var d = 0; d <= 3; d++) {
      var tot = a * 10 + b * 5 + c * 2.5 + d; if (tot < liter) continue;
      var n = a + b + c + d; if (!best || tot < best.tot || (tot === best.tot && n < best.n)) best = { tot: tot, n: n, k: [a, b, c, d] };
    }
    return best ? best.k.map(function (x, i) { return x ? x + " × " + f(sizes[i], sizes[i] % 1 ? 1 : 0) + " l" : null; }).filter(Boolean).join(" + ") + " (" + f(best.tot, 1) + " l)" : "";
  }
  function render() {
    store.set({ l: L.value, b: B.value, h: H.value, t: T.value, fe: FE.value, fm: FM.value, a: A.value, e: E.value, d: decke.checked });
    out.innerHTML = "";
    var l = num(L), b = num(B), h = num(H), t = Math.max(0, Math.round(num(T) || 0)), fe = Math.max(0, Math.round(num(FE) || 0)), fm = num(FM) || 0, a = Math.max(1, Math.round(num(A) || 2)), e = num(E);
    if (!(l > 0 && b > 0 && h > 0)) { out.appendChild(el("p", { class: "zeder-wz-leer" }, ["Trag Länge, Breite und Höhe des Raums ein."])); return; }
    var wand = 2 * (l + b) * h - t * 2.0 - fe * fm, flaeche = Math.max(0, wand) + (decke.checked ? l * b : 0);
    out.appendChild(el("p", { class: "zeder-wz-kopf" }, ["Zu streichen: ", el("strong", {}, [f(flaeche, 1) + " m²"]), decke.checked ? " (Wände und Decke)" : " (Wände)"]));
    if (!(e > 0)) { out.appendChild(el("p", { class: "zeder-wz-leer" }, ["Trag noch die Ergiebigkeit vom Eimer ein, dann rechne ich die Liter."])); return; }
    var liter = (flaeche * a) / e, mitReserve = Math.ceil(liter * 1.1 * 2) / 2;
    out.appendChild(el("p", {}, [a + " Anstrich" + (a > 1 ? "e" : "") + ": " + f(liter, 1) + " l, mit 10 % Reserve etwa " + f(mitReserve, 1) + " l."]));
    out.appendChild(el("p", {}, ["Mögliche Gebinde: " + gebinde(mitReserve)]));
    out.appendChild(el("ul", { class: "zeder-wz-notizen" }, [
      el("li", {}, ["Je Tür sind 2 m² abgezogen. Stark saugende oder fleckige Untergründe brauchen vorher Tiefgrund oder einen Anstrich mehr."]),
      el("li", {}, ["Kauf alles aus derselben Charge oder mische die Eimer vorher, damit der Farbton gleich bleibt."]),
      el("li", {}, ["Emissionsarme Wandfarben erkennst du am Blauen Engel. Beim Streichen und danach gut lüften."]),
    ]));
  }
  [L, B, H, T, FE, FM, A, E, decke].forEach(function (i) { i.addEventListener("input", render); i.addEventListener("change", render); });
  render();
})();
