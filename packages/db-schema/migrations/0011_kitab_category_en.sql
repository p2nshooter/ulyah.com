-- English names for the 38 kitab categories — these are standard, unambiguous
-- Islamic-studies classification terms (unlike the ~5k book descriptions,
-- which are long Arabic prose we cannot safely machine-translate without an
-- AI/translation API). Gives every non-Indonesian, non-Arabic visitor at
-- least the category structure in a language they read.

ALTER TABLE kitab_category ADD COLUMN name_en TEXT;

UPDATE kitab_category SET name_en = 'Qur''anic Exegesis (Tafsir)' WHERE slug = 'tafsir';
UPDATE kitab_category SET name_en = 'Qur''anic Sciences' WHERE slug = 'ulumul-quran';
UPDATE kitab_category SET name_en = 'Hadith Texts (Mutun)' WHERE slug = 'matan-hadits';
UPDATE kitab_category SET name_en = 'Hadith Commentary (Sharh)' WHERE slug = 'syarah-hadits';
UPDATE kitab_category SET name_en = 'Sciences of Hadith' WHERE slug = 'ulumul-hadits';
UPDATE kitab_category SET name_en = 'Hadith Fascicles (Ajza'')' WHERE slug = 'ajza-haditsiyah';
UPDATE kitab_category SET name_en = 'Takhrij & Zawa''id' WHERE slug = 'takhrij-zawaid';
UPDATE kitab_category SET name_en = '''Ilal & Su''alat (Hadith Criticism)' WHERE slug = 'ilal-sualat';
UPDATE kitab_category SET name_en = 'Hadith Manuscripts' WHERE slug = 'makhtutat-haditsiyah';
UPDATE kitab_category SET name_en = 'Islamic Creed (''Aqidah)' WHERE slug = 'aqidah';
UPDATE kitab_category SET name_en = 'Legal Theory & Maxims (Usul al-Fiqh)' WHERE slug = 'ushul-fiqh';
UPDATE kitab_category SET name_en = 'Hanafi Jurisprudence' WHERE slug = 'fiqh-hanafi';
UPDATE kitab_category SET name_en = 'Maliki Jurisprudence' WHERE slug = 'fiqh-maliki';
UPDATE kitab_category SET name_en = 'Shafi''i Jurisprudence' WHERE slug = 'fiqh-syafii';
UPDATE kitab_category SET name_en = 'Hanbali Jurisprudence' WHERE slug = 'fiqh-hanbali';
UPDATE kitab_category SET name_en = 'General Jurisprudence' WHERE slug = 'fiqh-umum';
UPDATE kitab_category SET name_en = 'Legal Rulings (Fatwas)' WHERE slug = 'fatawa';
UPDATE kitab_category SET name_en = 'Islamic Governance & Judiciary' WHERE slug = 'siyasah-syariyah';
UPDATE kitab_category SET name_en = 'Prophetic Biography & Character' WHERE slug = 'sirah-syamail';
UPDATE kitab_category SET name_en = 'History (Tarikh)' WHERE slug = 'tarikh';
UPDATE kitab_category SET name_en = 'Biographies of Scholars' WHERE slug = 'tarajim-thabaqat';
UPDATE kitab_category SET name_en = 'Genealogy' WHERE slug = 'ansab';
UPDATE kitab_category SET name_en = 'Geography & Travels' WHERE slug = 'buldan-jughrafiya';
UPDATE kitab_category SET name_en = 'Spiritual Refinement, Manners & Remembrance' WHERE slug = 'raqaiq-adab';
UPDATE kitab_category SET name_en = 'Da''wah & State of the Ummah' WHERE slug = 'dakwah';
UPDATE kitab_category SET name_en = 'Works of Ibn Taymiyyah' WHERE slug = 'kutub-ibnu-taimiyah';
UPDATE kitab_category SET name_en = 'Works of Ibn al-Qayyim' WHERE slug = 'kutub-ibnu-qayyim';
UPDATE kitab_category SET name_en = 'Works of Ibn Abi al-Dunya' WHERE slug = 'kutub-ibnu-abi-dunya';
UPDATE kitab_category SET name_en = 'Works of Al-Albani' WHERE slug = 'kutub-albani';
UPDATE kitab_category SET name_en = 'Arabic Grammar & Morphology' WHERE slug = 'nahwu-sharaf';
UPDATE kitab_category SET name_en = 'Literature & Rhetoric' WHERE slug = 'adab-balaghah';
UPDATE kitab_category SET name_en = 'Language Reference' WHERE slug = 'kutub-lughah';
UPDATE kitab_category SET name_en = 'Rare Words & Lexicons' WHERE slug = 'gharib-majim';
UPDATE kitab_category SET name_en = 'Research & Scholarly Issues' WHERE slug = 'buhuts-masail';
UPDATE kitab_category SET name_en = 'Anthologies & Journals' WHERE slug = 'jawami-majallat';
UPDATE kitab_category SET name_en = 'Book Indexes' WHERE slug = 'faharis';
UPDATE kitab_category SET name_en = 'Other Sciences' WHERE slug = 'ulum-ukhra';
UPDATE kitab_category SET name_en = 'General Islamic Books' WHERE slug = 'islamiyah-ammah';
