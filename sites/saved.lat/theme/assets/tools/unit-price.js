/* SAVED unit-price comparer: the price per kilo, litre or item of up to five packs, the way a shelf label shows it
   (NIST unit pricing guide), so different pack sizes compare fairly. Runs in your browser; nothing is sent. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "unit-price") return;
  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  };
  var num = function (i) { var v = parseFloat(String(i.value).replace(",", ".")); return isFinite(v) ? v : NaN; };
  // Every unit to a base unit of its kind: grams, millilitres or items.
  var UNITS = { g: ["weight", 1], kg: ["weight", 1000], oz: ["weight", 28.3495], lb: ["weight", 453.592], ml: ["volume", 1], l: ["volume", 1000], floz: ["volume", 29.5735], item: ["count", 1] };
  var LABEL = { g: "g", kg: "kg", oz: "oz", lb: "lb", ml: "ml", l: "litres", floz: "fl oz", item: "items" };
  var PER = { weight: [1000, "per kg"], volume: [1000, "per litre"], count: [1, "per item"] };
  var cur = el("input", { id: "wz-cur", type: "text", value: "$", maxlength: "4", class: "granary-wz-short" });
  var rows = [];
  var table = el("div", { class: "granary-wz-rows" });
  root.className += " granary-wz";
  root.appendChild(el("p", { class: "granary-wz-title" }, ["Unit-price comparer"]));
  root.appendChild(el("p", { class: "granary-wz-help" }, ["Type the price and the amount in each pack. Packs measured by weight, by volume and by count are compared within their own kind."]));
  root.appendChild(el("div", { class: "granary-wz-fields" }, [el("label", { for: "wz-cur" }, ["Currency symbol", cur])]));
  root.appendChild(table);
  var out = el("div", { class: "granary-wz-result", "aria-live": "polite" });
  function addRow(name, priceV, qtyV, unitV) {
    var i = rows.length + 1;
    var r = {
      name: el("input", { type: "text", value: name || "Pack " + i, "aria-label": "Name of pack " + i }),
      price: el("input", { type: "text", inputmode: "decimal", value: priceV || "", placeholder: "price", "aria-label": "Price of pack " + i }),
      qty: el("input", { type: "text", inputmode: "decimal", value: qtyV || "", placeholder: "amount", "aria-label": "Amount in pack " + i }),
      unit: el("select", { "aria-label": "Unit of pack " + i }, Object.keys(UNITS).map(function (u) { return el("option", { value: u }, [LABEL[u]]); })),
    };
    r.unit.value = unitV || "g";
    [r.name, r.price, r.qty, r.unit].forEach(function (x) { x.addEventListener("input", render); x.addEventListener("change", render); });
    rows.push(r);
    table.appendChild(el("div", { class: "granary-wz-row" }, [r.name, r.price, r.qty, r.unit]));
  }
  addRow("Small pack", "", "", "g"); addRow("Large pack", "", "", "g"); addRow("", "", "", "g");
  var more = el("button", { type: "button", class: "granary-wz-button granary-wz-button--light" }, ["Add a pack"]);
  more.addEventListener("click", function () { if (rows.length < 5) addRow(); if (rows.length >= 5) more.hidden = true; });
  root.appendChild(more);
  root.appendChild(out);
  function render() {
    out.innerHTML = "";
    var items = rows.map(function (r) {
      var p = num(r.price), q = num(r.qty), u = UNITS[r.unit.value];
      if (!(p >= 0) || !(q > 0)) return null;
      var base = q * u[1];
      return { name: r.name.value || "Pack", kind: u[0], per: (p / base) * PER[u[0]][0], label: PER[u[0]][1] };
    }).filter(Boolean);
    if (items.length < 1) { out.appendChild(el("p", { class: "granary-wz-empty" }, ["Fill in at least one price and amount."])); return; }
    ["weight", "volume", "count"].forEach(function (kind) {
      var group = items.filter(function (x) { return x.kind === kind; }).sort(function (a, b) { return a.per - b.per; });
      if (!group.length) return;
      var best = group[0].per;
      out.appendChild(el("table", {}, [
        el("thead", {}, [el("tr", {}, [el("th", {}, ["Pack"]), el("th", {}, ["Unit price"]), el("th", {}, ["Compared with the cheapest"])])]),
        el("tbody", {}, group.map(function (x, i) {
          var pct = best > 0 ? Math.round(((x.per - best) / best) * 100) : 0;
          return el("tr", { class: i === 0 ? "granary-wz-best" : null }, [el("td", {}, [x.name]), el("td", {}, [cur.value + x.per.toFixed(x.per < 10 ? 2 : 0) + " " + x.label]), el("td", {}, [i === 0 ? "cheapest" : "+" + pct + " %"])]);
        })),
      ]));
    });
    out.appendChild(el("p", { class: "granary-wz-notes" }, ["The cheapest per kilo is only a saving if you use it all before it spoils or goes stale. Check \"use by\" dates and how much you really get through."]));
  }
  cur.addEventListener("input", render);
  render();
})();
