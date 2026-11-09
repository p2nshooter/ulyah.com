// The English edition of a German or Spanish site (owner, 8–9 Nov 2026, docs/ADSENSE-BLUEPRINT.md §28–29):
// „jgn make auto translate, jadi make 2 bahasa“.
//
// The articles and pages of the edition are written by hand in content/en/. What a theme writes itself — "Saltar al
// contenido", "Startseite", "12 guías" — is translated by the site's own word list, theme/en.json:
//
//   {
//     "strings":  { "Saltar al contenido": "Skip to content", "Inicio": "Home", … },
//     "patterns": [["(\\d+) guías", "$1 guides"]],
//     "script":   { "Schließen": "Close" }          // string literals in theme/assets/palace.js
//   }
//
// A key only matches as a whole word (never inside another word), longest key first. The text of the articles
// themselves is marked by the engine (<!--engine-content--> … <!--/engine-content-->) and never touched.
import { esc } from "./markdown.mjs";

const reEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A translator for one theme word list: tr(text) → text with every known phrase in English. */
export function translator(list = {}) {
  const pairs = new Map();
  for (const [k, v] of Object.entries(list.strings || {})) {
    pairs.set(k, v);
    // Text in the HTML is escaped ("l&#39;eau", "A &amp; B"): the escaped spelling is matched too.
    if (esc(k) !== k) pairs.set(esc(k), esc(v));
  }
  const keys = [...pairs.keys()].sort((a, b) => b.length - a.length);
  const re = keys.length ? new RegExp(`(?<![\\p{L}\\p{N}])(?:${keys.map(reEscape).join("|")})(?![\\p{L}\\p{N}])`, "gu") : null;
  const patterns = (list.patterns || []).map(([p, r]) => [new RegExp(p, "gu"), r]);
  const tr = (text) => {
    let t = String(text ?? "");
    if (!t || !/\p{L}/u.test(t)) return t;
    if (re) t = t.replace(re, (m) => pairs.get(m) ?? m);
    for (const [p, r] of patterns) t = t.replace(p, r);
    return t;
  };
  return tr;
}

/** Every string in a JSON-LD object through tr(), URLs and @-keys left alone. */
export function translateJson(value, tr) {
  if (typeof value === "string") return /^https?:\/\//.test(value) ? value : tr(value);
  if (Array.isArray(value)) return value.map((v) => translateJson(v, tr));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = k.startsWith("@") || k === "url" || k === "item" ? v : translateJson(v, tr);
    return out;
  }
  return value;
}

// What may carry a theme's words inside a tag.
const ATTRS = /\b(aria-label|aria-roledescription|title|alt|placeholder|data-label|data-title)="([^"]*)"/g;

/** The theme's own words in a rendered page through tr(): text between tags and a few attributes. Scripts, styles,
 * <head> tags (already translated by head()) and the article text itself stay as they are. */
export function translateHtml(html, tr) {
  const parts = String(html).split(/(<!--engine-content-->[\s\S]*?<!--\/engine-content-->|<script\b[\s\S]*?<\/script\b[^>]*>|<style\b[\s\S]*?<\/style\b[^>]*>|<title>[\s\S]*?<\/title>|<!--[\s\S]*?-->|<[^>]+>)/);
  let out = "";
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (i % 2 === 0) out += tr(part);
    else if (/^<(meta|link|!)/i.test(part) || /^<(script|style|title)\b/i.test(part)) out += part;
    else out += part.replace(ATTRS, (_, k, v) => `${k}="${tr(v)}"`);
  }
  return out;
}

/** String literals in a theme script ("Schließen", 'Menü') replaced by the list's "script" words. */
export function translateScript(js, words = {}) {
  let out = js;
  for (const [k, v] of Object.entries(words).sort((a, b) => b[0].length - a[0].length)) {
    for (const q of ['"', "'"]) out = out.split(q + k + q).join(q + v.replace(new RegExp(reEscape(q), "g"), `\\${q}`) + q);
  }
  return out;
}

// Words that only the original language uses: one of them in an English page, outside the article text, is a theme
// word nobody translated. Chosen so that none is also an English word ("die", "a", "con" are not here).
export const FOREIGN = {
  de: "und der das nicht mit für ist eine einen einem einer auch oder zum zur bei nach über werden wird sich dem den des im vom ihr ihre dein deine unser unsere unseren mehr alle allen jetzt hier zurück weiter lesen startseite ratgeber artikel kategorie kategorien themen thema minuten lesezeit aktualisiert veröffentlicht inhalt inhalte überblick kontakt datenschutz impressum zum seite seiten schließen suchen".split(" "),
  es: "y el los las del con para por una uno que más como pero sus este esta estos estas también desde hasta sobre entre cuando según inicio guías guía temas tema minutos lectura actualizado actualizada publicado contenido índice volver siguiente anterior leer cerrar buscar página aquí todas todos nuestra nuestro".split(" "),
};

/** The text of a rendered English page outside the article text: what its theme wrote. */
export function themeText(html) {
  return String(html)
    .replace(/<!--engine-content-->[\s\S]*?<!--\/engine-content-->/g, " ")
    .replace(/<script\b[\s\S]*?<\/script\b[^>]*>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style\b[^>]*>/gi, " ")
    .replace(/<head\b[\s\S]*?<\/head>/i, " ")
    .replace(/<[^>]*\b(?:aria-label|title|alt|placeholder)="([^"]*)"[^>]*>/g, " $1 ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ");
}

/** Foreign words left in an English page's own (theme) text, with a little context each. */
export function leftovers(html, lang, allow = []) {
  const words = new Set(FOREIGN[lang] || []);
  const keep = new Set(allow.map((w) => w.toLowerCase()));
  const text = themeText(html).replace(/\s+/g, " ");
  const hits = [];
  for (const m of text.matchAll(/[\p{L}]+/gu)) {
    const w = m[0].toLowerCase();
    if (words.has(w) && !keep.has(w)) hits.push(text.slice(Math.max(0, m.index - 30), m.index + 30).trim());
  }
  return hits;
}
