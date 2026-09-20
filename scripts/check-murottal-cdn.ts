/**
 * We keep no recitation of our own.
 *
 * Owner: "hilangin audio2 alquran murottal ganti dengan cdn." The library was
 * 6,236 files per reciter across thirty-odd reciters, mirrored into R2 and
 * topped up from real listening — storage that grew with traffic, forever, for
 * audio the reciters' own CDNs already serve. It is deleted, the players fetch
 * from those CDNs, and /audio/qori2/… answers a redirect instead of bytes.
 *
 * Three things have to stay true for that to hold, and none of them shows up in
 * a build, a typecheck or a page render:
 *
 *   1. the audio route REDIRECTS. One `await streamR2Object(...)` put back on
 *      that path — the shape every other route on the file still uses — and the
 *      Worker is serving media again: egress, storage, and a bucket that fills
 *      up without anyone deciding it should.
 *   2. it redirects only where it is meant to. The location comes from the
 *      request path, so a folder that is not in the registry must 404 rather
 *      than become an open redirect.
 *   3. the web's reciter list and the Worker's source registry agree. They are
 *      two files in two packages, joined by a folder name typed into both, and
 *      the backstop url is built from the web's copy: one typo and the ONLY
 *      source for an alquran.cloud reciter 404s — silently, because the player
 *      simply moves on.
 *
 *   npx tsx scripts/check-murottal-cdn.ts
 */
import { audioRoute } from "../apps/worker-api/src/routes/audio";
import { MUROTTAL_SOURCES } from "../apps/worker-api/src/lib/murottal-sources";
import { RECITERS } from "../apps/web/src/lib/qori-cdn";

let failed = 0;
function check(what: string, ok: boolean, detail = "") {
  if (!ok) failed++;
  console.log(`  ${ok ? "ok  " : "FAIL"}  ${what}`);
  if (!ok && detail) console.log(`        ${detail}`);
}

/**
 * A Worker env whose storage EXPLODES on contact. If anything on the audio
 * path still reaches for R2, D1 or the cache, the request throws instead of
 * quietly working — which is the point: "it happened to answer 302 today" is
 * not the property being pinned, "it cannot have read our storage" is.
 */
const noStorage = new Proxy(
  {},
  {
    get(_t, prop: string) {
      throw new Error(`the murottal path touched env.${prop} — it must not read storage`);
    },
  }
) as never;

/** Hono answers synchronously on the refusal paths, so `request()` returns a
 *  Response rather than a promise there — awaiting covers both. */
async function req(path: string): Promise<Response | null> {
  try {
    return await audioRoute.request(path, undefined, noStorage);
  } catch {
    return null; // a throw refuses the request too, which is all this asserts
  }
}

async function main() {
  console.log("=== a murottal url redirects to the reciter's CDN ===");
  for (const path of ["/qori2/alafasy/002115.mp3", "/qori/alafasy/002115.mp3"]) {
    const res = await audioRoute.request(path, undefined, noStorage);
    const loc = res.headers.get("location") ?? "";
    check(`${path} answers 302`, res.status === 302, `status ${res.status}`);
    check(
      "…to a url that is not ours",
      /^https:\/\//.test(loc) && !/ulyah\.com/.test(loc),
      `location ${JSON.stringify(loc)}`
    );
    check("…and serves no bytes of its own", (await res.arrayBuffer()).byteLength === 0);
  }

  // everyayah reciters resolve by pure formula; alquran.cloud ones by global
  // ayah number. Both must come out as a real file url.
  const ey = await audioRoute.request("/qori2/ghamdi/001001.mp3", undefined, noStorage);
  check(
    "an everyayah reciter resolves too",
    ey.status === 302 && (ey.headers.get("location") ?? "").startsWith("https://everyayah.com/data/"),
    `${ey.status} ${ey.headers.get("location")}`
  );

  console.log("\n=== and nowhere else ===");
  const cases: [string, string][] = [
    ["/qori2/../../etc/passwd", "a traversal"],
    ["/qori2/evil/001001.mp3", "an unknown reciter"],
    ["/qori2/alafasy/1.mp3", "a malformed file name"],
    ["/qori2/alafasy/999001.mp3", "a surah that does not exist"],
  ];
  for (const [path, what] of cases) {
    const res = await req(path);
    check(`${what} is refused`, !res || res.status === 404, `status ${res?.status} → ${res?.headers.get("location")}`);
  }

  console.log("\n=== the web's reciters and the Worker's registry agree ===");
  // The backstop url the players build is `/audio/qori2/<r2Folder>/…`, and the
  // Worker resolves it through MUROTTAL_SOURCES[<r2Folder>]. A folder named in
  // one file and not the other is a source that 404s.
  const orphans = RECITERS.filter((r) => r.r2Folder && !MUROTTAL_SOURCES[r.r2Folder]).map(
    (r) => `${r.key} → ${r.r2Folder}`
  );
  check("every reciter's folder is a known source", orphans.length === 0, orphans.join(", "));

  // An alquran.cloud reciter with no everyayah mirror has exactly one
  // formula-resolved source: the redirect. If it is missing, the player depends
  // on a metadata fetch that can fail, which is what the redirect exists for.
  const noBackstop = RECITERS.filter((r) => r.cdn === "aqc" && !r.eyId && !r.r2Folder).map((r) => r.key);
  check(
    "no alquran.cloud reciter is left without a formula source",
    noBackstop.length === 0,
    noBackstop.join(", ")
  );

  console.log(failed === 0 ? "\nALL OK" : `\n${failed} FAILED`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
