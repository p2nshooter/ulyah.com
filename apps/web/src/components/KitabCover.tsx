import { coverFor } from "@/lib/book-cover";

/**
 * One kitab binding, used by every shelf card AND every work/collection
 * header, so a book looks the same wherever it appears.
 *
 * The jewel binding, foil and spine colours are derived per-slug in
 * @ulyah/shared/cover-art (the same source the share images use). This adds the
 * physical cues that make it read as a real bound kitab — raised spine, tooled
 * foil frame, stacked page edges, cloth sheen and a silk ribbon — all in CSS
 * (styles/components/kitab-cover.css), so a shelf of forty covers still
 * downloads nothing.
 */
export function KitabCover({
  slug,
  titleAr,
  title,
  meta,
  size = "shelf",
  ribbon = false,
  className = "",
}: {
  slug: string;
  /** Arabic title, foil-stamped as the main line when present. */
  titleAr?: string | null;
  /** Latin title under it. */
  title?: string | null;
  /** Small line at the foot — author, work count, anything short. */
  meta?: React.ReactNode;
  /** `shelf` = grid card, `hero` = larger header block. */
  size?: "shelf" | "hero";
  ribbon?: boolean;
  className?: string;
}) {
  const cv = coverFor(slug);
  const hero = size === "hero";

  return (
    <div
      style={
        {
          background: cv.cover,
          ["--kc-spine" as string]: cv.spine,
          ["--kc-foil" as string]: cv.foil,
        } as React.CSSProperties
      }
      className={`kitab-cover flex flex-col justify-between ${hero ? "min-h-[220px] p-6 pl-9" : "min-h-[196px] p-4 pl-7"} ${className}`}
    >
      <span aria-hidden className="kitab-cover-frame" />
      {ribbon && <span aria-hidden className="kitab-ribbon" />}

      <div>
        {titleAr && (
          <p
            dir="rtl"
            className={`font-arabic kitab-foil leading-snug ${hero ? "text-3xl" : "line-clamp-2 text-lg"}`}
          >
            {titleAr}
          </p>
        )}
        {title && (
          <p
            style={{ color: cv.ink }}
            className={`font-heading mt-1.5 leading-snug ${hero ? "text-base" : "line-clamp-2 text-sm"}`}
          >
            {title}
          </p>
        )}
      </div>

      {meta && (
        <div style={{ color: cv.foil }} className="mt-3 text-xs font-medium opacity-90">
          {meta}
        </div>
      )}
    </div>
  );
}
