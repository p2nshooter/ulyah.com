// A stylesheet is not a module, and from TypeScript 7 on that has to be said
// out loud.
//
// `layout.tsx` pulls in fourteen stylesheets by side effect — globals, the
// component sheets, one theme per tenant — and the bundler is what turns them
// into CSS. TypeScript never had a declaration for any of them; it simply let
// a side-effect import of an unresolvable path pass. TypeScript 7 stopped
// letting it pass and reports TS2882 for each one, which is how the tailwind
// and typescript bumps both arrived red:
//
//   error TS2882: Cannot find module or type declarations for side-effect
//   import of '../globals.css'.
//
// Next ships declarations for `*.module.css` and friends (see
// next/types/global.d.ts) but not for a plain sheet, because a plain sheet
// exports nothing. This says exactly that: the path resolves, it has no
// exports worth naming, importing it is for its side effect. No CSS module is
// imported anywhere in this app, so the wildcard has nothing to shadow.
declare module "*.css";
