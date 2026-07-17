/**
 * Renders one real PDF per (episode, language) from scripts/content/kisah-yusuf.ts
 * into packages/db-schema/seed/assets/kisah-nabi-yusuf/<lang>/<slug>.pdf — the
 * exact r2_key paths referenced by packages/db-schema/seed/kisah_yusuf.sql.
 *
 * These are committed to the repo as real seed assets; .github/workflows/deploy.yml
 * uploads them to R2 on deploy (`wrangler r2 object put`) so the `ebooks`/`stories`
 * rows this script's sibling (generate-kisah-yusuf-seed.ts) inserts always resolve
 * to an actual downloadable file, never a dangling reference.
 *
 * Run: npx tsx scripts/generate-kisah-yusuf-pdfs.ts
 */
import { createWriteStream, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";
import { KISAH_YUSUF_SERIES } from "./content/kisah-yusuf.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const outRoot = join(repoRoot, "packages", "db-schema", "seed", "assets", "kisah-nabi-yusuf");

function renderPdf(filePath: string, title: string, subtitle: string, body: string, footer: string) {
  return new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A5", margin: 54 });
    const stream = createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(9).fillColor("#B8892B").text("ULYAH.COM — Kisah Nabi Yusuf AS", { align: "center" });
    doc.moveDown(1.2);
    doc.fontSize(18).fillColor("#0B3D2E").text(title, { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor("#5A5A5A").text(subtitle, { align: "center" });
    doc.moveDown(1.5);

    doc.fontSize(11).fillColor("#232323");
    for (const paragraph of body.split("\n\n")) {
      doc.text(paragraph.trim(), { align: "justify", lineGap: 4 });
      doc.moveDown(0.8);
    }

    doc.moveDown(1);
    doc.fontSize(8).fillColor("#5A5A5A").text(footer, { align: "center" });

    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });
}

async function main() {
  let count = 0;
  for (const ep of KISAH_YUSUF_SERIES) {
    for (const lang of ["id", "en"] as const) {
      const content = ep[lang];
      const dir = join(outRoot, lang);
      mkdirSync(dir, { recursive: true });
      const filePath = join(dir, `${ep.slug}.pdf`);
      const subtitle =
        lang === "id"
          ? `Berdasarkan QS. Yusuf (12) : ${ep.ayahStart}-${ep.ayahEnd}`
          : `Based on Qur'an, Surah Yusuf (12) : ${ep.ayahStart}-${ep.ayahEnd}`;
      const footer =
        lang === "id"
          ? "Sumber teks: quran-json (CC-BY-4.0). Ditulis oleh Tim Editorial ULYAH sebagai parafrasa ayat, tanpa penambahan klaim di luar teks Al-Qur'an."
          : "Source text: quran-json (CC-BY-4.0). Written by the ULYAH editorial team as a paraphrase of the ayat, with no claims added beyond the Qur'anic text.";
      await renderPdf(filePath, content.title, subtitle, content.body, footer);
      count++;
    }
  }
  console.log(`Rendered ${count} PDF files under ${outRoot}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
