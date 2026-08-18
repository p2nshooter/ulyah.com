'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LoginForm({
  /** Ke mana diarahkan setelah berhasil masuk. */
  redirectTo = '/panel',
  accent = 'quantum',
  /** `dark` untuk kartu berlatar gelap — kelas `.label` bawaan terlalu redup di sana. */
  tone = 'light',
  usernameHint = 'mis. admin.quantum'
}: {
  redirectTo?: string;
  accent?: 'quantum' | 'gold';
  tone?: 'light' | 'dark';
  usernameHint?: string;
}) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = (await res.json()) as { error?: string; user?: { role?: string } };
      if (!res.ok) throw new Error(data.error || 'Gagal masuk.');

      // Pemilik tidak punya menu operasional, jadi diantar langsung ke laporan
      // walaupun masuk lewat pintu admin — dan sebaliknya.
      const target = data.user?.role === 'bos' ? '/panel/laporan' : redirectTo;
      router.push(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk.');
      setLoading(false);
    }
  }

  const button = accent === 'gold' ? 'btn-accent w-full' : 'btn-primary w-full';
  // `.label` memakai slate-700 yang nyaris hilang di atas kartu gelap; di sana
  // warnanya ditimpa alih-alih mengandalkan varian `dark:` milik tema.
  const label = tone === 'dark' ? 'mb-1.5 block text-sm font-medium text-slate-200' : 'label';

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className={label} htmlFor="identifier">
          Nama pengguna
        </label>
        <input
          id="identifier"
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          autoComplete="username"
          className="input"
          placeholder={usernameHint}
          required
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <p className="mt-1 text-xs text-slate-400">Bisa juga memakai alamat email.</p>
      </div>
      <div>
        <label className={label} htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="input"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={loading} className={button}>
        {loading ? 'Memproses…' : 'Masuk'}
      </button>
    </form>
  );
}
