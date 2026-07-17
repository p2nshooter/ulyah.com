-- Multi-language support: voice_persona becomes language-aware so kisah/tafsir
-- narration switches together with the UI/content language (arsitektur doc
-- §28.3-§28.4 "suara yang sholeh" criteria — tenang, hangat, adab pelafalan —
-- extended across every supported locale, never applied to Qur'an recitation
-- itself which always stays the original qori audio regardless of locale).

ALTER TABLE voice_persona ADD COLUMN lang TEXT NOT NULL DEFAULT 'id';
ALTER TABLE voice_persona ADD COLUMN tts_voice_id TEXT;

-- Soft/warm neural voice picks (Microsoft Edge TTS voice catalogue — free,
-- high-quality neural voices covering all 8 supported UI languages).
-- Male, formal/authoritative -> tafsir & hadits. Female or gentle male,
-- warm -> kisah & hikmah, per doc §28.4 pemetaan persona.
INSERT INTO voice_persona (name, gender, tone_desc, tts_engine, lang, tts_voice_id) VALUES
  ('Ustadz Narator (ID)', 'male', 'Berwibawa, tenang, tempo sedang-lambat', 'edge-tts', 'id', 'id-ID-ArdiNeural'),
  ('Suara Hikmah Lembut (ID)', 'female', 'Ramah, lembut, hangat', 'edge-tts', 'id', 'id-ID-GadisNeural'),
  ('Reciter Narrator (EN)', 'male', 'Warm, measured, respectful', 'edge-tts', 'en', 'en-US-GuyNeural'),
  ('Gentle Storyteller (EN)', 'female', 'Soft, friendly, calm', 'edge-tts', 'en', 'en-US-JennyNeural'),
  ('Чтец-рассказчик (RU)', 'male', 'Спокойный, размеренный, уважительный', 'edge-tts', 'ru', 'ru-RU-DmitryNeural'),
  ('Мягкий голос мудрости (RU)', 'female', 'Тёплый, доброжелательный', 'edge-tts', 'ru', 'ru-RU-SvetlanaNeural'),
  ('Ruhiger Erzähler (DE)', 'male', 'Würdevoll, ruhig, respektvoll', 'edge-tts', 'de', 'de-DE-ConradNeural'),
  ('Sanfte Weisheitsstimme (DE)', 'female', 'Warm, freundlich', 'edge-tts', 'de', 'de-DE-KatjaNeural'),
  ('Narrateur Serein (FR)', 'male', 'Digne, calme, respectueux', 'edge-tts', 'fr', 'fr-FR-HenriNeural'),
  ('Voix Douce de Sagesse (FR)', 'female', 'Chaleureuse, amicale', 'edge-tts', 'fr', 'fr-FR-DeniseNeural'),
  ('راوٍ هادئ (AR)', 'male', 'وقور، هادئ، محترم', 'edge-tts', 'ar', 'ar-SA-HamedNeural'),
  ('صوت الحكمة اللطيف (AR)', 'female', 'دافئ وودود', 'edge-tts', 'ar', 'ar-SA-ZariyahNeural'),
  ('平和的讲述者 (ZH)', 'male', '庄重、平静、恭敬', 'edge-tts', 'zh', 'zh-CN-YunxiNeural'),
  ('温柔的智慧之声 (ZH)', 'female', '温暖、亲切', 'edge-tts', 'zh', 'zh-CN-XiaoxiaoNeural'),
  ('落ち着いたナレーター (JA)', 'male', '威厳があり、穏やかで敬意深い', 'edge-tts', 'ja', 'ja-JP-KeitaNeural'),
  ('やさしい知恵の声 (JA)', 'female', '温かく親しみやすい', 'edge-tts', 'ja', 'ja-JP-NanamiNeural');
