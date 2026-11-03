/* SAVED budget planner: take-home pay, the month's costs sorted into needs, wants and savings, what is left, and how
   much to set aside each month for a sinking fund. The 50/30/20 split is shown as a reference only — the CFPB notes
   that not everyone can follow it. Runs in your browser; your figures are remembered only by your own browser. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "budget-planner") return;
  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  };
  var num = function (i) { var v = parseFloat(String(i.value).replace(",", ".")); return isFinite(v) ? v : NaN; };
  var store = {
    get: function () { try { return JSON.parse(localStorage.getItem("saved-budget") || "null"); } catch (e) { return null; } },
    set: function (v) { try { localStorage.setItem("saved-budget", JSON.stringify(v)); } catch (e) {} },
  };
  var START = [["Rent or mortgage", "", "need"], ["Energy and water", "", "need"], ["Groceries", "", "need"], ["Transport", "", "need"], ["Phone and internet", "", "need"], ["Eating out and treats", "", "want"], ["Subscriptions", "", "want"], ["Emergency fund", "", "save"]];
  var saved = store.get() || {};
  var cur = el("input", { id: "wz-cur", type: "text", value: saved.c || "$", maxlength: "4", class: "granary-wz-short" });
  var income = el("input", { id: "wz-income", type: "text", inputmode: "decimal", value: saved.i || "", placeholder: "after tax, per month" });
  var list = el("div", { class: "granary-wz-rows" });
  var rows = [];
  root.className += " granary-wz";
  root.appendChild(el("p", { class: "granary-wz-title" }, ["Budget planner"]));
  root.appendChild(el("p", { class: "granary-wz-help" }, ["Use your take-home pay — what reaches your account after tax. Sort each cost as a need, a want or saving."]));
  root.appendChild(el("div", { class: "granary-wz-fields" }, [el("label", { for: "wz-income" }, ["Monthly take-home pay", income]), el("label", { for: "wz-cur" }, ["Currency symbol", cur])]));
  root.appendChild(el("h3", {}, ["Monthly costs"]));
  root.appendChild(list);
  function addRow(name, amount, kind) {
    var i = rows.length + 1;
    var r = {
      name: el("input", { type: "text", value: name || "", placeholder: "cost", "aria-label": "Cost " + i }),
      amount: el("input", { type: "text", inputmode: "decimal", value: amount || "", placeholder: "per month", "aria-label": "Amount of cost " + i }),
      kind: el("select", { "aria-label": "Type of cost " + i }, [el("option", { value: "need" }, ["need"]), el("option", { value: "want" }, ["want"]), el("option", { value: "save" }, ["saving"])]),
    };
    r.kind.value = kind || "need";
    [r.name, r.amount, r.kind].forEach(function (x) { x.addEventListener("input", render); x.addEventListener("change", render); });
    rows.push(r);
    list.appendChild(el("div", { class: "granary-wz-row granary-wz-row--3" }, [r.name, r.amount, r.kind]));
  }
  (saved.r || START).forEach(function (x) { addRow(x[0], x[1], x[2]); });
  var add = el("button", { type: "button", class: "granary-wz-button granary-wz-button--light" }, ["Add a cost"]);
  add.addEventListener("click", function () { addRow(); });
  root.appendChild(add);
  var out = el("div", { class: "granary-wz-result", "aria-live": "polite" });
  root.appendChild(out);

  // Sinking fund: a known future cost spread over the months until it is due.
  var goal = el("input", { id: "wz-goal", type: "text", inputmode: "decimal", value: saved.g || "", placeholder: "e.g. 600" });
  var months = el("input", { id: "wz-months", type: "text", inputmode: "numeric", value: saved.m || "", placeholder: "e.g. 10" });
  var have = el("input", { id: "wz-have", type: "text", inputmode: "decimal", value: saved.h || "", placeholder: "0" });
  var sinkOut = el("p", { class: "granary-wz-head", "aria-live": "polite" });
  root.appendChild(el("section", { class: "granary-wz-part" }, [
    el("h3", {}, ["Sinking fund"]),
    el("p", { class: "granary-wz-help" }, ["A cost you know is coming — insurance, a holiday, school shoes. Spread it over the months until it is due."]),
    el("div", { class: "granary-wz-fields" }, [el("label", { for: "wz-goal" }, ["Amount needed", goal]), el("label", { for: "wz-months" }, ["Months until due", months]), el("label", { for: "wz-have" }, ["Already put aside", have])]),
    sinkOut,
  ]));
  [income, cur, goal, months, have].forEach(function (x) { x.addEventListener("input", render); });
  var money = function (n) { return (n < 0 ? "−" : "") + cur.value + Math.abs(n).toLocaleString("en", { maximumFractionDigits: 0 }); };

  function render() {
    store.set({ c: cur.value, i: income.value, r: rows.map(function (r) { return [r.name.value, r.amount.value, r.kind.value]; }), g: goal.value, m: months.value, h: have.value });
    out.innerHTML = "";
    var inc = num(income);
    var t = { need: 0, want: 0, save: 0 };
    rows.forEach(function (r) { var a = num(r.amount); if (a > 0) t[r.kind.value] += a; });
    var spent = t.need + t.want + t.save;
    if (!(inc > 0)) { out.appendChild(el("p", { class: "granary-wz-empty" }, ["Enter your monthly take-home pay."])); }
    else {
      var left = inc - spent;
      out.appendChild(el("p", { class: "granary-wz-head" }, [left >= 0 ? "Left over each month: " : "Short each month: ", el("strong", {}, [money(Math.abs(left))])]));
      var pct = function (n) { return Math.round((n / inc) * 100) + " %"; };
      out.appendChild(el("table", {}, [
        el("thead", {}, [el("tr", {}, [el("th", {}, [""]), el("th", {}, ["Your plan"]), el("th", {}, ["Share of pay"]), el("th", {}, ["50/30/20 reference"])])]),
        el("tbody", {}, [
          el("tr", {}, [el("td", {}, ["Needs"]), el("td", {}, [money(t.need)]), el("td", {}, [pct(t.need)]), el("td", {}, [money(inc * 0.5)])]),
          el("tr", {}, [el("td", {}, ["Wants"]), el("td", {}, [money(t.want)]), el("td", {}, [pct(t.want)]), el("td", {}, [money(inc * 0.3)])]),
          el("tr", {}, [el("td", {}, ["Savings"]), el("td", {}, [money(t.save)]), el("td", {}, [pct(t.save)]), el("td", {}, [money(inc * 0.2)])]),
        ]),
      ]));
      var notes = [];
      if (left < 0) notes.push("Costs are higher than income. Start with the wants, then look at the biggest needs one by one — energy, phone and insurance are often cheaper after a comparison.");
      if (left > 0) notes.push("Give the leftover a job before the month starts: savings, a sinking fund or paying down debt.");
      if (t.need / inc > 0.6) notes.push("Needs take more than 60 % of pay. That is common where rents are high; the reference split is a rule of thumb, not a test you pass or fail.");
      if (t.save === 0) notes.push("Even a small automatic transfer to savings on payday builds a buffer over time.");
      out.appendChild(el("ul", { class: "granary-wz-notes" }, notes.map(function (n) { return el("li", {}, [n]); })));
    }
    var g = num(goal), m = Math.round(num(months)), h = num(have) || 0;
    if (g > 0 && m > 0) sinkOut.textContent = "Put aside " + money(Math.max(0, (g - h) / m)) + " a month for " + m + " month" + (m > 1 ? "s" : "") + ".";
    else sinkOut.textContent = "";
  }
  render();
})();
