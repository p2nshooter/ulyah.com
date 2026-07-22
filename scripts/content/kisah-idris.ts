/**
 * "Kisah Nabi Idris AS" — a complete, fully-grounded series drawn from the two
 * places the Qur'an names him: Maryam (19:56-57) and Al-Anbiya (21:85-86). The
 * Qur'an honors Idris with only a few ayat — a man of truth, a prophet raised
 * to a high station, counted among the patient and the righteous — so this
 * series is deliberately short but complete: it says everything the Qur'an says
 * and invents nothing. In keeping with docs/CONTENT-POLICY.md no Isra'iliyyat
 * (the later legends about Idris) is added, since those are not established by
 * the Qur'an or authentic report. ai_generated=0, status='published'.
 */

export interface IdrisEpisode {
  slug: string;
  surahId: number;
  ayahStart: number;
  ayahEnd: number;
  id: { title: string; body: string };
  en: { title: string; body: string };
}

export const KISAH_IDRIS_SERIES: IdrisEpisode[] = [
  {
    slug: "kisah-idris-01-seorang-yang-benar",
    surahId: 19,
    ayahStart: 56,
    ayahEnd: 57,
    id: {
      title: "Episode 1: Idris, Seorang yang Benar dan Diangkat ke Tempat Tinggi",
      body: `Di antara nama-nama para nabi yang Allah sebutkan dalam Al-Qur'an, ada satu nama yang disebut dengan pujian yang ringkas namun agung. Allah berfirman, "Dan ceritakanlah (Muhammad) kisah Idris di dalam Kitab (Al-Qur'an). Sesungguhnya dia adalah seorang yang sangat membenarkan dan seorang nabi" (QS. Maryam: 56).

Kata "shiddiq" (seorang yang sangat membenarkan) menunjukkan kejujuran dan keteguhan yang luar biasa dalam membenarkan kebenaran — bukan sekadar percaya, melainkan hidup di atasnya secara utuh. Itulah sifat yang Allah abadikan untuk Idris.

Lalu Allah menyebutkan kemuliaan yang Dia berikan kepadanya, "Dan Kami telah mengangkatnya ke martabat yang tinggi" (QS. Maryam: 57). Sebuah kedudukan mulia yang Allah tetapkan bagi hamba-Nya ini.

Hikmah: kemuliaan sejati datang dari Allah, dan ia diberikan kepada mereka yang jujur dalam membenarkan kebenaran. Al-Qur'an tidak memperpanjang kisah Idris dengan cerita-cerita, tetapi cukup dengan dua sifat — shiddiq dan nabi — untuk mengabadikan namanya sepanjang masa.`,
    },
    en: {
      title: "Episode 1: Idris, a Man of Truth Raised to a High Station",
      body: `Among the names of the prophets Allah mentions in the Qur'an, there is one named with brief yet mighty praise. Allah said, "And mention in the Book (the Qur'an) Idris. Indeed, he was a man of truth and a prophet" (Qur'an 19:56).

The word "siddiq" (a man of great truthfulness) points to an extraordinary honesty and firmness in affirming the truth — not merely to believe it, but to live upon it wholly. That is the quality Allah immortalized for Idris.

Then Allah mentioned the honor He gave him, "And We raised him to a high station" (19:57) — a noble rank Allah appointed for this servant of His.

Reflection: true honor comes from Allah, and it is granted to those who are truthful in affirming the truth. The Qur'an does not lengthen the story of Idris with tales, but two qualities — a man of truth and a prophet — suffice to immortalize his name for all time.`,
    },
  },
  {
    slug: "kisah-idris-02-di-antara-orang-sabar",
    surahId: 21,
    ayahStart: 85,
    ayahEnd: 86,
    id: {
      title: "Episode 2: Idris di Antara Orang-Orang yang Sabar dan Saleh",
      body: `Al-Qur'an menyebut Idris sekali lagi, kali ini bersama sejumlah nabi lain, untuk menegaskan sifat yang mempersatukan mereka. Allah berfirman, "Dan (ingatlah kisah) Ismail, Idris, dan Zulkifli. Mereka semua termasuk orang-orang yang sabar" (QS. Al-Anbiya: 85).

Kesabaran adalah benang yang menyatukan para nabi. Idris disebut sejajar dengan Ismail dan Zulkifli sebagai teladan kesabaran — sabar dalam menaati Allah, sabar dalam menyampaikan kebenaran, dan sabar menghadapi ujian kehidupan.

Allah lalu menyebutkan balasan bagi kesabaran itu, "Dan Kami masukkan mereka ke dalam rahmat Kami. Sesungguhnya mereka termasuk orang-orang yang saleh" (QS. Al-Anbiya: 86). Kesabaran mereka berujung pada rahmat Allah dan kesalehan yang kekal.

Hikmah: dua ayat ini melengkapi potret Idris — seorang yang benar, seorang nabi, yang diangkat ke tempat tinggi, dan termasuk hamba yang sabar lagi saleh. Inilah seluruh yang Al-Qur'an ajarkan tentangnya, dan itu sudah cukup untuk menjadikannya teladan: bahwa kejujuran dan kesabaran adalah jalan menuju rahmat Allah.`,
    },
    en: {
      title: "Episode 2: Idris Among the Patient and the Righteous",
      body: `The Qur'an names Idris once more, this time alongside several other prophets, to affirm the quality that unites them. Allah said, "And (mention) Ishmael, Idris, and Dhul-Kifl; all were of the patient" (Qur'an 21:85).

Patience is the thread that binds the prophets. Idris is named beside Ishmael and Dhul-Kifl as an example of patience — patient in obeying Allah, patient in conveying the truth, and patient before the trials of life.

Allah then mentioned the reward of that patience, "And We admitted them into Our mercy. Indeed, they were of the righteous" (21:86). Their patience led to Allah's mercy and a lasting righteousness.

Reflection: these two ayat complete the portrait of Idris — a man of truth, a prophet, raised to a high station, and among the patient and righteous servants. This is the whole of what the Qur'an teaches about him, and it is enough to make him an example: that truthfulness and patience are the path to Allah's mercy.`,
    },
  },
];
