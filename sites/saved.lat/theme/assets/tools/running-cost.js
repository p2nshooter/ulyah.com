/* SAVED running-cost calculator: what an appliance costs to run, from its power rating, the hours you use it and your
   price per kWh — the same sum the U.S. Department of Energy describes (watts × hours ÷ 1,000 × price). Everything
   stays in your browser; your last entry is remembered only by your own browser. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "running-cost") return;
  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  };
  var num = function (i) { var v = parseFloat(String(i.value).replace(",", ".")); return isFinite(v) ? v : NaN; };
  var store = {
    get: function () { try { return JSON.parse(localStorage.getItem("saved-running") || "{}"); } catch (e) { return {}; } },
    set: function (v) { try { localStorage.setItem("saved-running", JSON.stringify(v)); } catch (e) {} },
  };
  // Typical ratings only as a starting point: the label or rating plate on your own appliance is what counts.
  var PRESETS = [
    ["", "Pick an example (optional) …", ""],
    ["led", "LED bulb (about 8 W)", 8, 5], ["laptop", "Laptop while charging (about 50 W)", 50, 6], ["tv", "LED TV (about 80 W)", 80, 4],
    ["fridge", "Fridge-freezer (about 40 W averaged over the day)", 40, 24], ["kettle", "Kettle (about 2,500 W)", 2500, 0.2],
    ["heater", "Electric fan heater (about 2,000 W)", 2000, 3], ["dryer", "Tumble dryer (about 2,500 W)", 2500, 1], ["router", "Wi-Fi router (about 10 W)", 10, 24],
  ];
  var s = store.get();
  var preset = el("select", { id: "wz-preset" }, PRESETS.map(function (p) { return el("option", { value: p[0] }, [p[1]]); }));
  var watts = el("input", { id: "wz-watts", type: "text", inputmode: "decimal", value: s.w || "", placeholder: "e.g. 2000" });
  var hours = el("input", { id: "wz-hours", type: "text", inputmode: "decimal", value: s.h || "", placeholder: "e.g. 3" });
  var days = el("input", { id: "wz-days", type: "text", inputmode: "numeric", value: s.d || "7", placeholder: "1–7" });
  var standby = el("input", { id: "wz-standby", type: "text", inputmode: "decimal", value: s.sb || "", placeholder: "e.g. 1 (optional)" });
  var price = el("input", { id: "wz-price", type: "text", inputmode: "decimal", value: s.p || "", placeholder: "e.g. 0.25" });
  var cur = el("input", { id: "wz-cur", type: "text", value: s.c || "$", maxlength: "4", class: "granary-wz-short" });
  var out = el("div", { class: "granary-wz-result", "aria-live": "polite" });
  root.className += " granary-wz";
  root.appendChild(el("p", { class: "granary-wz-title" }, ["Running-cost calculator"]));
  root.appendChild(el("p", { class: "granary-wz-help" }, ["Find the power in watts (W) on the appliance's label or rating plate, and your price per kWh on your electricity bill."]));
  root.appendChild(el("div", { class: "granary-wz-fields" }, [
    el("label", { for: "wz-preset", class: "granary-wz-wide" }, ["Example appliance", preset]),
    el("label", { for: "wz-watts" }, ["Power when on (watts)", watts]),
    el("label", { for: "wz-hours" }, ["Hours on per day", hours]),
    el("label", { for: "wz-days" }, ["Days used per week", days]),
    el("label", { for: "wz-standby" }, ["Standby power (watts)", standby]),
    el("label", { for: "wz-price" }, ["Price per kWh", price]),
    el("label", { for: "wz-cur" }, ["Currency symbol", cur]),
  ]));
  root.appendChild(out);
  var money = function (n) { return cur.value + (n < 10 ? n.toFixed(2) : n.toLocaleString("en", { maximumFractionDigits: 0 })); };
  function render() {
    out.innerHTML = "";
    var w = num(watts), h = num(hours), d = Math.min(7, Math.max(0, num(days) || 0)), sb = num(standby) || 0, p = num(price);
    store.set({ w: watts.value, h: hours.value, d: days.value, sb: standby.value, p: price.value, c: cur.value });
    if (!(w >= 0) || !(h >= 0) || h > 24 || !(p > 0)) { out.appendChild(el("p", { class: "granary-wz-empty" }, ["Enter the watts, the hours per day and your price per kWh."])); return; }
    // Hours on through the year, and the rest of the year on standby.
    var onHours = h * d * 52.14, offHours = sb ? 8760 - onHours : 0;
    var kwh = (w * onHours + sb * Math.max(0, offHours)) / 1000;
    var year = kwh * p;
    out.appendChild(el("p", { class: "granary-wz-head" }, ["About ", el("strong", {}, [money(year) + " a year"]), " (" + kwh.toLocaleString("en", { maximumFractionDigits: 0 }) + " kWh)"]));
    out.appendChild(el("table", {}, [
      el("thead", {}, [el("tr", {}, [el("th", {}, ["Per day used"]), el("th", {}, ["Per month"]), el("th", {}, ["Per year"])])]),
      el("tbody", {}, [el("tr", {}, [el("td", {}, [money((w * h / 1000) * p)]), el("td", {}, [money(year / 12)]), el("td", {}, [money(year)])])]),
    ]));
    var notes = [];
    if (sb > 0) notes.push("Standby alone: " + money((sb * Math.max(0, offHours) / 1000) * p) + " a year. Switching off at the wall stops it.");
    if (w >= 1500) notes.push("High-power appliances cost most per hour: the time you run them matters more than anything else.");
    if (w > 0 && w <= 15) notes.push("Low-power devices cost little each; dozens of them left on all day still add up.");
    notes.push("Appliances with a thermostat or motor (fridges, heaters, dryers) do not draw their full rating all the time, so their real cost is usually lower than this estimate.");
    out.appendChild(el("ul", { class: "granary-wz-notes" }, notes.map(function (n) { return el("li", {}, [n]); })));
  }
  preset.addEventListener("change", function () {
    var p = PRESETS.filter(function (x) { return x[0] === preset.value; })[0];
    if (p && p[0]) { watts.value = String(p[2]); hours.value = String(p[3]); render(); }
  });
  [watts, hours, days, standby, price, cur].forEach(function (i) { i.addEventListener("input", render); });
  render();
})();
