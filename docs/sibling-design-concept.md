# Sibling design concept — three distinct worlds

Owner brief (with two reference mockups): each site must be a **completely
different, premium design** — "semuanya berbeda, tidak ada kemiripan walaupun
5%". ulyah.com stays as-is ("jgn nyentuh ulyah.com"); 1fr.fr and tilawa.de each
become their own world, distinct from ulyah and from each other.

Driven by `html[data-tenant="…"]` in `apps/web/src/app/globals.css` + per-tenant
display fonts in the locale layout `<head>`. No component is duplicated.

---

## ulyah.com — WARM NATURE (unchanged baseline)
- **Mood:** warm, organic, cozy, Indonesian.
- **Palette:** warm cream `#f4efe3`, forest green `#0b3d2e` / `#06251b`, antique
  gold `#b8892b`.
- **Type:** Cinzel display + Lato body.
- **Imagery/ornament:** botanical leaves, lanterns, soft rounded cards (1rem).
- **Theme default:** system.

## 1fr.fr — FRENCH EDITORIAL (light, elegant)
- **Mood:** refined French luxury magazine — calm, spacious, architectural.
- **Palette:** pearl ivory bg `#f7f4ec` / card `#fffdf8`; ink deep green
  `#16241d`; emerald `#1f6f54`; **champagne gold `#c9a227`** as the signature
  accent. Cool, gold-forward (NOT ulyah's warm green-forward).
- **Type:** **Playfair Display / Cormorant Garamond** display serif (large,
  thin, elegant, generous line-height); **Jost** clean sans body.
- **Layout:** centred, airy, editorial. Big serif headline stacked in 2–3 short
  lines ("Le Coran. / Sa Signification. / Sa Guidance."). Marble-arch
  architectural feel via a soft light hero wash.
- **Cards:** white with a 1px champagne-gold hairline, small radius (0.5rem),
  no heavy shadow; feature grid of clean bordered tiles.
- **Buttons:** deep-green solid + gold outline secondary; pill.
- **Ornament:** thin gold rules with a centred diamond; uppercase letter-spaced
  small caps for eyebrows/nav.
- **Theme default:** LIGHT.
- **Signature:** cool pearl + gold hairline + serif = "editorial".

## tilawa.de — GERMAN MODERN TECH (dark, app-like)
- **Mood:** modern dark app / product landing — sleek, glowing, engineered.
- **Palette:** near-black navy bg `#0c0e18` / surface `#151a2e`; **electric
  violet `#7c5cff`** signature accent + secondary **amber `#d4af37`**; text
  `#eceefb`, muted `#9aa0c0`.
- **Type:** **Space Grotesk** bold geometric sans display (tight, `-0.02em`);
  Inter body. Multi-tone headline (one line in violet, e.g. "Verstehen.").
- **Layout:** left copy + right "app card" mockup feel; category grid, reciter
  avatars row. Wavy particle/gradient glow at section edges.
- **Cards:** glassy dark surface, 1px subtle border, soft violet glow on hover,
  squared (0.25rem).
- **Buttons:** violet→indigo gradient solid; squared; bold.
- **Ornament:** equalizer/waveform bars, dotted grid, gradient orbs.
- **Theme default:** DARK.
- **Signature:** dark + violet glow + geometric sans = "tech".

---

## Separation guarantees (no two alike)
| Axis | ulyah | 1fr.fr | tilawa.de |
|------|-------|--------|-----------|
| Base | warm cream (light) | cool pearl (light) | near-black (dark) |
| Accent | antique gold/green | champagne gold + emerald | electric violet + amber |
| Display font | Cinzel | Playfair/Cormorant serif | Space Grotesk sans |
| Card radius | 1rem soft | 0.5rem hairline | 0.25rem glassy |
| Ornament | botanical leaves | gold diamond rules | waveform + dotted grid |
| Buttons | rounded gold | green+gold outline | violet gradient squared |
| Mood | warm nature | editorial luxury | modern tech |

## Implementation checklist
1. Fonts: add Playfair Display (1fr) + Space Grotesk (tilawa, already) in layout `<head>` per tenant.
2. globals.css: rebuild the `[data-tenant="1fr"]` and `[data-tenant="tilawa"]`
   blocks per the specs above — base vars, fonts, cards, buttons, headers,
   badges, dividers, backgrounds/textures, scrollbars, selection.
3. Homepage hero + feature tiles pick up the tenant vars (already partly done).
4. Keep ulyah untouched.
