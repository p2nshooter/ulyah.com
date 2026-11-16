#!/usr/bin/env python3
"""Gabungkan batch-NN.json (teks Inggris) + id-NN.json (terjemahan Indonesia, urutan sama) ke scripts/pustaka/terjemah-id.json.
Pemakaian: python3 -I scripts/pustaka/gabung_terjemah.py <folder luaja> <folder kerja>"""
import glob
import json
import os
import sys

root, work = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
dst = os.path.join(root, 'scripts', 'pustaka', 'terjemah-id.json')
tr = json.load(open(dst, encoding='utf-8')) if os.path.exists(dst) else {}
added = 0
for f in sorted(glob.glob(os.path.join(work, 'id-*.json'))):
    n = os.path.basename(f)[3:-5]
    src = json.load(open(os.path.join(work, f'batch-{n}.json'), encoding='utf-8'))
    out = json.load(open(f, encoding='utf-8'))
    if len(src) != len(out):
        raise SystemExit(f'batch {n}: {len(src)} teks sumber tetapi {len(out)} terjemahan')
    for a, b in zip(src, out):
        if a not in tr and b.strip():
            tr[a] = b.strip()
            added += 1
json.dump(dict(sorted(tr.items())), open(dst, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(f'{added} terjemahan baru; total {len(tr)}')
