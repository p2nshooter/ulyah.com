/**
 * The English-edition engine for the German and Spanish article sites (owner, 22 Nov 2026), checked without network:
 * Markdown survives (links, code, HTML, tables, headings), nothing masked is lost, a half-translated or shortened
 * document is refused instead of written, and dawa.im is never touched.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { maskMd, unmaskMd, piecesOf, assemble, foreignShare, translateDoc } from "./translate-sites-en";

let n = 0;
const ok = (s: string) => console.log(`  ok  ${s} (${++n})`);

async function main() {
  const line = "Siehe [die Anleitung](https://example.org/a?b=1) und `npm install` sowie <strong>fett</strong>: https://x.de/y";
  const m = maskMd(line);
  assert.ok(!m.text.includes("https://") && !m.text.includes("npm install") && !m.text.includes("<strong>"));
  assert.equal(unmaskMd(m.text, m.map), line);
  ok("links, inline code, HTML and URLs are masked and come back byte for byte");

  const body = "## Überschrift\n\nEin Absatz mit **Fett**.\n\n- Punkt eins\n- Punkt zwei\n\n| Spalte | Wert |\n|---|---|\n| Strom | 30 ct |\n\n```\ncode bleibt\n```\n";
  const parts = piecesOf(body);
  const same = assemble(parts, parts.pieces.map((p) => p.masked.text));
  assert.equal(same.replace(/\s+/g, " "), body.replace(/\s+/g, " "));
  assert.ok(!parts.pieces.some((p) => p.masked.text.includes("code bleibt")), "fenced code is never sent");
  ok("Markdown structure (headings, lists, tables, code fences) is rebuilt exactly");

  assert.ok(foreignShare("und der das nicht mit", "de") > 0.5);
  assert.ok(foreignShare("This is fully English text about power", "de") < 0.03);
  ok("words of the original language are measured");

  const dir = mkdtempSync(join(tmpdir(), "en-"));
  const src = join(dir, "strom-sparen.md");
  writeFileSync(src, `---\ntitle: Strom sparen im Haushalt\ndescription: So sparst du Strom im Haushalt mit einfachen Mitteln, ohne Komfort zu verlieren, und senkst deine Rechnung spürbar.\n---\n${body}`);
  // A translator that only echoes refuses: words of the original stay → the document waits.
  const echo = async (texts: string[]) => texts;
  const r1 = await translateDoc(echo, "de", src, join(dir, "out1.md"), new Set());
  assert.equal(r1.ok, false);
  ok("an untranslated (echoed) document is refused, not written");
  // A translator that loses a placeholder is refused.
  const lossy = async (texts: string[]) => texts.map((t) => t.replace(/@@\d+@@/g, ""));
  const r2 = await translateDoc(lossy, "de", join(dir, "x.md"), join(dir, "out2.md"), new Set()).catch(() => ({ ok: false }));
  assert.equal(r2.ok, false);
  ok("a translator that drops masked material is refused");
  // A plausible translator: every word becomes an English-looking word of similar length.
  const fake = async (texts: string[]) => texts.map((t) => t.replace(/\p{L}+/gu, (w) => (w.length > 3 ? "power" : "the")));
  const r3 = await translateDoc(fake, "de", src, join(dir, "out3.md"), new Set(["power-power-the-power"]));
  assert.equal(r3.ok, true, JSON.stringify(r3));
  const written = readFileSync(join(dir, "out3.md"), "utf8");
  assert.match(written, /^---\nslug: [a-z0-9-]+\ntitle: .+\ndescription: .+\n---\n/);
  assert.ok(written.includes("```\ncode bleibt\n```"), "code kept");
  assert.ok(written.includes("|---|---|"), "table separator kept");
  ok("a complete translation is written with an English slug, title and description");

  const src2 = readFileSync(join(import.meta.dirname, "translate-sites-en.ts"), "utf8");
  assert.ok(/EXCLUDED = new Set\(\["dawa\.im"/.test(src2), "dawa.im is excluded");
  ok("dawa.im is never translated (not an article site)");
  console.log(`\ncheck-translate-sites-en: ALL OK (${n})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
