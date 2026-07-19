// /ads.txt — required by Google AdSense on EVERY domain that serves its ads
// (owner: "masing2 domain belum di bikinin ads.txt"). One publisher account
// covers all four sites, so the same line ships on each domain.
export const dynamic = "force-static";

export function GET() {
  return new Response("google.com, pub-6371903555702163, DIRECT, f08c47fec0942fa0\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
