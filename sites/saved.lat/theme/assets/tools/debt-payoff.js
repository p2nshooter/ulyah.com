/* SAVED debt payoff calculator: how long a balance takes to clear at a fixed monthly payment, and how much interest
   that costs, month by month at the APR divided by 12. A card that charges interest daily ends up slightly different;
   your statement shows the exact figures. Runs in your browser; nothing is sent. */
(function () {
  "use strict";
  var root = document.getElementById("werkzeug");
  if (!root || root.getAttribute("data-tool") !== "debt-payoff") return;
  var el = function (tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { n.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return n;
  };
  var num = function (i) { var v = parseFloat(String(i.value).replace(",", ".")); return isFinite(v) ? v : NaN; };
  var balance = el("input", { id: "wz-balance", type: "text", inputmode: "decimal", placeholder: "e.g. 3000" });
  var apr = el("input", { id: "wz-apr", type: "text", inputmode: "decimal", placeholder: "e.g. 24" });
  var pay = el("input", { id: "wz-pay", type: "text", inputmode: "decimal", placeholder: "e.g. 150" });
  var cur = el("input", { id: "wz-cur", type: "text", value: "$", maxlength: "4", class: "granary-wz-short" });
  var out = el("div", { class: "granary-wz-result", "aria-live": "polite" });
  root.className += " granary-wz";
  root.appendChild(el("p", { class: "granary-wz-title" }, ["Debt payoff calculator"]));
  root.appendChild(el("p", { class: "granary-wz-help" }, ["The balance and the APR (annual percentage rate) are on your statement. Try a few monthly payments to see how much a little more saves."]));
  root.appendChild(el("div", { class: "granary-wz-fields" }, [
    el("label", { for: "wz-balance" }, ["Balance owed", balance]), el("label", { for: "wz-apr" }, ["APR (%)", apr]),
    el("label", { for: "wz-pay" }, ["Monthly payment", pay]), el("label", { for: "wz-cur" }, ["Currency symbol", cur]),
  ]));
  root.appendChild(out);
  var money = function (n) { return cur.value + n.toLocaleString("en", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); };
  function simulate(b, r, p) {
    var months = 0, interest = 0;
    while (b > 0.005 && months < 1200) {
      var i = b * r; interest += i; b = b + i - p; months++;
      if (months === 1 && p <= i) return null; // the payment does not even cover the interest
    }
    return months >= 1200 ? null : { months: months, interest: interest };
  }
  var span = function (m) { var y = Math.floor(m / 12), mo = m % 12; return (y ? y + " year" + (y > 1 ? "s" : "") : "") + (y && mo ? " " : "") + (mo ? mo + " month" + (mo > 1 ? "s" : "") : ""); };
  function render() {
    out.innerHTML = "";
    var b = num(balance), a = num(apr), p = num(pay);
    if (!(b > 0) || !(a >= 0) || !(p > 0)) { out.appendChild(el("p", { class: "granary-wz-empty" }, ["Enter the balance, the APR and a monthly payment."])); return; }
    var r = a / 100 / 12;
    var res = simulate(b, r, p);
    if (!res) {
      out.appendChild(el("p", { class: "granary-wz-head" }, ["At this payment the balance never clears: the monthly interest is about " + money(b * r) + "."]));
      out.appendChild(el("p", {}, ["Pay more than the interest each month, or talk to the lender or a free debt-advice service about your options."]));
      return;
    }
    out.appendChild(el("p", { class: "granary-wz-head" }, ["Paid off in ", el("strong", {}, [span(res.months)]), ", with about ", el("strong", {}, [money(res.interest)]), " in interest."]));
    var rows = [p, p * 1.25, p * 1.5, p * 2].map(function (x) { return [x, simulate(b, r, x)]; });
    out.appendChild(el("table", {}, [
      el("thead", {}, [el("tr", {}, [el("th", {}, ["Monthly payment"]), el("th", {}, ["Time to clear"]), el("th", {}, ["Total interest"])])]),
      el("tbody", {}, rows.map(function (x, i) { return el("tr", { class: i === 0 ? "granary-wz-best" : null }, [el("td", {}, [money(x[0])]), el("td", {}, [x[1] ? span(x[1].months) : "—"]), el("td", {}, [x[1] ? money(x[1].interest) : "—"])]); })),
    ]));
    out.appendChild(el("p", { class: "granary-wz-notes" }, ["This assumes no new spending on the account and a fixed rate. Fees, promotional rates and daily interest change the exact figures."]));
  }
  [balance, apr, pay, cur].forEach(function (x) { x.addEventListener("input", render); });
  render();
})();
