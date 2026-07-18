# Global CSS architecture — one design system, four visual identities

Modular structure (owner brief "Arsitektur CSS Global"): every site is built
from the same components and the same design-token contract (CSS variables),
but each domain wears a completely different visual identity.

```
src/styles/
├── core/
│   └── animations.css      shared entrance/hover/motion (GPU: transform+opacity only)
├── components/
│   ├── mushaf.css          Mushaf Utsmani page frame + page-flip
│   ├── kids.css            children's animated-story scenes
│   ├── sanad.css           isnad chain tree animation
│   └── ornaments.css       Islamic pattern lattice, section divider, app-hero panel
└── themes/                 one file per website — loaded last so tokens win
    ├── ulyah.css           ulyah.com   — Modern Islamic Premium (emerald + gold)
    ├── france.css          1fr.fr      — French Editorial Luxury (ivory + champagne)
    ├── germany.css         tilawa.de   — German Modern Tech (navy + electric violet)
    └── spain.css           dawa.es     — Spanish Warm Mediterranean (terracotta + olive)
```

- `app/globals.css` holds Tailwind + the design-token contract (`--color-*`,
  `--panel-*`, `--radius-card`, `--shadow-*`) with ulyah's values as default.
- Each theme file scopes EVERYTHING under `html[data-tenant="…"]` — the tenant
  attribute is set at build time in `app/[locale]/layout.tsx`, so a theme can
  never leak across sites.
- Dark mode: every site has its own dark palette (`[data-theme="dark"]`
  inside its theme file); the default theme per site is set pre-paint in the
  layout script (ulyah = system, 1fr = light, tilawa = dark, dawa = light).
- Components read tokens only — adding a fifth site is: one theme file, one
  tenant entry, one fonts line in the layout.

Import order (root layout): globals → core → components → themes.
