/** Paket latihan Bahasa Jepang — format JLPT (言語知識・読解). Kalimat dan soal orisinal LUAJA. */
import { pack, q, type PSet } from './types.ts';

const YOMI = '漢字読み', HYOKI = '表記', BUNMYAKU = '文脈規定', BUNPO = '文法', DOKKAI = '読解';
const H_YOMI = 'Pilih bacaan hiragana untuk kata dalam 【】.';
const H_HYOKI = 'Pilih tulisan kanji untuk kata dalam 【】.';
const H_BUN = 'Pilih kata yang paling tepat untuk (　).';

export const JA_SETS: PSet[] = [
  pack({
    id: 'ja-n5-p1', course: 'ja', level: 'n5', exam: 'jlpt', examName: 'JLPT N5 · 言語知識・読解', kind: 'simulasi', free: true, minutes: 20,
    title: 'Simulasi N5 · Paket 1', desc: 'Bacaan kanji, penulisan kanji, kosakata dalam konteks, partikel dasar dan bacaan pendek perkenalan diri.',
    passages: { p1: { title: '読解 — じこしょうかい', text: 'わたしは マリアです。ブラジルから きました。いま、とうきょうの だいがくで にほんごを べんきょうしています。まいにち 7じに おきます。あさごはんは パンと コーヒーです。' } },
  }, [
    q(YOMI, 'わたしは【学生】です。', ['がくせい', 'がっせい', 'がくせ', 'かくせい'], 0, '学生 = がくせい (pelajar).', { hint: H_YOMI }),
    q(YOMI, '【山】に のぼります。', ['かわ', 'やま', 'うみ', 'そら'], 1, '山 = やま (gunung).', { hint: H_YOMI }),
    q(YOMI, '【水】を のみます。', ['みず', 'みづ', 'すい', 'みすう'], 0, '水 = みず (air). すい adalah bacaan on (水曜日).', { hint: H_YOMI }),
    q(YOMI, 'あの【人】は せんせいです。', ['じん', 'にん', 'ひと', 'びと'], 2, 'Berdiri sendiri, 人 dibaca ひと (orang).', { hint: H_YOMI }),
    q(YOMI, '【毎日】 にほんごを べんきょうします。', ['まいにち', 'まいび', 'まいひ', 'めいにち'], 0, '毎日 = まいにち (setiap hari).', { hint: H_YOMI }),
    q(HYOKI, '【やま】が きれいです。', ['川', '山', '田', '出'], 1, 'やま = 山.', { hint: H_HYOKI }),
    q(HYOKI, '【せんせい】に ききます。', ['先生', '先正', '千生', '先性'], 0, 'せんせい = 先生.', { hint: H_HYOKI }),
    q(BUNMYAKU, 'のどが かわきました。（　）を のみたいです。', ['パン', 'みず', 'ほん', 'くつ'], 1, 'Haus → ingin minum air (みず).', { hint: H_BUN }),
    q(BUNMYAKU, 'さむいですから、（　）を きます。', ['コート', 'くつした', 'めがね', 'とけい'], 0, 'Dingin → memakai mantel. きます (着ます) dipakai untuk pakaian badan; kaus kaki memakai はきます.', { hint: H_BUN }),
    q(BUNMYAKU, '（　）で ほんを よみます。', ['としょかん', 'ゆうびんきょく', 'ぎんこう', 'えき'], 0, 'Membaca buku di perpustakaan (としょかん).', { hint: H_BUN }),
    q(BUNPO, 'わたし（　）がくせいです。', ['は', 'を', 'に', 'で'], 0, 'Penanda topik → は.', { hint: H_BUN }),
    q(BUNPO, 'まいあさ パン（　）たべます。', ['を', 'が', 'に', 'へ'], 0, 'Objek kata kerja → を.', { hint: H_BUN }),
    q(BUNPO, 'あした がっこう（　）いきます。', ['へ', 'を', 'の', 'も'], 0, 'Arah tujuan → へ (juga に).', { hint: H_BUN }),
    q(BUNPO, 'これは だれ（　）かばんですか。', ['の', 'を', 'が', 'で'], 0, 'Kepemilikan → の.', { hint: H_BUN }),
    q(DOKKAI, 'マリアさんは あさごはんに なにを たべますか。', ['ごはん', 'パン', 'さかな', 'たまご'], 1, '「あさごはんは パンと コーヒーです」.', { passage: 'p1' }),
  ]),
  pack({
    id: 'ja-n5-p2', course: 'ja', level: 'n5', exam: 'jlpt', examName: 'JLPT N5 · 言語知識・読解', kind: 'simulasi', minutes: 20,
    title: 'Simulasi N5 · Paket 2', desc: 'Kanji arah dan waktu, kata sifat, ungkapan sehari-hari, partikel と, bentuk lampau dan bacaan catatan harian.',
    passages: { p1: { title: '読解 — にっき', text: 'きょうは どようびです。わたしは 10じに おきました。ごごは ともだちと こうえんへ いきました。こうえんで しゃしんを とりました。よるは うちで テレビを みました。' } },
  }, [
    q(YOMI, '【日本】から きました。', ['にほん', 'にっぽんご', 'ひほん', 'にちほん'], 0, '日本 = にほん (juga にっぽん).', { hint: H_YOMI }),
    q(YOMI, '【大きい】 いえですね。', ['おおきい', 'おきい', 'だいきい', 'たいきい'], 0, '大きい = おおきい (besar).', { hint: H_YOMI }),
    q(YOMI, '【車】で いきます。', ['くるま', 'でんしゃ', 'じてんしゃ', 'しゃ'], 0, '車 berdiri sendiri = くるま (mobil).', { hint: H_YOMI }),
    q(YOMI, '【右】に まがって ください。', ['ひだり', 'みぎ', 'うえ', 'した'], 1, '右 = みぎ (kanan).', { hint: H_YOMI }),
    q(YOMI, '【先週】 きょうとへ いきました。', ['せんしゅう', 'さきしゅう', 'せんしゅ', 'ぜんしゅう'], 0, '先週 = せんしゅう (minggu lalu).', { hint: H_YOMI }),
    q(HYOKI, '【あめ】が ふっています。', ['雨', '両', '南', '再'], 0, 'あめ (hujan) = 雨.', { hint: H_HYOKI }),
    q(HYOKI, '【がっこう】へ いきます。', ['学校', '学候', '字校', '学交'], 0, 'がっこう = 学校.', { hint: H_HYOKI }),
    q(BUNMYAKU, 'この りんごは （　）です。ひとつ 100えんです。', ['やすい', 'ひくい', 'みじかい', 'せまい'], 0, 'Harga murah → やすい.', { hint: H_BUN }),
    q(BUNMYAKU, 'へやが くらいですから、でんきを （　）ください。', ['つけて', 'けして', 'しめて', 'あけて'], 0, 'Gelap → nyalakan lampu: でんきを つけて.', { hint: H_BUN }),
    q(BUNMYAKU, 'きのうは （　）でしたから、がっこうを やすみました。', ['びょうき', 'げんき', 'じょうず', 'きれい'], 0, 'Tidak masuk sekolah karena sakit (びょうき).', { hint: H_BUN }),
    q(BUNPO, 'にちようびに ともだち（　）えいがを みました。', ['と', 'を', 'が', 'へ'], 0, 'Bersama seseorang → と.', { hint: H_BUN }),
    q(BUNPO, 'きのう デパートへ（　）。', ['いきました', 'いきます', 'いきません', 'いって'], 0, 'きのう (kemarin) → bentuk lampau いきました.', { hint: H_BUN }),
    q(BUNPO, 'つくえの うえに ほんが（　）。', ['あります', 'います', 'いきます', 'きます'], 0, 'Benda mati berada → あります.', { hint: H_BUN }),
    q(BUNPO, 'この へやは しずか（　）きれいです。', ['で', 'くて', 'と', 'に'], 0, 'Kata sifat な dirangkai → しずかで.', { hint: H_BUN }),
    q(DOKKAI, 'この ひとは ごご なにを しましたか。', ['テレビを みました', 'こうえんで しゃしんを とりました', '10じに おきました', 'がっこうへ いきました'], 1, 'Siang hari ke taman dan memotret; televisi pada malam hari.', { passage: 'p1' }),
  ]),
  pack({
    id: 'ja-n5-p3', course: 'ja', level: 'n5', exam: 'jlpt', examName: 'JLPT N5 · 言語知識・読解', kind: 'simulasi', minutes: 20,
    title: 'Simulasi N5 · Paket 3', desc: 'Kanji arah mata angin, warna dan waktu, kosakata kegiatan harian, partikel waktu, なにも + negatif, どちら, dan memo singkat.',
    passages: { p1: { title: '読解 — メモ', text: 'リーさんへ\nきょう 6じに わたしの うちで パーティーを します。のみものは わたしが かいます。リーさんは ケーキを かって きて ください。\nたなか' } },
  }, [
    q(YOMI, '【東】の そらが あかるいです。', ['ひがし', 'にし', 'みなみ', 'きた'], 0, '東 = ひがし (timur).', { hint: H_YOMI }),
    q(YOMI, '【白い】 ねこが います。', ['しろい', 'くろい', 'あかい', 'あおい'], 0, '白い = しろい (putih).', { hint: H_YOMI }),
    q(YOMI, '【友だち】と あそびます。', ['ともだち', 'ゆうだち', 'ともたち', 'ともだし'], 0, '友だち = ともだち (teman).', { hint: H_YOMI }),
    q(YOMI, '【午後】 3じに あいましょう。', ['ごご', 'ごぜん', 'ごこ', 'ごうご'], 0, '午後 = ごご (siang/sore, p.m.).', { hint: H_YOMI }),
    q(YOMI, '【新しい】 くつを かいました。', ['あたらしい', 'あたしらい', 'あらたしい', 'しんしい'], 0, '新しい = あたらしい (baru).', { hint: H_YOMI }),
    q(HYOKI, '【みみ】が いたいです。', ['耳', '目', '口', '手'], 0, 'みみ (telinga) = 耳.', { hint: H_HYOKI }),
    q(HYOKI, '【でんしゃ】で かいしゃへ いきます。', ['電車', '雷車', '電単', '電東'], 0, 'でんしゃ = 電車.', { hint: H_HYOKI }),
    q(BUNMYAKU, 'ねる まえに はを （　）。', ['みがきます', 'あらいます', 'あびます', 'ふきます'], 0, 'Menyikat gigi = はを みがきます.', { hint: H_BUN }),
    q(BUNMYAKU, 'わたしの へやは （　）ですが、きれいです。', ['せまい', 'いそがしい', 'からい', 'わかい'], 0, 'Kamar sempit (せまい) tetapi bersih.', { hint: H_BUN }),
    q(BUNMYAKU, '（　）を かけて、しんぶんを よみます。', ['めがね', 'ぼうし', 'くつ', 'かさ'], 0, 'Memakai kacamata = めがねを かけます.', { hint: H_BUN }),
    q(BUNPO, 'まいばん 11じ（　）ねます。', ['に', 'を', 'で', 'が'], 0, 'Waktu tertentu (jam) → に.', { hint: H_BUN }),
    q(BUNPO, 'きのうは なにも（　）。', ['たべませんでした', 'たべました', 'たべます', 'たべません'], 0, 'なにも + bentuk negatif; kemarin → lampau negatif.', { hint: H_BUN }),
    q(BUNPO, 'コーヒーと こうちゃと、（　）が すきですか。', ['どちら', 'どれ', 'なに', 'だれ'], 0, 'Memilih di antara dua → どちら.', { hint: H_BUN }),
    q(BUNPO, 'すみません、しお（　）とって ください。', ['を', 'に', 'で', 'へ'], 0, 'Objek → を.', { hint: H_BUN }),
    q(DOKKAI, 'リーさんは なにを かいますか。', ['のみもの', 'ケーキ', 'くだもの', 'パン'], 1, 'Minuman dibeli Tanaka; Lee diminta membeli kue (ケーキ).', { passage: 'p1' }),
  ]),
  pack({
    id: 'ja-n4-p1', course: 'ja', level: 'n4', exam: 'jlpt', examName: 'JLPT N4 · 言語知識・読解', kind: 'simulasi', free: true, minutes: 25,
    title: 'Simulasi N4 · Paket 1', desc: 'Kanji N4, kosakata keterangan, pola 〜たことがある, 〜と, 〜てもらう, 〜ている/〜てある, 〜ようになる, 〜たほうがいい, dan pengumuman perpustakaan.',
    passages: { p1: { title: '読解 — お知らせ', text: 'お知らせ\n来週の月曜日は、そうじの ため、としょかんは 休みです。本を かえす 人は、入り口の 前の ポストに 入れて ください。' } },
  }, [
    q(YOMI, '【会議】は 3じからです。', ['かいぎ', 'かいき', 'あいぎ', 'えぎ'], 0, '会議 = かいぎ (rapat).', { hint: H_YOMI }),
    q(YOMI, 'きのう【病院】へ いきました。', ['びょういん', 'びよういん', 'ぴょういん', 'びょうえん'], 0, '病院 = びょういん (rumah sakit). びよういん berarti salon kecantikan.', { hint: H_YOMI }),
    q(YOMI, '【急いで】 ください。', ['いそいで', 'きゅうで', 'おそいで', 'いいそで'], 0, '急ぐ = いそぐ → いそいで.', { hint: H_YOMI }),
    q(HYOKI, '【かんたん】な もんだいです。', ['簡単', '間単', '簡短', '間短'], 0, 'かんたん (mudah) = 簡単.', { hint: H_HYOKI }),
    q(BUNMYAKU, 'えきまで あるいて （　）かかりますか。', ['どのくらい', 'どれ', 'どう', 'どちら'], 0, 'Menanyakan lama waktu → どのくらい.', { hint: H_BUN }),
    q(BUNMYAKU, 'あした テストが あるので、こんばんは （　）べんきょうします。', ['しっかり', 'ちょうど', 'だんだん', 'もうすぐ'], 0, 'Belajar dengan sungguh-sungguh → しっかり.', { hint: H_BUN }),
    q(BUNPO, '日本へ （　）ことが ありますか。', ['いった', 'いく', 'いって', 'いき'], 0, 'Pengalaman: bentuk た + ことが ある.', { hint: H_BUN }),
    q(BUNPO, 'この くすりを （　）と、ねむく なります。', ['のむ', 'のんだ', 'のんで', 'のみ'], 0, 'Akibat pasti: bentuk kamus + と.', { hint: H_BUN }),
    q(BUNPO, 'ははに にもつを （　）もらいました。', ['もって', 'もつ', 'もった', 'もち'], 0, 'Menerima bantuan: bentuk て + もらう.', { hint: H_BUN }),
    q(BUNPO, 'へやの でんきが （　）います。', ['ついて', 'つけて', 'つく', 'つけ'], 0, 'Keadaan (lampu menyala) → kata kerja intransitif つく → ついて います.', { hint: H_BUN }),
    q(BUNPO, 'れんしゅうして、ピアノが （　）ように なりました。', ['ひける', 'ひく', 'ひいた', 'ひいて'], 0, 'Perubahan kemampuan: bentuk potensial + ように なる.', { hint: H_BUN }),
    q(BUNPO, 'まどが （　）あります。', ['あけて', 'あいて', 'あく', 'あけ'], 0, 'Keadaan hasil tindakan sengaja: kata kerja transitif + てある → あけて あります.', { hint: H_BUN }),
    q(BUNPO, 'もっと やさいを （　）ほうが いいですよ。', ['たべた', 'たべて', 'たべ', 'たべれ'], 0, 'Saran: bentuk た + ほうが いい.', { hint: H_BUN }),
    q(DOKKAI, '来週の 月曜日、本を かえしたい 人は どう しますか。', ['としょかんの 中に 入る', '入り口の 前の ポストに 入れる', '火曜日まで まつ', 'うけつけに わたす'], 1, '「入り口の 前の ポストに 入れて ください」.', { passage: 'p1' }),
    q(DOKKAI, 'としょかんが 休みなのは どうしてですか。', ['そうじを するから', '本が ないから', 'げつようびは いつも 休みだから', 'ひとが いないから'], 0, '「そうじの ため」 = karena pembersihan.', { passage: 'p1' }),
  ]),
];
