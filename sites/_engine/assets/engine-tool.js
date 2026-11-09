/* The engine's shared calculator runtime (§22 A4, §30). A tool page carries an empty
   <div id="werkzeug" data-tool="name"> above its static Markdown (the tables a reader and a crawler can use without
   JavaScript); the site's theme/assets/tools/<name>.js calls EngineTool.mount(name, make) and this file builds the
   form, remembers the last entry in the visitor's own browser, parses "1,5" and "1.5" alike and shows the result.
   make(lang) returns { title, intro, fields: [...], compute(values) }; one script serves every language of the site.
   Nothing typed is sent anywhere. */
(function () {
  "use strict";
  var doc = document;
  var lang = (doc.documentElement.lang || "en").slice(0, 2).toLowerCase();
  var locale = { de: "de-DE", es: "es-ES", fr: "fr-FR", en: "en-GB" }[lang] || "en-GB";
  var accent = (doc.querySelector('meta[name="theme-color"]') || {}).content || "#2b6cb0";

  function el(tag, attrs, kids) {
    var n = doc.createElement(tag);
    for (var k in attrs || {}) if (attrs[k] != null && attrs[k] !== false) n.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
    (kids || []).forEach(function (c) {
      if (c == null || c === false) return;
      n.appendChild(typeof c === "string" || typeof c === "number" ? doc.createTextNode(String(c)) : c);
    });
    return n;
  }
  function num(v) {
    var s = String(v == null ? "" : v).trim().replace(/\s/g, "");
    if (!s) return NaN;
    // "1.234,5" and "1,234.5" both mean one thousand two hundred and thirty-four and a half; "1,5" means one and a half.
    if (s.indexOf(",") > -1 && s.indexOf(".") > -1) s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
    else s = s.replace(",", ".");
    var n = parseFloat(s);
    return isFinite(n) ? n : NaN;
  }
  function fmt(n, digits) {
    if (!isFinite(n)) return "–";
    var d = digits == null ? (Math.abs(n) >= 100 ? 0 : 2) : digits;
    return n.toLocaleString(locale, { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function style() {
    if (doc.getElementById("engine-tool-style")) return;
    var css =
      ".engine-tool{--et-accent:" + accent + ";box-sizing:border-box;max-width:100%;border:1px solid color-mix(in srgb,currentColor 16%,transparent);border-radius:16px;padding:20px;margin:0 0 32px;background:color-mix(in srgb,var(--et-accent) 6%,transparent)}" +
      ".engine-tool__title{font-weight:700;font-size:1.15em;margin:0 0 6px}" +
      ".engine-tool__intro{margin:0 0 16px;opacity:.85}" +
      ".engine-tool__fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(170px,100%),1fr));gap:12px 16px;margin:0}" +
      ".engine-tool__group{grid-column:1/-1;margin:8px 0 0;font-weight:700;font-size:.95em}" +
      ".engine-tool__field{display:flex;flex-direction:column;gap:6px;font-size:.92em;min-width:0;overflow-wrap:anywhere}" +
      ".engine-tool__field--wide{grid-column:1/-1}" +
      ".engine-tool__field input,.engine-tool__field select{font:inherit;font-size:1rem;padding:10px 12px;border-radius:10px;border:1px solid color-mix(in srgb,currentColor 28%,transparent);background:Canvas;color:CanvasText;min-width:0;width:100%;box-sizing:border-box}" +
      ".engine-tool__field input:focus,.engine-tool__field select:focus{outline:2px solid var(--et-accent);outline-offset:1px}" +
      ".engine-tool__check{flex-direction:row;align-items:center;gap:10px}" +
      ".engine-tool__check input{width:20px;height:20px;padding:0;flex:none}" +
      ".engine-tool__out{margin-top:20px}" +
      ".engine-tool__head{font-size:1.1em;margin:0 0 12px}" +
      ".engine-tool__head strong{color:var(--et-accent);font-size:1.25em}" +
      ".engine-tool__scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}" +
      ".engine-tool table{width:100%;border-collapse:collapse;margin:8px 0 12px;font-size:.95em}" +
      ".engine-tool th,.engine-tool td{padding:8px 10px;border-bottom:1px solid color-mix(in srgb,currentColor 14%,transparent);text-align:left;vertical-align:top}" +
      ".engine-tool td.engine-tool__n,.engine-tool th.engine-tool__n{text-align:right;white-space:nowrap}" +
      ".engine-tool tr.engine-tool__best td{background:color-mix(in srgb,var(--et-accent) 12%,transparent);font-weight:600}" +
      ".engine-tool tr.engine-tool__total td{font-weight:700;border-top:2px solid color-mix(in srgb,currentColor 30%,transparent)}" +
      ".engine-tool__notes{margin:8px 0 0;padding-left:1.2em;font-size:.93em}" +
      ".engine-tool__notes li{margin:4px 0}" +
      ".engine-tool__empty{opacity:.8;font-style:italic}" +
      ".engine-tool__reset{margin-top:14px;font:inherit;font-size:.9em;background:none;border:1px solid color-mix(in srgb,currentColor 28%,transparent);border-radius:999px;padding:6px 14px;cursor:pointer;color:inherit}" +
      "@media (max-width:520px){.engine-tool{padding:16px}.engine-tool__fields{grid-template-columns:repeat(2,minmax(0,1fr))}.engine-tool__check{grid-column:1/-1}}";
    doc.head.appendChild(el("style", { id: "engine-tool-style" }, [css]));
  }

  // A result is { empty: "…" } or { head, tables: [{ cols, rows, best, total, numeric }], notes: [] }. Cells are text.
  function table(t) {
    var numeric = t.numeric || [];
    var head = el("thead", {}, [el("tr", {}, t.cols.map(function (c, i) { return el("th", { class: numeric.indexOf(i) > -1 ? "engine-tool__n" : null, scope: "col" }, [c]); }))]);
    var body = el("tbody", {}, t.rows.map(function (r, ri) {
      var cls = ri === t.best ? "engine-tool__best" : ri === t.total ? "engine-tool__total" : null;
      return el("tr", { class: cls }, r.map(function (c, i) { return el("td", { class: numeric.indexOf(i) > -1 ? "engine-tool__n" : null }, [c]); }));
    }));
    return el("div", { class: "engine-tool__scroll" }, [el("table", {}, [t.caption ? el("caption", {}, [t.caption]) : null, head, body])]);
  }

  window.EngineTool = {
    lang: lang,
    locale: locale,
    num: num,
    fmt: fmt,
    mount: function (name, make) {
      var root = doc.getElementById("werkzeug");
      if (!root || root.getAttribute("data-tool") !== name) return;
      var spec = make(lang, { fmt: fmt, num: num });
      style();
      var key = "engine-tool:" + location.hostname + ":" + name;
      var saved = {};
      try { saved = JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch (e) { saved = {}; }
      var inputs = {};
      var fields = spec.fields.map(function (f) {
        if (f.group) return el("p", { class: "engine-tool__group" }, [f.group]);
        var id = "et-" + name + "-" + f.id;
        var v = saved[f.id] != null ? saved[f.id] : f.value != null ? String(f.value) : "";
        var input;
        if (f.type === "select") {
          input = el("select", { id: id }, f.options.map(function (o) { return el("option", { value: o[0] }, [o[1]]); }));
          input.value = v || (f.options[0] || [""])[0];
          if (input.selectedIndex < 0) input.selectedIndex = 0;
        } else if (f.type === "check") {
          input = el("input", { id: id, type: "checkbox" });
          input.checked = saved[f.id] != null ? saved[f.id] === "1" : !!f.value;
        } else {
          input = el("input", { id: id, type: "text", inputmode: f.type === "text" ? null : "decimal", autocomplete: "off", placeholder: f.placeholder || null });
          input.value = v;
        }
        inputs[f.id] = input;
        var cls = "engine-tool__field" + (f.wide ? " engine-tool__field--wide" : "") + (f.type === "check" ? " engine-tool__check" : "");
        return f.type === "check" ? el("label", { class: cls, for: id }, [input, f.label]) : el("label", { class: cls, for: id }, [f.label, input]);
      });
      var out = el("div", { class: "engine-tool__out", "aria-live": "polite" });
      var reset = el("button", { type: "button", class: "engine-tool__reset" }, [spec.reset || { de: "Zurücksetzen", es: "Restablecer", fr: "Réinitialiser" }[lang] || "Reset"]);
      root.classList.add("engine-tool");
      root.appendChild(el("p", { class: "engine-tool__title" }, [spec.title]));
      if (spec.intro) root.appendChild(el("p", { class: "engine-tool__intro" }, [spec.intro]));
      root.appendChild(el("div", { class: "engine-tool__fields" }, fields));
      root.appendChild(out);
      root.appendChild(reset);
      function values() {
        var v = {}, raw = {};
        spec.fields.forEach(function (f) {
          if (f.group) return;
          var i = inputs[f.id];
          if (f.type === "check") { v[f.id] = i.checked; raw[f.id] = i.checked ? "1" : "0"; }
          else if (f.type === "select" || f.type === "text") { v[f.id] = i.value; raw[f.id] = i.value; }
          else { v[f.id] = num(i.value); raw[f.id] = i.value; }
        });
        return { v: v, raw: raw };
      }
      function render() {
        var x = values();
        try { localStorage.setItem(key, JSON.stringify(x.raw)); } catch (e) {}
        var r;
        try { r = spec.compute(x.v, inputs) || {}; } catch (e) { r = { empty: String(e && e.message || e) }; }
        while (out.firstChild) out.removeChild(out.firstChild);
        if (r.empty) { out.appendChild(el("p", { class: "engine-tool__empty" }, [r.empty])); return; }
        if (r.head) out.appendChild(el("p", { class: "engine-tool__head" }, [].concat(r.head).map(function (h) { return h && h.strong ? el("strong", {}, [h.strong]) : h; })));
        (r.tables || []).forEach(function (t) { out.appendChild(table(t)); });
        if (r.notes && r.notes.length) out.appendChild(el("ul", { class: "engine-tool__notes" }, r.notes.map(function (n) { return el("li", {}, [n]); })));
      }
      Object.keys(inputs).forEach(function (k) {
        inputs[k].addEventListener("input", render);
        inputs[k].addEventListener("change", render);
      });
      reset.addEventListener("click", function () {
        try { localStorage.removeItem(key); } catch (e) {}
        spec.fields.forEach(function (f) {
          if (f.group) return;
          var i = inputs[f.id];
          if (f.type === "check") i.checked = !!f.value;
          else if (f.type === "select") i.value = f.value != null ? String(f.value) : (f.options[0] || [""])[0];
          else i.value = f.value != null ? String(f.value) : "";
        });
        if (spec.onReset) spec.onReset(inputs);
        render();
      });
      if (spec.wire) spec.wire(inputs, render);
      render();
    },
  };
})();
