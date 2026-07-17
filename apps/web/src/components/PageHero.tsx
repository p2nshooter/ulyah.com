/**
 * Consistent premium page-header treatment — eyebrow flourish, heading,
 * subtitle, gold underline accent. Replaces the ad-hoc "bare h1 + p" pattern
 * that made listing pages (kitab, audiobook, ...) feel unfinished.
 */
export function PageHero({
  icon,
  title,
  subtitle,
}: {
  icon?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      {icon && (
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-accent/30 bg-accent/10 text-2xl shadow-[var(--shadow-gold)]">
          {icon}
        </div>
      )}
      <h1 className="font-heading text-3xl sm:text-4xl">{title}</h1>
      <div aria-hidden className="mx-auto mt-3 h-px w-16 bg-gradient-to-r from-transparent via-accent to-transparent" />
      {subtitle && (
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[var(--color-text-secondary)]">{subtitle}</p>
      )}
    </div>
  );
}
