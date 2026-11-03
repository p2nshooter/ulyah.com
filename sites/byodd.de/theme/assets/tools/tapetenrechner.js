/* BYODD Tapetenrechner: Bahnen und Rollen aus Wandumfang, Raumhöhe, Rollenmaß und Rapport (gerader oder versetzter
   Ansatz), Türen und Fenster abgezogen. Läuft im Browser. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "tapetenrechner") return;
  var el = function (t, a, k) { var n = document.createElement(t); for (var x in a || {}) if (a[x] != null) n.setAttribute(x, a[x]); (k || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); }); return n; };
  var num = function (i) { var v = parseFloat(String(i.value).replace(",", ".")); return isFinite(v) ? v : NaN; };
  var f = function (n, d) { return n.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var inp = function (id, val, ph) { return el("input", { id: id, type: "text", inputmode: "decimal", value: val || "", placeholder: ph }); };
  var U = inp("wz-u", "", "z. B. 16,2"), H = inp("wz-h", "2,5", "z. B. 2,5"), OB = inp("wz-ob", "0,9", "Breite von Tür + Fenstern in m");
  var rolle = el("select", { id: "wz-rolle" }, [el("option", { value: "0.53|10.05" }, ["Standardrolle 0,53 × 10,05 m"]), el("option", { value: "1.06|10.05" }, ["Doppelt breit 1,06 × 10,05 m"]), el("option", { value: "0.53|17" }, ["Raufaser 0,53 × 17 m"]), el("option", { value: "0.53|25" }, ["Raufaser 0,53 × 25 m"])]);
  var R = inp("wz-r", "0", "0 = ohne Muster"), ansatz = el("select", { id: "wz-ansatz" }, [el("option", { value: "gerade" }, ["gerader Ansatz"]), el("option", { value: "versetzt" }, ["versetzter Ansatz"])]);
  var out = el("div", { class: "zeder-wz-ergebnis", "aria-live": "polite" });
  root.className += " zeder-wz";
  root.appendChild(el("p", { class: "zeder-wz-titel" }, ["Tapetenrechner"]));
  root.appendChild(el("p", { class: "zeder-wz-hilfe" }, ["Wandumfang = alle Wände, die tapeziert werden, nebeneinander gemessen. Rapport und Ansatz stehen auf dem Etikett der Rolle."]));
  root.appendChild(el("div", { class: "zeder-wz-felder" }, [
    el("label", { for: "wz-u" }, ["Wandumfang (m)", U]), el("label", { for: "wz-h" }, ["Raumhöhe (m)", H]), el("label", { for: "wz-ob" }, ["Breite von Türen und Fenstern (m)", OB]),
    el("label", { for: "wz-rolle" }, ["Rolle", rolle]), el("label", { for: "wz-r" }, ["Rapport (cm)", R]), el("label", { for: "wz-ansatz" }, ["Ansatz", ansatz]),
  ]));
  root.appendChild(out);
  function render() {
    out.innerHTML = "";
    var u = num(U), h = num(H), ob = Math.max(0, num(OB) || 0), r = Math.max(0, num(R) || 0) / 100, parts = rolle.value.split("|"), bw = Number(parts[0]), rl = Number(parts[1]);
    if (!(u > 0 && h > 0)) { out.appendChild(el("p", { class: "zeder-wz-leer" }, ["Trag Wandumfang und Raumhöhe ein."])); return; }
    // Bahnlänge: Raumhöhe + 10 cm Zugabe, auf ganze Rapporte aufgerundet; versetzt kommt ein halber Rapport dazu.
    var bahn = h + 0.1;
    if (r > 0) bahn = Math.ceil(bahn / r) * r + (ansatz.value === "versetzt" ? r / 2 : 0);
    var bahnen = Math.ceil(Math.max(0, u - ob * 0.5) / bw), proRolle = Math.floor(rl / bahn);
    if (proRolle < 1) { out.appendChild(el("p", { class: "zeder-wz-leer" }, ["Eine Bahn ist länger als die Rolle. Prüfe Raumhöhe und Rollenlänge."])); return; }
    var rollen = Math.ceil(bahnen / proRolle);
    out.appendChild(el("p", { class: "zeder-wz-kopf" }, ["Du brauchst etwa ", el("strong", {}, [rollen + " Rolle" + (rollen > 1 ? "n" : "")]), " (" + bahnen + " Bahnen à " + f(bahn, 2) + " m, " + proRolle + " Bahnen je Rolle)."]));
    out.appendChild(el("ul", { class: "zeder-wz-notizen" }, [
      el("li", {}, ["Türen und Fenster sind nur zur Hälfte abgezogen: Über und unter ihnen wird trotzdem tapeziert."]),
      el("li", {}, ["Kauf eine Rolle mehr mit derselben Chargennummer. Nachgekaufte Rollen weichen im Farbton oft leicht ab."]),
      el("li", {}, ["Mietwohnung? Lies vorher, was dein Vertrag zu Schönheitsreparaturen sagt."]),
    ]));
  }
  [U, H, OB, rolle, R, ansatz].forEach(function (i) { i.addEventListener("input", render); i.addEventListener("change", render); });
  render();
})();
