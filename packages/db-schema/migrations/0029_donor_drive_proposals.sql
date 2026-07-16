-- Grand Donatur: the owner's curated target organizations, one per proposal
-- PDF in their Google Drive folder (1UmQS4mSAJ057qca8P4jpXmMGnWnqEYKs). Each
-- donor row links straight to its Drive proposal so the Grant composer can
-- open it in one click. Emails are deliberately LEFT EMPTY — contact
-- addresses must be looked up and entered by a human (or the AI-suggest
-- tool), never guessed. Country/language are public knowledge per org.

ALTER TABLE donor ADD COLUMN drive_proposal_url TEXT;


INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Qatar Foundation', 'foundation', 'Qatar', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/18t0QGkaP9Lj03QKnz1yo7DL4b8fEWmfI/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Qatar Foundation');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'LAZNAS Inisiatif Zakat Indonesia (IZI)', 'ngo', 'Indonesia', 'id', 'lead', 'manual', 'https://drive.google.com/file/d/1_s_adRSu2CumQkbC3TqGp5IzBou6s_Iw/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'LAZNAS Inisiatif Zakat Indonesia (IZI)');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'LAZNAS Yatim Mandiri', 'ngo', 'Indonesia', 'id', 'lead', 'manual', 'https://drive.google.com/file/d/1UJ1K8aYX7ku-7umcbL7JHwrAy4tBsikz/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'LAZNAS Yatim Mandiri');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'RAF Foundation (Thani Bin Abdullah Foundation for Humanitarian Services)', 'foundation', 'Qatar', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/1QALIMSBfx3UvwborCgKGoD1s1bHOX2Ue/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'RAF Foundation (Thani Bin Abdullah Foundation for Humanitarian Services)');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'King Fahd Complex for the Printing of the Holy Quran', 'ministry', 'Saudi Arabia', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/1cRtQd-OuT0VNNTRwxmGpf2Q1WsP92hsl/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'King Fahd Complex for the Printing of the Holy Quran');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Australian Federation of Islamic Councils (AFIC)', 'ngo', 'Australia', 'en', 'lead', 'manual', 'https://drive.google.com/file/d/1hGOIZ9enZye22dnO22O1bKP522jRtxQa/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Australian Federation of Islamic Councils (AFIC)');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Jordan Hashemite Charity Organization (JHCO)', 'ngo', 'Jordan', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/1yw30lPeCSP2UY0IJJQc42V_BpyRBxBoW/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Jordan Hashemite Charity Organization (JHCO)');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'IHH Humanitarian Relief Foundation', 'ngo', 'Turkey', 'tr', 'lead', 'manual', 'https://drive.google.com/file/d/1uE4rZtElbbyv8kw3rotDdJi7Jcuy_MFn/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'IHH Humanitarian Relief Foundation');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Pillars Fund', 'philanthropy', 'United States', 'en', 'lead', 'manual', 'https://drive.google.com/file/d/1PPEmSruvG384PZ1Oq6C5wD-hYdeKVb3B/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Pillars Fund');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Sharjah Charity International', 'ngo', 'United Arab Emirates', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/1ei-LwwNhcyu_kRgLNCRPgxKInExURKpb/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Sharjah Charity International');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Islamic Relief Deutschland', 'ngo', 'Germany', 'de', 'lead', 'manual', 'https://drive.google.com/file/d/1Qz33ixt6rXZn4LdC_jnQkT3j8RSeyPI9/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Islamic Relief Deutschland');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Kuwait Awqaf Public Foundation (KAPF)', 'foundation', 'Kuwait', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/1u8yH6tNDKKOjgepzyz8aMqUPUDhz460C/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Kuwait Awqaf Public Foundation (KAPF)');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Ministry of Endowments and Religious Affairs', 'ministry', 'Oman', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/1bijlM1DEk_ZfZg2OAh92pDE3zYXxoRZ5/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Ministry of Endowments and Religious Affairs');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'LAZNAS Nurul Hayat', 'ngo', 'Indonesia', 'id', 'lead', 'manual', 'https://drive.google.com/file/d/1RlXfqdaRdR75p9MDBPAwoJdQ4PvEUlRs/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'LAZNAS Nurul Hayat');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Yayasan Sultan Haji Hassanal Bolkiah', 'foundation', 'Brunei Darussalam', 'ms', 'lead', 'manual', 'https://drive.google.com/file/d/1bqdFPKC86kh0Ks9DODnc4n31rWqNoFZz/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Yayasan Sultan Haji Hassanal Bolkiah');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'LAZISMU & NU CARE-LAZISNU', 'ngo', 'Indonesia', 'id', 'lead', 'manual', 'https://drive.google.com/file/d/1F4p5_8XBFwE51aSJb45hWNw8R9Q-9fHl/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'LAZISMU & NU CARE-LAZISNU');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Alwaleed Philanthropies', 'philanthropy', 'Saudi Arabia', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/1O2XURexLA9TJbkss9Dm25DbYfyTW35nY/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Alwaleed Philanthropies');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Sulaiman Bin Abdul Aziz Al-Rajhi Charitable Foundation', 'foundation', 'Saudi Arabia', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/1Mr7g4tEaM0ZesorySgN6-Z-Wiv764kL9/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Sulaiman Bin Abdul Aziz Al-Rajhi Charitable Foundation');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Direct Aid Society', 'ngo', 'Kuwait', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/1xc7oe8Ntc7gSm7X-DxJAeT29XwcHpiC9/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Direct Aid Society');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Awqaf Dubai (Awqaf and Minors Affairs Foundation)', 'foundation', 'United Arab Emirates', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/1lZ9axHvPQ3ByIyWHV1xtlAnWXcmk8B5q/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Awqaf Dubai (Awqaf and Minors Affairs Foundation)');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Zakat House Kuwait', 'ministry', 'Kuwait', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/1fJJ2iZKzZGIhOr_YotzxIsDuCZlqMR9L/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Zakat House Kuwait');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'The Barakat Trust', 'foundation', 'United Kingdom', 'en', 'lead', 'manual', 'https://drive.google.com/file/d/1o7LOtTQVqbFfl18eXcm0_gZyWLRVOKaM/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'The Barakat Trust');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'King Salman Humanitarian Aid and Relief Centre (KSrelief)', 'ministry', 'Saudi Arabia', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/1ZnNJ6uC0G5VivIhapQ6DIm0dNSIQLcr5/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'King Salman Humanitarian Aid and Relief Centre (KSrelief)');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Secours Islamique France (SIF)', 'ngo', 'France', 'fr', 'lead', 'manual', 'https://drive.google.com/file/d/1kgH3TQX_04KwBf_6bpQiEgsjmg6joSS1/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Secours Islamique France (SIF)');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Ansaar Foundation', 'ngo', NULL, 'en', 'lead', 'manual', 'https://drive.google.com/file/d/1WOddr-Z1kH5q4_F1N_ECBcwL4_Vcp6Mv/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Ansaar Foundation');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Mohammed Bin Rashid Al Maktoum Knowledge Foundation (MBRF)', 'foundation', 'United Arab Emirates', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/1cOtGX5A-F8F2ygIrLp-1vVXOhbkxLY_9/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Mohammed Bin Rashid Al Maktoum Knowledge Foundation (MBRF)');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Ministry of Islamic Affairs, Dawah and Guidance', 'ministry', 'Saudi Arabia', 'ar', 'lead', 'manual', 'https://drive.google.com/file/d/1iGcS_OMQ11sHR430ITWnp1yPA4iA_SCj/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Ministry of Islamic Affairs, Dawah and Guidance');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Dubai Cares', 'philanthropy', 'United Arab Emirates', 'en', 'lead', 'manual', 'https://drive.google.com/file/d/1NR0TYOq-jgJHFDuAEtH6rjitj6L98dXp/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Dubai Cares');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Dompet Dhuafa', 'ngo', 'Indonesia', 'id', 'lead', 'manual', 'https://drive.google.com/file/d/1w91CnzYSdMCjklXGYxakbndLgB7CHToO/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Dompet Dhuafa');

INSERT INTO donor (org_name, org_type, country, language, status, source, drive_proposal_url)
SELECT 'Majlis Ugama Islam Singapura (MUIS)', 'ministry', 'Singapore', 'en', 'lead', 'manual', 'https://drive.google.com/file/d/1smelqGSdetxHX1Iz2dFkxJQ9GpWSNc_A/view'
WHERE NOT EXISTS (SELECT 1 FROM donor WHERE org_name = 'Majlis Ugama Islam Singapura (MUIS)');
