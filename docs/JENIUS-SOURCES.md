# jenius.es — Katalog sumber bacaan terbuka

Pemilik, 8 Nov 2026: „cari referensi artikel minimal 500 sumber github … Klasifikasikan kategorinya … TK, SD, SMP, sma, mahasiswa, s1, s2,
s3 DR, PROFESOR, profesional sampai umum, termasuk buku pembelajaran bahasa asing … Catat semua ratusan referensi github & web
sumber2 terbuka yg mengizinkan bukunya bisa di serap, klasifikasin … jadikan blueprint agar lu ga lupa“.

Pasangan dokumen ini: `docs/JENIUS-BLUEPRINT.md`. Daftar repositori Bagian B ditarik dari GitHub (pencarian API, 8 Nov 2026).

## Aturan lisensi (berlaku untuk setiap judul, dicek otomatis saat impor)

- **Dipakai:** domain publik, CC0, CC BY, CC BY-SA (turunan seperti audio ikut CC BY-SA). **Ditolak:** NC (situs memuat iklan),
  ND (audio adalah karya turunan), lisensi tidak jelas. Satu platform bisa berisi lisensi campuran → dicek **per buku**.
- **Domain publik Indonesia:** hak cipta berlaku seumur hidup penulis + 70 tahun. Karya „domain publik di AS“ (Gutenberg, Standard
  Ebooks) hanya tayang bila penulisnya wafat ≥ 70 tahun lalu; pipeline impor memeriksa tahun wafat penulis.
- Setiap buku menyimpan: judul, penulis, ilustrator, penerjemah, URL sumber, lisensi, tanggal impor, perubahan yang dibuat;
  **atribusi tampil di halaman buku**. Tidak ada buku tayang tanpa persetujuan admin (antrean persetujuan).

## Jenjang pembaca

TK · SD · SMP · SMA · Mahasiswa/S1 · S2 · S3/Dr · Profesor · Profesional · Umum · **Bahasa asing** (lintas jenjang). Satu buku boleh
punya beberapa jenjang; jenjang akhir ditetapkan saat impor (klasifikasi otomatis Haiku + koreksi admin), bukan dari tabel ini saja.

## Bagian A — 39 platform dan koleksi

| No | Sumber | Jenjang | Bahasa | Lisensi | Cara ambil | Catatan |
|---|---|---|---|---|---|---|
| 1 | Book Dash (`github.com/bookdash`) | TK · SD | en + bahasa Afrika | CC BY 4.0 | repo sumber + ePub | buku bergambar; alur markdown→HTML siap impor |
| 2 | StoryWeaver (Pratham Books) | TK · SD | ratusan bahasa termasuk **Indonesia**, Inggris | sebagian besar CC BY 4.0 | unduhan ePub/PDF per buku | cek lisensi per buku; atribusi penulis/ilustrator/penerjemah |
| 3 | Let's Read (The Asia Foundation) | TK · SD | **Indonesia**, Inggris, bahasa Asia | per buku (CC BY 4.0 dipakai; NC dibuang) | unduhan per buku | banyak judul berbahasa Indonesia |
| 4 | African Storybook | TK · SD · Bahasa asing | Inggris + puluhan bahasa (teks paralel) | CC BY 4.0 (NC dibuang) | unduhan per buku | cocok untuk belajar bahasa asing (teks paralel) |
| 5 | Bloom Library (SIL) | TK · SD · Bahasa asing | ribuan bahasa termasuk **Indonesia** dan bahasa daerah | per buku (CC BY / CC BY-SA dipakai) | unduhan BloomPUB/ePub | buku daerah Indonesia; cek lisensi per buku |
| 6 | Global Storybooks | TK · SD · Bahasa asing | 50+ bahasa (teks paralel + audio) | CC BY 4.0 | unduhan per cerita | cerita sama dalam banyak bahasa → belajar bahasa asing |
| 7 | Global Digital Library | TK · SD | banyak bahasa | per buku | API/unduhan bila masih tersedia | status layanan dicek saat impor |
| 8 | Wikibooks — Wikijunior | SD · SMP | Inggris | CC BY-SA 4.0 | API MediaWiki | nonfiksi anak; turunan (audio) ikut CC BY-SA |
| 9 | Wikibooks — kursus bahasa | Bahasa asing (semua jenjang) | Inggris, Arab, Jepang, Mandarin, Spanyol, Jerman, Prancis, Indonesia | CC BY-SA 4.0 | API MediaWiki | buku pelajaran bahasa asing |
| 10 | Tatoeba | Bahasa asing | 400+ bahasa (kalimat contoh + terjemahan) | CC BY 2.0 FR | unduhan dump | latihan kalimat dua bahasa, dengan atribusi |
| 11 | Project Gutenberg / GITenberg (`github.com/GITenberg`, ±74.000 repo) | SD s.d. Profesor · Umum | 60+ bahasa termasuk Melayu/Indonesia lama | domain publik (AS) | teks/ePub; repo GitHub per buku | hapus merek PG bila bukan eBook PG; cek domain publik Indonesia (penulis wafat ≥70 tahun) |
| 12 | Standard Ebooks (`github.com/standardebooks`, ±1.500 repo) | SD s.d. Profesor · Umum | Inggris | CC0 1.0 (teks domain publik) | repo GitHub per buku (ePub sumber) | tata letak & ejaan sudah dirapikan; daftar per judul di Bagian B |
| 13 | Wikisource (id/en) | SMP s.d. Profesor · Umum | **Indonesia**, Inggris | domain publik | API MediaWiki | teks klasik Indonesia dan dunia |
| 14 | LibriVox | Semua jenjang | 30+ bahasa (audio) | domain publik | MP3 per bab | **suara manusia** untuk buku domain publik — pelengkap suara sintetis |
| 15 | OpenStax (`github.com/openstax`) | SMA · Mahasiswa/S1 · Profesional | Inggris (+ sebagian Spanyol/Polandia) | CC BY 4.0 (beberapa judul CC BY-NC-SA → dibuang) | repo `osbooks-*` (CNXML/XHTML) | buku teks kuliah tingkat awal; daftar di Bagian B |
| 16 | Siyavula | SD · SMP · SMA | Inggris (+ Afrikaans) | CC BY 4.0 | unduhan PDF/HTML | matematika & sains sekolah ("Everything Maths/Science") |
| 17 | Open Textbook Library (Univ. Minnesota) | Mahasiswa/S1 | Inggris | per buku (CC BY/CC BY-SA dipakai) | unduhan per buku | buku teks universitas |
| 18 | BCcampus OpenEd | Mahasiswa/S1 · Profesional | Inggris | per buku (umumnya CC BY 4.0) | Pressbooks/unduhan |  |
| 19 | Saylor Academy | Mahasiswa/S1 · Profesional | Inggris | CC BY 3.0/4.0 | unduhan per buku | kursus + buku |
| 20 | Lumen Learning (OER) | SMA · Mahasiswa/S1 | Inggris | per kursus (CC BY dipakai) | unduhan/Common Cartridge |  |
| 21 | Directory of Open Access Books (DOAB) | S2 · S3/Dr · Profesor | banyak bahasa termasuk Indonesia | per buku (CC BY/CC BY-SA dipakai) | OAI-PMH/API | ±80.000 monografi akademik |
| 22 | OAPEN Library | S2 · S3/Dr · Profesor | banyak bahasa | per buku (CC BY dipakai) | OAI-PMH/REST | monografi ilmiah |
| 23 | Open Book Publishers | S1 · S2 · S3/Dr · Profesor | Inggris | CC BY 4.0 | unduhan per buku | humaniora & sains |
| 24 | Language Science Press | S2 · S3/Dr · Profesor · Bahasa asing | Inggris (linguistik) | CC BY 4.0 | unduhan per buku; sumber LaTeX di GitHub | linguistik & pengajaran bahasa |
| 25 | Ubiquity Press (buku) | S2 · S3/Dr · Profesor | Inggris | CC BY 4.0 | unduhan per buku |  |
| 26 | arXiv (subset CC BY / CC0) | S2 · S3/Dr · Profesor | Inggris | hanya makalah berlisensi CC BY/CC BY-SA/CC0 | API arXiv | lisensi per makalah |
| 27 | PubMed Central Open Access (subset komersial) | S2 · S3/Dr · Profesor · Profesional | Inggris | CC BY / CC0 (subset komersial) | FTP/OA Web Service | kesehatan & biologi |
| 28 | The Turing Way (`github.com/the-turing-way`) | S2 · S3/Dr · Profesional | Inggris | CC BY 4.0 | repo GitHub | panduan riset & sains data yang dapat direproduksi |
| 29 | Software Carpentry & Data Carpentry (`github.com/swcarpentry`, `datacarpentry`) | Mahasiswa/S1 · S2 · Profesional | Inggris (+ terjemahan) | CC BY 4.0 | repo GitHub per pelajaran | pemrograman & data untuk peneliti |
| 30 | MDN Web Docs (`github.com/mdn/content`) | Profesional · Mahasiswa/S1 | Inggris (+ terjemahan) | CC BY-SA 2.5 | repo GitHub | pengembangan web |
| 31 | Microsoft Learn docs (`github.com/MicrosoftDocs`) | Profesional | Inggris (+ banyak bahasa) | CC BY 4.0 (per repo, dicek) | repo GitHub | teknologi & cloud |
| 32 | freeCodeCamp (konten kurikulum) | SMA · Mahasiswa/S1 · Profesional | Inggris (+ banyak bahasa) | konten CC BY-SA 4.0 | repo GitHub | pemrograman |
| 33 | Open Logic Project | Mahasiswa/S1 · S2 | Inggris | CC BY 4.0 | repo GitHub | logika |
| 34 | GitLab Handbook | Profesional | Inggris | CC BY-SA 4.0 | repo GitLab | manajemen & kerja jarak jauh |
| 35 | Wikipedia/Wikiversity (ringkasan & rujukan) | Umum · semua jenjang | Indonesia, Inggris | CC BY-SA 4.0 | API MediaWiki | bahan latar, bukan buku utama |
| 36 | UNESCO Open Access Publications | S1 · S2 · Profesional · Umum | banyak bahasa | per terbitan (CC BY-SA 3.0 IGO dipakai) | unduhan per judul | pendidikan, literasi, kebijakan |
| 37 | OECD iLibrary (judul akses terbuka) | S2 · Profesional | Inggris, Prancis | per judul | unduhan | hanya judul berlisensi terbuka |
| 38 | Kemendikbudristek — Buku Teks (SIBI) | SD · SMP · SMA | **Indonesia** | per buku — **wajib diverifikasi** (izin komersial & turunan) | unduhan PDF | dipakai hanya bila lisensinya mengizinkan situs beriklan dan karya turunan (audio) |
| 39 | Garuda / jurnal Indonesia (DOAJ, CC BY) | S1 · S2 · S3/Dr | **Indonesia** | hanya artikel CC BY / CC BY-SA | OAI-PMH | bacaan ilmiah berbahasa Indonesia |

## Bagian B — 752 repositori GitHub (satu repositori = satu buku/kitab teks)

Jenjang di sini adalah **perkiraan awal** dari penulis/judul; jenjang final diputuskan saat impor.

### B.1 Standard Ebooks — 697 judul (CC0; cek domain publik Indonesia per penulis)

#### Cerita anak klasik — SD · SMP (36)

| No | Judul, penulis | Repositori |
|---|---|---|
| 1 | A Tangled Tale, by Lewis Carroll | https://github.com/standardebooks/lewis-carroll_a-tangled-tale |
| 2 | Alice's Adventures in Wonderland, by Lewis Carroll. Illustrated by John Tenniel | https://github.com/standardebooks/lewis-carroll_alices-adventures-in-wonderland_john-tenniel |
| 3 | Anne of Avonlea, by L. M. Montgomery | https://github.com/standardebooks/l-m-montgomery_anne-of-avonlea |
| 4 | Anne of Green Gables, by L. M. Montgomery | https://github.com/standardebooks/l-m-montgomery_anne-of-green-gables |
| 5 | Anne of the Island, by L. M. Montgomery | https://github.com/standardebooks/l-m-montgomery_anne-of-the-island |
| 6 | At the Back of the North Wind, by George MacDonald | https://github.com/standardebooks/george-macdonald_at-the-back-of-the-north-wind |
| 7 | Beautiful Stories from Shakespeare, by E. Nesbit | https://github.com/standardebooks/e-nesbit_beautiful-stories-from-shakespeare |
| 8 | Behind a Mask, by Louisa May Alcott | https://github.com/standardebooks/louisa-may-alcott_behind-a-mask |
| 9 | Emily of New Moon, by L. M. Montgomery | https://github.com/standardebooks/l-m-montgomery_emily-of-new-moon |
| 10 | Five Children and It, by E. Nesbit | https://github.com/standardebooks/e-nesbit_five-children-and-it |
| 11 | Freckles, by Gene Stratton-Porter | https://github.com/standardebooks/gene-stratton-porter_freckles |
| 12 | Green Forest Stories, by Thornton W. Burgess | https://github.com/standardebooks/thornton-w-burgess_green-forest-stories |
| 13 | Green Meadow Stories, by Thornton W. Burgess | https://github.com/standardebooks/thornton-w-burgess_green-meadow-stories |
| 14 | Harding’s Luck, by E. Nesbit | https://github.com/standardebooks/e-nesbit_hardings-luck |
| 15 | Hypatia, by Charles Kingsley | https://github.com/standardebooks/charles-kingsley_hypatia |
| 16 | Lilith: A Romance, by George MacDonald | https://github.com/standardebooks/george-macdonald_lilith |
| 17 | Little Lord Fauntleroy, by Francis Hodgson Burnett | https://github.com/standardebooks/frances-hodgson-burnett_little-lord-fauntleroy |
| 18 | Little Women, by Louisa May Alcott | https://github.com/standardebooks/louisa-may-alcott_little-women |
| 19 | Nonsense Books, by Edward Lear | https://github.com/standardebooks/edward-lear_nonsense-books |
| 20 | Ozma of Oz, by L. Frank Baum | https://github.com/standardebooks/l-frank-baum_ozma-of-oz |
| 21 | Phantastes, by George Macdonald | https://github.com/standardebooks/george-macdonald_phantastes |
| 22 | Poetry, by George MacDonald | https://github.com/standardebooks/george-macdonald_poetry |
| 23 | Pollyanna, by Eleanor H. Porter | https://github.com/standardebooks/eleanor-h-porter_pollyanna |
| 24 | Short Fiction, by George MacDonald | https://github.com/standardebooks/george-macdonald_short-fiction |
| 25 | The Adventurous Simplicissimus, by Hans Jakob Christoffel von Grimmelshausen. Translated by Alfred Thomas Scrope Goodrick | https://github.com/standardebooks/hans-jakob-christoffel-von-grimmelshausen_the-adventurous-simplicissimus_alfred-thomas-scrope-goodri |
| 26 | The Blue Castle, by L. M. Montgomery | https://github.com/standardebooks/l-m-montgomery_the-blue-castle |
| 27 | The Little White Bird, by J. M. Barrie | https://github.com/standardebooks/j-m-barrie_the-little-white-bird |
| 28 | The Phoenix and the Carpet, by E. Nesbit | https://github.com/standardebooks/e-nesbit_the-phoenix-and-the-carpet |
| 29 | The Portent, by George MacDonald | https://github.com/standardebooks/george-macdonald_the-portent |
| 30 | The Princess and Curdie, by George MacDonald | https://github.com/standardebooks/george-macdonald_the-princess-and-curdie |
| 31 | The Railway Children | https://github.com/standardebooks/e-nesbit_the-railway-children |
| 32 | The Story of the Amulet, by E. Nesbit | https://github.com/standardebooks/e-nesbit_the-story-of-the-amulet |
| 33 | The Story of the Treasure Seekers, by E. Nesbit | https://github.com/standardebooks/e-nesbit_the-story-of-the-treasure-seekers |
| 34 | The Wonderful Wizard of Oz, by L. Frank Baum | https://github.com/standardebooks/l-frank-baum_the-wonderful-wizard-of-oz |
| 35 | Through the Looking-Glass, by Lewis Carroll. Illustrated by John Tenniel | https://github.com/standardebooks/lewis-carroll_through-the-looking-glass_john-tenniel |
| 36 | Wet Magic, by E. Nesbit | https://github.com/standardebooks/e-nesbit_wet-magic |

#### Filsafat, sejarah, ilmu sosial, karya klasik — Mahasiswa/S1 · S2 · S3/Dr · Profesor (47)

| No | Judul, penulis | Repositori |
|---|---|---|
| 37 | A Treatise of Human Nature, by David Hume | https://github.com/standardebooks/david-hume_a-treatise-of-human-nature |
| 38 | A Week on the Concord and Merrimack Rivers, by Henry David Thoreau | https://github.com/standardebooks/henry-david-thoreau_a-week-on-the-concord-and-merrimack-rivers |
| 39 | Ajax, by Sophocles. Translated by Francis Storr | https://github.com/standardebooks/sophocles_ajax_francis-storr |
| 40 | Analects, by Confucius. Translated by James Legge | https://github.com/standardebooks/confucius_analects_james-legge |
| 41 | Antigone, by Sophocles. Translated by Francis Storr | https://github.com/standardebooks/sophocles_antigone_francis-storr |
| 42 | Beyond Good and Evil, by Friedrich Nietzsche. Translated by Helen Zimmern | https://github.com/standardebooks/friedrich-nietzsche_beyond-good-and-evil_helen-zimmern |
| 43 | Dark Princess, by W. E. B. Du Bois | https://github.com/standardebooks/w-e-b-du-bois_dark-princess |
| 44 | Democracy and Education, by John Dewey | https://github.com/standardebooks/john-dewey_democracy-and-education |
| 45 | Dialogues, by Plato. Translated by Benjamin Jowett | https://github.com/standardebooks/plato_dialogues_benjamin-jowett |
| 46 | Dialogues, by Seneca. Translated by Aubrey Stewart | https://github.com/standardebooks/seneca_dialogues_aubrey-stewart |
| 47 | Discourses, by Epictetus. Translated by George Long | https://github.com/standardebooks/epictetus_discourses_george-long |
| 48 | Essays, by Henry David Thoreau | https://github.com/standardebooks/henry-david-thoreau_essays |
| 49 | Essays, by Ralph Waldo Emerson | https://github.com/standardebooks/ralph-waldo-emerson_essays |
| 50 | Essays, by Thomas Paine | https://github.com/standardebooks/thomas-paine_essays |
| 51 | History of the Peloponnesian War, by Thucydides. Translated by Richard Crawley | https://github.com/standardebooks/thucydides_history-of-the-peloponnesian-war_richard-crawley |
| 52 | Metamorphoses, by Ovid. Translated by John Dryden, Joseph Addison, Laurence Eusden, Arthur Maynwaring, Samuel Croxall, Nahum Tate, William Stonestreet, Thomas Vernon, John Gay, Alexander Pope, Stephen Harvey, William Congreve, John Ozell, Temple Stanyan, Alexander Stopford Catcott, Nicholas Rowe, Sa | https://github.com/standardebooks/ovid_metamorphoses_various-translators |
| 53 | Narrative of the Life of Frederick Douglass, by Frederick Douglass | https://github.com/standardebooks/frederick-douglass_narrative-of-the-life-of-frederick-douglass |
| 54 | Oedipus Rex, by Sophocles. Translated by Francis Storr | https://github.com/standardebooks/sophocles_oedipus-rex_francis-storr |
| 55 | Oedipus at Colonus, by Sophocles. Translated by Francis Storr | https://github.com/standardebooks/sophocles_oedipus-at-colonus_francis-storr |
| 56 | Philoctetes, by Sophocles. Translated by Francis Storr | https://github.com/standardebooks/sophocles_philoctetes_francis-storr |
| 57 | Philosophical Works, by René Descartes. Translated by John Veitch | https://github.com/standardebooks/rene-descartes_philosophical-works_john-veitch |
| 58 | Pragmatism, by William James | https://github.com/standardebooks/william-james_pragmatism |
| 59 | Reflections on the Revolution in France, by Edmund Burke | https://github.com/standardebooks/edmund-burke_reflections-on-the-revolution-in-france |
| 60 | Roads to Freedom, by Bertrand Russell | https://github.com/standardebooks/bertrand-russell_roads-to-freedom |
| 61 | Short Works, by Epictetus. Translated by George Long | https://github.com/standardebooks/epictetus_short-works_george-long |
| 62 | Some Thoughts Concerning Education, by John Locke | https://github.com/standardebooks/john-locke_some-thoughts-concerning-education |
| 63 | The Aeneid, by Virgil. Translated by John Dryden | https://github.com/standardebooks/virgil_the-aeneid_john-dryden |
| 64 | The Age of Reason, by Thomas Paine | https://github.com/standardebooks/thomas-paine_the-age-of-reason |
| 65 | The American Crisis, by Thomas Paine | https://github.com/standardebooks/thomas-paine_the-american-crisis |
| 66 | The Autobiography of John Stuart Mill, by John Stuart Mill | https://github.com/standardebooks/john-stuart-mill_the-autobiography-of-john-stuart-mill |
| 67 | The Consolation of Philosophy, by Boethius. Translated by H. R. James | https://github.com/standardebooks/boethius_the-consolation-of-philosophy_h-r-james |
| 68 | The Genealogy of Morals, by Friedrich Nietzsche | https://github.com/standardebooks/friedrich-nietzsche_the-genealogy-of-morals_horace-b-samuel |
| 69 | The History of the Decline and Fall of the Roman Empire, by Edward Gibbon | https://github.com/standardebooks/edward-gibbon_the-history-of-the-decline-and-fall-of-the-roman-empire |
| 70 | The Odyssey, by Homer. Translated by William Cullen Bryant | https://github.com/standardebooks/homer_the-odyssey_william-cullen-bryant |
| 71 | The Origin of Species, by Charles Darwin | https://github.com/standardebooks/charles-darwin_the-origin-of-species |
| 72 | The Practice and Theory of Bolshevism, by Bertrand Russell | https://github.com/standardebooks/bertrand-russell_the-practice-and-theory-of-bolshevism |
| 73 | The Prince, by Niccolò Machiavelli. Translated by W. K. Marriot | https://github.com/standardebooks/niccolo-machiavelli_the-prince_w-k-marriott |
| 74 | The Problems of Philosophy, by Bertrand Russell | https://github.com/standardebooks/bertrand-russell_the-problems-of-philosophy |
| 75 | The Rights of Man, by Thomas Paine | https://github.com/standardebooks/thomas-paine_the-rights-of-man |
| 76 | The Subjection of Women, by John Stuart Mill | https://github.com/standardebooks/john-stuart-mill_the-subjection-of-women |
| 77 | The Tao Te Ching, by Laozi. Translated by James Legge | https://github.com/standardebooks/laozi_tao-te-ching_james-legge |
| 78 | The Theory of the Leisure Class, by Thorstein Veblen | https://github.com/standardebooks/thorstein-veblen_the-theory-of-the-leisure-class |
| 79 | The Voyage of the Beagle, by Charles Darwin | https://github.com/standardebooks/charles-darwin_the-voyage-of-the-beagle |
| 80 | Thus Spake Zarathustra, by Friedrich Nietzsche. Translated by Thomas Common | https://github.com/standardebooks/friedrich-nietzsche_thus-spake-zarathustra_thomas-common |
| 81 | Tusculan Disputations, by Marcus Tullius Cicero | https://github.com/standardebooks/cicero_tusculan-disputations_c-d-yonge |
| 82 | Two Treatises of Government, by John Locke | https://github.com/standardebooks/john-locke_two-treatises-of-government |
| 83 | Walden, by Henry David Thoreau | https://github.com/standardebooks/henry-david-thoreau_walden |

#### Pengembangan diri & bisnis klasik — Profesional · Umum (1)

| No | Judul, penulis | Repositori |
|---|---|---|
| 84 | The Art of Money Getting, by P. T. Barnum | https://github.com/standardebooks/p-t-barnum_the-art-of-money-getting |

#### Petualangan, misteri, fiksi ilmiah — SMP · SMA · Umum (105)

| No | Judul, penulis | Repositori |
|---|---|---|
| 85 | A Connecticut Yankee in King Arthur's Court, by Mark Twain | https://github.com/standardebooks/mark-twain_a-connecticut-yankee-in-king-arthurs-court |
| 86 | A Thief in the Night, by E. W. Hornung | https://github.com/standardebooks/e-w-hornung_a-thief-in-the-night |
| 87 | Allan Quatermain Stories, by H. Rider Haggard | https://github.com/standardebooks/h-rider-haggard_allan-quatermain-stories |
| 88 | Allan Quatermain, by H. Rider Haggard | https://github.com/standardebooks/h-rider-haggard_allan-quatermain |
| 89 | Arsène Lupin Versus Herlock Sholmes, by Maurice Leblanc. Translated by George Morehead | https://github.com/standardebooks/maurice-leblanc_arsene-lupin-versus-herlock-sholmes_george-morehead |
| 90 | Before Adam, by Jack London | https://github.com/standardebooks/jack-london_before-adam |
| 91 | Bellarion the Fortunate, by Rafael Sabatini | https://github.com/standardebooks/rafael-sabatini_bellarion-the-fortunate |
| 92 | Brood of the Witch-Queen, by Sax Rohmer | https://github.com/standardebooks/sax-rohmer_brood-of-the-witch-queen |
| 93 | Captain Blood, by Rafael Sabatini | https://github.com/standardebooks/rafael-sabatini_captain-blood |
| 94 | Catriona, by Robert Louis Stevenson | https://github.com/standardebooks/robert-louis-stevenson_catriona |
| 95 | Cleopatra, by H. Rider Haggard | https://github.com/standardebooks/h-rider-haggard_cleopatra |
| 96 | Dick Sands, the Boy Captain, by Jules Verne. Translated by Ellen E. Frewer | https://github.com/standardebooks/jules-verne_dick-sands-the-boy-captain_ellen-e-frewer |
| 97 | El Dorado, by Baroness Orczy | https://github.com/standardebooks/baroness-orczy_el-dorado |
| 98 | Facing the Flag, by Jules Verne. Translated by F. Tennyson Neely | https://github.com/standardebooks/jules-verne_facing-the-flag_f-tennyson-neely |
| 99 | Five Weeks in a Balloon, by Jules Verne | https://github.com/standardebooks/jules-verne_five-weeks-in-a-balloon_william-lackland |
| 100 | Four-Day Planet, by H. Beam Piper | https://github.com/standardebooks/h-beam-piper_four-day-planet |
| 101 | Heretics, by G. K. Chesterton | https://github.com/standardebooks/g-k-chesterton_heretics |
| 102 | I Will Repay, by Baroness Orczy | https://github.com/standardebooks/baroness-orczy_i-will-repay |
| 103 | In Search of the Castaways, by Jules Verne. Translated by J. B. Lippincott & Co. | https://github.com/standardebooks/jules-verne_in-search-of-the-castaways_j-b-lippincott-co |
| 104 | Ivanhoe, by Walter Scott | https://github.com/standardebooks/walter-scott_ivanhoe |
| 105 | Journey to the Center of the Earth, by Jules Verne | https://github.com/standardebooks/jules-verne_journey-to-the-center-of-the-earth_f-a-malleson |
| 106 | Kidnapped, by Robert Louis Stevenson | https://github.com/standardebooks/robert-louis-stevenson_kidnapped |
| 107 | King Solomon’s Mines, by H. Rider Haggard | https://github.com/standardebooks/h-rider-haggard_king-solomons-mines |
| 108 | Lost Face, by Jack London | https://github.com/standardebooks/jack-london_lost-face |
| 109 | Maiwa’s Revenge, by H. Rider Haggard | https://github.com/standardebooks/h-rider-haggard_maiwas-revenge |
| 110 | Manalive, by G. K. Chesterton | https://github.com/standardebooks/g-k-chesterton_manalive |
| 111 | Martin Eden, by Jack London | https://github.com/standardebooks/jack-london_martin-eden |
| 112 | Michael Strogoff, by Jules Verne. Translated by W.H.G. Kingston | https://github.com/standardebooks/jules-verne_michael-strogoff_w-h-g-kingston |
| 113 | Murder in the Gunroom, by H. Beam Piper | https://github.com/standardebooks/h-beam-piper_murder-in-the-gunroom |
| 114 | Personal Recollections of Joan of Arc, by Mark Twain | https://github.com/standardebooks/mark-twain_personal-recollections-of-joan-of-arc |
| 115 | Pirates of Venus, by Edgar Rice Burroughs | https://github.com/standardebooks/edgar-rice-burroughs_pirates-of-venus |
| 116 | Pudd’nhead Wilson, by Mark Twain | https://github.com/standardebooks/mark-twain_puddnhead-wilson |
| 117 | Riders of the Purple Sage, by Zane Grey | https://github.com/standardebooks/zane-grey_riders-of-the-purple-sage |
| 118 | Room 13, by Edgar Wallace | https://github.com/standardebooks/edgar-wallace_room-13 |
| 119 | Roughing It, by Mark Twain | https://github.com/standardebooks/mark-twain_roughing-it |
| 120 | Scaramouche, by Rafael Sabatini | https://github.com/standardebooks/rafael-sabatini_scaramouche |
| 121 | She, by H. Rider Haggard | https://github.com/standardebooks/h-rider-haggard_she |
| 122 | Short Fiction, by H. G. Wells | https://github.com/standardebooks/h-g-wells_short-fiction |
| 123 | Short Fiction, by John Buchan | https://github.com/standardebooks/john-buchan_short-fiction |
| 124 | Space Viking, by H. Beam Piper | https://github.com/standardebooks/h-beam-piper_space-viking |
| 125 | Tarzan and the Jewels of Opar, by Edgar Rice Burroughs | https://github.com/standardebooks/edgar-rice-burroughs_tarzan-and-the-jewels-of-opar |
| 126 | Tarzan of the Apes, by Edgar Rice Burroughs | https://github.com/standardebooks/edgar-rice-burroughs_tarzan-of-the-apes |
| 127 | Tarzan the Terrible, by Edgar Rice Burroughs | https://github.com/standardebooks/edgar-rice-burroughs_tarzan-the-terrible |
| 128 | Terror Keep, by Edgar Wallace | https://github.com/standardebooks/edgar-wallace_terror-keep |
| 129 | The Adventures of Huckleberry Finn, by Mark Twain | https://github.com/standardebooks/mark-twain_the-adventures-of-huckleberry-finn |
| 130 | The Adventures of Tom Sawyer, by Mark Twain | https://github.com/standardebooks/mark-twain_the-adventures-of-tom-sawyer |
| 131 | The Beasts of Tarzan, by Edgar Rice Burroughs | https://github.com/standardebooks/edgar-rice-burroughs_the-beasts-of-tarzan |
| 132 | The Call of the Wild, by Jack London | https://github.com/standardebooks/jack-london_the-call-of-the-wild |
| 133 | The Chessmen of Mars, by Edgar Rice Burroughs | https://github.com/standardebooks/edgar-rice-burroughs_the-chessmen-of-mars |
| 134 | The Child of the Cavern, by Jules Verne. Translated by Vincent Parke and Company | https://github.com/standardebooks/jules-verne_the-child-of-the-cavern_vincent-parke-and-company |
| 135 | The Club of Queer Trades, by G. K. Chesterton | https://github.com/standardebooks/g-k-chesterton_the-club-of-queer-trades |
| 136 | The Clue of the New Pin, by Edgar Wallace | https://github.com/standardebooks/edgar-wallace_the-clue-of-the-new-pin |
| 137 | The Clue of the Twisted Candle, by Edgar Wallace | https://github.com/standardebooks/edgar-wallace_the-clue-of-the-twisted-candle |
| 138 | The Council of Justice, by Edgar Wallace | https://github.com/standardebooks/edgar-wallace_the-council-of-justice |
| 139 | The Count of Monte Cristo, by Alexandre Dumas. Translated by Chapman and Hall | https://github.com/standardebooks/alexandre-dumas_the-count-of-monte-cristo_chapman-and-hall |
| 140 | The Courts of the Morning, by John Buchan | https://github.com/standardebooks/john-buchan_the-courts-of-the-morning |
| 141 | The Crystal Stopper, by Maurice Leblanc. Translated by Alexander Teixeira de Mattos | https://github.com/standardebooks/maurice-leblanc_the-crystal-stopper_alexander-teixeira-de-mattos |
| 142 | The Elusive Pimpernel, by Baroness Orczy | https://github.com/standardebooks/baroness-orczy_the-elusive-pimpernel |
| 143 | The Everlasting Man, by G. K. Chesterton | https://github.com/standardebooks/g-k-chesterton_the-everlasting-man |
| 144 | The Extraordinary Adventures of Arsène Lupin, Gentleman-Burglar, by Maurice Leblanc. Translated by George Morehead | https://github.com/standardebooks/maurice-leblanc_the-extraordinary-adventures-of-arsene-lupin-gentleman-burglar_george-morehead |
| 145 | The Fur Country, by Jules Verne. Translated by N. D’Anvers | https://github.com/standardebooks/jules-verne_the-fur-country_n-danvers |
| 146 | The Giant Raft, by Jules Verne. Translated by W. J. Gordon | https://github.com/standardebooks/jules-verne_the-giant-raft_w-j-gordon |
| 147 | The Gold Bag, by Carolyn Wells | https://github.com/standardebooks/carolyn-wells_the-gold-bag |
| 148 | The Hound of the Baskervilles, by Arthur Conan Doyle | https://github.com/standardebooks/arthur-conan-doyle_the-hound-of-the-baskervilles |
| 149 | The Innocence of Father Brown, by G. K. Chesterton | https://github.com/standardebooks/g-k-chesterton_the-innocence-of-father-brown |
| 150 | The Innocents Abroad, by Mark Twain | https://github.com/standardebooks/mark-twain_the-innocents-abroad |
| 151 | The Iron Heel, by Jack London | https://github.com/standardebooks/jack-london_the-iron-heel |
| 152 | The Jungle Book, by Rudyard Kipling | https://github.com/standardebooks/rudyard-kipling_the-jungle-book |
| 153 | The Just Men of Cordova, by Edgar Wallace | https://github.com/standardebooks/edgar-wallace_the-just-men-of-cordova |
| 154 | The Last of the Mohicans, by James Fenimore Cooper | https://github.com/standardebooks/james-fenimore-cooper_the-last-of-the-mohicans |
| 155 | The Law of the Four Just Men, by Edgar Wallace | https://github.com/standardebooks/edgar-wallace_the-law-of-the-four-just-men |
| 156 | The League of the Scarlet Pimpernel, by Baroness Orczy | https://github.com/standardebooks/baroness-orczy_the-league-of-the-scarlet-pimpernel |
| 157 | The Man Who Was Thursday, by G. K. Chesterton | https://github.com/standardebooks/g-k-chesterton_the-man-who-was-thursday |
| 158 | The Master Mind of Mars, by Edgar Rice Burroughs | https://github.com/standardebooks/edgar-rice-burroughs_the-master-mind-of-mars |
| 159 | The Master of Ballantrae, by Robert Louis Stevenson | https://github.com/standardebooks/robert-louis-stevenson_the-master-of-ballantrae |
| 160 | The Memoirs of Sherlock Holmes, by Arthur Conan Doyle | https://github.com/standardebooks/arthur-conan-doyle_the-memoirs-of-sherlock-holmes |
| 161 | The Mucker, by Edgar Rice Burroughs | https://github.com/standardebooks/edgar-rice-burroughs_the-mucker |
| 162 | The Mysterious Island, by Jules Verne. Translated by Stephen W. White | https://github.com/standardebooks/jules-verne_the-mysterious-island_stephen-w-white |
| 163 | The Mystery of 31, New Inn, by R. Austin Freeman | https://github.com/standardebooks/r-austin-freeman_the-mystery-of-31-new-inn |
| 164 | The Old Man in the Corner, by Baroness Orczy | https://github.com/standardebooks/baroness-orczy_the-old-man-in-the-corner |
| 165 | The Outlaw of Torn, by Edgar Rice Burroughs | https://github.com/standardebooks/edgar-rice-burroughs_the-outlaw-of-torn |
| 166 | The Prince and the Pauper, by Mark Twain | https://github.com/standardebooks/mark-twain_the-prince-and-the-pauper |
| 167 | The Red Thumbmark, by R. Austin Freeman | https://github.com/standardebooks/r-austin-freeman_the-red-thumbmark |
| 168 | The Return of Sherlock Holmes, by Arthur Conan Doyle | https://github.com/standardebooks/arthur-conan-doyle_the-return-of-sherlock-holmes |
| 169 | The Scarlet Pimpernel, by Baroness Orczy | https://github.com/standardebooks/baroness-orczy_the-scarlet-pimpernel |
| 170 | The Sea Hawk, by Rafael Sabatini | https://github.com/standardebooks/rafael-sabatini_the-sea-hawk |
| 171 | The Sea-Wolf, by Jack London | https://github.com/standardebooks/jack-london_the-sea-wolf |
| 172 | The Secret House, by Edgar Wallace | https://github.com/standardebooks/edgar-wallace_the-secret-house |
| 173 | The Son of Tarzan, by Edgar Rice Burroughs | https://github.com/standardebooks/edgar-rice-burroughs_the-son-of-tarzan |
| 174 | The Son of the Wolf, by Jack London | https://github.com/standardebooks/jack-london_the-son-of-the-wolf |
| 175 | The Square Emerald, by Edgar Wallace | https://github.com/standardebooks/edgar-wallace_the-square-emerald |
| 176 | The Survivors of the Chancellor, by Jules Verne. Translated by Ellen Frewer | https://github.com/standardebooks/jules-verne_the-survivors-of-the-chancellor_ellen-frewer |
| 177 | The Three Hostages, by John Buchan | https://github.com/standardebooks/john-buchan_the-three-hostages |
| 178 | The Three Just Men, by Edgar Wallace | https://github.com/standardebooks/edgar-wallace_the-three-just-men |
| 179 | The Triumph of the Scarlet Pimpernel, by Baroness Orczy | https://github.com/standardebooks/baroness-orczy_the-triumph-of-the-scarlet-pimpernel |
| 180 | The White Company, by Arthur Conan Doyle | https://github.com/standardebooks/arthur-conan-doyle_the-white-company |
| 181 | The Wisdom of Father Brown, by G. K. Chesterton | https://github.com/standardebooks/g-k-chesterton_the-wisdom-of-father-brown |
| 182 | The World Set Free, by H. G. Wells | https://github.com/standardebooks/h-g-wells_the-world-set-free |
| 183 | Ticket No. 9672, by Jules Verne. Translated by Laura E. Kendall | https://github.com/standardebooks/jules-verne_ticket-no-9672_laura-e-kendall |
| 184 | Tono-Bungay, by H. G. Wells | https://github.com/standardebooks/h-g-wells_tono-bungay |
| 185 | Topsy-Turvy, by Jules Verne. Translated by J. G. Ogilvie | https://github.com/standardebooks/jules-verne_topsy-turvy_j-g-ogilvie |
| 186 | Travel Essays, by Robert Louis Stevenson | https://github.com/standardebooks/robert-louis-stevenson_travel-essays |
| 187 | Waverley, by Walter Scott | https://github.com/standardebooks/walter-scott_waverley |
| 188 | What’s Wrong with the World, by G. K. Chesterton | https://github.com/standardebooks/g-k-chesterton_whats-wrong-with-the-world |
| 189 | When God Laughs, by Jack London | https://github.com/standardebooks/jack-london_when-god-laughs |

#### Puisi — SMA · Mahasiswa/S1 · Umum (16)

| No | Judul, penulis | Repositori |
|---|---|---|
| 190 | Poetry, by C. S. Lewis | https://github.com/standardebooks/c-s-lewis_poetry |
| 191 | Poetry, by Edgar Allan Poe | https://github.com/standardebooks/edgar-allan-poe_poetry |
| 192 | Poetry, by Fernando Pessoa | https://github.com/standardebooks/fernando-pessoa_poetry |
| 193 | Poetry, by Henry van Dyke Jr. | https://github.com/standardebooks/henry-van-dyke-jr_poetry |
| 194 | Poetry, by John Keats | https://github.com/standardebooks/john-keats_poetry |
| 195 | Poetry, by Oscar Wilde | https://github.com/standardebooks/oscar-wilde_poetry |
| 196 | Poetry, by T. S. Eliot | https://github.com/standardebooks/t-s-eliot_poetry |
| 197 | Poetry, by Taras Shevchenko. Translated by Alexander Jardine Hunter, Ethel Voynich, Paul Selver, and Florence Randal Livesay | https://github.com/standardebooks/taras-shevchenko_poetry_various-translators |
| 198 | Poetry, by Voltairine de Cleyre | https://github.com/standardebooks/voltairine-de-cleyre_poetry |
| 199 | Poetry, by W. B. Yeats | https://github.com/standardebooks/w-b-yeats_poetry |
| 200 | Poetry, by Wilfred Owen | https://github.com/standardebooks/wilfred-owen_poetry |
| 201 | Poetry, by William Carlos Williams | https://github.com/standardebooks/william-carlos-williams_poetry |
| 202 | Poetry, by William Shakespeare | https://github.com/standardebooks/william-shakespeare_poetry |
| 203 | Songs of a Sourdough, by Robert W. Service | https://github.com/standardebooks/robert-w-service_songs-of-a-sourdough |
| 204 | Sonnets from the Portuguese, Elizabeth Barrett Browning | https://github.com/standardebooks/elizabeth-barrett-browning_sonnets-from-the-portuguese |
| 205 | Verses on Various Occasions, by John Henry Newman | https://github.com/standardebooks/john-henry-newman_verses-on-various-occasions |

#### Sastra klasik — SMA · Mahasiswa/S1 · Umum (492)

| No | Judul, penulis | Repositori |
|---|---|---|
| 206 | A Bid for Fortune, by Guy Boothby | https://github.com/standardebooks/guy-boothby_a-bid-for-fortune |
| 207 | A Christmas Carol, by Charles Dickens | https://github.com/standardebooks/charles-dickens_a-christmas-carol |
| 208 | A Confession, by Leo Tolstoy. Translated by Aylmer Maude | https://github.com/standardebooks/leo-tolstoy_a-confession_aylmer-maude |
| 209 | A Cycle of the West, by John G. Neihardt | https://github.com/standardebooks/john-g-neihardt_a-cycle-of-the-west |
| 210 | A Daughter of the Samurai, by Etsu Inagaki Sugimoto | https://github.com/standardebooks/etsu-inagaki-sugimoto_a-daughter-of-the-samurai |
| 211 | A Doll’s House, by Henrik Ibsen. Translated by R. Farquharson Sharp | https://github.com/standardebooks/henrik-ibsen_a-dolls-house_r-farquharson-sharp |
| 212 | A Farewell to Arms, by Ernest Hemingway | https://github.com/standardebooks/ernest-hemingway_a-farewell-to-arms |
| 213 | A General History of the Pirates, by Captain Charles Johnson | https://github.com/standardebooks/captain-charles-johnson_a-general-history-of-the-pirates |
| 214 | A Gentleman of Leisure, by P. G. Wodehouse | https://github.com/standardebooks/p-g-wodehouse_a-gentleman-of-leisure |
| 215 | A Hazard of New Fortunes, by William Dean Howells | https://github.com/standardebooks/william-dean-howells_a-hazard-of-new-fortunes |
| 216 | A House of Gentlefolk, by Ivan Turgenev. Translated by Constance Garnett | https://github.com/standardebooks/ivan-turgenev_a-house-of-gentlefolk_constance-garnett |
| 217 | A Journal of the Plague Year, by Daniel Defoe | https://github.com/standardebooks/daniel-defoe_a-journal-of-the-plague-year |
| 218 | A Man Could Stand Up—, by Ford Madox Ford | https://github.com/standardebooks/ford-madox-ford_a-man-could-stand-up |
| 219 | A Negro Explorer at the North Pole, by Matthew Henson | https://github.com/standardebooks/matthew-henson_a-negro-explorer-at-the-north-pole |
| 220 | A Personal Record, by Joseph Conrad | https://github.com/standardebooks/joseph-conrad_a-personal-record |
| 221 | A Portrait of the Artist as a Young Man, by James Joyce | https://github.com/standardebooks/james-joyce_a-portrait-of-the-artist-as-a-young-man |
| 222 | A Prefect’s Uncle, by P. G. Wodehouse | https://github.com/standardebooks/p-g-wodehouse_a-prefects-uncle |
| 223 | A Room With a View, by E. M. Forster | https://github.com/standardebooks/e-m-forster_a-room-with-a-view |
| 224 | A Tale of Two Cities, by Charles Dickens | https://github.com/standardebooks/charles-dickens_a-tale-of-two-cities |
| 225 | A Voyage to Arcturus, by David Lindsay | https://github.com/standardebooks/david-lindsay_a-voyage-to-arcturus |
| 226 | A Woman of Thirty, by Honoré de Balzac. Translated by Ellen Marriage | https://github.com/standardebooks/honore-de-balzac_a-woman-of-thirty_ellen-marriage |
| 227 | After London, by Richard Jefferies | https://github.com/standardebooks/richard-jefferies_after-london |
| 228 | Against the Grain, by J.-K. Huysmans. Translated by Groves & Michaux | https://github.com/standardebooks/j-k-huysmans_against-the-grain_groves-michaux |
| 229 | Albert Savarus, by Honoré de Balzac. Translated by Ellen Marriage | https://github.com/standardebooks/honore-de-balzac_albert-savarus_ellen-marriage |
| 230 | Alice Adams, by Booth Tarkington | https://github.com/standardebooks/booth-tarkington_alice-adams |
| 231 | All Quiet on the Western Front, by Erich Maria Remarque. Translated by A. W. Wheen | https://github.com/standardebooks/erich-maria-remarque_all-quiet-on-the-western-front_a-w-wheen |
| 232 | Amaryllis at the Fair, by Richard Jefferies | https://github.com/standardebooks/richard-jefferies_amaryllis-at-the-fair |
| 233 | American Indian Stories, by Zitkála-Šá | https://github.com/standardebooks/zitkala-sa_american-indian-stories |
| 234 | An Autobiography, by Theodore Roosevelt | https://github.com/standardebooks/theodore-roosevelt_an-autobiography |
| 235 | An Ideal Husband, by Oscar Wilde | https://github.com/standardebooks/oscar-wilde_an-ideal-husband |
| 236 | An Outback Marriage, by Banjo Paterson | https://github.com/standardebooks/banjo-paterson_an-outback-marriage |
| 237 | An Outcast of the Islands, by Joseph Conrad | https://github.com/standardebooks/joseph-conrad_an-outcast-of-the-islands |
| 238 | Anna Karenina, by Leo Tolstoy. Translated by Constance Garnett | https://github.com/standardebooks/leo-tolstoy_anna-karenina_constance-garnett |
| 239 | As I Lay Dying, by William Faulkner | https://github.com/standardebooks/william-faulkner_as-i-lay-dying |
| 240 | Aspects of the Novel, by E. M. Forster | https://github.com/standardebooks/e-m-forster_aspects-of-the-novel |
| 241 | At the Mountains of Madness, by H.P. Lovecraft | https://github.com/standardebooks/h-p-lovecraft_at-the-mountains-of-madness |
| 242 | At the Villa Rose, by A. E. W. Mason | https://github.com/standardebooks/a-e-w-mason_at-the-villa-rose |
| 243 | Babbitt, by Sinclair Lewis | https://github.com/standardebooks/sinclair-lewis_babbitt |
| 244 | Banjo, by Claude McKay | https://github.com/standardebooks/claude-mckay_banjo |
| 245 | Barlasch of the Guard, by Henry Seton Merriman | https://github.com/standardebooks/henry-seton-merriman_barlasch-of-the-guard |
| 246 | Barnaby Rudge, by Charles Dickens | https://github.com/standardebooks/charles-dickens_barnaby-rudge |
| 247 | Basil, by Wilkie Collins | https://github.com/standardebooks/wilkie-collins_basil |
| 248 | Beauvallet, by Georgette Heyer | https://github.com/standardebooks/georgette-heyer_beauvallet |
| 249 | Bel Ami, by Guy de Maupassant. Translated by Vizetelly and Company | https://github.com/standardebooks/guy-de-maupassant_bel-ami_vizetelly-and-company |
| 250 | Black No More, by George Schuyler | https://github.com/standardebooks/george-schuyler_black-no-more |
| 251 | Blind Corner, by Dornford Yates | https://github.com/standardebooks/dornford-yates_blind-corner |
| 252 | Blind Mice, by C. Kay Scott | https://github.com/standardebooks/c-kay-scott_blind-mice |
| 253 | Brown on Resolution, by C. S. Forester | https://github.com/standardebooks/c-s-forester_brown-on-resolution |
| 254 | Bulfinch’s Mythology, by Thomas Bulfinch | https://github.com/standardebooks/thomas-bulfinch_bulfinchs-mythology |
| 255 | Béatrix, by Honoré de Balzac. Translated by James Waring | https://github.com/standardebooks/honore-de-balzac_beatrix_james-waring |
| 256 | Can You Forgive Her?, by Anthony Trollope | https://github.com/standardebooks/anthony-trollope_can-you-forgive-her |
| 257 | Captain Jinks, Hero, by Ernest Howard Crosby | https://github.com/standardebooks/ernest-howard-crosby_captain-jinks-hero |
| 258 | Castle Rackrent, by Maria Edgeworth | https://github.com/standardebooks/maria-edgeworth_castle-rackrent |
| 259 | Chamber Music, by James Joyce | https://github.com/standardebooks/james-joyce_poetry |
| 260 | Chance, by Joseph Conrad | https://github.com/standardebooks/joseph-conrad_chance |
| 261 | Charlotte Temple, by Susanna Haswell Rowson | https://github.com/standardebooks/susanna-haswell-rowson_charlotte-temple |
| 262 | Children’s Stories, by Oscar Wilde | https://github.com/standardebooks/oscar-wilde_childrens-stories |
| 263 | Clarissa Harlowe, by Samuel Richardson | https://github.com/standardebooks/samuel-richardson_clarissa |
| 264 | Clerambault, by Romain Rolland. Translated by Katherine Miller | https://github.com/standardebooks/romain-rolland_clerambault_katherine-miller |
| 265 | Clotel, by William Wells Brown | https://github.com/standardebooks/william-wells-brown_clotel |
| 266 | Cogewea, the Half-Blood, by Mourning Dove | https://github.com/standardebooks/mourning-dove_cogewea-the-half-blood |
| 267 | Commentaries on the Gallic War, by Julius Caesar. Translated by W. A. McDevitte and W. S. Bohn | https://github.com/standardebooks/julius-caesar_commentaries-on-the-gallic-war_w-a-mcdevitte_w-s-bohn |
| 268 | Conan Stories, by Robert E. Howard | https://github.com/standardebooks/robert-e-howard_conan-stories |
| 269 | Contending Forces, by Pauline E. Hopkins | https://github.com/standardebooks/pauline-e-hopkins_contending-forces |
| 270 | Crime and Punishment, by Fyodor Dostoevsky. Translated by Constance Garnett | https://github.com/standardebooks/fyodor-dostoevsky_crime-and-punishment_constance-garnett |
| 271 | Culture and Anarchy, by Matthew Arnold | https://github.com/standardebooks/matthew-arnold_culture-and-anarchy |
| 272 | Darby O’Gill and the Good People, by Herminie Templeton Kavanagh | https://github.com/standardebooks/herminie-templeton-kavanagh_darby-ogill-and-the-good-people |
| 273 | David Copperfield, by Charles Dickens | https://github.com/standardebooks/charles-dickens_david-copperfield |
| 274 | David Harum, by Edward Noyes Westcott | https://github.com/standardebooks/edward-noyes-westcott_david-harum |
| 275 | Dead Souls, by Nikolai Gogol. Translated by C. J. Hogarth | https://github.com/standardebooks/nikolai-gogol_dead-souls_c-j-hogarth |
| 276 | Democracy, by Henry Adams | https://github.com/standardebooks/henry-adams_democracy |
| 277 | Demons, by Fyodor Dostoevsky. Translated by Constance Garnett | https://github.com/standardebooks/fyodor-dostoevsky_demons_constance-garnett |
| 278 | Doctor Syn, by Russell Thorndike | https://github.com/standardebooks/russell-thorndike_doctor-syn |
| 279 | Dombey and Son, by Charles Dickens | https://github.com/standardebooks/charles-dickens_dombey-and-son |
| 280 | Don Quixote, by Miguel de Cervantes. Translated by John Ormsby | https://github.com/standardebooks/miguel-de-cervantes-saavedra_don-quixote_john-ormsby |
| 281 | Dubliners, by James Joyce | https://github.com/standardebooks/james-joyce_dubliners |
| 282 | Early Autumn, by Louis Bromfield | https://github.com/standardebooks/louis-bromfield_early-autumn |
| 283 | Elmer Gantry, by Sinclair Lewis | https://github.com/standardebooks/sinclair-lewis_elmer-gantry |
| 284 | Emma, by Jane Austen | https://github.com/standardebooks/jane-austen_emma |
| 285 | Ethan Frome, by Edith Wharton | https://github.com/standardebooks/edith-wharton_ethan-frome |
| 286 | Exiles, by James Joyce | https://github.com/standardebooks/james-joyce_exiles |
| 287 | Fanny’s First Play, by George Bernard Shaw | https://github.com/standardebooks/george-bernard-shaw_fannys-first-play |
| 288 | Far from the Madding Crowd, by Thomas Hardy | https://github.com/standardebooks/thomas-hardy_far-from-the-madding-crowd |
| 289 | Father Goriot, by Honoré de Balzac. Translated by Ellen Marriage | https://github.com/standardebooks/honore-de-balzac_father-goriot_ellen-marriage |
| 290 | Father Henson’s Story of His Own Life, by Josiah Henson | https://github.com/standardebooks/josiah-henson_father-hensons-story-of-his-own-life |
| 291 | Fathers and Children, by Ivan Turgenev. Translated by Constance Garnett | https://github.com/standardebooks/ivan-turgenev_fathers-and-children_constance-garnett |
| 292 | Figures of Earth, by James Branch Cabell | https://github.com/standardebooks/james-branch-cabell_figures-of-earth |
| 293 | File No. 113, by Émile Gaboriau. Translated by James R. Osgood & Co. | https://github.com/standardebooks/emile-gaboriau_file-no-113_james-r-osgood-co |
| 294 | Flatland, by Edwin A. Abbott | https://github.com/standardebooks/edwin-a-abbott_flatland |
| 295 | Flight, by Walter White | https://github.com/standardebooks/walter-white_flight |
| 296 | Getting Married, by George Bernard Shaw | https://github.com/standardebooks/george-bernard-shaw_getting-married |
| 297 | Ghosts, by Henrik Ibsen. Translated by William Archer | https://github.com/standardebooks/henrik-ibsen_ghosts_william-archer |
| 298 | Gitanjali, by Rabindranath Tagore | https://github.com/standardebooks/rabindranath-tagore_gitanjali |
| 299 | Great Expectations, by Charles Dickens | https://github.com/standardebooks/charles-dickens_great-expectations |
| 300 | Greene Ferne Farm, by Richard Jefferies | https://github.com/standardebooks/richard-jefferies_greene-ferne-farm |
| 301 | Hadji Murád, by Leo Tolstoy. Translated by Aylmer Maude | https://github.com/standardebooks/leo-tolstoy_hadji-murad_aylmer-maude |
| 302 | Hay Fever, by Noël Coward | https://github.com/standardebooks/noel-coward_hay-fever |
| 303 | Heartbreak House, by George Bernard Shaw | https://github.com/standardebooks/george-bernard-shaw_heartbreak-house |
| 304 | Hedda Gabler, by Henrik Ibsen. Translated by Edmund Gosse and William Archer | https://github.com/standardebooks/henrik-ibsen_hedda-gabler_edmund-gosse_william-archer |
| 305 | Herland, by Charlotte Perkins Gilman | https://github.com/standardebooks/charlotte-perkins-gilman_herland |
| 306 | His Family, by Ernest Poole | https://github.com/standardebooks/ernest-poole_his-family |
| 307 | His Masterpiece, by Émile Zola. Translated by Ernest Alfred Vizetelly | https://github.com/standardebooks/emile-zola_his-masterpiece_ernest-alfred-vizetelly |
| 308 | Home to Harlem, by Claude McKay | https://github.com/standardebooks/claude-mckay_home-to-harlem |
| 309 | Honeycomb, by Dorothy M. Richardson | https://github.com/standardebooks/dorothy-m-richardson_honeycomb |
| 310 | Howards End, by E. M. Forster | https://github.com/standardebooks/e-m-forster_howards-end |
| 311 | Hudson River Bracketed, by Edith Wharton | https://github.com/standardebooks/edith-wharton_hudson-river-bracketed |
| 312 | Hunger, by Knut Hamsun. Translated by George Egerton | https://github.com/standardebooks/knut-hamsun_hunger_george-egerton |
| 313 | Hunting for Hidden Gold, by Franklin W. Dixon | https://github.com/standardebooks/franklin-w-dixon_hunting-for-hidden-gold |
| 314 | In Search of Lost Time, by Marcel Proust. Translated by C. K. Scott Moncrieff | https://github.com/standardebooks/marcel-proust_in-search-of-lost-time_c-k-scott-moncrieff |
| 315 | Inspector French’s Greatest Case, by Freeman Wills Crofts | https://github.com/standardebooks/freeman-wills-crofts_inspector-frenchs-greatest-case |
| 316 | Invaders from the Infinite, by John W. Campbell | https://github.com/standardebooks/john-w-campbell_invaders-from-the-infinite |
| 317 | Irish Fairy Tales, by James Stephens | https://github.com/standardebooks/james-stephens_irish-fairy-tales |
| 318 | Ivanov, by Anton Chekhov. Translated by Constance Garnett | https://github.com/standardebooks/anton-chekhov_ivanov_constance-garnett |
| 319 | Jacob’s Room, by Virginia Woolf | https://github.com/standardebooks/virginia-woolf_jacobs-room |
| 320 | Jane Eyre: An Autobiography, by Charlotte Brontë | https://github.com/standardebooks/charlotte-bronte_jane-eyre |
| 321 | Jeeves Stories, by P. G. Wodehouse | https://github.com/standardebooks/p-g-wodehouse_jeeves-stories |
| 322 | Jesus the Son of Man, by Kahlil Gibran | https://github.com/standardebooks/kahlil-gibran_jesus-the-son-of-man |
| 323 | Kai Lung’s Golden Hours, by Ernest Bramah | https://github.com/standardebooks/ernest-bramah_kai-lungs-golden-hours |
| 324 | Khaled: A Tale of Arabia, by F. Marion Crawford | https://github.com/standardebooks/f-marion-crawford_khaled |
| 325 | King Coal, by Upton Sinclair | https://github.com/standardebooks/upton-sinclair_king-coal |
| 326 | Krakatit, by Karel Čapek. Translated by Lawrence Hyde | https://github.com/standardebooks/karel-capek_krakatit_lawrence-hyde |
| 327 | Lady Audley’s Secret, by M. E. Braddon | https://github.com/standardebooks/m-e-braddon_lady-audleys-secret |
| 328 | Lady Rose’s Daughter, by Mary Augusta Ward | https://github.com/standardebooks/mary-augusta-ward_lady-roses-daughter |
| 329 | Last and First Men, by Olaf Stapledon | https://github.com/standardebooks/olaf-stapledon_last-and-first-men |
| 330 | Lavengro, by George Borrow | https://github.com/standardebooks/george-borrow_lavengro |
| 331 | Lay Down Your Arms, by Bertha von Suttner. Translated by T. Holmes | https://github.com/standardebooks/bertha-von-suttner_lay-down-your-arms_t-holmes |
| 332 | Le Morte D’Arthur, by Thomas Malory | https://github.com/standardebooks/thomas-malory_le-morte-darthur |
| 333 | Leave It to Psmith, by P.G. Wodehouse | https://github.com/standardebooks/p-g-wodehouse_leave-it-to-psmith |
| 334 | Leaves of Grass, by Walt Whitman | https://github.com/standardebooks/walt-whitman_leaves-of-grass |
| 335 | Legends of Vancouver, by E. Pauline Johnson | https://github.com/standardebooks/e-pauline-johnson_legends-of-vancouver |
| 336 | Les Misérables, by Victor Hugo. Translated by Isabel F. Hapgood | https://github.com/standardebooks/victor-hugo_les-miserables_isabel-f-hapgood |
| 337 | Letters of Two Brides, by Honoré de Balzac. Translated by R. S. Scott | https://github.com/standardebooks/honore-de-balzac_letters-of-two-brides_r-s-scott |
| 338 | Liberalism, by L. T. Hobhouse | https://github.com/standardebooks/l-t-hobhouse_liberalism |
| 339 | Little Dorrit, by Charles Dickens | https://github.com/standardebooks/charles-dickens_little-dorrit |
| 340 | Lolly Willowes, by Sylvia Townsend Warner | https://github.com/standardebooks/sylvia-townsend-warner_lolly-willowes |
| 341 | Lord Jim, by Joseph Conrad | https://github.com/standardebooks/joseph-conrad_lord-jim |
| 342 | Lorna Doone, by R. D. Blackmore | https://github.com/standardebooks/r-d-blackmore_lorna-doone |
| 343 | Lost Illusions, by Honoré de Balzac. Translated by Ellen Marriage | https://github.com/standardebooks/honore-de-balzac_lost-illusions_ellen-marriage |
| 344 | Lud-in-the-Mist, by Hope Mirrlees | https://github.com/standardebooks/hope-mirrlees_lud-in-the-mist |
| 345 | Madame Bovary, by Gustave Flaubert | https://github.com/standardebooks/gustave-flaubert_madame-bovary_eleanor-marx-aveling |
| 346 | Magnificent Obsession, by Lloyd C. Douglas | https://github.com/standardebooks/lloyd-c-douglas_magnificent-obsession |
| 347 | Main Street, by Sinclair Lewis | https://github.com/standardebooks/sinclair-lewis_main-street |
| 348 | Malleus Maleficarum, by Heinrich Kramer. Translated by Montague Summers | https://github.com/standardebooks/heinrich-kramer_malleus-maleficarum_montague-summers |
| 349 | Man and Superman, by George Bernard Shaw | https://github.com/standardebooks/george-bernard-shaw_man-and-superman |
| 350 | Man and Wife, by Wilkie Collins | https://github.com/standardebooks/wilkie-collins_man-and-wife |
| 351 | Mansfield Park, by Jane Austen | https://github.com/standardebooks/jane-austen_mansfield-park |
| 352 | Maria Chapdelaine, by Louis Hémon. Translated by W. H. Blake | https://github.com/standardebooks/louis-hemon_maria-chapdelaine_w-h-blake |
| 353 | Martin Chuzzlewit, by Charles Dickens | https://github.com/standardebooks/charles-dickens_martin-chuzzlewit |
| 354 | Mary Olivier: A Life, by May Sinclair | https://github.com/standardebooks/may-sinclair_mary-olivier-a-life |
| 355 | Mauprat, by George Sand. Translated by Stanley Young | https://github.com/standardebooks/george-sand_mauprat_stanley-young |
| 356 | McTeague, by Frank Norris | https://github.com/standardebooks/frank-norris_mcteague |
| 357 | Memoirs of a Revolutionist, by Peter Kropotkin | https://github.com/standardebooks/peter-kropotkin_memoirs-of-a-revolutionist |
| 358 | Middlemarch, by George Eliot | https://github.com/standardebooks/george-eliot_middlemarch |
| 359 | Mirèio, by Frédéric Mistral. Translated by Harriet Waters Preston | https://github.com/standardebooks/frederic-mistral_mireio_harriet-waters-preston |
| 360 | Misalliance, by George Bernard Shaw | https://github.com/standardebooks/george-bernard-shaw_misalliance |
| 361 | Miss Mole, by E. H. Young | https://github.com/standardebooks/e-h-young_miss-mole |
| 362 | Moby Dick, by Herman Melville | https://github.com/standardebooks/herman-melville_moby-dick |
| 363 | Monsieur Lecoq, by Emile Gaboriau. Translated by Laura E. Kendall | https://github.com/standardebooks/emile-gaboriau_monsieur-lecoq_laura-e-kendall |
| 364 | Moonfleet, by John Meade Falkner | https://github.com/standardebooks/john-meade-falkner_moonfleet |
| 365 | Moribund Society and Anarchy, by Jean Grave. Translated by Voltairine de Cleyre | https://github.com/standardebooks/jean-grave_moribund-society-and-anarchy_voltairine-de-cleyre |
| 366 | Moving the Mountain, by Charlotte Perkins Gilman | https://github.com/standardebooks/charlotte-perkins-gilman_moving-the-mountain |
| 367 | Mr. Mulliner Stories, by P. G. Wodehouse | https://github.com/standardebooks/p-g-wodehouse_mr-mulliner-stories |
| 368 | Mrs. Warren’s Profession, by George Bernard Shaw | https://github.com/standardebooks/george-bernard-shaw_mrs-warrens-profession |
| 369 | My First Summer in the Sierra, by John Muir | https://github.com/standardebooks/john-muir_my-first-summer-in-the-sierra |
| 370 | My Life in China and America, by Yung Wing | https://github.com/standardebooks/yung-wing_my-life-in-china-and-america |
| 371 | My Reminiscences, by Rabindranath Tagore. Translated by The Macmillan Company | https://github.com/standardebooks/rabindranath-tagore_my-reminiscences_the-macmillan-company |
| 372 | My Ántonia, by Willa Cather | https://github.com/standardebooks/willa-cather_my-antonia |
| 373 | New Grub Street, by George Gissing | https://github.com/standardebooks/george-gissing_new-grub-street |
| 374 | News from Nowhere, by William Morris | https://github.com/standardebooks/william-morris_news-from-nowhere |
| 375 | Nicholas Nickleby, by Charles Dickens | https://github.com/standardebooks/charles-dickens_nicholas-nickleby |
| 376 | Night and Day, by Virginia Woolf | https://github.com/standardebooks/virginia-woolf_night-and-day |
| 377 | No Name, by Wilkie Collins | https://github.com/standardebooks/wilkie-collins_no-name |
| 378 | North of Boston, by Robert Frost | https://github.com/standardebooks/robert-frost_north-of-boston |
| 379 | Northanger Abbey, by Jane Austen | https://github.com/standardebooks/jane-austen_northanger-abbey |
| 380 | Nostromo, by Joseph Conrad | https://github.com/standardebooks/joseph-conrad_nostromo |
| 381 | Notes from Underground, by Fyodor Dostoevsky. Translated by Constance Garnett | https://github.com/standardebooks/fyodor-dostoevsky_notes-from-underground_constance-garnett |
| 382 | Notre-Dame de Paris, by Victor Hugo. Translated by Isabel F. Hapgood | https://github.com/standardebooks/victor-hugo_notre-dame-de-paris_isabel-f-hapgood |
| 383 | Now It Can Be Told, by Philip Gibbs | https://github.com/standardebooks/philip-gibbs_now-it-can-be-told |
| 384 | O Pioneers!, by Willa Cather | https://github.com/standardebooks/willa-cather_o-pioneers |
| 385 | Old Indian Legends, by Zitkála-Šá | https://github.com/standardebooks/zitkala-sa_old-indian-legends |
| 386 | On a Chinese Screen, by W. Somerset Maugham | https://github.com/standardebooks/w-somerset-maugham_on-a-chinese-screen |
| 387 | On the Art of Reading, by Arthur Quiller-Couch | https://github.com/standardebooks/arthur-quiller-couch_on-the-art-of-reading |
| 388 | On the Art of Writing, by Arthur Quiller-Couch | https://github.com/standardebooks/arthur-quiller-couch_on-the-art-of-writing |
| 389 | On the Eve, by Ivan Turgenev. Translated by Constance Garnett | https://github.com/standardebooks/ivan-turgenev_on-the-eve_constance-garnett |
| 390 | On the Making of Man, by Gregory of Nyssa. Translated by William Moore and Henry Austin Wilson | https://github.com/standardebooks/gregory-of-nyssa_on-the-making-of-man_william-moore_henry-austin-wilson |
| 391 | Orlando Furioso, by Ludovico Ariosto. Translated by William Stewart Rose | https://github.com/standardebooks/ludovico-ariosto_orlando-furioso_william-stewart-rose |
| 392 | Orlando, by Virginia Woolf | https://github.com/standardebooks/virginia-woolf_orlando |
| 393 | Othello, by William Shakespeare | https://github.com/standardebooks/william-shakespeare_othello |
| 394 | Our American Cousin, by Tom Taylor | https://github.com/standardebooks/tom-taylor_our-american-cousin |
| 395 | Our Baseball Club and How It Won the Championship, by Noah Brooks | https://github.com/standardebooks/noah-brooks_our-baseball-club-and-how-it-won-the-championship |
| 396 | Our Mutual Friend, by Charles Dickens | https://github.com/standardebooks/charles-dickens_our-mutual-friend |
| 397 | Parisians in the Country, by Honoré de Balzac. Translated by Ellen Marriage | https://github.com/standardebooks/honore-de-balzac_parisians-in-the-country_ellen-marriage |
| 398 | Passages from the Life of a Philosopher, by Charles Babbage | https://github.com/standardebooks/charles-babbage_passages-from-the-life-of-a-philosopher |
| 399 | Payment Deferred, by C. S. Forester | https://github.com/standardebooks/c-s-forester_payment-deferred |
| 400 | Personal Memoirs of Ulysses S. Grant, by Ulysses S. Grant | https://github.com/standardebooks/ulysses-s-grant_personal-memoirs-of-ulysses-s-grant |
| 401 | Phineas Finn, by Anthony Trollope | https://github.com/standardebooks/anthony-trollope_phineas-finn |
| 402 | Pierre and Jean, by Guy de Maupassant. Translated by Clara Bell | https://github.com/standardebooks/guy-de-maupassant_pierre-and-jean_clara-bell |
| 403 | Plague of Pythons, by Frederik Pohl | https://github.com/standardebooks/frederik-pohl_plague-of-pythons |
| 404 | Plays, by Roswitha of Gandersheim. Translated by Christopher St. John | https://github.com/standardebooks/roswitha-of-gandersheim_plays_christopher-st-john |
| 405 | Plays, by Zeami Motokiyo. Translated by Frederick Victor Dickins, George Sansom, Ernest Fenollosa, Yone Noguchi, and Arthur Waley | https://github.com/standardebooks/zeami-motokiyo_plays_various-translators |
| 406 | Plum Bun, by Jessie Redmon Fauset | https://github.com/standardebooks/jessie-redmon-fauset_plum-bun |
| 407 | Pointed Roofs, by Dorothy M. Richardson | https://github.com/standardebooks/dorothy-m-richardson_pointed-roofs |
| 408 | Poor Folk, by Fyodor Dostoevsky. Translated by C. J. Hogarth | https://github.com/standardebooks/fyodor-dostoevsky_poor-folk_c-j-hogarth |
| 409 | Practical Mysticism, by Evelyn Underhill | https://github.com/standardebooks/evelyn-underhill_practical-mysticism |
| 410 | Principia Ethica, by G. E. Moore | https://github.com/standardebooks/g-e-moore_principia-ethica |
| 411 | Psmith in the City, by P. G. Wodehouse | https://github.com/standardebooks/p-g-wodehouse_psmith-in-the-city |
| 412 | Psmith, Journalist, by P. G. Wodehouse | https://github.com/standardebooks/p-g-wodehouse_psmith-journalist |
| 413 | Queen Victoria, by Lytton Strachey | https://github.com/standardebooks/lytton-strachey_queen-victoria |
| 414 | Quo Vadis, by Henryk Sienkiewicz. Translated by Jeremiah Curtin | https://github.com/standardebooks/henryk-sienkiewicz_quo-vadis_jeremiah-curtin |
| 415 | Racundra’s First Cruise, by Arthur Ransome | https://github.com/standardebooks/arthur-ransome_racundras-first-cruise |
| 416 | Ragged Dick, or, Street Life in New York with the Bootblacks, by Horatio Alger, Jr. | https://github.com/standardebooks/horatio-alger-jr_ragged-dick |
| 417 | Resurrection, by Leo Tolstoy. Translated by Louise Maude | https://github.com/standardebooks/leo-tolstoy_resurrection_louise-maude |
| 418 | Robbery Under Arms, by Rolf Boldrewood | https://github.com/standardebooks/rolf-boldrewood_robbery-under-arms |
| 419 | Romance, by Joseph Conrad and Ford Madox Ford | https://github.com/standardebooks/joseph-conrad_ford-madox-ford_romance |
| 420 | Romola, by George Eliot | https://github.com/standardebooks/george-eliot_romola |
| 421 | Saragossa, by Benito Pérez Galdós. Translated by Minna Caroline Smith | https://github.com/standardebooks/benito-perez-galdos_saragossa_minna-caroline-smith |
| 422 | Saïd the Fisherman, by Marmaduke Pickthall | https://github.com/standardebooks/marmaduke-pickthall_said-the-fisherman |
| 423 | Scarhaven Keep, by J. S. Fletcher | https://github.com/standardebooks/j-s-fletcher_scarhaven-keep |
| 424 | Scarlet Sister Mary, by Julia Peterkin | https://github.com/standardebooks/julia-peterkin_scarlet-sister-mary |
| 425 | School Stories, by P. G. Wodehouse | https://github.com/standardebooks/p-g-wodehouse_school-stories |
| 426 | Scrambles Amongst the Alps in the Years 1860–69, by Edward Whymper | https://github.com/standardebooks/edward-whymper_scrambles-amongst-the-alps-in-the-years-1860-69 |
| 427 | Search the Sky, by Frederik Pohl and C. M. Kornbluth | https://github.com/standardebooks/frederik-pohl_c-m-kornbluth_search-the-sky |
| 428 | Sense and Sensibility, by Jane Austen | https://github.com/standardebooks/jane-austen_sense-and-sensibility |
| 429 | Sentimental Education, by Gustave Flaubert. Translated by M. Walter Dunne | https://github.com/standardebooks/gustave-flaubert_sentimental-education_m-walter-dunne |
| 430 | She Stoops to Conquer, by Oliver Goldsmith | https://github.com/standardebooks/oliver-goldsmith_she-stoops-to-conquer |
| 431 | Shirley, by Charlotte Brontë | https://github.com/standardebooks/charlotte-bronte_shirley |
| 432 | Short Fiction, by Anthony Trollope | https://github.com/standardebooks/anthony-trollope_short-fiction |
| 433 | Short Fiction, by Cordwainer Smith | https://github.com/standardebooks/cordwainer-smith_short-fiction |
| 434 | Short Fiction, by Daphne du Maurier | https://github.com/standardebooks/daphne-du-maurier_short-fiction |
| 435 | Short Fiction, by E. M. Forster | https://github.com/standardebooks/e-m-forster_short-fiction |
| 436 | Short Fiction, by Edgar Allan Poe | https://github.com/standardebooks/edgar-allan-poe_short-fiction |
| 437 | Short Fiction, by Ernest Hemingway | https://github.com/standardebooks/ernest-hemingway_short-fiction |
| 438 | Short Fiction, by F. Scott Fitzgerald | https://github.com/standardebooks/f-scott-fitzgerald_short-fiction |
| 439 | Short Fiction, by Frederik Pohl | https://github.com/standardebooks/frederik-pohl_short-fiction |
| 440 | Short Fiction, by Gustave Flaubert. Translated by M. Walter Dunne | https://github.com/standardebooks/gustave-flaubert_short-fiction_m-walter-dunne |
| 441 | Short Fiction, by Guy de Maupassant. Translated by Ernest Boyd, Storm Jameson, Jeffery E. Jeffery, Lafcadio Hearn, M. Walter Dunne, Henry C. Olinger, Albert M. Cohn-McMaster, Dora Knowlton Ranous, Bigelow, Brown & Co., Inc., and Francis Steegmuller | https://github.com/standardebooks/guy-de-maupassant_short-fiction_various-translators |
| 442 | Short Fiction, by H. P. Lovecraft | https://github.com/standardebooks/h-p-lovecraft_short-fiction |
| 443 | Short Fiction, by Henry Kuttner | https://github.com/standardebooks/henry-kuttner_short-fiction |
| 444 | Short Fiction, by Herman Melville | https://github.com/standardebooks/herman-melville_short-fiction |
| 445 | Short Fiction, by Ivan Bunin. Translated by S. S. Koteliansky, D. H. Lawrence, Leonard Woolf, Bernard Guilbert Guerney and The Russian Review | https://github.com/standardebooks/ivan-bunin_short-fiction_various-translators |
| 446 | Short Fiction, by J. Sheridan Le Fanu | https://github.com/standardebooks/j-sheridan-le-fanu_short-fiction |
| 447 | Short Fiction, by Jonas Lie. Translated by Robert Nisbet Bain and Littell’s Living Age | https://github.com/standardebooks/jonas-lie_short-fiction_various-translators |
| 448 | Short Fiction, by Joseph Conrad | https://github.com/standardebooks/joseph-conrad_short-fiction |
| 449 | Short Fiction, by Kate Chopin | https://github.com/standardebooks/kate-chopin_short-fiction |
| 450 | Short Fiction, by Leo Tolstoy. Translated by Louise Maude, Aylmer Maude, Nathan Haskell Dole, Constance Garnett, J. D. Duff, Leo Wiener, R. S. Townsend, Hagberg Wright, Benjamin Tucker, Everyman’s Library, Vladimir Chertkov, and Isabella Fyvie Mayo | https://github.com/standardebooks/leo-tolstoy_short-fiction_various-translators |
| 451 | Short Fiction, by Leonid Andreyev. Translated by Herman Bernstein, Alexandra Linden, L. A. Magnus, K. Walter, W. H. Lowe, The Russian Review, Archibald J. Wolfe, John Cournos, R. S. Townsend, and Maurice Magnus | https://github.com/standardebooks/leonid-andreyev_short-fiction_various-translators |
| 452 | Short Fiction, by Mack Reynolds | https://github.com/standardebooks/mack-reynolds_short-fiction |
| 453 | Short Fiction, by Manly Wade Wellman | https://github.com/standardebooks/manly-wade-wellman_short-fiction |
| 454 | Short Fiction, by Nella Larsen | https://github.com/standardebooks/nella-larsen_short-fiction |
| 455 | Short Fiction, by Nikolai Gogol. Translated by Claud Field, Isabel F. Hapgood, Vizetelly and Company, and George Tolstoy | https://github.com/standardebooks/nikolai-gogol_short-fiction_various-translators |
| 456 | Short Fiction, by O. Henry | https://github.com/standardebooks/o-henry_short-fiction |
| 457 | Short Fiction, by P. G. Wodehouse | https://github.com/standardebooks/p-g-wodehouse_short-fiction |
| 458 | Short Fiction, by Ring Lardner | https://github.com/standardebooks/ring-lardner_short-fiction |
| 459 | Short Fiction, by Robert E. Howard | https://github.com/standardebooks/robert-e-howard_short-fiction |
| 460 | Short Fiction, by Saki | https://github.com/standardebooks/saki_short-fiction |
| 461 | Short Fiction, by Selma Lagerlöf. Translated by Pauline Bancroft Flach, Jessie Brochner and Velma Swanston Howard | https://github.com/standardebooks/selma-lagerlof_short-fiction_various-translators |
| 462 | Short Fiction, by Thomas Mann. Translated by Kenneth Burke, Herman George Scheffauer, and H. T. Lowe-Porter | https://github.com/standardebooks/thomas-mann_short-fiction_various-translators |
| 463 | Short Fiction, by Vladimir Korolenko. Translated by Aline Delano, Sergius Stepniak, William Westall, Thomas Seltzer, Marian Fell, Clarence Manning and The Russian Review | https://github.com/standardebooks/vladimir-korolenko_short-fiction_various-translators |
| 464 | Short Fiction, by Voltairine de Cleyre | https://github.com/standardebooks/voltairine-de-cleyre_short-fiction |
| 465 | Short Fiction, by Vsevolod Garshin. Translated by Rowland Smith | https://github.com/standardebooks/vsevolod-garshin_short-fiction_rowland-smith |
| 466 | Short Fiction, by Xavier de Maistre. Translated by John Andrews, Henry Attwell, H. C. Carey, and I. Lea | https://github.com/standardebooks/xavier-de-maistre_short-fiction_various-translators |
| 467 | Short Plays, by George Bernard Shaw | https://github.com/standardebooks/george-bernard-shaw_short-plays |
| 468 | Short Plays, by J. M. Synge | https://github.com/standardebooks/j-m-synge_short-plays |
| 469 | Shorts from Scenes from Private Life, by Honoré de Balzac. Translated by Clara Bell, Ellen Marriage, R. S. Scott, and Katharine Prescott Wormeley | https://github.com/standardebooks/honore-de-balzac_shorts-from-scenes-from-private-life_various-translators |
| 470 | Sibyl, by Benjamin Disraeli | https://github.com/standardebooks/benjamin-disraeli_sybil |
| 471 | Siddhartha, by Hermann Hesse. Translated by Gunther Olesch, Anke Dreher, Amy Coulter, Stefan Langer, and Semyon Chaichenets | https://github.com/standardebooks/hermann-hesse_siddhartha_various-translators |
| 472 | Sister Carrie, by Theodore Dreiser | https://github.com/standardebooks/theodore-dreiser_sister-carrie |
| 473 | Six Characters in Search of an Author, by Luigi Pirandello. Translated by Edward Storer | https://github.com/standardebooks/luigi-pirandello_six-characters-in-search-of-an-author_edward-storer |
| 474 | So Big, by Edna Ferber | https://github.com/standardebooks/edna-ferber_so-big |
| 475 | Something New, by P. G. Wodehouse | https://github.com/standardebooks/p-g-wodehouse_something-new |
| 476 | Sons and Lovers, by D. H. Lawrence | https://github.com/standardebooks/d-h-lawrence_sons-and-lovers |
| 477 | Spoon River Anthology, by Edgar Lee Masters | https://github.com/standardebooks/edgar-lee-masters_spoon-river-anthology |
| 478 | Summer, by Edith Wharton | https://github.com/standardebooks/edith-wharton_summer |
| 479 | Sunshine Sketches of a Little Town, by Stephen Leacock | https://github.com/standardebooks/stephen-leacock_sunshine-sketches-of-a-little-town |
| 480 | Suspense, by Henry Seton Merriman | https://github.com/standardebooks/henry-seton-merriman_suspense |
| 481 | Suspense, by Joseph Conrad | https://github.com/standardebooks/joseph-conrad_suspense |
| 482 | Suspiria de Profundis, by Thomas De Quincey | https://github.com/standardebooks/thomas-de-quincey_suspiria-de-profundis |
| 483 | Table-Talk, by William Hazlitt | https://github.com/standardebooks/william-hazlitt_table-talk |
| 484 | Tartuffe, by Molière. Translated by Curtis Hidden Page | https://github.com/standardebooks/moliere_tartuffe_curtis-hidden-page |
| 485 | The Able McLaughlins, by Margaret Wilson | https://github.com/standardebooks/margaret-wilson_the-able-mclaughlins |
| 486 | The Absolute at Large, by Karel Čapek. Translated by Šárka B. Hrbková | https://github.com/standardebooks/karel-capek_the-absolute-at-large_sarka-b-hrbkova |
| 487 | The Acquisitive Society, by R. H. Tawney | https://github.com/standardebooks/r-h-tawney_the-acquisitive-society |
| 488 | The Adventures of Sally, by P. G. Wodehouse | https://github.com/standardebooks/p-g-wodehouse_the-adventures-of-sally |
| 489 | The Age of Innocence, by Edith Wharton | https://github.com/standardebooks/edith-wharton_the-age-of-innocence |
| 490 | The Airlords of Han, by Philip Francis Nowlan | https://github.com/standardebooks/philip-francis-nowlan_the-airlords-of-han |
| 491 | The Alchemist, by Ben Jonson | https://github.com/standardebooks/ben-jonson_the-alchemist |
| 492 | The Art of Illustration, by C. H. Spurgeon | https://github.com/standardebooks/c-h-spurgeon_the-art-of-illustration |
| 493 | The Autobiography of Ma-Ka-Tai-Me-She-Kia-Kiak, or Black Hawk, by Black Hawk | https://github.com/standardebooks/black-hawk_the-autobiography-of-ma-ka-tai-me-she-kia-kiak-or-black-hawk |
| 494 | The Autobiography of an Ex-Colored Man, by James Weldon Johnson | https://github.com/standardebooks/james-weldon-johnson_the-autobiography-of-an-ex-colored-man |
| 495 | The Awakening, by Kate Chopin | https://github.com/standardebooks/kate-chopin_the-awakening |
| 496 | The Bellamy Trial, by Frances Noyes Hart | https://github.com/standardebooks/frances-noyes-hart_the-bellamy-trial |
| 497 | The Black Gang, by H. C. McNeile | https://github.com/standardebooks/h-c-mcneile_the-black-gang |
| 498 | The Black Moth, by Georgette Heyer | https://github.com/standardebooks/georgette-heyer_the-black-moth |
| 499 | The Black Opal, by Katharine Susannah Prichard | https://github.com/standardebooks/katharine-susannah-prichard_the-black-opal |
| 500 | The Black Star Passes, by John W. Campbell | https://github.com/standardebooks/john-w-campbell_the-black-star-passes |
| 501 | The Blithedale Romance, by Nathaniel Hawthorne | https://github.com/standardebooks/nathaniel-hawthorne_the-blithedale-romance |
| 502 | The Book of Tea, by Okakura Kakuzō | https://github.com/standardebooks/okakura-kakuzo_the-book-of-tea |
| 503 | The Brooklyn Murders, by G. D. H. Cole | https://github.com/standardebooks/g-d-h-cole_the-brooklyn-murders |
| 504 | The Brothers Karamazov, by Fyodor Dostoevsky. Translated by Constance Garnett | https://github.com/standardebooks/fyodor-dostoevsky_the-brothers-karamazov_constance-garnett |
| 505 | The Case with Nine Solutions, by J. J. Connington | https://github.com/standardebooks/j-j-connington_the-case-with-nine-solutions |
| 506 | The Celibates, by Honoré de Balzac. Translated by Clara Bell | https://github.com/standardebooks/honore-de-balzac_the-celibates_clara-bell |
| 507 | The Charterhouse of Parma, by Stendhal. Translated by C. K. Scott Moncrieff | https://github.com/standardebooks/stendhal_the-charterhouse-of-parma_c-k-scott-moncrieff |
| 508 | The City of God, by Augustine of Hippo. Translated by Marcus Dods, George Wilson, and J. J. Smith | https://github.com/standardebooks/augustine-of-hippo_the-city-of-god_marcus-dods_george-wilson_j-j-smith |
| 509 | The Clever Woman of the Family, by Charlotte M. Yonge | https://github.com/standardebooks/charlotte-m-yonge_the-clever-woman-of-the-family |
| 510 | The Comedy of Errors, by William Shakespeare | https://github.com/standardebooks/william-shakespeare_the-comedy-of-errors |
| 511 | The Coming Race, by Edward Bulwer-Lytton | https://github.com/standardebooks/edward-bulwer-lytton_the-coming-race |
| 512 | The Conjure Woman, by Charles W. Chesnutt | https://github.com/standardebooks/charles-w-chesnutt_the-conjure-woman |
| 513 | The Coral Island, by R. M. Ballantyne | https://github.com/standardebooks/r-m-ballantyne_the-coral-island |
| 514 | The Cords of Vanity, by James Branch Cabell | https://github.com/standardebooks/james-branch-cabell_the-cords-of-vanity |
| 515 | The Country of the Pointed Firs, by Sarah Orne Jewett | https://github.com/standardebooks/sarah-orne-jewett_the-country-of-the-pointed-firs |
| 516 | The Crock of Gold, by James Stephens | https://github.com/standardebooks/james-stephens_the-crock-of-gold |
| 517 | The Cruise of the Nona, by Hilaire Belloc | https://github.com/standardebooks/hilaire-belloc_the-cruise-of-the-nona |
| 518 | The Damnation of Theron Ware, by Harold Frederic | https://github.com/standardebooks/harold-frederic_the-damnation-of-theron-ware |
| 519 | The Dark Other, by Stanley G. Weinbaum | https://github.com/standardebooks/stanley-g-weinbaum_the-dark-other |
| 520 | The Dead Letter, by Metta Victor | https://github.com/standardebooks/metta-victor_the-dead-letter |
| 521 | The Demi-Gods, by James Stephens | https://github.com/standardebooks/james-stephens_the-demi-gods |
| 522 | The Devil’s Pool, by George Sand. Translated by Jane Minot Sedgwick and Ellery Sedgwick | https://github.com/standardebooks/george-sand_the-devils-pool_jane-minot-sedgwick_ellery-sedgwick |
| 523 | The Dewy Morn, by Richard Jefferies | https://github.com/standardebooks/richard-jefferies_the-dewy-morn |
| 524 | The Diary, by Samuel Pepys | https://github.com/standardebooks/samuel-pepys_the-diary |
| 525 | The Doctor’s Dilemma, by George Bernard Shaw | https://github.com/standardebooks/george-bernard-shaw_the-doctors-dilemma |
| 526 | The Documents in the Case, by Dorothy L. Sayers and Robert Eustace | https://github.com/standardebooks/dorothy-l-sayers_robert-eustace_the-documents-in-the-case |
| 527 | The Duchess of Malfi, by John Webster | https://github.com/standardebooks/john-webster_the-duchess-of-malfi |
| 528 | The End of the Tether, by Joseph Conrad | https://github.com/standardebooks/joseph-conrad_the-end-of-the-tether |
| 529 | The Faerie Queene, by Edmund Spenser | https://github.com/standardebooks/edmund-spenser_the-faerie-queene |
| 530 | The Fifth Queen, by Ford Madox Ford | https://github.com/standardebooks/ford-madox-ford_the-fifth-queen |
| 531 | The Final Count, by H. C. McNeile | https://github.com/standardebooks/h-c-mcneile_the-final-count |
| 532 | The Financier, by Theodore Dreiser | https://github.com/standardebooks/theodore-dreiser_the-financier |
| 533 | The Fire in the Flint, by Walter White | https://github.com/standardebooks/walter-white_the-fire-in-the-flint |
| 534 | The Forerunner, by Kahlil Gibran | https://github.com/standardebooks/kahlil-gibran_the-forerunner |
| 535 | The Forsyte Saga, by John Galsworthy | https://github.com/standardebooks/john-galsworthy_the-forsyte-saga |
| 536 | The Gadfly, by Ethel Voynich | https://github.com/standardebooks/ethel-voynich_the-gadfly |
| 537 | The Gambler, by Fyodor Dostoevsky. Translated by C. J. Hogarth | https://github.com/standardebooks/fyodor-dostoevsky_the-gambler_c-j-hogarth |
| 538 | The Getting of Wisdom, by Henry Handel Richardson | https://github.com/standardebooks/henry-handel-richardson_the-getting-of-wisdom |
| 539 | The Gold Bat, by P. G. Wodehouse | https://github.com/standardebooks/p-g-wodehouse_the-gold-bat |
| 540 | The Golden Bowl, by Henry James | https://github.com/standardebooks/henry-james_the-golden-bowl |
| 541 | The Good Soldier, by Ford Madox Ford | https://github.com/standardebooks/ford-madox-ford_the-good-soldier |
| 542 | The Great Impersonation, by E. Phillips Oppenheim | https://github.com/standardebooks/e-phillips-oppenheim_the-great-impersonation |
| 543 | The Green Mummy, by Fergus Hume | https://github.com/standardebooks/fergus-hume_the-green-mummy |
| 544 | The Hashish Eater, by Fitz Hugh Ludlow | https://github.com/standardebooks/fitz-hugh-ludlow_the-hashish-eater |
| 545 | The Haunted Bookshop, by Christopher Morley | https://github.com/standardebooks/christopher-morley_the-haunted-bookshop |
| 546 | The History of Henry Esmond, by William Makepeace Thackeray | https://github.com/standardebooks/william-makepeace-thackeray_the-history-of-henry-esmond |
| 547 | The Home and the World, by Rabindranath Tagore. Translated by Surendranath Tagore | https://github.com/standardebooks/rabindranath-tagore_the-home-and-the-world_surendranath-tagore |
| 548 | The Hoosier Schoolmaster, by Edward Eggleston | https://github.com/standardebooks/edward-eggleston_the-hoosier-schoolmaster |
| 549 | The House of the Arrow, by A. E. W. Mason | https://github.com/standardebooks/a-e-w-mason_the-house-of-the-arrow |
| 550 | The House of the Dead, by Fyodor Dostoevsky. Translated by Constance Garnett | https://github.com/standardebooks/fyodor-dostoevsky_the-house-of-the-dead_constance-garnett |
| 551 | The House on the Cliff, by Franklin W. Dixon | https://github.com/standardebooks/franklin-w-dixon_the-house-on-the-cliff |
| 552 | The Idiot, by Fyodor Dostoevsky. Translated by Eva M. Martin | https://github.com/standardebooks/fyodor-dostoevsky_the-idiot_eva-m-martin |
| 553 | The Inferno, by August Strindberg. Translated by Claud Field | https://github.com/standardebooks/august-strindberg_the-inferno_claud-field |
| 554 | The Inspector General, by Nikolai Gogol. Translated by Thomas Seltzer | https://github.com/standardebooks/nikolai-gogol_the-inspector-general_thomas-seltzer |
| 555 | The Jealousies of a Country Town, by Honoré de Balzac. Translated by Ellen Marriage | https://github.com/standardebooks/honore-de-balzac_the-jealousies-of-a-country-town_ellen-marriage |
| 556 | The Jew of Malta, by Christopher Marlowe | https://github.com/standardebooks/christopher-marlowe_the-jew-of-malta |
| 557 | The Jewels of Aptor, by Samuel R. Delany | https://github.com/standardebooks/samuel-r-delany_the-jewels-of-aptor |
| 558 | The Jungle, by Upton Sinclair | https://github.com/standardebooks/upton-sinclair_the-jungle |
| 559 | The King of Elfland’s Daughter, by Lord Dunsany | https://github.com/standardebooks/lord-dunsany_the-king-of-elflands-daughter |
| 560 | The Kingdom of God Is Within You, by Leo Tolstoy. Translated by Leo Wiener | https://github.com/standardebooks/leo-tolstoy_the-kingdom-of-god-is-within-you_leo-wiener |
| 561 | The Kural, by Thiruvalluvar. Translated by V. V. S. Aiyar | https://github.com/standardebooks/thiruvalluvar_the-kural_v-v-s-aiyar |
| 562 | The Lady of the Barge, by W. W. Jacobs | https://github.com/standardebooks/w-w-jacobs_the-lady-of-the-barge |
| 563 | The Land of Little Rain, by Mary Austin | https://github.com/standardebooks/mary-austin_the-land-of-little-rain |
| 564 | The Law and the Lady, by Wilkie Collins | https://github.com/standardebooks/wilkie-collins_the-law-and-the-lady |
| 565 | The Lazy Detective, by George Dilnot | https://github.com/standardebooks/george-dilnot_the-lazy-detective |
| 566 | The Lerouge Case, by Émile Gaboriau. Translated by Vizetelly and Company | https://github.com/standardebooks/emile-gaboriau_the-lerouge-case_vizetelly-and-company |
| 567 | The Life and Adventures of Robinson Crusoe, by Daniel Defoe | https://github.com/standardebooks/daniel-defoe_the-life-and-adventures-of-robinson-crusoe |
| 568 | The Little Demon, by Fyodor Sologub. Translated by John Cournos and Richard Aldington | https://github.com/standardebooks/fyodor-sologub_the-little-demon_john-cournos_richard-aldington |
| 569 | The Lives and Opinions of Eminent Philosophers, by Diogenes Laërtius | https://github.com/standardebooks/diogenes-laertius_the-lives-and-opinions-of-eminent-philosophers_c-d-yonge |
| 570 | The Lost Continent, by C. J. Cutcliffe Hyne | https://github.com/standardebooks/c-j-cutcliffe-hyne_the-lost-continent |
| 571 | The Luck of Barry Lyndon, by William Makepeace Thackeray | https://github.com/standardebooks/william-makepeace-thackeray_the-luck-of-barry-lyndon |
| 572 | The Madman, by Kahlil Gibran | https://github.com/standardebooks/kahlil-gibran_the-madman |
| 573 | The Magnificent Ambersons, by Booth Tarkington | https://github.com/standardebooks/booth-tarkington_the-magnificent-ambersons |
| 574 | The Maid of Sker, by R. D. Blackmore | https://github.com/standardebooks/r-d-blackmore_the-maid-of-sker |
| 575 | The Man in Lower Ten, by Mary Roberts Rinehart | https://github.com/standardebooks/mary-roberts-rinehart_the-man-in-lower-ten |
| 576 | The Man in the Queue, by Josephine Tey | https://github.com/standardebooks/josephine-tey_the-man-in-the-queue |
| 577 | The Mayor of Casterbridge, by Thomas Hardy | https://github.com/standardebooks/thomas-hardy_the-mayor-of-casterbridge |
| 578 | The Merchant of Venice, by William Shakespeare | https://github.com/standardebooks/william-shakespeare_the-merchant-of-venice |
| 579 | The Middle Five, by Francis La Flesche | https://github.com/standardebooks/francis-la-flesche_the-middle-five |
| 580 | The Middle of Things, by J. S. Fletcher | https://github.com/standardebooks/j-s-fletcher_the-middle-of-things |
| 581 | The Missing Chums, by Franklin W. Dixon | https://github.com/standardebooks/franklin-w-dixon_the-missing-chums |
| 582 | The Monk, by M. G. Lewis | https://github.com/standardebooks/m-g-lewis_the-monk |
| 583 | The Moonstone, by Wilkie Collins | https://github.com/standardebooks/wilkie-collins_the-moonstone |
| 584 | The Mule-Bone, by Langston Hughes and Zora Neale Hurston | https://github.com/standardebooks/langston-hughes_zora-neale-hurston_the-mule-bone |
| 585 | The Mystery of Edwin Drood, by Charles Dickens | https://github.com/standardebooks/charles-dickens_the-mystery-of-edwin-drood |
| 586 | The Mystery of Orcival, by Emile Gaboriau. Translated by Holt & Williams. | https://github.com/standardebooks/emile-gaboriau_the-mystery-of-orcival_holt-williams |
| 587 | The Mystery of the Barranca, by Herman Whitaker | https://github.com/standardebooks/herman-whitaker_the-mystery-of-the-barranca |
| 588 | The Narrative of Gordon Arthur Pym of Nantucket, by Edgar Allan Poe | https://github.com/standardebooks/edgar-allan-poe_the-narrative-of-arthur-gordon-pym-of-nantucket |
| 589 | The National Being, by George William Russell | https://github.com/standardebooks/george-william-russell_the-national-being |
| 590 | The Necromancers, by Robert Hugh Benson | https://github.com/standardebooks/robert-hugh-benson_the-necromancers |
| 591 | The Nigger of the Narcissus, by Joseph Conrad | https://github.com/standardebooks/joseph-conrad_the-nigger-of-the-narcissus |
| 592 | The Octopus, by Frank Norris | https://github.com/standardebooks/frank-norris_the-octopus |
| 593 | The Old Curiosity Shop, by Charles Dickens | https://github.com/standardebooks/charles-dickens_the-old-curiosity-shop |
| 594 | The Old English Baron, by Clara Reeve | https://github.com/standardebooks/clara-reeve_the-old-english-baron |
| 595 | The Old Wives’ Tale, by Arnold Bennett | https://github.com/standardebooks/arnold-bennett_the-old-wives-tale |
| 596 | The Painted Veil, by W. Somerset Maugham | https://github.com/standardebooks/w-somerset-maugham_the-painted-veil |
| 597 | The Paradise Mystery, by J. S. Fletcher | https://github.com/standardebooks/j-s-fletcher_the-paradise-mystery |
| 598 | The Path to Rome, by Hilaire Belloc | https://github.com/standardebooks/hilaire-belloc_the-path-to-rome |
| 599 | The Patient in Room 18, by Mignon G. Eberhart | https://github.com/standardebooks/mignon-g-eberhart_the-patient-in-room-18 |
| 600 | The Perfume of Eros, by Edgar Saltus | https://github.com/standardebooks/edgar-saltus_the-perfume-of-eros |
| 601 | The Pickwick Papers, by Charles Dickens | https://github.com/standardebooks/charles-dickens_the-pickwick-papers |
| 602 | The Pilgrim Kamanita, by Karl Gjellerup. Translated by John E. Logie | https://github.com/standardebooks/karl-gjellerup_the-pilgrim-kamanita_john-e-logie |
| 603 | The Pit-Prop Syndicate, by Freeman Wills Crofts | https://github.com/standardebooks/freeman-wills-crofts_the-pit-prop-syndicate |
| 604 | The Plastic Age, by Percy Marks | https://github.com/standardebooks/percy-marks_the-plastic-age |
| 605 | The Playboy of the Western World, by J. M. Synge | https://github.com/standardebooks/j-m-synge_the-playboy-of-the-western-world |
| 606 | The Portrait of a Lady, by Henry James | https://github.com/standardebooks/henry-james_the-portrait-of-a-lady |
| 607 | The Pothunters, by P. G. Wodehouse | https://github.com/standardebooks/p-g-wodehouse_the-pothunters |
| 608 | The Power of Darkness, by Leo Tolstoy. Translated by Louise Maude and Aylmer Maude | https://github.com/standardebooks/leo-tolstoy_the-power-of-darkness_louise-maude_aylmer-maude |
| 609 | The Prisoner in the Opal, by A. E. W. Mason | https://github.com/standardebooks/a-e-w-mason_the-prisoner-in-the-opal |
| 610 | The Private Memoirs and Confessions of a Justified Sinner, by James Hogg | https://github.com/standardebooks/james-hogg_the-private-memoirs-and-confessions-of-a-justified-sinner |
| 611 | The Professor’s House, by Willa Cather | https://github.com/standardebooks/willa-cather_the-professors-house |
| 612 | The Prophet, by Kahlil Gibran | https://github.com/standardebooks/kahlil-gibran_the-prophet |
| 613 | The Purple Land, by W. H. Hudson | https://github.com/standardebooks/w-h-hudson_the-purple-land |
| 614 | The Pursuit of God, by A. W. Tozer | https://github.com/standardebooks/a-w-tozer_the-pursuit-of-god |
| 615 | The Red Room, by August Strindberg. Translated by Ellie Schleussner | https://github.com/standardebooks/august-strindberg_the-red-room_ellie-schleussner |
| 616 | The Religion of Nature Delineated, by William Wollaston | https://github.com/standardebooks/william-wollaston_the-religion-of-nature-delineated |
| 617 | The Rescue, by Joseph Conrad | https://github.com/standardebooks/joseph-conrad_the-rescue |
| 618 | The Return of the Native, by Thomas Hardy | https://github.com/standardebooks/thomas-hardy_the-return-of-the-native |
| 619 | The Return, by Walter de la Mare | https://github.com/standardebooks/walter-de-la-mare_the-return |
| 620 | The Rubáiyát of Omar Khayyám, by Omar Khayyám. Translated by Edward Fitzgerald | https://github.com/standardebooks/omar-khayyam_the-rubaiyat-of-omar-khayyam_edward-fitzgerald |
| 621 | The Second Mrs. Tanqueray, by Arthur W. Pinero | https://github.com/standardebooks/arthur-w-pinero_the-second-mrs-tanqueray |
| 622 | The Secret of the Caves, by Franklin W. Dixon | https://github.com/standardebooks/franklin-w-dixon_the-secret-of-the-caves |
| 623 | The Secret of the Old Clock, by Carolyn Keene | https://github.com/standardebooks/carolyn-keene_the-secret-of-the-old-clock |
| 624 | The Secret of the Old Mill, by Franklin W. Dixon | https://github.com/standardebooks/franklin-w-dixon_the-secret-of-the-old-mill |
| 625 | The Shadow Line, by Joseph Conrad | https://github.com/standardebooks/joseph-conrad_the-shadow-line |
| 626 | The Shaving of Shagpat, by George Meredith | https://github.com/standardebooks/george-meredith_the-shaving-of-shagpat |
| 627 | The Shore Road Mystery, by Franklin W. Dixon | https://github.com/standardebooks/franklin-w-dixon_the-shore-road-mystery |
| 628 | The Sketch-Book of Geoffrey Crayon, Gent., by Washington Irving | https://github.com/standardebooks/washington-irving_the-sketchbook-of-geoffrey-crayon-gent |
| 629 | The Skylark of Space, by E. E. Smith | https://github.com/standardebooks/e-e-smith_the-skylark-of-space |
| 630 | The Slaves of Paris, by Emile Gaboriau. Translated by Charles Scribner’s Sons | https://github.com/standardebooks/emile-gaboriau_the-slaves-of-paris_charles-scribners-sons |
| 631 | The Song of the Lark, by Willa Cather | https://github.com/standardebooks/willa-cather_the-song-of-the-lark |
| 632 | The Sound and the Fury, by William Faulkner | https://github.com/standardebooks/william-faulkner_the-sound-and-the-fury |
| 633 | The Sowers, by Henry Seton Merriman | https://github.com/standardebooks/henry-seton-merriman_the-sowers |
| 634 | The Storm of Steel, by Ernst Jünger. Translated by Basil Creighton | https://github.com/standardebooks/ernst-junger_the-storm-of-steel_basil-creighton |
| 635 | The Story of Gösta Berling, by Selma Lagerlöf. Translated by Pauline Bancroft Flach | https://github.com/standardebooks/selma-lagerlof_the-story-of-gosta-berling_pauline-bancroft-flach |
| 636 | The Story of My Life, by Helen Keller | https://github.com/standardebooks/helen-keller_the-story-of-my-life |
| 637 | The Sundering Flood, by William Morris | https://github.com/standardebooks/william-morris_the-sundering-flood |
| 638 | The Surprising Adventures of Baron Munchausen, by Rudolph Erich Raspe | https://github.com/standardebooks/rudolph-erich-raspe_the-surprising-adventures-of-baron-munchausen |
| 639 | The Survivors, by Tom Godwin | https://github.com/standardebooks/tom-godwin_the-survivors |
| 640 | The Talleyrand Maxim, by J. S. Fletcher | https://github.com/standardebooks/j-s-fletcher_the-talleyrand-maxim |
| 641 | The Third Round, by H. C. McNeile | https://github.com/standardebooks/h-c-mcneile_the-third-round |
| 642 | The Tour, by Louis Couperus. Translated by Alexander Teixeira de Mattos | https://github.com/standardebooks/louis-couperus_the-tour_alexander-teixeira-de-mattos |
| 643 | The Tower Treasure, by Franklin W. Dixon | https://github.com/standardebooks/franklin-w-dixon_the-tower-treasure |
| 644 | The Tragical History of Doctor Faustus, by Christopher Marlowe | https://github.com/standardebooks/christopher-marlowe_the-tragical-history-of-doctor-faustus |
| 645 | The Trap, by Dorothy M. Richardson | https://github.com/standardebooks/dorothy-m-richardson_the-trap |
| 646 | The Turmoil, by Booth Tarkington | https://github.com/standardebooks/booth-tarkington_the-turmoil |
| 647 | The Turn of the Screw, by Henry James | https://github.com/standardebooks/henry-james_the-turn-of-the-screw |
| 648 | The Venetians, by M. E. Braddon | https://github.com/standardebooks/m-e-braddon_the-venetians |
| 649 | The Vicar of Wakefield, by Oliver Goldsmith | https://github.com/standardebooks/oliver-goldsmith_the-vicar-of-wakefield |
| 650 | The Virginian, by Owen Wister | https://github.com/standardebooks/owen-wister_the-virginian |
| 651 | The Vortex, by Noël Coward | https://github.com/standardebooks/noel-coward_the-vortex |
| 652 | The Voyage Out, by Virginia Woolf | https://github.com/standardebooks/virginia-woolf_the-voyage-out |
| 653 | The Vultures, by Henry Seton Merriman | https://github.com/standardebooks/henry-seton-merriman_the-vultures |
| 654 | The Walls of Jericho, by Rudolph Fisher | https://github.com/standardebooks/rudolph-fisher_the-walls-of-jericho |
| 655 | The Water of the Wondrous Isles, by William Morris | https://github.com/standardebooks/william-morris_the-water-of-the-wondrous-isles |
| 656 | The Way of the World, by William Congreve | https://github.com/standardebooks/william-congreve_the-way-of-the-world |
| 657 | The Well of the Saints, by J. M. Synge | https://github.com/standardebooks/j-m-synge_the-well-of-the-saints |
| 658 | The Wonderful Adventures of Nils, by Selma Lagerlöf. Translated by Velma Swanston Howard | https://github.com/standardebooks/selma-lagerlof_the-wonderful-adventures-of-nils_velma-swanston-howard |
| 659 | The Works of Max Beerbohm, by Max Beerbohm | https://github.com/standardebooks/max-beerbohm_the-works-of-max-beerbohm |
| 660 | The Wrong Letter, by Walter S. Masterman | https://github.com/standardebooks/walter-s-masterman_the-wrong-letter |
| 661 | The Young Visiters, by Daisy Ashford | https://github.com/standardebooks/daisy-ashford_the-young-visiters |
| 662 | This Side of Paradise, by F. Scott Fitzgerald | https://github.com/standardebooks/f-scott-fitzgerald_this-side-of-paradise |
| 663 | Three Lives, by Gertrude Stein | https://github.com/standardebooks/gertrude-stein_three-lives |
| 664 | Tom Brown’s School Days, by Thomas Hughes | https://github.com/standardebooks/thomas-hughes_tom-browns-school-days |
| 665 | Tractatus Logico-Philosophicus, by Ludwig Wittgenstein. Translated by C. K. Ogden | https://github.com/standardebooks/ludwig-wittgenstein_tractatus-logico-philosophicus_c-k-ogden |
| 666 | Trafalgar, by Benito Pérez Galdós. Translated by Clara Bell | https://github.com/standardebooks/benito-perez-galdos_trafalgar_clara-bell |
| 667 | Tragedy at Ravensthorpe, by J. J. Connington | https://github.com/standardebooks/j-j-connington_tragedy-at-ravensthorpe |
| 668 | Trent’s Last Case, by E. C. Bentley | https://github.com/standardebooks/e-c-bentley_trents-last-case |
| 669 | Typee, by Herman Melville | https://github.com/standardebooks/herman-melville_typee |
| 670 | Ulysses, by James Joyce | https://github.com/standardebooks/james-joyce_ulysses |
| 671 | Uncle Silas, by J. Sheridan Le Fanu | https://github.com/standardebooks/j-sheridan-le-fanu_uncle-silas |
| 672 | Uncle Tom’s Cabin, by Harriet Beecher Stowe | https://github.com/standardebooks/harriet-beecher-stowe_uncle-toms-cabin |
| 673 | Under Western Eyes, by Joseph Conrad | https://github.com/standardebooks/joseph-conrad_under-western-eyes |
| 674 | Up from Slavery, by Booker T. Washington | https://github.com/standardebooks/booker-t-washington_up-from-slavery |
| 675 | Vathek, by William Beckford. Translated by Samuel Henley | https://github.com/standardebooks/william-beckford_vathek_samuel-henley |
| 676 | Victory, by Joseph Conrad | https://github.com/standardebooks/joseph-conrad_victory |
| 677 | Vile Bodies, by Evelyn Waugh | https://github.com/standardebooks/evelyn-waugh_vile-bodies |
| 678 | Villette, by Charlotte Brontë | https://github.com/standardebooks/charlotte-bronte_villette |
| 679 | War and Peace, by Leo Tolstoy. Translated by Louise and Aylmer Maude | https://github.com/standardebooks/leo-tolstoy_war-and-peace_louise-maude_aylmer-maude |
| 680 | What Is Art?, by Leo Tolstoy. Translated by Aylmer Maude | https://github.com/standardebooks/leo-tolstoy_what-is-art_aylmer-maude |
| 681 | What Is Property?, by Pierre-Joseph Proudhon. Translated by Benjamin Tucker | https://github.com/standardebooks/pierre-joseph-proudhon_what-is-property_benjamin-tucker |
| 682 | What Is to Be Done?, by Nikolay Chernyshevsky. Translated by Nathan Haskell Dole and Simon S. Skidelsky | https://github.com/standardebooks/nikolay-chernyshevsky_what-is-to-be-done_nathan-haskell-dole_simon-s-skidelsky |
| 683 | Where Angels Fear to Tread, by E. M. Forster | https://github.com/standardebooks/e-m-forster_where-angels-fear-to-tread |
| 684 | Wieland, by Charles Brockden Brown | https://github.com/standardebooks/charles-brockden-brown_wieland |
| 685 | Wild Animals I Have Known, by Ernest Thompson Seton | https://github.com/standardebooks/ernest-thompson-seton_wild-animals-i-have-known |
| 686 | With Fire and Sword, by Henryk Sienkiewicz. Translated by Jeremiah Curtin | https://github.com/standardebooks/henryk-sienkiewicz_with-fire-and-sword_jeremiah-curtin |
| 687 | With the Empress Dowager of China, by Katharine A. Carl | https://github.com/standardebooks/katharine-a-carl_with-the-empress-dowager-of-china |
| 688 | Wolf Solent, by John Cowper Powys | https://github.com/standardebooks/john-cowper-powys_wolf-solent |
| 689 | Wonderful Adventures of Mrs. Seacole in Many Lands, by Mary Seacole | https://github.com/standardebooks/mary-seacole_wonderful-adventures-of-mrs-seacole-in-many-lands |
| 690 | Wuthering Heights, by Emily Brontë | https://github.com/standardebooks/emily-bronte_wuthering-heights |
| 691 | Years of Grace, by Margaret Ayer Barnes | https://github.com/standardebooks/margaret-ayer-barnes_years-of-grace |
| 692 | You Can’t Win, by Jack Black | https://github.com/standardebooks/jack-black_you-cant-win |
| 693 | You Never Can Tell, by George Bernard Shaw | https://github.com/standardebooks/george-bernard-shaw_you-never-can-tell |
| 694 | Zuleika Dobson, by Max Beerbohm | https://github.com/standardebooks/max-beerbohm_zuleika-dobson |
| 695 | Zuni Folktales, by Frank Hamilton Cushing | https://github.com/standardebooks/frank-hamilton-cushing_zuni-folktales |
| 696 | ’Midst the Wild Carpathians, by Mór Jókai. Translated by Robert Nisbet Bain | https://github.com/standardebooks/mor-jokai_midst-the-wild-carpathians_robert-nisbet-bain |
| 697 | “We”, by Charles A. Lindbergh | https://github.com/standardebooks/charles-a-lindbergh_we |

### B.2 OpenStax — 54 buku teks (CC BY 4.0; judul NC dibuang saat impor)

| No | Buku | Jenjang | Repositori |
|---|---|---|---|
| 1 | additive manufacturing | Mahasiswa/S1 | https://github.com/openstax/osbooks-additive-manufacturing |
| 2 | american government | Mahasiswa/S1 | https://github.com/openstax/osbooks-american-government |
| 3 | anatomy physiology | Mahasiswa/S1 | https://github.com/openstax/osbooks-anatomy-physiology |
| 4 | astronomy | Mahasiswa/S1 | https://github.com/openstax/osbooks-astronomy |
| 5 | biology | Mahasiswa/S1 | https://github.com/openstax/osbooks-biology-bundle |
| 6 | business ethics | Mahasiswa/S1 · Profesional | https://github.com/openstax/osbooks-business-ethics |
| 7 | business law | Mahasiswa/S1 · Profesional | https://github.com/openstax/osbooks-business-law |
| 8 | calculo | Mahasiswa/S1 | https://github.com/openstax/osbooks-calculo-bundle |
| 9 | calculus | Mahasiswa/S1 | https://github.com/openstax/osbooks-calculus-bundle |
| 10 | chemistry | Mahasiswa/S1 | https://github.com/openstax/osbooks-chemistry-bundle |
| 11 | college algebra | Mahasiswa/S1 | https://github.com/openstax/osbooks-college-algebra-bundle |
| 12 | college physics | Mahasiswa/S1 | https://github.com/openstax/osbooks-college-physics-bundle |
| 13 | college success | SMA · Mahasiswa/S1 | https://github.com/openstax/osbooks-college-success-bundle |
| 14 | contemporary mathematics | Mahasiswa/S1 | https://github.com/openstax/osbooks-contemporary-mathematics |
| 15 | entrepreneurship | Mahasiswa/S1 · Profesional | https://github.com/openstax/osbooks-entrepreneurship |
| 16 | fisica universitaria | Mahasiswa/S1 | https://github.com/openstax/osbooks-fisica-universitaria-bundle |
| 17 | fizyka | Mahasiswa/S1 | https://github.com/openstax/osbooks-fizyka-bundle |
| 18 | foundations information systems | Mahasiswa/S1 | https://github.com/openstax/osbooks-foundations-information-systems |
| 19 | introduccion estadistica | Mahasiswa/S1 | https://github.com/openstax/osbooks-introduccion-estadistica-bundle |
| 20 | introduction anthropology | Mahasiswa/S1 | https://github.com/openstax/osbooks-introduction-anthropology |
| 21 | introduction business | Mahasiswa/S1 · Profesional | https://github.com/openstax/osbooks-introduction-business |
| 22 | introduction intellectual property | Mahasiswa/S1 | https://github.com/openstax/osbooks-introduction-intellectual-property |
| 23 | introduction philosophy | Mahasiswa/S1 | https://github.com/openstax/osbooks-introduction-philosophy |
| 24 | introduction political science | Mahasiswa/S1 | https://github.com/openstax/osbooks-introduction-political-science |
| 25 | introduction python programming | Mahasiswa/S1 | https://github.com/openstax/osbooks-introduction-python-programming |
| 26 | introduction sociology | Mahasiswa/S1 | https://github.com/openstax/osbooks-introduction-sociology |
| 27 | introductory statistics | Mahasiswa/S1 | https://github.com/openstax/osbooks-introductory-statistics-bundle |
| 28 | life liberty and pursuit happiness | Mahasiswa/S1 | https://github.com/openstax/osbooks-life-liberty-and-pursuit-happiness |
| 29 | lifespan development | Mahasiswa/S1 | https://github.com/openstax/osbooks-lifespan-development |
| 30 | makroekonomia | Mahasiswa/S1 | https://github.com/openstax/osbooks-makroekonomia |
| 31 | microbiology | Mahasiswa/S1 | https://github.com/openstax/osbooks-microbiology |
| 32 | mikroekonomia | Mahasiswa/S1 | https://github.com/openstax/osbooks-mikroekonomia |
| 33 | neuroscience | Mahasiswa/S1 | https://github.com/openstax/osbooks-neuroscience |
| 34 | nursing external | Mahasiswa/S1 · Profesional | https://github.com/openstax/osbooks-nursing-external-bundle |
| 35 | organic chemistry | Mahasiswa/S1 | https://github.com/openstax/osbooks-organic-chemistry |
| 36 | physics | Mahasiswa/S1 | https://github.com/openstax/osbooks-physics |
| 37 | playground | Mahasiswa/S1 | https://github.com/openstax/osbooks-playground |
| 38 | prealgebra | SMP · SMA | https://github.com/openstax/osbooks-prealgebra-bundle |
| 39 | precalculo | Mahasiswa/S1 | https://github.com/openstax/osbooks-precalculo |
| 40 | principles accounting | Mahasiswa/S1 · Profesional | https://github.com/openstax/osbooks-principles-accounting-bundle |
| 41 | principles data science | Mahasiswa/S1 | https://github.com/openstax/osbooks-principles-data-science |
| 42 | principles economics | Mahasiswa/S1 · Profesional | https://github.com/openstax/osbooks-principles-economics-bundle |
| 43 | principles finance | Mahasiswa/S1 · Profesional | https://github.com/openstax/osbooks-principles-finance |
| 44 | principles marketing | Mahasiswa/S1 · Profesional | https://github.com/openstax/osbooks-principles-marketing |
| 45 | principles of management | Mahasiswa/S1 · Profesional | https://github.com/openstax/osbooks-principles-of-management-bundle |
| 46 | psychologia | Mahasiswa/S1 | https://github.com/openstax/osbooks-psychologia |
| 47 | psychology | Mahasiswa/S1 | https://github.com/openstax/osbooks-psychology |
| 48 | quimica | Mahasiswa/S1 | https://github.com/openstax/osbooks-quimica-bundle |
| 49 | statistics | Mahasiswa/S1 | https://github.com/openstax/osbooks-statistics |
| 50 | university physics | Mahasiswa/S1 | https://github.com/openstax/osbooks-university-physics-bundle |
| 51 | us history | Mahasiswa/S1 | https://github.com/openstax/osbooks-us-history |
| 52 | workplace software skills | Mahasiswa/S1 · Profesional | https://github.com/openstax/osbooks-workplace-software-skills |
| 53 | world history | Mahasiswa/S1 | https://github.com/openstax/osbooks-world-history |
| 54 | writing guide | Mahasiswa/S1 | https://github.com/openstax/osbooks-writing-guide |

### B.3 Book Dash — 1 repositori (CC BY 4.0)

- https://github.com/bookdash/bookdash-books — Book Dash books markdown-HTML workflow (TK · SD)

### B.4 GITenberg (Project Gutenberg di GitHub, ±74.000 repositori)

Tidak didaftar satu per satu di sini; diambil lewat pencarian `org:GITenberg` saat impor, dengan aturan domain publik Indonesia di atas.

**Jumlah repositori GitHub yang tercatat di Bagian B: 752** (target pemilik ≥ 500).

## Bagian C — Buku pelajaran Indonesia & tambahan 9 Nov 2026 (pemilik: „buku pelajaran dari SD, MI, SMP, Tsanawiyah, SMA, MA, SMK, MAK sampe ke Perguruan tinggi … buku cerita anak SD berkebun“)

Lisensi diperiksa 9 Nov 2026. „Dipakai“ = boleh tayang di situs beriklan dan dialihsuarakan.

| # | Sumber | Jenjang | Jumlah | Lisensi / izin | Keputusan |
|---|---|---|---|---|---|
| C1 | BSE 2008–2011 (Depdiknas/Pusat Perbukuan), indeks `github.com/Hans5958/Indeks-BSE` → `dataset/annibuku.json` | SD 1–6, SMP 7–9, SMA 10–12, **SMK 10–12** | ±1.200 (613 SMK) | hak cipta dibeli Depdiknas; halaman hak cipta: „dapat diunduh, digandakan, dicetak, dialihmediakan, atau difotokopi oleh masyarakat“ (penjualan komersial wajib ikut HET) | **Dipakai**; kalimat izin dicek otomatis per PDF, tidak dijual |
| C2 | BSE Kurikulum 2013 (bse.belajar.kemdikbud.go.id, bsd.pendidikan.id) | SD–SMA | 413 + 2.494 berkas | „Hak Cipta pada Kemendikbud, dilindungi undang-undang“; tanpa izin terbit ulang | **Belum** (hanya tautan ke sumber resmi) |
| C3 | Kurikulum Merdeka — SIBI (buku.kemdikbud.go.id) | PAUD–SMK | ribuan | gratis diunduh; lisensi tidak dinyatakan seragam | **Belum**; dicek per buku |
| C4 | Buku Teks Utama PAI & Bahasa Arab madrasah (Kemenag) | MI · MTs · MA · MAK | 90 | gratis diunduh; lisensi tidak dinyatakan | **Belum**; minta izin tertulis |
| C5 | Badan Bahasa — bahan bacaan literasi & cerita anak terjemahan (budi.kemendikdasmen.go.id) | PAUD–SD | 780+ digital, 3.270 terjemahan | per judul; sebagian CC BY-NC 4.0 | hanya judul CC BY/CC0 |
| C6 | OpenStax `openstax/osbooks-*` (53 repositori, 87 koleksi) | SMA · Perguruan tinggi | 4 berbahasa Inggris CC BY | Physics, Statistics, Life Liberty and the Pursuit of Happiness, Introduction to Intellectual Property = CC BY 4.0; 69 koleksi lain CC BY-NC-SA | 4 judul **dipakai**, sisanya ditolak |
| C7 | African Storybook `github.com/global-asp/asp-source` (+ `asp-imagebank`) | TK · SD · Bahasa asing | 368 Inggris + puluhan bahasa | CC BY per cerita (CC BY-NC dibuang) | **Dipakai** (Tunas, Lintas Bahasa) |
| C8 | Global-ASP `github.com/global-asp/global-asp` | TK · SD | 1 cerita bahasa Indonesia, banyak bahasa dunia | CC BY / CC BY-NC per cerita | judul CC BY dipakai |
| C9 | StoryWeaver (Pratham Books), Let's Read (The Asia Foundation), Bloom Library (Yayasan Literasi Anak Indonesia) | TK · SD | ratusan judul berbahasa Indonesia (berkebun, alam, keluarga …) | CC BY 4.0 per buku | importer berikutnya |

