#!/usr/bin/env bash
# Unduh sumber Kamus LUAJA ke folder $1 (dipakai workflow kamus-luaja.yml dan saat membangun di mesin sendiri).
# Semua sumber berlisensi terbuka — lihat kepala scripts/kamus/build.py.
set -euo pipefail
dir="${1:?folder tujuan}"
mkdir -p "$dir"
get() { curl -fsSL --retry 4 --retry-delay 5 -o "$dir/$1" "$2"; echo "  $1 $(stat -c %s "$dir/$1") B"; }
K=https://kaikki.org/dictionary
for L in English German Japanese Indonesian; do get "en-$L.jsonl.gz" "$K/$L/kaikki.org-dictionary-$L.jsonl.gz" & done
get de-extract.jsonl.gz "$K/downloads/de/de-extract.jsonl.gz" &
get ja-extract.jsonl.gz "$K/downloads/ja/ja-extract.jsonl.gz" &
get id-extract.jsonl.gz "$K/downloads/id/id-extract.jsonl.gz" &
N=https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora
get omw-1.4.zip "$N/omw-1.4.zip" &
get wordnet.zip "$N/wordnet.zip" &
for n in 1 2 3 4 5; do get "jlpt-n$n.csv" "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n$n.csv" & done
wait
F=https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content
get freq-id.txt "$F/2018/id/id_50k.txt"
get freq-ja.txt "$F/2016/ja/ja_50k.txt"
get freq-de.txt "$F/2018/de/de_50k.txt"
get freq-en.txt "$F/2018/en/en_50k.txt"
