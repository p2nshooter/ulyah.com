/** HTML aman: setiap nilai yang disisipkan di-escape kecuali dibungkus raw(). */

export class Raw {
  constructor(readonly s: string) {}
  toString(): string {
    return this.s;
  }
}

export const raw = (s: string): Raw => new Raw(s);

export function esc(v: unknown): string {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function piece(v: unknown): string {
  if (v === null || v === undefined || v === false) return '';
  if (v instanceof Raw) return v.s;
  if (Array.isArray(v)) return v.map(piece).join('');
  return esc(v);
}

export function html(strings: TemplateStringsArray, ...vals: unknown[]): Raw {
  let out = strings[0] ?? '';
  for (let i = 0; i < vals.length; i += 1) out += piece(vals[i]) + (strings[i + 1] ?? '');
  return new Raw(out);
}

/** JSON yang aman ditanam di <script type="application/json">. */
export function jsonScript(id: string, value: unknown): Raw {
  const s = JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  return raw(`<script type="application/json" id="${esc(id)}">${s}</script>`);
}
