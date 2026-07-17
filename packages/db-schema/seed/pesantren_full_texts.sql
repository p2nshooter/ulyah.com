-- Full Arabic texts for the Kitab Pesantren library, parsed from the
-- OpenITI corpus (public-domain Shamela digitisations; per-book source URIs
-- in the comments below). Structure verified per book before parsing.
-- translation_id is NULL throughout: terjemah must come from a verified
-- source, never machine-filled here (the reader shows Arabic; narration
-- works in Arabic). New bab_order starts at 100 to never collide with the
-- existing hand-curated bab rows.


-- ═══ safinah — OpenITI 1271SalimHadrami.MatnSafinatNaja.ShamAY0037367-ara1 ═══
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('safinah', 100, 'Teks Lengkap (66 Fasal)', 'متن سفينة النجاة — النص الكامل');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'بسم الله الرحمن الرحيم الحمد لله رب العالمين ، وبه نستعين على أمور الدنيا والدين ،وصلى الله وسلم على سيدنا محمد خاتم النبيين ،واله وصحبه أجمعين ، ولاحول ولا قوة إلا بالله العلي العظيم ،', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, '(فصل) أركان الإسلام خمسة : شهادة أن لاإله إلاالله وأن محمد رسول الله وإقام الصلاة ، وإيتاء الزكاة , وصوم رمضان ، وحج البيت من استطاع إليه سبيلا .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, '(فصل ) أركان الإيمان ستة: أن تؤمن بالله ، وملائكته، وكتبه ، وباليوم الآخر ، وبالقدر خيره وشره من الله تعالى .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, '(فصل ) ومعنى لاإله إلاالله : لامعبود بحق في الوجود إلا الله .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, '(فصل ) علامات البلوغ ثلاث : تمام خمس عشرة سنه في الذكروالأنثى ، والاحتلام في الذكر والأنثى لتسع سنين ، والحيض في الأنثى لتسع سنين .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, '(فصل) شروط إجزاء الحجر ثمانية: أن يكون بثلاثة أحجار ، وأن ينقي المحل ، وأن لا يجف النجس ، ولا ينتقل ، ولا يطرأ عليه آخر ، ولا يجاوز صفحته وحشفته ، ولا يصيبه ماء ، وأن تكون الأحجار طاهرة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, '(فصل ) فروض الوضوء ستة: الأول:النية ، الثاني : غسل الوجه ، الثالث: غسل اليدين مع المرفقين ، الرابع : مسح شيء من الرأس ، الخامس : غسل الرجلين مع الكعبين ، السادس :الترتيب .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, '(فصل ) النية : قصد الشيء مقترنا بفعله ، ومحلها القلب والتلفظ بها سنة ، ووقتها عند غسل أول جزء من الوجه ، والترتيب أن لا يقدم عضو على عضو .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, NULL, '(فصل ) الماء قليل وكثير : القليل مادون القلتين ، والكثير قلتان فأكثر. القليل يتنجس بوقوع النجاسة فيه وإن لم يتغير . والماء الكثير لا يتنجس إلا إذا تغير طعمه أو لونه أو ريحه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, NULL, '(فصل ) موجبات الغسل ستة: إيلاج الحشفة في الفرج ، وخروج المنى والحيض والنفاس والولادة والموت .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 11, NULL, NULL, '(فصل ) فروض الغسل اثنان : النية ، وتعميم البدن بالماء .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 12, NULL, NULL, '(فصل ) شروط الوضوء عشرة : الإسلام ، والتمييز ، والنقاء ، عن الحيض ، والنفاس ، وعما يمنع وصول الماء إلى البشرة ، وأن لا يكون على العضو ما يغير الماء الطهور ، ودخول الوقت ، والموالاة لدائم الحدث.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 13, NULL, NULL, '(فصل ) نوا قض الوضوء أربعة أشياء : (الأول) الخارج من أحد السبيلين من قبل أو دبر ريح أو غيره إلا المنى ، (الثاني ) زوال العقل بنوم أو غيره إلا نوم قاعد ، ممكن مقعده ms01 من الأرض ، (الثالث) التقاء بشرتي رجل وامرأة كبيرين من غير حائل ، (الرابع ) مس قبل الآدمي أو حلقة دبره ببطن الراحة أو بطون الأصابع .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 14, NULL, NULL, '(فصل ) من انتقض وضوؤه حرم عليه أربعه أشياء : الصلاة والطواف ومس المصحف وحمله. ويحرم على الجنب ستة أشياء: الصلاة والطواف ومس المصحف وحمله واللبث في المسجد وقراءة القرآن. ويحرم بالحيض عشرة أشياء : الصلاة والطواف ومس المصحف وحمله واللبث في المسجد وقراءة القرآن والصوم والطلاق والمرور في المسجد إن خافت تلويثه والاستمتاع بما بين السرة والركبة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 15, NULL, NULL, '(فصل) أسباب التيمم ثلاثة: فقد الماء ، والمرض ، والاحتياج إليه لعطش حيوان محترم . غير المحترم ستة : تارك الصلاة والزاني المحصن والمرتد والكافر الحربي والكلب العقور والخنزير .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 16, NULL, NULL, '(فصل ) شروط التيمم عشرة: أن يكون بتراب وان يكون التراب طاهرا وأن لا يكون مستعملا ولا يخالطه دقيق ونحوه وأن يقصده وأن يمسح وجهه ويديه بضربتين وأن يزيل النجاسة أولا وأن يجتهد في القبلة قبله وأن يكون التيمم بعد دخول الوقت وأن يتيمم لكل فرض .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 17, NULL, NULL, '(فصل) فروض التيمم خمسة : الأول : نقل التراب ، الثاني : النية ، الثالث : مسح الوجه ، الرابع : مسح اليدين إلى المرفقين ، الخامس : الترتيب بين المسحتين .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 18, NULL, NULL, '(فصل) مبطلات التيمم أربعة : ما أبطل الوضوء والردة وتوهم الماء إن تيمم لفقده والشك .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 19, NULL, NULL, '(فصل ) الذي يظهر من النجاسة ثلاثة : الخمر إذا تخللت بنفسها . وجلد الميتة إذا دبغ وما صارا حيوانا .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 20, NULL, NULL, '(فصل) النجاسة ثلاثه : مغلظة ومخففة ومتوسطة . المغلظة : نجاسة الكلب والخنزير وفرع أحدهما . والمخففة : بول الصبي الذي لم يطعم غير اللبن ولم يبلغ الحولين. والمتوسطة : سائر النجاسات.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 21, NULL, NULL, '(فصل ) المغلظة : تطهر بسبع غسلات بعد إزالة عينها ،إحداهن بتراب . والمخففة : تطهر برش الماء عليها مع الغلبة وإزالة عينها . والمتوسطة تنقسم إلى قسمين: عينية وحكميه . العينية : التي لها لون وريح وطعم فلا بد من إزالة لونها وريحها وطعمها . والحكمية : التي لا لون لها ولا ريح ولاطعم لها يكفيك جري الماء عليها .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 22, NULL, NULL, '(فصل) أقل الحيض : يوم وليله وغالبة ستة أوسبع وأكثره خمسة عشرة يوما بلياليها . أقل الطهر بين الحيضتين خمسة عشرة يوما وغالبه أربعة وعشرون ms02 يوما أو ثلاثة وعشرون يوما ولاحد لأكثرة .أقل النفاس مجة وغالبة أربعون يوما وأكثرة ستون يوما.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 23, NULL, NULL, '(فصل ) أعذار الصلاة اثنان : النوم والنسيان .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 24, NULL, NULL, '(فصل) شروط الصلاة ثمانية : طهارة الحدثين والطهارة عن النجاسة في الثوب والبدن والمكان وستر العورة واستقبال القبلة ودخول الوقت والعلم بفريضتة وأن لايعتقد فرضا من فروضها سنة واجتناب المبطلات . الأحداث اثنان : أصغر وأكبر . فالأصغر ماأوجب الوضوء . والأكبر ماأوجب الغسل العورات أربع : عورة الرجل مطلقا والأمة في الصلاة ما بين السرة والركبة . (فصل ) أركان الصلاة سبعة عشر : الأول النية ،الثاني تكبيرة الإحرام ، الثالث القيام على القادر في الفرض ،الرابع قراءة الفاتحة ، الخامس الركوع ، السادس الطمأنينة فية ، السابع الإعتدال ،الثامن الطمأنينة فيه ، التاسع السجود مرتين ،العاشر الطمأنينة فية ، الحادي عشر الجلوس بين السجدتين ، الثاني عشر الطمأنينة فية ،الثالث عشر التشهد الأخير ،الرابع عشر القعود فيه ،الخامس عشر : الصلاة على النبي صلى الله عليه وسلم ،السادس عشر السلام ،السابع عشر الترتيب .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 25, NULL, NULL, '(فصل) النيه ثلاث درجات : إن كانت الصلاة فرضا وجب قصد الفعل والتعيين والفرضية وإن كانت نافلة مؤقتة كراتبة او ذات سبب وجب قصد الفعل والتعيين ، وان كانت نافلة مطلقة وجب قصد الفعل فقط . الفعل :أصلي والتعيين: ظهرا أو عصرا والفرضية : فرضا .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 26, NULL, NULL, '(فصل) شروط تكبيرة الإحرام : ستة عشرة أن تقع حالة القيام في الفرض وأن تكون بالعربيه وأن تكون بلفظ الجلالة وبلفظ أكبر والترتيب بين اللفظتين وأن لايمد همزة الجلالة وعدم مد باء أكبر وأن لا يشدد الباء وأن لايزيد واوا ساكنة أو متحركة بين الكلمتين ، وأن لايزيد واوا قبل الجلالة وأن لايقف بين كلمتي التكبير وقفة طويلة ولا قصيرة ، وأن يسمع نفسة جميع حروفها ودخول الوقت في المؤقت وإيقاعها حال الإستقبال وأن لا يخل بحرف من حروفها وتأخير تكبيرة المأموم عن تكبيرة الإمام.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 27, NULL, NULL, '(فصل ) شروط الفاتحة عشرة : الترتيب والموالاة ومراعاة تشديداتها وأن لا يسكت سكتة طويلة ولا قصيرة يقصد قطع القراءة وقراءة كل آياتها ومنها البسملة وعدم اللحن المخل بالمعنى وأن تكون حالة القيام في الفرض ، وأن يسمع نفسة القراءة ms03 وأن لا يتخللها ذكر أجنبي .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 28, NULL, NULL, '(فصل) تشديدات الفاتحة أربع عشرة : بسم الله فوق اللام ، الرحمن فوق الراء ، الرحيم فوق الراء ، الحمد لله فوق لام الجلالة ، رب العالمين فوق الباء ، الرحمن فوق الراء ،مالك يوم الدين فوق الدال ، إياك نعبد فوق الياء ، إياك نستعين فوق الياء ، اهدنا الصراط المستقيم فوق الصاد ، صراط الذين فوق اللام ، أنعمت عليهم غير المغضوب عليهم ولا الضالين فوق الضاد واللام . (فصل) يسن رفع اليدين في أربعة مواضع: عند تكبيرة الإحرام وعند الركوع وعند الإعتدال وعند القيام من التشهد الأول .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 29, NULL, NULL, '(فصل) شروط السجود سبعة : أن يسجد على سبعة أعضاء وأن تكون جبهته مكشوفة والتحامل برأسة وعدم الهوى لغيره وأن لايسجد على شيء يتحرك بحركته وارتفاع أسافلة على أعالية والطمأنينة فية. (خاتمة) أعضاء السجود سبعة : الجبهة وبطون الكفين والركبتان وبطون الأصابع والرجلين.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 30, NULL, NULL, '(فصل) تشديدات التشهد إحدى وعشرون : خمس في أكمله وستة عشر في أقلة : التحيات على التاء والياء المباركات الصلوات على الصاد ، الطيبات على الطاء والياء ، لله على لام الجلالة ، السلام على السين ، عليك أيها النبي على الياء والنون والياء ، ورحمه الله على لام الجلاله ، وبركاته السلام على السين ، علينا وعلى عباد الله على لام الجلاله ، الصالحين على الصاد، أشهد أن لاإله على لام ألف ،إلا الله على لام ألف ولام الجلاله، وأشهدأن على النون ، محمدا رسول الله على ميم محمدا وعلى الراء وعلى لام الجلاله.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 31, NULL, NULL, '(فصل ) تشديدات أقل الصلاة على النبي أربع : اللهم على اللام والميم ، صل على اللام ، على محمد على الميم .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 32, NULL, NULL, '(فصل) أقل السلام : السلام عليكم تشديد السلام على السين .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 33, NULL, NULL, '(فصل) أوقات الصلاة خمس: أول وقت الظهر زوال الشمس ، وآخره مصير ظل الشيء مثله غير ظل الإستواء ، وأول وقت العصر إذا صار ظل كل شيء مثلة وزاد قليلا ، وآخره غروب الشمس . وأول وقت المغرب غروب الشمس وآخره غروب الشفق الأحمر ، وآخره طلوع الفجر الصادق وآخره طلوع الشمس . الأشفاق ثلاثة : أحمر وأصفر وأبيض .الأحمر مغرب ولأصفر والأبيض عشاء . ويندب تأخير صلاه العشاء إلى أن يغيب الشفق ms04 الأحمر والأبيض (فصل ) تحرم الصلاة التي ليس لها سبب متقدم ولا مقارن في خمسة أوقات : عند طلوع الشمس حتى ترتفع قدر رمح وعند الإستواء في غير يوم الجمعة حتى تزول ، وعند الإصفرار حتى تطلع الشمس وبعد صلاة العصر حتى تغرب .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 34, NULL, NULL, '(فصل) سكتات الصلاة ستة : بين تكبيرة الإحرام ودعاء الإفتتاح والتعوذ، وبين الفاتحة والتعوذ، وبين آخر الفاتحة وآمين ، وبين آمين والسوره ، وبين السورة والركوع .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 35, NULL, NULL, '(فصل) الأركان التي تلزمه فيها الطمأنينة أربعة : الركوع والإعتدال والسجود والجلوس بين السجدتين . الطمأنينة هي : سكون بعد حركة بحيث يستقر كل عضو محله بقدر سبحان الله .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 36, NULL, NULL, '(فصل) أسباب سجود السهو أربعة :الأول ترك بعض من أبعاض الصلاة أو بعض البعض ، الثاني فعل مايبطل عمده ولايبطل سهوه إذا فعله ناسيا ، الثالث نقل ركن قولي إلى غير محله ، الرابع إيقاع ركن فعلي مع احتمال الزيادة .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 37, NULL, NULL, '(فصل) أبعاض الصلاة سبعة : التشهد الأول وقعوده والصلاه على النبي صلى الله عليه وسلم فيه ، والصلاه على الآل التشهد الأخير، والقنوت ،والصلاة على النبي صلى الله علية وسلم وآله فيه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 38, NULL, NULL, '(فصل) تبطل الصلاة بأربع عشرة خصلة : بالحدث وبوقوع النجاسة إن لم تلق حالا من غير حمل ، وانكشاف العورة إن لم تستر حالا، والنطق بحرفين أو حرف مفهم عمدا ، وبالمفطر عمدا ، والأكل الكثير ناسيا ،أوثلاث حركات متواليات ولو سهوا والوثبة الفاحشة والضربة المفرطة ، وزيادة ركن فعلي عمدا ، والتقدم على إمامه بركنين فعليين ، والتخلف بهما بغير عذر ، ونية قطع الصلاة ، وتعليق قطعها بشيء والتردد في قطعها .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 39, NULL, NULL, '(فصل) الذي يلزم فية نية الإمامة أربع : الجمعة والمعاداة والمنذورة جماعة والمتقدمة في المطر .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 40, NULL, NULL, '(فصل) شروط القدوة أحد عشر : أن لايعلم بطلان صلاة إمامة بحدث أو غيرة , وأن لايعتقد وجوب قضائها عليه وأن لا يكون مأموما ولا أميا وأن لايتقدم علية في الموقف وأن يعلم انتقالات إمامة وأن يجتمعا في مسجد أو في ثلثمائة ذراع تقريبا وأن ينوي القدوة أو الجماعة وأن يتوافق نظم صلاتيهما وأن لا يخالفه في سنة فاحشة المخالفة وأن يتابعة .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 41, NULL, NULL, '(فصل) صور القدوة تسع تصح في ms05 خمس : قدوة رجل برجل وقدوة امرأه برجل وقدوة خنثى برجل وقدوة امرأة بخنثى وقدوة امرأة بامرأة ، وتبطل في أربع : قدوة رجل بامرأة وقدوة رجل بخنثى', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 42, NULL, NULL, '(فصل) شروط جمع التقديم أربعة : البداءة بالأولى ونية الجمع والموالاة بينهما ودوام العذر .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 43, NULL, NULL, '(فصل) شروط جمع التأخير إثنان : نية التأخير وقد بقي من وقت الأولى مايسعها ودوام العذر إلى تمام الثانية .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 44, NULL, NULL, '(فصل) شروط القصر سبعة : أن يكون سفره مرحلتين وأن يكون مباحا والعلم بجواز القصر ونيه القصر عند الإحرام وأن لايقتدي بمتم في جزء من صلاتة .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 45, NULL, NULL, '(فصل) شروط الجمعة ستة : أن تكون كلها في وقت الظهر وأن تقام في خطة البلد وأن تصلي جماعة وأن يكونوا أربعين أحرارا ذكورا بالغين مستوطنين وأن لا تسبقها ولا تقارنها جمعة في تلك البلد وأن يتقدمها خطبتان . (فصل)أركان الخطبتين خمسة: حمد الله فيهما والصلاة على النبي صلى الله علية وسلم فيهما والوصية بالتقوى فيهما وقراءة آية من القرآن في أحداهما والدعاء للمؤمنين والمؤمنات في الأخيرة .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 46, NULL, NULL, '(فصل) شروط الخطبتين عشرة : الطهارة عن الحدثين الأصغر والأكبر والطهارة عن النجاسة في الثوب والبدن والمكان وستر العورة والقيام على القادر والجلوس بينهما فوق طمأنينة الصلاة والموالاة بينهما وبين الصلاة وأن تكون بالعربية وأن يسمعها أربعون وأن تكون كلها في وقت الظهر (فصل)الذي يلزم للميت أربع خصال : غسلة وتكفينة والصلاة علية ودفنه .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 47, NULL, NULL, '(فصل)أقل الغسل : تعميم بدنه بالماء. وأكمله أن يغسل سوأتيه وأن يزيل القذر من أنفه وأن يوضئه وأن يدلك بدنه بالسدر وأن يصب الماء عليه ثلاثا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 48, NULL, NULL, '(فصل) أقل الكفن : ثوب يعمه.، وأكمله للرجال ثلاث لفائف ، وللمرأة قميص وخمار وإزار ولفافتان .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 49, NULL, NULL, '(فصل) أركان صلاة الجنازة سبعة :الأول النية ،الثاني أربع تكبيرات ، الثالث القيام على القادر ، الرابع قراءة الفاتحة ،الخامس الصلاة على النبي صلى الله علية وسلم بعد الثانية،السادس الدعاء للميت بعد الثالثة ،السابع السلام (فصل)أقل الدفن : حفرة تكتم رائحته وتحرسه من السباع .وأكمله قامة وبسطة، ويوضع خده على التراب ويجب توجيهه إلى القبلة .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 50, NULL, NULL, '(فصل) ينبش الميت لأربع خصال : للغسل إذا لم يتغير ولتوجيهه إلى ms06 القبلة وللمال إذا دفن معه ، والمرأة إذا دفن جنينها وأمكنت حياته .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 51, NULL, NULL, '(فصل) الإستعانات أربع خصال : مباحة وخلاف الأولى ومكروهه وواجبة فالمباحة هي تقريب الماء ، وخلاف الأولى هي صب الماء على نحو المتوضئ ،والمكروهه هي لمن يغسل أعضاءه ، والواجبة هي للمريض عند العجز. (فصل) الأموال التي تلزم فيها الزكاة ستة أنواع: النعم والنقدان والمعشرات وأموال التجارة ، وواجبها ربع عشر قيمة عروض التجارة والركاز والمعدن.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 52, NULL, NULL, '(فصل) يجب صوم رمضان بأحد أمور خمسة : (أحدها ) بكمال شعبان ثلاثين يوما (وثانيها) برؤية الهلال في حق من رآه وان كان فاسقا (وثالثا) بثبوته في حق من لم يره بعدل شهادة (ورابعا) بإخبار عدل رواية موثوق به سواء وقع في القلب صدق أم لا أوغيره موثوق به إن وقع في القلب صدقه (وخامسها) بظن دخول رمضان بالإجتهاد فيمن اشتبه عليه ذلك .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 53, NULL, NULL, '(فصل) شروط صحته أربعة أشياء : إسلام وعقل ونقاء من نحو حيض وعلم بكون الوقت قبلا للصوم .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 54, NULL, NULL, '(فصل) شروط وجوبه خمسة اشياء : اسلام وتكليف وإطاقة وصحه وإقامة .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 55, NULL, NULL, '(فصل)أركانه ثلاثة أشياء: نية ليلا لكل يوم في الفرض وترك مفطر ذاكرا مختارا غير جاهل معذور وصائم .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 56, NULL, NULL, '(فصل) يجب مع القضاء للصوم الكفارة العظمى والتعزير على من أفسد صومه في رمضان يوما كاملا بجماع تام آثم به للصوم ويجب مع القضاء الإمساك للصوم في ستة مواضع:الأول في رمضان لافي غيره على متعد بفطره، والثاني على تارك النية ليلا في الفرض، والثالث على من تسحر ظانا بقاء الليل فبان خلافة أيضا ، والرابع على من افطر ظانا الغروب فبان خلافه ايضا ، والخامس على من بان له يوم ثلاثين من شعبان أنه من رمضان ، والسادس على من سبقه ماء المبالغة من مضمضة واستنشاق (فصل) يبطل الصوم : بردة وحيض ونفاس أو ولادة وجنون ولو لحظة وبإغماء وسكر تعدى به إن عما جميع النهار (فصل) الإفطار في رمضان أربعة انواع: واجب كما في الحائض والنفساء، وجائز كما في المسافر والمريض ولاولاكما في المجنون، ومحرم كمن أخر قضاء رمضان تمكنه حتى ضاق الوقت عنه . وأقسام الإفطار ms07 أربعة : أيضا ما يلزم فية القضاء والفدية وهو اثنان:الأول الإفطار لخوف على غيرة ، والثاني الإفطار مع تأخير قضاء مع إمكانه حتى يأتي رمضان آخر ، وثانيها مايلزم فية القضاء دون الفدية وهو يكثر كمغمى علية ، وثالثهما ما يلزم فيه الفدية دون القضاء وهوشيخ كبير ، ورابعها لا ولا وهو المجنون الذي لم يتعد بجنونه .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 57, NULL, NULL, '(فصل) الذي لا يفطر مما يصل إلى الجوف سبعة أفراد : مايصل إلى الجوف بنسيان أو جهل أو إكراة وبجريان ريق بما بين أسنانه وقد عجز عن مجه لعذره وما وصل إلى الجوف وكان غبار طريق ، وما وصل إلية وكان غربلة دقيق ، أوذبابا طائرا أو نحوه . والله اعلم بالصواب نسأل الله الكريم بجاه نبيه الوسيم، أن يخرجني من الدنيا مسلما، ووالدي وأحبائي ومن إلي انتمي، وان يغفر لي ولهم مقحمات ولمما ، وصلى الله على سيدنا محمد بن عبد الله بن عبد المطلب بن هاشم بن عبد مناف رسول الله إلى كافة الخلق رسول الملاحم ،حبيب الله الفاتح الخاتم ،وآله وصحبه أجمعين والحمد لله رب العالمين . تم بعون الله تعالى متن سفينة النجا. متن سفينة الصلاة بسم الله الرحمن الرحيم الحمد لله رب العالمين, والصلاة والسلام على سيدنا محمد وعلى آله وأصحابه أجمعين. أول ما يجب على كل مسلم اعتقاد معنى الشهادتين وتصميم قلبه عليه. ومعنى أشهد أن لا إله إلا الله : أعلم وأعتقد بقلبي وأبين لغيري أن لا معبود بحق في الوجود إلا الله ، وأنه غني عما سواه: مفتقر إليه كل ما عداه ؛ متصف بكل كمال : منزه عن كل نقص وما خطر بالبال لم يتخذ صاحبة ولا ولدا ؛ ولا يماثل في ذاته وصفاته وأفعاله أحدا . ومعنى أشهد أن محمد رسول الله: أعلم وأعتقد بقلبي وأبين لغيري أن سيدنا محمد بن عبدالله ، عبد الله ورسوله إلى كافه الخلق صادق فيما أخبر به يجب على كافة الخلق تصديقه ومتابعته. ويحرم عليهم تكذيبه ومخالفته. فمن كذبه فهو ظالم كافر. ومن خالفه فهو عاص خاسر. وفقنا الله لكمال متابعته ورزقنا كمال التمسك بسنته. ms08 وجعلنا ممن يحيي أحكام شريعته وتوفانا على ملته. وحشرنا في زمرته. ووالدينا وأولادنا وإخواننا وأحبابنا وجميع المسلمين آمين 0 ثم يجب عليه أن يتعلم شروط الصلاة وأركانها ومبطلاتها فشروطها اثنا عشر: (الأول) طهارة الثوب والبدن والمكان من النجاسات وهي:الخمر والبول والغائط والروث والدم والقيح والقيء والكلب والخنزير وفرع أحدهما والميتة وشعرها وظلفها وجلدها إلا ميتة الآدمي والسمك والجراد والمذكاة المباح أكلها. فمتى لاقت هذه النجاسات ثوب الانسان أو بدنه أو مصلاه أو غيرها من الجامدات مع رطوبة فيها أو في ملاقيها فإن كان لها طعم أو لون أو ريح وجب غسلها حتى يزول. ثم يزيد في نجاسة الكلب والخنزير ست غسلات واحدة منها مزوجه بتراب طهور وإن لم يكن لها طعم ولون وريح وإن كانت من الكلب والخنزير غسلها سبع غسلات واحدة منها ممزوجة بتراب طهور، وإن كانت من غيرها غسلها مرة ويجب صب الماء على المتنجس إذا كان الماء دون القلتين فإن أدخل المتنجس فيه لم يطهر وتنجس الماء وملاقيه ويجب عليه الإستبراء من البول حتى يغلب على ظنه أنه لا يعود ولا يخرج ثم يستنجي ويرخى دبره حتى يغسل ما في طبقاته من النجاسة ويدلكه حتى يغلب على ظنه زوال طعم النجاسة ولونها وريحها ومتى لاقت النجاسات المذكورة الماء فإن كان قلتين لم ينجس ، إلا إن غيرت طعمه أو لونه أو ريحه ويطهر بزوال التغير. وإن كان أقل منهما ينجس بالملاقاة وإن لم يتغير ويطهر ببلوغه قلتين , ومتى لاقت النجاسات المذكورة مائعا غير الماء تنجس بملاقاتها قليلا أو كثيرا تغير أو لم يتغير ولا يطهر قط . (الثاني) طهارة بالوضوء والغسل, وأما الوضوء ففروضه ستة: الأول: نية الطهارة للصلاة أو رفع الحدث أو نحوهما بالقلب مع أول غسل الوجه. الثاني: غسل الوجه من مبدأ تسطيح الجبهة إلى منتهى الذقن ومن الأذن إلى الأذن إلا باطن لحية الرجل وعارضيه الكثيفين. الثالث: غسل اليد مع المرفقين. الرابع: مسح أقل شئ من بشرة الرأس أو من شعره إذا لم يخرج الممسوح منه ms09 بالمد عن حد الرأس . الخامس: غسل الرجلين مع الكعبين. السادس: ترتيبه كما ذكرناه . ويجب في الوجه واليدين والرجلين غسل جزء فوق حدودها من جميع جوانبها وأن يجري الماء بطبعه على جميع أجزائها. ويبطل الوضوء كل ما خرج من القبل والدبر عينا وريحا ولمسهما ببطون الراحة أو بطون الأصابع من نفسه أو غيرة ولولده الصغير وتلاقي بشرتي ذكر وأنثى بلغا حد شهوة ليس بينهما محرمية بنسب أو رضاع أو مصاهرة بلا حائل وزوال العقل إلا من نام قاعدا ممكنا حلقة دبره وما حولها. وأما الغسل فيجب على الرجل والمرأة إذا خرج لأحدهما مني في يقظة أو نوم ولو قطرة وإذا أولجت الحشفة في دبر أو قبل وإن لم يخرج مني ولا وقع انتشار ويجب على المرأة إذا انقطع حيضها أو نفاسها أو ولدت ولو علقة. وفروض الغسل اثنان: الأول: نية الطهارة أو رفع الحدث الأكبر أو نحوهما بالقلب مع أول جزء يغسله من بدنه فما غسله قبلها لا يصح فيجب إعادة غسله بعدها. الثاني: تعميم بدنه فما غسله قبلها لا يصح فيجب غسل باطن كثيف الشعر ويجب غسل ما يراه الناظر من الأذن وما يظهر حال التغوط من الدبر وطبقاته وما يظهر من فرج المرأة إذا جلست على قدميها وباطن قلفة من لم يختن وما تحتها فيجب أن يجري الماء بطبعه على كل ذلك. الثالث: دخول الوقت وهو زوال الشمس للظهر وبلوغ ظل كل شئ مثله زائدا على ظل الإستواء للعصر وغروب الشمس للمغرب وغروب الشفق الأحمر للعشاء وطلوع الفجر الصادق المعترض جنوبا وشمالا للفجر فتجب الصلاة في هذة الأوقات وتقديمها عليها وتأخيرها عنها من أكبر المعاصي وأفحش السيئات . الرابع : ستر مابين سرة الرجل وركبته وجميع بدن المرأه إلا وجهها وكفيها ويجب عليها ستر جزء من جوانب الوجه والكفين وعلى الرجل ستر جزء من سرته وما حاذاها وجوانب ركبتيه وعليهما الستر من الجوانب لا من أسفل ويجب أن يكون الستر يمنع حكاية لون البشرة وأن يكون ملبوسا أو غير ملبوس فلا ms10 تكفي ظلمة وخيمة صغيرة . الخامس : استقبال القبلة بالصدر في القيام والقعود وبالمنكبين ومعظم البدن في غيرهما إلا إذا اشتد الخوف المباح ولم يمكنه الاستقبال فيصلي كيف أمكنه ولا إعادة عليه . السادس : أن يكون المصلي مسلما . السابع : أن يكون عاقلا فالمجنون والصبي الذي لم يميز لا صلاة عليهما ولا تصح منهما . الثامن : أن تكون المرأة نقية من الحيض والنفاس ، فالحائض والنفساء لا تصح صلاتهما ولا قضاء عليهما فإن دخل الوقت وهي طاهره فطرأ عليها الحيض والنفاس بعد أن مضى ما يسع واجبات تلك الصلاة وجب عليها قضاؤها ، وإذا انقطع الحيض والنفاس ولم يعد فإن كان في وقت الصبح أو الظهر أو المغرب ولو بقي منه قدر ما يسع الله أكبر وجب قضاء ذلك الفرض وإن كان في وقت العصر أو العشاء ولو بقي منه قدر ما يسع الله أكبر وجب قضاء ذلك الفرض والذي قبله وهو الظهر أو المغرب . التاسع : أن يعتقد أن الصلاة المفروضة التي يصليها فرض فمن اعتقدها سنه أو خلا قلبه عن العقيدتين أو التشكك في الفرضية لم تصح صلاته . العاشر : أن لا يعتقد ركنا من أركانها سنه ، فمن اعتقدها فروضا أوخلا قلبه عن العقيدتين أو تشكك في الفرضية أو اعتقد سنه من سنن الصلاة فرضا صحت صلاته . الحادي عشر : اجتناب مبطلات الصلاة الآتيه في جميع صلاته . الثاني عشر : معرفه كيفيتها بأن يعرف أعمالها وترتيبها كما يأتي ، وأما أركان الصلاة تسعه عشر : (الأول) النيه بالقلب فيحضر في قلبه فعل الصلاة ويعبر عنه بفرض ويحضر فيه تعيينها ويعبر عنه بالظهر أو العصر أو المغرب أو العشاء أو الصبح فإذا حضرت هذه الثلاثة في قلبه قال الله أكبر غير غافل عنها ويزيد استحضار مأموما إن كان جماعه (الثاني) تكبيرة الإحرام وهي الله أكبر (الثالث) قراءة الفاتحة في القيام (الرابع) القيام إن قدر ولو بحبل أو معين في صلاة الفرض (الخامس) الركوع بأن ينحني من غير إرخاء ركبتيه (السادس) الطمأنينه فيه بأن تنفصل حركه رفعه وتسكن أعضاؤه كلها (السابع ) الإعتدال بأن ms11 ينتصب قائما (الثامن) الطمأنينه فيه كما ذكرنا في الركوع (التاسع) السجود الأول بأن يضع جبهته مكشوفة على مصلاة متحاملا عليها قليلا على غير متحرك رافعا عجيزته وما حولها على منكبيه ويديه ورأسه وبأن يضع جزء من كل من ركبتيه ومن باطن كل كف ومن باطن أصابع كل رجل (العاشر) الطمأنينه فيةكما ذكرنا في الركوع (الحادي عشر) الجلوس بين السجدتين بأن ينتصب جالسا (الثاني عشر)الطمأنينه فيه كما ذكرنا في الركوع (الثالث عشر) السجود الثاني مثل السجود الأول فيما مر فيه (الرابع عشر ) الطمأنينه فيه في الركوع كما ذكرنا في الركوع (الخامس عشر) الجلوس الأخير منتصبا (السادس عشر)قراءة التشهد فيه (السابع عشر) الصلاة على النبي صلى الله عليه وسلم بعد التشهد في القعود وأقلها اللهم صلي على محمد (الثامن عشر) السلام بعدها في القعود وأقله السلام عليكم (التاسع عشر ) الترتيب بأن يأتي بالنية مع التكبيرة ثم الفاتحة في القيام ثم الركوع مع طمأنينته ثم الإعتدال مع طمأنينته ثم الجلوس بعده مع طمأنينته ثم السجود الأول مع طمأنينته ثم الجلوس بعده مع طمأنينته ثم السجود الثاني مع طمأنينته فهذا ترتيب أول ركعة ثم يأتي بباقي الركعات مثلها إلا أنه لا يأتي فيها بالنية وتكبيرة الإحرام فإذا تمت ركعات فرضه جلس الجلوس الأخير ثم قرأ التشهد فية ثم صلى على النبي قال اللهم صلي على محمد ثم قال السلام عليكم . وأركان الصلاة ثلاثة أقسام: (الأول ) قلبي وهو النيه فقط وشرطها أن تكون مع تكبيرة الإحرام وأن تكون في القيام (الثاني) القوليه وهي خمسة تكبيرة الإحرام أول الصلاة وقراءة الفاتحة في كل ركعة وقراءة التشهد والصلاة على النبي وسلام آخر الصلاة ثلاثتها في العقدة الأخيرة وشرط هذه الخمسة أن يسمع نفسه إذا لم يكن أصم ولامانع ريح ولغط ونحوهما وإلا رفع بحيث لو زال الصمم والمانع لسمع وأن لاينقص شيئا من تشديداتها وحروفها وأن يخرجها من مخارجها وأن لا يغير شيئا من حركاتها تغييرا يبطل معناها وأن لايزيد فيها حرفا يبطل به معناها وأن يوالي ms12 بين كلماتها وأن يرتبها على نظمها المعروف (الثالث) الفعلية وهي ثلاث عشر:القيام والركوع وطمأنينته والإعتدال وطمأنينته والسجود الأول وطمأنينته والجلوس بعده وطمأنينته وواحد بعد آخر ركعة وهو الجلوس الأخير وواحد ينشأ من فعل هذه الأركان في موضعها وهو الترتيب وشرط الأركان الفعلية صحة ما قبلها من الأركان وأن لا يقصد به غيرها وأما مبطلات الصلاة فاثنا عشر: (الأول) فقد شرط من شروطها الإثنى عشر عمدا ولو بإكراه أو سهوا أو جهلا (الثاني) فقد ركن من أركانها التسعة عشر عمدا فإن كان سهوا أتى به إذا ذكره ولا يحسب ما فعله بعد المتروك حتى يأتي به (الثالث) زيادة ركن من أركانها الفعلية أو إتيان النية أو تكبيرة الإحرام أو السلام في غير محله عمدا فإن كان سهوا أو زاد غير ما ذكر من الأركان عمدا أو سهوا لم تبطل (الرابع) أن يتحرك حركه واحده مفرطة أو ثلاث حركات متوالية عمدا كان أو سهوا أو جهلا (الخامس) أن يأكل أو يشرب قليلا عمدا فإن كان سهوا أو جهلا وعذر لم تبطل بالقليل وبطلت بالكثير (السادس) فعل شيء من مفطرات الصائم غير الأكل والشرب (السابع) قطع النية كأن ينوي الخروج من الصلاة (الثامن) تعليق الخروج منها كأن ينوي إذا جاء زيد خرجت منها (التاسع) التردد في قطعها كأن تحدث له حاجه في الصلاة فتردد بين قطع الصلاة والخروج منها وبين تكميلها (العاشر) الشك في واجب من واجبات النية إذا طال زمنه عرفا أو فعل منه ركنا فعليا أو قوليا (الحدي عشر) قطع ركن من أركانها الفعلية لأجل سنة كمن قام ناسيا للتشهد الأول ثم عادا له عامدا عالما (الثاني عشر) البقاء في ركن اذا تيقن ترك ماقبله أو شك فيه إذا طال عرفا أو يلزمه العود فورا إلى فعل ماتيقن تركه أو شك فيه إلا إن كان مأموما فيأتي بركعة بعد سلام إمامه ولا يجوز له العود . فهذه الأحكام يلزم كل مسلم معرفتها، وللوضوء والغسل والصلاة سنن كثيرة جدا فمن أراد حياة قلبه ms13 والفوز عند ربه فليتعلمه ويعمل بها فلا يتركها إلا متساهل أولاه أو ساه جاهل . ومما يتأكد معرفته أذكار الصلاة ونحن نذكرها هنا بإختصار فيقول المصلي أصلي فرض الظهر أربع ركعات أداء مستقبل القبلة مأموما لله تعالى الله أكبر ويبدل الظهر في غيرها باسمها وذكر عدد ركعاتها ويقول إماما بدل مأموما إن كان إماما ويتركهما إن كان منفردا، ثم يقول: وجهت وجهي للذي فطر السموات والأرض حنيفا مسلما وما أنا من المشركين إن صلاتي ونسكي ومحياي ومماتي لله رب العالمين، لا شريك له وبذلك أمرت وأنا من المسلمين.أعوذ بالله من الشيطان الرجيم.بسم الله الرحمن الرحيم.الحمد لله رب العالمين الرحمن الرحيم مالك يوم الدين إياك نعبد وإياك نستعين اهدنا الصراط المستقيم صراط الذين أنعمت عليهم غير المغضوب عليهم ولآالضآلين آمين.ثم يقرأ السورة، الله أكبر سبحان ربي العظيم وبحمده ثلاث مرات، سمع الله لمن حمده ربنا لك الحمد ملء السموات وملء الأرض وملء ما شئت من شيء بعد ،الله أكبر ، سبحان ربي الأعلى وبحمده ثلاث مرات ،الله أكبر ، رب اغفر لي وارحمني واجبرني وارفعني وارزقني واهدني وعافني واعف عني ،الله أكبر ، سبحان ربي الأعلى وبحمده ثلاث مرات . فهذه ركعة ويفعل في باقي الركعات جميع ما ذكرناه إلا النيه وتكبيرة الإحرام وهي في الأولى . وإذا زادت صلاته على ركعتين جلس للتشهد الأول فيقول:التحيات المباركات الصلوات الطيبات لله السلام عليك أيها النبي ورحمة الله وبركاته السلام علينا وعلى عباد الله الصالحين أشهد أن لا إله إلا الله وأشهد أن محمد رسول الله اللهم صل على محمد ، الله اكبر. ثم يقوم ويأتي بباقي ركعات صلاته لكن لايقرأ سوره بعد التشهد الأول، ثم إذا أتم الركعات جلس الجلوس الأخير ويقول فيه التحيات المباركات الصلوات الطيبات لله السلام عليك أيها النبي ورحمه الله وبركاته السلام علينا وعلى عباد الله الصالحين أشهد أن لاإله إلا الله وأشهد أن محمد رسول الله ، اللهم صلي على محمد عبدك ورسولك النبي الأمي وعلى آل محمد وأزواجه وذريته كما صليت على إبراهيم وعلى ms14 آل إبراهيم وبارك على محمد النبي الأمي وعلى آل محمد وأزواجه وذريته كما باركت على ابراهيم وعلى آل ابراهيم في العالمين إنك حميد مجيد. اللهم اغفر لي ما قدمت وماأخرت وما أسررت وما أعلنت وما أسرفت وما أنت أعلم به مني أنت المقدم وأنت المؤخر لا إله إلا أنت ربنا أتنا في الدنيا حسنه وفي الأخرة حسنة وقنا عذاب النار ،اللهم إني أعوذ بك من عذاب القبر ومن عذاب النار ومن فتنة المحيا والممات ومن فتنة المسيح الدجال ،السلام عليكم ورحمة الله وبركاته . وصلى الله على سيدنا محمد وعلى آله وصحبه وسلم والحمد لله رب العالمين.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'safinah' AND bab_order = 100;

-- ═══ imrithi — OpenITI 0989SharafDinCimriti.DurraBahiyya.Shamela0002084-ara1 ═══
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 100, 'مقدمة', 'مقدمة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'بسم الله الرحمن الرحيم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 101, 'نظم الأجرومية', 'نظم الأجرومية');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'للإمام العمريطي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'الحمد لله الذي قد وفقا ... للعلم خير خلقه وللتقى', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'حتى نحت قلوبهم لنحوه ... فمن عظيم شأنه لم تحوه', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'فأشربت معنى ضمير الشان ... فأعربت في ألحان بالألحان', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'ثم الصلاة مع سلام لائق ... على النبي أفصح الخلائق', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'محمد والآل والأصحاب ... من أتقنوا القرءان بالإعراب', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'وبعد فاعلم أنه لما اقتصر ... جل الورى على الكلام المختصر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, 'وكان مطلوبا أشد الطلب ... من الورى حفظ اللسان العربي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, NULL, 'كي يفهموا معاني القرءان ... والسنة الدقيقة المعاني', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, NULL, 'والنحو أولى أولا أن يعلما ... إذ الكلام دونه لن يفهما', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 11, NULL, NULL, 'وكان خير كتبه الصغيره ... كراسة لطيفة شهيره', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 12, NULL, NULL, 'في عربها وعجمها والروم ... ألفها الحبر (ابنءاجروم)', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 13, NULL, NULL, 'وانتفعت أجلة بعلمها ... مع ما تراه من لطيف حجمها', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 14, NULL, NULL, 'نظمتها نظما بديعا مقتدي ... بالأصل في تقريبه للمبتدى', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 15, NULL, NULL, 'وقد حذفت منه ما عنه غنى ... وزدته فوائدا بها الغنى', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 16, NULL, NULL, 'متمما لغالب الأبواب ... فجاء مثل الشرح للكتاب', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 17, NULL, NULL, 'سئلت فيه من صديق صادق ... يفهم قولي لاعتقاد واثق', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 18, NULL, NULL, 'إذ الفتى حسب اعتقاده رفع ... وكل من لم يعتقد لم ينتفع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 19, NULL, NULL, 'فنسأل المنان أن يجيرنا ... من الريا مضاعفا أجورنا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 20, NULL, NULL, 'وأن يكون نافعا بعلمه ... من اعتنى بحفظه وفهمه', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 102, 'باب الكلام', 'باب الكلام');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'كلامهم لفظ مفيد مسند ... والكلمة اللفظ المفيد المفرد', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'لاسم وفعل ثم حرف تنقسم ... وهذه ثلاثة هي الكلم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'والقول لفظ قد أفاد مطلقا ... كقم وقد وإن زيدا ارتقى', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'فالاسم بالتنوين والخفض عرف ... وحرف خفض وبلام وألف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'والفعل معروف بقد والسين ... وتاء تأنيث مع التسكين', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'وتا فعلت مطلقا كجئت لي ... والنون واليا في افعلن وافعلي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'والحرف لم يصلح له علامه ... إلا انتفا قبوله العلامه', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 103, 'باب الإعراب', 'باب الإعراب');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'إعرابهم تغيير آخر الكلم ... تقديرا أو لفظا لعامل علم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'أقسامه أربعة فلتعتبر ... رفع ونصب وكذا جزم وجر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'والكل غير الجزم في الأسما يقع ... وكلها في الفعل والخفض امتنع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'وسائر الأسماء حيث لا شبه ... قربها من الحروف معربه', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'وغيرذي الأسماء مبني خلا ... مضارع من كل نون قد خلا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 104, 'باب علامات الإعراب', 'باب علامات الإعراب');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'للرفع منها ضمة واو ألف ... كذاك نون ثابت لا منحذف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'فالضم في اسم مفرد ms1 كأحمد ... وجمع تكسير كجاء الأعبد', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'وجمع تأنيث كمسلمات ... وكل فعل معرب كياتي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'والواوفي جمع الذكور السالم ... كالصالحون هم أولو المكارم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'كماأتت في الخمسة الأسماء ... وهي التي تأتي على الولاء', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'أب أخ حم وفوك ذو جرى ... كل مضافا مفردا مكبرا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'وفي مثنى نحو زيدان الألف ... والنون في المضارع الذي عرف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, 'بيفعلان تفعلان أنتما ... ويفعلون تفعلون معهما', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, NULL, 'وتفعلين ترحمين حالي ... واشتهرت بالخمسة الأفعال', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 105, 'باب علامات النصب', 'باب علامات النصب');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'للنصب خمس وهي فتحة ألف ... كسر وياء ثم نون تنحذف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'فانصب بفتح ما بضم قد رفع ... إلا كهندات ففتحه منع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'واجعل لنصب الخمسة الأسما ألف ... وانصب بكسر جمع تأنيث عرف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'والنصب في الاسم الذي قد ثنيا ... وجمع تذكير مصحح بيا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'والخمسة الأفعال حيث تنتصب ... فحذف نون الرفع مطلقا يجب', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 106, 'باب علامات الخفض', 'باب علامات الخفض');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'علامة الخفض التي بها انضبط ... كسر وياء ثم فتحة فقط', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'فاخفض بكسر ما من الأسما عرف ... في رفعه بالضم حيث ينصرف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'واخفض بياء كل ما بها نصب ... والخمسة الأسما بشرطها تصب', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'واخفض بفتح كل ما لم ينصرف ... مما بوصف الفعل صار يتصف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'بأن يحوز الاسم علتين ... أو علة تغني عن اثنتين', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'فألف التأنيث أغنت وحدها ... وصيغة الجمع الذي قد انتهى', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'والعلتان الوصف مع عدل عرف ... أووزن فعل أو بنون وألف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, 'وهذه الثلاث تمنع العلم ... وزاد تركيبا وأسماء العجم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, NULL, 'كذاك تأنيث بما عدا الألف ... فإن يضف أويأت بعد أل صرف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 107, 'باب علامات الجزم', 'باب علامات الجزم');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'والجزم في الأفعال بالسكون ... أوحذف حرف علة أونون', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'فحذف نون الرفع قطعا يلزم ... في الخمسة الأفعال حيث تجزم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'وبالسكون اجزم مضارعا سلم ... من كونه بحرف علة ختم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'إما بواو أو بياء أو ألف ... وجزم معتل بها أن تنحذف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'ونصب ذي واو وياء يظهر ... وما سواه في الثلاث قدروا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'فنحو يغزو يهتدي يخشى ختم ... بعلة وغيره منها سلم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'وعلة الأسماء ياء وألف ... فنحو قاض والفتى بها عرف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, 'إعراب كل منهما مقدر ... فيها ولكن نصب قاض يظهر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, NULL, 'وقدروا ثلاثة الأقسام ... في الميم قبل الياء من غلامي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, NULL, 'والواو في كمسلمي أضمرت ... والنون في لتبلون قدرت ms2', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 108, 'فصل', 'فصل');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'المعربات كلها قد تعرب ... بالحركات أو حروف تقرب', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'فأول القسمين منها أربع ... وهي التي مرت بضم ترفع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'وكل ما بضمة قد ارتفع ... فنصبه بلفتح مطلقا يقع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'وخفض الاسم منه بالكسر التزم ... والفعل منه باالسكون منجزم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'لكن كهندات لنصبه انكسر ... وغير مصروف بفتحة يجر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'وكل فعل كان معتلا جزم ... بحذف حرف علة كما علم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'والمعربات بالحروف أربع ... وهي المثنى وذكور تجمع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, 'جمعا صحيحا كالمثال الخالي ... وخمسة الأسماء والأفعال', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, NULL, 'أما المثنى فلرفعه الألف ... ونصبه وجره باليا عرف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, NULL, 'وكالمثنى الجمع في نصب وجر ... ورفعه بالواو مر واستقر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 11, NULL, NULL, 'والخمسة الاسما كهذا الجمع في ... رفع وخفض وانصبن بالألف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 12, NULL, NULL, 'والخمسة الأفعال رفعها عرف ... بنونها وفي سواه تنحذف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 109, 'باب المعرفة والنكرة', 'باب المعرفة والنكرة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وإن ترد تعريف الاسم النكره ... فهو الذي يقبل أل مؤثره', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'وغيره معارف وتحصر ... في ستة فالأول مضمر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'يكنى به عن ظاهر فينتمي ... للغيب والحضور والتكلم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'وقسموه ثانيا لمتصل ... مستتر أوبارز أو منفصل', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'ثاني المعارف الشهير بالعلم ... كجعفر ومكة وكالحرم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'وأم عمرو وأبي سعيد ... ونحو كهف الظلم والرشيد', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'فما أتى منه بأم أو بأب ... فكنية وغيره اسم أو لقب', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, 'فما بمدح أو بذم مشعر ... فلقب والاسم ما لا يشعر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, NULL, 'ثالثها إشارة كذا وذي ... رابعها موصول الاسم كالذي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, NULL, 'خامسها معرف بحرف أل ... كما تقول في محل المحل', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 11, NULL, NULL, 'سادسها ما كان من مضاف ... لواحد من هذه الأصناف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 12, NULL, NULL, 'كقولك ابني وابن زيد وابن ذي ... وابن الذي ضربته وابن البذي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 110, 'باب الأفعال', 'باب الأفعال');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'أفعالهم ثلاثة في الواقع ... ماض وفعل الأمر والمضارع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'فالماض مفتوح الأخير إن قطع ... عن مضمر محرك به رفع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'فإن أتى مع ذا الضمير سكنا ... وضمه مع واو جمع عينا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'والامر مبني على السكون ... أوحذف حرف علة أو نون', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'وافتتحوا مضارعا بواحد ... من الحروف الأربع الزوائد', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'همز ونون وكذا ياء وتا ... يجمعها قولي أنيت يافتى', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'وحيث كانت في رباعي تضم ... وفتحها فيما سواه ملتزم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 111, 'باب إعراب الفعل', 'باب إعراب الفعل');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'رفع المضارع الذي تجردا ... عن ناصب وجازم تأبدا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 111;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'فانصب بعشر وهي أن ولن وكي ... كذا إذن إن صدرت ولام كي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 111;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'ولام جحد ms3 وكذا حتى وأو ... والواو والفا في جواب وعنوا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 111;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'به جوابا بعد نفي أو طلب ... كلا ترم علما وتترك التعب', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 111;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'وجزمه بلم ولما قد وجب ... ولا ولام دلتا على الطلب', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 111;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'كذاك إن وما ومن وإذ ما ... أي متى أيان أين مهما', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 111;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'وحيثما وكيفما وأنى ... كإن يقم زيد وعمرو قمنا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 111;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, 'واجزم بإن وما بها قد ألحقا ... فعلين لفظا أو محلا مطلقا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 111;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, NULL, 'وليقترن بالفا جواب لووقع ... بعد الأداة موضع الشرط امتنع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 111;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 112, 'باب مرفوعات الأسماء', 'باب مرفوعات الأسماء');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'مرفوع الاسما سبعة نأتي بها ... معلومة الأسماء من تبويبها', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'فالفاعل اسم مطلقا قد ارتفع ... بفعله والفعل قبله وقع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'وواجب في الفعل أن يجردا ... إذا لجمع أو مثنى أسندا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'فقل أتى الزيدان وازيدونا ... كجاء زيد ويجي أخونا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'وقسموه ظاهرا ومضمرا ... فالظاهر اللفظ الذي قد ذكرا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'والمضمر اثنا عشر نوعا فسما ... كقمت قمنا قمت قمت قمتما', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'قمتن قمتم قام قامت قاما ... قاموا وقمن نحو صمتم عاما', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, 'وهذه ضمائر متصله ... ومثلها الضمائر المنفصله', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, NULL, 'وغير ذين بالقياس يعلم ... كلم يقم إلا أنا أو أنتم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 113, 'باب نائب الفاعل', 'باب نائب الفاعل');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'أقم مقام الفاعل الذي حذف ... مفعوله في كل ماله عرف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'أو مصدرا أو ظرفا أو مجرورا ... إن لم تجد مفعوله المذكورا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'وأول الفعل الذي هنا يضم ... وكسر ماقبل الأخير ملتزم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'في كل ماض وهو في المضارع ... منفتح كيدعى وكادعي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'وأول الفعل الذي كباعا ... منكسر وهو الذي قد شاعا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'وذاك إما مضمر أو مظهر ... ثانيهما كيكرم المبشر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'أما الضمير فهو نحو قولنا ... دعيت أدعى مادعي إلا أنا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 114, 'باب المبتدإ والخبر', 'باب المبتدإ والخبر');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'المبتدا اسم رفعه مؤبد ... عن كل لفظ عامل مجرد', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'والخبر اسم ذو ارتفاع أسندا ... مطابقا في لفظه للمبتدا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'كقولنا زيد عظيم الشان ... وقولنا الزيدان قائمان', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'ومثله الزيدون قائمونا ... ومنه أيضا قائم أخونا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'والمبتدا اسم ظاهر كما مضى ... أو مضمر كأنت أهل للقضا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'ولا يجوز الابتدا بما اتصل ... من الضمير بل بكل ما انفصل', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'أنا ونحن أنت أنت أنتما ... أنتن أنتم وهو وهي هم هما', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, 'وهن أيضا فالجميع اثنا عشر ... وقد مضى منها مثال معتبر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, NULL, 'ومفردا وغيره يأتي ms4 الخبر ... فالأول اللفظ الذي في النظم مر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, NULL, 'وغيره في أربع محصور ... لا غير وهي الظرف والمجرور', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 11, NULL, NULL, 'وفاعل مع فعله الذي صدر ... والمبتدا مع ماله من الخبر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 12, NULL, NULL, 'كأنت عندي والفتى بداري ... وابني قرا وذا أبوه قاري', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 115, 'ان وأخواتها', 'ان وأخواتها');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '</span>', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 115;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'إرفع بكان المبتدا اسما والخبر ... بها انصبن ككان زيد ذا بصر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 115;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'كذاك أضحى ظل بات أمسى ... وهكذ أصبح صار ليسا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 115;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'فتىء وانفك وزال مع برح ... أربعها من بعد نفي تتضح', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 115;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'كذاك دام بعد ما الظرفيه ... وهي التي تكون مصدريه', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 115;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'وكل ما صرفته مما سبق ... من مصدر وغيره به التحق', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 115;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'ككن صديقا لا تكن مجافيا ... وانظر لكوني مصبحا موافيا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 115;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 116, 'إن وأخواتها', 'إن وأخواتها');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'تنصب إن المبتدا اسما والخبر ... ترفعه كإن زيدا ذو نظر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'ومثل إن أن ليت في العمل ... وهكذا كأن لكن لعل', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'وأكدوا المعنى بإن أنا ... وليت من ألفاظ من تمنى', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'كأن للتشبيه في المحاكي ... واستعملوا لكن في استدراكي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'ولترج وتوقع لعل ... كقولهم لعل محبوبي وصل', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 117, 'ظن وأخواتها', 'ظن وأخواتها');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'إنصب بظن المبتدا مع الخبر ... وكل فعل بعدها على الأثر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 117;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'كخلته حسبته زعمته ... رأيته وجدته علمته', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 117;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'جعلته اتخذته وكل ما ... من هذه صرفته فليعلما', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 117;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'كقو لهم ظننت زيدا منجدا ... واجعل لنا هذا المكان مسجدا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 117;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 118, 'باب النعت', 'باب النعت');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'النعت إمارافع لمضمر ... يعود للمنعوت أو لمظهر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 118;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'فأول القسمين منه أتبع ... منعوته من عشرة لأربع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 118;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'في واحد من أوجه الإعراب ... من رفع أوخفض أو انتصاب', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 118;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'كذا من الإفراد والتذكير ... والضد والتعريف والتنكير', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 118;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'كقولنا جاء الغلام الفاضل ... وجاء معه نسوة حوامل', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 118;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'وثاني القسمين منه أفرد ... وإن جرى المنعوت غير مفرد', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 118;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'واجعله في التأنيث والتذكير ... مطابقا للمظهر المذكور', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 118;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, 'مثاله قد جاء حرتان ... منطلق زوجاهما العبدان', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 118;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, NULL, 'ومثله أتى غلام سائله ... زوجته عن دينها المحتاج له', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 118;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 119, 'باب العطف', 'باب العطف');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وأتبعوا المعطوف بالمعطوف ... عليه في إعرابه المعروف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 119;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'وتستوي الأسماء والأفعال في ... إتباع كل مثله إن يعطف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 119;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'بالواو والفا أو وأم وثم ... حتى وبل ولا ولكن أما', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 119;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'كجاء زيد ثم عمرو وأكرم ... زيدا وعمرا باللقا والمطعم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 119;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'وفئة لم يأكلوا أويحضروا ... حتى يفوت أويزول المنكر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 119;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 120, 'باب التوكيد ms5', 'باب التوكيد ms5');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وجائز في الاسم أن يؤكدا ... فيتبع المؤكد المؤكدا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 120;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'في أوجه الإعراب والتعريف لا ... منكر فمن مؤكد خلا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 120;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'ولفظه المشهور فيه أربع ... نفس وعين ثم كل أجمع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 120;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'وغيرها توابع لأجمعا ... من أكتع وأبتع وأبصعا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 120;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'كجاء زيد نفسه وقل أرى ... جيش الأمير كله تأخرا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 120;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'وطفت حول القوم أجمعينا ... متبوعة بنحو أكتعينا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 120;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'وإن تؤكد كلمة أعدتها ... بلفظها كقولك انتهى انتهى', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 120;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 121, 'باب البدل', 'باب البدل');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'إذا اسم أو فعل لمثله تلا ... والحكم للثاني وعن عطف خلا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 121;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'فاجعله في إعرابه كالأول ... منقبا له بلفظ البدل', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 121;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'كل وبعض واشتمال وغلط ... كذلك إضراب فبالخمس انضبط', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 121;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'كجاءني زيد أخوك وأكل ... عندي رغيفا نصفه وقد وصل', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 121;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'إلي زيد علمه الذي درس ... وقد ركبت اليوم بكرا الفرس', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 121;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'إن قلت بكرا دون قصد فغلط ... أو قلته قصدا فإضراب فقط', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 121;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'والفعل من فعل كمن يؤمن يثب ... يدخل جنانا لم ينل فيها تعب', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 121;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 122, 'باب منصوبات الأسماء', 'باب منصوبات الأسماء');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'ثلاثة من سائر الأسما خلت ... منصوبة وهذه عشر تلت', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 122;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'وكلها تأتي على ترتيبه ... أولها في الذكر مفعول به', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 122;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'وذلك اسم جاء منصوبا وقع ... عليه فعل كاحذروا أهل الطمع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 122;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'في ظاهر ومضمر قد انحصر ... وقد مضى التمثيل للذي ظهر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 122;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'وغيره قسمان أيضا متصل ... كجاءني وجاءنا ومنفصل', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 122;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'مثاله إياي أو إيانا ... حييت أكرم بالذي حيانا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 122;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'وقس بذين كل مضمر فصل ... وباللذين قبل كل متصل', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 122;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, 'فكل قسم منهما قد انحصر ... ماجاء من أنواعه في اثني عشر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 122;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 123, 'باب المصدر', 'باب المصدر');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وإن ترد تصريف نحو قاما ... فقل يقوم ثم قل قياما', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 123;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'فما يجيء ثالثا فالمصدر ... ونصبه بفعله مقدر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 123;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'فإن يوافق فعله الذي جرى ... في اللفظ والمعنى فلفظيا يرى', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 123;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'أو وافق المعنى فقط وقد روي ... بغير لفظ الفعل فهو معنوي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 123;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'فقم قياما من قبيل الأول ... وقم وقوفا من قبيل ما يلي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 123;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 124, 'باب الظرف', 'باب الظرف');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'هو اسم وقت أو مكان انتصب ... كل على تقدير في عند العرب', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'إذا أتى ظرف المكان مبهما ... ومطلقا في غيره فليعلما', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'والنصب بالفعل الذي به جرى ... كسرت ميلا واعتكفت أشهرا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'أو ليلة أو يوما أو سنين ... أومدة أو جمعة أوحبنا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'أو قم صباحا ms6 أو مساء أوسحر ... أو غدوة أو بكرة إلى السفر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'أو ليلة الإثنين أو يوم الأحد ... أو صم غدا أو سرمدا أو الأبد', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'واسم المكان نحو سر أمامه ... أو خلفه وراءه قدامه', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, 'يمينه شماله تلقاءه ... أو فوقه أو تحته إزاءه', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, NULL, 'أو معه أو حذاءه أو عنده ... أو دونه أو قبله أو بعده', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, NULL, 'هناك ثم فرسخا بريدا ... وههنا قف موقفا سعيدا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 125, 'باب الحال', 'باب الحال');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'الحال وصف ذو انتصاب آتي ... مفسرا لمبهم الهيآت', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 125;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'وإنما يؤتى به منكرا ... وغالبا يؤتى به مؤخرا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 125;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'كجاء زيد راكبا ملفوفا ... وقد ضربت عبده مكتوفا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 125;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'وقد يجيء في الكلام أولا ... وقد يجيء جامدا مؤولا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 125;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'وصاحب الحال الذي تقررا ... معرف وقد يجي منكرا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 125;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 126, 'باب التمييز', 'باب التمييز');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'تعريفه آسم ذو انتصاب فسرا ... لنسبة أو ذات جنس قدرا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 126;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'كانصب زيد عرقا وقد علا ... قدرا ولكن أنت أعلى منزلا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 126;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'وكاشتريت أربعا نعاجا ... أو اشتريت ألف رطل ساجا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 126;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'أو بعته مكيلة أرزا ... أو قدر باع أو ذراع خزا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 126;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'وواجب التمييز أن ينكرا ... وأن يكون مطلقا مؤخرا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 126;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 127, 'باب الاستثناء', 'باب الاستثناء');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'أخرج به الكلام ما خرج ... من حكمه وكان في اللفظ اندرج', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'ولفظ الاستثنا الذي قد حوى ... إلا وغيرا وسوى سوى سوا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'خلا عدا حاشا فمع إلا انصب ... ما أخرجت من ذي تمام موجب', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'كقام كل القوم إلا واحدا ... وقد رأيت القوم إلا خالدا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'وإن يكن من ذي تمام انتفى ... فأبدلن والنصب فيه ضعفا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'هذا إذا استثنيه من جنسه ... وما سواه حكمه بعكسه', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'كلن يقوم القوم إلا جعفر ... وانصب في إلا بعيرا أكثر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, 'وإن يكن من ناقص فإلا ... قد ألغيت والعامل استقلا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, NULL, 'كلم يقم إلا أبوك أولا ... ولا أرى إلا أخاك مقبلا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, NULL, 'وخفض مستثنى على الإطلاق ... يجوز بعد السبعة البواقي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 11, NULL, NULL, 'والنصب أيضا جائز لمن يشا ... بما خلا وما عدا وما حشا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 128, 'باب لا العاملة عمل إن', 'باب لا العاملة عمل إن');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وحكم لا كحكم إن في العمل ... فانصب بها منكرا بها اتصل', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 128;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'مضافا أو مشابه المضاف ... كلا غلام حاضر مكافي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 128;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'لكن إذا تكررت أجريتها ... كذاك في الأعمال أو ألغيتها', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 128;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'وعند إفراد اسمها الزم البنا ms7 ... مركبا أو رفعه منونا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 128;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'كلا أخ ولا أب وانصب أبا ... أيضا وإن ترفع أخا لا تنصبا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 128;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'وحيث عرفت اسمها أو فصلا ... فارفع ونون والتزم تكرار لا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 128;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'كلا علي حاضر ولا عمر ... ولا لنا عبد ولا ما يدخر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 128;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 129, 'باب النداء', 'باب النداء');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'خمس تنادى وهي مفرد علم ... ومفرد منكر قصدا يؤم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 129;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'ومفرد منكر سواه ... كذا المضاف والذي ضاهاه', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 129;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'فالأولان فيهما البنا لزم ... على الذي في رفع كل قد علم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 129;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'من غير تنوين على الإطلاق ... والنصب في الثلاثة البواقي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 129;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'كيا علي يا غلامي بي انطلق ... يا غافلا عن ذكر ربه أفق', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 129;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'يا كاشف البلوى ويا أهل الثنا ... ويا لطيفا بالعباد الطف بنا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 129;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 130, 'باب المفعول لأجله', 'باب المفعول لأجله');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'والمصدر انصب إن أتى بيانا ... لعلة الفعل الذي قد كانا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 130;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'وشرطه اتحاده مع عامله ... فيما له من وقته وفاعله', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 130;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'كقم لزيد اتقاء شره ... واقصد عليا ابتغاء بره', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 130;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 131, 'باب المفعول معه', 'باب المفعول معه');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'تعريفه اسم بعد واو فسرا ... من كان معه فعل غيره جرى', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 131;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'فانصبه بالفعل الذي به اصطحب ... أوشبه فعل كاستوى الماوالخشب', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 131;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'وكالأمير قادم والعسكرا ... ونحو سرت والأمير للقرى', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 131;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 132, 'باب مخفوضات الأسماء', 'باب مخفوضات الأسماء');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'خافضها ثلاثة أنواع ... الحرف والمضاف والإتباع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 132;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'أما الحروف ههنا فمن إلى ... باء وكاف في ولام عن على', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 132;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'كذاك واوبا وتاء في الحلف ... مذ منذ رب واو رب المنحذف', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 132;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'كسرت من مصر إلى العراق ... وجئت للمحبوب باشتياق', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 132;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('imrithi', 133, 'باب الإضافة', 'باب الإضافة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'من المضاف أسقط التنوينا ... أو نونه كأهلكم أهلونا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, NULL, 'واخفض به الاسم الذي له تلا ... كقاتلا غلام زيد قتلا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, NULL, 'وهو على تقدير أو لام ... أو من كمكر الليل أو غلامي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, NULL, 'أو عبد زيد أو إنا زجاج ... أو ثوب خز أوكباب ساج', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, NULL, 'وقد مضت أحكام كل تابع ... مبسوطة في الأربع التوابع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, NULL, 'فيا إلهي الطف بنا فنتبع ... سبل الرشاد والهدى فنرتفع', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, NULL, 'وفي جمادى سادس السبعينا ... بعد انتها تسع من المئينا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, NULL, 'قد تم نظم هذه (المقدمه) ... في ربع ألف كافيا من أحكمه', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, NULL, 'نظم الفقيرالشرف العمريطي ... ذي العجز والتقصير والتفريط', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, NULL, 'والحمد لله مدى الدوام ... على جزيل الفضل والإنعام', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 11, NULL, NULL, 'وأفضل الصلاة والتسليم ... على النبي المصطفى الكريم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 12, NULL, NULL, 'محمد ms8 وصحبه والآل ... أهل التقى والعلم والكمال', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 13, NULL, NULL, '- عليه السلام -- عليه السلام -- عليه السلام -', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 14, NULL, NULL, 'بعون الله تعالى والحمد لله الذي بنعمته تتم الصالحات،', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 15, NULL, NULL, 'وصلى الله وسلم على نبينا محمد وعلى آله وأصحابه والتابعين لهم بإحسان مدى الأوقات، آمين.  ms9', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'imrithi' AND bab_order = 133;

-- ═══ bidayatulhidayah — OpenITI 0505Ghazali.BidayatHidaya.Shamela0012718-ara1 ═══
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 100, 'بسم الله الرحمن الرحيم', 'بسم الله الرحمن الرحيم');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'قال الشيخ الإمام، العالم العلامة، حجة الاسلام، وبركة الأنام: أبو حامد محمد بن محمد بن الغزالي الطوسى؛ قدس الله روحه، ونور ضريحه - آمين: الحمدلله حق حمده، والصلاة والسلام على خير خلقه، محمد رسوله وعبده، وعلى آله وصحبه من بعده.

أما بعد: فاعلم أيها الحريص المقبل على اقتباس العلم، المظهر من نفسه صدق الرغبة، وفرط التعطش إليه.. أنك إن كنت تقصد بالعلم المنافسة، والمباهاة، والتقدم على الأقران، واستمالة وجوه الناس إليك، وجمع حطام الدنيا؛ فأنت ساع في هدم دينك، وإهلاك نفسك، وبيع آخرتك بدنياك؛ فصفقتك خاسرة، وتجارتك بائرة، ومعلمك معين لك على عصيانك، وشريك لك في خسرانك، وهو كبائع سيف لقاطع طريق، كما قال صلى الله عليه وسلم: (من أعان على معصية ولو بشطر كلمة كان شريكا فيها) .

وإن كانت نيتك وقصدك، بينك وبين الله تعالى، من طلب العلم: الهداية دون مجرد الرواية؛ فأبشر؛ فإن الملائكة تبسط لك أجنحتها إذا مشيت، وحيتان البحر تستغفر لك إذا سعيت. ولكن ينبغي لك أن تعلم، قبل كل شيء، أن الهداية التي هي ثمرة العلم لها بداية

ونهاية، وظاهر وباطن، ولا وصول إلى نهايتها إلا بعد إحكام بدايتها، ولا عثور على باطنها إلا بعد الوقوف على ظاهرها.

وهأنا مشير عليك ببداية الهداية؛ لتجرب بها نفسك، وتمتحن بها قلبك، فإن صادفت قلبك إليها مائلا، ونفسك بها مطاوعة، ولها قابلة؛ فدونك التطلع إلى النهايات والتغلغل في بحار العلوم.

وإن صادفت قلبك عند مواجهتك إياها بها مسوفا، وبالعمل بمقتضاها مماطلا؛ فاعلم أن نفسك المائلة إلى طلب العلم هي النفس الأمارة بالسوء، وقد انتهضت مطيعة للشيطان اللعين ليدليك بحبل غروره؛ فيستدرجك بمكيدته إلى غمرة الهلاك، وقصده أن يروج عليك الشر في معرض الخير حتى يلحقك (بالأخسرين أعمالا، الذين ضل سعيهم في الحياة الدنيا وهم يحسبون أنهم يحسنون صنعا) . وعند ذلك يتلو عليك الشيطان فضل العلم ودرجة العلماء، وما ورد فيه من الأخبار والآثار. ويلهيك عن قوله صلى الله عليه وسلم: (من ازداد علما ولم يزدد ms01 هدى، لم يزدد من الله إلا بعدا) ، وعن قوله صلى الله عليه وسلم: (أشد الناس عذابا يوم القيامة عالم لم ينفعه الله بعلمه) وكان صلى الله عليه وسلم يقول: (اللهم إنى أعوذ بك من علم لا ينفع، وقلب لا يخشع، وعمل لا يرفع، ودعاء لا يسمع) .

وعن قوله صلى الله عليه وسلم: (مررت ليلة أسرى بي بأقوام تقرض شفاههم بمقارض من نار، فقلت: من أنتم؟ قالوا: كنا نأمر بالخير ولا نأتيه وننهى عن الشر ونأتيه) .

فإياك يا مسكين أن تذعن لتزويره فيدليك بحبل غروره، فويل للجاهل حيث لم يتعلم مرة واحدة، وويل للعالم حيث لم يعمل بما عمل ألف مرة.

واعلم أن الناس في طلب العلم على ثلاثة أحوال: رجل طلب العلم ليتخذه زاده إلى المعاد، ولم يقصد به إلا وجه الله والدار الآخرة؛ فهذا من الفائزين.

ورجل طلبه ليستعين به على حياته العاجلة، وينال به العز والجاه والمال، وهو عالم بذلك، مستشعر في قلب ركاكه حاله وخسة مقصده، فهذا من المخاطرين. فإن عاجله أجله قبل التوبة خيف عليه من سوء الخاتمة، وبقي أمره في خطر

المشيئة؛ وإن وفق للتوبة قبل حلول الأجل، وأضاف إلى العلم العمل، وتدارك ما فرط منه من الخلل - التحق بالفائزين، فإن التائب من الذنب كمن لا ذنب له.

ورجل ثالث استحوذ عليه الشيطان؛ فاتخذ علمه ذريعة إلى التكاثر بالمال، والتفاخر بالجاه، والتعزز بكثرة الأتباع، يدخل بعلمه كل مدخل رجاء أن يقضى من الدنيا وطره، ن وهو مع ذلك يضمر في نفسه أنه عند الله بمكانة، لاتسامه بسمة العلماء، وترسمه برسومهم في الزى والمنطق، مع تكالبه على الدنيا ظاهرا وباطنا.. فهذا من الهالكين، ومن الحمقى المغرورين؛ إذ الرجاء منقطع عن توبته لظنه أنه من المحسنين، وهو غافل عن قوله تعالى (يأيها الذين آمنوا لم تقولون مالا تفعلون) . وهو ممن قال فيهم رسول الله: (أنا من غير الدجال أخوف عليكم من الدجال) فقيل: وما هو يارسول الله؟، فقال: (علماء السوء) . وهذا لأن الدجال غايته الإضلال، ومثل هذا ms02 العالم وإن صرف الناس عن الدنيا بلسانه ومقاله فهو دافع لهم إليها بأعماله وأحواله، ولسان الحال أفصح من لسان المقال، وطباع الناس إلى المساعدى في الأعمال أميل منها إلى المتابعة في الأقوال؛ فما أفسده هذا المغرور بأعماله أكثر مما أصلحه بأقواله، إذ لا يستجرىء الجاهل على الرغبة في الدنيا إلا باستجراء العلماء، فقد صار علمه سببا لجرأة عباد الله على معاصيه، ونفسه الجاهلة مذلة مع ذلك تمنيه وترجيه، وتدعوه إلى أن يمن على الله بعلمه، وتخيل إليه نفسه أنه خير من كثير من عباد الله.

فكن أيها الطالب من الفريق الأول، واحذر أن تكون من الفريق الثاني، فكم من مسوف عاجله الأجل قبل التوبة فخسر، وإياك ثم إياك أن تكون من الفريق الثالث، فتهلك هلاكا لا يرجى معه فلاحك، ولا ينتظر صلاحك.

فإن قلت: فما بداية الهداية لأجرب بها نفسي، فاعلم أن بدايتها ظاهرة التقوى، ونهايتها باطنة التقوى؛ فلا عاقبة إلا بالتقوى، ولا هداية إلا للمتقين.

والتقوى، عبارة عن امتثال أوامر الله تعالى، واجتناب نواهيه، فهما قسمان، وهأنا أشير عليك بجمل مختصرة من ظاهر علم التقوى في القسمين جميعا،

وألحق قسما ثالثا ليصير هذا الكتاب جامعا مغنيا والله المستعان.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 101, 'القسم الأول', 'القسم الأول');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'في الطاعات', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 102, 'توطئة', 'توطئة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'اعلم أن أوامر الله تعالى فرائض ونوافل؛ فالفرض رأس المال، وهو أصل التجارة وبه تحصل النجاة، والنفل هو الربح وبه الفوز بالدرجات، قال صلى الله عليه وسلم: (يقول الله تبارك وتعالى: (ما تقرب إلي المتقربون بمثل أداء ما افترضت عليهم، ولا يزال العبد يتقرب إلى بالنوافل حتى أحبه، فإذا أحببته كنت سمعه الذي يسمع به، وبصره الذي يبصر به، ولسانه الذي ينطق به، ويده التي يبطش بها، ورجله التي يمشي بها) .

ولن تصل أيها الطالب إلى القيام بأوامر الله تعالى إلا بمراقبة قلبك وجوارحك في لحظاتك وأنفاسك، حين تصبح إلى حين تمسى. فاعلم أن الله تعالى مطلع على ضميرك، ومشرف على ظاهرك وباطنك، ومحيط بجميع لحظاتك، وخطراتك، وخطواتك، وسائر سكناتك وحركاتك؛ وأنك في مخالطتك وخلواتك متردد ms03 بين يديه؛ فلا يسكن في الملك والملكوت ساكن، ولا يتحرك متحرك، إلا وجبار السموات والأرض مطلع عليه، يعلم خائنة الأعين وما تخفي الصدور، ويعلم السر وأخفى؛ فتأدب أيها المسكين ظاهرا وباطنا بين يدي الله تعالى تأدب العبد الذليل المذنب في حضرة الملك الجبار القهار، واجتهد ألا يراك مولاك حيث نهاك، ولا يفقدك حيث أمرك.

ولن تقدر على ذلك إلا بأن توزع أوقاتك، وترتب أورادك من صباحك إلى مسائك، فاصغ إلى ما يلقى إليك من أوامر الله تعالى عليك من حين تستيقظ من منامك إلى وقت رجوعك إلى مضجعك.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 103, 'فصل في آداب الاستيقاظ من النوم', 'فصل في آداب الاستيقاظ من النوم');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فإذا استيقظت من النوم، فاجتهد أن تستيقظ قبل طلوع الفجر، وليكن أول ما يجري على قلبك ولسانك ذكر الله تعالى؛ فقل عند ذلك: الحمدلله الذي أحيانا بعدما أماتنا وإليه النشور، أصبحنا وأصبح الملك لله، والعظمة والسلطان لله، والعزة والقدرة لله رب العالمين، أصبحنا على فطرة الاسلام، وعلى كلمة الاخلاص، وعلى دين نبينا محمد صلى الله عليه وسلم، وعلى ملة أبينا إبراهيم حنيفا مسلما وما كان من المشركين؛ اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور؛ اللهم إنا نسألك أن تبعثنا في هذا اليوم إلى كل خير، ونعوذ بك أن نجترح فيه سوءا أو نجره إلى مسلم، أو يجره أحد إلينا؛ نسألك خير هذا اليوم وخير مافيه ونعوذ بك من شر هذا اليوم وشر ما فيه.

فإذا لبست ثيابك فانو به امتثال أمر الله تعالى في ستر عورتك، واحذر أن يكون قصدك من لباسك مراءاة الخلق فتخسر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 104, 'باب آداب دخول الخلاء', 'باب آداب دخول الخلاء');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فإذا قصدت بيت الماء لقضاء الحاجة، فقدم في الدخول رجلك اليسرى، وفي الخروج رجلك اليمنى، ولا تستصحب شيئا عليه اسم الله تعالى ورسوله. ولا تدخل حاسر الرأس، ولا حافي القدمين.

وقل عند الدخول: باسم الله، أعوذ بالله من الرجس النجس، الخبيث المخبث، الشيطان الرجيم.

وعند الخروج: غفرانك، الحمدلله الذي أذهب عني ما يؤذيني وأبقى في ما ينفعني.

وينبغي أن تعدل النبل قبل قضاء ms04 الحاجة، والا تستنجي بالماء في موضع قضاء الحاجة، وأن تستبرىء من البول بالتنحنح والنتر ثلاثا، وبإمرار اليد اليسرى على أسفل القضيب.

وإن كنت في الصحراء، فابعد عن عيون الناظرين واستتر بشيء إن وجدته، ولا تكشف عورتك قبل الانتهاء إلى موضع الجلوس.

ولا تستقبل الشمس ولا القمر، ولا تستقبل القبلة ولا تستدبرها، ولا تجلس في متحدث الناس، ولا تبل في الماء الراكد وتحت الشجرة المثمرة، ولا في الجحر، واحذر الارض الصلبة ومهب الريح، احترازا من الرشاش لقوله صلى الله عليه وسلم: (إن عامة الوسواس منه) .

واتكىء في جلوسك على الرجل اليسرى، ولا تبل قائما إلا عن ضرورة، واجمع في الاستنجاء بين استعمال الحجر والماء، فإذا أردت الاقتصار على أحدهما فالماء أفضل، وإذا اقتصرت على الحجر فعليك أن تستعمل ثلاثة أحجار طاهرة منشفه للعين، تمسح القضيب في ثلاثة مواضع من حجر، فإن لم يحصل الإنقاء بثلاثة فتمم خمسة أو سبعة إلى أن ينقى بالإيتار؛ فالإيتار مستحب والانقاء واجب. ولا تستنج إلا باليد اليسرى.

وقل عند الفراغ من الاستنجاء: اللهم طهر قلبيى من النفاق وحصن فرجي من الفواحش. وادعك يدك بعد تمام الاستنجاء بالارض أو بحائط ثم اغسلها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 105, 'باب آداب الوضوء', 'باب آداب الوضوء');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فإذا فرغت من الاستنجاء، فلا تترك السواك؛ ن فإنه مطهرة للفم، ومرضاة للرب، ومسخطة للشيطان وصلاة بسواك أفضل من سبعين صلاة بلا سواك. وروي عن أبي هريرة رضى الله عنه قال: قال رسول الله صلى الله عليه وسلم: (لولا أن أشق على أمتي لأمرتهم بالسواك في كل صلاة) ، وعنه صلى الله عليه وسلم: (أمرت بالسواك حتى خشيت أن يكتب علي) .

ثم اجلس للوضوء مستقبل القبلة على موضع مرتفع كي لا يصيبك الرشاش، وقل بسم الله الرحمن الرحيم، رب أعوذ بك من همزات الشياطين وأعوذ بك رب بأن يحضرون.

ثم اغسل يديك ثلاثا قبل أن تدخلهما الإناء، وقل: اللهم إني أسألك اليمن والبركة، وأعوذ بك من الشؤم والهلكة.

ثم انو رفع الحدث واستباحة الصلاة، ولا ينبغي أن تعزب نيتك قبل غسل الوجه، فلا ms05 يصح وضؤوك.

ثم خذ غرفة لفمك وتمضمض بها ثلاثا، وبالغ في رد الماء إلى الغلصمة إلا أن تكون صائما فترفق، وقل اللهم أعني على تلاوة كتابك وكثرة الذكر لك، وثبتني بالقول الثابت في الحياة الدنيا وفي الآخرة.

ثم خذ غرفة لأنفك واستنشق بها ثلاثا، واستنثر ما في الأنف من رطوبة، وقل في الاستنشاق: اللهم أرحني رائحة الجنة وأنت عني راض، وفي الاستنثار: اللهم إني أعوذ بك من روائح النار وسوء الدار.

ثم خذ غرفة لوجهك، فاغسل بها من مبتدأ تسطيح الجبهة إلى منتهى ما يقبل من الذقن في الطول، ومن الأذن في العرض، وأوصل الماء إلى موضع التجديف، وهو ما يعتاد النساء تنحية الشعر عنه، وهو ما بين رأس الأذن إلى زاوية الجبين، أعني ما يقع منه في جبهة الوجه، وأوصل الماء إلى منابت الشعور الأربعة: الحاجبين، والشاربين، والأهداب، والعذران (وهما ما يوازيان الأذنين، من مبتدأ اللحية) ، ويجب إيصال الماء إلى منابت الشعر من اللحية الخفيفة، دون الكثيفة؛ وقل عندن غسل الوجه: اللهم بيض وجهي بنورك يوم تبيض وجوه أوليائك، ولا تسود وجهي بكلماتك يوم تسود وجوه أعدائك.. ولا تترك تخليل اللحية

الكثيفة.

ثم اغسل يدك اليمنى، ثم اليسرى مع المرفقين إلى أنصاف العضدين، فإن الحلية في الجنة تبلغ مواضع الوضوء. وقل عند غسل اليد اليمنى: أعطني كتابي بيميني، وحاسبني حسابا يسيرا، وعند غسل الشمال: اللهم إني أعوذ بك أن تعطيني كتابي بشمالي أو من وراء ظهري.

ثم استوعب رأسك بالمسح، بأن تبل أيداك وتلصق رؤوس أصابع يدك اليمنى باليسرى، وتضعهما على مقدمة الرأس، وتمررهما إلى القفا، ثم ترددهما إلى المقدمة، فهذه مرة، تفعل ذلك ثلاث مرات، وكذلك في سائر الأعضاء، وقل: اللهم غشني برحمتك، وأنزل على من بركاتك، وأظلني تحت ظل عرشك يوم لا ظل إلا ظلك، اللهم حرم شعري وبشرى على النار.

ثم امسح أذنيك ظاهرهما وباطنهما بماء جديد، وأدخل مسبحتك في صماخ أذنيك، وأمسح أذنيك ببطن إبهاميك، وقل: اللهم اجعلني من الذين يستمعون القول فيتبعون أحسنه، اللهم ms06 أسمعني منادى الجنة في الجنة مع الأبرار.

ثم امسح رقبتك، وقل: اللهم فك رقبتي من النار، وأعوذ بك من السلاسل والأغلال.

ثم اغسل رجلك اليمنى ثم اليسرى مع الكعبين، وخلل بخنصر اليسرى أصابع رجلك اليمنى مبتدئا بخنصرها، حتى تختم بخنصر اليسرى، وتدخل الأصابع من أسفل، وقل: اللهم ثبت قدمي على الصراط المستقيم مع أقدام عبادك الصالحين.. وكذلك تقول عند غسل اليسرى: اللهم إني أعوذ بك آن تزول قدمي على الصراط في النار يوم تزل أقدام المنافقين والمشركين. وارفع الماء إلى أنصاف الساقين، وراع التكرار ثلاثا في جميع أفعالك.

فإذا فرغت فارفع بصرك إلى السماء، وقل: اشهد أن لا إله إلا الله وحده لا شريك له، وأشهد أن محمد عبده ورسوله، تسبحانك اللهم وبحمدك، أشهد أن لا إله إلا أنت، أنت التواب الرحيم، اللهم اجعلني من التوابين؛ واجعلني من المتطهرين، واجعلني من عبادك الصالحين واجعلني صبورا، شكورا، واجعلني أذكرك ذكرا كثيرا، وأسبحك بكرة وأصيلا.

فمن قرأ هذه الدعوات في وضوئه خرجت خطاياه من جميع أعضائه، وختم على وضوئه بخاتم، ورفع له تحت العرش، فلم يزل يسبح الله تعالى ويقدسه، ويكتب له ثواب ذلك إلى يوم القيامة.

واجتنب في وضوئك سبعا: لاتنفض يديك فترش الماء، ولا تلطم وجهكن ورأسك بالماء لطما، ولا تتكلم في أثناء الوضوء، ولا تزد في الغسل

على ثلاث مرات، ولا تثكر صب الماء من غير حاجة بمجرد الوسوسة، فلموسوسين شيطان يضحك بهم يقال له (الولهان) ولا تتوضأ بالماء المشمس ولا من الأواني الصفرية، فهذه السبعة مكروهه في الوضوء.

وفي الخبر أن: (من ذكر الله عند وضوئه طهر الله جسده كله، ومن لم يذكر الله لم يطهر منه إلا ما أصابه الماء) .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 106, 'آداب الغسل', 'آداب الغسل');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فإذا أصابتك جنابة، من احتلام أو وقاع، فخذ الإناء إلى المغتسل، واغسل يديك أولا ثلاثا، وأزل ما على بدنك من قذر، وتوضأ كما سبق في وضوئك للصلاة مع جميع الدعوات، وأخر غسل قدميك، كيلا يضيع الماء فإذا فرغت من الوضوء فصب الماء على راسك ثلاثا ms07 وأنت ناو رفع الحدث من الجنابة، ثم على شقك الأيمن ثلاثا، ثم على الأيسر ثلاثا، وادعك ما أقبل من بدنك وما أدبر ثالثا، وخلل شعر رأسك ولحيتك، وأوصل الماء إلى معاطف البدن ومنابت الشعر ما خفف منه وما كثف.

واحذر أن تمس ذكرك بعد الوضوء فإن أصابته يدك فأعد الوضوء.

والفريض من جملة ذلك كله: النية، وإزالة النجاسة، واستيعاب البدن بالغسل.

وفرض الوضوء: غسل الوجه واليدين مع المرفقين، ومسح بعض الرأس، وغسل الرجلين إلى الكعبين مرة، مع النية والترتيب.

وما عداها سنن مؤكدة فضلها كثير، وثوابها جزيل والمتهاون بها خاسر، بل هو بأصل فرائضه مخاطر، فإن النوافل جوابر للفرائض.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 107, 'آداب التيمم', 'آداب التيمم');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فإن عجزت عن استعملا الماء لفقده بعد الطلب، أو لعذر من مرض، أو لمانع من الوصول إليه من سبع أو حبس، أو كان الماء الحاضر تحتاج إليه لعطشك أو لعطش رفيقك، أو ملكا لغيرك ولم يبع إلا بأكثر من ثمن المثل، أو كان بك جراحة أو مرض تخاف منه على نفسك - فاصبر حتى يدخل وقت الفريضة، ثم اقصد صعيدا طيبا عليه تراب خالص طاهر لين، فاضرب عليه بكفيك ضاما بين أصابعك، وانو استباحة فرض الصلاة،

وامسح بهما وجهك كله مرة، ولا تتكلف إيصال الغبار إلى منابت الشعر خف أو كثف، ثم انزع خاتمك، واضرب ضربة ثانية مفرجا ما بين أصابعك، واسمح بهما يديك بمع مرفقيك، فإن لم تستوعبهما فاضرب ضربة أخرى إلى أن تستوعبهما، ثم امسح إحدى كفيك بالأخرى، وامسح نما بين أصابعك بالتخليل.

وصل به فرضا واحدا وما شئت من النوافل، فإن أردت فرضا ثانيا فاستأنف تيمما آخر.

آداب الخروج إلى المسجد

فإذا فرغت من طهارتك فصل في بيتك ركعتي الصبح إن كان الفجر قد طلع، كذلك كان يفعل رسول الله صلى الله عليه وسلم ثم يتوجه إلى المسجد.

ولا تدع الصلاة في الجماعة، لا سيما الصبح (فصلاة الجماعة تفضل على الفرد شرين درجة) فإن كنت تتساهل في مثل هذا لربح فأي فائدة لك في طلب العلم؟ وإنما ms08 ثمرة العلم العمل به.

فإذا سعيت إلى المسجد، فامش على هينة وتؤدة وسكينة، ولا تعجل وقل في طريقك: اللهم إني أسألك بحق السائلين عليك، وبحق الراغبين إليك، وبحق ممشاى هذا إليك؛ فإني لم أخرج أشرا ولا بطرا، ولا رياء، ولا سمعة، بل خرجت اتقاء سخطكن، وابتغاء مرضاتك فأسألك أن تنقذني من النار، وأن تغفر لي ذنوبي؛ فإنه لا يغفر الذنوب إلا أنت.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 108, 'آداب دخول المسجد', 'آداب دخول المسجد');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فإذا أردت الدخول إلى المسجد، فقدم رجلك اليمنى، وقل: اللهم صل على محمد وعلى آل محمد وصحبه وسلم؛ اللهم اغفر لي ذنوبي وافتح لي أبواب رحمتك.

ومهما رأيت في المسجد من يبيع أو يبتاع، فقل: لا أربح الله تجارتك. وإذا رأيت فيه من ينشد ضالة، فقل: لا رد الله عليك ضالتك - كذلك أمر رسول الله صلى الله عليه وسلم.

فإذا دخلت المسجد، فلا تجلس حتى تصلي ركعتي التحية، بفإن لم تكن على طهارة أو لم ترد فعلها كفتك الباقيات الصالحات ثلاثا، وقيل أربعا، وقيل ثلاثا للمحدث وواحدة للمتوضىء. فإن لم تكن صليت في بيتك ركعتي الفجر، فيجزئك أداؤهما عن التحية.

فإذا فرغت من الركعتين، فانو

الاعتكاف وادع بما دعا به رسول الله صلى الله عليه وسلم بعد ركعتي الفجر، فقل: (اللهم إني أسألك رحمة من عندك، تهدي بها قلبي، وتجمع بها شملي، وتلم بها شعثي، وترد بها ألفتي وتصلح بها ديني وتحفظ بها غائبي، وترفع بها شاهدي، وتزكي بها عملي، وتبيض بها وجهي، ولتهمني بها رشدي، وتقضي لي بها حاجتي، وتعصمني بها من كل سوء، اللهم إني أسألك إيمانا خالصا دائما يباشر قلبي، ويقينا صادقا، حتى أعلم أنه لن يصيبني إلا ما كتبته على، ورضني بما قسمته لي، اللهم إني أسألك إيمانا صادقا، ويقينا ليس بعده كفر؛ وأسألك رحمة أنال بها شرف كرامتك في الدنيا والآخرة؛ اللهم إني أسألك الفوز عند اللقاء والصبر عند القضاء، ومنازل الشهداء وعيش السعداء والنصر على الأعداء، ومرافقة الأنبياء؛ اللهم إني أنزل بك حاجتي، وإن ضعف رأيي وقصر عملية، وافتقرت ms09 إلى رحمتك فأسألك يا قاضي الأمور وياشافي الصدور، كما تجير بين البحور أن تجيرني من عذاب السعير، ومن دعوة الثبور ومن فتنة القبور؛ اللهم ما قصر عنه رأيي، وضعف عنه عملي، ولم تبلغه نيتي وأمنيتي، من خير وعدته أحدا من عبادك أو خير أنت معطيه أحدا من خلقك فإني أرغب إليك فيه، وأسألك إياه يارب العالمين؛ اللهم اجعلنا هادين مهتدين، غير ضالين ولا مضلين؛ حربا لأعدائك سلما لأوليائك نحب بحبك الناس، ونعادي بعداوتك من خالفك من خلقك؛ اللهم هذا الدعاء وعليك الإجابة وهذا الجهد وعليك التكلان، وإنا لله وإنا إليه راجعون ولا حول ولا قوة إلا بالله العلي العظيم؛ اللهم ذا الحبل الشديد، والأمر الرشيد، أسألك الأمن يوم الوعيد، والجنة يوم الخلود مع المقربين الشهود، والركع السجود، الموفين لك بالعهود؛ إنك رحيم ودود وإنك تفعل ما تري سبحان من تعطف بالعز وقال به، سبحان من لبس المجد وتكرم به، سبحان من لا ينبغي التسبيح إلا له، سبحان ذي الفضل والنعم، سبحان ذي الجود والكرم، سبحان الذي أحصى كل شيء بعمله؛ اللهم اجعل لي نورا في قلبي، ونورا في قبري، ونورا في سمعي ونورا في بصري ونورا في شعري، ونورا في بشري، ونورا في لحمي، ونورا في دمي، ونورا في عظامي، ونورا من بين يدي، ونورا من خلفي ونورا من يمين ونورا عن شمالي ونورا من فوق ونورا من تحتي؛ اللهم زدني نورا، وأعطني نورا أعظم نور، واجعل لي نورا برحمتك يا أرحم الراحمين.

فإذا فرغت من الدعاء، فلا تشتغل إلى وقت الفرض

إلا بفكر وتسبيح أو قراءة قرآن. فإذا سمعت الأذان في أثناء ذلك فاقطع ما أنت فيه واشتغل بجواب المؤذن.

فإذا قال المؤذن: الله أكبر، فقل مثل ذلك، وكذلك في كلم كلمة غلا في الحيعلتين فقل فيهما: لا حول ولا قوة إلا بالله العلي العظيم.

فإذا قال: الصلاة خير من النوم، فقل: صدقت وبررت وأنا على ذلك من الشاهدين. ن فإذا سمعت الاقامة فقل مثل ما يقول، إلا في ms10 قوله: قد قامت الصلاة، فقل: أقامها الله وأدامها ما دامت السموات والأرض. فإذا فرغت من جواب المؤذن فقل: اللهم إني أسألك عند حضور صلاتك وأصوات دعاتك، وإدبار ليلك، وإقبال نهارك: أن تؤتي محمدا الوسيلة والفضيلة والدرجة الرفيعة وابعثه المقام المحمود الذي وعدته إنك لا تخلف الميعاد يا أرحم الراحمين. فإذا سمعت الأذان وأنت في الصلاة فتمم الصلاة، ثم تدارك الجواب بعد السلام على وجهه.

فإذا أحرم الإمام بالفرض، فلا تشتغل إلا بالاقتداء به وصل الفرض كما سيتلى عليك في كيفية الصلاة وآدابها فإذا فرغت فقل: اللهم صلى على محمد وعلى آل محمد وسلم، اللهم أنت السلام، ومنك السلام، وإليك يعود السلام، فحينا ربنا بالسلام، وأدخلنا الجنة دار السلام؛ تباركت يا ذا الجلال والإكرام؛ سبحان ربي العلى الأعلى الوهاب، لا إله إلا الله وحده لا شريك له، له الملك، وله الحمد، يحيى ويميت، وهو حي لا يموت، بيده الخير، وهو على كل شيء قدير، لا إله إلا الله، أهل النعمة والفضل والثناء الحسين، لا إله إلا الله، ولا نعبد إلا إياه مخلصين له الدين ولو كره الكافرون.

ثم ادع بعد ذلك بالجوامع الكوامل، وهو ما علمه رسول الله صلى الله عليه وسلم - عائشة رضي الله عنها، فقل: (اللهم إني أسألك من الخير كله عاجله وآجله ما علمت منه وما لم أعلم، وأعوذ بك من الشر كله عاجله وآجله ما علمت منه وما لم أعلم، وأسألك الجنة وما يقرب إليها من قول وعمل ونية واعتقاد، وأعوذ بك من النار وما يقرب إليها من قول وعمل ونية واعتقاد، وأسألك من خير ما سألك منه عبدك ونبيك محمد صلى الله عليه وسلم، وأعوذ بك من شر ما استعاذك منه عبدك ونبيك محمد صلى الله عليه وسلم، وما قضيت على من أمر فاجعل عاقبته رشدا) .

ثم ادع بما أوصى به رسول الله صلى الله عليه وسلم فاطمة رضي الله عنها، فقل: (يا حي يا قيوم، يا ذا الجلال والإكرام، لا إله إلا أنت برحمتك أستغيث، ms11 ومن عذابك أستجير، لا تكلني إلى نفسي، ولا إلى أحد من خلقك طرفة عين، وأصلح لي شأني كله بما أصلحت به الصالحين) .

ثم قل ما قاله عيسى على نبينا

وعليه الصلاة والسلام.

اللهم إني أصبحت لا أستطيع دفع ما أكره، ولا أملك نفع ما أرجو، وأصبح الأمر بيدك لا بيد غيرك، وأصبحت مرتهنا بعملي؛ فلا فقير أفقر مني إليك، ولا غنى أغنى منك عني، اللهم لا تشمت بي عدوى، ولا تسؤ بي صديقي، ولا تجعل مصيبتي في ديني، ولا تجعل الدنيا أكبر همي ولا مبلغ علمي، ولا تسلط علي بذنبي من لا يرحمني.

ثم ادع بما بدا لك من الدعوات المشهورات، واحفظها مما أوردنا في كتاب الدعوات من كتاب (إحياء علوم الدين) .

ولتكن أوقاتك بعد الصلاة إلى طلوع الشمس، موزعة على أربع وظائف: وظيفة في الدعوات، ووظيفة في الأذكار والدعوات؛ وتكررها في مسبحة، ووظيفة في قراءة القرآن، ووظيفة في التفكر، فتفكر في ذنوبك وخطاياك وتقصيرك في عبادة مولاك، وتعرضك لعقابه الأليم وسخطه العظيم.

وترتب بتدبيرك أورادكن في جميع يومك لتتدارك به ما فرط من تقصيرك، وتحترز من التعرض لسخط الله تعال الأليم في يومك، وتنوي الخير لجميع المسلمين وتعز ألا تشغل في جميع نهارك إلا بطاعة الله تعالى، وتقصد في قلبك الطاعات التي تقدر عليها وتختار أفضلها، وتتأمل تهيئة أسبابها لتشتغل بها؛ ولا تدع عنك التفكر في قرب الأجل، وحلول الموت القاطع للأمل، وخروج الأمر عن الاختيار، وحصول الحسرة والندامة بطول الاغترار.

وليكن من تسابيحك، وأذكارك عشر كلمات: إحداهن: لا إله إلا الله، وحده لا شريك له، له الملك، له الحمد، يحيى ويميت، وهو حي لا يموت، بيده الخير، وهو على كل شيء قدير.

الثانية: لا إله إلا الله الملك الحق المبين.

الثالثة: لا إله إلا الله الواحدن القهار، رب السموات والأرض وما بينهما العزيز الغفار.

الرابعة: سبحان الله، والحمدلله، ولا إله إلا الله، والله أكبر، ولا حول ولا قوة إلا بالله العلي العظيم.

الخامسة: سبوح قدوس رب الملائكة والروح. ms12

السادسة: سبحان الله وبحمده، سبحان الله العظيم.

السابعة: أستغفر الله العظيم الذي لا إله إلا الله هو الحي القيوم، وأسأله التوبة والمغفرة.

الثامنة: اللهم لا مانع لما أعطيت ولا معطي لما منعت، ولا راد لما قضيت ولا ينفع ذا الجد منك الجد.

التاسعة: اللهم صلى على محمد، وعلى آل محمد وصحبه وسلم.

العاشرة: بسم الله الذي لا يضر مع اسمه شيء في الأرض ولا في السماء، وهو السميع العليم.

تكرر كل واحدة من هذه الكلمات إما مائة مرة أو سبعين مرة، أو عشر مرات، وهو أقله، ليكون المجموع مائة. ولازم هذه الاوراد، ولا تتكلم قبل طلوع الشمس؛ ففي الخبر أن ذلك أفضل من اعتاق ثمان رقاب من ولد اسماعيل - على نبينا

وعليه الصلاة والسلام - أعني الاشتغال بالذكر إلى طلوع الشمس من غير أن يتخلله كلام.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 109, 'آداب ما بعد طلوع الشمس إلى الزوال', 'آداب ما بعد طلوع الشمس إلى الزوال');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فإذا طلعت الشمس وارتفعت قدر رمح، فصل ركعتين، وذلك عند زوال وقت الكراهة للصلاة؛ فإنها مكروهة من بعد فريضة الصبح إلى ارتفاع الشمس.

فإذا أضحى النهار، ومضى منه قريب من ربعه، صل صلاة الضحى أربعا أو ستا أو ثمانية، مثنى، مثنى،؛ فقد نقلت هذه الاعداد كلها عن رسول الله صلى الله عليه وسلم.

والصلاد خير كلها فمن شاء فليستكثر، ومن شاء فليستقلل، فليس بين طلوع الشمس والزوال راتبة من الصلة إلا هذه؛ فما فضل منها من أوقاتك فلك فيه أربع حالات: الحالة الأولى وهي الافضل: أن يصرفه في طلب العلم النافع في الدين، دون الفصول الذي أكب الناس عليه وسموه علما.

والعلم النافع هو ما يزيد في خوفك من الله تعالى، ويزيد في بصيرتك بعيوب نفسك، ويزيد في معرفتك بعبادة ربك، ويقلل من رغبتك في الدنيا، ويزيد في رغبتك فني الآخرة، ويفتح بصيرتك بآفات أعمالك حتى تحترز منها، ويطلعك على مكايد الشيطان وغروره، وكيفية تلبيسه على علماء السوء، ن حتى عرضهم لمقت الله تعالى وسخطه؛ ن حيث أكلوا الدنيا بالدين، واتخذوا العلم ذريعة ووسيلة الى أخذ اموال السلاطين، ms13 وأكل أموال الاوقاف واليتامى والمساكين، وصرفوا همتهم طول نهارهم إلى طلب الجاه والمنزلة في قلوب الخلق، واضطرهم ذلك إلى المراءاة والممراة، والمشاقة في الكالم والمباهاة.

وهذا الفن من العلم النافع، قد جمعناه في كتاب (إحياء علوم الدين) فإن كنت من أهله فحصله واعمل به ثم علمه وادع إليه؛ فمن علم ذلك وعمل به، ثم علمه ودعا إليه فذلك يدعى عظيما في ملكوت السموات بشهادة عيسى عليه السلام.

فإذا أفرغت من ذلك كله، وفرغت من إصلاح نفسك ظاهرا وباطنا، وفضل شيء من أوقاتك، فلا بأس أن تشتغل بعلم المذهب في الفقه لتعرف به الفروع النادرة في العبادات، وطريق التوسط بين الخلق في الخصومات عند انكبابهم على الشهوات.. فذلك أيضا بعد الفراغ من هذه المهمات من جملة فروض الكفايات.

فإن دعتك نفسك إلى ترك ما ذكرناه من الأوراد والأذكار استثقالا لذلك، فاعلم أن الشيطان اللعين قد دس في قلبك

الداء الدفين، وهو حب المال والجاه فإياك أن تغتر به، فتكون ضحكة له، فيهلكك، ثم يسخر منك.

فإن جربت نفسك مدة في الاوراد والعبارات، فكانت لا تستثقلها كسلا عنها، لكن ظهرت رغبتك في تحصيل اعلم النافع، ولم ترد به إلا وجه الله تعالى والدار الآخرة، فذلك أفضل من نوافل العبادات مهما صحت النية. ولكن الشأن في صحة النية فإن لم تصح النية فهو معدن غرور الجهال، ومزلة أدام الرجال.

الحالة الثانية: ألا تقدر على تحصيل اعلم النافع في الدين، ولكن تشتغل بوظائف العبادات من الذكر والتسبيح والقراءة والصلاة فذلك من درجات العابدين، وسير الصالحين، وتكون أيضا بذلك من الفائزين.

الحالة الثالثة: أن تشتغل بما يصل منه خير إلى المسلمين، ويدخل به سرور على قلوب المؤمنين، أو تتيسر به الأعمال الصالحة للصالحين: كخدمة الفقهاء والصوفية وأهل الدين، والتردد في أشغالهم، والسعي في إطعام الفقراء والمساكين، والتردد مثلا على المرضى بالعيادة، وعلى الجنائز بالتشييع، فكان ذلك أفضل من النوافل؛ فإن هذه عبادات، وفيها رفق للمسلمين.

الحالة الرابعة: ألا تقوى على ذلك، فاشتغل بحاجاتك اكتسابا على ms14 نفسك أو على عيالك، وقد سلم المسلمون منك وآمنوا من لسانك ويدك، وسلم لك دينك، إذا لم ترتكب معصية؛ فتنال بذلك درجة أصحاب اليمين، إن لم تكن من أهل الترقي إلى مقامات السابقين.

فهذا أقل الدرجات في مقامات الدين، وما بعد هذا فهو من مراتع الشياطين؛ وذلك بأن تشتغل - والعياذ بالله - بما يهدم دينك، أو تؤذي به عبدا من عباد الله تعالى؛ فهذه رتبة الهالكين؛ فإياك أن تكون في هذه الطبقة.

واعلم أن العبد في حق دينه على ثلاث درجات: إما سالم.. وهو المقتصر على أداء الفرائض وترك المعاصي.

أو رابح.. وهو المتطوع بالقربات والنوافل.

أو خاسر.. وهو المصر عن اللوازم.

فإن نلم تقدر أن تكون رابحا، فاجتهد أن تكون سالما، وإياك ثم إياك أن تكون خاسرا.

والعبد في حق سائر العباد له ثلاث درجات: الأولى: أن ينزل في حقهم منزلة الكرام البررة من الملائكة، وهو أن يسعى في أغراضهم؛ رفقا بهم، وإدخالا للسرور على قلوبهم.

الثانية: أن ينزل في حقهم منزلة البهائم والجمادات؛ فلا ينالهم خيره، ولكن عنهم شره.

الثالثة: أن ينزل في حقهم منزلة العقارب والحيات والسباع الضاريات، لا يرجى خيره، ويتقى شره.

فإن لم تقدر على أن تلتحق بأفق الملائكة، فاحذر أن تنزل عن درجة البهائم والجمادات إلى درجة العقارب

والحيات والسباع الضاريات. فإن رضيت لنفسك النزول من أعلى عليين، فلا ترض لها من الهوى إلى أسفل سافلين، فلعلك تنجو كفافا لا لك ولا عليك.

فعليك في بياض نهارك الا تشتغل إلا بما ينفعك في معادك أو معاشك الذي لا تستغنى عن الاستعانة به على معادك. فإن عجزت عن القيام بحق دينك مع مخالطة الناس، وكنت لا تسلم، فالعزلة أولى، فعليك بها؛ ففيها النجاة والسلامة. فإن كانت الوساوس في العزلة تجاذبك إلى مالا يرضى الله تعالى، ولم تقدر على قمعها بوظائف العبادات فعليك بالنوم فهو أحسن أحوالك وأحوالنا إذا عجزنا عن الغنيمة رضينا بالسلامة في الهزيمة. فأحسن بحال من سلامة دينه في تعطيل حياته إذ النوم أخو ms15 الموت، وهو تعطيل الحياة والتحاق بالجمادات.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 110, 'آداب الاستعداد لسائر الصلوات', 'آداب الاستعداد لسائر الصلوات');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'آداب الاستعداد لسائر الصلوات ينبغي أن تستعد لصلاة الظهر قبل الزوال، فتقدم الفيلولة إن كان بك قيام في الليل، أو سهر في الخير؛ فإن فيها معونة على قيام الليل، كما أن في السحور معونة على صيام النهار، والقيلولة من غير قيام بالليل كالسحور من غير صيام بالنهار.

فإذا قلت، فاجتهد أن تستيقظ قبل الزوال، وتتوضأ وتحضر المسجد، وتصلي تحية المسجد، وتنتظر المؤذن فتجيبه، ثم تقوم فتصلي أربع ركعات عقب الزوال، كان رسول الله صلى الله عليه وسلم يطولهن ويقول: (هذا وقت تفتح فيه أبواب السماء، فأحب أن يرفع لي فيه عمل صالح) . وهذه الأربع قبل الظهر سنة مؤكدة؛ ففي الخبر: (من صلاهن فأحسن ركوعهن وسجودهنن صلى معه سبعون ألف ملك يستغفرون له إلى الليل) .

ثم صل الفرض مع الإمام ثم صل بعد الفرض ركعتين؛ فهما من الرواتب الثابتة.

ثم صل الفرض مع الإمام، ثم صل بعد الفرض ركعتين فهما من الرواتب الثابتة.

ولا تشتغل إلى العصر إلا بتعلم علم أو إعانة مسلم، أو قراءة قرآن أو سعي في معاش لتستعين به على دينك، ثم صل أربع ركعات قبل العصر؛ فهي سنة مؤكدة؛ فقد قال رسول الله صلى الله عليه وسلم: (رحم الله امرأ صلى أربعا قبل العصر) فاجتهد أن ينالك دعاؤه صلى الله عليه وسلم.

ولا تشتغل بعد العصر إلا بمثل ما سبق قبله، ولا ينبغي أن تكون اوقاتك مهملة فتشتغل في كل وقت بما اتفق كيف اتفق، بل ينبغي أن حاسب نفسك وترب أورادك في ليلك ونهارك، وتعين لكل وقت شغلا لا تتعداه، ولا تؤثر فيه سواه فبذلك تظهر بركة الأوقات. فأما إذا تركت نفسك سدى مهملا إهمال البهائم لا تدري بماذا تشتغل في كل وقت، فينقضي أكثر أوقاتك ضائعا، وأوقاتك عمرك، وعمرك رأس مالك، وعليه تجارتك، وبه وصولك إلى نعيم دار الأبد نفي جوار الله تعالى؛ فكل نفس من أنفاسك جوهرة لا قيمة لها؛ ن إذ لا بدل ms16 له فإذا فات فلا عود له. فلا تكن كالحمقى المغرورين الذين يفرحون كل يوم بزيادة أموالهم مع نقصان أعمارهم، فأي خير في مال يزيد وعمر ينقص! ولا تفرح إلا بزيادة علم أو عمل صالح؛ ن فإنهما رفيقاك

يصحبانك في القبر حيث يتخلف عنك أهلك ومالك، وولدك، وأصدقاؤك.

ثم إذا اصفرت الشمس، فاجتهد أن تعود إلى المسجد قبل الغروب، وتشتغل بالتسبيح والاستغفار؛ فإن فضل هذا الوقت كفضل ما قبل الطلوع، قال الله تعالى: (وسبح بحمد ربك قبل طلوع الشمس وقبل غروبها) .

واقرأ قبل غروب الشمس أربع سور من القرآن هي: والشمس وضحاها والليل إذا يغشى، والمعوذتين.

ولتغرب عليك الشمس وأنت في الاستغفار، فإذا سمعت الأذان فاجبه، وقل بعده: اللهم إني أسألك عند إقبال ليلك، وإدبارك نهارك، وحضور صلاتك، وأصوات دعاتك: أن تؤتي محمد الوسيلة - الدعاء كما سبق.

ثم صل الفرض بعد جواب المؤذن والاقامة، وصل بعده قبل أن تتكلم ركعتين، فهما راتبتا المغرب وإن صليت بعدهما أربعا تطيلهن، فهن أيضا سنة.

وإن أمكنك أن تنوي الاعتكاف إلى العشاء، وتحيى ما بين العشاءين بالصلاة فافعل، فقد ورد في فضل ذلك ما لا يحصى، وهي ناشئة الليل؛ لأنه أول نشأه، وهي صلاة الأوابين، وسئل رسول الله صلى الله عليه وسلم عن قوله تعالى: (تتجافى جنوبهم عن المضاجع) ن فقال: (هي الصلاة ما بين العشاءين؛ فإنها تذهب بملاغات النهار) .

والملاغات دخل وقت العشاء، فصل أربع ركعات قبل الفرض إحياء لما بني الأذانين ففضل ذلك كثير وفي الخبر: (أن الدعاء بين الأذان والاقامة لا يرد) .

ثم صل الفرض وصل الراتبة ركعتين، واقرأ فيهما سورة الم السجدة، وتبارك الملك أو سورة يسس، والدخان فذلك مأثور عن رسول الله صلى الله عليه وسلم.

وصل بعدهما أربع ركعات، ففي الخبر ما يدل على عظم فضلهن. ثم صل الوتر بعدها ثلاثا بتسليمتين أو بتسليمة واحدة. وكان رسول الله صلى الله عليه وسلم يقرأ فيها سورة سبح اسم ربك الأعلى، وقل يأيها الكافرون، والاخلاص والمعوذتين.

فإن كنت عازما

على قيام ms17 الليل، فأخر الوتر، ليكون آخر صلاتك وترا.

ثم اشتغل بعد ذلك بمذاكرة علم أو مطالعة كتاب، ولا تشتغل باللهو واللعب فيكبون ذلك خاتمة أعمالك قبل نومك؛ فإنما الأعمال بخواتيمها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 111, 'آداب النوم', 'آداب النوم');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فإذا أردت النوم، فابسط فراشك مستقبل القبلة، ونم على يمينك كما يضطجع الميت في الحده.

واعلم أن النوم مثل الموت، واليقظة، فكن مستعدا للقائه، بأن تنام على طهارة، وتكون وصيتك مكتوبة تحت رأسك، وتنام تائبا من الذنوب، مستغفرا، عازما على ألا تعود إلى معصية. واعزم على الخير لجميع المسلمين إن بعثك الله تعالى، وتذكر أنك ستضجع في اللحدن كذلك وحيدا فريدا ليس معك إلا عملك، ولا تجزى إلا بسعيك.

ولا تستجلب النوم تكلفا بتمهيد الفرش الوطيئة؛ فإن النوم تعطيل لحياة، إلا إذا كانت وبالا عليك؛ فنومك سلامة لدينك.

واعلم أن الليل والنهار أربع وعشرون ساعة، فلا يكن نومك بالليل والنهار أكثر من ثماني ساعات، فيكفيك إن عشت مثلا ستين سنة أن تضيع منها عشرين سنة وهو ثلث عمرك.

وأعد عند النوم سواكك وطهورك، واعزم على قيام الليل، أو على القيام قبل الصبح، فركعتان في جوف الليل كنز من كنوز البر؛ فاستكثر من كنوزك ليوم فقرك، فلن تغني عنك كنوز الدنيا إذا مت.

وقل عند نومك: باسمك ربي وضعت جنبي وباسمك أرفعه، فاغفر لي ذنبي؛ اللهم قني عذابك يوم تبعث عبادك، اللهم باسم أحيا وأموت؛ أعوذ بك اللهم من شر كل ذي بشر، ومن شر كل دابة أنت آخذ بناصيتها، إن ربي على صراط مستقيم؛ اللهم أنت الأول فليس قبلك شيء، وأنت الآخر فليس بعدك شيء، وأنت الظاهر فليس فوقك شيء، وأنت الباطن فليس دونك شيء، اقض عني الدين، وأغنني من الفقر؛ اللهم أنت خلقت نفسي وأنت تتوفاها، لك مماتها ومحياها، إن أمتها فاغفر لها، وإن أحييتها فاحفظها بما تحفظ به عبادك الصالحين؛ اللهم إني أسألك العفو والعافية في الدين والدنيا والآخرة؛ اللهم أيقظني في أحب الساعات إليك، واستعملني بأحب الاعمال إليك، لتقربني إليك زلفى، وتبعدني عن سخطك بعدا، أسألك ms18

فتعطيني، وأستغفرك فتغفر لي،، وأدعوك فتستجيب لي.

ثم اقرأ آية الكرسي، وآمن الرسول إلى آخر السورة، والاخلاص، والمعوذتين، وتبارك الملك.

ويأخذك النوم وأنت على ذكر الله وعلى الطهارة.

فمن فعل ذلك عرج بروحه إلى العرش، وكتب مصليا إلى أن يستيقظ.

فإذا استيقظت، فارجع إلى ما عرفتك أولا، وداوم على هذا الترتيب بقية عمرك. فإن شقت عليك المداومة، فاصبر صبر المريض على مرارة الدواء انتظارا للشفاء، وتفكر في قصر عمرك، وإن عشت مثلا مائة سنة فهي قليلة بالاضافة إلى مقامك في الدار الآخرة وهي أبد الآباد، وتأمل أنك كيف تتحمل المشقة والذل في طلب الدنيا شهرا أو سنة رجاء أن تستريح بها عشرين سنة مثلا، فكيف لا تتحمل ذلك أيام قلائل رجاء الاستراحة أبد الآباد! ولا ت طول أملك فيثقل عليك عملك، وقر قرب الموت، وقل في نفسك: إني أتحمل المشقة اليوم فلعلي أموت الليلة، وأصبر الليلة فلعلى أموت غدا؛ فإن الموت لا يهجم في وقت مخصوص، وحال مخصوص، فلا بد من هجومه؛ فالاستعداد له أولى من الاستعداد للدنيا، وأنت تعلم أنك لا تبقى فيها إلا مدة يسيرة، ولعله لم يبق من أجلك إلا يوم واحد، أو نفس واحد؛ فقدر هذا في قلبك كل يوم، وكلف نفسك الصبر على طاعة الله يوما فيوما، فإنك لو قدرت البقاء خمسين سنة، وألزمتها الصبر على طاعة الله تعالى نفرت واستعصت عليك. فإن فعلت ذلك فرحت عند الموت فرحا لا آخر له. وإن سوفت وتساهلت جاءك الموت في وقت لا تحتسبه، وتحسرت تحسرا لا آخر له، وعند الصباح يحمد القوم السرى، وعند الموت يأتيك الخبر اليقين، ولتعلمن نبأه بعد حين.

وإذا أرشدناك إلى ترتيب الأوراد، فلنذكر لك كيفية الصلاة والصوم وآدابهما، و', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 111;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 112, 'آداب الإمامة والقدوة', 'آداب الإمامة والقدوة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'والجمعة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 113, 'آداب الصلاة', 'آداب الصلاة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فإذا فرغت من طهارة الحدث، وطهارة الخبث، في البدن، والثياب، والمكان ومن ستر العورة من السرة إلى الركبة.. فاستقبل القبلة قائما مزاوجا بين قدميك لا تضمهما، واستو قائما، واقرأ (قل أعوذ برب الناس) تحصنا بها من الشيطان ms19 الرجيم.

وأحضر قلبك

ما أنت فيه، وفرغه من الوسواس، وانظر بين يدي من تقوم، ومن تناجي، واستح أن تناجى أن تناجى مولاك بقلب غافل، وصدر مشحون بوساوس الدنيا وخبائث الشهوات.

واعلم أنه تعالى مطلع على سريرتك وناظر إلى قلبك، فإنما يتقبل الله من صلاتك بقدر خشوعك وخضوعك وتواضعك وتضرعك، واعبده في صلاتك كأنك تراه؛ فإن لم تكن تراه فإنه يراك.

فإن لم يحضر قلبك ولم تسكن جوارحك لقصور معرفتك بجلال الله تعالى، فقدر أن رجلا صالحا من وجوه أهل بيتك ينظر إليك ليعلم كيف صلاتك، فعند ذلك يحضر قلبك وتسكن جوارحك، ثم ارجع إلى نفسك وقل: يا نفس السوء الا تستحين من خالقك ومولاك، إذ قدرت اطلاع عبد ذليل من عباده عليك، وليس بيده ضرك ولا نفعك خشعت جوارحك وحسنت صلاتك، ثم إنك تعلمين أنه مطلع عليك، ولا تخشعين لعظمته، أهو - تعالى - عندك أقل من عباده؟! فما أشد طغيانك وجهلك وما أعظم عداوتك لنفسك. وعالج قلبك بهذه الحيل فعسى أن يحضر معك في صلاتك؛ فإنه ليس لك من صلاتك إلا ما عقلت منها، وأما ما أتيت مع الغفلة والسهو فهو إلى الاستغفار والتكفير أحوج.

فإذا حضر قلبك، فلا تترك الإقامة، وإن كنت وحك. وإن انتظرت حضور جماعة فأذن، ثم أقم.

فإذا أقمت فانو وقل في قلبك: أؤدي فرض الظهر لله تعالى، وليكن ذلك حاضرا في قلبك عند تكبيرك. ولا تغرب عنك النية قبل الفراغ من التكبير، وارفع يديك عند التكبير - بعد إرسالهما أولا - إلى حذو منكبيك وهما مبسوطتان، وأصابعهما منشورة، ولا تتكلف ضمهما ولا تفريجهما، بحيث تحاذى بإبهاميك شحمتى أذنيك، وبكفيك منكبيك، فإذا استقرتا في مقرهما فكبر، ثم أرسلهما برفق.

ولا تدفع يديك عند الرفع والإرسال إلى قدام دفعا، ولا إلى خلف رفعا، ولا تنفضهما يمينا ولا شمالا. فإذا أرسلتهما فاستأنف رفعهما إلى صدرك، وأكرم اليمنى بوضعها على اليسرى، وانشر أصابع اليمنى على طول ذراعك اليسرى، واقبض بها على كوعها.

وقل بعد التكبير: الله أكبر كبيرا، والحمدلله كثيرا، وسبحان الله ms20 بكرة وأصيلا، ثم اقرأ: وجهت وجهي للذي فطر السموات والأرض حنيفا مسلما وما أنا من المشركين، إن صلاتي ونسكي ومحياى ومماتى لله رب العالمين لا شريك له وبذلك أمرت وأنا من المسلمين. ثم قل: أعوذ بالله من الشيطان الرجيم، ثم أقرأ الفاتحة بتشديداتها، واجتهد في الفرق ببين الضاد والظاء في قراءتك في الصلاة،

وقل آمين، ولا تصله بقولك: ولا الضالين - وصلا واجهر بالقراءة في الصبح والمغرب، والعشاء، أعني في الركعتين الأوليين إلا أن تكون مأموما واقرأ في الصبح بعد الفاتحة من السور الطوال من المفصل، وفي المغرب من قصاره، وفي الظهر والعصر والعشاء من أوساطه، نحو: (والسماء ذات البروج) وما قاربها من السور، وفي الصبح في السفر: (قل يأيها الكافرون) ، و (قل هو الله أحد) . ولا تصل آخر السورة بتكبيرة الركوع، ولكن افصل بينهما بمقدار سبحان الله.

وكن في جميع قيامك مطرقا، قاصرا نظرك على مصلاك؛ فذلك أجمع لهمك، وأجدر لحضور قلبك وإياك أن تلتفت يمينا وشمالا في صلاتك.

ثم كبر للركوع وارفع يديك كما سبق، ومد التكبير إلى انتهاء الركوع، ثم ضع راحتيك على ركبتيك وأصابعك منشورة، وانصب ركبتيك، ومد ظهرك وعنقك ورأسك مستويا كالصحيفة الواحدة، وجاف مرفقيك عن جنبيك والمرأة لا تفعل ذلك بل تضم بعضها إلى بعض، وقل: سبحان ربي العظيم - ثلاثا. وإن كنت منفردا، فالزيادة إلى سبع وعشرين حسنة.

ثم ارفع رأسك حتى تعتدل قائما، وارفع يديك قائلا: سمع الله لمن حمده، فإذا استويت قائما فقل: ربنا لك الحمد ملء السموات وملء الارض وملء ما شئت من شي بعد. وإن كنت في فريضة الحج فاقرأ القنوت في الركعة الثانية في اعتدالك من الركوع.

ثم اسجد مكبرا غير رافع اليدين، وضع أولا على الأرض ركبتيك، ثم يديك ثم جبهتك مكشوفة، وضع أنفك مع الجبهة وجاف مرفقيك عن جنبيك، وأقل بطنك عن فخذيك، والمرأة لا تفعل ذلك، وضع يديك على الأرض حذو منكبيك، ولا تفرض ذراعيك على الارض، وقل: سبحان ربي الاعلى - ثلاثا أو سبعا أو عشرا، إن ms21 كنت منفردا.

ثم ارفع رأسك من السجود مكبرا حتى تعتدل جالسا، واجلس على رجلك اليسرى، وانصب قدمك اليمنى، وضع يديك على فخذيك، والأصابع منشورة، وقل: رب اغفر لي، وارحمني، وارزقني، واهدني، واجبرني وعافني واعف عني. ثم اسجد سجدة ثانية كذلك..

ثم اعتدل جالسا للاستراحة في كل ركعة لا تشهد عقبها، ثم تقوم وتضع اليدين على الأرض، ولا تقدم إحدى رجليك في حال الارتفاع، وابتدىء بتكبيرة الارتفاع عند القرب من حد جلسة الاستراحة، ومدها إلى انتصاف ارتفاعك إلى قيامك ولتكن هذه الجلسة جلسة خفيفة مختطفة.

وصل الركعة الثانية كالأولى، وأعد التعوذ في الابتداء، ثم اجلس في الركعة الثانية للتشهد

الأول، وضع اليد اليمنى في جلسة التشهد الاول على الفخذ اليمنى مقبوضة الأصابع إلا المسبحة والإبهام فترسلها، وانشر مسبحة يمناك عند قولك: (إلا الله) لا عند قولك: (لا إله) . وضع اليد اليسرى منشورة الاصابع على الفخذ اليسرى، واجلس على رجلك اليسرى في هذا التشهد كما بين السجدتين، وفي التشهد الاخير متوركا. واستكمل الدعاء المعروف المأثور بعد الصلاة على النبي صلى الله عليه وسلم. واجلس فيه على وركك الأيسر، وضع رجلك اليسرى خارجة من تحتك، وانصب القدم اليمنى، ثم قل بعد الفراغ: السلام عليكم ورحمة الله - مرتين، من الجانبين، والتفت بحيث يرى بياض خدك من جانبيك، وانو الخروج من الصلاة، وانو السلام على من بجانبك من الملائكة والمسلمين.

وهذه هيئة صلاة المنفرد..

وعماد الصلاة الخشوع، وحضور القلب مع القراءة والذكر بالتفهم.

قال الحسن البصري - رحمة الله تعالى: كل صلاة لا يحضر فيها القلب فهي إلى العقوبة أسرع.

وقال رسول الله صلى الله عليه وسلم: (إن العبد ليصلي الصلاة فلا يكتب له منها سدسها ولا عشرها، وإنما يكتب للعبد من صلاته بقدر ما عقل منها) .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 114, 'آداب الإمامة والقدوة', 'آداب الإمامة والقدوة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'ينبغي للإمام أن يخفف الصلاة، قال أنس بن مالك رضي الله عنه: ما صليت خلف أحد صلاة أخف ولا أتم من صلاة رسول الله صلى الله عليه وسلم.

ولا يكبرما لم يفرغ المؤذن من الاقامة، وما ms22 لم تتسو الصفوف، ويرفع الإمام صوته بالتكبيرات، ولا يرفع المأموم صوته إلا بقدر ما يسمع نفسه، وينوي الإمام الإمامة لينال الفضل، فإذا لم ينو صحت صلة القوم إذا نووا الاقتداء به، ونالوا فضل القدوة.

ويسر الإمام بدعاء الاستفتاح والتعوذ كالمنفرد، ويجهر بالفاتحة والسورة في جميع الصبح، وأوليى المغرب والعشاء، وكذلك المنفرد، ويجهر بقوله: (آمين) في الجهرية، وكذلك المأموم، ويقرن المأموم تأمينه بتأمين الإمام

معا تعقيبا له، ويسكت الإمام سكتة عقب الفاتحة ليثوب غليه نفسه، ويقرأ المأموم الفاتحة في الجهرية في هذه السكتة، ليتمكن من الاستماع عند قراءة الإمام، ولا يقرأ المأموم السورة في الجهرية إلا إذا لم يسمع صوت الإمام.

ولا يزيد الإمام على ثلاث في تسبيحات الركوع والسجود، ولا يزيد في التشهد الأول بعد قوله: (اللهم صل على محمد) ويقتصر في الركعتين الأخيرتين على الفاتحة، ولا يطول على القوم، ولا يزيد دعاؤه في التشهد الأخير على قدر تشهده وصلاته على رسول الله صلى الله عليه وسلم، وينوي الإمام عند التسليم السلام على القوم، وينوي القوم بتسليمهم جوابه.

ويلبث الإمام ساعة بعد ما يفرغ من السلام ويقبل على الناس بوجهه، ولا يلتفت إن كان خلفه نساء حتى ينصرفن أولا.

ولا يقوم أحد من القوم حتى يقوم الإمام. وينصرف الإمام حيث شاء عن يمينه أو شماله، واليمن أحب إلي.

ولا يخص الإمام نفسه بالدعاء في قنوت الصبح، بل يقول: (اللهم اهدنا) ن ويجهر به، ويؤمن القوم ولا يرفعون أيديهم إذ لم يثبت ذلك في الاخبار، ويقرأ المأموم بقية القنوت من قوله: (إنك تقضي ولا يقضى عليك) .

ولا يقف المأموم وحده، بل يدخل في الصف، أو يجر إلى نفسه غيره، ولا ينبغي للمأموم أن يتقدم على الإمام في أفعاله أو يساويه، بل ينبغي أن يتأخر عنه، ولا يهوي للركوع إلا إذا انتهى الإمام إلى حد الركوع، ولا يهوى للسجود ما لم تصل جبهة الامام إلى الارض.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 115, 'آداب الجمعة', 'آداب الجمعة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'اعلم أن الجمعة عيدي المؤمنين، وهو يوم شريف خص الله عزوجل به هذه الامة، ms23 وفيه ساعة مبهمة لا يوافقها عبد مسلم يسال الله تعالى فيها حاجة إلا أعطاه إياها.

فاستعد لهبا من يوم الخميس؛ بتنظيف الثياب، وبكثرة التسبيح والاستغفار عشية الخميس، فإنها ساعة توازى في الفضل ساعة يوم الجمعة.

وانو صوم يوم الجمعة، لكن مع الخميس أو السبت؛ إذ جاء في افراده نهى.

فإذا طلع عليك الصبح، فاغتسل؛ ن (غسل الجمعة واجب على كل محتلم) أي ثابت مؤكد. ثم تزين بالثياب البيض؛ فإنها أحب الثياب إلى الله تعالى، واستعمل من الطيب أطيب ما عندك، وبالغ في تنظيف بدنك بالحلق والقص

والسواك وسائر أنواع النظافة وتطييب الرائحة.

ثم بكر إلى الجامع، واسع إليها على الهينة والسكينة، فقد قال صلى الله عليه وسلم: (نمن راح إلى الجمعة في الساعة الاولى فكأنما قرب بدنة، ومن راح في الساعة الثانية فكأنما قرب بقرة، ومن راح في الساعة الثالثة فكأنما قرب كبشا أقرن، ومن راح في الساعة الرابعة فكأنما قرب دجاجة، ومن راح في الساعة الخامسة فكأنما قرب بيضة. فإذا خرج الإمام طوت الصحف، ورفعت الاقلام، واجتمعت الملائكة عند المنبر يستمعون الذكر) . ويقال إن الناس في قربهم عند النظر إلى وجه الله تعالى على قدر بكورهم إلى الجمعة.

ثم إذا دخلت الجامع، فاطلب الصف الاول، فإذا اجتمع الناس فلا تتخط رقابهم، ولا تمر بين أيديهم وهم يصلون، واجلس بقرب حائط أو اسطوانة حتى لا يمروا بين يديك، ولا تقعد حتى تصلي التحية، والأحسن ان تصلي أربع ركعات، تقرأ في كل ركعة بعد الفاتحة الاخلاص خمسين مرة، ففي الخبر: (أن من فعل ذلك لم يمت حتى يرى مقعده من الجنة أو يرى له) . ولا تترك التحية وإن كان الإمام يخطب.

ويستحب في هذا اليوم أو في ليلته أن يصلى أربع ركعات بأربع سور: سورة الانعام، والكهف، وطه، ويس، فإن لم تقدر فسورة يس والدخان، و (الم) السجدة، وسورة الملك. ولا تدع قراءة هذه السورة ليلة الجمعة؛ ففيها فضل كثير. ومن لم يحسن ذلك فليكثر من قراءة سورة الاخلاص. وأكثر من ms24 الصلاة على رسول الله صلى الله عليه وسلم في هذا اليوم خاصة.

ومتى خرج الامام، فاقطع الصلاة والكلام، واشتغل بجواب المؤذن ثم استماع الخطبة والاتعاظ بها، ودع الكلام رأسا في الخطبة، ففي الخبر: (ان من قال لصاحبه - والإمام يخب - أنصت، أو صه؛ فقد لغا، نومن لغا فلا جمعة له) ، آي لأن قوله أنصت: كلام، فينبغي أن ينهىغيره بالاشارة لا باللفظ.

ثم اقتد بالإمام كما سبق. فإذا فرغت وسلمت، فاقرأ الفاتحة قبل أن تتكلم سبع مرات، والاخلاص سبعا، والمعوذتين سبعا سبعا، فذلك يعصمك من الجمعة الاخرى، ويكون حرزا لك من الشيطان، وقل بعد ذلك: يا غني، يا حميد، يا مبدىء، يا معيد، يا رحيم، يا ودود؛ أغنني بحلالك عن حرامك، وبطاعتك عن معصيتك، وبفضلك عمن سواك. ثم صل بعد الجمعة ركعتين أو أربعا أو ستا، مثنى، مثنى، فكل ذلك مروي عن رسول الله صلى الله عليه وسلم في أحوال مختلفة.

ثم لازم المسجد إلى المغرب أو إلى العصر، وكان حسن المراقبة للساعة الشريفة؛ فإنها مبهمة في جميع اليوم، فعساك أن تدركها وأنت خاشع لله تعالى متذلل متضرع.

ولا تحضر في الجامع مجالس الحلق، ولا مجالس

القصاص، بل مجلس العلم النافع، وهو الذي يزيد في خوفك من الله تعالى، وينقص من رغبتك في الدنيا، فكل علم لا يدعوك من الدنيا إلى الآخرة فالجهل أعود عليك منه؛ فاستعذ بالله من علم لا ينفع.

وأكثر من الدعاء عند طلوع الشمس، وعند الزوال، وعند الغروب، وعند الإقامة، وعند صعود الخطيب المنبر، وعند قيام الناس إلى الصلاة، فيوشك أن يكون الساعة الشريفة في بعض هذه الاوقات.

واجتهد أن تتصدق في هذا اليوم بما تقدر عليه وإن قل، فتجمع بين الصلاة والصوم والصدقة والقراءة والذكر والاعتكاف والرباط.

واجعل هذا اليوم من الاسبوع خاصة لآخرتك؛ فعساه أن يكون كفارة لبقية الاسبوع.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 115;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 116, 'آداب الصيام', 'آداب الصيام');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'لا ينبغي أن تقتصر على صوم رمضان فتترك التجارة بالنوافل، وكسب الدرجات العالية في الفراديس؛ فتتحسر إذ نظرت إلى منازل الصائمين، كما تنظر إلى الكواكب ms25 الدرية، وهم في أعلى عليين.

والأيام الفاضلة التي شهدت الأخبار بشرفها وفضلها، وبجزالة الثواب في صيامها: يوم عرفة لغير الحاج، ويوم عاشوراء، والعشر الاول من ذي الحجة، والعشر الأول من المحرم، ورجب وشعبان، وصوم الأشهر الحرم من الفضائل، وهي ذو القعدة وذو الحجة والمحرم ورجب، واحد فرد وثلاثة سرد، وهذه في السنة. وأما في الشهر فأول الشهر وأوسطه وآخره، والأيام البيض وهي الثالث عشر والرابع عشر والخامس عشر، وأما في الاسبوع فيوم الاثنين والخميس والجمعة؛ فتكفر ذنوب الاسبوع بصوم الاثنين والخميس والجمعة، وتكفر ذنوب الشهر باليوم الأول واليوم الأوسط واليوم الآخر والأيام البيض، وتكفر ذنوب السنة بصيام هذه الأيام والاشهر المذكورة.

ولا تظن إذا صمت أن الصوم هو ترك الطعام والشراب والوقاع فقط، فقد قال صلى الله عليه وسلم: (كم من صائم ليس له من صيامه إلا الجوع والعطش) ، بل تمام الصوم بكف الجوارح كلها عما يكرهه الله تعالى، بل ينبغي أن تحفظ العين عن النظر إلى المكاره، واللسان عن النطق بما لا يعنيك، والأذن عن الاستماع إلى ما حرمه الله؛ فإن المستمع شريك

القائل وهو أحد المغتابين، وكذلك تكف جميع الجوارح كما تكف البطن والفرج، ففي الخبر (خمس يفطرن الصائم: الكذب، والغيبة، والنميمة، واليمين الكاذبة، والنظر بشهوة) ، وقال صلى الله عليه وسلم: (إنما الصوم جنة فإذا كان أحدكم صائما فلا يرفث، ولا يفسق، ولا يجهل، فإن امرؤ قاتله أو شاتمه فليقل: إني صائم) .

ثم اجتهد أن تفطر على طعام حلال، ولا تستكثر فتزيد على ما تأكله كل ليلة، فلا فرق إذا استوفيت ما تعتاد أن تأكله دفعتين في دفعة واحدة، وإنما المقصود بالصيام كسر شهوتك، وتضعيف قوتك لتقوى بها على التقوى. فإذا أكلت عشية ما تداركت به ما فتك ضحوة، فلا فائدة في صومك، وقد ثقلت عليك معدتك، وما وعاء يملأ أبغض إلى الله تعالى من حلال، فكيف إذا ملىء من حرام؟

فإذا عرفت معنى الصوم فاستكثر منه ما استطعت، فإنه أساس العبادات، ومفتاح القربات؛ قال رسول الله صلى ms26 الله عليه وسلم: (قال الله تعالى: كل حسنة بعشر أمثالها إلى سبعمائة ضعف إلا الصوم، فإنه لي وأنا أجزى به) ، وقال صلى الله عليه وسلم: (والذي نفسي بيده لخلوف فم الصائم أطيب عند الله من ريح المسك، يقول الله تعالى عزوجل من قائل: إنما يذر شهوته وطعامه وشرابه من أجلى، فالصوم لي وأنا أجزى به) وقال صلى الله عليه وسلم: (للجنة باب له الريان، لا يدخله إلا الصائمون) .

فهذا القدر من شرح الطاعات يكفيك من بداية الهداية، فإذا احتجت إلى الزكاة، والحج، أو إلى مزيد شرح الصلاة والصيام، فاطلبه مما أوردناه في كتابنا (إحياء علوم الدين) .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 117, 'القسم الثاني', 'القسم الثاني');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'القول في اجتناب المعاصى', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 117;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 118, 'توطئة', 'توطئة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'اعلم ان للدين شطرين، أحدهما: ترك المناهي، والآخر: فعل الطاعات.. وترك المناهي هو الأشد؛ فإن الطاعات يقدر عليها كل واحد، وترك الشهوات لا يقدر عليه إلا الصديقون،

فلذلك قال رسول الله صلى الله عليه وسلم: (المهاجر من هجر السوء، والمجاهد من جاهد هواه) .

واعلم أنك إنما تعصي الله بجوارحك، وهي نعمة من الله عليك وأمانة لديك، فاستعانتك بنعمة الله على معصيته غاية الكفران، وخيانتك في أمانة استودعها الله غاية الطغيان؛ فأعضاؤك رعاياك، فانظر كيف ترعاها؛ فكلكم راع، وكلكم مسؤول عن رعيته.

واعلم أن جميع أعضائك ستشهد عليك في عرصات القيامة بلسان طلق ذلق، تفضحك به على رؤوس الخلائق، قال الله تعالى: (يوم تشهد عليهم ألسنتهم وأيديهم وأرجلهم بما كانوا يعملون) ، وقال الله تعالى: (اليوم نختم على افواههم وتكلمنا أيديهم وتشهد أرجلهم بما كانوا يكسبون) . فاحفظ يا مسكين جميع بدنك من المعاصى، وخصوصا أعضاءك السبعة؛ فإن جهنم لها سبعة أبواب لكل باب منهم جزء مقسوم، ولا يتعين لتلك الابواب إلا من عصا الله تعالى بهذه الاعضاء السبعة، وهي: العين، والأذن، واللسان، والبطن، والفرج، واليد، والرجل.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 118;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 119, 'آداب العين', 'آداب العين');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'أما العين: فإنما خلقت لك لتهتدي بها في الظلمات، وتستعين بها في الحاجات، وتنظر بها إلى عجائب ملكوت الأرض والسموات، وتعتبر بما فيها من الآيات؛ ن فاحفظها عن أربع: أن تنظر ms27 بها إلى غير محرم، أو إلى صورة مليحة ولا بشهوة نفس، أو تنظر بها إلى مسلم بعين الاحتقار، أو تطلع بها على عيب مسلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 119;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 120, 'آداب الأذن', 'آداب الأذن');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وأما الأذن: فاحفظها عن أن تصغي بها إلى البدعة، أو الغيبة، أو الفحش، أالخوض في الباطل، أو ذكر مساوىء الناس؛ فإنما خلقت لك لتسمع بها كلام الله تعالى، وسنة رسول الله صلى الله عليه وسلم، وحكمة أوليائه، وتتوصل باستفادة العلم بها إلى الملك المقيم والنعيم الدائم في جوار رب العالمين. فإذا أصغيت بها إلى شيء من المكاره صار ما كان لك عليك، وانقلب ما كان سبب فوزك سبب هلاكك، وهذا غية الخسران. ولا تظن أن الإصم يختص به القائل دون المستمع؛ ففي الخبر: (أن المستمع شريك القائل وهو أحد المغتابين) .

آداب اللسان وأما اللسان: فإنما خلق لتكثر به ذكر الله تعالى وتلاوة كتابه، وترشدن به خلق الله تعالى إلى طريقه، وتظهر به ما في ضميرك من حاجات دينك ودنياك. فإذا استعملته في غير ما خلق له، فقد كفرت نعمة

الله تعالى فيه، وهو أغلب أعضائك عليك وعلى سائر الخلق، ولا يكب الناس في النار على مناخرهم إلا حصائد ألسنتهم.

فاستظهر عليه بغاية قوتك حتى لا يكبك في قعر جهنم، ففي الخبر: (إن الرجل ليتكلم بالكلمة ليضحك بها أصحابه فيهوي بها في قعر جهنم سبعين خريفا) ، وروى أنه قتل شهيد في المعركة على عهد رسول الله صلى الله عليه وسلم فقال قائل: ن هنيئا له الجنة، فقال: صلى الله عليه وسلم: (وما يدريك لعله كان يتكلم فيما لا يعنيه، ويبخل بما لا يغنيه) .

فاحفظ لسانك من ثمانية:', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 120;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 121, 'الأول الكذب', 'الأول الكذب');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فاحفظ منه لسانك في الجد والهزل، ولا تعود لسانك الكذب هزلا فيتداعى إلى الجد، والكذب من أمهات الكبائر، ثم إنك إذا عرفت بذلك سقطت عدالتك والثقة بقولك، وتزدريك الأعين وتحتقرك.

وإذا أردت أن تعرف قبح الكذب من نفسك، فانظر إلى كذب غيرك، وعلى نفرة نفسك عنه، واستحقارك لصاحبه واستقباحك له.

وكذلك فافعل في جميع عيوب نفسك؛ ms28 فإنك لا ترى قبح عيوبك من نفسك، بل من غيرك، فما استقبحته من غيرك يستقبحه غيرك منك لا محلاة؛ فلا ترض لنفسك ذلك.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 121;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 122, 'الثاني الخلف في الوعد', 'الثاني الخلف في الوعد');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فإياك أن تعد بشيء ولا تفي به، بل ينبغي أن يكون إحسانك إلى الناس فعلا بلا قول، فإن اضطررت إلى الوعد، فإياك أن تخلف إلا لعجز أو ضرورة؛ فإن ذلك من امارات النفاثق وخبائث الاخلاق، قال النبي صلى الله عليه وسلم: (ثلاث من كن فيه فهو منافق وإن صام وصلى: من إذا حدث كذب، وإذا وعد أخلف، وإذا أؤتمن خان) .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 122;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 123, 'الثالث الغيبة', 'الثالث الغيبة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فاحفظ لسانك عنها، والغيبة أشد من ثلاثين زنية في الاسلام. كذلك ورد في الخبر.

ومعنى الغيبة: أن تذكر إنسانا بما يكرهه لو سمعه، فأنت مغتاب ظالم وإن كنت صادقا.

وإياك وغيبة القراء المرائين، وهو أن تفهم المقصود من غير تصريح فتقول: أصلحه الله فقد ساءني وغمني ما جرى عليه، فنسأل الله تعالى أن يصلحنا وإياه؛ فإن هذا جمع بين خبيثين، أحدهما: الغيبة إذا حصل به التفهم، والآخر: تزكية النفس والثناء عليها بالتجريح

لغيرك والصلاح لنفسك. ولكن إن كان مقصودك من قولك: أصلحه الله - الدعاء؛ فادع له في السر. وإن اغتممت بسببه، فعلامة أنك لا تريد فضيحته واظهار عيبه، وفي إظهارك الغم بعيبه إظهار تعييبه.

ويكفيك زاجرا عن الغيبة قوله تعالى: (ولا يغتب بعضكم بعضا، أيحب أحدكم أن يأكل لحم أخيه ميتا فكرهتموه) . فقد شبهك الله بآكل لحم الميتة؛ فما أجدرك أن تحترز منها؟؟؟! ويمنعك عن الغيبة أمر لو تفكرت فيه وهو أن تنظر في نفسك، هل فيك عيب ظاهر أو باطن؟، وهل أنت مقارف معصية سرا أو جهرا؟ فإذا عرفت ذلك من نفسك، فاعلم أن عجزه عن التنزهي عما نسبته إليه كعجزك، وعذره كعذرك. وكما تكره أن تفتضح وتذكر عيوبك، فهو أيضا يكرهه؛ فإن سترته ستر الله عليك عيوبك، وإن فضحته سلط الله عليك ألسنة حدادا، يمزقون عرضك في الدينا، ثم يفضك الله في الآخرة على رؤوس الخلائق يوم القيامة.

وإن ms29 نظرت إلى ظاهرك وباطنك، فلم تطلع فيهما على عيب ونقص في دين ولا دنيا، فاعلم أن جهلك بعيوب نفسك أقبح أنواع الحماقة، ولا عيب أعظم من الحمق. ولو أراد الله بك خيرا لبصرك بعيوب نفسك، فرؤيتك نفسك بعين الرضا غاية غباوتك وجهلك. ثم إن كنت صادقا في ظنك فاشكر الله تعالى عليه ولا تفسده بثلب الناس، والتمضمض بأعراضهم؛ فإن ذلك من أعظم العيوب.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 123;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 124, 'الرابع المراء والجدال ومناقشة الناس في الكلام', 'الرابع المراء والجدال ومناقشة الناس في الكلام');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فذلك فيه إيذاء للمخاطب وتجهيل له، وطعن فيه، وفيه ثناء على النفس وتزكية لها بمزيد الفطنة والعلم، ثم هو مشوش للعيش؛ فإنك لا تمارى سفيها إلا ويؤذيك، ولا تماري حليما إلا ويقليك ويحقد عليك؛ فقد قال صلى الله عليه وسلم: (من ترك المراء وهو مبطل بنى الله له بيتا في ربض الجنة، ومن ترك المراء وهو محق بنى الله له بيتا في أعلى الجنة) .

ولا ينبغي أن يخدعك الشيطان ويقول لك: أظهر الحق ولا تداهن فيه، فإن الشيطان أدبا يستجر الحمقى إلى الشر في معرض الخير، فلا تكن ضحكة للشيطان فيسخر منك، فاظهار الحق حسن مع من يقبله منك، وذلك بطريق النصيحة في الخفية لا بطريق المماراة.

وللنصيحة صفة وهيئة، ويحتاج

فيها إلى تلطف وإلا صارت فضيحة، وكان فسادها أكثر من صلاحها.

ومن خالط متفقهة العصر غلب على طبعه المراء والجدال، وعسر عليه الصمت، إذ ألقى إليه علماء السوء أن ذلك هو الفضل، والقدرة على المحاجة والمناقشة هو الذي يمتدح به؛ ففر منهم فرارك من الأسد، واعلم أن المراء سبب المقت عندالله وعند الخلق.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 125, 'الخامس تزكية النفس', 'الخامس تزكية النفس');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فقد قال الله تعالى: (فلا تزكوا أنفسكم هو أعلم بمن اتقى) ، وقيل بعض الحكماء: مالصدق القبيح؟ فقال: ثناء المرء على نفسه. فإياك أن تتعود ذلك، واعلم أن ذلك ينقص من قدرك عند الناس، ويوجب مقتك عندالله تعالى. فإذا أردت أن تعرف أن ثناءك على نفسك لا يزيد في قدرك عند غيرك، فانظر إلى أقرانك إذا أثنوا على أنفسهم بالفضل والجاه والمال كيف يستنكره ms30 قلبك عليهم، ويستثقله طبعك، وكيف تذمهم عليه إذا فارقتهم؛ فاعلم أنهم أيضا في حال تزكيتك لنفسك يذمونك في قلوبهم ناجزا، وسيظهرونه بألسنتهم إذا فارقتهم.

السادس: اللعن

فإياك أن تلعن شيئا مما خلق الله تعالى من حيوان أو طعام أو إنسان بعينه، ولا تقطع بشهادتك على أحد من أهل القبلة بشرك أو كفر أو نفاق؛ فإن المطلع على السرائر هو الله تعالى، فلا تدخل بين العباد وبين الله تعالى، واعلم أنك يوم القيامة لا يقال لك: لم لم تلعن فلانا، ولم سكت عنه؟ بل لو لم تعلن ابليس طول عمرك، ولم تشغل لسانك بذكره لم تسأل عنه ولم تطالب به يوم القيامة. وإذا لعنت أحدا من خلق الله تعالى طولبت به، ولا تذم شيئا مما خلق الله تعالى، فقد كان النبي صلى الله عليه وسلم لا يذم الطعام الردىء قط، بل كان إذا اشتهى شيئا أكله وإلا تركه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 125;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 126, 'السابع الدعاء على الخلق', 'السابع الدعاء على الخلق');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فاحفظ لسانك عن الدعاء على أحد من خلق الله تعالى، وإن ظلمك فكل أمره إلى الله تعالى؛ ففي الحديث: (إن المظلوم ليدعو على ظالمه حتى يكافئه ثم يبقى للظالم فضل عنده يطالب به يوم القيامة) . وطول بعض الناس لسانه على الحجاج فقال بعض السلف: (إن الله لينتقم للحجاج ممن تعرض له بلسانه كما ينتقم من الحجاج لمن ظلمه) .', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 126;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 127, 'الثامن المزاح والسخرية والاستهزاء بالناس', 'الثامن المزاح والسخرية والاستهزاء بالناس');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فاحفظ

لسانك منه، في الجد والهزل؛ فإنه يريق ماء الوجه ويسقط المهابة، ويستجر الوحشية، ويؤذي القلوب، وهو مبدأ اللجاج والغضب والتصارم، ويغرس الحقد في القلوب؛ فلا تمازح أحدا؛ فإن مازحك أحد فلا تجبه، وأعرض عنهم حتى يخوضوا في حديث غيره، وكن من الذين إذا مروا باللغو مروا كراما.

فهذه مجامع آفات اللسان، ولا يعينك عليه إلا العزلة، أو ملازمة الصمت غلا بقدر الضرورة؛ فقر كان أبوبكر الصديق رضي الله تعالى عنه يضع حجرا في فيه ليمنعه ذلك من الكلام بغير ضرورة، ويشير إلى لسانه ويقول: هذا الذي أوردني الموارد. فاحترز منه بجهدك؛ فإنه أقوى أسباب هلاكك ms31 في الدنيا والآخرة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 128, 'آداب البطن', 'آداب البطن');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وأما البطن: فاحفظه من تناول الحرام والشبهة، واحرص على طلب الحلال، فإذا وجدته فاحرص على أن تقتصر منه على ما دون الشبع، فإن الشبع يقسي القلب، ويفسد الذهن، ويبطل الحفظ، ويثقل الأعضاء عن العبادة والعلم، ويقوي الشهوات، وينصر جنود الشيطان.

والشبع من الحلال مبدأ كل شر، فكيف من الحرام وطلب الحلال فريضة على كل مسلم، والعبادة مع أكل الحرام كالبناء على السرجين.

فإذا قنعت في السنة بقميص خشن، وفي اليوم والليلة برغيفين من الخشكار، وتركت التلذذ بأطيب الأدم، لم يعوزك من الحلال ما يكفيك، والحلال كثير.

وليس بعليك أن تتيقن بواطن الأمور، بل عليك أن تحترز مما تعلم أنه حرام أو تظن أنه حرام ظنا حصل من علامة ناجزة مقدرة بالمال؛ أما المعلوم فظاهر، وأما المظنون بعلامة فهو مال السلطان وعماله، ومال من لا كسب له إلا من النياحة، أو بيع الخمر، أو الربا، أو المزامير؛ وغير ذلك من آلات اللهو المحرمة. فإن من علمت أن أكثر ماله حرام قطعا، فما تأخذه من يده - وإن أمكن ان يكون حلالا نادرا - فهو حرام؛ لأنه الغالب على الظن.

ومن الحرام المحض ما يؤكل من الأوقاف من غير شرط الواقف، فمن لم يشتغل بالتفقه فما يأخذه من المدارس حرام، ومن ارتكب معصية ترد بها شهادته، فما يأخذه باسم الصوفية من وقف أو غيره فهو حرام.

وقد ذكرنا مداخل الشبهات والحلال والحرام في كتاب مفرد من كتب إحياء علوم الدين، فعليك بطلبه؛ فإن معرفة الحلال وطلبه فريضة على كل مسلم، كالصلوات الخمس.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 128;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 129, 'آداب الفرج', 'آداب الفرج');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وأما الفرج: فاحفظه عن كل ما حرم الله تعالى، وكن كما قال الله: (والذين هم لفروجهم حافظون، إلا على أزواجهم أو ما

ملكت أيمانهم غير ملومين) .

ولا تصل إلى حفظ الفرج إلا بحفظ العين عن النظر، وحفظ القلب عن التفكر، وحفظ البطن عن الشبهة وعن الشبع؛ فإن هذه محركات للشهوة ومغارسها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 129;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 130, 'آداب اليدين', 'آداب اليدين');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وأما اليدان: فاحفظهما عن أن تضرب بهما مسلما، أو تتناول بهما مالا ms32 حراما، أو تؤدي بهما أحدا من الخلق، أو تخون بهما في أمانة أو وديعة، أو تكتب بهما ما لا يجوز النطق به، فإن القلم أحد اللسانين، فاحفظ القلم عما يجب حفظ اللسان عنه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 130;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 131, 'آداب الرجلين', 'آداب الرجلين');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وأما الرجلان: فاحفظهما عن أن تمشي بهما إلى حرام، أو تسعى بهما إلى باب سلطان ظالم؛ فإن المشي إلى السلاطين الظلمة من غر ضرورة وارهاق معصية كبيرة؛ فإنه تواضع وإكرام لهم على ظلمهم.

وقد أمر الله تعالى بالإعراض عنهم في قوله تعالى: (ولا تركنوا إلى الذين ظلموا فتمسكم النار) وهو تكثير لسوادهم، وإن ذلك لسبب طلب مالهم فهو سعى إلى حرام، وقد قال صلى الله عليه وسلم: (من تواضع لغنى صالح لغناه ذهب ثلثا دينه) وهذا في غنى صالح، فما ظنك بالغنى الظالم؟ وعلى الجملة، فحركاتك وسكناتك بأعضائك نعمة من نعم الله تعالى عليك؛ فلا تحرك شيئا منها في معصية الله تعالى أصلا، واستعملها في طاعة الله تعالى.

واعلم أنك إن قصرت فعليك وباله، وإن شمرت فإليك تعود ثمرته، والله غني عنك وعن عملك، وإنما كل نفس بما كسبت رهينة، وإياك أن تقول: إن الله كريم رحيم يغفر الذنوب للعصاة؛ فإن هذه كلمة حق أريد بها باطل، وصاحبها ملقب بالحماقة، بتلقيب رسول الله صلى الله عليه وسلم حيث قال: (الكيس من دان نفسه وعمل لما بعد الموت، والأحمق من أتبع نفسه هواها، وتمنى على الله الأماني) . واعلم أن قولك هذا أيضا هي قول من يريد أن يكون فقيها في علوم الدين من غير أن يدرس علما واشتغل بالبطالة وقال: إن الله كريم رحيم قادر على أن يفيض على قلبي من العلوم ما أفاضه على قلوب أنبيائه وأوليائه من غير جهد وتكرار وتعلم وهو كقول من

يريد مالا فترك الحراثة والتجارة والكسب ويتعطل، وقال: إن الله كريم رحيم وله خزائن السموات والأرض وهو قادر على أن يطلعني على كنز من كنوز أستغني به عن الكسب، فقد فعل ذلك لبعض عباده، فأنت إذا سمعت كلام هذين الرجلين ms33 استحمقتهما وسخرت منهما، وإن كان ما وصفاه من كرم الله تعالى وقدرته صدقا وحقا، فكذلك يضحك عليك أرباب البصائر في الدين إذا طلبت المغفرة بغير سعى لها، والله وتعالى يقول: (وأن ليس للإنسان إلا ما سعى) ، ويقول: (إنما تجزون ما كنتم تعملون) ويقول (إن الأبرار لفي نعيم، وإن الفجار لفى جحيم) .

فإذا لم تكن تترك السعي في طلب العلم والمال اعتمادا على كرمه، فكذلك لا تترك التزود للآخرة، ولا تفتر؛ فإن رب الدنيا واللآخرة واحد، وهو فيهما كريم رحيم، وليس يزيد له كرم بطاعتك وإنما كرمه سبحانه وتعالى في أن ييسر لك طريق الوصول الى الملك المقيم والنعيم الدائم المخلد، بالصبر على ترك الشهوات أياما قلائل، وهذا نهاية الكرم.

فلا تحدث نفسك بتهويسات البطالين، واقتد بأولى العزم والنهي من الانبياء والصالحين، ولا تطمع في أن تحصد ما لم تزرع، وليت من صام وصلى وجاهد واتقى غفر له.

فهذه جمل مما ينبغي أن تحفظ عنه جوارحك الظاهرة، وأعمال هذه الجوارح إنما تترشح من صفات القلب؛ فإن أردت حفظ الجوارح فعليك بتطهير القلب؛ فهو تقوى الباطن، والقلب هو المضغة التي إذا صلحت صلح الجسد بها سائر الجسد، وإذا فسدت فسد بها سائر الجسد، فاشتغل باصلاحه لتصلح به جوارحك، وصلاحه يكون بملازمة المراقبة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 131;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 132, 'القول في معاصى القلب', 'القول في معاصى القلب');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'اعلم أن الصفات المذمومة في القلب كثيرة، وطريق تطهير القلب من رذائلها طويلة، وسبيل العلاج فيها غامض، وقد اندرس بالكلية علمه وعمله؛ لغفلة الخلق عن أنفسهم واشتغالهم بزخارف الدنيا.

وقد استقصينا ذلك كله في كتاب (إحياء علوم الدين) في ربع المهلكات وربع المنجيات، ولكنا نحذرك؛ فإنها مهلكات في أنفسها، وهي أمهات لجملة من الخبائب سواها: وهي', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 132;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 133, 'الحسد', 'الحسد');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '، و', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 134, 'الرياء', 'الرياء');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '، والعجب؛ فاجتهد في تطهير

قلبك منها؛ فإن قدرت عليها فتعلم كيفية الحذر من بقيتها من ربع المهلكات. فإن عجزت عن هذا، فأنت عن غيره أعجز.

ولا تظن أنك تسلم بنية صالحة في تعلم العلم، وفي قلبك شيء من الجسد و', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 134;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 135, 'الرياء', 'الرياء');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'والعجب، وقد قال صلى الله عليه ms34 وسلم: (ثلاث مهلكات: شح مطاع، وهوى متبع، وإعجاب المرء بنفسه) .

الحسد

أما الحسد: فهو متشعب من الشح، فإن البخيل هو الذي يبخل بما في يده على غيره، والشحيح هوالذي يبخل بنعمة الله تعالى وهي في خزائن قدرته تعالى، لا في خزائنه، على عباد الله فشحه أعظم، والمحسود هو الذي يشق عليه إنعام الله تعالى من خزائن قدرته، على عبد من عباده بعلم أو مال أو محبة في قلوب الناس، أو حظ من الحظوظ، حتى أنه ليحب زوالها عنه، وإن لم يحصل له بذلك شيء من تلك النعمة؛ فهذا منتهى الخبث؛ فلذلك قال النبي صلى الله عليه وسلم: (الحسد يأكل الحسنات كما تأكل النارالحطب) .

والحسود هو المعذب الذي لا يرحم، ولا يزال في عذاب دائم في الدنيا إلى موته، ولعذاب الآخرة أشد وأكبر.

بل لا يصل العبد إلى حقيقة الإيمان ما لم يحب لسائر الناس ما يحب لنفسه، بل ينبغي ان يساهم المسلمين في السراء والضراء؛ فالمسلمون كالبنيان الواحد يشد بعضه بعضا، وكالجسد الواحد إذا اشتكى منه عضو اشتكى سائر الجسد. فإن كنت لا تصادف هذا من قلبك، فاشتغالك بطلب التخلص من الهلاك أهم من اشتغالك بنوادر الفروع وعلم الخصومات.

الرياء؟؟؟؟؟؟

وأما الرياء: فهو الشرك الخفي، وهو أحد الشركين، وذلك طلب المنزلة في قلوب الخلق، لتنال بها الجاه والحشمة، وحب الجاه من الهوى المتبع، وفيه هلك أكثر الناس، فما أهلك الناس إلا الناس، ولو أنصف الناس حقيقة لعلموا أن أكثر ما هم فيه من العلوم والعبادات فضلا عن أعمال العادات، ليس يحملهم يحملهم عليه إلا مراءاة الناس، وهي محبطة للأعمال، كما ورد الخبر: (أن الشهيد يؤمر به يوم القيامة إلى النار، فيقول: يا رب استشهدت في سبيلك، فيقول الله تعالى: بل أردت أن يقال إنك شجاع، وقد قيل ذلك،

وذلك أجرك - وكذلك يقال للعالم والحاج والقارىء.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 135;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 136, 'العجب والكبر والفخر', 'العجب والكبر والفخر');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وأما العجب والكبر والفخر: فهو الداء العضال، وهو نظر العبد إلى نفسه بعين العز والاستظام، وإلى غيره بعين الاحتقار والذل، ونتيجته على ms35 اللسان أن يقول: أنا وأنا كما قال إبليس اللعين: (أنا خير منه، خلقتني من نار، وخلقته من طين) وثمرته في المجالس الترفع والتقدم وطلب التصدر فيها، وفي المحاورة الاستنكاف من أن يرد كلامه عليه.

والمتكبرهو الذي إن وعظ أنف، أو وعظ عنف، فكل من رأى نفسه خيرا من أحد من خلق الله تعالى فهو متكبر.

بل ينبغي لك أن تعلم أن الخير من هو خير عند الله في دار الآخرة، وذلك غيب، وهو موقوف على الخاتمة؛ فاعتقادك في نفسك أنك خير من غيرك جهل محض، بل ينبغي ألا تنظر إلى أحد إلا وترى أنه خير منك، وأن الفضل له على نفسك، فإن رأيت صغيرا قلت: هذا لم يعص الله وأنا عصيته، فلا شك أنه خير مني وإن رأيت كبيرا قلت هذا قد عبد الله قبلى، فلا شك أنه خير مني وإن رأيت كبيرا قلت هذا قد عبد الله قبلي، فلا شك أنه خير مني وإن رأيت كبيرا قلت هذا قد عبد الله قبلي، فلا شك أنه خير مني. وإن كان عالما قلت: هذا قد أعطى ما لم أعط، وبلغ ما لم أبلغ، وعلم ما جهلت؛ فكيف أكون مثله وإن كان جاهلا قلت: هذا قد عصى الله بجهل، وأنا عصيته بعلم؛ فحجة الله على آكد، وما أدري بم يختم لي وبم يختم له؟ وإن كان كافرا قلت: لا أدري، عسى أن يسلم ويختم له بخير العمل، وينسل بإسلامه من الذنوب كما تنسل الشعرة من العجين، وأما أنا - والعياذ بالله - فعسى أن يضلني الله فأكفر فيختم لي بشر العمل؛ فيكون غدا هو من المقربين، وأنا أكون من المبعدين.

فلا يخرج الكبر من قلبك إلا بأن تعرف أن الكبير من هو كبير عند الله تعالى، وذلك موقوف على الخاتمة، وهي مشكوك فيه؛ فيشغلك خوف الخاتمة عن أن تتكبر مع الشك فيها على عباد الله تعالى، فيقينك وإيمانك في الحال لا يناقض تجويزك في الاستقبال؛ فإن الله مقلب القلوب يهدي من يشاء، ويضل من ms36 يشاء.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 136;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 137, 'حديث جامع في معاصي القلب', 'حديث جامع في معاصي القلب');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'والأخبار في الحسد والكبر والرياء والعجب كثيرة، ويكفيك فيها حديث واحد جامع؛ فقد روى ابن المبارك بإسناده عن رجل أنه قال لمعاذ: يا معاذ حدثني حديثا سمعنه من رسول الله صلى الله عليه وسلم، قال: (فبكى معاذ حتى ظننت أنه لا يسكت، ثم سكت، ثم قال: واشوقاه إلى رسول الله صلى الله عليه وسلم وإلى لقائه، ثم قال: سمعت رسول الله صلى الله عليه وسلم يقول لي: (يا معاذ، إني محدثك بحديث إن أنت حظفته نفعك عندالله، وإن ضيعته ولم تحفظه انقطعت حجتك عند الله تعالى يوم القيامة يا معاذ إن الله تبارك وتعالى خلق سبعة أملاك قبل أن يخلق السموات

والأرض، فجعل لكل سماء من السبع ملكا بوابا عليها، فتصعد الحفظة بعمل العبد من حين يصبح إلى حين يمسي، له نور كنور الشمس، حتى إذا صعدت به إلى السماء الدنيا زكته وكثرته، فيقول الملك الموكل بها للحفظة: اضربوا بهذا العمل وجه صاحبه، أنا صاحب الغيبة، أمرني ربي ألا أدع عمل من اغتاب الناس يجاوزني إلى غيري، قال: ثم تأتي الحفظة بعمل صالح من أعمال العبد له نور فتزكيه وتكثره حتى تبلغ به إلى السماء الثانية، فيقول لهم الملك الموكل بها: قفوا، واضربوا بهذا العمل وجه صاحبه، إنه أرا بعمله عرض الدنيا، أنا ملك الفخر، أمرني ربي ألا أدع عمله يجاوزني إلى غيري، إنه كان يفتخر على الناس في مجالسهم، قال: وتصعد الحفظة بعمل العبد يبتهج نورا، من صدقة وصلا وصيام، قد أعجب الحفظة، فيجاوزون به إلى السماء الثالثة، فيقول لهم الملك الموكل بها: قفوا، واضربوا بهذا العمل وجه صاحبه، أنا ملك الكبر، أمرني ربي ألا أدع عمله يجاوزني إلى غيري؛ إنه كان يتكبرى على الناس في مجالسهم، قال: وتصعد الحفظة بعمل العبد يزهو كما يزهو الكوكب الدري وله دوي من تسبيح وصلاة وصيام وحج وعمرة، حتى يجاوزا به إلى السماء الرابعة، فيقول لهم الملك الموكل بها: قفوا، واضربوا

بهذا العمل وجه صاحبه وظهره ms37 وبطنه، أنا صاحب العجب، أمرني ربي ألا أدع عمله يجاوزني إلى غيري؛ إنه كان إذا عمل عملا أدخل العجب فيه، قال: وتصعد الحفظة بعمل العب حتى يجاوزا به إلى السماء الخامسة كأنه العروس المزفوفة إلى بعلها، فيقول الملك الموكل بها: قفوا واضربوا بهذا العمل وجه صاحبه، ن واحملوه على عاتقه، أنا ملك الحسد، إنه كان يحسد من يتعلم ويعمل بمثل عمله، وكل من كان يأخذ فضلا من العبادة كان يحسدهم، ويقع فيهم، أمرني ربي ألا أدع عمله يجاوزني إلى غيري.

قال: وتصعد الحفظة بعمل العبد له ضوء كضوء الشمس، من صلاة وزكاة وحج وعمرة وجهاد وصيام، فيجاوزون به إلى السماء السادسة، فيقول لهم الملك الموكل بها: قفوا واضربوا بهذا العمل وجه صاحبه؛ إنه كان لا يرحم إنسانا قد من عباد الله أصابه بلاء أو مرض، بل كان يشمت به، أنا ملك الرحمة، أمرني ربي ألا أدع عمله يجاوزني إلى غيري، قال: وتصعد الحفظة بعمل العبد من صوم وصلاة ونفقة وجهاد وورع، له دوي كدوى النحل، وضوء كضوء الشمس، ومعه ثلاثة آلاف ملك، فيجاوزون به إلى السماء السابعة، فيقول لهم الملك الموكل بها: قفوا، واضربوا بهذا العمل وجه صاحبه، واضربوا جوارحه واقفلوا به على قلبه، أنا صاحب الذكر، فإني أحجب عن ربي كل عمل لم يرد به وجه ربي؛ إنه إنما أراد بعمله غير الله تعالى، إنه أراد به رفعة عند الفقهاء، وذكرا عند العلماء، وصيتا في المدائن، أمرني ربي ألا أدع عمله يجاوزني إلى غيري وكل عمل لم يكن لله تعالى خالصا فهو رياء، ولا يقبل الله عمل المرائي.. قال: وتصعد الحفظة بعمل العبد من صلاة وزكاة وصيام وحج وعمرة وخلق حسن وصمت وذكر الله تعالى، فتشيعه ملائكة السموات السبع حتى يقطعوا به الحجب كلها إلى الله تعالى، فتشيعه ملائكة السموات السبع حتى يقطعوا به الحجب كلها إلى الله تعالى، فيقفون بين يديه، ويشهدون له بالعمل الصالح المخلص لله تعالى، فيقول الله تعالى: أنتم الحفظة على عمل عبدي، وأنا الرقيب ms38 على ما في قلبه؛ إنه لم يردني بهذا العمل، وإنما أراد به غيري، فعليه لعنتي، فتقول الملائكة كلها: عليه لعنتك ولعنتنا، فتلعنه السموات السبع ومن فيهن) ثم بكى معاذ، وانتحب انتحابا شديدا، وقال معاذ: قلت يا رسول الله أنت رسول الله وأنا معا، فكيف لي بالنجاة والخلاص من ذلك؟ قال: (اقتد بي وإن كان في عملك نقص، يا معاذ حافظ على لسانك من الوقيعة في إخوانك من حملة القرآن خاصة، واحمل ذنوبك عليك، ولا تحملها عليهم، ولا تزل نفسك بذمهم، ولا ترفع نفسك عليهم، ولا تدخل عمل الدنيا في عمل الآخرة، ولا تراء بعملك، ولا تتكبر في مجلسك، لكي يحذر الناس من سوء خلقك، ولا تناج رجلا وعندك آخر، ولا تتعظم على الناس فتنقطع عنك خيرات الدنيا والآخرة، ولا تمزق الناس بلسانك فتمزقك كلاب النار يوم القيامة في النار، قال الله تعالى: (والناشطات نشطا) ، هل تدري من هن يا معاذ؟، قلت: ما هن - بأبي أنت وأمي - يا رسول الله؟ قال: (كلاب في النار تنشط اللحم من العظم) ، قلت: بأبي أنت وأمي يا رسول الله، من يطيق هذه الخصال ونمن ينجو منها؟ قال: (يا معاذ إنه ليسير على من يسره الله تعالى عليه، إنما يكفيك من ذلك أن تحب للناس ما تحب لنفسك، وتكره لهم ما تكره لنفسك، فإذن أنت يا معاذ قد سلمت) . قال خالد بن معدان: فما رأيت أحدا أكثر تلاوة للقرآن العظيم من معاذ لهذا الحديث العظيم.

فتأمل أيها الراغب في العلم هذه الخصال، واعلم أن أعظم الاسباب في رسوخ هذه الخبائث في القلب: طلب العلم لأجل المباهاة والمنافسة، فالعامي بمعزل عن اكثر هذه الخصال، والمتفقه مستهدف لها، وهو متعرض للهلاك بسببها؛ فانظر آي أمورك أهم، أتتعلم كيفية الحذر من هذه المهلكات، وتشتغل بإصلاح قلبك وعمارة آخرتك؟ أم الأهم أن تخوض مع الخائضين، فتطلب من العلم ما هو سبب زيارة الكبر والرياء والحسد والعجب، حتى تهلك مع الهالكين.

واعلم أن هذه الخصال

الثلاث من أمهات خبائث القلب، ولها ms39 مغرس واحد، وهو حب الدنياي ولذلك قال النبي صلى الله عليه وسلم: (حب الدنيا رأس كل خطيئة) ، ومع هذا فالدنيا مزرعة للآخرة فمن أخذ من الدنيا بقدر الضرورة، ليستعين بها على الآخرة، فالدنيا مزرعته؛ ومن أراد الدنيا ليتنعم بها، فالدنيا مهلكته.

فهذه نبذة يسيرة من ظاهر علم التقوى، وهي بداية الهداية، فإن جربت بها نفسك وطاوعتك عليها، فعليك بكتاب (إحياء علوم الدين) لتعرف كيفية الوصول إلى باطن التقوى.

وإن كنت تطلب العلم من القيل والقال، والمراء والجدال، فما أعظم مصيبتك وما أطول تعبك وما أعظم حرمانك وخسرانك! فاعمل ما شئت؛ فإن الدينا التي تطلبها بالدين لا تسلم لك، والآخرة تسلب منك؛ ن فمن طلب الدنيا بالدين خسرهما جميعا، ومن ترك الدنيا للدين ربحهما جميعا.

فإذا عمرت بالتقوى باطن قلبك، فعند ذلك ترتفع الحجب بينك وبين ربك، وتنكشف لك أنوار المعارف، وتنفجر من قلبك ينابيع الحكم، وتتضح لك أسرار الملك والملكة، ويتسير لك من العلوم ما تستحقر به هذه العلوم المحدثة التي لم يكن لها ذكر في زمن الصحابة رضي الله عنهم والتابعين.

فهذه جمل الهداية إلى بداية الطريق في معاملتك مع الله تعالى بأداء أوامره واجتناب نواهيه، وأشير عليك الآن بجمل من الآداب لتؤاخذ نفسك بها في مخالطتك مع عباد الله تعالى وصحبتك معهم في الدنيا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 137;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 138, 'القسم الثالث', 'القسم الثالث');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'القول في آداب الصحبة

آداب الصحبة مع الله تعالى اعلم أن صاحبك الذي لا يفارقك في حضرك وسفرك ونومك ويقظتك، بل في حياتك وموتك، هو ربك وسيدك ومولاك وخالقك، ومهما ذكرته فهو جليسك؛ إذ قال الله تعالى: (أنا جليس من ذكرين) .

ومهما انكسر قلبك حزنا على تقصيرك في حق دينك، فهو صاحبك وملازمك؛ إذ قال الله تعالى: (أنا عند المنكسرة قلوبهم من أجلي) .

فلو عرفته حق معرفته لاتخذته صاحبا وتركت الناس جانبا. فإن لم تقدر على ذلك في جميع أوقاتك،

فإياك أن تخلي ليلك ونهارك عن وقت تخلو فيه لمولاك وتتلذذ معه بمناجاتك له، وعند ذلك فعليك أن تتعلم آداب الصحبة مع ms40 الله تعالى.

وآدابها: إطراق الرأس، وغض الطرف، وجمع الهم، ودوام الصمت، وسكون الجوارح، ومبادرة الأمر، واجتناب النهي، وقلة الاعتراض على القدر، ودوام الذكر، وملازمة الفكر، وإيثار الحق على الباطل، والإياس عن الخلق، والخضوع تحت الهيبة والانكسار تحت الماء، والسكون عن حيل الكسب ثقة بالضمان والتوكل على فضل الله تعالى معرفة بحسن الاختيار.

وهذا كله ينبغي أن يكون شعارك في جميع ليلك ونهارك؛ فإنها آداب الصحبة مع صاحب لا يفارقك، والخلق كلهم يفارقونك في بعض أوقاتك.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 138;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 139, 'آداب العالم', 'آداب العالم');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وإن كنت عالما، فآداب العالم: الاحتمال، ولزوم الحلم، والجلوس بالهيبة على سمت الوقار مع إطراق الرأس، وترك التكبر على جميع العباد إلا على الظلمة زجرا لهم عن الظلم، وإيثارا للتواضع في المحافل والمجالس، وترك الهزل والدعابة، والرفق بالمتعلم، والتأني بالمتعجرف، وإصلاح البليد بحسن الارشاد، وترك الحرد عليه، وترك الأنفه من قول: (لا أدري) وصرف الهمة إلى السائل وتفهم سؤاله، وقبول الحجة، والانقياد للحق، والرجوع إليه عند الهفوة، ومنع المتعلم عن كل علم يضره، وزجره عن أن يريد بالعلم النافع غير وجه الله تعالى، وصد المتعلم عن أن يشتغل بفرض الكفاية قبل الفراغ من فرض العين.. وفرض عينه إصلاح ظاهره وباطنه بالتقوى، ومؤاخذه نفسه أولا بالتقوى ليقتدي المتعلم أولا بأعماله، ويستفيد ثانيا من أقواله.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 139;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 140, 'آداب المتعلم', 'آداب المتعلم');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وإن كنت متعلما، فآداب المتعلم مع العالم: أن يبدأه بالتحية والسلام، وأن يقلل بين يديه الكلام، ولا يتكلم ما لم يسأله أستاذه، ولا يسأل ما لم يستأذن أولا، ولا يقول في معارضة قوله: قال فلان بخلاف ما قلت، ولا يشير عليه بخلاف رأيه فيرى أنه أعلم بالصواب من أستاذه، ولا يسأل جليسه في مجلسه، ولا يلتفت إلى الجوانب، بل يجلس مطرقا ساكنا متآدبا كأنه في الصلاة، ولا يكثر عليه السؤال عند ملله، وإذا قام قام له، ولا يتبعه بكلامه وسؤاله، ولا يسأله في طريقه إلى أن يبلغ إلى منزله، ولا يسىء الظن به في أفعال ظاهرها منكرة عنده، فهو أعلم بأسراره، وليذكر عند ذلك قول موسى للخضر - عليهما ms41 السلام: (أخرقتها لتغرق أهلها، لقد جئت شيئا إمرا) ، وكونه مخطئا في إنكاره اعتمادا على الظاهر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 140;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 141, 'آداب الولد مع الوالدين', 'آداب الولد مع الوالدين');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وإن كان لك والدان، فآداب الولد مع الوالدين: أن يسمع كلامهما، ويقوم لقيامهما؛ ويمتثل لأمرهما، ولا يمشي أمامهما، ولا يرفع صوته فوق

أصواتهما، ويلبي دعوتهما، ويحرص على مرضاتهما، ويخفض لهما جناح الذل، ولا يمن عليهما بالبر لهما ولا بالقيام لأمرهما، ولا ينظر إليهما شذرا، ولا يقطب وجهه في وجههما، ولا يسافر إلا بإذنهما.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 141;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 142, 'أصناف الناس في العلاقة بالمرء', 'أصناف الناس في العلاقة بالمرء');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'واعلم أن الناس بعد هؤلاء في حقك ثلاثة أصناف: إما أصدقاء، وإما معاريف، وإما مجاهيل.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 142;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 143, 'آداب العلاقة بالعوام المجهولين', 'آداب العلاقة بالعوام المجهولين');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'فإن بليت بالعوام المجهولين، فآداب مجالستهم: ترك الخوض في حديثهم، وقلة الإصغاء إلى أراجيفهم، والتغافل عما يجري من سوء ألفاظهم، والاحتراز عن كثرة لقائهم والحاجة إليهم، والتنبيه على منكراتهم باللطف والنصح عند رجال القبول منهم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 143;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 144, 'آداب العلاقة بالاخوان والأصدقاء', 'آداب العلاقة بالاخوان والأصدقاء');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وأما الإخوان والاصدقاء فعليك فيهم وظيفتان: الوظيفة الأولى', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 144;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 145, 'شروط الصحبة والصداقة', 'شروط الصحبة والصداقة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'إحداهما: أن تطلب أولا شروط الصحبة والصداقة، فلا تؤاخ إلا من يصلح للاخوة والصداقة، قال رسول الله صلى الله عليه وسلم: (المرء على دين خليله فلينظر أحدكم من يخالل) .

فإذا طلبت رفيقا ليكون شريكك في التعلم، وصاحبك في أمر دينك ودنياك، فراع فيه خمس خصال: الأولى: العقل: فلا خير في صحبة الأحمق، فإلى الوحشة والقطيعة يرجع آخرها، وأحسن أحواله أن يضرك وهو يريد أن ينفعك، والعدو العاقل خير من الصديق الأحمق، قال علي رضي الله عنه:

فلا تصحب أخا الجهل ... وإياك وإياه

فكم من جاهل أردى ... حليما حين آخاه

يقاس المرء بالمرء ... إذا ما المرء ماشاه

كحذو النعل بالنعل ... إذا مالنعل حاذاه

وللشىء من الشىء ... مقاييس وأشباه

وللقلب على القلب ... دليل حين يلقاه

الثانية: حسن الخلق: فلا تصحب من ساء خلقه، وهو الذي لا يملك نفسه عند الغضب والشهوة. وقد جمعه علقمة العطاردي رحمه الله تعالى في وصيته لابنه لما حضرته الوفاة، قال: يا بني إذا أردت صحبة إنسان فاصحب من إذا خدمته صانك، ms42 وإن صحبته زانك، وإن قعدت بك مؤنة مانك.. اصحب من إذا مددت يدك بخير مدها، وإن رأى منك حسنة عدها، وإن رأى منك سيئة سدها.

اصحب من إذا قلت صدق قولك، وإن حاولت أمرا أمرك، وإن تنازعتما في شر آثرك.

وقال علي رضي الله عنه رجزا:

إن أخاك الحق من كان معك ... ومن يضر نفسه لينفعك

ومن إذا ريب الزمان صدعك ... شتت فيك شمله ليجمعك

الثالثة: الصلاح: فلا تصحب فاسقا مصرا على معصية كبيرة، لأن من يخاف الله لا يصر على كبيرة، ومن لا يخاف الله لا تؤمن غوائله، بل يتغير بتغير الأحوال والأعراض، قال الله تعالى لنبيه

صلى الله عليه وسلم: (ولا تطع من أغفلنا قلبه عن ذكرنا واتبع هواه وكان أمره فرطا) .

فاحذر صحبة الفاسق؛ فإن مشاهدة الفسق والمعصية على الدوام تزيل عن قلبك كراهية المعصية، وتهون عليك أمرها، ولذلك هان على القلوب معصية الغيبة لإلفهم لها، ولو رأو خاتما من ذهب أو ملبوسا من حرير على فقيه لاشتد إنكارهم عليه، والغيبة أشد من ذلك.

الرابعة: ألا يكون حريصا على الدنيا: فصحبة الحريص على الدنيا سم قاتل؛ لأن الطباع مجبولة على التشبه والاقتداء، بل الطبع يسرق من الطبع من حيث لا يدري فمجالسه الحريص تزيد في حرصك، ومجالسه الزاهد تزيد في زهدك.

الخامسة: الصدق: فلا تصحب كذابا، فإنك منه على غرور، فإنه مثل السراب، يقرب منك البعيد، ويبعد منك القريب.

ولعلك تعدم اجتماع هذه الخصال في سكان المدارس والمساجد، فعليك بأحد أمرين: إما العزلة والانفراد؛ ففيها سلامتك.. وإما أن تكون مخالطتك مع شركائك بقدر خصالهم، بأن تعلم أن الاخوة ثلاثة: أخ لآخرين فلا تراع فيه إلا الدين، وأخ لدنياك فلا تراع فيه إلا الخلق الحسن، وأخ لتأنس به فلا تراع فيه إلا السلامة من شره وفتنته وخبثه.

والناس ثلاثة: أحدهم مثله مثل الغذاء لا يستغنى عنه، والآخر مثله مثل الدواء يحتاج إليه في وقت دون وقت، والثالث مثله مثل الداء لا يحتاج إليه قط، ولكن العبد قد يتسلى ms43 به، وهو الذي لا أنس فيه ولا نفع؛ فتجب مداراته إلى الخلاص منه، وفي مشاهدته فائدة عظيمة إن وفقت لها، وهو أن تشاهد من خبائث أحواله وأفعاله ما تستقبحه فتجتنبه؛ فالسعيد من وعظ بغيره، والمؤمن مرآة المؤمن، وقيل لعيسى عليه السلام: من أدبك؟ فقال: ما أدبني أحد، ولكن رأيت جهل الجاهل فاجتنبته. ولقد صدق - على نبينا وعليه الصلاة والسلام - فلو اجتنب الناس ما يكرهونه من غيرهم لكملت آدابهم واستغنوا عن المؤدبين.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 145;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 146, 'الوظيفة الثانية', 'الوظيفة الثانية');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'مراعاة حقوق الصحبة

فمهما انعقدت الشركة، وانتظمت بينك وبين شريكك الصحبة، فعليك حقوق يوجبها عقد الصحبة، وفي القيام بها آداب، وقد قال صلى الله عليه وسلم: (مثل الأخوين مثل اليدين تغسل إحداهما الأخرى) ، ودخل صلى الله عليه وسلم

أجدمعة، فاجتنى منها سواكين، أحدهما معوج، والآخر مستقيم، وكان معه بعض أصحابه، فأعطاه المستقيم، وأمسك لنفسه المعوج، فقال: يارسول الله أنت أحق مني بالمستقيم، فقال صلى الله عليه وسلم: (ما من صاحب يصحب صاحبا ولو ساعة من نهار إلا وسئل عن صحبته، هل أقام فيها حق الله تعالى أو أضاعه) . وقال صلى الله عليه وسلم: (ما اصطحب اثنان قط إلا وكان أحبهما إلى الله تعالى أرفقهما بصاحبه) .

وآداب الصحبة: الايثار بالمال، فإن لم يكن هذا فبذل الفضل من المال عند الحاجة، والإعانة بالنفس في الحاجات، على سبيل المبادرة من غير احواج إلى التماس، وكتمان السر، وستر العيوب، والسكوت على تبليغ ما يسوؤه من مذمة الناس إياه، وإبلاغ ما يسره من ثناء الناس عليه، وحسن الإصغاء عند الحديث، وترك المماراة فيه، وأن يدعوه بأحب أسمائه إليهس، وأن ثني عليه بما يعرف من محاسنه، وأن يشكره على صنيعه في وجهه، وأن يذب عنه في غيبته إذا تعرض لعرضه كما يذب عن نفسه، وأن ينصحه باللطف والتعريض إذا احتاج إليه، وأن يعفو عن زلته وهفوته، ولا يعتب عليه، وأن يدعو له في خلوته في حياته وبعد مماته، وأن يحسن الوفاء مع أهله وأقاربه بعد موته، وأن يؤثر التخفيف عنه، فلا يكلفه شيئا ms44 من حاجاه، فيروح سره من مهماته، وأن يظهر الفرح بجميع ما يرتاح له من مساره، والحزن على نياله من مكارهه، وأن يضمر في قلبه مثل ما يظهره، فيكون صادقا في وده سرا وعلانية، وأن يبدأه بالسلام عند إقباله، وأن يوسع له في المجلس ويخرج له من مكانه، وأن يشيعه عند قيامه، وأن يصمت عند كلامه حتى يفرغ من كلامه، ويترك المداحلة في كلامه. وعلى الجملة، فيعامله بما يحب أن يعامل به، فمن لا يحب لأخيه ما يحب لنفسه فأخوته نفاق، وهي عليه وبال في الدنيا والآخرة.

فهذا أدبك في حق العوام المجهولين، وف يحق الأصدقاء المؤاخين.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 146;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('bidayatulhidayah', 147, 'آداب العلاقة بالمعارف', 'آداب العلاقة بالمعارف');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وأما القسم الثالث، وهم المعارف: فاحذر منهم؛ فإنك لا تر الشر إلا ممن تعرفه، أم الصديق فيعينك، وأما المجهول فلا يتعرض لك، وإنما الشر كله من المعارف الذين يظهرون الصداقة بألسنتهم.

فأقلل من المعارف ما قدرت، فإذا بليت بهم في مدرسة أو مسجد أو جامع أو سوق أو بلد، فيجب ألا تستصغر منهم أحدا؛ فإنك لا تدري لعله خير منك، ولا تنظر إليهم بعين التعظيم لهم في

حال دنياهم فتهلك، لأن الدنيا صغيرة عند الله تعالى، صغير ما فيها. ومهما عظم أهل الدنيا في قلبك فقد سقطت من عين الله تعالى، وإياك أن تبذل لهم دينك لتنال به من دنياهم؛ فلا يفعل ذلك أحد إلا صغر في أعينهم ثم حرم ما عندهم.

وإن عادوك فلا تقابلهم بالعداوة؛ فإنك لا تطيق الصبر على مكافأتهم، فيذهب دينك في عداوتهم، ويطول عناؤك معهم، ولا تسكن إليهم في حال إكرامهم إياك وثنائهم عليك في وجهك وإظهارهم المودة لك؛ فإنك إن طلبت حقيقة ذلك لم تجد في المائة واحدا، ولا تطمع أن يكونوا لك في السر والعلن واحد، ولا تتعجب إن ثلبوك في غيبتك ولا تغضب منه؛ فإنك إن أنصفت وجدت من نفسك مثل ذلك، حتى في أصدقائك وأقاربك، بل في أستاذك ووالديك؛ فإنك تذكرهم في الغيبة بما لا تشافههم به، فاقطع طمعك عن مالهم وجاههم ms45 ومعونتهم؛ فإن الطامع في الأكثر خائب في المال، وهو ذليل لا محالة في الحال.

وإذا سألت واحدا حاجة فقضاها، فاشكر الله تعالى واشكره، وإن قصر فلا تعاتبه ولا تشكه فتصير عدواة له، وكن كالمؤمن يطلب المعاذير، ولا تكن كالمنافق يطلب العيوب، وقل لعله قصر لعذر له لم أطلع عليه.

ولا تعظن أحدا منهم ما لم تتوسم فيه أو مخايل القبول، وإلا لم يستمع منك وصار خصما عليك، إذا أخطئوا في مسألة، وكانوا يأنفون من التعلم منك، فلا تعلمهم؛ فلا تعلمهم؛ ن فإنهم يستفيدون منك علما ويصبحون لك أعداء، إلا إذا تعلق ذلك بمعصية يقارفونها عن جهل منهم، فاذكر الحق بلطف من غير عنف.

وإذا رأيت منهم كرامة وخيرا، فاشكر الله الذي حببك إليهم. وإذا رأيت منهم شرا، فكلهم إلى الله تعالى، واستعذ بالله من شرهم، ولا تعاتبهم، ولا تقل لهم: لم لم تعرفوا حقي؛ وأنا فلان بن فلان، وأنا الفاضل في العلوم؟ فإن ذلك من كلام الحمقى، وأشد الناس حماقة من يزكي نفسه ويثني عليها.

واعلم أن الله تعالى لا يسلطهم عليك إلا بذنب سبق منك، فاستغفر الله من ذنبك، واعلم أن ذلك عقوبة من الله تعالى.

وكن فيما بينهم سميعا لحقهم، أصم عن باطلهم، نطوفا بمحاسنهم، صموتا عن مساويهم، واحذر مخالطة متفقهة الزمان، لا سيما المشتغلين بالخلاف والجدال.

واحذر منهم؛ فإنهم يتربصون بك - لحسدهم - ريب المنون، ويقطعون عليك بالظنون، ويتغامرون وراءك بالعيون، ويحصون عليك عثراتك في عشرتهم، حتى يجبهوك بها في حال غيظهم ومناظرتهم، لا يقيلون لك عثرة، ولا يغفرون لك زلة، ولا يسترون لك

عورة، يحاسبونك على النقير والقطمير، ويحسدونك على القليل والكثير، ويحرضون عليك الإخوان بالنميمة والبلاغات والبهتان، إن رضوا فظاهرهم الملق، وإن سخطوا فباطنهم الحنق، ظاهرهم ثياب وباطنهم ذئاب.

هذا ما قطعت به المشاهدة على أكثرهم، إلا من عصمه الله تعالى؛ فصحبتهم خسران، ومعاشرتهم خذلان.

هذا حكم من يظهر لك الصداقة، فكيف من يجاهرك بالعداوة؟ قال القاضي ابن معروف رحمه الله تعالى:

فاحذر عدوك مرة ... واحذر ms46 صديقك ألف مرة

فلربما انقلب الصديق ... فكان اعرف بالمضرة

وكذلك قال أبو تمام:

عدوك من صديقك مستفاد ... فلا تستكثرن من الصحاب

فإن الداء أكثر ما تراه ... يكون من الطعام أو الشراب

وكن كما قال هلال بن العلاء الرقى:

لما عفوت ولم أحقد على أحد ... أرحت نفسى من هم العداوات

إني أحيى عدوى عند رؤيته ... لأدفع الشر عنى بالتحيات

وأظهر البشر للإنسان أبغضه ... كأن قد ملا قلبى مرات

ولست أسلم ممن لست أعرفه ... فكيف أسلم من أهل المودات

الناس داء دواء الناس تركهم ... وفي الجفاء لهم قطع الأخوات

فسالم الناس تسلم من غوائلهم ... وكن حريصا على كسب التقيات

وخالق الناس واصبر ما بليت بهم ... اصم ابكم اعمى ذا تقيات

وكن أيضا كما قال بعض الحكماء: الق صديقك وعدوك بوجه الرضا، من غير مذلة لهما ولا هيبة منهما، وتوقر من غير كبر، وتواضع من غير مذلة، وكن في جميع أمورك في أوسطها، فكلا طرفى قصدن الأمور ذميم، كما قيل:

عليك بأوساط الأمور فإنها ... طريق إلى نهج الصراط قويم

ولا تك فيها مفرطا أو مفرطا ... فإن كلا حال الأمور ذميم

ولا تنظر في عطفيك، ولا تكثر إلى وارئك الالتفات، ولا تقف على الجماعات، وإذا جلست فلا تستوفز، وتحفظ من تشبيك أصابعك، وكثرة بصاقك ونخمك، وطر الذباب عن وجهك، وكثرة التمطى والتثاؤب في وجوه الناس في الصلاة وغيرها، وليكن مجلسك هادئا، وحديثك منظوما مرتبا، واصغ إلى الكلام الحسن ممن حدثك من غير إظهار تعجب مفرط، ولا تسأله إعادته، واسكت عن المضاحك والحكايات، ولا تحدث عن إعجابك بولدك وشعرك وكلامك وتصنيفك وسائر ما يخصك، ولا تتصنع تصنع المرأة في التزين، ولا تتبذل تبذل العبد، وتوق كثرة الكحل والإسراف

في الدهن، ولا تلح في الحاجات، ولا تشجع أحدا على الظلم، ولا تعلم أحدا من أهلك وولدك فضلا عن غيرهم مقدار مالك؛ واجفهم من غير عنف، ولن لهم من غير ضعف، ولا تهازل أمتك ولا عبدك، فيسقط وقارك من قلوبهم، وإذا خاصمت فتوقر، وتحفئ من جهلك وعجلتك، ms47 وتفكر في حجتك، ولا تكثر الاشارة بيدك، ولا تكثر الالتفاف إلى من ورائك ولا تجث على ركبتيك، وإذا هدأ غضبك فتكلم. وإذا قربك السلطان فكن منه على حد السنان، وإياك وصديق العافية؛ فإنه أعدى الأعداء، ولا يجعل مالك أكرم من عرضك.

فهذا القدر يافتى يكفيك من بداية الهداية، فجرب بها نفسك؛ فإنها ثلاثة أقسام: قسم آداب الطاعات، وقسم في ترك المعاصي، وقسم في مخالطة الخلق، وهي جامعة لجمل معاملة العبد مع الخالق والخلق.

فإن رأيتها مناسبة لنفسك، ورأيت قلبك مائلا إليها راغبا في العمل بها، فاعلم أنك عبد نور الله تعالى بالإيمان قلبك، وشرح به صدرك، وتحقق أن لهذه البداية نهاية، ووراءها أسرارا وأغوارا ومكاشفات، وقد أودعناها كتاب (إحياء علوم الدين) ؛ فاشتغل بتحصيله.

وإن رأيت نفسك تستثقل العمل بهذه الوظائف، وتنكر هذا الفن من العلم، وتقول لك نفسك: أنى ينفعك هذا العلم في محافل العلماء، ومتى يقدمك هذا على الأقران والنظراء؟! وكيف يرفع منصبك في مجالس الأمراء والوزراء؟ وكيف يوصلك إلى الصلة والأرزاق وولاية الأوقاف والقضاء؟ فاعلم أن الشيطان قد أغواك وأنساك متقلبك ومثواك، فاطلب لك شيطانا مثلك، ليعملك ما تظن أنه ينفعك ويوصلك إلى بغيتك. ثم أنه قط لا يصفو لك الملك في محلتك، فضلا عن قريتك وبلدتك، ثم يفوتك الملك المقيم والنعيم الدائم في جوار رب العالمين.

والسلام عليكم ورحمة الله وبركاته، والحمد لله أولا وآخرا، وظاهرا وباطنا. ولا حول ولا قوة إلا بالله العلي العظيم. وصلى الله على سيدنا محمد وآله وصحبه، وسلم تسليما كثيرا.  ms48', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'bidayatulhidayah' AND bab_order = 147;

-- ═══ fathulqarib — OpenITI 0918IbnQasimShamsDinGhazzi.FathQarib.Shamela0035120-ara1 ═══
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 100, 'مقدمة', 'مقدمة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'بسم الله الرحمن الرحيم', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 101, 'مقدمة', 'مقدمة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'قال الشيخ الإمام العالم العلامة، شمس الدين أبو عبد الله، محمد بن قاسم الشافعي - تغمده الله برحمته ورضوانه، آمين: الحمد لله تبركا بفاتحة الكتاب، لأنها ابتداء كل أمر ذي بال، وخاتمة كل دعاء مجاب، وآخر دعوى المؤمنين في الجنة، دار الثواب؛ أحمده أن وفق من أراد من عباده للتفقه في الدين على وفق مراده. وأصلي وأسلم على أفضل خلقه محمد سيد المرسلين، القائل: «من يرد الله به خيرا يفقهه في الدين»؛ وعلى آله وصحبه مدة ذكر الذاكرين وسهو الغافلين.

وبعد؛ هذا كتاب في غاية الاختصار والتهذيب، وضعته على الكتاب المسمى ب «التقريب» لينتفع به المحتاج من المبتدئين لفروع الشريعة والدين، وليكون وسيلة لنجاتي يوم الدين، ونفعا لعباده المسلمين؛ إنه سميع دعاء عباده، وقريب مجيب، ومن قصده لا يخيب. {وإذا سألك عبادي عني فإني قريب أجيب دعوة الداع إذا دعان} [البقرة: 186].

واعلم أنه يوجد في بعض نسخ هذا الكتاب في غير خطبته تسميته تارة ب «التقريب»، وتارة ب «غاية الاختصار»؛ فلذلك سميته باسمين: أحدهما «فتح القريب المجيب في شرح ألفاظ التقريب»، والثاني «القول المختار في شرح غاية الاختصار».

قال الشيخ الإمام أبو الطيب، ويشتهر أيضا بأبي شجاع شهاب الملة والدين، أحمد بن الحسين بن أحمد الأصفهاني - سقى الله ثراه صبيب الرحمة والرضوان، وأسكنه أعلى فراديس الجنان: (بسم الله الرحمن الرحيم) أبتدئ كتابي هذا. والله اسم الذات الواجب الوجود، والرحمن أبلغ من الرحيم. (الحمد لله) هو الثناء على الله تعالى بالجميل على جهة التعظيم، (رب) أي مالك (العالمين) بفتح اللام، وهو كما قال ابن مالك: اسم جمع خاص بمن يعقل، لا جمع ومفرده عالم بفتح اللام، لأنه اسم عام لما سوى الله، والجمع خاص بمن يعقل.

(وصلى الله) وسلم (على سيدنا محمد النبي) هو - بالهمز وتركه: إنسان

أوحي إليه بشرع يعمل به وإن لم يؤمر بتبليغه؛ فإن أمر بتبليغه فنبي ورسول أيضا. والمعنى ينشئ الصلاة والسلام عليه. ومحمد علم منقول من اسم مفعول المضعف العين، والنبي بدل ms001 منه أو عطف بيان عليه. (و) على (آله الطاهرين) هم كما قال الشافعي: أقاربه المؤمنون من بني هاشم وبني المطلب. وقيل - واختاره النووي: أنهم كل مسلم. ولعل قوله: «الطاهرين» منتزع من قوله تعالى: {ويطهركم تطهيرا} [الأحزاب:33]، (و) على (صحابته)، جمع صاحب النبي. وقوله (أجمعين) تأكيد لصحابته.

ثم ذكر المصنف أنه مسؤول في تصنيف هذا المختصر بقوله: (سألني بعض الأصدقاء)، جمع صديق. وقوله: (حفظهم الله تعالى) جملة دعائية،

(أن أعمل مختصرا)، هو ما قل لفظه وكثر معناه (في الفقه)، هو لغة الفهم، واصطلاحا العلم بالأحكام الشرعية العملية المكتسب من أدلتها التفصيلية،

(على مذهب الإمام) الأعظم المجتهد، ناصر السنة والدين، أبي عبد الله محمد بن إدريس بن العباس ابن عثمان بن شافع (الشافعي) ولد بغزة سنة خمسين ومائة، ومات - (رحمة الله تعالى عليه ورضوانه) - يوم الجمعة سلخ رجب سنة أربع ومائتين.

ووصف المصنف مختصره بأوصاف، منها أنه (في غاية الاختصار ونهاية الإيجاز). والغاية والنهاية متقاربان، وكذا الاختصار والإيجاز؛ ومنها أنه (يقرب على المتعلم) لفروع الفقه (درسه، ويسهل على المبتدئ حفظه) أي استحضاره على ظهر قلب لمن يرغب في حفظ مختصر في الفقه. (و) سألني أيضا بعض الأصدقاء (أن أكثر فيه) أي المختصر (من التقسيمات) للأحكام الفقهية. (و) من (حصر) أي ضبط (الخصال) الواجبة

والمندوبة وغيرهما؛ (فأجبته إلى) سؤاله في (ذلك طالبا للثواب) من الله جزاء على تصنيف هذا المختصر، (راغبا إلى الله سبحانه وتعالى) في الإعانة من فضله على تمام هذا المختصر و (في التوفيق للصواب) وهو ضد الخطأ، (إنه) تعالى (على ما يشاء) يريد (قدير) أي قادر، (وبعباده لطيف خبير) بأحوال عباده.

والأول مقتبس من قوله تعالى: {الله لطيف بعباده} [الشورى: 19]، والثاني من قوله تعالى: {وهو الحكيم الخبير} [الأنعام: 18]. واللطيف والخبير اسمان من أسمائه تعالى. ومعنى الأول العالم بدقائق الأمور ومشكلاتها؛ ويطلق أيضا بمعنى الرفيق بهم؛ فالله تعالى عالم بعباده وبمواضع حوائجهم، رفيق بهم. ومعنى الثاني قريب من معنى الأول؛ ويقال: خبرت الشيء أخبر، فأنا به خبير، أي عليم. قال المصنف ms002 رحمه الله تعالى:', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 102, 'كتاب أحكام الطهارة', 'كتاب أحكام الطهارة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'والكتاب لغة مصدر بمعنى الضم والجمع، واصطلاحا اسم لجنس من الأحكام. أما الباب فاسم لنوع مما دخل تحت ذلك الجنس.

والطهارة بفتح الطاء لغة النظافة، وأما شرعا ففيها تفاسير كثيرة؛ منها قولهم: فعل ما تستباح به الصلاة، أي من وضوء وغسل وتيمم وإزالة نجاسة. أما الطهارة بالضم، فاسم لبقية الماء.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• أنواع المياه', 'ولما كان الماء آلة للطهارة استطرد المصنف لأنواع المياه، فقال: (المياه التي يجوز) أي يصح (التطهير بها سبع مياه: ماء السماء) أي النازل منها، وهو المطر

(وماء البحر) أي الملح، (وماء النهر) أي الحلو (وماء البئر، وماء العين، وماء الثلج، وماء البرد). ويجمع هذه السبعة قولك: ما نزل من السماء أو نبع من الأرض على أي صفة كان من أصل الخلقة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• أقسام المياه', '(ثم المياه) تنقسم (على أربعة أقسام): أحدها (طاهر) في نفسه (مطهر) لغيره (غير مكروه استعماله، وهو الماء المطلق) عن قيد لازم؛ فلا يضر القيد المنفك كماء البئر في كونه مطلقا. (و) الثاني (طاهر) في نفسه (مطهر) لغيره (مكروه استعماله) في البدن، لا في الثوب؛ (وهو الماء المشمس) أي المسخن بتأثير الشمس فيه.

وإنما يكره شرعا بقطر حار في إناء منطبع إلا إناء النقدين لصفاء جوهرهما. وإذا برد زالت الكراهة. واختار النووي عدم الكراهة مطلقا. ويكره أيضا شديد السخونة والبرودة.

(و) القسم الثالث (طاهر) في نفسه (غير مطهر لغيره، وهو الماء المستعمل) في رفع حدث أو إزالة نجس إن لم يتغير ولم يزد وزنه بعد انفصاله عما كان بعد اعتبار ما يتشربه المغسول من الماء؛ (والمتغير) أي ومن هذا القسم الماء المتغير أحد أوصافه (بما) أي بشيء (خالطه من الطاهرات) تغيرا يمنع إطلاق اسم الماء عليه؛ فإنه طاهر غير طهور، حسيا كان التغير أو تقديريا؛ كأن اختلط بالماء ما يوافقه في صفاته، كماء الورد المنقطع الرائحة والماء المستعمل؛ فإن لم يمنع اطلاق اسم الماء عليه، بأن كان تغيره بالطاهر يسيرا أو بما يوافق الماء في صفاته، وقدر مخالفا ولم يغيره ms003 فلا يسلب طهوريته؛ فهو مطهر لغيره.

واحترز بقوله: «خالطه» عن الطاهر المجاور له؛ فإنه باق على طهوريته ولو كان التغير كثيرا؛ وكذا المتغير بمخالط لا يستغني الماء عنه، كطين وطحلب وما في مقره وممره، والمتغير بطول المكث، فإنه طهور.

(و) القسم الرابع (ماء نجس) أي متنجس، وهو قسمان:

أحدهما (وهو الذي حلت فيه نجاسة) تغير أم لا، (وهو) أي والحال أنه ماء (دون القلتين). ويستثنى من هذا القسم الميتة التي لا دم لها سائل عند قتلها أو شق عضو منها كالذباب، إن لم تطرح فيه ولم تغيره؛ وكذا النجاسة التي لا يدركها الطرف؛ فكل منهما لا ينجس الماء. ويستثنى أيضا صور مذكورات في المبسوطات.

وأشار للقسم الثاني من القسم الرابع بقوله: (أو كان) كثيرا (قلتين) فأكثر (فتغير) يسيرا أو كثيرا.

(والقلتان خمسمائة رطل بغدادي تقريبا في الأصح) فيهما. والرطل البغدادي عند النووي مائة وثمانية وعشرون درهما وأربعة أسباع درهم. وترك المصنف قسما خامسا، وهو الماء المطهر الحرام، كالوضوء بماء مغصوب أو مسبل للشرب.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, '• تطهير جلود الميتة', '{فصل} في ذكر شيء من الأعيان المتنجسة وما يطهر منها بالذباغ وما لا يطهر.

(وجلود الميتة) كلها (تطهر بالدباغ) سواء في ذلك ميتة مأكول اللحم وغيره. وكيفية الذبغ أن ينزع فضول الجلد مما يعفنه من دم ونحوه، بشيء حريف كعفص، ولو كان الحريف نجسا كذرق حمام كفى في الدبغ (إلا جلد الكلب والخنزير وما تولد منهما أو من أحدهما) مع حيوان طاهر، فلا يطهر بالدباغ.

(وعظم الميتة وشعرها نجس) وكذا الميتة أيضا نجسة. وأريد بها الزائلة الحياة بغير ذكاة شرعية؛ فلا يستثنى حينئذ جنين المذكاة إذا خرج من بطن أمه ميتا، لأن ذكاته في ذكاة أمه، وكذا غيره من المستثنيات المذكورة في المبسوطات. ثم استثنى من شعر الميتة قوله: (إلا الآدمي) أي فإن شعره طاهر كميتته.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, '• استعمال الأواني', '{فصل} في بيان ما يحرم استعماله من الأواني وما يجوز. وبدأ بالأول فقال:

(ولا يجوز) في غير ضرورة لرجل أو امرأة (استعمال) شيء من (أواني الذهب ms004 والفضة)، لا في أكل ولا في شرب ولا غيرهما؛ وكما يحرم استعمال ما ذكر يحرم اتخاذه من غير استعمال في الأصح. ويحرم أيضا الإناء المطلي بذهب أو فضة إن حصل من الطلاء شيء بعرضه على النار.

(ويجوز استعمال) إناء (غيرهما) أي غير الذهب والفضة (من الأواني) النفيسة، كإناء ياقوت.

ويحرم الإناء المضبب بضبة فضة كبيرة عرفا لزينة؛ فإن كانت كبيرة لحاجة جاز مع الكراهة، أو صغيرة عرفا لزينة كرهت، أو لحاجة فلا تكره. أما ضبة الذهب فتحرم مطلقا، كما صححه النووي.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, '• السواك', '{فصل} في استعمال آلة السواك. وهو من سنن الوضوء؛ ويطلق السواك أيضا على ما يستاك به من أراك ونحوه.

(والسواك مستحب في كل حال) ولا يكره تنزيها (إلا بعد الزوال للصائم) فرضا أو نفلا؛ وتزول الكراهة بغروب الشمس. واختار النووي عدم الكراهة مطلقا.

(وهو) أي السواك (في ثلاثة مواضع أشد استحبابا) من غيرها؛ أحدها: (عند تغير الفم من أزم) قيل: هو سكوت طويل. وقيل: هو ترك الأكل. وإنما قال: (وغيره) ليشتمل تغير الفم بغير أزم، كأكل ذي ريح كريه من ثوم وبصل وغيرهما؛ (و) الثاني (عند القيام) أي الاستيقاظ (من النوم)؛ (و) الثالث (عند القيام إلى الصلاة)، فرضا أو نفلا.

ويتأكد أيضا في غير الثلاثة المذكورة مما هو مذكور في المطولات، كقراءة القرآن، واصفرار الأسنان.

ويسن أن ينوي بالسواك السنة؛ وأن يستاك بيمينه، ويبدأ بالجانب الأيمن من فمه، وأن يمره على سقف حلقه امرارا لطيفا، وعلى كراسي أضراسه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, '• فروض الوضوء', '{فصل} في فروض الوضوء. وهو بضم الواو - في الأشهر - اسم للفعل، وهو المراد هنا؛ وبفتح الواو اسم لما يتوضأ به. ويشتمل الأول على فروض وسنن.

وذكر المصنف الفروض في قوله: (وفروض الوضوء ستة أشياء): أحدها (النية). وحقيقتها شرعا قصد الشيء مقترنا بفعله؛ فإن تراخى عنه سمي عزما. وتكون النية (عند غسل) أول جزء من (الوجه) أي مقترنة بذلك الجزء، لا بجميعه، ولا بما قبله، ولا بما بعده؛ فينوي المتوضئ عند غسل ما ذكر رفع حدث من أحداثه، أو ms005 ينوي استباحة مفتقر إلى وضوء، أو ينوي فرض الوضوء، أو الوضوء فقط، أو الطهارة عن الحدث. فإن لم يقل عن الحدث لم يصح. وإذا نوى ما يعتبر من هذه النيات وشرك معه نية تنظف أو تبرد صح وضوؤه.

(و) الثاني (غسل) جميع (الوجه). وحده طولا ما بين منابت شعر الرأس غالبا، وآخر اللحيين؛ وهما العظمان اللذان ينبت عليهما الأسنان السفلى، يجتمع مقدمهما في الذقن، ومؤخرهما في الأذن. وحده عرضا

ما بين الأذنين.

وإذا كان على الوجه شعر خفيف أو كثيف وجب إيصال الماء إليه مع البشرة التي تحته.

وأما لحية الرجل الكثيفة بأن لم ير المخاطب بشرتها من خلالها فيكفي غسل ظاهرها، بخلاف الخفيفة، وهي ما يرى المخاطب بشرتها، فيجب إيصال الماء لبشرتها، وبخلاف لحية امرأة وخنثى، فيجب إيصال الماء لبشرتهما ولو كثفا.

ولا بد مع غسل الوجه من غسل جزء من الرأس والرقبة وما تحت الذقن.

(و) الثالث (غسل اليدين إلى المرفقين). فإن لم يكن له مرفقان اعتبر قدرهما. ويجب غسل ما على اليدين من شعر وسلعة وأصبع زائدة وأظافير. ويجب إزالة ما تحتها من وسخ يمنع وصول الماء.

(و) الرابع (مسح بعض الرأس) من ذكر أو أنثى أو خنثى؛ أو مسح بعض شعر في حد الرأس.

ولا تتعين اليد للمسح، بل يجوز بخرقة وغيرها. ولو غسل رأسه بدل مسحها جاز. ولو وضع يده المبلولة ولم يحركها جاز.

(و) الخامس (غسل الرجلين إلى الكعبين) إن لم يكن المتوضئ لابسا للخفين؛ فإن كان لابسهما وجب عليه مسح الخفين أو غسل الرجلين. ويجب غسل ما عليهما من شعر وسلعة وأصبع زائدة كما سبق في اليدين.

(و) السادس (الترتيب) في الوضوء (على ما) أي على الوجه الذي (ذكرناه) في عد الفروض. فلو نسي الترتيب لم يكف. ولو غسل أربعة أعضائه دفعة واحدة بإذنه ارتفع حدث وجهه فقط.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, '• سنن الوضوء', '(وسننه) أي الوضوء (عشرة أشياء)، وفي بعض نسخ المتن: «عشر خصال»: (1 التسمية) أوله. وأقلها بسم الله، وأكملها بسم الله الرحمن الرحيم؛ فإن ms006 ترك التسمية أوله أتى بها في أثنائه؛ فإن فرغ من الوضوء لم يأت بها.

(2 وغسل الكفين) إلى الكوعين قبل المضمضة، ويغسلهما ثلاثا إن تردد في طهرهما (قبل إدخالهما الإناء) المشتمل على ماء دون القلتين؛ فإن لم يغسلهما كره له غمسهما في الإناء، وإن تيقن طهرهما لم يكره غمسهما.

(3 والمضمضة) بعد غسل الكفين. ويحصل أصل السنة فيها بإدخال الماء في الفم سواء أداره فيه ومجه أم لا؛ فإن أراد الأكمل مجه.

(4 والاستنشاق) بعد المضمضة. ويحصل أصل السنة فيه بإدخال الماء في الأنف، سواء جذبه بنفسه إلى خياشيمه ونثره أم لا؛ فإن أراد الأكمل نثره.

والمبالغة مطلوبة في المضمضة والاستنشاق. والجمع بين المضمضة والاستنشاق بثلاث غرف يتمضمض من كل منها ثم يستنشق أفضل من الفصل بينهما.

(5 ومسح جميع الرأس) وفي بعض نسخ المتن «واستيعاب الرأس بالمسح». أما مسح بعض الرأس فواجب كما سبق. ولو لم يرد نزع ما على رأسه من عمامة ونحوها كمل بالمسح عليها.

(6 ومسح) جميع (الأذنين ظاهرهما وباطنهما بماء جديد) أي غير بلل الرأس. والسنة في كيفية مسحهما أن يدخل مسبحتيه في صماخيه ويديرهما على المعاطف، ويمر إبهاميه على ظهورهما، ثم يلصق كفيه، وهما مبلولتان بالأذنين استظهارا.

(7 وتخليل اللحية الكثة) بمثلثة من الرجل؛ أما لحية الرجل الخفيفة ولحية المرأة والخنثى فيجب تخليلهما.

وكيفيته أن يدخل الرجل أصابعه من أسفل اللحية.

(8 وتخليل أصابع اليدين والرجلين) إن وصل الماء إليها من غير تخليل؛ فإن لم يصل إلا به - كالأصابع الملتفة - وجب تخليلها؛ وإن لم يتأت تخليلها لالتحامها حرم فتقها للتخليل. وكيفية تخليل اليدين بالتشبيك، والرجلين بأن يبدأ بخنصر يده اليسرى من أسفل الرجل مبتدئا بخنصر الرجل اليمنى خاتما بخنصر اليسرى.

(9 وتقديم اليمنى) من يديه ورجليه (على اليسرى) منهما. أما العضوان اللذان يسهل غسلهما معا كالخدين فلا يقدم الأيمن منهما، بل يطهران دفعة واحدة.

وذكر المصنف سنية تثليث العضو المغسول والممسوح في قوله: (10 والطهارة ثلاثا ثلاثا). وفي بعض النسخ «والتكرار» أي للمغسول والممسوح، ms007 (والموالاة). ويعبر عنها بالتتابع؛ وهي أن لا يحصل بين العضوين

تفريق كثير، بل يطهر العضو بعد العضو، بحيث لا يجف المغسول قبله مع اعتدال الهواء والمزاج والزمان.

وإذا ثلث فالاعتبار لآخر غسلة. وإنما تندب الموالاة في غير وضوء صاحب الضرورة؛ أما هو فالموالاة واجبة في حقه. وبقي للوضوء سنن أخرى مذكورة في المطولات.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, '• الاستنجاء', '{فصل} في الاستنجاء وآداب قاضي الحاجة. (والاستنجاء) - وهو «من نجوت الشيء»، أي قطعته، فكأن المستنجي يقطع به الأذى عن نفسه - (واجب من) خروج (البول والغائط) بالماء أو الحجر وما في معناه من كل جامد طاهر قالع غير محترم، (و) لكن (الأفضل أن يستنجي) أولا (بالأحجار ثم يتبعها) ثانيا (بالماء). والواجب ثلاث مسحات ولو بثلاثة أطراف حجر واحد.

(ويجوز أن يقتصر) المستنجي (على الماء أو على ثلاثة أحجار ينقي بهن المحل) إن

حصل الإنقاء بها، وإلا زاد عليها حتى ينقى. ويسن بعد ذلك التثليث.

(فإذا أراد الاقتصار على أحدهما، فالماء أفضل) لأنه يزيل عين النجاسة وأثرها. وشرط أجزاء الاستنجاء بالحجر أن لا يجف الخارج النجس، ولا ينتقل عن محل خروجه، ولا يطرأ عليه نجس آخر أجنبي عنه؛ فإن انتفى شرط من ذلك تعين الماء.

(ويجتنب) وجوبا قاضي الحاجة (استقبال القبلة) الآن وهي الكعبة، (واستدبارها في الصحراء)؛ إن لم يكن بينه وبين القبلة ساتر، أو كان ولم يبلغ ثلثي ذراع، أو بلغهما وبعد عنه أكثر من ثلاثة أذرع بذراع الآدمي - كما قاله بعضهم. والبنيان في هذا كالصحراء بالشرط المذكور إلا البناء المعد لقضاء الحاجة، فلا حرمة فيه مطلقا. وخرج بقولنا: «الآن» ما كان قبلة أولا كبيت المقدس؛ فاستقباله واستدباره مكروه.

(ويجتنب) أدبا قاضي الحاجة (البول والغائط في الماء الراكد)؛ أما الجاري فيكره في القليل منه دون الكثير، لكن الأولى اجتنابه. وبحث النووي تحريمه في القليل جاريا كان أو راكدا.

(و) يجتنب أيضا البول والغائط (تحت الشجرة المثمرة) وقت الثمر وغيره؛ (و) يجتنب ما ذكر (في الطريق) المسلوك للناس (و) في موضع (الظل) صيفا، وفي موضع الشمس شتاء، (و) ms008 في (الثقب) في الأرض، وهو النازل المستدير. ولفظ الثقب ساقط في بعض نسخ المتن.

(ولا يتكلم) أدبا لغير ضرورة قاضي الحاجة (على البول والغائط)؛ فإن دعت ضرورة إلى الكلام، كمن رأى حية تقصد إنسانا لم يكره الكلام حينئذ.

(ولا يستقبل الشمس والقمر ولا يستدبرهما) أي يكره له ذلك حال قضاء حاجته، لكن النووي في الروضة وشرح المهذب قال: إن استدبارهما ليس بمكروه؛ وقال في شرح الوسيط: إن ترك استقبالهما واستدبارهما سواء، أي فيكون مباحا. وقال في التحقيق: إن كراهة استقبالهما لا أصل لها.

وقوله: «ولا يستقبل» إلخ ساقط في بعض نسخ المتن.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, '• نواقض الوضوء', '{فصل} في نواقض الوضوء، المسماة أيضا بأسباب الحدث. (والذي ينقض) أي يبطل (الوضوء ستة أشياء): أحدها (ما خرج من) أحد (السبيلين)،

أي القبل والدبر، من متوضئ حي واضح، معتادا كان الخارج كبول وغائط أو نادرا كدم وحصا، نجسا كهذه الأمثلة أو طاهرا كدود، إلا المني الخارج باحتلام من متوضئ ممكن مقعده من الأرض فلا ينقض؛ والمشكل إنما ينتقض وضوؤه بالخارج من فرجيه جميعا.

(و) الثاني (النوم على غير هيئة المتمكن) - وفي بعض نسخ المتن زيادة «من الأرض» - بمقعده. والأرض ليست بقيد. وخرج ب «المتمكن» ما لو نام قاعدا غير متمكن أو نام قائما أو على قفاه ولو متمكنا.

(و) الثالث (زوال العقل) أي الغلبة عليه (بسكر أو مرض) أو جنون أو إغماء أو غير ذلك.

(و) الرابع (لمس الرجل المرأة الأجنبية) غير المحرم ولو ميتة. والمراد

بالرجل والمرأة ذكر وأنثى بلغا حد الشهوة عرفا؛ والمراد بالمحرم من حرم نكاحها لأجل نسب أو رضاع أو مصاهرة. وقوله: (من غير حائل) يخرج ما لو كان هناك حائل فلا نقض حينئذ.

(و) الخامس، وهو آخر النواقض (مس فرج الآدمي بباطن الكف) من نفسه وغيره، ذكرا أو أنثى، صغيرا أو كبيرا، حيا أو ميتا. ولفظ الآدمي ساقط في بعض نسخ المتن، وكذا قوله: (ومس حلقة دبره) أي الآدمي ينقض (على) القول (الجديد). وعلى القديم لا ينقض مس الحلقة. والمراد بها ms009 ملتقى المنفذ؛ وبباطن الكف الراحة مع بطون الأصابع. وخرج بباطن الكف ظاهره وحرفه ورؤوس الأصابع وما بينها، فلا نقض بذلك أي بعد التحامل اليسير.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 11, NULL, '• موجبات الغسل', '{فصل} في موجب الغسل. والغسل لغة سيلان الماء على الشيء مطلقا، وشرعا سيلانه على جميع البدن بنية مخصوصة.

(والذي يوجب الغسل ستة أشياء؛ ثلاثة) منها (تشترك فيها الرجال والنساء؛ وهي: التقاء الختانين). ويعبر عن هذا الالتقاء بإيلاج حي واضح غيب حشفة الذكر منه أو قدرها من مقطوعها في فرج؛ ويصير الآدمي المولج فيه جنبا بإيلاج ما ذكر؛ أما الميت فلا يعاد غسله بإيلاج فيه. وأما الخنثى المشكل فلا غسل عليه بإيلاج حشفته، ولا بإيلاج في قبله.

(و) من المشترك (إنزال) أي خروج (المني) من شخص بغير إيلاج، وإن قل المني كقطرة، ولو كانت على لون الدم، ولو كان الخارج بجماع أو غيره، في يقظة أو نوم، بشهوة أو غيرها، من طريقه المعتاد أو غيره، كأن انكسر صلبه فخرج منيه. (و) من المشترك (الموت) إلا في الشهيد.

(وثلاثة تختص بها النساء؛ وهي: الحيض)، أي الدم الخارج من امرأة بلغت تسع سنين، (والنفاس) وهو الدم الخارج عقب الولادة؛ فإنه موجب للغسل قطعا، (والولادة) المصحوبة بالبلل موجبة للغسل قطعا. والمجردة عن البلل موجبة في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 12, NULL, '• فرائض الغسل', '{فصل} (وفرائض الغسل ثلاثة أشياء): أحدها (النية)، فينوي الجنب رفع الجنابة أو الحدث الأكبر ونحو ذلك، وتنوي الحائض والنفساء رفع حدث

الحيض أو النفاس. وتكون النية مقرونة بأول الفرض، وهو أول ما يغسل من أعلى البدن أو أسفله؛ فلو نوى بعد غسل جزء وجبت إعادته.

(وإزالة النجاسة إن كانت على بدنه) أي المغتسل. وهذا ما رجحه الرافعي؛ وعليه فلا يكفي غسلة واحدة عن الحدث والنجاسة.

ورجح النووي الاكتفاء بغسلة واحدة عنهما. ومحله ما إذا كانت النجاسة حكمية؛ أما إذا كانت النجاسة عينية وجب غسلتان عنهما.

(وإيصال الماء إلى جميع الشعر والبشرة). وفي بعض النسخ بدل جميع «أصول»؛ ولا فرق بين شعر الرأس وغيره، ولا بين الخفيف منه والكثيف. والشعر المضفور ms010 إن لم يصل الماء إلى باطنه إلا بالنقض وجب نقضه. والمراد بالبشرة ظاهر الجلد؛ ويجب غسل ما ظهر من صماخي أذنيه، ومن أنف مجدع، ومن شقوق بدن؛ ويجب إيصال الماء إلى ما تحت القلفة من الأقلف، وإلى ما يبدو من فرج المرأة عند قعودها لقضاء حاجتها. ومما يجب غسله المسربة، لأنها تظهر في وقت قضاء الحاجة؛ فتصير من ظاهر البدن.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 13, NULL, '• سنن الغسل', '(وسننه) أي الغسل (خمسة أشياء: التسمية والوضوء) كاملا (قبله)، وينوي به المغتسل سنة الغسل إن تجردت جنابته عن الحدث الأصغر، وإلا نوى به الأصغر؛

(وإمرار اليد على) ما وصلت إليه من (الجسد)؛ ويعبر عن هذا الإمرار بالدلك؛ (والموالاة) وسبق معناها في الوضوء؛ (وتقديم اليمنى) من شقيه (على اليسرى). وبقي من سنن الغسل أمور مذكورة في المبسوطات. منها التثليث وتخليل الشعر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 14, NULL, '• الاغتسالات المسنونة', '{فصل} (والاغتسالات المسنونة سبعة عشر غسلا: غسل الجمعة) لحاضرها. ووقته من الفجر الصادق، (و) غسل (العيدين) الفطر والأضحى. ويدخل وقت هذا الغسل بنصف الليل، (والاستسقاء) أي طلب السقيا من الله تعالى،

(والخسوف) للقمر، (والكسوف) للشمس، (والغسل من غسل الميت) مسلما كان أو كافرا، (و) غسل (الكافر إذا أسلم) إن لم يجنب في كفره أو لم تحض الكافرة، وإلا وجب الغسل بعد الإسلام في الأصح. وقيل يسقط إذا أسلم، (والمجنون والمغمى عليه إذا أفاقا)، ولم يتحقق منهما إنزال؛ فإن تحقق منهما إنزال وجب الغسل على كل منهما (والغسل عند) إرادة (الإحرام)، ولا فرق في هذا الغسل بين بالغ وغيره، ولا بين مجنون وعاقل، ولا بين طاهر وحائض؛ فإن لم يجد المحرم الماء تيمم، (و) الغسل (لدخول مكة) لمحرم بحج أو عمرة، (وللوقوف بعرفة) في تاسع ذي الحجة، (وللمبيت بمزدلفة،

ولرمي الجمار الثلاث) في أيام التشريق الثلاثة؛ فيغتسل لرمي كل يوم منها غسلا. أما رمي جمرة العقبة في يوم النحر فلا يغتسل له لقرب زمنه من غسل الوقوف، (و) الغسل (للطواف) الصادق بطواف قدوم وإفاضة ووداع. وبقية الأغسال المسنونة مذكورة في المطولات.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 15, NULL, '• المسح على الخفين', '{فصل} (والمسح على ms011 الخفين جائز) في الوضوء، لا في غسل فرض أو نفل، ولا في إزالة نجاسة؛ فلو أجنب ودميت رجله فأراد المسح بدلا عن غسل الرجل لم يجز، بل لا بد من الغسل.

وأشعر قوله «جائز» أن غسل الرجلين أفضل من المسح. وإنما يجوز مسح الخفين، لا أحدهما

فقط إلا أن يكون فاقد الأخرى.

(بثلاثة شرائط: أن يبتدئ) أي الشخص (لبسهما بعد كمال الطهارة)؛ فلو غسل رجلا وألبسها خفها ثم فعل بالأخرى كذلك لم يكف. ولو ابتدأ لبسهما بعد كمال الطهارة ثم أحدث قبل وصول الرجل قدم الخف لم يجز المسح.

(وأن يكونا) أي الخفان (ساترين لمحل غسل الفرض من القدمين) بكعبيهما؛ فلو كانا دون الكعبين كالمداس لم يكف المسح عليهما. والمراد بالساتر هنا الحائل، لا مانع الرؤية، وأن يكون الستر من أسفل ومن جوانب الخفين، لا من أعلاهما؛ (وأن يكونا مما يمكن تتابع المشي عليهما) لتردد مسافر في حوائجه من حط وترحال.

ويؤخذ من كلام المصنف كونهما قويين بحيث يمنعان نفوذ الماء. ويشترط أيضا طهارتهما؛ ولو لبس خفا فوق خف لشدة البرد مثلا؛ فإن كان الأعلى صالحا للمسح دون الأسفل صح المسح على الأعلى؛ وإن كان الأسفل صالحا للمسح دون الأعلى فمسح الأسفل صح أو الأعلى فوصل البلل للأسفل صح إن قصد الأسفل أو قصدهما معا، لا إن

قصد الأعلى فقط؛ وإن لم يقصد واحدا منهما، بل قصد المسح في الجملة أجزأ في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 16, NULL, '• مدة المسح', '(ويمسح المقيم يوما وليلة، و) يمسح (المسافر ثلاثة أيام بلياليهن) المتصلة بها، سواء تقدمت أو تأخرت.

(وابتداء المدة) تحسب (من حين يحدث) أي من انقضاء الحدث الكائن (بعد) تمام (لبس الخفين)، لا من ابتداء الحدث، ولا من وقت المسح، ولا من ابتداء اللبس. والعاصي بالسفر والهائم يمسحان مسح مقيم.

ودائم الحدث إذا أحدث بعد لبس الخف حدثا آخر مع حدثه الدائم قبل أن يصلي به فرضا يمسح ويستبيح ما كان يستبيحه. لو بقي طهره الذي لبس عليه خفيه، وهو فرض ونوافل؛ فلو صلى بطهره فرضا ms012 قبل أن يحدث مسح واستباح النوافل فقط.

(فإن مسح) الشخص (في الحضر ثم سافر أو مسح في السفر ثم أقام) قبل مضي يوم وليلة (أتم مسح مقيم).

والواجب في مسح الخف ما يطلق عليه اسم المسح إذا كان على ظاهر الخف. ولا يجزئ المسح على باطنه، ولا على عقب الخف،

ولا على حرفه، ولا على أسفله. والسنة في مسحه أن يكون خطوطا، بأن يفرج الماسح بين أصابعه ولا يضمها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 17, NULL, '• مبطلات المسح', '(ويبطل المسح) على الخفين (بثلاثة أشياء: بخلعهما) أو خلع أحدهما أو انخلاعه أو خروج الخف عن صلاحية المسح كتخرقه، (وانقضاء المدة)؛

وفي بعض النسخ «مدة المسح» من يوم وليلة لمقيم، وثلاثة أيام بليالها لمسافر، (و) بعروض (ما يوجب الغسل)، كجنابة أو حيض أو نفاس للابس الخف.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 18, NULL, '• شروط التيمم', '{فصل} في التيمم. وفي بعض نسخ المتن تقديم هذا الفصل على الذي قبله.

والتيمم لغة القصد، وشرعا إيصال تراب طهور للوجه واليدين بدلا عن وضوء أو غسل أو غسل عضو بشرائط مخصوصة.

(وشرائط التيمم خمسة أشياء): وفي بعض نسخ المتن «خمس خصال»: أحدها (وجود العذر بسفر أو مرض، و) الثاني (دخول وقت الصلاة)؛ فلا يصح التيمم لها قبل دخول وقتها. (و) الثالث (طلب الماء) بعد دخول الوقت، بنفسه أو بمن أذن له في طلبه؛ فيطلب الماء من رحله ورفقته، فإن كان منفردا نظر حواليه من الجهات الأربع إن كان بمستو من الأرض؛ فإن كان فيها ارتفاع وانخفاض تردد قدر نظره. (و) الرابع (تعذر استعماله) أي الماء، بأن يخاف من استعمال الماء على ذهاب نفس أو منفعة عضو.

ويدخل في العذر ما لو كان بقربه ماء وخاف لو قصده على نفسه من سبع أو عدو، أو على ماله من سارق أو غاصب.

ويوجد في بعض نسخ المتن في هذا الشرط زيادة بعد تعذر استعماله، وهي (وإعوازه بعد الطلب، و) الخامس (التراب الطاهر) أي الطهور غير المندي. ويصدق الطاهر بالمغصوب وتراب مقبرة لم تنبش. ويوجد في بعض نسخ المتن زيادة في هذا الشرط، ms013 وهي (الذي له غبار. فإن خالطه جص أو رمل لم يجز). وهذا موافق لما قاله النووي في شرح المهذب والتصحيح، لكنه في الروضة والفتاوى جوز ذلك، ويصح

التيمم أيضا برمل فيه غبار. وخرج بقول المصنف «التراب» غيره، كنورة وسحاقة خزف. وخرج ب «الطاهر» النجس. وأما التراب المستعمل فلا يصح التيمم به.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 19, NULL, '• فرائض التيمم', '(وفرائضه أربعة أشياء): أحدها (النية)، وفي بعض نسخ المتن «أربع خصال: نية الفرض»؛ فإن نوى المتيمم الفرض والنفل استباحهما أو الفرض فقط

استباح معه النفل وصلاة الجنازة أيضا، أوالنفل فقط لم يستبح معه الفرض؛ وكذا لو نوى الصلاة. ويجب قرن نية التيمم بنقل التراب للوجه واليدين، واستدامة هذه النية إلى مسح شيء من الوجه. ولو أحدث بعد نقل التراب لم يمسح بذلك التراب بل ينقل غيره.

(و) الثاني والثالث (مسح الوجه، ومسح اليدين مع المرفقين) وفي بعض نسخ المتن «إلى المرفقين»؛ ويكون مسحهما بضربتين. ولو وضع يده على تراب ناعم فعلق بها تراب من غير ضرب كفى.

(و) الرابع (الترتيب) فيجب تقديم مسح الوجه على مسح اليدين، سواء تيمم عن حدث أصغر أو أكبر؛ ولو ترك الترتيب لم يصح. وأما أخذ التراب للوجه واليدين فلا يشترط فيه ترتيب. فلو ضرب بيديه دفعة على تراب ومسح بيمينه وجهه وبيساره يمينه جاز.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 20, NULL, '• سنن التيمم', '(وسننه) أي التيمم (ثلاثة أشياء) وفي بعض نسخ المتن «ثلاث خصال»: (التسمية، وتقديم اليمنى) من اليدين (على اليسرى) منهما، وتقديم أعلى الوجه على أسفله

(والموالاة) وسبق معناها في الوضوء، وبقي للتيمم سنن أخرى

مذكورة في المطولات، منها: نزع المتيمم خاتمه في الضربة الأولى، أما الثانية فيجب نزع الخاتم فيها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 21, NULL, '• مبطلات التيمم', '(والذي يبطل التيمم ثلاثة أشياء): أحدها كل (ما أبطل الوضوء)، وسبق بيانه في أسباب الحدث؛ فمتى كان متيمما ثم أحدث بطل تيممه.

(و) الثاني (رؤية الماء) وفي بعض النسخ «وجود الماء» (في غير وقت الصلاة)؛ فمن تيمم لفقد الماء ثم رأى الماء أو توهمه قبل دخوله في الصلاة بطل تيممه؛ فإن رآه بعد دخول ms014 فيها وكانت الصلاة مما لا يسقط فرضها بالتيمم كصلاة مقيم بطلت في الحال، أو مما يسقط فرضها بالتيمم كصلاة مسافر فلا تبطل، فرضا كانت الصلاة أو نفلا؛ وإن كان تيمم الشخص لمرض ونحوه ثم رأى الماء فلا أثر لرؤيته، بل تيممه باق بحاله. (و) الثالث (الردة) وهي قطع الإسلام.

وإذا امتنع شرعا استعمال الماء في عضو، فإن لم يكن عليه ساتر

وجب عليه التيمم وغسل الصحيح، ولا ترتيب بينهما للجنب. أما المحدث فإنما يتيمم وقت دخول غسل العضو العليل؛ فإن كان على العضو ساتر فحكمه مذكور في قول المصنف:', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 22, NULL, '• المسح على الجبيرة', '(وصاحب الجبائر) - جمع جبيرة بفتح الجيم، وهي أخشاب أو قصب تسوى وتشد على موضع الكسر ليلتحم - (يمسح عليها) بالماء إن لم يمكنه نزعها لخوف ضرر مما سبق، (ويتيمم) صاحب الجبائر في وجهه ويديه كما

سبق (ويصلي ولا إعادة عليه إن كان وضعها) أي الجبائر (على طهر) وكانت في غير أعضاء التيمم، وإلا أعاد. وهذا ما قاله النووي في الروضة، لكنه قال في المجموع: إن إطلاق الجمهور يقتضي عدم الفرق، أي بين أعضاء التيمم وغيرها.

ويشترط في الجبيرة أن لا تأخذ من الصحيح إلا ما لا بد منه للاستمساك واللصوق والعصابة والمرهم ونحوها على الجرح كالجبيرة.

(ويتيمم لكل فريضة) ومنذورة؛ فلا يجمع بين صلاتي فرض بتيمم واحد، ولا بين طوافين ولا بين صلاة وطواف، ولا بين جمعة وخطبتيها.

وللمرأة إذا تيممت لتمكين الحليل أن تفعله مرارا، وتجمع بينه وبين الصلاة بذلك التيمم. وقوله: (ويصلي بتيمم واحد ما شاء من النوافل) ساقط من بعض نسخ المتن.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 23, NULL, '• بيان النجاسات وإزالتها', '{فصل} في بيان النجاسات وإزالتها. وهذا الفصل مذكور في بعض النسخ قبيل كتاب الصلاة. والنجاسة لغة الشيء المستقذر، وشرعا كل عين حرم تناولها على الإطلاق حالة الاختيار مع سهولة التمييز، لا لحرمتها ولا لاستقذارها ولا لضررها في بدن أو عقل. ودخل في الإطلاق قليل النجاسة وكثيرها. وخرج ب «الاختيار» الضرورة؛ فإنها تبيح تناول النجاسة، وب «سهولة التمييز» أكل الدود الميت في ms015 جبن أو فاكهة ونحو ذلك. وخرج

بقوله: «لا لحرمتها» ميتة الأدمي، وب «عدم الاستقذار» المني ونحوه، وب «نفي الضرر» الحجر والنبات المضر ببدن أو عقل.

ثم ذكر المصنف ضابطا للنجس الخارج من القبل والدبر بقوله: (وكل مائع خرج من السبيلين نجس) هو صادق بالخارج المعتاد كالبول والغائط، وبالنادر كالدم والقيح، (إلا المني) من آدمي أو حيوان غير كلب وخنزير وما تولد منهما أو من أحدهما مع حيوان طاهر. وخرج ب «مائع» الدود وكل متصلب لا تحيله المعدة فليس بنجس، بل متنجس يطهر بالغسل. وفي بعض النسخ «وكل ما يخرج»، بلفظ المضارع وإسقاط مائع.

(وغسل جميع الأبوال والأرواث) ولو كان من مأكول اللحم (واجب). وكيفية غسل النجاسة إن كانت مشاهدة بالعين، وهي المسماة بالعينية تكون بزوال عينها ومحاولة زوال أوصافها من طعم أو لون أو ريح؛ فإن بقي طعم النجاسة ضر، أو لون أو ريح عسر زواله لم يضر.

وإن كانت النجاسة غير مشاهدة وهي المسماة بالحكمية فيكفي جري الماء على المتنجس بها ولو مرة واحدة.

ثم استثنى المصنف من الأبوال قوله: (إلا بول الصبي الذي لم يأكل الطعام)، أي لم يتناول مأكولا ولا مشروبا على جهة التغذى، (فإنه) أي البول (يطهر برش الماء عليه). ولا يشترط في الرش سيلان الماء. فإن أكل الصبي الطعام على جهة التغذى غسل بوله قطعا. وخرج ب «الصبي» الصبية والخنثى، فيغسل من بولهما.

ويشترط في غسل المتنجس ورود الماء عليه إن كان قليلا، فإن عكس لم يطهر. أما الماء الكثير فلا فرق بين كون المتنجس واردا أو مورودا.

(ولا يعفى عن شيء من النجاسات إلا اليسير من الدم والقيح)؛ فيعفى عنهما في ثوب أو بدن، وتصح الصلاة معهما، (و) إلا (ما) شيء (لا نفس له سائلة) كذباب ونمل (إذا وقع في الإناء ومات فيه، فإنه لا ينجسه).

وفي بعض النسخ «إذا مات في الإناء». وأفهم قوله «وقع» أي بنفسه، أنه لو طرح ما لا نفس له سائلة في المائع ضر، وهو ما جزم به الرافعي ms016 في الشرح الصغير، ولم يتعرض لهذه المسألة في الكبير.

وإذا كثرت ميتة ما لا نفس له سائلة وغيرت ما وقعت فيه نجسته؛ وإذا نشأت هذه الميتة من المائع كدود خل وفاكهة لم تنجسه قطعا. ويستثنى مع ما ذكر هنا مسائل مذكورة في المبسوطات سبق بعضها في كتاب الطهارة.

(والحيوان كله طاهر إلا الكلب والخنزير وما تولد منهما أو من أحدهما)، أي مع حيوان طاهر. وعبارته تصدق بطهارة الدود المتولد من النجاسة، وهو كذلك.

(والميتة كلها نجسة إلا السمك والجراد والآدمي). وفي بعض النسخ «ابن آدم» أي ميتة كل منها، فإنها طاهرة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 24, NULL, '• تطهير الإناء', '(ويغسل الإناء من ولوغ الكلب والخنزير سبع مرات) بماء طهور، (إحداهن) مصحوبة (بالتراب) الطهور يعم المحل المتنجس؛ فإن كان المتنجس بما ذكر في ماء جار كدر كفى مرور سبع جريات عليه بلا تعفير. وإذا لم تزل عين النجاسة الكلبية إلا بست غسلات مثلا حسبت كلها غسلة واحدة. والأرض الترابية لا يجب التراب فيها على الأصح.

(ويغسل من سائر) أي باقي (النجاسات مرة واحدة) وفي بعض النسخ «مرة» (تأتي عليه؛ والثلاث) وفي بعض النسخ «والثلاثة» بالتاء (أفضل).

واعلم أن غسالة النجاسة بعد طهارة المحل المغسول طاهرة إن انفصلت غير متغيرة ولم يزد وزنها بعد انفصالها عما كان بعد اعتبار مقدار ما يتشربه المغسول من الماء. هذا إن لم يبلغ قلتين؛ فإن بلغهما فالشرط عدم التغير.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 25, NULL, '• تخلل الخمر', 'ولما فرغ المصنف مما يطهر بالغسل شرع فيما يطهر بالاستحالة، وهي انقلاب الشيء من صفة إلى صفة أخرى؛ فقال: (وإذا تخللت

الخمرة)؛ وهي المتخذة من ماء العنب، محترمة كانت الخمرة أم لا. ومعنى تخللت صارت خلا، وكانت صيرورتها خلا (بنفسها طهرت). وكذا لو تخللت بنقلها من شمس إلى ظل وعكسه، (وإن) لم تتخلل الخمرة بنفسها بل (تخللت بطرح شيء فيها لم تطهر). وإذا طهرت الحمرة طهر دنها تبعا لها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 26, NULL, '• الحيض والنفاس والاستحاضة', '{فصل} في بيان أحكام الحيض والنفاس والاستحاضة. (ويخرج من الفرج ثلاثة دماء: دم الحيض، والنفاس، والاستحاضة؛ فالحيض هو) الدم ms017 (الخارج) في سن الحيض، وهو تسع سنين فأكثر (من فرج المرأة على سبيل الصحة)، أي لا لعلة، بل للجبلة (من غير سبب الولادة).

وقوله: (ولونه أسود محتدم لذاع) ليس في أكثر نسخ المتن. وفي الصحاح: احتدم الدم اشتدت حمرته حتى اسود. ولذعته النار حتى أحرقته.

(والنفاس هو) الدم (الخارج عقب الولادة)؛ فالخارج مع الولد أو قبله لا يسمى نفاسا. وزيادة الياء في «عقيب» لغة قليلة؛ والأكثر حذفها.

(والاستحاضة) أي دمها (هو الدم الخارج في غير أيام الحيض والنفاس)، لا على سبيل الصحة.

(وأقل الحيض) زمنا (يوم وليلة)، أي مقدار ذلك، وهو أربعة وعشرون ساعة على الاتصال المعتاد في الحيض. (وأكثره خمسة عشر يوما) بليالها، فإن زاد عليها فهو استحاضة. (وغالبه ست أو سبع). والمعتمد في ذلك الاستقراء.

(وأقل النفاس لحظة)، وأريد بها زمن يسير. وابتداء النفاس من انفصال الولد. (وأكثره ستون يوما، وغالبه أربعون يوما). والمعتمد في ذلك الاستقراء أيضا.

(وأقل الطهر) الفاصل (بين الحيضتين خمسة عشر يوما). واحترز المصنف بقوله: «بين الحيضتين» عن الفاصل بين حيض ونفاس؛ إذا قلنا بالأصح إن الحامل تحيض، فإنه يجوز أن يكون دون خمسة عشر يوما. (ولا حد لأكثره) أي الطهر. فقد تمكث المرأة دهرها بلا حيض. أما غالب الطهر فيعتبر بغالب الحيض؛ فإن كان الحيض ستا فالطهر أربع وعشرون يوما، أو كان الحيض سبعا فالطهر ثلاثة وعشرون يوما.

(وأقل زمن تحيض فيه المرأة)؛ وفي بعض النسخ «الجارية» (تسع

سنين) قمرية؛ فلو رأته قبل تمام التسع بزمن يضيق عن حيض وطهر فهو حيض، وإلا فلا.

(وأقل الحمل) زمنا (ستة أشهر) ولحظتان، (وأكثره) زمنا (أربع سنين، وغالبه) زمنا (تسعة أشهر). والمعتمد في ذلك الوجود.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 27, NULL, '• ما يحرم بالحيض والنفاس', '(ويحرم بالحيض والنفاس) وفي بعض النسخ «ويحرم على الحيض» (ثمانية أشياء)، أحدها: (الصلاة)، فرضا أو نفلا؛ وكذا سجدة التلاوة والشكر. (و) الثاني (الصوم)، فرضا أو نفلا؛ (و) الثالث (قراءة القرآن، و) الرابع (مس المصحف) وهو اسم للمكتوب من كلام الله تعالى بين الدفتين (وحمله) إلا إذا خافت ms018 عليه؛

(و) الخامس (دخول المسجد) للحائض إن خافت تلويثه؛ (و) السادس (الطواف) فرضا أو نفلا؛ (و) السابع (الوطء). ويسن لمن وطئ في إقبال الدم التصدق بدينار، ولمن وطئ في إدباره التصدق بنصف دينار. (و) الثامن (الاستمتاع بما بين السرة والركبة) من المرأة؛ فلا يحرم الاستمتاع بهما، ولا بما فوقهما على المختار في شرح المهذب.

ثم استطرد المصنف لذكر ما حقه أن يذكر فيما سبق في فصل موجب الغسل، فقال:', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 28, NULL, '• ما يحرم على الجنب', '(ويحرم على الجنب خمسة أشياء): أحدها (الصلاة)، فرضا أو نفلا. (و) الثاني (قراءة القرآن) أي غير منسوخ التلاوة، آية كان أو حرفا، سرا أو جهرا. وخرج بالقرآن التوراة والإنجيل. أما أذكار القرآن فتحل لا بقصد قرآن.

(و) الثالث (مس المصحف وحمله) من باب أولى. (و) الرابع (الطواف) فرضا أو نفلا. (و) الخامس (اللبث في المسجد) لجنب مسلم، إلا لضرورة كمن احتلم في

المسجد وتعذر عليه خروجه منه لخوف على نفسه أو ماله. أما عبور المسجد مارا به من غير مكث فلا يحرم، بل ولا يكره في الأصح. وتردد الجنب في المسجد بمنزلة اللبث. وخرج بالمسجد المدارس والربط. ثم استطرد المصنف أيضا من أحكام الحدث الأكبر إلى أحكام الحدث الأصغر، فقال:', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 29, NULL, '• ما يحرم على المحدث', '(ويحرم على المحدث) حدثا أصغر (ثلاثة أشياء: الصلاة، والطواف، ومس المصحف وحمله)، وكذا خريطة وصندوق فيهما مصحف. ويحل حمله في أمتعة وفي تفسير أكثر من القرآن، وفي دنانير ودراهم وخواتم نقش على كل منها قرآن. ولا يمنع المميز المحدث من مس مصحف ولوح لدراسة وتعلم قرآن.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 103, 'كتاب أحكام الصلاة', 'كتاب أحكام الصلاة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وهي لغة الدعاء، وشرعا - كما قال الرافعي: أقوال وأفعال مفتتحة بالتكبير، مختتمة بالتسليم بشرائط مخصوصة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• الصلوات المفروضات', '(الصلاة المفروضة) وفي بعض النسخ «الصلوات المفروضات» (خمس) يجب كل منها بأول الوقت وجوبا موسعا إلى أن يبقى من الوقت ما يسعها، فضيق حينئذ:

(الظهر) أي صلاته. قال النووي: سميت بذلك لأنها ظاهرة وسط النهار. (وأول وقتها زوال) أي ميل (الشمس) عن وسط السماء، لا بالنظر لنفس ms019 الأمر بل لما يظهر لنا. ويعرف ذلك الميل بتحول الظل إلى جهة المشرق بعد تناهي قصره الذي هو غاية ارتفاع الشمس؛ (وآخره) أي وقت الظهر (إذا صار ظل كل شيء مثله

بعد) أي غير (ظل الزوال). والظل لغة الستر، تقول: أنا في ظل فلان، أي ستره. وليس الظل عدم الشمس، كما قد يتوهم، بل هو أمر وجودي يخلقه الله تعالى لنفع البدن وغيره.

(والعصر) أي صلاتها، وسميت بذلك لمعاصرتها وقت الغروب. (وأول وقتها الزيادة على ظل المثل). وللعصر خمسة أوقات، أحدها وقت الفضيلة، وهو فعلها أول الوقت؛ والثاني وقت الاختيار، وأشار له بقوله: (وآخره في الاختيار إلى ظل المثلين)، والثالث وقت الجواز، وأشار له بقوله: (وفي الجواز إلى غروب الشمس)؛ والرابع وقت جواز بلا كراهة، وهو من مصير الظل مثلين إلى الاصفرار؛ والخامس وقت تحريم، وهو تأخيرها إلى أن يبقى من الوقت ما لا يسعها.

(والمغرب) أي صلاتها، وسميت بذلك لفعلها وقت الغروب. (ووقتها واحد، وهو غروب الشمس) أي بجميع قرصها. ولا يضر بقاء شعاع بعده. (وبمقدار ما يؤذن) الشخص (ويتوضأ) أو يتيمم (ويستر العورة،

ويقيم الصلاة ويصلي خمس ركعات). وقوله: «وبمقدار» إلخ، ساقط في بعض نسخ المتن. فإن انقضى المقدار المذكور خرج وقتها. وهذا هو القول الجديد والقديم. ورجحه النووي أن وقتها يمتد إلى مغيب الشفق الأحمر.

(والعشاء) بكسر العين ممدودا اسم لأول الظلام، وسميت بذلك لفعلها فيه. (وأول وقتها إذا غاب الشفق الأحمر). وأما البلد الذي لا يغيب فيه الشفق فوقت العشاء في حق أهله أن يمضي بعد الغروب زمن يغيب فيه شفق أقرب البلاد إليهم. ولها وقتان: أحدهما اختيار، وأشار له المصنف بقوله: (وآخره) يمتد (في الاختيار إلى ثلث الليل)؛ والثاني جواز، وأشار له بقوله: (وفي الجواز إلى طلوع الفجر الثاني) أي الصادق، وهو المنتشر ضوؤه معترضا بالأفق. وأما الفجر الكاذب فيطلع قبل ذلك لا معترضا، بل مستطيلا ذاهبا في السماء، ثم يزول وتعقبه ظلمة، ولا يتعلق به حكم. وذكر الشيخ أبو حامد - الغزالي - أن للعشاء وقت ms020 كراهة، وهو ما بين الفجرين.

(والصبح) أي صلاته، وهو لغة أول النهار، وسميت الصلاة بذلك لفعلها في أوله. ولها - كالعصر - خمسة أوقات: أحدها وقت الفضيلة، وهو أول الوقت؛ والثاني وقت الاختيار، وذكره المصنف في قوله: (وأول وقتها طلوع الفجر الثاني، وآخره في الاختيار إلى الإسفار)، وهو الإضاءة؛ والثالث وقت الجواز، وأشار له المصنف بقوله: (وفي الجواز) أي بكراهة (إلى طلوع الشمس)؛ والرابع جواز بلا كراهة إلى طلوع الحمرة؛ والخامس وقت تحريم، وهو تأخيرها إلى أن يبقى من الوقت ما لا يسعها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• شروط وجوب الصلاة', '{فصل} (وشرائط وجوب الصلاة ثلاثة أشياء): أحدها (الإسلام)؛ فلا تجب الصلاة على الكافر الأصلي، ولا يجب عليه قضاؤها إذا أسلم؛ وأما المرتد فتجب عليه الصلاة وقضاءها

إن عاد إلى الإسلام. (و) الثاني (البلوغ)؛ فلا تجب على صبي وصبية، لكن يؤمران بها بعد سبع سنين إن حصل التمييز بها، وإلا فبعد التمييز، ويضربان على تركها بعد كمال عشر سنين. (و) الثالث (العقل)؛ فلا تجب على مجنون. وقوله: (وهو حد التكليف) ساقط في بعض نسخ المتن.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, '• الصلوات المسنونة والرواتب', '(والصلوات المسنونة) وفي بعض النسخ «المسنونات» (خمس: العيدان) أي صلاة عيد الفطر وعيد الأضحى، (والكسوفان) أي صلاة كسوف الشمس وخسوف القمر، (والاستسقاء) أي صلاته.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, '• السنن التابعة للفرائض', '(والسنن التابعة للفرائض) ويعبر عنها أيضا بالسنة الراتبة، وهي (سبعة عشر ركعة: ركعتا الفجر، وأربع قبل الظهر، وركعتان بعده، وأربع قبل العصر، وركعتان بعد المغرب، وثلاث بعد العشاء يوتر بواحدة منهن) الواحدة هي أقل الوتر، وأكثره إحدى عشرة ركعة. ووقته بعد صلاة العشاء وطلوع الفجر؛

فلو أوتر قبل العشاء عمدا أو سهوا لم يعتد به. والراتب المؤكد من ذلك كله عشر ركعات: ركعتان قبل الصبح وركعتان قبل الظهر وركعتان بعدها وركعتان بعد المغرب وركعتان بعد العشاء.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, '• النوافل المؤكدات', '(وثلاث نوافل مؤكدات) غير تابعة للفرائض: أحدها (صلاة الليل). والنفل المطلق في الليل أفضل من النفل المطلق في النهار، والنفل وسط الليل أفضل، ثم آخره أفضل. وهذا لمن قسم الليل أثلاثا.

(و) الثاني (صلاة ms021 الضحى) وأقلها ركعتان، وأكثرها اثنتا عشرة

ركعة، ووقتها من ارتفاع الشمس إلى زوالها - كما قال النووي في التحقيق وشرح المهذب.

(و) الثالث (صلاة التراويح) وهي عشرون ركعة بعشر تسليمات في كل ليلة من رمضان، وجملتها خمس ترويحات. وينوي الشخص في كل ركعتين منها سنة التراويح أو قيام رمضان. ولو صلى أربع ركعات منها بتسليمة واحدة لم تصح. ووقتها بين صلاة العشاء وطلوع الفجر', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, '• شروط الصلاة', '{فصل} (وشرائط الصلاة قبل الدخول فيها خمسة أشياء): والشروط جمع شرط، وهو لغة العلامة، وشرعا ما تتوقف صحة الصلاة عليه وليس جزأ منها. وخرج بهذا القيد الركن، فإنه جزء من الصلاة.

الشرط الأول (طهارة الأعضاء من الحدث) الأصغر والأكبر عند القدرة؛ أما فاقد الطهورين فصلاته صحيحة مع وجوب الإعادة عليه؛ (و) طهارة (النجس) الذي لا يعفى عنه في ثوب وبدن ومكان. وسيذكر المصنف هذا الأخير قريبا.

(و) الثاني (ستر) لون (العورة) عند القدرة ولو كان الشخص خاليا أو في ظلمة. فإن عجز عن سترها صلى عاريا، ولا يومئ بالركوع والسجود، بل يتمهما، ولا إعادة عليه. ويكون ستر العورة (بلباس طاهر). ويجب سترها أيضا في غير الصلاة عن الناس وفي الخلوة إلا لحاجة من اغتسال ونحوه. وأما سترها عن نفسه فلا يجب لكنه يكره نظره إليها.

وعورة الذكر ما بين سرته وركبته، وكذا الأمة؛ وعورة الحرة في الصلاة ما سوى وجهها وكفيها ظهرا وبطنا إلى الكوعين؛ أما عورة الحرة خارج الصلاة فجميع بدنها، وعورتها في الخلوة كالذكر.

والعورة لغة النقص، وتطلق شرعا على ما يجب ستره، وهو المراد هنا وعلى ما يحرم نظره. وذكره الأصحاب في كتاب النكاح.

(و) الثالث (الوقوف على مكان طاهر)؛ فلا تصح صلاة شخص يلاقي بعض بدنه أو لباسه نجاسة في قيام أو قعود أو ركوع أو سجود.

(و) الرابع (العلم بدخول الوقت) أو ظن دخوله بالاجتهاد؛ فلو صلى بغير ذلك لم تصح صلاته وإن صادف الوقت.

(و) الخامس (استقبال القبلة) أي الكعبة. سميت قبلة لأن المصلي يقابلها، وكعبة لارتفاعها. واستقبالها بالصدر ms022 شرط لمن قدر عليه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, '• جواز ترك استقبال القبلة', 'واستثنى المصنف من ذلك ما ذكره بقوله: (ويجوز ترك) استقبال (القبلة) في الصلاة (في حالتين: في شدة الخوف) في قتال مباح، فرضا كانت الصلاة أو نفلا؛ (وفي النافلة في السفر على الراحلة). فللمسافر سفرا مباحا ولو قصيرا التنفل صوب مقصده. وراكب الدابة لا يجب عليه وضع جبهته على سرجها مثلا، بل يومئ بركوعه وسجوده؛ ويكون سجوده أخفض من ركوعه، وأما الماشي فيتم ركوعه وسجوده، ويستقبل القبلة فيهما، ولا يمشي إلا في قيامه وتشهده.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, '• أركان الصلاة', '{فصل} في أركان الصلاة. وتقدم معنى الصلاة لغة وشرعا. (وأركان الصلاة ثمانية عشر ركنا): أحدها (النية)، وهي قصد الشيء مقترنا بفعله. ومحلها القلب؛ فإن كانت الصلاة فرضا وجب نية الفرضية، وقصد فعلها، وتعيينها من صبح أو ظهر مثلا، أو كانت الصلاة نفلا ذات وقت كراتبة، أو ذات سبب كاستسقاء وجب قصد فعلها وتعيينها، لا نية النفلية.

(و) الثاني (القيام مع القدرة) عليه؛ فإن عجز عن القيام قعد كيف شاء، وقعوده مفترشا أفضل.

(و) الثالث (تكبيرة الإحرام)، فيتعين على القادر النطق بها، بأن يقول: الله أكبر؛ فلا يصح الرحمن أكبر ونحوه، ولا يصح فيها تقديم الخبر على المبتدأ كقوله: أكبر الله. ومن عجز عن النطق بها بالعربية ترجم عنها بأي لغة شاء، ولا يعدل عنها إلى ذكر آخر. ويجب قرن النية بالتكبير. وأما النووي فاختار الاكتفاء بالمقارنة العرفية، بحيث يعد عرفا أنه مستحضر للصلاة.

(و) الرابع (قراءة الفاتحة) أو بدلها لمن لم يحفظها، فرضا كانت الصلاة أو نفلا. (وبسم الله الرحمن الرحيم آية منها) كاملة. ومن أسقط من الفاتحة حرفا أو تشديدة أو أبدل حرفا منها بحرف لم تصح قراءته ولا صلاته إن تعمد، وإلا وجب عليه إعادة القراءة، ويجب ترتيبها بأن يقرأ آياتها على نظمها المعروف، ويجب أيضا موالاتها، بأن يصل بعض كلماتها ببعض من غير فصل إلا بقدر التنفس. فإن تخلل الذكر بين موالاتها قطعها إلا أن يتعلق الذكر بمصلحة الصلاة كتأمين المأموم في أثناء فاتحته ms023 لقراءة إمامه، فإنه لا يقطع الموالاة.

ومن جهل الفاتحة أو تعذرت عليه لعدم معلم مثلا وأحسن غيرها من القرآن وجب عليه سبع آيات متوالية عوضا عن الفاتحة أو متفرقة؛ فإن عجز عن القرآن أتى بذكر بدلا عنها بحيث لا ينقص عن حروفها؛ فإن لم يحسن قرآنا ولا ذكرا وقف قدر الفاتحة. وفي بعض النسخ «وقراءة الفاتحة بعد بسم الله الرحمن الرحيم، وهي آية منها».

(و) الخامس (الركوع)، وأقل فرضه لقائم قادر على الركوع معتدل الخلقة سليم يديه وركبتيه أن ينحنى بغير انخناس قدر بلوغ راحتيه ركبتيه

لو أراد وضعهما عليهما؛ فإن لم يقدر على هذا الركوع انحنى مقدوره وأومأ بطرفه. وأكمل الركوع تسوية الراكع ظهره وعنقه بحيث يصيران كصفيحة واحدة، ونصب ساقيه وأخذ ركبتيه بيديه.

(و) السادس (الطمأنينة) وهي سكون بعد حركة (فيه) أي الركوع. والمصنف يجعل الطمأنينة في الأركان ركنا مستقلا؛ ومشى عليه النووي في التحقيق. وغير المصنف يجعلها هيئة تابعة للأركان.

(و) السابع (الرفع) من الركوع، (والاعتدال) قائما على الهيئة التي كان عليها قبل ركوعه من قيام قادر وقعود عاجز عن القيام؛ (و) الثامن (الطمأنينة فيه) أي الاعتدال.

(و) التاسع (السجود) مرتين في كل ركعة. وأقله مباشرة بعض جبهة المصلي موضع سجوده من الأرض أو غيرها. وأكمله أن يكبر لهويه للسجود بلا رفع يديه، ويضع ركبتيه ثم يديه ثم جبهته وأنفه؛ (و) العاشر (الطمأنينة فيه) أي السجود، بحيث ينال موضع سجوده ثقل رأسه. ولا يكفي إمساس رأسه موضع سجوده، بل يتحامل بحيث لو كان تحته قطن مثلا لانكبس وظهر أثره على يد لو فرضت تحته.

(و) الحادي عشر (الجلوس بين السجدتين) في كل ركعة، سواء صلى قائما أو قاعدا أو مضطجعا. وأقله سكون بعد حركة أعضائه. وأكمله الزيادة على ذلك بالدعاء الوارد فيه؛ فلو لم يجلس بين السجدتين بل صار إلى الجلوس أقرب لم يصح؛ (و) الثاني عشر (الطمأنينة فيه) أي الجلوس بين السجدتين.

(و) الثالث عشر (الجلوس الأخير) أي الذي يعقبه السلام؛ (و) الرابع عشر (التشهد فيه) ms024 أي في الجلوس الأخير. وأقل التشهد «التحيات لله، سلام عليك أيها النبي ورحمة الله وبركاته، سلام علينا وعلى عباد الله الصالحين؛ أشهد أن لا إله إلا الله، وأشهد أن محمدا رسول الله». وأكمل التشهد «التحيات المباركات الصلوات الطيبات لله، السلام عليك أيها النبي ورحمة الله وبركاته، السلام علينا وعلى عباد الله الصالحين؛ أشهد أن لا إله إلا الله، وأشهد أن محمدا رسول الله».

(و) الخامس عشر (الصلاة على النبي - صلى الله عليه وسلم - فيه) أي في الجلوس الأخير بعد الفراغ من التشهد. وأقل الصلاة على النبي - صلى الله عليه وسلم - «اللهم صل على محمد». وأشعر كلام المصنف أن الصلاة على الآل لا تجب، وهو كذلك بل هي سنة.

(و) السادس عشر (التسليمة الأولى) ويجب إيقاع السلام حال القعود. وأقله «السلام عليكم» مرة واحدة؛ وأكمله «السلام عليكم ورحمة الله» مرتين يمينا وشمالا.

(و) السابع عشر (نية الخروج من الصلاة) وهذا وجه مرجوح، وقيل لا يجب ذلك أي نية الخروج. وهذا الوجه هو الأصح.

(و) الثامن عشر (ترتيب الأركان) حتى بين التشهد الأخير والصلاة على النبي - صلى الله عليه وسلم - فيه. وقوله: (على ما ذكرناه) يستثنى منه وجوب مقارنة النية لتكبيرة الإحرام ومقارنة الجلوس الأخير للتشهد والصلاة على النبي - صلى الله عليه وسلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, '• سنن الصلاة', '(و) الصلاة (سننها قبل الدخول فيها شيئان: الأذان) وهو لغة الإعلام، وشرعا ذكر مخصوص للإعلام بدخول وقت صلاة مفروضة. وألفاظه مثنى إلا التكبير أوله فأربع، وإلا التوحيد آخره فواحد؛ (والإقامة) وهي مصدر «أقام»، ثم سمي بها الذكر المخصوص لأنه يقيم إلى الصلاة. وإنما يشرع كل من الأذان والإقامة للمكتوبة، وأما غيرها فينادى لها «الصلاة جامعة».

(و) سننها (بعد الدخول فيها شيئان: التشهد الأول، والقنوت في الصبح) أي في اعتدال الركعة الثانية منه؛ وهو لغة الدعاء، وشرعا ذكر مخصوص، وهو «اللهم اهدني فيمن هديت، وعافني فيمن عافيت» (1) إلخ. (و) القنوت (في) آخر (الوتر في النصف الثاني من شهر رمضان). وهو كقنوت الصبح المتقدم في محله ولفظه. ولا تتعين ms025 كلمات القنوت السابقة؛ فلو قنت بآية تتضمن دعاء وقصد القنوت حصلت سنة القنوت.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 11, NULL, '• هيئات الصلاة', '(وهيئاتها) أي الصلاة. وأراد بهيئاتها ما ليس ركنا فيها ولا بعضا يجبر بسجود السهو (خمسة عشر خصلة: رفع اليدين عند تكبيرة الإحرام) إلى حذو منكبيه، (و) رفع اليدين (عند الركوع و) عند (الرفع منه،

ووضع اليمين على الشمال)، ويكونان تحت صدره وفوق سرته.

(والتوجه) أي قول المصلي عقب التحرم، {وجهت وجهي للذي فطر السماوات والأرض حنيفا وما أنا من المشركين} [الأنعام: 79]. والمراد أن يقول المصلي بعد التحرم دعاء الافتتاح هذه الآية أو غيرها مما ورد في الاستفتاح. (1)

(والاستعاذة) بعد التوجه. وتحصل بكل لفظ يشتمل على التعوذ؛ والأفضل «أعوذ بالله من الشيطان الرجيم».

(والجهر في موضعه) وهو الصبح وأولتا المغرب والعشاء والجمعة والعيدان؛ (والإسرار في موضعه) وهو ما عدا الذي ذكر.

(والتأمين) أي قول «آمين» عقب الفاتحة لقارئها في صلاة وغيرها، لكن في الصلاة آكد. ويؤمن المأموم مع تأمين إمامه، ويجهر به.

(وقراءة السورة بعد الفاتحة) لإمام ومنفرد في ركعتي الصبح وأولتي غيرها. وتكون قراءة السورة بعد الفاتحة؛ فلو قدم السورة عليها لم يحسب؛ (والتكبيرات عند الخفض) للركوع (والرفع) أي رفع الصلب من الركوع.

(وقول «سمع الله لمن حمده») حين يرفع رأسه من الركوع. ولو قال: «من حمد الله سمع له» كفى. ومعنى «سمع الله لمن حمده» تقبل الله منه حمده وجازاه عليه. وقول المصلي: («ربنا لك الحمد») إذا انتصب قائما؛ (والتسبيح في الركوع) وأدنى الكمال في هذا التسبيح «سبحان ربي العظيم» ثلاثا؛ (و) التسبيح في (السجود)، وأدنى الكمال فيه «سبحان ربي الأعلى» ثلاثا؛

والأكمل في تسبيح الركوع والسجود مشهور.

(ووضع اليدين على الفخذين في الجلوس) للتشهد الأول والأخير (يبسط) اليد (اليسرى) بحيث تسامت رؤوس أصابعها الركبة، (ويقبض) اليد (اليمنى) أي أصابعها (إلا المسبحة) من اليمنى، فلا يقبضها؛ (فإنه يشير بها) رافعا لها حال كونه (متشهدا)؛ وذلك عند قوله: «إلا الله»، ولا يحركها؛ فإن حركها كره، ولا تبطل صلاته في الأصح.

(والافتراش في جميع الجلسات) الواقعة ms026 في الصلاة، كجلوس الاستراحة والجلوس بين السجدتين وجلوس التشهد الأول. والافتراس أن يجلس الشخص على كعب اليسرى جاعلا ظهرها للأرض وينصب قدمه اليمنى

ويضع بالأرض أطراف أصابعها لجهة القبلة.

(والتورك في الجلسة الأخيرة) من جلسات الصلاة، وهي جلوس التشهد الأخير. والتورك مثل الافتراش إلا أن المصلي يخرج يساره على هيئتها في الافتراش من جهة يمينه، ويلصق وركه بالأرض. أما المسبوق والساهي فيفترشان ولا يتوركان. (والتسليمة الثانية). أما الأولى فسبق أنها من أركان الصلاة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 12, NULL, '• ما تخالف المرأة فيه الرجل', '{فصل} في أمور تخالف فيها المرأة الرجل في الصلاة. وذكر المصنف بقوله: (والمرأة تخالف الرجل في خمسة أشياء: فالرجل يجافي) أي يرفع (مرفقيه عن جنبيه، ويقل) أي يرفع (بطنه عن فخذيه في الركوع والسجود،

ويجهر في موضع الجهر). وتقدم بيانه في موضعه، (وإذا نابه) أي أصابه (شيء

في الصلاة سبح)؛ فيقول: «سبحان الله» بقصد الذكر فقط، أو مع الإعلام أو أطلق لم تبطل صلاته، أو الإعلام فقط بطلت. (وعورة الرجل ما بين سرته وركبته)؛ أما هما فليسا من العورة، ولا ما فوقهما.

(والمرأة) تخالف الرجل في الخمس المذكورة، فإنها (تضم بعضها إلى بعض)، فتلصق بطنها بفخذيها في ركوعها وسجودها (وتخفض صوتها) إن صلت (بحضرة الرجال الأجانب). فإن صلت منفردة عنهم جهرت؛ (وإذا نابها شيء في الصلاة صفقت) بضرب بطن اليمنى على ظهر اليسرى؛ فلو ضربت بطنا ببطن بقصد اللعب ولو قليلا مع علم التحريم بطلت صلاتها. والخنثى كالمرأة. (وجميع بدن) المرأة (الحرة عورة إلا وجهها وكفيها). وهذه عورتها في الصلاة؛ أما خارج الصلاة فعورتها جميع بدنها.

(والأمة كالرجل في الصلاة)؛ فتكون عورتها ما بين سرتها وركبتها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 13, NULL, '• مبطلات الصلاة', '{فصل} في عدد مبطلات الصلاة. (والذي يبطل الصلاة أحد عشر شيئا: الكلام العمد) الصالح لخطاب الآدميين، سواء تعلق بمصلحة الصلاة أو لا، (والعمل الكثير) المتوالي كثلات خطوات، عمدا كان ذلك أو سهوا؛ أما العمل القليل فلا تبطل الصلاة به. (والحدث) الأصغر والأكبر، (وحدوث النجاسة) التي لا يعفى عنها. ولو وقع على ثوبه نجاسة يابسة ms027 فنفض ثوبه حالا لم تبطل صلاته. (وانكشاف العورة) عمدا؛ فإن كشفها الريح فسترها في الحال لم تبطل صلاته،

(وتغيير النية) كأن ينوي الخروج من الصلاة. (واستدبار القبلة) كأن يجعلها خلف ظهره. (والأكل، والشرب) كثيرا كان المأكول والمشروب

أو قليلا، إلا أن يكون الشخص في هذه الصورة جاهلا تحريم ذلك، (والقهقهة) ومنهم من يعبر عنها بالضحك. (والردة) وهي قطع الإسلام بقول أو فعل.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 14, NULL, '• ركعات الفرائض', '{فصل} في عدد ركعات الصلاة. (وركعات الفرائض) أي في كل يوم وليلة في صلاة الحضر إلا يوم الجمعة (سبعة عشر ركعة). أما يوم الجمعة فعدد ركعات الفرائض في يومها خمسة عشر ركعة. وأما عدد ركعات صلاة السفر في كل يوم للقاصر فإحدى عشرة ركعة.

وقوله: (فيها أربع وثلاثون سجدة، وأربع وتسعون تكبيرة، وتسع تشهدات، وعشر تسليمات، ومائة وثلاث وخمسون تسبيحة).

(وجملة الأركان في الصلاة مائة وستة وعشرون ركنا: في الصبح ثلاثون ركنا، وفي المغرب اثنان وأربعون ركنا، وفي الرباعية أربعة وخمسون ركنا) إلى آخره ظاهر غني عن الشرح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 15, NULL, '• من عجز عن القيام في صلاة الفرض', '(ومن عجز عن القيام في الفريضة) لمشقة تلحقه في قيامه (صلى جالسا) على أي هيئة شاء، ولكن افتراشه في موضع قيامه أفضل من تربعه في الأظهر.

(ومن عجز عن الجلوس صلى مضطجعا)؛ فإن عجز عن الاضطجاع صلى مستلقيا على ظهره ورجلاه للقبلة؛ فإن عجز عن ذلك كله أومأ بطرفه ونوى بقلبه، ويجب عليه استقبالها بوجهه بوضع شيء تحت رأسه ويومئ برأسه في ركوعه وسجوده؛ فإن عجز عن الإيماء برأسه أومأ بأجفانه؛ فإن عجز عن الإيماء بها أجرى أركان الصلاة على قلبه، ولا يتركها ما دام عقله ثابتا.

والمصلي قاعدا لا قضاء عليه، ولا ينقص أجره، لأنه معذور. وأما قوله - صلى الله عليه وسلم -: «من صلى قاعدا فله نصف أجر القائم، ومن صلى نائما فله نصف أجر القاعد»، فمحمول على النفل عند القدرة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 16, NULL, '• أنواع المتروك من الصلاة', '{فصل} (والمتروك من الصلاة ثلاثة أشياء: فرض) ويسمى بالركن أيضا، (وسنة وهيئة)؛ وهما ما عدا ms028 الفرض.

وبين المصنف الثلاثة في قوله: (فالفرض لا ينوب عنه سجود السهو، بل إن ذكره) أي الفرض وهو في الصلاة أتى به وتمت صلاته، أو ذكره بعد السلام (والزمان قريب أتى به، وبنى عليه) ما بقي من الصلاة، (وسجد للسهو). وهو سنة -كما سيأتي- لكن عند ترك مأمور به في الصلاة أو فعل منهي عنه فيها.

(والسنة) إن تركها المصلي (لا يعود إليها بعد التلبس بالفرض)؛ فمن ترك التشهد الأول مثلا فذكره بعد اعتداله مستويا لا يعود إليه؛ فإن عاد إليه عالما تحريمه بطلت صلاته، أو ناسيا أنه في الصلاة أو جاهلا فلا تبطل صلاته، ويلزمه القيام عند تذكره. وإن كان مأموما عاد وجوبا لمتابعة إمامه (لكنه يسجد للسهو عنها) في صورة عدم العود، أو العود ناسيا. وأراد المصنف بالسنة هنا الأبعاض الستة، وهي: التشهد الأول وقعوده، والقنوت في الصبح وفي آخر الوتر في النصف الثاني من رمضان، والقيام للقنوت، والصلاة على النبي - صلى الله عليه وسلم - في التشهد الأول، والصلاة على الآل في التشهد الأخير.

(والهيئة) كالتسبيحات ونحوها مما لا يجبر بالسجود (لا يعود) المصلي (إليها بعد تركها، ولا يسجد للسهو عنها) سواء تركها عمدا أو سهوا.

(وإذا شك) المصلي (في عدد ما أتى به من الركعات) كمن شك هل صلى ثلاثا أو أربعا (بنى على اليقين، وهو الأقل) كالثلاثة في هذا المثال، وأتى بركعة (وسجد للسهو)، ولا ينفعه غلبة الظن أنه صلى أربعا، ولا يعمل بقول غيره له أنه صلى أربعا، ولو بلغ ذلك القائل عدد التواتر.

(وسجود السهو سنة) كما سبق، (ومحله قبل السلام)؛ فإن سلم المصلي عامدا عالما بالسهو أو ناسيا وطال الفصل عرفا فات محله، وإن قصر الفصل عرفا لم يفت، وحينئذ فله السجود وتركه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 17, NULL, '• الأوقات التي تكره فيها الصلاة', '{فصل} في الأوقات التي تكره الصلاة فيها تحريما - كما في الروضة وشرح المهذب هنا - وتنزيها - كما في التحقيق وشرح المهذب في نواقض الوضوء. (وخمسة أوقات لا يصلى فيها إلا صلاة لها سبب) إما متقدم كالفائتة، أو ms029 مقارن كصلاة الكسوف والاستسقاء. فالأول من الخمسة الصلاة التي لا سبب لها إذا فعلت (بعد صلاة الصبح) وتستمر الكراهة (حتى تطلع الشمس. و) الثاني الصلاة (عند طلوعها)؛ فإذا طلعت (حتى تتكامل وترتفع قدر رمح) في رأي العين. (و) الثالث الصلاة (إذا استوت حتى تزول) عن وسط السماء. ويستثنى من ذلك يوم الجمعة؛ فلا تكره الصلاة فيه وقت الاستواء، وكذا حرم مكة، المسجد وغيره؛ فلا تكره الصلاة فيه في هذه الأوقات كلها، سواء صلى سنة الطواف أو غيرها. (و) الرابع (بعد صلاة العصر حتى تغرب الشمس.

و) الخامس (عند الغروب) للشمس، فإذا دنت للغروب (حتى يتكامل غروبها).', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 18, NULL, '• صلاة الجماعة', '{فصل} (وصلاة الجماعة) للرجال في الفرائض غير الجمعة (سنة مؤكدة) عند المصنف والرافعي. والأصح عند النووي أنها فرض كفاية. ويدرك المأموم الجماعة مع الإمام في غير الجمعة مالم يسلم التسليمة الأولى وإن لم يقعد معه. وأما الجماعة في الجمعة ففرض عين، ولا تحصل بأقل من ركعة.

(و) يجب (على المأموم أن ينوي الائتمام) أو الاقتداء بالإمام، ولا يجب تعيينه، بل يكفي الاقتداء بالحاضر إن لم يعرفه؛ فإن عينه وأخطأ بطلت صلاته إلا إن انضمت إليه إشارة كقوله: نويت الاقتداء بزيد هذا، فبان عمرا، فتصح. (دون الإمام)؛ فلا يجب في صحة الاقتداء به في غير الجمعة نية الإمامة، بل هي مستحبة في حقه، فإن لم ينو فصلاته فرادى.

(ويجوز أن يأتم الحر بالعبد، والبالغ بالمراهق). أما الصبي غير المميز فلا يصح الاقتداء به. (ولا تصح قدوة رجل بامرأة) ولا بخنثى مشكل، ولا خنثى مشكل بامرأة ولا بمشكل، (ولا قارئ) وهو من يحسن الفاتحة، أي لا يصح اقتداؤه (بأمي) وهو من يخل بحرف أو تشديدة من الفاتحة.

ثم أشار المصنف لشروط القدوة بقوله: (وأي موضع صلى في المسجد بصلاة الإمام فيه) أي في المسجد (وهو) أي المأموم (عالم بصلاته) أي الإمام بمشاهدة المأموم له أو بمشاهدة بعض صف (أجزأه) أي كفاه ذلك في صحة الاقتداء به (مالم يتقدم عليه)؛ فإن تقدم عليه بعقبه في ms030 جهته لم تنعقد صلاته، ولا تضر مساواته لإمامه، ويندب تخلفه عن إمامه قليلا، ولا يصير بهذا التخلف منفردا عن الصف حتى لا يحوز فضيلة الجماعة.

(وإن صلى) الإمام (في المسجد والمأموم خارج المسجد) حال كونه (قريبا منه) أي الإمام، بأن لم تزد مسافة ما بينهما على ثلاث مئة ذراع

تقريبا، (وهو) أي المأموم (عالم بصلاته) أي الإمام (ولا حائل هناك) أي بين الإمام والمأموم (جاز) الاقتداء به، وتعتبر المسافة المذكورة من آخر المسجد. وإن كان الإمام والمأموم في غير المسجد، إما فضاء أو بناء فالشرط أن لا يزيد ما بينهما على ثلثمائة ذراع، وأن لا يكون بينهما حائل.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 19, NULL, '• صلاة المسافر', '{فصل} في قصر الصلاة وجمعها. (ويجوز للمسافر) أي الملتبس بالسفر (قصر الصلاة الرباعية) لا غيرها، من ثنائية وثلاثية. وجواز قصر الصلاة الرباعية (بخمس شرائط): الأول (أن يكون سفره) أي الشخص (في غير معصية) هو شامل للواجب كقضاء دين، وللمندوب كصلة الرحم، وللمباح كسفر تجارة.

أما سفر المعصية كسفر لقطع الطريق، فلا يترخص فيه بقصر ولا جمع.

(و) الثاني (أن تكون مسافته) أي السفر (ستة عشر فرسخا) تحديدا في الأصح، ولا تحسب مدة الرجوع منها. والفرسخ ثلاثة أميال؛ وحينئذ فمجموع الفراسخ ثمانية وأربعون ميلا، والميل أربعة آلاف خطوة، والخطوة ثلاثة أقدام. والمراد بالأميال الهاشمية.

(و) الثالث (أن يكون) القاصر (مؤديا للصلاة الرباعية). أما الفائتة حضرا فلا تقضى فيه مقصورة. والفائتة في السفر تقضى فيه مقصورة، لا في الحضر.

(و) الرابع (أن ينوي) المسافر (القصر) للصلاة (مع الإحرام) بها؛ (و) الخامس (أن لا يأتم) في جزء من صلاته (بمقيم) أي بمن يصلي صلاة تامة ليشمل المسافر المتم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 20, NULL, '• جمع الصلاة للمسافر', '(ويجوز للمسافر) سفرا طويلا مباحا (أن يجمع بين) صلاتي (الظهر

والعصر) تقديما وتأخيرا، وهو معنى قوله: (في وقت أيهما شاء، و) أن يجمع (بين) صلاتي (المغرب والعشاء) تقديما وتأخيرا، وهو معنى قوله: (في وقت أيهما شاء).

وشروط جمع التقديم ثلاثة: الأول أن يبدأ بالظهر قبل العصر، وبالمغرب قبل العشاء؛ فلو عكس كأن ms031 بدأ بالعصر قبل الظهر مثلا لم يصح، ويعيدها إن أراد الجمع.

والثاني نية الجمع أول الصلاة الأولى، بأن تقترن نية الجمع بتحرمها، فلا يكفي تقديمها على التحرم ولا تأخيرها عن السلام من الأولى. وتجوز في أثنائها على الأظهر.

والثالث الموالاة بين الأولى والثانية، بأن لا يطول الفصل بينهما؛ فإن طال عرفا ولو بعذر كنوم وجب تأخير الصلاة الثانية إلى وقتها. ولا يضر في الموالاة بينهما فصل يسير عرفا. وأما جمع التأخير فيجب فيه أن يكون نية الجمع، وتكون النية هذه في وقت الأولى. ويجوز تأخيرها إلى أن يبقى من وقت الأولى زمن لو ابتدئت فيه كانت أداء. ولا يجب في جمع التأخير ترتيب ولا موالاة

ولا نية جمع على الصحيح في الثلاثة.

(ويجوز للحاضر) أي المقيم (في) وقت (المطر أن يجمع بينهما) أي الظهر والعصر، والمغرب والعشاء، لا في وقت الثانية، بل (في وقت الأولى منهما) إن بل المطر أعلى الثوب وأسفل النعل، ووجدت الشروط السابقة في جمع التقديم. ويشترط أيضا وجود المطر في أول الصلاتين، ولا يكفي وجوده في أثناء الأولى منهما. ويشترط أيضا وجوده عند السلام من الأولى، سواء استمر المطر بعد ذلك أم لا. وتختص رخصة الجمع بالمطر بالمصلي في جماعة بمسجد أو غيره من مواضع الجماعة بعيد عرفا، ويتأذى الذاهب للمسجد أو غيره من مواضع الجماعة بالمطر في طريقه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 21, NULL, '• صلاة الجمعة', '{فصل} (وشرائط وجوب الجمعة سبعة أشياء: الإسلام، والبلوغ، والعقل)؛ وهذه شروط أيضا لغير الجمعة من الصلوات، (والحرية، والذكورية، والصحة، والاستيطان)؛ فلا تجب الجمعة على كافر أصلي وصبي ومجنون ورقيق وأنثى ومريض ونحوه ومسافر.

(وشرائط) صحة (فعلها ثلاثة): الأول دار الإقامة التي يستوطنها العدد المجمعون، سواء في ذلك المدن والقرى التي تتخذ وطنا. وعبر المصنف عن ذلك بقوله: (أن تكون البلد مصرا) كانت البلد (أو قرية).

(و) الثاني (أن يكون العدد) في جماعة الجمعة (أربعين) رجلا (من أهل الجمعة)، وهم المكلفون الذكور الأحرار المستوطنون، بحيث لا يظعنون عما استوطنوه شتاء ولا صيفا إلا لحاجة.

(و) الثالث ms032 (أن يكون الوقت باقيا) وهو وقت الظهر؛ فيشترط أن تقع

الجمعة كلها في الوقت؛ فلو ضاق وقت الظهر عنها بأن لم يبق منه ما لا يسع الذي لا بد منه فيها من خطبتيها وركعتيها صليت ظهرا.

(فإن خرج الوقت أو عدمت الشروط) أي جميع وقت الظهر يقينا أو ظنا وهم فيها (صليت ظهرا) بناء على ما فعل منها، وفاتت الجمعة، سواء أدركوا منها ركعة أم لا. ولو شكوا في خروج وقتها وهم فيها أتموها جمعة على الصحيح.

(وفرائضها) ومنهم من عبر عنها بالشروط (ثلاثة): أحدها وثانيها (خطبتان يقوم) أي الخطيب (فيهما ويجلس بينهما). قال المتولي: بقدر الطمأنينة بين السجدتين. ولو عجز عن القيام وخطب قاعدا أو مضطجعا صح وجاز الاقتداء به ولو مع الجهل بحاله. وحيث خطب قاعدا فصل بين الخطبتين بسكتة، لا باضطجاع.

وأركان الخطبة خمسة: حمد الله تعالى، ثم الصلاة على رسول الله - صلى الله عليه وسلم -. ولفظهما متعين، ثم الوصية بالتقوى، ولا يتعين لفظها على الصحيح، وقراءة آية في إحداهما، والدعاء للمؤمنين والمؤمنات في الخطبة الثانية. ويشترط أن يسمع الخطيب أركان الخطبة لأربعين تنعقد بهم

الجمعة. ويشترط الموالاة بين كلمات الخطبة، وبين الخطبتين؛ فلو فرق بين كلماتها ولو بعذر بطلت. ويشترط فيهما ستر العورة وطهارة الحدث والخبث في ثوب وبدن ومكان.

(و) الثالث من فرائض الجمعة (أن تصلى) بضم أوله (ركعتين في جماعة) تنعقد بهم الجمعة. ويشترط وقوع هذه الصلاة بعد الخطبتين، بخلاف صلاة العيد، فإنها قبل الخطبتين.

(وهيآتها) وسبق معنى الهيئة (أربع خصال): أحدها (الغسل) لمن يريد خضورها من ذكر أو أنثى، حر أو عبد، مقيم أو مسافر. ووقت غسلها من الفجر الثاني؛ وتقريبه من ذهابه أفضل. فإن عجز عن غسلها تيمم بنية الغسل لها. (و) الثاني (تنظيف الجسد) بإزالة الريح الكريه منه كصنان، فيتعاطى ما يزيله من مرتك ونحوه.

(و) الثالث (لبس الثياب البيض)، فإنها أفضل الثياب. (و) الرابع (أخذ الظفر) إن طال، والشعر كذلك، فينتف إبطه ويقص شاربه، ويحلق عانته، (والتطيب) بأحسن ما وجد ms033 منه.

(ويستحب الإنصات) وهو السكوت مع الإصغاء (في وقت الخطبة). ويستثنى من الإنصات أمور مذكورة في المطولات. منها إنذار أعمى أن يقع في بئر، ومن دب إليه عقرب مثلا.

(ومن دخل) المسجد (والإمام يخطب صلى ركعتين خفيفتين ثم يجلس). وتعبير المصنف ب «دخل» يفهم أن الحاضر لا ينشئ صلاة ركعتين، سواء صلى سنة الجمعة أم لا. ولا يظهر من هذا المفهوم أن فعلهما حرام أو مكروه، لكن النووي في الشرح المهذب صرح بالحرمة، ونقل الإجماع عليها عن الماوردي.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 22, NULL, '• صلاة العيدين', '{فصل} (وصلاة العيدين) أي الفطر والأضحى (سنة مؤكدة). وتشرع جماعة، ولمنفرد ومسافر، وحر وعبد، وخنثى وامرأة، لا جميلة، ولا ذات هيئة. أما العجوز فتحضر العيد في ثياب بيتها بلا طيب. ووقت صلاة العيد ما بين طلوع الشمس وزوالها.

(وهي) أي صلاة العيد (ركعتان) يحرم بهما بنية عيد الفطر أو الأضحى، ويأتي بدعاء الافتتاح؛ و (يكبر في) الركعة (الأولى سبعا سوى تكبيرة الإحرام)، ثم يتعوذ ويقرأ بعدها سورة «ق» جهرا، (و) يكبر (في) الركعة (الثانية خمسا سوى تكبيرة القيام) ثم يتعوذ، ثم يقرأ الفاتحة وسورة «اقتربت» جهرا.

(ويخطب) ندبا (بعدهما) أي الركعتين (خطبتين، يكبر في) ابتداء (الأولى تسعا) ولاء، (و) يكبر (في) ابتداء (الثانية سبعا) ولاء. ولو فصل بينهما بتحميد وتهليل وثناء كان حسنا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 23, NULL, '• التكبير للعيدين', 'والتكبير على قسمين: مرسل، وهو ما لا يكون عقب صلاة؛ ومقيد، وهو ما يكون عقبها.

وبدأ المصنف بالأول فقال: (ويكبر) ندبا كل من ذكر وأنثى، وحاضر ومسافر، في المنازل والطرق، والمساجد والأسواق (من غروب الشمس من ليلة العيد) أي عيد الفطر، ويستمر هذا التكبير (إلى أن يدخل الإمام في الصلاة) للعيد.

ولا يسن التكبير ليلة عيد الفطر عقب الصلاة، ولكن النووي في الأذكار اختار أنه سنة. ثم شرع في التكبير المقيد فقال: (و) يكبر (في) عيد (الأضحى

خلف الصلوات المفروضات) من مؤداة وفائتة؛ وكذا خلف راتبة ونفل مطلق وصلاة جنازة، (من صبح يوم عرفة إلى العصر من آخر أيام التشريق).', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 24, NULL, '• صيغة التكبير', 'وصيغة التكبير: «الله ms034 أكبر، الله أكبر، الله أكبر، لا إله إلا الله، والله أكبر، الله أكبر، ولله الحمد، الله أكبر كبيرا، والحمد لله كثيرا، وسبحان الله بكرة وأصيلا، لا إله إلا الله وحده، صدق وعده، ونصر عبده، وأعز جنده، وهزم الأحزاب وحده».', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 25, NULL, '• صلاة الكسوف والخسوف', '{فصل} (وصلاة الكسوف) للشمس، وصلاة الخسوف للقمر، كل منهما (سنة مؤكدة، فإن فاتت) هذه الصلاة (لم تقض) أي لم يشرع قضاؤها. (ويصلي لكسوف الشمس وخسوف القمر ركعتين) يحرم بنية صلاة الكسوف، ثم بعد الافتتاح والتعوذ يقرأ الفاتحة، ويركع، ثم يرفع رأسه من الركوع، ثم يعتدل، ثم يقرأ الفاتحة ثانيا، ثم يركع ثانيا أخف من الذي قبله، ثم يعتدل ثانيا، ثم يسجد السجدتين بطمأنينة في الكل، ثم يصلي ركعة ثانية بقيامين وقراءتين وركوعين واعتدالين وسجودين. وهذا معنى قوله: (في كل ركعة) منهما (قيامان يطيل القراءة فيهما) كما سيأتي، (و) في كل ركعة (ركوعان يطيل التسبيح فيهما، دون السجود)؛ فلا يطوله، وهو أحد وجهين، لكن الصحيح أنه يطوله نحو الركوع الذي قبله، (ويخطب) الإمام (بعدهما) أي بعد صلاة الكسوف والخسوف (خطبتين) كخطبتي الجمعة في الأركان والشروط، ويحث الناس في الخطبتين على التوبة من الذنوب وعلى فعل الخير من صدقة وعتق

ونحو ذلك.

(ويسر) بالقراءة (في كسوف الشمس، ويجهر) بالقراءة (في خسوف القمر). وتفوت صلاة كسوف الشمس بالانجلاء للمنكسف وبغروبها كاسفة، وتفوت صلاة خسوف القمر بالانجلاء وطلوع الشمس، لا بطلوع الفجر ولا بغروبه خاسفا، فلا تفوت الصلاة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 26, NULL, '• صلاة الاستسقاء', '{فصل} في أحكام صلاة الاستسقاء، أي طلب السقيا من الله تعالى. (وصلاة الاستسقاء مسنونة) لمقيم ومسافر عند الحاجة من انقطاع غيث أو عين ماء ونحو ذلك. وتعاد صلاة الاستسقاء ثانيا وأكثر من ذلك إن لم يسقوا حتى يسقيهم الله؛ (فيأمرهم الإمام) ونحوه (بالتوبة) ويلزمهم امتثال أمره - كما أفتى به النووي. والتوبة من الذنب واجبة. أمر الإمام بها أو لا،

(والصدقة، والخروج من المظالم) للعباد (ومصالحة الأعداء، وصيام ثلاثة أيام) قبل ميعاد الخروج، فيكون به أربعة أيام، (ثم يخرج بهم في اليوم الرابع) ms035 صياما غير متطيبين ولا متزينين، بل يخرجون (في ثياب بذلة) بموحدة مكسورة وذال معجمة ساكنة، وهي ما يلبس من ثياب المهنة وقت العمل، (واستكانة) أي خشوع (وتضرع) أي خضوع وتذلل. ويخرجون معهم الصبيان والشيوخ والعجائز والبهائم.

(ويصلي بهم) الإمام أو نائبه (ركعتين كصلاة العيدين) في كيفيتهما من الافتتاح والتعوذ والتكبير سبعا في الركعة الأولى، وخمسا في الركعة الثانية برفع يديه، (ثم يخطب) ندبا خطبتين كخطبتي العيدين في الأركان وغيرها، لكن يستغفر الله تعالى في الخطبتين بدل التكبير أولهما في خطبتي العيدين؛ فيفتتح الخطبة الأولى بالاستغفار تسعا، والخطبة الثانية سبعا. وصيغة الاستغفار «أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم وأتوب إليه».

وتكون الخطبتان (بعدهما) أي الركعتين. (ويحول) الخطيب (رداءه)؛ فيجعل يمينه يساره، وأعلاه أسفله، ويحول الناس أرديتهم مثل تحويل الخطيب، (ويكثر من الدعاء) سرا وجهرا، فحيث أسر الخطيب أسر القوم بالدعاء، وحيث جهر أمنوا على دعائه. (و) يكثر الخطيب من (الاستغفار) ويقرأ قوله تعالى: {استغفروا ربكم إنه كان غفارا  يرسل السماء عليكم مدرارا} [نوح: 10 - 11].

وفي بعض نسخ المتن زيادة وهي: (ويدعو بدعاء رسول الله - صلى الله عليه وسلم -، وهو: «اللهم اجعلها سقيا رحمة، ولا تجعلها سقيا عذاب، ولا محق، ولا بلاء، ولا هدم، ولا غرق؛ اللهم على الظراب والآكام ومنابت الشجر، وبطون الأودية؛ اللهم حوالينا ولا علينا، اللهم اسقنا غيثا مغيثا، مريئا مريعا، سحا عاما، غدقا طبقا، مجللا دائما إلى يوم الدين؛ اللهم اسقنا الغيث، ولا تجعلنا من القانطين؛ اللهم إن بالعباد والبلاد من الجهد والجوع والضنك

ما لا نشكو إلا إليك؛ اللهم أنبت لنا الزرع، وأدر لنا الضرع، وأنزل علينا من بركات السماء، وأنبت لنا من بركات الأرض، واكشف عنا من البلاء ما لا يكشفه غيرك؛ اللهم إنا نستغفرك، إنك كنت غفارا، فأرسل السماء علينا مدرارا». ويغتسل في الوادي إذا سال، ويسبح للرعد والبرق). انتهت الزيادة، وهي لطولها لا تناسب حال المتن من الاختصار. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 27, NULL, '• صلاة الخوف', '{فصل} في كيفية صلاة الخوف. وإنما أفردها المصنف ms036 عن غيرها من الصلوات بترجمة لأنه يحتمل في

إقامة الفرض في الخوف ما لا يحتمل في غيره.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 28, NULL, '• أنواع صلاة الخوف', '(وصلاة الخوف) أنواع كثيرة تبلغ ستة أضرب - كما في صحيح مسلم - اقتصر المصنف منها (على ثلاثة أضرب: أحدها أن يكون العدو في غير جهة القبلة)، وهو قليل، وفي المسلمين كثرة بحيث تقاوم كل فرقة منهم العدو؛ (فيفرقهم الإمام فرقتين: فرقة تقف في وجه العدو) تحرسه، (وفرقة تقف خلفه) أي الإمام؛ (فيصلي بالفرقة التي خلفه ركعة، ثم) بعد قيامه للركعة الثانية (تتم لنفسها) بقية صلاتها، (وتمضي) بعد فراغ صلاتها (إلى وجه العدو) تحرسه، (وتأتي الطائفة الأخرى) التي كانت حارسة في الركعة الأولى، (فيصلي) الإمام (بها ركعة)، فإذا جلس الإمام للتشهد تفارقه (وتتم لنفسها) ثم ينتظرها الإمام (ويسلم بها). وهذه صلاة رسول الله - صلى الله عليه وسلم - بذات الرقاع. سميت بذلك لأنهم رقعوا فيها راياتهم؛ وقيل غير ذلك.

(والثاني أن يكون في جهة القبلة) في مكان لا يسترهم عن أعين المسلمين شيء، وفي المسلمين كثرة تحتمل تفرقهم، (فيصفهم الإمام صفين) مثلا، (ويحرم بهم) جميعا؛ (فإذا سجد) الإمام في الركعة الأولى (سجد معه أحد الصفين) سجدتين، (ووقف الصف الآخر يحرسهم؛ فإذا رفع) الإمام رأسه (سجدوا ولحقوه) ويتشهد بالصفين، ويسلم بهم. وهذه صلاة رسول الله - صلى الله عليه وسلم - بعسفان، وهي قرية في طريق الحاج المصري، بينها وبين مكة مرحلتان؛ سميت بذلك لعسف السيول فيها.

(والثالث أن يكون في شدة الخوف والتحام الحرب)، هو كناية عن شدة الاختلاط بين القوم بحيث يلتصق لحم بعضهم ببعض، فلا يتمكنون من ترك القتال، ولا يقدرون على النزول إن كانوا ركبانا، ولا على الانحراف إن كانوا مشاة؛ (فيصلي) كل من القوم (كيف أمكنه، راجلا) أي ماشيا (أو راكبا، مستقبل القبلة وغير مستقبل لها). ويعتذرون في الأعمال

الكثيرة في الصلاة كضربات متوالية.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 29, NULL, '• اللباس', '{فصل} في اللباس (ويحرم على الرجال لبس الحرير والتختم بالذهب) والقز في حال الاختيار، وكذا يحرم استعمال ما ذكر على جهة الافتراش وغير ذلك من وجوه ms037 الاستعمالات. ويحل للرجال لبسه للضرورة، كحر وبرد مهلكين.

(ويحل للنساء) لبس الحرير وافتراشه، ويحل للولي إلباس الصبي الحرير قبل سبع سنين وبعدها.

(وقليل الذهب وكثيره) أي استعمالهما (في التحريم سواء. وإذا كان بعض الثوب إبريسما) أي حريرا (وبعضه) الآخر (قطنا أو كتانا) مثلا (جاز) للرجل (لبسه مالم يكن الإبريسم غالبا) على غيره؛ فإن كان غير الإبريسم غالبا حل؛ وكذا إن استويا في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 30, NULL, '• ما يلزم في الميت', '{فصل} فيما يتعلق بالميت من غسله وتكفينه والصلاة عليه ودفنه. (ويلزم) على طريق فرض الكفاية (في الميت) المسلم غير المحرم والشهيد (أربعة أشياء: غسله، وتكفينه، والصلاة عليه، ودفنه). وإن لم يعلم بالميت إلا واحد تعين عليه ما ذكر. وأما الميت الكافر فالصلاة عليه حرام، حربيا كان أو ذميا؛ ويجوز غسله في الحالين. ويجب تكفين الذمي ودفنه، دون الحربي

والمرتد. وأما المحرم إذا كفن فلا يستر رأسه، ولا وجه المحرمة؛ وأما الشهيد فلا يصلى عليه كما ذكره المصنف بقوله:

(واثنان لا يغسلان ولا يصلى عليهما): أحدهما (الشهيد في معركة المشركين)، وهو من مات في قتال الكفار بسببه، سواء قتله كافر مطلقا أو مسلم خطأ، أو عاد سلاحه إليه أو سقط عن دابته أو نحو ذلك. فإن مات بعد انقضاء القتال بجراحة فيه يقطع بموته منها فغير شهيد في الأظهر؛ وكذا لو مات في قتال البغاة أو

مات في القتال لا بسبب القتال. (و) الثاني (السقط الذي لم يستهل) أي لم يرفع صوته (صارخا). فإن استهل صارخا أو بكى فحكمه كالكبير. والسقط بتثليث السين الولد النازل قبل تمامه، مأخوذ من السقوط.

(ويغسل الميت وترا) ثلاثا أو خمسا أو أكثر من ذلك، (ويكون في أول غسله سدر) أي يسن أن يستعين الغاسل في الغسلة الأولى من غسلات الميت بسدر أو خطمي، (و) يكون (في آخره) أي آخر غسل الميت غير المحرم (شيء) قليل (من كافور) بحيث لا يغير الماء.

واعلم أن أقل غسل الميت تعميم بدنه بالماء مرة واحدة؛ وأما أكمله فمذكور في المبسوطات.

(ويكفن) الميت، ms038 ذكرا كان أو أنثى، بالغا كان أو لا (في ثلاثة أثواب بيض)، وتكون كلها لفائف متساوية طولا وعرضا، تستر كل واحدة منها

جميع البدن (ليس فيها قميص ولا عمامة). وإن كفن الذكر في خمسة فهي الثلاثة المذكورة وقميص وعمامة، أو المرأة في خمسة، فهي إزار وخمار وقميص ولفافتان.

وأقل الكفن ثوب واحد يستر عورة الميت على الأصح في الروضة وشر ح المهذب. ويختلف قدره بذكورة الميت وأنوثته. ويكون الكفن من جنس ما يلبسه الشخص في حياته.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 31, NULL, '• الصلاة على الجنازة', '(ويكبر عليه) أي الميت إذا صلي عليه (أربع تكبيرات)، منها تكبيرة الإحرام؛ ولو كبر خمسا لم تبطل، لكن لو خمس إمامه لم يتابعه بل يسلم أو ينتظره ليسلم معه، وهو أفضل. و (يقرأ) المصلي (الفاتحة بعد) التكبيرة (الأولى)، ويجوز قراءتها بعد غير الأولى؛ (ويصلى على النبي - صلى الله عليه وسلم - بعد) التكبيرة (الثانية). وأقل الصلاة عليه - صلى الله عليه وسلم - اللهم صل على محمد. (ويدعو للميت بعد الثالثة، فيقول): وأقل الدعاء للميت: «اللهم اغفر له»؛ وأكمله مذكور في قول المصنف في بعض نسخ المتن، وهو: «اللهم إن

هذا عبدك وابن عبديك، خرج من روح الدنيا وسعتها، ومحبوبه وأحباؤه فيها إلى ظلمة القبر وما هو لاقيه، كان يشهد أن لا إله إلا أنت وحدك، لا شريك لك، وأن محمدا عبدك ورسولك، وأنت أعلم به منا؛ اللهم إنه نزل بك وأنت خير منزول به، وأصبح فقيرا إلى رحمتك، وأنت غني عن عذابه، وقد جئناك راغبين إليك شفعاء له؛ اللهم إن كان محسنا فزد في إحسانه، وإن كان مسيئا فتجاوز عنه، ولقه برحمتك رضاك، وقه فتنة القبر وعذابه، وافسح له في قبره، وجاف الأرض عن جنبيه، ولقه برحمتك الأمن من عذابك، حتى تبعثه آمنا إلى جنتك برحمتك يا أرحم

الراحمين».

ويقول في الرابعة: «اللهم لا تحرمنا أجره، ولا تفتنا بعده، واغفر لنا وله». ويسلم بعد الرابعة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 32, NULL, '• دفن الميت', '(ويدفن) الميت (في لحد مستقبل القبلة). واللحد بفتح اللام وضمها وسكون الحاء ما يحفر في أسفل ms039 جانب القبر من جهة القبلة قدر ما يسع الميت ويستره. والدفن في اللحد أفضل من الدفن في الشق إن صلبت الأرض. والشق أن يحفر في وسط القبر كالنهر، ويبنى جانباه، ويوضع الميت بينهما ويسقف عليه بلبن ونحوه، ويوضع الميت عند مؤخر القبر. وفي بعض النسخ بعد مستقبل القبلة زيادة، وهي:

(ويسل من قبل رأسه) سلا (برفق)، لا بعنف (ويقول الذي يلحده: «بسم الله وعلى ملة رسول الله - صلى الله عليه وسلم».

ويضجع في القبر بعد أن يعمق قامة وبسطة)، ويكون الاضطجاع مستقبل القبلة على جنبه الأيمن؛ فلو دفن مستدبر القبلة أو مستلقيا نبش، ووجه للقبلة مالم يتغير. (ويسطح القبر) ولا يسنم، (ولا يبنى عليه ولا يجصص)، أي يكره تجصيصه بالجص وهو النورة المسماة بالجير.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 33, NULL, '• البكاء على الميت والتعزية على أهله', '(ولا بأس بالبكاء على الميت) أي يجوز البكاء عليه قبل الموت وبعده؛ وتركه أولى، ويكون البكاء عليه (من غير نوح)، أي رفع صوت بالندب (ولا شق ثوب) - وفي بعض النسخ «جيب» بدل ثوب. والجيب طوق القميص.

(ويعزى أهله) أي أهل الميت صغيرهم وكبيرهم، ذكرهم وأنثاهم إلا الشابة؛ فلا يعزيها إلا محارمها. والتعزية سنة قبل الدفن وبعده (إلى ثلاثة أيام من) بعد (دفنه) إن كان المعزي والمعزى حاضرين؛ فإن كان أحدهما غائبا امتدت التعزية إلى حضوره.

والتعزية لغة التسلية لمن أصيب بمن يعز عليه، وشرعا الأمر بالصبر والحث عليه بوعد الأجر والدعاء

للميت بالمغفرة وللمصاب بجبر المصيبة.

(ولا يدفن اثنان في قبر) واحد (إلا لحاجة) كضيق الأرض وكثرة الموتى.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 104, 'كتاب أحكام الزكاة', 'كتاب أحكام الزكاة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وهي لغة النماء، وشرعا اسم لمال مخصوص، يؤخذ من مال مخصوص، على وجه مخصوص، يصرف لطائفة مخصوصة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• ما تجب فيه الزكاة', '(تجب الزكاة في خمسة أشياء، وهي: المواشي). ولو عبر بالنعم لكان أولى، لأنها أخص من المواشي. والكلام هنا في الأخص. (والأثمان) وأريد بها الذهب والفضة، (والزروع) وأريد بها الأقوات، (والثمار، وعروض التجارة)، وسيأتي كل من الخمسة مفصلا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• زكاة المواشي', '(فأما المواشي فتجب الزكاة في ثلاثة أجناس منها، وهي: ms040 الإبل، والبقر، والغنم)؛ فلا تجب في الخيل والرقيق والمتولد مثلا بين غنم وظباء.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, '• شروط وجوب زكاة المواشي', '(وشرائط وجوبها ستة أشياء). وفي بعض نسخ المتن ست خصال: (1 - الإسلام)؛ فلا تجب على كافر أصلي. وأما المرتد فالصحيح أن ماله موقوف؛ فإن عاد إلى الإسلام وجبت عليه، وإلا فلا. (2 - والحرية)، فلا زكاة على رقيق. وأما المبعض فتجب عليه الزكاة فيما ملكه ببعض الحر. (3 - والملك التام) أي فالملك الضعيف لا زكاة فيه، كالمشتري قبل قبضه لا تجب فيه الزكاة كما يقتضيه كلام المصنف تبعا للقول القديم، لكن الجديد الوجوب. (4 - والنصاب، 5 - والحول)؛ فلو نقص كل منهما فلا زكاة. (6 - والسوم) وهو

الرعي في كلاء مباح؛ فلو علفت الماشية معظم الحول فلا زكاة فيها، وإن علفت نصفه فأقل قدرا تعيش بدونه بلا ضرر بين وجبت زكاتها؛ وإلا فلا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, '• زكاة الذهب والفضة', '(وأما الأثمان فشيئان: الذهب، والفضة) مضروبين كانا أو لا، وسيأتي نصابهما.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, '• شروط وجوب زكاة الذهب والفضة', '(وشرائط وجوب الزكاة فيها) أي الأثمان (خمسة أشياء:

الإسلام، والحرية، والملك التام، والنصاب، والحول). وسيأتي بيان ذلك.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, '• زكاة الزروع والثمار', '(وأما الزروع) وأراد المصنف بها المقتات من حنطة وشعير وعدس وأرز؛ وكذا ما يقتات اختيارا كذرة وحمص؛ (فتجب الزكاة فيها بثلاثة شرائط: أن يكون مما يزرعه) أي يستنبته (الآدميون)؛ فإن نبت بنفسه بحمل ماء أو هواء فلا زكاة فيه، (وأن يكون قوتا مدخرا). وسبق قريبا بيان المقتات. وخرج بالقوت ما لا يقتات من الأبزار نحو الكمون، (وأن يكون نصابا، وهو خمسة أوسق لا قشر عليها). وفي بعض النسخ «وأن يكون خمسة أوسق» بإسقاط نصاب.

(وأما الثمار فتجب الزكاة في شيئين، منها: ثمرة النخل، وثمرة الكرم). والمراد بهاتين الثمرتين التمر والزبيب.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, '• شروط وجوب زكاة الزروع والثمار', '(وشرائط وجوب الزكاة فيها) أي الثمار (أربعة أشياء: الإسلام، والحرية، والملك التام، والنصاب). فمتى انتفى شرط من ذلك فلا وجوب.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, '• زكاة التجارة', '(وأما عروض التجارة فتجب الزكاة فيها بالشرائط المذكورة) سابقا (في الأثمان). والتجارة وهي التقليب في المال ms041 لغرض الربح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, '• نصاب الإبل', '{فصل} (وأول نصاب الإبل خمس؛ وفيها شاة) أي جدعة ضأن، لها سنة ودخلت في الثانية، أو ثنية معز، لها سنتان ودخلت في الثالثة. وقوله: (وفي عشر شاتان، وفي خمسة عشر ثلاث شياه، وفي عشرين أربع شياه، وفي خمس وعشرين بنت مخاض من الإبل، وفي ست وثلاثين بنت لبون، وفي ست وأربعين حقة، وفي إحدى وستين جذعة، وفي ست وسبعين بنتا لبون، وفي إحدى وتسعين حقتان، وفي مائة وإحدى وعشرين ثلاث بنات لبون) إلى آخره ظاهر غني عن الشرح. وبنت المخاض لها سنة ودخلت في الثانية. وبنت اللبون لها سنتان ودخلت في الثالثة. والحقة لها ثلاث سنين ودخلت في الرابعة. والجذعة لها أربع سنين ودخلت في الخامسة. وقوله: (ثم في كل) أي ثم بعد زيادة التسع على مائة وإحدى

وعشرين وزيادة عشر بعد زيادة التسع وجملة ذلك مائة وأربعون يستقيم الحساب على أن في كل (أربعين بنت لبون، وفي كل خمسين حقة) ففي مائة وأربعين حقتان وبنت لبون وفي مائة وخمسين ثلاث حقاق وهكذا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 11, NULL, '• نصاب البقر', '{فصل} (وأول نصاب البقر ثلاثون، و) يجب (فيها) وفي بعض النسخ «وفيه» - أي النصاب (تبيع) ابن سنة ودخل في الثانية. سمي بذلك لتبعية أمه في المرعى. ولو أخرج تبيعة أجزأت بطريق الأولى. (و) يجب (في أربعين مسنة)

لها سنتان ودخلت في الثالثة. سميت بذلك لتكامل أسنانها. ولو أخرج عن أربعين تبيعين أجزأه على الصحيح. (وعلى هذا أبدا فقس). وفي مائة وعشرين ثلاث مسنات أو أربعة أتبعة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 12, NULL, '• نصاب الغنم', '{فصل} (وأول نصاب الغنم أربعون، وفيها شاة جذعة من الضأن أو ثنية من المعز)، وسبق بيان الجذعة والثنية. وقوله: (وفي مائة وإحدى وعشرين شاتان، وفي مائتين وواحدة ثلاث شياه، وفي أربعمائة أربع شياه، ثم في كل مائة شاة) إلى آخره ظاهر غني عن الشرح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 13, NULL, '• زكاة المال المشترك', '{فصل} (والخليطان يزكيان) بكسر الكاف (زكاة) الشخص (الواحد). والخلطة قد تفيد الشريكين تخفيفا، بأن يملكا ثمانين شاة بالسوية بينهما فيلزمهما شاة، وقد تفيد تثقيلا، بأن يملكا ms042 أربعين شاة بالسوية بينهما فيلزمهما شاة، وقد تفيد تخفيفا على أحدهما وتثقيلا على الآخر، كأن

يملكا ستين، لأحدهما ثلثها وللآخر ثلثاها، وقد لا تفيد تخفيفا ولا تثقيلا، كأن يملكا مائتي شاة بالسوية بينهما.

وإنما يزكيان زكاة الواحد (بسبع شرائط: إذا كان) وفي بعض النسخ «إن كان» (المراح واحدا)، وهو بضم الميم مأوى الماشية ليلا (والمسرح واحدا). والمراد بالمسرح الموضع الذي تسرح إليه الماشية، (والمرعى) والراعي (واحدا، والفحل واحدا) أي إن اتحد نوع الماشية؛ فإن اختلف نوعها كضأن ومعز فيجوز أن يكون لكل منهما فحل يطرق ماشيته، (والمشرب) أي الذي تشرب منه الماشية، كعين أو نهر أو غيرهما (واحدا). وقوله: (والحالب واحدا) هو أحد الوجهين في هذه المسألة،

والأصح عدم الاتحاد في الحالب؛ وكذا المحلب بكسر الميم، وهو الإناء الذي يحلب فيه، (وموضع الحلب) بفتح اللام (واحدا). وحكى النووي اسكان اللام، وهو اسم اللبن، ويطلق على المصدر. قال بعضهم هو المراد هنا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 14, NULL, '• نصاب الذهب والفضة', '{فصل} (ونصاب الذهب عشرون مثقالا) تحديدا بوزن مكة، والمثقال درهم وثلاثة أسباع درهم، (وفيه) أي نصاب الذهب (ربع العشر، وهو نصف مثقال، وفيما زاد) على عشرين مثقالا (بحسابه) وإن قل الزائد.

(ونصاب الورق) بكسر الراء، وهو الفضة (مائتا درهم، وفيه ربع العشر، وهو خمسة دراهم وفيما زاد) على المائتين (بحسابه) وإن قل الزائد، ولا شيء في المغشوش من ذهب أو فضة حتى يبلغ خالصه نصابا. (ولا يجب في الحلي المباح زكاة). أما المحرم كسوار وخلخال لرجل وخنثى فتجب الزكاة فيه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 15, NULL, '• نصاب الزروع والثمار', '{فصل} (ونصاب الزروع والثمار خمسة أوسق) من الوسق، مصدر بمعنى الجمع، لأن الوسق يجمع الصيعان، (وهي) أي الخمسة أوسق (ألف وستمائة رطل بالعراقي)؛ وفي بعض النسخ «بالبغدادي»، (وما زاد

فبحسابه). ورطل بغداد عند النووي مائة وثمانية وعشرون درهما وأربعة أسباع درهم، (وفيها) أي الزروع والثمار (إن سقيت بماء السماء) وهو المطر ونحوه كالثلج (أو السيح) وهو الماء الجاري على الأرض بسبب سد النهر فيصعد الماء على وجه الأرض فيسقيها (العشر، وإن سقيت بدولاب) ms043 بضم الدال وفتحها، ما يديره الحيوان (أو) سقيت (بنضح) من نهر أو بئر بحيوان كبعير أو بقرة (نصف العشر). وفيما سقي بماء السماء والدولاب مثلا سواء ثلاثة أرباع العشر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 16, NULL, '• تقويم عروض التجارة', '{فصل} (وتقوم عروض التجارة عند آخر الحول بما اشتريت به) سواء كان ثمن مال التجارة نصابا أم لا؛ فإن بلغت قيمة العروض آخر الحول نصابا زكاها، وإلا فلا (ويخرج من ذلك) بعد بلوغ قيمة مال التجارة نصابا (ربع العشر) منه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 17, NULL, '• زكاة المعدن والركاز', '(وما استخرج من معادن الذهب والفضة يخرج منه) إن بلغ نصابا (ربع العشر في الحال) إن كان المستخرج من أهل وجوب الزكاة. والمعادن جمع معدن بفتح داله وكسرها، اسم لمكان خلق الله تعالى فيه ذلك من موات أو ملك. (وما يوجد من الركاز) وهو دفين الجاهلية، وهي الحالة التي كانت عليها العرب قبل الإسلام من الجهل بالله ورسوله وشرائع الإسلام (ففيه) أي الركاز (الخمس). ويصرف مصرف الزكاة على المشهور، ومقابله أنه يصرف إلى أهل الخمس المذكورين في آية الفيء.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 18, NULL, '• زكاة الفطر', '{فصل} (وتجب زكاة الفطر) ويقال لها زكاة الفطرة أي الخلقة (بثلاثة أشياء:

الإسلام)؛ فلا فطرة على كافر أصلي إلا في رقيقه وقريبه المسلمين، (وبغروب الشمس من آخر يوم من شهر رمضان). وحينئذ فتخرج زكاة الفطر عمن مات بعد الغروب دون من ولد بعده، (ووجود الفضل) وهو يسار الشخص بما يفضل (عن قوته وقوت عياله في ذلك اليوم)، أي يوم عيد الفطر وكذا ليلته أيضا.

(ويزكي) الشخص (عن نفسه وعمن تلزمه نفقته من المسلمين)؛ فلا يلزم المسلم فطرة عبد وقريب وزوجة كفار وإن وجبت نفقتهم، وإذا وجبت الفطرة على الشخص فيخرج (صاعا من قوت بلده) إن كان بلديا. فإن كان في البلد أقوات غلب بعضها وجب الإخراج منه. ولو كان الشخص في بادية لا قوت فيها أخرج من قوت أقرب البلاد إليه. ومن لم يوسر بصاع بل ببعضه لزمه ذلك البعض.

(وقدره) أي الصاع (خمسة أرطال وثلث بالعراقي)، وسبق بيان الرطل العراقي في نصاب الزروع. ms044', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 19, NULL, '• من تدفع له الزكاة', '{فصل} (وتدفع الزكاة إلى الأصناف الثمانية الذين ذكرهم الله تعالى في كتابه العزيز في قوله تعالى: {إنما الصدقات للفقراء والمساكين والعاملين عليها والمؤلفة قلوبهم وفي الرقاب والغارمين وفي سبيل الله وابن السبيل} [التوبة: 60]، هو ظاهر غني عن الشرح إلا معرفة الأصناف المذكورة. فالفقير في الزكاة هو الذي لا مال له ولا كسب يقع موقعا من حاجته؛ أما الفقير العرايا فهو من لا نقد بيده.

والمسكين من قدر على مال أو كسب يقع كل منهما موقعا من كفايته ولا يكفيه، كمن يحتاج إلى عشرة دراهم وعنده سبعة. والعامل من استعمله الإمام على أخذ الصدقات ودفعها لمستحقيها. والمؤلفة قلوبهم وهم أربعة أقسام: أحدها مؤلفة المسلمين، وهو من أسلم ونيته ضعيفة في الإسلام فتألف بدفع الزكاة له، وبقية الأقسام مذكورة في المبسوطات. وفي الرقاب وهم المكاتبون كتابة صحيحة؛ أما المكاتب كتابة فاسدة فلا يعطى من سهم المكاتبين. والغارم على ثلاثة أقسام: أحدها من استدان دينا لتسكين فتنة بين طائفتين في قتيل لم يطهر قاتله، فتحمل دينا بسبب ذلك فيقضى دينه من سهم الغارمين، غنيا كان أو فقيرا. وإنما يعطى الغارم عند بقاء الدين عليه؛ فإن أداه من ماله أو دفعه ابتداء لم يعط من سهم الغارمين؛ وبقية أقسام الغارمين في المبسوطات. وأما سبيل الله فهم الغزاة الذين لا سهم لهم في ديوان المرتزقة، بل هم متطوعون بالجهاد. وأما ابن سبيل فهو من ينشئ سفرا من بلد الزكاة أو يكون مجتازا ببلدها، ويشترط فيه الحاجة وعدم المعصية.

وقوله: (وإلى من يوجد منهم) أي الأصناف فيه إشارة إذا فقد بعض الأصناف ووجد البعض تصرف لمن يوجد منهم؛ فإن فقدوا كلهم حفظت الزكاة حتى يوجدوا كلهم أو بعضهم. (ولا يقتصر) في إعطاء الزكاة (على أقل من ثلاثة من كل صنف) من الأصناف الثمانية (إلا العامل)؛ فإنه يجوز أن يكون واحدا إن حصلت به الحاجة - وفي بعض النسخ «الكفاية» - فإن صرف لاثنين من كل صنف غرم للثالث أقل متمول. وقيل يغرم له الثلث. ms045', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 20, NULL, '• من لا تدفع له الزكاة', '(وخمسة لا يجوز دفعها) أي الزكاة (إليهم: الغني بمال أو كسب، والعبد، وبنو هاشم، وبنو المطلب) سواء منعوا حقهم من خمس الخمس أم لا، وكذا عتقاؤهم لا يجوز دفع الزكاة إليهم. ويجوز لكل منهم أخذ صدقة التطوع على المشهور، (والكافر). وفي بعض النسخ «ولا تصح للكافر».

(ومن تلزم المزكي نفقته لا يدفعها) أي الزكاة (إليهم باسم

الفقراء والمساكين). ويجوز دفعها إليهم باسم كونهم غزاة وغارمين مثلا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 105, 'كتاب بيان أحكام الصيام', 'كتاب بيان أحكام الصيام');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وهو والصوم مصدران، معناهما لغة الإمساك، وشرعا إمساك عن مفطر بنية مخصوصة، جميع نهار قابل للصوم، من مسلم عاقل طاهر من حيض ونفاس.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• شروط وجوب الصيام', '(وشرائط وجوب الصيام ثلاثة أشياء): وفي بعض النسخ «أربعة أشياء»: (الإسلام، والبلوغ، والعقل؛ والقدرة على الصوم). وهذا هو الساقط على نسخة الثلاثة؛ فلا يجب الصوم على المتصف بأضداد ذلك.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• فرائض الصوم', '(وفرائض الصوم أربعة أشياء): أحدها (النية) بالقلب؛ فإن كان الصوم فرضا كرمضان أو نذرا فلا بد من إيقاع النية ليلا، ويجب التعيين في صوم الفرض كرمضان؛ وأكمل

نية صومه أن يقول الشخص: «نويت صوم غد عن أداء فرض رمضان هذه السنة لله تعالى». (و) الثاني (الإمساك عن الأكل والشرب) وإن قل المأكول والمشروب عند التعمد؛ فإن أكل ناسيا أو جاهلا لم يفطر إن كان قريب عهد بالإسلام أو نشأ بعيدا عن العلماء، وإلا أفطر. (و) الثالث (الجماع) عامدا؛ وأما الجماع ناسيا فكالأكل ناسيا. (و) الرابع (تعمد التقيء)؛ فلو غلبه القيء لم يبطل صومه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, '• ما يفطر به الصائم', '(والذي يفطر به الصائم عشرة أشياء): أحدها وثانيها (ما وصل عمدا إلى الجوف) المنفتح (أو) غير المنفتح كالوصول من مأمومة إلى (الرأس)؛ والمراد إمساك الصائم عن وصول عين إلى ما يسمى جوفا. (و) الثالث (الحقنة في أحد السبيلين)، وهي دواء يحقن به المريض في قبل أو دبر، المعبر عنهما في المتن بالسبيلين. (و) الرابع (القيء عمدا)؛ فإن لم يتعمد لم يبطل صومه كما سبق.

(و) الخامس (الوطء عمدا في الفرج)؛ فلا ms046 يفطر الصائم بالجماع ناسيا كما سبق. (و) السادس (الإنزال) وهو خروج المني (عن مباشرة) بلا جماع محرما كإخراجه بيده أو غير محرم كإخراجه بيد زوجته أو جاريته. واحترز بمباشرة عن خروج المني باحتلام، فلا إفطار به جزما. (و) السابع إلى آخر العشرة (الحيض، والنفاس، والجنون، والردة). فمتى طرأ شيء منها في أثناء الصوم أبطله.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, '• ما يستحب للصائم', '(ويستحب في الصوم ثلاثة أشياء): أحدها (تعجيل الفطر) إن تحقق الصائم غروب الشمس؛ فإن شك فلا يعجل الفطر. ويسن أن يفطر على تمر، وإلا فماء. (و) الثاني (تأخير السحور) مالم يقع في شك، فلا يؤخر. ويحصل السحور بقليل الأكل والشرب. (و) الثالث (ترك الهجر) أي الفحش (من الكلام) الفاحش، فيصون الصائم لسانه عن الكذب والغيبة ونحو ذلك، كالشتم. وإن شتمه أحد

فليقل مرتين أو ثلاثا: «إني صائم»، إما بلسانه - كما قال النووي في الأذكار - أو بقلبه - كما نقله الرافعي عن الأئمة. واقتصر عليه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, '• الأيام التي يحرم فيها الصوم ويكره', '(ويحرم صيام خمسة أيام: العيدان) أي صوم يوم عيد الفطر وعيد الأضحى، (وأيام التشريق) وهي (الثلاثة) التي بعد يوم النحر.

(ويكره) تحريما (صوم يوم الشك) بلا سبب يقتضي صومه. وأشار المصنف لبعض صور هذا السبب بقوله: (إلا أن يوافق عادة له) في تطوعه، كمن عادته صيام يوم وإفطار يوم؛ فوافق صومه يوم الشك، وله صيام يوم الشك أيضا عن قضاء ونذر. ويوم الشك هو يوم الثلاثين من شعبان إذا لم ير الهلال ليلتها مع الصحو، أو تحدث الناس برؤيته ولم يعلم عدل رآه، أو شهد برؤيته صبيان أو عبيد أو فسقة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, '• الجماع في نهار رمضان', '(ومن وطئ في نهار رمضان) حال كونه (عامدا في الفرج) وهو مكلف بالصوم ونوى من الليل وهو آثم بهذا الوطء لأجل الصوم، (فعليه القضاء والكفارة؛ وهي عتق رقبة مؤمنة). وفي بعض النسخ «سليمة من العيوب المضرة بالعمل والكسب»؛ (فإن لم يجدها فصيام

شهرين متتابعين؛ فإن لم يستطع) صومهما (فإطعام ستين مسكينا) أو فقيرا، (لكل مسكين مد) أي مما يجزئ ms047 في صدقة الفطر؛ فإن عجز عن الجميع استقرت الكفارة في ذمته؛ فإذا قدر بعد ذلك على خصلة من خصال الكفارة فعلها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, '• قضاء الصوم عن الميت', '(ومن مات وعليه صيام) فائت (من رمضان) بعذر، كمن أفطر فيه لمرض ولم يتمكن من قضائه، كأن استمر مرضه حتى مات فلا إثم عليه في هذا الفائت، ولا تدارك له بالفدية؛ وإن فات بغير عذر ومات قبل التمكن من قضائه (أطعم عنه) أي أخرج الولي عن الميت من تركته (لكل يوم) فات (مد) طعام، وهو رطل وثلث بالبغدادي، وهو بالكيل نصف قدح مصري. وما ذكره المصنف هو القول الجديد؛ والقديم لا يتعين الإطعام، بل يجوز للولي أيضا أن يصوم عنه، بل يسن له ذلك - كما في شرح المهذب، وصوب في الروضة الجزم بالقديم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, '• صوم الكبير', '(والشيخ الهرم) والعجوز والمريض الذي لا يرجى برؤه (إذاعجز) كل منهم (عن الصوم يفطر ويطعم عن كل يوم مدا)، ولا يجوز تعجيل المد قبل رمضان، ويجوز بعد فجر كل يوم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, '• صوم الحامل والمرضع', '(والحامل والمرضع إن خافتا على أنفسهما) ضررا يلحقهما بالصوم، كضرر المريض (أفطرتا، و) وجب (عليهما القضاء، وإن خافتا على أولادهما) أي إسقاط الولد في الحامل وقلة اللبن في المرضع (أفطرتا، و) وجب (عليهما القضاء) للإفطار (والكفارة) أيضا. والكفارة أن يخرج (عن كل يوم مد؛ وهو) كما سبق (رطل وثلث بالعراقي). ويعبر عنه بالبغدادي.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 11, NULL, '• صوم المريض والمسافر', '(والمريض والمسافر سفرا طويلا) مباحا إن تضررا بالصوم (يفطران ويقضيان). وللمريض إن كان مرضه مطبقا ترك النية من الليل، وإن لم

يكن مطبقا كما لو كان يحم وقتا دون وقت، وكان وقت الشروع في الصوم محموما فله ترك النية، وإلا فعليه النية ليلا؛ فإن عادت الحمى واحتاج للفطر أفطر. وسكت المصنف عن صوم التطوع، وهو مذكور في المطولات، ومنه صوم عرفة وعاشوراء وتاسوعا وأيام البيض وستة من شوال.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 12, NULL, '• الاعتكاف', '{فصل} في أحكام الاعتكاف. وهو لغة الإقامة على الشيء من خير أو شر، وشرعا إقامة بمسجد بصفة مخصوصة. (والاعتكاف سنة مستحبة) في ms048 كل وقت، وهو في العشر الأواخر من رمضان أفضل منه في غيره لأجل طلب ليلة القدر. وهي عند الشافعي - رضي الله عنه - منحصرة في العشر الأخير من رمضان؛ فكل ليلة منه محتملة لها، لكن ليالي الوتر أرجاها، وأرجى ليالي الوتر ليلة الحادي أو الثالث والعشرين.

(وله) أي للاعتكاف المذكور (شرطان): أحدهما (النية)، وينوي في الاعتكاف المنذور الفرضية أو النذر، (و) الثاني (اللبث في المسجد). ولا يكفي في اللبث قدر الطمأنينة،

بل الزيادة عليه بحيث يسمى ذلك اللبث عكوفا.

وشرط المعتكف إسلام وعقل ونقاء عن حيض ونفاس وجنابة؛ فلا يصح اعتكاف كافر ومجنون وحائض ونفساء وجنب. ولو ارتد المعتكف أو سكر بطل اعتكافه.

(ولا يخرج) المعتكف (من الاعتكاف المنذور إلا لحاجة الإنسان) من بول وغائط وما في معناهما كغسل جنابة (أو عذر من حيض) أو نفاس، فتخرج المرأة من المسجد لأجلهما (أو) عذر من (مرض لا يمكن المقام معه) في المسجد، بأن كان يحتاج لفرش وخادم وطبيب أو يخاف تلويث المسجد كإسهال وإدرار بول. وخرج بقول المصنف لا يمكن إلخ المرض الخفيف كحمى خفيفة، فلا يجوز الخروج من المسجد بسببها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 13, NULL, '• مبطلات الاعتكاف', '(ويبطل) الاعتكاف (بالوطء) مختارا ذاكرا للاعتكاف عالما بالتحريم. وأما مباشرة المعتكف بشهوة فتبطل اعتكافه إن أنزل، وإلا فلا', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 106, 'كتاب أحكام الحج', 'كتاب أحكام الحج');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وهو لغة القصد، وشرعا قصد البيت الحرام للنسك.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• شروط وجوب الحج', '(وشرائط وجوب الحج سبعة أشياء). وفي بعض النسخ «سبع خصال»: (الإسلام، والبلوغ، والعقل، والحرية)؛ فلا يجب الحج على المتصف بضد ذلك، (ووجود الزاد) وأوعيته إن احتاج إليها. وقد لا يحتاج إليها كشخص قريب من مكة. ويشترط أيضا وجود الماء في المواضع المعتاد حمل الماء منها بثمن المثل، (و) وجود (الراحلة) التي تصلح لمثله بشراء أو استئجار. هذا إذا كان الشخص بينه وبين مكة مرحلتان فأكثر، سواء قدر على المشي أم لا، فإن كان بينه وبين مكة دون مرحلتين، وهو قوي على المشي لزمه الحج بلا راحلة. ويشترط كون ما ذكر فاضلا عن دينه وعن مؤنة من عليه ms049 مؤنتهم مدة ذهابه وإيابه، وفاضلا أيضا عن مسكنه اللائق به وعن عبد يليق به، (وتخلية الطريق). والمراد بالتخلية هنا أمن الطريق ظنا بحسب ما يليق بكل مكان؛ فلو لم يأمن الشخص على

نفسه أو ماله أو بضعه لم يجب عليه الحج. وقوله: (وإمكان المسير) ثابت في بعض النسخ. والمراد بهذا الإمكان أن يبقى من الزمان بعد وجود الزاد والراحلة ما يمكن فيه السير المعهود إلى الحج؛ فإن أمكن إلا أنه يحتاج لقطع مرحلتين في بعض الأيام لم يلزمه الحج للضرر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• أركان الحج', '(وأركان الحج أربعة): أحدها (الإحرام مع النية) أي نية الدخول في الحج. (و) الثاني (الوقوف بعرفة). والمراد حضور المحرم بالحج لحظة بعد زوال الشمس يوم عرفة، وهو اليوم التاسع من ذي الحجة بشرط كون الواقف أهلا للعبادة، لا مجنونا ولا مغمى عليه. ويستمر وقت الوقوف إلى فجر يوم النحر، وهو العاشر من ذي الحجة. (و) الثالث (الطواف بالبيت) سبع طوفات جاعلا في طوافه البيت عن يساره مبتدئا بالحجر الأسود محاذيا له في مروره بجميع بدنه؛ فلو بدأ بغير الحجر لم يحسب له.

(و) الرابع (السعي بين الصفا والمروة) سبع مرات. وشرطه أن يبدأ في أول مرة بالصفا ويختم بالمروة، ويحسب ذهابه من الصفا إلى المروة مرة، وعوده منها إليه مرة أخرى. والصفا بالقصر طرف جبل أبي قبيس، والمروة بفتح الميم علم على الموضع المعروف بمكة.

وبقي من أركان الحج الحلق أو التقصير إن جعلنا كلا منهما نسكا، وهو المشهور. فإن قلنا إن كلا منهما استباحة محظور فليسا من الأركان. ويجب تقديم الإحرام على كل الأركان السابقة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, '• أركان العمرة', '(وأركان العمرة ثلاثة) - كما في بعض النسخ، وفي بعضها «أربعة أشياء»: (الإحرام، والطواف، والسعي؛ والحلق أو التقصير في أحد القولين). وهو الراجح - كما سبق قريبا؛ وإلا فلا يكون من أركان العمرة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, '• واجبات الحج', '(وواجبات الحج غير الأركان ثلاثة أشياء):

أحدها (الإحرام من الميقات) الصادق بالزماني والمكاني؛ فالزماني بالنسبة للحج شوال وذو القعدة وعشر ليال من ذي الحجة. وأما بالنسبة للعمرة ms050 فجميع السنة وقت لإحرامها. والميقات المكاني للحج في حق المقيم بمكة نفس مكة، مكيا كان أو آفاقيا. وأما غير المقيم في مكة فميقات المتوجه من المدينة الشريفة ذو الحليفة، والمتوجه من الشام ومصر

والمغرب الجحفة، والمتوجه من تهامة اليمن يلملم، والمتوجه من نجد الحجاز ونجد اليمن قرن، والمتوجه من المشرق ذات عرق. (و) الثاني (رمي الجمار الثلاث) يبدأ بالكبرى ثم الوسطى ثم جمرة العقبة. ويرمى كل جمرة بسبع حصيات واحدة بعد واحدة؛ فلو رمى حصاتين دفعة واحدة حسبت واحدة، ولو رمى حصاة واحدة سبع مرات كفى. ويشترط كون المرمى به حجرا، فلا يكفي غيره كلؤلؤ وجص، (و) الثالث (الحلق) أو التقصير. والأفضل للرجل الحلق، وللمرأة التقصير. وأقل الحلق إزالة ثلاث شعرات من الرأس حلقا أو تقصيرا أو نتفا أو إحراقا أو قصا. ومن لا شعر برأسه يسن له إمرار الموسى عليه. ولا يقوم شعر غير الرأس من اللحية وغيرها مقام شعر الرأس.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, '• سنن الحج', '(وسنن الحج سبع): أحدها (الإفراد، وهو تقديم الحج على العمرة)، بأن يحرم أولا بالحج من ميقاته ويفرغ منه، ثم يخرج عن مكة إلى أدنى الحل فيحرم بالعمرة، ويأتي بعملها؛ ولو عكس لم يكن مفردا.

(و) الثاني (التلبية)، ويسن الإكثار منها في دوام الإحرام. ويرفع الرجل صوته بها. ولفظها: «لبيك اللهم لبيك، لبيك لا شريك لك لبيك، إن الحمد والنعمة لك والملك، لا شريك لك». وإذا فرغ من التلبية صلى على النبي - صلى الله عليه وسلم - وسأل الله تعالى الجنة ورضوانه واستعاذ به من النار. (و) الثالث (طواف القدوم). ويختص بحاج دخل مكة قبل الوقوف بعرفة. والمعتمر إذا طاف العمرة أجزأه عن طواف القدوم. (و) الرابع (المبيت بمزدلفة). وعده من السنن هو ما يقتضيه كلام الرافعي، لكن الذي في زيادة الروضة وشرح المهذب أن المبيت بمزدلفة واجب. (و) الخامس (ركعتا الطواف) بعد الفراغ منه، ويصليهما خلف مقام إبراهيم عليه الصلاة والسلام؛ ويسر بالقراءة فيهما نهارا، ويجهر بها ليلا. وإذا لم يصلهما خلف المقام ففي الحجر، وإلا ففي ms051 المسجد، وإلا ففي أي موضع شاء من الحرم وغيره. (و) السادس (المبيت بمنى). هذا ما صححه الرافعي، لكن صحح النووي في زيادة الروضة الوجوب.

(و) السابع (طواف الوداع) عند إرادة الخروج من مكة لسفر، حاجا كان أو لا، طويلا كان السفر أو قصيرا. وما ذكره المصنف من سنيته قول مرجوح، لكن الأظهر وجوبه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, '• الإحرام', '(ويتجرد الرجل) حتما - كما في شرح المهذب - (عند الإحرام عن المخيط) من الثياب وعن منسوجها وعن معقودها وعن غير الثياب من خف ونعل، (ويلبس إزارا ورداء أبيضين) جديدين، وإلا فنظيفين.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, '• ما يحرم على المحرم', '{فصل} في أحكام محرمات الإحرام، وهي ما يحرم بسبب الإحرام. (ويحرم على المحرم عشرة أشياء):

أحدها (لبس المخيط) كقميص وقباء وخف، ولبس المنسوج كدرع، أو المعقود كلبد في جميع بدنه.

(و) الثاني (تغطية الرأس) أو بعضه (من الرجل) بما يعد ساترا، كعمامة وطين؛ فإن لم يعد ساترا لم يضر، كوضع يده على بعض رأسه، وكانغماسه في ماء واستظلاله بمحمل وإن مس رأسه، (و) تغطية (الوجه) أو بعضه (من المرأة) بما يعد ساترا، ويجب عليها أن تستر من وجهها ما لا يتأتى ستر جميع الرأس إلا به. ولها أن تسبل على وجهها ثوبا متجافيا عنه بخشبة ونحوها. والخنثى - كما قاله القاضي أبو الطيب - يؤمر بالستر ولبس المخيط. وأما الفدية فالذي عليه الجمهور أنه إن ستر وجهه أو رأسه لم تجب الفدية للشك وإن سترهما وجبت.

(و) الثالث (ترجيل) أي تسريح (الشعر) كذا عده المصنف من المحرمات، لكن الذي في شرح المهذب أنه مكروه، وكذا حك الشعر بالظفر.

(و) الرابع (حلقه) أي الشعر أو نتفه أو إحراقه. والمراد إزالته بأي طريق كان ولو ناسيا.

(و) الخامس (تقليم الأظفار) أي إزالتها من يد أو رجل بتقليم أو غيره، إلا إذا انكسر بعض ظفر المحرم وتأذى به، فله إزالة المنكسر فقط.

(و) السادس (الطيب) أي استعماله قصدا بما يقصد منه رائحة الطيب نحو مسك وكافور في ثوبه، بأن يلصقه به على الوجه المعتاد في استعماله أو ms052 في بدنه، ظاهره أو باطنه، كأكله الطيب، ولا فرق في مستعمل الطيب بين كونه رجلا أو امرأة، أخشم كان أو لا. وخرج ب «قصدا» ما لو ألقت عليه الريح طيبا أو أكره على استعماله أو جهل تحريمه أو نسي أنه محرم، فإنه لا فدية عليه؛ فإن علم تحريمه وجهل الفدية وجبت.

(و) السابع (قتل الصيد) البري المأكول أو ما في أصله مأكول من وحش وطير. ويحرم أيضا صيده، ووضع اليد عليه والتعرض لجزئه وشعره وريشه.

(و) الثامن (عقد النكاح) فيحرم على المحرم أن يعقد النكاح لنفسه أو غيره، بوكالة أو ولاية.

(و) التاسع (الوطء) من عاقل عالم بالتحريم، سواء جامع في حج أو

عمرة، في قبل أو دبر، من ذكر أو أنثى، زوجة أو مملوكة أو أجنبية.

(و) العاشر (المباشرة) فيما دون الفرج كلمس وقبلة (بشهوة)؛ أما بغير شهوة فلا يحرم.

(وفي جميع ذلك) أي المحرمات السابقة (الفدية) وسيأتي بيانها. والجماع المذكور تفسد به العمرة المفردة. أما التي في ضمن حج في قران فهي تابعة له صحة وفسادا. وأما الجماع فيفسد الحج قبل التحلل الأول بعد الوقوف أو قبله. أما بعد التحلل الأول فلا يفسد (إلا عقد النكاح؛ فإنه لا ينعقد ولا يفسده إلا الوطء في الفرج)، بخلاف المباشرة في غير الفرج، فإنها لا تفسده. (ولا يخرج) المحرم (منه بالفساد) بل يجب عليه المضي في فاسده. وسقط في بعض النسخ قوله: «في فاسده» أي النسك من حج أو عمرة، بأن يأتي ببقية أعماله.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, '• فوات الوقوف بعرفة', '(ومن) أي والحاج الذي (فاته الوقوف بعرفة) بعذر وغيره (تحلل)

حتما (بعمل عمرة)، فيأتي بطواف وسعي إن لم يكن سعي بعد طواف القدوم، (وعليه) أي الذي فاته الوقوف (القضاء) فورا، فرضا كان نسكه أو نفلا. وإنما يجب القضاء في فوات لم ينشأ عن حصر؛ فإن أحصر شخص وكان له طريق غير التي وقع الحصر فيها لزمه سلوكها وإن علم الفوات. فإن مات لم يقض عنه في الأصح. (و) عليه مع القضاء (الهدي). ويوجد في ms053 بعض النسخ زيادة، وهي: (ومن ترك ركنا) مما يتوقف عليه الحج (لم يحل من إحرامه حتى يأتي به) ولا يجبر ذلك الركن بدم؛ (ومن ترك واجبا) من واجبات الحج (لزمه الدم) وسيأتي بيان الدم. (ومن ترك سنة) من سنن الحج (لم يلزمه بتركها شيء). وظهر من كلام المتن الفرق بين الركن والواجب والسنة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, '• الدماء الواجبة في الإحرام', '{فصل} في أنواع الدماء الواجبة في الإحرام بترك واجب أو فعل حرام. (والدماء الواجبة في الإحرام خمسة أشياء: أحدها الدم الواجب بترك نسك) أي ترك مأمور به، كترك الإحرام من الميقات، (وهو) أي هذا الدم (على الترتيب) فيجب أولا بترك المأمور به (شاة) تجزئ في الأضحية، (فإن لم يجدها) أصلا أو وجدها بزيادة على ثمن مثلها (فصيام عشرة أيام: ثلاثة في الحج) تسن قبل يوم عرفة، فيصوم سادس ذي الحجة وسابعه وثامنه، (و) صيام (سبعة إذا رجع إلى أهله) ووطنه. ولا يجوز صيامها في أثناء الطريق. فإن أراد الإقامة بمكة صامها - كما في المحرر. ولو لم يصم الثلاثة في الحج ورجع لزمه صوم العشرة، وفرق بين الثلاثة والسبعة بأربعة أيام ومدة إمكان السير إلى الوطن. وما ذكره المصنف من كون الدم المذكور دم ترتيب موافق لما في الروضة وأصلها وشرح المهذب، لكن الذي في المنهاج تبعا للمحرر أنه دم ترتيب وتعديل؛ فيجب أولا شاة،

فإن عجز عنها اشترى بقيمتها طعاما وتصدق به، فإن عجز صام عن كل مد يوما.

(والثاني الدم الواجب بالحلق والترفه) كالطيب والدهن والحلق، إما لجميع الرأس أو لثلاث شعرات، (وهو) أي هذا الدم (على التخيير)، فيجب إما (شاة) تجزئ في الأضحية (أو صوم ثلاثة أيام، أو التصدق بثلاثة آصع على ستة مساكين) أو فقراء، لكل منهم نصف صاع من طعام يجزئ في الفطرة.

(والثالث الدم الواجب بإحصار، فيتحلل) المحرم بنية التحلل، بأن يقصد الخروج من نسكه بالإحصار (ويهدي) أي يذبح (شاة) حيث أحصر ويحلق رأسه بعد الذبح.

(والرابع الدم الواجب بقتل الصيد، وهو) أي هذا الدم (على التخيير) بين ms054 ثلاثة أمور (إن كان الصيد مما له مثل). والمراد بمثل الصيد ما يقاربه في الصورة.

وذكر المصنف الأول من هذه الثلاثة في قوله: (أخرج المثل من النعم) أي يذبح المثل من النعم ويتصدق به على مساكين الحرم وفقرائه؛ فيجب في قتل النعامة بدنة، وفي بقر الوحش وحماره بقرة، وفي الغزال عنز. وبقية الصور الذي له مثل من النعم مذكورة في المطولات. وذكر الثاني في قوله: (أو قومه) أي المثل بدراهم بقيمة مكة يوم الإخراج (واشترى بقيمته طعاما) مجزئا في الفطرة (وتصدق به) على مساكين الحرم وفقرائه. وذكر المصنف أيضا الثالث في قوله: (أو صام عن كل مد يوما). فإن بقي أقل من مد صام عنه يوما. (وإن كان الصيد مما لا مثل له) فيتخير بين أمرين ذكرهما المصنف في قوله: (أخرج بقيمته طعاما) وتصدق به، (أو صام عن كل مد يوما). وإن بقي أقل من مد صام عنه يوما.

(والخامس الدم الواجب بالوطء) من عاقل عامد عالم بالتحريم، سواء جامع في قبل أو دبر كما سبق. (وهو) أي هذا الدم الواجب (على

الترتيب)؛ فيجب به أولا (بدنة) وتطلق على الذكر والأنثى من الإبل، (فإن لم يجدها فبقرة، فإن

لم يجدها فسبع من الغنم، فإن لم يجدها قوم البدنة) بدراهم بسعر مكة وقت الوجوب، (واشترى بقيمتها طعاما وتصدق به) على مساكين الحرم وفقرائه، ولا تقدير في الذي يدفع لكل فقير. ولو تصدق بالدراهم لم يجزه، (فإن لم يجد) طعاما (صام عن كل مد يوما).

واعلم أن الهدي على قسمين: أحدهما ما كان عن إحصار، وهذا لا يجب بعثه إلى الحرم، بل ذبح في موضع الإحصار؛ والثاني الهدي الواجب بسبب ترك واجب أو فعل حرام، ويختص ذبحه بالحرم. وذكر المصنف هذا في قوله:

(ولا يجزئه الهدي ولا الإطعام إلا بالحرم). وأقل ما يجزئ أن يدفع الهدي إلى ثلاثة مساكين أو فقراء. (ويجزئه أن يصوم حيث شاء) من حرم أو غيره.

(ولا يجوز قتل صيد الحرم) ولو كان مكرها على قتله. ولو أحرم ms055 ثم جن فقتل صيدا لم يضمنه في الأظهر. (ولا) يجوز (قطع شجره) أي الحرم، ويضمن الشجرة الكبيرة ببقرة، والصغيرة بشاة، كل منهما بصفة الأضحية. ولا يجوز أيضا قطع ولا قلع نبات الحرم الذي لا يستنبته الناس، بل ينبت بنفسه. أما الحشيش اليابس فيجوز قطعه لا قلعه. (والمحل) بضم الميم أي الحلال (والمحرم في ذلك) الحكم السابق (سواء).

ولما فرغ المصنف من معاملة الخالق، وهي العبادات أخذ في معاملة الخلائق، فقال:', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 107, 'كتاب أحكام البيوع', 'كتاب أحكام البيوع');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وغيرها من المعاملات كقراض وشركة

والبيوع جمع بيع، والبيع لغة مقابلة شيء بشيء، فدخل ما ليس بمال كخمر؛ وأما شرعا فأحسن ما قيل في تعريفه: أنه تمليك عين مالية بمعاوضة بإذن شرعي، أو تمليك منفعة مباحة على التأبيد بثمن مالي. فخرج بمعاوضة القرض، وبإذن شرعي الربا. ودخل في منفعة تمليك حق البناء، وخرج بثمن الأجرة في الإجارة؛ فإنها لا تسمى ثمنا.

(البيوع ثلاثة أشياء): أحدها (بيع عين مشاهدة) أي حاضرة (فجائز) إذا وجدت الشروط من كون المبيع طاهرا منتفعا به، مقدورا على تسليمه، للعاقد عليه ولاية. ولا بد في البيع من إيجاب وقبول؛ فالأول كقول البائع أو القائم مقامه: «بعتك وملكتك بكذا»؛ والثاني كقول المشتري أو القائم مقامه: «اشتريت وتملكت» ونحوهما. (و) الثاني من الأشياء (بيع شيء موصوف في الذمة) ويسمى هذا بالسلم (فجائز إذا وجدت) فيه (الصفة على ما وصف به) من صفات

السلم الآتية في فصل السلم. (و) الثالث (بيع عين غائبة لم تشاهد) للمتعاقدين؛ (فلا يجوز) بيعها. والمراد بالجواز في هذه الثلاثة الصحة. وقد يشعر قوله: «لم تشاهد» بأنها إن شوهدت ثم غابت عند العقد أنه يجوز، ولكن محل هذا في عين لا تتغير غالبا في المدة المتخللة بين الرؤية والشراء.

(ويصح بيع كل طاهر منتفع به مملوك). وصرح المصنف بمفهوم هذه الأشياء في قوله: (ولا يصح بيع عين نجسة) ولا متنجسة كخمر ودهن وخل متنجس ونحوه مما لا يمكن تطهيره، (ولا) بيع (ما لا منفعة فيه) كعقرب ونمل وسبع لا ينفع.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• الربا في ms056 الذهب والفضة والمطعومات', '{فصل} في الربا - بألف مقصورة - لغة الزيادة، وشرعا مقابلة عوض بآخر مجهول التماثل في معيار الشرع حالة العقد أو مع تأخير في العوضين أو أحدهما.

(والربا حرام، وإنما يكون في الذهب والفضة و) في (المطعومات). وهي ما يقصد غالبا للطعم اقتياتا أو تفكها أو تداويا. ولا يجري الربا في غير ذلك.

(ولا يجوز بيع الذهب بالذهب، ولا الفضة كذلك) أي بالفضة، مضروبين كانا أو غير مضروبين (إلا متماثلا) أي مثلا بمثل؛ فلا يصح بيع شيء من ذلك متفاضلا. وقوله: (نقدا) أي حالا يدا بيد؛ فلو بيع شيء من ذلك مؤجلا لم يصح.

(ولا) يصح (بيع ما ابتاعه) الشخص (حتى يقبضه)، سواء باعه للبائع أو لغيره. (ولا) يجوز (بيع اللحم بالحيوان)، سواء كان من جنسه، كبيع لحم شاة بشاة أو من غير جنسه، لكن من مأكول كبيع لحم بقر بشاة. (ويجوز بيع الذهب بالفضة متفاضلا) لكن (نقدا) أي حالا مقبوضا قبل التفرق. (وكذلك المطعومات، لا يجوز بيع الجنس منها بمثله إلا متماثلا نقدا) أي حالا مقبوضا قبل التفرق. (ويجوز بيع الجنس منها بغيره متفاضلا) لكن (نقدا) أي حالا مقبوضا قبل التفرق؛ فلو تفرق

المتبايعان قبل قبض كله بطل، أو بعد قبض بعضه ففيه قولا تفريق الصفقة. (ولا يجوز بيع الغرر) كبيع عبد من عبيده أو طير في الهواء.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• الخيار', '{فصل} في أحكام الخيار. (والمتبايعان بالخيار) بين إمضاء البيع وفسخه، أي يثبت لهما خيار المجلس في أنواع البيع كالسلم (مالم يتفرقا) أي مدة عدم تفرقهما عرفا، أي ينقطع خيار المجلس إما بتفرق المتبايعين ببدنهما عن مجلس العقد أو بأن يختار المتبايعان لزوم العقد. فلو اختار أحدهما لزوم العقد ولم يختر الآخر فورا سقط حقه من الخيار، وبقي الحق للآخر.

(ولهما) أي المتبايعين، وكذا لأحدهما إذا وافقه الآخر (أن يشترطا الخيار) في أنواع المبيع (إلى ثلاثة أيام). وتحسب من العقد، لا من التفرق. فلو زاد الخيار على الثلاثة بطل العقد؛ ولو كان المبيع مما يفسد في المدة المشترطة بطل العقد. ms057

(وإذا وجد بالمبيع عيب) موجود قبل القبض تنقص به القيمة أو العين

نقصا يفوت به غرض صحيح، وكان الغالب في جنس ذلك المبيع عدم ذلك العيب كزنا رقيق وسرقته وإباقه (فللمشتري رده) أي المبيع.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, '• بيع الثمرة', '(ولا يجوز بيع الثمرة) المنفردة عن الشجرة (مطلقا) أي عن شرط القطع (إلا بعد بدو) أي ظهور (صلاحها)، وهو فيما لا يتلون انتهاء حالها إلى ما يقصد منها غالبا، كحلاوة قصب وحموضة رمان ولين تين، وفيما يتلون بأن يأخذ في حمرة أو سواد أو صفرة، كالعناب والإجاص والبلح. أما قبل بدو الصلاح فلا يصح بيعها مطلقا، لا من صاحب الشجرة ولا من غيره إلا بشرط القطع، سواء جرت العادة بقطع الثمرة أم لا. ولو قطعت شجرة عليها ثمرة جاز

بيعها بلا شرط قطعها. ولا يجوز بيع الزرع الأخضر في الأرض إلا بشرط قطعه أو قلعه، فإن بيع الزرع مع الأرض أو منفردا عنها بعد اشتداد الحب جاز بلا شرط. ومن باع ثمرا أو زرعا لم يبد صلاحه لزمه سقيه قدر ما تنمو به الثمرة وتسلم عن التلف، سواء خلى البائع بين المشتري والمبيع أو لم يخل. (ولا) يجوز (بيع ما فيه الربا بجنسه رطبا) بسكون الطاء المهملة. وأشار بذلك إلى أنه يعتبر في بيع الربويات حالة الكمال؛ فلا يصح مثلا بيع عنب بعنب. ثم استثنى المصنف مما سبق قوله: (إلا اللبن)، أي

فإنه يجوز بيع بعضه ببعض قبل تجبينه. وأطلق المصنف اللبن فشمل الحليب والرائب والمخيض والحامض. والمعيار في اللبن الكيل حتى يصح بيع الرائب بالحليب كيلا وإن تفاوتا وزنا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 108, 'السلم', 'السلم');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '{فصل} في أحكام السلم. وهو والسلف لغة بمعنى واحد، وشرعا بيع شيء موصوف في الذمة، ولا يصح إلا بإيجاب وقبول.

(ويصح السلم حالا ومؤجلا) فإن أطلق السلم انعقد حالا في الأصح؛ وإنما يصح السلم (فيما) أي في شيء (تكامل فيه خمس شرائط): أحدها (أن يكون) المسلم فيه (مضبوطا بالصفة) التي يختلف بها الغرض في المسلم فيه بحيث تنتفي بالصفة الجهالة فيه، ولا يكون ms058 ذكر الأوصاف على وجه يؤدي لعزة الوجود في المسلم فيه، كلؤلؤ كبار وجارية وأختها أو ولدها. (و) الثاني (أن يكون جنسا لم يختلط به غيره)؛ فلا يصح السلم في المختلط المقصود الأجزاء التي لا تنضبط كهريسة ومعجون؛ فإن انضبطت أجزاؤه صح السلم فيه كجبن وأقط.

والشرط الثالث مذكور في قوله: (ولم تدخله النار لإحالته) أي بأن

دخلته لطبخ أو شي؛ فإن دخلته النار للتمييز كالعسل والسمن صح السلم فيه. (و) الرابع (أن لا يكون) المسلم فيه (معينا) بل دينا؛ فلو كان معينا كأسلمت إليك هذا الثوب مثلا في هذا العبد فليس يسلم قطعا، ولا ينعقد أيضا بيعا في الأظهر. (و) الخامس أن (لا) يكون (من معين)، كأسلمت إليك هذا الدرهم في صاع من هذه الصبرة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 109, 'شروط صحة المسلم فيه', 'شروط صحة المسلم فيه');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '(ثم لصحة المسلم فيه ثمانية شرائط). وفي بعض النسخ «ويصح السلم بثمانية شرائط»: الأول مذكور في قول المصنف: (وهو أن يصفه بعد ذكر جنسه ونوعه بالصفات التي يختلف بها الثمن)، فيذكر في السلم في رقيق مثلا نوعه كتركي أو هندي، وذكورته أو أنوثته، وسنه تقريبا، وقده طولا أو قصرا أو ربعة، ولونه كأبيض، ويصف ببياضه بسمرة أو شقرة؛ ويذكر

في الإبل والبقر والغنم والخيل والبغال والحمير الذكورة والأنوثة والسن واللون والنوع؛ ويذكر في الطير النوع والصغر والكبر والذكورة والأنوثة والسن إن عرف؛ ويذكر في الثوب الجنس كقطن أو كتان أو حرير، والنوع كقطن عراقي، والطول والعرض والغلظة والدقة والصفاقة والرقة والنعومة والخشونة. ويقاس بهذه الصور غيرها. ومطلق السلم في الثوب يحمل على الخام، لا على المقصور. (و) الثاني (أن يذكر قدره بما ينفي الجهالة عنه)، أي أن يكون المسلم فيه معلوم القدر كيلا في مكيل، ووزنا في موزون، وعدا في معدود، وذرعا في مذروع. والثالث مذكور في قول المصنف: (وإن كان) السلم (مؤجلا ذكر) العاقد (وقت محله) أي الأجل كشهر كذا؛ فلو أجل السلم بقدوم زيد مثلا لم يصح. (و) الرابع (أن يكون) المسلم فيه (موجودا عند الاستحقاق في الغالب) أي ms059 استحقاق تسليم المسلم فيه. فلو أسلم فيما لا يوجد عند المحل كرطب في الشتاء لم يصح. (و) الخامس (أن يذكر موضع قبضه)، أي محل التسليم إن كان

الموضع لا يصلح له أو صلح له، ولكن لحمله إلى موضع التسليم مؤنة. (و) السادس (أن يكون الثمن معلوما) بالقدر أو بالرؤية له. (و) السابع (أن يتقابضا) أي المسلم والمسلم إليه في مجلس العقد (قبل التفرق)؛ فلو تفرقا قبل قبض رأس المال بطل العقد، أو بعد قبض بعضه ففيه خلاف تفريق الصفقة. والمعتبر القبض الحقيقي. فلو أحال المسلم برأس مال السلم وقبضه المحتال، وهو المسلم إليه من المحال عليه في المجلس لم يكف. (و) الثامن (أن يكون عقد السلم ناجزا لا يدخله خيار الشرط)، بخلاف خيار المجلس فإنه يدخله.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• الرهن', '{فصل} في أحكام الرهن. وهو لغة الثبوت، وشرعا جعل عين مالية وثيقة بدين يستوفى منها عند تعذر الوفاء. ولا يصح الرهن إلا بإيجاب وقبول. وشرط كل

من الراهن والمرتهن أن يكون مطلق التصرف. وذكر المصنف ضابط المرهون في قوله: (وكل ما جاز بيعه جاز رهنه في الديون إذا استقر ثبوتها في الذمة). واحترز المصنف ب «الديون» عن الأعيان؛ فلا يصح الرهن عليها كعين مغصوبة ومستعارة ونحوهما من الأعيان المضمونة. واحترز ب «استقرار» عن الديون قبل استقرارها كدين السلم وعن الثمن مدة الخيار.

(وللراهن الرجوع فيه مالم يقبضه) أي المرتهن؛ فإن قبض العين المرهونة ممن يصح إقباضه لزم الرهن وامتنع على الراهن الرجوع فيه. والرهن وضعه على الأمانة. (و) حينئذ (لا يضمنه المرتهن) أي لا يضمن المرتهن المرهون (إلا بالتعدى) فيه. ولا يسقط بتلفه شيء من الدين. ولو ادعى تلفه ولم يذكر سببا لتلفه صدق بيمينه؛ فإن ذكر سببا ظاهرا لم يقبل إلا ببينة. ولو ادعى المرتهن رد المرهون على الراهن لم يقبل إلا ببينة.

(وإذا قبض) المرتهن (بعض الحق) الذي على الراهن (لم يخرج) أي لم ينفك (شيء من الرهن حتى يقضى جميعه) أي الحق الذي على الراهن.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 110, 'الحجر', 'الحجر');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '{فصل} في حجر السفيه ms060 والمفلس. (والحجر) لغة المنع، وشرعا منع التصرف في المال، بخلاف التصرف في غيره كالطلاق، فينفذ من السفيه. وجعل المصنف الحجر (على ستة) من الأشخاص: (الصبي، والمجنون، والسفيه). وفسره المصنف بقوله: (المبذر لماله) أي الذي لم يصرفه في مصارفه، (والمفلس) وهو لغة من صار ماله فلوسا، ثم كنى به عن قلة المال أو عدمه، وشرعا الشخص (الذي ارتكبته الديون)، ولا يفي ماله بدينه أو ديونه، (والمريض المخوف عليه) من مرضه. والحجر عليه (فيما زاد على الثلث) وهو ثلثا التركة لأجل حق الورثة. هذا إن لم يكن على المريض دين؛ فإن كان عليه دين يستغرق تركته حجر عليه في الثلث وما زاد عليه، (والعبد الذي لم يؤذن له في التجارة)؛ فلا يصح تصرفه بغير إذن سيده. وسكت المصنف عن أشياء من الحجر مذكورة في المطولات. منها الحجر على المرتد لحق المسلمين، ومنها الحجر على الراهن لحق المرتهن.

(وتصرف الصبي والمجنون والسفيه غير صحيح)؛ فلا يصح منهم بيع ولا شراء ولا هبة ولا غيرها من التصرفات. وأما السفيه فيصح نكاحه بإذن وليه.

(وتصرف المفلس يصح في ذمته)؛ فلو باع سلما طعاما أو غيره أو اشترى كلا منهما بثمن في ذمته صح، (دون) تصرفه في (أعيان ماله) فلا يصح. وتصرفه في نكاح مثلا أو طلاق أو خلع صحيح. وأما المرأة المفلسة، فإن اختلعت على عين لم يصح، أو دين في ذمتها صح.

(وتصرف المريض فيما زاد على الثلث موقوف على إجازة الورثة)؛ فإن أجازوا الزائد على الثلث صح، وإلا فلا. وإجازة الورثة وردهم حال المرض لا يعتبران، وإنما يعتبر ذلك (من بعده) أي من بعد موت المريض. وإذا أجاز الوارث ثم قال: «إنما أجزت لظني أن المال قليل، وقد بان خلافه»، صدق بيمينه.

(وتصرف العبد) الذي لم يؤذن له في التجارة (يكون في ذمته). ومعنى كونه في ذمته أنه (يتبع به بعد عتقه إذا عتق). فإن أذن له السيد في التجارة صح تصرفه بحسب ذلك الإذن.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• الصلح', '{فصل} في الصلح. وهو لغة قطع المنازعة، ms061 وشرعا عقد يحصل به قطعها. (ويصح الصلح مع الإقرار) أي إقرار المدعى عليه بالمدعى به (في الأموال) وهو ظاهر، (و) كذا (ما أفضى إليها) أي الأموال كمن ثبت له على شخص قصاص، فصالحه عليه على مال بلفظ الصلح، فإنه يصح، أو بلفظ البيع فلا. (وهو) أي الصلح (نوعان: إبراء، ومعاوضة. فالإبراء) أي صلحه

(اقتصاره من حقه) أي دينه (على بعضه)؛ فإذا صالحه من الألف الذي له في ذمة شخص على خمسمائة منها فكأنه قال له: أعطني خمسمائة وأبرأتك من خمسمائة. (ولا يجوز) بمعنى لا يصح (تعليقه) أي تعليق الصلح بمعنى الإبراء (على شرط)، كقوله: إذا جاء رأس الشهر فقد صالحتك.

(والمعاوضة) أي صلحها (عدوله عن حقه إلى غيره) كأن ادعى عليه دارا أو شقصا منها وأقر له بذلك وصالحه منها على معين

كثوب، فإنه يصح، (ويجري عليه) أي على هذا الصلح (حكم البيع) فكأنه في المثال المذكور باعه الدار بالثوب، وحينئذ فيثبت في المصالح عليه أحكام البيع كالرد بالعيب ومنع التصرف قبل القبض، ولو صالحه على بعض العين المدعاة فهبة منه لبعضها المتروك منها، فيثبت في هذه الهبة أحكامها التي تذكر في بابها، ويسمى هذا صلح الحطيطة، ولا يصح بلفظ البيع للبعض المتروك كأن يبيعه العين المدعاة ببعضها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• إشراع الروشن', '(ويجوز للإنسان) المسلم (أن يشرع) بضم أوله وكسر ما قبل آخره، أي يخرج (روشنا) ويسمى أيضا بالجناح، وهو إخراج خشب على جدار (في) هواء (طريق نافذ)، ويسمى أيضا بالشارع (بحيث لا يتضرر المار به) أي الروشن، بل يرفع بحيث يمر تحته المار التام الطويل منتصبا.

واعتبر الماوردي أن يكون على رأسه الحمولة الغالبة. وإن كان الطريق النافذ ممر فرسان وقوافل فليرفع الروشن بحيث يمر تحته المحمل على البعير مع أخشاب المظلة الكائنة فوق

المحمل. أما الذمي فيمنع من إشراع الروشن والساباط وإن جاز له المرور في الطريق النافذ.

(ولا يجوز) إشراع الروشن (في الدرب المشترك إلا بإذن الشركاء) في الدرب. والمراد بهم من نفذ باب داره منهم إلى الدرب، وليس ms062 المراد بهم من لاصقه منهم جداره بلا نفوذ باب إليه. وكل من الشركاء يستحق الانتفاع من باب داره إلى رأس الدرب دون ما يلي آخر الدرب.

(ويجوز تقديم الباب في الدرب المشترك، ولا يجوز تأخيره) أي الباب (إلا بإذن الشركاء) فحيث منعوه لم يجز تأخيره. وحيث منع من التأخير فصالح شركاء الدرب بمال صح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, '• شروط الحوالة', '{فصل} في الحوالة، بفتح الحاء، وحكى كسرها. وهي لغة التحول أي الانتقال،

وشرعا نقل الحق من ذمة المحيل إلى ذمة المحال عليه. (وشرائط الحوالة أربعة): أحدها (رضا المحيل) وهو من عليه الدين، لا المحال عليه؛ فإنه لا يشترط رضاه في الأصح. ولا تصح الحوالة على من لا دين عليه. (و) الثاني (قبول المحتال)، وهو مستحق الدين على المحيل. (و) الثالث (كون الحق) المحال به (مستقرا في الذمة). والتقييد بالاستقرار موافق لما قاله الرافعي، لكن النووي استدرك عليه في الروضة. وحينئذ فالمعتبر في دين الحوالة أن يكون لازما أو يؤول إلى اللزوم. (و) الرابع (اتفاق ما) أي الدين الذي (في ذمة المحيل والمحال عليه في الجنس) والقدر (والنوع والحلول والتأجيل) والصحة والتكسير، (وتبرأ بها) أي الحوالة (ذمة المحيل) أي عن دين المحتال، ويبرأ أيضا المحال عليه عن دين المحيل، ويتحول حق المحتال إلى ذمة المحال عليه حتى لو تعذر أخذه من المحال عليه بفلس أو جحد للدين

ونحوهما لم يرجع على المحيل. ولو كان المحال عليه مفلسا عند الحوالة وجهله المحتال فلا رجوع له أيضا على المحيل.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, '• الضمان', '{فصل} في الضمان. وهو مصدر ضمنت الشيء ضمانا إذا كفلته، وشرعا التزام ما في ذمة الغير من المال. وشرط الضامن أن يكون فيه أهلية التصرف. (ويصح ضمان الديون المستقرة في الذمة إذا علم قدرها). والتقييد بالمستقرة يشكل عليه صحة ضمان الصداق قبل الدخول؛ فإنه حينئذ غير مستقر في الذمة؛ ولهذا لم يعتبر الرافعي والنووي إلا كون الدين ثابتا لازما. وخرج بقوله: «إذا علم قدرها» الديون المجهولة؛ فلا يصح ضمانها - كما سيأتي.

(ولصاحب الحق) أي الدين (مطالبة من ms063 شاء من الضامن والمضمون عنه) وهو من عليه الدين. وقوله: (إذا كان الضمان على ما بينا) ساقط في أكثر نسخ المتن.

(وإذا غرم الضامن رجع على المضمون عنه) بالشرط المذكور في قوله: (إذا كان الضمان والقضاء) أي كل منهما (بإذنه) أي المضمون عنه. ثم صرح بمفهوم قوله سابقا «إذا علم قدرها» بقوله هنا: (ولا يصح ضمان المجهول) كقوله: «بع فلانا كذا، وعلي ضمان الثمن». (ولا) ضمان (ما لم يجب) كضمان مائة تجب على زيد في المستقبل (إلا درك المبيع) أي ضمان درك المبيع،

بأن يضمن للمشتري الثمن إن خرج المبيع مستحقا، أو يضمن للبائع المبيع إن خرج الثمن مستحقا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, '• الكفالة', '{فصل} في ضمان غير المال من الأبدان. ويسمى كفالة الوجه أيضا، وكفالة البدن كما قال: (والكفالة بالبدن جائزة إذا كان على المكفول به) أي ببدنه (حق لآدمي) كقصاص وحد قذف. وخرج بحق الآدمي حق الله

تعالى؛ فلا تصح الكفالة ببدن من عليه حق الله تعالى، كحد سرقة وحد خمر وحد زنا. ويبرأ الكفيل بتسليم المكفول ببدنه في مكان التسليم بلا حائل يمنع المكفول له عنه. وأما مع وجود الحائل فلا يبرأ الكفيل.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, '• الشركة', '{فصل} في الشركة. وهي لغة الاختلاط، وشرعا ثبوت الحق على جهة الشيوع في شيء واحد لاثنين فأكثر.

(وللشركة خمس شرائط): الأول (أن تكون) الشركة (على ناض) أي نقد (من الدراهم والدنانير) وإن كانا مغشوشين، واستمر رواجهما في البلد. ولا تصح في تبر وحلي وسبائك. وتكون الشركة أيضا على المثلي كالحنطة، لا المتقوم كالعروض من الثياب ونحوها. (و) الثاني (أن يتفقا في الجنس والنوع)؛ فلا تصح الشركة في الذهب والدراهم، ولا في صحاح ومكسرة، ولا في حنطة بيضاء وحمراء. (و) الثالث (أن يخلطا المالين) بحيث لا يتميزان.

(و) الرابع (أن يأذن كل واحد منهما) أي الشريكين (لصاحبه في التصرف). فإذا أذن له فيه تصرف بلا ضرر؛ فلا يبيع كل منهما نسيئة، ولا بغير نقد البلد، ولا بغبن فاحش، ولا يسافر بالمال المشترك إلا بإذن. فإن فعل أحد الشريكين ms064 ما نهي عنه لم يصح في نصيب شريكه؛ وفي نصيبه قولا تفريق الصفقة. (و) الخامس (أن يكون الربح والخسران على قدر المالين)، سواء تساوى الشريكان في العمل في المال المشترك أو تفاوتا فيه. فإن اشترطا التساوى في الربح مع تفاوت المالين أو عكسه لم يصح.

والشركة عقد جائز من الطرفين، (و) حينئذ (لكل واحد منهما) أي الشريكين (فسخها متى شاء)، وينعزلان عن التصرف بفسخهما. (ومتى مات أحدهما) أو جن أو أغمي عليه (بطلت) تلك الشركة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, '• الوكالة', '{فصل} في أحكام الوكالة. وهي بفتح الواو وكسرها في اللغة التفويض، وفي الشرع تفويض شخص شيأ، له فعله مما يقبل النيابة إلى غيره ليفعله حال حياته. وخرج بهذا القيد الإيصاء. وذكر المصنف ضابط الوكالة في قوله: (وكل ما جاز للإنسان التصرف فيه بنفسه جاز له أن يوكل فيه) غيره (أو يتوكل فيه) عن غيره. فلا يصح من صبي أو مجنون أن يكون موكلا ولا وكيلا. وشرط الموكل فيه أن يكون قابلا للنيابة؛ فلا يصح التوكيل في عبادة بدنية إلا الحج وتفرقة الزكاة مثلا، وأن يملكه الموكل؛ فلو وكل شخصا في بيع عبد سيملكه أو في طلاق امرأة سينكحها بطل.

(والوكالة عقد جائز) من الطرفين، (و) حينئذ (لكل منهما) أي الموكل والوكيل (فسخها متى شاء. وتنفسخ) الوكالة (بموت أحدهما) أو جنونه أو إغمائه.

(والوكيل أمين). وقوله: (فيما يقبضه، وفيما يصرفه) ساقط في أكثر النسخ. (ولا يضمن) الوكيل (إلا بالتفريط) فيما وكل فيه. ومن التفريط تسليمه المبيع قبل قبض ثمنه.

(ولا يجوز) للوكيل وكالة مطلقة (أن يبيع ويشتري إلا بثلاثة شرائط): أحدها (أن يبيع بثمن المثل)، لا بدونه ولا بغبن فاحش، وهو ما لا يحتمل في الغالب. (و) الثاني (أن يكون) ثمن المثل (نقدا)؛ فلا يبيع الوكيل نسيئة وإن كان قدر ثمن المثل. والثالث أن يكون النقد (بنقد البلد). فلو كان في البلد نقدان باع بالأغلب منهما؛ فإن استويا باع بالأنفع للموكل؛ فإن استويا تخير، ولا يبيع بالفلوس وإن راجت رواج النقود. (ولا يجوز أن يبيع) ms065 الوكيل بيعا مطلقا (من نفسه) ولا من ولده الصغير ولو صرح الموكل للوكيل في البيع من الصغير - كما قاله المتولي خلافا

للبغوي. والأصح أنه يبيع لأبيه وإن علا ولابنه البالغ وإن سفل إن لم يكن سفيها ولا مجنونا. فإن صرح الموكل بالبيع منهما صح جزما.

(ولا يقر) الوكيل (على موكله)؛ فلو وكل شخصا في خصومة لم يملك الإقرار على الموكل، ولا الإبراء من دينه ولا الصلح عنه. وقوله: (إلا بإذنه) ساقط في بعض النسخ. والأصح أن التوكيل في الإقرار لا يصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, '• الإقرار', '{فصل} في أحكام الإقرار. وهو لغة الإثبات، وشرعا إخبار بحق على المقر؛ فخرجت الشهادة، لأنها إخبار بحق للغير على الغير. (والمقر به ضربان): أحدهما (حق الله تعالى) كالسرقة والزنا، (و) الثاني (حق الآدمي) كحد القذف لشخص. (فحق الله تعالى يصح الرجوع فيه عن الإقرار به) كأن يقول من أقر

بالزنا: «رجعت عن هذا الإقرار أو كذبت فيه». ويسن للمقر بالزنا الرجوع عنه. (وحق الآدمي لا يصح الرجوع فيه عن الإقرار به). وفرق بين هذا والذي قبله بأن حق الله تعالى مبني على المسامحة، وحق الآدمي مبني على المشاحة.

(وتفتقر صحة الإقرار إلى ثلاثة شرائط): أحدها (البلوغ)، فلا يصح إقرار الصبي ولو مراهقا ولو بإذن وليه. (و) الثاني (العقل)، فلا يصح إقرار المجنون والمغمى عليه وزائل العقل بما يعذر فيه؛ فإن لم يعذر فحكمه كالسكران. (و) الثالث (الاختيار)، فلا يصح إقرار مكره بما أكره عليه. (وإن كان) الإقرار (بمال اعتبر فيه شرط رابع، وهو الرشد). والمراد به كون المقر مطلق التصرف. واحترز المصنف بمال عن الإقرار بغيره كطلاق وظهار ونحوهما؛ فلا يشترط في المقر بذلك الرشد، بل يصح من الشخص السفيه.

(وإذا أقر) الشخص (بمجهول) كقوله: «لفلان علي شيء»، (رجع)

بضم أوله (إليه) أي المقر (في بيانه) أي المجهول، فيقبل تفسيره بكل ما يتمول وإن قل كفلس. ولو فسر المجهول بما لا يتمول لكن من جنسه كحبة حنطة، أو ليس من جنسه لكن يحل اقتناؤه كجلد ميتة وكلب معلم ms066 وزبل قبل تفسيره في جميع ذلك على الأصح.

ومتى أقر بمجهول وامتنع من بيانه بعد أن طولب به حبس حتى يبين المجهول. فإن مات قبل البيان طولب به الوارث ووقف جميع التركة.

(ويصح الاستثناء في الإقرار إذا وصله به) أي وصل المقر الاستثناء بالمستثنى منه؛ فإن فصل بينهما بسكوت أو كلام كثير أجنبي ضر. أما السكوت اليسير كسكتة تنفس فلا يضر. ويشترط أيضا في الاستثناء أن لا يستغرق المستثنى منه؛ فإن استغرقه نحو: «لزيد علي عشرة إلا عشرة» ضر.

(وهو) أي الإقرار (في حال الصحة والمرض سواء)، حتى لو أقر شخص في صحته بدين لزيد وفي مرضه بدين لعمرو لم يقدم الإقرار الأول، وحينئذ فيقسم المقر به بينهما بالسوية.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, '• العارية', '{فصل} في أحكام العارية. وهي بتشديد الياء في الأفصح مأخوذة من عار إذا ذهب. وحقيقتها الشرعية إباحة الانتفاع من أهل التبرع بما يحل الانتفاع به مع بقاء عينه ليرده على المتبرع. وشرط المعير صحة تبرعه وكونه مالكا لمنفعة ما يعيره. فمن لا يصح تبرعه كصبي ومجنون لا تصح إعارته. ومن لا يملك المنفعة كمستعير لا تصح إعارته إلا بإذن المعير. وذكر المصنف ضابط المعار في قوله: (وكل ما يمكن الانتفاع به) منفعة مباحة (مع بقاء عينه جازت إعارته)؛ فخرج بمباحة آلة اللهو، فلا تصح إعارتها؛ وببقاء عينه إعارة الشمعة للوقود، فلا تصح.

وقوله: (إذا كانت منافعه آثارا) مخرج للمنافع التي هي أعيان كإعارة شاة للبنها وشجرة لثمرتها ونحو ذلك؛ فإنه لا يصح. فلو قال لشخص: خذ هذه الشاة فقد أبحتك درها ونسلها، فالإباحة صحيحة والشاة عارية.

(وتجوز العارية مطلقا) من غير تقييد بوقت (ومقيدا بمدة) أي بوقت كأعرتك هذا الثوب شهرا. وفي بعض النسخ «وتجوز العارية مطلقة ومقيدة بمدة». وللمعير الرجوع في كل منهما متى شاء.

(وهي) أي العارية إذا تلفت، لا باستعمال مأذون فيه (مضمونة على المستعير بقيمتها يوم تلفها) لا بقيمتها يوم طلبها، ولا بأقصى القيم. فإن تلفت باستعمال مأذون فيه كإعارة ثوب للبسه فانسحق أو انمحق بالاستعمال ms067 فلا ضمان.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 11, NULL, '• الغصب', '{فصل} في أحكام الغصب. وهو لغة أخذ الشيء ظلما مجاهرة، وشرعا الاستيلاء على حق الغير عدوانا. ويرجع في الاستيلاء للعرف. ودخل في حق الغير ما يصح غصبه مما ليس بمال كجلد ميتة. وخرج بعدوانا الاستيلاء على مال الغير بعقد.

(ومن غصب مالا لأحد لزمه رده) لمالكه ولو غرم على رده أضعاف قيمته. (و) لزمه أيضا (أرش نقصه) إن نقص، كمن غصب ثوبا فلبسه أو نقص

بغير لبس، (و) لزمه أيضا (أجرة مثله). أما لو نقص المغصوب برخص سعره فلا يضمنه الغاصب على الصحيح. وفي بعض النسخ «ومن غصب مال امرئ أجبر على رده».

(فإن تلف) المغصوب (ضمنه) الغاصب (بمثله إن كان له) أي المغصوب (مثل). والأصح أن المثلي ما حصره كيل أو وزن وجاز السلم فيه، كنحاس وقطن، لا غالية ومعجون. وذكر المصنف ضمان المتقوم في قوله: (أو) ضمنه (بقيمته إن لم يكن له مثل) بأن كان متقوما، واختلفت قيمته (أكثر ما كانت من يوم الغصب إلى يوم التلف). والعبرة في القيمة بالنقد الغالب؛ فإن غلب نقدان وتساويا قال الرافعي: عين القاضي واحدا منهما.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 111, 'الشفعة', 'الشفعة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '{فصل} في أحكام الشفعة. وهي بسكون الفاء، وبعض الفقهاء يضمها، ومعناها لغة الضم، وشرعا حق تملك قهري يثبت للشريك القديم على الشريك الحادث

بسبب الشركة بالعوض الذي ملك به. وشرعت لدفع الضرر.

(والشفعة واجبة) أي ثابتة للشريك (بالخلطة) أي خلطة الشيوع، (دون) خلطة (الجوار)؛ فلا شفعة لجار الدار ملاصقا كان أو غيره. وإنما تثبت الشفعة (فيما ينقسم) أي يقبل القسمة (دون ما لا ينقسم) كحمام صغير؛ فلا شفعة فيه. فإن أمكن انقسامه كحمام كبير يمكن جعله حمامين تثبت الشفعة فيه. (و) الشفعة ثابتة أيضا (في كل ما لا ينقل من الأرض) غير الموقوفة والمحتكرة (كالعقار وغيره) من البناء والشجر تبعا للأرض. وإنما يأخذ الشفيع شقص العقار (بالثمن الذي وقع عليه البيع). فإن كان الثمن مثليا كحب ونقد أخذه بمثله، أو متقوما كعبد وثوب أخذه بقيمته يوم البيع.

(وهي) أي الشفعة بمعنى طلبها ms068 (على الفور). وحينئذ فليبادر الشفيع إذا علم بيع الشقص بأخذه. والمبادرة في طلب الشفعة على العادة؛ فلا يكلف الإسراع على خلاف عادته بعدو أو غيره، بل الضابط في ذلك أن ما عد توانيا في طلب الشفعة أسقطها، وإلا فلا. (فإن أخرها) أي الشفعة (مع القدرة عليها بطلت). فلو كان مريد الشفعة مريضا أو غائبا عن بلد المشتري أو محبوسا أو خائفا من

عدو فليوكل إن قدر، وإلا فليشهد على الطلب. فإن ترك المقدور عليه من التوكيل أو الإشهاد بطل حقه في الأظهر. ولو قال الشفيع: «لم أعلم أن حق الشفعة على الفور»، وكان ممن يخفى عليه ذلك صدق بيمينه.

(وإذا تزوج) شخص (امرأة على شقص أخذه) أي أخذ (الشفيع) الشقص (بمهر المثل) لتلك المرأة، (وإن كان الشفعاء جماعة استحقوها) أي الشفعة (على قدر) حصصهم من (الأملاك). فلو كان لأحدهم نصف عقار وللآخر ثلثه وللآخر سدسه فباع صاحب النصف حصته أخذها الآخران أثلاثا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 111;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• القراض', '{فصل} في أحكام القراض. وهو لغة مشتق من القرض، وهو القطع؛ وشرعا دفع المالك مالا للعامل ليعمل فيه، والربح بينهما.

(وللقراض أربعة شرائط): أحدها (أن يكون على ناض) أي نقد (من الدراهم والدنانير) الخالصة؛ فلا يجوز القراض على تبر، ولا على حلي، ولا مغشوش، ولا عروض، ومنها الفلوس. (و) الثاني (أن يأذن رب المال للعامل في التصرف) إذنا (مطلقا)؛ فلا يجوز للمالك أن يضيق التصرف على العامل، كقوله: «لا تشتر شيئا حتى تشاورني»، أو «لا تشتر إلا الحنطة البيضاء» مثلا. ثم عطف المصنف على قوله سابقا «مطلقا» قوله هنا: (أو فيما) أي في التصرف في شيء (لا ينقطع وجوده غالبا). فلو شرط عليه شراء شيء يندر وجوده كالخيل البلق لم يصح. (و) الثالث (أن يشترط له) أي يشترط المالك للعامل (جزءا معلوما من الربح) كنصفه أو ثلثه. فلو قال المالك للعامل: قارضتك على هذا المال على أن لك فيه شركة أو نصيبا منه فسد القراض، أو على أن الربح بيننا صح، ويكون الربح نصفين. (و) الرابع (أن ms069 لا يقدر) القراض (بمدة) معلومة، كقوله: «قارضتك سنة».

وأن لا يعلق بشرط، كقوله: «إذا جاء رأس الشهر قارضتك».

والقرض أمانة (و) حينئذ (لا ضمان على العامل) في مال القراض (إلا بعدوان) فيه؛ وفي بعض النسخ «بالعدوان». (وإذا حصل) في مال القراض (ربح وخسران جبر الخسران بالربح). واعلم أن عقد القراض جائز من الطرفين، فلكل من المالك والعامل فسخه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 111;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• المساقاة', '{فصل} في أحكام المساقاة. وهي لغة مشتقة من السقي، وشرعا دفع الشخص نخلا أو شجر عنب لمن يتعهده بسقي وتربية على أن له قدرا معلوما من ثمره. (والمساقاة جائزة على) شيئين فقط: (النخل والكرم)؛ فلا تجوز المساقاة على غيرهما كتين ومشمش. وتصح المساقاة من جائز التصرف لنفسه ولصبي ومجنون بالولاية عليهما عند المصلحة.

وصيغتها: «ساقيتك على هذا النحل بكذا، أو سلمته إليك لتتعهده» ونحو ذلك. ويشترط قبول العامل. (ولها) أي للمساقاة (شرطان: أحدهما أن يقدرها) المالك (بمدة معلومة) كسنة هلالية. ولا يجوز تقديرها بإدراك الثمرة في الأصح. (والثاني أن يعين) المالك (للعامل جزءا معلوما من الثمرة)، كنصفها أو ثلثها. فلو قال المالك للعامل: «على أن ما فتح الله به من الثمرة يكون بيننا» صح، وحمل على المناصفة.

(ثم العمل فيها على ضربين): أحدهما (عمل يعود نفعه إلى الثمرة)، كسقي النخل وتلقيحه بوضع شيء من طلع الذكور في طلع الإناث؛ (فهو على العامل، و) الثاني (عمل يعود نفعه إلى الأرض) كنصب الدواليب وحفر الأنهار؛ (فهو على رب المال).

ولا يجوز أن يشرط المالك على العامل شيئا ليس من أعمال المساقاة كحفر نهر. ويشترط أيضا انفراد العامل بالعمل. فلو شرط رب المال عمل غلامه مع العامل لم يصح.

واعلم أن عقد المساقاة لازم من الطرفين. ولو خرج الثمر مستحقا، كأن أوصى بثمرة النحل المساقى عليها؛ فللعامل على رب المال أجرة المثل لعمله.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 111;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 112, 'الإجارة', 'الإجارة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '{فصل} في أحكام الإجارة. وهي بكسر الهمزة في المشهور، وحكي ضمها. وهي لغة اسم للأجرة، وشرعا عقد على منفعة معلومة مقصودة قابلة للبذل والإباحة بعوض معلوم. وشرط كل من المؤجر ms070 والمستأجر الرشد وعدم الإكراه. وخرج بمعلومة', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 113, 'الجعالة،', 'الجعالة،');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وبمقصودة استئجار تفاحة لشمها، وبقابلة للبذل منفعة البضع؛ فالعقد عليها لا يسمى إجارة، وبالإباحة إجارة الجواري للوطء، وبعوض الإعارة، وبمعلوم عوض المساقاة.

ولا تصح الإجارة إلا بإيجاب كآجرتك، وقبول كاستأجرت. وذكر المصنف ضابط ما تصح إجارته بقوله: (وكل ما أمكن الانتفاع به مع

بقاء عينه) كاستئجار دار للسكنى، ودابة للركوب (صحت إجارته)، وإلا فلا. ولصحة إجارة ما ذكر شروط، ذكرها بقوله: (إذا قدرت منفعته بأحد أمرين): إما (بمدة)، كآجرتك هذه الدار سنة (أو عمل) كاستأجرتك لتخيط لي هذا الثوب.

وتجب الأجرة في الإجارة بنفس العقد. (وإطلاقها يقتضي تعجيل الأجرة إلا أن يشترط) فيها (التأجيل)، فتكون الأجرة مؤجلة حينئذ.

(ولا تبطل الإجارة بموت أحد المتعاقدين) أي المؤجر والمستأجر، ولا بموت المتعاقدين، بل تبقى الإجارة بعد الموت إلى انقضاء مدتها، ويقوم وارث المستأجر مقامه في استيفاء منفعة العين المؤجرة. (وتبطل) الإجارة (بتلف العين المستأجرة)، كانهدام الدار وموت الدابة المعينة. وبطلان الإجارة بما ذكر بالنظر للمستقبل، لا الماضي؛ فلا تبطل الإجارة فيه في الأظهر، بل يستقر قسطه من المسمى باعتبار أجرة المثل، فتقوم المنفعة حال العقد في المدة الماضية. فإذا قيل كذا يؤخذ بتلك النسبة من المسمى. وما تقدم من عدم الانفساخ في

الماضي مقيد بما بعد قبض العين المؤجرة، وبعد مضي مدة لها أجرة، وإلا تنفسخ في المستقبل والماضي. وخرج بالمعينة ما إذا كانت الدابة المؤجرة في الذمة، فإن المؤجر إذا أحضرها وماتت في أثناء المدة فلا تنفسخ الإجارة، بل يجب على المؤجر إبدالها.

واعلم أن يد الأجير على العين المؤجرة يد أمانة، (و) حينئذ (لا ضمان على الأجير إلا بعدوان) فيها، كأن ضرب الدابة فوق العادة، أو أركبها شخصا أثقل منه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• الجعالة', '{فصل} في أحكام الجعالة. وهي بتثليث الجيم، ومعناها لغة ما يجعل لشخص على شيء يفعله، وشرعا التزام مطلق التصرف عوضا معلوما على عمل معين أو مجهول لمعين أو غيره. (والجعالة جائزة) من الطرفين: طرف الجاعل، والمجعول له. (وهي أن يشترط في رد ms071 ضالته عوضا معلوما) كقول مطلق التصرف: «من رد ضالتي

فله كذا». (فإذا ردها استحق) الراد (ذلك العوض المشروط) له.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• المخابرة', '{فصل} في أحكام المخابرة. وهي عمل العامل في أرض المالك ببعض ما يخرج منها، والبذر من العامل. (وإذا دفع) شخص (إلى رجل أرضا ليزرعها وشرط له جزءا معلوما من ريعها لم يجز) ذلك، لكن النووي تبعا لابن المنذر اختار جواز المخابرة. وكذا المزارعة؛ وهي عمل العامل في الأرض ببعض ما يخرج منها، والبذر من المالك. (وإن أكراه) أي شخصا (إياها) أي أرضا (بذهب أو فضة أو شرط له طعاما معلوما في ذمته جاز). أما لو دفع لشخص أرضا فيها نخل كثير أو قليل فساقاه عليه وزرعه على الأرض فتجوز هذه المزارعة تبعا للمساقاة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, '• إحياء الموات', '{فصل} في أحكام إحياء الموات. وهو - كما قال الرافعي في الشرح الصغير - أرض لا مالك لها، ولا ينتفع بها أحد. (وإحياء الموات جائز بشرطين): أحدهما (أن يكون المحي مسلما)، فيسن له إحياء الأرض الميتة، سواء أذن له الإمام أم لا، اللهم إلا أن يتعلق بالموات حق، كأن حمى الإمام قطعة منه فأحياها شخص، فلا يملكها إلا بإذن الإمام في الأصح. أما الذمي والمعاهد والمستأمن فليس لهم الإحياء ولو أذن لهم الإمام. (و) الثاني (أن تكون الأرض حرة، لم يجر عليها ملك لمسلم). وفي بعض النسخ «أن تكون الأرض حرة». والمراد من كلام المصنف أن ما كان معمورا وهو الآن خراب فهو لمالكه إن عرف، مسلما كان أو ذميا. ولا يملك هذا الخراب بالإحياء. فإن لم يعرف مالكه والعمارة إسلامية، فهذا المعمور مال ضائع، الأمر فيه لرأي الإمام في حفظه أو بيعه وحفظ ثمنه. وإن كان المعمور جاهلية ملك بالإحياء.

(وصفة الإحياء ما كان في العادة عمارة للمحيا)، ويختلف هذا باختلاف الغرض الذي يقصده المحي؛ فإذا أراد المحي إحياء الموات مسكنا اشترط فيه تحويط البقعة ببناء حيطانها بما جرت به عادة ذلك المكان من آجر أو حجر أو قصب. واشترط أيضا سقف بعضها ونصب باب. وإن ms072 أراد المحي إحياء الموات زريبة دواب فيكفي تحويط دون تحويط السكنى. ولا يشترط السقف. وإن أراد المحي إحياء الموات مزرعة فيجمع التراب حولها، ويسوي الأرض بكسح مستعل فيها، وطم منخفض، وترتيب ماء لها بشق ساقية من بئر أو حفر قناة، فإن كفاها المطر المعتاد لم يحتج لترتيب الماء على الصحيح. وإن أراد المحي إحياء الموات بستانا فجمع التراب والتحويط حول أرض البستان إن جرت به عادة. ويشترط مع ذلك الغرس على المذهب.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, '• بذل الماء', 'واعلم أن الماء المختص بشخص لا يجب بذله لماشية غيره مطلقا. (و) إنما (يجب بذل الماء بثلاثة شرائط): أحدها (أن يفضل عن حاجته) أي صاحب الماء؛ فإن لم يفضل عن حاجته بدأ بنفسه، ولا يجب بذله لغيره.

(و) الثاني (أن يحتاج إليه غيره) إما (لنفسه أو لبهيمته). هذا إذا كان هناك كلاء ترعاه الماشية، ولا يمكن رعيه إلا بسقي الماء. ولا يجب عليه بذل الماء لزرع غيره ولا لشجره. (و) الثالث (أن يكون) الماء في مقره وهو (مما يستخلف في بئر أو عين). فإذا أخذ هذا الماء في إناء لم يجب بذله على الصحيح. وحيث وجب البذل للماء فالمراد به تمكين الماشية من حضورها البئر إن لم يتضرر صاحب الماء في زرعه أو ماشيته؛ فإن تضرر بورودها منعت منه واستقى لها

الرعاة - كما قاله الماوردي. وحيث وجب البذل للماء امتنع أخذ العوض عليه على الصحيح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, '• الوقف', '{فصل} وهو لغة الحبس، وشرعا حبس مال معين قابل للنقل يمكن الانتفاع به مع بقاء عينه وقطع التصرف فيه على أن يصرف في جهة خير تقربا إلى الله تعالى. وشرط الواقف صحة عبارته وأهلية التبرع.

(والوقف جائز بثلاثة شرائط). وفي بعض النسخ «والوقف جائز، وله ثلاثة شروط»: أحدها (أن يكون) الموقوف (مما ينتفع به مع بقاء عينه)، ويكون الانتفاع مباحا مقصودا؛ فلا يصح وقف آلة اللهو، ولا وقف دراهم للزينة. ولا يشترط النفع في الحال، فيصح وقف عبد وجحش صغيرين. وأما الذي لا تبقى عينه كمطعوم وريحان فلا يصح وقفه. ms073 (و) الثاني (أن يكون) الوقف (على أصل موجود وفرع لا ينقطع)، فخرج الوقف على من سيولد للواقف، ثم على الفقراء. ويسمى هذا منقطع الأول؛ فإن لم يقل «ثم على الفقراء» كان منقطع الأول والآخر. وقوله: «لا ينقطع» احتراز عن الوقف المنقطع الآخر، كقوله: «وقفت هذا على زيد ثم نسله»، ولم يزد على ذلك. وفيه طريقان: أحدهما أنه

باطل كمنقطع الأول، وهو الذي مشى عليه المصنف، لكن الراجح الصحة. (و) الثالث (أن لا يكون) الوقف (في محظور) بظاء مشالة، أي محرم؛ فلا يصح الوقف على عمارة كنيسة للتعبد. وأفهم كلام المصنف أنه لا يشترط في الوقف ظهور قصد القربة، بل انتفاء المعصية، سواء وجد في الوقف ظهور قصد القربة كالوقف على الفقراء، أم لا كالوقف على الأغنياء. ويشترط في الوقف أن لا يكون مؤقتا كوقفت هذا سنة. وأن لا يكون معلقا كقوله: إذا جاء رأس الشهر فقد وقفت كذا.

(وهو) أي الوقف (على ما شرط الواقف) فيه (من تقديم) لبعض الموقوف عليهم، كوقفت على أولادي الأورع منهم، (أو تأخير) كوقفت على أولادي. فإذا انقرضوا فعلى أولادهم، (أو تسوية) كوقفت على أولادي بالسوية بين ذكورهم وإناثهم، (أو تفضيل) لبعض الأولاد على بعض، كوقفت على أولادي للذكر منهم حظ الأنثيين.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, '• الهبة', '{فصل} في أحكام الهبة. وهي لغة مأخوذة من هبوب الريح. ويجوز أن تكون من هب من نومه إذا استيقظ، فكأن فاعلها استيقظ للإحسان. وهي في الشرع تمليك منجز مطلق في عين حال الحياة بلا عوض ولو من الأعلى. فخرج بالمنجز الوصية، وبالمطلق التمليك المؤقت، وخرج بالعين هبة المنافع، وخرج بحال الحياة الوصية. ولا تصح الهبة إلا بإيجاب وقبول، لفظا. وذكر المصنف ضابط الموهوب في قوله: (وكل ما جاز بيعه جازت هبته). وما لا يجوز بيعه كمجهول لا تجوز هبته إلا حبتي حنطة ونحوهما، فلا يجوز بيعهما ويجوز هبتهما ولا تملك. (ولا تلزم الهبة إلا بالقبض) بإذن الواهب؛ فلو مات الموهوب له أو الواهب قبل قبض الهبة لم تنفسخ الهبة، وقام وارثه مقامه ms074 في القبض والإقباض. (وإذا قبضها الموهوب له لم يكن للواهب أن يرجع فيها إلا أن يكون والدا) وإن علا.

(وإذا أعمر) شخص (شيئا) أي دارا مثلا، كقوله: «أعمرتك هذه الدار»، (أو أرقبه) إياها، كقوله: «أرقبتك هذه الدار وجعلتها لك رقبي»، أي إن إن مت قبلي عادت إلي، وإن مت قبلك استقرت لك، فقبل وقبض (كان) ذلك الشيء (للمعمر أو للمرقب) بلفظ اسم المفعول فيهما (ولورثته من بعده). ويلغو الشرط المذكور.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, '• اللقطة', '{فصل} في أحكام اللقطة. وهي بفتح القاف اسم للشيء الملتقط. ومعناها شرعا مال ضاع من مالكه بسقوط أو غفلة ونحوهما. (وإذا وجد) شخص بالغا كان أو لا، مسلما كان أو لا، فاسقا كان أو لا (لقطة في موات أو طريق فله أخذها أو تركها؛ و) لكن (أخذها أولى من تركها إن كان) الآخذ لها (على ثقة من القيام بها). فلو تركها من غير أخذ لم يضمنها، ولا يجب الإشهاد على التقاطها لتملك أو حفظ. وينزع

القاضي اللقطة من الفاسق ويضعها عند عدل. ولا يعتمد تعريف الفاسق اللقطة بل يضم القاضي إليه رقيبا عدلا يمنعه من الخيانة فيها. وينزع الولي اللقطة من يد الصبي ويعرفها، ثم بعد التعريف يتملك اللقطة للصبي إن رأى المصلحة في تملكها له.

(وإذا أخذها) أي اللقطة (وجب عليه أن يعرف) في اللقطة عقب أخذها (ستة أشياء: وعاءها) من جلد أو خرقة مثلا، (وعفاصها)، وهو بمعنى الوعاء (ووكاءها) بالمد، وهو الخيط الذي تربط به، (وجنسها) من ذهب أو فضة، (وعددها، ووزنها). ويعرف بفتح أوله وسكون ثانيه من المعرفة، لا من التعريف. (و) أن (يحفظها) حتما (في حرز مثلها، ثم) بعد ما ذكر (إذا أراد) الملتقط (تملكها عرفها) بتشديد الراء من التعريف، لا من المعرفة (سنة على أبواب

المساجد) عند خروج الناس من الجماعة، (وفي الموضع الذي وجدها فيه)، وفي الأسواق ونحوها من مجامع الناس. ويكون التعريف على العادة زمانا ومكانا. وابتداء السنة يحسب من وقت التعريف، لا من وقت الالتقاط. ولا يجب استيعاب السنة بالتعريف، بل ms075 يعرف أولا كل يوم مرتين طرفي النهار، لا ليلا، ولا وقت القيلولة، ثم يعرف بعد ذلك كل أسبوع مرة أو مرتين. ويذكر الملتقط في تعريف اللقطة بعض أوصافها؛ فإن بالغ فيها ضمن، ولا يلزمه مؤنة التعريف إن أخذ اللقطة ليحفظها على مالكها، بل يرتبها القاضي من بيت المال أو يقترضها على المالك. وإن أخذ اللقطة ليتملكها وجب عليه تعريفها ولزمه مؤنة تعريفها، سواء تملكها بعد ذلك أم لا.

ومن التقط شيأ حقيرا لا يعرفه سنة، بل يعرفه زمنا يظن أن فاقده يعرض عنه بعد ذلك الزمن. (فإن لم يجد صاحبها) بعد تعريفها سنة (كان له أن يتملكها بشرط الضمان) لها. ولا يتملكها الملتقط بمجرد مضي السنة، بل لا بد من لفظ يدل على التملك، كتملكت هذه اللقطة. فإن تملكها وظهر مالكها وهي باقية واتفقا على رد عينها أو بدلها، فالأمر فيه واضح؛ وإن تنازعا فطلبها المالك وأراد الملتقط العدول إلى بدلها أجيب المالك في الأصح. وإن تلفت اللقطة بعد تملكها

غرم الملتقط مثلها إن كانت مثلية، أو قيمتها إن كانت متقومة يوم التملك لها. وإن نقصت بعيب فله أخذها مع الإرش في الأصح.

(واللقطة) وفي بعض النسخ «وجملة اللقطة» (على أربعة أضرب: أحدها ما يبقى على الدوام) كذهب وفضة؛ (فهذا) أي ما سبق من تعريفها سنة وتملكها بعد السنة (حكمه) أي حكم ما يبقى على الدوام.

(و) الضرب (الثاني ما لا يبقى) على الدوام، (كالطعام الرطب؛ فهو) الملتقط له (مخير بين) خصلتين (أكله وغرمه) أو غرم قيمته (أو بيعه وحفظ ثمنه) إلى ظهور مالكه.

(والثالث ما يبقى بعلاج) فيه، (كالرطب) والعنب (فيفعل ما فيه المصلحة، من بيعه وحفظ ثمنه، أو تجفيفه وحفظه) إلى ظهور مالكه.

(والرابع ما يحتاج إلى نفقة، كالحيوان؛ وهو ضربان): أحدهما (حيوان لا يمتنع بنفسه) من صغار السباع كغنم وعجل؛ (فهو) أي الملتقط (مخير) فيه (بين) ثلاثة أشياء: (أكله وغرم ثمنه، أو تركه) بلا أكل (والتطوع بالإنفاق عليه أو بيعه وحفظ ثمنه) إلى ظهور مالكه. (و) الثاني ms076 (حيوان يمتنع بنفسه) من صغار السباع، كبعير وفرس؛ (فإن وجده) الملتقط (في الصحراء تركه) وحرم التقاطه للتملك. فلو أخذه للتملك ضمنه، (وإن وجده) الملتقط (في الحضر؛ فهو مخير بين الأشياء

الثلاثة فيه). والمراد الثلاثة السابقة فيما لا يمتنع.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, '• اللقيط', '{فصل} في أحكام اللقيط. وهو صبي منبوذ لا كافل له من أب أو جد أو ما يقوم مقامهما. ويلحق بالصبي - كما قال بعضهم - المجنون البالغ.

(وإذا وجد لقيط) بمعنى ملقوط (بقارعة الطريق فأخذه) منها (وتربيته وكفالته واجبة على الكفاية). فإذا التقطه بعض ممن هو أهل لحضانة اللقيط سقط الإثم عن الباقي؛ فإن لم يلتقطه أحد أثم الجميع. ولو علم به واحد فقط تعين عليه، ويجب في الأصح الإشهاد على التقاطه. وأشار المصنف لشرط الملتقط بقوله: (ولا يقر) اللقيط (إلا في يد أمين) حر مسلم رشيد؛ (فإن وجد معه) أي اللقيط (مال أنفق عليه

الحاكم منه). ولا ينفق الملتقط عليه منه إلا بإذن الحاكم. (وإن لم يوجد معه) أي اللقيط (مال فنفقته) كائنة (في بيت المال) إن لم يكن له مال عام كالوقف على اللقطاء. - وفي بعض النسخ «اللقطى».', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, '• الوديعة', '{فصل} في أحكام الوديعة. هي فعيلة من ودع إذا ترك. وتطلق لغة على الشيء المودوع عند غير صاحبه للحفظ. وتطلق شرعا على العقد المقتضي للاستحفاظ.

(والوديعة أمانة) في يد الوديع. (ويستحب قبولها لمن قام بالأمانة فيها) إن كان ثم غيره، وإلا وجب قبولها - كما أطلقه جمع. قال في الروضة كأصلها: وهذا محمول على أصل القبول، دون إتلاف منفعته وحرزه مجانا. (ولا يضمن) الوديع الوديعة (إلا بالتعدي) فيها. وصور التعدي كثيرة مذكورة في المطولات. منها أن يودع الوديعة عند غيره بلا إذن من المالك، ولا عذر من الوديع. ومنها أن ينقلها من محلة أو دار إلى أخرى

دونها في الحرز. (وقول المودع) بفتح الدال (مقبول في ردها على المودع) بكسر الدال.

(وعليه) أي الوديع (أن يحفظها في حرز مثلها)؛ فإن لم يفعل ضمن. (وإذا طولب) الوديع (بها) أي الوديعة (فلم يخرجها مع القدرة ms077 عليها حتى تلفت ضمن). فإن أخر إخراجها لعذر لم يضمن.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 114, 'كتاب أحكام الفرائض والوصايا', 'كتاب أحكام الفرائض والوصايا');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'والفرائض جمع فريضة، بمعنى مفروضة من الفرض بمعنى التقدير؛ والفريضة شرعا اسم نصيب مقدر لمستحقه. والوصايا جمع وصية من وصيت الشيء بالشيء إذا وصلته به. والوصية شرعا تبرع بحق مضاف لما بعد الموت.

(والوارثون من الرجال) المجمع على إرثهم (عشرة): بالاختصار، وبالبسط خمسة عشر. وعد المصنف العشرة بقوله: (الابن، وابن الابن وإن سفل، والأب، والجد وإن علا، والأخ، وابن الأخ وإن تراخى، والعم، وابن العم وإن تباعدا، والزوج، والمولى المعتق) إلخ. ولو اجتمع كل الرجال ورث منهم ثلاثة: الأب، والإبن، والزوج فقط، ولا يكون الميت في هذه الصورة إلا امرأة.

(والوارثات من النساء) المجمع على إرثهن (سبع): بالاختصار،

وبالبسط عشرة. وعد المصنف السبع في قوله: (البنت، وبنت الابن) وإن سفلت، (والأم، والجدة) وإن علت، (والأخت، والزوجة، والمولاة المعتقة) إلخ. ولو اجتمع كل النساء فقط ورث منهن خمس: البنت، وبنت الإبن، والأم، والزوجة، والأخت الشقيقة؛ ولا يكون الميت في هذه الصورة إلا رجلا.

(ومن لا يسقط) من الورثة (بحال خمسة: الزوجان) أي الزوج والزوجة، (والأبوان) أي الأب والأم، (وولد الصلب) ذكرا كان أو أنثى.

(ومن لا يرث بحال سبعة: العبد) والأمة. ولو عبر بالرقيق لكان أولى. (والمدبر، وأم الولد، والمكاتب). وأما الذي بعضه حر إذا مات عن مال ملكه ببعضه الحر ورثه قريبه الحر وزوجته ومعتق بعضه، (والقاتل) لا يرث ممن قتله، سواء كان قتله مضمونا أم لا، (والمرتد). ومثله الزنديق، وهو من يخفي الكفر ويظهر الإسلام، (وأهل ملتين)؛

فلا يرث مسلم من كافر، ولا عكسه. ويرث الكافر من الكافر وإن اختلف ملتهما، كيهودي ونصراني. ولا يرث حربي من ذمي، وعكسه. والمرتد لا يرث من مرتد ولا من مسلم ولا من كافر.

(وأقرب العصبات). وفي بعض النسخ «العصبة». وأريد بها من ليس له حال تعصيبه سهم مقدر من المجمع على توريثهم. وسبق بيانهم. وإنما اعتبر السهم حال التعصيب ليدخل الأب والجد؛ فإن لكل منهما سهما مقدرا في ms078 غير التعصيب، ثم عد المصنف الأقربية في قوله: (الابن، ثم ابنه، ثم الأب، ثم أبوه، ثم الأخ للأب والأم، ثم الأخ للأب، ثم ابن الأخ للأب والأم، ثم ابن الأخ للأب) إلخ. وقوله: (ثم العم على هذا الترتيب، ثم ابنه) أي فيقدم العم للأبوين ثم للأب، ثم بنو العم كذلك، ثم يقدم عم الأب من الأبوين ثم من الأب، ثم بنوهما كذلك، ثم يقدم عم الجد من الأبوين، ثم من الأب، وهكذا.

(فإن عدمت العصبات) من النسب، والميت عتيق (فالمولى المعتق)

يرثه بالعصوبة، ذكرا كان المعتق أو أنثى. فإن لم يوجد للميت عصبة بالنسب، ولا عصبة بالولاء فماله لبيت المال.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• الفروض المقدرة', '{فصل} (والفروض المذكورة). وفي بعض النسخ «والفروض المقدرة» (في كتاب الله تعالى ستة): لا يزاد عليها، ولا ينقص منها إلا لعارض كالعول. والستة هي: (النصف، والربع، والثمن، والثلثان، والثلث، والسدس). وقد يعبر الفرضيون عن ذلك بعبارة مختصرة، وهي الربع والثلث، وضعف كل ونصف كل.

(فالنصف فرض خمسة: البنت، وبنت الابن) إذا انفرد كل منهما عن ذكر يعصبها، (والأخت من الأب والأم، والأخت من الأب) إذا انفرد كل منهما عن ذكر يعصبها، (والزوج إذا لم يكن معه ولد)، ذكرا كان الولد أو أنثى،

ولا ولد ابن.

(والربع فرض اثنين: الزوج مع الولد أو ولد الابن)، سواء كان ذلك الولد منه أو من غيره. (وهو) أي الربع (فرض الزوجة) والزوجتين (والزوجات مع عدم الولد أو ولد الابن). والأفصح في الزوجة حذف التاء، ولكن إثباتها في الفرائض أحسن للتمييز.

(والثمن فرض الزوجة) والزوجين (والزوجات مع الولد أو ولد الابن) يشتركن كلهن في الثمن.

(والثلثان فرض أربعة: البنتين) فأكثر، (وبنتي الابن) فأكثر. وفي بعض النسخ «وبنات الابن»، (والأختين من الأب والأم) فأكثر، (والأختين من الأب) فأكثر. وهذا عند انفراد كل منهما عن إخوتهن؛ فإن كان معهن ذكر فقد يزدن على الثلثين، كما لو كن عشرا والذكر واحدا فلهن عشرة

من اثني عشر، وهي أكثر من ثلثيها، وقد ينقصن كبنتين مع ابنين.

(والثلث ms079 فرض اثنين: الأم إذا لم تحجب). وهذا إذا لم يكن للميت ولد، ولا ولد ابن أو اثنان من الإخوة والأخوات، سواء كن أشقاء أو لأب أو لأم. (وهو) أي الثلث (للاثنين فصاعدا من الإخوة والأخوات من ولد الأم)، ذكورا كانوا أو إناثا أو خناثى، أو البعض كذا، والبعض كذا.

(والسدس فرض سبعة: الأم مع الولد، أو ولد الابن، أو اثنين فصاعدا من الإخوة والأخوات)، ولا فرق بين الأشقاء وغيرهم، ولا بين كون البعض كذا، والبعض كذا. (وهو) أي السدس (للجدة عند عدم الأم). وللجدتين والثلاث، (ولبنت الابن مع بنت الصلب) لتكملة الثلثين، (وهو) أي السدس (للأخت من الأب مع الأخت من الأب والأم) لتكملة الثلثين؛ (وهو) أي السدس (فرض الأب مع الولد أو ولد الابن). ويدخل في كلام المصنف ما لو خلف الميت بنتا وأبا فللبنت النصف،

وللأب السدس فرضا، والباقي تعصيبا، (وفرض الجد) الوارث (عند عدم الأب). وقد يفرض للجد السدس أيضا مع الإخوة، كما لو كان معه ذو فرض، وكان سدس المال خيرا له من المقاسمة، ومن ثلث الباقي كبنتين وجد وثلاثة إخوة. (وهو) أي السدس (فرض الواحد من ولد الأم) ذكرا كان أو أنثى.

(وتسقط الجدات) سواء قربن أو بعدن (بالأم) فقط، (و) تسقط (الأجداد بالأب، ويسقط ولد الأم) أي الأخ للأم (مع) وجود (أربعة الولد) ذكرا كان أو أنثى (و) مع (ولد الابن) كذلك (و) مع (الأب والجد) وإن علا.

(ويسقط الأخ للأب والأم مع ثلاثة الابن، وابن الابن) وإن سفل، (و) مع (الأب) .

(ويسقط ولد الأب) بأربعة: (بهؤلاء الثلاثة) أي الابن، وابن الابن، والأب، (وبالأخ للأب والأم).

(وأربعة يعصبون أخواتهم): أي الإناث، للذكر مثل حظ الأنثيين: (الابن، وابن الابن، والأخ من الأب والأم، والأخ من الأب). أما الأخ من الأم فلا يعصب أخته، بل لهما الثلث.

(وأربعة يرثون دون أخواتهم؛ وهم: الأعمام، وبنو الأعمام، وبنو الأخ، وعصبات المولى المعتق). وإنما انفردوا عن أخواتهم لأنهم عصبة وارثون وأخواتهم من ذوي الأرحام لا يرثون.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• الوصية', '{فصل} في ms080 أحكام الوصية. وسبق معناها لغة وشرعا أوائل كتاب الفرائض. ويشترط في الموصى به أن يكون معلوما وموجودا. (و) حينئذ (تجوز الوصية بالمعلوم والمجهول) كاللبن في الضرع، (وبالموجود والمعدوم) كالوصية بثمر

هذه الشجرة قبل وجود الثمرة.

(وهي) أي الوصية (من الثلث) أي ثلث مال الموصي؛ (فإن زاد) على الثلث (وقف) الزائد (على إجازة الورثة) المطلقين التصرف؛ فإن أجازوا فإجازتهم تنفيذ للوصية بالزائد، وإن ردوه بطلت في الزائد. (ولا تجوز الوصية لوارث) وإن كانت ببعض الثلث (إلا أن يجيزها باقي الورثة) المطلقين التصرف.

وذكر المصنف شرط الموصي في قوله: (وتصح) وفي بعض النسخ «وتجوز» (الوصية من كل بالغ عاقل) أي مختار حر وإن كان كافرا أو محجورا عليه بسفه؛ فلا تصح وصية مجنون ومغمى عليه وصبي ومكره. وذكر شرط الموصى له إذا كان معينا في قوله: (لكل متملك) أي لكل من يتصور له الملك من صغير وكبير، وكامل ومجنون، وحمل موجود عند الوصية، بأن ينفصل لأقل من ستة أشهر من وقت الوصية. وخرج بمعين ما إذا كان الموصى له جهة عامة؛ فإن الشرط في هذا أن لا تكون الوصية جهة معصية، كعمارة كنيسة من مسلم أو كافر للتعبد

فيها. (و) تصح الوصية (في سبيل الله تعالى). وتصرف للغزاة.

وفي بعض النسخ بدل سبيل الله «وفي سبيل البر»، أي كالوصية للفقراء أو لبناء مسجد.

(وتصح الوصية) أي الإيصاء بقضاء الديون وتنفيذ الوصايا والنظر في أمر الأطفال (إلى من اجتمعت فيه خمس خصال: الإسلام، والبلوغ، والعقل، والحرية، والأمانة). واكتفى بها المصنف عن العدالة؛ فلا يصح الإيصاء لأضداد من ذكر، لكن الأصح جواز وصية ذمي إلى ذمي عدل في دينه على أولاد الكفار. ويشترط أيضا في الوصي أن لا يكون عاجزا عن التصرف؛ فالعاجز عنه لكبر أو هرم مثلا، لا يصح الإيصاء إليه. وإذا اجتمعت في أم الطفل الشرائط المذكورة فهي أولى من غيرها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 115, 'كتاب أحكام النكاح وما يتعلق به من الأحكام والقضايا', 'كتاب أحكام النكاح وما يتعلق به من الأحكام والقضايا');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وفي بعض النسخ «وما يتصل به» (من الأحكام والقضايا). وهذه الكلمة ساقطة ms081 من بعض نسخ المتن. والنكاح يطلق لغة على الضم والوطء والعقد، ويطلق شرعا على عقد مشتمل على الأركان والشروط. (والنكاح مستحب لمن يحتاج إليه) بتوقان نفسه للوطء، ويجد أهبته كمهر ونفقة؛ فإن فقد الأهبة لم يستحب له النكاح.

(ويجوز للحر أن يجمع بين أربع حرائر) فقط إلا أن تتعين الواحدة في حقه، كنكاح سفيه ونحوه مما يتوقف على الحاجة. (و) يجوز (للعبد) ولو مدبرا أو مبعضا أو مكاتبا أو معلقا عتقه بصفة (أن يجمع بين اثنتين) أي زوجتين فقط.

(ولا ينكح الحر أمة) لغيره (إلا بشرطين: عدم صداق الحرة) أو فقد الحرة أو عدم

رضاها به، (وخوف العنت) أي الزنا مدة فقد الحرة. وترك المصنف شرطين آخرين: أحدهما أن لا يكون تحته حرة مسلمة أو كتابية تصلح للاستمتاع، والثاني إسلام الأمة التي ينكحها الحر؛ فلا يحل لمسلم أمة كتابية. وإذا نكح الحر أمة بالشروط المذكورة ثم أيسر ونكح حرة لم ينفسخ نكاح الأمة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 115;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• نظر الرجل إلى المرأة', '(ونظر الرجل إلى المرأة على سبعة أضرب: أحدها نظره) ولو كان شيخا هرما عاجزا عن الوطء (إلى أجنبية لغير حاجة) إلى نظرها (فغير جائز)؛ فإن كان النظر لحاجة كشهادة عليها جاز.

(والثاني نظره) أي الرجل (إلى زوجته وأمته؛

فيجوز أن ينظر) من كل منها (إلى ما عدا الفرج منهما). أما الفرج فيحرم نظره؛ وهذا وجه ضعيف، والأصح جواز النظر إليه لكن مع الكراهة.

(والثالث نظره إلى ذوات محارمه) بنسب أو رضاع أو مصاهرة (أو أمته المزوجة، فيجوز) أن ينظر (فيما عدا ما بين السرة والركبة). أما الذي بينهما فيحرم نظره.

(والرابع النظر) إلى الأجنية (لأجل) حاجة (النكاح؛ فيجوز) للشخص عند عزمه على نكاح امرأة النظر (إلى الوجه والكفين) منها ظاهرا وباطنا وإن لم تأذن له الزوجة في ذلك، وينظر من الأمة على ترجيح النووي عند قصد خطبتها ما ينظره من الحرة.

(والخامس النظر للمداواة؛ فيجوز) نظر الطبيب من الأجنبية (إلى المواضع التي يحتاج إليها) في المداواة حتى مداواة الفرج. ويكون ذلك بحضور محرم ms082 أو زوج أو سيد، وأن لا تكون هناك امرأة تعالجها.

(والسادس النظر للشهادة) عليها فينظر الشاهد فرجها عند شهادته بزناها أو ولادتها؛ فإن تعمد النظر لغير الشهادة فسق، وردت شهادته (أو) النظر (للمعاملة) للمرأة في بيع وغيره؛ (فيجوز النظر) أي نظره لها. وقوله: (إلى الوجه) منها (خاصة) يرجع للشهادة وللمعاملة.

(والسابع النظر إلى الأمة عند ابتياعها) أي شرائها؛ (فيجوز) النظر (إلى المواضع التي يحتاج إلى تقليبها)؛ فينظر أطرافها وشعرها، لا عورتها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 115;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• ما لا يصح النكاح إلا به', '{فصل} فيما لا يصح النكاح إلا به. (ولا يصح عقد النكاح إلا بولي) عدل. وفي بعض النسخ «بولي ذكر»، وهو احتراز عن الأنثى؛ فإنها لا تزوج نفسها ولا غيرها. (و) لا يصح عقد النكاح أيضا إلا بحضور (شاهدي عدل).

وذكر المصنف شرط كل من الولي والشاهدين في قوله: (ويفتقر الولي والشاهدان إلى ستة شرائط): الأول (الإسلام)؛ فلا يكون ولي المرأة كافرا إلا فيما يستثنيه المصنف بعد. (و) الثاني (البلوغ)؛ فلا يكون ولي المرأة صغيرا.

(و) الثالث (العقل)؛ فلا يكون ولي المرأة مجنونا، سواء أطبق جنونه أو تقطع. (و) الرابع (الحرية)؛ فلا يكون الولي عبدا في إيجاب النكاح. ويجوز أن يكون قابلا في النكاح. (و) الخامس (الذكورة)؛ فلا تكون المرأة والخنثى وليين. (و) السادس (العدالة)؛ فلا يكون الولي فاسقا. واستثنى المصنف من ذلك ما تضمنه قوله: (إلا أنه لا يفتقر نكاح الذمية إلى إسلام الولي، ولا) يفتقر (نكاح الأمة إلى عدالة السيد)؛ فيجوز كونه فاسقا. وجميع ما سبق في الولي يعتبر في شاهدي النكاح. وأما العمى فلا يقدح في الولاية في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 115;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, '• ترتيب الولاية', '(وأولى الولاة) أي حق الأولياء بالتزويج (الأب، ثم الجد أبو الأب) ثم أبوه وهكذا. ويقدم الأقرب من الأجداد على الأبعد، (ثم الأخ للأب والأم) ولو عبر بالشقيق لكان أحصر، (ثم الأخ للأب، ثم ابن

الأخ للأب والأم) وإن سفل، (ثم ابن الأخ للأب) وإن سفل، (ثم العم) الشقيق ثم العم للأب، (ثم ابنه) أي ابن كل منهما وإن سفل (على ms083 هذا الترتيب)، فيقدم ابن العم الشقيق على ابن العم للأب.

(فإذا عدمت العصبات) من النسب (فالمولى المعتق) الذكر، (ثم عصابته) على ترتيب الإرث. أما المولاة المعتقة إذا كانت حية فيزوج عتيقتها من يزوج المعتقة بالترتيب السابق في أولياء النسب. فإذا ماتت المعتقة زوج عتيقتها من له الولاء على المعتقة ثم ابنه ثم ابن ابنه، (ثم الحاكم) يزوج عند فقد الأولياء من النسب والولاء.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 115;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 116, 'خطبة المعتدة', 'خطبة المعتدة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'ثم شرع المصنف في بيان الخطبة بكسر الخاء، وهي التماس الخاطب من المخطوبة النكاح؛ فقال: (ولا يجوز أن يصرح بخطبة معتدة) عن وفاة أو طلاق بائن أو رجعي. والتصريح ما يقطع بالرغبة في النكاح كقوله للمعتدة: «أريد نكاحك». (ويجوز) إن لم تكن المعتدة عن طلاق رجعي (أن يعرض لها) بالخطبة (وينكحها بعد انقضاء عدتها). والتعريض ما لا يقطع بالرغبة في النكاح، بل يحتملها كقول الخاطب للمرأة:

«رب راغب فيك». أما المرأة الخلية من موانع النكاح وعن خطبة سابقة فيجوز خطبتها تعريضا وتصريحا.

(والنساء على ضربين: ثيبات، وأبكار). والثيب من زالت بكارتها بوطء حلال أوحرام، والبكر عكسها؛ (فالبكر يجوز للأب والجد) عند عدم الأب أصلا أو عدم أهليته (إجبارها) أي البكر (على النكاح) إن وجدت شروط الإجبار بكون الزوجة غير موطوأة بقبل وأن تزوج بكفء بمهر مثلها من نقد البلد. (والثيب لا يجوز) لوليها (تزويجها إلا بعد بلوغها وإذنها) نطقا، لا سكوتا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• المحرمات', '{فصل} (والمحرمات) أي المحرم نكاحهن (بالنص أربع عشرة): وفي بعض النسخ «أربعة عشر»: (سبع بالنسب؛ وهن: الأم وإن

علت، والبنت وإن سفلت). أما المخلوقة من ماء زنا شخص فتحل له على الأصح، لكن مع الكراهة، وسواء كانت المزنى بها مطاوعة أو لا. وأما المرأة فلا يحل لها ولدها من الزنا، (والأخت) شقيقة كانت أو لأب أو لأم، (والخالة) حقيقة أو بتوسط كخالة الأب والأم، (والعمة) حقيقة أو بتوسط كعمة الأب، (وبنت الأخ) وبنات أولاده من ذكر أو أنثى، (وبنت الأخت) وبنات أولادها من ذكر أو أنثى. وعطف المصنف على قوله سابقا «سبع» قوله ms084 هنا:

(واثنتان) أي المحرمات بالنص اثنتان (بالرضاع) وهما: (الأم المرضعة، والأخت من الرضاع). وإنما اقتصر المصنف على الاثنتين للنص عليهما في الآية، وإلا فالسبع المحرمة بالنسب تحرم بالرضاع أيضا كما سيأتي التصريح به في كلام المتن.

(و) المحرمات بالنص (أربع بالمصاهرة) وهن: (أم الزوجة) وإن علت أمها، سواء من نسب أو رضاع، سواء وقع دخول الزوج بالزوجة أم لا، (والربيبة) أي بنت الزوجة (إذا دخل بالأم، وزوجة الأب) وإن علا، (وزوجة الابن) وإن سفل. والمحرمات السابقة حرمتها على التأبيد،

(وواحدة) حرمتها لا على التأبيد، بل (من جهة الجمع) فقط. (وهي أخت الزوجة)؛ فلا يجمع بينها وبين أختها من أب أو أم وبينهما نسب أو رضاع، ولو رضيت أختها بالجمع.

(ولا يجمع) أيضا (بين المرأة وعمتها، ولا بين المرأة وخالتها)؛ فإن جمع الشخص بين من حرم الجمع بينهما بعقد واحد نكحهما فيه بطل نكاحهما، أو لم يجمع بينهما، بل نكحهما مرتبا، فالثاني هو الباطل إن علمت السابقة؛ فإن جهلت بطل نكاحهما، وإن علمت السابقة ثم نسيت منع منهما. ومن حرم جمعهما بنكاح حرم جمعهما أيضا في الوطء بملك اليمين، وكذا لو كانت إحداهما زوجة والأخرى مملوكة. فإن وطئ واحدة من المملوكتين حرمت الأخرى حتى يحرم الأولى بطريق من الطرق كبيعها أو تزويجها. وأشار لضابط كلي بقوله:

(ويحرم من الرضاع ما يحرم من النسب). وسبق أن الذي يحرم من النسب سبع، فيحرم بالرضاع تلك السبع أيضا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• العيوب التي تجوز رد المرأة والرجل', 'ثم شرع في عيوب النكاح المثبتة للخيار فيه، فقال: (وترد المرأة) أي الزوجة (بخمسة عيوب): أحدها (بالجنون)، سواء أطبق أو تقطع قبل العلاج أو لا، فخرج

الإغماء؛ فلا يثبت به الخيار في فسخ النكاح ولو دام، خلافا للمتولي. (و) ثانيها بوجود (الجذام) بذال المعجمة، وهو علة يحمر منها العضو ثم يسود ثم يتقطع ثم يتناثر. (و) الثالث بوجود (البرص)، وهو بياض في الجلد يذهب دم الجلد وما تحته من اللحم؛ فخرج البهق، وهو ما يغير الجلد من غير إذهاب دمه؛ ms085 فلا يثبت به الخيار. (و) الرابع بوجود (الرتق)، وهو انسداد محل الجماع بلحم. (و) الخامس بوجود (القرن)، وهو انسداد محل الجماع بعظم. وما عدا هذه العيوب كالبخر والصنان لا يثبت به الخيار.

(ويرد الرجل) أيضا أي الزوج (بخمسة عيوب: بالجنون، والجذام، والبرص). وسبق معناها. (و) بوجود (الجب)، وهو قطع الذكر كله أو بعضه والباقي منه دون الحشفة؛ فإن بقي قدرها فأكثر فلا خيار. (و) بوجود (العنة) بضم العين، وهو عجز الزوج عن الوطء في القبل لسقوط القوة الناشرة لضعف في قلبه أو آلته.

ويشترط في العيوب المذكورة الرفع فيها إلى القاضي. ولا ينفرد الزوجان بالتراضي بالفسخ فيها كما يقتضيه كلام الماوردي وغيره، لكن ظاهر النص خلافه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, '• تسمية المهر', '{فصل} في أحكام الصداق. وهو بفتح الصاد أفصح من كسرها، مشتق من الصدق بفتح الصاد، وهو اسم لشديد الصلب؛ وشرعا اسم لمال واجب على الرجل بنكاح أو وطء شبهة أو موت.

(ويستحب تسمية المهر في) عقد (النكاح) ولو في نكاح عبد السيد أمته. ويكفي تسمية أي شيء كان، ولكن يسن عدم النقص عن عشرة دراهم وعدم الزيادة على خمسمائة درهم خالصة. وأشعر قوله: «يستحب» بجواز إخلاء النكاح عن المهر، وهو كذلك. (فإن لم يسم) في عقد النكاح مهر (صح العقد). وهذا معنى التفويض. ويصدر تارة من الزوجة البالغة الرشيدة كقولها لوليها: «زوجني بلا مهر» أو «على أن

لا مهر لي»؛ فيزوجها الولي وينفي المهر أو يسكت عنه. وكذا لو قال سيد الأمة لشخص: «زوجتك أمتي» ونفى المهر أو سكت. (و) إذا صح التفويض (وجب المهر) فيه (بثلاثة أشياء): وهي (أن يفرضه الزوج على نفسه) وترضى الزوجة بما فرضه، (أو يفرضه الحاكم) على

الزوج ويكون المفروض عليه مهر المثل. ويشترط علم القاضي بقدره. أما رضا الزوجين بما يفرضه فلا يشترط، (أو يدخل) أي الزوج (بها) أي الزوجة المفوضة قبل فرض من الزوج أو الحاكم؛ (فيجب) لها (مهر المثل) بنفس الدخول. ويعتبر هذا المهر بحال العقد في الأصح. وإن مات أحد الزوجين قبل فرض ms086 ووطء وجب مهر مثل في الأظهر. والمراد بمهر المثل قدر ما يرغب به في مثلها عادة.

(وليس لأقل الصداق) حد معين في القلة (ولا لأكثره حد) معين في الكثرة، بل الضابط في ذلك أن كل شيء صح جعله ثمنا من عين أو منفعة صح جعله صداقا. وسبق أن المستحب عدم النقص عن عشرة دراهم وعدم الزيادة على خمسمائة درهم.

(ويجوز أن يتزوجها على منفعة معلومة) كتعليمها القرآن.

(ويسقط بالطلاق قبل الدخول بها نصف المهر). أما بعد الدخول ولو مرة واحدة فيجب كل المهر ولو كان الدخول حراما كوطء الزوج زوجته حال إحرامها أو حيضها. ويجب كل المهر كما سبق بموت أحد الزوجين، لا بخلوة الزوج بها - في الجديد. وإذا قتلت الحرة نفسها قبل الدخول بها لا يسقط مهرها، بخلاف ما لو قتلت الأمة نفسها أو قتلها سيدها قبل الدخول فإنه يسقط مهرها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, '• الوليمة', '{فصل} (والوليمة على العرس مستحبة). والمراد بها طعام يتخذ للعرس. وقال الشافعي: تصدق الوليمة على كل دعوة لحادث سرور. وأقلها للمكثر شاة، وللمقل ما تيسر. وأنواعها كثيرة مذكورة في المطولات. (والإجابة إليها) أي وليمة العرس (واجبة) أي فرض عين في

الأصح. ولا يجب الأكل منها في الأصح. أما الإجابة لغير وليمة العرس من بقية الولائم فليست فرض عين، بل هي سنة. وإنما تجب الدعوة لوليمة العرس أو تسن لغيرها بشرط أن لا يخص الداعي الأغنياء بالدعوة، بل يدعوهم والفقراء وأن يدعوهم في اليوم الأول. فإن أولم ثلاثة أيام لم تجب الإجابة في اليوم الثاني، بل تستحب، وتكره في اليوم الثالث. وبقية الشروط مذكورة في المطولات. وقوله (إلا من عذر) أي مانع من الإجابة للوليمة، كأن يكون في موضع الدعوة من يتأذي به المدعو أو لا تليق به مجالسته.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, '• التسوية في القسم بين الزوجات', '{فصل} في أحكام القسم والنشوز. الأول من جهة الزوج، والثاني من جهة الزوجة. ومعنى نشوزها ارتفاعها عن أداء الحق الواجب عليها. وإذا كان في عصمة شخص زوجتان فأكثر لا يجب عليه القسم بينهما أو ms087 بينهن حتى لو أعرض عنهن أو عن الواحدة؛ فلم يبت عندهن أو عندها لم يأثم، ولكن يستحب أن لا يعطلهن من المبيت، ولا الواحدة أيضا، بأن يبيت عندهن أو عندها. وأدنى درجات الواحدة أن لا يخليها كل أربع ليال عن ليلة.

(والتسوية في القسم بين الزوجات واجبة). وتعتبر التسوية بالمكان تارة، وبالزمان أخرى. أما المكان فيحرم الجمع بين الزوجتين فأكثر في مسكن واحد إلا بالرضا. وأما الزمان فمن لم يكن حارسا مثلا فعماد القسم في حقه الليل، والنهار تبع له. ومن كان حارسا فعماد القسم في حقه النهار، والليل تبع له. (ولا يدخل) الزوج ليلا (على غير المقسوم لها لغير حاجة). فإن كان لحاجة كعيادة ونحوها لم يمنع من الدخول؛ وحينئذ إن طال مكثه قضى من نوبة المدخول عليها مثل مكثه؛ فإن جامع قضى زمن الجماع إلا أن يقصر زمنه فلا يقضيه. (وإذا أراد) من في عصمته زوجات (السفر أقرع بينهن وخرج) أي سافر (بالتي تخرج لها القرعة). ولا يقضي الزوج المسافر للمتخلفات مدة سفره ذهابا؛ فإن وصل مقصده وصار مقيما بأن نوى إقامة مؤثرة أول سفره أو عند وصول مقصده أو قبل وصوله قضى مدة الإقامة إن ساكن المصحوبة معه في السفر - كما قاله الماوردي؛ وإلا لم يقض. أما مدة الرجوع فلا يجب على الزوج قضاؤها بعد إقامته.

(وإذا تزوج) الزوج (جديدة خصها) حتما ولو كانت أمة، وكان عند الزوج غير الجديدة وهو يبيت

عندها (بسبع ليال) متواليات (إن كانت) تلك الجديدة (بكرا). ولا يقضي للباقيات، (و) خصها (بثلاث) متواليات (إن كانت) تلك الجديدة (ثيبا). فلو فرق الليالي بنومه ليلة عند الجديدة وليلة في مسجد مثلا لايحسب لها ذلك، بل يوفى الجديدة حقها متواليا ويقضي ما فرقه للباقيات.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, '• نشوز المرأة', '(وإذا خاف) الزوج (نشوز المرأة). وفي بعض النسخ «وإذا بان نشوز المرأة»، أي ظهر (وعظها) زوجها بلا ضرب ولا هجر لها، كقوله لها: «اتقي الله في الحق الواجب لي عليك، واعلمي أن النشوز مسقط للنفقة والقسم». وليس الشتم للزوج ms088 من النشوز، بل تستحق به التأديب من الزوج في الأصح، ولا يرفعها إلى القاضي. (فإن أبت) بعد الوعظ (إلا النشوز هجرها) في مضجعها، وهو فراشها؛ فلا يضاجعها فيه. وهجرانها بالكلام حرام فيما زاد على ثلاثة أيام. وقال في الروضة: أنه في الهجر بغير عذر شرعي؛ وإلا فلا تحرم الزيادة على الثلاثة. (فإن أقامت عليه) أي النشوز بتكرره منها (هجرها وضربها) ضرب تأديب لها. وإن أفضى ضربها إلى التلف وجب الغرم. (ويسقط بالنشوز قسمها ونفقتها).', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, '• الخلع', '{فصل} في أحكام الخلع. وهو بضم الخاء المعجمة مشتق من الخلع بفتحها، وهو النزع، وشرعا فرقة بعوض مقصود؛ فخرج الخلع على دم ونحوه. (والخلع جائز على عوض معلوم) مقدور على تسليمه؛ فإن كان على عوض مجهول، كأن خالعها على ثوب غير معين بانت بمهر المثل. (و) الخلع الصحيح (تملك به المرأة نفسها، ولا رجعة له) أي الزوج (عليها) سواء كان العوض صحيحا أو لا. وقوله: (إلا بنكاح جديد) ساقط في أكثر النسخ. (ويجوز الخلع في الطهر وفي الحيض). ولا يكون حراما. (ولا يلحق المختلعة الطلاق) بخلاف الرجعية فيلحقها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, '• أنواع الطلاق', '{فصل} في أحكام الطلاق. وهو لغة حل القيد، وشرعا اسم لحل قيد النكاح. ويشترط لنفوذه التكليف والاختيار. وأما السكران فينفذ طلاقه عقوبة له.

(والطلاق ضربان: صريح، وكناية)؛ فالصريح ما لا يحتمل غير الطلاق، والكناية ما تحتمل غيره. ولو تلفظ الزوج بالصريح، وقال: «لم أرد به الطلاق»، لم يقبل قوله؛ (فالصريح ثلاثة ألفاظ: الطلاق) وما اشتق منه، كطلقتك، وأنت طالق ومطلقة، (والفراق، والسراح) كفارقتك، وأنت مفارقة، وسرحتك، وأنت مسرحة. ومن الصريح أيضا الخلع إن ذكر المال. وكذا المفاداة. (ولا يفتقر صريح الطلاق إلى النية). ويستثنى المكره على الطلاق؛ فصريحه كناية في حقه، إن نوى وقع، وإلا فلا.

(والكناية كل لفظ احتمل الطلاق وغيره، ويفتقر إلى النية)؛ فإن نوى بالكناية الطلاق وقع، وإلا فلا. وكناية الطلاق كأنت برية خلية، الحقي بأهلك، وغير ذلك مما هو في المطولات.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 10, NULL, '• أنواع المطلقات', '(والنساء فيه) أي الطلاق (ضربان:

ضرب في طلاقهن ms089 سنة وبدعة، وهن ذوات الحيض). وأراد المصنف بالسنة الطلاق الجائز، وبالبدعة الطلاق الحرام؛ (فالسنة أن يوقع) الزوج (الطلاق في طهر غير مجامع فيه؛ والبدعة أن يوقع) الزوج (الطلاق في الحيض أو في طهر جامعها فيه).

(وضرب ليس في طلاقهن سنة ولا بدعة؛ وهن أربع: الصغيرة، والآيسة)، وهي التي انقطع حيضها، (والحامل، والمختلعة التي لم يدخل بها) الزوج. وينقسم الطلاق باعتبار آخر إلى واجب كطلاق المولي، ومندوب كطلاق امرأة غير مستقمية الحال كسيئة الخلق، ومكروه كطلاق مستقمية الحال، وحرام كطلاق البدعة وقد سبق. وأشار الإمام للطلاق المباح بطلاق

من لا يهواها الزوج ولا تسمح نفسه بمؤنتها بلا استمتاع بها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 11, NULL, '• حكم طلاق الحر والعبد وغير ذلك', '{فصل} في حكم طلاق الحر والعبد وغير ذلك. (ويملك) الزوج (الحر) على زوجته ولو كانت أمة (ثلاث تطليقات، و) يملك (العبد) عليها (تطليقتين) فقط، حرة كانت الزوجة أو أمة. والمبعض والمكاتب والمدبر كالعبد القن.

(ويصح الاستثناء في الطلاق إذا وصله به) أي وصل الزوج لفظ المستثنى بالمستثنى منه اتصالا عرفيا، بأن يعد في العرف كلاما واحدا. ويشترط أيضا أن ينوي الاستثناء قبل فراغ اليمين. ولا يكفي التلفظ به من غير نية الاستثناء. ويشترط أيضا عدم استغراق المستثنى المستثنى منه؛ فإن استغرق ك «أنت طالق ثلاثا إلا ثلاثا» بطل الاستثناء. (ويصح تعليقه) أي الطلاق (بالصفة والشرط) ك «إن دخلت الدار فأنت طالق»؛ فتطلق إذا دخلت. (و) الطلاق لا يقع إلا على زوجة. وحينئذ (لا يقع الطلاق قبل النكاح)؛ فلا يصح طلاق الأجنبية تنجيزا كقوله لها: «طلقتك».

ولا تعليقا كقوله لها: «إن تزوجتك فأنت طالق». «وإن تزوجت فلانة فهي طالق».', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 12, NULL, '• من لا يقع طلاقه', '(وأربع لا يقع طلاقهم: الصبي، والمجنون). وفي معناه المغمى عليه، (والنائم، والمكره) أي بغير حق؛ فإن كان بحق وقع. وصورته كما قال جمع إكراه القاضي للمولي بعد مدة الإيلاء على الطلاق. وشرط الإكراه قدرة المكره - بكسر الراء - على تحقيق ما هدد به المكره - بفتحها- بولاية أو تغلب، وعجز المكره - بفتح الراء - عن دفع المكره - بكسرها ms090 - بهرب منه أو استغاثة بمن يخلصه ونحو ذلك، وظنه أنه إن امتنع مما أكره عليه فعل ما خوفه. ويحصل الإكراه بالتخويف بضرب شديد أو حبس أو إتلاف مال ونحو ذلك. وإذا ظهر من المكره - بفتح الراء - قرينة اختيار، بأن أكرهه شخص على طلاق ثلاث فطلق واحدة وقع الطلاق. وإذا صدر تعليق الطلاق بصفة من مكلف ووجدت تلك الصفة في غير تكليف فإن الطلاق المعلق بها يقع بها. والسكران ينفذ طلاقه كما سبق.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 13, NULL, '• البائن والرجعي', '{فصل} في أحكام الرجعة. الرجعة بفتح الراء، وحكي كسرها. وهي لغة المرة من الرجوع، وشرعا رد الزوجة إلى النكاح في عدة طلاق غير بائن على وجه مخصوص. وخرج بطلاق وطء الشبهة والظهار؛ فإن استباحة الوطء فيهما بعد زوال المانع لا تسمى رجعة. (وإذا طلق) شخص (امرأته واحدة أو اثنتين فله) بغير إذنها (مراجعتها مالم تنقض عدتها). وتحصل الرجعة من الناطق بألفاظ، منها «راجعتك» وما تصرف منها. والأصح أن قول المرتجع: «رددتك لنكاحي، وأمسكتك عليه» صريحان في الرجعة. وأن قوله: «تزوجتك أو نكحتك» كنايتان. وشرط المرتجع إن لم يكن محرما أهلية النكاح بنفسه؛ وحينئذ فتصح رجعة السكران، لا رجعة المرتد، ولا رجعة الصبي والمجنون؛ لأن كلا منهم غير أهل للنكاح بنفسه، بخلاف السفيه والعبد فرجعتهما صحيحة من غير إذن الولي والسيد وإن توقف ابتداء نكاحهما على إذن الولي والسيد.

(فإن انقضت عدتها) أي الرجعية (حل له) أي زوجها (نكاحها بعقد جديد، وتكون معه) بعد العقد (على ما بقي من الطلاق)، سواء اتصلت بزوج غيره أم لا.

(فإن طلقها) زوجها (ثلاثا) إن كان حرا، أو طلقتين إن كان عبدا قبل الدخول أو بعده (لم تحل له إلا بعد وجود خمس شرائط): أحدها (انقضاء عدتها منه) أي المطلق. (و) الثاني (تزويجها بغيره) تزويجا صحيحا. (و) الثالث (دخوله) أي الغير (بها، وإصابتها) بأن يولج حشفته أو قدرها من مقطوعها بقبل المرأة، لا بدبرها بشرط الانتشار في الذكر، وكون المولج ممن يمكن جماعه، لا طفلا. (و) الرابع (بينونتها منه) أي الغير. ms091 (و) الخامس (انقضاء عدتها منه).', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 14, NULL, '• أحكام الإيلاء', '{فصل} في بيان أحكام الإيلاء. وهو لغة مصدر آلى يولي إيلاء إذا حلف، وشرعا حلف زوج يصح طلاقه ليمتنع من وطء زوجته في قبلها مطلقا، أو فوق أربعة أشهر.

وهذا المعنى مأخوذ من قول المصنف: (وإذا حلف أن لا يطأ زوجته) وطأ (مطلقا أو مدة) أي وطأ مقيدا بمدة (تزيد على أربعة أشهر؛ فهو) أي الحالف المذكور (مول) من زوجته، سواء حلف بالله تعالى أو بصفة من صفاته أو علق وطء زوجته بطلاق أو عتق، كقوله: «إن وطئتك فأنت طالق أو فعبدي حر». فإذا وطئ طلقت وعتق العبد. وكذا لو قال: «إن وطئتك فلله علي صلاة أو صوم أو حج أو عتق» فإنه يكون موليا أيضا. (ويؤجل له) أي يمهل المولي حتما، حرا كان أو عبدا في زوجة مطيقة للوطء. (إن سألت ذلك أربعة أشهر) وابتداؤها في الزوجة من الإيلاء، وفي الرجعية من الرجعة، (ثم) بعد انقضاء هذه المدة (يخير) المولي (بين الفيئة) بأن يولج المولي حشفته أو قدرها من مقطوعها بقبل المرأة (والتكفير) لليمين إن كان حلفه بالله تعالى على ترك وطئها (أو الطلاق) للمحلوف عليها.

(فإن امتنع) الزوج من الفيئة والطلاق (طلق عليه الحاكم) طلقة واحدة رجعية؛ فإن طلق أكثر منها لم يقع؛ فإن امتنع من الفيئة فقط أمره الحاكم بالطلاق.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 15, NULL, '• أحكام الظهار', '{فصل} في بيان أحكام الظهار. وهو لغة مأخوذ من الظهر، وشرعا تشبيه الزوج زوجته غير البائن بأنثى لم تكن حلا له. (والظهار أن يقول الرجل لزوجته: «أنت علي كظهر أمي»). وخص الظهر دون البطن مثلا، لأن الظهر موضع الركوب، والزوجة مركوب الزوج. (فإذا قال لها ذلك) أي أنت علي كظهر أمي، (ولم يتبعه بالطلاق صار عائدا) من زوجته، (ولزمته) حينئذ (الكفارة) وهي مرتبة. وذكر المصنف بيان ترتيبها في قوله:

(والكفارة عتق رقبة مؤمنة) مسلمة ولو بإسلام أحد أبويها (سليمة من العيوب المضرة بالعمل والكسب) إضرارا بينا، (فإن لم يجد) المظاهر الرقبة المذكورة، بأن عجز عنها حسا أو شرعا ms092 (فصيام شهرين متتابعين). ويعتبر الشهران بالهلال، ولو نقص كل منهما عن ثلاثين يوما. ويكون صومهما بنية الكفارة من الليل. ولا يشترط نية تتابع في الأصح، (فإن لم يستطع) المظاهر صوم الشهرين

أو لم يستطع تتابعها (فإطعام ستين مسكينا) أو فقيرا؛ (كل مسكين) أو فقير (مد) من جنس الحب المخرج في زكاة الفطر؛ وحينئذ فيكون من غالب قوت بلد المكفر كبر وشعير، لا دقيق وسويق. وإذا عجز المكفر عن الخصال الثلاث استقرت الكفارة في ذمته. فإذا قدر بعد ذلك على خصلة فعلها، ولو قدر على بعضها كمد طعام أو بعض مد أخرجه. (ولا يحل للمظاهر وطؤها) أي زوجته التي ظاهر منها (حتى يكفر) بالكفارة المذكورة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 16, NULL, '• أحكام القذف واللعان', '{فصل} في بيان أحكام القذف واللعان. وهو لغة مصدر مأخوذ من اللعن أي البعد، وشرعا كلمات مخصوصة جعلت حجة للمضطر إلى قذف من لطخ فراشه، وألحق العار به.

(وإذا رمى) أي قذف (الرجل زوجته بالزنا فعليه حد القذف)،

وسيأتي أنه ثمانون جلدة (إلا أن يقيم) الرجل القاذف (البينة) بزنا المقذوفة، (أو يلاعن) زوجته المقذوفة. وفي بعض النسخ «أو يلتعن» أي بأمر الحاكم أو من في حكمه كالمحكم؛ (فيقول عند الحاكم في الجامع على المنبر في جماعة من الناس) أقلهم أربعة: (أشهد بالله إنني لمن الصادقين فيما رميت به زوجتي) الغائبة (فلانة من الزنا). وإن كانت حاضرة أشار لها بقوله: «زوجتي هذه». وإن كان هناك ولد ينفيه ذكره في الكلمات فيقول: (وأن هذا الولد من الزنا، وليس مني). ويقول الملاعن هذه الكلمات (أربع مرات. ويقول في) المرة (الخامسة بعد أن يعظه الحاكم) أو المحكم بتخويفه له من عذاب الله تعالى في الآخرة وأنه أشد من عذاب الدنيا: («وعلي لعنة الله إن كنت من الكاذبين»). فيما رميت به هذه من الزنا. وقول المصنف على المنبر في جماعة ليس بواجب في اللعان، بل هو سنة.

(ويتعلق بلعانه) أي الزوج وإن لم تلاعن الزوجة (خمسة أحكام):

أحدها (سقوط الحد) أي حد القذف للملاعنة (عنه) إن كانت محصنة ms093 وسقوط التعزير عنه إن كانت غير محصنة. (و) الثاني (وجوب الحد عليها) أي حد زناها مسلمة كانت أو كافرة إن لم تلاعن. (و) الثالث (زوال الفراش). وعبر عنه غير المصنف بالفرقة المؤبدة، وهي حاصلة ظاهرا وباطنا وإن كذب الملاعن نفسه. (و) الرابع (نفي الولد) عن الملاعن. أما الملاعنة فلا ينتفي عنها نسب الولد. (و) الخامس (التحريم على الأبد)؛ فلا يحل للملاعن نكاحها ولا وطؤها بملك اليمين لو كانت أمة واشتراها. وفي المطولات زيادة على هذه الخمسة، منها سقوط حصانتها في حق الزوج إن لم تلاعن حتى لو قذفها بزنا بعد ذلك لا يحد.

(ويسقط الحد عنها بأن تلتعن) أي تلاعن الزوج بعد تمام لعانه (فتقول) في لعانها إن كان الملاعن حاضرا: («أشهد بالله، أن فلانا هذا لمن الكاذبين، فيما رماني به من الزنا»). وتكرر الملاعنة هذا الكلام (أربع

مرات، وتقول في المرة الخامسة) من لعانها (بعد أن يعظها الحاكم) أو المحكم بتخويفه لها من عذاب الله في الآخرة، وأنه أشد من عذاب الدنيا: («وعلي غضب الله إن كان من الصادقين») فيما رماني به من الزنا. وما ذكر من القول المذكور محله في الناطق. أما الأخرس فيلاعن بإشارة مفهمة؛ ولو أبدل في كلمات اللعان لفظ الشهادة بالحلف كقول الملاعن: «أحلف بالله»، أو لفظ الغضب باللعن وعكسه كقولها: «لعنة الله علي». وقوله: غضب الله علي، أو ذكر كل من الغضب واللعن قبل تمام الشهادات الأربع لم يصح في الجميع.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 17, NULL, '• أحكام العدة وأنواع المعتدة', '{فصل} في أحكام العدة وأنواع المعتدة. وهي لغة الاسم من اعتد، وشرعا تربص المرأة مدة يعرف فيها براءة رحمها بأقراء أو أشهر أو وضع حمل.

(والمعتدة على ضربين: متوفى عنها) زوجها، (وغير متوفى عنها؛

فالمتوفى عنها) زوجها (إن كانت) حرة (حاملا فعدتها) عن وفاة زوجها (بوضع الحمل) كله حتى ثاني توأمين مع إمكان نسبة الحمل للميت ولو احتمالا، كمنفي بلعان. فلو مات صبي لا يولد لمثله عن حامل فعدتها بالأشهر، لا بوضع الحامل؛ (وإن كانت حائلا فعدتها أربعة أشهر ms094 وعشر) من الأيام بلياليها. وتعتبر الأشهر بالأهلة ما أمكن، ويكمل المنكسر ثلاثين يوما.

(وغير المتوفى عنها) زوجها (إن كانت حاملا فعدتها بوضع الحمل) المنسوب لصاحب العدة، (وإن كانت حائلا وهي من ذوات) أي صواحب (الحيض فعدتها ثلاثة قروء، وهي الأطهار). وإن طلقت طاهرا حائضا بأن بقي من زمن طهرها بقية بعد طلاقها انقضت عدتها بالطعن في حيضة ثالثة، أو طلقت حائضا أو نفساء انقضت عدتها بالطعن في حيضة رابعة، وما بقي من حيضها لا يحسب قرءا. (وإن كانت) تلك المعتدة (صغيرة) أو

كبيرة لم تحض أصلا ولم تبلغ سن اليأس أو كانت متحيرة (أو آيسة فعدتها ثلاثة أشهر) هلالية إن انطبق طلاقها على أول الشهر. فإن طلقت في أثناء شهر فبعده هلالان، ويكمل المنكسر ثلاثين يوما من الشهر الرابع؛ فإن حاضت المعتدة في الأشهر وجب عليها العدة بالأقراء، أو بعد انقضاء الأشهر لم تجب الأقراء.

(والمطلقة قبل الدخول بها لا عدة عليها) سواء باشرها الزوج فيما دون الفرج أم لا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 18, NULL, '• عدة الأمة', '(وعدة الأمة) الحامل إذا طلقت طلاقا رجعيا أو بائنا (بالحمل) أي بوضعه بشرط نسبته إلى صاحب العدة. وقوله: (كعدة الحرة) الحامل أي في جميع ما سبق، (وبالأقراء أن تعتد بقرأين). والمبعضة والمكاتبة وأم الولد كالأمة، (وبالشهور عن الوفاة أن تعتد بشهرين وخمس ليال، و) عدتها (عن الطلاق أن تعتد بشهر ونصف) على النصف، وفي قول شهران. وكلام الغزالي يقتضي ترجيحه. وأما المصنف فجعله

أولى حيث قال: (فإن اعتدت بشهرين كان أولى). وفي قول عدتها ثلاثة أشهر، وهو الأحوط - كما قال الشافعي - رضي الله عنه - وعليه جمع من الأصحاب.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 19, NULL, '• أنواع المعتدة وأحكامها', '{فصل} في أنواع المعتدة وأحكامها. (ويجب للمعتدة الرجعية السكنى) في مسكن فراقها إن لاق بها، (والنفقة) والكسوة إلا أن تكون ناشزة قبل طلاقها أو في أثناء عدتها. وكما يجب لها النفقة يجب لها بقية المؤن إلا آلة التنظيف. (ويجب للبائن السكنى دون النفقة إلا أن تكون حاملا)؛ فتجب النفقة لها بسبب الحمل على الصحيح. وقيل إن النفقة ms095 للحمل.

(ويجب على المتوفى عنها) زوجها (الإحداد؛ وهو) لغة مأخوذ من الحد، وهو المنع، وشرعا (الامتناع من الزينة) بترك لبس مصبوغ يقصد

به الزينة كثوب أصفر أو أحمر. ويباح غير المصبوغ من قطن وصوف وكتان وإبريسم، ومصبوغ لا يقصد لزينة، (و) الامتناع من (الطيب) أي من استعماله في بدن أو ثوب أو طعام أو كحل غير محرم، أما المحرم كالاكتحال بالأثمد الذي لا طيب فيه فحرام إلا لحاجة كرمد، فيرخص فيه للمحدة، ومع ذلك فتستعمله ليلا وتمسحه نهارا إلا إن دعت ضرورة لاستعماله نهارا. وللمرأة أن تحد على غير زوجها من قريب لها أو أجنبي ثلاثة أيام فأقل، وتحرم الزيادة عليها إن قصدت ذلك؛ فإن زادت عليها بلا قصد لا يحرم.

• ملازمة البيت على المتوفى عنها زوجها والمبتوتة

(و) يجب (على المتوفى عنها زوجها والمبتوتة ملازمة البيت) أي وهو المسكن الذي كانت فيه عند الفرقة إن لاق بها، وليس لزوج ولا لغيره إخراجها من مسكن فراقها، ولا لها خروج منه. وإن رضي زوجها (إلا لحاجة) فيجوز لها الخروج، كأن تخرج في النهار لشراء طعام أو كتان وبيع غزل أو قطن ونحو ذلك. ويجوز لها الخروج ليلا إلى دار جارتها لغزل وحديث ونحوهما بشرط أن ترجع وتبيت في بيتها، ويجوز لها الخروج أيضا إذا خافت على نفسها أو ولدها وغير ذلك مما هو مذكور في المطولات.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 20, NULL, '• أحكام الاستبراء', '{فصل} في أحكام الاستبراء. وهو لغة طلب البراءة، وشرعا تربص المرأة مدة بسبب حدوث الملك فيها أو زواله عنها تعبدا أو لبراءة رحمها من الحمل. والاستبراء يجب بشيئين: أحدهما زوال الفراش، وسيأتي في قول المتن: «وإذا مات سيد أم الولد', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 117, '…', '…');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '» إلخ. والسبب الثاني حدوث الملك. وذكره المصنف في قوله: (ومن استحدث ملك أمة) بشراء لا خيار فيه أو بإرث أو وصية أو هبة أو غير ذلك من طرق الملك لها ولم تكن زوجته (حرم عليه) عند إرادة وطئها (الاستمتاع بها حتى يستبرئها. إن كانت من ذوات الحيض بحيضة) ولو كانت بكرا، ولو استبرأها ms096 بائعها قبل بيعها، ولو كانت منتقلة من صبي أو امرأة. (وإن كانت) الأمة (من ذوات الشهور) فعدتها (بشهر فقط، وإن كانت من ذوات الحمل) فعدتها (بالوضع). وإذا اشترى زوجته سن له استبراؤها. وأما الأمة المزوجة أو المعتدة إذا اشتراها شخص فلا يجب

استبراؤها حالا. فإذا زالت الزوجية والعدة كأن طلقت الأمة قبل الدخول أو بعده وانقضت العدة وجب الاستبراء حينئذ.

(وإذا مات سيد أم الولد) وليست في زوجية ولا عدة نكاح (استبرأت) حتما (نفسها كالأمة) أي فيكون استبراؤها بشهر إن كانت من ذوات الأشهر، وإلا فبحيضة إن كانت من ذوات الأقراء. ولو استبرأ السيد أمته الموطوأة ثم أعتقها فلا استبراء عليها، ولها أن تتزوج في الحال.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 117;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• أحكام الرضاع', '{فصل} في أحكام الرضاع. بفتح الراء وكسرها، وهو لغة اسم لمص الثدي وشرب لبنه، وشرعا وصول لبن آدمية مخصوصة لجوف آدمي مخصوص على وجه مخصوص. وإنما يثبت الرضاع بلبن امرأة حية بلغت تسع سنين قمرية بكرا كانت أو ثيبا، خلية كانت أو مزوجة.

(وإذا أرضعت المرأة بلبنها ولدا) سواء شرب منها اللبن في حياتها أو بعد موتها، وكان محلوبا في حياتها (صار الرضيع ولدها بشرطين:

أحدهما أن يكون له) أي الرضيع (دون الحولين) بالأهلة. وابتداؤهما من تمام انفصال الرضيع. ومن بلغ سنتين لا يؤثر ارتضاعه تحريما، (و) الشرط (الثاني أن ترضعه) أي المرضعة (خمس رضعات متفرقات) واصلة جوف الرضيع. وضبطهن بالعرف؛ فما قضي بكونه رضعة أو رضعات اعتبر، وإلا فلا. فلو قطع الرضيع الارتضاع بين كل من الخمس إعراضا عن الثدي تعدد الارتضاع. (ويصير زوجها) أي المرتضعة (أبا له) أي الرضيع.

(ويحرم على المرضع) بفتح الضاد (التزويج إليها) أي المرضعة (وإلى كل من ناسبها) أي انتسب إليها بنسب أو رضاع، (ويحرم عليها) أي المرضعة (التزويج إلى المرضع وولده) وإن سفل، ومن انتسب إليه وإن علا، (دون من كان في درجته) أي الرضيع كإخوته الذين لم يرضعوا معه (أو أعلى) أي ودون من كان أعلى (طبقة منه) أي الرضيع كأعمامه. وتقدم

في فصل ms097 محرمات النكاح ما يحرم بالنسب والرضاع مفصلا؛ فارجع إليه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 117;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• أحكام نفقة الأقارب', '{فصل} في أحكام نفقة الأقارب. وفي بعض نسخ المتن تأخير هذا الفصل عن الذي بعده. والنفقة مأخوذة من الإنفاق، وهو الإخراج. ولا يستعمل إلا في الخير. وللنفقة أسباب ثلاثة: القرابة وملك اليمين والزوجية. وذكر المصنف السبب الأول في قوله: (ونفقة العمودين من الأهل واجبة للوالدين، والمولودين) أي ذكورا كانوا أو إناثا، اتفقوا في الدين أو اختلفوا فيه، واجبة على أولادهم.

(فأما الوالدون) وإن علوا (فتجب نفقتهم بشرطين: الفقر) لهم. وهو عدم قدرتهم على مال أو كسب، (والزمانة، أو الفقر والجنون). والزمانة هي مصدر زمن الرجل زمانة إذا حصل له آفة؛ فإن قدروا على مال أو كسب لم تجب نفقتهم.

(وأما المولودون) وإن سفلوا (فتجب نفقتهم) على الوالدين (بثلاثة شرائط): أحدها (الفقر والصغر)؛ فالغني الكبير لا تجب نفقته، (أو الفقر والزمانة)؛ فالغني القوي لا تجب تفقته،

(أو الفقر والجنون) فالغني العاقل لا تجب نفقته. وذكر المصنف السبب الثاني في قوله:

(ونفقة الرقيق والبهائم واجبة)؛ فمن ملك رقيقا عبدا أو أمة، أو مدبرا أو أم ولد، أو بهيمة وجب عليه نفقته؛ فيطعم رقيقه من غالب قوت أهل البلد.

ومن غالب أدمهم بقدر الكفاية، ويكسوه من غالب كسوتهم. ولا يكفي في كسوة رقيقه ستر العورة فقط. (ولا يكلفون من العمل ما لا يطيقون). فإذا استعمل المالك رقيقه نهارا أراحه ليلا وعكسه، ويريحه صيفا وقت القيلولة، ولا يكلف دابته أيضا ما لا تطيق حمله. وذكر المصنف السبب الثالث في قوله:

(ونفقة الزوجة الممكنة من نفسها واجبة) على الزوج. ولما اختلفت نفقة الزوجة بحسب حال الزوج بين المصنف ذلك في قوله: (وهي مقدرة؛ فإن) وفي بعض النسخ «إن» (كان الزوج موسرا)، ويعتبر يساره بطلوع فجر كل يوم (فمدان) من طعام، واجبان عليه كل يوم مع ليلته المتأخرة عنه لزوجته، مسلمة كانت أو ذمية، حرة كانت أو رقيقة. والمدان (من غالب قوتها). والمراد غالب قوت البلد من حنطة أو شعير أو غيرهما حتى الأقط ms098 في أهل بادية

يقتاتونه. (ويجب) للزوجة (من الأدم والكسوة ما جرت به العادة) في كل منهما. فإن جرت عادة البلد في الأدم بزيت وشيرج وجبن ونحوها اتبعت العادة في ذلك؛ وإن لم يكن في البلد أدم غالب فيجب اللائق بحال الزوج. ويختلف الأدم باختلاف الفصول؛ فيجب في كل فصل ما جرت به عادة الناس فيه من الأدم. ويجب للزوجة أيضا لحم يليق بحال زوجها. وإن جرت عادة البلد في الكسوة لمثل الزوج بكتان أو حرير وجب.

(وإن كان) الزوج (معسرا)؛ ويعتبر إعساره بطلوع فجر كل يوم (فمد) أي فالواجب عليه لزوجته مد طعام (من غالب قوت البلد) كل يوم مع ليلته المتأخرة عنه (وما يأتدم به المعسرون) - وفي بعض النسخ «وما يتأدم» - مما جرت به عادتهم من الأدم (ويكسونه) مما جرت به عادتهم من الكسوة.

(وإن كان) الزوج (متوسطا)؛ ويعتبر توسطه بطلوع فجر كل يوم مع ليلته المتأخرة عنه (فمد) أي فالواجب عليه لزوجته مد (ونصف) من طعام غالب قوت البلد. (ويجب) لها (من الأدم) الوسط (و) من (الكسوة الوسط) وهو ما بين ما يجب على الموسر والمعسر. ويجب على الزوج تمليك زوجته الطعام حبا؛ وعليه طحنه وخبزه. ويجب لها آلة أكل وشرب وطبخ، ويجب لها

مسكن يليق بها عادة؛ (وإن كانت ممن يخدم مثلها فعليه) أي الزوج (إخدامها) بحرة أو أمة له أو أمة مستأجرة أو بالإنفاق على من صحب الزوجة من حرة أو أمة لخدمة إن رضي الزوج بها.

(وإن أعسر بنفقتها) أي المستقبلة (فلها) الصبر على إعساره وتنفق على نفسها من مالها أو تقترض ويصير ما أنفقته دينا عليه، ولها (فسخ النكاح). وإذا فسخت حصلت المفارقة، وهي فرقة فسخ، لا فرقة طلاق. وأما النفقة الماضية فلا فسخ للزوجة بسببها، (وكذلك) للزوجة فسخ النكاح (إن أعسر) زوجها (بالصداق قبل الدخول) بها، سواء علمت يساره قبل العقد أم لا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 117;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 118, 'أحكام الحضانة', 'أحكام الحضانة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '{فصل} في أحكام الحضانة. وهي لغة مأخوذة من الحضن بكسر الحاء، وهو الجنب لضم الحاضنة الطفل إليه، وشرعا ms099 حفظ من لا يستقل بأمر نفسه عما يؤذيه لعدم تمييزه كطفل وكبير ومجنون.

(وإذا فارق الرجل زوجته وله منها ولد؛ فهي أحق بحضانته) أي بتربيته بما يصلحه بتعهده بطعامه وشرابه وغسل بدنه وثوبه وتمريضه وغير ذلك من مصالحه. ومؤنة الحضانة على من عليه نفقة الطفل. وإذا امتنعت الزوجة من حضانة ولدها انتقلت الحضانة لأمهاتها، وتستمر حضانة الزوجة (إلى) مضي (سبع سنين). وعبر بها المصنف لأن التمييز يقع فيها غالبا، لكن المدار إنما هو على التمييز، سواء حصل قبل سبع سنين أو بعدها، (ثم) بعدها (يخير) المميز (بين أبويه، فأيهما اختار سلم إليه). فإن كان في أحد الأبوين نقص كجنون فألحق للآخر مادام النقص قائما به؛ وإذ لم يكن الأب موجودا خير الولد بين الجد والأم. وكذا يقع التخيير بين الأم ومن على حاشية النسب كأخ وعم.

(وشرائط الحضانة سبع): أحدها (العقل)؛ فلا حضانة لمجنونة أطبق جنونها أو تقطع؛ فإن قل جنونها كيوم في سنة لم يبطل حق الحضانة بذلك. (و) الثاني (الحرية)؛ فلا حضانة لرقيقة وإن أذن لها سيدها في الحضانة.

(و) الثالث (الدين)؛ فلا حضانة لكافرة على مسلم. (و) الرابع والخامس (العفة، والأمانة) فلا حضانة لفاسقة. ولا يشترط للحضانة تحقق العدالة الباطنة، بل تكفى العدالة الظاهرة، (و) السادس (الإقامة) في بلد المميز، بأن يكون أبواه مقيمين في بلد واحد. فلو أراد أحدهما سفر حاجة كحج وتجارة طويلا كان السفر أو قصيرا، كان الولد المميز وغيره مع المقيم من الأبوين حتى يعود المسافر منهما. ولو أراد أحد الأبوين سفر نقلة فالأب أولى من الأم حضانته فينزعه منها،

(و) الشرط السابع (الخلو) أي خلو أم المميز (من زوج) ليس من محارم الطفل. فإن نكحت شخصا من محارمه كعم الطفل أو ابن عمه أو ابن أخيه ورضي كل منهم بالمميز فلا تسقط حضانتها بذلك، (فإن اختل شرط منها) أي السبعة في الأم (سقطت) حضانتها كما تقدم شرحه مفصلا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 118;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 119, 'كتاب أحكام الجنايات', 'كتاب أحكام الجنايات');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, '• أنواع القتل', 'الجنايات جمع جناية، أعم من أن تكون قتلا أو ms100 قطعا أو جرحا. (القتل على ثلاثة أضرب)، لا رابع لها: (عمد محض)، وهو مصدر عمد بوزن ضرب، ومعناه القصد، (وخطأ محض، وعمد خطأ). وذكر المصنف تفسير العمد في قوله:

(فالعمد المحض هو أن يعمد) الجاني (إلى ضربه) أي الشخص (بما) أي بشيء (يقتل غالبا). وفي بعض النسخ «في الغالب»، (ويقصد) الجاني (قتله) الشخص (بذلك) الشيء. وحينئذ (فيجب القود) أي القصاص (عليه) أي الشخص الجاني.

وما ذكره المصنف من اعتبار قصد القتل ضعيف؛ والراجح خلافه. ويشترط لوجوب القصاص في نفس القتيل أو قطع أطرافه إسلام أو أمان؛ فيهدر الحربي والمرتد في حق المسلم؛ (فإن عفا عنه) أي عفا المجني عليه عن الجاني في صورة العمد المحض

(وجبت) على القاتل (دية مغلظة حالة في مال القاتل). وسيذكر المصنف بيان تغليظها.

(والخطأ المحض أن يرمي إلى شيء) كصيد (فيصيب رجلا فيقتله؛ فلا قود عليه) أي الرامي، (بل تجب عليه دية مخففة). وسيذكر المصنف بيان تخفيفها، (على العاقلة مؤجلة) عليهم (في ثلاث سنين) يؤخذ آخر كل سنة منها قدر ثلث دية كاملة، أو على الغني من العاقلة من أصحاب الذهب آخر كل سنة نصف دينار، ومن أصحاب الفضة ستة دراهم - كما قاله المتولي وغيره. والمراد بالعاقلة عصبة الجاني، لا أصله وفرعه.

(وعمد الخطأ أن يقصد ضربه بما لا يقتل غالبا) كأن ضربه بعصا خفيفة، (فيموت) المضروب (فلا قود عليه، بل تجب دية مغلظة على العاقلة مؤجلة في ثلاث سنين)، وسيذكر المصنف بيان تغليظها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 119;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• شروط وجوب القصاص', 'ثم شرع المصنف في ذكر من يجب عليه القصاص المأخوذ من اقتصاص الأثر أي تتبعه، لأن المجني عليه يتبع الجناية، فيأخذ مثلها؛ فقال:

(وشرائط وجوب القصاص) في القتل (أربعة). وفي بعض النسخ «فصل وشرائط وجوب القصاص أربع»: الأول (أن يكون القاتل بالغا)؛ فلا قصاص على صبي. ولو قال: «أنا الآن صبي»، صدق بلا يمين. الثاني أن يكون القاتل (عاقلا)؛ فيمتنع القصاص من مجنون إلا أن تقطع جنونه، فيقتص منه زمن إفاقته. ويجب القصاص على من زال عقله بشرب ms101 مسكر متعد في شربه؛ فخرج من لم يتعد، بأن شرب شيئا ظنه غير مسكر فزال عقله، فلا قصاص عليه. (و) الثالث (أن لا يكون) القاتل (والدا للمقتول)؛ فلا قصاص على والد بقتل ولده وإن سفل الولد. قال ابن كج: «ولو حكم حاكم بقتل والد لولده نقض حكمه». (و) الرابع (أن لا يكون المقتول أنقص من القاتل بكفر أو رق)؛ فلا يقتل مسلم بكافر حربيا كان أو ذميا أو معاهدا، ولا يقتل حر برقيق.

ولو كان المقتول أنقص من القاتل بكبر أو صغر أو طول أو قصر مثلا فلا عبرة بذلك.

(وتقتل الجماعة بالواحد) إن كافأهم، وكان فعل كل واحد منهم لو انفرد كان قاتلا. ثم أشار المصنف لقاعدة بقوله: (وكل شخصين جرى القصاص بينهما في النفس يجري بينهما في الأطراف) التي لتلك النفس، فكما يشترط في القاتل كونه مكلفا يشترط في القاطع لطرف كونه مكلفا؛ وحينئذ فمن لا يقتل بشخص لا يقطع بطرفه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 119;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• شروط وجوب القصاص في الأطراف', '(وشرائط وجوب القصاص في الأطراف بعد الشرائط المذكورة) في قصاص النفس (اثنان): أحدهما (الاشتراك في الاسم الخاص) للطرف المقطوع. وبينه المصنف بقوله: (اليمنى باليمنى) أي تقطع اليمنى مثلا من أذن أو يد أو رجل باليمنى من ذلك، (واليسرى) مما ذكر (باليسرى) مما ذكر؛ وحينئذ فلا تقطع يمنى بيسرى، ولا عكسه.

(و) الثاني (أن لا يكون بأحد الطرفين شلل)؛ فلا تقطع يد أو رجل صحيحة بشلاء، وهي التي لا عمل لها. أما الشلاء فتقطع بالصحيحة على المشهور، إلا أن يقول عدلان من أهل الخبرة: «أن الشلاء إذا قطعت لا ينقطع الدم، بل تنفتح أفواه العروق، ولا تنسد بالحسم». ويشترط مع هذا أن يقنع بها مستوفيها، ولا يطلب أرشا للشلل. ثم أشار المصنف لقاعدة بقوله:

(وكل عضو أخذ) أي قطع (من مفصل) كمرفق وكوع (ففيه القصاص). وما لا مفصل له لا قصاص فيه. واعلم أن شجاج الرأس والوجه عشرة: (1) حارصة بمهملات، وهي ما تشق الجلد قليلا، (2) ودامية تدميه، (3) وباضعة تقطع اللحم، (4) ومتلاحمة تغوص فيه، ms102 (5) وسمحاق تبلغ الجلدة التي بين اللحم والعظم، (6) وموضحة توضح العظم من اللحم، (7) وهاشمة تكسر العظم سواء أوضحته أم لا،

(8) ومنقلة تنقل العظم من مكان إلى مكان آخر، (9) ومأمومة تبلغ خريطة الدماغ المسماة أم الرأس، (10) ودامغة بغين معجمة تخرق تلك الخريطة وتصل إلى أم الرأس. واستثنى المصنف من هذه العشرة ما تضمنه قوله: (ولا قصاص في الجروح) أي المذكورة (إلا في الموضحة) فقط، لا في غيرها من بقية العشرة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 119;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, '• أنواع الدية', '{فصل} في بيان الدية. وهي المال الواجب بالجناية على حر في نفس أو طرف. (والدية على ضربين: مغلظة، ومخففة)، لا ثلاث لها؛ (فالمغلظة) بسبب قتل الذكر الحر المسلم عمدا (مائة من الإبل) والمائة مثلثة: (ثلاثون حقة، وثلاثون جذعة)، وسبق معناهما في كتاب

الزكاة، (وأربعون خلفة) بفتح الخاء المعجمة وكسر اللام وبالفاء، وفسرها المصنف بقوله: (في بطونها أولادها). والمعنى أن الأربعين حوامل، ويثبت حملها بقول أهل الخبرة بالإبل.

(والمخففة) بسب قتل الذكر الحر المسلم (مائة من الإبل) والمائة مخمسة: (عشرون حقة، وعشرون جذعة، وعشرون بنت لبون، وعشرون ابن لبون، وعشرون بنت مخاض). ومتى وجبت الإبل على قاتل أو عاقلة أخدت من إبل من وجبت عليه، وإن لم يكن له إبل فتؤخذ من غالب إبل بلدة بلدي أو قبيلة بدوي؛ فإن لم يكن في البلدة أو القبيلة إبل فتؤخذ من غالب إبل أقرب البلاد أو القبائل إلى موضع المؤدي.

(فإن عدمت الإبل انتقل إلى قيمتها). وفي نسخة أخرى فإن أعوزت الإبل انتقل إلى قيمتها. هذا ما في القول الجديد وهو الصحيح، (وقيل) في القديم (ينتقل إلى ألف دينار) في حق أهل الذهب، (أو) ينتقل إلى (اثني عشر ألف درهم) في حق أهل الفضة، وسواء فيما ذكر الدية المغلظة

والمخففة؛

(وإن غلظت) على القديم (زيد عليها الثلث) أي قدره؛ ففي الدنانير ألف وثلثمائة وثلاثة وثلاثون دينارا وثلث دينار، وفي الفضة ستة عشر ألف درهم.

(وتغلظ دية الخطأ في ثلاثة مواضع): أحدها (إذا قتل في الحرم) أي حرم مكة. أما القتل في حرام المدينة ms103 أو القتل في حال الإحرام فلا تغليظ فيه على الأصح. والثاني مذكور في قول المصنف: (أو قتل في الأشهر الحرم) أي ذي القعدة وذي الحجة والمحرم ورجب. والثالث مذكور في قوله: (أو قتل) قريبا له (ذا رحم محرم) بسكون المهملة؛ فإن لم يكن الرحم محرما له كبنت العم فلا تغليظ في قتلها.

(ودية المرأة) والحنثى المشكل (على النصف من دية الرجل) نفسا وجرحا؛ ففي دية حرة مسلمة في قتل عمد أو شبه عمد خمسون من الإبل: خمسة عشر حقة، وخمسة عشر جذعة، وعشرون خلفة إبلا حوامل. وفي قتل خطأ عشر بنات مخاض، وعشر بنات لبون، وعشر بني لبون، وعشر

حقاق، وعشر جذاع. (ودية اليهودي والنصراني) والمستأمن والمعاهد (ثلث دية المسلم) نفسا وجرحا. (وأما المجوسي ففيه ثلثا عشر دية المسلم) وأخصر منه ثلث خمس دية المسلم.

(وتكمل دية النفس). وسبق أنها مائة من الإبل (في قطع) كل من (اليدين، والرجلين) فيجب في كل يد أو رجل خمسون من الإبل، وفي قطعها مائة من الإبل، (و) تكمل الدية في قطع (الأنف) أي في قطع ما لان منه، وهو المارن. وفي قطع كل من طرفيه والحاجز ثلث دية. (و) تكمل الدية في قطع (الأذنين) أو قلعهما بغير إيضاح؛ فإن حصل مع قلعهما إيضاح وجب أرشه. وفي كل أذن نصف دية، ولا فرق فيما ذكر بين أذن السميع وغيره. ولو أيبس الأذنين بجناية عليهما ففيها دية، (والعينين) وفي كل منها نصف دية، وسواء في ذلك عين أحول أو أعور أو أعمش، (و) في (الجفون الأربعة) في كل جفن منها ربع دية، (واللسان) الناطق سليم الذوق ولو كان اللسان لألثغ وأرت، (والشفتين) وفي قطع إحداهما نصف دية، (وذهاب الكلام) كله، وفي ذهاب بعضه بقسطه من

الدية. والحروف التي توزع الدية عليها ثمانية وعشرون حرفا في لغة العرب، (وذهاب البصر) أي إذهابه من العينين. أما إذهابه من إحداهما ففيه نصف دية، ولا فرق في العين بين صغيرة وكبيرة، وعين شيخ وطفل، (وذهاب السمع) من الأذنين. وإن ms104 نقص من أذن واحدة سدت. وضبط منتهى سماع الأخرى. ووجب قسط التفاوت، وأخذ بنسبته من تلك الدية، (وذهاب الشم) من المنخرين. وإن نقص الشم وضبط قدره وجب قسطه من الدية، وإلا فحكومة، (وذهاب العقل). فإن زال بجرح على الرأس له أرش مقدر أو حكومة وجبت الدية مع الأرش، (والذكر) السليم ولو ذكر صغير وشيخ وعنين. وقطع الحشفة كالذكر؛ ففي قطعها وحدها دية، (والأنثيين) أي البيضتين ولو من عنين ومجبوب. وفي قطع إحداهما نصف دية.

(وفي الموضحة) من الذكر الحر المسلم، (و) في (السن) منه (خمس من الإبل، وفي) إذهاب (كل عضو لا منفعة فيه حكومة). وهي جزء من الدية نسبته إلى دية النفس نسبة نقصها أي الجناية من قيمة المجني عليه لو كان رقيقا بصفاته التي هو عليها؛ فلو كانت قيمة المجني عليه بلا جناية

على يده مثلا عشرة، وبدونها تسعة فالنقص عشر. فيجب عشر دية النفس.

(ودية العبد) المعصوم (قيمته)، والأمة كذلك ولو زادت قيمة كل منهما على دية الحر. ولو قطع ذكر عبد وأنثياه وجبت قيمتان في الأظهر. (ودية الجنين الحر) المسلم تبعا لأحد أبويه إن كانت أمه معصومة حال الجناية (غرة) أي نسمة من الرقيق (عبد أو أمة) سليم من عيب مبيع. ويشترط بلوغ الغرة نصف عشر الدية. فإن فقدت الغرة وجب بدلها، وهو خمسة أبعرة. وتجب الغرة على عاقلة الجاني. (ودية الجنين الرقيق عشر قيمة أمه) يوم الجناية عليها ويكون ما وجب لسيدها ويجب في الجنين اليهودي أو النصراني غرة كثلث غرة مسلم، وهو بعير وثلثا بعير.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 119;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, '• القسامة', '{فصل} في أحكام القسامة. وهي أيمان الدماء. (وإذا اقترن بدعوى الدم لوث) بمثلثة، وهو لغة الضعف، وشرعا

قرينة تدل على صدق المدعي، بأن توقع تلك القرينة في القلب صدقه. وإلى هذا أشار المصنف بقوله: (يقع به في النفس صدق المدعي) بأن وجد قتيل أو بعضه كرأسه في محلة منفصلة عن بلد كبير - كما في الروضة وأصلها، أو وجد في قرية كبيرة لأعدائه، ولا يشاركهم في القرية غيرهم (حلف ms105 المدعي خمسين يمينا). ولا يشترط موالاتها على المذهب. ولو تخلل بين الأيمان جنون من الحالف أو إغماء بني بعد الإفاقة على ما مضى منها إن لم يعزل القاضي الذي وقعت القسامة عنده؛ فإن عزل وولى غيره وجب استئنافها. (و) إذا حلف المدعي (استحق الدية). ولا تقع القسامة في قطع طرف. (وإن لم يكن هناك لوث فاليمين على المدعى عليه) فيحلف خمسين يمينا.

(وعلى قاتل النفس المحرمة) عمدا أو خطأ أو شبه عمد (كفارة) ولو كان القاتل صبيا أو مجنونا، فيعتق الولي عنهما من مالهما. والكفارة (عتق رقبة مؤمنة سليمة من العيوب المضرة) أي المخلة بالعمل والكسب، (فإن لم يجد) ها (فصيام شهرين) بالهلال (متتابعين) بنية الكفارة. ولا يشترط نبة التتابع في الأصح. فإن عجز المكفر عن صوم شهرين لهرم أو لحقه بالصوم مشقة شديدة أو خاف زيادة المرض كفر بإطعام ستين مسكينا أو فقيرا، يدفع لكل واحد منهم مدا من طعام يجزىء في الفطرة، ولا يطعم كافرا ولا هاشميا ولا مطلبيا.?', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 119;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 120, 'أنواع الزاني وحده', 'أنواع الزاني وحده');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'الحدود جمع حد، وهو لغة المنع، وسميت الحدود بذلك لمنعها من ارتكاب الفواحش. وبدأ المصنف من الحدود بحد الزنا المذكور في أثناء قوله: (والزاني على ضربين: محصن، وغير محصن؛ فالمحصن) - وسيأتي قريبا - أنه البالغ العاقل الحر الذي غيب حشفته أو قدرها من مقطوعها بقبل في نكاح صحيح، (حده الرجم) بحجارة معتدلة، لا بحصى صغيرة ولا بصخر؛ (وغير المحصن) من رجل أو امرأة (حده مائة جلدة). سميت بذلك لاتصالها بالجلد، (وتغريب عام إلى مسافة القصر) فأكثر برأي الإمام. وتحسب مدة العام من أول سفر الزاني، لا من وصوله مكان التغريب. والأولى أن يكون بعد الجلد.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 120;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• شروط الإحصان', '(وشرائط الإحصان أربع): الأول والثاني (البلوغ، والعقل)؛ فلا حد على صبي ومجنون، بل يؤدبان بما يزجرهما عن الوقوع في الزنا. (و) الثالث (الحرية)؛ فلا يكون الرقيق والمبعض والمكاتب وأم الولد محصنا وإن وطىء كل منهم في نكاح صحيح. (و) الرابع (وجود الوطء) من مسلم أو ذمي (في ms106 نكاح صحيح). وفي بعض النسخ «في النكاح الصحيح». وأراد بالوطء تغييب الحشفة أو قدرها من مقطوعها بقبل. وخرج بالصحيح الوطء في نكاح فاسد؛ فلا يحصل به التحصين.

(والعبد والأمة حدهما نصف حد الحر)؛ فيحد كل منهما خمسين جلدة، ويغرب نصف عام. ولو قال المصنف: «ومن فيه رق حده', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 120;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 121, '…', '…');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'إلخ» كان أولى، ليعم المكاتب والمبعض وأم الولد.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 121;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• اللواط وإتيان البهائم', '(وحكم اللواط وإتيان البهائم كحكم الزنا) فمن لاط بشخص بأن وطئه في دبره حد على المذهب. ومن أتى بهيمة حد كما قال المصنف، لكن الراجح أنه يعزر.

(ومن وطئ) أجنبية (فيما دون الفرج عزر، ولا يبلغ) الإمام (بالتعزير أدنى الحدود). فإن عزر عبدا وجب أن ينقص في تعزيره عن عشرين جلدة، أو عزر حرا وجب أن ينقص في تعزيره عن أربعين جلدة؛ لأنه أدنى حد كل منهما.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 121;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• حد القذف', '{فصل} في بيان أحكام القذف. وهو لغة الرمي، وشرعا الرمي بالزنا على جهة التعيير لتخرج الشهادة بالزنا. (وإذا قذف) بذال معجمة (غيره بالزنا) كقوله: «زنيت» (فعليه حد القذف) ثمانين جلدة كما سيأتي. هذا إن لم يكن القاذف أبا أو أما وإن عليا - كما سيأتي. (بثمانية شرائط: ثلاثة). وفي بعض النسخ «ثلاث»: (منها في القاذف، وهو: أن يكون بالغا، عاقلا)؛ فالصبي والمجنون لا يحدان

بقذفهما شخصا، (وأن لا يكون والدا للمقذوف). فلو قذف الأب أو الأم وإن علا ولده وإن سفل لا حد عليه.

(وخمسة في المقذوف، وهو: أن يكون مسلما، بالغا، عاقلا، حرا، عفيفا) عن الزنا؛ فلا حد بقذف الشخص كافرا أو صغيرا أو مجنونا أو رقيقا أو زانيا.

(ويحد الحر) القاذف (ثمانين) جلدة، (والعبد أربعين) جلدة.

(ويسقط) عن القاذف (حد القذف بثلاثة أشياء): أحدها (إقامة البينة)، سواء كان المقذوف أجنبيا أو زوجة، والثاني مذكور في قوله: (أو عفو المقذوف) أي عن القاذف، والثالث مذكور في قوله: (أو اللعان في حق الزوجة). وسبق بيانه في قول المصنف: «فصل وإذا رمى الرجل', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 121;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 122, '…', '…');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'إلخ».', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 122;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• حد شرب الخمر أو المسكر', '{فصل} في أحكام الأشربة وفي ms107 الحد المتعلق بشربها. (ومن شرب خمرا) وهي المتخذة من عصير العنب (أو شرابا مسكرا) من غير الخمر كالنبيذ المتخذ من الزبيب (يحد) ذلك الشارب إن كان حرا (أربعين) جلدة. (ويجوز أن يبلغ) الإمام (به) أي حد الشرب (ثمانين) جلدة. والزيادة على أربعين في حر، وعشرين في رقيق (على وجه التعزير). وقيل الزيادة على ما ذكر حد؛ وعلى هذا يمتنع النقص عنها.

(ويجب) الحد (عليه) أي شارب المسكر (بأحد أمرين: بالبينة) أي رجلين يشهدان بشرب ما ذكر (أو الإقرار) من الشارب بأنه شرب مسكرا؛ فلا يحد بشهادة رجل وامرأة، ولا بشهادة امرأتين، ولا بيمين مردودة، ولا بعلم القاضي، ولا بعلم غيره. (ولا يحد) أيضا الشارب (بالقيء والاستنكاه) أي بأن يشم منه رائحة الخمر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 122;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• حد السرقة', '{فصل} في أحكام قطع السرقة. وهي لغة أخذ المال خفية، وشرعا أخذه خفية ظلما من حرز مثله. (وتقطع يد السارق بثلاثة شرائط). وفي بعض النسخ «بست شرائط»: (أن يكون) السارق (بالغا، عاقلا) مختارا مسلما كان أو ذميا؛ فلا قطع على صبي ومجنون ومكره. ويقطع مسلم وذمي؛ وأما المعاهد فلا قطع عليه في الأظهر. وما تقدم شرط في السارق. وذكر المصنف شرط القطع بالنظر للمسروق في قوله: (وأن يسرق نصابا قيمته ربع دينار) أي خالصا مضروبا، أو يسرق قدرا مغشوشا يبلغ خالصه ربع دينار مضروبا أو قيمته (من حرز مثله). فإن كان المسروق بصحراء أو مسجد أو شارع اشترط في إحرازه دوام اللحاظ؛ وإن كان بحصن كبيت كفى لحاظ معتاد في مثله. وثوب ومتاع وضعه شخص بقربه بصحراء مثلا إن لاحظه بنظره له وقتا فوقتا ولم يكن هناك ازدحام طارقين فهو محرز،

وإلا فلا. وشرط الملاحظ قدرته على منع السارق. ومن شروط المسروق ما ذكره المصنف في قوله: (لا ملك له فيه، ولا شبهة) أي للسارق (في مال المسروق منه)؛ فلا قطع بسرقة مال أصل وفرع للسارق، ولا بسرقة رقيق مال سيده.

(وتقطع) من السارق (يده اليمنى من مفصل الكوع) بعد خلعها منه بحبل يجر بعنف. وإنما ms108 تقطع اليمنى في السرقة الأولى؛ (فإن سرق ثانيا) بعد قطع اليمنى (قطعت رجله اليسرى) بحديدة ماضية دفعة واحدة بعد خلعها من مفصل القدم؛ (فإن سرق ثالثا قطعت يده اليسرى) بعد خلعها؛ (فإن سرق رابعا قطعت رجله اليمنى) بعد خلعها من مفصل القدم كما فعل باليسرى، ويغمس محل القطع بزيت أودهن مغلي؛ (فإن سرق بعد ذلك) أي بعد الرابعة (عزر، وقيل يقتل صبرا). وحديث الأمر بقتله في المرة الخامسة منسوخ.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 122;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 123, 'قطاع الطريق', 'قطاع الطريق');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '{فصل} في أحكام قاطع الطريق. وسمي بذلك لامتناع الناس من سلوك الطريق خوفا منه، وهو مسلم مكلف له شوكة؛ فلا يشترط فيه ذكورة، ولا عدد. فخرج بقاطع الطريق المختلس الذي يتعرض لآخر القافلة، - وفي بعض النسخ «لأخذ القافلة» - ويعتمد الهرب.

(وقطاع الطريق على أربعة أقسام): الأول مذكور في قوله: (إن قتلوا) أي عمدا عدوانا من يكافؤنه (ولم يأخذوا المال قتلوا) حتما. وإن قتلوا خطأ أو شبه عمد أو من لم يكافؤه لم يقتلوا. والثاني مذكور في قوله: (فإن قتلوا وأخذوا المال) أي نصاب السرقة فأكثر (قتلوا وصلبوا) على خشبة ونحوها، لكن بعد غسلهم وتكفينهم والصلاة عليهم. والثالث مذكور في قوله: (وإن أخذوا المال ولم يقتلوا) أي نصاب السرقة فأكثر من حرز مثله ولا شبهة لهم فيه (تقطع أيديهم وأرجلهم من خلاف) أي تقطع منهم أولا اليد اليمنى والرجل

اليسرى. فإن عادوا فيسراهم ويمناهم تقطعان؛ فإن كانت اليمنى أو الرجل اليسرى مفقودة اكتفى بالموجودة في الأصح. والرابع مذكور في قوله: (فإن أخافوا) المارين في (السبيل) أي الطريق (ولم يأخذوا) منهم (مالا ولم يقتلوا) نفسا (حبسوا) في غير موضعهم (وعزروا) أي حسبهم الإمام وعزرهم.

(ومن تاب منهم) أي قطاع الطريق (قبل القدرة) من الإمام (عليه سقطت عنه الحدود) أي العقوبات المختصة بقاطع الطريق؛ وهي تحتم قتله وصلبه وقطع يده ورجله. ولا يسقط باقي الحدود التي لله تعالى كزنا وسرقة بعد التوبة. وفهم من قوله: (وأخذ) بضم أوله (بالحقوق) أي التي تتعلق بالآدميين، كقصاص وحد قذف، ورد مال أنه لا يسقط شيء ms109 منها عن قاطع الطريق بتوبته، وهو كذلك.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 123;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• الصيال وإتلاف البهائم', '{فصل} في أحكام الصيال وإتلاف البهائم. (ومن قصد) بضم أوله (بأذى في نفسه أو ماله أو حريمه) بأن صال

عليه شخص يريد قتله أو أخذ ماله وإن قل أو وطء حريمه (فقاتل عن ذلك) أي عن نفسه أو ماله أو حريمه، (وقتل) الصائل على ذلك دفعا لصياله (فلا ضمان عليه) بقصاص ولا دية ولا كفارة.

(وعلى راكب الدابة) سواء كان مالكها أو مستعيرها أو مستأجرها أو غاصبها (ضمان ما أتلفته دابته)، سواء كان الإتلاف بيدها أو رجلها أو غير ذلك. ولو بالت أو راثت بطريق فتلف بذلك نفس أو مال فلا ضمان.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 123;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 124, 'البغاة', 'البغاة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '{فصل} في أحكام البغاة. وهم فرقة مسلمون مخالفون للإمام العادل. ومفرد البغاة باغ من البغي، وهو الظلم. (ويقاتل) بفتح ما قبل آخره (أهل البغي) أي يقاتلهم الإمام (بثلاث شرائط): أحدها (أن يكونوا في منعة)، بأن يكون لهم شوكة بقوة وعدد

وبمطاع فيهم وإن لم يكن المطاع إماما منصوبا، بحيث يحتاج الإمام العادل في ردهم لطاعته إلى كلفة من بذل مال وتحصيل رجال؛ فإن كانوا أفرادا يسهل ضبطهم فليسوا بغاة. (و) الثاني (أن يخرجوا عن قبضة الإمام) العادل إما بترك الانقياد له أو بمنع حق توجه عليهم، سواء كان الحق ماليا أو غيره كحد وقصاص. (و) الثالث (أن يكون لهم) أي للبغاة (تأويل سائغ) أي محتمل كما عبر به بعض الأصحاب كمطالبة أهل صفين بدم عثمان حيث اعتقدوا أن عليا - رضي الله عنه - يعرف من قتل عثمان. فإن كان التأويل قطعي البطلان لم يعتبر، بل صاحبه معاند. ولا يقاتل الإمام البغاة حتى يبعث إليهم رسولا أمنيا فطنا يسألهم ما يكرهونه؛ فإن ذكروا له مظلمة هي السبب في امتناعهم عن طاعته أزالها؛ وإن لم يذكروا شيئا أو أصروا بعد إزالة المظلمة على البغي نصحهم ثم أعلمهم بالقتال.

(ولا يقتل أسيرهم) أي البغاة. فإن قتله شخص عادل فلا قصاص عليه في الأصح. ولا يطلق أسيرهم وإن كان صبيا أو امرأة ms110 حتى تنقضي الحرب، ويتفرق جمعهم إلا أن يطيع أسيرهم مختارا بمتابعته للإمام، (ولا يغنم مالهم). ويرد سلاحهم وخيلهم إليهم إذا انقضى الحرب وأمنت

غائلتهم بتفرقهم أوردهم للطاعة. ولا يقاتلون بعظيم كنار أو منجنيق إلا لضرورة، فيقاتلون بذلك، كأن قاتلونا به أو أحاطوا بنا، (ولا يذفف على جريحهم). والتذفيف تتميم القتل وتعجيله.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• الردة', '{فصل} في أحكام الردة. وهي أفحش أنواع الكفر. ومعناها لغة الرجوع عن الشيء إلى غيره، وشرعا قطع الإسلام بنية كفر أو قول كفر أو فعل كفر، كسجود لصنم، سواء كان على جهة الاستهزاء أو العناد أو الاعتقاد، كمن اعتقد حدوث الصانع. (ومن ارتد عن الإسلام) من رجل أو امرأة كمن أنكر وجود الله، أو كذب رسولا من رسل الله، أو حلل محرما بالإجماع كالزنا وشرب الخمر، أو حرم حلالا بالإجماع كالنكاح والبيع، (استتيب) وجوبا في الحال في الأصح فيهما. ومقابل الأصح في الأولى أنه يسن الاستتابة، وفي الثانية أنه يمهل (ثلاثا) أي إلى ثلاثة أيام؛ (فإن تاب) بعوده إلى

الإسلام بأن يقر بالشهادتين على الترتيب بأن يؤمن بالله أولا ثم برسوله؛ فإن عكس لم يصح - كما قاله النوي في شرح المهذب في الكلام على نية الوضوء؛ (وإلا) أي وإن لم يتب المرتد (قتل) أي قتله الإمام إن كان حرا بضرب عنقه، لا بإحراق ونحوه؛ فإن قتله غير الإمام عزر. وإن كان المرتد رقيقا جاز للسيد قتله في الأصح. ثم ذكر المصنف حكم الغسل وغيره في قوله: (ولم يغسل ولم يصل عليه، ولم يدفن في مقابر المسلمين). وذكر غير المصنف حكم تارك الصلاة في ربع العبادات؛ وأما المصنف فذكره هنا فقال.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• تارك الصلاة', '{فصل} (وتارك الصلاة) المعهودة الصادقة بإحدى الخمس (على ضربين: أحدهما أن يتركها) وهو مكلف (غير معتقد لوجوبها؛ فحكمه)

أي التارك لها (حكم المرتد). وسبق قريبا بيان حكمه.

(والثاني أن يتركها كسلا) حتى يخرج وقتها حال كونه (معتقدا لوجوبها، فيستتاب؛ فإن تاب وصلى) وهو تفسير للتوبة، (وإلا) أي وإن لم يتب (قتل حدا) لا كفرا. (وكان حكمه ms111 حكم المسلمين) في الدفن في مقابرهم، ولا يطمس قبره، وله حكم المسلمين أيضا في الغسل والتكفين والصلاة عليه. - والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 125, 'كتاب أحكام الجهاد', 'كتاب أحكام الجهاد');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, '• شروط وجوب الجهاد', 'وكان الأمر به في عهد رسول الله - صلى الله عليه وسلم - بعد الهجرة فرض كفاية. وأما بعده فللكفار حالان: أحدهما أن يكونوا ببلادهم فالجهاد فرض كفاية على المسلمين في كل سنة؛ فإذا فعله من فيه كفاية سقط الحرج عن الباقين. والثاني أن يدخل الكفار بلدة من بلاد المسلمين أو ينزلوا قريبا منها، فالجهاد حينئذ فرض عين عليهم؛ فيلزم أهل ذلك البلد الدفع للكفار بما يمكن منهم.

(وشرائط وجوب الجهاد سبع خصال): أحدها (الإسلام)؛ فلا جهاد على كافر. (و) الثاني (البلوغ)؛ فلا جهاد على صبي. (و) الثالث (العقل)؛ فلا جهاد على مجنون. (و) الرابع (الحرية)؛ فلا جهاد على رقيق ولو أمره سيده، ولا مبعض ولا مدبر ولا مكاتب.

(و) الخامس (الذكورية)؛ فلا جهاد على امرأة وخنثى مشكل. (و) السادس (الصحة)؛ فلا جهاد على مريض بمرض يمنعه عن قتال وركوب إلا بمشقة شديدة كحمى مطبقة. (و) السابع (الطاقة على القتال)، أي فلا جهاد على أقطع يد مثلا، ولا على من عدم أهبة القتال كسلاح ومركوب ونفقة.

(ومن أسر من الكفار فعلى ضربين: ضرب) لا تخيير فيه للإمام بل (يكون) - وفي بعض النسخ بدل يكون «يصير» - (رقيقا بنفس السبي) أي الأخذ، (وهم الصبيان والنساء) أي صبيان الكفار ونساؤهم. ويلحق بما ذكر الخناثى والمجانين. وخرج بالكفار نساء المسلمين، لأن الأسر لا يتصور في المسلمين.

(وضرب لا يرق بنفس السبي، وهم) الكفار الأصليون (الرجال البالغون) الأحرار العاقلون.

(والإمام مخير فيهم بين أربعة أشياء):

أحدها (القتل) بضرب رقبة، لا بتحريق ولا تغريق مثلا. (و) الثاني (الاسترقاق). وحكمهم بعد الاسترقاق كبقية الأموال الغنيمة. (و) الثالث (المن) عليهم بتخلية سبيلهم. (و) الرابع (الفدية) إما (بالمال أو بالرجال) أي الأسرى من المسلمين. ومال فدائهم كبقية أموال الغنيمة. ويجوز أن يفادى مشرك واحد بمسلم أو أكثر، ومشركون بمسلم. (يفعل) الإمام (من ذلك ما فيه ms112 المصلحة) للمسلمين؛ فإن خفي عليه الأحظ حبسهم حتى يظهر له الأحظ، فيفعله. وخرج بقولنا سابقا «الأصليون» الكفار غير الأصليين كالمرتدين؛ فيطالبهم الإمام بالإسلام؛ فإن امتنعوا قتلهم.

(ومن أسلم) من الكفار (قبل الأسر) أي أسر الإمام له (أحرز ماله ودمه وصغار أولاده) عن السبي، وحكم بإسلامهم تبعا له؛ بخلاف البالغين من أولاده؛ فلا يعصمهم إسلام أبيهم. وإسلام الجد يعصم أيضا الولد الصغير. وإسلام الكافر لا يعصم زوجته عن استرقاقها ولو كانت حاملا. فإن استرقت انقطع نكاحه في الحال.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 125;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• إسلام الصبي', '(ويحكم للصبي بالإسلام عند وجود ثلاثة أسباب): أحدها (أن يسلم أحد أبويه)؛ فيحكم بإسلامه تبعا لهما. وأما من بلغ مجنونا أو بلغ عاقلا ثم جن فكالصبي. والسبب الثاني مذكور في قوله: (أو يسبيه مسلم) حال كون الصبي (منفردا عن أبويه). فإن سبي الصبي مع أحد أبويه فلا يتبع الصبي السابي له.

ومعنى كونه مع أحد أبويه أن يكونا في جيش واحد وغنيمة واحدة، لا أن مالكهما يكون واحدا. ولو سباه ذمي وحمله إلى دار الإسلام لم يحكم بإسلامه في الأصح، بل هو على دين السابي له. والسبب الثالث مذكور في قوله: (أو يوجد) أي الصبي (لقيطا في دار الإسلام). وإن كان فيها أهل ذمة فإنه يكون مسلما. وكذا لو وجد في دار كفار وفيها مسلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 125;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• السلب وتقسيم الغنيمة', '{فصل} في بيان أحكام السلب وقسم الغنيمة. (ومن قتل قتيلا أعطي سلبه) بفتح اللام بشرط كون القاتل مسلما، ذكرا كان أو أنثى، حرا أو عبدا، شرطه الإمام له أو لا. والسلب ثياب القتيل التي عليه، والخف والران، وهو خف بلا قدم يلبس للساق فقط، وآلات الحرب، والمركوب الذي قاتل عليه، أو أمسكه بعنانه، والسرج، واللجام، ومقود الدابة، والسوار، والطوق، والمنطقة، وهي التي يشد بها الوسط، والخاتم، والنفقة التي معه، والجنيبة التي تقاد معه.

وإنما يستحق القاتل سلب الكافر إذا غر بنفسه حال الحرب في قتله بحيث يكفي بركوب هذا الغرر شر ذلك الكافر. فلو قتله وهو أسير أو نائم أو قتله بعد انهزام ms113 الكفار فلا سلب له. وكفاية شر الكافر أن يزيل امتناعه، كأن يفقأ عينيه، أو يقطع يديه أو رجليه.

والغنيمة لغة مأخوذة من الغنم، وهو الربح؛ وشرعا المال الحاصل للمسلمين من كفار أهل حرب بقتال وإيجاف خيل أو إبل. وخرج ب «أهل الحرب» المال الحاصل من المرتدين؛ فإنه فيء، لا غنيمة.

(وتقسم الغنيمة بعد ذلك) أي بعد إخراج السلب منها (على خمسة أخماس: فيعطى أربعة أخماسها) من عقار ومنقول (لمن شهد) أي

حضر (الوقعة) من الغانمين بنية القتال وإن لم يقاتل مع الجيش؛ وكذا من حضر لا بنية القتال وقاتل في الأظهر. ولا شيء لمن حضر بعد انقضاء القتال. (ويعطى للفارس) الحاضر الوقعة وهو من أهل القتال بفرس مهيأ للقتال عليه، سواء قاتل أم لا. (ثلاثة أسهم) سهمين لفرسه وسهما له. ولا يعطى إلا لفرس واحد ولو كان معه أفراس كثيرة، (وللراجل) أي المقاتل على رجليه (سهم) واحد.

(ولا يسهم إلا لمن) أي الشخص (استكملت فيه خمس شرائط: الإسلام، والبلوغ، والعقل، والحرية، والذكورية. فإن اختل شرط من ذلك رضخ له ولم يسهم له) أي لمن اختل فيه الشرط، إما لكونه صغيرا أو مجنونا أو رقيقا أو أنثى أو ذميا. والرضخ لغة العطاء القليل؛ وشرعا شيء دون سهم يعطى للراجل. ويجتهد الإمام في قدر الرضخ بحسب رأيه، فيزيد المقاتل على غيره، والأكثر قتالا على الأقل قتالا. ومحل الرضخ الأخماس الأربعة في الأظهر، والثاني محله أصل الغنيمة.

(ويقسم الخمس) الباقي بعد الأخماس الأربعة (على خمسة أسهم:

سهم) منه (لرسول الله - صلى الله عليه وسلم -)، وهو الذي كان في حياته. (يصرف بعده للمصالح) المتعلقة بالمسلمين، كالقضاة الحاكمين في البلاد. أما قضاة العسكر فيرزقون من الأخماس الأربعة - كما قال الماوردي وغيره - وكسد الثغور، وهي المواضع المخوفة من أطراف بلاد المسلمين الملاصقة لبلادنا. والمراد سد الثغور بالرجال وآلات الحرب. ويقدم الأهم من المصالح فالأهم. (وسهم لذوي القربى) أي قربى رسول الله - صلى الله عليه وسلم؛ (وهم بنو هاشم وبنو المطلب). يشترك في ذلك الذكر والأنثى، والغني ms114 والفقير. ويفضل الذكر، فيعطى مثل حظ الأنثيين. (وسهم لليتامى) المسلمين، جمع يتيم وهو صغير لا أب له، سواء كان الصغير ذكرا أو أنثى، له جد أو لا، قتل أبوه في الجهاد أو لا. ويشترط فقر اليتيم. (وسهم للمساكين، وسهم لأبناء السبيل). وسبق بيانهما قبيل كتاب الصيام.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 125;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, '• الفيئ', '{فصل} في قسم الفيء على مستحقيه. والفيء لغة مأخوذ من فاء إذا رجع، ثم استعمل في المال الراجع من الكفار إلى المسلمين. وشرعا هو مال حصل من كفار بلا قتال ولا إيجاف خيل ولا إبل، ك', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 125;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 126, 'الجزية', 'الجزية');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وعشر التجارة.

(ويقسم مال الفيء على خمس فرق: يصرف خمسه) يعني الفيء (على من) أي الخمسة الذين (يصرف عليهم خمس الغنيمة). وسبق قريبا بيان الخمسة. (ويعطى أربعة أخماسها). وفي بعض النسخ «أخماسه» أي الفيء (للمقاتلة). وهم الأجناد الذين عينهم الإمام للجهاد وأثبت أسماءهم في ديوان المرتزقة بعد اتصافهم بالإسلام والتكليف والحرية والصحة؛ فيفرق الإمام عليهم الأخماس الأربعة على قدر حاجاتهم، فيبحث عن حال كل من المقاتلة وعن عياله اللازمة نفقتهم وما يكفيهم؛ فيعطيه كفايتهم من نفقة وكسوة وغير ذلك، ويراعي فى الحاجة الزمان والمكان والرخص والغلاء. وأشار المصنف بقوله: (وفي مصالح المسلمين) إلى أنه يجوز للإمام أن يصرف الفاضل عن حاجات

المرتزقة في مصالح المسلمين من إصلاح الحصون والثغور ومن شراء سلاح وخيل على الصحيح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 126;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• الجزية', '{فصل} في أحكام الجزية. وهي لغة اسم لخراج مجعول على أهل الذمة. سميت بذلك لأنها جزت عن القتل، أي كفت عن قتلهم. وشرعا مال يلتزمه كافر بعقد مخصوص. ويشترط أن يعقده الإمام أو نائبه، لا على جهة التأقيت؛ فيقول: «أقررتكم بدار الإسلام غير الحجاز، أو أذنت في إقامتكم بدار الإسلام على أن تبذلوا الجزيه وتنقادوا لحكم الإسلام». ولو قال الكافر للإمام ابتداء: «أقررني بدار الإسلام» كفى.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 126;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• شروط وجوب الجزية', '(وشرائط وجوب الجزية خمس خصال): أحدها (البلوغ)؛ فلا جزية على الصبي. (و) الثاني (العقل)؛ فلا جزية على مجنون أطبق جنونه. فإن تقطع جنونه قليلا كساعة من شهر لزمته الجزية، أو تقطع ms115 جنونه كثيرا عن ذلك كيوم يجن فيه ويوم يفيق فيه، لفقت أيام الإفاقة؛ فإن بلغت سنة وجب جزيتها.

(و) الثالث (الحرية)؛ فلا جزية على رقيق ولا على سيده أيضا. والمكاتب والمدبر والمبعض كالرقيق. (و) الرابع (الذكورية)؛ فلا جزية على امرأة وخنثى. فإن بانت ذكورته أخذت منه الجزية للسنين الماضية - كما بحثه النووي في زيادة الروضة، وجزم به في شرح المهذب. (و) الخامس (أن يكون) الذي تعقد له الجزية (من أهل الكتاب) كاليهودي والنصراني، (أو ممن له شبهة كتاب). وتعقد أيضا لأولاد من تهود أو تنصر قبل النسخ، أو شككنا في وقته، وكذا تعقد لمن أحد أبويه وثني والآخر كتابي، ولزاعم التمسك بصحف إبراهيم المنزلة عليه أو بزبور داود المنزل عليه.

(وأقل) ما يجب في (الجزية) على كل كافر (دينار في كل حول) ولا حد لأكثر الجزية. (ويؤخذ) أي يسن للإمام أن يماكس من عقدت له الجزية؛ وحينئذ يؤخذ (من المتوسط) الحال (ديناران، ومن الموسر أربعة دنانير) استحبابا إذا لم يكن كل منها سفيها؛ فإن كان سفيها لم يماكس

الإمام ولي السفيه. والعبرة في التوسط واليسار بآخر الحول. (ويجوز) أي يسن للإمام إذا صالح الكفار في بلدهم، لا في دار الإسلام (أن يشترط عليهم الضيافة) لمن يمر بهم من المسلمين المجاهدين وغيرهم، (فضلا) أي زائدا (عن مقدار) أقل (الجزية) وهو دينار كل سنة إن رضوا بهذه الزيادة.

(ويتضمن عقد الجزية) بعد صحته (أربعة أشياء): أحدها (أن يؤدوا الجزية) وتؤخذ منهم برفق - كما قال الجمهور، لا على وجه الإهانة. (و) الثاني (أن تجري عليهم أحكام الإسلام) فيضمنون ما يتلفونه على المسلمين من نفس أو مال. وإن فعلوا ما يعتقدون تحريمه كالزنا أقيم عليهم الحد. (و) الثالث (أن لا يذكروا دين الإسلام إلا بخير. و) الرابع (أن لا يفعلوا ما فيه ضرر على المسلمين) أي بأن آووا من يطلع على عورات المسلمين وينقلها إلى دار الحرب. ويلزم

المسلمين بعد عقد الذمة الصحيح الكف عنهم نفسا ومالا. وإن كانوا في بلدنا أو في بلد ms116 مجاور لنا لزمنا دفع أهل الحرب عنهم. (ويعرفون بلبس الغيار) بكسر الغين المعجمة، وهو تغيير اللباس وأن يخيط الذمي على ثوبه شيئا يخالف لون ثوبه. ويكون ذلك على الكتف. والأولى باليهودي الأصفر، وبالنصراني الأزرق، وبالمجوس الأسود والأحمر. وقول المصنف: «ويعرفون» عبر به النووي أيضا في الروضة تبعا لأصلها، لكنه في المنهاج قال: «ويؤمر» أي الذمي، ولا يعرف من كلامه، أن الأمر للوجوب أو الندب، لكن مقتضى كلام الجمهور الأول. وعطف المصنف على الغيار قوله: (وشد الزنار)، وهو بالزاء المعجمة خيط غليظ يشد في الوسط فوق الثياب. ولا يكفي جعله تحتها. (ويمنعون من ركوب الخيل) النفيسة وغيرها، ولا يمنعون من ركوب الحمير ولو كانت نفيسة، ويمنعون من أسماعهم المسلمين قول الشرك، كقولهم: «الله ثالث ثلاثة». تعالى الله عن ذلك علوا كبيرا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 126;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 127, 'كتاب أحكام الصيد والذبائح والضحايا والأطعمة', 'كتاب أحكام الصيد والذبائح والضحايا والأطعمة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'والصيد مصدر أطلق هنا على اسم المفعول، وهو المصيد. (وما) أي والحيوان البري المأكول الذي (قدر) بضم أوله (على ذكاته) أي ذبحه (فذكاته) تكون (في حلقه)، وهو أعلى العنق (ولبته) أي بلام مفتوحة وموحدة مشددة، أسفل العنق. والذكاة بذال معجمة معناها لغة التطييب، لما فيها من تطييب أكل اللحم المذبوح، وشرعا إبطال الحرارة الغريزية على وجه مخصوص. أما الحيوان المأكول البحري فيحل على الصحيح بلا ذبح. (وما) أي والحيوان الذي (لم يقدر) بضم أوله (على ذكاته) كشاة أنسية توحشت، أو بعير ذهب شاردا (فذكاته عقره)، بفتح العين عقرا مزهقا للروح (حيث قدر عليه) أي في أي موضع كان العقر.

(وكمال الذكاة)، وفي بعض النسخ «ويستحب في الذكاة» (أربعة أشياء):

أحدها (قطع الحلقوم)، بضم الحاء المهملة؛ وهو مجرى النفس دخولا وخروجا. (و) الثاني قطع (المريء) بفتح ميمه وهمز آخره، ويجوز تسهيله، وهو مجرى الطعام والشراب من الحلق إلى المعدة، والمريء تحت الحلقوم. ويكون قطع ما ذكر دفعة واحدة، لا في دفعتين؛ فإنه يحرم المذبوح حينئذ. ومتى بقي شيء من الحلقوم والمريء لم يحل المذبوح. (و) الثالث والرابع (الودجين) بواو ودال مفتوحتين، تثنية ودج، بفتح الدال ms117 وكسرها؛ وهما عرقان في صفحتي العنق محيطان بالحلقوم. (والمجزئ منها) أي الذي يكفي في الذكاة (شيئان: قطع الحلقوم، والمريء) فقط. ولا يسن قطع ما وراء الودجين.

(ويجوز) أي يحل (الاصطياد) أي أكل المصاد (بكل جارحة معلمة من السباع)، وفي بعض النسخ «من سباع البهائم» كالفهد والنمر والكلب. (ومن جوارح الطير) كصقر وباز في أي موضع كان جرح السباع والطير. والجارحة مشتقة من الجرح وهو الكسب.

(وشرائط تعليمها) أي الجوارح (أربعة): أحدها (أن تكون) الجارحة معلمة بحيث (إذا أرسلت) أي أرسلها صاحبها (استرسلت، و) الثاني أنها (إذا زجرت) بضم أوله أي زجرها صاحبها (انزجرت، و) الثالث أنها (إذا قتلت صيدا لم تأكل منه شيئا، و) الرابع (أن يتكرر ذلك منها) أي تكرر الشرائط الأربعة من الجارحة بحيث يظن تأدبها، ولا يرجع في التكرار لعدد، بل المرجع فيه لأهل الخبرة بطباع الجوارح. (فإن عدمت) منها (إحدى الشرائط لم يحل ما أخذته) الجارحة (إلا أن يدرك) ما أخذته الجارحة (حيا فيذكى)، فيحل حينئذ. ثم ذكر المصنف آلة الذبح في قوله:

(وتجوز الذكاة بكل ما) أي بكل محدد (يجرح) كحديد ونحاس (إلا بالسن والظفر) وباقي العظام؛ فلا

تجوز التذكية بها.

ثم ذكر المصنف من تصح منه التذكية بقوله: (وتحل ذكاة كل مسلم) بالغ أو مميز يطيق الذبح، (و) ذكاة كل (كتابي) يهودي أو نصراني. ويحل ذبح مجنون وسكران في الأظهر. وتكره ذكاة الأعمى. (ولا تحل ذبيحة مجوسي، ولا وثني) ولا نحوهما ممن لا كتاب له.

(وذكاة الجنين) حاصلة (بذكاة أمه)؛ فلا يحتاج لتذكيته. هذا إن وجد ميتا أو فيه حياة غير مستقرة، اللهم (إلا أن يوجد حيا) بحياة مستقرة بعد خروجه من بطن أمه (فيذكى) حينئذ.

(وما قطع من) حيوان (حي فهو ميت إلا الشعر)، أي المقطوع من حيوان مأكول. وفي بعض النسخ «إلا الشعور» (المنتفع بها في المفارش والملابس) وغيرها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• ما حل وما حرم من الحيوان', '{فصل} في أحكام الأطعمة الحلال منها وغيرها. (وكل حيوان استطابته العرب) الذين هم أهل ثروة وخصب وطباع ms118

سليمة ورفاهية (فهو حلال إلا ما) أي حيوان (ورد الشرع بتحريمه)؛ فلا يرجع فيه لاستطابتهم له. (وكل حيوان استخبثته العرب) أي عدوه خبيثا (فهو حرام إلا ما ورد الشرع بإباحته) فلا يكون حراما.

(ويحرم من السباع ما له ناب) أي سن (قوي يعدو به) على الحيوان كأسد ونمر. (ويحرم من الطيور ما له مخلب) بكسر الميم وفتح اللام، أي ظفر (قوي يجرح به) كصقر وباز وشاهين.

(ويحل للمضطر)، وهو من خاف على نفسه الهلاك من عدم الأكل (في المخمصة) موتا أو مرضا مخوفا، أو زيادة مرض، أو انقطاع رفقة، ولم يجد ما يأكله حلالا (أن يأكل من الميتة المحرمة) عليه (ما) أي شيئا (يسد به رمقه) أي بقية روحه.

(ولنا ميتتان حلالان) وهما:

(السمك والجراد، و) لنا (دمان حلالان) وهما: (الكبد والطحال). وقد عرف من كلام المصنف هنا وفيما سبق، أن الحيوان على ثلاثة أقسام: أحدها ما لا يؤكل؛ فذبيحته وميتته سواء، والثاني ما يؤكل؛ فلا يحل إلا بالتذكية الشرعية، والثالث ما تحل ميتته كالسمك والجراد.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 128, 'الأضحية', 'الأضحية');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '{فصل} في أحكام الأضحية. بضم الهمزة في الأشهر، وهي اسم لما يذج من النعم يوم عيد النحر وأيام التشريق تقربا إلى الله تعالى.

(والأضحية سنة مؤكدة) على الكفاية؛ فإذا أتى بها واحد من أهل بيت كفى عن جميعهم. ولا تجب الأضحية إلا بالنذر. (ويجزئ فيها الجذع من الضأن)، وهو ما له سنة وطعن في الثانية، (والثني من المعز)، وهو ما له سنتان وطعن في الثالثة، (والثني من الإبل) ما له خمس سنين وطعن

في السادسة، (والثني من البقر) ما له سنتان وطعن في الثالثة.

(وتجزىء البدنة عن سبعة) اشتركوا في التضحية بها، (و) تجزىء (البقرة عن سبعة) كذلك، (و) تجزىء (الشاة عن) شخص (واحد) وهي أفضل من مشاركته في بعير. وأفضل أنواع الأضحية إبل ثم بقر ثم غنم.

(وأربع)، وفي بعض النسخ «وأربعة» (لا تجزئ في الضحايا): أحدها (العوراء البين) أي الظاهر (عورها) وإن بقيت الحدقة في الأصح. (و) الثاني (العرجاء البين عرجها) ms119 ولو كان حصول العرج لها عند اضجاعها لتضحية بسبب اضطرابها. (و) الثالث (المريضة البين مرضها). ولا يضر يسير هذا الأمور. (و) الرابع (العجفاء) وهي (التي ذهب مخها) أي ذهب دماغها (من الهزال) الحاصل لها.

(ويجزئ الخصي) أي المقطوع الخصيتين (والمكسور القرن) إن لم يؤثر في اللحم، ويجزىء أيضا فاقدة القرون،

وهي المسماة بالجلحاء. (ولا تجزئ

المقطوعة) كل (الأذن) ولا بعضها ولا المخلوقة بلا أذن، (و) لا المقطوعة (الذنب) ولا بعضه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 128;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• وقت الذبح', '(و) يدخل (وقت الذبح) للأضحية (من وقت صلاة العيد) أي عيد النحر. وعبارة الروضة وأصلها «يدخل وقت التضحية إذا طلعت الشمس يوم النحر، ومضى قدر ركعتين وخطبتين خفيفتين». انتهى. ويستمر وقت الذبح (إلى غروب الشمس من آخر أيام التشريق)، وهي الثلاثة المتصلة بعاشر ذي الحجة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 128;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• ما يستحب عند الذبح', '(ويستحب عند الذبح خمسة أشياء): أحدها (التسمية) فيقول الذابح «بسم الله». والأكمل «بسم الله الرحمن الرحيم»؛ فلو لم يسم حل المذبوح. (و) الثاني (الصلاة على النبي S) ، ويكره أن يجمع بين اسم الله واسم رسوله. (و) الثالث (استقبال القبلة) بالذبيحة أي يوجه الذابح مذبحها للقبلة، ويتوجه هو أيضا.

(و) الرابع (التكبير) أي قبل التسمية أو بعدها ثلاثا - كما قال الماوردي. (و) الخامس (الدعاء بالقبول)؛ فيقول الذابح: «اللهم هذه منك وإليك، فتقبل - أي هذه الأضحية - نعمة منك علي، وتقربت بها إليك، فتقبلها مني».

(ولا يأكل المضحي شيئا من الأضحية المنذورة)، بل يجب عليه التصدق بجميع لحمها. فلو آخرها فتلفت لزمه ضمانها، (ويأكل من الأضحية المتطوع بها) ثلثا على الجديد. وأما الثلثان فقيل يتصدق بهما. ورجحه النووي في تصحيح التنبيه. وقيل يهدى ثلثا للمسلمين الأغنياء، ويتصدق بثلث على الفقراء من لحمها. ولم يرجح النووي في الروضة وأصلها شيئا من هذين الوجهين.

(ولا يبيع) أي يحرم على المضحي بيع شيء (من الأضحية) أي لحمها أو شعرها أو جلدها، ويحرم أيضا جعله أجرة للجزار ولو كانت الأضحية تطوعا. (ويطعم) حتما من الأضحية المتطوع بها (الفقراء والمساكين).

والأفضل التصدق بجميعها إلا لقمة أو لقما ms120 يتبرك المضحي بأكلها؛ فإنه يسن له ذلك. وإذا أكل البعض وتصدق بالباقي حصل له ثواب التضحية بالجميع والتصدق بالبعض.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 128;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, '• العقيقة', '{فصل} في بيان أحكام العقيقة. وهي لغة اسم للشعر على رأس المولود، وشرعا ما سيذكره المصنف بقوله: (والعقيقة) عن المولود (مستحبة). وفسر المصنف العقيقة بقوله: (وهي الذبيحة عن المولود يوم سابعه) أي يوم سابع ولادته. ويحسب يوم الولادة من السبع ولو مات المولود قبل السابع. ولا تفوت بالتأخير بعده؛ فإن تأخرت للبلوغ سقط حكمها في حق العاق عن المولود؛ أما هو فمخير في العق عن نفسه والترك.

(ويذبح عن الغلام شاتان، و) يذبح (عن الجارية شاة). قال بعضهم: وأما الخنثى فيحتمل إلحاقه بالغلام أو بالجارية؛ فلو بانت ذكورته أمر

بالتدارك وتتعدد العقيقة بتعدد الأولاد. (ويطعم) العاق من العقيقة (الفقراء والمساكين) فيطبخها بحلو ويهدي منها للفقراء والمساكين، ولا يتخذها دعوة ولا بكسر عظمها.

واعلم أن سن العقيقة وسلامتها من عيب ينقص لحمها والأكل منها والتصدق ببعضها وامتناع بيعها وتعينها بالنذر حكمه على ما سبق في الأضحية.

ويسن أن يؤذن في أذن المولود اليمنى حين يولد، ويقيم في أذنه اليسرى، وأن يحنك المولود بتمر؛ فيمضغ ويدلك به حنكه داخل فمه لينزل منه شيء إلى جوفه؛ فإن لم يوجد تمر فرطب، وإلا فشيء حلو. وأن يسمى المولود يوم سابع ولادته، وتجوز تسميته قبل السابع وبعده. ولو مات المولود قبل السابع سن تسميته.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 128;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 129, 'كتاب أحكام السبق والرمي', 'كتاب أحكام السبق والرمي');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'أي بسهام ونحوها. (وتصح المسابقة على الدواب) أي على ما هو الأصل في المسابقة عليها من خيل وإبل وفيل وبغل وحمار في الأظهر. ولا تصح المسابقة على بقر، ولا على نطاح الكباش، ولا على مهارشه الديكة، لا بعوض ولا غيره. (و) تصح (المناضلة) أي المراماة (بالسهام إذا كانت المسافة) أي مسافة ما بين موقف الرامي والغرض الذي يرمى إليه (معلومة، و) كانت (صفة المناضلة معلومة) أيضا، بأن يبين المتناضلان كيفية الرمي من قرع، وهو إصابة السهم الغرض، ولا يثبت فيه، أو من خسق، وهو أن يثقب السهم ms121 الغرض ويثبت فيه، أو من مرق، وهو أن ينفذ السهم من الجانب الآخر من الغرض.

واعلم أن عوض المسابقة هو المال الذي يخرج فيها. وقد يخرجه أحد المتسابقين، وقد يخرجانه معا. وذكر المصنف الأول في قوله:

(ويخرج العوض أحد المتسابقين حتى إنه إذا سبق) بفتح السين غيره

(استرده) أي العوض الذي أخرجه، (وإن سبق) بضم أوله (أخذه) أي العوض (صاحبه) السابق (له). وذكر المصنف الثاني في قوله: (وإن أخرجاه) أي العوض المتسابقان (معا لم يجز) أي لم يصح إخراجهما للعوض (إلا أن يدخلا بينهما محللا) بكسر اللام الأولى. وفي بعض النسخ «إلا أن يدخل بينهما محلل»؛ (فإن سبق) بفتح السين كلا من المتسابقين (أخذ العوض) الذي أخرجاه، (وإن سبق) بضم أوله (لم يغرم) لهما شيئا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 129;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 130, 'كتاب أحكام الأيمان والنذور', 'كتاب أحكام الأيمان والنذور');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'الأيمان بفتح الهمزة جمع يمين. وأصلها لغة اليد اليمنى، ثم أطلقت على الحلف، وشرعا تحقيق ما يحتمل المخالفة أو تأكيده بذكر اسم الله تعالى أو صفة من صفات ذاته. والنذور جمع نذر، وسيأتي معناه في الفصل الذي بعده.

(لا ينعقد اليمين إلا بالله تعالى) أي بذاته، كقول الحالف: «والله»، (أو باسم من أسمائه) المختصة به التي لا تستعمل في غيره كخالق الخلق، (أو صفة من صفات ذاته) القائمة به كعلمه وقدرته. وضابط الحالف كل مكلف مختار ناطق قاصد لليمين.

(ومن حلف بصدقة ماله) كقوله: «لله علي أن أتصدق بمالي». ويعبر عن هذا اليمين تارة بيمين اللجاج والغضب، وتارة بنذر اللجاج والغضب؛ (فهو) أي الحالف أو الناذر (مخير بين) الوفاء بما حلف عليه والتزمه بالنذر من (الصدقة) بماله (أو', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 130;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 131, 'كفارة اليمين)', 'كفارة اليمين)');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'في الأظهر. وفي

قول يلزمه كفارة يمين، وفي قول يلزمه الوفاء بما التزمه. (ولا شيء في لغو اليمين). وفسر بما سبق لسانه إلى لفظ اليمين من غير أن يقصدها كقوله في حال غضبه أو غلبته أو عجلته: «لا والله» مرة، و «بلى والله» مرة في وقت آخر.

(ومن حلف أن لا يفعل شيئا) أي كبيع عبده (فأمر غيره بفعله) ففعله بأن ms122 باع عبد الحالف (لم يحنث) ذلك الحالف بفعل غيره، إلا أن يريد الحالف أنه لا يفعل هو ولا غيره، فيحنث بفعل مأموره. أما لو حلف أن لا ينكح فوكل غيره في النكاح فإنه يحنث بفعل وكيله له في النكاح. (ومن حلف على فعل

أمرين) كقوله: «والله، لا ألبس هذين الثوبين»؛ (ففعل) أي لبس (أحدهما لم يحنث)؛ فإن لبسهما معا أو مرتبا حنث. فإن قال: «لا ألبس هذا ولا هذا»، حنث بأحدهما. ولا تنحل يمينه، بل إذا فعل الآخر حنث أيضا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 131;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• كفارة اليمين', '(وكفارة اليمين هو) أي الحالف إذا حنث (مخير فيها بين ثلاثة أشياء): أحدها (عتق رقبة مؤمنة) سليمة من عيب يخل بعمل أو كسب.

وثانيها مذكور في قوله: (أو إطعام عشرة مساكين؛ كل مسكين مدا) أي رطلا وثلثا من حب من غالب قوت بلد المكفر. ولا يجزىء فيه غير الحب من تمر وأقط. وثالثها مذكور في قوله: (أو كسوتهم) أي يدفع المكفر لكل من المساكين (ثوبا ثوبا) أي شيئا يسمى كسوة مما يعتاد لبسه، كقميص أو عمامة أو خمار أو كساء. ولا يكفي خف ولا قفازان. ولا يشترط في القميص كونه صالحا للمدفوع إليه؛ فيجزىء أن يدفع للرجل ثوب صغير أو ثوب امرأة. ولا يشترط أيضا كون المدفوع جديدا؛ فيجوز دفعه ملبوسا لم تذهب قوته. (فإن لم يجد) المكفر شيئا من الثلاثة السابقة (فصيام) فيلزمه صيام (ثلاثة أيام)؛ ولا يجب تتابعها في الأظهر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 131;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• النذور', '{فصل} في أحكام النذور. جمع نذر، وهو بذال المعجمة ساكنة وحكي فتحها، ومعناه لغة الوعد بخير أو شر، وشرعا التزام قربة لازمة بأصل الشرع.

والنذر ضربان: أحدهما نذر اللجاج بفتح أوله، وهو التمادى في الخصومة. والمراد بهذا النذر أن يخرج مخرج اليمين بأن يقصد الناذر منع نفسه من شيء، ولا يقصد القربة، وفيه كفارة يمين أو ما التزمه بالنذر. والثاني نذر المجازاة وهو نوعان: أحدهما أن لا يعلقه الناذر على شيء، كقوله ابتداء: «لله علي صوم أو عتق». والثاني أن يعلقه على شيء. وأشار له ms123 المصنف بقوله: (والنذر يلزم في المجازاة على) نذر (مباح وطاعة، كقوله) أي الناذر: («إن شفى الله مريضي) وفي بعض النسخ «مرضي» أو كفيت شر عدوي (فلله أن أصلي أو أصوم أو أتصدق»، ويلزمه) أي الناذر (من ذلك) أي مما نذره من صلاة أو صوم أو صدقة (ما يقع عليه الاسم) من صلاة. وأقلها ركعتان، أو صوم وأقله يوم، أو الصدقة وهي أقل شيء مما يتمول. وكذا لو نذر التصدق بمال عظيم - كما قال القاضي أبو الطيب. ثم صرح المصنف بمفهوم قوله سابقا على مباح في قوله:

(ولا نذر في معصية) أي لا ينعقد نذرها، (كقوله: «إن قتلت فلانا) بغير حق (فلله علي كذا»). وخرج بالمعصية نذر المكروه كنذر شخص صوم الدهر، فينعقد نذره، ويلزمه الوفاء به. ولا يصح أيضا نذر واجب على العين كالصلوات الخمس. أما الواجب على الكفاية فيلزمه كما يقتضيه كلام الروضة وأصلها. (ولا يلزم النذر) أي لا ينعقد (على ترك مباح) أو فعله؛ فالأول (كقوله: «لا آكل لحما ولا أشرب لبنا» وما أشبه ذلك) من المباح كقوله: لا ألبس كذا، والثاني نحو آكل كذا وأشرب كذا، وألبس كذا. وإذا خالف النذر المباح لزمه كفارة يمين على الراجح عند البغوي، وتبعه المحرر والمنهاج، لكن قضية كلام الروضة وأصلها عدم اللزوم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 131;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 132, 'كتاب أحكام الأقضية والشهادات', 'كتاب أحكام الأقضية والشهادات');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'والأقضية جمع قضاء بالمد، وهو لغة أحكام الشيء وإمضاؤه، وشرعا فصل حكومة بين خصمين بحكم الله تعالى. والشهادات جمع شهادة، مصدر شهد، مأخوذ من الشهود بمعنى الحضور. والقضاء فرض كفاية؛ فإن تعين على شخص لزمه طلبه.

(ولا يجوز أن يلي القضاء إلا من استكملت فيه خمسة عشر) وفي بعض النسخ «خمس عشرة» (خصلة): أحدها (الإسلام)؛ فلا تصح ولاية الكافر ولو كانت على كافر مثله. قال الماوردي: «وما جرت به عادة الولاية من نصب رجل من أهل الذمة فتقليد رياسة وزعامة، لا تقليد حكم وقضاء». ولا يلزم أهل الذمة الحكم بإلزامه بل بالتزامهم. (و) الثاني والثالث (البلوغ، والعقل)؛ فلا ولاية لصبي ومجنون، أطبق جنونه أو ms124 لا. (و) الرابع (الحرية)؛ فلا تصح ولاية رقيق كله أو بعضه.

(و) الخامس (الذكورة)؛ فلا تصح ولاية امرأة، ولا خنثى. ولو ولى الخنثى حال الجهل فحكم ثم بان ذكرا لم ينفذ حكمه في المذهب. (و) السادس (العدالة)، وسيأتي بيانها في فصل الشهادات؛ فلا ولاية لفاسق بشيء لا شبهة له فيه. (و) السابع (معرفة أحكام الكتاب والسنة) على طريق الاجتهاد، ولا يشترط حفظه لآيات الأحكام، ولا أحاديثها المتعلقات بها عن ظهر قلب. وخرج بالأحكام القصص والمواعظ. (و) الثامن (معرفة الإجماع)، وهو اتفاق أهل الحل والعقد من أمة محمد - صلى الله عليه وسلم - على أمر من الأمور. ولا يشترط معرفته لكل فرد من أفراد الإجماع، بل يكفيه في المسألة التي يفتي بها أو يحكم فيها، أن قوله لا يخالف الإجماع فيها. (و) التاسع (معرفة الاختلاف) الواقع بين العلماء. (و) العاشر (معرفة طرق الاجتهاد)، أي كيفية الاستدلال من أدلة الأحكام. (و) الحادي عشر (معرفة طرف من لسان العرب) من لغة وصرف ونحو،

(ومعرفة تفسير كتاب الله تعالى. و) الثاني عشر (أن يكون سميعا) ولو بصياح في أذنيه؛ فلا يصح تولية أصم. (و) الثالث عشر (أن يكون بصيرا)؛ فلا يصح تولية أعمى. ويجوز كونه أعور كما قال الروياني. (و) الرابع عشر (أن يكون كاتبا). وما ذكره المصنف من اشتراط كون القاضي كاتبا وجه مرجوح؛ والأصح خلافه. (و) الخامس عشر (أن يكون مستيقظا)؛ فلا يصح تولية مغفل، بأن اختل نظره أو فكره، إما لكبر أو مرض أو غيره.

ولما فرغ المصنف من شروط القاضي شرع في آدابه، فقال: (ويستحب أن يجلس). وفي بعض النسخ «أن ينزل» أي القاضي (في وسط البلد) إذا اتسعت خطته؛ فإن كانت البلد صغيرة نزل حيث شاء إن لم يكن هناك موضع معتاد تنزله القضاة، ويكون جلوس القاضي (في موضع) فسيح (بارز) أي ظاهر (للناس) بحيث يراه المستوطن والغريب والقوي والضعيف، ويكون مجلسه مصونا من أذى حر وبرد، بأن يكون في

الصيف في مهب الريح، وفي الشتاء في كن، (ولا حجاب ms125 له). وفي بعض النسخ «ولا حاجب دونه»؛ فلو اتخذ حاجبا أو بوابا كره. (ولا يقعد) القاضي (للقضاء في المسجد)؛ فإن قضى فيه كره. فإن اتفق وقت حضوره في المسجد لصلاة أو غيرها خصومة لم يكره فصلها فيه. وكذا لو احتاج إلى المسجد لعذر من مطر ونحوه.

(ويسوي) القاضي وجوبا (بين الخصمين في ثلاثة أشياء): أحدها التسوية (في المجلس)؛ فيجلس القاضي الخصمين بين يديه إذا استويا شرفا. أما المسلم فيرفع عن الذمي في المجلس. (و) الثاني التسوية في (اللفظ) أي الكلام؛ فلا يسمع كلام أحدهما دون الآخر. (و) الثالث التسوية في (اللحظ) أي النظر؛ فلا ينظر أحدهما دون الآخر.

(ولا يجوز) للقاضي (أن يقبل الهدية من أهل عمله)؛ فإن كانت الهدية في غير عمله من غير أهله لم يحرم في الأصح. وإن أهدى إليه من هو في

محل ولايته وله خصومة ولا عادة له بالهدية قبلها حرم عليه قبولها.

(ويجتنب) القاضي (القضاء)، أي يكره له ذلك (في عشرة مواضع)، وفي بعض النسخ «أحوال»: (عند الغضب). وفي بعض النسخ «في الغضب». قال بعضهم: وإذا أخرجه الغضب عن حالة الاستقامة حرم عليه القضاء حينئذ. (والجوع) والشبع المفرطين، (والعطش، وشدة الشهوة، والحزن، والفرح المفرط، وعند المرض)، أي المؤلم، (ومدافعة الأخبثين) أي البول والغائط، (وعند النعاس، و) عند (شدة الحر والبرد). والضابط الجامع لهذه العشرة وغيرها أنه يكره للقاضي القضاء في كل حال يسوء خلقه. وإذا حكم في حال مما تقدم نفذ حكمه مع الكراهة.

(ولا يسأل) وجوبا، أي إذا جلس الخصمان بين يدي القاضي لا يسأل (المدعى عليه إلا بعد كمال) أي بعد فراغ المدعي من (الدعوى)

الصحيحة. وحينئذ يقول القاضي للمدعي عليه: «أخرج من دعواه». فإن أقر بما ادعى به عليه لزمه ما أقر به، ولا يفيده بعد ذلك رجوعه. وإن أنكر ما ادعي به عليه فللقاضي أن يقول للمدعي: «ألك بينة أو شاهد مع يمينك؟» إن كان الحق مما يثبت بشاهد ويمين.

(ولا يحلفه). وفي بعض النسخ «ولا يستحلفه»، أي لا يحلف ms126 القاضي المدعى عليه (إلا بعد سؤال المدعي) من القاضي أن يحلف المدعى عليه، (ولا يلقن) القاضي (خصما حجة) أي لا يقول لكل من الخصمين: «قل كذا وكذا». أما استفسار الخصم فجائز، كأن يدعي شخص قتلا على شخص، فيقول القاضي للمدعي: «قتله عمدا أو خطأ؟»، (ولا يفهمه كلاما) أي لا يعلمه كيف يدعي. وهذه المسألة ساقطة في بعض نسخ المتن. (ولا يتعنت بالشهداء). وفي بعض النسخ «ولا يتعنت بشاهد»، كأن يقول له القاضي: «كيف تحملت؟ ولعلك ما شهدت».

(ولا يقبل الشهادة إلا ممن) أي شخص (ثبتت عدالته)؛ فإن عرف القاضي عدالة الشاهد عمل بشهادته أو عرف فسقه رد شهادته. فإن لم يعرف عدالته ولا فسقه طلب منه التزكية، ولا يكفي في التزكية قول المدعى عليه إن الذي

شهد علي عدل، بل لا بد من إحضار من يشهد عند القاضي بعدالته، فيقول: «أشهد أنه عدل». ويعتبر في المزكي شروط الشاهد من العدالة وعدم العداوة وغير ذلك. ويشترط مع هذا معرفته بأسباب الجرح والتعديل، وخبرة باطن من يعدله بصحبة أو جوار أو معاملة. (ولا يقبل) القاضي (شهادة عدو على عدوه). والمراد بعدو الشخص من يبغضه، (ولا) يقبل القاضي (شهادة والد) وإن علا (لولده). وفي بعض النسخ «لمولوده» أي وإن سفل، (ولا) شهادة (ولد لوالده) وإن علا. أما الشهادة عليهما فتقبل.

(ولا يقبل كتاب قاض إلى قاض آخر في الأحكام إلا بعد شهادة شاهدين يشهدان) على القاضي الكاتب (بما فيه) أي الكتاب عند المكتوب إليه. وأشار المصنف بذلك إلى أنه إذا ادعى شخص على شخص غائب بمال، وثبت المال عليه؛ فإن كان له مال حاضر قضاه القاضي منه، وإن لم يكن له مال حاضر وسأل المدعي إنهاء الحال إلى قاضي بلد الغائب أجابه لذلك. وفسر الأصحاب إنهاء الحال بأن يشهد

قاضي بلد الحاضر عدلين بما ثبت عنده من الحكم على الغائب.

وصفة الكتاب:

بسم الله الرحمن الرحيم

حضر عندنا - عافاني الله وإياك - فلان، وادعى على فلان الغائب المقيم في بلدك بالشيء الفلاني، وأقام عليه ms127 شاهدين، وهما فلان وفلان، وقد عدلا عندي، وحلفت المدعي وحكمت له بالمال، وأشهدت بالكتاب فلانا وفلانا.

ويشترط في شهود الكتاب والحكم ظهور عدالتهم عند القاضي المكتوب إليه، ولا تثبت عدالتهم عنده بتعديل القاضي الكاتب إياهم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 132;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 133, 'القسمة', 'القسمة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '{فصل} في أحكام القسمة. وهي بكسر القاف الاسم من قسم الشيء قسما، بفتح القاف، وشرعا تمييز بعض الأنصباء من بعض بالطريق الآتي. (ويفتقر القاسم) المنصوب من جهة القاضي (إلى سبعة) وفي بعض النسخ «إلى سبع» (شرائط: الإسلام، والبلوغ، والعقل، والحرية، والذكورة، والعدالة، والحساب)؛ فمن اتصف بضد ذلك لم يكن قاسما. وأما إذا لم يكن القاسم منصوبا من جهة القاضي فقد أشار إليه المصنف بقوله:

(فإن تراضى) وفي بعض النسخ «فإن تراضيا» (الشريكان بمن يقسم بينهما) المال المشترك (لم يفتقر) في هذا القاسم (إلى ذلك)، أي إلى الشروط السابقة. واعلم أن القسمة على ثلاثة أنواع: أحدها القسمة بالأجزاء، وتسمى قسمة المتشابهات كقسمة المثليات من حبوب وغيرها، فتجزأ الأنصباء كيلا في المكيل، ووزنا في الموزون، وذرعا في مذروع، ثم بعد ذلك يقرع بين الأنصباء ليتعين لكل نصيب منها واحد من الشركاء.

وكيفية الأقراع أن تؤخذ ثلاث رقاع متساوية، ويكتب في كل رقعة منها اسم شريك من الشركاء، أو جزء من الأجزاء مميز عن غيره منها، وتدرج تلك الرقاع في بنادق متساوية من طين مثلا بعد تجفيفه، ثم توضع في حجر من لم يحضر الكتابة والإدراج، ثم يخرج من لم يحضرهما رقعة على الجزء الأول من تلك الأجزاء، إن كتبت أسماء الشركاء في الرقاع كزيد وبكر وخالد فيعطى من خرج اسمه في تلك الرقعة، ثم يخرج رقعة أخرى على الجزء الذي بلى الجزء الأول من تلك الأجزاء، فيعطى من خرج اسمه في الرقعة الثانية، ويتعين الجزء الباقي للثالث إن كانت الشركاء ثلاثة، أو يخرج من لم يحضر الكتابة والإدراج رقعة على اسم زيد مثلا، إن كتبت في الرقاع أجزاء الأنصباء، ثم على اسم خالد، ويتعين الجزء الباقي للثالث.

النوع الثاني القسم بالتعديل للسهام، وهي الأنصباء بالقيمة كأرض ms128 تختلف قيمة أجزائها بقوة إنبات أو قرب ماء، وتكون الأرض بينهما نصفين، ويساوي ثلث الأرض مثلا لجودته ثلثيها؛ فيجعل الثلث سهما، والثلثان سهما. ويكفي في هذا النوع والذي قبله قاسم واحد.

النوع الثالث القسمة بالرد، بأن يكون في أحد جانبي الأرض المشتركة بئر أو شجر مثلا، لا يمكن قسمته فيرد من يأخذه بالقسمة التي أخرجتها القرعة قسط قيمة كل من البئر أو الشجر في المثال المذكور؛ فلو كانت قيمة كل من البئر أو الشجر ألفا، وله النصف من الأرض رد الآخذ ما فيه ذلك خمسمائة. ولا بد في هذا النوع من قاسمين كما قال: (وإن كان في القسمة تقويم لم يقتصر فيه) أي في المال المقسوم (على أقل من اثنين). وهذا إن لم يكن القاسم حاكما في التقويم بمعرفته، فإن حكم في التقويم بمعرفته فهو كقضائه بعلمه. والأصح جوازه بعلمه.

(وإذا دعا أحد الشريكين شريكه إلى قسمة ما لا ضرر فيه لزم) الشريك (الآخر إجابته) إلى القسمة. أما الذي في قسمته ضرر كحمام لا يمكن جعله

حمامين إذا طلب أحد الشركاء قسمته وامتنع الآخر فلا يجاب طالب قسمته في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• الحكم بالبينة', '{فصل} في الحكم بالبينة. (وإذا كان مع المدعي بينة سمعها الحاكم، وحكم له بها) إن عرف عدالتها، وإلا طلب منها التزكية؛ (وإن لم تكن له) المدعي (بينة، فالقول قول المدعى عليه بيمينه). والمراد بالمدعي من يخالف قوله الظاهر، والمدعى عليه من يوافق قوله الظاهر؛ (فإن نكل) أي امتنع المدعى عليه (عن اليمين) المطلوبة منه (ردت على المدعي، فيحلف) حينئذ (ويستحق) المدعى به. والنكول أن يقول المدعى عليه بعد عرض القاضي عليه اليمين: «أنا ناكل عنها». ويقول له القاضي: «أحلف»؛ فيقول: «لا أحلف».

(وإذا تداعيا) أي اثنان (شيئا في يد أحدهما؛ فالقول قول صاحب اليد بيمينه) أي أن الذي في يده له؛ (وإن كان في أيديهما) أو لم يكن في يد واحد منهما (تحالفا، وجعل) المدعى به

(بينهما) نصفين.

(ومن حلف على فعل نفسه) اثباتا أو نفيا (حلف على ms129 البت والقطع). والبت بموحدة فمثناة فوقية معناه القطع. وحينئذ فعطف المصنف القطع على البت من عطف التفسير. (ومن حلف على فعل غيره) ففيه تفصيل؛ (فإن كان إثباتا حلف على البت والقطع؛ وإن كان نفيا) مطلقا (حلف على نفي العلم)، وهو أنه لا يعلم أن غيره فعل كذا. أما النفي المحصور فيحلف فيه الشخص على البت.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• شروط الشاهد', '{فصل} في شروط الشاهد. (ولا تقبل الشهادة إلا ممن) أي شخص (اجتمعت فيه خمس خصال):

أحدها (الإسلام) ولو بالتبعية؛ فلا تقبل شهادة كافر على مسلم أو كافر. (و) الثاني (البلوغ)؛ فلا تقبل شهادة صبي ولو مراهقا. (و) الثالث (العقل)؛ فلا تقبل شهادة مجنون. (و) الرابع (الحرية) ولو بالدار؛ فلا تقبل شهادة رقيق، قنا كان أو مدبرا أو مكاتبا. (و) الخامس (العدالة)، وهي لغة التوسط وشرعا ملكة في النفس تمنعها من اقتراف الكبائر والرذائل المباحة.

(وللعدالة خمس شرائط). وفي بعض النسخ «خمسة شروط»: أحدها (أن يكون) العدل (مجتنبا للكبائر) أي لكل فرد منها؛ فلا تقبل شهادة صاحب كبيرة كالزنا وقتل النفس بغير حق. والثاني أن يكون العدل (غير مصر على القليل من الصغائر)؛ فلا تقبل شهادة المصر عليها. وعد الكبائر مذكور في المطولات.

والثالث أن يكون العدل (سليم السريرة) أي العقيدة؛ فلا تقبل شهادة مبتدع يكفر أو يفسق ببدعته؛ فالأول كمنكر البعث، والثاني

كساب الصحابة. أما الذي لا يكفر ولا يفسق ببدعته فتقبل شهادته. ويستثنى من هذا الخطابية؛ فلا تقبل شهادتهم، وهم فرقة يجوزون الشهادة لصاحبهم إذا سمعوه يقول لي على فلان كذا. فإن قالوا رأيناه يقرضه كذا قبلت شهادتهم. والرابع أن يكون العدل (مأمون الغضب). وفي بعض النسخ «مأمونا عند الغضب»؛ فلا تقبل شهادة من لا يؤمن عند غضبه. والخامس أن يكون العدل (محافظا على مروءة مثله). والمروءة تخلق الإنسان بخلق أمثاله من أبناء عصره في زمانه ومكانه؛ فلا تقبل شهادة من لا مروءة له كمن يمشي في السوق مكشوف الرأس أو البدن غير العورة، ولا يليق به ذلك. أما كشف العورة فحرام. ms130', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, '• أنواع الحقوق', '{فصل} والحقوق ضربان: أحدهما (حق الله تعالى) وسيأتي الكلام عليه.

(و) الثاني (حق الآدمي؛ فأما حقوق الآدميين فثلاثة). وفي بعض النسخ «فهي على ثلاثة» (أضرب: ضرب لا يقبل فيه إلا شاهدان ذكران)؛ فلا يكفي رجل وامرأتان. وفسر المصنف هذا الضرب بقوله: (وهو ما لا يقصد منه المال، ويطلع عليه الرجال) غالبا كطلاق ونكاح. ومن هذا الضرب أيضا عقوبة الله تعالى كحد شرب خمر، أو عقوبة لأدمي كتعزير وقصاص.

(وضرب) آخر (يقبل فيه) أحد أمور ثلاثة إما (شاهدان) أي رجلان (أو رجل وامرأتان، أو شاهد) واحد (ويمين المدعي). وإنما يكون يمينه بعد شهادة شاهده، وبعد تعديله. ويجب أن يذكر في حلفه أن شاهده صادق فيما شهد له به؛ فإن لم يحلف المدعي وطلب يمين خصمه فله ذلك؛ فإن نكل خصمه فله أن يحلف يمين الرد في الأظهر. وفسر المصنف هذا الضرب بأنه (ما كان القصد منه المال) فقط.

(وضرب) آخر (يقبل فيه) أحد أمرين إما (رجل وامرأتان، أو أربع نسوة). وفسر المصنف هذا الضرب بقوله: (وهو ما لا يطلع عليه الرجال) غالبا، بل نادرا، كولادة وحيض ورضاع. واعلم أنه لا يثبت شيء من الحقوق بامرأتين ويمين.

(وأما حقوق الله تعالى فلا تقبل فيها النساء) بل الرجال فقط؛ (وهي) أي حقوق الله تعالى (على ثلاثة أضرب: ضرب لا يقبل فيه أقل من أربعة) من الرجال، (وهو الزنا)، ويكون نظرهم له لأجل الشهادة؛ فلو تعمدوا النظر لغيرها فسقوا وردت شهادتهم؛ أما إقرار شخص بالزنا فيكفي في الشهادة عليه رجلان في الأظهر.

(وضرب) آخر من حقوق الله تعالى (يقبل فيه اثنان) أي رجلان. وفصل المصنف هذا الضرب بقوله: (وهو ما سوى الزنا من الحدود) كحد شرب.

(وضرب) آخر من حقوق الله تعالى (يقبل فيه رجل واحد؛ وهو هلال) شهر (رمضان) فقط دون غيره من الشهور. وفي المبسوطات مواضع يقبل فيها شهادة الواحد فقط، منها شهادة اللوث، ومنها أنه يكتفي في الخرص بعدل واحد.

(ولا تقبل شهادة الأعمى إلا في خمسة). وفي بعض ms131 النسخ «خمس» (مواضع). والمراد بهذه الخمسة ما يثبت بالاستفاضة مثل (الموت، والنسب) لذكر أو أنثى عن أب أو قبيلة؛ وكذا الأم يثبت النسب فيها بالاستفاضة على الأصح. (و) مثل (الملك المطلق، والترجمة). وقوله: (وما شهد به قبل العمى) ساقط في بعض نسخ المتن. ومعناه أن الأعمى لو تحمل الشهادة فيما يحتاج للبصر قبل عروض العمى له، ثم بعد ذلك شهد مما تحمله إن كان المشهود له، وعليه معروفي الاسم والنسب. (و) ما شهد به (على المضبوط). وصورته أن يقر شخص في أذن عمى بعتق أو طلاق لشخص يعرف اسمه ونسبه، ويد ذلك الأعمى على رأس ذلك المقر، فيتعلق الأعمى به ويضبطه حتى يشهد عليه مما سمعه

منه عند قاض.

(ولا تقبل شهادة) شخص (جار لنفسه نفعا ولا دافع عنها ضررا). وحينئذ ترد شهادة السيد لعبده المأذون له في التجارة ومكاتبه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 134, 'كتاب أحكام العتق', 'كتاب أحكام العتق');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'وهو لغة مأخوذ من قولهم عتق الفرخ إذا طار واستقل، وشرعا إزلة ملك عن آدمي لا إلى مالك تقربا إلى الله تعالى. وخرج بآدمي الطير والبهيمة؛ فلا يصح عتقهما.

(ويصح العتق من كل مالك جائز الأمر). وفي بعض النسخ «جائز التصرف» (في ملكه)؛ فلا يصح عتق غير جائز التصرف كصبي ومجنون وسفيه. وقوله: (ويقع العتق بصريح العتق). كذلك في بعض النسخ، وفي بعضها «ويقع بصريح العتق».

واعلم أن صريحه الإعتاق والتحرير وما تصرف منهما، كأنت عتيق أو محرر. ولا فرق في هذا بين هازل وغيره. ومن صريحه في الأصح فك الرقبة. ولا يحتاج الصريح إلى نية. ويقع العتق أيضا بغير الصريح كما قال: (والكناية مع النية) كقول السيد لعبده: «لا ملك لي عليك، لا سلطان لي عليك»، ونحو ذلك.

(وإذا أعتق) جائز التصرف (بعض عبد) مثلا (عتق عليه جميعه) موسرا كان السيد أو لا، معينا كان ذلك البعض أو لا. (وإن أعتق) وفي بعض

النسخ «عتق» (شركا) أي نصيبا (له في عبد) مثلا، أو أعتق جميعه، (وهو موسر) بباقيه (سرى العتق إلى باقيه) أي العبد، أو سرى ms132 إلى ما أيسر به من نصيب شريكه على الصحيح. وتقع السراية في الحال على الأظهر. وفي قول بأداء القيمة. وليس المراد بالموسر هنا هو الغني، بل من له من المال وقت الإعتاق ما يفي بقيمة نصيب شريكه، فاضلا عن قوته وقوت من تلزمه نفقته في يومه وليلته، وعن دست ثوب يليق به وعن سكنى يومه، (وكان عليه) أي المعتق (قيمة نصيب شريكه) يوم إعتاقه.

(ومن ملك واحدا من والديه أو) من (مولوديه عتق عليه) بعد ملكه، سواء كان المالك من أهل التبرع أو لا، كصبي ومجنون.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 134;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• الولاء', '{فصل} في أحكام الولاء. وهو لغة مشتق من الموالاة، وشرعا عصوبة سببها زوال الملك عن رقيق معتق.

(والولاء) بالمد (من حقوق العتق؛ وحكمه) أي حكم الإرث بالولاء (حكم التعصيب عند عدمه). وسبق معنى التعصيب في الفرائض. (وينتقل الولاء عن المعتق إلى الذكور من عصبته) المتعصبين بأنفسهم، لا كبنت معتقه وأخته.

(وترتيب العصبات في الولاء كترتيبهم في الإرث)، لكن الأظهر في باب الولاء أن أخا المعتق وابن أخيه مقدمان على جد المعتق، بخلاف الإرث أي بالنسب؛ فإن الأخ والجد شريكان. ولا ترث المرأة بالولاء إلا من شخص باشرت عتقه أو من أولاده وعتقائه. (ولا يجوز) أي لا يصح (بيع الولاء ولا هبته). وحينئذ لا ينتقل الولاء عن مستحقه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 134;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, '• التدبير', '{فصل} في أحكام التدبير. وهو لغة النظر في عواقب الأمور، وشرعا عتق عن دبر الحياة، وذكره المصنف بقوله: (ومن) أي السيد إذا (قال لعبده) مثلا: («إذا مت) أنا

(فأنت حر»؛ فهو) أي العبد (مدبر، يعتق بعد وفاته) أي السيد (من ثلثه) أي ثلث ماله إن خرج كله من الثلث؛ وإلا عتق منه بقدر ما يخرج من الثلث إن لم تجز الورثة. وما ذكره المصنف هو من صريح التدبير. ومنه أعتقتك بعد موتي. ويصح التدبير بالكناية أيضا مع النية، كخليت سبيلك بعد موتي. (ويجوز له) أي السيد (أن يبيعه) أي المدبر (في حال حياته، ويبطل تدبيره). وله أيضا التصرف فيه بكل ما يزيل الملك كهبة بعد ms133 قبضها أو جعله صداقا. والتدبير تعليق عتق بصفة في الأظهر. وفي قول وصية للعبد بعتقه؛ فعلى الأظهر لو باعه السيد ثم ملكه لم يعد التدبير على المذهب.

(وحكم المدبر في حال حياة السيد حكم العبد القن). وحينئذ تكون أكساب المدبر للسيد. وإن قتل المدبر فللسيد القيمة، أو قطع المدبر فللسيد الأرش. ويبقي التدبير بحاله. وفي بعض النسخ «وحكم المدبر في حياة سيده حكم العبد القن».', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 134;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('fathulqarib', 135, 'الكتابة', 'الكتابة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '{فصل} في أحكام الكتابة. بكسر الكاف في الأشهر، وقيل بفتحها كالعتاقة، وهي لغة مأخوذة من الكتب، وهو بمعنى الضم والجمع، لأن فيها ضم نجم إلى نجم، وشرعا عتق معلق على مال منجم بوقتين معلومين فأكثر. (والكتابة مستحبة إذا سألها العبد) أو الأمة، (وكان) كل منهما (مأمونا) أي أمينا (مكتسبا) أي قويا على كسب يوفي به ما التزمه من أداء النجوم. (ولا تصح إلا بمال معلوم) كقول السيد لعبده: «كاتبتك على دينارين» مثلا. (ويكون) المال المعلوم (مؤجلا إلى أجل معلوم، أقله نجمان)، كقول السيد في المثال المذكور لعبده تدفع إلى الدينارين في كل نجم دينار. فإذا أديت ذلك فأنت حر.

(وهي) أي الكتابة الصحيحة (من جهة السيد لازمة)، فليس له فسخها بعد لزومها إلا أن يعجز المكاتب عن أداء النجم أو بعضه عند المحل، كقوله: عجزت عن ذلك، فللسيد حينئذ فسخها. وفي معنى العجز امتناع المكاتب من أداء النجوم مع القدرة عليها. (و) الكتابة (من جهة) العبد (المكاتب جائزة؛ فله) بعد عقد الكتابة تعجيز نفسه بالطريق السابق،

وله أيضا (فسخها متى شاء) وإن كان معه ما يوفي به نجوم الكتابة. وأفهم قول المصنف: «متى شاء» أن له اختيار الفسخ. أما الكتابة الفاسدة فجائزة من جهة المكاتب والسيد. (وللمكاتب التصرف فيما في يده من المال) ببيع وشراء وإيجار ونحو ذلك، لا بهبة ونحوها. وفي بعض نسخ المتن «ويملك المكاتب التصرف فيما فيه تنمية المال». والمراد أن المكاتب يملك بعقد الكتابة منافعه وإكسابه إلا أنه محجور عليه لأجل السيد في استهلاكها بغير حق.

(ويجب على السيد) بعد ms134 صحة كتابة عبده (أن يضع) أي يحط (عنه من مال الكتابة ما) أي شيئا (يستعين به على أداء نجوم الكتابة). ويقوم مقام الحط أن يدفع له السيد جزأ معلوما من مال الكتابة، ولكن الحط أولى من الدفع، لأن القصد من الحط الإعانة على العتق، وهي محققة في الحط موهومة في الدفع. (ولا يعتق) المكاتب (إلا بأداء جميع المال) أي مال الكتابة بعد القدر الموضوع عنه من جهة السيد.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 135;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, '• أمهات الأولاد', '{فصل} في أحكام أمهات الأولاد. (وإذا أصاب) أي وطىء (السيد) مسلما كان أو كافرا (أمته) ولو كانت حائضا أو محرما له أو مزوجة، أو لم يصبها، ولكن استدخلت ذكره أو ماءه المحترم، (فوضعت) حيا أو ميتا أو ما يجب فيه غرة وهو (ما) أي لحم (تبين فيه شيء من خلق آدمي). وفي بعض النسخ «من خلق الآدميين»، لكل أحد أو لأهل الخبرة من النساء. ويثبت بوضعها ما ذكر كونها مستولدة لسيدها. وحينئذ (حرم عليه بيعها) مع بطلانه أيضا إلا من نفسها؛ فلا يحرم ولا يبطل. (و) حرم عليه أيضا (رهنها وهبتها)، والوصية بها. (وجاز له التصرف فيها بالاستخدام والوطء) أو بالإجارة والإعارة، وله أيضا أرش جناية عليها، وعلى أولادها التابعين لها وقيمتها إذا قتلت، وقيمتهم إذا قتلوا، أو تزويجها بغير إذنها إلا إذا كان السيد كافرا، وهي مسلمة، فلا يزوجها.

(وإذا مات السيد) ولو بقتلها له (عتقت من رأس ماله). وكذا عتق أولادها (قبل) دفع (الديون) التي على السيد (والوصايا) التي أوصى بها. (وولدها) أي المستولدة (من غيره) أي غير السيد بأن ولدت بعد استيلادها ولدا من زوج أو من زنا (بمنزلتها).

وحينئذ فالولد الذي ولدته للسيد يعتق بموته.

(ومن أصاب) أي وطىء (أمة غيره بنكاح) أو زنا وأحبلها فولدت منه (فولده منها مملوك لسيدها). أما لو غر شخص بحرية أمة فأولدها فالولد حر. وعلى المغرور قيمته لسيدها. (وإن أصابها) أي أمة غيره (بشبهة) منسوبة للفاعل كظنه أنها أمته أو زوجته الحرة (فولده منها حر، وعليه قيمته للسيد). ولا تصير ms135 أم ولد في الحال بلا خلاف. (وإن ملك) الواطىء بالنكاح (الأمة المطلقة بعد ذلك لم تصر أم ولد له بالوطء في النكاح) السابق، (وصارت أم ولد له بالوطء بالشبهة على أحد القولين). والقول الثاني لا تصير أم ولد له، وهو الراجح في المذهب. والله أعلم بالصواب.

وقد ختم المصنف - رحمه الله تعالى - كتابه بالعتق رجاء لعتق الله تعالى له من النار وليكون سببا في دخول الجنة دار الأبرار. وهذا آخر شرح الكتاب غاية الاختصار بلا إطناب. فالحمد لربنا المنعم الوهاب.

وقد ألفته عاجلا في مدة يسيرة، والمرجو ممن اطلع فيه على هفوة صغيرة أو كبيرة أن يصلحها إن لم يمكن الجواب عنها على وجه حسن ليكون ممن يدفع السيئة بالتي هي أحسن، وأن يقول من اطلع فيه على الفوائد من جاء بالخيرات. إن الحسنات يذهبن السيئات.

جعلنا الله وإياكم بحسن النية في تأليفه مع النبيين والصديقين والشهداء والصالحين، وحسن أولئك رفيقا في دار الجنان. ونسأل الله الكريم المنان الموت على الإسلام والإيمان بجاه سيد المرسلين، وخاتم النبيين، وحبيب رب العالمين محمد بن عبد الله ابن عبد المطلب بن هاشم السيد الكامل. والحمد لله الهادي إلى سواء السبيل، وحسبنا الله ونعم الوكيل ولا حول ولا قوة إلا بالله العلي العظيم.

وصلى الله على سيدنا محمد وعلى آله وصحبه وسلم تسليما كثيرا دائما أبدا إلى يوم الدين ورضي الله عن أصحاب رسول الله أجمعين، والحمد لله رب العالمين.  ms136', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'fathulqarib' AND bab_order = 135;

-- ═══ minhajultalibin — OpenITI 0676Nawawi.MinhajTalibin.Shamela0012096-ara1 ═══
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 100, 'مقدمة المؤلف', 'مقدمة المؤلف');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, '...

بسم الله الرحمن الرحيم

الحمد لله البر الجواد الذي جلت نعمه عن الإحصاء بالأعداد المان باللطف والإرشاد الهادي إلى سبيل الرشاد الموفق للتفقه في الدين من لطف به واختاره من العباد أحمده أبلغ حمد وأكمله وأزكاه وأشمله وأشهد أن لا إله إلا الله الواحد الغفار وأشهد أن محمدا عبده ورسوله المصطفى المختار صلى الله عليه وسلم وزاده فضلا وشرفا لديه.

أما بعد فإن الاشتغال بالعلم من أفضل الطاعات وأولى ما أنفقت فيه نفائس الأوقات وقد أكثر أصحابنا رحمهم الله من التصنيف من المبسوطات والمختصرات وأتقن مختصر المحرر للإمام أبي القاسم الرافعي رحمه الله تعالى ذي التحقيقات وهو كثير الفوائد عمدة في تحقيق المذهب معتمد للمفتي وغيره من أولى الرغبات وقد التزم مصنفه رحمه الله أن ينص على ما صححه معظم الأصحاب ووفى بما التزمه وهو من أهم أو أهم المطلوبات لكن في حجمه كبر يعجز عن حفظه أكثر أهل العصر إلا بعض أهل العنايات فرأيت اختصاره في نحو نصف حجمه ليسهل حفظه مع ما أضمه إليه إن شاء الله تعالى من النفائس المستجدات منها التنبيه على قيود في بعض المسائل هي من الأصل محذوفات ومنها مواضع يسيرة ذكرها في المحرر على خلاف المختار في المذهب كما ستراها إن شاء الله تعالى واضحات ومنها إبدال ما كان من ألفاظه غريبا أو موهما خلاف الصواب بأوضح وأخصر منه بعبارات جليات ومنها بيان القولين والوجهين والطريقين والنص ومراتب

الخلاف في جميع الحالات فحيث أقول في الأظهر أو المشهور فمن القولين أو الأقوال فإن قوى الخلاف قلت: الأظهر وإلا فالمشهور وحيث أقول الأصح أو الصحيح فمن الوجهين أو الأوجه فإن قوى الخلاف. قلت: الأصح، وإلا فالصحيح وحيث أقول المذهب فمن الطريقين أو الطرق وحيث أقول النص فهو نص الشافعي رحمه الله ويكون هناك وجه ضعيف أو قول مخرج وحيث أقول الجديد فالقديم خلافه أو القديم أو في قول قديم فالجديد خلافه وحيث أقول وقيل: كذا فهو وجه ضعيف والصحيح أو الأصح خلافه ms001 وحيث أقول وفي قول كذا فالراجح خلافه ومنها مسائل نفيسة أضمها إليه ينبغي أن لا يخلى الكتاب منها وأقول في أولها:

قلت: وفي آخرها والله أعلم وما وجدته من زيادة لفظة ونحوها على ما في المحرر فاعتمدها فلا بد منها وكذا ما وجدته من الأذكار مخالفا لما في المحرر وغيرة من كتب الفقه فاعتمده فإني حققته من كتب الحديث المعتمدة وقد أقدم بعض مسائل الفصل لمناسبة أو اختصار وربما قدمت فصلا للمناسبة وأرجو إن تم هذا المختصر أن يكون في معنى الشرح للمحرر فإني لا أحذف منه شيئا من الأحكام أصلا ولا من الخلاف ولو كان واهيا مع ما أشرت إليه من النفائس وقد شرعت في جمع جزء لطيف على صورة الشرح لدقائق هذا المختصر ومقصودي به التنبيه على الحكمة في العدول عن عبارة المحرر وفي إلحاق قيد أو حرف أو شرط للمسألة ونحو ذلك وأكثر ذلك من الضروريات التي لا بد منها وعلى الله الكريم إعتمادي وإليه تفويضي واستنادي وأسأله النفع به لي ولسائر المسلمين ورضوان عني وعن أحبائي وجميع المؤمنين.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 100;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 101, 'كتاب الطهارة', 'كتاب الطهارة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب الطهارة

قال الله تعالى: {وأنزلنا من السماء ماء طهورا} 1 يشترط لرفع الحدث والنجس ماء مطلق وهو ما يقع عليه اسم ماء بلا قيد فالمتغير بمستغنى عنه كزعفران تغيرا يمنع إطلاق اسم الماء غير طهور ولا يضر تغير لا يمنع الاسم ولا متغير بمكث وطين وطحلب وما في مقره وممره وكذا متغير بمجاور كعود ودهن أو بتراب طرح فيه في الأظهر ويكره المشمس والمستعمل في فرض الطهارة قيل: ونفلها غير طهور في الجديد فإن جمع قلتين فطهور في الأصح ولا تنجس قلتا الماء بملاقاة نجس فإن غيره فنجس فإن زال تغيره بنفسه أو بماء طهر أو بمسك وزعفران فلا وكذا تراب وخف في الأظهر ودونهما ينجس بالملاقاة فإن بلغهما بماء ولا تغير به فطهور فلو كوثر بإيراد طهور فلم يبلغهما لم يطهر وقيل: طاهر لا طهور ويستثنى ميتة لا دم لها سائل فلا تنجس ms002 مائعا على المشهور وكذا في قول نجس لا يدركه طرف.

قلت: ذا القول أظهر والله أعلم والجاري كراكد وفي القديم لا ينجس بلا تغير والقلتان خمسمائة رطل بغدادي تقريبا في الأصح والتغير المؤثر بطاهر أو نجس طعم أو لون أو ريح ولو اشتبه ماء طاهر بنجس اجتهد وتطهر بما ظن طهارته وقيل: إن قدر على طاهر بيقين فلا والأعمى كبصير في الأظهر أو ماء وبول لم يجتهد على الصحيح بل يخلطان ثم يتيمم أو ماء ورد توضأ بكل مرة وقيل: له الاجتهاد وإذا استعمل ما ظنه أراق الآخر فإن تركه وتغير ظنه لم يعمل بالثاني على النص بل يتيمم بلا إعادة في الأصح ولو أخبره بتنجسه مقبول الرواية وبين السبب أو كان فقيها موافقا اعتمده ويحل استعمال كل إناء طاهر إلا ذهبا وفضة فيحرم وكذا اتخاذه في الأصح ويحل المموه في الأصح والنفيس كياقوت في الأظهر وما ضبب بذهب أو فضة ضبة كبيرة لزينة حرم أو صغيرة بقدر الحاجة فلا أو صغيرة لزينة أو كبيرة لحاجة جاز في الأصح وضبة موضع الاستعمال كغيره في الأصح.

قلت: المذهب تحريم ضبة الذهب مطلقا والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب أسباب الحدث', 'هي أربعة: أحدها: خروج شيء من قبله أو دبره إلا المنى ولو انسد مخرجه وانفتح تحت معدته فخرج المعتاد نقض وكذا نادر كدود في الأظهر أو فوقها وهو منسد أو تحتها وهو منفتح فلا في الأظهر الثاني: زوال العقل إلا نوم ممكن مقعده الثالث: التقاء بشرتي الرجل والمرأة إلا محرما في الأظهر والملموس كلامس في الأظهر ولا تنقض صغيرة وشعر وسن وظفر في الأصح الرابع: مس قبل الآدمي ببطن الكف وكذا في الجديد حلقة دبره

إلا فرج بهيمة وينقض فرج الميت والصغير ومحل الجب والذكر الأشل وباليد الشلاء في الأصح ولا ينقض رأس الأصابع وما بينها ويحرم بالحدث الصلاة والطواف وحمل المصحف ومس ورقه وكذا جلده على الصحيح وخريطة وصندوق فيهما مصحف وما كتب لدرس قرآن كلوح في الأصح والأصح حل حمله في أمتعة ms003 وتفسير ودنانير لا قلب ورقه بعود وأن الصبي المحدث لا يمنع.

قلت: الأصح حل قلب ورقه بعود وبه قطع العراقيون والله أعلم ومن تيقن طهرا أو حدثا وشك في ضده عمل بيقينه فلو تيقنهما وجهل السابق فضد ما قبلهما في الأصح.

فصل

يقدم داخل الخلاء يساره والخارج يمينه ولا يحمل ذكر الله تعالى ويعتمد جالسا يساره ولا يستقبل القبلة ولا يستدبرها ويحرمان بالصحراء ويبعد ويستتر ولا يبول في ماء راكد وجحر ومهب ريح ومتحدث وطريق وتحت مثمرة ولا يتكلم ولا يستنجي بماء في مجلسه ويستبرىء من البول ويقول عند دخوله بسم الله اللهم إني أعوذ بك من الخبث والخبائث وعند خروجه غفرانك الحمد لله الذي أذهب عني الأذى وعافاني ويجب الاستنجاء بماء أو حجر وجمعهما أفضل وفي معنى الحجر كل جامد طاهر قالع غير محترم وجلد دبغ دون غيره في الأظهر وشرط الحجر أن لا يجف النجس ولا ينتقل ولا يطرأ أجنبي ولو ندر أو انتشر فوق العادة ولم يجاوز صفحته وحشفته جاز الحجر في الأظهر ويجب

ثلاث مسحات ولو بأطراف حجر فإن لم ينق وجب الإنقاء وسن الإيثار وكل حجر لكل محله وقيل: يوزعن لجانبيه والوسط ويسن الاستنجاء بيساره ولا استنجاء لدود وبعر بلا لوث في الأظهر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, 'باب الوضوء', 'فروضه ستة أحدها: نية رفع حدث أو استباحة مفتقر إلى طهر أو أداء فرض الوضوء ومن دام حدثه كمستحاضة كفاه نية الاستباحة دون الرفع على الصحيح فيهما ومن نوى تبردا مع نية معتبرة جاز على الصحيح أو ما يندب له وضوء كقراءة فلا في الأصح ويجب قرنها بأول الوجه وقيل: يكفي بسنة قبله وله تفريقها على أعضائه في الأصح.

الثاني: غسل وجهه وهو ما بين منابت رأسه غالبا ومنتهى لحييه وما بين أذنيه فمنه موضع الغمم وكذا التحذيف في الأصح لا النزعتان وهما بياضان يكتنفان الناصية.

قلت: صحح الجمهور أن موضع التحذيف من الرأس والله أعلم ويجب غسل كل هدب وحاجب وعذار وشارب وخد وعنفقة شعرا وبشرا وقيل: لا يجب ms004 باطن عنفقة كثيفة واللحية إن خفت كهدب وإلا فليغسل ظاهرها وفي قول لا يجب غسل خارج عن الوجه.

الثالث: غسل يديه مع مرفقيه فإن قطع بعضه وجب غسل ما بقي أو من مرفقيه فرأس عظم العضد على المشهور أو فوقه ندب باقي عضد.

الرابع: مسمى مسح لبشرة رأسه أو شعر في حده والأصل جواز غسله ووضع اليد بلا مد.

الخامس: غسل رجليه مع كعبيه.

السادس: ترتيبه هكذا فلو اغتسل محدث فالأصح أنه إن أمكن تقدير ترتيب بأن غطس ومكث صح وإلا فلا.

قلت: الأصح الصحة بلا مكث والله أعلم وسننه السواك عرضا بكل خشن لا أصبعه في الأصح ويسن للصلاة وتغير الفم ولا يكره إلا للصائم بعد الزوال والتسمية أوله فإن ترك ففي أثنائه وغسل كفيه فإن لم يتيقن طهرهما كره غمسهما في الإناء قبل غسلهما والمضمضة والاستنشاق والأظهر أن فصلهما أفضل ثم الأصح يتمضمض بغرفة ثلاثا ثم يستنشق بأخرى ثلاثا ويبالغ فيهما غير الصائم.

قلت: الأظهر تفضيل الجمع بثلاث غرف يتمضمض من كل ثم يستنشق والله أعلم وتثليث الغسل والمسح ويأخذ الشاك باليقين ومسح كل رأسه ثم أذنيه فإن عسر رفع العمامة كمل بالمسح عليها وتخليل اللحية الكثة وأصابعه وتقديم اليمنى وإطالة غرته وتحجيله والموالاة وأوجبها القديم وترك الاستعانة والنفض وكذا التنشيف في الأصح ويقول بعده: أشهد أن لا إله إلا الله وحده لا شريك له وأشهد أن محمد عبده ورسوله اللهم اجعلني من التوابين واجعلني من المتطهرين سبحانك اللهم وبحمدك أشهد أن لا إله إلا أنت أستغفرك وأتوب إليك وحذفت دعاء الأعضاء إذ لا أصل له.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, 'باب مسح الخف', 'يجوز في الوضوء للمقيم يوما وليلة وللمسافر ثلاثة بلياليها من الحدث بعد لبس فإن

مسح حضرا ثم سافر أو عكس لم يستوف مدة سفر وشرطه أن يلبس بعد كمال طهر ساترا محل فرضه طاهرا يمكن تباع المشي فيه لتردد مسافر لحاجاته قيل: وحلالا ولا يجزىء منسوج لا يمنع ماء في الأصح ولا جرموقان في الأظهر ويجوز مشقوق قدم شد ms005 في الأصح ويسن مسح أعلاه وأسفله خطوطا ويكفي مسمى مسح يحاذي الفرض إلا أسفل الرجل وعقبها فلا على المذهب.

قلت: حرفه كأسفله والله أعلم ولا مسح لشاك في بقاء المدة فإن أجنب وجب تجديد لبس ومن نزع وهو بطهر المسح غسل قدميه وفي قول يتوضأ.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, 'باب الغسل', 'موجبه موت وحيض ونفاس وكذا ولادة بلا بلل في الأصح وجنابة بدخول حشفة أو قدرها فرجا وبخروج منى من طريقه المعتاد وغيره ويعرف بتدفقه أو لذة بخروجه أو ريح عجين رطبا أو بياض بيض جافا فإن فقدت الصفات فلا غسل والمرأة كرجل ويحرم بها ما حرم بالحدث والمكث بالمسجد لا عبوره والقرآن وتحل أذكاره لا بقصد قرآن وأقله نية رفع جنابة أو استباحة مفتقر إليه أو أداء فرض الغسل مقرونة بأول فرض وتعميم شعره وبشره ولا تجب مضمضة واستنشاق وأكمله إزالة القذر ثم الوضوء وفي قول يؤخر غسل قدميه،

ثم تعهد معاطفه ثم يفيض الماء على رأسه ويخلله ثم شقه الأيمن ثم الأيسر ويدلك ويثلث وتتبع لحيض أثره مسكا وإلا فنحوه ولا يسن تجديده بخلاف الوضوء ويسن أن لا ينقص ماء الوضوء عن مد والغسل عن صاع ولا حد له ومن به نجس يغسله ثم يغتسل ولا تكفي لهما غسلة وكذا في الوضوء.

قلت: الأصح تكفيه والله أعلم ومن اغتسل لجنابة وجمعة حصلا أو لأحدهما حصل فقط قلت: ولو أحدث ثم أجنب أو عكسه كفى الغسل على المذهب والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, 'باب النجاسة', 'هي كل مسكر مائع وكلب وخنزير وفرعهما وميتة غير الآدمي والسمك والجراد ودم وقيح قيء وروث وبول ومذي وودي وكذا منى غير الآدمي في الأصح.

قلت: الأصح طهارة منى غير الكلب والخنزير وفرع أحدهما والله أعلم ولبن ما لا يؤكل غير الآدمي والجزء المنفصل من الحي كميتته إلا شعر المأكول فطاهر وليست العقلة والمضغة ورطوبة الفرج بنجس في الأصح ولا يطهر نجس العين إلا خمر تخللت وكذا إن نقلت من شمس إلى ظل وعكسه في الأصح فإن خللت بطرح شيء فلا ms006 وجلد نجس بالموت فيطهر بدبغه ظاهره وكذا باطنه على المشهور والدبغ نزع فضوله بحريف لا شمس وتراب ولا يجب الماء في أثنائه في الأصح والمدبوغ كثوب نجس وما نجس بملاقاة شيء من كلب غسل سبعا إحداها بتراب والأظهر تعين التراب وأن الخنزير

ككلب ولا يكفي تراب نجس ولا ممزوج بمائع في الأصح وما نجس ببول صبي لم يطعم غير لبن نضح وما نجس بغيرهما إن لم تكن عين كفى جرى الماء وإن كانت وجب إزالة الطعم ولا يضر بقاء لون أو ريح عسر زواله وفي الريح قول.

قلت: فإن بقيا معا ضرا على الصحيح والله أعلم ويشترط ورود الماء لا العصر في الأصح والأظهر طهارة غسالة تنفصل بلا تغير وقد طهر المحل ولو نجس مائع تعذر تطهيره وقيل: يطهر الدهن بغسله.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, 'باب التيمم', 'يتيمم المحدث والجنب لأسباب أحدها: فقد الماء فإن تيقن المسافر فقده تيمم بلا طلب وإن توهمه طلبه من رحله ورفقته ونظر حواليه إن كان بمستو فإن احتاج إلى تردد تردد قدر نظره فإن لم يجد تيمم فلو مكث موضعه فالأصح وجوب الطلب لما يطرأ فلو علم ماء يصله المسافر لحاجته وجب قصده إن لم يخف ضرر نفس أو مال فإن كان فوق ذلك تيمم ولو تيقنه آخر الوقت فانتظاره أفضل أو ظنه فتعجيل التيمم أفضل في الأظهر ولو وجد ماء لا يكفيه فالأظهر وجوب استعماله ويكون قبل التيمم ويجب شراؤه بثمن مثله إلا أن يحتاج إليه لدين مستغرق أو مؤنة سفره أو نفقة حيوان محترم ولو وهب له ماء أو أعير دلوا وجب القبول في الأصح ولو وهب ثمنه فلا ولو نسيه في رحله أو أضله فيه فلم يجده بعد الطلب فتيمم قضى في الأظهر ولو أضل رحله في رحال فلا يقضي.

الثاني: أن يحتاج إليه لعطش محترم ولو مآلا.

الثالث: مرض يخاف معه من استعماله على منفعة عضو وكذا بطء البرء أو الشين الفاحش في عضو ظاهر في الأظهر وشدة البرد كمرض وإذا امتنع استعماله في ms007 عضو إن لم يكن عليه ساتر وجب التيمم وكذا غسل الصحيح على المذهب ولا ترتيب بينهما للجنب فإن كان محدثا فالأصح اشتراط التيمم وقت غسل العليل فإن جرح عضواه فتيممان وإن كان كجبيرة لا يمكن نزعها غسل الصحيح وتيمم كما سبق ويجب مع ذلك مسح كل جبيرته بماء وقيل: بعضها فإذا تيمم لفرض ثان ولم يحدث لم يعد الجنب غسلا ويعيد المحدث ما بعد عليله وقيل: يستأنفان وقيل: المحدث كجنب قلت: هذا الثالث: أصح والله أعلم.

فصل

يتيمم بكل تراب طاهر حتى ما يداوى به وبرمل فيه غبار لاما بمعدن وسحاقة خزف ومختلط بدقيق ونحوه وقيل: إن قل الخليط جاز ولا بمستعمل على الصحيح وهو ما بقي بعضوه وكذا ما تناثر في الأصح ويشترط فصده فلو سفته ريح عليه فردده ونوى لم يجزىء ولو يمم بإذنه جاز وقيل: يشترط عذر.

وأركانه: نقل التراب فلو نقل من وجه إلى يد أو عكس كفى في الأصح ونية استباحة الصلاة لا رفع الحدث ولو نوى فرض التيمم لم يكف في الأصح ويجب قرنها بالنقل وكذا استدامتها إلى مسح شيء من الوجه على الصحيح فإن نوى فرضا ونفلا أبيحا أو فرضا فله النفل على المذهب أو نفلا أو الصلاة تنفل لا الفرض على المذهب ومسح وجهه ثم يديه

مع مرفقيه ولا يجب إيصاله منبت الشعر الخفيف ولا ترتيب في نقله في الأصح فلو ضرب بيديه ومسح بيمينه وجهه وبيساره يمينه جاز وتندب التسمية ومسح وجهه ويديه بضربتين

قلت: الأصح المنصوص وجوب ضربتين وإن أمكن بضربة بخرقة ونحوها والله أعلم ويقدم يمينه وأعلى وجهه ويخفف الغبار وموالاة التيمم كالوضوء.

قلت: وكذا الغسل ويندب تفريق أصابعه أولا ويجب نزع خاتمه في الثانية والله أعلم ومن تيمم لفقد ماء فوجده إن لم يكن في صلاة بطل إن لم يقترن بمانع كعطش أو في صلاة لا تسقط به بطلت على المشهور وإن أسقطها فلا وقيل: يبطل النفل والأصح أن قطعها ليتوضأ أفضل وأن المتنفل لا يجاوز ركعتين إلا ms008 من نوى عددا فيتمه ولا يصلي بتيمم غير فرض ويتنفل ما شاء والنذر كفرض في الأظهر والأصح صحة جنائز مع فرض وأن من نسي إحدى الخمس كفاه تيمم لهن وإن نسي مختلفتين صلى كل صلاة بتيمم وإن شاء تيمم مرتين وصلى بالأول أربعا ولاء وبالثاني أربعا ليس منها التي بدأ بها أو متفقتين صلى الخمس مرتين بتيممين ولا يتيمم لفرض قبل وقت فعله وكذا النفل المؤقت في الأصح ومن لم يجد ماء ولا ترابا لزمه في الجديد أن يصلي الفرض ويعيد ويقضي المقيم المتيمم لفقد الماء لا المسافر إلا العاصي بسفره في الأصح ومن تيمم لبرد قضى في الأظهر أو لمرض يمنع الماء مطلقا أو في عضو ولا ساتر فلا إلا أن يكون بجرحه دم كثير وإن كان ساتر لم يقض في الأظهر إن وضع على طهر فإن وضع على حدث وجب نزعه فإن تعذر قضى على المشهور.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, 'باب الحيض', 'أقل سنه تسع سنين وأقله يوم وليلة وأكثره خمسة عشر بلياليها وأقل طهر بين الحيضتين خمسة عشر ولا حد لأكثره ويحرم به ما حرم بالجنابة وعبور المسجد إن خافت تلويثه والصوم ويجب قضاؤه بخلاف الصلاة وما بين سرتها وركبتها وقيل: لا يحرم غير الوطء فإذا انقطع لم يحل قبل الغسل غير الصوم والطلاق والاستحاضة حدث دائم كالسلس فلا تمنع الصوم والصلاة فتغسل المستحاضة فرجها وتعصبه وتتوضأ وقت الصلاة وتبادر بها فلو أخرت لمصلحة الصلاة كستر وانتظار جماعة لم يضر وإلا فيضر على الصحيح ويجب الوضوء لكل فرض وكذا تجديد العصابة في الأصح ولو انقطع دمها بعد الوضوء ولم تعتد انقطاعه وعوده أو اعتادت ووسع زمن الإنقطاع وضوء الصلاة وجب الوضوء.

فصل

رأت لسن الحيض أقله ولم يعبر أكثره فكله حيض والصفرة والكدرة حيض في الأصح فإن عبره فإن كانت مبتدأة مميزة بأن ترى قويا وضعيفا فالضعيف استحاضة والقوي حيض إن لم ينقص عن أقله ولا عبر أكثره ولا نقص الضعيف عن أقل الطهر أو مبتدأة لا مميزة بأن رأته بصفة ms009 أو فقدت شرط تمييز فالأظهر أن حيضها يوم وليلة

وطهرها تسع وعشرون أو معتادة بأن سبق لها حيض وطهر فترد إليهما قدرا ووقتا وتثبت بمرة في الأصح ويحكم للمعتادة المميزة بالتمييز لا العادة في الأصح أو متحيرة بأن نسيت عادتها قدرا ووقتا ففي قول كمبتدأة والمشهور وجوب الاحتياط فيحرم الوطء ومس المصحف والقراءة في غير الصلاة وتصلي الفرائض أبدا وكذا النفل في الأصح وتغتسل لكل فرض وتصوم رمضان ثم شهرا كاملين فيحصل من كل أربعة عشر ثم تصوم من ثمانية عشر ثلاثة أولها وثلاثة آخرها فيحصل اليومان الباقيان ويمكن قضاء يوم بصوم يوم ثم الثالث: والسابع عشر وإن حفظت شيئا فلليقين حكمه وهي في المحتمل كحائض في الوطء وطاهر في العبادة وإن احتمل انقطاعا وجب الغسل لكل فرض والأظهر أن دم الحامل والنقاء بين أقل الحيض حيض وأقل النفاس لحظة وأكثره ستون وغالبه أربعون ويحرم به ما حرم بالحيض وعبوره ستين كعبوره أكثره.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 101;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 102, 'كتاب الصلاة', 'كتاب الصلاة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب الصلاة

المكتوبات خمس الظهر وأول وقته زوال الشمس وآخره مصير ظل الشيء مثله سوى ظل استواء الشمس وهو أول وقت العصر ويبقى حتى تغرب والاختيار أن لا تؤخر عن مصير الظل مثلين والمغرب بالغروب ويبقى حتى يغيب الشفق الأحمر في القديم وفي الجديد ينقضي بمضي قدر وضوء وستر عورة وأذان وإقامة وخمس ركعات ولو شرع في الوقت ومد حتى غاب الشفق الأحمر جاز على الصحيح.

قلت: القديم أظهر والله أعلم والعشاء بمغيب الشفق ويبقى إلى الفجر والاختيار أن لا تؤخر عن ثلث الليل وفي قول نصفه والصبح بالفجر الصادق وهو المنتشر ضوؤه معترضا بالأفق ويبقى حتى تطلع الشمس والاختيار أن لا تؤخر عن الإسفار.

قلت: يكره تسمية المغرب عشاء والعشاء عتمة والنوم قبلها والحديث بعدها إلا في خير والله أعلم ويسن تعجيل الصلاة لأول الوقت وفي قول تأخير العشاء أفضل ويسن الإبراد بالظهر في شدة الحر والأصح اختصاصه ببلد حار وجماعة مسجد يقصدونه من بعد ومن وقع بعض صلاته في الوقت فالأصح أنه ms010 إن وقع ركعة فالجميع أداء وإلا فقضاء ومن جهل الوقت اجتهد بورد ونحوه فإن تيقن صلاته قبل الوقت قضى

في الأظهر وإلا فلا ويبادر بالفائت ويسن ترتيبه وتقديمه على الحاضرة التي لا يخاف فوتها وتكره الصلاة عند الاستواء إلا يوم الجمعة وبعد الصبح حتى ترتفع الشمس كرمح والعصر حتى تغرب إلا لسبب كفائته وكسوف وتحية وسجدة شكر وإلا في حرم مكة على الصحيح.

فصل

إنما تجب الصلاة على كل مسلم بالغ عاقل طاهر ولا قضاء على كافر إلا المرتد ولا الصبي ويؤمر بها لسبع ويضرب عليها لعشر ولا ذي حيض أو جنون أو إغماء بخلاف السكر ولو زالت هذه الأسباب وبقي من الوقت تكبيرة وجبت الصلاة وفي قول يشترط ركعة والأظهر وجوب الظهر بإدراك تكبيرة آخر العصر والمغرب آخر العشاء ولو بلغ فيها أتمها وأجزأته على الصحيح أو بعدها فلا إعادة على الصحيح ولو حاضت أو جن أول الوقت وجبت تلك إن أدرك قدر الفرض وإلا فلا.

فصل

الأذان والإقامة سنة وقيل فرض كفاية وإنما يشرعان لمكتوبة ويقال في العيد

ونحوه الصلاة جامعة والجديد ندبه للمنفرد ويرفع صوته لا بمسجد وقعت فيه جماعة ويقيم للفائتة ولا يؤذن في الجديد.

قلت: القديم أظهر والله أعلم فإن كان فوائت لم يؤذن لغير الأولى ويندب لجماعة النساء الإقامة لا الأذان على المشهور والأذان مثنى والإقامة فرادى إلا لفظ الإقامة ويسن إدراجها وترتيله والترجيع فيه والتثويب في الصبح وأن يؤذن قائما للقبلة ويشترط ترتيبه وموالاته وفي قول لا يضر كلام وسكوت طويلان وشرط المؤذن الإسلام والتمييز والذكورة ويكره للمحدث وللجنب أشد والإقامة أغلظ ويسن صيت حسن الصوت عدل والإمامة أفضل منه في الأصح.

قلت: الأصح انه أفضل منها والله أعلم وشرطه الوقت إلا الصبح فمن نصف الليل ويسن مؤذنان للمسجد يؤذن واحد قبل الفجر وآخر بعده ويسن لسامعه مثل قوله لا في حيعلاته فيقول لا حول ولا قوة إلا بالله.

قلت: وإلا في التثويب فيقول صدقت وبررت والله أعلم ولكل أن يصلي على النبي ms011 صلى الله عليه وسلم بعد فراغه ثم اللهم رب هذه الدعوة التامة والصلاة القائمة آت محمدا الوسيلة والفضيلة وابعثه مقاما محمودا الذي وعدته.

فصل

استقبال القبلة شرط لصلاة القادر إلا في شدة الخوف ونفل السفر فللمسافر التنفل راكبا وماشيا ولا يشترط طول سفره على المشهور فإن أمكن استقبال الراكب في مرقد وإتمام ركوعه وسجوده لزمه وإلا فالأصح أنه إن سهل الاستقبال وجب وإلا فلا ويختص بالتحرم وقيل: يشترط في السلام أيضا ويحرم انحرافه عن طريقه إلا إلى القبلة ويوميء بركوعه وسجوده أخفض والأظهر أن الماشي يتم ركوعه وسجوده ويستقبل فيهما وفي إحرامه ولا يمشي إلا في قيامه وتشهده ولو صلى فرضا على دابة واستقبل وأتم ركوعه وسجوده وهي واقفة جاز أو سائرة فلا ومن صلى في الكعبة واستقبل جدارها أو بابها مردودا أو مفتوحا مع ارتفاع عتبته ثلثي ذراع أو على سطحها مستقبلا من بنائها ما سبق جاز ومن أمكنه علم القبلة حرم عليه التقليد والاجتهاد وإلا أخذ بقول ثقة يخبر عن علم فإن فقد وأمكن الاجتهاد حرم التقليد فإن تحير لم يقلد في الأظهر وصلى كيف كان ويقضي ويجب تجديد الاجتهاد لكل صلاة تحضر على الصحيح ومن عجز عن الاجتهاد وتعلم كأدلة لأعمى قلد ثقة عارفا وإن قدر فالأصح وجوب التعلم فيحرم التقليد ومن صلى بالاجتهاد فتيقن الخطأ قصى في الأظهر فلو تيقنه فيها وجب استثنافها وإن تغير اجتهاده عمل بالثاني ولا قضاء حتى لو صلى أربع ركعات لأربع جهات بالاجتهاد فلا قضاء.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب صفة الصلاة', 'أركانها ثلاثة عشر: النية: فإن صلى فرضا وجب قصد فعله وتعيينه والأصح وجوب نية الفرضية دون الإضافة إلى الله تعالى وأنه يصح الأداء بنية القضاء وعكسه والنفل ذو الوقت أو السبب كالفرض فيما سبق وفي نية النفلية وجهان:

قلت: الصحيح لا تشترط نية النفلية والله أعلم ويكفي في النفل المطلق نية فعل الصلاة والنية بالقلب ويندب النطق قبل التكبير.

الثاني: تكبيرة الإحرام ويتعين على القادر الله أكبر ولا تضر زيادة لا تمنع الاسم ms012 كالله الأكبر وكذا الله الجليل أكبر في الأصح لا أكبر الله على الصحيح ومن عجز ترجم ووجب التعلم إن قدر ويسن رفع يديه في تكبيره حذو منكبيه والأصح رفعه مع ابتدائه ويجب قرن النية بالتكبيرة وقيل: يكفي بأوله.

الثالث: القيام في فرض القادر وشرطه نصب فقاره فإن وقف منحنيا أو مائلا بحيث لا يسمى قائما لم يصح فإن لم يطق انتصابا وصار كراكع فالصحيح أنه يقف كذلك ويزيد انحناءه لركوعه إن قدر ولو أمكنه القيام دون الركوع والسجود قام وفعلهما بقدر إمكانه ولو عجز عن القيام قعد كيف شاء وافتراشه أفضل من تربعه في الأظهر ويكره الإقعاء بأن يجلس على وركيه ناصبا ركبتيه ثم ينحني لركوعه بحيث تحاذي جبهته ما قدام ركبته والأكمل أن يحاذي موضع سجوده فإن عجز عن القعود صلى لجنبه الأيمن فإن عجز فمستلقيا وللقادر التنفل قاعدا وكذا مضطجعا في الأصح.

الرابع: القراءة ويسن بعد التحرم دعاء الافتتاح ثم التعوذ ويسرهما ويتعوذ في كل ركعة على المذهب والأولى آكد وتتعين الفاتحة كل ركعة لا ركعة مسبوق والبسملة منها وتشديداتها ولو أبدل ضادا بظاء لم تصح في الأصح ويجب ترتيبها وموالاتها فإن تخلل ذكر قطع الموالاة فإن تعلق بالصلاة كتأمينه لقراءة إمامه وفتحه عليه فلا في الأصح ويقطع السكوت الطويل وكذا يسير قصد به قطع القراءة في الأصح فإن جهل الفاتحة فسبع آيات متوالية فإن عجز فمتفرقة.

قلت: الأصح المنصوص جواز المتفرقة مع حفظه متوالية والله أعلم فإن عجز أتى بذكر ولا يجوز نقص حروف البدل عن الفاتحة في الأصح فإن لم يحسن شيئا وقف قدر الفاتحة ويسن عقب الفاتحة آمين خفيفة الميم بالمد ويجوز القصر ويؤمن مع تأمين إمامه ويجهر به في الأظهر وتسن سورة بعد الفاتحة إلا في الثالثة والرابعة في الأظهر.

قلت: فإن سبق بهما قرأها فيهما على النص والله أعلم ولا سورة للمأموم بل يستمع فإن بعد أو كانت سرية قرأ في الأصح ويسن للصبح والظهر طوال المفصل وللعصر والعشاء أوساطه وللمغرب قصاره ولصبح ms013 الجمعة في الأولى {ألم تنزيل} وفي الثانية {هل أتى}

الخامس: الركوع وأقله أن ينحني قدر بلوغ راحتيه ركبتيه بطمأنينة بحيث ينفصل رفعه عن هويه ولا يقصد به غيره فلو هوى لتلاوة فجعله ركوعا لم يكف وأكمله تسوية ظهره وعنقه ونصب ساقيه وأخذ ركبتيه بيديه وتفرقة أصابعه للقبلة ويكبر في ابتداء

هويه ويرفع يديه كإحرامه ويقول سبحان ربي العظيم ثلاثا ولا يزيد الإمام ويزيد المنفرد اللهم لك ركعت وبك آمنت ولك أسلمت خشع لك سمعي وبصري ومخي وعظمي وعصبي وما استقلت: به قدمي.

السادس: الاعتدال قائما مطمئنا ولا يقصد غيره فلو رفع فزعا من شيء لم يكف ويسن رفع يديه مع ابتداء رفع رأسه قائلا سمع الله لمن حمده فإذا انتصب قال ربنا لك الحمد ملء السموات وملء الأرض وملء ما شئت من شيء بعد ويزيد المنفرد أهل الثناء والمجد أحق ما قال العبد وكلنا لك عبد لا مانع لما أعطيت ولا معطي لما منعت ولا ينفع ذا الجد منك الجد ويسن القنوت في اعتدال ثانية الصبح وهو اللهم اهدني فيمن هديت إلى آخره والإمام بلفظ الجمع والصحيح سن الصلاة على رسول الله صلى الله عليه وسلم في آخره ورفع يديه ولا يمسح وجهه وأن الإمام يجهر به وأنه يؤمن المأموم للدعاء ويقول الثناء فإن لم يسمعه قنت ويشرع القنوت في سائر المكتوبات للنازلة لا مطلقا على المشهور.

السابع: السجود وأقله مباشرة بعض جبهته مصلاه فإن سجد على متصل به جاز إن لم يتحرك بحركته ولا يجب وضع يديه وركبتيه وقدميه في الأظهر.

قلت: الأظهر وجوبه والله أعلم ويجب أن يطمئن وينال مسجده ثقل رأسه وأن لا يهوى لغيره فلو سقط لوجهه وجب العود إلى الاعتدال وأن ترتفع أسافله على أعاليه في الأصح وأكمله يكبر لهويه بلا رفع ويضع ركبتيه ثم يديه ثم جبهته وأنفه ويقول: سبحان

ربي الأعلى ثلاثا ويزيد المنفرد اللهم لك سجدت وبك آمنت ولك أسلمت سجد وجهي للذي خلقه وصوره وشق سمعه وبصره تبارك الله أحسن الخالقين ms014 ويضع يديه حذو منكبيه وينشر أصابعه مضمومة للقبلة ويفرق ركبتيه ويرفع بطنه عن فخذيه ومرفقيه عن جنبيه في ركوعه وسجوده وتضم المرأة والخنثى.

الثامن: الجلوس بين سجدتيه مطمئنا ويجب أن لا يقصد برفعه غيره وأن لا يطوله ولا لاعتدال وأكمله يكبر ويجلس مفترشا واضعا يديه قريبا من ركبتيه وينشر أصابعه قائلا رب اغفر لي وارحمني واجبرني وارفعني وارزقني واهدني وعافني ثم يسجد الثانية كالأولى والمشهور من جلسة خفيفة بعد السجدة الثانية في كل ركعة يقوم عنها.

التاسع والعاشر والحادي عشر: التشهد وقعوده والصلاة على النبي صلى الله عليه وسلم فالتشهد وقعوده إن عقبهما سلام ركنان وإلا فسنتان وكيف قعد جاز ويسن في الأول افتراش فيجلس على كعب يسراه وينصب يمناه ويضع أطراف أصابعه للقبلة وفي الآخر التورك وهو كالافتراش لكن يخرج يسراه من جهة يمينه ويلصق وركه بالأرض والأصح يفترش المسبوق والساهي ويضع فيهما يسراه على طرف ركبتيه منشورة الأصابع بلا ضم.

قلت: الأصح الضم والله أعلم ويقبض من يمناه الخنصر والبنصر وكذا الوسطى في الأظهر ويرسل المسبحة ويرفعها عند قوله إلا الله ولا يحركها والأظهر ضم الإبهام

إليها كعاقد ثلاثة وخمسين والصلاة على النبي صلى الله عليه وسلم فرض في التشهد الأخير والأظهر سنها في الأول ولا تسن على الآل في الأول على الصحيح وتسن في الآخرة وقيل: تجب وأكمل التشهد مشهور وأقله التحيات لله سلام عليك أيها النبي ورحمة الله وبركاته سلام علينا وعلى عباد الله الصالحين أشهد أن لا إله إلا الله وأشهد أن محمدا رسول الله وقيل: يحذف وبركاته والصالحين ويقول: وأن محمدا رسوله.

قلت: الأصح وأن محمدا رسول الله وثبت في صحيح مسلم والله أعلم وأقل الصلاة على النبي صلى الله عليه وسلم وآله اللهم صل على محمد وآله والزيادة إلى حميد مجيد سنة في الآخر وكذا الدعاء بعده ومأثوره أفضل ومنه اللهم اغفر لي ما قدمت وما أخرت الخ ويسن أن لا يزيد على قدر التشهد والصلاة على النبي صلى الله عليه وسلم ومن ms015 عجز عنهما ترجم ويترجم للدعاء والذكر المندوب العاجز لا القادر في الأصح.

الثاني عشر: السلام وأقله السلام عليكم والأصح جواز سلام عليكم قلت: الأصح المنصوص لا يجزئه والله أعلم وأنه لا تجب نية الخروج وأكمله السلام عليكم ورحمة الله مرتين يمينا وشمالا ملتفتا في الأولى حتى يرى خده الأيمن وفي الثانية الأيسر ناويا السلام على من عن يمينه ويساره من ملائكة وإنس وجن وينوي الإمام السلام على المقتدين وهم الرد عليه.

الثالث عشر: ترتيب الأركان كما ذكرنا فإن تركه عمدا بأن سجد قبل ركوعه بطلت صلاته وإن سها فما بعد المتروك لغو فإن تذكر قبل بلوغ مثله فعله وإلا تمت به ركعته

وتدارك الباقي فلو تيقن في آخر صلاته ترك سجدة من الأخيرة سجدها وأعاد تشهده أو من غيرها لزمه ركعة وكذا إن شك فيهما وإن علم في قيام ثانية ترك سجدة فإن كان جلس بعد سجدته سجد وقيل: إن جلس بنية الاستراحة لم يكفه وإلا فليجلس مطمئنا ثم يسجد قيل: يسجد فقط وإن علم في آخر رباعية ترك سجدتين أو ثلاث جهل موضعها وجب ركعتان أو أربع فسجدة ثم ركعتان أو خمس أو ست فثلاث أو سبع فسجدة ثم ثلاث.

قلت: يسن إدامة نظره إلى موضع سجوده وقيل: يكره تغميض عينيه وعندي لا يكره إن لم يخف ضررا والخشوع وتدبر القرآن والذكر ودخول الصلاة بنشاط وفرغ قلب وجعل يديه تحت صدره آخذا بيمينه يساره والدعاء في سجوده وإن يعتمد في قيامه من السجود والقعود على يديه وتطويل قراءة الأولى على الثاينة في الأصح والذكر بعدها وأن ينتقل للنفل من موضع فرضه وأفضله إلى بيته وإذا صلى وراءهم نساء مكثوا حتى ينصرفن وأن ينصرف في جهة حاجته وإلا فيمينه وتنقضي القدوة بسلام الإمام فللمأموم أن يشتغل بدعاء ونحوه ثم يسلم ولو اقتصر إمامه على تسليمة سلم ثنتين. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, 'باب شروط الصلاة', 'خمسة

معرفة الوقت والاستقبال وستر العورة وعورة الرجل ما بين سرته وركبته وكذا الأمة في الأصح والحرة ما ms016 سوى الوجه والكفين وشرطه ما منع إدراك لون

البشرة ولو بطين وماء كدر والأصح وجوب التطين على فاقد الثوب ويجب ستر أعلاه وجوانبه لا أسفله فلو رؤيت عورته من جيبه في ركوع أو غيره لم يكف فليزره أو يشد وسطه وله ستر بعضها بيده في الأصح فإن وجد كان في سوأتيه تعين لهما أو إحداهما فقبله وقيل: دبره وقيل: يتخير وطهارة الحدث فإن سبقه بطلت وفي القديم يبني ويجربان في كل مناقض عرض بلا تقصير وتعذر دفعه في الحال فإن أمكن بأن كشفته ريح فستر في الحال لم تبطل وإن قصر بأن فرغت مدة خف فيها بطلت وطهارة النجس في الثوب والبدن والمكان ولو اشتبه طاهر ونجس اجتهد ولو نجس بعض ثوب أو بدن وجهل وجب غسل كله فلو ظن طرفا لم يكف غسله على الصحيح ولو غسل نصف نجس ثم باقيه فالأصح أنه إن غسل مع باقيه مجاوره طهر كله وإلا فغير المتنصف ولا تصح صلاة ملاق بعض لباسه نجاسة وإن لم يتحرك بحركته ولا قابض طرف شيء على نجس إن تحرك وكذا إن لم يتحرك في الأصح فلو جعله تحت رجله صحت مطلقا ولا يضر نجس يحاذي صدره في الركوع والسجود على الصحيح ولو وصل عظمه بنجس لفقد الطاهر فمعذور وإلا وجب نزعه إن لم يخف ضررا ظاهرا قيل: وإن خاف فإن مات لم ينزع على الصحيح ويعفى عن محل استجماره ولو حمل مستجمر أبطلت في الأصح وطين الشارع المتيقن نجاسته يعفى عنه عما يتعذر الاحتراز منه غالبا ويختلف بالوقت وموضعه من الثوب والبدن وعن قليل دم البراغيث وونيم الذباب والأصح لا يعفي عن كثيره ولا قليل انتشر بعرق وتعرف الكثرة بالعادة.

قلت: الأصح عند المحققين العفو مطلقا والله أعلم ودم البثرات كالبراغيث وقيل: إن عصره فلاو الدماميل والقروح وموضع الفصد والحجامة قيل: كالبثرات

والأصح إن كان مثله يدوم غالبا فكالإستحاضة وإلا فكدم الأجنبي فلا يعفى وقيل: يعفى عن قليله.

قلت: الأصح أنها كالبثرات والأظهر العفو عن قليل ms017 دم الأجنبي والله أعلم والقيح والصديد كالدم وكذا ماء القروح والمتنفط الذي له ريح كذا بلا ريح في الأظهر.

قلت: المذهب طهارته والله أعلم ولو صلى بنجس لم يعلمه وجب القضاء في الجديد وإن على ثم نسي وجب القضاء على المذهب.

فصل

تبطل بالنطق بحرفين أو حرف مفهم وكذا مدة بعد حرف في الأصح والأصح أن التنحنح والضحك والبكاء والأنين والنفخ إن ظهر به حرفان بطلت وإلا فلا ويعذر في يسير الكلام إن سبق لسانه أو نسي الصلاة أو جهل تحريمه إن قرب عهده بالإسلام لا كثيره في الأصح وفي التنحنح ونحوه للغلبة وتعذر القراءة لا الجهر في الأصح ولو أكره على الكلام بطلت في الأظهر ولو نطق بنظم القرآن بقصد التفهيم كيا يحيى خذ الكتاب إن قصد معه قراءة لم تبطل وإلا بطلت ولا تبطل بالذكر والدعاء إلا أن يخاطب كقوله لعطاس يرحمك الله ولو سكت طويلا بلا غرض لم تبطل في الأصح ويسن لمن نابه شيء كتنبيه إمامه وإذنه لداخل وإنذاره أعمى أن يسبح وتصفق المرأة بضرب اليمين على ظهر اليسار ولو فعل في صلاته غيرها إن كان من جنسها بطلت إلا أن ينسى وإلا فتبطل بكثيره لا قليله والكثرة بالعرف فالخطوتان أو الضربتان قليل والثلاث كثير إن توالت وتبطل بالوثبة الفاحشة لا الحركات الخفيفة المتوالية كتحريك أصابعه في سبحة أو حك في الأصح وسهو الفعل الكثير كعمده في الأصح وتبطل بقليل الأكل قلت: إلا أن يكون ناسيا أو جاهلا تحريمه والله أعلم فلو كان بفمه سكرة فبلغ ذوبها بطلت في الأصح ويسن للمصلي إلى جدار أو

سارية أو عصا مغروزة أو بسط مصلى أو خط قبالته دفع المار والصحيح تحريم المرور حينئذ قلت: يكره الالتفات إلا لحاجة ورفع بصره إلى السماء وكف شعره أو ثوبه ووضع يده على فمه بلا حاجة والقيام على رجل والصلاة حاقنا أو حاقبا أو بحضرة طعام يتوق إليه وأن يبصق قبل وجهه أو عن يمينه ووضع يده على خاصرته والمبالغة في خفض ms018 الرأس في ركوعه والصلاة في الحمام والطريق والمزبلة والكنيسة وعطن الإبل والمقبرة الطاهرة. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, 'باب سجود السهو', 'سنة عند ترك مأمور به أو فعل منهي عنه فالأول: إن كان ركنا وجب تداركه وقد يشرع السجود لزيادة حصلت بتدارك ركن كما سبق في الترتيب أو بعضا وهو القنوت أو قيامه أو التشهد الأول أو قعوده وكذا الصلاة على النبي صلى الله عليه وسلم فيه في الأظهر سجد وقيل: إن ترك عمدا فلا.

قلت: وكذا الصلاة على الآل حيث سنناها والله أعلم ولا تجبر سائر السنن والثاني: إن لم يبطل عمده كالالتفات والخطوتين لم يسجد لسهوه وإلا سجد إن لم تبطل بسهوه ككلام كثير في الأصح وتطويل الركن القصير يبطل عمده في الأصح فيسجد لسهوه فالاعتدال قصير وكذا الجلوس بين السجدتين في الأصح ولو نقل ركنا قوليا كفاتحة في ركوع أو تشهد لم تبطل بعمده في الأصح ويسجد لسهوه في الأصح وعلى هذا تستثنى هذه الصورة من قولنا ما لا يبطل عمده لا سجود لسهوه ولو نسي التشهد الأول فذكره بعد

انتصابه لم يعد له فإن عاد عالما بتحريمه بطلت أو ناسيا فلا ويسجد للسهو أو جاهلا فكذا في الأصح وللمأموم العود لمتابعة إمامه في الأصح.

قلت: الأصح وجوبه والله أعلم ولو تذكر قبل انتصابه عاد للتشهد ويسجد إن كان صار إلى القيام أقرب ولو نهض عمدا فعاد بطلت إن كان إلى القيام أقرب ولو نسي قنوتا فذكره في سجوده لم يعد له أو قبله عاد ويسجد للسهو إن بلغ حد الراكع ولو شك في ترك بعض سجد أو ارتكاب نهي فلا ولو سها وشك هل سجد فيسجد ولو شك أصلى ثلاثا أم أربعا أتى بركعة وسجد والأصح أنه يسجد وإن زال شكه قبل سلامه وكذا حكم ما يصليه مترددا واحتمل كونه زائدا ولا يسجد لما يجب بكل حال إذا زال شكه مثاله شك في الثالثة: أثالثة هي أم رابعة فتذكر فيها لم يسجد أو في الرابعة: سجد ولو شك بعد ms019 السلام في ترك فرض لم يؤثر على المشهور وسهوه حال قدوته يحمله إمامه فلو ظن سلامه فسلم فبان خلافه سلم معه ولا سجود ولو ذكر في تشهده ترك ركن غير النية والتكبير قام بعد سلام إمامه إلى ركعته ولا يسجد وسهوه بعد سلامه لا يحمله فلو سلم المسبوق بسلام إمامه بنى وسجد ويلحقه سهو إمامه فإن سجد لزمه متابعته وإلا فيسجد على النص ولو اقتدى مسبوق بمن سها بعد اقتدائه وكذا قبله في الأصح فالصحيح أنه يسجد معه ثم في آخر صلاته فإن لم يسجد الإمام سجد آخر صلاة نفسه على النص وسجود السهو وإن كثر سجدتان كسجود الصلاة والجديد أن محله بين تشهده وسلامه فإن سلم عمدا فات في الأصح أو سهوا وطال الفصل فات في الجديد وإلا فلا على النص وإذا سجد صار عائدا إلى الصلاة في الأصح ولو سها إمام الجمعة وسجدوا فبان فوتها أتموا ظهرا وسجدوا ولو ظن سهوا فسجد فبان عدمه سجد في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, 'باب تسن سجدات التلاوة', 'وهن في الجديد أربع عشرة منها سجدتا الحج لا ص بل هي سجدة شكر تستحب في غير الصلاة وتحرم فيها على الأصح وتسن للقارىء والمستمع وتتأكد بسجود القارىء.

قلت: وتسن للسامع والله أعلم وإن قرأ في الصلاة سجد الإمام والمنفرد لقراءته فقط والمأموم لسجدة إمامه فإن سجد إمامه فتخلف أو انعكس بطلت صلاته ومن سجد خارج الصلاة نوى وكبر للإحرام رافعا يديه ثم للهوى بلا رفع وسجد كسجدة الصلاة ورفع مكبرا وسلم وتكبيرة الإحرام شرط على الصحيح وكذا السلام في الأظهر وتشترط شروط الصلاة ومن سجد فيها كبر للهوى وللرفع ولا يرفع يديه.

قلت: ولا يجلس للاستراحة والله أعلم ويقول سجد وجهي للذي خلقه وصوره وشق سمعه وبصره بحوله وقوته ولو كرر آية في مجلسين سجد لكل وكذا المجلس في الأصح وركعة كمجلس وركعتان كمجلسين فإن لم يسجد وطال ال فصل لم يسجد وسجدة الشكر لا تدخل الصلاة وتسن لهجوم نعمة أو اندفاع نقمة أو رؤية مبتلى ms020 أو عاص ويظهرها للعاصي لا للمبتلي وهي كسجدة التلاوة والأصح جوازهما على الراحلة للمسافر فإن سجد تلاوة صاة جاز عليها قطعا.

الصبح وركعتان قبل الظهر وكذا بعدها وبعد المغرب والعشاء وقيل: لا راتب للعشاء وقيل: أربع قبل الظهر وقيل: وأربع بعدها وقيل: وأربع قبل العصر والجميع سنة وإنما الخلاف في الراتب المؤكد وركعتان خفيفتان قبل المغرب.

قلت: هما سنة على الصحيح ففي صحيح البخاري الأمر بهما وبعد الجمعة أربع وقبلها ما قبل الظهر والله أعلم ومنه الوتر وأقله ركعة وأكثره إحدى عشرة وقيل: ثلاث عشرة ولمن زاد على ركعة الفصل وهو أفضل والوصل بتشهد أو تشهدين في الآخرتين ووقته بين صلاة العشاء وطلوع الفجر وقيل: شرط الإيثار بركعة سبق نفل بعد العشاء ويسن جعله آخر صلاة الليل فإن أوتر ثم تهجد لم يعده وقيل: يشفعه بركعة ثم يعيده ويندب القنوت آخر وتره في النصف الثاني من رمضان وقال كل سنة وهو كقنوت الصبح ويقول قبله اللهم إنا نستعينك ونستغفرك إلى آخره.

قلت: الأصح بعده أن الجماعة تندب في الوتر عقب التراويح جماعة والله أعلم ومنه الضحى وأقلها ركعتان وأكثرها ثنتا عشرة وتحية المسجد ركعتان وتحصل بفرض أو نفل آخر لا بركعة على الصحيح.

قلت: وكذا الجنازة وسجدة التلاوة والشكر وتتكر بتكرر الدخول على قرب في الأصح والله أعلم ويدخل وقت الرواتب قبل الفرض بدخول وقت الفرض وبعده بفعله ويخرج النوعان بخروج وقت الفرض ولو فات النفل المؤقت ندب قضاؤه في الأظهر وقسم يسن جماعة كالعيد والكسوف والاستسقاء وهو أفضل مما لا يسن جماعة لكن الأصح تفضيل الراتبة على التراويح وأن الجماعة تسن في التراويح ولا حصر للنفل المطلق فإن أحرم بأكثر من ركعة فله التشهد في كل ركعتين وفي كل ركعة.

قلت: الصحيح منعه في كل ركعة والله أعلم وإذا نوى عددا فله أن يزيد وينقص بشرط تغيير النية قبلهما وإلا فتبطل فلو نوى ركعتين فقام إلى ثالثة سهوا فالأصح أنه يقعد ثم يقوم للزيادة إن شاء.

قلت: نفل الليل ms021 أفضل وأوسطه أفضل ثم آخره وأن يسلم من كل ركعتين ويسن التهجد ويكره قيام كل الليل دائما وتخصيص ليلة الجمعة بقيام وترك تهجد اعتاده. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, 'باب صلاة النفل', 'قسمان قسم لا يسن جماعة فمنه الرواتب مع الفرائض وهي ركعتان قبل', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 102;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 103, 'كتاب صلاة الجماعة', 'كتاب صلاة الجماعة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب صلاة الجماعة

هي في الفرائض غير الجمعة سنة مؤكدة وقيل: فرض كفاية للرجال فتجب بحيث يظهر الشعار في القرية فإن امتنعوا كلهم قوتلوا ولا يتأكد الندب للنساء تأكده للرجال في الأصح.

قلت: الأصح المنصوص أنها فرض كفاية وقيل: عين والله أعلم وفي المسجد لغير المرأة أفضل وما كثر جمعه أفضل إلا لبدعة إمامه أو بعطل مسجد قريب لغيبته وإدراك تكبيرة الإحرام فضيلة وإنما تحصل بالإستغال بالتحريم عقب تحرم إمامه وقيل: بإدراك بعض القيام وقيل: بأول ركوع والصحيح إدراك الجماعة ما لم يسلم وليخفف الإمام مع فعل الأبعاض والهيآت إلا أن يرضى بتطويله محصورون ويكره التطويل ليلحق آخرون ولو أحسن في الركوع أو التشهد الأخير بداخل لم يكره انتظاره في الأظهر إن لم يبالغ فيه ولم يفرق بين الداخلين.

قلت: المذهب استحباب انتظاره والله أعلم ولا ينتظر في غبرهما ويسن للمصلي وحده وكذا جماعة في الأصح عادتها مع جماعة يدركها وفرضه الأولى في الجديد والأصح أنه ينوي بالثانية الفرض ولا رخصة في تركها وإن قلنا سنة إلا بعذر عام كمطر أو ريح عاصف بالليل وكذا وحل شديد على الصحيح أو خاص كمرض وحر وبرد شديدين وجوع وعطش ظاهرين ومدافعة حدث وخوف ظالم على نفس أو مال وملازمة غريم معسر

أو عقوبة يرجى تركها إن تغيب أياما وعرى وتأهب لسفر مع رفقة ترحل وأكل ذي ريح كريه وحضور قريب محتضر أو مريض بلا متعهد أو يأنس به.

فصل

لا يصح اقتداؤه بمن يعلم بطلان صلاته أو يعتقده كمجتهدين اختلفا في القبلة أو إناءين فإن تعدد الطاهر والأصح الصحة ما لم يتعين إناء الإمام للنجاسة فإن ظن طهارة إناء غيره اقتدى به قطعا فلو اشتبه خمسة فيها ms022 نجس على خمسة فظن كل طهارة إناء فتوضأ به وأم كل في صلاة ففي الأصح يعيدون العشاء إلا إمامها فيعيد المغرب ولو اقتدى شافعي بحنفي مس فرجه أو افتصد فالأصح الصحة في الفصد دون المس اعتبار أبنية المقتدي ولا تصح قدوة بمقتد ولا بمن تلزمه إعادة كمقيم تيمم ولا قارىء بأمي في الجديد وهو من يخل بحرف أو تشديدة من الفاتحة ومنه أرت يدغم في غير موضعه وألثغ يبدل حرفا بحرف وتصح بمثله وتكره بالتمتام والفأفاء واللاحن فإن غير معنى كأنعمت بضم أو كسر أبطل صلاة من أمكنه التعلم فإن عجز لسانه أو لم يمض زمن إمكان تعلمه فإن كان في الفاتحة فكأمي وإلا فتصح صلاته والقدوة به ولا تصح قدوة رجل ولا خنثى بامرأة ولا خنثى ولا تصح للمتوضيء بالمتيمم وبماسح الخف وللقائم بالقاعد والمضطجع وللكامل بالصبي والعبد والأعمى والبصير سواء على النص والأصح صحة قدوة السليم بالسلس

والطاهر بالمستحاضة غير المتحيرة ولو بان أمامه امرأة أو كافرا معلنا قيل: أو مخفيا وجبت الإعادة لا جنبا وإذا نجاسة خفية.

قلت: الأصح النصوص هو قول الجمهور أن مخفي الكفر هنا كمعلنه والله أعلم والأمي كالمرأة في الأصح ولو اقتدى بخنثى فبان رجلا لم يسقط القضاء في الأظهر والعدل أولى من الفاسق والأصح أن الأفقه أولى من الأقرإ والأورع ويقدم الأفقه والأقرأ على الأسن النسيب والجديد تقديم الأسن على النسب فإن استويا فبنظافة الثوب والبدن وحسن الصوت وطيب الصنعة ونحوها ومستحق المنفعة بملك ونحوه أولى فإن لم يكن أهلا فله التقديم ويقدم على عبده الساكن لا مكاتبه في ملكه والأصح تقديم المكتري على المكري والمعير على المستعير والوالي في محل ولايته أولى من الأفقه والمالك.

فصل

لا يتقدم على إمامه في الموقف فإن تقدم بطلت في الجديد ولا تضر مساواته ويندب تخلفه قليلا والإعتبار بالعقب ويستديرون في المسجد الحرام حول الكعبة ولا يضر كونهم أقرب إلى الكعبة في غير جهة الإمام في الأصح وكذا لو وقفا في الكعبة واختلف جهتاهما ويقف ms023 الذكر عن يمينه فإن حضر آخر أحرم عن يساره ثم يتقدم الإمام أو يتأخران وهو أفضل ولو حضر رجلان أو رجل وصب صفا خلفه وكذا امرأة أو نسوة ويقف خلفه الرجال ثم الصبيان ثم النساء وتقف إمامتهن وسطهن ويكره وقوف المأموم فردا بل يدخل الصف إن وجد سعة وإلا فليجر شخصا بعد الإحرام وليساعده المجرور ويشترط علمه بانتقالات

الإمام بأن يراه أو بعض صف أو يسمعه أو مبلغا وإذا جمعهما مسجد صح الإقتداء وإن بعدت المسافة وحالت أبنية ولو كانا بفضاء شرط أن لا يزيد ما بينهما على ثلاثمائة ذراع تقريبا وقيل: تحديدا فإن تلاحق شخصان أو صفان اعتبرت المسافة بين الأخير والأول وسواء الفضاء المملوك والوقف والمبعض ولا يضر الشارع المطروق والنهر المحوج إلى سباحة على الصحيح فإن كانا في بناءين كصحن وصفة أو بيت فطريقان أصحهما إن كان بناء المأموم يمينا أو شمالا وجب اتصال صف من أحد البناءين بالآخر ولا تضر فرجه لاتسع واقفا في الأصح وإن كان خلف بناء الإمام فالصحيح صحة القدوة بشرط أن لا يكون بين الصفين أكثر من ثلاثة أذرع والطريق الثاني لا يشترط إلا القرب كالفضاء إن لم يكن حائل أو حال باب نافذ فإن حال ما يمنع المرور لا الرؤية فوجهان أو جدار بطلت باتفاق الطريقين.

قلت: الطريق الثاني أصح والله أعلم وإذا صح اقتداؤه في بناء آخر صح اقتداء من خلفه وإن حال جدار بينه وبين الإمام ولو وقف في علو وإمامه في أسفل أو عكسه شرط محاذاة بعض بدنه بعض بدنه ولو وقف في موات وإمامه في مسجد فإن لم يحل شيء فالشرط التقارب معتبرا من آخر المسجد وقيل: من آخر صف وإن حال جدار أو باب مغلق منع وكذا الباب المردود والشباك في الأصح.

قلت: يكره ارتفاع المأموم على إمامه وعكسه إلا لحاجة فيستحب ولا يقوم حتى يفرغ المؤذن من الإقامة ولا يبتدىء نفلا بعد شروعه فيها فإن كان فيها أئمة إن لم يخش فوت الجماعة. والله أعلم. ms024

فصل

شرط القدوة أن ينوي المأموم مع التكبير الإقتداء أو الجماعة والجمعة كغيرها على الصحيح فلو ترك هذه النية وتابع في الأفعال بطلت صلاته على الصحيح ولا يجب تعيين

الإمام فإن عينه وأخطأ بطلت صلاته ولا يشترط للإمام نية الإمامة وتستحب فلو أخطأ في تعيين تابعه لم يضر وتصح قدوة المؤدي بالقاضي والمفترض بالمتنفل وفي الظهر بالعصر وبالعكوس وكذا الظهر بالصبح والمغرب وهو كالمسبوق ولا تضر متابعة الإمام في القنوت والجلوس الآخر في المغرب وله فراقه إذا اشتغل بهما ويجوز الصبح خلف الظهر في الأظهر فإذا قام للثالثة فإن شاء فارقه وسلم وإن شاء انتظره ليسلم معه.

قلت: انتظاره أفضل والله أعلم وإن أمكنه القنوت في الثانية قنت وإلا تركه وله فراقه ليقنت فإن اختلف فعلهما كمكتوبة وكسوف أو جنازة لم يصح على الصحيح.

فصل

تجب متابعة الإمام في أفعال الصلاة بأن يتأخر ابتداء فعله عن ابتدائه ويتقدم على فراغه منه فإن قارنه لم يضر إلا تكبيرة إحرام وإن تخلف بركن بأن فرغ الإمام منه وهو فيما قبله لم تبطل في الأصح أو بركنين بأن فرغ منهما وهو فيما قبلهما فإن لم يكن عذر بطلت وإن كان بأن أسرع قراءته وركع قبل إتمام المأموم الفاتحة فقيل: يتبعه وتسقط البقية والصحيح يتمها ويسعى خلفه ما لم يسبق بأكثر من ثلاثة أركان مقصودة وهي الطويلة فإن سبق بأكثر فقيل: يفارقه والأصح يتبعه فيما هو فيه ثم يتدارك بعد سلام الإمام ولو لم يتم الفاتحة لشغله بدعاء الافتتاح فمعذور هذا كله في الموافق فأما مسبوق ركع الإمام في فاتحته فالأصح أنه إن لم يشتغل بالافتتاح والتعوذ ترك قراءته وركع وهو مدرك للركعة وإلا لزمه قراءة بقدره ولا يشتغل المسبوق بسنة بعد التحرم بل بالفاتحة إلا أن يعلم إدراكها ولو علم المأموم في ركوعه أنه ترك الفاتحة أو شك لم يعد إليها بل يصلي ركعة بعد سلام الإمام

فلو علم أو شك وقد ركع الإمام ولم يركع هو قرأها وهو متخلف بعذر وقيل: يركع ms025 ويتدارك بعد سلام الإمام ولو سبق إمامه بالتحرم لم تنعقد أو بالفاتحة أو التشهد لم يضره ويجزئه وقيل: يجب إعادته ولو تقدم بفعل كركوع وسجود إن كان بركنين بطلت وإلا فلا وقيل: تبطل بركن.

فصل

خرج الإمام من صلاته انقطعت القدوة فإن لم يخرج وقطعها المأموم جاز وفي قول لا يجوز إلا بعذر يرخص في ترك الجماعة ومن العذر تطويل الإمام أو تركه سنة مقصودة كتشهد ولو أحرم منفردا ثم نوى القدوة في خلال صلاته جاز في الأظهر وإن كان في ركعة أخرى ثم يتبعه قائما كان أو قاعدا فإن فرغ والإمام أولا فهو كمسبوق أو هو فإن شاء فارقه وإن شاء انتظر ليسلم معه وما أدركه المسبوق فأول صلاته فيعيد في الباقي القنوت ولو أدرك ركعة من المغرب تشهد في ثانيته وإن أدركه راكعا أدرك الركعة.

قلت: بشرط أن يطمئن قبل ارتفاع الإمام عن أقل الركوع والله أعلم ولو شك في إدراك حد الإجزاء لم تحسب ركعته في الأظهر ويكبر للإحرام ثم للركوع فإن نواهما بتكبيرة لم تنعقد وقيل: تنعقد وقيل: تنعقد نفلا وإن لم ينو بها شيئا لم تنعقد على الصحيح ولو أدركه في اعتداله فما بعده انتقل معه مكبرا والأصح أنه يوافقه في التشهد والتسبيحات وأن من أدركه في سجدة لم يكبر للانتقال إليها وإذا سلم الإمام قام المسبوق مكبرا إن كان موضع جلوسه وإلا فلا في الأصح', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب صلاة المسافر', 'إنما تقصر رباعية مؤداة في السفر الطويل المباح لا فائتة الحضر ولو قضى فائتة السفر فالأظهر قصره في السفر دون الحضر ومن سافر من بلدة فأول سفره مجاوزه سورها فإن كان وراءه عمارة اشترط مجاوزتها في الأصح.

قلت: الأصح لا يشترط والله أعلم فإن لم يكن سور فأوله مجاوزة العمران إلى الخراب والبساتين والقرية كبلدة وأول سفر ساكن الخيام مجاوزة الحلة وإذا رجع انتهى سفره ببلوغه ما شرط مجاوزته ابتداء ولو نوى إقامة أربعة أيام بموضع انقطع سفره بوصوله ولا يحسب منها يوما دخوله وخروجه على ms026 الصحيح لو أقام ببلد بنية أن يرحل إذا حصلت حاجة يتوقعها كل وقت قصر ثماينة عشر يوما وقيل: أربعة وفي قول أبدا وقيل: الخلاف في خائف القتال لا التاجر ونحوه ولو علم بقاءها مدة طويلة فلا قصر على المذهب.

فصل

طويل السفر ثمانية وأربعون ميلاها شمية.

قلت: وهي مرحلتان بسير الأثقال والبحر كالبر فلو قطع الأميال فيه في ساعة قصر والله أعلم ويشترط قصد موضع معين أولا فلا قصر للهائم وإن طال تردده ولا طالب غريم وآبق يرجع متى وجده ولا يعلم موضعه ولو كان لمقصده طريقان طويل وقصير فسلك الطويل

لغرض كسهولة أو أمن قصر وإلا فلا في الأظهر ولو اتبع العبد أو الزوجة أو الجندي مالك أمره في السفر ولا يعرف مقصده فلا قصر فلو نووا مسافة القصر قصر الجندي دونهما ومن قصد سفرا طويلا فسار ثم نوى رجوعا انقطع فإن سار فسفر جديد ولا يترخص العاصي بسفره كآبق وناشزة فلو أنشأ مباحا ثم جعله معصية فلا ترخص في الأصح ولو أنشأه عاصيا ثم تاب فمشا السفر من حين التوبة ولو اقتدى بمتم لحظة لزمه الإتمام ولو رعف الإمام المسافر واستخلف متما أتم المقتدون وكذا الوعاد الإمام واقتدى به ولو لزم الإتمام مقتديا ففسدت صلاته أو صلاة إمامه أو بان أمامه محدثا أتم ولو اقتدى بمن ظنه مسافرا فبان مقيما أو بمن جهل سفره أتم ولو علمه مسافرا وشك في نيته قصر ولو شك فيها فقال إن قصر قصرت وإلا أتممت قصر في الأصح ويشترط للقصر نيته في الإحرام والتحرز عن منافيها دواما ولو أحرم قاصرا ثم تردد في أنه يقصر أو يتم أو في أنه نوى القصر أو قام إمامه لثالثة فشك هل هو متم أم ساه أتم ولو قام القاصر لثالثة عمدا بلا موجب للإتمام بطلت صلاته وإن كان سهوا عاد وسجد له وسلم فإن أراد أن يتم عاد ثم نهض متما ويشترط كونه مسافرا في جمع صلاته فلو نوى الإقامة فيها أو بلغت سفينته دار ms027 إقامته أتم وأقصر أفضل من الإتمام على المشهور إذا بلغ ثلاث مراحل والصوم أفضل من الفطر إن لم يتضرر به.

فصل

يجوز الجمع بين الظهر والعصر تقديما وتأخيرا والمغرب والعشاء كذلك في السفر الطويل وكذا القصير في قول فإن كان سائرا وقت الأولى فتأخيرها أفضل وإلا فعكسه.

وشروط التقديم ثلاثة البداءة لأولى فلو صلاهما فبان فسادها فسدت الثانية ونية الجمع ومحلها أول الأولى وتجوز في أثنائها في الأظهر والموالاة بأن لا يطول بينهما فصل فإن طال ولو بعذر وجب تأخير الثانية إلى وقتها ولا يضر فصل يسير ويعرف طوله بالعرف وللمتيمم الجمع على الصحيح ولا يضر تخلل طلب خفيف ولو مع ثم علم ترك ركن من الأولى بطلتا ويعيدهما جامعا أو من الثانية فإن لم يطل تدارك وإلا فباطلة ولا جمع ولو جهل أعادهما لوقتيهما وإذا أخر الأولى لم يجب الترتيب والموالاة ونية الجمع على الصحيح ويجب كون التأخير بنية الجمع وإلا فيعصى وتكون قضاء ولو جمع تقديما فصار بين الصلاتين مقيما بطل الجمع وفي الثانية وبعدها لا يبطل في الأصح أو تأخيرا فأقام بعد فراغها لم يؤثر وقبله يجعل الأولى قضاء ويجوز الجمع بالمطر تقديما والجديد منعه تأخيرا وشرط التقديم وجوده أولها والأصح اشتراطه عند سلام الأولى والثلج والبرد كمطران ذابا والأظهر تخصيص الرخصة بالمصلي جماعة بمسجد بعيد يتأذى بالمطر في طريقه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, 'باب صلاة الجمعة', 'إنما تتعين على كل مكلف حر ذكر مقيم بلا مرض ونحوه ولا جمعة على معذورة بمرخص في ترك الجماعة والمكاتب وكذا من بعضه رقيق على الصحيح ومن صحت طهره صحت جمعته وله أن ينصرف من الجامع إلا المريض ونحوه فيحرم انصرافه إن دخل الوقت إلا أن يزيد ضرره بانتظاره وتلزم الشيخ الهرم والزمن إن وجدا مركبا ولم يشق

الركوب والأعمى يجد قائدا وأهل القرية إن كان فيهم جمع تصح به الجمعة أو بلغهم صوت عال في هدو من طرف يليهم لبلد الجمعة لزمتهم وإلا فلا ويحرم على من لزمه السفر بعد الزوال إلا أن ms028 تمكنه الجمعة في طريقه أو يتضرر بتخلفه عن الرفقة وقبل الزوال كبعده في الجديد إن كان سفرا مباحا وإن كان طاعة جاز.

قلت: الأصح إن الطاعة كالمباح والله أعلم ومن لا جمعة عليهم تسن الجماعة في ظهرهم في الأصح ويخفونها إن خفي عذرهم ويندب لمن أمكن زوال عذره تأخير ظهره إلى اليأس من الجمعة ولغيره كالمرأة والزمن تعجيلها ولصحتها مع شرط غيرها شروط: أحدها: وقت الظهر فلا تقضي جمعة فلو ضاق عنها صلوا ظهرا ولو خرج وهم فيها وجب الظهر بناء وفي قول استئنافا والمسبوق كغيره وقيل: بتمامها جمعة الثاني: أن تقام في خطة أبنية أوطان المجمعين ولو لازم أهل الخيام الصحراء أبدا فلا جمعة في الأظهر الثالث: أن لا يسبقها ولا يقارنها جمعة في بلدتها إلا إذا كبرت وعسر اجتماعهم في مكان وقيل: لا تستثنى هذه الصورة وقيل: إن حال نهر عظيم بين شقيها كانا كبلدين وقيل: إن كانت قرى فاتصلت تعددت الجمعة بعددها فلو سبقت جمعة فالصحيحة السابقة وفي قول إن كان السلطان مع الثانية فهي الصحيحة والمعتبر سبق التحريم وقيل: التحلل وقيل: بأول الخطبة فلو وقعتا معا أو شك استؤنفت الجمعة وإن سبقت إحداهما ولم تتعين أو تعينت ونسيت صلوا ظهرا وفي قول جمعة الرابع: الجماعة وشرطها كغيرها وأن تقام بأربعين مكلفا حرا ذكرا مستوطنا لا يظعن شتاء ولا صيفا إلا لحاجة والصحيح انعقادها بأربعين وأن الإمام لا يشترط كونه فوق أربعين ولو انفض الأربعون أو بعضهم في الخطبة لم يحسب المفعول في غيبتهم ويجوز البناء على ما مضى إن عادوا قبل طول الفصل وكذا بناء الصلاة على الخطبة أن انفضوا بينهما فإن عادوا بعد طوله وجب الاستئناف في الأظهر وإن انفضوا في الصلاة بطلت وفي قول لا إن بقي اثنان وتصح خلف العبد والصبي والمسافر

في الأظهر إذا أتم العدد بغيره ولو بان الإمام جنبا أو محدثا صحت جمعتهم في الأظهر إن تم العدد بغيره وإلا فلا ومن لحق الإمام المحدث راكعا لم تحسب ركعة على ms029 الصحيح الخامس خطبتان قبل الصلاة وأركانهما خمسة حمد الله تعالى والصلاة على رسول الله صلى الله عليه وسلم ولفظهما متعين والوصية بالتقوى ولا يتعين لفظها على الصحيح وهذه الثلاثة أركان في الخطبتين والرابع: قراءة آية في إحداهما وقيل: في الأولى وقيل: فيهما وقيل: لا تجب والخامس: ما يقع عليه اسم دعاء للمؤمنين في الثانية وقيل: لا يجب ويشترط كونها عربية مرتبة الأركان الثلاثة الأولى وبعد الزوال والقيام فيها إن قدر والجلوس بينهما وإسماع أربعين كاملين والجديد أنه لا يحرم عليهم الكلام ويسن لإنصات.

قلت: الأصح أن ترتيب الأركان ليس بشرط والله أعلم والأظهر اشتراط الموالاة وطهارة الحدث والخبث والستر وتسن على منبر أو مرتفع ويسلم على من عند المنبر وأن يقبل عليهم إذا صعد ويسلم عليهم ويجلس ثم يؤذن وأن تكون بليغة مفهومة قصيرة ولا يلتفت يمينا وشمالا في شيء منها ويعتمد على سيف وعصا ونحوه ويكون جلوسه بينهما نحو سورة الإخلاص وإذا فرغ شرع المؤذن في الإقامة وبادر الإمام ليبلغ المحراب مع فراغه ويقرأ في الأولى الجمعة وفي الثانية المنافقين جهرا.

فصل

يسن الغسل لحاضرها وقيل: لكل أحد ووقته من الفجر وتقريبه من ذهابه أفضل فإن عجز تيمم في الأصح ومن المسنون غسل العيد والكسوف والاستسقاء ولغاسل الميت

والمجنون والمغمى عليه إذا أفاقا والكافر إذا أسلم وأغسال الحج وآكدها غسل غاسل الميت ثم الجمعة وعكسه القديم.

قلت: القديم هنا اظهر ورجحه لأكثرون وأحاديث صحيحة كثيرة وليس للجديد حديث صحيح والله أعلم ويسن التبكير إليها ماشيا بسكينة وأن يشتغل في طريقه وحضوره بقراءة أو ذكر ولا يتخطى وأن يتزين بأحسن ثيابه وطيب وإزالة الظفر والريح.

قلت: وأن يقرأ الكهف يومها وليلتها ويكثر الدعاء والصلاة على رسول الله صلى الله عليه وسلم ويحرم على ذي الجمعة التشاغل بالبيع وغيره بعد الشروع في الأذان بين يدي الخطيب فإن باع صح ويكره قبل الأذان بعد الزوال. والله أعلم.

فصل

من أدرك ركوع الثانية أدرك الجمعة فيصلي بعد سلام الإمام ركعة وإن أدركه بعده ms030 فاتته فيتم بعد سلامه ظهرا أربعا والأصح أنه ينوي في اقتدائه الجمعة وإذا خرج الإمام من الجمعة أو غيرها بحدث أو غيره جاز الاستخلاف في الأظهر ولا يستخلف للجمعة إلا مقتديا به قبل حدثه ولا يشترط كونه حضر الخطبة ولا الركعة الأولى في الأصح فيهما ثم إن كان أدرك الأولى تمت جمعتهم وإلا فتتم لهم دونه في الأصح ويراعى المسبوق نظم المستخلف فإذا صلى ركعة تشهد وأشار إليهم ليفارقوه أو ينتظروا ولا يلزمهم استئناف نية القدوة في الأصح ومن زوحم عن السجود فأمكنه على إنسان فعل وإلا فالصحيح أنه ينتظر

ولا يؤمىء به ثم إن تمكن قبل ركوع إمامه سجد فإن رفع والإمام قائم قرأ أو راكع فالأصح يركع وهو كمسبوق فإن كان إمامه فرغ من الركوع ولم يسلم وافقه فيما هو فيه ثم صلى ركعة بعده وإن كان سلم فاتت الجمعة وإن لم يمكنه السجود حتى ركع الإمام ففي قول يراعي نظم نفسه والأظهر أنه يرفع معه ويحسب ركوعه الأول في الأصح فركعته ملفقة من ركوع الأولى وسجود الثانية وتدرك بها الجمعة في الأصح فلو سجد على ترتيب نفسه عالما بأن واجبه المتابعة بطلت صلاته وإن نسي أو جهل لم يحسب سجوده الأول فإذا سجد ثانيا حسب والأصح إدراك الجمعة بهذه الركعة إذا كملت السجدتان قبل سلام الإمام ولو تخلف بالسجود ناسيا حتى ركع الإمام للثانية ركع معه على المذهب.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, 'باب صلاة الخوف', 'هي أنواع الأول: يكون العدو في القبلة فيرتب الإمام القوم صفين ويصلي بهم فإذا سجد سجد معه صف سجدتيه وحرس صف فإذا قاموا سجد من حرس ولحقوه وسجد معه في الثانية من حرس أولا وحرس الآخرون فإذا جلس سجد من حرس وتشهد بالصفين وسلم وهذه صلاة رسول الله صلى الله عليه وسلم بعسفان ولو حرس فيهما فرقتا صف جاز وكذا فرقة في الأصح. الثاني: يكون في غيرها فيصلي مرتين كل مرة بفرقة وهذه صلاة رسول الله صلى الله عليه وسلم ببطن نخل أو تقف فرقة في ms031 وجهه ويصلي بفرقة ركعة فإذا قام للثانية فارقته وأتمت وذهبت إلى وجهه وجاء الواقفون فاقتدوا به فصلى بهم الثانية فإذا جلس للتشهد قاموا فأتموا ثانيتهم ولحقوه وسلم بهم وهذه صلاة رسول الله صلى الله عليه وسلم بذات الرقاع والأصح أنها أفضل من بطن نخل ويقرأ الإمام في انتظاره الثانية ويتشهد وفي قول يؤخر لتلحقه فإن صلى مغربا فبفرقة ركعتين

وبالثانية ركعة وهو أفضل من عكسه في الأظهر وينتظر في تشهده أو قيام الثالثة: وهو أفضل في الأصح أو رباعية فبكل ركعتين فلو صلى بكل فرقة ركعة صحت صلاة الجميع في الأضهر وسهو كل فرقة محمول في أولاهم وكذا ثانية الثانية في الأصح لا ثانية الأولى وسهوه في الأولى يلحق الجميع وفي الثانية لا يلحق الأولين ويسن حمل السلاح في هذه الأنواع وفي قول يجب الرابع: أن يلتحم القتال أو يشتد الخوف فيصلي كيف أمكن راكبا وماشيا ويعذر في ترك القبلة وكذا الأعمال الكثيرة لحاجة في الأصح لا صياح ويلقى السلاح إذا دمى فإن عجز أمسكه ولا قضاء في الأظهر وإن عجز عن ركوع وسجود أومأ والسجود أخفض وله ذا النوع في كل قتال وهزيمة مباحين وهرب من حريق وسيل وسبع وغريم عند الإعسار وخوف حبسه والأصح منعه لمحرم خاف فوت الحج ولو صلوا لسواد ظنوه عدوا فبان غيره قضوا في الأظهر.

فصل

يحرم على الرجل استعمال الحرير بفرش وغيره ويحل للمرأة لبسه والأصح تحريم افتراشها وأن للولي إلباسه الصبي.

قلت: الأصح حل افتراشها وبه قطع العراقيون وغيرهم والله أعلم ويجوز للرجل لبسه للضرورة كحر وبرد مهلكين أو فجأة حرب ولم يجد غيره للحاجة كجرب وحكة ودفع

قمل وللقتال كديباج لا يقوم غيره مقامه ويحرم المركب من ابر يسم وغيره إن زاد وزن الإبر يسم ويحل عكسه وكذا إن استويا في الأصح ويحل ما طرز أو طرف بحرير قدر العادة ولبس الثوب النجس في غير الصلاة ونحوها لا جلد كلب وخنزير إلا لضرورة كفجأة قتال وكذا جلد الميتة في الأصح ويحل ms032 الاستصباح بالدهن النجس على المشهور.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, 'باب صلاة العيدين', 'هي سنة وقيل: فرض كفاية وتشرع جماعة للمنفرد والعبد والمرأة والمسافر ووقتها بين طلوع الشمس وزوالها ويسن تأخيرها لترتفع كرمح وهي ركعتان يحرم بهما ثم يأتي بدعاء الافتتاح ثم سبع تكبيرات يقف بين كل ثنتين كآية معتدلة يهلل ويكبر ويمجد ويحسن سبحان الله والحمد لله ولا إله إلا الله والله أكبر ثم يتعوذ ويقرأ ويكبر في الثانية خمسا قبل القراءة ويرفع يديه في الجميع ولسن فرضا ولا بعضا ولو نسيها وشرع في القراءة فاتت وفي القديم يكبر ما لم يرفع ويقرأ بعد الفاتحة في الأولى ق وفي الثانية اقتربت بكمالها جهرا ويسن بعدها خطبتان أركانهما كهي في الجمعة ويعلمهم في الفطر الفطرة وفي الأضحى الأضحية يفتتح الأولى بتسع تكبيرات والثانية بسبع ولاء ويندب الغسل ويدخل وقته بنصف الليل وفي قول بالفجر والتطيب والتزين كالجمعة وفعلهم بالمسجد أفضل وقيل: بالصحراء إلا لعذر ويستخلف من يصلي بالضعفة ويذهب في طريق ويرجع في أخرى ويبكر الناس ويحضر الإمام وقت صلاته ويعجل في الأضحى.

قلت: ويأكل في عيد الفطر قبل الصلاة ويمسك الأضحى ويذهب ماشيا بسكينة ولا يكره النفل قبلها لغير الإمام. والله أعلم.

فصل

يندب التكبير بغروب الشمس ليلتي العيد في المنازل والطرق والمساجد والأسواق برفع الصوت والأظهر إدامته حتى يحرم الإمام بصلاة العيد ولا يكبر الحاج ليلة الأضحى بل يلبي ولا يسن ليلة الفطر عقب الصلوات في الأصح ويكبر الحاج من ظهر النحر ويختم بصبح آخر التشريق وغيره كهو في الأظهر وفي قول من مغرب ليلة النحر وفي قول من صبح عرفة ويختم بعصر آخر التشريق والعمل على هذا والأظهر أنه يكبر في هذه الأيام للفائتة والراتبة والنافلة وصيغته المحبوبة الله أكبر الله أكبر الله أكبر لا إله إلا الله والله أكبر الله أكبر ولله الحمد ويستحب أن يزيد كبيرا والحمد لله كثيرا وسبحان الله بكرة وأصيلا ولو شهدوا يوم الثلاثين قبل الزوال برؤية الهلال الليلة الماضية أفطرنا وصلينا العيد وإن شهدوا بعد الغروب ms033 لم تقبل الشهادة أو بين الزوال والغروب أفطرنا وفاتت الصلاة ويشرع قضاؤها متى شاء في الأظهر وقيل: في قول تصلي من الغد أداء.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, 'باب صلاة الكسوفين', 'هي سنة فيحرم بنية صلاة الكسوف ويقرأ الفاتحة ويركع ثم يرفع ثم يقرأ الفاتحة ثم يركع ثم يرفع ثم يعتدل ثم يسجد فهذه ركعة ثم يصلي ثانية كذلك ولا يجوز زيادة ركوع ثالث لتمادي الكسوف ولانقصه للإنجلاء في الأصح والأكمل أن يقرأ في القيام الأول بعد الفاتحة البقرة وفي الثاني كمائتي آية منها وفي الثالث: مائة وخمسين والرابع: مائة تقريبا

ويسبح في الركوع الأول قدر مائة من البقرة وفي الثاني ثمانين والثالث: سبعين والرابع: خمسين تقريبا ولا يطول السجدات في الأصح.

قلت: الصحيح تطويلها ثبت في الصحيحين ونص في البويطي أنه يطولها نحو الركوع الذي قبلها والله أعلم وتسن جماعة ويجهر بقراءة كسوف القمر لا الشمس ثم يخطب الإمام خطبتين بأركانهما في الجمعة ويحث على التوبة والخير ومن أدرك الإمام في ركوع أول أدرك الركعة أو في ثان او قيام ثان فلا في الأظهر وتفوت صلاة الشمس بالإنجلاء وبغروبها كاسفة والقمر بالإنجلاء وطلوع الشمس لا الفجر في الجديد ولا بغروبه خاسفا ولو اجتمع كسوف وجمعة أو فرض آخر قدم الفرض إن خيف فوته وإلا فالأظهر تقديم الكسوف ثم يخطب للجمعة متعرضا للكسوف ثم يصلي الجمعة ولو اجتمع عيد أو كسوف وجنازة قدمت الجنازة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, 'باب صلاة الإستسقاء', 'هي سنة عند الحاجة وتعاد ثانيا وثالثا إن لم يسقوا فإن تأهبوا للصلاة فسقوا قبلها اجتمعوا للشكر والدعاء ويصلون على الصحيح ويأمرهم الإمام بصيام ثلاثة أيام أولا والتوبة والتقرب إلى الله تعالى بوجوه البر والخروج من المظالم ويخرجون إلى الصحراء في الرابع: صياما في ثياب بذلة وتخشع ويخرجون الصبيان والشيوخ وكذا البهائم في الأصح ولا يمنع أهل الذمة الحضور ولا يختلطون بنا وهي ركعتان كالعيد لكن قيل: يقرأ في الثانية: {إنا أرسلنا نوحا} 1 ولا تختص بوقت العيد في الأصح ويخطب كالعيد لكن يستغفر الله تعالى

بدل التكبير ms034 ويدعو في الخطبة الأولى اللهم اسقنا غيثا مغيثا هنيئا مريئا مريعا غدقا مجللا سحا طبقا دائما اللهم اسقنا الغيث ولا تجعلنا من القانطين اللهم إنا نستغفرك إنك كنت غفارا فأرسل السماء علينا مدرارا ويستقبل القبلة بعد صدر الخطبة الثانية ويبالغ في الدعاء سرا وجهرا ويحول رداءه عند استقباله فيجعل يمينه يساره وعكسه وينكسه على الجديد فيجعل أعلاه أسفله وعكسه ويحول الناس مثله.

قلت: ويترك محولا حتى ينزع الثياب ولو ترك الإمام الاستسقاء فعله الناس ولو خطب قبل الصلاة جاز ويسن أن يبرز لأول مطر السنة ويكشف غير عورته ليصيبه وأن يغتسل أو يتوضأ في السيل ويسبح عند الرعد والبرق ولا يتبع بصره البرق ويقول عند المطر اللهم صيبا نافعا ويدعو بما شاء وبعده مطرنا بفضل الله ورحمته ويكره مطرنا بنوء كذا وسب الريح ولو تضرروا بكثرة المطر فالسنة أن يسألوا الله تعالى رفعه اللهم حوالينا ولا علينا ولا يصلى لذلك. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, 'باب إن ترك الصلاة جاحدا', 'وجوبها

كفر أو كسلا قتل حدا والصحيح قتله بصلاة فقط بشرط إخراجها عن وقت الضرورة ويستتاب ثم يضرب عنقه وقيل: ينخس بحديدة حتى يصلي أو يموت ويغسل ويصلى عليه ويدفن مع المسلمين ولا يطمس قبره.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 103;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 104, 'كتاب الجنائز', 'كتاب الجنائز');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'ليكثر ذكر الموت ويستعد بالتوبة ورد المظالم والمريض آكد ويضجع المحتضر لجنبه الأيمن إلى القبلة على الصحيح فإن تعذر لضيق مكان ونحوه ألقي على قفاه ووجه وأخمصاه للقبلة ويلقن الشهادة بلا إلحاح ويقرأ عنده يس وليحسن ظنه بربه سبحانه وتعالى فإذا مات غمض وشد لحياه بعصابة ولينت مفاصله وستر جميع بدنه بثوب خفيف ووضع على بطنه شيء ثقيل: ووضع على سرير ونحوه ونزعت ثيابه ووجه للقبلة كمحتضر ويتولى ذلك أرفق محارمه ويبادر بغسله إذا تيقن موته وغسله وتكفينه والصلاة عليه ودفنه فروض كفاية وأقل الغسل تعميم بدنه بعد إزالة النجس ولا تجب نية الغاسل في الأصح فيكفي غرقه أو غسل كافر.

قلت: الصحيح المنصوص وجوب غسل الغريق والله أعلم والأكمل وضعه بموضع خال مستور على لوح ms035 ويغسل في قميص بماء بارد ويجلسه الغاسل على المغتسل مائلا إلى ورائه ويضع يمينه على كتفه وإبهامه في نقرة قفاه ويسند ظهره إلى ركبته اليمنى ويمر يساره على بطنه إمرارا بليغا ليخرج ما فيه ثم يضجعه لقفاه ويغسل بيساره وعليها خرقة سوأتية ثم

يلف أخرى ويدخل أصبعه فمه ويمرها على أسنانه ويزيل ما في منخريه من أذى ويوضئه كالحي ثم يغسل رأسه ثم لحيته بسدر ونحوه ويسرحهما بمشط واسع الأسنان برفق ويرد المنتف إليه ويغسل شقه الأيمن ثم الأيسر ثم يحرفه إلى شقه الأيسر فيغسل شقه الأيمن مما يلي القفا والظهر إلى القدم ثم يحرفه إلى شقه الأيمن فيغسل الأيسر كذلك فهذه غسلة ويستحب ثانية وثالثة وأن يستعان في الأولى بسدر أو خطمى ثم يصب ماء قراح من فرقه إلى قدمه بعد زوال السدر وأن يجعل في كل غسلة قليل كافور ولو خرج بعده نجس وجب إزالته فقط وقيل: مع الغسل إن خرج من الفرج وقيل: الوضوء ويغسل الرجل الرجل والمرأة المرأة ويغسل أمته وزوجته وهي زوجها ويلفان خرقة ولا مس فإن لم يحضر إلا أجنبي أو أجنبية يمم في الأصح وأولى الرجال به أولا لهم بالصلاة وبها قراباتها ويقدمن على زوج في الأصح وأولاهن ذات محرمية ثم الأجنبية ثم رجال القرابة كترتيب صلاتهم.

قلت: إلا ابن العم ونحوه فكالأجنبي والله أعلم ويقدم عليهم الزوج في الأصح ولا يقرب المحرم طيبا ولا يؤخذ شعره وظفره وتطيب المحدة في الأصح والجديد أنه لا يكره في غير المحرم أخذ ظفره وشعر إبطه وعانته وشاربه.

قلت: الأظهر كراهته. والله أعلم.

فصل

يكفن بما له لبسه حيا وأقله ثوب ولا تنفذ وصيته بإسقاطه والأفضل للرجل ثلاثة ويجوز رابع وخامس ولها خمسة ومن كفن منهما بثلاثة فهي لفائف وإن كفن في خمسة زيد قميص وعمامة تحتهن وإن كفنت في خمسة فإزار وخمار وقميص ولفافتان وفي قول ثلاث لفائف وإزار وخمار ويسن الأبيض ومحله أصل التركة فإن لم يكن فعلى من عليه نفقته من قريب وسيد ms036 وكذا الزوج في الأصح ويبسط أحسن اللفائف وأوسعها والثانية فوقها وكذا الثالثة ويذر على كل واحدة حنوط ويوضع الميت فوقها مستلقيا وعليه حنوط وكافور ويشد ألياه ويجعل على منافذ بدنه قطن ويلف عليه اللفائف وتشد فإذا وضع في قبره نزع الشداد ولا يلبس المحرم الذكر محيطا ولا يستر رأسه ولا وجه المحرمة وحمل الجنازة بين العمودين أفضل من التربيع في الأصح وهو أن يضع الخشبتين المقدمتين على عاتقيه ورأسه بينهما ويحمل المؤخرتين رجلان والتربيع أن يتقدم رجلان ويتأخر آخران والمشي أمامها بقربها أفضل ويسرع بها إن لم يخف تغيره.

فصل

لصلاته أركان أحدها: النية ووقتها كغيرها وتكفي نية الفرض وقيل: تشترط نية فرض

كفاية ولا يجب تعيين الميت فإن عين وأخطأ بطلت وإن حضر موتى نواهم.

الثاني: أربع تكبيرات فإن خمس لم تبطل في الأصح ولو خمس إمامه لم يتابعه في الأصح بل يسلم أو ينتظره ليسلم معه.

الثالث: السلام كغيرها.

الرابع: قراءة الفاتحة بعد الأولى.

قلت: تجزىء الفاتحة بعد غير الأولى. والله أعلم.

الخامس: الصلاة على رسول الله صلى الله عليه وسلم بعد الثانية والصحيح أن الصلاة على الآل لا تجب.

السادس: الدعاء للميت بعد الثالثة

السابع: القيام على المذهب إن قدر ويسن رفع يديه في التكبيرات وإسرار القراءة وقيل: يجهر ليلا والأصح ندب التعوذ دون الإفتتاح ويقول في الثالثة: اللهم هذا عبدك وابن عبديك إلى آخره ويقدم عليه اللهم اغفر لحينا وميتنا وشاهدنا وغائبنا وصغيرنا وكبيرنا وذكرنا وأنثانا اللهم من أحييته منا فأحيه على الإسلام ومن توفيته منا فتوفه على الإيمان ويقول في الطفل مع هذا الثاني اللهم اجعله فرطا لأبويه وسلفا وذخرا وعظة واعتبار وشفيعا وثقل به موازينهما وأفرغ الصبر على قلوبهما وفي الرابعة اللهم لا تحرمنا أجره ولا تفتنا بعده ولو تخلف المقتدي بلا عذر فلم يكبر حتى كبر إمامه أخرى بطلت صلاته ويكبر المسبوق ويقرأ الفاتحة وإن كان الإمام في غيرها فلو كبر الإمام أخرى قبل شروعه في الفاتحة كبر معه وسقطت القراءة وإن كبرها ms037 وهو في الفاتحة تركها وتابعه في الأصح وإذا سلم الإمام تدارك المسبوق باقي التكبيرات بأذكارها وفي قول لا يشترط الأذكار ويشترط

شروط الصلاة لا الجماعة ويسقط فرضها بواحد وقيل: يجب اثنان وقيل: ثلاثة وقيل: أربعة ولا يسقط بالنساء وهناك رجال في الأصح ويصلى على الغائب عن البلد ويجب تقديمها على الدفن وتصح بعده والأصح تخصيص الصحة بمن كان من أهل فرضها وقت الموت ولا يصلي على قبر رسول الله صلى الله عليه وسلم بحال.

فرع: الجديد أن الوالي أولى بإمامتها من الوالي فيقدم الأب ثم الجد وإن علا ثم الابن ثم ابنه ثم الأخ والأظهر تقديم الأخ لأبوين على الأخ لأب ثم ابن الأخ لأبوين ثم لأب ثم العصبة على ترتيب الإرث ثم ذووا الأرحام ولو اجتمعا في درجة فالأسن العدل أولى على النص ويقدم الحر البعيد على العبد القريب ويقف عند رأس الرجل وعجزها وتجوز على الجنائز صلاة وتحرم على الكافر ولا يجب غسله والأصح وجوب تكفين الذمي ودفنه ولو وجد عضو مسلم علم بموته صلى الله والسقط إن استهل أو بكى ككبير وإلا فإن ظهرت أمارة الحياة كاختلاج صلى عليه في الأظهر وإن لم تظهر ولم يبلغ أربعة أشهر لم يصل عليه وكذا إن بلغها في الأظهر ولا يغسل الشهيد ولا يصلى عليه وهو من مات في قتال الكفار بسببه فإن مات بعد انقضائه أو في قتال البغاة فغير شهيد في الأظهر وكذا في القتال لا بسببه على المذهب ولو استشهد جنب فالأصح أنه لا يغسل وأنه تزال نجاسته غير الدم ويكفن في ثيابه الملطخة بالدم فإن لم يكن ثوبه سابغا تمم.

فصل

أقل القبر حفرة تمنع الرائحة والسبع ويندب أن يوسع ويعمق قامة وبسطة واللحد أفضل من الشق إن صلبت الأرض ويوضع رأسه عند رجل القبر ويسل من قبل رأسه برفق ويدخله القبر الرجال وأولاهم الأحق بالصلاة.

قلت: إلا أن تكون امرأة مزوجة فأولاهم الزوج والله أعلم ويكونون وترا ويوضع في اللحد على يمينه للقبلة ويسند وجهه ms038 إلى جداره وظهره بلبنة ونحوها ويسد فتح اللحد بلبن ويحثو من دنا ثلاث حثيات تراب ثم يهال بالمساحي ويرفع القبر شبرا فقط والصحيح أن تسطيحه أولى من تسنيمه ولا يدفن اثنان في قبر إلا لضرورة فيقدم أفضلهما ولا يجلس على القبر ولا يوطأ ويقرب زائره كقربه منه حيا والتعزية سنة قبل دفنه وبعده ثلاثة أيام ويعزى المسلم بالمسلم أعظم الله أجرك وأحسن عزاءك وغفر لميتك وبالكافر أعظم الله أجرك وصبرك والكافر بالمسلم غفر الله لميتك وأحسن عزاءك ويجوز البكاء عليه قبل الموت وبعده ويحرم الندب بتعديد شمائله والنوح والجزع بضرب صدره ونحوه.

قلت: هذه مسائل منثورة يبادر بقضاء دين الميت ووصيته ويكره تمني الموت لضر نزل به إلا لفتنة دين ويسن التداوي ويكره إكراهه عليه ويجوز لأهل الميت ونحوهم تقبيل وجهه ولا بأس بالإعلام بموته للصلاة وغيرها بخلاف نعي الجاهلية ولا ينظر الغاسل من بدنه إلا قدر الحاجة من غير العورة ومن تعذر غسله يمم ويغسل الجنب والحائض الميت بلا كراهة وإذا ما غسلا غسلا واحد فقط وليكن الغاسل أمينا فإن رأى خيرا ذكره أو غيره حرم

ذكره إلا لمصلحة ولو تنازع أخوان أو زوجتان أقرع والكافر أحق بقريبه الكافر ويكره الكفن المعصفر والمغالاة فيه والمغسول أولى من الجديد والصبي كبالغ في تكفينه بأثواب والحنوط مستحب وقيل: واجب ولا يحمل الجنازة إلا الرجال وإن كانت أنثى ويحرم حملها على هيئة مزرية وهيئة يخاف منها سقوطها ويندب للمرأة ما يسترها كتابوت ولا يكره الركوب في الرجوع منها ولا بأس باتباع المسلم جنازة قريبه الكافر ويكره اللغط في الجنازة وإتباعها بنار ولو اختلط مسلمون بكفار وجب غسل الجميع والصلاة فإن شاء صلى على الجميع بقصد المسلمين وهو الأفضل والمنصوص أو على واحد فواحد ناويا الصلاة عليه إن كان مسلما ويقول اللهم اغفر له إن كان مسلما ويشترط لصحة الصلاة تقدم غسله وتكره قبل تكفينه فلو مات بهدم ونحوه وتعذر إخراجه وغسله لم يصل عليه ويشترط أن لا يتقدم على الجنازة الحاضرة ولا ms039 القبر على المذهب فيهما وتجوز الصلاة عليه في المسجد ويسن جعل صفوفهم ثلاثة فأكثر وإذا صلى عليه فحضر من لم يصل صلى ومن صلى لا يعيد على الصحيح ولا تؤخر لزيادة مصلين وقاتل نفسه كغيره في الغسل والصلاة ولو نوى الإمام صلاة غائب والمأموم صلاة حاضر أو عكس جاز والدفن بالمقبرة أفضل ويكره المبيت بها ويندب ستر القبر بثوب وإن كان رجلا وأن يقول بسم الله وعلى ملة رسول الله صلى الله عليه وسلم ولا يفرش تحته شيء ولا مخدة ويكره دفنه في تابوت إلا في أرض ندية أو رخوة ويجوز الدفن ليلا ووقت كراهة الصلاة إذا لم يتحره وغيرهما أفضل ويكره تجصيص القبر والبناء والكتابة عليه ولو بنى في مقبرة مسبلة هدم ويندب أن يرش القبر بماء ويوضع عليه حصى وعند رأسه حجر أو خشبة وجمع الأقارب في موضع وزيادة القبور للرجال وتكره للنساء وقيل: تحرم وقيل: تباح ويسلم الزائر ويقرأ ويدعو ويحرم نقل الميت إلى بلد آخر وقيل: يكره إلا أن يكون بقرب مكة أو المدينة أو بيت المقدس نص عليه ونبشه بعد دفنه للنقل وغيره حرام إلا لضرورة بأن دفن بلا غسل أو في أرض أو ثوب مغصوبين أو

وقع فيه مال أو دفن لغير القبلة لا للتكفين في الأصح ويسن أن يقف جماعة بعد دفنه عند قبره ساعة يسألون له التثبت ولجيران أهله تهيئة طعام يشبعهم يومهم وليلتهم ويلح عليهم في الأكل ويحرم تهيئته للنائحات. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 104;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 105, 'كتاب الزكاة', 'كتاب الزكاة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب الزكاة

باب زكاة الحيوان

إنما تجب منه في النعم وهي الإبل والبقر والغنم لا الخيل والرقيق والمتولد من غنم وظباء ولا شيء في الإبل حتى تبلغ خمسا ففيها شاة وفي عشر شاتان وخمس عشرة ثلاث وعشرين أربع وخمس وعشرين بنت مخاض وست وثلاثين بنت لبون وست وأربعين حقة وإحدى وستين جذعة وست سبعين بنتا لبون وإحدى وتسعين حقتان ومائة وإحدى وعشرين ثلاث بنات لبون ثم في كل أربعين بنت لبون وكل خمسين حقة وبنت المخاض ms040 لها سنة واللبون سنتان والحقة ثلاث والجذعة أربع والشاة جذعة ضان لها سنة وقيل: ستة أشهر أو ثنية معزلها سنتان وقيل: سنة والأصح أنه مخير بينهما ولا يتعين غالب غنم البلد وأنه يجزىء الذكر وكذا بعير الزكاة عن دون خمس وعشرين فإن عدم بنت المخاض فابن لبون والمعيبة كمعدومة ولا يكلف كريمة لكن تمنع ابن لبون في الأصح ويؤخذ

الحق عن بنت مخاض لا لبون في الأصح ولو اتفق فرضان كمائتي بعير فالمذهب لا يتعين أربع حقوق بل هن أو خمس بنات لبون فإن وجد بماله أحدهما وإلا أخذ وإلا فله تحصيل ما شاء وقيل: يجب الأغبط للفقراء وإن وجدهما فالصحيح تعين الأغبط ولا يجزىء غيره إن دلس أو قصر الساعي وإلا فيجزىء والأصح وجوب قدر التفاوت ويجوز إخراجه دراهم وقيل: يتعين تحصيل شقص به ومن لزمه بنت مخاض فعدمها وعنده بنت لبون دفعها وأخذ شاتين وعشرين درهما أو بنت لبون فعدمها دفع بنت مخاض مع شاتين أو عشرين درهما أو حقة وأخذ شاتين أو عشرين درهما والخيار في الشاتين والدراهم لدافعها وفي الصعود والنزول للمالك في الأصح إلا أن تكون إبله معيبة وله صعود درجتين وأخذ جبرانين ونزوله درجتين مع جبرانين بشرط تعذر درجة في الأصح ولا يجوز أخذ جبران مع ثنية بدل جذعة على أحسن الوجهين.

قلت: الأصح عند الجمهور الجواز والله أعلم ولا تجزىء شاة وعشرة دراهم وتجزي شاتان وعشرون لجبرانين ولا البقر حتى تبلغ ثلاثين ففيها تبيع ابن سنة ثم في كل ثلاثين تبيع وكل أربعين مسنة لها سنتان وإلا الغنم حتى تبلغ أربعين فشاة جذعة ضأن أو ثنية معزوفي مائة وإحدى وعشرين شاتان ومائتين وواحدة ثلاث وأربعمائة أربع ثم في كل مائة شاة.

فصل

إن اتحد نوع الماشية أخذ الفرض منه فلو أخذ عن ضأن معزا وعكسه جاز في الأصح بشرط رعاية القيمة وإن اختلف كضأن ومعز ففي قول يؤخذ من الأكثر فإن استويا فالأغبط والأظهر أنه يخرج ما شاء مقسطا عليهما بالقيمة فإن كان ms041 ثلاثون عنزا وعشر نعجات أخذ عنزا أو نعجت بقيمة ثلاث أرباع عنز وربع نعجة ولا تؤخذ مريضة ولا معيبة إلا من مثلها ولا ذكرا إلا إذا وجب وكذا لو تمحضت ذكورا في الأصح وفي الصغار وصغير في الجديد ولا ربي وأكولة وحامل وخيار إلا برضا المالك ولو اشترك أهل الزكاة في ماشية زكيا كرجل

وكذا لو خلطا مجاورة بشر أن لا تتميز في المشرب والمسرح والمراح وموضع الحلب وكذا الراعي والفحل في الأصح لا نية الخلطة في الأصح والأظهر تأثير خلطة الثمر وللزرع والنقد وعرض التجارة بشرط أن لا يتميز الناطور والجرين والد كان والحارس ومكان الحفظ ونحوها ولو وجب زكاة الماشية شرط إن مضى الحول في ملكه لكن ما نتج من نصاب يزكي بحوله ولا يضم المملوك بشراء وغيره في الحول فلو ادعى النتاج بعد الحول صدق فإن اتهم حلف ولو زال ملكه في الحول فعاد أو بادل بمثله استأنف وكونها سائمة فإن علفت معظم الحول فلا زكاة وإلا فالأصح إن علفت قدرا تعيش بدونه بلا ضرر بين وجبت وإلا فلا ولو سامت بنفسها أو اعتلفت السائمة أو كانت عوامل في حرث ونضح ونحوه فلا زكاة في الأصح وإذا وردت ماء أخذت زكاتها عنده وإلا فعند بيوت أهلها ويصدق المالك في عددها إن كان ثقة وإلا فتعد عند مضيق. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب زكاة النبات', 'تختص بالقوت وهو من الثمار الرطب والعنب ومن الحب الحنطة والشعير والأرز والعدس وسائر المقتات

اختيارا وفي القديم تجب في الزيتون والزعفران والورس والقرطم والعسل ونصابه خمسة أوسق وهي ألف وستمائة رطل بغدادية وبالدمشقي ثلثمائة وستة وأربعون رطلا وثنتان.

قلت: الأصح ثلثمائة واثنان وأربعون وستة أسباع رطل لأن الأصح أن رطل بغداد مائة وثمانية وعشرين درهما وأربعة أسباع درهم وقيل: بلا أسباع وقيل: ثلاثون والله

أعلم. ويعتبر تمرا أو زبيبا ان تتمر وتزبب وإلا فرطبا وعنبا والحب مصفى من تبنه وما ادخر في قشره كالأرز والعلس فعشرة أوسق ولا يكمل جنس بجنس ويضم النوع إلى ms042 النوع ويخرج من كل بقسطه فإن عسر أخرج الوسط ويضم العلس إلى الحنطة لأنه نوع منها والسلت جنس مستقل وقيل: شعير وقيل: حنطة ولا يضم ثمر عام وزرعه إلى آخر ويضم ثمر العام بعضه إلى بعض وإن اختلف إدراكه وقيل: إن طلع الثاني بعد جذاذ الأول لم يضم وزرعا العام يضمان والأظهر اعتبار وقوع حصاديهما في سنة وواجب ما شرب بالمطر أو عروقه لقربه من الماء من ثمر وزرع العشر وما سقى بنضح أو دولاب أو بماء اشتراه نصفه والقنوات كالمطر على الصحيح وما سقى بهما سواء ثلاثة أرباعه فإن غلب أحدهما ففي قول يعتبر هو والأظهر يسقط باعتبار عيش الزرع ونمائه وقيل: بعدد السقيات وتجب ببدو صلاح الثمر واشتداد الحب ويسن خرص أثرا إذا بدا صلاحه على مالكه والمشهور إدخال جميعه في الخرص وأنه يكفي خارص وشرطه العدلة وكذا الحرية والذكورة في الأصح فإذا خرص فإن الأظهر أن حق الفقراء ينقطع من عين الثمر ويصير في ذمة المالك التمر والزبيب ليخرجهما بعد جفافه ويشترط التصريح بتضمينه وقبول المالك على المذهب وقيل: ينقطع بنفس الخرص فإذا ضمن جاز تصرفه في جميع المخروص بيعا وغيره ولو ادعى هلاك المخروص بسبب خفي كسرقة أو ظاهر عرف صدق بيمينه فإن لم يعرف الظاهر طولب ببينة على الصحيح ثم يصدق بيمينه في الهلاك به ولو ادعى حيف الخارص أو غلطه بما يبعد لم يقبل أو بمحتمل قبل في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, 'باب زكاة النقد', 'نصاب الفضة مائتا درهم والذهب عشرون مثقالا بوزن مكة وزكاتهما ربع عشر ولا شيء في المغشوش حتى يبلغ خالصه نصابا ولو اختلط إناء منهما وجهل أكثرهما زكى الأكثر ذهبا وفضة أو ميز ويزكى المحرم من حلي وغيره لا المباح في الأظهر فمن المحرم الإناء والسواء والخلخال للبس الرجل فلو اتخذ سوارا بلا قصد أو بقصد إجارته لمن له استعمال فلا زكاة في الأصح وكذا لو انكسر الحلي وقصد إصلاحه ويحرم على الرجل الحلي الذهب إلا الأنف والأنملة والسن لا الإصبع ويحرم سن ms043 الخاتم على الصحيح ويحل له من الفضة الخاتم وحلية آلات الحرب كالسيف والرمح والمنطقة لا ما لا يلبسه كالسرج واللجام في الأصح وليس للمرأة حلية آلة الحرب ولها لبس أنواع حلي الذهب والفضة وكذا ما نسج بهما في الأصح والأصح تحريم المبالغة في السرف كخلخال وزنه مائتا دينار وكذا إسرافه في آلة الحرب وجواز تحلية المصحف بفضة وكذا للمرأة بذهب وشرط زكاة النقد الحول ولا زكاة في سائر الجواهر كاللؤلؤ.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, 'باب زكاة المعدن والركاز والتجارة', 'من استخرج ذهبا أو فضة من معدن لزمه ربع عشرة وفي قول الخمس وفي قول إن حصل بتعب فربع عشرة وإلا فخمسه ويشترط النصاب لا الحول على المذهب فيهما ويضم بعضه إلى بعض إن تتابع العمل ولا يشترط اتصال النيل على الجديد وإذا قطع

العمل بعذر ضم وإلا فلا يضم الأول إلى الثاني وبضم الثاني إلى الأول كما يضمه إلى ما ملكه بغير المعدن في إكمال النصاب وفي الركاز الخمس يصرف مصرف الزكاة على المشهور شرطه النصاب والنقد على المذهب لا الحول وهو الموجود الجاهلي فإن وجد إسلامي علم مالكه فله وإلا فلقطة وكذا إن لم يعلم من أي الضربين هو وإنما يملكه الواجد وتلزمه الزكاة إذا وجده في موات أو ملك أحياه فإن وجد في مسجد أو شارع فلقطة على المذهب أو في ملك شخص فللشخص إن ادعاه وإلا فلمن ملك منه وهكذا حتى ينتهي إلى المحي ولو تنازعه بائع ومشتر أو مكر ومكتر أو معير ومستعير صدق ذو اليد بيمينه.

فصل

شرط زكاة التجارة الحول والنصاب معتبرا بآخر الحول وفي قول بطرفيه وفي قول بجميعه فعلى الأظهر لورد إلى النقد في خلال الحول وهو دون النصاب واشترى به سلعة فالأصح أنه ينقطع الحول ويبتدأ حولها من شرائها ولو تم الحول وقيمة العرض دون النصاب فالأصح أنه يبتدأ حول ويبطل الأول ويصير عرض التجارة للقنية بنيتها وإنما يصير العرض للتجارة إذا اقترنت نيتها بكسبه بمعاوضة كشراء وكذا المهر وعوض الخلع في الأصح لا بالهبة ms044 والاحتطاب والاسترداد بعيب وإذا ملكه بنقد نصاب فحوله من حين ملك النقد أو دونه أو بعرض قنية فمن الشراء وقيل: إن ملكه بنصاب سائمة بنى على حولها ويضم الربح إلى الأصل في الحول إن لم ينض لا إن نض في الأظهر والأصح إن ولد لعرض وثمر مال تجارة وإن حوله حول الأصل وواجبها ربع عشرة القيمة فإن ملك بنقد قوم به إن ملك بنصاب وكذا دونه في الأصح أو بعرض فبغالت نقد البلد فإن غلب نقدان وبلغ

بأحدهما نصابا قوم به فإن بلغ بهما قوم بالأنفع للفقراء وقيل: يتخير المالك وإن ملك بنقد وعرض قوم ما قابل النقد به والباقي بالغالب وتجب فطرة عبد التجارة مع زكاتها ولو كان العرض سائمة فإن كمل نصاب إحدى الزكاتين فقط وجبت أو نصابهما فزكاة العين في الجديد فعلى هذا الوسبق حول التجارة بأن اشترى بمالها بعد ستة أشهر نصاب سائمة فالأصح وجوب زكاة التجارة لتمام حولها ثم يفتتح حولا لزكاة العين أبدا وإذا قلنا عامل القراض لا يملك الربح بالظهور فعلى المالك زكاة الجميع فإن أخرجها من مال القراض حسبت من الربح في الأصح وإن قلنا يملك بالظهور لزم المالك زكاة رأس المال وحصته من الريح والمذهب أنه يلزم العامل زكاة حصته.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, 'باب زكاة الفطر', 'تجب بأول ليلة العيد في الأظهر فتخرج عمن مات بعد الغروب دون من ولد ويسن أن لا تؤخر عن صلاته ويحرم تأخيرها عن يومه ولا فطرة على كافر إلا في عبده وقريبه المسلم في الأصح ولا رقيق وفي المكاتب وجه ومن بعضه حر يلزمه بقسطه ولا معسر فمن لم يفضل عن قوته وقوت من في نفقته ليلة العيد ويومه شيء فمعسر ويشترط كونه فاضلا عن مسكن وخادم يحتاج إليه في الأصح ومن لزمه فطرته لزمه فطرة من تلزمه نفقته لكن لا يلزم المسلم فطرة العبد والقريب والزوجة الكفار ولا العبد فطرة زوجته ولا الابن فطرة زوجة أبيه وفي الابن وجه ولو أعسر الزوج أو كان عبدا فالأظهر أنه ms045 يلزم زوجته الحرة فطرتها وكذا سيد الأمة.

قلت: الأصح المنصوص لا يلزم الحرة والله أعلم ولو انقطع خبره فالمذهب وجوب إخراج فطرته في الحال وقيل: إذا عاد وفي قول لا شيء والأصح أن من أيسر ببعض صاع يلزمه وأنه لو وجد بعض الصيعان قدم نفسه ثم زوجته ثم ولده الصغير ثم الأب ثم الأم ثم الكبير وهو صاع وهو ستمائة درهم وثلاثة وتسعون درهما وثلث.

قلت: والأصح ستمائة وخمسة وثمانون درهما وخمسة أسباع درهم لما سبق في زكاة النبات والله أعلم وجنسه القوت المعشر وكذا الأقط في الأظهر تجب من قوت بلده وقيل: قوته وقيل: يتخير بين الأقوات ويجزىء الأعلى على الأدنى ولا عكس والاعتبار بزيادة القيمة في وجه وبزيادة الاقتيات في الأصح فالبر خير من التمر والأرز والأصح أن الشعير خير من التمر وأن التمر خير من الزبيب وله أن يخرج عن نفسه من قوته وعن قريبه أعلى منه ولا يبعض الصاع ولو كان في بلد أقوات لا غالب فيها تخير والأفضل أشرفها ولو كان عبده ببلد آخر فالأصح أن الاعتبار بقوت بلد العبد.

قلت: الواجب الحب السليم ولو أخرج من ماله فطرة ولده الصغير الغني جاز كأجنبي أذن بخلاف الكبير ولو اشترك موسر أو معسر في عبد لزم الموسر نصف صاع ولو أيسر أو اختلف واجبهما أخرج كل واحد نصف صاع من واجبه في الأصح. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, 'باب من تلزمه الزكاة وما تجب فيه', 'شرط وجوب زكاة المال الإسلام والحرية وتلزم المرتد إن أبقينا ملكه دون المكاتب وتجب في مال الصبي والمجنون وكذا من ملك ببعضه الحر نصابا في الأصح وفي المغصوب والضال والمجحود في الأظهر ولا يجب دفعها حتى يعود والمشتري قبل قبضه

وقيل: فيه القولان وتجب في الحال عن الغائب إن قدر عليه وإلا فكمغصوب والدين وإن كان ماشية أو غير لازم كمال كتابة فلا زكاة أو عرضا أو نقدا فكذا في القديم وفي الجديد أنه إن كان حالا وتعذر أخذه لإعسار وغيره فكمغصوب وإن تيسر ms046 وجب تزكيته في الحال أو مؤجلا فالمذهب انه كمغصوب وقيل: يجب دفعها قبل قبضه ولا يمنع الدين وجوبها في أظهر الأقوال والثالث: يمنع في المال الباطن وهو النقد والعرض فعلى الأول لو حجر عليه لدين فحال الحول في الحجر فكمغصوب ولو اجتمع زكاة ودين آدمي في تركة قدمت وفي قول الدين وفي قول يستويان والغنيمة قبل القسمة إن اختار الغانمون تملكها ومضى بعده حول والجميع صنف زكوي وبلغ نصيب كل شخص نصابا أو بلغه المجموع في موضع ثبوت الخلطة وجبت زكاتها وإلا فلا ولو أصدقها نصاب سائمة معينا لزمها زكاته إذا تم حول من الإصداق ولو أكرى دارا أربع سنين بثمانين دينارا وقبضها فالأظهر انه لا يلزمه أن يخرج إلا زكاة ما استقر فيخرج عند تمام السنة الأولى زكاة عشرين ولتمام الثانية زكاة عشرين لسنة وعشرين لسنتين ولتمام الثالثة: زكاة أربعين لسنة وعشرين لثلاث سنين ولتمام الرابعة: زكاة ستين لسنة وعشرين لأربع والثاني يخرج لتمام الأولى زكاة ثمانين.

فصل

تجب الزكاة على الفور إذا تمكن وذلك بحضور المال والأصناف وله أن يؤدي بنفسه زكاة المال الباطن وكذا الظاهر على الجديد وله التوكيل والصرف إلى الإمام والأظهر أن الصرف إلى الإمام أفضل إلا أن يكون جائرا وتجب النية فينوي هذا فرض زكاة مالي أو فرض صدقة مالي ونحوهما ولا يكفي هذا فرض مالي وكذا الصدقة في الأصح ولا يجب تعيين المال ولو عين لم يقع عن غيره ويلزم الولي النية إذا أخرج زكاة الصبي أو المجنون

وتكفي نية الموكل عند الصرف إلى الوكيل في الأصح والأفضل أن ينوي الوكيل عند التفريق أيضا ولو دفع إلى السلطان كفت النية عنده فإن لم ينو يجزىء على الصحيح وإن نوى السلطان والأصح أنه يلزم السلطان النية إذا اخذ زكاة الممتنع وأن نيته تكفي.

فصل

لا يصح تعجيل الزكاة على مالك النصاب ويجوز قبل الحول ولا تعجيل لعامين في الأصح وله تعجيل الفطرة من أول رمضان والصحيح منعه قبله وأنه لا يجوز إخراج زكاة التمر ms047 قبل بدو صلاحه ولا الحب قبل اشتداده ويجوز بعدهما وشرط إجزاء المعجل إبقاء المالك أهلا للوجوب إلى آخر الحول وكون القابض في آخر الحول مستحقا وقيل: إن خرج عن الاستحقاق في أثناء الحول لم يجزه ولا يضر غناه بالزكاة وإذا لم يقع المعجل زكاة استرد إن كان شرط الاسترداد إن عرض مانع والأصح أنه لو قال هذه زكاتي المعجلة فقط استرد وأنه إن لم يتعرض للتعجيل ولم يعلمه القابض لم يسترد وأنهما لو اختلفا في مثبت الاسترداد صدق القابض بيمينه ومتى ثبت والمعجل تالف وجب ضمانه والأصح اعتبار قيمته يوم القبض وأنه لو وجده ناقصا فلا أرش وأنه لا يسترد زيادة منفصلة وتأخير الزكاة بعد التمكن يوجب الضمان إن تلف المال ولو تلف قبل التمكن فلا ولو تلف بعضه فالأظهر أنه يغرم قسط ما بقي وإن أتلفه بعد الحول وقبل التمكن لم تسقط الزكاة وهي تتعلق بالمال تعلق شركة وفي قول تعلق الرهن وفي قول بالذمة فلو باعه قبل إخراجها فالأظهر بطلانه في قدرها وصحته في الباقي.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 105;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 106, 'كتاب الصيام', 'كتاب الصيام');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب الصيام

يجب صوم رمضان بإكمال شعبان ثلاثين أو رؤية الهلال وثبوت رؤيته بعدل وفي قول عدلان وشرط الواحد صفة العدول في الأصح لا عبد وامرأة وإذا صمنا بعدل ولم نر الهلال بعد ثلاثين أفطرنا في الأصح وإن كانت السماء مصحية وإذا رؤى ببلد لزم حكمه البلد القريب دون البعيد في الأصح ومسافة البعيد مسافة القصر وقيل: باختلاف المطالع.

قلت: هذا أصح والله أعلم وإذا لم يوجب على البلد الآخر فسافر إليه من بلد الرؤية فالأصح أنه يوافقهم في الصوم آخرا ومن سافر من البلد الآخر إلى بلد الرؤية عيد معهم وقضى يوما ومن أصبح معيدا فسارت سفينته إلى بلدة بعيدة أهلها صيام فالأصح أنه يمسك بقية اليوم.

فصل

النية شرط للصوم ويشترط لفرضه التبييت والصحيح أنه لا يشترط النصف الآخر من الليل وأنه لا يضر الأكل والجماع بعدها وأنه لا يجب لتجديد إذا نام ثم تنبه ويصح النفل بنية ms048 قبل الزوال وكذا بعده في قول والصحيح اشتراط حصول شرط الصوم من أول النهار.

ويجب التعيين في الفرض وكماله في رمضان أن ينوي صوم غد عن أداء فرض رمضان هذه السنة لله تعالى وفي الأداء والفرضية والإضافة إلى الله تعالى الخلاف المذكور في الصلاة والصحيح أنه لا يشترط تعيين السنة ولو نوى ليلة الثلاثين من شعبان صوم غد عن رمضان إن كان منه فكان منه لم يقع عنه إلا إذا اعتقد كونه منه بقول من يثق به من عبد أو امرأة أو صبيان رشداء ولو نوى ليلة الثلاثين من رمضان صوم غد إن كان من رمضان أجزأه إن كان منه ولو اشتبه صام شهرا بالاجتهاد فإن وافق ما بعد رمضان أجزأه وهو قضاء على الأصح فلو نقص وكان رمضان تاما لزمه يوم آخر ولو غلط بالتقديم وأدرك رمضان لزمه صومه وإلا فالجديد وجوب القضاء ولو نوت الحائض صوم غد قبل انقطاع دمها ثم انقطع ليلا صح إن تم لها في الليل أكثر الحيض وكذا قدر العادة في الأصح.

فصل

شرط الصوم الإمساك عن الجماع والاستقاءة والصحيح انه لو تيقن أنه لم يرجع شيء إلى جوفه بطل وإن غلبه القيء فلا بأس وكذا لو اقتلع نخامة ولفظها في الأصح فلو نزلت من دماغه وحصلت في حد الظاهر من الفم فليقطعها من مجراها وليمجها فإن تركها مع القدرة فوصلت الجوف أفطر في الأصح وعن وصول العين إلى ما يسمى جوفا وقيل: يشترط مع هذا أن يكون فيه قوة تحيل الغذاء أو الدواء فعلى الوجهين باطن الدماغ والبطن والأمعاء والمثانة مفطر بالاستعاط أو الأكل أو الحقنة أو الوصول من جائفة أو مأمومة ونحوهما والتقطير في باطن الأذن وإلا حليل مفطر في الأصح وشرط الواصل كونه من منفذ مفتوح فلا يضر وصول الدهن بتشرب المسام ولا الاكتحال وإن وجد طعمه بحلقه وكونه بقصد فلو وصل جوفه ذباب أو بعوضة أو غبار الطريق أو غربلة الدقيق لم يفطر ولا يفطر ببلع ريقه من معدنه فلو ms049 خرج عن الفم ثم رده وابتلعه أو بل خيطا بريقه ورده إلى فمه وعليه رطوبة تنفصل أو ابتلع ريقه مخلوطا بغيره أو متنجسا أفطر ولو جمع ريقه فابتلعه لم يفطر في الأصح ولو سبق ماء المضمضة أو الاستنشاق إلى جوفه فالمذهب أنه إن بالغ

أفطر وإلا فلا ولو بقي طعام بين أسنانه فجرى به ريقه لم يفطر إن عجر عن تمييزه ومجه ولو أوجر مكرها لم يفطر وإن أكره حتى أكل أفطر في الأظهر.

قلت: الأظهر لا يفطر والله أعلم وإن أكل ناسيا لم يفطر إلا أن يكثر في الأصح قلت: الأصح لا يفطر والله أعلم والجماع كالأكل على المذهب وعن الاستمناء فيفطر به وكذا خروج المنى بلمس وقبلة ومضاجعة لا فكر ونظر بشهوة وتكره القبلة لمن حركت شهوته والأولى لغيره تركها.

قلت: هي كراهة تحريم في الأصح والله أعلم ولا يفطر بالقصد والحجامة والاحتياط أن لا يأكل آخر النهار إلا بيقين ويحل بالاجتهاد في الأصح ويجوز إذا ظن بقاء الليل.

قلت: وكذا لو شك والله أعلم ولو أكل باجتهاد أولا أو آخر أو بان الغلط بطل صومه أو بلا ظن ولم يبن الحال صح إن وقع في أوله وبطل في آخره ولو طلع الفجر وفي فمه طعام فلفظه صح صومه وكذا لو كان مجامعا فنزع في الحال فإن مكث بطل.

فصل

شرط الصوم الإسلام والعقل والنقاء عن الحيض والنفاس جميع النهار ولا يضر النوم المستغرق على الصحيح والأظهر أن الإغماء لا يضر إذا أفاق لحظة من نهار ولا يصح صوم العيد وكذا التشريق في الجديد ولا يحل التطوع يوم الشك بلا سبب فلو صامه لم يصح في الأصح وله صومه عن القضاء والنذر وكذا لو وافق عادة تطوعه وهو يوم الثلاثين من شعبان إذا تحدث الناس برؤيته أو شهد بها صبيان أو عبيد أو فسقة وليس إطباق العيم بشك ويسن تعجيل الفطر على تمر وإلا فماء وتأخير السحور ما لم يقع في شك وليصن لسانه عن الكذب والغيبة ونفسه ms050 عن الشهوات ويستحب أن يغتسل عن الجنابة قبل الفجر وأن يحترز

عن الحجامة والقبلة وذوق الطعام والعلك وأن يقول عند فطره اللهم لك صمت وعلى رزقك أفطرت وأن يكثر الصدقة وتلاوة القرآن في رمضان وأن يعتكف لا سيما في العشر الأواخر منه.

فصل

شرط وجوب صوم رمضان العقل والبلوغ وإطاقته ويؤمر به الصبي لسبع إذا أطاق ويباح تركه للمريض إذا وجد به ضررا شديدا وللمسافر سفرا طويلا مباحا ولو أصبح صائما فمرض أفطر وإن سافر فلا ولو أصبح المسافر والمريض صائمين ثم أراد الفطر جاز فلو أقام وشفى حرم الفطر على الصحيح وإذا أفطر المسافر والمريض قضيا وكذا الحائض والمفطر بلا عذر وتارك النية ويجب قضاء ما فات بالإغماء والردة دون الكفر الأصلي والصبا والجنون وإذا بلغ بالنهار صائما وجب إتمامه بلا قضاء ولو بلغ فيه مفطرا أو أفاق أو أسلم فلا قضاء في الأصح ولا يلزمهم إمساك بقية النهار في الأصح ويلزم من تعدى بالفطر أو نسي النية لا مسافرا ومريضا زال عذرهما بعد الفطر ولو زال قبل أن يأكلا ولم ينويا ليلا فكذا في المذهب والأظهر أنه يلزم من أكل يوم الشك ثم ثبت كونه من رمضان وإمساك بقية اليوم من خواص رمضان بخلاف النذر والقضاء.

فصل

من فاته شيء من رمضان فمات قبل إمكان القضاء فلا تدارك له ولا إثم وإن مات بعد التمكن لم يصم عنه وليه في الجديد بل يخرج من تركته لكل يوم مد طعام وكذا النذر والكفارة.

قلت: القديم هنا أظهر والولي كل قريب على المختار ولو صام أجنبي بإذن الولي صح لا مستقلا في الأصح ولو مات وعليه صلاة أو اعتكاف لم يفعل عنه ولا فدية وفي الاعتكاف قول والله أعلم والأظهر وجوب المد على من أفطر للكبر وأما الحامل والمرضع فإن أفطرتا خوفا على نفسهما وجب القضاء بلا فدية أو على الولد لزمتهما الفدية في الأظهر والأصح أنه يلحق بالمرضع من أفطر لإنقاذ مشرف على هلاك لا المتعدي بفطر رمضان بغير ms051 جماع ومن أخر قضاء رمضان مع إمكانه حتى دخل رمضان آخر لزمه مع القضاء لكل يوم مد والأصح تكرره بتكرر السنين وإنه لو أخر القضاء مع إمكانه فمات أخرج من تركته لكل يوم مدان مد للفوات ومد للتأخير ومصرف الفدية الفقراء والمساكين وله صرف إمداد إلى شخص واحد وجنسها جنس الفطرة.

فصل

تجب الكفارة فإفساد صوم يوم من رمضان بجماع أثم به بسبب الصوم فلا كفارة على ناس ولا مفسد غير رمضان أو بغير الجماع ولا مسافر جامع بنية الترخص وكذا بغيرها في الأصح ولا على من ظن الليل فبان نهارا ولا على من جامع بعد الأكل ناسيا وظن أنه أفطر به وإن كان الأصح بطلان صومه ولا من زنى ناسيا ولا مسافر أفطر بالزنا مترخصا والكفارة على الزوج عنه وفي قول عنه وعنها وفي قول عليها كفارة أخرى وتلزم من انفرد برؤية الهلال وجامع في يومه ومن جامع في يومين لزمه كفارتان وحدوث السفر بعد الجماع لا يسقط الكفارة وكذا المرض على المذهب ويجب معها قضاء يوم الإفساد على الصحيح وهي عتق رقبة مؤمنة فإن لم يجد فصيام شهرين متتابعين فإن لم يستطع فإطعام

ستين مسكينا فلو عجز عن الجميع استقرت في ذمته في الأظهر فإذا قدر على خصلة فعلها والأصح أن له العدول عن الصوم إلى الإطعام لشدة الغلمة وأنه لا يجوز للفقير صرف كفارته إلى عياله.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب صوم التطوع', 'يسن صوم الاثنين والخميس وعرفة وعاشوراء وتاسوعاء وأيام البيض وستة من شوال وتتابعها أفضل ويكره إفراد الجمعة وإفراد السبت وصوم الدهر غير العيد والتشريق مكروه لمن خاف به ضررا أو فوت حق ومستحب لغيره ومن تلبس بصوم تطوع أو صلاته فله قطعهما ولا قضاء ومن تلبس بقضاء حرم عليه قطعه إن كان على الفور وهو صوم من تعدى بالفطر. وكذا إن لم يكن على الفور في الأصح بأن لم يكن تعدى بالفطر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 106;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 107, 'كتاب الاعتكاف', 'كتاب الاعتكاف');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'هو مستحب كل وقت وفي العشر الأواخر من رمضان أفضل لطلب ليلة القدر وميل ms052 الشافعي رحمه الله إلى أنها ليلة الحادي أو الثالث والعشرين وإنما يصح الاعتكاف في المسجد والجامع أولى والجديد أنه لا يصح اعتكاف امرأة في مسجد بيتها وهو المعتزل المهيأ للصلاة ولو عين المسجد الحرام في نذره الاعتكاف تعين وكذا مسجد المدينة والأقصى في الأظهر ويقوم المسجد الحرام مقامهما ولا عكس ويقوم مسجد المدينة مقام الأقصى ولا عكس والأصح أنه يشترط في الاعتكاف لبث قدر يسمى عكوفا وقيل: يكفي مرور بلا لبث وقيل: يشترط مكث نحو يوم ويبطل بالجماع وأظهر الأقوال أن المباشرة بشهوة كلمس وقبلة تبطله إن أنزل وإلا فلا ولو جامع ناسيا فكجماع الصائم ولا يضر التطيب والتزين والفطر بل يصح اعتكاف الليل وحده ولو نذر اعتكاف يوم هو فيه صائم لزمه ولو نذر أن يعتكف صائما أو يصوم معتكفا لزماه والأصح وجوب جمعهما ويشترط نية الاعتكاف وينوي في النذر الفرضية وإذا أطلق كفته نيته وإن طال مكثه لكن لو خرج وعاد احتاج إلى الاستئناف ولو نوى مدة فخرج فيها وعاد فإن خرج لغير قضاء الحاجة لزمه الاستئناف أولها فلا وقيل: إن طالت مدة خروجه استأنف وقيل: لا يستأنف مطلقا ولو نذر مدة متتابعة فخرج لعذر لا يقطع التتابع لم يجب استئناف النية وقيل: إن خرج لغير حاجة وغسل الجنابة وجب وشرط المعتكف الإسلام والعقل والنقاء عن الحيض والجنابة ولو

ارتد المعتكف أو سكر بطل والمذهب بطلان ما مضى من اعتكافهما المتتابع ولو طرأ جنون أو إغماء لم يبطل ما مضى إن لم يخرج ويحسب زمن الإغماء من الاعتكاف دون الجنون أو الحيض وجب الخروج وكذا جنابة إن تعذر الغسل في المسجد فلو أمكن جاز الخروج ولا يلزم ولا يحسب زمن الحيض ولا الجنابة.

فصل

إذا نذر متتابعة لزمه والصحيح أنه لا يجب التتابع بلا شرط وأنه لو نذر يوما لم يجز تفريق ساعاته وأنه لو عين مدة كأسبوع وتعرض للتتابع وفاته لزمه التتابع في القضاء وإن لم يتعرض له لم يلزمه في القضاء وإذا ذكر التتابع وشرط الخروج ms053 لعارض صح الشرط في الأظهر والزمان المصروف إليه لا يجب تداركه إن عين المدة كهذا الشهر وإلا فيجب وينقطع التتابع بالخروج بلا عذر ولا يضر إخراج بعض الأعضاء ولا الخروج لقضاء الحاجة ولا يجب فعلها في غير داره ولا يضر بعدها إلا أن يفحش فيضر في الأصح ولو عاد مريضا في طريقه لم يضر ما لم يطل وقوفه أو يعدل عن طريقه ولا ينقطع التتابع بمرض يحوج إلى الخروج ولا بحيض إن طالت مدة الاعتكاف فإن كانت بحيث تخلو عنه انقطع في الأظهر ولا بخروج ناسيا على المذهب ولا بخروج مؤذن راتب إلى منارة منفصلة عن المسجد للأذان في الأصح ويجب قضاء أوقات الخروج بالأعذار إلا وقت قضاء الحاجة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 107;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 108, 'كتاب الحج', 'كتاب الحج');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب الحج

هو فرض وكذا العمرة في الأظهر وشرط صحته الإسلام فللوي أن يحرم عن الصبي الذي لا يميز والمجنون وإنما تصح مباشرته من المسلم المميز وإنما يقع عن حجة الإسلام بالمباشرة إذا باشره المكلف الحر فيجزىء حج الفقير دون الصبي والعبد وشرط وجوبه الإسلام والتكليف والحرية والاستطاعة وهي نوعان أحدهما: استطاعة مباشرة ولها شروط.

أحدها: وجود الزاد وأوعيته ومؤنة ذهابه وإيابه وقيل: إن لم يكن له ببلده أهل وعشيرة لم تشترط نفقة الإياب فلو كان يكتسب كل يوم ما يفي بزاده وسفره طويل لم يكلف الحج وإن قصر وهو يكتسب في يوم كفاية أيام كلف.

الثاني: وجود الراحلة لمن بينه وبين مكة مرحلتان فإن لحقته بالراحلة مشقة شديدة اشترط وجود محمل واشترط شريك يجلس في الشق الآخر ومن بينه وبينها دون مرحلتين وهو قوي على المشي يلزمه الحج فإن ضعف فكالبعيد ويشترط كون الزاد والراحلة فاضلين عن دينه ومؤنة من عليه نفقتهم مدة ذهابه وإيابه والأصح اشتراط كونه فاضلا عن مسكنه وعبد يحتاج إليه لخدمته وأنه يلزمه صرف مال تجارته إليهما.

الثالث: أمن الطريق فلو خاف على نفسه أو ماله سبعا أو عدوا أو رصديا ولا طريق

سواه لم يجب الحج والأظهر وجوب ركوب البحر إن غلبت ms054 السلامة وأنه يلزمه أجرة البذرقة ويشترط وجود الماء والزاد في المواضع المعتاد حمله منها بثمن المثل وهو القدر اللائق به في ذلك الزمان والمكان وعلف الدابة في كل مرحلة وفي المرأة أن يخرج معها زوج أو محرم أو نسوة ثقات والأصح أنه لا يشترط وجود محرم لإحداهن وأنه يلزمها أجرة المحرم إذا لم يخرج إلا بها.

الرابع: أن يثبت على الراحلة بلا مشقة شديدة وعلى الأعمى الحج إن وجد قائدا وهو كالمحرم في حق المرأة والمحجور عليه لسفه كغيره لكن لا يدفع المال إليه بل يخرج معه الولي أو ينصب شخصا له.

النوع الثاني: استطاعة تحصيله بغيره فمن مات وفي ذمته حج وجب الإحجاج عنه من تركته والمعضوب العاجز عن الحج بنفسه إن وجد أجرة من يحج عنه بأجرة المثل لزمه ويشترط كونها فاضلة عن الحاجات المذكورة فيمن حج بنفسه لكن لا يشترط نفقة العيال ذهابا وإيابا ولو بذل ولده أو أجنبي مالا للأجرة لم يجب قبوله في الأصح ولو بذل الولد الطاعة وجب قبوله وكذا الأجنبي في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب المواقيت', 'وقت إحرام الحج شوال وذو القعدة وعشر ليال من ذي الحجة وفي ليلة النحر وجه فلو أحرم به في غير وقته انعقد عمرة على الصحيح وجميع السنة وقت لإحرام العمرة والميقات المكاني للحج في حق من بمكة نفس مكة وقيل: كل الحرم وأما غيره فميقات

المتوجه من المدينة ذو الحليفة ومن الشام ومصر والمغرب الجحفة ومن تهامة اليمن يلملم ومن نجد الحجاز قرن ومن المشرق ذات عرق والأفضل أن يحرم من أول الميقات ويجوز من آخره ومن سلك طريقا لا ينتهي إلى ميقات فإن حاذى ميقاتا أحرم من محاذاته أو ميقاتين فالأصح أنه يحرم من محاذاة أبعدهما وإن لم يحاذ أحرم على مرحلتين من مكة ومن مسكنه بين مكة والميقات فميقاته مسكنه ومن بلغ ميقاتا غيرت مريد نسكا ثم أراده فميقاته موضعه وإن بلغه مريدا لم تجز مجاوزته بغير إحرام فإن فعل لزمه العود ليحرم منه إلا إذا ضاق ms055 الوقت أو كان الطريق مخوفا فإن لم يعد لزمه دام وإن أحرم ثم عاد فالأصح أنه إن عاد قبل تلبسه بنسك سقط الدم وإلا فلا والأفضل أن يحرم من دويرة أهله وفي قول من الميقات قلت: الميقات أظهر وهو الموافق للأحاديث الصحيحة والله أعلم وميقات العمرة لمن هو خارج الحرم ميقات الحج ومن بالحرم يلزمه الخروج إلى أدنى الحل ولو بخطوة فإن لم يخرج وأتى بأفعال العمرة أجزأته في الأظهر وعليه دم فلو خرج إلى الحل بعد إحرامه سقط الدم على المذهب وأفضل بقاع الحل الجعرانة ثم التنعيم ثم الحديبية.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, 'باب الإحرام', 'ينعقد معينا بأن ينوي حجا أو عمرة أو كليهما ومطلقا بأن لا يزيد على نفس الإحرام والتعيين أفضل وفي قول الإطلاق فإن أحرم مطلقا في أشهر الحج صرفه بالنية إلى ما شاء من النسكين أو إليهما ثم اشتغل بالأعمال وإن أطلق في غير أشهره فالأصح انعقاده عمرة فلا يصرفه إلى الحج في أشهره وله أن يحرم كإحرام زيد فإن لم يكن زيد محرما انعقد إحرامه مطلقا وقيل: إن علم عدم إحرام زيد لم ينعقد وإن كان زيد محرما انعقد إحرامه

كإحرامه فإن تعذر معرفة إحرامه بموته جعل نفسه قارنا وعمل أعمال النسكين.

فصل

المحرم ينوي ويلبي فإن لبى بلا نية لم ينعقد إحرامه وإن نوى ولم يلب انعقد على الصحيح ويسن الغسل للإحرام فإن عجز تيمم ولدخول مكة وللوقوف بعرفة وبمزدلفة غداة النحر وفي أيام التشريق للرمي وأن يطيب بدنه للإحرام وكذا ثوبه في الأصح ولا بأس باستدامته بعد الإحرام ولا بطيب له جرم لكن لو نزع ثوبه المطيب ثم لبسه لزمه الفدية في الأصح وأن تخضب المرأة للإحرام يديها ويتجرد الرجل لإحرامه عن مخيط الثياب ويلبس إزارا ورداء أبيضين ونعلين ويصلي ركعتين ثم الأفضل أن يحرم إذا انبعثت به راحلته أو توجه لطريقه ماشيا وفي قول يحرم عقب الصلاة ويستحب إكثار التلبية ورفع صوته بها في دوام إحرامه وخاصة عند تغاير الأحول كركوب ونزول وصعود وهبوط واختلاط ms056 رفقة ولا تستحب في طواف القدوم وفي القديم تستحب فيه بلا جهر ولفظها لبيك اللهم لبيك لبيك لا شريك لك لبيك إن الحمد والنعمة لك والملك لا شريك لك وإذا رأى ما يعجبه قال لبيك إن العيش عيش الآخرة وإذا فرغ من تلبيته صلى على النبي صلى الله عليه وسلم وسأل الله تعالى الجنة ورضوانه واستعاذ به من النار.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, 'باب دخول مكة', 'الأفضل دخولها قبل الوقوف وأن يغتسل داخلها من طريق المدينة بذي طوى ويدخلها من مر ثنية كداء ويقول إذا أبصر البيت اللهم زد هذا البيت تشريفا وتعظيما وتكريما ومهامة،

وزد من شرفه وعظمه ممن حجه أو اعتمره تشريفا وتكريما وتعظيما وبرا اللهم أنت السلام ومنك

السلام فحينا ربنا بالسلام ثم يدخل المسجد من باب بني شيبة ويبتدىء بطواف القدوم ويختص طواف القدوم بحاج دخل مكة قبل الوقوف ومن قصد مكة لا لنسك استحب له أن يحرم بحج أو عمرة وفي قول يجب إلا أن يتكرر دخوله كحطاب وصياد.

فصل

للطواف بأنواعه واجبات وسنن أما الواجبات: فيشترط ستر العورة وطهارة الحدث والنجس فلو أحدث فيه توضأ وبنى وفي قول يستأنف وأن يجعل البيت عن يساره مبتدئا بالحجر الأسود محاذيا له في مروره بجميع بدنه فلو بدأ بغير الحجر لم يحسب فإذا انتهى إليه ابتدأ منه ولو مشى على الشاذروان أو مس الجدرا في موازاته أو دخل من إحدى فتحتي الحجر وخرج من الأخرى لم تصح طوفته وفي مسألة المس وجه وأن يطوف سبعا داخل المسجد.

وأما السنن: فأن يطوف ماشيا ويستلم الحجر أول طوافه ويقبله ويضع جبهته عليه فإن عجز استلم فإن عجز أشار بيده ويراعي ذلك في كل طوفة ولا يقبل الركنين الشاميين ولا يستلمهما ويستلم اليماني ولا يقبله وأن يقول أول طوافه بسم الله والله أكبر اللهم إيمانا بك وتصديقا بكتابك ووفاء بعهدك واتباعا لسنة نبيك محمد صلى الله عليه وسلم وليقل قبالة الباب اللهم إن البيت بيتك والحرم حرمك والأمن أمنك وهذا مقام العائذ بك من ms057 النار وبين اليمانيين اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار وليدع بما شاء

ومأثور الدعاء أفضل من القراءة وهي أفضل من غير مأثوره وأن يرمل في الأشواط الثلاثة الأولى بأن يسرع مشيه مقاربا خطاه ويمشي في الباقي ويختص الرمل بطواف يعقبه سعي وفي قول بطواف القدوم وليقل فيه اللهم اجعله حجا مبرورا وذنبا مغفورا وسعيا مشكورا وأن يضطبع في جميع كل طواف يرمل فيه وكذا في السعي على الصحيح وهو جعل وسط ردائه تحت منكبه الأيمن وطرفيه على الأيسر ولا ترمل المرأة ولا تضطبع وأن يقرب من البيت فلو فات الرمل بالقرب لزحمة فالرمل مع بعد أولى إلا أن يخاف صدم النساء فالقرب بلا رمل أولى وأن يوالي طوافه ويصلي بعده ركعتين خلف المقام يقرأ في الأولى قل يا أيها الكافرون وفي الثانية الإخلاص ويجهر ليلا وفي قول تجب الموالاة والصلاة ولو حمل الحلال محرما وطاف به حسب للمحمول وكذا لو حمله محرم قد طاف عن نفسه وإلا فالأصح أنه إن قصده للمحمول فله وإن قصده لنفسه أولهما فللحامل فقط.

فصل

يستلم الحجر بعد الطواف وصلاته ثم يخرج من باب الصف للسعي وشرطه أن يبدأ بالصفا وأن يسعى سبعا ذهابه من الصفا إلى المروة مرة وعوده منها إليه أخرى وأن يسعى بعد طواف ركن أو قدوم بحيث لا يتخلل بينهما الوقوف بعرفة ومن سعى بعد قدوم لم يعده ويستحب أن يرقى على الصفا والمروة قدر قامة فإذا رقى قال: الله أكبر الله أكبر الله أكبر

ولله الحمد الله أكبر على ما هدانا والحمد لله على ما أولانا لا إله إلا الله وحده لا شريك له له الملك وله الحمد يحي ويميت بيده الخير وهو على كل شيء قدير ثم يدعو بما شاء دينا ودنيا.

قلت: ويعيد الذكر والدعاء ثانيا وثالثا، والله أعلم. وأن يمشي أول المسعى وآخره ويدعو في الوسط وموضع النوعين معروف.

فصل

يستحب للإمام أو منصوبه أن يخطب بمكة في سابع ذي الحجة بعد ms058 صلاة الظهر خطبة فردة يأمر فيها بالغدو إلى منى ويعلمهم ما أمامهم من المناسك ويخرج بهم من الغد إلى منى ويبيتون بها فإذا طلعت الشمس قصدوا عرفات.

قلت: ولا يدخلونها بل يقيمون بنمرة بقرب عرفات حتى نزول الشمس والله أعلم ثم يخطب الإمام بعد الزوال خطبتين ثم يصلي بالناس الظهر والعصر جمعا ويقفوا بعرفة إلى الغروب ويذكروا الله تعالى ويدعوه ويكثروا التهليل فإذا غربت الشمس قصدوا مزدلفة وأخروا المغرب ليصلوها مع العشاء بمزدلفة جمعا وواجب الوقوف حضوره بجزء من أرض عرفات وإن كان مارا في طلب آبق ونحوه بشرط كونه أهلا للعبادة لا مغمى عليه ولا بأس بالنوم ووقت الوقوف من الزوال يوم عرفة والصحيح بقاؤه إلى الفجر يوم النحر ولو وقف نهارا ثم فارق عرفة قبل الغروب ولم يعد أراق دما استحبابا وفي قول يجب وإن عاد فكان بها عند الغروب فلا دم وكذا إن عاد ليلا في الأصح ولو وقفوا اليوم العاشر غلطا أجزأهم إلا

أن يقلوا على خلاف العادة فيقضون في الأصح وإن وقفوا في الثامن وعلموا قبل فوات الوقت وجب الوقوف في الوقت وإن علموا بعده وجب القضاء في الأصح.

فصل

ويبيتون بمزدلفة ومن دفع منها بعد نصف الليل أو قبله وعاد قبل الفجر فلا شيء عليه ومن لم يكن بها في النصف الثاني أراق دما وفي وجوبه القولان ويسن تقديم النساء والضعفة بعد نصف الليل إلى منى ويبقى غيرهم حتى يصلوا الصبح مغلسين ثم يدفعون إلى منى ويأخذون من مزدلفة حصى الرمي فإذا بلغوا المشعر الحرام وقفوا ودعوا إلى الأسفار ثم يسيرون فيصلون منى بعد طلوع الشمس فيرمي كل شخص حينئذ سبع حصيات إلى جمرة العقبة ويقطع التلبية عند ابتداء الرمي ويكبر مع كل حصاة ثم يذبح من معه هدى ثم يحلق أو يقصر والحلق أفضل وتقصر المرأة والحلق نسك على المشهور وأقله ثلاث شعرات حلقا أو تقصيرا أو نتفا أو إحراقا أو قصا ومن لا شعر برأسه يستحب إمرار الموصى عليه فإذا حلق أو ms059 قصر دخل مكة وطاف طواف الركن وسعى إن لم يكن سعى ثم يعود إلى منى وهذا الرمي والذبح والحلق والطواف يسن ترتيبها كما ذكرنا ويدخل وقتها بنصف ليلة النحر ويبقى وقت الرمي آخر يوم النحر ولا يختص الذبح بزمن.

قلت: الصحيح اختصاصه بوقت الأضحية وسيأتي في آخر باب محرمات الإحرام على الصواب والله أعلم والحلق والطواف والسعي لا آخر لوقتها وإذا قلنا الحلق نسك

ففعل اثنين من الرمي والحلق والطواف حصل التحلل الأول وحل به اللبس والحلق والقلم وكذا الصيد وعقد النكاح في الأظهر.

قلت: الأظهر لا يحل عقد النكاح، والله أعلم. وإذا فعل الثالث: حصل التحلل الثاني وحل به باقي المحرمات.

فصل

إذا عاد إلى منى بات بها ليلتي التشريق ورمى كل يوم إلى الجمرات الثلاث كل جمرة سبع حصيات فإذا رمى اليوم الثاني فأراد النفر قبل غروب الشمس جاز وسقط مبيت الليلة الثالث: ة ورمى يومها فإن لم ينفر حتى غربت وجب مبيتها ورمى الغد ويدخل رمي التشريق بزوال الشمس ويخرج بغروبها وقيل: يبقى إلى الفجر ويشترط رمي السبع واحدة واحدة وترتيب الجمرات وكون المرمى حجرا وأن يسمى رميا فلا يكفي الوضع والسنة أن يرمي بقدر حصى الخزف ولا يشترط بقاء الحجر في المرمى ولا كون الرامي خارجا عن الجمرة ومن عجز عن الرمي استناب وإذا ترك رمى يوم تداركه في باقي الأيام على الأظهر ولا دم وإلا فعليه دم والمذهب تكميل الدم في ثلاث حصيات رمي وإذا أراد الخروج من مكة طاف للوداع ولا يمكث بعده وهو واجب يجبر تركه بدم وفي قول سنة لا يجبر فإن أوجبناه فخرج بلا وداع فعاد قبل مسافة القصر سقط الدم أو بعدها فلا على الصحيح وللحائض النفر بلا وداع ويسن شرب ماء زمزم وزيارة قبر رسول الله صلى الله عليه وسلم بعد فراغ الحج.

فصل

أركان الحج خمسة: الإحرام، والوقوف، والطواف، والسعي، والحلق، إذا جعلناه نسكا

ولا تجبر وما سوى الوقوف أركان في العمرة أيضا ويؤدي النسكان على أوجه احدها: ms060 الإفراد بأن يحج ثم يحرم بالعمرة كإحرام المكي ويأتي بعملها الثاني: القرآن بأن يحرم بهما من الميقات ويعمل عمل الحج فيحصلان ولو أحرم بعمرة في أشهر الحج ثم بحج قبل الطواف كان قارنا ولا يجوز عكسه في الجديد الثالث: التمتع بأن يحرم بالعمرة من ميقات بلده ويفرغ منها ثم ينشئ حجا من مكة وأفضلها الإفراد ثم التمتع ثم القرآن وفي قول التمتع أفضل من الإفراد وعلى المتمتع دم بشرط أن لا يكون من حاضري المسجد الحرام وحاضروه من دون مرحلتين من مكة.

قلت: الأصح من الحرم، والله أعلم. وأن تقع عمرته في أشهر الحج من سنته وأن لا يعود لإحرام الحج إلى الميقات ووقت وجوب الدم إحرامه بالحج والأفضل ذبحه يوم النحر فإن عجز عنه في موضعه صام عشرة أيام ثلاثة في الحج تستحب قبل يوم عرفة وسبعة إذا رجح إلى أهله في الأظهر ويندب تتابع الثلاثة وكذا السبعة ولو فاتته الثلاثة في الحج فالأظهر أنه يلزمه أن يفرق في قضائها بينها وبين السبعة وعلى القارن دم كدم التمتع.

قلت: بشرط أن لا يكون من حاضري المسجد الحرام. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, 'باب محرمات الإحرام', 'أحدها: ستر بعض رأس الرجل بما يعد ساترا إلا لحاجة ولبس المخيط أو المنسوج أو المعقود في سائر بدنه إلا إذا لم يجد غيره ووجه المرأة كرأسه ولها لبس المخيط إلا القفاز في الأظهر.

الثاني: استعمال الطيب في ثوبه أو بدنه ودهن شعر الرأس أو للتحية ولا يكره غسل بدنه ورأسه بخطمي.

الثالث: إزالة الشعر أو الظفر وتكمل الفدية في ثلاث شعرات أو ثلاث أظفار والأظهر أن في الشعرة مد طعام وفي الشعرتين مدين وللمعذور أن يحلق ويفدى.

الرابع: الجماع وتفسد به العمرة وكذا الحج قبل التحلل الأول ويجب به بدنة والمضي في فاسده والقضاء وإن كان نسكه تطوعا والأصح أنه على الفور.

الخامس: اصطياد كل مأكول يرى.

قلت: وكذا المتولد منه ومن غيره والله أعلم ويحرم ذلك في الحرم على الحلال فإن أتلف صيدا ضمنه ففي ms061 النعامة بدنة وفي بقر الوحش وحماره بقرة والغزال عنز والأرنب عناق واليربوع جفرة وما لا نقل فيه يحكم بمثله عدلان وفيما لا مثل له القيمة ويحرم قطع نبات الحرم الذي لا يستنبت والأظهر تعلق الضمان به وبقطع أشجاره ففي الشجرة الكبيرة بقرة والصغيرة شاة.

قلت: والمستنبت كغيره على المذهب ويحل الإذخر وكذا الشوك كالعوسج وغيره عند الجمهور والأصح حل أخذ نباته لعلف البهائم وللدواء والله أعلم وصيد المدينة حرام ولا يضمن في الجديد ويتخير في الصيد المثلى بين ذبح مثله والصدقة به على مساكين الحرم وبين أن يقوم المثلى دراهم ويشتري به طعاما لهم أو عن كل مد يوما وغير المثلى يتصدق بقيمته طعاما أو يصوم ويتخير في فدية الحلق بين ذبح شاة والتصدق

بثلاثة آصع لستة مساكين وصوم ثلاثة أيام والأصح أن الدم في ترك المأمور كالإحرام من الميقات دم ترتيب فإذا عجز اشترى بقيمة الشاة طعاما وتصدق به فإن عجز صام عن كل مد يوما ودم الفوات كدم التمتع ويذبحه في حجة القضاء في الأصح والدم الواجب بفعل حرام أو ترك واجب لا يختص بزمان ويختص ذبحه بالحرم في الأظهر ويجب صرف لحمه إلى مساكينه وأفضل بقعة لذبح المعتمر المروة وللحاج منى وكذا حكم ما ساقه من هدى مكانا ووقته وقت الأضحية على الصحيح. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, 'باب الإحصار والفوات', 'من أحصر تحلل وقيل: لا تتحلل الشرذمة ولا تحلل بالمرض فإن شرطه تحلل به على المشهور ومن تحلل ذبح شاة حيث أحصر.

قلت: إنما يحصل التحلل بالذبح ونية التحلل وكذا الحلق إن جعلناه نسكا فإن فقد الدم فالأظهر أن له بدلا وأنه طعام بقيمة الشاة فإن عجز صام عن كل مد يوما وله التحلل في الحال في الأظهر والله أعلم وإذا أحرم العبد بلا إذن فلسيده تحليله وللزوج تحليلها من حج تطوع لم يأذن فيه وكذا من الفرض في الأظهر ولا قضاء على المحصر المتطوع فإن كان فرضا مستقرا بقي في ذمته أو غير مستقر اعتبرت الاستطاعة بعد ومن ms062 فاته الوقوف تحلل بطواف وسعي وحلق وفيهما قول وعليه دم والقضاء.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 108;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 109, 'كتاب البيع', 'كتاب البيع');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب البيع

شرطه الإيجاب كبعتك وملكتك والقبول كاشتريت وتملكت وقبلت ويجوز تقديم لفظ المشتري ولو قال: بعني فقال: بعتك انعقد في الأظهر وينعقد بالكناية كجعلته لك بكذا في الأصح ويشترط أن لا يطول الفصل بين لفظيهما وأن يقبل على وفق الإيجاب فلو قال بعتك بألف مكسرة فقال: قبلت بألف صحيحة لم يصح وإشارة الأخرس بالعقد كالنطلق وشرط العاقد الرشد.

قلت: وعدم الإكراه بغير حق ولا يصح شراء الكافر المصحف والمسلم في الأظهر إلا أن يعتق عليه فيصح في الأصح ولا الحربي سلاحا والله أعلم وللمبيع شروط طهارة عينه فلا يصح بيع الكلب والخمر والمتنجس الذي لا يمكن تطهيره كالخل واللبن وكذا الدهن في الأصح.

الثاني: النفع فلا يصح بيع الحشرات وكل سبع لا ينفع ولا حبتى الحنطة ونحوها وآلة اللهو وقيل: تصح الآلة إن عد رضاضها مالا ويصح بيع الماء على الشط والتراب بالصحراء في الأصح.

الثالث: إمكان تسليمه فلا يصح بيع الضال والآبق والمغصوب فإن باعه لقادر على

انتزاعه صح على الصحيح ولا يصح بيع نصف معين من الإناء والسيف ونحوهما ويصح في الثوب الذي لا ينقص بقطعه في الأصح ولا المرهون بغير إذن مرتهنه ولا الجاني المتعلق برقبته مال في الأظهر ولا يضر تعلقه بذمته وكذا تعلق القصاص في الأظهر.

الرابع: الملك لمن له العقد فبيع الفضولي باطل وفي القديم موقوف إن أجاز مالكه نفذ وإلا فلا ولو باع مال مورثه ظانا حياته وكان ميتا صح في الأظهر.

الخامس: العلم به فبيع أحد الثوبين باطل ويصح بيع صاع من صبرة تعلم من صيعانها وكذا إن جهلت في الأصح ولو باع بملء ذا البيت حنطة أو بزنة هذه الحصاة ذهبا أو بما باع به فلان فرسه أو بألف دراهم ودنانير لم يصح ولو باع بنقد وفي البلد نقد غالب تعين أو نقدان لم يغلب أحدهما اشترط التعيين ويصح بيع الصبرة المجهولة الصيعان كل صاع بدرهم ms063 ولو باعها بمائة درهم كل صاع بدرهم صح إن خرجت مائة وإلا فلا على الصحيح ومتى كان العوض معينا كفت معاينته والأظهر أنه لا يصح بيع الغائب والثاني يصح ويثبت الخيار عند الربية وتكفي الرؤية قبل العقد فيما لا يتغير غالبا إلى وقت العقد دون ما يتغير غالبا وتكفي رؤية بعض المبيع إن دل على باقيه كظاهر الصبرة وأنموذج المتماثل أو كان صوانا للباقي خلقة كقشر الرمان والبيض والقشرة السفلى للجوز واللوز وتعتبر رؤية كل شيء على ما يليق به والأصح أن وصفه بصفة السلم لا يكفي ويصح سلم الأعمى وقيل: إن عمى قبل تمييزه فلا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب الربا', 'إذا بيع الطعام بالطعام إن كانا جنسا اشترط الحلول والمماثلة والتقابض قبل التفرق أو جنسين كحنطة وشعير جاز التفاضل واشترط الحلول والتقابض والطعام ما قصد للطعم اقتياتا أو تفكها أو تداويا وأدقة الأصول المختلفة الجنس وخلوها وأدهانها أجناس واللحوم والألبان كذلك في الأظهر والمماثلة تعتبر في المكيل كيلا والموزون وزنا والمعتبر غالب عادة أهل الحجاز في عهد رسول الله صلى الله عليه وسلم وما جهل يراعى فيه عادة بلد البيع وقيل: الكيل وقيل: الوزن وقيل: يتخير وقيل: إن كان له أصل اعتبر والنقد بالنقد كطعام بطعام ولو باع جزافا تخمينا لم يصح وإن خرجا سواء وتعتبر المماثلة وقت الجفاف وقد يعتبر الكمال أولا فلا يباع رطب برطب ولا بتمر ولا عنب بعنب ولا بزبيب ومالا جفاف له كالقثاء والعنب الذي لا يتزبب لا يباع أصلا وفي قول تكفي مماثلته رطبا ولا تكفي مماثلة الدقيق والسويق والخبز بل تعتبر المماثلة في الحبوب حبا وفي حبوب الدهن كالسمسم حبا أو دهنا وفي العنب زبيبا أو خل عنب وكذا العصير في الأصح وفي اللبن لبنا أو سمنا أو مخيضا صافيا ولا تكفي المماثلة في سائر أحواله كالجبن والأقط ولا تكفي مماثلة ما أثرت فيه النار بالطبخ أو القلي أو الشيء ولا يضر تأثير تمييز كالعسل والسمن وإذا جمعت الصفقة ربويا من الجانبين واختلف الجنس منهما ms064 كمد عجوة ودرهم بمد ودرهم وكمد ودرهم بمدين أو درهمين أو النوع كصحاح ومكسرة بهما أو بأحدهما فباطلة ويحرم بيع اللحم بالحيوان من جنسه وكذا بغير جنسه من مأكول وغيره في الأظهر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, 'باب نهى رسول الله صلى الله عليه وسلم عن عسب الفحل', 'وهو ضرابه ويقال ماؤه ويقال أجرة ضرابه فيحرم ثمن مائه وكذا أجرته في الأصح وعن حبل الحبلة وهو نتاج النتاج بأن يبيع نتاج النتاج أو بثمن إلى نتاج النتاج وعن الملاقيح وهي ما في البطون والمضامين وهي ما في أصلاب الفحول والملامسة بأن يلمس ثوبا مطويا ثم يشتريه على أن لا خيار له إذا رآه أو يقول إذا لمسته فقد بعتكه والمنابذة بأن يجعلا النبذ بيعا وبيع الحصاة بأن يقول له بعتك من هذه الأثواب ما تقع هذه الحصاة عليه أو يجعلا الرمي بيعا أو بعتك ولك الخيار إلى رميها وعن بيعتين في بيعة بأن يقول بعتك بألف نقدا أو ألفين إلى سنة أو بعتك ذا العبد بألف على أن تبيعني دارك بكذا وعن بيع وشرط كبيع بشرط بيع أو قرض ولو اشترى زرعا بشرط أن يحصده البائع أو ثوبا ويخيطه فالأصح بطلانه ويستثني صور كالبيع بشرط الخيار أو البراءة من العيب أو بشرط قطع الثمر والأجل والرهن والكفيل المعينات الثمن في الذمة والإشهاد ولا يشترط تعيين الشهود في الأصح فإن لم يرهن أو لم يتكفل المعين فللبائع الخيار ولو باع عبدا بشرط إعتاقه فالمشهور صحة البيع والشرط والأصح أن للبائع مطالبة المشتري بالإعتاق وأنه لو شرط مع العتق الولاء له أو شرط تدبيره أو كتابته أو إعتاقه بعد شهر لم يصح البيع ولو شرط مقتضي العقد كالقبض والرد بعيب أو ما لا غرض فيه كشرط أن لا يأكل إلا كذا صح ولو شرط وصفا يقصد ككون العبد كاتبا أو الدابة حاملا أو لبونا صح

وله الخيار إن أخلف وفي قول يبطل العقد في الدابة ولو قال: بعتكها وحملها بطل في الأصح ولا يصح بيع الحمل وحده ms065 ولا الحامل دونه ولا الحامل بحر ولو باع حاملا مطلقا دخل الحمل في البيع.

فصل

ومن المنهي عنه ما لا يبطل لرجوعه إلى معنى يقترن به كبيع حاضر لباد بأن يقدم غريب بمتاع تعم الحاجة إليه ليبيعه بسعر يومه فيقول بلدي اتركه عندي لأبيعه على التدريج بأغلى وتلقى الركبان بأن يتلقى طائفة يحملون متاعا إلى البلد فيشتريه قبل قدومهم ومعرفتهم بالسعر ولهم الخيار إذا عرفوا الغبن والسوم على سوم غيره وإنما يحرم ذلك بعد استقرار الثمن والبيع على بيع غيره قبل لزومه بأن يأمر المشتري بالفسخ ليبيعه مثله والشراء على الشراء بأن يأمر البائع بالفسخ ليشتريه والنجش بأن يزيد في الثمن لا لرغبة بل ليخدع غيره والأصح أنه لا خيار وبيع الرطب والعنب لعاصر الخمر ويحرم التفريق بين الأم والولد حتى يميز وفي قول حتى يبلغ وإذا فرق ببيع أو هبة بطل في الأظهر ولا يصح بيع العربون بأن يشتري ويعطيه دراهم لتكون من الثمن إن رضي السلعة وإلا فهبة.

فصل

باع خلا وخمرا أو عبده وحرا وعبد غيره أو مشتركا بغير إذن الآخر صح في ملكه في

الأظهر فيتخير المشتري إن جهل فإن أجاز فبحصته من المسمى باعتبار قيمتهما وفي قول بجميعه ولا خيار للبائع ولو باع عبديه فتلف أحدهما قبل قبضه لم ينفسخ في الآخر على المذهب بل يتخير فإن أجاز فبالحصة قطعا ولو جمع في صفقة مختلفي الحكم كإجارة وبيع أو وسلم صحا في الأظهر ويوزع المسمى على قيمتهما أو بيع ونكاح صح النكاح وفي البيع والصداق القولان وتتعدد الصفقة بتفصيل الثمن كبعتك ذا بكذا وذا بكذا وبتعدد البائع وكذا بتعدد المشتري في الأظهر ولو وكلاه أو وكلهما فالأصح اعتبار الوكيل.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, 'باب الخيار', 'يثبت خيار المجلس في أنواع البيع كالصرف والطعام بطعام والسلم والتولية والتشريك وصلح المعاوضة ولو اشترى من يعتق عليه فإن قلنا الملك في زمن الخيار للبائع أو موقوف فلهما الخيار وإن قلنا للمشتري تخير البائع دونه ولا خيار في الإبراء والنكاح والهبة بلا ثواب ms066 وكذا ذات الثواب والشفعة والإجارة والمساقاة والصداق في الأصح وينقطع بالتخاير بأن يختارا لزومه فلو اختار أحدهما سقط حقه وبقي حق الآخر وبالتفريق ببدنهما فلو طال مكثهما أو قاما وتماشيا منازل دام خيارهما ويعتبر في التفرق العرف ولو مات في المجلس أو جن فالأصح انتقاله إلى الوارث والولي ولو تنازعا في التفرق أو الفسخ قبله صدق النافي.

فصل

لهما ولأحدهما شرط الخيار في أنواع البيع إلا أن يشترطا القبض في المجلس كربوي

وسلم وإنما يجوز في مدة معلومة لا تزيد عن ثلاثة أيام وتحسب من العقد وقيل: من التفرق والأظهر انه إن كان الخيار للبائع فملك المبيع له وإن كان للمشتري فله وإن كان لهما فموقوف فإن تم البيع بان أنه للمشتري من حين العقد وإلا فللبائع ويحصل الفسخ والإجازة بلفظ يدل عليهما كفسخت البيع ورفعته واسترجعت المبيع وفي الإجازة أجزته وأمضيته ووطء البائع وإعتاقه فسخ وكذا بيعه وإجارته وتزويجه في الأصح والأصح أن هذه التصرفات من المشتري إجازة وأن العرض على البيع والتوكيل فيه ليس فسخا من البائع ولا إجازة من المشتري.

فصل

للمشتري الخيار بظهور عيب قديم كخصاء رقيق وزناه وسرقته وإباقه وبوله بالفراش وبخره وصنانه وجماح الدابة وعضها وكل ما ينقص العين أو القيمة نقصا يفوت به غرض صحيح إذا غلب في جنس المبيع عدمه سواء قارن العقد أم حدث قبل القبض ولو حدث بعده فلا خيار إلا أن يستند إلى سبب متقدم كقطعه بجناية سابقة فيثبت الرد في الأصح بخلاف موته بمرض سابق في الأصح ولو قتل بردة سابقة ضمنه البائع في الأصح ولو باع بشرط براءة من العيوب فالأظهر أنه يبرأ عن كل عيب باطن بالحيوان لم يعلمه دون غيره وله مع هذا الشرط بعيب حدث قبل القبض ولو شرط البراءة عما يحدث لم يصح في

الأصح ولو هلك المبيع عند المشتري أو أعتقه ثم علم العيب رجع بالأرش وهو جزء من ثمنه نسبته إليه نسبة ما نقص العيب من القيمة لو كان سليما والأصح ms067 اعتبار أقل قيمة من يوم البيع إلى القبض ولو تلف الثمن دون المبيع رده وأخذ مثل الثمن أو قيمته ولو علم العيب بعد زوال ملكه إلى غيره فلا أرش في الأصح فإن عاد الملك فله الرد وقيل: إن عاد بغير الرد بعيب فلا رد والرد على الفور فليبادر على العادة فلو علمه وهو يصلي أو يأكل فله تأخيره حتى يفرغ أو ليلا فحتى يصبح فإن كان البائع بالبلد رده عليه بنفسه أو وكيله أو على وكيله ولو تركه ورفع الأمر إلى الحاكم فهو آكد وإن كان غائبا رفع إلى الحاكم والأصح أنه يلزمه الإشهاد على الفسخ إن أمكنه حتى ينهيه إلى البائع أو الحاكم فإن عجز عن الإشهاد لم يلزمه التلفظ بالفسخ في الأصح ويشترط ترك الاستعمال فلو استخدم العبد أو ترك على الدابة سرجها وإكافها بطل حقه ويعذر في ركوب جموح يعسر سوقها وقودها وإذا سقط رده بتقصير فلا أرش لو حدث عنده عيب سقط الرد قهرا ثم إن رضي به البائع رده المشتري أو قنع به وإلا فليضم المشتري أرش الحادث إلى المبيع ويرده أو يغرم البائع أرش القديم ولا يرد فإن اتفقا على أحدهما فذاك وإلا فالأصح إجابة من طلب الإمساك ويجب أن يعلم المشتري البائع على الفور بالحادث ليختار فإن أخر إعلامه بلا عذر فلا رد ولا أرش ولو حدث عيب لا يعرف القديم إلا به ككسر بيض وراتج وتقوير بطيخ مدود رد ولا أرش عليه في الأظهر فإن أمكن معرفة القديم بأقل مما أحدثه فكسائر العيوب الحادثة.

فرع: اشترى عبدين معيبين صفقة ردهما ولو ظهر عيب أحدهما ردهما إلى المعيب وحده في الأظهر ولو اشترى عبد رجلين معيبا فله رد نصيب أحدهما ولو اشترياه فلأحدهما الرد في الأظهر اختلفا في قدم العيب صدق البائع بيمينه على حسب جوابه والزيادة المتصلة كالسمن تتبع الأصل والمنفصلة كالولد والأجرة لا تمنع الرد وهي للمشتري إن رد بعض القبض وكذا قبله في الأصح ولو باعها حاملا فانفصل رده معها ms068 في الأظهر ولا يمنع الرد الاستخدام ووطء الثيب وافتضاض البكر بعد القبض نقص حدث وقبله جناية على المبيع قبل القبض.

فصل

التصرية حرام تثبت الخيار على الفور وقيل: يمتد ثلاثة أيام فإن رد بعد تلف اللبن رد معها صاع

تمر وقيل: يكفي صاع قوت والأصح أن الصاع لا يختلف بكثرة اللبن وأن خيارها لا يختص بالنعم بل يعم كل مأكول والجارية والأتان ولا يرد معهما شيئا وفي الجارية وجه وحبس ماء القناة والرحا المرسل عند البيع وتحمير الوجه وتسويد الشعر وتجعيده يثبت الخيار لا لطخ ثوبه تخييلا لكتابته في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, 'باب المبيع قبل قبضه من ضمان البائع', 'فإن تلف انفسخ البيع وسقط الثمن ولو أبرأه المشتري عن الضمان لم يبرأ في الأظهر ولم يتغير الحكم وإتلاف المشتري قبض إن علم وإلا فقولان كأكل المالك طعامه المغصوب ضيفا والمذهب أن إتلاف البائع كتلفه والأظهر أن إتلاف الأجنبي لا يفسخ بل يتخير المشتري بين أن يجيز ويغرم الأجنبي أو يفسخ فيغرم البائع الأجنبي ولو تعيب قبل القبض فرضيه أخذه بكل الثمن ولو عيبه المشتري بلا خيار أو الأجنبي فالخيار فإن أجاز غرم الأجنبي الأرش ولو عيبه البائع فالمذهب ثبوت الخيار لا

التغريم ولا يصح بيع المبيع قبل قبضه والأصح أن بيعه للبائع كغيره وأن الإجارة والرهن والهبة كالبيع وأن الإعتاق بخلافه والثمن المعين كالمبيع فلا يبيعه البائع قبل قبضه وله بيع ماله في يد غيره أمانة كوديعة ومشترك وقراض ومرهون بعد انفكاكه وموروث وباق في يد وليه بعد رشده وكذا عارية ومأخوذة بسوم ولا يصح بيع المسلم فيه ولا الإعتياض عنه والجديد جواز الاستبدال عن الثمن فإن استبدل موافقا في علة الربا كدراهم عن دنانير اشترط قبض البدل في المجلس والأصح أنه لا يشترط التعيين في العقد وكذا القبض في المجلس إن استبد ما لا يوافق في العلة كثوب عن دراهم ولو استبدل عن القرض وقيمة المتلف جاز وفي اشتراط قبضه في المجلس ما سبق وبيع الدين لغير من عليه باطل في ms069 الأظهر بأن اشترى عبد زيد بمائة له على عمرو ولو كان لزيد وعمرو دينار على شخص فباع زيد عمرا دينه بدينه بطل قطعا وقبض العقار تخليته للمشتري وتمكينه من الصرف بشرط فراغه من أمتعة البائع فإن لم يحضر العاقدان المبيع اعتبر مضي زمن يمكن فيه المضي إليه في الأصح وقبض المنقول تحويله فإن جرى البيع بموضع لا يختص بالبائع كفى نقله إلى حيز وإن جرى في دار البائع لم يكف ذلك إلا بإذن البائع فيكون معيرا للبقعة.

فرع: للمشتري قبض المبيع إن كان الثمن مؤجلا أو سلما وإلا فلا يستقل به ولو بيع الشيء تقديرا كثوب وأرض ذرعا وحنطة كيلا أو وزنا اشترط مع النقل ذرعه أو كيله أو وزنه مثاله بعتكها كل صاع بدرهم أو على أنها عشرة آصع ولو كان له طعام مقدر على زيد ولعمرو عليه مثله فليكتل لنفسه ثم يكل لعمرو فلو قال اقبض من زيد مالي عليه لنفسك ففعل فالقبض فاسد.

فرع: قال البائع: لا أسلم المبيع حتى أقبض ثمنه وقال المشتري في الثمن مثله أجبر البائع وفي قول المشتري وفي قول لا إجبار فمن سلم أجبر صاحبه وفي قول يجبران.

قلت: فإن كان الثمن معينا سقط القولان الأولان وأجبرا في الأظهر والله أعلم وإذا سلم البائع أجبر المشتري إن حضر الثمن وإلا فإن كان معسرا فللبائع الفسخ لمفلس أو موسر أو ماله بالبلد أو مسافة قريبة حجر عليه في أمواله حتى يسلم فإن كان بمسافة القصر لم يكلف البائع الصبر إلى إحضاره والأصح أن له الفسخ فإن صبر فالحجر كما ذكرنا وللبائع حبس مبيعه حتى يقبض ثمنه إن خاف فوته بلا خلاف وإنما الأقوال إذا لم يخف فوته وتنازعا في مجرد الابتداء.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 6, NULL, 'باب التولية والإشراك والمرابحة', 'اشترى شيأ ثم قال العالم بالثمن وليتك هذا العقد فقبل لزمه مثل الثمن وهو بع في شرطه وترتيب أحكامه لكن لا يحتاج إلى ذكر الثمن ولو حط عن المولى بعض الثمن انحط عن المولى والإشراك في بعضه كالتولية ms070 في كله إن بين البعض ولو أطلق صح وكان مناصفة وقيل: لا يصح بيع المرابحة بأن يشتريه بمائة ثم يقول بعتك بما اشتريت وربح درهم لكل عشرة وأو ربح ده يازده والمحاطة كبعت بما اشتريت وحط ده يازده ويحط من كل أحد عشر واحدة وقيل: من كل عشرة وإذا قال بعت بما اشتريت لم يدخل فيه سوى الثمن ولو قال بما قال على دخل مع ثمنه أجرة الكيال والدلال والحارس والقصار والرفاء والصاغ وقيمة

الصبغ وسائر المؤن المرادة للإسترباح ولو قصر بنفسه أو كال أو حمل أو تطوع به شخص ولم تدخل أجرته وليعلما ثمنه أو ما قام به فلو جهله أحدهما بطل على الصحيح وليصدق البائع في قدر الثمن والأجل والشراء بالعرض وبيان العيب الحادث عنده فلو قال بمائة فبان بتسعين فالأظهر أنه يحط الزيادة وربحها وأنه لا خيار للمشتري ولو زعم أنه مائة وعشرة وصدقه المشتري لم يصح البيع في الأصح.

قلت: الأصح صحته والله أعلم وإن كذبه ولم يبين للغلط وجها محتملا لم يقبل قوله ولا بينته وله تحليف المشتري أنه لا يعرف ذلك في الأصح وإن بين فله التحليف والأصح سماع بينته.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 7, NULL, 'باب الأصول والثمار', 'قال: بعتك هذه الأرض أو الساحة أو البقعة وفيها بناء وشجر فالمذهب أنه يدخل في البيع دون الرهن وأصول البقل التي تبقى سنتين كالقت والهندبا كالشجر ولا يدخل ما يؤخذ دفعة كحنطة وشعير وسائر الزروع ويصح بيع الأرض المزروعة على المذهب وللمشتري الخيار إن جهله ولا يمنع الزرع دخول الأرض في يد المشتري وضمانه إذا حصلت التخلية في الأصح والبذر كالزرع والأصح أنه لا أجرة للمشتري مدة بقاء الزرع ولو باع أرضا مع بذر أو زرع لا يفرد بالبيع بطل في الجميع وقيل: في الأرض قولان ويدخل في بيع الأرض الحجارة المخلوقة فيها دون المدفونة ولا خيار للمشتري إن علم ويلزم البائع النقل وكذا إن جهل ولم يضر قلعها وإن ضر فله الخيار فإن أجاز لزم البائع النقل وتسوية الأرض وفي ms071

وجوب أجرة المثل مدة النقل أوجه أصحها تجب أن نقل بعد القبض لا قبله ويدخل في بيع البستان الأرض والشجر والحيطان وكذا البناء على المذهب وفي بيع القرية الأبينة وساحات يحيط بها السور لا المزارع على الصحيح وفي بيع الدار الأرض وكل بناء حتى حمامها إلا المنقول كالدلو والبكرة والسرير وتدخل الأبواب المنصوبة وحلقها والإجانات والرف والسلم المسمران وكذا الأسفل من حجري الرحى على الصحيح والأعلى ومفتاح غلق مثبت في الأصح، وفي بيع الدابة نعلها وكذا ثياب العبد في بيعه في الأصح.

قلت: الأصح لا تدخل ثياب العبد. والله أعلم.

فرع: باع شجرة دخل عروقها وورقها وفي ورق التوت وجه أغصانها إلا اليابس ويصح بيعها بشرط القلع أو القطع وبشرط الإبقاء والإطلاق يقتضي الإبقاء والأصح أنه لا يدخل المغرس لكن يستحق منفعته ما بقيت الشجرة ولو كانت يابسة لزم المشتري القلع وثمرة النخل المبيع إن شرطت للبائع أو المشتري عمل به وإلا فإن لم يتأبر منها شيء فهي للمشتري وإلا فللبائع وما يخرج ثمره بلا نور كتين وعنب إن برز ثمره فللبائع وإلا فللمشتري وما خرج في نوره ثم سقط كمشمش وتفاح فللمشتري إن لم تنعقد الثمرة وكذا إن انعقدت ولم يتناثر النور في الأصح وبعد التناثر للبائع ولو باع نخلات بستان مطلعة وبعضها مؤبر فللبائع فإن أفرد ما لم يؤبر فللمشتري في الأصح ولو كانت في بساتين فالأصح إفراد كل بستان بحكمه وإذا بقيت الثمرة للبائع فإن شرط القطع لزمه وإلا فله تركها إلى الجذاذ ولكل منهما السقي إن انتفع به الشجر والثمر ولا منع للآخر وإن ضرهما لم يجز إلا برضاهما وإن ضر أحدهما وتنازعا فسخ العقد إلا أن يسامح المتضرر وقيل: لطالب السقي أن يسقي ولو كان الثمر يمتص رطوبة الشجر لزم البائع أن يقطع أو يسقي.

فصل

يجوز بيع الثمر بعد بدو صلاحه مطلقا وبشرط قطعه وبشرط إبقائه وقبل إصلاح إن بيع منفردا عن الشجرة لا يجوز إلا بشرط القطع وأن يكون المقطوع منتفعا به لا ms072 ككمثرى وقيل: إن كان الشجر للمشتري جاز بلا شرط.

قلت: فإن كان الشجر للمشتري وشرطنا القطع لا يجب الوفاء به والله أعلم وإن بيع مع الشجر جاز بلا شرط ولا يجوز بشرط قطعه ويحرم بيع الزرع الأخضر في الأرض إلا بشرط قطعه فإن بيع معها أو بعد اشتداد الحب جاز بلا شرط ويشترط لبيعه وبيع الثمر بعد بدو الصلاح ظهور المقصود كتين وعنب وشعير وما لا يرى حبه كالحنطة والعدس في السنبل لا يصح بيعه دون سنبله ولا معه في الجديد ولا بأس بكمام لا يزال إلا عند الأكل وماله كمامان كالجوز واللوز والباقلا يباع في قشره الأسفل ولا يصح في الأعلى وفي قول يصح إن كان رطبا وبد صلاح التمر ظهور مبادي النضج والحلاوة فيما لا يتلون وفي غيره بأن يأخذ في الحمرة أو السواد ويكفي بدو صلاح بعضه وإن قل ولو باع ثمرة بستان أو بساتين بدا صلاح بعضه فعلى ما سبق في التأبير ومن باع ما بدلا صلاحه لزمه سقيه قبل التخلية وبعدها ويتصرف مشتريه بعدها ولو عرض مهلك بعدهما كبرد فالجديد أنه من ضمان المشتري فلو تعيب بترك البائع السقي فله الخيار ولو بيع قبل صلاحه بشرط قطعه ولم يقطع حتى هلك فأولى بكونه من ضمان المشتري ولو بيع ثمر يغلب تلاحقه واختلاط حادثه بالموجود كتين وقثاء لم يصح إلا أن يشترط على المشتري قطع ثمره ولو حصل الاختلاط فيما يندر فيه فالأظهر أنه لا يفسخ البيع بل يتخير المشتري فإن سمح له البائع بما حدث سقط خياره في الأصح ولا يصح بيع الحنطة في سنبلها بصافية وهو المحاقلة ولا الرطب

على النخل بثمر وهو المزابنة ويرخص في العرايا وهو بيع الرطب على النخل بتمر في الأرض أو العنب في الشجر بزبيب فيما دون خمسة أوسق ولو زاد في صفقتين جاز ويشترط التقابض بتسليم الثمر كيلا والتخلية في النخل والأظهر أنه لا يجوز في سائر الثمار وأنه لا يختص بالفقراء.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 8, NULL, 'باب اختلاف المتبايعين', 'إذا اتفقا على ms073 صحة البيع ثم اختلفا في كيفيته كقدر الثمن أو صفته أو الأجل أو قدره أو قدر المبيع ولا بينة تحالفا فيحلف كل على نفي قول صاحبه وإثبات قوله ويبدأ بالبائع وفي قول المشتري وفي قول يتساويان فيتخير الحاكم وقيل: يقرع والصحيح أنه يكفي كل واحد يمين تجمع نفيا وإثباتا ويقدم النفي فيقول ما بعت بكذا ولقد بعت بكذا وإذا تحالفا فالصحيح أنه العقد لا ينفسخ بل إن تراضيا وإلا فليفسخانه أو أحدهما أو الحاكم وقيل: إنما يفسخه الحاكم ثم على المشتري رد المبيع فإن كان وقفه أو أعتقه أو باعه أو مات لزمه قيمته وهي قيمته يوم التلف في أظهر الأقوال وإن تعيب رده مع أرشه واختلاف ورثتهما كهما ولو قال بعتكه بكذا فقال بل وهبتنيه فلا تحالف بل يحلف كل على نفي دعوى الآخر فإذا حلفا رده مدعي الهبة بزوائده ولو ادعى صحة البيع والآخر فساده فالأصح تصديق مدعي الصحة بيمينه ولو اشترى عبدا فجاء بعبد معيب ليرده فقال البائع ليس هذا المبيع صدق البائع بيمينه وفي السلم يصدق في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 9, NULL, 'باب العبد إن لم يؤذن له في التجارة', 'لا يصح شراؤه بغير إذن سيده في الأصح ويسترده البائع سواء كان في يد العبد أو سيده فإن تلف في يده تعلق الضمان بذمته أو في يد السيد فللبائع تضمينه وله مطالبة العبد بعد العقد واقتراضه كشرائه وأن أذن له في التجارة تصرف بحسب الإذن فإن أذن في نوع لم يتجاوزه وليس له نكاح ولا يؤجر نفسه ولا يأذن لعبده في تجارة ولا يتصدق ولا يعامل سيده ولا ينعزل بإباقه ولا يصير مأذونا له بسكوت سيده على تصرفه ويقبل إقراره بديون المعاملة ومن عرف رق عبد لم يعامله حتى يعلم الإذن بسماع سيده أو بينة أو شيوع بين الناس وفي الشيوع وجه ولا يكفي قول العبد فإن باع مأذون له وقبض الثمن فتلف في يده فخرجت السلعة مستحقة رجع المشتري ببدلها على العبد وله مطالبة السيد أيضا وقيل: لا وقيل: ms074 إن كان في يد العبد وفاء فلا ولو اشترى سلعة ففي مطالبة السيد بثمنها هذا الخلاف ولا يتعلق دين التجارة برقبته ولا ذمة سيده بل يؤدي من مال التجارة وكذا من كسبه باصطياد ونحوه في الأصح ولا يملك العبد بتمليك سيده في الأظهر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 109;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 110, 'كتاب السلم', 'كتاب السلم');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'هو بيع موصوف في الذمة يشترط له مع شروط البيع أمور:

أحدها: تسليم رأس المال في المجلس فلو أطلق ثم عين وسلم في المجلس جاز ولو أحال به وقبضه لمحال في المجلس فلا ولو قبضه وأودعه المسلم جاز ويجوز كونه منفعة وتقبض بقبض العين وإذا فسخ السلم ورأس المال باق استرده بعينه وقيل: للمسلم إليه رد بدله إن عين في المجلس دون العقد ورؤية رأس المال تكفي عن معرفة قدره في الأظهر.

الثاني: كون المسلم فيه دينا فلو قال أسلمت إليك هذا الثوب في هذا العبد فليس بسلم ولا ينعقد بيعا في الأظهر ولو قال اشتريت منك ثوبا صفته كذا بهذه الدراهم فقال بعتك انعقد بيعا وقيل: سلما.

الثالث: المذهب أنه إذا أسلم بموضع لا يصلح للتسليم أو يصلح ولحمله مؤنة اشترط بيان محل التسليم وإلا فلا ويصح حالا ومؤجلا فإن أطلق انعقد حالا وقيل: لا ينعقد ويشترط العلم بالأجل فإن عين شهور العرب أو الفرس أو الروم جاز وإن أطلق حمل على الهلالي فإن انكسر شهر حسب الباقي بالأهلة وتمم الأول ثلاثين والأصح صحة تأجيله بالعيد وجمادى ويحمل على الأول.

فصل

يشترط كون المسلم فيه مقدورا على تسليمه عند وجوب التسليم فإن كان يوجد ببلد آخر صح إن اعتيد نقله للبيع وإلا فلا ولو أسلم فيما يعم فانقطع في محله لم ينفسخ في الأظهر فيتخير المسلم بين فسخه والصبر حتى يوجد ولو علم قبل المحل انقطاعه عنده فلا خيار قبله في الأصح وكونه معلوم القدر كيلا أو وزنا أو عدا أو ذرعا ويصح المكيل وزنا وعكسه ولو أسلم في مائة صاع حنطة على أن وزنها كذا لم يصح ويشترط الوزن في البطيخ والباذنجان والقثاء ms075 والسفرجل والرمان ويصح في الجوز واللوز بالوزن في نوع يقل اختلافه وكذا كيلا في الأصح ويجمع في اللبن بين العد والوزن ولو عين مكيالا فسد إن لم يكن معتادا وإلا فلا في الأصح ولو أسلم في ثمر قرية صغيرة لم يصح أو عظيمة صح في الأصح ومعرفة الأوصاف التي يختلف بها الغرض اختلافا ظاهرا أو ذكرها في العقد على وجه لا يؤدي إلى عزة الوجود فلا يصح فيما لا ينضبط مقصوده له كالمختلط المقصود الأركان كهريسة ومعجون وغالية وخف وترياق مخلوط والأصح صحته في المختلط المنضبط كعتابي وخز وجبن وأقط وشهد وخل تمر أو زبيب لا الخبز في الأصح عند الأكثرين ولا يصح فيما ندر وجوده كلحم الصيد بموضع العزة ولا فيما لو استقصى وصفه عز وجوده كاللؤلؤ الكبار واليواقيت وجارية وأختها أو ولدها.

فرع: يصح في الحيوان فيشترط في الرقيق ذكر نوعه كتركي ولنه كأبيض ويصف بياضه بسمرة أو شقرة وذكورته وأنوثته وسنه وقده طولا وقصرا وكله على التقريب ولا يشترط

ذكر الكحل والسمن ونحوهما في الأصح وفي الإبل والخيل والبغال والحمير الذكورة والأنوثة والسن واللون والنوع وفي الطير النوع والصغر وكبر الجثة وفي اللحم لحم بقر أو ضأن أو معز ذكر خصي رضيع معلوف أو ضدها من فخذ أو كتف أو جنب ويقبل عظمه على العادة وفي الثياب الجنس والطول والعرض والغلظ والدقة والصفاقة والرقة والنعومة والخشونة ومطلقه يحمل على الخام ويجوز في المقصور وما سبع غزله قبل النسج كالبرود والأقيس صحته في المصبوغ بعده.

قلت: الأصح منعه وبه قطع الجمهور والله أعلم وفي التمر لونه ونوعه وبلده وصغر الحبات وكبرها وعتقه وحداثته والحنطة وسائر الحبوب كالتمر وفي العسل جبلي أو بلدي صيفي أو خريفي أبيض أو أصفر ولا يشترط العتق والحداثة ولا يصح في المطبوخ والمشوي ولا يضر تأثير الشمس والأظهر منعه في رؤوس الحيوان ولا يصح في مختلف كبرمة معمولة وجلد وكوز وطس وقمقم ومنارة وطنجير ونحوها ويصح في الاسطال المربعة وفيما صب منها في قالب ms076 ولا يشترط ذكر الجودة والرداءة في الأصح ويحمل مطلقة على الجيد ويشترط معرفة العاقدين والصفات وكذا غيرهما في الأصح.

فصل

لا يصح أن يستبدل عن المسلم فيه غيرت جنسه ونوعه وقيل: يجوز في نوعه ولا يجب ويجوز أردأ من المشروط ولا يجب ويجوز أجود ويجب قبوله في الأصح ولو أحضره قبل محلة فامتنع المسلم من قبوله لغرض صحيح بأن كان حيوانا أو وقت غارة لم يجبر وإلا فإن كان للمؤدي غرض صحيح كفك رهن أجبر وكذا لمجرد غرض البراءة في الأظهر ولو وجد المسلم المسلم إليه بعد المحل في غير محل التسليم لم يلزم الأداء إن كان لنقله مؤنة

ولا يطالبه بقيمته للحيلولة على الصحيح وإن امتنع من قبوله هناك لم يجبر إن كان لنقله مؤنة أو كان الموضع مخوفا وإلا فالأصح إجباره.

فصل

الإقراض مندوب وصيغته أقرضتك أو أسلفتك أو خذه بمثله أو ملكتكه على أن ترد بدله ويشترط قبوله في الأصح وفي المقرض أهلية التبرع ويجوز إقراض ما يسلم فيه إلا الجارية التي تحل للمقترض في الأظهر وما لا يسلم فيه لا يجوز إقراضه في الأصح ويرد المثل في المثلى وفي المتقوم المثل صورة وقيل: القيمة ولو ظفر طالبه به في غير محل الإقراض وللنقل مؤنة طلبه بقيمة بلد الإقراض ولا يجوز بشرط رد صحيح عن مكسر أو زيادة ولو رد هكذا بلا شرط فحسن ولو شرط مكسرا عن صحيح أو أن يقرضه غيره لغا الشرط والأصح أنه لا يفسد العقد ولو شرط أجلا فهو كشرط مكسر عن صحيح إن لم يكن للمقرض غرض وإن كان كزمن نهب فكشرط صحيح عن مكسر في الأصح وله شرط رهن وكفيل ويملك لقرض بالقبض وفي قول بالتصرف وله الرجوع في عينه ما دام باقيا بحاله في الأصح. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 110;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 111, 'كتاب الرهن', 'كتاب الرهن');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'لا يصح إلا بإيجاب وقبول فإن شرط فيه مقتضاه كتقدم المرتهن به أو مصلحة للعقد كالإشهاد أو مالا غرض فيه صح العقد وإن شرط ما يضر المرتهن بطل الرهن وإن ms077 نفع المرتهن وضر الراهن كشرط منفعة للمرتهن بطل الشرط وكذا الرهن في الأظهر ولو شرط أن تحدث زوائده مرهونة فالأظهر فساد الشرط وأنه متى فسد فسد العقد وشرط العاقد كونه مطلق التصرف فلا يرهن الولي مال الصبي والمجنون ولا يرتهن لهما إلا لضرورة أو غبطة ظاهرة وشرط الرهن كونه عينا في الأصح ويصح رهن المشاع والأم دون ولدها وعكسه وعند الحاجة يباعان ويوزع الثمن والأصح أن تقوم الأم وحدها ثم مع الولد فالزائد قيمته ورهن الجاني والمرتد كبيعهما ورهن المدبر والمعلق عتقه بصفة يمكن سبقها حلول الدين باطل على المذهب ولو رهن ما يسرع فساده فإن أمكن تجفيفه كرطب فعل وإلا فإن رهنه بدين حال أو مؤجل يحل قبل فساده أو شرط بيعه وجعل الثمن رهنا صح ويباع عند خوف فساده ويكون ثمنه رهنا وإن شرط منع بيعه لم يصح وإن أطلق فسد في الأظهر وإن لم يعلم هل يفسد قبل الأجل صح

في الأظهر وإن رهن ما لا يسرع فساده فطر أما عرضه للفساد كحنطة ابتلت لم ينفسخ الرهن بحال ويجوز أن يستعير شيئا ليرهنه وهو في قول عارية

والأظهر أنه ضمان دين في رقبة ذلك الشيء فيشترط ذكر جنس الدين وقدره وصفته وكذا المرهون عنده في الأصح فلو تلف في يد المرتهن فلا ضمان ولا رجوع للمالك بعد قبض المرتهن فإذا حل الدين أو كان حالا روجع المالك للبيع ويباع إن لم يقض الدين ثم يرجع المالك بما بيع به.

فصل

شرط المرهون به كونه دينا ثابتا لازما فلا يصح بالعين المغصوبة والمستعارة في الأصح ولا بما سيقرضه ولو قال أقرضتك هذه الدراهم وارتهنت بها عبدك فقال اقترضت ورهنت أو قال بعتكه بكذا وارتهنت الثوب به فقال اشتريت ورهنت صح في الأصح ولا يصح بنجوم الكتابة ولا بجعل الجعالة قبل الفراغ وقيل: يجوز بعد الشروع ويجوز بالثمن في مدة الخيار وبالدين رهن بعد رهن ولا يجوز أن يرهنه المرهون عنده بدين آخر في الجديد ولا يلزم إلا بقبضه ms078 ممن يصح عقده وتجري فيه النيابة لكن لا يستنيب الراهن ولا عبده وفي المأذون له وجه ويستنيب مكاتبه ولو رهن وديعة عند مودع أو مغصوبا عند غاصب لم يلزم ما لم يمض زمن إمكان قبضه والأظهر اشتراط إذنه في قبضه ولا يبرئه ارتهانه عن الغصب ويبرئه إيداع في الأصح ويحصل الرجوع عن الرهن قبل القبض بتصرف يزيل الملك كهبة مقبوضة وكتابة وكذا تدبيره في الأظهر وبرهن مقبوض وبإحبالها لا الوطء والتزويج ولو مات العاقد قبل القبض أو جن أو تخمر العصير أو أبق العبد لم يبطل الرهن في الأصح وليس للراهن المقبض تصرف يزيل الملك لكن في إعتاقه أقوال أظهرها ينفذ من الموسر ويغرم قيمته يوم عتقه رهنا وإن لم ينفذ فانفك لم ينفذه في الأصح ولو علقه

بصفة فوجدت وهو رهن فكالإعتاق أو بعده نفذ على الصحيح ولا رهنه لغيره ولا التزويج ولا الإجارة إن كان الدين حالا او يحل قبلها ولا الوطء فإن وطىء فالولد حر وفي نفوذ الإستيلاد أقوال الإعتاق فإن لم ننفذه فانفك نفذ في الأصح فلو ماتت بالولادة غرم قيمتها رهنا في الأصح وله كل انتفاع لا ينقصه كالركوب والسكنى لا البناء والغراس فإن فعل لم يقلع قبل الأجل وبعده إن لم تف الأرض بالدين وزادت به ثم إن أمكن الانتفاع بغير استرداد لم يسترد وإلا فيسترد ويشهدان لمتهمه وله بإذن المرتهن ما منعناه وله الرجوع قبل تصرف الراهن فإن تصرف جاهلا برجوعه فكتصرف وكيل جهل عزله ولو أذن في بيعه ليعجل المؤجل من ثمنه لم يصح البيع وكذا لو شرط رهن الثمن في الأظهر.

فصل

إذا لزم الرهن فاليد فيه للمرتهن ولا تزال إلا للانتفاع كما سبق ولو شرطا وضعه عند عدل جاز أو عند اثنين ونصا على اجتماعهما على حفظه أو الإنفراد به فذاك وإن أطلقا فليس لأحدهما الإنفراد في الأصح ولو مات العدل أو فسق جعلاه حيث يتفقان وإن تشاحا وضعه الحاكم عند عدل ويستحق بيع المرهون عند الحاكم ويقدم المرتهن بثمنه ms079 ويبيعه الراهن او وكيله بإذن المرتهن فإن لم يأذن قال له الحاكم تأذن أو تبرىء ولو طلب المرتهن بيعه فأبى الراهن ألزمه القاضي قضاء الدين أو بيعه فإن أصر باعه الحاكم ولو باعه المرتهن

بإذن الراهن فالأصح أنه إن باع بحصرته صح وإلا فلا ولو شرطا أن يبيعه العدل جاز ولا يشترط مراجعة الراهن في الأصح فإذا باع فالثمن عنده من ضمان الراهن حتى يقبضه المرتهن ولو تلف ثمنه في يد العدل ثم استحق المرهون فإن شاء المشتري رجع على العدل وإن شاء على الراهن والقرار عليه ولا يبيع العدل إلا بثمن مثله حالا من نقد بلده فإن زاد راغب قبل انقضاء الخيار فليفسخ وليبعه ومؤنة المرهون على الراهن ويجبر عليها لحق المرتهن على الصحيح ولا يمنع راهن من مصلحة المرهون كفصد وحجامة وهو أمانة في يد المرتهن ولا يسقط بتلفه شيء من دينه وحكم فاسد العقود حكم صحيحها في الضمان ولو شرط كون المرهون مبيعا له عند الحلول فسد وهو قبل المحل أمانة ويصدق المرتهن في دعوى التلف بيمينه ولا يصدق في الرد عند الأكثرين ولو وطىء المرتهن المرهونة بلا شبهة فزان ولا يقبل قوله جهلت تحريمه إى أن يقرب إسلامه أو ينشأ ببادية بعيدة عن العلماء وإن وطىء بإذن الراهن قبل دعواه جهل التحريم في الأصح فلا حد ويجب المهر إن أكرهها والولد حر نسيب وعليه قيمته للراهن ولو أتلف المرهون وقبض بدله صار هنا والخصم في البدل الراهن فإن لم يخاصم يخاصم المرتهن في الأصح فلو وجب قصاص اقتص الراهن وفات الرهن فإن وجب المال بعفوه أو بجناية خطأ لم يصح عفوه عنه ولا إبراء المرتهن الجاني ولا يسري الرهن إلى زيادته المنفصلة كثمر وولد فلو رهن حاملا وحل الأجل وهي حامل بيعت وإن ولدته بيع معها في الأظهر فإن كانت حاملا عند البيع دون الرهن فالولد ليس برهن في الأظهر.

فصل

جنى المرهون قدم المجني عليه فإن اقتص أو بيع له بطل الرهن وإن جنى على ms080 سيده

فاقتص بطل وإن عفا على مال لم يثبت على الصحيح فيبقى رهنا وإن قتل مرهونا لسيده عند آخر فاقتص بطل الرهنان وإن وجب مال تعلق به حق مرتهن القتيل فيباع وثمنه رهن وقيل: يصير رهنا فإن كان مرهونين عند شخص بدين واحد نقصت الوثيقة أو بدينين وفي نقل الوثيقة غرض نقلت: ولو تلف مرهون بآفة بطل وينفك بفسخ المرتهن وبالبراءة من الدين فإن بقي شيء منه لم ينفك شيء من الرهن ولو رهن نصف عبد بدين ونصفه بآخر فبرىء من أحدهما أنفك قسطه ولو رهناه فبرىء أحدهما انفك نصيبه.

فصل

اختلفا في الرهن أو قدره صدق الراهن بيمينه إن كان رهن تبرع وإن شرط في بيع تحالفا ولو ادعى أنهما رهناه عبدهما بمائة وصدقه احدهما فنصيب المصدق رهن بخمسين والقول في نصيب الثاني قوله بيمينه وتقبل شهادة المصدق عليه ولو اختلفا في قبضه فإن كان في يد الراهن أو في يد المرتهن وقال الراهن غصبته صدق الراهن بيمينه وكذا إن قال أقبضته عن جهة أخرى في الأصح ولو أقر بقبضه ثم قال لم يكن إقراري عن حقيقة فله تحليفه وقيل: لا يحلفه إلا أن يذكر لإقراره تأويلا كقوله شهدت على رسم القبالة ولو قال أحدهما جنى المرهون وأنكر الآخر صدق المنكر بيمينه ولو قال الراهن جنى قبل القبض فالأظهر تصديق المرتهن بيمينه في إنكاره والأصح أنه إذا حلف غرم

الراهن للمجني عليه وأنه يغرم الأقل من قيمة العبد وأرش الجناية وأنه لو نكل المرتهن ردت اليمين على المجني عليه لا على الراهن فإذا حلف بيع في الجناية ولو أذن في بيع المرهون فبيع ورجع عن الإذن وقال رجعت قبل البيع وقال الراهن بعده فالأصح تصديق المرتهن ومن عليه ألفان بأحدهما رهن فأدى ألفا وقال أديته عن ألف الرهن صدق بيمينه وإن لم ينو شيئا جعله عما شاء وقيل: يقسط.

فصل

من مات وعليه دين تعلق بتركته تعلقه بالمرهون وفي قول كتعلق الأرش بالجاني فعلى الأظهر يستوي الدين المستغرق وغيره ms081 في الأصح ولو تصرف الوارث ولا دين ظاهر فظهر دين برد مبيع بعيب فالأصح أنه لا يتبين فساد تصرفه لكن إن لم يقض الدين فسخ ولا خلاف أن للوارث إمساك عين التركة وقضاء الدين من ماله والصحيح أن تعلق الدين بالتركة لا يمنع الإرث فلا يتعلق بزوائد التركة ككسب ونتاج والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 111;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 112, 'كتاب التفليس', 'كتاب التفليس');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب التفليس

من عليه ديون حالة زائدة على ماله يحجر عليه بسؤال الغرماء ولا حجر بالمؤجل وإذا حجر بحال لم يحل المؤجل في الأظهر ولو كانت الديون بقدر المال فإن كان كسوبا ينفق من كسبه فلا حجر وإن لم يكن كسوبا وكانت نفقته من ماله فكذا في الأصح ولا يحجر بغير طلب فلو طلب بعضهم ودينه قدر يحجر به حجر وإلا فلا ويحجر بطلب المفلس في الأصح فإذا حجر تعلق حق الغرماء بماله وأشهد على حجره ليحذر ولو باع أو وهب أو أعتق ففي قول يوقف تصرفه فإن فضل ذلك عن الدين نفذ وإلا لغا والأظهر بطلانه فلو باع ماله لغرمائه بدينهم بطل في الأصح ولو باع سلما أو اشترى في الذمة فالصحيح صحته ويثبت في ذمته ويصح نكاحه وطلاقه وخلعه واقتصاصة وإسقاطه ولو أقر بعين أو دين وجب قبل الحجر فالأظهر قبوله في حق الغرماء وإن أسند وجوبه إلى ما بعد الحجر بمعاملة أو مطلقا لم يقبل في حقهم وإن قال عن جناية قبل في الأصح وله أن يرد بالعيب ما كان اشتراه إن كانت الغبطة في الرد والأصح تعدي الحجر إلى ما حدث بعده بالاصطياد والوصية والشراء إن صححناه وأنه ليس لبائعه أن يفسخ ويتعلق بعين متاعه إن علم الحال وإن جهل فله ذلك وأنه إذا لم يمكن التعلق بها لا يزاحم الغرماء بالثمن.

فصل

يبادر القاضي بعد الحجر ببيع ماله وقسمه بين الغرماء ويقدم ما يخاف فساده ثم الحيوان ثم المنقول ثم العقار وليبع بحضرة المفلس وغرمائه كل شيء في سوقه بثمن مثله حالا من نقد البلد ثم إن كان الدين غير ms082 جنس النقد ولم يرض الغريم إلا بجنس حقه اشترى وإن رضي جاز صرف النقد إليه إلا في السلم ولا يسلم مبيعا قبل قبض ثمنه وما قبض قسمه بين الغرماء إلا أن يعسر لقلته فيؤخره ليجتمع ولا يكلفون بينة بأن لا غريم غيرهم فلو قسم فظهر غريم شارك بالحصة وقيل: تنقض القسمة ولو خرج شيء باعه قبل الحجر مستحقا والثمن تالف فكدين ظهر وإن استحق شيء باعه الحاكم قدم المشتري بالثمن وفي قول بحاص الغرماء وينفق على من عليه نفقته حتى يقسم ماله إلا أن يستغني بكسب ويباع مسكنه وخادمه في الأصح وإن احتاج إلى خادم لزمانته ومنصبه ويترك له دست ثوب يليق به وهو قميص وسراويل وعمامة ومكعب ويزاد في الشتاء جبة ويترك له قوت يوم القسمة لمن عليه نفقته وليس عليه بعد القسمة أن يكتسب أو يؤجر نفسه لبقية الدين والأصح وجوب إجارة أم ولده والأرض الموقوفة عليه وإذا ادعى أنه معسر أو قسم ماله بين غرمائه وزعم أنه لا يملك غيره وأنكروا فإن لزمه الدين في معاملة مال كشراء أو قرض فعليه البينة وإلا فيصدق بيمينه في الأصح وتقبل بينة الإعسار في الحال وشرط شاهده خبرة باطنه وليقل هو معسر ولا يمحض النفي كقوله لا يملك شيئا وإذا ثبت إعساره لم يجز حبسه ولا ملازمته بل يمهل حتى يوسر والغريب العاجز عن بينة الإعسار يوكل القاضي به من يبحث عن حاله فإذا غلب على ظنه إعساره شهد به.

فصل

من باع ولم يقبض الثمن حتى حجر على المشتري بالفلس فله فسخ البيع واسترداد المبلغ والأصح أن خياره على الفور وأنه لا يحصل الفسخ بالوطء والإعتاق والبيع وله الرجوع في سائر المعاوضات كالبيع وله شروط منها كون الثمن حالا وأن يتعذر حصوله بالإفلاس فلو امتنع من دفع الثمن مع إيساره أو هرب فلا فسخ في الأصح ولو قال الغرماء لا تفسخ ونقدمك بالثمن فله الفسخ وكون المبيع باقيا في ملك المشتري فلو فات أو كاتب العبد فلا رجوع ولا ms083 يمنع التزويج ولو تعيب بآفة أخذه ناقصا أو ضارب بالثمن أو بجناية أجنبي أو البائع فله أخذه ويضارب من ثمنه بنسبة نقص القيمة وجناية المشتري كآفة في الأصح فلو تلف أحد العبدين ثم أفلس أخذ الباقي وضارب بحصة التالف فلو كان قبض بعض الثمن رجع في الجديد فإن تساوت قيمتها وقبض نصف الثمن أخذ الباقي لباقي الثمن وفي قول يأخذ نصفه بنصف باقي الثمن ويضارب بنصفه ولو زاد المبيع زيادة متصلة كسمن وصنعة فاز البائع بها والمنفصلة كالثمرة والولد للمشتري ويرجع البائع في الأصل فإن كان الولد صغيرا وبذل البائع قيمته أخذه مع أمه وإلا فيباعان وتصرف إليه حصة الأم وقيل: لا رجوع فإن كانت حاملا عند الرجوع دون البيع أو عكسه فالأصح تعدي الرجوع إلى الولد واستتار الثمر بكمامه وظهوره بالتأبير قريب من استتار الجنين وانفصاله وأولى بتعدي الرجوع ولو غرس الأرض أو بنى فإن اتفق الغرماء والمفلس على تفريغها فعلوا وأخذها وإن امتنعوا لم يجبروا بل له أن يرجع ويتملك الغراس والبناء بقيمته وله أن يقلعه ويغرم أرش نقصه والأظهر أنه ليس له أن يرجع فيها ويبقى الغراس والبناء للمفلس ولو كان

المبيع حنطة فخلطها بمثلها أو دونها فله أخذ قدر المبيع من المخلوط أو بأجود فلا رجوع في المخلوط في الأظهر ولو طحنها أو قصر الثوب فإن لم تزد القيمة رجع ولا شيء للمفلس وإن زادت فالأظهر أنه يباع وللمفلس من ثمنه بنسبة ما زاد ولو صبغه بصبغه فإن زادت القيمة قدر قيمة الصبغ رجع والمفلس شريك بالصبغ أو أقل فالنقص على الصبغ أو أكثر فالأصح أن الزيادة للمفلس ولو اشترى منه الصبغ والثوب رجع فيهما إلا أن تزيد قيمتهما على قيمة الثوب فيكون فاقدا للصبغ ولو اشتراهما من اثنين فإن لم تزد قيمته مصبوغا على قيمة الثوب فصاحب الصبغ فاقد وإن زادت بقدر قيمة الصبغ اشتركا وإن زادت على قيمتهما فالأصح أن المفلس شريك لهما بالزيادة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب الحجر', 'منه حجر المفلس لحق الغرماء والراهن للمرتهن والمريض ms084 للورثة والعبد لسيده والمرتد للمسلمين ولها أبواب ومقصود الباب حجر المجنون والصبي والمبذر فبالجنون تنسلب الولايات واعتبار الأقوال ويرتفع بالإفاقة وحجر الصبي يرتفع ببلوغه رشيدا والبلوغ باستكمال خمس عشرة سنة أو خروج المنى ووقت إمكانه استكمال تسع سنين ونبات العانة يقتضي الحكم ببلوغ ولد الكافر لا المسلم في الأصح وتزيد المرأة حيضا وحبلا والرشد صلاح الدين والمال فلا يفعل محرما يبطل العدالة ولا يبذر بأن يضيع المال باحتمال غبن فاحش في المعاملة أو رميه في بحر أو إنفاقه في محرم والأصح أن صرفه في الصدقة ووجوه الخير والمطاعم والملابس التي لا تليق بحاله ليس بتبذير ويختبر رشد الصبي

ويختلف بالمراتب فيختبر ولد التاجر بالبيع والشراء والمماكسة فيهما وولد الزارع بالزراعة والنفقة على القوام بها والمحترف بما يتعلق بحرفته والمرأة بما يتعلق بالغزل والقطن وصون الأطعمة عن الهرة ونحوها ويشترط تكرر الاختبار مرتين أو أكثر ووقته قبل البلوغ وقيل: بعده فعلى الأول الأصح أنه لا يصح عقده بل يمتحن في المماكسة فإذا أراد العقد عقد الولي فلو بلغ غير رشيد دام الحجر وإن بلغ رشيدا انفك بنفس البلوغ وأعطى ماله وقيل: يشترط فك القاضي فلو بذر بعد ذلك حجر عليه وقيل: يعود الحجر بلا إعادة ولو فسق لم يحجر عليه في الأصح ومن حجر عليه لسفه طرأ فوليه القاضي وقيل: وليه في الصغر ولو طرأ جنون فوليه وليه في الصغر وقيل: القاضي ولا يصح من المحجور عليه لسفه بيع ولا شراء ولا إعتاق وهبة ونكاح بغير إذن وليه فلو اشترى أو اقترض وقبض وتلف المأخوذ في يده أو أتلفه فلا ضمان في الحال ولو بعد فك الحجر سواء علم حاله من عامله أو جهل ويصح بإذن الولي نكاحه لا التصرف المالي في الأصح ولا يصح إقراره بدين قبل الحجر أو بعده وكذا بإتلاف المال في الأظهر ويصح

بالحد والقصاص وطلاقه وخلعه وظهاره ونفيه النسب بلعان وحكمه في العبادة كالرشيد لكن لا يفرق الزكاة بنفسه وإذا أحرم بحج فرض أعطى الولي كفايته ms085 لثقة ينفق عليه في طريقه وإن أحرم بتطوع وزادت مؤنة سفره على نفقته المعهودة فللولي منعه والمذهب أنه كمحصر فيتحلل.

قلت: ويتحلل بالصوم إن قلنا لدم الإحصار بدل لأنه ممنوع من المال ولو كان له في طريقه كسب قدر زيادة المؤنة لم يجز منعه والله أعلم.

فصل

ولي الصبي أبوه ثم جده ثم وصيهما ثم القاضي ولا تلي الأم في الأصح ويتصرف

الولي بالمصلحة يبني دوره بالطين والآجر لا اللبن والجص ولا يبيع عقاره إلا لحاجة أو غبطة ظاهرة وله بيع ماله بعرض ونسيئة للمصلحة وإذا باع نسيئة أشهد وارتهن به ويأخذ له بالشفعة أو يترك بحسب المصلحة ويزكي ماله وينفق عليه بالمعروف فإذا ادعى بعد بلوغه على الأب والجد بيعا بلا مصلحة صدقا باليمين وإن ادعاه على الوصي والأمين صدق هو بيمينه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, 'باب الصلح', 'هو قسمان أحدهما: يجري بين المتداعيين وهو نوعان.

أحدهما: صلح على إقرار فإن جرى على عين غير المدعاة فهو بيع بلفظ الصلح تثبت فيه أحكامه كالشفعة والرد بالعيب ومنع تصرفه قبل قبضه واشتراط التقابض إن اتفقا في علة الربا أو على منفعة فإجارة تثبت أحكامها أو على بعض العين المدعاة فهبة لبعضها لصاحب اليد فتثبت أحكامها ولا يصح بلفظ البيع والأصح صحته بلفظ الصلح ولو قال من غير سبق خصومة صالحني عن دارك بكذا فالأصح بطلانه ولو صالح من دين على عين صح فإن توافقا في علة الربا اشترط قبض العوض في المجلس وإلا فإن كان العوض عينا لم يشترط قبضه في المجلس في الأصح أو دينا اشترط تعيينه في المجلس وفي قبضه الوجهان وإن صالح من دين على بعضه فهو إبراء عن باقيه ويصح بلفظ الإبراء والحط ونحوهما وبلفظ الصلح في الأصح ولو صالح من حال على مؤجل مثله أو عكس لغا فإن عجل المؤجل صح الأداء ولو صالح من عشرة حالة على خمسة مؤجلة بريء من خمسة وبقيت خمسة حالة ولو عكس لغا

النوع الثاني: الصلح على الإنكار فيبطل إن جرى على نفس ms086 المدعى وكذا إن جرى على بعضه في الأصح وقوله صالحني على الدار التي تدعيها ليس إقرارا في الأصح.

القسم الثاني: يجري بين المدعي والأجنبي فإن قال وكلني المدعى عليه في الصلح وهو مقر لك صح ولو صالح لنفسه والحالة هذه صح وكأنه اشتراه وإن كان منكرا وقال الأجنبي هو مبطل في إنكاره فهو شراء مغصوب فيفرق بين قدرته على انتزاعه وعدمها وإن لم يقل هو مبطل لغا الصلح.

فصل

الطريق النافذ لا يتصرف فيه بما يضر المارة ولا يشرع فيه جناح ولا ساباط يضرهم بل يشترط ارتفاعه بحيث يمر تحته منتصبا وإن كان ممر الفرسان والقوافل فليرفعه بحيث يمر تحته المحمل على البعير مع أخشاب المظلة ويحرم الصلح على اشراع الجناح وأن يبني في الطريق دكة أو يغرس شجرة وقيل: إن لم يضر جاز وغير النافذ يحرم الإشراع إليه لغير أهله وكذا لبعض أهله في الأصح إلا برضا الباقين وأهله من نفذ باب داره إليه لا من لاصقه جداره وهل الاستحقاق في كلها لكلهم أم تختص شركة كل واحد بما بين رأس الدرب وباب داره وجهان أصحهما الثاني وليس لغيرهم فتح باب إليه للإستطراق وله فتحه إذا سمره في الأصح ومن له فيه باب ففتح آخر أبعد من رأس الدرب فلشركائه منعه فإن كان أقرب إلى رأسه ولم يسد الباب القديم فكذلك وإن سده فلا منع ومن له داران تفتحان إلى دربين أو مسدودين أو مسدود وشارع ففتح بابا بينهما لم يمنع في الأصح وحيث منع فتح الباب

فصالحه أهل الدرب بمال صح ويجوز فتح الكوات والجدار بين المالكين قد يختص به أحدهما وقد يشتركان فيه فالمختص ليس للآخر وضع الجذوع عليه بغير إذن في الجديد ولا يجبر المالك فلو رضي بلا عوض فهو إعارة له الرجوع قبل البناء عليه وكذا بعده في الأصح وفائدة الرجوع تخييره بأن يبقيه بأجرة أو يقلع ويغرم أرش نقصه وقيل: فائدته طلب الأجرة فقط ولو رضي بوضع الجذوع والبناء عليها بعوض فإن أجر رأس ms087 الجدار للبناء فهو إجارة وإن قال بعته للبناء عليه أو بعت حق البناء عليه فالأصح أن هذا العقد فيه شوب بيع وإجارة فإذا بنى فليس لمالك الجدار نقضه بحال ولو انهدم الجدار فأعاده مالكه فللمشتري إعادة البناء وسواء كان الإذن بعوض أو بغيره يشترط بيان قدر الموضع المبني عليه طولا وعرضا وسمك الجدران وكيفيتها وكيفية السقف المحمول عليها ولو أذن في البناء على أرضه كفى بيان قدر محل البناء وأما الجدار المشترك فليس لأحدهما وضع جذوعه عليه بغير إذن في الجديد وليس له أن يتد فيه وتدا أو يفتح كوة بلا إذن وله أن يستند إليه ويسند متاعا لا يضر وله ذلك في جدار الأجنبي وليس له إجبار شريكه على العمارة في الجديد فإن أراد إعادة منهدم بآلة لنفسه لم يمنع ويكون المعاد ملكه يضع عليه ما شاء وينقضه إذا شاء ولو قال لآخر لا تنقضه وأغرم لك حصتي لم يلزمه إجابته وإن أراد إعادته بنقضه المشترك فللآخر منعه ولو تعاونا على إعادته بنقضه عاد مشتركا كما كان ولو انفرد أحدهما وشرط له الآخر زيادة جاز وكانت في مقابلة عمله في نصيب الآخر ويجوز أن يصالح على إجراء الماء وإلقاء الثلج في ملكه على مال ولو تنازعها جدارا بين ملكيهما فإن اتصل ببناء أحدهما بحيث يعلم أنهما بنيا معا فله اليد وإلا فلهما فإن أقام أحدهما بينة قضى له وإلا حلفا فإن حلفا أو نكلا جعل بينهما وإن حلف

أحدهما قضى له ولو كان لأحدهما عليه جذوع لم يرجح والسقف بين علو وسفل كجدار بين ملكين فينظر أيمكن إحداثه بعد العلو فيكون في يدهما وإلا فلصاحب السفل.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, 'باب الحوالة', 'يشترط لها رضا المحيل والمحتال لا المحال عليه في الأصح ولا تصح على من لا دين عليه وقيل: تصح برضاه وتصح بالدين اللازم وعليه المثلى وكذا المتقوم في الأصح وبالثمن في مدة الخيار وعليه في الأصح والأصح صحة حوالة المكاتب سيده بالنجوم دون حوالة السيد عليه ويشترط العلم بما يحال به ms088 وعليه قدرا وصفة وفي قول تصح بابل الدية وعليها ويشترط تساويهما جنسا وقدرا وكذا حلولا وأجلا وصحة وكسرا في الأصح ويبرأ بالحوالة المحيل عن دين المحتال والمحال عليه عن دين المحيل ويتحول حق المحتال إلى ذمة المحال عليه فإن تعذر بفلس أو جحد وحلف ونحوهما لم يرجع على المحيل فلو كان مفلسا عند الحوالة وجهله المحتال فلا رجوع له وقيل: له الرجوع إن شرط يساره ولو أحال المشتري بالثمن فرد المبيع بعيب بطلت في الأظهر أو البائع بالثمن فوجد الرد لم تبطل على المذهب ولو باع عبدا وأحال بثمنه ثم اتفق المتبايعان والمحتال على حريته أو ثبتت ببينة بطلت الحوالة وإن كذبهما المحتال ولا بينة حلفاه على نفي العلم ثم يأخذ المال من المشتري ولو قال المستحق عليه وكلتك لتقبض لي وقال المستحق أحلتني أو قال أردت بقولي أحلتك الوكالة وقال المستحق بل أردت الحوالة صدق المستحق عليه بيمينه وفي الصورة الثانية وجه وإن قال أحلتك فقال وكلتني صدق الثاني بيمينه.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 5, NULL, 'باب الضمان', 'شرط الضامن الرشد وضمان محجور عليه بفلس كشرائه وضمان عبد بغير إذن سيده باطل في الأصح ويصح بإذنه فإن عين للأداء كسبه أو غيره قضى منه وإلا فالأصح أنه إن كان مأذونا له في التجارة تعلق بما في يده وما يكسبه بعد الإذن وإلا فبما يكسبه والأصح اشتراط معرفة المضمون له وأنه لا يشترط قبوله ورضاه ولا يشترط رضا المضمون عنه قطعا ولا معرتفه في الأصح ويشترط في المضمون كونه ثابتا وصحح القديم ضمان ما سيجب والمذهب صحة ضمان الدرك بعد قبض الثمن وهو أن يضمن للمشتري الثمن إن خرج المبيع مستحقا أو معيبا أو ناقصا لنقص الصنجة وكونه لازما لا كنجوم كتابه ويصح ضمان الثمن في مدة خيار في الأصح وضمان الجعل كالرهن به وكونه معلوما في الجديد والإبراء من المجهول باطل في الجديد لا من إبل الدية ويصح ضمانها في الأصح ولو قال ضمنت مالك على زيد من درهم إلى عشرة فالأصح صحته وأنه يكون ms089 ضامنا لعشرة.

قلت: الأصح لتسعة. والله أعلم.

فصل

المذهب صحة كفالة البدن فإن كفل بدن من عليه مال لم يشترط العلم بقدره ويشترط كونه مما يصح ضمانه والمذهب صحتها ببدن من عليه عقوبة لآدمي كقصاص وحد قذف ومنعها في حدود الله تعالى وتصح ببدن صبي ومجنون ومحبوس وغائب وميت ليحضره فيشهد على صورته ثم إن عين مكان التسليم تعين وإلا فمكانها ويبرأ الكفيل

بتسليمه في مكان التسليم بلا حائل كمتغلب وبأن يحضر المكفول به ويقول سلمت نفسي عن جهة الكفيل ولا يكفي مجرد حضوره فإن غاب لم يلزم الكفيل إحضاره إن جهل مكانه وإلا فيلزمه ويمهل مدة ذهاب وإياب فإن مضت ولم يحضره حبس وقيل: إن غاب إلى مسافة القصر لم يلزمه إحضاره والأصح أنه إذا مات ودفن لا يطالب الكفيل بالمال وأنه لو شرط في الكفاية أنه يغرم المال إن فات التسليم بطلت وأنها لا تصح بغير رضا المكفول.

فصل

يشترط في الضمان والكفالة لفظ يشعر بالتزام كضمنت دينك عليه أو تحملته أو تقلدته أو تكفلت ببدنه أو أنابا لمال أو بإحضار الشخص ضامن أو كفيل أو زعيم أو حميل ولو قال أؤدي المال أو أحضر الشخص فهو وعد والأصح أنه لا يجوز تعليقهما بشرط ولا توقيت الكفالة ولو تجزها وشرط تأخير الإحضار شهرا جاز وأنه يصح ضمان الحال مؤجلا أجلا معلوما وأنه يصح ضمان المؤجل حالا وأنه لا يلزمه التعجيل وللمستحق مطالبة الضامن والأصيل والأصح أنه لا يصح بشرط براءة الأصيل ولو أبرأ الأصيل برىء الضامن ولا عكس ولو مات أحدهما حل عليه دون الآخر إذا طالب المستحق الضامن فله مطالبة الأصيل بتخليصه بالأداء إن ضمن بإذنه والأصح أنه لا يطالبه قبل أن يطالب وللضامن الرجوع على الأصيل إن وجد إذنه في الضمان والأداء وإن انتفى فيهما فلا وإن أذن في الضمان فقط رجع في الأصح ولا عكس في الأصح ولو أدى مكسرا عن صحاح أو صالح عن مائة بثوب قيمته خمسون فالأصح أنه لا يرجع إلا بما ms090 غرم ومن أدى دين غيره بلا ضمان ولا إذن فلا رجوع وإن أذن بشرط الرجوع رجع وكذا إن أذن مطلقا في الأصح والأصح أن مصالحته على غير جنس الدين لا تمنع الرجوع ثم إنما يرجع الضامن والمؤدي إذا أشهد بالأداء رجلا أو رجلا وامرأتين وكذا رجل ليحلف معه في الأصح فإن لم يشهد فلا رجوع إن أدى

في غيبة الأصيل وكذبه وكذا إن صدقه في الأصح فإن صدقه المضمون له أو أدى بحضرة الأصيل رجع على المذهب.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 112;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 113, 'كتاب الشركة', 'كتاب الشركة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'هي أنواع: شركة الأبدان كشركة الحمالين وسائر المحترفة ليكون بينهما كسبهما متساويا أو متفاوتا مع اتفاق الصنعة أو اختلافها وشركة المفاوضة ليكون بينهما كسبهما وعليهما ما يعرض من غرم وشركة الوجوه بأن يشترك الوجيهان ليبتاع كل واحد منهما بمؤجل لهما فإذا باعا كان الفاضل عن الأثمان بينهما وهذه الأنواع باطلة وشركة العنان صحيحة ويشترط فيها لفظ يدل على الإذن في التصرف فلو اقتصرا على اشتركنا لم يكف في الأصح وفيهما أهلية التوكيل والتوكل وتصح في كل مثلى دون المتقوم وقيل: تختص بالنقد المضروب ويشترط خلط المالين بحيث لا يتميزان ولا يكفي الخلط مع اختلاف جنس أو صفة كصحاح ومكسرة هذا إذا اخرجا مالين وعقدا فإن ملكا مشتركا بإرث وشراء وغيرهما وأذن كل للآخر في التجارة فيه تمت الشركة والحيلة في الشركة في العروض أن يبيع كل واحد بعض عرضه ببغض عرض الآخر ويأذن له في التصرف ولا يشترط تساوي قدر المالين والأصح أنه يشترط العلم بقدرهما عند العقد ويتسلط كل منهما على التصرف بلا ضرر فلا يبيع نسيئة ولا بغير نقد البلد ولا بغبن فاحش ولا يسافر به ولا ببعضه بغير إذن ولكل فسخه متى شاء وينعزلان عن التصرف بفسخهما فإن قال أحدهما عزلتك أولا تتصرف في نصيبي لم ينعزل العازل وتنفسخ بموت أحدهما وبجنونه وبإغمائه والربح والخسران على قدر المالين تساويا في العمل أو تفاوتا فإن شرطا خلافه فسد العقد فيرجع

كل على الآخر بأجرة عمله في ماله وتنفذ التصرفات ms091 والربح على قدر المالين ويد الشريك يد أمانة فيقبل قوله في الرد والخسران والتلف فإن ادعا بسبب ظاهر طولب ببينة بالسبب ثم يصدق في التلف به ولو قال من في يده المال هو لي وقال الآخر مشترك أو بالعكس صدق صاحب اليد ولو قال لو اقتسمنا وصار لي صدق المنكر واشترى وقال اشتريته للشركة أو لنفسي وكذبه الآخر صدق المشتري.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 113;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 114, 'كتاب الوكالة', 'كتاب الوكالة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'شرط الموكل صحة مباشرته ما وكل فيه بملك أو ولاية فلا يصح توكيل صبي ولا مجنون ولا المرأة والمحرم في النكاح ويصح توكيل الولي في حق الطفل ويستثنى توكيل أعمى في البيع والشراء فيصح وشرط الوكيل صحة مباشرته التصرف لنفسه لا صبي ومجنون وكذا المرأة والمحرم في النكاح لكن الصحيح اعتماد قول صبي في الإذن في دخول دار وإيصال هدية والأصح صحة توكيل عبد في قبول نكاح ومنعه في الإيجاب وشرط الموكل فيه أن يملكه الموكل فلو وكل ببيع عبد سيملكه وطلاق من سينكحه بطل في الأصح وأن يكون قابلا للنيابة فلا يصح في عبادة أي الحج وتفرقة زكاة وذبح أضحية ولا في شهادة وإيلاء ولعان وسائر الأيمان ولا في الظهار في الأصح ويصح في طرفي بيع وهبة وسلم ورهن ونكاح وطلاق وسائر العقود والفسوخ وقبض الديون وإقباضها والدعوى والجواب وكذا في تملك المباحات كالأحياء والاصطياد والاحتطاب في الأظهر لا في الإقرار في الأصح ويصح في استيفاء عقوبة آدمي كقصاص وحد قذف وقيل: لا يجوز إلا بحضرة الموكل وليكن الموكل فيه معلوما من بعض الوجوه ولا يشترط علمه من كل وجه فلو قال وكلتك في كل قليل وكثير أو في كل أموري أو فوضت إليك كل شيء لم يصح وإن قال في بيع موالي وعتق أرقائي صح وإن وكله في شراء عبد وجب بيان نوعه أو دار وجب بيان المحلة

والسكة لا قدر الثمن في الأصح ويشترط من الموكل لفظ يقتضي رضاه كوكلتك في كذا أو فوضته إليك أو أنت وكيلي فيه فلو قال بع أو اعتق حصل ms092 الإذن ولا يشترط القبول لفظا وقيل: يشترط وقيل: يشترط صيغ العقود كوكلتك دون صيغ ومتى عزلتك فأنت وكيل صحت في الحال في الأصح وفي عوده وكيلا بعد العزل الوجهان في تعليقها ويجريان في تعليق العزل.

فصل

الوكيل بالبيع مطلقا ليس له البيع بغير نقد البلد ولا بنسيئة ولا بغبن فاحش وهو ما لا يحتمل غالبا فلو باع على أحد هذه الأنواع وسلم المبيع ضمن فان وكله ليبيع مؤجلا وقدر الأجل فذاك وإن أطلق صح في الأصح وحمل على المتعارف في مثله ولا يبيع لنفسه وولده الصغير والأصح أنه يبيع لأبيه وابنه البالغ وأن الوكيل بالبيع له قبض الثمن وتسليم المبيع ولا يسلمه حتى يقبض الثمن فإن خالف ضمن وإذا وكله في شراء لا يشتري معيبا فإن اشتراه في الذمة وهو يساوي مع العيب ما اشتراه به وقع عن الموكل إن جهل العيب وإن علمه فلا في الأصح وإن لم يساوه لم يقع عنه إن علمه وإن جهله وقع في الأصح وإذا وقع للموكل فلكل من الوكيل والموكل الرد وليس لوكيل أن يوكل بلا إذن أن تأتي منه ما وكل فيه وإن لم يتأت لكونه لا يحسنه أو لا يليق به فله التوكيل ولو كثر وعجز عن الإتيان بكله فالمذهب أنه يوكل فيما زاد على الممكن ولو أذن في التوكيل وقال وكل عن نفسك ففعل فالثاني وكيل الوكيل والأصح أنه ينعزل بعزله وانعزاله وإن قال عنى فالثاني وكيل الموكل وكذا لو أطلق في الأصح.

قلت: وفي هاتين الصورتين لا يعزل أحدهما الآخر ولا ينعزل بانعزاله وحيث جوزنا

للوكيل التوكيل يشترط أن يوكل أمينا إلا أن يعين الموكل غيره ولو وكل أمينا ففسق لم يملك الوكيل عزله في الأصح. والله أعلم.

فصل

قال: بع لشخص معين أو في زمن أو مكان معين تعين وفي المكان وجه إذا لم يتعلق به غرض وإن قال بع بمائة لم يبع بأقل وله أن يزيد إلا أن يصرح بالنهي ولو قال اشتر بهذا الدينار شاة ووصفها ms093 فاشترى به شاتين بالصفة فإن لم تساو واحدة دينارا لم يصح الشراء للموكل وإن ساوته كل واحدة فالأظهر الصحة وحصول الملك فيهما للموكل ولو أمره بالشراء بمعين فاشترى في الذمة لم يقع للموكل وكذا عكسه في الأصح ومتى خالف الموكل في بيع ماله أو الشراء بعينه فتصرفه باطل ولو اشترى في الذمة ولم يسم الموكل وقع للوكيل وإن سماه فقال: البائع بعتك فقال: اشتريت لفلان فكذا في الأصح وإن قالت: بعت موكلك زيدا فقال: اشتريت له فالمذهب بطلانه ويد الوكيل يد أمانة وإن كان بجعل فإن تعدى ضمن ولا ينعزل في الأصح وأحكام العقد تتعلق بالوكيل دون الموكل فيعتبر في الرؤية ولزوم العقد بمفارقة المجلس والتقابض في المجلس حيث يشترط الوكيل دون الموكل وإذا اشترى الوكيل طالبه البائع بالثمن إن كان دفعه إليه الموكل وإلا فلا إن كان الثمن معينا وإن كان في الذمة طالبه إن أنكر وكالته أو قال لا أعلمها وإن اعترف بها طالبه أيضا في الأصح كما يطالب الموكل ويكون الوكيل كضامن والموكل كأصيل وإذا قبض الوكيل بالبيع الثمن وتلف في يده وخرج المبيع مستحقا رجع عليه المشتري وإن اعترف بوكالته في الأصح ثم يرجع الوكيل على الموكل.

قلت: وللمشتري الرجوع على الموكل ابتداء في الأصح. والله أعلم.

فصل

الوكالة جائزة من الجانبين فإذا عزله الموكل في حضوره أو قال رفعت الوكالة أو أبطلتها أو أخرجتك منها انعزل فإن عزله وهو غائب انعزل في الحال وفي قول لا حتى يبلغه الخبر ولو قال عزلت نفسي أو رددت بالوكالة انعزل وينعزل بخروج أحدهما عن أهلية التصرف بموت أو جنون وكذا إغماء في الأصح وبخروج محل التصرف عن ملك الموكل وإنكار الوكيل الوكالة لنسيان أو لغرض في الإخفاء ليس بعزل فإن تعمد ولا عوض انعزل وإذا اختلف في أصلها أو صفتها بأن قال: وكلتني في البيع نسيئة أو الشراء بعشرين فقال: بل نقدا أو بعشرة صدق الموكل بيمينه ولو اشترى جارية بعشرين وزعم أن الموكل أمره فقال: بلى بعشرة ms094 وحلف فإن اشترى بعين مال الموكل وسماه في العقد أو قال: بعده اشتريته لفلان والمال له وصدقه البائع فالبيع باطل وإن كذبه حلف على نفي العلم بالوكالة ووقع الشراء للوكيل وكذا إن اشترى في الذمة ولم يسم الموكل وكذا إن سماه وكذبه البائع في الأصح وإن صدقه بطل الشراء وحيث حكم بالشراء للوكيل يستحب للقاضي أن يرفق بالموكل ليقول للوكيل إن كنت أمرتك بعشرين فقد بعتكها بها ويقول هو اشتريت لتحل له ولو قال أتيت بالتصرف المأذون فيه وأنكر الموكل صدق الموكل وفي قول الوكيل وقول الوكيل في تلف المال مقبول بيمنيه وكذا في الرد وقيل: إن كان بجعل فلا ولو ادعى الرد على رسول الموكل وأنكر الرسول صدق الرسول ولا يلزم الموكل تصديق الوكيل على الصحيح ولو قالت قبضت الثمن وتلف وأنكر الموكل صدق الموكل إن كان قبل تسليم المبيع وإلا فالوكيل على المذهب ولو وكله بقضاء دين فقال قضيته وأنكر المستحق صدق المستحق بيمينه

والأظهر أنه لا يصدق الوكيل على الموكل إلا ببينة وقيم اليتيم وإذا ادعى دفع المال إليه بعد البلوغ يحتاج إلى بينة على الصحيح وليس لوكيل ولا مودع أن يقول بعد طلب المالك لا أرد المال إلا بإشهاد في الأصح وللغاصب ومن لا يقبل قوله في الرد ذلك ولو قال رجل وكلني المستحق بقبض ماله عندك من دين أو عين وصدقه فله دفعه إليه والمذهب أنه لا يلزمه إلا ببينة على وكالته ولو قال أحالني عليك وصدقه وجب الدفع في الأصح.

قلت: وإن قال أنا وارثه وصدقه وجب الدفع على المذهب. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 114;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 115, 'كتاب الإقرار', 'كتاب الإقرار');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'يصح من مطلق التصرف وإقرار الصبي والمجنون لاغ فإن ادعى البلوغ بالاحتلام مع الإمكان صدق ولا يحلف وإن ادعاه بالسن طولب ببينة والسفيه والمغلس سبق حكم إقرارهما ويقل إقرار الرقيق بموجب عقوبة ولو أقر بيدن جناية لا توجب عقوبة فكذبه السيد تعلق بذمته دون رقبته وإن أقر بدين معاملة لم يقبل على السيد إن لم يكن مأذونا في التجارة ويقبل ms095 إن كان ويؤدي من كسبه وما في يده ويصح إقرار المريض مرض الموت لأجنبي وكذا الوارث على المذهب ولو أقر في صحته بدين وفي مرضه لآخر لم يقدم الأول ولو أقر في صحته أو مرضه وأقر وارثه بعد موته لآخر لم يقدم الأول في الأصح ولا يصح إقرار مكره ويشترط في المقر له أهلية استحقاق المقر به فلو قال لهذه الدابة علي كذا فلغو فإن قال بسببها لمالكها وجب ولو قال لحمل هند كذا بإرث أو وصية لزمه وإن أسنده إلى جهة لا تمكن في حقه فلغو وإن أطلق صح في الأظهر وإذا كذب المقر له المقر ترك المال في يده في الأصح فإن رجع المقر في حال تكذيبه وقال غلطت قبل قوله في الأصح.

فصل

قوله لزيد كذا صيغة إقرار وقوله علي وفي ذمتي للدين ومعي وعندي للعين ولو قال لي عليك ألف فقال زن أو خذ أو زنه أو خذه أو اختم عليه أو اجعله في كيسك فليس بإقرار ولو قال بلى أو نعم أو صدقت أو أبرأتني منه أو قضيته أو أنا مقر به فهو إقرار ولو قال أنا مقر أو أنا أقربه فليس بإقرار ولو قال أليس لي عليك كذا فقال بلى أو نعم فإقرار

وفي نعم وجه ولو قال اقض الألف الذي لي عليك فقال نعم أو أقضي غدا أو أمهلني يوما أو حتى أقعد أو أفتح الكيس أو أجد فإقرار في الأصح

فصل

يشترط في المقر به أن لا يكون ملكا للمقر فلو قال داري أو ثوبي أو ديني الذي على زيد لعمرو فهو لغو ولو قال هذا لفلان وكان ملكي إلى أن أقررت به فأول كلامه إقرار وآخره لغو وليكن المقر به في يد المقر ليسلم بالإقرار للمقر له فلو أقر ولم يكن في يده ثم صار عمل يمقتضى الإقرار فلو أقر بحرية عبد في يد غيره ثم اشتراه حكم بحريته ثم إن كان قال هو حر الأصل فشراؤه افتداء وإن قال أعتقه ms096 فافتداء من جهته وبيع من جهة البائع على المذهب فيثبت فيه الخياران للبائع فقط ويصح الإقرار بالمجهول فإذا قال له على شيء قبل تفسيره بكل ما يتمول وإن قل ولو فسره بما لا يتمول لكنه من جنسه كحبة حنطة أو بما يحل اقتناؤه ككلب معلم وسرجين قبل في الأصح ولا يقبل بما لا يقتني كخنزير وكلب لا نفع فيه ولا بعيادة ورد سلام ولو أقر بمال أو مال عظيم أو كبير أو كثير قبل تفسيره بما قل منه وكذا بالمستولدة في الأصح لا بكلب وجلد ميتة وقوله له كذا كقوله شيء وقوله شيء شيء أو كذا كذا كما لو لم يكرر ولو قال شيء وشيء أو كذا وكذا وجب شيئان ولو قال كذا درهما أو رفع الدرهم أو جره لزمه درهم والمذهب أنه لو قال كذا وكذا درهما بالنصب

وجب درهمان وأنه لو رفع أو جر فدرهم ولو حذف الواو فدرهم في الأحوال ولو قال ألف ودرهم قبل تفسير الألف بغير الدراهم ولو قال خمسة وعشرون درهما فالجميع دراهم على الصحيح ولو قال الدراهم التي أقررت بها ناقصة الوزن فإن كانت دراهم البلد تامة الوزن فالصحيح قبوله إن ذكره متصلا ومنعه إن فصله عن الإقرار وإن كانت ناقصة قبل إن وصله وكذا إن فصله في النص والتفسير بالمغشوشة كهو بالناقصة ولو قال له علي من درهم إلى عشرة لزمه تسعة في الأصح وإن قال درهم في عشرة فإن أراد المعية لزمه أحد عشر أو الحساب فعشرة وإلا فدرهم.

فصل

قال له عندي سيف في غمد أو ثوب في صندوق لا يلزمه الظرف أو غمد فيه سيف أو صندوق فيه ثوب لزمه الظرف وحده أو عبد على رأسه عمامة لم تلزمه العمامة على الصحيح أو دابة بسرجها أو ثوب مطرز لزمه الجميع ولو قال في ميراث أبي ألف فهو إقرار على أبيه بدين ولو قال في ميراثي من أبي فهو وعد هبة ولو قال له علي درهم درهم لزمه درهم فإن ms097 قال ودرهم لزمه درهمان ولو قال له درهم ودرهم ودرهم لزمه بالأولين درهمان وأما الثالث: فإن أراد به تأكيد الثاني لم يجب به شيء وإن نوى الاستئناف لزمه ثالث وكذا إن نوى تأكيد الأول أو أطلق في الأصح ومتى أقر بمبهم كشيء وثوب وطولب بالبيان فامتنع

فالصحيح أنه يحبس ولو بين وكذبه المقر له فليبين وليدع والقول قول المقرفي نفيه ولو أقر له بألف ثم أقر له بألف في يوم آخر لزمه ألف فقط وإن اختلف القدر دخل الأقل في الأكثر فلو وصفهما بصفتين مختلفتين أو أسندهما إلى جهتين أو قال قبضت يوم السبت عشرة ثم قال قبضت يوم الأحد عشرة لزما ولو قال له علي ألف من ثمن خمر أو كلب أو ألف قضيته لزمه الألف في الأظهر ولو قال من ثمن عبد لم أقبضه إذا سلمه سلمت قبل على المذهب وجعل ثمنا ولو قال له علي ألف إن شاء الله لم يلزمه شيء على المذهب ولو قال ألف لا يلزم لزمه ولو قال له علي ألف ثم جاء بالألف وقال أردت به هذا وهو وديعة فقال المقر له لي عليه ألف آخر صدق المقر في الأظهر بيمينه فإن كان قال في ذمتي أو دينا صدق المقر له على المذهب

قلت: فإذا قبلنا التفسير بالوديعة فالأصح أنها أمانة فيقبل دعواه التلف بعد الإقرار ودعوى الرد وإن قال له عندي أو معي ألف صدق في دعوى الوديعة والرد والتلف قطعا والله أعلم ولو أقر ببيع أو هبة وإقباض ثم قال كان فاسدا وأقررت لظني الصحة لم يقبل وله تحليف المقر له فإن نكل حلف المقر وبرىء ولو قال هذه الدار لزيد بل لعمرو أو غصبتها من زيد بل من عمر وسلمت لزيد والأظهر أن المقر يغرم قيمتها لعمر وبالإقرار ويصح الاستثناء إن اتصل ولم يستغرق فلو قال له علي عشرة إلا تسعة إلا ثمانية وجب تسعة ويصح من غير الجنس كألف إلا نوبا ويبين بثوب قيمته دون ألف ومن المعين ms098 كهذه الدار له إلا هذا البيت أو هذه الدراهم له إلا ذا الدرهم وفي المعين وجه شاذ.

قلت: ولو قال هؤلاء العبيد له إلا واحدا قبل ورجع في البيان إليه فإن ماتوا إلا واحدا وزعم أنه المستثنى صدق بيمينه على الصحيح. والله أعلم.

فصل

أقر بنسب إن ألحقه بنفسه اشترط لصحته أن لا يكذبه الحس ولا الشرع بأن يكون معروف النسب من غيره وأن يصدقه المستلحق إن كان أهلا للتصديق فإن كان بالغا فكذبه لم يثبت إلا ببينة وإن استحلق صغيرا ثبت فلو بلغ وكذبه لم يبطل في الأصح ويصح أن يستلحق ميتا صغيرا وكذا كبيرا في الأصح ويرثه ولو استلحق اثنان بالغا ثبت لمن صدقه وحكم الصغير يأتي في اللقيط إن شاء الله تعالى ولو قال لولد أمته هذا ولدي ثبت نسبه ولا يثبت الاستيلاد في الأظهر وكذا لو قال ولدي ولدته في ملكي فإن قال علقت به في ملكي ثبت الإستيلاد فإن كانت فراشا له لحقه بالفراش من غير استلحاق وإن كانت مزوجة فالولد للزوج واستلحاق السيد باطل وأما إذا ألحق النسب بغيره كهذا أخي أو عمي ثبت نسبه من الملحق به بالشروط السابقة ويشترط كون الملحق به ميتا ولا يشترط أن لا يكون نفاه في الأصح ويشترط كون المقر وارثا حائزا والأصح أن المستلحق لا يرث ولا يشارك المقر في حصته وأن البالغ من الورثة لا ينفرد بالإقرار وأنه لو أقر أحد الوارثين وأنكر الآخر ومات ولم يرثه إلا المقر ثبت النسب وأنه لو أقر ابن حائز بأخوة مجهولة فأنكر المجهول نسب المقر لم يؤثر فيه ويثبت أيضا نسب المجهول وأنه إذا كان الوارث الظاهر يحجبه المستلحق كأخ أقر بابن للميت ثبت النسب ولا إرث', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 115;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 116, 'كتاب العارية', 'كتاب العارية');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'شرط المعير صحة تبرعه وملكه المنفعة فيعير مستأجر لا مستعير على الصحيح وله أن يستنيب من يستوفي المنفعة له والمستعار كونه منتفعا به مع بقاء عينه وتجوز إعارة جارية لخدمة امرأة أو محرم ويكره إعارة عبد مسلم لكافر والأصح اشتراط ms099 لفظ كأعرتك أو أعرني ويكفي لفظ أحدهما مع فعل الآخر ولو قال أعرتكه لتعلفه أو لتعيرني فرسك فهو إجارة فاسدة توجب أجرة المثل ومؤنة الرد على المستعير فإن تلفت لا باستعمال ضمنها وإن لم يفرط والأصح أنه لا يضمن ما ينمحق أو ينسحق باستعمال والثالث: يضمن المنمحق والمستعير من مستأجر لا يضمن في الأصح ولو تلفت دابته في يد وكيل بعثه في شغله أو في يد من سلمها إليه ليروضها فلا ضمان وله الانتفاع بحسب الإذن فإن أعار لزراعة حنطة زرعها ومثلها إن لم ينهه أو لشعير لم يزرع فوقه كحنطة ولو أطلق الزراعة صح في الأصح ويزرع إن شاء وإذا استعار لبناء أو غراس فله الزرع ولا عكس والصحيح أنه لا يغرس مستعير لبناء وكذا العكس وأنه لا تصح إعارة الأرض مطلقة بل يشترط تعيين نوع المنفعة.

فصل

لكل منهما رد العارية متى شاء إلا إذا أعار لدفن فلا يرجع حتى يندرس أثر المدفون وإذا أعار للبناء أو الغراس ولم يذكر مدة ثم رجع إن كان شرط القلع مجانا لزمه وإلا فإن اختار المستعير القلع قلع ولا يلزمه تسوية الأرض في الأصح

قلت: الأصح يلزمه والله أعلم وإن لم يختر لم يقلع مجانا بل للمعير الخيار بين أن يبقيه بأجرة أو يقلع ويضمن أرش النقص قيل: أو يتملكه بقيمته فإن لم يختر لم يقلع مجانا إن بذل المستعير الأجرة وكذا إن لم يبذلها في الأصح ثم قيل: يبيع الحاكم الأرض وما فيها وتقسم بينهما والأصح أنه يعرض عنهما حتى يختارا شيئا وللمعير دخولها والانتفاع بها ولا يدخلها المستعير بغير إذن للتفرج ويجوز للسقي والإصلاح في الأصح ولكل بيع ملكه وقيل: ليس للمستعير بيعه لثالث والعارية المؤقتة كالمطلقة وفي قول له القلع فيها مجانا إذا رجع وإذا أعار لزراعة ورجع قبل إدراك الزرع فالصحيح أن عليه الإبقاء إلى الحصاد وأن له الأجرة فلو عين مدة ولم يدرك فيها لتقصيره بتأخير الزراعة قلع مجانا ولو حمل السيل بذرا إلى أرضه فنبت ms100 فهو لصاحب البذر والأصح أنه يجبر على قلعه ولو ركب دابة وقال لمالكها أعرتنيها فقال بل أجرتكها أو اختلف مالك الأرض وزارعها كذلك فالمصدق المالك على المذهب وكذا لو قال أعرتني وقال بل غصبت مني فإن تلفت العين فقد اتفقا على الضمان لكن الأصح أن العارية تضمن بقيمة يوم التلف لا بأقصى القيم ولا بيوم القبض فإن كان ما يدعيه المالك أكثر حلف للزيادة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 116;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 117, 'كتاب الغصب', 'كتاب الغصب');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'هو الاستيلاء على حق الغير عدوانا فلو ركب دابة أو جلس على فراش فغاصب وإن لم ينقل ولو دخل داره وأزعجه عنها أو أزعجه وقهره على الدار ولم يدخل فغاصب وفي الثانية وجه واه ولو سكن بيتا ومنع المالك منه دون باقي الدار فغاصب للبيت فقط ولو دخل بقصد الاستيلاء وليس المالك فيها فغاصب وإن كان ولم يزعجه فغاصب لنصف الدار إلا أن يكون ضعيفا لا يعد مستوليا على صاحب الدار وعلى الغاصب الرد فإن تلف عنده ضمنه ولو أتلف مالا في يد مالكه ضمنه ولو فتح رأس زق مطروح على الأرض فخرج ما فيه بالفتح أو منصوب فسقط بالفتح وخرج ما فيه ضمن وإن سقط بعارض ريح لم يضمن ولو فتح قفصا عن طائر وهيجه فطار ضمن وإن اقتصر على الفتح فالأظهر أنه إذا طار في الحال ضمن وإن وقف ثم طار فلا والأيدي المترتبة على يد الغاصب أيدي ضمان وإن جهل صاحبها الغصب ثم إن علم فكغاصب من غاصب فيستقر عليه ضمان ما تلف عنده وكذا إن جهل وكانت يده في أصلها يد ضمان كالعارية وإن كانت يد أمانة كوديعة فالقرار على الغاصب ومتى أتلف الآخذ من الغاصب مستقلا به فالقرار عليه مطلقا وإن حمله الغاصب عليه بأن قدم له طعاما مغصوبا ضيافة فأكله فكذا في الأظهر وعلى هذا لو قدمه لمالكه فأكله برىء الغاصب.

فصل

تضمن نفس الرقيق بقيمة تلف أو أتلف تحت يد عادية وأبعاضه التي لا يتقدر أرشها من الحر بما نقص من قيمته وكذا المقدرة إن تلفت وإن ms101 أتلفت فكذا في القديم وعلى الجديد تتقدر من الرقيق والقيمة فيه كالدية في الحر ففي يده نصف قيمته وسائر الحيوان بالقيمة وغيره مثلى ومتقوم والأصح أن المثلى ما حصره كيل أو وزن وجاز السلم فيه كماء وتراب ونحاس وتبر ومسك وكافور وقطن وعنب ودقيق لا غالية ومعجون فيضمن المثلى بمثله تلف أو أتلف فإن تعذر فالقيمة والأصح أن المعتبر أقصى قيمة من وقت الغصب إلى تعذر المثل ولو نقل المغصوب المثلى إلى بلد آخر فللمالك أن يكلفه رده وأن يطالبه بالقيمة في الحال فإذا رده ردها فإن تلف في البلد المنقول إليه طالبه بالمثل في أي البلدين شاء فإن فقد المثل غرمه قيمة أكثر البلدين قيمة ولو ظفر بالغاصب في غير بلد التلف فالصحيح أنه إن كان لا مؤنة لنقله كالنقد فله مطالبته بالمثل وإلا فلا مطالبة بالمثل بل يغرمه قيمة بلد التلف وأما المتقوم فيضمن بأقصى قيمه من الغصب إلى التلف وفي الإتلاف بلا غصب بقيمة يوم التلف فإن جنى وتلف بسراية فالواجب الأقصى أيضا ولا تضمن الخمر ولا تراق على ذمي إلا أن يظهر شربها أو بيعها وترد عليه إن بقيت العين وكذا المحترمة إذا غصبت من مسلم والأصنام وآلات الملاهي لا يجب في إبطالها شيء والأصح أنها لا تكسر الكسر الفاحش بل تفصل لتعود كما قبل التأليف فإن عجز المنكر عن رعاية هذا الحد لمنع صاحب المنكر أبطله كيف تيسر وتضمن منفعة الدار والعبد ونحوهما بالتفويت والفوات في يد عادية ولا تضمن منفعة البضع إلا بتفويت وكذا منفعة بدن الحر في الأصح وإذا نقص المغصوب بغير استعمال وجب الأرش مع الأجرة وكذا لو نقص به بأن بلى الثوب في الأصح.

فصل

ادعى تلفه وأنكر المالك صدق الغاصب بيمينه على الصحيح فإذا حلف غرمه المالك في الأصح ولو اختلف في قيمته أو الثياب التي على العبد المغصوب أو في عيب خلقي صدق الغاصب بيمينه وفي عيب حادث يصدق المالك بيمينه في الأصح ولو رده ناقص القيمة لم يلزمه ms102 شيء ولو غصب ثوبا قيمته عشرة فصار بالرخص درهما فلبسه فأبلاه فصارت نصف درهم فرده لزمه خمسة وهي قسط التالف من أقصى القيم.

قلت: ولو غصب خفين قيمتهما عشرة فتلف أحدهما ورد الآخر وقيمته درهمان أو أتلف أحدهما غصبا أو في يد مالكه لزمه ثمانية في الأصح والله أعلم ولو حدث نقص يسرى إلى التلف بأن جعل الحنطة هريسة فكالتالف وفي قول يرده مع أرش النقص ولو جنى المغصوب فتعلق برقبته مال لزم الغاصب تخليصه بالأقل من قيمته والمال فإن تلف في يده غرمه المالك وللمجني عليه تغريمه وأن يتعلق بما أخذه المالك ثم يرجع المالك على الغاصب ولو رد العبد إلى المالك فبيع في الجناية رجع المالك بما أخذه المجني عليه على الغاصب ولو غصب أرضا فنقل ترابها أجبرها المالك على رده أو رد مثله وإعادة الأرض كما كانت وللناقل الرد وإن لم يطالبه المالك إن كان له فيه غرض وإلا فلا يرده بلا إذن في الأصح ويقاس بما ذكرنا حفر البئر وطمها إذا أعاد الأرض كما كانت ولم يبق نقص فلا أرش لكن عليه أجرة المثل لمدة الإعادة وإن بقي نقص وجب أرشه معها ولو غصب زيتا ونحوه وأغلاه فنقصت عينه دون قيمته رده ولزمه الذاهب في الأصح وإن نقصت

القيمة فقط لزمه الأرش وإن نقصتا غرم الذاهب ورد الباقي مع أرشه إن كان نقص القيمة أكثر والأصح أن السمن لا يجبر نقص هزال قبله وإن تذكر صنعة نسيها يجبر النسيان وتعلم صنعة لا يجبره نسيان أخرى قطعا ولو غصب عصيرا فتخمر ثم تخلل فالأصح أن الخل للمالك وعلى الغاصب الأرش إن كان الخل أنقص قيمة ولو غصب خمرا فتخللت أو جلد ميتة فدبغه فالأصح أن الخل والجلد للمغصوب منه

فصل

زيادة المغصوب إن كانت أثرا محضا كقصارة فلا شيء للغاصب بسببها وللمالك تكليفه رده كما كان إن أمكن وأرش النقص وإن كانت عينا كبناء وغراس كلف القلع وإن صبغ الثوب بصبغه وأمكن فصله اجبر عليه في الأصح ms103 وإن لم يمكن فإن لم تزد قيمته فلا شيء للغاصب فيه وإن نقصت لزمه الأرش وإن زادت اشتركا فيه ولو خلط المغصوب بغيره وأمكن التمييز لزمه وإن شق فإن تعذر فالمذهب أنه كالتالف فله تغريمه وللغاصب أن يعطيه من غير المخلوط ولو غصب خشبة وبنى عليها أخرجت ولو أدرجها في سفينة فكذلك إلا أن يخاف تلف نفس أو مال معصومين ولو وطىء المغصوبة عالما بالتحريم حد وإن جهل فلا حد وفي الحالين يجب المهر إلا أن تطاوعه فلا يجب على الصحيح وعليها الحد إن علمت ووطء المشتري من الغاصب كوطئه في الحد والمهر فإن غرمه لم يرجع به على الغاصب في الأظهر وإن أحبل عالما بالتحريم فالود رقيق غير نسيب وإن جهل فحر نسيب

وعليه قيمته يوم الانفصال ويرجع بها المشتري على الغاصب ولو تلف المغصوب عند المشتري وغرمه لم يرجع به وكذا لو تعيب عنده في الأظهر ولا يرجع بغرم منفعة استوفاها في الأظهر ويرجع بغرم ما تلف عنده وبأرش نقض بنائه وغراسه إذا نقض في الأصح وكل ما لو غرمه المشتري رجع به لو غرمه الغاصب لم يجرع به على المشتري وما لا فيرجع.

قلت: وكل من انبنت يده على يد الغاصب فكالمشتري. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 117;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 118, 'كتاب الشفعة', 'كتاب الشفعة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'لا تثبت في منقول بل في أرض وما فيها من بناء وشجر تبعا وكذا ثمر لم يؤبر في الأصح ولا شفعة في حجرة بنيت على سقف غير مشترك وكذا مشترك في الأصح وكل ما لو قسم بطلت منفعته المقصودة كحمام ورحى لا شفعة فيه في الأصح ولا شفعة إلا لشريك ولو باع دارا وله شريك في ممرها فلا شفعة له فيها والصحيح ثبوتها في الممر إن كان للمشتري طريق آخر إلى الدار أو أمكن فتح باب إلى شارع وإلا فلا وإنما تثبت فيما ملك بمعاوضة ملكا لازما متأخرا عن ملك الشفيع كمبيع ومهر وعوض خلع وصلح دم ونجوم وأجرة ورأس مال سلم ولو شرط في البيع الخيار لهما أو للبائع لم ms104 يؤخذ بالشفعة حتى ينقطع الخيار وإن شرط للمشتري وحده فالأظهر أنه يؤخذ إن قلنا الملك للمشتري وإلا فلا ولو وجد المشتري بالشقص عيبا وأراد رده بالعيب وأراد الشفيع أخذه ويرضى بالعيب فالأظهر إجابة الشفيع ولو اشترى اثنان دارا أو بعضها فلا شفعة لأحدهما على الآخر ولو كان للمشتري شرك في الأرض فالأصح أن الشريك لا يأخذ كل المبيع بل حصته ولا يشترط في التملك بالشفعة حكم حاكم ولا إحضار الثمن ولا حضور المشتري ويشترط لفظ من الشفيع كتملكت أو أخذت بالشفعة ويشترط مع ذلك إما تسليم العوض إلى المشتري فإذا تسلمه أو ألزمه القاضي التسلم ملك الشفيع الشقص وإما رضا المشتري

بكون العوض في ذمته وإما قضاء القاضي له بالشفعة إذا حضر مجلسه وأثبت حقه فيملك به في الأصح ولا يتملك شقضا لم يره الشفيع على المذهب.

فصل

إن اشترى بمثلي أخذه الشفيع بمثله أو بمتقوم فبقيمته يوم البيع وقيل: يوم استقراره بانقطاع الخيار أو بمؤجل فالأظهر أنه مخير بين أن يعجل ويأخذ في الحال أو يصبر إلى المحل ويأخذ ولو بيع شقص وغيره أخذه بحصته من القيمة ويؤخذ الممهور بمهر مثلها وكذا عوض الخلع ولو اشترى بجزاف وتلف امتنع الأخذ فإن عين الشفيع قدرا وقال المشتري لم يكن معلوم القدر حلف على نفي العلم وإن ادعى علمه ولم يعين قدرا لم تسمع دعواه في الأصح وإذا ظهر الثمن مستحقا فإن كان معينا بطل البيع والشفعة وإلا أبدل وبقيا وإن دفع الشفيع مستحقا لم تبطل شفعته إن جهل وكذا إن علم في الأصح وتصرف المشتري في الشقص كبيع ووقف وإجارة صحيح وللشفيع نقض ما لا شفعة فيه كالوقف وأخذه ويتخير فيما فيه شفعة كبيع بين أن يأخذ بالبيع الثاني أو ينقضه ويأخذ بالأول ولو اختلف المشتري والشفيع في قدر الثمن صدق المشتري وكذا لو أنكر الشراء أو كون الطالب شريكا فإن اعترف الشريك بالبيع فالأصح ثبوت الشفعة ويسلم الثمن إلى البائع إن لم يعترف بقبضه وإن اعترف فهل يترك في ms105 يد الشفيع أم يأخذه القاضي ويحفظه فيه خلاف سبق في الإقرار نظيره ولو استحق الشفعة جمع أخذوا على قدر الحصص وفي قول على الرؤس ولو باع أحد الشريكين نصف حصته لرجل ثم باقيها لآخر فالشفعة في النصف

الأول للشريك القديم والأصح أنه إن عفا عن النصف الأول شاركه المشتري الأول في النصف الثاني وإلا فلا والأصح أنه لو عفا أحد شفيعين سقط حقه ويخبر الآخر بين أخذ الجميع وتركه وليس له الإقتصار على حصته وأن الواحد إذا أسقط بعض حقه سقط كله ولو حضر أحد شفيعين فله اخذ الجميع في الحال فإذا حضر الغائب شاركه والأصح أن له تأخير الأخذ إلى قدوم الغائب ولو اشتريا شقصا فللشفيع أخذ نصيبهما ونصيب أحدهما ولو اشترى واحد من اثنين فله أخذ حصة أحد البائعين في الأصح والأظهر أن الشفعة على الفور فإذا علم الشفيع بالبيع فليبادر على العادة فإن كان مريضا أو غائبا عن بلد المشتري أو خائفا من عدو فليوكل إن قدر وإلا فليشهد على الطلب فإن ترك المقدور عليه منهما بطل حقه في الأظهر فلو كان في صلاة أو حمام أو طعام فله الإتمام ولو أخر وقال لم أصدق المخبر لم يعذر إن أخبره عدلان وكذا ثقة في الأصح ويعذر أن أخبره من لا يقبل خبره ولو أخبر بالبيع بألف فترك فبان بخمسمائة بقي حقه وإن بان بأكثر بطل ولو لقي المشتري فسلم عليه أو قال بارك الله في صفقتك لم يبطل وفي الدعاء وجه ولو باع الشفيع حصته جاهلا بالشفعة الأصح بطلانها', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 118;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 119, 'كتاب القراض', 'كتاب القراض');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'القراض والمضاربة أن يدفع إليه مالا ليتجر فيه والربح مشترك ويشترط لصحته كون المال دراهم أو دنانير خالصا فلا يجوز على تبر وحلي ومغشوش وعروض ومعلوما معينا وقيل: يجوز على إحدى الصرتين ومسلما إلى العامل فلا يجوز شرط كون المال في يد المالك ولا عمله معه ويجوز شرط عمل غلام المالك معه على الصحيح ووظيفة العامل التجارة وتوابعها كنشر الثياب وطيها فلو قارضه ليشتري حنطة فيطحن ms106 ويخبز أو غزلا ينسجه ويبيعه فسد القراض ولا يجوز أن يشترط عليه شراء متاع معين أو نوع يندر وجوده أو معاملة شخص ولا يشترط بيان مدة القرض فلو ذكر مدة ومنعه التصرف بعدها فسد وإن منعه الشراء بعدها فلا في الأصح ويشترط اختصاصهما بالربح واشتراكهما فيه ولو قال قارضتك على أن كل الربح لك فقراض فاسد وقيل: قراض صحيح وإن اقل كله لي فقراض فاسد وقيل: إبضاع وكونه معلوما بالجزئية فلو قال على أن لك فيه شركة أو نصيبا فسد أو بيننا فالأصح الصحة ويكون نصفين ولو قال لي النصف فسد في الأصح وإن قال لك النصف صح على الصحيح ولو شرط لأحدهما عشرة أو ربح صنف فسد.

فصل

يشترط إيجاب وقبول وقيل: يكفي القبول بالفعل وشرطهما كوكيل وموكل ولو قارض لعامل آخر بإذن المالك ليشاركه في العمل والربح لم يجز في الأصح وبغير أذنه فاسد فإن تصرف الثاني فتصرف غاصب فإن اشترى في الذمة وقلنا بالجديد فالربح للعامل الأول في الأصح وعليه للثاني أجرته وقيل: هو للثاني وإن اشترى بعين مال القراض فباطل ويجوز أن يقارض الواحد اثنين متفاضلا متساويا والإثنان واحدا والربح بعد نصيب العامل بينهما بحسب المال وإذا فسد القراض نفذ تصرف العامل والربح للمالك وعليه للعامل أجرة مثل عمله إلا إذا قال قارضتك وجميع الربح لي فلا شيء له في الأصح ويتصرف العامل محتاطا لا بغبن ولا نسيئة بلا إذن وله البيع بعرض وله الرد بعيب تقتضيه مصلحة فإن اقتضت الإمساك فلا في الأصح وللمالك الرد فإن اختلفا عمل بالمصلحة ولا يعامل المالك ولا يشتري للقراض بأكثر من رأس المال ولا من يعتق على المالك بغير إذنه وكذا زوجه في الأصح ولو فعل لم يقع للمالك ويقع للعامل إن اشترى في الذمة ولا يسافر بالمال بلا إذن ولا ينفق منه على نفسه حضرا وكذا سفرا في الأظهر وعليه فعل ما يعتاد كطي الثوب ووزن الخفيف كذهب ومسك لا الأمتعة الثقيل: ة ونحوه وما لا يلزمه له ms107 الاستئجار عليه والأظهر أن العامل يملك حصته من الربح بالقسمة لا بالظهور وثمار الشجر والنتاج وكسب الرقيق والمهر الحاصلة من مال القراض يفوز بها المالك وقيل: مال قراض والنقص الحاصل بالرخص محسوب من الربح ما أمكن ومجبور به وكذا لو تلف بعضه بآفة أو غصب أو سرقة بعد تصرف العامل في الأصح وإن تلف قبل تصرفه فمن رأس المال في الأصح.

فصل

لكل فسخه ولو مات أحدهما أو جن أو أغمى عليه انفسخ ويلزم العامل الاستيفاء إذا فسخ أحدهما وتنضيض رأس المال إن كان عرضا وقيل: لا يلزمه التنضيض إن لم يكن ربح ولو استرد المالك بعضه قبل ظهور ربح وخسران رجع رأس المال إلى الباقي وإن استرد بعد الربح فالمسترد شائع ربحا ورأس مال مثاله رأس المال مائة والربح عشرون واسترد عشرين فالربح سدس المال فيكون المسترد سدسه من الربح فيستقر للعامل المشروط منه وباقيه من رأس المال وإن استرد بعد الخسران فالخسران موزع على المسترد والباقي فلا يلزم جبر حصة المسترد لو ربح بعد ذلك مثاله المال مائة والخسران عشرون ثم استرد عشرين فربع العشرين حصة المسترد ويعود رأس المال إلى خمسة وسبعين ويصدق العامل بيمينه في قوله أربح أو لم أربح إلا كذا أو اشتريت هذا للقراض أولى أولم تنهني عن شراء كذا وفي قدر رأس المال ودعوى التلف وكذا دعوى الرد في الأصح ولو اختلفا في المشروط له تحالفا وله أجرة المثل.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 119;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 120, 'كتاب المساقاة', 'كتاب المساقاة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'تصح من جائز التصرف ولصبي ومجنون بالولاية وموردها النخل والعنب وجوزها القديم في سائر الأشجار المثمرة ولا تصح المخابرة وهي عمل الأرض ببعض ما يخرج منها والبذر من العامل ولا المزارعة وهي هذه المعاملة والبذر من المالك فلو كان بين النخل بياض صحت المزارعة عليه مع المساقاة على البخل بشرط اتحاد العامل وعسر أفراد النخل بالسقي والبياض بالعمارة والأصح انه يشترط أن لا يفصل بينهما وأن لا يقدم المزارعة وإن كثير البياض كقليله وأنه لا يشترط تساوي الجزء المشروط من الثمر والزرع ms108 وأنه لا يجوز أن يخابر تبعا للمساقاة فإن أفردت أرض بالمزارعة فالمغل للمالك وعليه للعامل أجرة عمله ودوابه وآلاته وطريق جعل الغلة لهما ولا أجرة أن يستأجره بنصف البذر ليزرع له النصف لآخر ويعيره نصف الأرض أو يستأجره بنصف البذر ونصف منفعة الأرض ليزرع النصف الآخر في النصف الآخر من الأرض.

فصل

يشترط تخصيص الثمر بهما واشتراكهما فيه والعلم بالنصيبين بالجزئية كالقراض والأظهر صحة المساقاة بعد ظهور الثمر لكن قبل بدو الصلاح ولو ساقاه على ودي ليغرسه ويكون الشجر لهما لم يجز ولو كان مغروسا وشرط له جزأ من الثمر على العمل فإن قدر له مدرة يثمر فيها غالبا صح وإلا فلا وقيل: أن تعارض الاحتمالان صح وله مساقاة شريكه في الشجر إذا شرط له زيادة على حصته ويشترط أن لا يشرط على العامل ما ليس من جنس أعمالها وأن ينفرد بالعمل وباليد في الحديقة ومعرفة العمل بتقدير المدة كسنة أو أكثر ولا يجوز التوقيت بإدراك الثمر في الأصح وصيغتها ساقيتك على هذا النخل بكذا أو سلمته إليك لتتعهده ويشترط القبول دون تفصيل الأعمال ويحمل المطلق في كل ناحية على العرف الغالب وعلى العامل ما يحتاج إليه لصلاح المثمر واستزادته مما يتكرر كل سنة كسقي وتنقية نهر وإصلاح الإجاجين التي يثبت فيها الماء وتلقيح وتنحية حشيش وقضبان مضرة وتعريش جرت به عادة وكذا حفظ الثمر وجذاذه وتجفيفه في الأصح وما قصد به حفظ الأصل ولا يتكرر كل سنة كبناء الحيطان وحفر نهر جديد فعلى المالك والمساقاة لازمة فلو هرب العامل قبل الفراغ وأتمه المالك متبرعا بقي استحقاق العامل وإلا استأجر الحاكم عليه من يتمه وإن لم يقدر على الحاكم فليشهد على الإنفاق إن أراد الرجوع ولو مات وخلف تركه أتم الوارث العمل منها له أن يتم العمل بنفسه أو بماله ولو ثبتت خيانة عامل ضم إليه مشرف فإن لم يتحفظ به استؤجر من ماله ولو خرج الثمر مستحقا فللعامل على المساقي أجره المثل.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 120;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 121, 'كتاب الإجارة', 'كتاب الإجارة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'شرطها كبائع ومشتر والصيغة آجرتك ms109 هذا أو أكريتك أو ملكتك منافعه سنة بكذا فيقول قبلت أو استأجرت أو اكتريت والأصح انعقادها بقوله آجرتك منفعتها ومنعها بقوله بعتك منفعتها وهي قسمان واردة على عين كإجارة العقار ودابة أو شخص معينين وعلى الذمة كاستئجار دابة موصوفة وبأن يلزم ذمته خياطة أو بناء ولو قال استأجرتك لتعمل كذا فإجارة عين وقيل: ذمة ويشترط في إجارة الذمة تسليم الأجرة في المجلس وإجارة العين لا يشترط ذلك فيها ويجوز فيها التعجيل والتأجيل إن كانت في الذمة وإذا أطلقت تعجلت وإن كانت معينة ملكت في الحال ويشترط كون الأجرة معلولة فلا تصح بالعمارة والعلف ولا ليسلخ بالجلد ويطحن ببعض الدقيق أو بالنخالة ولو استأجرها لترضع رقيقا ببعضه في الحال جاز على الصحيح وكون المنفعة متقومة فلا يصح استئجار بياع على كلمة لا تتعب وإن روجت السلعة وكذا دراهم ودنانير للتزيين وكلب للصيد في الأصح وكون المؤجر قادرا على تسليمها فلا يصح استئجار آبق ومغصوب وأعمى للفحظ وأرض للزراعة لا ماء لها دائم ولا يكفيها المطر المعتاد ويجوز أن كان لها ماء دائم وكذا إن كفاها

المطر المعتاد أو ماء الثلوج المجتمعة والغالب حصولها في الأصح والامتناع الشرعي كالحسي فلا يصح استئجار لقلع سن صحيحة ولا حائض لخدمة مسجد وكذا منكوحة لرضاع أو غيره بغير إذن الزوج في الأصح ويجوز تأجيل المنفعة في إجارة الذمة كألزمت ذمتك الحمل إلى مكة أول شهر كذا ولا يجوز إجارة عين لمنفعة مستقبلة فلو أجر السنة الثانية لمستأجر الأولى قبل انقضائها جاز في الأصح ويجوز كراء العقب في الأصح وهو أن يؤجر دابة رجلا ليركبها بعض الطريق أو رجلين ليركب هذا أياما وذا أياما ويبين البعضين ثم يقتسمان.

فصل

يشترط كون المنفعة معلومة ثم تارة تقدر بزمان كدار سنة وتارة بعمل كدابة إلى مكة وكخياطة ذا الثوب فلو جمعهما فاستأجره ليخيطه بياض النهار لم يصح في الأصح وبقدر تعليم القرآن بمدة أو تعيين سور وفي البناء يبين الموضع والطول والعرض والسمك وما يبني به إن قدر ms110 بالعمل وإذا صلحت الأرض لبناء وزراعة وغراس اشترط تعيين المنفعة ويكفي تعيين الزراعة عن ذكر ما يزرع في الأصح ولو قال لتنتفع بها بما شئت صح وكذا لو قال إن شئت فازرع وإن شئت فاغرس في الأرض ويشترط في إجارة دابة لركوب معرفة الراكب بمشاهدة أو وصف تام وقيل: لا يكفي الوصف وكذا الحكم فيما يركب عليه من محمل وغيره إن كان له ولو شرط حمل المعاليق مطلقا فسد العقد في الأصح وإن لم يشرطه لم يستحق ويشترط في إجارة العين تعيين الدابة وفي اشتراط رؤيتها الخلاف في بيع الغائب وفي إجاره الذمة ذكر الجنس والنوع والذكورة أو الأنوثة ويشترط فيهما بيان قدر

السير كل يوم إلا أن يكون بالطريق منازل مضبوطة فينزل عليها ويجب في الإيجار للحمل أن يعرف المحمول فإن حضر رآه وامتحنه بيده إن كان في ظرف وإن غاب قدر بكيل أو وزن وجنسه لا جنس الدابة وصفتها إن كانت إجارة ذمة إلا أن يكون المحمول زجاجا ونحوه.

فصل

لا تصح إجارة مسلم لجهاد ولا عبادة تجب لها نية إلا الحج وتفرقة زكاة وتصح لتجهيز ميت ودفنه وتعليم القرآن ولحضانة وإرضاع معا ولأحدهما فقط والأصح أنه لا يستتبع أحدهما الآخر والحضانة حفظ صبي وتعهده بغسل رأسه وبدنه وثيابه ودهنه وكحله وربطه في المهد وتحريكه لينام ونحوها ولو استأجر لهما فانقطع اللبن فالمذهب انفساخ العقد في الإرضاع دون الحضاة والأصح أنه لا يجب حبر وخيط وكحل على وراق وخياط وكحال.

قلت: صحح الرافعي في الشرح الرجوع فيه إلى العادة فإن اضطربت وجب البيان وإلا فتبطل الإجارة. والله أعلم.

فصل

يجب تسليم مفتاح الدار إلى المكتري وعمارتها على المؤجر فإن بادر وأصلحها وإلا فللمكتري الخيار وكسح الثلج عن السطح على المؤجر وتنظيف عرصة الدار عن ثلج وكناسه على المكتري وإن أجر دابة لركوب فعلى المؤجر الكاف وبرذعة وخرام وثفر وبرة وخطام وعلى المكتري محمل ومظلة ووطاء وغطاء وتوابعها والأصح في السرج اتباع العرف وظرف المحمول على المؤجر في إجارة ms111 الذمة وعلى المكتري في إجارة العين وعلى المؤجر في

إجارة الذمة الخروج مع الدابة لتعهدها وإعانة الراكب في ركوبه ونزوله بحسب الحاجة ورفع الحمل وحطه وشد المحمل وحله وليس عليه في إجارة العين إلا التخلية بين المكتري والدابة وتنفسخ إجارة العين بتلف الدابة ويثبت الخيار بعيبها ولا خيار في إجارة الذمة بل يلزمه الإبدال والطعام المحمول ليؤكل يبدل إذا أكل في الأظهر.

فصل

يصح عقد الإجارة مدة تبقى فيها العين غالبا وفي قول لا يزاد على سنة وفي قوله ثلاثين وللمكتري استيفاء المنفعة بنفسه وبغيره فيركب ويسكن مثله ولا يسكن حدادا ولا قصارا وما يستوفي منه كدار ودابة معينة لا يبدل وما يستوفي به كثوب وصبي عين للخياطة والإرتضاع يجوز إبداله في الأصح ويد المكتري على الدابة والثوب يد أمانة مدة الإجارة وكذا بعدها في الأصح ولو ربط دابة اكتراها لحمل أو ركوب ولم ينتفع بها لم يضمن إلا إذا انهدم عليها اصطبل في وقت لو انتفع بها لم يصبها الهدم ولو تلف المال في يد أجير بلا تعد كثوب استؤجر لخياطته أو صبغه لم يضمن إن لم ينفرد باليد بأن قعد المستؤجر معه أو أحضره منزله وكذا إذا انفرد في أظهر الأقوال والثالث: يضمن المشترك وهو من التزم عملا في ذمته لا المنفرد وهو من أجر نفسه مدة معينة لعمل ودفع ثوبا إلى قصار ليقصره أو خياط ليخيطه ففعل ولم يذكر أجرة فلا أجرة له وقيل: له وقيل: إن كان معروفا بذلك العمل فله وإلا فلا وقد يستحسن ولو تعدى المستأجر بأن ضرب الدابة وكبحها فوق العادة أو أركبها أثقل منه أو أسكن حدادا أو قصارا ضمن العين وكذا لو اكترى لحمل مائة رطل من حنطة فحمل مائة شعيرا أو عكس أو لعشرة أقفزة شعير فحمل حنطة دون عكسه ولو

اكترى لمائة فحمل مائة وعشرة لزمه أجرة المثل للزيادة وإن تلفت بذلك ضمنها إن لم يكن صاحبها معها فإن كان ضمن قسطا للزيادة وفي قول نصف القيمة ولو سلم ms112 المائة والعشرة إلى المؤجر فحملها جاهلا ضمن المكتري على المذهب ولو وزن المؤجر وحمل فلا أجرة للزيادة ولا ضمان إن تلفت ولو أعطاه ثوبا ليخيطه فخاطه قباء وقال أمرتني بقطعه قباء فقال بل قميصا فالأظهر تصديق المالك بيمينه ولا أجرة عليه وعلى الخياط أرش النقص.

فصل

لا تنفسخ الأجرة بعذر كتعذر وقود حمام وسفر ومرض مستأجر دابة لسفر ولو استأجر أرضا لزراعة فزرع فهلك الزرع بجائحة فليس له الفسخ ولا حط شيء من الأجرة وتنفسخ بموت الدابة والأجيبر المعينين في المستقبل لا الماضي في الأظهر فيستقر قسطه من المسمى ولا تنفسخ بموت العاقدين ومتولي الوقف ولو أجر البطن الأول مدة ومات قبل تمامها أو الولي صبيا مدة لا يبلغ فيها بالسن فبلغ بالاحتلام فالأصح انفساخها في الوقف لا الصبي وإنها تنفسخ بانهدام الدار لا انقطاع ماء أرض استؤجرت لزراعة بل يثبت الخيار وغصب الدابة وإباق العبد تثبت الخيار ولو أكرى جمالا وهرب وتركها عند المكتري راجع القاضي ليمونها من مال الجمال فإن لم يجد له مالا اقترض عليه فإن وثق بالمكتري دفعه إليه وإلا جعله عند ثقة وله أن يبيع منها قدر النفقة ولو أذن للمكتري في الإنفاق من ماله ليرجع جاز في الأظهر ومتى قبض المكتري الدابة أو الدار وأمسكها حتى مضت مدة إجارة استقرت الأجرة وإن لم ينتفع وكذا لو اكترى لركوب إلى موضع وقبضها ومضت مدة إمكان السير

إليه وسواء فيه إجارة العين والذمة إذا سلم الدابة الموصوفة وتستقر في الإجارة الفاسدة أجرة المثل بما يستقر به المسمى في الصحيفة ولو أكرى عينا مدة ولم يسلمها حتى مضت انفسخت ولو لم يقدر مدة وأجر لركوب إلى موضع ولم يسلما حتى مضت مدة السير فالأصح أنها لا تنفسخ ولو أجر عبده ثم أعتقه فالأصح أنها لا تنفسخ الإجارة وأنه لا خيار للعبد والأظهر أنه لا يرجع على سيده بأجرة ما بعد العتق ويصح بيع المستأجرة للمكتري ولا تنفسخ الإجارة في الأصح ولو باعها لغيره جاز في الأظهر ولا ms113 تنفسخ.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 121;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 122, 'كتاب إحياء الموات', 'كتاب إحياء الموات');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'الأرض التي لا تعمر قط إن كانت ببلاد الإسلام فللمسلم تملكها بالأحياء وليس هو لذمي وإن كانت ببلاد كفار فلهم إحياؤها وكذا لمسلم إن كانت مما لا يذبون المسلمين عنها وما كان معمورا فلمالكه إن لم يعرف والعمارة إسلامية فمال ضائع وإن كانت جاهلية فالأظهر أنه يملك بالأحياء ولا يملك بالأحياء حريم معمور وهو ما تمس الحاجة إليه لتمام الانتفاع فحريم القرية النادي ومرتكض الخيل ومناخ الإبل ومطرح الرماد ونحوها وحريم البئر في الموات موقف النازح والحوض والدولاب ومجتمع الماء ومتردد الدابة وحريم الدار في الموات مطرح رماد وكناسة وثلج وممر في صوب الباب وحريم آبار القناة ما لو حفر فيه نقص ماؤها أو خيف الانهيار والدار المحفوفة بدور لا حريم لها ويتصرف كل واحد في ملكه على العادة فإن تعدى ضمن والأصح أنه يجوز أن يتخذ داره المحفوفة بمساكن حماما واصطبلا وحانوته في البزازين حانوت حداد إذا احتاط واحكم الجدران ويجوز إحياء موات الحرم دون عرفات في الأصح.

قلت: ومزدلفة ومنى كعرفة والله أعلم ويختلف الأحياء بحسب الغرض فإن أراد مسكنا اشترط تحويط البقعة وسقف بعضها وتعليق باب وفي الباب وجه أو زريبة دواب

فتحويط لا سقف وفي الباب الخلاف أو مزرعة فجمع التراب حولها وتسوية الأرض وترتيب ماء لها إن لم يكفها المطر المعتاد لزراعة في الأصح أو بستانا فجمع التراب والتحويط حيث جرت العادة به وتهيئة ماء ويشترط الغرس على المذهب ومن شرع في عمل إحياء ولم يتمه أو أعلم على بقعة لنصب أحجار أو غرز خشبا فمتحجر وهو أحق به لكن الأصح أنه لا يصح بيعه وأنه لو أحياه آخر ملكه ولو طالت مدة التحجر قال له السلطان أحي أو أترك فإن استمهل أمهل مدة قريبة ولو أقطعه الإمام مواتا صار أحق بإحيائه كالمتحجر ولا يقطع إلا قادرا على الإحياء وقدرا يقدر عليه وكذا التحجر والأظهر أن للإمام أن يحمي بقعة موات لرعي نعم جزية وصدقة وضالة وضعيف عن النجعة وإن له ms114 نقض حماه للحاجة ولا يحمي لنفسه.

فصل

منفعة الشارع المرور ويجوز الجلوس به لاستراحة ومعاملة نحوهما إذا لم يضيق على المارة ولا يشترط إذن الإمام وله تظليل مقعده ببارية وغيرها ولو سبق إليه اثنان أقرع وقيل: يقدم لإمام برأيه ولو جلس فيه للمعالمة ثم فارقه تاركا للحرفة أو منتقلا إلى غيره بطل حقه وإن فارقه ليعود لم يبطل إلا أن تطول مفارقته بحيث ينقطع معاملوه عنه ويألفون غيره ومن ألف من المسجد موضعا يفتي فيه ويقرئ كالجالس في شارع المعاملة ولو جلس فيه الصلاة لم يصر أحق به في غيرها فلو فارقه لحاجة ليعود لم يبطل اختصاصه في تلك الصلاة في الأصح وإن لم يترك إزاره ولو سبق رجل إلى موضع من رباط مسبل أو فقيه إلى مدرسة أو صوفي إلى خانقاه لم يزعج ولم يبطل حقه بخروجه لشراء حاجة ونحوه.

فصل

المعدن الظاهر وهو ما خرج بلا علاج كنفط وكبريت وقار وموميا وبرام وأحجار رحى لا يملك بإحياء ولا يثبت فيه اختصاص بتحجر ولا اقطاع فإن ضاق نيله قدم السابق بقدر حاجته فإن طلب زيادة فالأصح إزعاجه ولو جاءآ معا أقرع في الأصح والمعدن الباطن وهو ما لا يخرج إلا بعلاج كذهب وفضة وحديد ونحاس لا يملك بالحفر والعمل في الأظهر ومن أحيا مواتا فظهر فيه معدن باطن ملكه والمياه المباحة من الأودية والعيون في الجبال يستوي الناس فيها فإن أراد قوم سقي أراضيهم منها فضاق سقي الأعلى فالأعلى وحبس كل واحد الماء حتى يبلغ الكعبين فإن كان في الأرض ارتفاع وانخفاض أفرد كل طرف بسقي وما أخذ من هذا الماء في إناء ملك على الصحيح وحافر بئر بموات للارتفاق أولى بمائها حتى يرتحل والمحفورة للتملك أو في ملك يملك ماؤها في الأصح وسواء ملكه أم لا لا يلزمه بذل ما فضل عن حاجته لزرع ويجب لماشية على الصحيح والقناة المشتركة يقسم ماؤها بنصب خشبة في عرض النهر فيها ثقب متساوية أو متفاوتة على قدر الحصص ولهم القسمة مهايأة. ms115', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 122;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 123, 'كتاب الوقف', 'كتاب الوقف');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'شرط الوقف صحة عبارته وأهلية للتبرع والموقوف دوام الانتفاع به لا مطعوم وريحان ويصح وقف عقار ومنقول ومشاع لا عبد وثوب في الذمة ولا وقف حر نفسه وكذا مستولدة وكلب معلم وأحد عبديه في الأصح ولو وقف بناء أو غراسا في أرض مستأجرة لهما فالأصح جوازه فإن وقف على معين واحد أو جمع اشترط إمكان تمليكه فلا يصح على جنين ولا على العبد لنفسه فلو أطلق لوقف عليه فهو وقف على سيده ولو أطلق الوقف على بهيمة لغا وقيل: هو وقف على مالكها ويصح على ذمي لا مرتد وحربي ونفسه في الأصح وإن وقف على جهة معصية كعمارة الكنائس فباطل أو جهة قربة كالفقراء والعلماء والمساجد والمدارس صح أو جهة لا تظهر فيها القرية كالأغنياء صح في الأصح ولا يصح إلا بلفظ وصريحه وقفت كذا أو أرضى هو موقوفة عليه والتسبيل والتحبيس صريحان على الصحيح ولو قال تصدقت بكذا صدقة محرمة أو موقوفة أو لا تباع أولا توهب فصريح في الأصح وقوله تصدقت فقط ليس بصريح وإن نوى إلا أن يضيف إلى جهة عامة وينوي والأصح أن قوله حرمته أو أبدته ليس بصريح وأن قوله جعلت البقعة مسجدا تصير به مسجدا وأن الوقف على معين يشترط فيه قبوله ولو رد بطل حقه شرطنا القبول أم لا؟ ولو قال: وقفت

هذا سنة فباطل ولو قال: وقفت على أولادي أو على زيد ثم نسله ولم يزد فالأظهر صحة الوقف فإذا انقرض المذكور فالأظهر أنه يبقى وقفا وأن مصرفه أقرب الناس إلى الواقف يوم انقراض الذكور ولو كان الوقف منقطع الأول كوقفته على من سيولد لي فالمذهب بطلانه أو منقطع الوسط كوقفت على أولادي ثم رجل ثم الفقراء فالمذهب صحته ولو اقتصر على وقفت فالأظهر بطلانه ولا يجوز تعليقه كقوله إذا جاء زيد فقد وقفت ولو وقف بشرط الخيار بطل على الصحيح والأصح أنه إذا وقف بشرط أن لا يؤجر اتبع شرطه وأنه إذا شرط في وقف المسجد اختصاصه لطائفة كالشافعية ms116 اختص كالمدرسة والرباط ولو وقف على شخصين ثم الفقراء فمات أحدهما فالأصح المنصوص أن نصيبه يصرف إلى الآخر.

فصل

قوله: وقفت على أولادي وأولاد أولادي يقتضي التسوية بين الكل وكذا لو زاد ما تناسلوا أو بطنا بعد بطن ولو قال على أولادي ثم أولاد أولادي ثم أولادهم ما تناسلوا أو على أولادي وأولاد أولادي الأعلى فالأعلى أو الأول فالأول فهو للترتيب ولا يدخل أولاد الأولاد في الوقف على الأولاد في الأصح ويدخل أولاد البنات في الوقف على الذرية والنسل والعقب وأولاد الأولاد إلا أن يقول على من ينتسب إلي منهم ولو وقف على مواليه وله معتق ومعتق قسم بينهما وقيل: يبطل والصفة المتقدمة على جمل معطوفة تعتبر في الكل كوقفت على محتاجي أولادي وأحفادي وإخوتي وكذا المتأخرة عليها والاستثناء إذا عطف بواو كقوله على أولادي وأحفادي وإخوتي المحتاجين أو إلا أن يفسق بعضهم.

فصل

الأظهر أن الملك في رقبة الموقوف ينتقل إلى الله تعالى أي ينفك عن اختصاص لآدمي فلا يكون للواقف ولا للموقوف عليه ومنافعه ملك للموقوف عليه يستوفيها بنفسه وبغيره بإعارة وإجارة ويملك الأجرة وفوائده كثمرة وصوف ولبين وكذا الولد في الأصح والثاني يكون وقفا ولو ماتت البهيمة اختص بجلدها وله مهر الجارية إذا وطئت بشبهة أو نكاح إن صححناه وهو الأصح والمذهب أنه لا يملك قيمة العبد الموقوف إذا أتلف بل يشتري بها عبدا ليكون وقفا مكانه فإن تعذر فبعض عبد ولو جفت الشجرة لم ينقطع الوقف على المذهب بل ينتفع بها جذعا وقيل: تباع والثمن كقيمة العبد والأصح جواز بيع حصر المسجد إذا بليت وجذوعه إذا انكسرت ولم تصلح إلا للإحراق ولو انهدم مسجد وتعذرت إعادته لم يبع بحال.

فصل

إن شرط الواقف النظر لنفسه أو غيره اتبع وإلا فالنظر للقاضي على المذهب وشرط الناظر العدالة والكفاية والاهتداء إلى التصرف ووظيفته العمارة والإجارة وتحصيل الغلة وقسمتها فإن فوض إليه بعض هذه الأمور لم يتعده وللواقف عزل من ولاه ونصب غيره إلا أن يشترط نظره حال الوقف ms117 وإذا أجر الناظر فزادت الأجرة في المدة أو ظهر طالب بالزيادة لم ينفسخ العقد في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 123;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 124, 'كتاب الهبة', 'كتاب الهبة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'التمليك بلا عوض هبة فإن ملك محتاجا لثواب الآخرة فصدقة فإن نقله إلى مكان الموهوب له إكراما له فهدية وشرط الهبة إيجاب وقبول لفظا ولا يشترطان في الهدية على الصحيح بل يكفي البعث من هذا والقبض من ذاك ولو قال أعمرتك هذه الدار فإذا مت فهي لورثتك فهي هبة ولو اقتصر على أعمرتك فكذا في الجديد ولو قال فإذا مت عادت إلي فكذا في الأصح ولو قال أرقبتك أو جعلتها لك رقبي أي إن مت قبلي عادت إلي وإن مت قبلك استقرت لك فالمذهب طرد القولين الجديد والقديم وما جاز بيعه جاز هبته وما لا كمجهول ومغصوب وضال فلا إلا حبتي حنطة ونحوها وهبة الدين للمدين إبراء ولغيره باطلة في الأصح ولا يملك موهوب إلا بقبض بإذن الواهب فلو مات أحدهما بين الهبة والقبض قام وارثه مقامه وقيل: ينفسخ العقد ويسن للوالد العدل في عطية أولاده بأن يسوي بين الذكر والأنثى وقيل: كقسمة الإرث وللأب الرجوع في هبة ولده وكذا لسائر الأصول على المشهور وشرط رجوعه بقاء الموهوب في سلطنة المتهب فيمتنع ببيعه ووقفه لا برهنه وهبته قبل القبض وتعليق عتقه وتزويجها وزراعتها وكذا الإجارة على المذهب ولو زال ملكه دعا ولم يرجع في الأصح ولو زاد رجع فيه بزيادته المتصلة لا المنفصلة ويحصل الرجوع برجعه فيما وهبت أو استرجعته أو رددته إلى ملكي أو نقضت الهبة لا يبيعه ووقفه

وهبته واعتاقه ووطئها في الأصح ولا رجوع لغير الأصول في هبة مقيدة بنفي الثواب ومتى وهب مطلقا فلا ثواب إن وهب لدونه وكذا لأعلى منه في الأظهر ولنظيره على المذهب فإن وجب فهو قيمة الموهوب في الأصح فإن لم يثبه فله الرجوع ولو وهب بشرط ثواب معلوم فالأظهر صحة العقد ويكون بيعا على الصحيح أو مجهول فالمذهب بطلانه ولو بعث هدية في ظرف فإن لم تجر العادة برده كقوصرة تمر فهو هدية ms118 أيضا وإلا فلا ويحرم استعماله إلا في أكل الهدية منه إن اقتضته العادة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 124;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 125, 'كتاب اللقظة', 'كتاب اللقظة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'يستحب الالتقاط لواثق بأمانة نفسه وقيل: يجب ولا يستحب لغير واثق ويجوز في الأصح ويكره لفاسق والمذهب أنه لا يجب الإشهاد على الالتقاط وأنه يصح التقاط الفاسق والصبي والذمي في دار الإسلام ثم الأظهر أنه ينزع من الفاسق ويوضع عند عدل وأنه لا يعتمد تعريفه بل يضم إليه رقيب وينزع الولي لقطة الصبي ويعرف ويتملكها للصبي إن رأى ذلك حيث يجوز الاقتراض له ويضمن الولي إن قصر في انتزاعه حتى تلف في يد الصبي والأظهر بطلان التقاط العبد ولا يعتد بتعريفه فلو أخذه سيده منه كان التقاطا.

قلت: المذهب صحة التقاط المكاتب كتابة صحيحة ومن بعضه حر وهي له ولسيده فإن كانت مهايأة فلصاحب النوبة في الأظهر وكذا حكم سائر النادر من الإكساب والمؤن إلا أرش الجناية والله أعلم.

فصل

الحيوان المملوك الممتنع من صغار السباع بقوة كبعير وفرس أو بعدو كأرنب وظبي أو طيران كحمام إن وجد بمفازة للقاضي التقاطه للحفظ وكذا لغيره في الأصح ويحرم التقاطه

لتملك وإن وجد بقرية فالأصح جواز التقاطه للتملك وما لا يمتنع منها كشاة يجوز التقاطه لتملك في القرية والمفازة ويتخير آخذه من مفازة فإن شاء عرفه وتملكه أو باعه وحفظ ثمنه وعرفها ثم تملكه أو أكله وغرم قيمته إن ظهر مالكه فإن أخذ من العمران فله الخصلتان الأوليان لا الثالثة في الأصح ويجوز أن يلتقط عبدا لا يميز ويلتقط غير الحيوان فإن كان يسرع فساده كهريسة فإن شاء باعه وعرفه ليتملك ثمنه وإن شاء تملكه في الحال وأكله وقيل: إن وجده في عمران وجب البيع وإن أمكن بقاؤه بعلاج كرطب يتجفف فإن كانت الغبطة في بيعه بيع أو في تجفيفه وتبرع به الواجد وإلا بيع بعضه لتجفيف الباقي ومن أخذ لقطة للحفظ أبدا فهي أمانة فإن دفعها إلى القاضي لزمه القبول ولم يوجب الأكثرون التعريف والحالة هذه فلو قصد بعد ذلك الخيانة لم يصر ضامنا في الأصح ms119 وإن أخذ بقصد الخيانة فضامن وليس له بعده أن يعرف ويتملك على المذهب وإن أخذ ليعرف ويتملك فأمانه مدة التعريف وكذا بعدها ما لم يختر التملك في الأصح ويعرف جنسها وصفتها وقدرها وعفاصها ووكاءها ثم يعرفها في الأسواق وأبواب المساجد ونحوها سنة على العادة يعرف أولا كل يوم طرفي النهار ثم كل يوم مرة ثم كل أسبوع ثم كل شهر ولا تكفي سنة متفرقة في الأصح.

قلت: الأصح تكفي. والله أعلم.

فصل

ويذكر بعض أوصافها ولا يلزمه مؤنة التعريف إن أخذ لحفظ بل يرتبها القاضي من بيت المال أو يقترض على المالك وإن أخذ لتملك لزمته وقيل: إن لم يتملك فعلى المالك والأصح أن الحقير لا يعرف سنة بل زمنا يظن أن فاقده يعرض عنه غالبا.

فصل

إذا عرف سنة لم يملكها حتى يختاره بلفظ كتملكت وقيل: تكفي النية وقيل: يملك بمضي السنة فإن تملك فظهر المالك واتفقا على رد عينها فذاك وإن أرادها المالك وأراد الملتقط العدول إلى بدلها أجيب المالك في الأصح وإن تلفت غرم مثلها أو قيمتها يوم التملك وإن نقصت بعيب فله أخذها مع الأرش في الأصح وإذا ادعاها رجل ولم يصفها ولا بينة لم تدفع إليه وإن وصفها وظن صدقه جاز الدفع إليه ولا يجب على المذهب فإن دفع فأقام آخر بينة بها حولت إليه فإن تلفت عنده فلصاحب البينة تضمين الملتقط والمدفوع إليه والقرار عليه.

قلت: لا تحل لقطة الحرم للتملك على الصحيح ويجب تعريفها قطعا. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 125;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 126, 'كتاب اللقيط', 'كتاب اللقيط');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'التقاط المنبوذ فرض كفاية ويجب الإشهاد عليه في الأصح وإنما تثبت ولاية الالتقاط لمكلف حر مسلم عدل رشيد ولو التقط عبد بغير إذن سيده انتزع منه فإن علمه فأقره عنده أو التقط بإذنه فالسيد الملتقط ولو التقط صبي أو فاسق أو محجور عليه أو كافر مسلما انتزع ولو ازدحم اثنان على أخذه جعله الحاكم عند من يراه منهما أو من غيرهما وإن سبق واحد فالتقطه منع الآخر من مزاحمته وإن التقطاه معا وهما أهل ms120 فالأصح انه يقدم غني على فقير وعدل على مستور فإن استويا أقرع وإذا وجد بلدي لقيطا ببلد فليس له نقله إلى بادية والأصح أن له نقله إلى بلد آخر وأن للغريب إذا التقط ببلد أن ينقله إلى بلده وإن وجد ببادية فله نقله إلى بلد وإن وجده بدوي ببلد فكالحضري أو ببادية أقر بيده وقيل: إن كانوا ينتقلون للنجعة لم يقر ونفقته في ماله العام كوقف على اللقطاء أو الخاص وهو ما اختص به كثياب ملفوفة عليه ومفروشة تحته وما في جيبه من دراهم وغيرها ومهده ودنانير منثورة فوقه وتحته وإن وجد في دار فهي له وليس له مال مدفون تحته وكذا ثياب وأمتعة موضوعة بقربة في الأصح فإن لم يعرف له مال فالأظهر أنه ينفق عليه من بيت المال فإن لم يكن قام المسلمون بكفايته قرضا وفي قول نفقة وللملتقط الاستقلال بحفظ ماله في الأصح ولا ينفق عليه منه إلا بإذن القاضي قطعا.

فصل

إذا وجد لقيط بدار الإسلام وفيها أهل ذمة أو بدار فتحوها وأقروها بيد كفار صلحا أو بعد ملكها بجزية وفيها مسلم حكم بإسلام اللقيط وإن وجد بدار كفار فكافر إن لم يسكنها مسلم كأسير وتاجر وإلا فمسلم في الأصح ومن حكم بإسلامه بالدار فأقام ذمي بينة بنسبه لحقه وتبعه في الكفر وإن اقتصر على الدعوى فالمذهب أنه لا يتبعه في الكفر ويحكم بإسلام الصبي بجهتين أخريين لا تفرضان في لقيط إحداهما الولادة فإذا كان أحد أبويه مسلما وقت العلوق فهو مسلم فإن بلغ ووصف كفرا فمرتد ولو علق بين كافرين ثم أسلم أحدهما حكم بإسلامه فإن بلغ ووصف كفرا فمرتد وفي قول كافر أصلي الثانية إذا سبى مسلم طفلا تبع السابي في الإسلام إن لم يكن معه احد أبويه ولو سباه ذمي لم يحكم بإسلامه في الأصح ولا يصح إسلام صبي مميز استقلالا على الصحيح.

فصل

إذا لم يقر اللقيط برق فهو حر إلا أن يقيم أحد بينة برقه وإن أقر به لشخص فصدقه قبل ms121 إن لم يسبق إقراره بحرية والمذهب أنه لا يشترط أن لا يسبق تصرف يقتضي نفوذه حرية كبيع ونكاح بل يقبل إقراره في أصل الرق وأحكامه المستقبلة لا الماضية المضرة بغيره في الأظهر فلو لزمه دين فأقر برق وفي يده مال قضى منه ولو ادعى رقه من ليس في يده بلا بينة لم يقبل وكذا إن ادعاه الملتقط في الأظهر ولو رأينا صغيرا مميزا او غيره في يد من يسترقه ولم نعرف استنادها إلى الالتقاط حكم له بالرق فإن بلغ وقال أنا حر لم يقبل قوله في الأصح إلا ببينة ومن أقام بينة برقه عمل بها ويشترط أن تتعرض البينة لسبب الملك وفي قول يكفي مطلق الملك ولو استلحق اللقيط حر مسلم لحقه وصار أولى بتربيته وإن

استلحقه عبد لحقه وفي قول يشترط تصديق سيده وإن استلحقته امرأة لم يلحقها في الأصح أو اثنان لم يقدم مسلم وحر على ذمي وعبد فإن لم تكن بينة عرض على القائف فيلحق من ألحقه به فإن لم يكن قائف أو تحير أو نفاه عنهما أو ألحقه بهما أمر بالانتساب بعد بلوغه إلى من يميل طبعه إليه منهما ولو أقام بينتين متعارضتين سقطتا في الأظهر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 126;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 127, 'كتاب الجعالة', 'كتاب الجعالة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'هي كقوله من رد آبقي فله كذا ويشترط صيغه تدل على العمل بعوض ملتزم فلو عمل بلا إذن أو أذن لشخص فعمل غيره فلا شيء له ولو قال أجنبي من رد عبد زيد فله كذا استحقه الراد على الأجنبي وإن قال: قال زيد من رد عبدي فله كذا وكان كاذبا لم يستحق عليه ولا على زيد ولا يشترط قبول العامل وإن عينيه وتصح على عمل مجهول وكذا معلوم في الأصح ويشترط كون الجعل معلوما فلو قال من رده فله ثوب أو أرضيه فسد العقد وللراد أجرة مثله ولو قال من بلد كذا فرده من أقرب منه فله قسطه من الجعل ولو اشترط اثنان في رده اشتركا في الجعل ولو التزم جعلا لمعين فشاركه غيره في العمل إن قصد ms122 إعانته فله كل الجعل وإن قصد العمل للمالك فللأول قسطه ولا شيء للمشارك بحال ولكل منهما الفسخ قبل تمام العمل فإن فسخ قبل الشروع أو فسخ العامل بعد الشروع فلا شيء له وإن فسخ المالك بعد الشروع فعليه أجرة المثل في الأصح وللمالك أن يزيد وينقص في الجعل قبل الفراغ وفائدته بعد الشروع وجوب أجرة المثل ولو مات الآبق في بعض الطريق أو هرب فلا شيء للعامل وإذا رده فليس له حبسه لقبض الجعل ويصدق المالك إذا أنكر شرط الجعل أو سعيه في رده فإن اختلفا في قدر الجعل تحالفا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 127;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 128, 'كتاب الفرائض', 'كتاب الفرائض');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'يبدأ من تركة الميت بمؤنة تجهيزه ثم تقضى ديونه ثم وصاياه من ثلث الباقي ثم يقسم الباقي بين الورقة.

قلت: فإن تعلق بعين التركة حق كالزكاة والجاني والمرهون والمبيع إذا مات المشتري مفلسا قدم على مؤنة تجهيزه. والله أعلم.

وأسباب الإرث أربعة قرابة ونكاح وولاء فيرث المعتق العتيق ولا عكس والرابع: الإسلام فتصرف التركة لبيت المال إرثا إذا لم يكن وارث بالأسباب الثلاثة والمجمع على إرثهم من الرجال عشرة الابن وابنه وإن سفل والأب وأبوه وإن علا والأخ وابنه إلا من الأم والعم إلا لأم وكذا ابنه والزوج والمعتق ومن النساء سبع البنت وبنت الابن وإن سفل والأم والجدة والأخت والزوجة والمعتقة فلو اجتمع كل الرجال ورث الأب والابن والزوج فقط أو كل النساء فالبنت وبنت الابن والأم والأخت للأبوين والزوجة أو الذين يمكن اجتماعهم من الصنفين فالأبوان والابن والبنت وأحد الزوجين ولو فقدوا كلهم فأصل المذهب أنه لا يورث ذوو الأرحام ولا يرد على أهل الفرض بل المال لبيت المال وأفتى المتأخرون إذا لم ينتظم أمر بيت المال بالرد على أهل الفرض غير الزوجين ما فضل عن

فروضهم بالنسبة فإن لم يكونوا صرف إلى ذوي الأرحام وهم من سوى المذكورين من الأقارب وهم عشرة أصناف أبو الأم وكل جد وجدة ساقطين وأولاد البنات وبنات الإخوة وأولاد الأخوات وبنات الإخوة للأم والعم للأم وبنات الأعمام والعمات والأخوال والخالات ms123 والمدلون بهم.

فصل

الفروض المقدرة في كتاب الله تعالى ستة النصف فرض خمسة زوج لم تخلف زوجته ولدا ولا ولد ابن وبنت أو بنت ابن أو أخت لأبوين أو لأب منفردات والربع فرض زوج لزوجته ولد أو ولد ابن وزوجة ليس لزوجها واحد منهما والثمن فرضها مع أحدهما والثلثان فرض بنتين فصاعادا أو بنتا ابن فأكثر وأختين فأكثر لأبوين أو لأب والثلث فرض أم ليس لميتها ولد ولا ولد ابن والاثنان من الإخوة والأخوات وفرض اثنين فأكثر من ولد الأم وقد يفرض للجد مع الإخوة والسدس فرض سبعة أب وجد لميتهما ولد أو ولد ابن وأم لميتها ولد أو ولد ابن أو اثنان من إخوة وأخوات وجدة ولبنت ابن مع بنت صلب ولأخت أو أخوات لأب مع أخت لأبوين وللواحد من ولد الأم.

فصل

الأب والابن والزوج لا يحجبهم أحد وابن الابن لا يحجبه إلا الابن أو ابن ابن أقرب

منه، والجد لا يحجبه إلا متوسط بينه وبين الميت والأخ لأبوين يحجبه الأب والابن وابن الابن ولأب يحجبه هؤلاء وأخ لأبوين ولأم يحجبه أب وجد وولد وولد ابن وابن الأخ لأبوين يحجبه ستة أب وجد وابن وابنه وأخ لأبوين ولأب ولأب يحجبه هؤلاء وابن الأخ لأبوين والعم لأبوين يحجبه هؤلاء وابن أخ لأب ولأب يحجبه هؤلاء وعم لأبوين وابن عم لأبوين يحجبه هؤلاء وعم لأب ولأب يحجبه هؤلاء وابن عم لأبوين والمعتق يحجبه عصبة النسب والبنت والأم والزوجة لا يحجبن وبنت الابن يحجبها ابن أو بنتان إذا لم يكن معها من يعصبها والجدة للأم لا يحجبها إلا الأم وللأب يحجبها الأب أو الأم والقربى من كل جهة تحجب البعدى منها والقربى من جهة الأم فأم أم تحجب البعدى من جهة الأب كأم أم أب والقربى من جهة الأب لا تحجب البعدى من جهة الأم في الأظهر والأخت من الجهات كالأخ والأخوات الخلص لأب يحجبهن أيضا أختان لأبوين والمعتقة كالمعتق وكل عصبة يحجبه أصحاب فروض مستغرقة.

فصل

الابن يستغرق المال وكذا ms124 البنون وللبنت النصف وللبنتين فصاعدا الثلثان ولو اجتمع بنون وبنات فالمال لهم للذكر مثل حظ الأنثيين وأولاد الابن إذا انفردوا كأولاد الصلب فلو اجتمع الصنفان فإن كان من ولد الصلب ذكر حجب أولاد الابن وإلا فإن كان لصلب بنت فلها النصف والباقي لولد الابن الذكور أو الذكور والإناث فإن لم يكن إلا أنثى أو إناث فلها أو لهن السدس وإن كان للصلب بنتان فصاعدا أخذتا الثلثين والباقي لولد الابن الذكور أو

الذكور والإناث ولا شيء للإناث الخلص إلا أن يكون أسفل منهن ذكر فيعصبهن وأولاد ابن الابن مع أولاد الابن كأولاد الابن مع أولاد الصلب وكذا سائر المنازل وإنما يعصب الذكر النازل من في درجته ويعصب من فوقه إن لم يكن لها شيء من الثلثين.

فصل

الأب يرث بفرض إذا كان معه ابن أو ابن ابن وبتعصيب إذا لم يكن ولد ولا ولد ابن وبهما إذا كان بنت أو بنت ابن له السدس فرضا والباقي بعد فرضهما بالعصوبة وللأم الثلث أو السدس في الحالين السابقين في الفروض ولها في مسألتي زوج أو زوجة وأبوين ثلث ما بقي بعد الزوج أو الزوجة والجد كالأب إلا أن الأب يسقط الإخوة والأخوات والجد يقاسمهم إن كانوا لأبوين أو لأب والأب يسقط أم نفسه ولا يسقطها الجد والأب في زوج أو زوجة وأبوين يرد الأم من الثلث إلى الثلث الباقي ولا يردها الجد وللجدة السدس وكذا الجدات ويرث منهن أم الأم وأمهاتها المدليات بإناث خلص وأم الأب وأمهاتها كذلك وكذا أم أب الأب وأم الأجداد فوقه وأمهاتهن على المشهور وضابطه كل جدة أدلت بمحض إناث أو ذكور أو إناث إلى ذكر ترث ومن أدلت بذكر بين أنثيين فلا.

فصل

الإخوة والأخوات لأبوين إن انفردوا ورثوا كأولاد الصلب وكذا إن كانوا لأب إلا في المشركة وهي زوج وأم وولد أم وأخ لأبوين فيشارك الأخ ولدى الأم في الثلث ولو كان بدل الأخ أخ لأب سقط ولو اجتمع الصنفان فكاجتماع أولاد صلب وأولاد ابنه إلا أن ms125 بنات الابن

يعصبهن من في درجتهن أو أسفل والأخت لا يعصبها إلا أخوها وللواحد من الإخوة أو الأخوات لأم السدس ولاثنين فصاعدا الثلث سواء ذكورهم وإناثهم والأخوات لأبوين أو لأب مع البنات وبنات الابن عصبة كالإخوة فتسقط أخت لأبوين مع البنت والأخوات لأب وبنو الإخوة لأبوين أو لأب كل منهم كأبيه اجتماعا وانفرادا لكن يخالفونهم في أنهم لا يردون الأم إلى السدس ولا يرثون مع الجد ولا يعصبون أخواتهم ويسقطون في المشركة والعم لأبوين ولأب كأخ من الجهتين اجتماعا وانفرادا وكذا قياس بني العم وسائر عصبة النسب والعصبة من ليس له سهم مقدر من المجمع على توريثهم فيرث المال أو ما فضل بعد الفروض.

فصل

من لا عصبة له بنسب وله معتق فماله أو الفاضل عن الفروض له رجلا كان أو امرأة فإن لم يكن فلعصبته بنسب المتعصبين بأنفسهم لا لبنته وأخته وترتيبهم كترتيبهم في النسب لكن الأظهر أن أخا المعتق وابن أخيه يقدمان على جده فإن لم يكن له عصبة فلمعتق المعتق ثم عصبته كذلك ولا ترث امرأة بولاء إلا معتقها أو منتميا إليه بنسب أو ولاء.

فصل

اجتمع جد وإخوة وأخوات لأبوين أو لأب فإن لم يكن معهم ذو فرض فله الأكثر من ثلث المال ومقاسمتهم كأخ فإن أخذ الثلث فالباقي لهم وإن كان فله الأكثر من سدس التركة

وثلث الباقي والمقاسمة وقد لا يبقى شيء كبنتين وأم وزوج فيفرض له سدس ويزاد في العول وقد يبقى دون سدس كبنتين وزوج فيفرض له وتعال وقد يبقى سدس كبنتين وأم فيفوز به الجد وتسقط الإخوة في هذه الأحوال ولو كان مع الجد إخوة وأخوات لأبوين ولأب فحكم الجد ما سبق ويعد أولاد الأبوين عليه أولاد الأب في القسمة فإذا أخذ حصته فإن كان في أولاد الأبوين ذكر فالباقي لهم وسقط أولاد الأب وإلا فتأخذ الواحدة إلى النصف والثلثان فصاعدا إلى الثلثين ولا يفضل عن الثلثين شيء وقد يفضل عن النصف فيكون لأولاد الأب والجد مع أخوات كأخ فلا يفرض ms126 لهن معه إلا في الأكدرية وهي زوج وأم وجد وأخت لأبوين أو لأب فللزوج نصف وللأم ثلث وللجد سدس وللأخت نصف فتعول ثم يقتسم الجد والأخت نصيبهما أثلاثا له الثلثان.

فصل

لا يتوارث مسلم وكافر ولا يرث مرتد ولا يورث ويرث الكافر الكافر وإن اختلفت ملتهما لكن المشهور أنه لا توارث بين حربي وذمي ولا يرث من فيه رق والجديد أن من بعضه حر يورث ولا قاتل وقيل: إن لم يضمن ورث ولو مات متوارثان بغرق أو هدم أو في غربة معا أو جهل أسبقهما لم يتوارثا ومال كل لباقي ورثته ومن أسر أو فقد وانقطع خبره ترك ماله حتى تقوم بينة بموته أو تمضي مدة يغلب على الظن أنه لا يعيش فوقها فيجتهد القاضي ويحكم بموته ثم يعطي ماله من يرث وقت الحكم ولو مات من يرثه المفقود وقفنا حصته

وعملنا في الحاضرين بالأسوأ ولو خلف حملا يرث أو قد يرث عمل بالأحوط في حقه وحق غيره فإن انفصل حيا لوقت يعلم وجوده عند الموت ورث وإلا فلبيانه إن لم يكن وارث سوى الحمل أو كان من قد يحجبه وقف المال وإن كان من لا يحجبه وله مقدر أعطيه عائلا إن أمكن عول كزوجة حامل وأبوين لها ثمن ولهما سدسان عائلان وإن لم يكن له مقدر كأولاد لم يعطوا وقيل: أكثر الحمل أربعة فيعطون اليقين.

والخنثى المشكل إن لم يختلف إرثه كولد أم ومعتق فذاك وإلا فيعمل باليقين في حقه وحق غيره ويوقف المشكوك فيه حتى يبين ومن اجتمع فيه جهتا فرض وتعصيب كزوج هو معتق أو ابن عم ورث بهما.

قلت: فلو وجد في نكاح المجوس أو الشبهة بنت هي أخت ورثت بالبنوة وقيل: بهما. والله أعلم.

ولو اشترك اثنان في جهة عصوبة وزاد أحدهما بقرابة أخرى كابني عم أحدهما أخ لأم فله السدس والباقي بينهما فلو كان معهما بنت فلها نصف والباقي بينهما سواء وقيل: يختص به الأخ ومن اجتمع فيه جهتا فرض ورث بأقواهما فقط والقوة ms127 بأن تحجب إحداهما الأخرى أو لا تحجب أو تكون أقل حجبا فالأول كبنت هي أخت لأم بأن يطأ مجوسي أو مسلم بشبهة أمه فتلد بنتا والثاني كأم في أخت لأب بأن يطأ بنته فتلد بنتا والثالث: كأم أم هي أخت بأن يطأ هذه البنت الثانية فتلد ولدا فالأولى أم أمه وأخته.

فصل

إن كانت الورثة عصبات قسم المال بالسوية إن تمحضوا ذكروا أو إناثا وإن اجتمع الصنفان قدر كل ذكر أنثيين وعدد رؤس المقسوم عليهم أصل المسألة وإن كان فيهم ذو فرض أو ذو فرضين متماثلين فالمسألة من مخرج ذلك الكسر فمخرج النصف اثنان والثلث ثلاثة والربع أربعة والسدس ستة والثمن ثمانية وإن كان فرضان مختلفا المخرج فإن تداخل مخرجاهما فأصل المسألة أكثرهما كسدس وثلث وإن توافقا ضرب وفق أحدهما في الآخر والحاصل أصل المسألة كسدس وثمن فالأصول أربعة وعشرون وإن تباينا ضر كل في كل والحاصل الأصل كثلث وربع الأصل اثنا عشر فالأصل سبعة اثنا وثلاثة وأربعة ستة وثمانية واثنا عشر وأربعة وعشرون والذي يعول منها الستة إلى سبعة كزوج وأختين وإلى ثمانية كهم وأم وإلى تسعة كهم وأخ لأم وإلى عشرة كهم وآخر لأم والاثنى عشر إلى ثلاثة عشر كزوجة وأم وأختين وإلى خمسة عشر كهم وأخ لأم وسبعة عشر كهم وآخر لام والأربعة والعشرون إلى سبعة وعشرين كبنتين وأبوين وزوجة وإذا تماثل العددان فذاك وإن اختلفا وفنى الأكثر بالأقل مرتين فأكثر فمتداخلان كثلاثة مع ستة أو تسعة وإن لم يفنهما إلا عدد ثالث فمتوافقان بجزئه كأربعة وستة بالنصف وإن لم يفنهما إلا واحد تباينا كثلاثة وأربعة والمتداخلان متوافقان ولا عكس.

فرع: إذا عرفت أصلها وانقسمت السهام عليهم فذاك وإن انكسرت على صنف

قوبلت بعدده فإن تباينا ضرب عدده في المسألة بعولها إن عالت وإن توافقا ضرب وفق عدده فيها فما بلغ صحت منه وإن انكسرت على صنفين قوبلت سهام كل صنف بعدده فإن توافقا رد الصنف إلى وفقه وإلا ترك ثم إن تماثل عدد الرؤوس ضرب أحدهما ms128 في أصل المسألة بعولها وإن تداخلا ضرب أكثرهما وإن توافقا ضرب وفق أحدهما في الآخر ثم الحاصل في المسألة وإن تباينا ضرب أحدهما في الآخر ثم الحاصل في المسألة فما بلغ صحت منه ويقاس على هذا الانكسار على ثلاثة أصناف وأربعة ولا يزيد الكسر على ذلك فإذا أردت معرفة نصيب كل صنف من مبلغ المسألة فاضرب نصيبه من أصل المسألة فيما ضربته فيها فما بلغ فهو نصيبه ثم تقسمه على عدد الصنف.

فرع: مات عن ورثة فمات أحدهم قبل القسمة فإن لم يرث الثاني غير الباقين وكان إرثهم منه كإرثهم من الأول جعل كأن الثاني لم يكن وقسم بين الباقين كإخوة وأخوات أو بنين وبنات مات بعضهم عن الباقين وإن لم ينحصر إرثه في الباقين أو انحصر واختلف قدر الاستحقاق فصحح مسألة الأول ثم مسألة الثاني ثم إن انقسم نصيب الثاني من مسألة الأول على مسألته فذاك وإلا فإن كان بينهما موافقة ضرب وفق مسألته في مسألة الأول وإلا كلها فيها فما بلغ صحتا منه ثم من له شيء من الأولى أخذه مضروبا فيما ضرب فيها ومن له شيء من الثانية أخذه مضروبا في نصيب الثاني من الأولى أوفى وفقه إن كان بين مسألته أو نصيبه وفق.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 128;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 129, 'كتاب الوصايا', 'كتاب الوصايا');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'تصح وصية كل مكلف حر وإن كان كافرا وكذا محجور عليه بسفه على المذهب لا مجنون ولا مغمى عليه وصبي وفي قول تصح من صبي مميز ولا رقيق وقيل: إن عتق ثم مات صحت وإذا وصى لجهة عامة فالشرط أن لا تكون معصية كعمارة كنيسة أو لشخص فالشرط أن يتصور له الملك فتصح لحمل وتنفذ إن انفصل حيا وعلم وجوده عندها بأن انفصل لدون ستة أشهر فإن انفصل لستة أشهر فأكثر والمرأة فراش زوج أو سيد لم يستحق فإن لم تكن فراشا وانفصل لأكثر من أربع سنين فكذلك أو لدونه استحق في الأظهر وإن أوصى لعبد فاستمر رقه فالوصية لسيده فغن عتق قبل موت الموصي فله وإن عتق بعد موته ثم ms129 قبل بنى على أن الوصية بم تملك وإن وصى لدابة وقصد تمليكها أو أطلق فباطلة وإن قال ليصرف في علفها فالمنقول صحتها وتصح لعمارة مسجد وكذا إن أطلق في الأصح وتحمل على عمارته ومصالحه ولذمي وكذا حربي ومرتد في الأصح وقاتل في الأظهر ولوارث في الأظهر إن أجاز باقي الورثة ولا عبرة بردهم وإجازتهم في حياة الموصي والعبرة في كونه وارثا بيوم الموت والوصية لكل وارث بقدر حصته لغو وبعين هي قدر حصته صحيحة وتفتقر إلى الإجازة في الأصح وتصح بالحمل ويشترط انفصاله حيا لوقت يعلم وجوده عندها وبالمنافع وكذا بثمرة أو حمل سيحدثان في الأصح وبأحد عبديه وبنجاسة يحل الانتفاع بها ككلب معلم وزبل وخمر محترمة ولو أوصى بكلب من كلابه

أعطى أحدها فإن لم يكن له كلب لغت ولو كان له مال وكلاب ووصى بها أو ببعضها فالأصح نفوذها وإن كثرت وقل المال ولو أوصى بطبل وله طبل لهو وطبل يحل الانتفاع به كطبل حرب وحجيج حملت على الثاني ولو أوصى بطبل اللهو لغت إلا إن صلح لحرب أو حجيج.

فصل

ينبغي أن لا يوصي بأكثر من ثلث ماله فإن زاد ورد الوارث بطلت في الزائدة وإن أجاز فإجازته تنفيذ وفي قول عطية مبتدأة والوصية بالزيادة لغو ويعتبر المال يوم الموت وقيل: يوم الوصية ويعتبر من الثلث أيضا عتق علق بالموت وتبرع نجز في مرضه كوقف وهبة وعتق وإبراء وإذا اجتمع تبرعات متعلقة بالموت وعجز الثلث فإن تمحض العتق أقرع أو غيره قسط الثلث أو هو وغيره قسط بالقيمة وفي قول يقدم العتق أو منجزة قدم الأول فالأول حتى يتم الثلث فإن وجدت دفعة واتحد الجنس كعتق عبيد أو إبراء جمع أقرع في العتق وقسط في غيره وإن اختلف وتصرف وكلاء فإن لم يكن فيها عتق قسط وإن كان قسط وفي قول يقدم ولو كان له عبدان فقط سالم وغانم فقال إن أعتقت غانما فسالم حر ثم أعتق غانما في مرض موته عتق وإلا أقرع ولو أوصى بعين ms130 حاضرة هي ثلث ماله وباقيه غائب لم تدفع كلها إليه في الحال والأصح أنه لا يتسلط على التصرف في الثلث أيضا.

فصل

إذا ظننا المرض مخوفا لم ينفذ تبرع زاد على الثلث فإن برأ نفذ وإن ظنناه غير مخوف لمات فإن حمل على الفجأة نفذ وإلا فمخوف ولو شككنا في كونه مخوفا لم يثبت إلا بطبيبين حرين عدلين ومن المخوف قولنج وذات جنب ورعاف جائم وإسهال متواتر ودق وابتداء فالج وخروج طعام غير مستحيل أو كان يخرج بشدة ووجع أو ومعه دم وحمى مطبقة أو غيرها إلا الربع والمذهب أنه يلحق بالمخوف أسر كفار اعتادوا قتل الأسرى والتحام قتال بين متكافئين وتقديم لقصاص أو رجم واضطراب ريح وهيجان موج في راكب سفينة وطلق حامل وبعد الوضع ما لم تنفصل المشيمة.

وصيغتها أو صيت له بكذا أو ادفعوا إليه أو أعطوه بعد موتي أو جعلته أو هوله بعد موتي فلو اقتصر على هوله فإقرار إلا أن يقول هوله من مالي فيكون وصية وتنعقد بكناية والكتابة كناية وإن وصى لغير معين كالفقراء لزمت بالموت بلا قبول أو لمعين اشترط القبول ولا يصح قبول ولا رد في حياة الموصي ولا يشترط بعد موته لفور فإن مات الموصي له قبله بطلت أو بعده فيقبل وارثه وهل يملك الموصى له بموت الموصي أم بقبوله أم موقوف فإن قبل بان أنه ملك بالموت وإلا بان للوارث أقوال أظهرها الثالث: وعليها تبنى الثمرة وكسب عبد حصلا بين الموت والقبول ونفقته وفطرته ويطالب الموصى له بالنفقة إن توقف في قبوله ورده.

فصل

أوصى بشاة تناول صغيرة الجثة وكبيرتها سليمة ومعيبة ضأنا ومعزا وكذا ذكر في الأصح لا سخلة وعناق في الأصح ولو قال أعطوه شاة من غنمي ولا غنم له لغت وإن قال من مالي اشتريت له والجمل والناقة يتناولان البخاتي والعراب لا أحدهما لآخر والأصح

تناول بعير ناقة لا بقرة ثورا والثور للذكر والمذهب حمل الدابة على فرس وبغل وحمار ويتناول الرقيق صغيرا وأنثى ومعيبا كافرا وعكوسها ms131 وقيل: إن أوصى باعتاق عبد وجب المجزىء كفارة ولو وصى بأحد رقيقيه فماتوا أو قتلوا قبل موته بطلت وإن بقي واحد تعين أو بإعتاق رقاب فثلاث فإن عجز ثلثه عنهن فالمذهب أنه لا يشتري شقص بل نفيستان به فإن فضل عن أنفس رقبتين شيء فللورثة ولو قال ثلثي للعتق اشترى شقص ولو وصى لحملها فأتت بولدين فلهما أو بحي وميت فكله للحي في الأصح ولو قال إن كان حملك ذكرا أو قال أنثى فله كذا فولدتهما لغت ولو قال إن كان ببطنها ذكر فولدتهما استحق الذكر أو ولدت ذكرين فالأصح صحتها ويعطيه الوارث من شاء منهما ولو وصى لجيرانه فلا ربعين دارا من كل جانب والعلماء أصحاب علوم الشرع من تفسير وحديث وفقه لا مقرى وأديب ومعبر وطبيب وكذا متكلم عند الأكثرين ويدخل في وصية الفقراء المساكين وعكسه ولو جمعهما شكر نصفين وأقل كل صنف ثلاث وله التفضيل أو لزيد والفقراء فالمذهب أنه كأحدهم في جواز إعطائه أقل متمول لكن لا يحرم أو لجمع معين غير منحصر كالعلوية صحت في الأظهر وله الاقتصار على ثلاثة أولا قارب زيد دخل كل قرابة وإن بعد إلا أصلا وفرعا في الأصح ولا تدخل قرابة أم في وصية العرب في الأصح والعبرة بأقرب جد ينسب إليه زيد وتعد أولاده قبيلة ويدخل في أقرب أقاربه الأصل والفرع والأصح تقديم ابن على أب وأخ على جد ولا يرجح بذكورة ووراثة بل يستوي الأب والأم والابن والبنت ويقدم ابن البنت على ابن ابن الابن ولو أوصى لأقارب نفسه لم تدخل ورثته في الأصح.

فصل

تصح بمنافع عبد ودار وغلة حانوت ويملك الموصى له منفعة العبد وأكسابه المعتادة وكذا مهرها في الأصح لا ولدها في الأصح بل هو كالأم منفعته له ورقبته للوارث وله إعتاقه وعليه نفقته إن أوصى بمنفعة مدة وكذا أبدا في الأصح وبيعه إن لم يؤبد كالمستأجر وإن أبد فالأصح أنه يصح بيعه للموصى له دون غيره وأنه تعتبر قيمة العبد كلها من الثلث إن ms132 أوصى بمنفعته أبدا وإن أوصى بها مدة قوم بمنفعته ثم مساو بها تلك المدة ويحسب الناقص من الثلث وتصح بحج تطوع في الأظهر ويحج من بلده أو الميقات كما قيد وإن أطلق فمن الميقات في الأصح وحجة الإسلام من رأس المال فإن أوصى بها من رأس المال أو الثلث عمل به وإن أطلق الوصية بها فمن رأس المال وقيل: من الثلث ويحج من الميقات وللأجنبي أن يحج عن الميت بغير إذنه في الأصح ويؤدي الوارث عنه الواجب المال في كفارة مرتبة ويطعم ويكسو في المخيرة والأصح أنه يعتق أيضا وأن له الأداء من ماله إذا لم تكن تركة وأنه يقع عنه ولو تبرع أجنبي بطعام أو كسوة لا إعتاق في الأصح وتنفع الميت صدقة ودعاء من وارث وأجنبي.

فصل

له الرجوع عن الوصية وعن بعضها بقوله نقضت الوصية أو أبطلتها أو رجعت فيها أو فسختها أو هذا لوارثي وببيع وإعتاق وإصداق وكذا هبة أو رهن مع قبض وكذا دونه في الأصح وبوصية بهذه التصرفات وكذا توكيل في بيعه وعرضه عليه في الأصح وخلط حنطة معينة رجوع ولو وصى بصاع من صبرة فخلطها بأجود منها فرجوع أو بمثلها فلا وكذا باردأ

في الأصح وطحن حنطة وصى بها وبذرها وعجن دقيق وغزل قطن ونسج غزل وقطع ثوب قميصا وبناء وغراس في عرصة الرجوع.

فصل

يسن الإيصاء بقضاء الدين وتنفيذ الوصايا والنظر في أمر الأطفال وشرط الوصي تكليف وحرية وعدالة وهداية إلى التصرف في الموصى به وإسلام لكن الأصح جواز وصية ذمي إلى ذمي ولا يضر العمي في الأصح ولا تشترط الذكورة وأم الأطفال أول من غيرها وينعزل الوصي بالفسق وكذا القاضي في الأصح لا الإمام الأعظم ويصح الإيصاء في فضاء الديون وتنفذ الوصية من كل حر مكلف ويشترط في أمر الأطفال مع هذا ان يكون له ولاية عليهم وليس لوصي إيصاء فإن أذن له فيه جاز في الأظهر ولو قال أوصيت إليك إلى بلوغ ابني أو قدوم زيد فإذا بلغ أو قدم ms133 فهو الوصي جاز ولا يجوز نصب وصي والجدحي يصفة الولاية ولا الإيصاء بتزويج طفل وبنت.

ولفظه أوصيت إليك أو فوضت ونحوهما ويجوز فيه التوقيت والتعليق ويشترط بيان ما يوصى فيه فإن اقتصر على أوصيت إليك لغا والقبول ولا يصح في حياته في الأصح ولو وصى اثنين لم ينفرد أحدهما إلا أن صرح به وللموصى والوصي العزل متى شاء وإذا بلغ الطفل ونازعه في الإنفاق عليه صدق الوصي أو في دفع إليه بعد البلوغ صدق الولد.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 129;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 130, 'كتاب الوديعة', 'كتاب الوديعة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'من عجز عن حفظها حرم عليه قبولها ومن قدر ولم يثق بأمانته كره فإن وثق استحب وشرطهما شرط موكل ووكيل ويشترط صيغة المودع كاستودعتك هذا أو استحفظتك أو أنبتك في حفظه والأصح أنه لا يشترط القبول لفظا ويكفي القبض ولو أودعه صبي أو مجنون مالا لم يقبله فإن قبل ضمن ولو أودع صبيا مالا فتلف عنده لم يضمن وإن أتلفه ضمن في الأصح والمحجور عليه بسفه كصبي وترتفع بموت المودع أو المودع وجنونه وإغمائه ولهما الاسترداد والرد كل وقت وأصلها الأمانة وقد تصير مضمونة بعوارض منها أن يودع غيره بلا إذن ولا عذر فيضمن.

وقيل: أن أودع القاضي لم يضمن وإذا لم يزل يده عنها جازت الاستعانة بمن يحملها إلى الحرز أو يضعها في خزانة مشتركة وإذا أراد سفرا فليرد إلى المالك أو وكيله فإن فقدهما فالقاضي فإن فقده فأمين فإن دفنها بموضع وسافر ضمن فإن أعلم بها أمينا يسكن الموضع لم يضمن في الأصح ولو سافر بها ضمن إلا إذا وقع حريق أو غارة وعجز عمن يدفعها إليه كما سبق والحريق والغارة في البقعة وإشراف الحرز على الخراب اعذار كالسفر وإذا مرض مرضا مخوفا فليردها إلى المالك أو وكيله وإلا فالحاكم أو أمين أو يوصي بها فإن لم يفعل ضمن إلا إذا لم يتمكن بأن مات فجأة ومنها إذا نقلها من محلة أو دلو إلى أخرى دونها في

الحرز ضمن وإلا فلا ومنها أن لا يدفع متلفاتها فلو أودعه دابة فترك علفها ms134 ضمن فان نهاه عنه فلا على الصحيح وإن أعطاه المالك علفا علفها منه وإلا فيراجعه أو وكيله فإن فقدا فالحاكم ولو بعثها مع من يسقيها لم يضمن في الأصح وعلى المودع تعريض ثياب الصوف للريح كيلا يفسدها الدود وكذا لبسها عند حاجتها ومنها أن يعدل عن الحفظ المأمور وتلف بسبب العدول فيضمن فلو قال: لا ترقد على الصندوق فرقد وانكسر بثقله وتلف ما فيه ضمن وإن تلف بغيره فلا على الصحيح وكذا لو قال لا تقفل عليه قفلين فأقفلهما ولو قال: اربط الدراهم في كمك فأمسكها في يده فتلفت فالمذهب أنها إن ضاعت بنوم أو نسيان ضمن أو بأخذ غاصب فلا ولو جعلها في جيبه بدلا عن الربط في الكم لم يضمن وبالعكس يضمن ولو أعطاه دراهم بالسوق ولم يبين كيفية الحفظ فربطها في كمه وأمسكها بيده او جعلها في جيبه لم يضمن وإن أمسكها بيده لم يضمن إن أخذها غاصب ويضمن إن تلفت بغفلة أو نوم وإن قال احفظها في البيت فليضمن إليه ويحرزها فيه فإن أخر بلا عذر ضمن ومنها أن يضيعها بأن يضعها في غير حرز مثلها أو يدل عليها سارقا أو من يصادر المالك فلو أكرهه ظالم حتى سلمها إليه فللمالك تضمينه في الأصح ثم يرجع على الظالم ومنها أن ينتفع بها بأن يلبس أو يركب خيانة أو يأخذ الثوب ليلبسه أو الدراهم لينفقها فيضمن ولو نوى الأخذ ولم يأخذ لم يضمن على الصحيح ولو خلطها بماله ولم يتميز ضمن ولو خلط دراهم كيسير للمودع ضمن في الأصح ومتى صارت مضمونة بانتفاع وغيره ثم ترك الخيانة لم يبرأ فإن أحدث له المالك استئمانا برىء في الأصح ومتى طلبها المالك لزمه الرد بأن يخلي بينه وبينها فإن أخر بلا عذر ضمن وإن ادعى تلفها ولم يذكر سببا أو ذكر خفيا كسرقة صدق

بيمينه، وإن ذكر ظاهرا كحريق فإن عرف الحريق وعمومه صدق بلا يمين وإن عرف دون عمومه صدق بيمينه وإن جهل طولب ببينة ثم يحلف على ms135 التلف به وإن ادعى ردها على من ائتمنه صدق بيمينه أو على غيره كوارثه أو ادعى وارث المودع الرد على المالك أو أودع عند سفره أمينا فادعى الأمين الرد على المالك طولب ببينة وجحودها بعد طلب المالك مضمن.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 130;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 131, 'كتاب قسم الفيء والغنيمة', 'كتاب قسم الفيء والغنيمة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'الفيء مال حصل من كفار بلا قتال وإيجاف خيل وركاب كجزية وعشر تجارة وما جلوا عنه خوفا ومال مرتد قتل أو مات وذمي مات بلا وارث فيخمس وخمسة لخمسة أحدها مصالح المسلمين كالثغور والقضاءة والعلماء يقدم الأهم والثاني بنو هاشم والمطلب يشترك الغني والفقير والنساء ويفضل الذكر كالإرث والثالث: اليتامى وهو صغير لا أب له ويشترط فقره على المشهور والرابع: والخامس المساكين وابن السبيل ويعم الأصناف الأربعة المتأخرة وقيل: يخص بالحاصل في كل ناحية من فهيا منهم وأما الأخماس الأربعة فالأظهر للمرتزقة وهم الأجناد المرصدون للجهاد فيضع الإمام ديوانا وينصب لكل قبيلة أو جماعة عريفا ويبحث عن حال كل واحد وعياله وما يكفيهم فيعطيه كفايتهم ويقدم في ثبات الاسم والإعطاء قريشا وهم ولد النضر بن كنانة ويقدم منهم بني هاشم والمطلب ثم عبد شمس ثم نوفل ثم عبد العزى ثم سائر البطون الأقرب فالأقرب إلى رسول الله صلى الله عليه وسلم ثم الأنصار ثم سائر العرب ثم العجم ولا يثبت في الديوان أعمى ولازمنا ولا من لا يصلح للغزو ولو مرض بعضهم أو جن ورجى زواله أعطى فإن لم يرج فالأظهر أنه يعطي وكذا زوجته وأولاده إذا

مات فتعطى الزوجة حتى تنكح والأولاد حتى يستقلوا فإن فضلت الأخماس الأربعة عن حاجات المرتزقة وزع عليهم على قدر مؤنتهم والأصح أنه يجوز أن يصرف بعضه في إصلاح الثغور والسلاح والكراع هذا حكم منقول الفيء فأما عقاره فالمذهب أنه يجعل وقفا وتقسم غلته كذلك.

فصل

الغنيمة مال حصل من كفار بقتال وإيجاف فيقدم منه السلب للقاتل وهو ثياب القتيل والخف والران وآلات الحرب كدرع وسلاح ومركوب وسرج ولجام وكذا سوار ومنطقة وخاتم ونفقة معه وجنيبة تقاد معه في الأظهر لا حقيبة ms136 مشدودة على الفرس على المذهب وإنما يستحق بركوب غرر يكفي به شر كافر في حال الحرب فلو رمى من حصن أو من الصف أو قتل نائما أو أسيرا أو قتله وقد انهزم الكفار فلا سلب وكفاية شره أن يزيل امتناعه بأن يفقأ عينيه أو يقطع يديده ورجليه وكذا لو أمره أو قطع يديه أو رجليه في الأظهر ولا يخمس السلب على المشهور وبعد السلب تخرج مؤنة الحفظ والنقل وغيرهما ثم يخمس الباقي فخمسه لأهل خمس الفيء يقسم كما سبق.

والأصح أن النقل يكون من خمس الخمس المرصد للمصالح إن نفل مما سيغنم في هذا القتال ويجوز أن ينفل من مال المصالح الحاصل عنده والنفل زيادة يشترطها الإمام أو الأمير لمن يفعل ما فيه نكاية الكفار ويجتهد في قدره والأخماس الأربعة عقارها ومنقولها للغانمين وهم من حضر الوقعة بنية القتال وإن لم يقاتل ولا شيء لمن حضر بعد انقضاء

القتال وفيما قبل حيازة المال وجه ولو مات بعضهم بعد انقضائه والحيازة فحقه لوارثه وكذا بعد الانقضاء وقبل الحيازة في الأصح ولو مات في القتال فالمذهب أنه لا شيء له والأظهر أن الأجير لسياسة الدواب وحفظ الأمتعة والتاجر والمحترف يسهم لهم إذ قاتلوا وللراجل سهم وللفارس ثلاثة ولا يعطى إلا لفرس واحد عربيا كان أو غيره لا لبعير وغيره ولا يعطي لفرس أعجف وما لا غناء فيه وفي قول يعطي إن لم يعلم نهي الأمير عن إحضاره والعبد والصبي والمرأة والذمي إذا حضروا فلهم الرضخ وهو دون سهم يجتهد الإمام في قدره ومحله الأخماس الأربعة في الأظهر قلت: إنما يرضخ لذمي حضر بلا أجرة وبإذن الإمام على الصحيح. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 131;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 132, 'كتاب قسم الصدقات', 'كتاب قسم الصدقات');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'الفقير من لا مال له ولا كسب يقع موقعا من حاجته ولا يمنع الفقر مسكنه وثيابه وماله الغائب في مرحلتين والمؤجل وكسب لا يليق به ولو اشتغل بعلم والكسب يمنعه ففقير ولو اشتغل بالنوافل فلا ولا يشترط فيه الزمانة ولا التعفف عن المسألة على الجديد والمكفي بنفقة قريب أو ms137 زوج ليس فقيرا في الأصح والمسكين من قدر على مال أو كسب يقع موقعا من كفايته ولا يكفيه والعامل ساع وكاتب وقاسم وحاشر يجمع ذوي الأموال والقاضي والوالي والمؤلفة من أسلم ونيته ضعيعة أوله شرف يتوقع بإعطائه إسلام غيره والمذهب أنهم يعطون من الزكاة والرقاب المكاتبون والغارم إن استدان لنفسه في غير معصية أعطى.

قلت: الأصح يعطي إذا تاب والله أعلم والأظهر اشتراط حاجته دون حلول الدين.

قلت: الأصح اشتراط حلوله والله أعلم أو لإصلاح ذات البين أعطى مع الغنى وقيل: إن كان غنيا بنقد فلا وسبيل الله تعالى غزاة لافىء لهم فيعطون مع الغنى وابن السبيل منشىء سفر أو مجتاز وشرطه الحاجة وعدم المعصية وشرط آخذ الزكاة من هذه الأصناف الثمانية الإسلام وأن لا يكون هاشميا ولا مطلبيا وكذا مولاهم في الأصح.

فصل

من طلب زكاة وعلم الإمام استحقاقه أو عدمه عمل بعلمه وإلا فإن ادعى فقرا أو مسكنة لم يكلف بينة فإن عرف له مال وادعى تلفه كلف وكذا إن ادعى عيالا في الأصح ويعطي غاز وابن سبيل بقولهما فإن لم يخرجا استرد ويطالب عامل ومكاتب وغارم ببينة وهي إخبار عدلين ويغني عنها الاستفاضة وكذا تصديق رب الدين والسيد في الأصح ويعطي الفقير والمسكين كفاية سنة.

قلت: الأصح المنصوص وقول الجمهور كفاية العمر الغالب فيشتري به عقارا يستغله والله أعلم والمكاتب والغارم قدر دينه وابن السبيل ما يوصله مقصده أو موضع ماله والغازي قدر حاجته لنفقة وكوسة ذاهبا وراجعا قيما هناك وفرسا وسلاحا ويصير ذلك ملكا له ويهيأ له ولابن السبيل مركوب إن كان السفر طويلا أو كان ضعيفا لا يطيق المشي وما ينقل عليه الزاد ومتاعه إلا أن يكون قدرا يعتاد مثله حمله بنفسه ومن فيه صفتا استحقاق يعطي بإحداهما فقط في الأظهر.

فصل

يجب استيعاب الأصناف إن قسم الإمام وهناك عامل وإلا فالقسمة على سبعة فإن فقد بعضهم فعلى الموجودين وإذا قسم الإمام استوعب من الزكوات الحاصلة عنده آحاد كل صنف وكذا يستوعب المالك إن انحصر ms138 المستحقون في البلد ووفى بهم المال وإلا فيجب

إعطاء ثلاثة وتجب التسوية بين الأصناف لا بين آحاد الصنف إلا أن يقسم الإمام فيحرم عليه التفضيل مع تساوي الحاجات والأظهر منع نقل الزكاة ولو عدم الأصناف في البلد وجب النقل أو بعضهم وجوزنا النقل وجب وإلا فيرد على الباقين وقيل: ينقل وشرط الساعي كونه حرا عدلا فقيها بأبواب الزكاة فإن عين له أخذ ودفع لم يشترط الفقه وليعلم شهرا لأخذها ويسن وسم نعم الصدقة والفيء في موضع لا يكثر شعره ويكره في الوجه.

قلت: الأصح يحرم وبه جزم البغوي وفي صحيح مسلم لعن فاعله. والله أعلم.

فصل

صدقة التطوع سنة وتحل لغني وكافر ودفعها سرا وفي رمضان ولقريب وجار أفضل ومن عليه دين أوله من تلزمه نفقته يستحب أن لا يتصدق حتى يؤدي ما عليه.

قلت: الأصح تحريم صدقته بما يحتاج إليه النفقة من تلزمه نفقته أو لدين لا يرجو له وفاء والله أعلم وفي استحباب الصدقة بما فضل عن حاجة أوجه أصحها إن لم يشق عليه الصبر استحب وإلا فلا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 132;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 133, 'كتاب النكاح', 'كتاب النكاح');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب النكاح

هو مستحب لمحتاج إليه يجد أهبته فإن فقدها استحب تركه ويكسر شهوته بالصوم فإن لم يحتج كره إن فقد الأهبة وإلا فلا لكن العبادة أفضل.

قلت: فإن لم يتعبد فالنكاح أفضل في الأصح فإن وجد الأهبة وبه علة كهرم أو مرض دائم أو تعيين كره والله أعلم ويستحب دينه بكر نسيبة ليست قرابة قريبة وإذا قصد نكاحها سن نظره إليها قبل الخطبة وإن لم تأذن وله تكرير نظره ولا ينظر غير الوجه والكفين ويحرم نظر فحل بالغ إلى عورة حرة كبيرة أجنبية وكذا وجهها وكفيها عند خوف فتنة وكذا عند الأمن على الصحيح وإلى الأمة إلا ما بين سرة وركبة وإلى صغيرة إلا الفرج وإن نظر العبد إلى سيدته ونظر ممسوح كالنظر إلى محرم وإن المراهق كالبالغ ويحل نظر رجل إلى رجل إلا ما بين سرة وركبة ويحرم نظر أمرد بشهوة.

قلت: وكذا بغيرها في ms139 الأصح المنصوص والأصح عند المحققين أن الأمة كالحرة والله أعلم والمرأة مع امرأة كرجل ورجل والأصح تحريم نظر ذمية إلى مسلمة وجواز نظر المرأة إلى بدن أجنبي سوى ما بين سرته وركبته إن لم تخف فتنة.

قلت: الأصح التحريم كهو إليها والله أعلم ونظرها إلى محرمها كعكسه ومتى حرم النظر حرم المس ويباحان لفصد وحجامة وعلاج.

قلت: ويباح النظر لمعاملة وشهادة وتعليم ونحوها بقدر الحاجة والله أعلم وللزوج النظر إلى كل بدنها.

فصل

تحل خطبة خلية عن نكاح وعدة لا تصريح لمعتدة ولا تعريض لرجعية ويحل تعريض في عدة وفاة وكذا البائن في الأظهر وتحرم خطبة على خطبة من صرح بإجابته إلا بإذنه فإن لم يجب ولم يرد لم تحرم في الأظهر ومن استشير في خاطب ذكر مساويه بصدق ويستحب تقديم خطبة قبل الخطبة وقبل العقد ولو خطب الولي فقال الزوج الحمد لله والصلاة على رسول الله صلى الله عليه وسلم قبلت صح النكاح على الصحيح بل يستحب ذلك.

قلت: الصحيح لا يستحب والله أعلم فإن طال لذكر الفاصل لم يصح.

فصل

إنما يصح النكاح بإيجاب وهو زوجتك أو أنكحتك وقبول بأن يقول الزوج تزوجت أو نكحت أو قبلت نكاحها أو تزويجها ويصح تقديم لفظ الزوج على الولي ولا يصح إلا بلفظ التزويج أو الإنكاح ويصح بالعجمية في الأصح لا بكناية قطعا ولو قال زوجتك فقال قبلت لم ينعقد على المذهب ولو قال زوجني فقال زوجتك أو قال الولي تزوجها فقال تزوجت صح ولا يصح تعليقه وهو مبشر بولد فقال إن كان أنثى فقد زوجتكها أو قال إن كانت بنتي طلقت واعتدت فقد زوجتكها فالمذهب بطلانه ولا توقيته ولا نكاح الشغار وهو زوجتكها على

أن تزوجني بنتك وبضع كل واحدة صداق الأخرى فيقبل فإن لم يجعل البضع صداقا فالأصح الصحة ولو سميا مالا مع جعل البضع صداقا بطل في الأصح ولا يصح إلا بحضرة شاهدين وشرطهما حرية وذكورة وعدالة وسمع وبصر وفي الأعمى وجه والأصح انعقاده بابني الزوجين وعدويهما وينعقد ms140 بمستوري العدالة على الصحيح لا مستور الإسلام والحرية ولو بان فسق الشاهد عند العقد فباطل على المذهب وإنما يبين ببينة أو اتفاق الزوجين ولا أثر لقول الشاهدين كنا فاسقين ولو اعترف به الزوج وأنكرت فرق بينهما وعليه نصف المهران لم يدخل بها وإلا فكله ويستحب الإشهاد على رضا المرأة حيث يعتبر رضاها ولا يشترط.

فصل

لا تزوج امرأة نفسها بإذن ولا غيرها بوكالة ولا تقبل نكاحا لأحد والوطء في نكاح بلا ولي يوجب مهر المثل لا الحد ويقبل إقرار الولي بالنكاح إن استقل بالإنشاء وإلا فلا ويقبل إقرار البالغة العاقلة بالنكاح على الجديد وللأب تزويج البكر صغيرة وكبيرة بغير إذنها ويستحب استئذانها وليس له تزويج ثيب إلا بإذنها فإن كانت صغيرة لم تزوج حتى تبلغ والجد كالأب وعند عدمه وسواء زالت البكارة بوطء حلال أو حرام ولا اثر لزوالها بلا وطء كسقطة في الأصح ومن على حاشية النسب كأخ وعم لا يزوج صغيرة بحال وتزوج الثيب البالغة بصريح الإذن ويكفي في البكر سكوتها في الأصح.

والمعتق والسلطان كالأخ وأحق الأولياء أب ثم جد ثم أبوه ثم أخ لأبوين أو لأب ثم ابنه

وإن سفل ثم عم ثم سائر العصبة كالإرث ويقدم أخ لأبوين على أخ لأب في الأظهر ولا يزوج ابن ببنوة فإن كان ابن ابن عم أو معتقا أو قاضيا زوج به فإن لم يوجد نسيب زوج المعتق ثم عصبته كالإرث ويزوج عتيقة المرأة من يزوج المعتقة ما دامت حية ولا يعتبر إذن المعتقة في الأصح فإذا ماتت زوج من له الولاء فإن فقد المعتق وعصبته زوج السلطان.

وكذا يزوج إذا عضل القريب والمعتق وإنما يحصل العضل إذا دعت بالغة عاقلة إلى كفء وامتنع ولو عينت كفؤا وأراد الأب غيره فله ذلك في الأصح.

فصل

لا ولاية الرقيق وصبي ومجنون ومختل النظر بهرم أو خبل وكذا محجور عليه بسفه على المذهب ومتى كان الأقرب ببعض هذه الصفات فالولاية للأبعد والإغماء إن كان لا يدوم غالبا انتظر إفاقته وإن كان ms141 يدوم أياما انتظر وقيل: للأبعد ولا يقدح العمى في الأصح ولا ولاية لفاسق على المذهب ويلي الكافر الكافرة وإحرام أحد العاقدين أو الزوجة يمنع صحة النكاح ولا ينقل الولاية في الأصح فيتزوج السلطان عند إحرام الولي لا الأبعد.

قلت: ولو أحرم الولي أو الزوج فعقد وكيله الحلال لم يصح والله أعلم ولو غاب الأقرب إلى مرحلتين زوج السلطان ودونهما لا يزوج إلا بإذنه في الأصح وللمجبر التوكيل في التزويج بغير إذنها ولا يشترط تعيين الزوج في الأظهر ويحتاط الوكيل فلا يزوج غير كفء وغير المجبر إن قالت له وكل وكل وإن نهته فلا وإن قالت زوجني فله التوكيل في الأصح ولو وكل قبل استئذانها في النكاح لم يصح على الصحيح وليقل وكيل الولي زوجتك بنت فلان وليقل الولي لوكيل الزوج زوجت بنتي فلانا فيقول وكيله قبلت نكاحها له ويلزم

المجبر تزويج مجنونة بالغة ومجنون ظهرت حاجته لا صغيرة وصغير ويلزم المجبر غيره إن تعين إجابة ملتمسة التزويج فإن لم يتعين كإخوة فسألت بعضهم لزمه الإجابة في الأصح وإذا اجتمع أولياء في درجة استحب أن يزوجها أفقههم وأسنهم برضاهم فإن تشاحوا أقرع فلو زوج غير من خرجت قرعته وقد أذنت لكل منهما صح في الأصح ولو زوجها أحدهم زيدا وآخر عمرا فإن عرف السابق فهو الصحيح وإن وقعا معا أو جهل السبق والمعية فباطلان وكذا لو عرف سبق أحدهما ولم يتعين على المذهب ولو سبق معين ثم اشتبه وجب التوقف حتى يبين فإن ادعى كل زوج علمها بسبقه سمعت دعواهما بناء على الجديد وهو قبول إقرارها بالنكاح فإن أنكرت حلفت وإن أقرت لأحدهما ثبت نكاحه وسماع دعوى الآخر وتحليفها له يبنى على القولين فيمن قال هذا لزيد بل لعمرو هل يغرم لعمرو إن قلنا نعم فنعم ولو تولى طرفي عقد في تزويج بنت ابنه بابن ابنه الآخر صح في الأصح ولا يزوج ابن العم نفسه بل يزوجه ابن عم في درجته فإن فقد فالقاضي فلو أراد القاضي نكاح من لا ولي ms142 لها زوجه من فوقه من الولاة أو خليفته وكما لا يجوز لواحد تولي الطرفين لا يجوز أن يوكل وكيلا في أحدهما أو وكيلين فيهما في الأصح.

فصل

زوجها الولي غير كفء برضاها أو بعض الأولياء المستوين برضاها ورضا الباقين صح ولو زوجها الأقرب برضاها فليس للأبعد اعتراض ولو زوجها أحدهم به برضاها دون رضاهم لم يصح وفي قول يصح ولهم الفسخ ويجري القولان في تزويج الأب بكرا صغيرة أو بالغة غير كفء بغير رضاها ففي الأظهر باطل وفي الآخر يصح وللبالغة الخيار وللصغيرة إذا بلغت ولو طلبت من لا ولي لها أن يزوجها السلطان بغير كفء ففعل لم يصح في الأصح

وخصال الكفاءة سلامة من العيوب المثبتة للخيار وحرية فالرقيق ليس كفؤ الحرة والعتيق ليس كفؤ الحرة أصلية ونسب فالعجمي ليس كفء عربية ولا غير قرشية ولا غير هاشمي ومطلبي لهما والأصح اعتبار النسب في العجم كالعرب وعفة فليس فاسق كفء عفيفة وحرفة فصاحب حرفة دنيئة ليس كفء أرفع منه فكناس وحجام وحارس وراع وقيم الحمام ليس كفء بنت خياط ولا خياط بنت تاجر أو بزاز ولا هما بنت عالم وقاض والأصح إن اليسار لا يعتبر وإن بعض الخصال لا يقابل وليس له تزويج ابنه الصغير أمه وكذا معيبة على المذهب ويجوز من لا تكافئه بباقي الخصال في الأصح.

فصل

لا يزوج مجنون صغير وكذا كبير إلا لحاجة فواحدة وله تزويج صغير عاقل أكثر من واحدة ويزوج المجنون أب أو جد إن ظهرت مصلحة ولا يشترط الحاجة وسواء صغيرة وكبيرة ثيب وبكر فإن لم يكن أب وجد لم تزوج في صغرها فإن بلغت زوجها السلطان في الأصح للحاجة لا لمصلحة في الأصح ومن حجر عليه بسفه لا يستقل بنكاح بل ينكح بإذن وليه أو يقبل له الولي فإن أذن له وعين امرأة لم ينكح غيرها وينكحها بمثر المثل أو أقل فإن زاد فالمشهور صحة النكاح بمهر المثل من المسمى ولو قال أنكح بألف ولم يعين امرأة نكح بالأقل من ألف ms143 ومهر مثلها ولو أطلق الإذن فالأصح صحته وينكح بمهر المثل من تليق به فإن قبل له وليه اشترط إذنه في الأصح ويقبل بمهر المثل فأقل فإن زاد صح النكاح بمهر

المثل وفي قول يبطل ولو نكح السفيه بلا إذن فباطل فإن وطىء لم يلزمه شيء وقيل: مهر مثل وقيل: أقل متمول ومن حجر عليه لفلس يصح نكاحه ومؤن النكاح في كسبه لا فيما معه ونكاح عبد بلا إذن سيده باطل وبإذنه صحيح وله إطلاق الإذن وله تقييده بامرأة أو قبيلة أو بلد ولا يعدل عما أذن فيه والأظهر أنه ليس للسيد إجبار عبده على النكاح ولا عكسه وله إجبار أمته بأي صفة كانت فإن طلبت لم يلزمه تزويجها وقيل: إن حرمت عليه لزمه وإذا زوجها فالأصح أنه بالملك لا بولاية فيزوج مسلم أمته الكافرة وفاسق ومكاتب لا يزوج ولي عبد صبي ويزوج أمته في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب ما يحرم من النكاح', 'تحرم الأمهات وكل من ولدتك أو ولدت من ولدك فهي أمك والبنات وكل من ولدتها أو ولدت من ولدها فبنتك.

قلت: والمخلوقة من زناه تحل له ويحمر على المرأة ولدها من زنا. والله أعلم.

والأخوات وبنات الإخوة والأخوات والعمات والخالات وكل من هي أخت ذكر ولدك فعمتك أو أخت أنثى ولدتك فخالتك ويحرم هؤلاء السبع بالرضاع أيضا وكل من أرضعتك أو أرضعت من أرضعتك أو من ولدك أو ولدت مرضعتك أو ذا لبنها فأم رضاع وقس الباقي ولا يحرم عليك من أرضعت أخاك ونافلتك ولا أم مرضعة ولدك وبنتها ولا أخت أخيك بنسب ولا رضاع وهي أخت أخيك لأبيك لأمه وعكسه وتحرم زوجة من ولدت أو ولدك من نسب أو رضاع وأم زوجتك منهما وكذا بناتها إن دخلت بها.

ومن وطىء امرأة بملك حرم عليه أمهاتها وبناتها وحرمت على آبائه وأبنائه وكذا الموطوءة بشبهة في حقه قيل: أو حقها لا المزنى بها وليست مباشرة بشهوة كوطء في الأظهر ولو اختلط محرم بنسوة قرية كبيرة نكح منهم لا بمحصورات ولو طرأ ms144 مؤبد تحريم على نكاح قطعه كوطء زوجة أبيه بشبهة ويحرم جمع المرأة وأختها أو عمتها أو خالتها من رضاع أو نسب فإن جمع بعقد بطلا أو مرتبا فالثاني ومن حرم جمعهما بنكاح حرم في الوطء بملك لا ملكهما فإن وطىء واحدة حرمت الأخرى حتى يحرم الأولى كبيع أو نكاح أو كتابية لا حيض وإحرام وكذا رهن في الأصح ولو ملكها ثم نكح أختها أو عكس حلت المنكوحة دونها وللعبد امرأتان وللحر أربع فقط فن نكح خمسا معا بطلن أو مرتبا فالخامسة وتحل الأخت والخامسة في عدة بائن لا رجعية وإذا طلق الحر ثلاثا أو العبد طلقتين لم تحل له حتى تنكح وتغيب بقبلها حشفته أو قدرها بشرط الانتشار وصحة النكاح وكونه ممن يمكن جماعه لا طفلا على المذهب فيهن ولو نكح بشرط إذا وطىء طلق أو بانت أو فلا نكاح بطل وفي التطليق قول.

فصل

لا ينكح من يملكها أو بعضها ولو ملك زوجته أو بعضها بطل نكاحه ولا تنكح من تملكه أو بعضه ولا الحر امة غيره إلا بشروط أن لا يكون تحته حرة تصلح للاستمتاع قيل: ولا غير صالحة وأن يعجز عن حرة تصلح قيل: أو لا تصلح فلو قدر على غائبة حلت أمة إن

لحقه مشقة ظاهرة في قصدها أو خاف زنا مدته ولو وجد حرة بمؤجل أو بدون مهر مثل فالأصح حل أمة في الأولى دون الثانية وأن يخاف زنا فلو أمكنه تسر فلا خوف في الأصح وإسلامها وتحل لحر وعبد كتابين أمة كتابيه على الصحيح لا لعبد مسلم في المشهور ومن بعضها رقيق كرقيقة ولو نكح حر أمة بشرطه ثم أيسر أو نكح حرة لم تنفسخ الأمة ولو جمع من لا تحل له أمة حرة وأمة بعقد بطلت الأمة لا الحرة في الأظهر.

فصل

يحرم نكاح من لا كتاب لها كوثنية ومجوسية وتحل كتابية لكن تكره حربية وكذا ذمية على الصحيح والكتابية يهودية أو نصرانية لا متمسكة بالزبور وغيره فإن لم تكن الكتابية إسرائيلية فالأظهر ms145 حلها إن علم دخول قومها في ذلك الدين قبل نسخه وتحريفه وقيل: يكفي قبل نسخه والكتابية والمنكوحة كمسلمة في نفقة وقسم وطلاق وتجبر على غسل حيض ونفاس وكذا جنابة وترك أكل خنزير في الأظهر وتجبر هي ومسلمة على غسل ما نجس من أعضائها وتحرم متولدة من وثنى وكتابية وكذا عكسه في الأظهر وإن خالفت السامرة اليهود والصابئون النصارى في أصل دينهم حرمن وإلا فلا ولو تهود نصراني أو عكسه لم يقر في الأظهر فإن كانت امرأة لم تحل لمسلم فإن كانت منكوحته فكردة مسلمة ولا يقبل منه إلا الإسلام وفي قول أو دينه الأول ولو توثن لم يقر وفيما يقبل القولان ولو تهود وثنى أو تنصر لم يقر ويتعين الإسلام كمسلم ارتد ولا تحل مرتدة لأحد ولو ارتد زوجان أو أحدهما قبل دخول تنجزت الفرقة أو بعده وقفت فإن جمعهما الإسلام في العدة دام النكاح وإلا فالفرقة من الردة ويحرم الوطء في التوقف ولا حد.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, 'باب نكاح المشرك', 'أسلم كتابي أو غيره وتحته كتابية دام نكاحه أو وثنية أو مجوسية فتخلفت قبل دخول تنجزت الفرقة أو بعده وأسلمت في العدة دام نكاحه وإلا فالفرقة من إسلامه ولو أسلمت وأصر فكعكسه ولو أسلما معا دام النكاح والمعية بآخر اللفظ وحيث أدمنا لا يضر مقارنة العقد لمفسد هو زائل عند الإسلام وكانت بحيث تحل له الآن وإن بقي المفسد فلا نكاح فيقر على نكاح بلا ولي وشهود وفي عدة هي منقضية عند الإسلام ومؤقت إن اعتقدوه مؤدا وكذا لو قارن الإسلام عدة شبهة على المذهب لا نكاح محرم.

ولو أسلم ثم أحرم ثم أسلمت وهو محرم أقر على المذهب ولو نكح حرة وأمة وأسلموا تعينت الحرة واندفعت الأمة على المذهب ونكاح الكفار صحيح على الصحيح وقيل: فاسد وقيل: إن أسلم وقرر تبينا صحته وإلا فلا فعلى الصحيح لو طلق ثلاثا ثم اسلما لم تحل إلا بمحلل ومن قررت فلها المسمى الصحيح وأما الفاسد كخمر فإن قبضته قبل الإسلام فلا شيء لها وإلا ms146 فمهر مثل وإن قبضت بعضه فلها قسط ما بقي من مهر مثل ومن اندفعت بإسلام بعد دخول لها المسمى الصحيح إن صحح نكاحهم وإلا فمهر مثل أو قبله وصحح فإن كان الاندفاع بإسلامها فلا شيء لها أو بإسلامه فنصف مسمى إن كان صحيحا وإلا فنصف مهر مثل ولو ترافع إلينا ذمي ومسلم وجب الحكم أو ذميان وجب في الأظهر ونقرهم على ما نقر لو أسلموا ونبطل ما لا نقر.

فصل

أسلم وتحته أكثر من أربع وأسلمن معه أو في العدة أو كن كتابيات لزمه اختيار أربع ويندفع من زاد وإن أسلم معه قبل دخول أو في العدة أربع فقط تعين ولو أسلم وتحته أم وبنتها كتابيتان أو أسلمتا فإن دخل بهما حرمتا أبدا ولو بواحدة تعينت البنت وفي قول يتخير أبو بالبنت تعينت أو بالأم حرمتا أبدا وفي قول تبقى الأم أو وتحته امة أسلمت معه أو في العدة أقر إن حلت له الأمة وإن تخلفت قبل دخول تنجزت الفرقة أو إماء وأسلمن معه أو في العدة اختار أمة إن حلت له له عند اجتماع إسلامه وإسلامهن وإلا اندفعن أو حرة وإماء وأسلمن معه أو في العدة تعينت واندفعن وإن أصرت فانقضت عدتها اختار أمة لو أسلمت وعتقن ثم أسلمن في العدة فكحرائر فيختار أربعا والاختيار اخترتك أو قررت نكاحك أو أمسكتك أو ثبتك والطلاق اختيار لا الظهار والإيلاء في الأصح.

ولا يصح تعليق اختيار ولا فسخ ولو حصر الاختيار في خمس اندفع من زاد وعليه التعيين ونفقتهن حتى يختار فإن ترك الاختيار وحبس فإن مات قبله اعتدت حامل به وذات أشهر وغير مدخول بها بأربعة أشهر وعشر وذات إقراء بالأكثر من الإقراء وأربعة أشهر وعشر ويوقف نصيب زوجات حتى يصطلحن.

فصل

أسلما معا استمرت النفقة ولو أسلم وأصرت حتى انقضت العدة فلا وإن أسلمت فيها لم تستحق لمدة التخلف في الجديد ولو أسلمت أولا فأسلم في العدة أو أصر فلها نفقة العدة على الصحيح وإن ارتدت فلا نفقة وإن ms147 أسلمت في العدة وإن ارتد فلها نفقة العدة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 4, NULL, 'باب الخيار والإعفاف ونكاح العبد', 'وجد أحد زوجين بالآخر جنونا أو جذاما أو برصا أو وجدها رتقاء أو قرناء أو وجدته عنينا أو مجبوبا ثبت الخيار في فسخ النكاح وقيل: إن وجد به مثل عيبه فلا ولو وجده خنثى واضحا فلا في الأظهر ولو حدث به عيب تخيرت الاعنة بعد دخول أو بها تخير في الجديد ولا خيار لولي بحادث وكذا بمقارن جب وعنة ويتخير بمقارن جنون وكذا جذام وبرص في الأصح والخيار على الفور والفسخ قبل دخول يسقط المهر وبعده الأصح أنه يجب المثل إن فسخ بمقارن أو بحادث بين العقد والوطء جهله الواطىء والمسمى إن حدث بعد وطء ولو انفسخ بردة بعد وطء فالمسمى ولا يرجع الزوج بعد الفسخ بالمهر على من غره في الجديد ويشترط في العنة رفع إلى حاكم وكذا سائر العيوب في الأصح وتثبت العنة بإقراره أو ببينة على إقراره وكذا بيمينها بعد نكوله في الأصح وإذا ثبتت ضرب القاضي له سنة بطلبها فإذا تمت رفعته إليه فإن قال وطئت حلف فإن نكل حلفت فإن حلفت أو أقر استقلت بالفسخ وقيل: تحتاج إلى إذن القاضي أو فسخه ولو اعتزلته أو مرضت أو حبست في المدة لم تحسب ولو رضيت بعد هابه بطل حقها وكذا لو أجلته على الصحيح ولو نكح وشرط

فيها إسلام أو في أحدهما نسب أو حرية أو غيرهما فأخلف فالأظهر صحة النكاح ثم إن بان خيرا مما شرط فلا خيار وإن بان دونه فلها خيار وكذا له في الأصح ولو ظنها مسلمة أو حرة فبانت كتابية أو أمة وهي تحل له فلا خيار في الأظهر ولو أذنت في تزويجها بمن ظنته كفؤا فبان فسقه أو دناءة نسبه وحرفته فلا خيار لها.

قلت: ولو بان معيبا أو عبدا فلها الخيار. والله أعلم.

ومتى فسخ بخلف فحكم المهر والرجوع به على الغار ما سبق في العيب والمؤثر تغرير قارن العقد ولو غر بحرية أمة وصححناه فالولد ms148 قبل العلم حر وعلى المغرور قيمته لسيدها ويرجع بها على الغار والتغرير بالحرية لا يتصور من سيدها بل من وكيله أو منها فإن كان منها تعلق الغرم بذمتها ولو انفصل الولد ميتا بلا جناية فلا شيء فيه ومن عتقت تحت رقيق أو من فيه رق تخيرت في فسخ النكاح والأظهر أنه على الفور فإن قالت جهلت العتق صدقت بيمينها إن أمكن بأن كان المعتق غائبا وكذا إن قالت جهلت الخيار به في الأظهر فإن فسخت قبل وطء فلا مهر وبعده بعتق بعده وجب المسمى أو قبله فمهر مثل وقيل: المسمى ولو عتق بعضها أو كوتبت أو عتق عبد تحته أمة فلا خيار.

فصل

يلزم الولد إعفاف الأب والأجداد على المشهور بأن يعطيه مهر حرة أو يقول انكح وأعطيك المهر أو ينكح له بإذنه ويمهر أو يملكه أمة أو ثمنها ثم عليه مؤنتها وليس للأب تعيين النكاح دون التسري ولا رفيعة ولواتفقا على مهر فتعيينها للأب ويجب التجديد إذا ماتت أو انفسخ بردة أو فسخه بعيب وكذا إن طلق بعذر في الأصح وإنما يجب إعفاف

فاقد مهر محتاج إلى نكاح ويصدق إذا ظهرت الحاجة بلا يمين ويحرم عليه وطء أمة ولده والمذهب وجوب مهر لأحد فإن أحبل فالولد حر نسيب فإن كانت مستولدة للابن لم تصر مستولدة للأب وإلا فالأظهر أنها تصير وإن عليه قيمتها مع مهر لا قيمة ولد في الأصح ونكاحها فلو ملك زوجة والده الذي لا تحل له الأمة لم ينفسخ النكاح في الأصح وليس له نكاح أمة مكاتبة فإن ملك مكاتب زوجة سيده انفسخ النكاح في الأصح.

فصل

السيد بإذنه في نكاح عبده لا يضمن مهرا ونفقة في الجديد وهما في كسبه بعد النكاح المعتاد والنادر فإن كان مأذونا له في تجارة ففيما في يده من ربح وكذا رأس مال في الأصح وإن لم يكن مكتسبا ولا مأذونا له ففي ذمته وفي قول على السيد وله المسافرة به ويفوت الاستمتاع وإذا لم يسافر لزمه تخليته ليلا للاستمتاع ms149 ويستخدمه نهارا إن تكفل المهر والنفقة وإلا فيخليه لكسبهما وإن استخدمه بلا تكفل لزمه الأقل من أجرة مثل وكل المهر والنفقة وقيل: يلزمه المهر والنفقة ولو نكح فاسدا ووطىء فمهر مثل في ذمته وفي قول في رقبته وإذا زوج أمته استخدمها نهارا وسلمها للزوج ليلا ولا نفقة على الزوج حينئذ في الأصح ولو أخلى في داره بيتا وقال للزوج يخلو بها فيه لم يلزمه في الأصح وللسيد السفر بها وللزوج صحبتها والمذهب أن السيد لو قتلها أو قتلت نفسها قبل دخور سقط مهرها وإن الحرة لو قتلت نفسها أو قتل الأمة أجنبي أو ماتت فلا كما لو هلكتا بعد دخول ولو باع مزوجة فالمهر للبائع فإن طلقت قبل دخول فنصفه له ولو زوج أمته بعبده لم يجب مهر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 133;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 134, 'كتاب الصداق', 'كتاب الصداق');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'يسن تسميته في العقد ويجوز إخلاؤه منه وما صح مبيعا صح صداقا وإذا أصدق عينا فتلفت في يده ضمنها ضمان عقد وفي قوله ضمان يد فعلى الأول ليس لها بيعة قبل قبضه ولو تلف في يده وجب مهر مثل وإن أتلفته فقابضة وإن أتلفه فقابضة وإن أتلفه أجنبي تخيرت على المذهب فإن فسخت الصداق أخذت من الزوج مهر مثل وإلا غرمت المتلف وإن أتلفه الزوج فكتلفه وقيل: كأجنبي ولو أصدق عبدين فتلف أحدهما قبل قبضه انفسخ فيه لا في الباقي على المذهب ولها الخيار فإن فسخت فمهر مثل وإلا فحصة التالف منه ولو تعيب قبل قبضه تخيرت على المذهب فإن فسخت فمهر مثل وإلا فلا شيء والمنافع الفائتة في يد الزوج لا يضمنها وإن طلبت التسليم فامتنع ضمن ضمان العقد وكذا التي استوفاها بركوب ونحوه على المذهب ولها حبس نفسها لتقبض المهر المعين والحال لا المؤجل فلو حل قبل التسليم فلا حبس في الأصح ولو قال كل لا أسلم حتى تسلم ففي قول يجبر هو وفي قول لا إجبار ومن سلم اجبر صاحبه والأظهر يجبران فيؤمر بوضعه عند عدل وتؤمر بالتمكين فإذا سلمت أعطاها العدل ولو بادرت فسكنت طالبته فإن ms150 لم يطأ امتنعت حتى يسلم وإن وطىء فلا ولو بادر فسلم المتمكن فإن منعت بلا عذر استرد إن قلنا أنه يجبر ولو استملهت لتنظف ونحوه

أمهلت ما يراه قاض ولا يجاوز ثلاثة أيام لا لينقطع حيض ولا تسلم صغيرة ولا مريضة حتى يزول مانع وطء ويستقر المهر بوطء وإن حرم كحائض وبموت أحدهما لا بخلوة في الجديد.

فصل

نكحها بخمر أو حر أو مغصوب وجب مهر مثل وفي قول قيمته أو بمملوك ومغصوب بطل فيه وصح في المملوك في الأظهر وتتخير فإن فسخت فمهر مثل وفي قول قيمتها وإن أجازت فلها مع المملوك حصة المغصوب من مهر مثل بحسب قيمتها وفي قول تقنع به ولو قال زوجتك بنتي وبعتك ثوبها بهذا العبد صح النكاح وكذا المهر والبيع في الأظهر ويوزع العبد على الثوب ومهر مثل ولو نكح بألف على أن لأبيها أو على أن يعطيه ألفا فالمذهب فساد الصداق ووجوب مهر المثل ولو شرط خيار في النكاح بطل النكاح أو في المهر فالأظهر صحة النكاح لا المهر وسائر الشروط إن وافق مقتضى النكاح أو لم يتعلق به غرض لغا وصح النكاح والمهر وإن خالف ولم يخل بمقصوده الأصلي كشرط أن لا يتزوج عليها أو لا نفقة لها صح النكاح وفسد الشرط والمهر وإن أخل كأن لا يطأ أو يطلق بطل النكاح ولو نكح نسوة بمهر فالأظهر فساد المهر ولكل مهر مثل ولو نكح لطفل بفوق مهر مثل أو أنكح بنتا لا رشيدة أو رشيدة بكرا بلا إذن بدونه فسد المسمى والأظهر صحة النكاح بمهر مثل ولو توافقوا على مهر كان سرا وأعلنوا زيادة فالمذهب وجوب ما عقد به ولو قالت لوليها زوجني بألف فنقص عنه بطل النكاح فلو أطلقت فنقص عن مهر مثل بطل وفي قول يصح بمهر مثل.

قلت: الأظهر صحة النكاح في الصورتين بمهر المثل. والله أعلم.

فصل

قالت رشيدة زوجني بلا مهر فزوج ونفى المهر أو سكت فهو تفويض صحيح وكذا لو قال سيد لأمة زوجتكها بلا ms151 مهر ولا يصح تفويض غير رشيدة وإذا جرى تفويض صحيح فالأظهر أنه لا يجب شيء بنفس العقد فإن وطىء فمهر مثل ويعتبر بحال العقد في الأصح ولها قبل الوطء مطالبة الزوج بأن يفرض مهرا وحبس نفسها ليفرض وكذا التسليم المفروض في الأصح ويشترط رضاها بما يفرضه الزوج لا علمها بقدر مهر المثل في الأظهر ويجوز فرض مؤجل في الأصح وفوق مهر مثل.

وقيل: لا أن كان من جنسه ولو امتنع من الفرض أو تنازعا فيه فرض القاضي نقد البلد حالا.

قلت: ويفرض مهر مثل ويشترط علمه به. والله أعلم.

ولا يصح فرض أجنبي من ماله في الأصح والفرض الصحيح كمسمى فتشطر بطلاق قبل وطء ولو طلق قبل فرض ووطء فلا شطر وإن مات أحدهما قبلهما لم يجب مهر مثل في الأظهر.

قلت: الأظهر وجوبه. والله أعلم.

فصل

مهر المثل ما يرغب به في مثلها وركنه الأعظم نسب فيراعى أقرب من تنسب إلى من تنسب إليه وأقر بهن أخت لأبوين ثم لأب ثم بنات أخ ثم عمات كذلك فإن فقد نساء العصبة أو لم ينكحهن أو جهل مهرهن فأرحام كجدات وخالات ويعتبر سن وعقل ويسار وبكارة

وثيوبة وما اختلف فيه غرض فإن اختصت بفضل أو نقص زيد أو نقص لائق بالحال ولو سامحت واحدة لم تجب موافقتها ولو خفضن للعشيرة فقط اعتبر وفي وطء نكاح فاسد مهر مثل يوم الوطء فإن تكرر فمهر في أعلى الأحوال.

قلت: ولو تكرر وطء بشبهة واحدة فمهر فإن تعدد جنسها تعدد المهر ولو كرر وطء مغصوبة أو مكرهة على زنا تكرر المهر ولو تكرر وطء الأب والشريك وسيد مكاتبة فمهر وقيل: مهور وقيل: إن اتحد المجلس فمهر وإلا فمهور. والله أعلم.

فصل

الفرقة قبل وطء منها أو بسببها كفسخة بعيبها تسقط المهر ومالا كطلاق وإسلامه وردته ولعانه وإرضاع أمه وأو أمها يشطره ثم قيل: معنى التشطر أن له خيار الرجوع والصحيح عوده بنفس الطلاق فلو زاد بعده فله وإن طلق والمهر تالف فنصف بدله من ms152 مثل أو قيمة وإن تعيب في يدها فإن قنع به وإلا فنصف قيمته سليما وإن تعيب قبل قبضها فله نصفه ناقصا بلا خيار فإن عاب بجناية وأخذت أرشها فالأصح أن له نصف الأرش ولها زيادة منفصلة وخيار في متصلة فإن شحت فنصف قيمة بلا زيادة وإن سمحت لزمه القبول وإن زاد ونقص ككبر عبد وطول نخلة وتعلم صنعة مع برص فإن اتفقا فنصف العين وإلا فنصف قيمة وزراعة الأرض نقص وحرثها زيادة وحمل أمة وبهيمة زيادة نقص وقيل: البهيمة زيادة واطلاع نخل زيادة متصلة وإن طبق وعليه ثمر مؤبر لم يلزمه قطفه فإن قطف تعين نصف النخل ولو رضي بنصف

النخل وتبقية الثمر إلى جذاذه أجبرت في الأصح ويصير النخل في يدهما ولو رضيت به فله الامتناع والقيمة ومتى ثبت خيار له أولها لم يملك نصفه حتى يختار ذو الاختيار ومتى رجع بقيمة اعتبر الأقل من يومي الإصداق والقبض ولو أصدق تعليم قرآن وطلق قبله فالأصح تعذر تعليمه ويجب مهر مثل بعد وطء ونصفه قبله ولو طلق وقد زال ملكها عنه فنصف بدله فإن كان زال وعاد تعلق بالعين في الأصح ولو وهبته له ثم طلق فالأظهر أن له نصف بدله وعلى هذا لو وهبته النصف فله نصف الباقي وربع بدله كله وفي قول النصف الباقي وفي قول يتخير بين بدل نصف كله أو نصف الباقي وربع بدل كله ولو كان دينا فأبرأته يرجع عليها على المذهب وليس لولي عفو عن صداق على الجديد.

فصل

لمطلقة قبل وطء متعة إن لم يجب شطر مهر وكذا الموطوءة في الأظهر وفرقة لا بسببها كطلاق ويستحب أن لا تنقص عن ثلاثين درهما فإن تنازعا قدرها القاضي بنظره معتبرا حالهما وقيل: حاله وقيل: حالها وقيل: أقل مال.

فصل

اختلفا في قدر مهر أو صفته تحالفا ويتحالف وارثاهما ووارث واحد والآخر ثم يفسخ لمهر ويجب مهر مثل ولو ادعت تسميته فأنكرها تحالفا في الأصح ولو ادعت نكاحها ومهر

مثل فأقر بالنكاح وأنكر المهر أو سكت ms153 فالأصح تكليفه البيان فإن ذكر قدرا وزادت تحالفا وإن أصر منكر حلفت وقضى لها ولو اختلفت في قدره زوج وولي صغيرة أو مجنونة تحالفا في الأصح ولو قالت نكحتني يوم كذا بألف ويوم كذا بألف وثبت العقدان بإقراره أو بينة لزم ألفان فإن قال لم أطأ فيهما أو في أحدهما صدق بيمينه وسقط الشطر وإن قال كان الثاني تجديدا لفظا لا عقدا لم يقبل.

فصل

وليمة العرس سنة وفي قول أو وجه واجبة والإجابة إليها فرض عين وقيل: كفاية وقيل: سنة وإنما تجب أو سن بشرط أن لا يخص الأغنياء وأن يدعوه في اليوم الأول فإن أولم ثلاثة لم تجب في الثاني وتكره في الثالث: وأن لا يحضره لخوف أو طمع في جاهه وأن لا يكون ثم من يتأذى به أو لا يليق به مجالسته ولا منكر وإن كان يزول بحضوره فليحضر ومن المنكر فراش حرير وصورة وحيوان على سقف أو جدار أو وسادة أو ستر أو ثوب ملبوس ويجوز ما على أرض وبساط ومخدة ومقطوع الرأس وصورة شجر ويحرم تصوير حيوان ولا تسقط إجابة بصوم فإن شق على الداعي صوم نقل فالفطر ويأكل الضيف مما قدم له بلا لفظ ولا يتصرف فيه إلا بالأكل وله أخذ ما يعلم رضاه به ويحل نثر سكر وغيره في الأملاك أو لا يكره في الأصح ويحل التقاطه وتركه أولى.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 134;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 135, 'كتاب القسم والنشوز', 'كتاب القسم والنشوز');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'يختص القسم بزوجات ومن بات عند بعض نسوته لزمه عند من بقي ولو أعرض عنهن أو عن الواحدة لم يأثم ويستحب أن لا يعطلهن وتستحق القسم مريضة ورتقاء وحائض ونفساء لا ناشزة فإن لم ينفرد بمسكن دار عليهن في بيوتهن وإن انفرد فالأفضل المضي إليهن وله دعاؤهن والأصح تحريم ذهابه إلى بعض ودعاء بعض إلا لغرض كقرب مسكن من مضى إليه أو خوف عليها ويحرم أن يقيم بمسكن واحدة ويدعوهن إليه وأن يجمع بين ضرتين في مسكن إلا براهما وله أن يرتب القسم على ليلة ويوم قبلها أو بعدها والأصل الليل ms154 والنهار تبع فإن عمل ليلا وسكن نهارا كحارس فعكسه وليس للأول دخول في نوبة على الأخرى ليلا إلا لضرورة كمرضها المخوف وحينئذ إن طال مكثه قضى وإلا فلا وله الدخول نهارا لوضع متاع ونحوه وينبغي أن لا يطول مكثه والصحيح أنه لا يقضي إذا دخل لحاجة وأن له ما سوى وطء من استمتاع وأنه يقضي إن دخل بلا سبب ولا تجب تسوية في الإقامة نهارا وأقل نوب القسم ليلة وهو أفضل ويجوز ثلاثا ولا زيادة على المذهب والصحيح وجوب قرعة للابتداء وقيل: يتخير ولا يفضل في قدر نوبة لكن لحرة مثلا أمة وتخص بكر جديدة عند زفاف بسبع بلا قضاء وثيب بثلاث ويسن تخييرها بين ثلاث بلا قضاء

وسبع بقضاء ومن سافرت وحدها بغير إذنه فناشزة وبإذنه لغرضه يقضي لها ولغرضها لا في الجديد ومن سافر لنقله حرم أن يستصحب بعضهن وفي سائر الأسفار الطويلة وكذا القصيرة في الأصح يستصحب بعضهن بقرعة ولا يقضي مدة سفره فإن وصل المقصد وصار مقيما قضى مدة الإقامة لا الرجوع في الأصح ومن وهبت حقها لم يلزم الزوج الرضا فإن رضي ووهبت لمعينة بات عندها ليلتيهما وقيل: يواليهما أولهن سوى أوله فله التخصيص وقيل: يسوي.

فصل

ظهر أمارات نشوزها وعظها بلا هجر فإن تحقق نشوز ولم يتكرر وعظ وهجر في المضجع ولا يضرب في الأظهر.

قلت: الأظهر يضرب والله أعلم فإن تكرر ضرب فلو منعها حقا كقسم ونفقة ألزمه القاضي توفيته فإن أساء خلقه وآذاها بلا سبب نهاه فإن عاد عزره وإن قال كل إن صاحبه متعد تعرف القاضي الحال بثقة يخبرهما ومنع الظالم فإن اشتد الشقاق بعث حكما من أهله وحكما من أهلها وهما وكيلان لهما وفي قول موليان من الحاكم فعلى الأول يشترط رضاهما فيوكل حكمه بطلاق وقبول عوض خلع وتوكل حكمها ببذل عوض وقبول طلاق به.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 135;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 136, 'كتاب الخلع', 'كتاب الخلع');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'هو فرقة بعوض بلفظ طلاق أو خلع وشرطه زوج يصح طلاقه فلو خالع عبد أو محجور عليه بسفه صح ووجب دفع العوض إلى ms155 مولاه ووليه وشرط قابله إطلاق تصرفه في المال فإن اختلعت أمة بلا إذن سيد بدين أو عين ماله بانت وللزوج في ذمتها مهر مثل في صورة العين وفي قول قيمتها وفي صورة الدين المسمى وفي قول مهر مثل وإن أذن وعين عينا له أو قدر دينا فامتثلت تعلق بالعين وتلبسها في الدين وإن أطلق الإذن اقتضى مهر المثل من كسبها وإن خالع سفيهة أو قال طلقتك على ألف فقبلت طلقت رجعيا فإن لم تقبل لم تطلق ويصح اختلاع المريضة مرض الموت ولا يحسب من الثلث إلا زائد على مهر مثل ورجعية في الأظهر لا بائن ويصح عوضه قليلا وكثيرا دينا وعينا ومنفعة ولو خالع بمجهول أو خمر بانت بمهر مثل وفي قول يبدل الخمر ولهما التوكيل فلو قال لو كيله خالعها بمائة لم ينقص منها وإن أطلق لم ينقص عن مهر مثل فان نقص فيهما لم تطلق وفي قول يقع بمهر مثل ولو قالت لوكيلها اختلع بألف فامتثل نفذ وإن زاد فقال اختلعتها بألفين من مالها بوكالتها بانت ويلزمها مهر مثل وفي قول الأكثر منه ومما سمته وإن أضاف الوكيل الخلع إلى نفسه فخلع

أجنبي والمال عليه وإن أطلق فالأظهر أن عليها ما سمت وعليه الزيادة ويجوز توكيله ذميا وعبدا ومحجورا عليه بسفه ولا يجوز توكيل محجور عليه في قبض العوض والأصح صحة توكيله امرأة بخلع زوجته أو طلاقها ولو وكلا رجلا تولى طرفا وقيل: الطرفين.

فصل

الفرقة بلفظ الخلع طلاق وفي قول فسخ لا ينقص عددا فعلى الأول لفظ الفسخ كناية والمفاداة كخلع في الأصل ولفظ الخلع صريح وفي قول كناية فعلى الأول لو جرى بغير ذكر مال وجب مهر مثل في الأصح ويصح بكنايات الطلاق مع النية وبالعجمية ولو قال بعتك نفسك بكذا فقالت اشتريت فكناية خلع وإذا بدأ بصيغة معاوضة كطلقتك وخالعتك بكذا وقلنا الخلع طلاق فهو معاوضة فيها شوب تعليق وله الرجوع قبل قبولها ويشترط قبولها بلفظ غير منفصل فلو اختلف إيجاب وقبول كطلقتك بألف فقبلت ms156 بألفين وعكسه أو طلقتك ثلاثا بألف فقبلت واحدة بثلث ألف فلغو ولو قال طلقتك ثلاثا بألف فقبلت واحدة بألف فالأصح وقوع الثلاث ووجوب ألف وإن بدأ بصيغة تعليق كمتى أو متى ما اعطيتني فتعليق فلا رجوع له ولا يشترط القبول لفظا ولا الإعطاء في المجلس وإن قال إن أو إذا أعطيتني فكذلك لكن يشترط إعطاء على الفور وإن بدأت بطلب طلاق فأجاب فمعارضة مع شوب جعالة فلها الجروع قبل جوابه ويشترط فور لجوابه ولو طلبت ثلاثا بألف فطلق طلقة بثلثه فواحدة بثلثه وإذا خالع أو طلق بعوض فلا رجعة فإن شرطها فرجعي ولا لمال وفي قول بائن بمهر مثل ولو قالت طلقني بكذا وارتدت فأجاب إن كان قبل دخول أو بعده وأصرت

حتى انقضت العدة بانت بالردة ولا مال وإن أسلمت فيها طلقت بالمال ولا يضر تخلل كلام يسير بين إيجاب وقبول.

فصل

قال أنت طالق وعليك أو ولي عليك كذا ولم يسبق طلبها بمال وقع رجعيا قبلت أم لا ولا مال فإن قال أردت ما يراد بطلقتك بكذا أو صدقته فكهو في الأصح وإن سبق بانت بالمذكور وإن قال أنت طالق على أن لي عليك كذا فالمذهب أنه كطلقتك بكذا فإذا قبلت بانت ووجب المال وإن قال إن ضمنت لي ألفا فأنت طالق فضمنت في الفور بانت ولزمها الألف وإن قال متى ضمنت فمتى ضمنت طلقت وإن ضمنت دون الألف لم تطلق ولو ضمنت ألفين طلقت ولو قال طلقي نفسك إن ضمنت لي ألفا فقال طلقت وضمنت أو عكسه بانت بألف فإن اقتصرت على أحدهما فلا وإذا علق بإعطاء مال فوضعته بين يديه طلقت والأصح دخوله في ملكه وإن قال إن أقبضتني فقيل: كالإعطاء والأصح كسائر التعليق فلا يملكه ولا يشترط للإقباض مجلس.

قلت: ويقع رجعيا ويشترط لتحقق الصفة أخذ بيده منها ولو مكرهة والله أعلم ولو علق بإعطاء عبد ووصفه بصفة سلم فأعطته لا بالصفة لم تطلق أو بها معيبا فله رده ومهر مثل وفي قول قيمته سليما ms157 ولو قال عبدا طلقت بعبد إلا مغصوبا في الأصح وله مهر مثل ولو ملك طلقة فقط فقالت طلقني ثلاثا بألف فطلق الطلقة فله ألف وقيل: ثلثه وقيل: إن علمت

الحال فالألف وإلا فثلثه ولو طلبت طلقة بألف فطلق بمائة وقع بمائة وقيل: بألف وقيل: لا يقع ولو قالت طلقني غدا بألف فطلق غدا أو قبله بانت بمهر مثل وقيل: في قول بالمسمى وإن قال إذا دخلت الدار فأنت طالق بألف فقبلت ودخلت طلقت على الصحيح بالمسى وفي وجه او قول بمهر مثل ويصح اختلاع أجنبي وإن كرهت الزوجة وهو كاختلاعها لفظا وحكما ولوكيلها أن يختلع له ولأجنبي توكيلها فتتخير هي ولو اختلع رجل وصرح بوكالتها كاذبا لم تطلق وأبوها كأجنبي فيختلع بماله فإن اختلع بمالها وصرح بوكالة أو ولاية لم تطلق أو باستقلال فخلع بمغصوب.

فصل

ادعت خلعا فأنكر صدق بيمينه وإن قال طلقتك بكذا فقالت مجانا بانت ولا عوض وإن اختلفا في جنس عوضه أو قدره ولا بينة تحالفا ووجب مهر مثل ولو خالع بألف ونويا نوعا لزم وقيل: مهر مثل ولو قال أردنا دنانير فقالت بل دراهم أو فلوسا تحالفا على الأول ووجب مهر مثل بلا تحالف في الثاني. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 136;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 137, 'كتاب الطلاق', 'كتاب الطلاق');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'يشترط لنفوذه التكليف إلا السكران ويقع بصريحه بلا نية وبكناية بنية فصريحه الطلاق وكذا الفراق والسراح على المشهور كطلقت وأنت طالق ومطلقة ويا طالق لا أنت طلاق والطلاق في الأصح وترجمة الطلاق بالعجمية صريح على المذهب وأطلقتك وأنت مطلقة كناية ولو اشتهر لفظ للطلاق كالحلال أو حلال الله علي حرام فصريح في الأصح.

قلت: الأصح أنه كناية والله أعلم وكنايته كأنت خلية برية بتة بتلة بائن اعتدى استبرئي رحمك إلحقي بأهلك حبلك على غار بك لا أنده سر بك اعزبي اغربي دعيني ودعيني أو نحوها والإعتاق كناية طلاق وعكسه وليس الطلاق كناية ظهار وعكسه ولو قال أنت علي حرام أو حرمتك ونوى طلاقا أو ظهارا حصل أو نواهما تخير وثبت ما اختاره وقيل: طلاق وقيل: ms158 ظهار أو تحريم عينها لم تحرم وعليه كفارة يمين وكذا إن لم تكن نية في الأظهر والثاني لغو

وإن قاله لأمته ونوى عتقا ثبت أو تحريم عينها أو لا نية فكالزوجة ولو قال هذا الثوب أو الطعام أو العبد حرام علي فلغو وشرط نية الكناية اقترانها بكل اللفظ وقيل: يكفي بأوله وإشارة ناطق بطلاق لغو وقيل: كناية ويعتد بإشارة أخرس في العقود والحلول فإن فهم طلاقها بها كل أحد فصريحة وإن اختص بفهمه فظنون فكناية ولو كتب ناطق طلاقا ولم ينوه فلغو وإن نواه فالأظهر وقوعه فإن كتب إذا بلغك كتابي فأنت طالق فإنما تطلق ببلوغه وإن كتب إذا قرأت كتابي وهي قارئة فقرأته طلقت وإن قرىء عليها فلا في الأصح وإن لم تكن قارئة فقرىء عليها طلقت.

فصل

له تفويض طلاقها إليها وهو تمليك في الجديد فيشترط لوقوعه تطليقها على فور وإن قال طلقي بألف فطلقت بانت ولزمها ألف وفي قول توكيل فلا يشترط فور في الأصح وفي اشتراط قبولها خلاف الوكيل وعلى القولين له الرجوع قبل تطليقها ولو قال إذا جاء رمضان

فطلقي لغا على التمليك ولو قال: أبيني نفسك فقالت: أبنت ونويا وقع وإلا فلا ولو قال طلقي فقالت: أبنت ونوت أو أبيني ونوى فقالت: طلقت وقع ولو قال: طلقي ونوى ثلاثا فقالت: طلقت ونوتهن فثلاث وإلا فواحدة في الأصح ولو قال: ثلاثا فوجدت أو عكسه فواحدة.

فصل

مر بلسان نائم طلاق لغا ولو سبق لسان بطلاق بلا قصد لغا ولا يصدق ظاهرا إلا بقرينة ولو كان اسمها طالقا فقال: يا طالق وقصد النداء لم تطلق وكذا إن أطلق في الأصح وإن كان اسمها طارقا أو طالبا فقال: يا طالق وقال: أردت النداء فالتف الحرف صدق ولو خاطبها بطلاق هازلا أو لاعبا أو وهو يظنها أجنبية بأن كانت في ظلمة أو أنكحها له وليه أو وكيله ولم يعلم وقع ولو لفظ أعجمي به بالعربية ولم يعرف معناه لم يقع وقيل: إن نوى معناها وقع ولا يقع طلاق ms159 مكره فإن ظهرت قرينة اختيار بان أكره على ثلاث فوحد أو صريح أو تعليق فكنى أو نجز أو على طلقت فصرح أو بالعكوس وقع وشرط الإكراه قدرة المكره على تحقيق ما هدد به بولاية أو تغلب وعجز المكره عن دفعه بهرب وغيره وظنه إن امتنع حققه ويحصل بتخويف بضرب شديد أو حبس أو إتلاف مال ونحوها وقيل: يشترط قتل وقيل: قتل أو قطع أو ضرب مخوف ولا تشترط التورية بأن ينوي غيرها وقيل: إن تركها بلا عذر وقع ومن أثم بمزيل عقله من شراب أو دواء نفذ طلاقه وتصرفه له وعليه قولا ونعلا على المذهب وفي قول لا وقيل: عليه ولو قال ربعك أو بعضك أو جزؤك أو كبدك أو شعرك أو ظفرك طالق وقع وكذا دمك على المذهب لا فضلة كريق وعرق وكذا مني ولبن في الأصح ولو قال لمقطوعة يمين يمينك طالق لم يقع على المذهب ولو قال أنا منك طالق ونوى تطليقها طلقت وإن لم ينو طلاقا فلا وكذا إن لم ينو إضافته إليها في الأصح ولو قال أنا منك بائن اشترط نية الطلاق وفي الإضافة وجهان ولو قال استبرئي رحمي منك فلغو وقيل: إن نوى طلاقها وقع.

فصل

خطاب الأجنبية بطلاق وتعليقه بنكاح وغيره لغو والأصح صحة تعليق العبد ثالثة كقوله إن أعتقت أو إن دخلت فأنت طالق ثلاثا فيقعن إذا عتق أو دخلت بعد عتقه ويلحق رجعية لا مختلعة ولو علقه بدخول فبانت ثم نكحها ثم دخلت لم يقع إن دخلت في البينونة وكذا إن لم تدخل في الأظهر وفي ثالث يقع إن بانت بدون ثلاث ولو طلق دون ثلاث وراجع أو

جدد ولو بعد زوج عادت ببقية الثلاث وإن ثلث عادت بثلاث وللعبد طلقتان فقط وللحر ثلاث ويقع في مرض موته ويتوارثان في عدة رجعي لا بائن وفي القدم ترثه.

فصل

قال طلقتك أو أنت طالق ونوى عدد واقع وكذا الكناية ولو قال أنت طالق واحدة ونوى عددا فواحد وقيل: المنوي.

قلت: ولو قال ms160 أنت واحدة ونوى عدد فالمنوي وقيل: واحدة والله أعلم ولو أراد أن يقول أنت طالق ثلاثا فماتت قبل تمام طالق لم يقع أو بعده قبل ثلاثا فثلاث وقيل: واحدة وقيل: لا شيء وإن قال أنت طالق أنت طال أنت طالق وتخلل فصل فثلاث وإلا فإن قصد تأكيدا فواحدة أو استئنافا فثلاث وكذا إن أطلق في الأظهر وإن قصد بالثانية تأكيد أو بالثالث: ة استئنافا أو عكس فثنتان أو بالثالثة تأكيد الأولى فثلاث في الأصح وإن قال أنت طالق وطالق وطالق صح قصد تأكيد الثاني بالثالث: لا الأول بالثاني وهذه الصور في موطوأة فلو قالهن لغيرها فطلقة بكل حال ولو قال لهذه إن دخلت الدار فأنت طلق وطالق فدخلت فثنتان في الأصح ولو قال لموطوأة أنت طالق طلقة مع أو معها طلقة فثنتان وكذا غير موطوأة في الأصح ولو قال طلقة قبل طلقة أو بعدها طلقة فثنتان في موطوأة وطلقة في غيرها ولو قال طلقة بعد طلقة أو قبلها طلقة فكذا في الأصح ولو قال طلقة في طلقة وأراد مع فطلقتان أو الظرف أو الحساب أو أطلق فطلقة ولو قال نصف طلقة في طلقة فطلقة بكل حال ولو قال طلقة في طلقتين وقصد معية فثلاث أو ظرفا فواحدة أو حسابا وعرفه فثنتان وإن جهله

وقصد معناه فطلقة وقيل: ثنتان وإن لم ينو شيأ فطلقه وفي قول ثنتان إن عرف حسابا ولو قال بعض طلقة فطلقة أو نصفي طلقة فطلقة إلا أن يريد كل نصف من طلقة والأصح أن قوله نصف طلقتين طلقة وثلاثة أنصاف طلقة أو نصف طلقة وثلث طلقة طلقتان ولو قال نصف وثلث طلقة فطلقة ولو قال لأربع أوقعت عليكن أو بينكن طلقة أو طلقتين أو ثلاثا أو أربعا وقع على كل طلقة فإن قصد توزيع كل طلقة عليهم وقع في ثنتين ثنتان وفي ثلاث وأربع ثلاث فإن قال أردت بينكن بعضهم لم يقبل ظاهرا في الأصح ولو طلقها ثم قال للأخرى أشركتك معها أو أنت كهي فإن نوى ms161 طلقت وإلا فلا وكذا لو قال آخر ذلك لامرأته.

فصل

يصح الاستثناء بشرط اتصاله ولا يضر سكتة تنفس وعي.

قلت: ويشترط أن ينوي الاستثناء قبل فراغ اليمين في الأصح والله أعلم ويشترط عدم استغراقه ولو قال أنت طالق ثلاثا الاثنتين وواحدة فواحدة وقيل: ثلاث أو اثنتين وواحدة إلا واحدة فثلاث وقيل: ثنتان وهو من نفى إثبات وعكسه فلو قال ثلاثا إلا ثنتين إلا طلقة فثنتان أو ثلاثا إلا ثلاثا إلا اثنتين فثنتان وقيل: ثلاث وقيل: طلقة أو خمسا إلا ثلاثا فثنتان وقيل: ثلاث أو ثلاثا إلا نصف طلقة فثلاث على الصحيح ولو قال أنت طالق إن شاء الله وإن لم يشأ الله وقصد التعليق لم يقع وكذا يمنع انعقاد تعليق وعتق ويمين

ونذر وكل تصرف ولو قال يا طالق إن شاء الله وقع في الأصح أو قال أنت طالق إلا أن يشاء الله فلا في الأصح.

فصل

شك في طلاق فلا أوفى عدد فالأقل ولا يخفى الورع ولو قال إن كان ذا الطائر غرابا فأنت طالق وقال آخران لم يكنه فامرأتي طالق وجهل لم يحكم بطلاق أحد فإن قالهما رجل لزوجتيه طلقت إحداهما ولزمه البحث والبيان ولو طلق إحداهما بيعنها ثم جهلها وقف حتى يذكر ولا يطالب ببيان إن صدقناه في الجهل ولو قال لها ولأجنبية أحدا كما طالق وقال قصدت الأجنبية قبل في الأصح ولو قال زينب طالق وقال قصدت أجنبية فلا على الصحيح ولو قال لزوجتيه أحدا كما طالق وقصد معينة طلقت وإلا فإحداهما ويلزمه البيان في الحالة الأولى والتعيين في الثانية وتعزلان عنه إلى البيان أو التعيين وعليه البدار بهما ونفقتهما في الحال ويقع الطلاق باللفظ وقيل: إن لم يعين فعند التعيين والوطء ليس بيانا ولا تعيينا وقيل: تعيين ولو قال مشيرا إلى واحدة هذه المطلقة فبيان أو أردت هذه وهذه أو هذه بل هذه حكم بطلاقهما ولو ماتتا أو أحداهما قبل بيان وتعيين بقيت مطالبته لبيان الإرث ولو مات فالأظهر قبول بيان وارثه لا تعيينه ولو ms162 قال إن كان غرابا فامرأتي طالق وإلا فعبدي حر وجهل منع منهما إلى البيان فإن مات لم يقبل بيان الوارث على المذهب بل يقرع بين العبد والمرأة فإن قرع عتق أو قرعت لم تطلق والأصح أنه لا يرق.

فصل

الطلاق سني وبدعي ويحرم البدعي وهو ضر بان طلاق في حيض ممسوسة وقيل: إن سألته يحرم ويجوز خلعها فيه لا أجنبي في الأصح ولو قال أنت طالق مع آخر حيضتك فسني في الأصح أو مع آخر طهر لم يطأها فيه فبدعي على المذهب وطلاق في طهر وطيء فيه من قد تحبل ولم يظهر حمل فلو وطىء حائضا وطهرت فطلقها فبدعي في الأصح ويحل خلعها وطلاق من ظهر حملها ومن طلق بديعا سن له الرجعة ثم إن شاء طلق بعد طهر ولو قال لحائض أنت طالق للبدعة وقع في الحال أو للسنة فحين تطهر أو لمن في طهر لم تمس فيه أنت طالق للسنة وقع في الحال وإن مست فيه فحين تطهر بعد حيض أو للبدعة ففي الحال إن مست فيه وإلا فحين تحيض ولو قال أنت طالق طلقة حسنة أو أحسن الطلاق أو أجمله فكالسنة أو طلقة قبيحة أو أقبح الطلاق أو ثلاثا أو أفحشه فكالبدعة أو سنة بدعية أو حسنة قبيحة وقع في الحال ولا يحرم جمع الطلقات ولو قال أنت طالق ثلاثا للسنة وفسر بتفريقها على أقراء لم يقبل إلا ممن يعتقد تحريم الجمع والأصح أنه يدين ويدين من قال أنت طالق وقال أردت إن دخلت أو إن شاء زيد ولو قال نسائي طوالق أو كل امرأة لي طالق وقال أردت بعضهم فالصحيح أنه لا يقبل ظاهرا إلا لقرينة بأن خاصمته وقالت تزوجت فقال كل امرأة لي طالق وقال أردت غير المخاصمة.

فصل

قال: أنت طالق في شهر كذا أو في غرته أو أوله وقع بأول جزء منه أو في نهاره أو أول

يوم منه فبفجر أول يوم أو آخره فبآخر جزء من الشهر وقيل: بأول النصف الآخر ولو ms163 قال ليلا إذا مضى يوم فبغروب شمس غده أو نهارا ففي مثل وقته من غده أو اليوم فإن قاله نهارا فبغروب شمسه وإلا لغا وبه يقاس شهر وسنة أو أنت طالق أمس وقصد أن يقع في الحال مستندا إليه وقع في الحال وقيل: لغو أو قصد أنه طلق أمس وهي الآن معتدة صدق بيمينه أو قال طلقت في نكاح آخر فإن عرف صدق بيمينه وإلا فلا وأدوات التعليق من كمن دخلت وإن وإذا ومتى ومتى ما وكلما وأي كأي وقت دخلت ولا يقتضين فورا إن علق بإثبات في غير خلع إلا أنت طالق إن شئت ولا تكرارا إلا كلما ولو قال إذا طلقتك فأنت طالق ثم طالق أو علق بصفة فوجدت فطلقتان أو كلما وقع طلاقي فطلق فثلاث في ممسوسة أو في غيرها طلقة ولو قال وتحته أربع إن طلقت واحدة فعبد حر وإن ثنتين فبعدان وإن ثلاثا فثلاثة وإن أربعا فأربعة فطلق أربعا معا أو مرتبا عتق عشر ولو علق بكلما فخمسة عشر على الصحيح ولو علق بنفي فعل فالمذهب أنه إن علق بان كان لم تدخل ووقع عند اليأس من الدخول أو بغيرها فعند مضي زمن يمكن فيه ذلك الفعل ولو قال أنت طالق إن دخلت أو أن لم تدخلي بفتح إن وقع في الحال.

قلت: إلا في غير نحوي فتعليق في الأصح. والله أعلم.

فصل

علق بحمل فإن كان حمل ظاهر وقع وإلا فإن ولدت لدون ستة أشهر من التعليق بان وقوعه أو لأكثر من أربع سنين أو بينهما ووطئت وأمكن حدوثه به فلا وإلا فالأصح وقوعه وإن قال إن كنت حاملا بذكر فطلقة أو أنثى فطلقتين لولدتهما وقع ثلاث أو ن كان حملك ذكرا فطلقة أو أنثى فطلقتين فولدتهما لم يقع شيء أو إن ولدت فأنت طالق فولدت اثنين مرتبا طلقت بالأول وانقضت عدتها بالثاني وإن قال كلما ولدت فولدت ثلاثة من حمل وقع بالأولين طلقتان وانفضت بالثالث: ولا يقع به ثالثة على الصحيح ولو قال ms164 لأربع كلما ولدت واحدة فصواحبها طوالق فولدن معا طلقن ثلاثا ثلاثا أو مرتبا طلقت الرابع: ة ثلاثا وكذا الأولى إن بقيت عدتها والثانية طلقة والثالث: ة طلقتين وانقضت عدتهما بولادتهما وقيل: لا تطلق الأولى وتطلق الباقيات طلقة طلقة وإن ولدت ثنتان معا ثم ثنتان معا طلقت الأوليان ثلاثا ثلاثا وطلقة والأخريان طلقتين طلقتين وتصدق بيمينها في حيضتها إلا إذا علقها به لا في ولادتها في الأصح ولا تصدق فيه في تعليق غيرها ولو قال إن حضتما فأنتما طالقتان فزعمتاه وكذبهما صدق بيمينه ولم يقع وإن كذب واحدة طلقت فقط ولو قال إن أو إذا أو متى طلقتك فأنت طالق قبله ثلاثا فطلقها وقع المنجز فقط وقيل: لا شيء ولو قال إن ظاهرت منك أو آليت أو لاعنت أو فسخت بعيبك فأنت طالق قبله ثلاثا ثم وجد المعلق به

ففي صحته الخلاف ولو قال إن وطئتك مباحا فأنت طالق قبله ثم وطىء لم يقع قطعا ولو علقه بمشيئتها خطابا اشترطت على فور أو غيبة أو بمشيئة أجنبي فلا في الأصح ولو قال المعلق بمشيئته شئت كارها بقلبه وقع وقيل: لا يقع باطنا ولا يقع بمشيئته صبية وصبي وقيل: يقع بمميز ولا رجوع له قبل المشيئة ولو قال أنت طالق ثلاثا إلا أن يشاء زيد طلقة فشاء طلقة لم تطلق وقيل: تقع طلقة ولو علق بفعله ففعل ناسيا للتعليق أو مكرها لم تطلق في الأظهر أو بفعل غيره ممن يبالي بتعليقه وعلم به فكذلك وإلا فيقع قطعا.

فصل

قال أنت طالق وأشار بإصبعين أو ثلاث لم يقع عدد الأبنية فإن قال مع ذلك هكذا طلقت في أصبعين طلقتين وفي ثلاث ثلاثا فإن قال أردت بالإشارة المقبوضتين صدق بيمينه ولو قال عبد إذا مات سيدي فأنت طالق طلقتين وقال سيده إذا مت فأنت حر فعتق به فالأصح أنها لا تحرم بل له الرجعة وتجديد قبل زوج ولو نادى إحدى زوجتيه فأجابته الأخرى فقال أنت طالق وهو يظنها المناداة لم تطلق المناداة وتطلق المجيبة ms165 في الأصح ولو علق بأكل رمانة وعلق بنصف فأكلت رمانة فطلقتان والحلف بالطلاق ما تعلق به حث أو منع أو تحقيق خبر فإذا قال إن حلفت بطلاق فأنت طالق ثم قال إن لم تخرجي أو إن خرجت أو إن لم يكن الأمر كما قلت فأنت طالق وقع المعلق بالحلف ويقع الآخر إن وجدت صفته ولو قال إذا طلعت الشمس أو جاء الحجاج فأنت طالق لم يقع المعلق بالحلف ولو قيل له

استخبارا أطلقتها فقال نعم فإقرار به فإن قال أردت ماضيا وراجعت صدق بيمينه وإن قيل: ذلك التماسا لا نشاء فقال نعم فصريح وقيل: كناية.

فصل

علق بأكل رغيف أو رمانة فبقي لبابة أو حبة لم يقع ولو أكلا تمرا وخلطا نواهما فقال إن لم تميزي نواك فأنت طالق فجعلت كل نواة وحدها لم يقع إلا أن يقصد تعيينا ولو كان بفمها تمرة فعلق ببلعها ثم برميها ثم بإمساكها فبادرت مع فراغه بأكل بعض ورمى بعض لم يقع ولو اتهمها بسرقة فقال إن لم تصدقيني فأنت طالق فقالت سرقت ما سرقت لم تطلق ولو قال إن لم تخبريني بعدد حب هذه الرمانة قبل كسرها فالخلاص إن تذكر عددا يعلم أنها لا تنقص عنه ثم تزيد واحدا واحدا حتى يبلغ ما يعلم أنها لا تزيد عليه والصورتان فيمن لم يقصد تعريفا ولو قال لثلاث من لم تخبرني بعدد ركعات فراض اليوم والليلة فقالت واحدة سبع عشرة وأخرى خمس عشرة أي يوم جمعة وثالثة إحدى عشرة أي لمسافر لم يقع ولو قال أنت طالق إلى حين أو زمان أو بعد حين طلقت بمضي لحظة ولو علق برؤية زيد أو لمسه وقذفه تناوله حيا وميتا بخلاف ضربه ولو خاطبته بمكروه كيا سفيه يا خسيس فقال إن كنت كذاك فأنت طالق إن أراد مكافأتها باسماع ما تكره طلقت وإن لم يكن سفه أو التطبيق اعتبرت الصفة وكذا إن لم يقصد في الأصح والسفه منافي إطلاق التصرف والخسيس قيل: من باع دينه بدنياه ويشبه أن ms166 يقال هو من يتعاطى غير لائق به بخلاف.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 137;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 138, 'كتاب الرجعة', 'كتاب الرجعة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'شرط المرتجع أهلية النكاح بنفسه ولو طلق فجن فللوي الرجعة على الصحيح حيث له ابتداء نكاح وتحصل براجعتك ورجعتك وارتجعتك والأصح أن الرد والإمساك صريحان وأن التزويج والنكاح كنايتان وليقل رددتها إلي أو إلى نكاحي والجديد أنه لا يشترط الإشهاد فتصح بكناية ولا تقبل تعليقا ولا تحصل بفعل كوطء وتختص الرجعة بموطوءة طلقت بلا عوض لم يستوف عدد طلاقها باقية في العدة محل لحل لا مرتدة وإذا أدعت انقضاء عدة أشهر وأنكر صدق بيمينه أو وضع حمل لمدة إمكان وهي ممن تحيض لا آيسة فالأصح تصديقها بيمين وإن ادعت ولادة تام فإمكانه ستة أشهر ولحظتان من وقت النكاح أو سقط مصور فمائة وعشرون يوما ولحظتان أو مضغة بلا صورة فثمانون يوما ولحظتان أو انقضاء أقراء فإن كانت حرة وطلقت في طهر فأقل الإمكان اثنان وثلاثون يوما ولحظتان أو في حيض فسبعة وأربعون ولحظة أو أمة وطلقت في طهر فستة عشر يوما ولحظتان أو حيض فأحد وثلاثون ولحظة وتصدق إن لم تخالف عادة دائرة وكذا إن خالفت في الأصح ولو وطىء رجعية واستأنفت الإقراء من وقت الوطء راجع فيما كان بقي ويحرم الاستمتاع بها فإن

وطىء فلا حد ولا يعزر إلا معتقد تحريمه ويجب مهر مثل إن لم يراجع وكذا إن راجع على المذهب ويصح إيلاء وظهار وطلاق ولعان ويتوارثان وإذا ادعى والعدة منقضية رجعة فيها فأنكرت فإن اتفقا على وقت الانقضاء كيوم الجمعة وقال راجعت يوم الخميس فقالت بل السبت صدقت بيمينها أو على وقت الرجعة كيوم الجمعة وقالت انقضت الخميس وقال السبت صدق بيمينه وإن تنازعا في السبق بلا اتفاق فالأصل ترجيح سبق الدعوى فإن ادعت الانقضاء ثم ادعى رجعة قبله صدقت بيمينها أو ادعاها قبل انقضاء فقالت بعده صدق.

قلت: فإن ادعيا معا صدقت والله أعلم ومتى ادعاها والعدة باقية صدق ومتى أنكرتها وصدقت ثم اعترفت قبل اعترافها وإذا طلق دون ثلاث وقال وطئت فلي رجعة وأنكرت صدقت ms167 بيمين وهو مقر لها بالمهر فإن قبضته فلا رجوع له وإلا فلا تطالبه إلا بنصف.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 138;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 139, 'كتاب الإيلاء', 'كتاب الإيلاء');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'هو حلف زوج يصح طلاقه ليمنعن من وطئها مطلقا أو فوق أربعة أشهر والجديد أنه لا يختص بالحلف بالله تعالى وصفاته بل لو عق به طلاقا أو عتقا أو قال إن وطئتك فلله علي صلاة أو صوم أو حج أو عتق كان موليا ولو حلف أجنبي عليه فيمين محضة فإن نكحها فلا إيلاء ولو آلى من رتقاء وأقرناء أو إلى مجبوب لم يصح على المذهب ولو قال والله لا وطئتك أربعة أشهر فإذا مضت فوالله لا وطئتك أربعة أشهر وهكذا مرارا فليس بمول في الأصح ولو قال والله لا وطئتك خمسة أشهر فإذا مضت فوالله لا وطئتك سنة فايلا آن لكل حكمه ولو قيد بمستبعد الحصول في الأربعة كنزول عيسى صلى الله عليه وسلم فمول وإن ظن حصوله قبلها فلا وكذا لو شك في الأصح ولفظه صريح وكناية فمن صريحه تغيب ذكر بفرج ووطء وجماع وافتضاض بكر والجديد إن ملامسة ومباضعة ومباشرة واتيانا وغشيانا وقربانا ونحوها كنايات ولو قال إن وطئتك فعبدي حر فزال ملكه عنه زال الإيلاء ولو قال فعبدي حر عن ظهاري وكان ظاهر فمول وإلا فلا ظهار ولا إيلاء باطنا ويحكم بهما ظاهرا ولو قال عن ظهاري إن ظاهرت فليس بمول حتى يظاهر أو إن وطئتك قضرتك ظاهر فمول فإن وطىء طلقت الضرة وزال الإيلاء والأظهر انه لو قال لأربع والله لا أجامعكن فليس بمول في

الحال فإن جامع ثلاثا فمول من الرابع: ة فلو مات بعضهن قبل وطء زال الإيلاء ولو قال لا أجامع كل واحدة منكن فمول من كل واحدة ولو قال لا أجامعك إلى سنة إلا مرة فليس بمول في الحال في الأظهر فإن وطىء وبقي منها أكثر من أربعة أشهر فمول.

فصل

يمهل أربعة أشهر من الإيلاء بلا قضاء وفي رجعية من الرجعة ولو ارتد أحدهما بعد دخول في المدة انقطعت فإذا أسلم استؤنفت وما منع ms168 الوطء ولم يخل بنكاح إن وجد فيه لم يمنع المدة كصوم وإحرام ومرض وجنون أو فيها وهو حسي كصغر ومرض منع وإن حدث في المدة قطعها فإذا زال استؤنفت وقيل: تبنى أو شرعي كحيض وصوم نفل فلا ويمنع فرض في الأصح فإن وطىء في المدة وإلا فلها مطالبة بأن يفيء أو يطلق ولو تركت حقها فلها المطالبة بعده وتحصل الفيئة بتغييب حشفة بقبل ولا مطالبة إن كان بها مانع وطء كحيض ومرض وإن كان فيه مانع طبيعي كمرض طولب بأن يقول إذا قدرت فئت أو شرعي كإحرام فالمذهب أنه يطالب بطلاق فإن عصى بوطء سقطت المطالبة وإن أبى الفيئة والطلاق فالأظهر أن القاضي يطلق عليه طلقة وإنه لا يمهل ثلاثة وأنه إذا وطىء بعد مطالبة لزمه كفارة يمين.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 139;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 140, 'كتاب الظهار', 'كتاب الظهار');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'يصح من كل زوج مكلف ولو ذميا وخصيا وظهار سكران كطلاقه وصريحه أن يقول لزوجته أنت علي أو مني أو معي أو عندي كظهر أمي وكذا أنت كظهر أمي صريح على الصحيح وقوله جسمك أو بدنك أو نفسك كبدن أمي أو جسمها أو جملتها صريح والأظهر أن قوله كيدها أو بطنها أو صدرها ظهار وكذا كعينها إن قصد ظهارا وإن قصد كرامة فلا وكذا إن أطلق في الأصح وقوله رأسك أو ظهرك أو يدك علي ظهر أمي ظهار في الأظهر والتشبيه بالجدة ظهار والمذهب طرده في كل محرم لم يطرأ تحريمها لا مرضعة وزوجة ابن ولو شبه بأجنبية ومطلقة وأخت زوجة وبأب وملاعنة فلغو ويصح تعليقه كقوله إن ظاهرت من زوجتي الأخرى فأنت علي كظهر أمي فظاهر صار مظاهرا منهما ولو قال إن ظاهرت من فلانة وفلانة أجنبية فخاطبها بظهار لم يصر مظاهرا من زوجته إلا أن يريد اللفظ فلو نكحها وظاهر منها صار مظاهرا ولو قال من فلانة الأجنبية فكذلك.

وقيل: لا يصير مظاهرا وإن نكحها وظاهر ولو قال إن ظاهرت منها وهي أجنبية فلغو ولو قال أنت طالق كظهر أمي ولم ينو أو نوى الطلاق أو الظهار أو ms169 هما أو الظهار بانت طالق والطلاق بكظهر أمي طلقت ولا ظهار أو الطلاق بأنت طالق والظهار بالباقي طلقت وحصل الظاهر إن كان طلاق رجعة.

فصل

على المظاهرة كفارة إذا عاد وهو أن يمسكها بعد ظهاره زمن إمكان فرقة فلو اتصلت به فرقة بموت أو فسخ أو طلاق بائن أو رجعي ولم يراجع أو جن فلا عود وكذا لو ملكها أولا عنها في الأصح بشرط سبق القذف ظهاره في الأصح ولو راجع أو ارتد متصلا ثم أسلم فالمذهب أنه عائد بالرجعة لا بالإسلام بل بعده ولا تسقط الكفارة بعد العودة بفرقة ويحرم قبل التكفير وطء وكذا لمس ونحوه بشهوة في الأظهر.

قلت: الأظهر الجواز. والله أعلم.

ويصح الظهار المؤقت مؤقتا وفي قول مؤبدا وفي قول لغو فعلى الأول الأصح أن عوده لا يحصل بإمساك بل وطء في المدة ويجب النزع بمغيب الحشفة ولو قال لأربع أنتن علي كظهر أمي فمظاهر منهن فإن أمسكهن فأربع كفارات وفي القديم كفارة ولو ظاهر منهن بأربع كلمات متواليات فعائد من الثلاث الأول ولو كرر في امرأة متصلا وقصد تأكيدا فظهار واحد أو استئنافا فالأظهر التعدد وأنه بالمرة الثانية عائد في الأول.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 140;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 141, 'كتاب الكفارة', 'كتاب الكفارة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'يشترط نيتها لا تعيينها وخصال كفارة الظهار عتق رقبة مؤمنة بلا عيب يخل بالعمل والكسب فيجزىء صغير وأقرع وأعرج يمكنه تباع مشي وأعور وأصم وأخثم وفاقد أنفه وأذنيه وأصابع رجليه لا زمن ولا فاقد رجل أو خنصر وبنصر من يد أو أنملتين من غيرهما.

قلت: أو أنملة إبهام. والله أعلم.

ولا هرم عاجز ومن أكثر وقته مجنون ومريض لا يرجى فإن برأ بان الإجزاء في الأصح ولا يجزىء شراء قريب بنية كفارة ولا أم ولد وذي كتابة صحيحة ويجزىء مدبر ومعلق بصفة فلو أراد جعل العتق المعلق كفارة لم يجز وله تعليق عتق الكفارة بصفة وإعتاق عبديه عن كفارتيه عن كل نصف ذا ونصف ذا ولو أعتق معسر نصفين عن كفارة فالأصح الإجزاء إن كان باقيهما حرا ولو أعتق بعوض لم يجز ms170 عن كفارة والإعتاق بمال كطلاق به فلو قال أعتق أم ولدك على ألف فأعتق نفذ ولزمه العوض وكذا لو قال أعتق عبدك على كذا فأعتق في الأصح وإن قال أعتقه عني على كذا ففعل عتق عن الطالب وعليه العوض والأصح أنه يملكه عقب لفظ الإعتاق ثم يعتق عليه ومن ملك عبدا أو ثمنه فاضلا عن كفاية نفسه وعياله

نفقة وكسوة وسكنى وأثاثا لا بد منه لزمه العتق ولا يجب بيع ضيعة ورأس مال لا يفضل دخلهما عن كفايته ولا مسكن وعبد نفيسين ألفهما في الأصح ولا شراء بغبن وأظهر الأقوال اعتبار اليسار بوقت الأداء فإن عجز عن عتق صام شهرين متتابعين بالهلال بنية كفارة ولا يشترط نية تتابع في الأصح فإن بدأ في أثناء شهر حسب الشهر بعده بالهلال وأتم الأول من الثالث: ثلاثين ويزول التتابع بفوات يوم بلا عذر وكذا بمرض في الجديد لا بحيض وكذا جنون على المذهب فإن عجز عن صوم بهرم أو مرض قال الأكثرون لا يرجى زواله أو لحقه بالصوم مشقة شديدة أو خاف زيادة مرض كفر بإطعام ستين مسكينا أو فقيرا لا كافرا ولا هاشميا ومطلبيا ستين مدا مما يكون فطرة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 141;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 142, 'كتاب اللعان', 'كتاب اللعان');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'يسبقه قذف وصريح الزنا كقوله لرجل أو امرأة زنيت أو زنيت أو يا زاني أو يا زانية والرمي بإيلاج حشفة في فرج مع وصفه بتحريم أو دبر صريحان وزنأت في الجبل كناية وكذا زنأت فقط في الأصح وزنيت في الجبل صريح في الأصح وقوله يا فاجر يا فاسق ولها يا خبيثة وأنت تحبين الخلوة ولقرشي يا نبطي ولزوجته لم أجدك عذراء كناية فإن أنكر إرادة قذف صدق بيمينه وقوله يا ابن الحلال وأما أنت فلست بزان ونحوه تعريض ليس بقذف وإن نواه وقوله زنيت بك إقرار بزنا وقذف ولو قال لزوجته يا زانية فقالت زنيت بك أو أنت أزنى مني فقاذف وكافية فلو قالت زنيت وأنت أزنى مني فمقرة وقاذفة وقوله زنى فرجك أو ذكرك قذف والمذهب أن قوله يدك وعينك ms171 ولولده لست مني أو لست ابني كناية ولولد غيره لست ابن فلان صريح إلا لمنفي بلعان ويحد قاذف محصن ويعزر غيره والمحصن مكلف حر مسلم عفيف عن وطء يحدبه وتبطل العفة لوطء محرم مملوكة على المذهب لا زوجته في عدة شبهة وأمة ولده ومنكوحته بلا ولي في الأصح ولو زنى مقذوف سقط الحد أو ارتد فلا ومن زنى مرة ثم صلح لم يعد محصنا وحد القذف يورث ويسقط بعفو والأصح أنه يرثه كل الورثة وأنه لو عفا بعضهم فللباقي كله.

فصل

له قذف زوجة علم زناها أو ظنه ظنا مؤكدا كشياع زناها بزيد مع قرينة بأن رآهما في خلوة ولو أتت بولد وعلم أنه ليس منه لزمه نفيه وإنما يعلم غذا لم يطأ أو ولدته لدون ستة أشهر من الوطء أو فوق أربع سنين فلو ولدته لما بينهما ولم يستبرىء بحيضة حرم النفي وإن ولدته لفوق ستة أشهر من الإستبراء حق النفي في الأصح ولو وطىء وعزل حرم على الأصح ولو علم زناها واحتمل كون الولد منه ومن الزنا حرم النفي وكذا القذف واللعان على الصحيح.

فصل

اللعان قوله أربع مرار أشهد بالله أني لمن الصادقين فيما رميت به هذه من الزنا فإن غابت سماها ورفع نسبها بما يميزها والخامسة أن لعنة الله عليه إن كان من الكاذبين فيما رماها به من الزنا وإن كان ولدا ينفيه ذكره في الكلمات فقال وأن الولد الذي ولدته أو هذا الولد من زنا ليس مني تقول هي أشهد بالله إنه لمن الكاذبين فيما رماني به من الزنا والخامسة أن غضب الله عليها إن كان من الصادقين فيه ولو بدل لفظ شهادة بحلف ونحوه أو غضب بلعن وعكسه أو ذكرا قبل تمام الشهادات لم يصح في الأصح. ويشترط فيه أمر القاضي ويلقن كلماته وأن يتأخر لعانها عن لعانه ويلاعن أخرس بإشارة مفهمة أو كتابة ويصح بالعجمية وفيمن عرف العربية وجه ويغلظ بزمان وهو بعد عصر

جمعة ومكان وهو أشرف بلدة فبمكة بين الركن والمقام ms172 والمدينة عند المنبر وبيت المقدس عند الصخرة وغيرها عند منبر الجامع وحائض بباب المسجد وذمي في بيعة وكنيسة وكذا بيت نار مجوسي في الأصح لا بيت أصنام وثني وجمع أقله أربعة.

والتغليظات سنة لا فرض على المذهب ويسن للقاضي وعظهما ويبالغ عند الخامسة وأن يتلاعنا قائمين وشرطه زوج يصح طلاقه ولو ارتد بعد وطء فقذف وأسلم في العدة لاعن ولو لاعن ثم أسلم فيها صح أو أصر صادف بينونة ويتعلق بلعانه فرقة وحرمة مؤبدة وإن أكذب نفسه وسقوط الحد عنه ووجوب حد زناها وانتفاء نسب نفاه بلعانه وإنما يحتاج إلى نفي ممكن منه فإن تعذر بأن ولدته لستة أشهر من العقد أو طلق في مجلسه أو نكح وهو بالمشرق وهي بالمغرب لم يلحقه وله نفيه ميتا والنفي على الفور في الجديد ويعذر لعذر وله نفي حمل وانتظار وضعه ومن أخر وقال: جهلت الولادة صدق بيمينه إن كان غائبا وكذا الحاضر في مدة يمكن جهله فيها ولو قيل: له متعت بولدك أو جعله الله لك ولدا صالحا فقال آمين أو نعم تعذر نفيه وإن قال: جزاك الله خيرا أو بارك عليك فلا وله اللعان مع إمكان بينة بزناها ولها دفع حد الزنا.

فصل

له اللعان لنفي ولد وإن عفت عن الحد وزال النكاح ولدفع حد القذف وإن زال النكاح ولا ولد ولتعزيره لا تعزير تأديب لكذب كقذف طفلة لا توطأ ولو عفت عن الحد أو

أقام بينة بزناها أو صدقته ولا ولد أو سكتت عن طلب الحد أو جنت بعد قذفه فلا لعان في الأصح ولو أبانها أو ماتت ثم قذفها بزنا مطلق أو مضاف إلى ما بعد النكاح لاعن إن كان ولد يلحقه فإن أضاف إلى ما قبل نكاحه فلا لعان إن لم يكن ولد وكذا إن كان في الأصح لكن له إنشاء قذف ويلاعن ولا يصح نفي أحد توأمين.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 142;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 143, 'كتاب العدد', 'كتاب العدد');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب العدد

عدة النكاح ضربان الأول متعلق بفرقة حي بطلاق وفسخ وإنما تجب بعد وطء أو استدخال ms173 منيه وإن تيقن براءة الرحم لا بخلوة في الجديد وعدة حرة ذات أقراء ثلاثة والقرء الطهر فإن طلقت طاهرا انقضت بالطعن في حيضة ثالثة أو حائضا ففي رابعة وفي قول تشترط يوم وليلة بعد الطعن وهل يحسب طهر من لم تحض قرأ قولان بناء على أن القرء انتقال من طهر إلى حيض أم طهر محتوش بدمين والثاني أظهر وعدة مستحاضة بإقرائها المردودة إليها ومتحيرة بثلاثة أشهر في الحال وقيل: بعد اليأس وأم ولد ومكاتبة ومن فيها رق بقرأين وإن عتقت في عدة رجعية كملت عدة حرة في الأظهر أو بينونة فأمة في الأظهر وحرة لم تحض أو يئست بثلاثة أشهر فإن طلقت في أثناء شهر فبعده هلالان وتكمل المنكسر ثلاثين فإن حاضت فيها وجبت الإقراء وأمة بشهر ونصف وفي قول شهران وفي قول ثلاثة ومن انقطع دمها لعلة كرضاع ومرض تصبر حتى تحيض أو تيأس فبالأشهر أولا لعلة فكذا في الجديد وفي القديم تتربص تسعة أشهر وفي قول أربع سنين ثم تعتد بالأشهر فعلى الجديد لو حاضت بعد اليأس في الأشهر وجبت الإقراء أو بعدها فأقوال أظهرها إن نكحت فلا شيء وإلا فالإقراء والمعتبر يأس عشيرتها وفي قول كل النساء.

قلت: ذا القول أظهر. والله أعلم.

فصل

عدة الحامل بوضعه بشرط نسبته إلى ذي العدة ولو احتمالا كمنفي بلعان وانفصال كله حتى ثاني توأمين ومتى تخلل دون ستة أشهر فتوأمان وتنقضي بميت لا علقة وبمضغة فيها صورة آدمي خفية أخبر بها القوابل فإن لم يكن صورة وقلن هي أصل آدمي انتقضت على المذهب ولو ظهر في عدة أقراء أو أشهر حمل للزوج اعتدت بوضعه ولو ارتابت فيها لم تنكح حتى تزول الريبة أو بعدها وبعد نكاح استمر إلى أن تلد لدون ستة أشهر من عقله أو بعدها قبل نكاح فلتصبر لتزول الريبة فإن نكحت فالمذهب عدم إبطاله في الحال فإن علم مقتضيه أبطلناه ولو أبانها فولدت لأربع سنين لحقه أو لأكثر فلا ولو طلق رجعيا حسبت المدة من الطلاق وفي ms174 قول من انصرام العدة ولو نكحت بعد العدة فولدت لدون ستة أشهر فكأنها لم تنكح وإن كان لستة فالولد للثاني ولو نكحت في العدة فاسد فولت للإمكان من الأول لحقه وانقضت بوضعه ثم تعتد للثاني أو للإمكان من الثاني لحقه أو منهما عرض على قائف فإن ألحقه بأحدهما فكالإمكان منه فقط.

فصل

لزمها عدتا شخص من جنس بأن طلق ثم وطىء في عدة أقراء أو أشهر جاهلا أو عالما في رجعية تداخلتا فتبتدىء عدة من الوطء ويدخل فيها بقية عدة الطلاق فإن كانت إحداهما حملا والأخير أقراء تداخلتا في الأصح فتنقضيان بوضعه ويراجع قبله وقيل: إن كان الحمل من الوطء فلا أو لشخصين بان كانت في عدة زوج أو شبهة فوطئت بشبهة أو نكاح

فاسد أو كانت زوجة معتدة عن شبهة فطلقت فلا تداخل فإن كان حمل قدمت عدته وإلا فإن سبق الطلاق أتمت عدته ثم استأنفت الأخرى وله الرجعة في عدته فإذا رجع انقطعت وشرعت في عدة الشبهة ولا يستمتع بها حتى تقضيها وإن سبقت الشبهة قدمت عدة الطلاق وقيل: الشبهة.

فصل

عاشرها كزوج بلا وطء في عدة أقراء أو أشهر فأوجه أصحها إن كانت بائنا انقضت وإلا فلا ولا رجعة بعد الأقراء والأشهر.

قلت: ويلحقها الطلاق إلى انقضاء العدة ولو عاشرها أجنبي انقضت. والله أعلم.

ولو نكح معتدة بظن الصحة ووطىء انقطعت من حين وطء وفي قول أو وجه من العقد ولو راجع حائلا ثم طلق استأنفت وفي القديم تبنى إن لم يطأ أو حاملا فبالوضع فلو وضعت ثم طلق استأنفت وقيل: إن لم يطأ بعد الوضع فلا عدة ولو خالع موطوءة ثم نكحها ثم وطىء ثم طلق استأنفت ودخل فيها البقية.

فصل

عدة حرة حائل لوفاة وإن لم توطأ أربعة أشهر وعشرة أيام بلياليها وأمة نصفها وإن مات عن رجعية انتقلت إلى وفاة أو بائن فلا وحامل بوضعه بشرطه السابق فلو مات صبي عن حامل فبالأشهر وكذا ممسوح إذ لا يلحق على المذهب ويلحق مجبوبا بقي أنثياه ms175 فتعتد به وكذا مسلول بقي ذكره به على المذهب ولو طلق إحدى امرأتيه ومات قبل بيان أو تعيين

فإن كان لم يطأ اعتدتا لوفاة وكذا إن وطىء وهما ذواتا أشهر أو أقراء والطلاق رجعي فإن كان بائنا اعتدت كل واحدة بالأكثر من عدة وفاة وثلاثة من أقرائها وعدة الوفاة من الموت والأقراء من الطلاق ومن غاب وانقطع خبره ليس لزوجته نكاح حتى يتيقن موته أو طلاقه وفي القديم تتربص أربع سنين ثم تعتد لوفاة وتنكح فلو حكم بالقديم قاض نقض على الجديد في الأصح ولو نكحت بعد التربص والعدة في الأصح ويجب الإحداد على معتد وفاة لا رجعية ويستحب لبائن وفي قول يجب وهو ترك لبس مصبوغ لزينة وإن خشن وقيل: يحل ما صبغ غزله ثم نسج ويباح غير مصبوغ من قطن وصوف وكتان وكذا إبر يسم في الأصح ومصبوغ لا يقصد لزينة ويحرم حلي ذهب وفضة وكذا اللؤلؤ في الأصح وطيب في بدن وثوب وطعام وكحل واكتحال بإثمد إلا لحاجة كرمد وإسفيذاج ودمام خضاب حناء ونحوه ويحل تجميل فراش وأثاث وتنظيف بغسل نحو رأس وقلم وإزالة وسخ.

قلت: ويحل امتشاط وحمام إن لم يكن خروج محرم ولو تركت الإحداد عصت وانقضت العدة كما لو فارقت المسكن ولو بلغتها الوفاة بعد المدة كانت منقضية ولها إحداد على غير زوج ثلاثة أيام وتحرم الزيادة. والله أعلم.

فصل

تجب سكنى لمعتدة طلاق ولو بائنا إلا ناشزة ولمعتدة وفاة في الأظهر وفسخ على المذهب وتسكن في مسكن كانت فيه عند الفرقة وليس لزوج وغيره إخراجها ولا لها خروج.

قلت: ولها الخروج في عدة وفاة وكذا بائن في النهار لشراء طعام وغزل ونحوه وكذا

ليلا إلى دار جارة لغزل وحديث ونحوهما بشرط أن ترجع وتبيت في بيتها وتنتقل من المسكن لخوف من هدم أو غرق أو على نفسها أو تأذت بالجيران أو هم بها أذى شديدا والله أعلم ولو انتقلت إلى مسكن بإذن الزوج فوجبت العدة قبل وصولها إليه اعتدت فيه عن النص أو ms176 بغير إذن ففي الأول وكذا لو أذن ثم وجبت قبل الخروج ولو أذن في الانتقال إلى بلد فكمسكن أو سفر حج أو تجارة ثم وجبت في الطريق فلها الرجوع والمضي فإن مضت أقامت لقضاء حاجتها ثم يجب الرجوع لتعتد البقية في المسكن ولو خرجت إلى غير الدار المألوفة فطلق وقال ما أذنت في الخروج صدق بيمينه ولو قالت نقلتني فقال بل أذنت لحاجة صدق على المذهب ومنزل بدوية وبيتها من شعر كمنزل حضرية وإذا كان المسكن له ويليق بها تعين ولا يصح بيعه إلا في عدة ذات أشهر وكمستأجر وقيل: باطل أو مستعار لزمتها فيه فإن رجع المعير ولم يرض بأجرة نقلت وكذا مستأجر انقضت مدته أولها استمرت وطلبت الأجرة فإن كان مسكن النكاح نفيسا فله النقل إلى لائق بها أو خسيسا فلها الامتناع وليس له مساكنتها ولا مداخلتها فإن كان في الدار محرم لها مميز ذكر أو له أنثى أو زوجة كذلك أو أمة أو امرأة أجنبية جاز ولو كان في الدار حجرة فسكنها أحدهما والآخر الأخرى فإن اتحدت المرافق كمطبخ ومستراح اشترط محرم وإلا فلا وينبغي أن يغلق ما بينهما من باب وأن لا يكون ممر أحدهما على الآخر وسفل وعلو كدار وحجرة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 143;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب الإستبراء', 'يجب بسببين أحدهما ملك أمة بشراء أو إرث أو هبة أو سبي أو رد بعيب أو تحالف أو

إقالة وسواء بكر ومن استبرأها البائع قبل البيع ومتنقلة من صبي وامرأة وغيرها ويجب في مكاتبة عجزت وكذا مرتدة في الأصح لا من حلت من صوم أو اعتكاف وإحرام وفي الإحرام وجه ولو اشترى زوجته استحب وقيل: يجب ولو ملك مزوجة أو معتدة لم يجب فإن زال وجب في الأظهر الثاني زوال فراش عن أمة موطوءة أو مستولدة بعتق أو موت السيد ولو مضت مدة إستبراء على مستولدة ثم أعتقها أو مات وجب في الأصح.

قلت: ولو استبرأ أمة موطوءة فأعتقها لم يجب وتتزوج في الحال إذ لا تشبه منكوحة والله أعلم ويحرم تزوج أمة ms177 موطوءة ومستولدة قبل الإستبراء لئلا يختلط الماآن ولو أعتق مستولدته فله نكاحها بلا استبراء في الأصح ولو أعتقها أو مات وهي مزوجة فلا استبراء وهو بقرء وهو حيضة كاملة في الجديد وذات أشهر بشهر وفي قول بثلاثة وحامل مسبية أو زال عنها فراش سيد بوضعه وإن ملكت بشراء فقد سبق أن لا استبراء في الحال.

قلت: يحصل الإستبراء بوضع حمل زنا في الأصح والله أعلم ولو مضى زمن استبراء بعد الملك قبل القبض حسب إن ملك بإرث وكذا شراء في الأصح لا هبة ولو اشترى مجوسية فحاضت ثم أسلمت لم يكف ويحرم الاستمتاع بالمستبرأة إلا مسبية فيحل غير وطء وقيل: لا وإذا قالت حضت صدقت ولو منعت السيد فقال أخبرتني بتمام الإستبراء صدق ولا تصير أمة فراشا إلا بوطء فإذا ولدت للإمكان من وطئه لحقه ولو أقر بوطء ونفى الولد وادعى استبراء لم يلحقه على المذهب فإن أنكرت الإستبراء حلف أن الولد ليس منه وقيل: يجب تعرضه للإستبراء ولو ادعت استيلاء فأنكر أصل الوطء وهناك ولد لم يحلف على الصحيح ولو قال وطئت وعزلت لحقه في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 143;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 144, 'كتاب الرضاع', 'كتاب الرضاع');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'إنما يثبت بلبن امرأة حية بلغت تسع سنين ولو حلبت فأوجر بعد موتها حرم في الأصح ولو جبن أو نزع منه زبد حرم ولو خلط بمائع حرم إن غلب فإن غلب وشرب الكل قيل: أو البعض حرم في الأظهر ويحرم إيجار وكذا إسعاط على المذهب لا حقنة في الأظهر وشرطه رضيع حي لم يبلغ سنتين وخمس رضعات وضبطهن بالعرف فلو قطع إعراضا تعدد أو للهو وعاد في الحال أو تحول من ثدي إلى ثدي فلا ولو حلب منها دفعة وأوجره خمسا أو عكسه فرضعة وفي قول خمس ولو شك هل خمسا أم أقل أو هل رضع في حولين أم بعد فلا تحريم وفي الثانية قول أو وجه وتصير المرضعة أمه والذي منه اللبن أباه وتسري الحرمة إلى أولاده ولو كان لرجل خمس مستولدات أو أربع نسوة وأم ولد فرضع طفل من ms178 كل رضعة صار ابنه في الأصح فيحرمن عليه لأنهن موطوآت أبيه ولو كان بدل المستولدات بنات أو أخوات فلا حرمة في الأصح وآباء المرضعة من نسب أو رضاع أجداد للرضيع وأمهاتها جداته وأولادها من نسب أو رضاع إخوته وإخوتها وأخواتها أخواله وخالاته وأبو ذي اللبن جده وأخوه عمه وكذا الباقي واللبن لمن نسب إليه ولد نزل به بنكاح أو وطء شبهة لا زنا ولو نفاه بلعان انتفى اللبن عنه ولو وطئت منكوحة بشبهة أو وطىء اثنان

بشبهة فولدت فاللبن لمن لحقه الولد بقائف أو غيره ولا تنقطع نسبة اللبن عن زوج مات أو طلق وإن طالت المدة أو انقطع وعاد فإن نكحت آخر وولدت منه فاللبن بعد الولادة له وقبلها للأول وإن لم يدخل وقت ظهور لبن حمل الثاني وكذا إن دخل وفي قول للثاني وفي قول لهما.

فصل

تحته صغيرة فأرضعتها أمه أو أخته أو زوجة أخرى انفسخ نكاحه وللصغيرة نصف مهرها وله على المرضعة نصف مهر مثل وفي قول كله ولو رضعت من نائمة فلا غرم ولا مهر للمرضعة ولو كان تحته كبيرة وصغيرة فأرضعت أم الكبيرة الصغيرة انفسخت الصغيرة وكذا الكبيرة في الأظهر وله نكاح من شاء منهما وحكم مهر الصغيرة وتغريمه المرضعة ما سبق وكذا الكبيرة إن لم تكن موطوأة فإن كانت موطوأة فله على المرضعة مهر مثل في الأظهر ولو أرضعت بنت الكبيرة الصغيرة حرمت الكبيرة أبدا وكذا الصغيرة إن كانت الكبيرة موطوأة ولو كانت تحته صغيرة فطلقها فأرضعتها امرأة صارت أم امرأته ولو نكحت مطلقته صغيرا وأرضعته بلبنه حرمت على المطلق والصغير أبدا ولو زوج أم ولده عبده الصغير فأرضعته لبن السيد حرمت عليه وعلى السيد ولو أرضعت موطوأته الأمة صغيرة تحته بلبنه أو لبن غيره حرمتا عليه ولو كان تحته صغيرة وكبيرة فأرضعتها انفسختا وحرمت الكبيرة أبدا وكذا الصغيرة إن كان الإرضاع بلبنه وإلا فربيبة ولو كان تحته كبيرة وثلاث صغائر فأرضعتهن حرمت أبدا وكذا الصغائر إن أرضعتهن بلبنه أو لبن غيره وهي ms179 موطوأة وإلا فإن أرضعنهن معا بإيجارهن الخامسة انفسخن ولا يحرمن مؤبدا أو مرتبا لم يحرمن وتنفسخ

الأولى والثالث: ة وتنفسخ الثانية بإرضاع الثالث: ة وفي قول لا ينفسخ ويجري القولان فيمن تحته صغيرتان أرضعتهما أجنبية مرتبا أينفسخان أم الثانية.

فصل

قال هند بنتي أو أختي برضاع أو قالت هو أخي حرم تناكحهما ولو قال زوجان بيننا رضاع محرم فرق بينهما وسقط المسمى ووجب مهر مثل إن وطىء وإن ادعى رضاعا فأنكرت انفسخ ولها المسمى إن وطىء وإلا فنصفه وإن ادعته فأنكر صدق بيمينه إن زوجت برضاها وإلا فالأصح تصديقها ومهر مثل إن وطىء وإلا فلا شيء لها ويحلف منكر رضاع على نفي علمه ومدعيه على بت ويثبت بشهادة رجلين أو رجل وامرأتين وبأربع نسوة والإقرار به شرطه رجلان وتقبل شهادة المرضعة إن لم تطلب أجرة ولا ذكرت فعلها وكذا إن ذكرت فقالت أرضعته في الأصح والأصح أنه لا يكفي بينهما رضاع محرم بل يجب ذكر وقت وعدد ووصول اللبن جوفه ويعرف ذلك بمشاهة حلب وإيجار وازدراد أو قرائن كالتقام ثدي ومصه وحركة حلقه بتجرع وازدراد بعد علمها إنها لبون.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 144;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 145, 'كتاب النفقات', 'كتاب النفقات');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'على موسر لزوجته كل يوم مد طعام ومعسر مد ومتوسط مد ونصف والمد مائة وثلاثة وسبعون درهما وثلث درهم.

قلت: الأصح مائة وأحد وسبعون وثلاثة أسباع والله أعلم ومسكين الزكاة معسر ومن فوقه إن كان لو كلف مدين ردع مسكينا فمتوسط وإلا فموسر والواجب غالب قوت البلد.

قلت: فإن اختلف وجب لائق به ويعتبر اليسار وغيره بطلوع الفجر والله أعلم وعليه تمليكها حبا وكذا طحنه وخبزه في الأصح ولو طلب أحدهما بدل الحب لم يجبر الممتنع فإن اعتاضت جاز في الأصح إلا خبزا ودقيقا على المذهب ولو أكلت معه كالعادة سقطت نفقتها في الأصح.

قلت: إلا أن تكون غير رشيدة ولم يأذن وليها والله أعلم ويجب أدم غالب البلد كزيت وسمن وجبن وتمر ويختلف بالفصول ويقدره قاض باجتهاده ويفاوت بين موسر وغيره ولحم يليق بيساره وإعساره كعادة البلد ولو ms180 كانت تأكل الخبز وحده وجب الأدم وكسوة تكفيها فيجب قميص وسراويل وخمار ومكعب ويزيد في الشتاء جبة وجسنها قطن فإن

جرت عادة البلد لمثله بكتان أو حرير وجب في الأصح ويجب ما تقعد عليه كزلية أو لبد أو حصير وكذا فراش للنوم في الأصح ومخدة ولحاف في الشتاء وآلة تنظيف كمشط ودهن وما يغسل به الرأس ومرتك ونحوه لدفع صنان لا كحل وخضاب وما يزين ودواء مرض وأجرة طبيب وحاجم ولها طعام أيام المرض وأدمها والأصح وجوب أجرة حمام بحسب العادة وثمن ماء غسل جماع ونفاس لا حيض واحتلام ولها آلات أكل وشرب وطبخ كقدر وقصعة وكوز وجرة ونحوها ومسكن يليق بها ولا يشترط كونه ملكه وعليه لمن لا يليق بها خدمة نفسها إخدامها بحرة أو أمة له أو مستأجرة أو بالإنفاق على من صحبتها من حرة أو أمة لخدمة وسواء في هذا موسر ومعسر وعبد فإن أخدمها بحرة أو أمة بأجرة فليس عليه غيرها أو بأمته أنفق عليها بالملك أو بمن صحبتها لزمه نفقتها وجنس طعامها جنس طعام الزوجة وهو مد على معسر وكذا متوسط في الصحيح وموسر مد وثلث ولها كسوة تليق بحالها وكذا أدم على الصحيح لا آلة تنظيف فإن كثر وسخ وتأذت بقمل وجب أن ترفه ومن تخدم نفسها في العادة إن احتاجب إلى خدمة لمرض أو زمانة وجب إخدامها ولا إخدام لرقيقه وفي الجملة وجب ويجب في المسكن إمتاع وما يستهلك كطعام تمليك وتتصرف فيه فلو قترت بما يضرها منعها وما دام نفعه ككسوة وظروف طعام ومشط تمليك وقيل: إمتاع وتعطي الكسوة أول شتاء وصيف فإن تلف فيه بلا تقصير لم تبدل إن قلنا تمليك فإن ماتت فله لم ترد ولو لم يكس مدة فدين.

فصل

الجديد أنها تجب بالتمكين لا العقد فإن اختلفا فيه صدق فإن لم تعرض عليه مدة فلا نفقة فيها وإن عرضت وجبت من بلوغ الخبر فإن غاب كتب الحاكم لحاكم بلده ليعلمه فيجيء أو يوكل فإن لم يفعل ومضى زمن ms181 وصوله فرضها القاضي والمعتبر في مجنونة ومراهقة عرض ولي وتسقط بنشوز ولو بمنع لمس بلا عذر وعبالة زوج أو مرض يضر معه الوطء عذر والخروج من بيته بلا إذن نشوز إلا أن يشرف على انهدام وسفرها بإذنه معه أو لحاجته لا يسقط ولحاجتها يسقط في الأظهر ولو نشرت فغاب فأطاعت لم تجب في الأصح وطريقها أن يكتب الحاكم كما سبق ولو خرجت في غيبته لزيارة ونحوها لم تسقط والأظهر أن لا نفقة لصغيرة وأنها تجب لكبيرة على صغير وإحرامها بحج أو عمرة بلا إذن نشوز إن لم يملك تحليلها فإن ملك فلا حتى تخرج فمسافرة لحاجتها أو بإذن ففي الأصح لها نفقة ما لم تخرج ويمنعها صوم نفل فإن أبت فناشزة في الأظهر والأصح أن قضاءه لا يتضيق كنفل فيمنعها وأنه لا منع من تعجيل مكتوبة أول وقت وسنن راتبة ويجب لرجعية المؤن إلا مؤنة تنظف فلو ظنت حاملا فأنفق فبانت حائلا استرجع ما دفع بعد عدتها والحائل البائن بخلع أو ثلاث لا نفقة لها ولا كسوة وتجبان لحامل لها وفي قول للحمل فعلى الأول لا تجب لحامل عن شبهة أو نكاح فاسد.

قلت: ولا نفقة لمعتدة وفاة وإن كانت حاملا والله أعلم ونفقة العدة مقدرة كزمن النكاح وقيل: تجب الكفاية ولا يجب دفعها قبل ظهور حمل فإذا ظهر وجب يوما بيوم وقيل: حين تضع ولا تسقط بمضي الزمان على المذهب.

فصل

أعسر بها فإن صبرت صارت دينا عليه وإلا فلها الفسخ على الأظهر والأصح أن لا فسخ بمنع موسر حضر أو غاب ولو حضر وغاب ماله فإن كان بمسافة القصر فلها الفسخ وإلا فلا ويؤمر بالإحضار ولو تبرع رجل بها لم يلزمها القبول وقدرته على الكسب كالمال وإنما تفسخ بعجزه عن نفقة معتمر والإعسار بالكسوة كهو بالنفقة وكذا بالأدم والمسكن في الأصح.

قلت: الأصح المنع في الأدم والله أعلم وفي إعساره بالمهر أقوال أظهرها تفسخ قبل وطء لا بعده ولا فسخ حتى يثبت عند قاض إعساره فيفسخه أو يأذن ms182 لها فيه ثم في قول ينجز الفسخ والأظهر إمهاله ثلاثة أيام ولها الفسخ صبيحة الرابع: إلا أن يسلم نفقته ولو مضى يومان بلا نفقة وأنفق الثالث: وعجز الرابع: بنت وقيل: تستأنف ولها الخروج زمن المهلة لتحصيل النفقة وعليها الرجوع ليلا ولو رضيت بإعساره أو نكحته عالمة بإعساره فلها الفسخ بعده ولو رضيت بإعساره بالمهر فلا ولا فسخ لولي صغيرة ومجنونة بإعسار بمهر ونفقة ولو أعسر زوج أمة بالنفقة فلها الفسخ فإن رضيت فلا فسخ للسيد في الأصح وله أن يلجئها إليه بأن لا ينفق عليها ويقول افسخي أو جوعي.

فصل

يلزمه نفقة الوالد وإن علا والولد وإن سفل وإن اختلف دينهما بشرط يسار المنفق

بفاضل عن قوته وقوت عياله في يومه ويباع فيها ما يباع في الدين ويلزم كسوبا كسبها في الأصح ولا تجب لمالك كفايته ولا لمكتسبها وتجب لفقير غير مكتسب إن كان زمنا أو صغيرا أو مجنونا وإلا فأقوال أحسنها تجب والثالث: لأصل لا فرع.

قلت: الثالث: أظهر والله أعلم وهي الكفاية وتسقط بفواتها ولا تصير دينا عليه إلا بفرض قاض أو إذنه في اقتراض لغيبة أو منع وعليها إرضاع ولدها اللبأ ثم بعده إن لم يوجد إلا هي أو أجنبية وجب إرضاعه وإن وجدتا لم تجبر الأم فإن رعبت وهي منكوحة أبيه فله منعها في الأصح.

قلت: الأصح ليس له منعها صححه الأكثرون والله أعلم فإن اتفقا وطلبت أجرة مثل أجيبت أو فوقها فلا وكذا إن تبرعت أجنبية أو رضيت بأقل في الأظهر ومن استوى فرعاه أنفقا وإلا فالأصح أقربهما فإن استويا فبالإرث في الأصح والثاني بالإرث ثم القرب والوارثان يستويان أم يوزع بحسبه وجهان ومن له أبوان فعلى الأب وقيل: عليهما لبالغ أو أجداد وجدات إن أدلى بعضهم ببعض فالأقرب وإلا فبالقرب وقيل: الإرث وقيل: بولاية المال ومن له أصل وفرع ففي الأصح على الفرع وإن بعد أو محتاجون يقدم زوجته ثم الأقرب وقيل: الوارث وقيل: الولي.

فصل

الحضانة حفظ من لا يستقل وتر بيته والإناث ms183 أليق بها وأولاهن أم ثم أمهات يدلين بإناث يقدم أقربهن والجديد تقدم بعدهن أم أب ثم أمهاتها المدليات بإناث ثم أم أبي أب كذلك ثم أم أبي جد كذلك والقديم الأخوات والخالات عليهن وتقدم أخت على خالة

وخالة على بنت أخ وأخت وبنت أخ وأخت على عمة وأخت من أبوين على أخت من أحدهما والأصح تقديم أخت من أب على أخت من أم وخالة وعمة لأب عليهما لأم وسقوط كل جدة لا ترث دون أنثى غير محرم كبنت خالة وتثبت لكل ذكر محرم وارث على ترتيب الإرث وكذا غير محرم كابن عم على الصحيح ولا تسلم إليه مشتهاة بل إلى ثقة يعينها فإن فقد الإرث والمحرمية أو الإرث فلا في الأصح وإن اجتمع ذكور وإناث فالأم ثم أمهاتها ثم الأب وقيل: تقدم عليه الخالة والأخت من الأم ويقدم الأصل على الحاشية فإن فقد فالأصح الأقرب وإلا فالأنثى وإلا فيقرع ولا حضانة لرقيق ومجنون وفاسق وكافر على مسلم وناكحة غير أبي الطفل إلا عمه وابن عمه وابن أخيه في الأصح وإن كان رضيعا اشترط أن ترضعه على الصحيح فإن كملت ناقصة وطلقت منكوحة حضنت وإن غابت الأم أو امتنعت فللجدة على الصحيح هذا كله في غير مميز والمميزان افترق أبواه كان عند من اختار منهما فإن كان في أحدهما جنون أو كفر أو رق أو فسق أو نكحت فالحق للآخر ويخير بين أم وجد وكذا أخ أو عم أو أب مع أخت أو خالة في الأصح وإن اختاره أحدهما ثم الآخر حول إليه فإن اختار الأب ذكر لم يمنعه زيارة أمه ويمنع أنثى ولا يمنعها دخولا عليهما زائرة والزيارة مرة في أيام فإن مرضا فالأم أولى بتمريضهما فإن رضي به في بيته وإلا ففي بيتها وإن اختارها ذكر فعندها ليلا وعند الأب نهارا يؤدبه ويسلمه لكتب أو حرفة أو أنثى فعندها ليلا ونهارا يزورها الأب على العادة وإن اختارهما أقرع وإن لم يختر فالأم أولى وقيل: يقرع ولو أراد أحدهما سفر ms184 حاجة كان الولد المميز وغيره مع المقيم حتى يعود أو سفر نقلة فالأب أولى بشرط أمن طريقه والبلد المقصود قبل ومسافة قصر ومحارم العصبة في هذا كالأب وكذا ابن عم لذكر ولا يعطى أنثى فإن رافقته بنته سلم إليها.

فصل

عليه كفاية رقيقه نفقة وكسوة وإن كان أعمى زمنا ومدبرا ومستولدة من غالب قوت رقيق البلد وأدمهم وكسوتهم ولا يكفي ستر العورة ويسن أن يناوله مما يتنعم به من طعام وأدم وكسوة وتسقط بمضي الزمان ويبيع القاضي فيها ماله فإن فقد المال أمره ببيعه أو إعتاقه ويجبر أمته على إرضاع ولدها وكذا غيره إن فضل عنه وفطمه قبل حولين إن لم يضره وإرضاعه بعدهما إن لم يضرها وللحرة حق التربية فليس لأحدهما فطمه قبل حولين ولهما إن لم يضره ولأحدهما بعد حولين ولهما الزيادة ولا يكلف رقيقه إلا عملا يطيقه ويجوز مخارجته بشرط رضاهما وهي خراج يؤديه كل يوم أو أسبوع وعليه علف دوابه وسقيها فإن امتنع أجبر في المأكول على بيع أو علف أو ذبح وفي غيره على بيع أو علف ولا يحلب ما ضر ولدها وما لا روح له كقناة ودار لا تجب عمارتها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 145;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 146, 'كتاب الجراح', 'كتاب الجراح');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب الجراح

الفعل المزهق ثلاثة عمد وخطأ وشبه عمد ولا قصاص إلا في العمد وهو قصد الفعل والشخص بما يقتل غالبا جارح أو مثقل فإن فقد قصد أحدهما بأن وقع عليه فمات أو رمى شجرة فأصابه فخطأ وإن قصدهما بما لا يقتل غالبا فشبه عمد ومنه الضرب بسوط أو عصا فلو غرز إبرة بمقتل فعمد وكذا بغيره إن تورم وتألم حتى مات فإن لم يظهر أثر ومات في الحال فشبه عمد وقيل: عمد وقيل: لا شيء ولو غرز فيما لا يؤلم كجلدة عقب فلا شيء بحال ولو حبسه ومنعه الطعام والشراب والطلب حتى مات فإن مضت مدة يموت مثله فيها غالبا جوعا أو عطشا فعمد فإن لم يكن به جوع وعطش سابق فشبه عمد وإن كان بعض جوع وعطش وعلم الحابس ms185 الحال فعمد وإلا فلا في الأظهر.

ويجب القصاص بالسبب فلو شهدا بقصاص فقتل ثم رجعا وقالا تعمدنا لزمهما القصاص إلا أن يعترف الولي بعلمه بكذبهما ولو ضيف بمسموم صبيا أو مجنونا فمات وجب القصاص أو بالغا عاقلا ولم يعلم حال الطعام فدية وفي قول قصاص وفي قول لا شيء ولو دس سما في طعام شخص الغالب أكله منه فأكله جاهلا فعلى الأقوال ولو ترك المجروح علاج جرح مهلك فمات وجب القصاص أو بالغا ولم يعلم حال الطعام فدية وفي قول قصاص وفي قول

لا شيء ولودس مما في طعام شخص الغالب أكله منه فأكله جاهلا فعلى الأقوال ولو ترك المجروح علاج جرح مهلك فمات وجب القصاص ولو ألقاه في ماء لا يعد مغرقا كمنبسط فمكث فيه مضطجعا حتى هلك فهدر أو مغرق لا يخلص منه إلا بسباحة فإن لم يحسنها أو كان مكتوفا أو زمنا فعمد وإن منع منها عارض كريح وموج فشبه عمد وإن أمكنته فتركها فلا دية في الأظهر أو في نار يمكن الخلاص منها فمكث فيها ففي الدية القولان ولا قصاص في الصورتين وفي النار وجه ولو أمسكه فقتله آخر أو حفر بئرا فرداه فيها آخر أو ألقاه من شاهق فتلقاه آخر فقده فالقصاص على القاتل والمردى والقاد فقط ولو ألقاه في ماء مغرق فالتقمه حوت وجب القصاص في الأظهر أو غير مغرق فلا ولو أكرهه على قتل فعليه القصاص وكذا على المكره في الأظهر فإن وجبت الدية وزعت فإن كافأه أحدهما فقط فالقصاص عليه ولو أكره بالغ مراهقا فعلى البالغ القصاص إن قلنا عمد الصبي عمد وهو الأظهر ولو أكره على رمي شاخص علم المكره أنه رجل وظنه المكره صيدا فالأصح وجوب القصاص على المكره أو على رمى صيد فأصاب رجلا فلا قصاص على أحد أو على صعود شجرة فزلق ومات فشبه عمد وقبل عمدا وعلى قتل نفسه فلا قصاص في الأظهر ولو قال اقتلني وإلا قتلتك فقتله فالمذهب لا قصاص والأظهر لا دية ولو قال ms186 اقتل زيدا أو عمرا فليس بإكراه.

فصل

وجد من شخصين معا فعلان مزهقان مذففان كحز وقد أولا كقطع عضوين فقاتلان وإن أنهاه رجل إلى حركة مذبوح بان لم يبق إبصار ونطق وحركة اختيار ثم جنى آخر فالأول

قاتل ويعزر الثاني وإن جنى الثاني قبل الإنهاء إليها فإن ذفف كحز بعد جرح فالثاني قاتل وعلى الأول قصاص العضو أو مال بحسب الحال وإلا يقاتلان ولو قتل مريضا في النزع وعيشه عيش مذبوح وجب القصاص.

فصل

قتل مسلما ظن كفره بدار الحرب لا قصاص وكذا لا دية في الأظهر أو بدار الإسلام وجبا وفي القصاص قول أو من عهده مرتدا أو ذميا أو عبدا أو ظنه قاتل أبيه فبان خلافه فالمذهب وجوب القصاص ولو ضرب مريضا جهل مرضه ضربا يقتل المريض وجب القصاص وقيل: لا ويشترط لوجوب القصاص في القتيل إسلام أو أمان فيهدر الحربي والمرتد ومن عليه قصاص كغيره والزاني المحصن إن قتله ذمي قتل أو مسلم فلا في الأصح وفي القاتل بلوغ وعقل والمذهب وجوبه على السكران ولو قال كنت يوم القتل صبيا أو مجنونا صدق بيمينه إن أمكن الصبا وعهد الجنون ولو قال أنا صبي فلا قصاص ولا يحلف ولا قصاص على حربي ويجب على المعصوم والمرتد ومكافأة فلا يقتل مسلم بذمي ويقتل ذمي به وبذمي وإن اختلفت ملتهما فلو أسلم القاتل لم يسقط القصاص ولو جرح ذمي ذميا وأسلم الجارح ثم مات المجروح فكذا في الأصح وفي الصورتين إنما يقتص الإمام بطلب الوارث والأظهر قتل مرتد بذمي وبمرتد لا ذمي ولا يقتل حر بمن فيه رق

ويقتل قن ومدبر ومكاتب وأم ولد بعضهم ببعض ولو قتل عبد عبدا ثم عتق القاتل أو عتق بين الجرح والموت فكحدوث الإسلام ومن بعضه حر لو قتل مثله لا قصاص وقيل: إن لم تزد حرية القاتل وجب ولا قصاص بين عبد مسلم وحر ذمي ولا بقتل ولد وإن سفل ولا له ويقتل بوالديه ولو تداعيا مجهولا فقتله احدهما فإن ألحقه القائف بالآخر ms187 اقتص وإلا فلا.

ولو قتل أحد أخوين الأب والآخر الأم معا فلكل قصاص ويقدم بقرعة فإن اقتص بها أو مبادرا فلو ارث المقتص منه قتل إن لم تورث قاتلا بحق وكذا إن قتلا مرتبا ولا زوجية وإلا فعلى الثاني فقط ويقتل الجمع بواحد وللولي العفو عن بعضهم على حصته من الدية باعتبار الرؤس ولا يقتل وشريك مخطىء وشبه عمد ويقتل شريك الأب وعبد شارك حرا في عبد وذمي شارك مسلما في ذمي وكذا شريك حربي وقاطع قصاصا أوحدا وشريك النفس ودافع الصائل في الأظهر ولو جرحه جرحين عمدا وخطأ ومات بهما أو جرح حربيا أو مرتدا ثم أسلم وجرحه ثانيا فمات لم يقتل ولو داوى جرحه بسم مذفف فلا قصاص على جارحه وإن لم يقتل غالبا فشبه عمد وإن قتل غالبا وعلم حاله فشريك جارح نفسه وقيل: شريك مخطىء ولو ضربوه بسياط فقتلوه وضرب كل واحد غير قاتل ففي القصاص عليهم أوجه أصحها يجب أن تواطؤا ومن قتل جمعا مرتبا قتل بأولهم أو معا فبالقرعة وللباقين الديات.

قلت: فلو قتله غير الأول عصى ووقع قصاص وللأول دية. والله أعلم.

فصل

جرح حربيا أو مرتدا أو عبد نفسه فأسلم وعتق ثم مات بالجرح فلا ضمان وقيل: تجب دية ولو رماهما فأسلم وعتق فلا قصاص والمذهب وجوب دية مسلم مخففة على العاقلة ولو ارتد المجروح ومات بالسراية فالنفس هدر ويجب قصاص الجرح في الأظهر يستوفيه قريبه المسلم وقيل: الإمام فان اقتضى الجرح ما لا وجب أقل الأمرين من أرشه ودية وقيل: أرشه وقيل: هدر ولو ارتد ثم أسلم فمات بالسراية فلا قصاص وقيل: إن قصرت الردة وجب وتجب الدية وفي قول نصفها ولو جرح ذميا فأسلم أو حر عبدا فعتق ومات بالسراية فلا قصاص وتجب دية مسلم وهي لسيد العبد فإن زادت على قيمته فالزيادة لورثته ولو قطع يد عبد فعتق ثم مات بسراية فللسيد الأقل من الدية الواجبة ونصف قيمته وفي قول الأقل من الدية وقيمته ولو قطع يده فعتق فجرحه ms188 آخران ومات بسرايتهم فلا قصاص على الأول إن كان حرا وتجب على الآخرين.

فصل

يشترط لقصاص الطرف والجرح ما شرط للنفس ولو وضعوا سيفا على يده وتحاملوا عليه دفعة فأبانوها قطعوا وشجاج الرأس والوجه عشر خارصة وهي ما شق الجلد قليلا ودامية تدميه وباضعة تقطع اللحم ومتلاحمة تغوص فيه وسمحاق تبلغ الجلدة والعظم وموضحة توضح العظم وهاشمة تهشمه ومنقلة تنقله ومأمومة تبلغ خريطة الدماغ ودامغة تخرقها ويجب القصاص في الموضحة فقط وقيل: وفيما قبلها سوى الخارصة ولو

أوضح في باقي البدن أو قطع بعض مارن أو أذن ولم يبنه وجب القصاص في الأصح ويجب في القطع من مفصل حتى في أصل فخذ ومنكب إن أمكن بلا إجافة وإلا فلا على الصحيح ويجب في فقء عين وقطع أذن وجفن ومارن وشفة ولسان وذكر وأنثيين وكذا أليان وشفران في الأصح ولا قصاص في كسر العظام وله قطع أقرب مفصل إلى موضع الكسر وحكومة الباقي ولو أوضحه وهشم أوضخ وأخذ خمسة أبعرة ولو أوضح ونقل أوضح وله عشرة أبعرة ولو قطعه من الكوع فليس له التقاط أصابعه فإن فعله عزر ولا غرم والأصح أن له قطع الكف بعده ولو كسر عضده وأبانه قطع من المرفق وله حكومة الباقي فلو طلب الكوع مكن في الأصح ولو أوضحه فذهب ضوؤه أوضحه فإن ذهب الضوء وإلا أذهبه بأخف ممكن كتقريب حديدة محماة من حدقته ولو لطمه لطمة تذهب ضوءه غالبا فذهب لطمه مثلها فإن لم يذهب أذهب والسمع كالبصر يجب القصاص فيه بالسراية وكذا البطش والذوق والشم في الأصح ولو قطع أصبعا فتأكل غيرها بلا قصاص في المتأكل.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 146;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب كيفية القصاص', 'ومستو فيه والاختلاف فيه لا تقطع يسار بيمين ولا شفة سفلى بعليا وعكسه ولا أنملة بأخرى ولا زائد بزائد في محل آخر ولا يضر تفاوت كبر وطول وقوة بطش في أصلي وكذا زائد في الأصح ويعتبر قدر الموضحة طولا وعرضا ولا يضر تفاوت غلظ لحم وجلد ولو أوضح كل رأسه ورأس الشاج

أصغر استوعبناه ولا ms189 نتممه من الوجه والقفا بل يؤخذ قسط الباقي من أرش الموضحة لو وزع على جميعها وإن كان رأس الشاج أكبر أخذ قدر رأس المشجوج فقط والصحيح أن الاختيار في موضعه إلى الجاني ولو أوضح ناصية وناصيته اصغر تمم من باقي الرأس ولو زاد المقتص في موضحة على حقه لزمه قصاص الزيادة فإن كان خطأ أو عفا على مال وجب أرش كامل وقيل: قسط ولو أوضحه جمع أوضح من كل واحد مثلها وقيل: قسطه ولا تقطع صحيحة بشلاء وإن رضي الجاني فلو فعل لم يقع قصاصا بل عليه ديتها فلو سرى فعليه قصاص النفس وتقطع الشلاء بالصحيحة إلا أن يقول أهل الخبرة لا ينقطع الدم ويقنع بها مستوفيها ويقطع سليم بأعسم وأعرج ولا أثر لخضرة أظفار وسوادها والصحيح قطع ذاهبة الأظفار بسليمتها دون عكسه والذكر صحة وشللا كاليد والأشل منقبض لا ينبسط أو عكسه ولا أثر للانتشار وعدمه فيقطع فحل بخصي وعنين وأنف صحيح بأخسم وأذن سميع باصم لا عين صحيحة بحدقة عمياء ولا لسان ناطق بأخرس وفي قلع السن قصاص لا في كسرها ولو قلع سن صغير لم يثغر فلا ضمان في الحال فإن جاء وقت نباتها بأن سقطت البواقي وعدن دونها وقال أهل البصر فسد المنبت وجب القصاص ولا يستوفي له في صغره ولو قلع سن مغثور فنبتت لم يسقط القصاص في الأظهر ولو نقصت يده أصبعا فقطع كاملة قطع وعليه أرش أصبع ولو قطع كامل ناقصة فإن شاء المقطوع أخذ دية أصابعه الأربع وإن شاء لقطها والأصح أن حكومة منابتهن تجب أن لقط لا أن أخذ ديتهم وأنه يجب في الحالين حكومة خمس الكف ولو قطع كفا بلا أصابع فلا قصاص إلا أن تكون كفه مثلها ولو قطع فاقد

الأصابع كاملها قطع كفه وأخذ دية الأصابع ولو شلت أصبعاه فقطع يدا كاملة فإن شاء لقط الثلاث السليمة وأخذ دية أصبعين وإن شاء قطع يده وقنع بها.

فصل

قد ملفوفا وزعم موته صدق الولي بيمينه في الأظهر ولو قطع ms190 طرفا وزعم نقصه فالمذهب تصديقه إن أنكر أصل السلامة في عضو ظاهر وإلا فلا أو يديه ورجليه فمات وزعم سراية والولي اندمالا ممكنا أو سببا فالأصح تصديق الولي وكذا لو قطع يده وزعم سببا والولي سراية ولو أوضح موضحتين ورفع الحاجز وزعمه قبل اندماله صدق إن أمكن وإلا حلف الجريح وثبت أرشان قيل وثالث.

فصل

الصحيح ثبوته لكل وارث وينتظر غائبهم وكمال صبيهم ومجنونهم ويحبس القاتل ولا يخلي بكفيل وليتفقوا على مستوف وإلا فقرعة يدخلها العاجز ويستنيب وقيل: لا يدخل ولو بدر أحدهم فقتله فالأظهر لا قصاص وللباقين قسط لدية من تركته وفي قول من المبادر وإن بادر بعد عفوه غيره لزمه القصاص وقيل: لا أن لم يعلم ويحكم قاض به ولا يستوفي قصاص إلا بإذن الإمام فإن استقل عزر ويأذن لأهل في نفس لا طرف في الأصح فإن أذن في ضرب رقبة فأصاب غيرها عمدا عزر ولم يعزله ولو قال أخطأت وأمكن عزله ولم يعزر وأجرة

الجلاد على الجاني على الصحيح ويقتص على الفور وفي الحرم والحر والبرد والمرض ويحبس الحامل في قصاص النفس أو الطرف حتى ترضعه اللبا ويستغني بغيرها أو فطام الحولين والصحيح تصديقها في حملها بغير مخيلة ومن قتل بمحدد أو خنق أو تجويع ونحوه اقتص به أو بسحر فبسيف وكذا خمر ولواط في الأصح ولجوع كتجويعه فلم يمت زيد وفي قول السيف ومن عدل إلى سيف فله ولو قطع فسرى فللوي خر رقبته وله القطع ثم الحز وإن شاء انتظر السراية ولو مات بجائفة أو كسر عضد فالحز وفي قول كفعله فإن لم يمت لم تزد الجوائف في الأظهر ولو اقتص مقطوع ثم مات بسراية فلوليه حز وله عفو بنصف دية ولو قطعت يداه فاقتص ثم مات فلوليه الحز فإن عفا فلا شيء له ولو مات جان من قطع قصاص فهدر وإن ماتا سراية معا أو سبق المجني عليه فقد اقتص وإن تأخر فله نصف الدية في الأصح ولو قال مستحق يمين أخرجها فأخرج يسارا ms191 وقصد اباجتها فهدرة وإن قال جعلتها عن اليمين وظننت أجزاءها فكذبه فالأصح لا قصاص في اليسار وتجب دية ويبقى قصاص اليمين وكذا لو قال دهشت فظننتها اليمين وقال القاطع ظننتها اليمين.

فصل

موجب العمد القود والدية بدل عند سقوطه وفي قول أحدهما مبهما وعلى القولين للولي عفو على الدية بغير رضا الجاني وعلى الأول لو أطلق العفو فالمذهب لا دية ولو عفا عن الدية لغا وله العفو بعده عليها ولو عفا على غير جنس الدية ثبت إن قبل الجاني وإلا

فلا ولا يسقط القود في الأصح وليس لمحجور فلس عفو عن مال إن أوجبنا أحدهما وإلا فإن عفا على الدية ثبتت وإن أطلق فكما سبق وإن عفا على أن لا مال فالمذهب أنه لا يجب شيء والمبذر في الدية كمفلس وقيل: كصبي ولو تصالحا عن القود على مائة بعير لغا إن أوجبنا أحدهما وإلا فالأصح الصحة ولو قال رشيد اقطعني ففعل فهدر فإن سرى أو قال اقتلني فهدر وفي قول تجب دية ولو قطع فعفا عن قوده وأرشه فإن لم يسر فلا شيء وإن سرى فلا قصاص وأما أرش العضو فإن جرى لفظ وصية كأوصيت له بأرش هذه الجناية فوصيته لقاتل أو لفظ إبراء أو إسقاط أو عفو سقط وقيل: في وصية تجب الزيادة عليه إلى تمام الدية وفي قول إن تعرض في عفوه لما يحدث منها سقطت فلو سرى إلى سرى إلى عضو آخر فاندمل ضمن دية السراية في الأصح ومن له قصاص نفس بسراية طرف لو عفا عن النفس فلا قطع له أو عن الطرف فله خر الرقبة في الأصح ولو قطعه ثم عفا عن النفس مجانا فإن سرى القطع بان بطلان العفو وإلا فيصح ولو وكل ثم عفا فاقتص الوكيل جاهلا فلا قصاص عليه والأظهر وجوب دية وأنها عليه لا على عاقلته والأصح أنه لا يرجع بها على العافي ولو وجب قصاص عليها فنكحها عليه جاز وسقط فإن فارق قيل: الوطء رجع بنصف الأرش وفي قول بنصف ms192 مهر مثل.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 146;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 147, 'كتاب الديات', 'كتاب الديات');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب الديات

في قتل الحر المسلم مائة بعير مثلثة في العمد ثلاثون حقة وثلاثون جذعة وأربعون خلفه أي حاملا مخمسة في الخطأ عشرون بنت مخاض وكذا بنات لبون وبنو لبون وحقاق وجذاع فإن قتل خطأ في حرم مكة والأشهر الحرم ذي القعدة وذي الحجة والمحرم ورجب أو محرما ذا رحم فمثلة والخطأ وإن تثلث فعلى العاقلة مؤجلة والعمد على الجاني معجلة وشبه العمد مثلثة على العاقلة مؤجلة ولا يقبل معيب ومريض إلا برضاه ويثبت حمل الخلفة بأهل خبرة والأصح اجزاؤها قبل خمس سنين ومن لزمته وله إبل فمنها وقيل: من غالب ابل بلده وإلا فغالت بلده أو قبيلة بدوي وإلا فأقرب بلاد ولا يعدل إلى نوع وقيمة إلا بتراض ولو عدمت فالقديم ألف دينار أو اثنا عشر ألف درهم والجديد قيمتها بنقد بلده وإن وجد بعض أخذ وقيمة الباقي.

والمرأة والخنثى كنصف رجل نفسا وجرحا ويهودي ونصراني ثلث مسلم ومجوسي ثلثا عشر مسلم وكذا وثني له أمان والمذهب أن من لا يبلغه الإسلام إن تمسك بدين لم يبدل فدية دينه وإلا فكمجوسي.

فصل

في موضحة الرأس والوجه لحر مسلم خمسة أبعرة وهاشمة مع إيضاح عشرة ودونه خمسة وقيل: حكومة ومنقلة خمسة عشر ومأمومة ثلث الدية ولو أوضح فهشم آخر ونقل ثالث وأم رابع فعلى كل من الثلاثة خمسة والرابع: تمام الثلث والشجاع قبل الموضحة إن عرفت نسبتها منها وجب قسط من أرشها وإلا فحكومة كجرح سائر البدن وفي جائفة ثلث دية وهي جرح ينفذ إلى جوف كبطن وصدر وثغر نحر وجبين وخاصرة ولا يختلف أرش موضحة بكبرها ولو أوضح موضعين بينهما لحم وجلد قيل: أو أحدهما فموضحتان ولو انقسمت موضحته عمدا وخطأ أو شملت رأسا ووجها فموضحتان وقيل: موضحة ولو وسع موضحته فواحدة على الصحيح أو غيره فثنتان والجائفة كموضحة في التعدد ولو نفذت في بطن وخرجت من ظهر فجائفتان في الأصح ولو أوصل جوفه سنا ناله طرفان فثنتان ولا يسقط أرش بالتحام موضحة وجائفة ms193 والمذهب أن في الأذنين دية لا حكومة وبعض بقسطه ولو أيبسهما فدية وفي قول حكومة ولو قطع يابستين فحكومة وفي قول دية وفي كل عين نصف دية ولو عين أحول وأعمش وأعور وكذا من بعينه بياض لا ينقص الضوء فإن نقص فقسط فإن لم ينضبط فحكومة وفي كل جفن ربع دية ولو لأعمى ومارن دية وفي كل من طرفيه

والحاجز ثلث وقيل: في الحاجز حكومة وفيهما دية وفي كل شفة نصف دية ولسان ولو لألكن وأرت وألثغ وطفل دية وقيل: شرط الطفل ظهور أثر نطق بتحريكه لبكاء ومص ولأخرس حكومة وكل سن لذكر حر مسلم خمسة أبعرة سواء كسر الظاهر منها دون السنخ أو قلعها به وفي سن زائدة حكومة وحركة السن إن قلت فكصحيحة وإن بطلت المنفعة فحكومة أو نقصت فالأصح كصحيحة ولو قلع سن صغير لم يثغر فلم تعدو بان فساد المنبت وجب الأرش والأظهر أنه لو مات قبل البيان فلا شيء وأنه لو قلع سن مثغور فعادت لا يسقط الأرش ولو قلعت الأسنان فبحسابه وفي قول لا يزيد على دية إن اتحد جان وجناية وكل لحى نصف دية ولا يدخل أرش الأسنان في دية اللحيين في الأصح وكل يد نصف دية إن قطع من كف فإن قطع من فوقه فحكومة أيضا وفي كل أصبع عشرة بعرة وأنملة ثلث العشرة وأنملة إبهام نصفها والرجلان كاليدين وفي حلمتيهما ديتها وحلمتيه حكومة وفي قول دية وفي أنثيين دية وكذا ذكر ولو لصغير وشيخ وعنين وحشفة كذكر وبعضها بقسطه منها وقيل: من الذكر وكذا حكم بعض مارن وحلمة وفي الإليين الدية وكذا شفراها وكذا حكم سلخ جلدان بقي حياة مستقرة وحز غير السالخ رقبته.

فرع: في العقل دية فإن زال بجرح له أرش أو حكومة وجبا وفي قول يدخل الأقل في الأكثر ولو ادعى زواله فإن لم ينتظم قوله وفعله في خلوته فله دية بلا يمين وفي السمع دية ومن أذن نصف وقيل: قسط النقص ولو أزال أذنيه وسمعه فديتان لو ms194 ادعى زواله وانزعج

للصياح في نوم وغفلة فكاذب وإلا فيحلف ويأخذ دية وإن نقص فقسطه إن عرف وإلا فحكومة باجتهاد قاض وقيل: يعتبر سمع قرنه في صحته ويضبط التفاوت وإن نقص من أذن سدت وضبط منتهى سماع الأخرى ثم عكس ووجب قسط التفاوت وفي ضوء كل عين نصف دية فلو فقأها لم يزد وإن ادعى زواله سئل أهل الخبرة أو يمتحن بتقريب عقرب أو حديدة من عينه بغتة ونظر هل ينزعج وإن نقص فكالسمع وفي الشم دية على الصحيح وفي الكلام دية وفي بعض الحروف قسطه والموزع عليها ثمانية وعشرون حرفا في لغة العرب وقيل: لا يوزع على الشفهية والحلقية ولو عجز عن بعضها خلقة أو بآفة سماوية فدية وقيل: قسط أو بجناية فالمذهب لا تكمل دية ولو قطع نصف لسانه فذهب ربع كلامه أو عكس فنصف دية وفي الصوت دية فإن بطل معه حركة لسان فعجز عن التقطيع والترديد فديتان وقيل: دية وفي الذوق دية ويدرك به حلاوة وحموضة ومرارة وملوحة وعذوبة وتزع عليهن فإن نقص فحكومة وتجب الدية وفي المضغ وقوة أمناء بكسر صلب وقوة حبل وذهاب جماع وفي إفضائها من الزوج وغيره دية وهو رفع ما بين مدخل ذكر ودبر وقيل: ذكر وبول فإن لم يمكن الوطء إلا بإفضاء فليس للزوج ومن لا يستحق افتضاضها فأزال البكارة بغير ذكر فأرشها أو بذكر لشبهة أو مكرهة فمهر مثل ثيبا وأرش البكارة وقيل: مهر بكر ومستحقه لا شيء عليه وقيل: إن أزال بغير ذكر فأرش وفي البطش دية وكذا المشي ونقصهما حكومة ولو كسر صلبه فذهب مشيه وجماعة أو ومنيه فديتان وقيل: دية.

فرع: أزال أطرافا ولطائف تقتضي ديات فمات سراية فدية وكذا لو حزه الجاني قبل

اندماله في الأصح فإن حز عمدا والجنايات خطأ أو عكسه فلا تداخل في الأصح ولو حز غيره تعددت.

فصل

تجب الحكومة فيما لا مقدر فيه وهي جزء نسبته إلى دية النفس وقيل: إلى عضو الجناية نسبة نقصها من قيمته لو كان رقيقا ms195 بصفاته فإن كانت بطرف له مقدر اشترط أن لا تبلغ مقدره فإن بلغته نقص القاضي شيأ باجتهاده أولا تقدير فيه كفخذ فإن لا تبلغ دية نفس ويقوم بعد اندماله فإن لم يبق نقص اعتبر أقرب نقص إلى الاندمال وقيل: يقدره قاض باجتهاده وقيل: لا غرم والجرح المقدر كموضحة يتبعه الشين حواليه وما لا يتقدر يفرد بحكومة في الأصح ونفس الرقيق قيمته وفي غيرها ما نقص من قيمته إن لم يتقدر في الحر وإلا فنسبته من قيمته وفي قول ما نقص ولو ذكره وأنثياه ففي الأظهر قيمتان والثاني ما نقص فإن لم ينقص فلا شيء.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 147;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب موجبات الدية والعاقلة والكفارة', 'صاح على صبي لا يميز على طرف سطح فوقع بذلك فمات فدية مغلظة على العاقلة وفي قول قصاص ولو كان بأرض أو صاح على بالغ بطرف سطح فلا دية في الأصح وشهر سلاح كصياح ومراهق متيقظ كبالغ ولو صاح على صيد فاضطرب صبي وسقط فدية مخففة على العاقلة ولو طلب سلطان من ذكرت بسوء فأجهضت ضمن الجنين ولو وضع صبيا في مسبعة فأكله سبع فلا ضمان وقيل: إن لم يمكنه انتقال ضمن ولو تبع بسيف هاربا منه فرمى

نفسه بماء أو نار أو من سطح فلا ضمان فلو وقع جاهلا لعمى أو ظلمة ضمن وكذا لو انخسف به سقف في هربه في الأصح ولو سلم صبي إلى سباح ليعلمه فغرق وجبت ديته ويضمن بحفر بئر عدوان لا في ملكه وموات بدهليزه بئرا ودعا رجلا فسقط فالأظهر ضمانه أو بملك غيره أو مشترك بلا إذن فمضمون أو بطريق ضيق يضر المارة فكذا أو لا يضر وأذن الإمام فلا ضمان وإلا فإن حفر لمصلحته فالضمان أو مصلحة عامة فلا في الأظهر ومسجد كطريق وما تولد من جناح إلى شارع فمضمون ويحل إخراج الميازيب إلى شارع والتالف بها مضمون في الجديد فإن كان بعضه في الجدار فسقط الخارج فكل الضمان وإن سقط كله فنصفه في الأصح.

وإن بنى جداره مائلا إلى شارع فكجناح أو ms196 مستويا فمال وسقط فلا ضمان وقيل: إن أمكنه هدمه أو إصلاحه ضمن ولو سقط بالطريق فعثر به شخص أو تلف مال فلا ضمان في الأصح ولو طرح فمات وقشور بطيخ بطريق فمضمون على الصحيح ولو تعاقب سببا هلاك فعلى الأول بان حفر ووضع آخر حجرا عدوانا فعثر به ووقع بها فعلى الواضع فإن لم يتعد الواضع فالمنقول تضمين الحافر ولو وضع حجرا وآخران حجرا فعثر بهما فالضمان أثلاث وقيل: نصفان ولو وضع حجرا فعثر به رجل فدحرجه فعثر به آخر ضمنه المدحرج ولو عثر بقاعد أو نائم أو واقف بالطريق ومات أو أحدهما فلا ضمان إن اتسع الطريق وإلا فالمذهب إهدار قاعدة ونائم لا عاثر بهما وضمان واقف لا عاثر به.

فصل

اصطدما بلا قصد فعلى عاقلة كل نصف دية مخففة وإن قصدا فنصفها مغلظة أو أحدهما فلكل حكمه والصحيح إن على كل كفارتين وإن ماتا مع مركوبيهما فكذلك وفي تركة كل نصف قيمة دابة الآخر وصبيان أو مجنونان ككاملين وقيل: إن أركبهما الولي تعلق به الضمان ولو أركبهما أجنبي ضمنهما ودابتيهما أو حاملان وأسقطتا فالدية كما سبق وعلى كل أربع كفارات على الصحيح وعلى عاقلة كل نصف غرتي جنينيهما أو عبدان فهدر أو سفينتان فكدابتين والملاحان كراكبين إن كانتا لهما فإن كان فيهما مال أجنبي لزم كلا نصف ضمانه وإن كانتا لأجنبي لزم كلا نصف قيمتهما ولو أشرفت سفينة على غرق جاز طرح متاعها ويجب لرجاء نجاة الراكب فإن طرح مال غيره بلا إذن ضمن وإلا فلا ولو قال ألق متاعك وعلي ضمانه أو على أني ضامن ضمن ولو اقتصر على ألق فلا على المذهب وإنما يضمن ملتمس لخوف غرق ولم يختص نفع إلقاء بالملقى ولو عاد حجر منجنيق فقتل أحد رماته هدر قسطه وعلى عاقله الباقين الباقي أو غيرهم ولم يقصدوه فخطأ أو قصدوه فعمد في الأصح إن غلبت الإصابة.

فصل

دية الخطأ أو شبه العمد تلزم العاقلة وهم عصبته إلا الأصل والفرع وقيل: يعقل ابن هو ابن ms197 ابن عمها ويقدم الأقرب فإن بقي شيء فمن يليه ومدل بأبوين والقديم التسوية ثم معتق

ثم عصبته ثم معتقه ثم عصبته وإلا فمعتق أبي الجاني ثم عصبته ثم معتق معتق الأب وعصبته وكذا أبدا وعتيقها يعقله عاقلتها ومعتقون كمعتق وكل شخص من عصبة كل معتق يحمل ما كان يحمله ذلك المعتق ولا يعقل عتيق في الأظهر فإن فقد العاقل أو لم يف عقل بيت المال عن المسلم فإن فقد فكله على الجاني في الأظهر وتؤجل على العاقلة دية نفس كاملة ثلاث سنين في كل سنة ثلث وذمي سنة وقيل: ثلاثا وامرأة سنتين في الأولى ثلث وقيل: ثلاثا وتحمل العاقلة العبد في الأظهر ففي كل سنة قدر ثلث دية وقيل: ثلاثا ولو قتل رجلين ففي ثلاث وقيل: ست والأطراف في كل سنة قدر ثلث دية وقيل: كلها في سنة وأجل النفس من الزهوق وغيرها من الجناية ومن مات في بعض سنة سقط ولا يعقل فقير ورقيق وصبي ومجنون ومسلم عن كافر وعكسه ويعقل يهودي عن نصراني وعكسه في الأظهر وعلى الغني نصف دينار والمتوسط ربع كل سنة من الثلاث وقيل: هو واجب الثلاث ويعتبر أن آخر الحول ومن أعسر فيه سقط.

فصل

مال جناية العبد يتعلق برقبته ولسيده بيعه لها وفداؤه بالأقل من قيمة وأرشها وفي القديم بأرشها ولا يتعلق بذمته مع رقبته في الأظهر ولو فداه ثم جنى سلمه للبيع أو فداه ولو جنى ثانيا قبل الفداء باعه فيهما أو فداه بأقل من قيمته والأرشين وفي القديم بالأرشين ولو أعتقه أو باعه وصححناهما أو قتله فداه بالأقل وقيل: القولان ولو هرب أو مات بريء سيده إلا

إذا طلب فمنعه ولو اختار الفداء فالأصح أن له الرجوع وتسليمه ويفدى أم ولده بالأقل وقيل: القولان وجناياتها كواحدة في الأظهر.

فصل

في الجنين غرة إن انفصل ميتا بجناية في حياتها أو موتها وكذا إن ظهر بلا انفصال في الأصح وإلا فلا أوحيا وبقي زمانا بلا ألم ثم مات فلا ضمان وإن مات حين ms198 خرج أو دام ألمه ومات فدية نفس ولو ألقت جنينين فغرتان أو يدا فغرة وكذا لحم قال القوا بل فيه صورة خفية قيل: أو قلن لو بقي لتصور وهي عبد أو أمة مميز سليم من عيب مبيع والأصح قبول كبير لم يعجز بهرم ويشترط بلوغها نصف عشر دية فإن فقدت فخمسة أبعرة وقيل: لا تشترط فللفقد قيمتها وهي لورثة الجنين وعلى عاقلة الجاني وقيل: إن تعمد فعليه والجنين اليهودي أو النصراني قيل: كمسلم وقيل: هدر والأصح غرة كثلث غرة مسلم والرقيق عشر قيمة أمه يوم الجناية وقبل الإجهاض لسيدها فإن كانت مقطوعة والجنين سليم قومت سليمة في الأصح وتحمله العاقلة في الأظهر.

فصل

يجب بالقتل كفارة وإن كان القاتل صبيا ومجنونا وعبدا وذميا وعامدا ومخطئا ومتسببا بقتل مسلم ولو بدار حرب وذمي وجنين وعبد نفسه ونفسه وفي نفسه وجه لا امرأة وصبي حربيين وباغ وصائل ومقتص منه وعلى كل من الشركاء كفارة في الأصح وهي كظهار لكن لا إطعام في الأظهر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 147;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 148, 'كتاب دعوى الدم والقسامة', 'كتاب دعوى الدم والقسامة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'يشترط أن يفصل ما يدعيه من عمد وخطأ وانفراد وشركة فإن أطلق استفصله القاضي وقيل: يعرض عنه وأن يعين المدعي عليه فلو قال قتله أحدهم لا يحلفهم القاضي في الأصح ويجريان في دعوى غصب وسرقة وإتلاف وإنما تسمع من مكلف ملتزم على مثله ولو ادعى انفراده بالتقل ثم ادعى على آخر لم تسمع الثانية أو عمدا ووصفه بغيره لم يبطل أصل الدعوى في الأظهر وتثبت القسامة في القتل بمحل لوث وهو قرينة لصدق المدعي بأن وجده قتيل في محلة أو قرية صغيرة لأعدائه أو تفرق عنه جمع ولو تقابل صفان لقتال وانكشفوا عن قتيل فإن التحم قتال فلوث في حق النصف الآخر وإلا ففي حق صفه وشهادة العدل لوث وكذا عبيد أو نساء وقيل: يشترط تفرقهم وقول فسقة وصبيان وكفار لوث في الأصح ولو ظهر لوث فقال أحد ابنيه قتله فلان وكذبه الآخر بطل اللوث وفي قول لا وقيل: لا يبطل بتكذيب فاسق ولو قال ms199 أحدهما قتله زيد ومجهول وقال الآخر عمرو ومجهول حلف كل على من عينه وله ربع الدية ولو أنكر المدعي عليه اللوث في حقه فقال لم أكن مع المتفرقين عنه صدق بيمينه ولو ظهر لوث بأصل قتل دون عمد وخطأ فلا قسامة في

الأصح ولا يقسم في طرف وإتلاف مال إلا في عبد في الأظهر وهي أن يحلف المدعي على قتل ادعاه خمسين يمينا ولا يشترط موالاتها على المذهب ولو تخللها جنون أو إغماء بني ولو مات لم يبن وارثه على الصحيح ولو كان للقتيل ورثة وزعت بحسب الإرث وجبر الكسر وفي قول يحلف كل خمسين ولو نكل أحدهما حلف الآخر خمسين ولو غاب حلف الآخر خمسين وأخذ حصته وإلا صبر للغائب والمذهب أن يمين المدعى عليه بلا لوث والمردودة على المدعي أو على المدعى عليه مع لوث واليمين مع شاهد خمسون ويجب بالقسامة في قتل الخطأ أو شبه العمد دية على العاقلة وفي العمد على المقسم عليه وفي القديم قصاص ولو ادعى عمدا بلوث على ثلاثة حضر أحدهم أقسم عليه خمسين وأخذ ثلث الدية فإن حضر آخر أقسم عليه خمسين وفي قول خمسا وعشرين إن لم يكن ذكره في الأيمان وإلا فينبغي الاكتفاء بها بناء على صحة القسامة في غيبة المدعى عليه وهو الأصح ومن استحق بدل الدم أقسم ولو مكاتب يقتل عبده ومن ارتد فالأفضل تأخير أقسامه ليسلم فإن أقسم في الردة صح على المذهب ومن لا وارث له لا قسامة فيه.

فصل

إنما يثبت موجب القصاص بإقرار أو عدلين والمال بذلك برجل وامرأتين أو ويمين ولو عفا عن القصاص ليقبل للمال رجل وامرأتان لم يقبل في الأصح ولو شهد هو وهما بهاشمة قبلها إيضاح لم يجب أرشها على المذهب وليصرح الشاهد بالمدعى فلو قال ضربه بسيف فجرحه فمات لم يثبت حتى يقول فمات منه أو فقتله ولو قال ضرب رأسه فأدماه أو فأسال دمه ثبتت دامية ويشترط لموضحة ضربه فأوضح عظم رأسه وقيل: يكفي فأوضح رأسه

ويجب بيان ms200 محلها وقدرها ليمكن قصاص ويثبت القتل بالسحر بإقرار لا ببينة ولو شهد لمورثه بجرح قبل الاندمال لم يقبل وبعده يقبل وكذا بمال في مرض موته في الأصح ولا تقبل شهادة العاقلة بفسق شهود قتل يحملونه ولو شهد اثنان على اثنين بقتله فشهدا على الأولين بقتله فإن صدق الولي الأولين حكم بهما أو الآخرين أو الجميع أو كذب الجمع بطلتا ولو أقر بعض الورثة بعفو بعض سقط القصاص ولو اختلف شاهدن في زمان أو مكان أو آلة أو هيئة لغت وقيل: لوث.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 148;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 149, 'كتاب البغاة', 'كتاب البغاة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'هم مخالفو الإمام بخروج عليه وترك الانقياد أو منع حق توجه عليهم بشرط شوكة لهم وتأويل ومطاع فيهم قيل: وإمام منصوب ولو أظهر قوم رأى الخوارج كترك الجماعات وتكفير ذي كبيرة ولم يقاتلوا تركوا وإلا فقطاع طريق وتقبل شهادة البغاة وقضاء قاضيهم فيما يقبل قضاء قاضينا إلا أن يستحل دماءنا وينفذ كتابه بالحكم ويحكم بكتابه بسماع البينة في الأصح ولو أقاموا حدا وأخذوا زكاة وجزية وخراجا وفرقوا سهم المرتزقة على جندهم صح وفي الأخير وجه وما أتلفه باغ على عادل وعكسه إن لم يكن في قتال ضمن وإلا فلا وفي قول يضمن الباغي والمتأول بلا شوكة يضمن وعكسه كباغ ولا يقاتل البغاة حتى يبعث إليهم أمينا فطينا ناصحا يسألهم ما ينقمون فإن ذكروا مظلمة أو شبهة أزالها فإن أصروا نصحهم ثم آذنهم بالقتال فإن استمهلوا اجتهد وفعل ما رآه صوابا ولا يقتل مدبرهم ولا مثخنهم وأسيرهم ولا يطلق وإن كان صبيا وامرأة حتى تنقضي الحرب ويتفرق جمعهم إلا أن يطيع

باختياره ويرد سلاحهم وخيلهم إليهم إذا انقضت الحرب وأمنت غائلتهم ولا يستعمل في قتال إلا لضرورة ولا يقاتلون بعظيم كنار ومنجنيق إلا لضرورة بأن قاتلوا به أو أحاطوا بنا ولا يستعان عليهم بكافر ولا بمن يرى قتلهم مدبرين ولو استعانوا علينا بأهل حرب وأمنوهم لم ينفذ أمانهم علينا ونفذ عليهم في الأصح ولو أعانهم أهل الذمة عالمين بتحريم قتالنا انتقض عهدهم أو مكريهن فلا وكذا إن قالوا ms201 ظننا جوازه أو أنهم محقون على المذهب ويقاتلون كبغاة.

فصل

شرط الإمام كونه مسلما مكلفا حرا ذكرا قرشيا مجتهدا شجاعا ذا رأي وسمع وبصر ونطق وتنعقد الإمامة بالبيعة والأصح بيعة أهل الحل والعقد من العلماء والرؤساء ووجوه الناس الذين يتيسر اجتماعهم وشرطهم صفة الشهود وباستخلاف الإمام فلو جعل الأمر شورى بين جمع فكاستخلاف فيرتضون أحدهم وباستيلاء جامع الشروط وكذا فاسق وجاهل في الأصح.

قلت: لو ادعى دفع زكاة إلى البغاة صدق بيمينه أو جزية فلا على الصحيح وكذا خراج في الأصح ويصدق في حد إلا أن يثبت ببينة ولا أثر له في البدن. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 149;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 150, 'كتاب الردة', 'كتاب الردة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'هي قطع الإسلام بنية أو قول كفر أو فعل سواء قاله استهزاء أو عنادا أو اعتقادا فمن نفى الصانع أو الرسل أو كذب رسولا أو حلل محرما بالإجماع كالزنا أو عكسه أو نفى وجوب مجمع عليه أو عكسه أو عزم على الكفر غدا أو تردد فيه كفر والفعل المكفر ما تعمده استهزاء صريحا بالدين أو جحودا له كإلقاء مصحف بقاذورة وسجود لصنم أو شمس ولا تصح ردة صبي ومجنون ومكره ولو ارتد فجن لم يقتل في جنونه والمذهب صحة ردة السكران وإسلامه وتقبل الشهادة بالردة مطلقا وقيل: يجب التفصيل فعلى الأول لو شهدوا بردة فأنكر حكم بالشهادة فلو قال كنت مكرها واقتضته قرينة كأسر كفار صدق بيمينه وإلا فلا ولو قالا لفظ لفظ كفر فادعى إكراها صدق مطلقا ولو مات معروف بالإسلام عن ابنين مسلمين فقال احدهما ارتد فمات كافرا فإن بين سبب كفره لم يرثه ونصيبه فيء وكذا إن أطلق في الأظهر وتجب استتابة المرتد والمرتدة وفي قول تستحب وهي في الحال وفي قول ثلاثة أيام فإن أصرا قتلا وإن أسلم صح وترك وقيل: لا يقبل إسلامه إن ارتد إلى كفر خفي كزنادقة وباطنية وولد المرتد إن انعقد قبلها أو بعدها وأحد أبويه مسلم فمسلم أو مرتدان فمسلم وفي قول مرتد وفي قول كافر أصلى.

قلت: الأظهر مرتد ونقل العراقيون الاتفاق على ms202 كفره. والله أعلم.

وفي زوال ملكه عن ماله بها أقوال أظهرها إن هلك مرتدا بان زواله بها وإن أسلم بان أنه لم يزل وعلى الأقوال يقضي منه دين لزمه قبلها وينفق عليه منه والأصح يلزمه غرم إتلافه فيها ونفقة زوجات وقف نكاحهن وقريب وإذا وقفنا ملكه فتصرفه إن احتمل الوقف كعتق وتدبير ووصية موقوف إن أسلم نفذ وإلا فلا وبيعه وهبته ورهنه وكتابته باطلة في القديم موقوفة وعلى الأقوال يجعل ماله مع عدل وأمته عند امرأة ثقة ويؤجر ماله ويؤدي مكاتبه النجوم إلى القاضي.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 150;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 151, 'كتاب الزنا', 'كتاب الزنا');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'إيلاج الذكر بفرج محرم لعينه خال عن الشبهة مشتهى يوجب الحد ودبر ذكر أو أنثى كقبل على المذهب ولا حد بمفاخذة ووطء زوجته وأمته في حيض وصوم وإحرام وكذا أمته المزوجة والمعتدة وكذا مملوكته المحرم ومكره في الأظهر وكذا كل جهة أباح بها عالم كنكاح بلا شهود على الصحيح ولا بوطء ميتة في الأصح ولا بهيمة في الأظهر ويحد في مستأجرة ومبيحة ومحرم وإن كان تزوجها وشرطه التكليف إلا السكران وعلم تحريمه وحد المحصن الرجم وهو مكلف حر ولو ذمي غيب حشفته بقبل في نكاح صحيح لا فاسد في الأظهر والأصح اشتراط التغيب حال حريته وتكليفه وأن الكامل الزاني بناقص محصن والبكر الحر مائة جلدة وتغريب عام إلى مسافة قصر فما فوقها وإذا عين الإمام جهة فليس له طلب غيرها في الأصح ويغرب غريب في بلد الزنا إلى غير بلده فإن عاد إلى بلده منع في الأصح ولا تغرب المرأة وحدها في الأصح بل مع زوج أو محرم ولو بأجرة فإن امتنع باجرة

لم يجبر في الأصح والعبد خمسون ويغرب نصف سنة وفي قول سنة وقول لا يغرب ويثبت ببينة أو إقرار مرة ولو أقر ثم رجع سقط ولو قال لا تحدوني أو هرب فلا في الأصح ولو شهد أربعة بزناها وأربع أنها عذراء لم تحد هي ولا قاذفها ولو عين شاهد زانية لزناه والباقون غيرها لم يثبت ويستوفيه الإمام ونائبه من حر ومبعض ms203 ويستحب حضور الإمام وشهوده ويحد الرقيق سيده أو الإمام فإن تنازعا فالأصح الإمام وأن السيد يغربه وأن المكاتب كحر وأن الفاسق والكافر والمكاتب يحدون عبيدهم وأن السيد يعزر ويسمع البينة بالعقوبة والرجم بمدر وحجارة معتدلة ولا يحفر للرجل والأصح استحبابه للمرأة إن ثبت ببينة ولا يؤخر لمرض وحر وبرد مفرطين وقيل: يؤخر إن ثبت بإقرار ويؤخر الجلد للمرض فإن لم يرج برؤه جلد لا بسوط بل بعثكال عليه مائة غصن فإن كان خمسون ضرب به مرتين وتمسه الأغصان أو ينكبس بعضها على بعض ليناله بعض الألم فإن برأ أجزأه ولا جلد في حر وبرد مفرطين وإذا جلد الإمام في مرض أو حر أو برد فلا ضمان على النص فيقتضي أن التأخير مستحب.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 151;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 152, 'كتاب حد القذف', 'كتاب حد القذف');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'شرط حد القاذف التكليف إلا السكران والاختيار ويعزر المميز ولا يحد بقذف الولد وإن سفل فالحر ثمانون والرقيق أربعون والمقذوف الإحصان وسبق في اللعان ولو شهد دون أربعة بزنا حدوا في الأظهر وكذا أربعة نسوة وعبيد وكفرة على المذهب ولو شهد واحد على إقراره فلا ولو تقاذفا لم يتقاصا ولو استقل المقذوف بالاستيفاء لم يقع الموقع.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 152;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 153, 'كتاب قطع السرقة', 'كتاب قطع السرقة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب قطع السرقة

يشترط لوجوبه في المسروق أمور كونه ربع دينار خالصا أو قيمته ولو سرق ربعا سبيكة يساوي ربعا مضروبا فلا قطع في الأصح ولو سرق دنانير ظنها فلوسا لا تساوي ربعا قطع وكذا ثوب رث في جيبه تمام ربع جهله في الأصح ولو أخرج نصابا من حرز مرتين فإن تخلل علم المالك وإعادة الحرز فالإخراج الثاني سرقة أخرى وإلا قطع في الأصح ولو نقب وعاء حنطة ونحوها فانصب نصاب قطع في الأصح ولو اشتركا في إخراج نصابين قطعا وإلا فلا ولو سرق خمرا وخنزيرا وكلبا وجلد ميتة بلا دبغ فلا قطع فإن بلغ إناء الخمر نصابا قطع على الصحيح ولا قطع في طنبور ونحوه وقيل: إن بلغ مكسره نصابا قطع

قلت: الثاني: أصح والله أعلم الثاني كونه ملكا لغيره لو ملكه بإرث وغيره ms204 قبل إخراجه من الحرز أو نقص فيه عن نصاب بأكل وغيره لم يقطع وكذا إن ادعى ملكه على النص ولو سرقا وادعاه أحدهما له أولهما فكذبه الآخر لم يقطع المدعي وقطع الآخر في الأصح وإن سرق من حرز شريكه مشتركا فلا قطع في الأظهر وإن قل نصيبه الثالث: عدم شبهته فيه

فلا قطع بسرقة مال أصل وفرع وسيد والأظهر قطع أحد زوجين بالآخر ومن سرق مال بيت مال إن فرز لطائفة ليس هو منهم قطع وإلا فالأصح أنه إن كان له حق في المسروق كمال مصالح وكصدقة وهو فقير فلا وإلا قطع والمذهب قطعه بباب مسجد وجزعه لا حصره وقناديل تسرج والأصح قطعه بموقوف وأم ولد سرقها نائمة أو مجنونة الرابع: كونه محرزا بملاحظة أو حصانة موضعه فإن كان بصحراء أو مسجد اشترط دوام لحاظ وإن كان بحصن كفى لحاظ معتاد وإصطبل حرز دواب لا آنية وثياب وعرصة دار وصفتها حرز آنية وثياب بذلة لا حلى ونقد ولو نام بصحراء أو مسجد على ثوب أو توسد متاعا فمحرز فلو انقلب فزال عنه فلا وثوب ومتاع وضعه بقربه بصحراء إن لاحظه محرز وإلا فلا وشرط الملاحظة قدرته على منع سارق بقوة أو استغاثه ودار منفصلة عن العمارة إن كان بها قوي يقظان حرز مع فتح الباب وإغلاقه وإلا فلا ومتصلة حرز مع إغلاقه وحافظ ولو نائما ومع فتحه ونومه غير حرز ليلا وكذا نهارا في الأصح وكذا يقظان تغفله سارق في الأصح فإن خلت فالمذهب أنها حرز نهارا زمن أمن وإغلاقه فإن فقد شرط فلا وخيمة بصحراء إن لم تشد أطنابها وترخى أذيالها فهي وما فيها كمتاع بصحراء وإلا فحرز بشرط حافظ قوي فيها ولو نائما وماشية بأبنية مغلفة متصلة بالعمارة محرزة بلا حافظ وببرية يشترط حافظ ولو نائما وإبل بصحراء محرزة بحافظ يراها ومقطورة يشترط التفات قائدها إليها كل ساعة بحيث يراها وأن لا يزيد قطار على تسعة وغير مقطورة ليست محرزة في الأصح وكفن في قبر ببيت محرز وكذا ms205 بمقبرة بطرف العمارة في الأصح لا بمضيعه في الأصح.

فصل

يقطع مؤجر الحرز وكذا معيره في الأصح ولو غصب حرزا لم يقطع مالكه وكذا أجنبي في الأصح ولو غصب مالا وأحرزه بحرزه فسرق المالك منه مال الغصب أو أجنبي المغصوب فلا قطع في الأصح ولا يقطع مختلس ومنتهب وجاحد وديعة ولو نقب وعاد في ليلة أخرى فسرق قطع في الأصح.

قلت: هذا إذا لم يعلم المالك النقب ولم يظهر للطارقين وإلا فلا يقطع قطعا والله أعلم ولو نقب وأخرج غيره فلا قطع ولو تعاونا في النقب وانفرد أحدهما بالإخراج أو وضعه ناقب بقرب النقب فأخرجه آخر قطع المخرج ولو وضعه بوسط نقبه فأخذه خارج وهو يساوي نصابين لم يقطعا في الأظهر ولو رماه إلى خارج حرز أو وضعه بماء جار أو ظهر دابة سائرة أو عرضه لريح هابة فأخرجته قطع أو واقفة فمشت بوضعه فلا في الأصح ولا يضمن حر بيد ولا يقطع سارقه ولو سرق صغيرا بقلادة فكذا في الأصح ولو نام عبد على بعير فقاده وأخرجه عن القافلة قطع أو حر فلا في الأصح ولو نقل من بيت مغلق إلى صحن دار بابها مفتوح قطع وإلا فلا وقيل: إن كانا مغلقين قطع وبيت خان وصحنه كبيت ودار في الأصح.

فصل

لا يقطع صبي ومجنون ومكره ويقطع مسلم وذمي بمال مسلم وذمي وفي معاهد أقوال أحسنها إن شرط قطعه بسرقة قطع وإلا فلا.

قلت: الأظهر عند الجمهور لا قطع والله أعلم وتثبت السرقة بيمين المدعي المردودة في الأصح وبإقرار السارق والمذهب قبول رجوعه ومن أقر بعقوبة لله تعالى فالصحيح أن

للقاضي أن يعرض له بالرجوع ولا يقول ارجع ولو أقر بلا دعوى أنه سرق مال زيد الغائب لم يقطع في الحال بل ينتظر حضوره في الأصح أو أنه أكره أمة غائب على زنا حد في الحال في الأصح وتثبت بشهادة رجلين فلو شهد رجل وامرأتان ثبت المال ولا قطع ويشترط ذكر الشاهد شروط السرقة ولو اختلف شاهدان كقوله سرق ms206 بكرة والآخر عشية فباطلة وعلى السارق رد ما سرق فإن تلف ضمنه وتقطع يمينه فإن سرق ثانيا بعد قطعها فرجله اليسرى وثالثا يده اليسرى ورابعا رجله اليمنى وبعد ذلك يعزر ويغمس محل قطعه بزيت أو دهن مغلي قيل: هو تتمة للحد والأصح أنه حق للمقطوع فمؤنته عليه وللإمام إهماله وتقطع اليد من كوع والرجل من مفصل القدم ومن سرق مرارا بلا قطع كفت يمينه وإن نقصت أربع أصابع.

قلت: وكذا لو ذهبت الخمس في الأصح والله أعلم وتقطع يد زائدة أصبعا في الأصح ولو سرق فسقطت يمينه بآفة سقط القطع أو يساره فلا على المذهب.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 153;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب قاطع الطريق', 'هو مسلم مكلف له شوكة لا مختلسون يتعرضون لآخر قافلة يعتمدون الهرب والذين يغلبون شرذمة بقوتهم قطاع في حقهم لا لقافلة عظيمة وحيث يلحق غوث ليسوا بقطاع وفقد الغوث يكون للبعد أو لضعف وقد يغلبون والحالة هذه في بلد فهم قطاع ولو علم الإمام قوما يخيفون الطريق ولم يأخذوا مالا ولا نفسا عزرهم بحبس وغيره وإذا أخذ القاطع نصاب السرقة قطع يده اليمنى ورجله اليسرى فإن عاد فيسراه ويمناه وإن قتل قتل حتما وإن

قتل وأخذ مالا قتل ثم صلب ثلاثا ثم ينزل وقيل: يبقى حتى يسيل صديده وفي قول يصلب قليلا ثم ينزل فيقتل ومن أعانهم وكثر جمعهم عزر بحبس وتغريب وغيرهما وقيل: يتعين التغريب إلى حيث يراه وقتل القاطع يغلب فيه معنى القصاص وفي قول الحد فعلى الأول لا يقتل بولد وذمي ولو مات فدية ولو قتل جمعا قتل بواحد وللباقين ديات ولو عفا وليه بمال وجب وسقط القصاص ويقتل حدا ولو قتل بمثقل أو بقطع عوض فعل به مثله ولو جرح فاندمل لم يتحتم قصاص في الأظهر وتسقط عقوبات تخص القاطع بتوبته قبل القدرة عليه لا بعدها على المذهب ولا تسقط سائر الحدود بها في الأظهر.

فصل

من لزمه قصاص وقطع وحد قذف وطالبوه جلد ثم قطع ثم قتل ويبادر بقتله بعد قطعه لا قطعه بعد جلد إن غاب ms207 مستحق قتله وكذا إن حضر وقالوا عجلوا القطع في الأصح وإذا أخر مستحق النفس حقه جلد فإذا برأ قطع ولو أخر مستحق طرف جلد وعلى مستحق النفس الصبر حتى يستوفي الطرف فإن بادر فقتل فلمستحق الطرف دية ولو أخر مستحق الجلد حقه فالقياس صبر الآخرين ولو اجتمع حدود لله تعالى قدم الأخف فالأخف أو عقوبات لله تعالى والآدميين قدم حد قاذف على زنا تقديمه على حد شرب وأن القصاص قتلا وقطعا يقدم على الزنا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 153;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 154, 'كتاب الأشربة', 'كتاب الأشربة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'كل شراب أسكر كثيرة حرم قليله وحد شاربه إلا صبيا ومجنونا وحربيا وذميا ومؤجرا وكذا مكره على شربه على المذهب ومن جهل كونها خمرا لم يحد ولو قرب إسلامه فقال جهلت تحريمها لمن يحد أو جهلت الحد حد ويحد بدردي خمر لا بخبز عجن دقيقه بها ومعجون هي فيه.

وكذا حقنة وسعوط في الأصح ومن غص بلقمة أساغها بخمر إن لم يجد غيرها والأصح تحريمها لدواء وعطش وحد الحر أربعون ورقيق عشرون بسوط أو أيد أو نعال أو أطراف ثياب وقيل: يتعين سوط ولو رأى الإمام بلوغه ثمانين جاز في الأصح والزيادة تعزيرات وقيل: حد ويحد بإقراره أو شهادة رجلين لا بريح خمر وسكر وقيء ويكفي في إقرار وشهادة شرب خمرا وقيل: يشترط وهو عالم به مختار ولا يحد حال سكره وسوط الحدود بين قضيب وعصا ورطب ويابس ويفرقه على الأعضاء إلا المقاتل والوجه قيل: والرأس ولا تشديده ولا تجرد ثيابه ويوالي الضرب بحيث يحصل زجر وتنكيل.

فصل

يعزر في كل معصية لا حد لها ولا كفارة بحبس أو ضرب أو صفع أو توبيخ ويجتهد

الإمام في جنسه وقدره وقيل: إن تعلق بآدمي لم يكف توبيخ فإن جلد وجب أن ينقص في عبد عن عشرين جلدة وحر عن أربعين وقيل: عشرين ويستوي في هذا جميع المعاصي في الأصح ولو عفا مستحق حد فلا تعزير للإمام في الأصح أو تعزير فله في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 154;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 155, 'كتاب الصيال وضمان الولاة', 'كتاب الصيال وضمان الولاة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'له دفع كل صائل على نفس أو طرف ms208 أو بضع أو مال فإن قتله فلا ضمان ولا يجب الدفع عن مال ويجب عن بضع وكذا نفس قصدها كافر أو بهيمة لا مسلم في الأظهر والدفع عن غيره كهو عن نفسه وقيل: يجب قطعا ولو سقطت جرة ولم تندفع عنه إلا بكسرها ضمنها في الأصح ويدفع الصائل بالأخف فإن أمكن بكلام واستغاثة حرم الضرب أو بضرب بيد حرم سوط أو بسوط حرم عصا أو بقطع عضو حرم قتل فإن أمكن هرب فالمذهب وجوبه وتحريم قتال ولو عضت يده خلصها بالأسهل من فك لحييه وضرب شدقيه فإن عجز فسلها فندرت أسنانه فهدر ومن نظر إلى حرمه في داره من كوة أو ثقب عمدا فرماه بخفيف كحصاة فأعماه أو أصاب قرب عينه فجرحه فمات فهدر بشرط عدم محرم وزوجة للناظر قيل: واستتار الحرم قيل: وإنذار قبل رميه ولو عزر ولي ووال وزوج ومعلم فمضمون ولو حد مقدرا فلا ضمان ولو ضرب شارب بنعال وثياب فلا ضمان على الصحيح وكذا أربعون سوطا على المشهور أو أكثر وجب قسطه بالعدد وفي قول نصف دية ويجريان في قاذف جلد أحدا وثمانين ولمستقبل قطع سلعة إلا مخوفة لا خطر في تركها أو الخطر في قطعها أكثر ولأب وجد قطعها من صبي ومجنون مع الخطر إن زاد خطر الترك لا لسلطان وله ولسلطان قطعها بلا خطر وفصد وحجامة فلو مات بجائز من هذا فلا ضمان في الأصح ولو فعل سلطان

بصبي ما منع فدية مغلظة في ماله وما وجب بخطأ إمام في حد وحكم فعلى عاقلته وفي قول في بيت المال ولو حده بشاهدين فبانا عبدين أو ذميين أو مراهقين فإن قصر في اختبارهما فالضمان عليه وإلا فالقولان فإن ضمنا عاقلة أو بيت مال فلا رجوع على الذميين والعبدين في الأصح ومن حجم أو فصد بإذن لم يضمن وقتل جلاد وضربه بأمر الإمام كمباشرة إمام إن جهل ظلمه وخطأه وإلا فالقصاص والضمان على الجلاد إن لم يكن إكراه ويجب ختان المرأة بجزء من اللحمة بأعلى الفرج ms209 والرجل بقطع ما يغطي حشفته بعد البلوغ ويندب تعجيله في سابعة فإن ضعف عن احتماله أخر ومن ختنه في سن لا يحتمله لزمه قصاص إلا والدا فإن احتمله ختنه ولي فلا ضمان في الأصح وأجرته في مال المختون.

فصل

من كان مع دابة أو دواب ضمن إتلافها نفسا ومالا ليلا ونهارا ولو بالت أو راثت بطريق فتلفت به نفس أو مال فلا ضمان ويحترز عما لا يعتاد كركض شديد في وحل فإن خالف ضمن ما تولد منه ومن حمل حطبا على ظهره أو بهيمة فحك بناء فسقط ضمنه فإن دخل سوقا فتلف به نفس أو مال ضمن إن كان زحام فإن لم يكن وتمزق ثوب فلا إلا ثوب أعمى ومستدبر لبهيمة فيجب تنبيهه وإنما يضمنه إذا لم يقصر صاحب المال فإن قصر بأن وضعه بطريق أو عرضه للدابة فلا وإن كانت الدابة وحدها فأتلفت زرعا أو غيره نهارا لم يضمن صاحبها أو ليلا ضمن إلا أن لا يفرط في ربطها أو حضر صاحب الزرع وتهاون في دفعها وكذا إن كان الزرع في محوط له باب تركه مفتوحا في الأصح وهرة تتلف طيرا أو طعاما إن عهد ذلك منها ضمن مالكها في الأصح ليلا ونهارا وإلا فلا في الأصح.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 155;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 156, 'كتاب السير', 'كتاب السير');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'كان الجهاد في عهد رسول الله صلى الله عليه وسلم فرض كفياة وقيل: عين وأما بعده فللكفار حالان أحدهما يكونون ببلادهم ففرض كفاية إذا فعله من فيهم كفاية سقط الحرج عن الباقين.

ومن فرض الكفاية القيام بإقامة الحجج وحل المشكلات في الدين وبعلوم الشرع كتفسير وحديث والفروع بحيث يصلح للقضاء والأمر بالمعروف والنهي عن المنكر وإحياء الكعبة كل سنة بالزيارة ودفع ضرر المسلمين ككسوة عار وإطعام جائع إذا لم يندفع بزكاة وبيت مال وتحمل الشهادة وأداؤها والحرف والصنائع وما تتم به المعايش وجواب سلام على جماعة ويسن ابتداؤها لا على قاضي حاجة وآكل وفي حمام ولا جواب عليهم ولا جهاد على صبي ومجنون وامرأة ومريض وذي عرج بين وأقطع وأشل ms210 وعبد وعادم أهبة قتال وكل عذر منع وجوب الحج منع الجهاد إلا خوف طريق من كفار وكذا من لصوص المسلمين على الصحيح والدين الحال يحرم سفر جهاده وغيره إلا بإذن غريمه والمؤجل لا وقيل: يمنع سفرا مخوفا ويحرم جهاد إلا بإذن أبويه إن كانا مسلمين لا سفر تعلم فرض عين وكذا كفاية في الأصح فإن أذن أبواه والغريم ثم رجعوا وجب الرجوع إن لم يحضر الصف فإن شرع في قتال حرم الانصراف في الأظهر الثاني: يدخلون بلدة لنا فيلزم أهلها الدفع بالممكن فإن أمكن تأهب لقتال وجب الممكن حتى على فقير وولد ومدين وعبد بلا إذن وقيل: إن

حصلت مقاومة بأحرار اشترط إذن سيده وإلا فمن قصد دفع عن نفسه بالممكن إن علم أنه إن أخذ قتل وإن جوز الأسر فله أن يستسلم ومن هو دون مسافة قصر من البلدة كأهلها ومن على المسافة يلزمهم الموافقة بقدر الكفاية إن لم يكف أهلها ومن يليهم قيل: وإن كفوا ولو أسروا مسلما فالأصح وجوب النهوض إليهم لخلاصه إن توقعناه.

فصل

يكره غزو بغير إذن الإمام أو نائبه ويسن إذا بعث سرية أن يؤمر عليهم ويأخذ البيعة بالثبات وله الاستعانة بكفار تؤمن خيانتهم ويكونون بحيث لو انضمت فرقتا الكفر قاومناهم وبعيد بإذن السادة ومراهقين أقوياء وله بذل الأهبة والسلاح من بيت المال ومن ماله ولا يصح استئجار مسلم لجهاد ويصح استئجار ذمي للأمام قيل: ولغيره ويكره لغاز قتل قريب ومحرم أشد.

قلت: إلا أن يسمعه يسب الله أو رسوله صلى الله عليه وسلم والله أعلم ويحرم قتل صبي ومجنون وامرأة وخنثى مشكل ويحل قتل راهب وأجير وشيخ وأعمى وزمن لا قتال فيهم ولا رأي في الأظهر فيسترقون وتسبى نساؤهم وأموالهم ويجوز حصار الكفار في البلاد والقلاع وإرسال الماء عليهم ورميهم بنار ومنجنيق وتبييتهم في غفلة فإن كان فيهم مسلم أسير أو تاجر جاز ذلك على المذهب ولو التحم حرب فتترسوا بنساء وصبيان جاز رميهم وإن دفعوا بهم عن أنفسهم ولم تدع ضرورة إلى ms211 رميهم فالأظهر تركهم وإن تترسوا بمسلمين فإن لم تدع ضرورة إلى رميهم تركناهم وإلا جاز رميهم في الأصح ويحرم الإنصارف عن الصف إذا لم

يزد عدد الكفار على مثلينا {إلا متحرفا لقتال أو متحيزا إلى فئة} يستنجد بها ويجوز إلى فئة بعيدة في الأصح ولا يشارك متحيز إلى بعيدة الجيش فيما غنم بعد مفارقته ويشارك متحيز إلى قريبة في الأصح فإن زاد على مثلين جاز الانصراف إلا أنه يحرم انصراف مائة بطل على مائتين وواحد ضعفاء في الأصح وتجوز المبارزة فإن طلبها كافر استحب الخروج إليه وإنما تحسن ممن جرب نفسه وبإذن الإمام ويجوز إتلاف بنائهم وشجرهم لحاجة القتال والظفر بهم وكذا إن لم يرج حصولها لنا فإن رجى ندب الترك ويحرم إتلاف الحيوان إلا ما يقاتلون عليه لدفعهم أو ظفر بهم أو غنمناه وخفنا رجوعه إليهم وضرره.

فصل

نساء الكفار وصبيانهم إذا اسروا رقوا وكذا العبيد ويجتهد الإمام في الأحرار الكاملين ويفعل الأحظ للمسلمين من قتل ومن فداء بأسرى أو مال واسترقاق فإن خفي الأحظ حبسهم حتى يظهر وقيل: لا يسترق وثنى وكذا عربي في قول ولو أسلم أسير عصم دمه وبقي الخيار في الباقي وفي قول يتعين الرق وإسلام كافر قبل ظفر به يعصم دمه وماله وصغار ولده لا زوجته على المذهب فإن استرقت انقطع نكاحه في الحال وقيل: إن كان بعد دخول انتظرت العدة فلعلها تعتق فيها ويجوز إرقاق زوجة ذمي وكذا عتيقه في الأصح لا عتيق مسلم وزوجته على المذهب وإذا سبى زوجان أو أحدهما انفسخ النكاح إن كانا حرين قيل: أو رقيقين وإذا أرق وعليه دين لم يسقط فيقضي من ماله إن غنم بعد إرقاقه ولو اقترض حربي

من حربي أو اشترى منه ثم أسلما أو قبلا جزية دام الحق ولو أتلف عليه فأسلما فلا ضمان في الأصح والمال المأخوذ من أهل الحرب قهرا غنيمة وكذا ما أخذه واحد أو جمع من دار الحرب سرقة أو وجد كهيئة اللقطة على الأصح فإن أمكن كونه لمسلم ms212 وجب تعريفه وللغانمين التبسط في الغنيمة بأخذ القوت وما يصلح به ولحم وشحم وكل طعام يعتاد آكله عموما وعلف الدواب تبنا وشعيرا ونحوهما وذبح مأكول للحمه والصحيح جواز الفاكهة وأنه لا تجب قيمة المذبوح وأنه لا يخص الجواز بمحتاج إلى طعام وعلف وأنه لا يجوز ذلك لمن لحق الجيش بعد الحرب والحيازة وأن من رجع إلى دار الإسلام ومعه بقية لزمه ردها إلى المغنم وموضع التبسط دارهم وكذا ما لم يصل عمران الإسلام في الأصح.

ولغانم رشيد ولو محجورا عليه بفلس الإعراض عن الغنيمة قبل قسمة والأصح جوازه بعد فرز الخمس وجوازه لجميعهم وبطلانه من ذي القربى وسالب والمعرض كمن لم يحضر ومن مات فحقه لوارثه ولا تملك إلا بقسمة ولهم التملك وقيل: يملكون وقيل: إن سلمت إلى القسمة بان ملكهم وإلا فلا ويملك العقار بالاستيلاء كالنقول ولو كان فيها كلب أو كلاب تنفع وأراده بعضهم ولم ينازع أعطيه وإلا قسمت إن أمكن وإلا أقرع.

والصحيح أن سواد العراق فتح عنوة وقسم ثم بذلوه ووقف على المسلمين وخراجه أجرة تؤدى كل سنة لمصالح المسلمين وهو من عبادان إلى حديثة الموصل طولا ومن القادسية إلى حلوان عرضا

قلت: الصحيح أن البصرة وإن كانت داخلة في حد السواد فليس لها حكمه إلا في موضع غربي دجلتها وموضع شرقيها وأن ما في السواد من الدور والمساكن يجوز بيعه والله أعلم وفتحت مكة صلحا فدورها وأرضها المحياة ملك يباع.

فصل

يصح من كل مسلم مكلف مختار أمان حربي وعدد محصور فقط ولا يصح أمان أسير لمن هو معهم في الأصح ويصح بكل لفظ يفيد مقصوده وبكتابة ورسالة ويشترط علم الكافر بالأمان فإن رده بطل وكذا إن لم يقبل في الأصح وتكفي إشارة مفهمة للقبول ويجب أن لا تزيد مدته على أربعة أشهر وفي قول يجوز ما لم تبلغ سنة ولا يجوز أمان يضر المسلمين كجاسوس وليس للإمام نبذ الأمان إن لم يخف خيانة ولا يدخل في الأمان ماله وأهله بدار الحرب وكذا ما معه ms213 منهما في الأصح إلا بشرط.

والمسلم بدار كفر إن أمكنه إظهار دينه استحب له الهجرة وإلا وجبت إن أطاقها ولو قدر أسير على هرب لزمه ولو أطلقوه بلا شرط فله اغتيالهم أو على أنهم في أمانه حرم فإن تبعه قوم فليدفعهم ولو بقتلهم ولو شرطوا أن لا يخرج من دارهم لم يجز الوفاء ولو عاقد الإمام علجا يدل على قلعة وله منها جارية جاز فإن فتحت بدلالته أعطيها أو بغيرها فلا في الأصح فإن لم يفتح فلا شيء له وقيل: إن لم يعلق الجعل بالفتح فله أجرة مثل فإن لم يكن فيها جارية أو ماتت قبل العقد فلا شيء أو بعد الظفر قبل التسليم وجب بدل أو قبل ظفر فلا في الأظهر وإن أسلمت فالمذهب وجوب بدل وهو أجرة مثل وقيل: قيمتها.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 156;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 157, 'كتاب الجزية', 'كتاب الجزية');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب الجزية

صورة عقدها أقركم بدار الإسلام أو أذنت في إقامتكم بها على أن تبذلوا جزية وتنقادوا لحكم الإسلام والأصح اشتراط ذكر قدرها لا كف اللسان عن الله تعالى ورسوله صلى الله عليه وسلم ودينه ولا يصح العقد مؤقتا على المذهب ويشترط لفظ قبول ولو وجد كافر بدارنا فقال: دخلت لسماع كلام الله أو رسولا أو بأمان مسلم صدق وفي دعوى الأمان وجه ويشترط لعقدها الإمام أو نائبه وعليه الإجابة إذا طلبوا إلا جاسوسا نخافه ولا تعقد إلا لليهود والنصارى والمجوس وأولاد من تهود أو تنصر قبل النسخ أو شككنا في وقته وكذا زاعم التمسك بصحف إبراهيم وزبور داود صلى الله عليهما وسلم ومن احد أبويه كتابي والآخر وثني على المذهب ولا جزية على امرأة وخثنى ومن فيه رق وصبي ومجنون فإن تقطع جنونه قليلا كساعة من شهر لزمته أو كثيرا كيوم ويوم فالأصح تلفق الإفاقة فإذا بلغت سنة وجبت ولو بلغ ابن ذمي ولم يبذل جزية ألحق بمأمنه وإن بذلها عقد له وقيل: عليه كجزية أبيه والمذهب وجوبها على زمن وشيخ هرم وأعمى وراهب وأجير وفقير عجز عن كسب فإن تمت سنة وهو معسر ms214 ففي ذمته حتى يوسر ويمنع كل كافر من استيطان الحجاز وهو مكة والمدينة واليمامة وقراها وقيل: له الإقامة في طرقه الممتدة ولو دخله بغير إذن الإمام أخرجه وعزره إن علم أنه ممنوع فإن استأذن أذن له إن كان مصلحة للمسلمين كرسالة وحمل ما يحتاج إليه فإن كان

لتجارة ليس فيها كبير حاجة لم يأذن إلا بشرط أخذ شيء منها ولا يقيم إلا ثلاثة أيام ويمنع دخول حرم مكة فإن كان رسولا خرج إليه الإمام أو نائب يسمعه وإن مرض فيه نقل وإن خيف موته فإن مات لم يدفن فيه فإن دفن نبش وأخرج وإن مرض في غيره من الحجاز وعظمت المشقة في نقله ترك وإلا نقل فإن مات وتعذر نقله دفن هناك.

فصل

أقل الجزية دينار لكل سنة ويتسحب للإمام مماكسة حتى يأخذ من متوسط دينارين وغنى أربعة ولو عقدت بأكثر ثم علموا جواز دينار لزمهم ما التزموا فإن أبوا فالأصح أنهم ناقضون ولو أسلم ذمي أو مات بعد سنين أخذت جزيتهن من تركته مقدمة على الوصايا ويسوى بينها وبين دين آدمي على المذهب أو في خلال سنة فقط وفي قول لا شيء وتؤخذ بإهانة فيجلس الآخذ ويقوم الذمي ويطأطىء رأسه ويحني ظهره ويضعها في الميزان ويقبض الآخذ لحيته ويضرب لهزمتيه وكله مستحب وقيل: واجب فعلى الأول له توكيل مسلم بالأداء وحوالة عليه وأن يضمنها.

قلت: هذه الهيئة باطلة ودعوى استحبابها أشد خطأ والله أعلم ويستحب للإمام إذا أمكنه أن يشرط عليهم إذا صولحوا في بلدهم ضيافة من يمر بهم من المسلمين زائدا على أقل جزية وقيل: يجوز منها وتجعل على غنى ومتوسط لا فقير في الأصح ويذكر عدد الضيفان رجالا وفرسانا وجنس الطعام والأدم وقدرهما ولكل واحد كذا وعلف الدواب ومنزل الضيفان من كنيسة وفاضل مسكن ومقامهم ولا يجاوز ثلاثة أيام ولو قال قوم نؤدي الجزية باسم صدقة لا جزية فللإمام إجابتهم إذا رأى ويضعف عليهم الزكاة فمن خمسة أبعرة شاتان وخمسة وعشرين بنتا مخاض وعشرين دينارا دينار ومائتي ms215 درهم عشرة وخمس

المعشرات ولو وجب بنتا مخاض مع جبران لم يضعف الجبران في الأصح ولو كان بعض نصاب لم يجب قسطه في الأظهر ثم المأخوذ جزية فلا يؤخذ من مال من لا جزية عليه.

فصل

يلزمنا الكف عنهم وضمان ما نتلفه عليهم نفسا ومالا ودفع أهل الحرب عنهم وقيل: إن انفردوا ببلد لم يلزمنا الدفع ونمنعهم إحداث كنيسة في بلد أحدثناه أو أسلم أهله عليه وما فتح عنوة لا يحدثونها فيه ولا يقرون على كنيسة كانت فيه في الأصح أو صلحا بشرط الأرض لنا وشرط إسكانهم وإبقاء الكنائس جاز وإن أطلق فالأصح المنع أو لهم قررت ولهم الأحداث في الأصح ويمنعون وجوبا وقيل: ندبا من رفع بناء على بناء جار مسلم والأصح المنع من المساواة وأنهم لو كانوا بمحلة منفصلة لم يمنعوا ويمنع الذمي ركوب خيل لا حمير وبغال نفيسة ويركب بإكاف ورك خشب لا حديد ولا سرج ويلجأ إلى أضيق الطرق ولا يوقر ولا يصدر في مجلس ويؤمر بالغيار والزنار فوق الثياب وإذا دخل حماما فيه مسلمون أو تجرد عن ثيابه جعل في عنقه خاتم حديد أو رصاص ونحوه ويمنع من إسماعه المسلمين شركا وقولهم في عزير والمسيح ومن إظهار خمر وخنزير وناقوس وعيد ولو شرطت هذه الأمور فخالفوا لم ينتقض العهد ولو قاتلونا أو امتنعوا من الجزية أو من إجراء حكم الإسلام انتقض.

ولو زنى ذمي بمسلمة أو أصابها بنكاح أو دل أهل الحرب على عورة للمسلمين أو فتن مسلما عن دينه أو طعن في الإسلام أو القرآن أو ذكر رسول الله صلى الله عليه وسلم بسوء فالأصح أنه إن شرط انتقاض العهد بها انتقض وإلا فلا ومن انتقض عهده بقتال جاز دفعه وقتاله أو بغيره لم

يجب إبلاغه مأمنه في الأظهر بل يختار الإمام فيه قتلا ورقا ومنا وفداء فإن أسلم قبل الاختيار امتنع الرق وإذا بطل أمان رجال لم يبطل أمان نسائهم والصبيان في الأصح وإذا اختار ذمي نبذ العهد واللحاق بدار الحرب بلغ المأمن. ms216', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 157;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب الهدنة', 'عقدها لكفار إقليم يختص بالإمام ونائبه فيها ولبلدة يجوز لوالي الإقليم أيضا وإنما تعقد لمصلحة كضعفنا لقلة عدد وأهبة أو رجاء إسلامهم أو بذل جزية فإن لم يكن جازت أربعة أشهر لا ستة وكذا دونها في الأظهر ولضعف تجويز عشر سنين فقط ومتى زاد على الجائز فقولا تفريق الصفقة وإطلاق العقد يفسده. وكذا شرط فاسد على الصحيح بأن شرط منع فك أسرانا أو ترك ما لنا لهم أو لتعقد لهم ذمة بدون دينار أو بدفع مال إليهم وتصح الهدنة على أن ينقضها الإمام متى شاء ومتى صحت وجب الكف عنهم حتى تنقضي أو ينقضوها بتصريح أو قتال لنا أو مكاتبة أهل الحرب بعورة لنا أو قتل مسلم وإذا انقضت جازت الإغارة عليهم وبياتهم ولو نقض بعضهم ولم ينكر الباقون بقول ولا فعل انتقض فيهم أيضا وإن أنكروا باعتزالهم أو إعلام الإمام ببقائهم على العهد فلا ولو خاف خيانتهم فله نبذ عهدهم إليهم ويبلغهم المأمن ولا ينبذ عقد الذمة بتهمة ولا يجوز شرط رد مسلمة تأتينا منهم فإن شرط فسد الشرط.

وكذا العقد في الأصح وإن شرط رد من جاء أو لم يذكر ردا فجاءت امرأة لم يجب دفع مهر إلى زوجها في الأظهر ولا يرد صبي ومجنون وكذا عبد وحر لا عشيرة له على المذهب ويرد من له عشيرة طلبته إليها لا إلى غيرها إلا أن يقدر المطلوب على قهر الطالب والهرب منه ومعنى الرد أن يخلي بينه وبين طالبه ولا يجبر على الرجوع ولا يلزمه الرجوع وله قتل الطالب ولنا التعريض له به لا التصريح ولو شرط أن يردوا من جاءهم مرتدا منا لزمهم الوفاء فإن أبوا فقد نقضوا والأظهر جواز شرط أن لا يردوا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 157;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 158, 'كتاب الصيد والذبائح', 'كتاب الصيد والذبائح');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'ذكاة الحيوان المأكول بذبحه في حلق أو لبة إن قدر عليه وإلا فبعقر مزهق حيث كان وشرط ذابح وصائد حل مناكحته وتحل ذكاة أمة كتابية ولو شارك مجوسي مسلما في ذبح أو اصطياد حرم ولو أرسلا كلبين أو سهمين ms217 فإن سبق آلة المسلم فقتل أو أنهاه إلى حركة مذبوح حل ولو انعكس أو جرحاه معا أو جهل أو مرتبا ولم يذفف أحدهما حرم ويحل ذبح صبي مميز وكذا غير مميز ومجنون وسكران في الأظهر وتكره ذكاة أعمى ويحرم صيده برمي وكلب في الأصح وتحل ميتة السمك والجراد ولو صادهما مجوسي وكذا الدود المتولد من طعام كخل وفاكهة إذا أكل معه في الأصح ولا يقطع بعض سمكة فإن فعل أو بلع سمكة حية حل في الأصح وإذا رمى صيدا متوحشا أو بعيرا ند أو شاة شردت بسهم أو أرسل عليه جارحة فأصاب شيئا من بدنه ومات في الحال حل ولو تردى بعير ونحوه في بئر ولم يمكن قطع حلقومه فكناد.

قلت: الأصح لا يحل بإرسال الكلب وصححه الروياني والشاشي والله أعلم ومتى تيسر لحوقه بعدو أو استعانة بمن يستقبله فمقدرو عليه ويكفي في الناد والمتردي جرح يفضي إلى الزهوق.

وقيل: يشترط مذفف وإذا أرسل سهما أو كلبا أو طائرا على صيد فأصابه ومات فإن لم يدرك فيه حياة مستقرة أو أدركها وتعذر ذبحه بلا تقصير بأن سل السكين فمات قبل إمكان أو امتنع بقوته ومات قبل القدرة حل وإن مات لتقصيره بأن لا يكون معه سكين أو غصبت أو نشبت في الغمد حرم ولو رماه فقده نصفين حلا ولو أبان منه عضوا بجرح مذفف حل العضو والبدن أو بغير مذفف ثم ذبحه أو جرحه جرحا آخر مذففا حرم العضو وحل الباقي فإن لم يتمكن من ذبحه ومات بالجرح حل الجميع.

وقيل: يحرم العضو وذكاة كل حيوان قدر عليه بقطع كل الحلقوم وهو مخرج النفس والمرىء وهو مجرى الطعام ويستحب قطع الودجين وهما عرقان في صفحتي العنق ولو ذبحه من قفاه عصى فإن أسرع فقطع الحلقوم والمريء وبه حياة مستقرة حل وإلا فلا وكذا إدخال سكين بإذن ثعلب ويسن نحر إبل وذبح بقر وغنم ويجوز عكسه وأن يكون البعير قائما معقول ركبة والبقر والشاة مضجعة لجنبها الأيسر وتترك رجلها اليمنى ويشد ms218 باقي القوائم وإن يحد شفرته ويوجه للقبلة ذبيحته وأن يقول بسم الله ويصلى على النبي صلى الله عليه وسلم ولا يقل باسم الله واسم محمد.

فصل

يحل ذبح مقدور عليه وجرح غيره بكل محدد يجرح كحديد ونحاس وذهب وخشب وقصب وحجر وزجاج إلا ظفرا وسنا وسائر العظام فلو قتل بمثقل أو ثقل محدد كبندقة وسوط وسهم بلا نصل ولا حد أو سهم وبندقة أو جرحه نصل وأثر فيه عرض السهم في مروره ومات بهما أو انخنق بأحبولة أو أصابه سهم فوقع بأرض أو جبل ثم سقط منه حرم ولو أصابه سهم بالهواء فسقط بأرض ومات حل ويحل الاصطياد بجوارح السباع والطير ككلب وفهد وباز وشاهين بشرط كونها معلمة بان تنزجر جارحة السباع بزجر صاحبه ويسترسل بإرساله ويمسك الصيد ولا يأكل منه ويشترط ترك الأكل في جارحة الطير في الأظهر ويشترط تكرر هذه الأمور بحيث يظن تأدب الجارحة ولو ظهر كونه معلما ثم أكل من لحم صيد لم يحل ذلك الصيد في الأظهر فيشترط تعليم جديد ولا أثر للعق الدم ومعض الكلب من الصيد نجس والأصح أنه لا يعفى عنه وأنه يكفي غسله بماء وتراب ولا يجب أن يقور ويطرح ولو تحاملت الجارحة على صيد فقتلته بثقلها حل في الأظهر ولو كان بيده سكين

فسقط وانجرح به صيد أو احتكت به شاة وهو في يده فانقطع حلقومها أو مريئها أو استرسل كلب بنفسه فقتل لم يحل وكذا لو استرسل كلب فأغراه صاحبه فزاد عدوه في الأصح ولو أصابه سهم بإعانة ريح حل ولو أرسل سهما لاختبار قوته أو إلى غرض فاعترض صيد فقتله حرم في الأصح ولو رمى صيد أظنه حجرا أو سرب ظباء فأصاب واحدة حلت وإن قصد واحدة فأصاب غيرها حلت في الأصح ولو غاب عنه الكلب والصيد ثم وجده ميتا حرم وإن جرحه وغاب ثم وجده ميتا حرم في الأظهر.

فصل

يملك الصيد بضبطه بيده وبجرح مذفف وبازمان وكسر جناح وبوقوعه في شبكة نصبها وبإلجائه إلى مضيق لا ms219 يفلت منه ولو وقع صيد في ملكه وصار مقدورا عليه بتوحل وغيره لم يملكه في الأصح ومتى ملكه لم يزل ملكه بانفلاته وكذا بإرسال المالك له في الأصح ولو تحول حمامه إلى برج غيره لزمه رده فإن اختلط وعسر التمييز لم يصح بيع أحدهما وهبته شيأ منه لثالث ويجوز لصاحبه في الأصح فإن باعهما والعدد معلوم والقيمة سواء صح وإلا فلا ولو جرح الصيد اثنان متعاقبان فإن ذفف الثاني أو أزمن دون الأول فهو للثاني وإن ذفف الأول فله وإن أزمن فله ثم إن ذفف الثاني بقطع حلقوم ومريء فهو حلال وعليه للأول ما نقص بالذبح وإن ذفف لا بقطعهما أو لم يذفف ومات بالجرحين فحرام ويضمنه الثاني للأول وإن جرحا معا وذففا أو أزمنا فلهما وإن ذفف أحدهما أو أزمن دون الآخر فله وإن ذفف واحد وأزمن آخر وجهل السابق حرم على المذهب.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 158;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 159, 'كتاب الأضحية', 'كتاب الأضحية');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'هي سنة لا تجب إلا بالتزام ويسن لمريدها أن لا يزيل شعره ولا ظفره في عشر ذي الحجة حتى يضحي وأن يذبحها بنفسه وإلا فيشهدها ولا تصح إلا من إبل وبقر وغنم وشرط إبل أن يطعن في السنة السادسة وبقر ومعز في الثالث: ة وضأن في الثانية ويجوز ذكر وأنثى وخصى والبعير والبقرة عن سبعة والشاة عن واحد وأفضلها بعير ثم بقرة ثم ضأن ثم معز وسبع شياه أفضل من مشاركة في بعير وشرطها سلامة من عيب ينقص لحما فلا تجزىء عجفاء ومجنونة ومقطوعة بعض إذن وذات عرج وعور ومرض وجرب بين ولا يضر يسيرها ولا فقد قرون وكذا شق الإذن وخرقها في الأصح.

قلت: الصحيح المنصوص يضر يسير الحرب والله أعلم ويدخل وقتها إذا ارتفعت الشمس كرمح يوم النحر ثم مضى قدر ركعتين وخطبتين خفيفتين ويبقى حتى تغرب آخر التشريق.

قلت: ارتفاع الشمس فضيلة والشرط طلوعها ثم مضى قدر الركعتين والخطبتين والله أعلم ومن نذر معينة فقال لله على أن أضحي بهذه لزمه ذبحها في هذا الوقت فإن تلفت قبله فلا شيء عليه ms220 فإن أتلفها لزمه أن يشتري بقيمتها مثلها ويذبحها فيه وإن نذر في ذمته ثم عين

لزمه ذبحه فيه فإن تلفت قبله بقي الأصل عليه في الأصح وتشترط النية عند الذبح إن لم يسبق تعيين وكذا إن قال جعلتها أضحية في الأصح وإن وكل بالذبح أعطاه الوكيل أو ذبحه وله الأكل من أضحية تطوع وإطعام الأغنياء لا تمليكهم ويأكل ثلثا وفي قول نصفا والأصح وجوب تصدق ببعضها والأفضل بكلها إلا لقما يتبرك بأكلها ويتصدق بجلدها أو ينتفع به وولد الواجبة يذبح وله أكل كله وشربه فاضل لبنها ولا تضحية لرقيق فإن أذن سيده وقعت له ولا يضحي مكاتب بلا إذن ولا تضحية عن الغير بغير إذنه ولا عن ميت إن لم يوص بها.

فصل

يسن أن يعق عن غلام بشاتين وجارية بشاة وسنها وسلامتها والأكل والتصدق كالأضحية ويسن طبخها ولا يكسر عظم وأن تذبح يوم سابع ولادته ويسمى فيه ويحلق رأسها بعد ذبحها ويتصدق بزنته ذهبا أو فضة ويؤذن في أذنه حين يولد ويحنك بتمر.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 159;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 160, 'كتاب الأطعمة', 'كتاب الأطعمة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'حيوان البحر السمك منه حلال كيف مات وكذا غيره في الأصح وقيل: لا وقيل: إن أكل مثله في البر حل وإلا فلا ككلب وحمار وما يعيش في بر وبحر كضفدع وسرطان وحية حرام وحيوان البر يحل منه الأنعام والخيل وبقر وحش وحماره وظبي وضبع وضب وأرنب وثعلب ويربوع وفنك وسمور ويحرم بغل وحمار أهلي وكل ذي ناب من السباع ومخلب من الطير كأسد ونمر وذئب ودب وفيل وقرد وباز وشاهين وصقر ونسر وعقاب وكذا ابن آوى وهرة وحش في الأصح.

ويحرم ما ندب قتله كيحة وعقرب وغراب أبتع وحدأة وفأر وكل سبع ضار وكذا رخمة وبغاثة الأصح حل غراب زرع وتحريم ببغاء وطاوس ويحل نعامة وكركى وبط وأوز ودجاج وحمام وهو كل ما عب وهدر وما على شكل عصفور وإن اختلف لونه ونوعه كعندليب وصعوة وزرزور ولا خطاف ونحل وذباب وحشرات كخنفساء ودود.

وكذا ما تولد من مأكول وغيره وما لا نص فيه إن ms221 استطابه أهل يسار وطباع سليمة من

العرب في حال رفاهية حل وإن استخبثوه فلا وإن جهل اسم حيوان سئلوا وعمل بتسميتهم وإن لم يكن له اسم عندهم اعتبر بالأشبه به وإذا ظهر تغير لحم جلالة حرم وقيل: يكره.

قلت: الأصح يكره والله أعلم فإن علفت طاهر فطاب حل ولو تنجس طاهر كخل ودبس ذائب حرم وما كسب بمخامرة نجس كحجامة وكنس مكروه ويسن أن لا يأكله ويطعمه رقيقه وناضحه ويحل جنين وجد ميتا في بطن مذكاة ومن خاف على نفسه موتا أو مرضا مخوفا ووجد محرما لزمه أكله وقيل: يجوز فإن توقع حلالا قريبا لم يجز غير سد الرمق وإلا ففي قول يشبع والأظهر سد الرمق إلا أن يخاف تلفا إن اقتصر وله أكل آدمي ميت وقتل مرتد حربي لا ذمي ومستأمن وصبي حربي.

قلت: الأصح حل قتل الصبي والمرأة الحربيين للأكل والله أعلم ولو وجد طعام غائب أكل وغرم أو حاضر مضطر لم يلزمه بذله إن لم يفضل عنه فإن آثر مسلما جاز أو غير مضطر لزمه إطعام مضطر مسلم أو ذمي فإن منع فله قهره وإن قتله وإنما يلزمه بعوض ناجز إن حضر وإلا فبنسيئة فلو أطعمه ولم يذكر عوضا فالأصح لا عوض ولو وجد مضطر ميتة وطعام غيره أو محرم ميتة وصيدا فالمذهب أكلها والأصح تحريم قطع بعضه لا أكله.

قلت: الأصح جوازه وشرطه فقد الميتة ونحوها وأن يكون الخوف في قطعه أقل ويحرم قطعه لغيره ومن معصوم. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 160;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 161, 'كتاب المسابقة والمناضلة', 'كتاب المسابقة والمناضلة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'هما سنة ويحل أخذ عوض عليهما وتضح المناضلة على سهام وكذا مزاريق ورماح ورمي بأحجار ومنجنيق وكل نافع في الحرب على المذهب لا على كرة صولجان وبندق وسباحة وشطرنج وخاتم ووقوف على رجل ومعرفة ما بيده وتصح المسابقة على خيل وكذا فيل وبغل وحمار في الأظهر لا طير وصراع في الأصح والأظهر أن عقدهما لازم لا جائز فليس لأحدهما فسخه ولا ترك العمل قبل شروع وبعده ولا زيادة ونقص فيه ولا في مال وشرط ms222 المسابقة علم الموقف والغاية وتساويهما فيهما وتعيين الفرسين ويتعينان وإمكان سبق كل واحد والعلم بالمال المشروط ويجوز شرط المال من غيرهما بأن يقول الإمام أو أحد الرعية من سبق منكما فله في بيت المال أو على كذا ومن أحدهما فيقول إن سبقتني فلك علي كذا أو سبقتك فلا شيء عليك فإن شرط أن من سبق منهما فله على الآخر كذا لم يصح إلا بمحلل فرسه كف لفرسيهما فإن سبقهما أخذ المالين وإن سبقاه وجاآ معا فلا شيء لأحد وإن جاء مع أحدهما فمال هذا لنفسه ومال المتأخر للمحلل وللذي معه وقيل: للمحلل فقط وإن جاء أحدهما ثم المحلل ثم الآخر فمال الآخر للأول في الأصح.

وإن تسابق ثلاثة فصاعدا وشرط للثاني مثل الأول فسد ودونه يجوز في الأصح وسبق إبل بكتف وخيل بعتق وقيل: بالقوائم فيهما ويشترط للمناضلة بيان أن الرمي مبادرة وهي أن يبدر أحدهما بإصابة العدد المشروط أو محاطة وهي أن تقابل إصاباتهما ويطرح المشترك فمن زاد بعدد كذا فناضل وبيان عدد نوب الرمي والإصابة ومسافة الرمي وقدر الغرض طولا وعرضا إلا أن يعقد بموضع فيه غرض معلوم فيحمل المطلق عليه وليبينا صفة الرمي من قرع وهو إصابة السن بلا خدش أو خرق وهو أن يثقبه ولا يثبت فيه أو خسق وهو أن يثبت أو مرق وهو أن ينفذ فإن أطلقا اتقضى القرع ويجوز عوض المناضلة من حيث يجوز عوض المسابقة وبشرطه ولا يشترط تعيين قوس وسهم فإن عين لغا وجاز إبداله بمثله فإن شرط منع إبداله فسد العقد والأظهر اشتراط بيان البادىء بالرمي ولو حضر جمع للمناضلة فانتصب زعيمان يختاران أصحابا جاز ولا يجوز شرط تعيينهما بقرعة فإن اختار غريبا ظنه راميا فبان خلافه بطل العقد فيه وسقط من الحزب الآخر واحد وفي بطلان الباقي قولا الصفقة فإن صححنا فلهم جميعا الخيار فإن أجازوا وتنازعوا فيمن يسقط بدله فسخ العقد وإذا نضل خرب قسم المال بحسب الإصابة وقيل: بالسوية ويشترط في الإصابة المشروطة أن تحصل بالنضل فلو ms223 تلف وتر أو قوس أو عرض شيء تصدم به السهم وأصاب حسب له والألم يحسب عليه ولو نقلت ريح الغرض فأصاب موضعه حسب له وإلا فلا يحسب عليه ولو شرط خسق فثقب وثبت ثم سقط أو لقي صلابة فسقط حسب له.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 161;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 162, 'كتاب الأيمان', 'كتاب الأيمان');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'لا تنعقد إلا بذات الله تعالى أو صفة له كقوله والله رب العالمين والحي الذي لا يموت ومن نفسي بيده وكل اسم مختص به سبحانه وتعالى ولا يقبل قوله لم أرد به اليمين وما انصرف إليه سبحانه عند إطلاق كالرحيم والخلق والرزاق والرب تنعقد به اليمين إلا أن يريد غيره وما استعمل فيه وفي غيره سواء كالشيء والموجود والعالم والحي ليس بيمين إلا بنية والصفة كوعظمة الله وعزته وكبريائه وكلامه وعلمه وقدرته ومشيئته يمين إلا أن ينوي بالعلم المعلوم وبالقدرة المقدور ولو قال وحق الله فيمين إلا أن يريد العبادات وحروف القسم باء وواو وتاء كبالله والله وتالله وتختص التاء بالله ولو قال الله ورفع أو نصب أو جر فليس بيمين إلا بنية.

ولو قال أقسمت أو أقسم أو أحلفت أو أحلف بالله لأفعلن فيمين إن نواها أو أطلق وإن قال قصدت خبرا ماضيا أو مستقبلا صدق باطنا وكذا ظاهرا على المذهب.

ولو قال لغيره أقسم عليك بالله أو أسألك بالله لتفعلن وأراد يمين نفسه فيمين وإلا فلا ولو قال إن فعلت كذا فأنا يهودي أو بريء من الإسلام فليس بيمين ومن سبق لسانه إلى لفظها بلا قصد لم تنعقد وتصح على ماض ومستقبل وهي مكروهة إلا في طاعة فإن حلف على

ترك واجب أو فعل حرام عصى ولزمه الحنث وكفارة أو ترك مندوب أو فعل مكروه سن حنثه وعليه كفارة أو ترك مباح أو فعله فالأفضل ترك الحنث وقيل: الحنث وله تقديم كفارة بغير صوم على حنث جائز وحرام.

قلت: هذا أصح والله أعلم وكفارة ظهار على العود وقتل على الموت ومنذور مالي.

فصل

يتخير في كفارة اليمين بين عتق كالظهار وإطعام عشرة مساكين كل مسكين ms224 مدحب من غالب قوت بلده وكسوتهم بما يسمى كسوة كقميص أو عمامة أو إزار لا خف وقفازين ومنطقة ولا يتشرط صلاحيته للمدفوع إليه فيجوز سراويل صغير لكبير لا يصلح له وقطن وكتان وحرير لامرأة ورجل ولبيس لم تذهب قوته فإن عجز عن الثلاثة لزمه صوم ثلاثة أيام ولا يجب تتابعها في الأظهر وإن غاب ماله انتظره ولم يصم ولا يكفر عبد بمال إلا إذا ملكه سيده طعاما أو كسوة وقلنا يملك بل يكفر بصوم فإن ضره وكان حلف وحنث بإذن سيده صام بلا إذن أو وجدا بلا إذن وإن أذن في أحدهما فالأصح اعتبار الحلف ومن بعضه حر وله مال يكفر بطعام أو كسوة لا عتق.

فصل

حلف لا يسكنها أو لا يقيم فيها فليخرج في الحار فإن مكث بلا عذر حنث وإن بعث متاعه وإن اشتغل بأسباب الخروج كجمع متاع وإخراج أهل ولبس ثوب لم يحنث ولو

حلف لا يساكنه في هذه الدار فخرج أحدهما في الحال لم يحنث وكذا لو بنى بينهما جدار ولك جانب مدخل في الأصح ولو حلف لا يدخلها وهو فيها أو لا يخرج وهو خارج فلا حنث بهذا أو لا يتزوج أو لا يتطهر أو لا يلبس أو لا يركب أو لا يقوم أو لا يقعد فاستدام هذه الأحوال حنث.

قلت: بحيثه باستدامة التزوج والتطهر غلط لذهول واستدامة طيب ليست تطيبا في الأصح وكذا وطء صوم وصلاة والله أعلم ومن حلف لا يدخل دارا حنث بدخول دهليز داخل الباب أو بين بابين لا بدخول طاق قدام الباب ولا بصعود سطح غير محوط وكذا محوط في الأصح ولو أدخل يده أو رأسه أو رجله لم يحنث فإن وضع رجليه فيهما معتمدا عليهما حنث ولو انهدمت فدخل وقد بقي أساس الحيطان حنث وإن صارت فضاء أو جعلت مسجدا أو حماما أو بستانا فلا ولو حلف لا يدخل دار زيد حنث بدخول ما يسكنها بملك لا بإعارة وإجارة وغصب إلا أن يريد مسكنه ويحنث بما يملكه ولا ms225 يسكنه إلا أن يريد مسكنه ولو حلف لا يدخل دار زيد أو لا يكلم عبده أو زوجته فباعهما أو طلقها فدخل وكلم لم يحنث إلا أن يقول داره هذه أو زوجته هذه أو عبده هذا فيحنث إلا أن يريد ما دام ملكه ولو حلف لا يدخلها من ذا الباب فنزل ونصب في موضع آخر منها لم يحنث بالثاني ويحنث بالأول في الأصح أو لا يدخل بيتا حنث بكل بيت من طين أو حجر أو آجر أو خشب أو خيمة ولا يحنث بمسجد وحمام وكنيسة وغار جبل أو لا يدخل على زيد فدخل بيتا فيه زيد وغيره حنث وفي قول إن نوى الدخول على غيره دونه لا يحنث فلو جهل حضوره فخلاف حنث النامي.

قلت: ولو حلف لا يسلم عليه فسلم على قوم هو فيهم واستثناه لم يحنث وإن أطلق حنث في الأظهر. والله أعلم.

فصل

حلف لا يأكل الرؤس ولا نية له حنث برؤس تباع وحدها لا طير وحوت وصيد إلا ببلد تباع فيه مفردة والبيض يحمل على مزائل بائضه في الحياة كدجاج ونعامة وحمام لا سمك وجراد واللحم على نعم وخيل ووحش وطير لا سمك وشحم بطن وكذا كرش وكبد وطحال وقلب في الأصح.

والأصح تناوله لحم رأس ولسان وشحم ظهر وجنب وإن شحم الظهر لا يتناوله الشحم وإن الإلية والسنام ليسا شحما ولا لحما والإلية لا تتناول سناما ولا يتناولهما والدم يتناولهما وشحم وظهر وبطن وكل دهن ولحم البقر يتناول جاموسا ولو قال مشيرا إلى حنطة لا آكل هذه حنث بأكلها لى هيئتها وبطحينها وخبزها ولو قال لا آكل هذه الحنطة حنث بها مطبوخة ونيئة ومقلية لا بطحينها وسويقها وعجينها وخبزها ولا يتناول رطب تمرا ولا بسرا ولا عنب زبيبا.

وكذا العكوس ولو قال لا آكل هذا الرطب فتتمر فأكله أو لا أكلم ذا الصبي فكلمه شيخا فلا حنث في الأصح والخبز يتناول كل خبز كحنطة وشعير وأرز وباقلا وذرة وحمص فلو ثرده فأكله حنث ولو حلف لا ms226 يأكل سويقا فسفه أو تناوله بأصبع حنث وإن جعله في ماء فشربه فلا أو لا يشربه فبالعكس أو لا يأكل لبنا أو مائعا آخر فأكله بخبز حنث أو شربه فلا أو لا يشربه فبالعكس أو لا يأكل سمنا فأكله بخبز جامدا أو ذائبا حنث وإن شرب ذائبا فلا وإن أكله في عصيدة حنث إن كانت عينه ظاهرة ويدخل في فاكهة رطب وعنب ورمان وأترج ورطب ويابس.

قلت: وليمون ونبق وكذا بطيخ ولب فستق وبندق وغيرهما في الأصح لا قثاء ولا خيار وباذنجان وجزر ولا يدخل في الثمار يابس. والله أعلم.

ولو أطلق بطيخ وتمر وجوز لم يدخل هندي والطعام يتناول قوة وفاكهة وأدما وحلوى ولو قال لا آكل من هذه البقرة تناول لحمها دون ولد ولبن أو من هذه الشجرة فثمر دون ورق وطرف غصن.

فصل

حلف لا يأكل هذه التمرة فاختلطت بتمر فأكله إلا تمرة لم يحنث أو ليأكلنها فاختلطت لم يبر إلا بالجميع أو ليأكلن هذه الرمانة فإنما يبر بجميع حبها أو لا يلبس هذين لم يحنث بأحدهما فإن لبسهما معا أو مرتبا حنث أو لا ألبس هذا ولا هذا حنث بأحدهما أو ليأكلن ذا الطعام غدا فمات قبله فلا شيء عليه وإن مات أو تلف الطعام في الغد بعد تمكنه من أكله حنث وقبله قولان كمكره وإن أتلفه بأكل وغيره قبل الغد حنث وإن تلف أو أتلفه أجنبي فكمكره أو لأقضين حقك عند رأس الهلال فليقض عند غروب الشمس آخر الشهر فإن قدم أو مضى بعد الغروب قدر إمكانه حنث وإن شرع في الكيل حينئذ ولم يفرغ لكثرته إلا بعد مدة لم يحنث أو لا يتكلم فسبح أو قرأ قرآنا فلا حنث أو لا يكمله فسلم عليه حنث وإن كاتبه أو راسله أو أشار إليه بيد أو غيرها فلا في الجديد وإن قرأ آية أو أفهمه بها مقصوده وقصد قراءة لم يحنث والأحنث أو لا مال له حنث بكل نوع وإن قل حتى ثوب بدنه ومدبر

ومعلق ms227 عتقه بصفة وما وصى به ودين حل وكذا مؤجل في الأصح لا مكاتب في الأصح أو ليضربنه فالبر بما يسمى ضربا ولا يشترط إيلام إلا أن يقول ضربا شديدا وليس وضع سوط عليه وعض وخنق ونتف شعر ضربا قيل: ولا لطم ووكزه أو ليضربنه مائة سوط أو خشبة فشد مائة وضربه بها ضربة أو بعثكال عليه مائة شمراخ بر إن علم إصابة الكل أو تراكم بعض على بعض فوصله ألم الكل.

قلت: ولو شك في إصابة الجميع بر على النص والله أعلم أو ليضربنه مائة مرة لم يبر بهذا أو لا أفارقك حتى أستوفي فهرب ولم يمكنه اتباعه يحنث.

قلت: الصحيح لا يحنث إذا أمكنه اتباعه والله أعلم وإن فارقه أو وقف حتى ذهب وكانا ماشيين أو أبرأه أو احتال على غريم ثم فارقه أو أفلس ففارقه ليوسر حنث وإن استوفى وفارقه فوجده ناقصا إن كان من جنس حقه لكنه أردأ لم يحنث والأحنث عالم وفي غيره القولان أولا أرى منكرا إلا رفعته إلى القاضي فرأى وتمكن فلم يرفع حتى مات حنث ويحمل على قاضي البلد فإن عزل فالبر بالرفع إلى الثاني أو لأرفعه إلى قاض بربكل قاض أو إلى القاضي فلان فرآه ثم عزل فإن نوى ما دام قاضيا حنث إن أمكنه رفعه فتركه وإلا فكمكره وإن لم ينو بر برفع إليه بعد عزله.

فصل

حلف لا يبيع أو لا يشتري فعقد لنفسه أو غيره حنث ولا يحنث بعقد وكيله له أو لا يزوج أو لا يطلق أو لا يعتق أو لا يضرب فوكل من فعله لا يحنث إلا أن يريد أن لا يفعل هو

ولا غيره أو لا ينكح حنث بعقد وكيله له لا بقبوله هو لغيره أو لا يبيع مال زيد فباعه بإذنه حنث وإلا فلا أو لا يهب له فأوجب له فلم يقبل لم يحنث.

وكذا إن قبل ولم يقبض في الأصح ويحنث بعمري ورقبي وصدقة لا إعارة ووصية ووقف أو لا يتصدق لم يحنث بهبة ms228 في الأصح أو لا يأكل طعاما اشتراه زيد لم يحنث بما اشتراه مع غيره.

وكذا لو قال من طعام اشتراه زيد في الأصح ويحنث بما اشتراه سلما ولو اختلط ما اشتراه بمشترى غيره لم يحنث حتى يتيقن أكله من ماله أو لا يدخل دارا اشتراها زيد لم يحنث بدار أخذها بشفعة.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 162;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 163, 'كتاب النذر', 'كتاب النذر');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'هو ضربان نذر لجاج كإن كلمته فلله علي عتق أو صوم وفيه كفارة يمين وفي قول ما ألتزم وفي قول أيهما شاء.

قلت: الثالث: أظهر ورجحه العراقيون والله أعلم ولو قال إن دخلت فعلي كفارة يمين أو نذر لزمته كفارة بالدخول ونذر تبرر بأن يلتزم قربة إن حدثت نعمة أو ذهبت نقمة كإن شفي مريضي فلله علي أو فعلي كذا فيلزمه ذلك إذا حصل المعلق عليه وإن لم يعلقه بشيء كلله علي صوم لزمه في الأظهر ولا يصح نذر معصية ولا واجب ولو نذر فعل مباح أو تركه لم يلزمه لكن إن خالف لزمه كفارة يمين على المرجح ولو نذر صوم أيام ندب تعجيلها فإن قيد بتفريق أو موالاة وجب وإلا جاز أو سنة معينة صامها وأفطر العيد والتشريق وصام رمضان عنه ولا قضاء وإن أفطرت بحيض ونفاس وجب القضاء في الأظهر.

قلت: الأظهر لا يجب وبه قطع الجمهور والله أعلم وإن أفطر يوما بلا عذر وجب قضاؤه ولا يجب استئناف سنة فإن شرط التتابع وجب في الأصح أو غير معينة وشرط التتابع

وجب ولا يقطعه صوم رمضان عن فرضه وفطر العيد والتشريق ويقضيها تباعا متصلة بآخر السنة ولا يقطعه حيض وفي قضائه القولان وإن لم يشرطه لم يجب أو يوم الاثنين أبدا لم يقض ثاني رمضان وكذا العيد والتشريق في الأظهر فلو لزمه صوم شهرين تباعا لكفارة صامهما ويقضي ثانيهما وفي قول لا يقضي إن سبقت الكفارة النذر.

قلت: ذا القول أظهر والله أعلم وتقضي زمن حيض ونفاس في الأظهر أو يوما بعينه لم يصم قبله أو يوما من أسبوع ثم نسيه صام آخره وهو الجمعة ms229 فإن لم يكن هو وقع قضاء ومن شرع في صوم نفل فنذر إتمامه لزمه على الصحيح وإن نذر بعض يوم لم ينعقد وقيل: يلزمه يوم أو يوم قدوم زيد فالأظهر انعقاده فإن قدم ليلا أو يوم عيد أو في رمضان فلا شيء عليه أو نهارا وهو مفطر أو صائم قضاء أو نذرا وجب يوم آخر عن هذا أو وهو صائم نفلا فكذلك.

وقيل: يجب تتميمه ويكفيه ولو قال إن قدم زيد فلله علي صوم اليوم التالي ليوم قدومه وإن قدم عمرو فلله علي صوم أول خميس بعده فقدما في الأربعاء وجب صوم الخميس عن أول النذرين ويقضي الآخر.

فصل

نذر المشي إلى بيت الله أو إتيانه فالمذهب وجوب إتيانه بحج أو عمرة فإن نذر الإتيان لم

يلزمه شيء وإن نذر المشي أو أن يحج أو يعتمر ماشيا فالأظهر وجوب المشي فإن كان قال أحج ماشيا فمن حيث يحرم وإن قال أمشي إلى بيت الله تعالى فمن دويرة أهله في الأصح وإذا أوجبنا المشي فركب لعذر أجزأه وعليه دم في الأظهر أو بلا عذر أجزأه على المشهور وعليه دم ومن نذر حجا أو عمرة لزمه فعله بنفسه فإن كان معضوبا استناب.

ويستحب تعجيله في أول الإمكان فإن تمكن فاخر فمات حج من ماله وإن نذر الحج عامه وأمكنه لزمه فإن منعه مرض وجب القضاء أو عدو فلا في الأظهر أو صلاة أو صوما في وقت فمنعه مرض او عدو وجب القضاء أو هديا لزمه حمله إلى مكة والتصدق به على من بها أو التصدق على أهل بلد معين لزمه أو صوما في بلد لم يتعين.

وكذا صلاة إلا المسجد الحرام وفي قول ومسجد المدينة والأقصى.

قلت: الأظهر تعينهما كالمسجد الحرام والله أعلم أو صوما مطلقا فيوم أو أياما فثلاثة أو صدقة فيما كان أو صلاة فركعتان وفي قول ركعة فعلى الأول يجب القيام فيهما مع القدرة وعلى الثاني لا أو عتقا فعلى الأول رقبة كفارة وعلى الثاني رقبة.

قلت: الثاني هنا ms230 أظهر والله أعلم أو عتق كافرة معيبة أجزأه كاملة فإن عين ناقصة تعينت أو صلاة قائما لم يجز قاعدا بخلاف عكسه أو طول قراءة الصلاة أو سورة معينة أو الجماعة لزمه والصحيح انعقاد النذر بكل قربة لا تجب ابتداء كعيادة وتشييع جنازة والسلام.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 163;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 164, 'كتاب القضاء', 'كتاب القضاء');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, 'مدخل', '...

كتاب القضاء

هو فرض كفاية فإن تعين لزمه طلبه وإلا فإن كان غيره أصلح وكان يتولاه فللمفضول القبول وقيل: لا ويكره طلبه وقيل: يحرم وإن كان مثله فله القبول ويندب الطلب إن كان خاملا يرجو به نشر العلم أو محتاجا إلى الرزق وإلا فالأولى تركه.

قلت: ويكره على الصحيح والله أعلم والاعتبار في التعيين وعدمه بالناحية وشرط القاضي مسلم مكلف حر ذكر عدل سميع بصير ناطق كاف مجتهد وهو أن يعرف من القرآن والسنة ما يتعلق بالأحكام وخاصه وعامه ومجمله ومبينه وناسخه ومنسوخه ومتواتر السنة وغيره والمتصل والمرسل وحال الرواة قوة وضعفا ولسان العرب لغة ونحوا وأقوال العلماء من الصحابة فمن بعدهم إجماعا واختلافا والقياس بأنواعه فإن تعذر جمع هذه الشروط فولى سلطان له شوكة فاسقا أو مقلدا نفذ قضاؤه للضرورة.

ويندب للإمام إذا ولى قاضيا أن يأذن له في الاستخلاف فإن نهاه لم يستخلف فإن أطلق استخلف فيما لا يقدر عليه لا غيره في الأصح وشرط المستخلف كالقاضي إلا أن يستخلف في أمر خاص كسماع بينة فيكفي علمه بما يتعلق به ويحكم باجتهاده وأو اجتهاد مقلده إن كان مقلدا ولا يجوز أن يشرط عليه خلافه ولو حكم خصمان رجلا في غير حد الله تعالى جاز مطلقا بشرط أهلية القضاء وفي قول لا يجوز وقيل: بشرط عدم قاض بالبلد.

وقيل: يختص بمال دون قصاص ونكاح ونحوهما ولا ينفذ حكمه إلا على راض به فلا يكفي رضا قاتل في ضرب دية على عاقلته وإن رجع أحدهما قبل الحكم امتنع الحكم ولا يشترط الرضا بعد الحكم في الأظهر ولو نصب قاضيين في بلد وخص كلا بمكان أو زمان أو نوع جاز وكذا إن لم يخص في ms231 الأصح إلا أن يشترط اجتماعهما على الحكم.

فصل

جن قاض أو أغمي عليه أو عمي أو ذهبت أهلية اجتهاده وضبطه بغفلة أو نسيان لم ينفذ حكمه وكذا لو فسق في الأصح فإن زالت هذه الأحوال لم تعد ولايته في الأصح وللإمام عزل قاض ظهر منه خلل أو لم يظهر وهناك أفضل منه أو مثله وفي عزله به مصلحة كتسكين فتنة وإلا فلا لكن ينفذ العزل في الأصح والمذهب أنه لا ينعزل قبل بلوغه خبر عزله وإذا كتب الإمام إليه إذا قرأت كتابي فأنت معزول فقرأه انعزل وكذا إن قرىء عليه في الأصح وينعزل بموته وانعزاله من أذن له في شغل معين كبيع مال ميت والأصح انعزال نائبه المطلق إن لم يؤذن له في استخلاف أو قيل: استخلف عن نفسك أو أطلق فإن قال استخلف عني فلا ولا ينعزل قاض بموت الإمام ولا ناظر اليتيم ووقف بموت قاض ولا يقبل قوله بعد انعزاله حكمت بكذا فإن شهد مع آخر بحكمه لم يقبل على الصحيح أو بحكم حاكم جائر الحكم قبلت في الأصح ويقبل قوله قبل عزله حكمت بكذا فإن كان في غير محل ولايته فكمعزول.

ولو ادعى شخص على معزول أنه أخذ ماله برشوة أو شهادة عبدين مثلا أحضر وفصلت خصومتهما وإن قال حكم بعبدين ولم يذكر مالا أحضر وقيل: لا حتى تقوم بينة بدعواه فإن حضر وأنكر صدق بلا يمين في الأصح.

قلت: الأصح بيمين والله أعلم ولو ادعى على قاض جور في حكم لم يسمع وتشترط بينه وإن لم تتعلق بحكمه حكم بينهما خليفته أو غيره.

فصل

ليكتب الإمام لمن يوليه ويشهد بالكتاب شاهدين يخرجان معه إلى البلد يخبران بالحال وتكفي الاستفاضة في الأصح لا مجرد كتاب على المذهب ويبحث القاضي عن حال علماء البلد وعدوله ويدخل يوم الاثنين وينزل وسط البلد وينظر أولا في أهل الحبس فمن قال حبست بحق أدامه أو ظلما فعلى خصمه حجة فإن كان غائبا كتب إليه ليحضر ثم الأوصياء فمن ادعى وصاية سأل ms232 عنها وعن حاله وتصرفه فمن وجده فاسقا أخذ المال منه أو ضعيفا عضده بمعين ويتخذ مزكيا وكاتبا ويشترط كونه مسلما عدلا عارفا بكتابة محاضر وسجلات ويستحب فقه ووفور عقل وجودة خط ومترجما وشرطه عدالة وحرية وعدد والأصح جواز أعمى واشتراط عدد في إسماع قاض به صمم ويتخذ درة للتأديب وسجنا لأداء حق ولتعزير ويستحب كون مجلسه فسيحا بارزا مصونا من أذى حر وبرد لائقا بالوقت والقضاء لا مسجدا ويكره أن يقضي في حال غضب وجوع وشبع مفرطين وكل حال يسوء خلقه ويندب أن يشاور الفقهاء وأن لا يشتري ويبيع بنفسه ولا يكون له وكيل معروف فإن أهدى إليه من له خصومة أو لم يهد قبل ولايته حرم قبولها وإن كان يهدي ولا خصومة

جاز بقدر العادة والأولى أن يثيب عليها ولا ينفذ حكمه لنفسه ورقيقه وشريكه في المشترك.

وكذا أصله وفرعه على الصحيح ويحكم له ولهؤلاء الإمام أو قاض آخر وكذا نائبه على الصحيح وإذا أقر المدعى عليه أو نكل فحلف المدعي وسأل القاضي أن يشهد على إقراره عنده أو يمينه أو الحكم بما ثبت والإشهاد به لزمه أو أن يكتب له محضرا بما جرى من غير حكم أو سجلا بما حكم استحب إجابته وقيل: تجب ويستحب نسختان إحداهما له والأخرى تحفظ في ديوان الحكم وإذا حكم باجتهاد ثم بان خلاف نصل الكتاب أو السنة أو الإجماع أو قياس جلي نقضه هو وغيره لا خفي والقضاء ينفذ ظاهرا لا باطنا ولا يقضى بخلاف علمه بالإجماع والأظهر أنه يقضي بعلمه إلا في حدود الله تعالى ولو رأى ورقة فيها حكمه أو شهادته أو شهد شاهدان أنك حكمت أو شهدت بهذا لم يعمل به ولم يشهد حتى يتذكر وفيهما وجه ورقة مصونة عندهما وله الحلف على استحقاق حق أو أدائه اعتمادا على خط مورثه إذا وثق بخطه وأمانته والصحيح جواز رواية الحديث بخط محفوظ عنده.

فصل

ليسو بين الخصمين في دخول عليه وقيام لهما واستماع وطلاقه وجه وجواب سلام ومجلس والأصح رفع ms233 مسلم على ذمي فيه وإذا جلسا فله إن يسكت وأن يقول ليتكلم المدعي فإذا ادعى طالب خصمه بالجواب فإن أقر فذاك وإن أنكر فله أن يقول للمدعي

ألك بينة وأن يسكت فإن قال لي بينة وأريد تحليفه فله ذلك أو لا بينة لي ثم أحضرها قبلت في الأصح. وإذا ازدحم خصوم قدم الأسبق فإن جهل أو جاءوا معا أقرع ويقدم مسافرون مستوفزون ونسوة وإن تأخروا ما لم يكثروا ولا يقدم سابق وقارع إلا بدعوى ويحرم اتخاذ شهود معينين لا يقبل غيرهم وإذا شهد شهود فعرف عدالة أو فسقا عمل بعلمه وإلا وجب الاستزكاء بان يكتب مما يتميز به الشاهد والمشهود له وعليه وكذا قدر الدين على الصحيح ويبعث به مزكيا ثم يشافهه المزكي بما عنده وقيل: تكفي كتابته وشرطه كشاهد مع معرفته الجرح والتعديل وخبرة باطن من يعد له لصحبة أو جوار أو معاملة والأصح اشتراط لفظ شهادته وأنه يكفي هو عدل وقيل: يزيد على ولي ويجب ذكر سبب الجرح ويعتمد فيه المعاينة أو الاستفاضة ويقدم على التعديل فإن قال المعدل عرفت سبب الجرح وتاب منه وأصلح قدم والأصح أنه لا يكفي في التعديل قول المدعى عليه هو عدل وقد غلط.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 164;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 2, NULL, 'باب القضاء على الغائب', 'هو جائز إن كان عليه بينة وادعى المدعي جحوده فإن قال هو مقر لم تسمع بينته وإن أطلق فالأصح أنها تسمع وأنه لا يلزم القاضي نصب مسخر ينكر على الغائب ويجب أن يحلفه بعد البينة أن الحق ثابت في ذمته وقيل: يستحب ويجريان في دعوى على صبي أو مجنون ولو ادعى وكيل على الغائب فلا تحليف ولو حضر المدعى عليه وقال لوكيل المدعي أبرأني

موكلك أمر بالتسليم وإذا ثبت مال على غائب وله مال قضاه الحاكم منه وإلا فإن سأل المدعي إنهاء الحال إلى قاضي بلد الغائب أجابه فينهى سماع بينة ليحكم بها ثم يستوفي أو حكما ليستوفي.

والإنهاء أن يشهد عدلين بذلك ويستحب كتاب به يذكر فيه ما يتميز به المحكوم عليه ويختمه ويشهدان ms234 عليه إن أنكر فإن قال لست المسمى في الكتاب صدق بيمينه وعلى المدعي بينة بأن هذا المكتوب اسمه ونسبه فإن أقامها فقال لست المحكوم عليه لزمه الحكم إن لم يكن هناك مشارك له في الاسم والصفات وإن كان أحضر فإن اعترف بالحق طولب وترك الأول وإلا بعث إلى الكاتب ليطلب من الشهود زيادة صفة تميزه ويكتبها ثانيا ولو حضر قاضي بلد الغائب ببلد الحاكم فشافهه بحكمه ففي إمضائه إذا عاد إلى ولايته خلاف القضاء بعلمه ولو ناداه في طرفي ولايتيهما أمضاه وإن اقتصر على سماع بينة كتب سمعت بينة على فلان ويسميها إن لم يعدلها وإلا فالأصح جواز ترك التسمية والكتاب بالحكم يمضي مع قرب المسافة وبسماع البينة لا يقبل على الصحيح إلا في مسافة قبول شهادة على شهادة.

فصل

ادعى عينا غائبة عن البلد يؤمن اشتباهها كعقار وعبد وفرس معروفات سمع بينة وحكم بها وكتب إلى قاضي بلد المال ليسلمه للمدعي ويعتمد في العقار حدوده أو لا يؤمن فالأظهر سماع البينة ويبالغ المدعي في الوصف ويذكر القيمة وأنه لا يحكم بها بل يكتب إلى

قاضي بلد المال بما شهدت به فيأخذه ويبعثه إلى الكاتب ليشهدوا على عينه والأظهر أنه يسلمه إلى المدعي بكفيل ببدنه فإن شهدوا بعينه كتب ببراءة الكفيل وإلا فعلى المدعي مؤنة الرد أو غائبة عن المجلس لا لبلد أمر بإحضار ما يمكن إحضاره ليشهدوا بعينه ولا تسمع شهادة بصفة وإذا وجب إحضار فقال ليس بيدي عين بهذه الصفة صدق بيمينه ثم للمدعي دعوى القيمة فإن نكل فحلف المدعي أو أقام بينة كلف الإحضار وحبس عليه ولا يطلق إلا بإحضار أو دعوى تلف ولو شك المدعي هل تلفت العين فيدعي قيمة أم لا فيدعيها فقال غصب مني كذا فإن بقي لزمه رده وإلا فقيمته سمعت دعواه وقيل: لا بل يدعيها ويحلفه ثم يدعي القيمة ويجريان فيمن دفع ثوبه لدلال ليبيعه فجحده وشك هل باعه فيطلب الثمن أم أتلفه فقيمته أم هو باق فيطلبه وحيث أوجبنا الإحضار فثبت ms235 للمدعي استقرت مؤنته على المدعى عليه وإلا فهو ومؤنة الرد على المدعي.

فصل

الغائب الذي تسمع البينة عليه ويحكم عليه من بمسافة بعيدة وهي التي لا يرجع منها مبكرا إلى موضعه ليلا وقيل: مسافة قصر ومن بقريبة كحاضر فلا تسمع بينته ويحكم بغير حضوره إلا لتواريه أو تعززه والأظهر جواز القضاء على غائب في قصاص وحد قذف ومنعه في حد الله تعالى ولو سمع بينة على غائب فقدم قبل الحكم لم يستعدها بل يخبر ويمكنه من جرح ولو عزل بعد سماع بينة ثم ولى وجبت الاستعادة وإذا استعدى على حاضر البلد أحضره بدفع ختم طين رطب أو غيره أو بمرتب لذلك فإن امتنع بلا عذر أحضره بأعوان

السلطان وعزره أو غائب في غير ولايته فليس له إحضاره أو فيها وله هناك نائب لم يحضره بل يسمع بينة ويكتب إليه أو لا نائب فالأصح يحضره من مسافة العدوى فقط وهي التي لم يرجع منها مبكرا ليلا وأن المخدرة لا تحضر وهي من لا يكثر خروجها لحاجات.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 164;
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 3, NULL, 'باب القسمة', 'قد يقسم شركاء أو منصوبهم أو منصوب الإمام وشرط منصوبه ذكر حر عدل يعلم المساحة والحساب فإن كان فيها تقويم وجب قاسمان وإلا فقاسم وفي قول اثنان وللإمام جعل القاسم حاكما في التقويم فيعمل فيه بعدلين ويقسم ويجعل الإمام رزق منصوبه من بيت المال فإن لم يكن فأجرته على الشركاء فإن استأجروه وسمى كل قدرا لزمه وإلا فالأجرة موزعة على الحصص وفي قول على الرؤوس ثم ما عظم الضرر في قسمته كجوهرة وثوب نفيسين وزوجي خف إن طلب الشركاء كلهم قسمته لم يجبهم القاضي ولا يمنعهم إن قسموا بأنفهسم إن لم تبطل منفعته كسيف يكسر وما يبطل نفعه المقصود كحمام وطاحونة صغيرين لإيجاب طالب قسمته في الأصح فإن أمكن جعله حمامين أجيب ولو كان له عشر دار لا يصلح لسكنى والباقي لآخر فالأصح إجبار صاحب العشر بطلب صاحبه دون عكسه وما لا يعظم ضرره قسمته أنواع:

أحدها: بالأجزاء كمثلى ودار متفقة أبنية وأرض ms236 مشتبهة الأجزاء فيجبر الممتنع فتعدل السهام كيلا أو وزنا أو ذرعا بعدد الانصباء إن استوت ويكتب في كل رقعة اسم شريك

أو جزء مميز بحد أو جهة وتدرج في بنادق مستوية ثم يخرج من لم يحضرها رقعة على الجزء الأول إن كتب الأسماء فيعطى من خرج اسمه أو على اسم زيد إن كتب الأجزاء فإن اختلفت الأنصباء كنصف وثلث وسدس جزئت الأرض على أقل السهام وقسمت كما سبق ويحترز عن تفريق حصة واحد.

الثاني: بالتعديل كأرض تختلف قيمة أجزائها بحسب قوة إنبات وقرب ماء ويجبر عليها في الأظهر ولو استوت قيمة دارين أو حانوتين طلب جعل كل لواحد فلا إجبار أو عبيد أو ثياب من نوع أجبر أو نوعين فلا.

الثالث: بالرد بأن يكون في أحد الجانبين بئر أو شجر لا يمكن قسمته فيرد من يأخذه قسط قيمته ولا إجبار فيه وهو بيع وكذا التعديل على المذهب وقسمة الأجزاء إفراز في الأظهر.

ويشترط في الرد الرضا بعد خروج القرعة ولو تراضيا بقسمة مالا إجبار فيه اشترط الرضا بعد القرعة في الأصح كقولهما رضينا بهذه القسمة أو بما أخرجته القرعة ولو ثبت ببينة غلط أو حيف في قسمة إجبار نقضت فإن لم تكن بينة وادعاه واحد فله تحليف شريكه ولو ادعاه في قسمة تراض وقلنا هي بيع فالأصح أنه لا أثر للغلط فلا فائدة لهذه الدعوى.

قلت: وإن قلنا إفراز نقضت إن ثبت وإلا فيحلف شريكه والله أعلم ولو استحق بعض المقسوم شائعا بطلت فهي وفي الباقي خلاف تفريق الصفة أو من النصيبين معين سواء بقيت وإلا بطلت. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 164;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 165, 'كتاب الشهادات', 'كتاب الشهادات');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'شرط الشاهد مسلم حر مكلف عدل ذو مروءوة غير متهم وشرط العدالة اجتناب الكبائر والإصرار على صغيرة ويحرم اللعب بالنرد على الصحيح ويكره بشطرنج فإن شرط فيه مال من الجانبين فقمار ويباح الحداء وسماعه ويكره الغناء بلا آلة وسماعه ويحرم استعمال آلة من شعار الشربة كطنبور وعود وصنج ومزمار عراقي وإسماعها لا يراع في الأصح.

قلت: الأصح تحريمه والله ms237 أعلم ويجوز دف لعرس وختان وكذا غيرهما في الأصح وإن كان فيه جلاجل ويحرم ضرب الكوبة وهي طبل طويل ضيق الوسط لا الرقص إلا أن يكون فيه تكسر كفعل المخنث ويباح قول شعر وإنشاده إلا أن يهجو أو يفحش أو يعرض بامرأة معينة والمروءة تخلق بخلق أمثاله في زمانه ومكانه فالأكل في سوق والمشي مكشوف الرأس وقبلة زوجة وأمة بحضرة الناس وإكثار حكايات مضحكة ولبس فقيه قباء وقلنسوة حيث لا يعتاد وإكباب على لعب الشطرنج أو غناء أو سماعه وإدامة رقص يسقطها والأمر فيه يختلف بالأشخاص والأحوال والأماكن وحرفة دنيئة كحجامة وكنس ودبغ ممن لا تليق به تسقطها فإن اعتادها وكانت حرفة أبيه فلا في الأصح والتهمة أن يجر إليه نفعا أو يدفع عنه

ضررا فترد شهادته لعبده ومكاتبه وغريم له ميت أو عليه حجر فليس وبما هو وكيل فيه وببراءة من ضمنه وبجراحة مورثه ولو شهد لمورث له مريض أو جريح بمال قبل الاندمال قبلت في الأصح وترد شهادة عاقلة بفسق شهود قتل وغرماء مفلس بفسق وشهودا دين آخر.

ولو شهدا لاثنين بوصية فشهدا للشاهدين بوصية من تلك التركة قبلت الشهادتان في الأصح ولا تقبل لأصل ولا فرع وتقبل عليهما وكذا على أبيهما بطلاق ضرة أمهما أو قذفها في الأظهر وإذا شهد لفرع وأجنبي قبلت للأجنبي في الأظهر.

قلت: وتقبل لكل من الزوجين ولأخ وصديق والله أعلم ولا تقبل من عدو وهو من يبغضه بحيث يتمنى زوال نعمته ويحزن بسروره ويفرح بمصيبته وتقبل له وكذا عليه في عدواة دين ككافر ومبتدع وتقبل شهادة مبتدع لا نكفره لا مغفل لا يضبط ولا مبادر وتقبل شهادة الحسبة في حقوق الله تعالى وفيما له فيه حق مؤكد كطلاق وعتق وعفو عن قصاص وبقاء عدة وانقضائها وحد له.

وكذا النسب على الصحيح ومتى حكم بالشاهدين فبانا كافرين أو عبدين أو صبيين نقضه هو وغيره. وكذا فاسقان في الأظهر ولو شهد كافر أو عبد وصبي ثم أعادها بعد كماله قبلت أو فاسق تاب فلا ms238 وتقبل شهادة غيرها بشرط اختباره بعد التوبة مدة يظن بها صدق توبته وقدرها الأكثرون بسنة ويشترط في توبة معصية قولية القول فيقول القاذف قذفي باطل وأنا نادم عليه لا أعود إليه وكذا شهادة الزور.

قلت: وغير القولية يشترط إقلاع وندم وعزم أن لا يعود ورد ظلامه آدمي إن تعلقت به. والله أعلم.

فصل

لا يحكم بشاهد إلا في هلال رمضان في الأظهر ويشترط للزنا أربعة رجال وللإقرار به اثنان وفي قول أربعة ولمال وعقد مالي كبيع وإقالة وحوالة وضمان وحق مالي كخيار وأجل رجلان أو رجل وامرأتان ولغير ذلك من عقوبة الله تعالى أو لآدمي وما يطلع عليه رجال غالبا كنكاح وطلاق ورجعة وإسلام وردة وجرح وتعديل وموت وإعسار ووكالة ووصاية وشهادة على شهادة رجلان وما يختص بمعرفته النساء أو لا يراه رجال غالبا كبكارة وولادة وحيض ورضاع وعيوب تحت الثياب يثبت بما سبق وبأربع سنوة وما لا يثبت برجل وامرأتين لا يثبت برجل ويمين وما ثبت بهم ثبت برجل ويمين إلا عيوب النساء ونحوها ولا يثبت شيء بامرأتين ويمين وإنما يحلف المدعي بعد شهادة شاهده وتعديله ويذكر في حلفه صدق الشاهد فإن ترك الحلف وطلب يمين خصمه فله ذلك فإن نكل فله أن يحلف يمين الرد في الأظهر. ولو كان بيده أمة وولدها فقال رجل هذه مستولدتي علقت بهذا في ملكي وحلف مع شاهد ثبت الإستيلاد لا نسب الولد وحريته في الأظهر.

ولو كان بيده غلام فقال رجل كان لي وأعتقته وحلف مع شاهد فالمذهب انتزاعه ومصيره حرا ولو ادعت ورثة مالا لمورثهم وأقاموا شاهدا وحلف معه بعضهم أخذ نصيبه ولا يشارك فيه ويبطل حق من لم يحلف بنكوله إن حضر وهو كامل فإن كان غائبا أو صبيا أو مجنونا

فالمذهب أنه لا يقبض نصيبه فإذا زال عذره حلف وأخذ بغير إعادة شهادة ولا تجوز شهادة على فعل كربا وغصب وإتلاف وولادة إلا بالأبصار وتقبل من أصم والأقوال كعقد يشترط سمعها وإبصار قائلها ولا يقبل أعمى إلا أن يقر ms239 في أذنه فيتعلق به حتى يشهد عند قاض به على الصحيح ولو حملها بصير ثم عمى شهد إن كان المشهود له وعليه معروفي الاسم والنسب ومن سمع قول شخص أو رأى فعله فإن عرف عينه واسمه ونسبه شهد عليه في حضوره إشارة وعند غيبته وموته باسمه فإن جهلهما لم يشهد عند موته وغيبته ولا يصح تحمل شهادة على منتقبة اعتمادا على صوتها فإن عرفها بعينها أو باسم ونسب جاز ويشهد عند الأداء بما يعلم ولا يجوز التحمل عليها بتعريف عدل أو عدلين على الأشهر والعمل على خلافه.

ولو قامت بينة على عينه بحق فطلب المدعي التسجيل سجل القاضي بالحلية لا الاسم والنسب ما لم يثبتا وله الشهادة بالتسامع على نسب من أبيه وقبيله وكذا أم في الأصح وموت على المذهب لا عتق وولاء ووقف ونكاح وملك في الأصح.

قلت: الأصح عند المحققين والأكثرين في الجميع الجواز والله أعلم وشرط التسامع سماعه من جمع يؤمن تواطؤهم على الكذب وقيل: يكفي من عدلين ولا تجوز الشهادة على ملك بمجرد يد ولا بيد وتصرف في مدة قصيرة وتجوز في طويلة في الأصح وشرطه تصرف ملاك من سكنى وهدم وبناء وبيع ورهن وتبني شهادة الإعسار على قرائن ومخائل الضر والإضافة.

فصل

تحمل الشهادة فرض كفاية في النكاح وكذا الإقرار والتصرف المالي وكتابة الصك في الأصح وإذا لم يكن في القضية إلا اثنان لزمهما الأداء فلو أدى واحد وامتنع الآخر وقال احلف معه عصى وإن كان شهود فالأداء فرض كفاية فلو طولب من اثنين لزمهما في الأصح وإن لم يكن إلا واحد لزمه إن كان فيما يثبت بشاهد ويمين وإلا فلا وقيل: لا يلزم الأداء إلا من تحمل قصدا لا اتفاقا ولوجوب الأداء شروط أن يدعي من مسافة العدوى وقيل: دون مسافة قصر وأن يكون عدلا فإن ادعى ذو فسق مجمع عليه قيل: أو مختلف فيه لم يجب وأن لا يكون معذورا بمرض ونحوه فإن كان أشهد على شهادته أو بعث القاضي من يسمعها.

فصل ms240

تقبل الشهادة على الشهادة في غير عقوبة وفي عقوبة الآدمي على المذهب وتحملها بان يسترعيه فيقول أنا شاهد بكذا وأشهدك أو أشهد على شهادتي أو يسمعه يشهد عند قاض أو يقول أشهد أن لفلان على فلان ألفا عن ثمن مبيع أو غيره وفي هذا وجه ولا يكفي سماع قوله لفلان على فلان كذا أو أشهد بكذا أو عندي شهادة بكذا وليبين الفرع عند الأداء جهة التحمل فإن لم يبن ووثق القاضي بعلمه فلا بأس ولا يصح التحمل على شهادة مردود الشهادة ولا تحمل النسوة فإن مات الأصل أو غاب أو مرض لم يمنع شهادة الفرع وإن حدث ردة أو فسق أو عداوة منعت وجنونه كموته على الصحيح ولو تحمل فرع فاسق أو عبد فأدى وهو كامل قبلت ويكفي شهادة اثنين على الشاهدين وفي قول يشترط لكل رجل أو امرأة اثنان وشرط قبولها تعذر أو تعسر الأصيل بموت أو عمى أو مرض يشق

حضوره أو غيبة لمسافة عدوى وقيل: قصر وأن يسمى الأصول ولا يشترط أن يزكيهم الفروع فإن زكوهم ولو شهدوا على شهادة عدلين أو عدول ولم يسموهم لم يجز.

فصل

رجعوا عن الشهادة قبل الحكم امتنع أو بعده وقبل استيفاء مال استوفى أو عقوبة فلا أو بعده لم ينقض فإن كان المستوفى قصاصا أو قتل ردة أو رجم زنا أو جلده ومات وقالوا تعمدنا فعليهم قصاص أودية مغلظة وعلى القاضي قصاص إن قال تعمدت وإن رجع هو وهم فعلى الجميع قصاص إن قالوا تعمدنا فإن قالوا أخطأنا فعليه نصف دية وعليهم نصف ولو رجع مزك فالأصح أنه يضمن أو ولي وحده فعليه قصاص أو دية أو مع الشهود فكذلك.

وقيل: هو وهم شكراء ولو شهدا بطلاق بائن أو رضاع أو لعان وفرق القاضي فرجعا دام الفراق وعليهم طلاق مثل وفي قول نصفه إن كان قبل وطء ولو شهدا بطلاق وفرق فرجعا فقامت بينة أنه كان بينهما رضاع فلا غرم ولو رجع شهود مال غرموا في الأظهر ومتى رجعوا كلهم ms241 وزع عليهم الغرم أو بعضهم وبقي نصاب فلا غرم وقيل: يغرم قسطه وإن نقص النصاب ولم تزد الشهود عليه فقسط وإن زاد فقسط من النصاب.

وقيل: من العدد وإن شهد رجل وامرأتان فعليه نصف وهما نصف أو أربع في رضاع فعليه ثلث وهن ثلثان فإن رجع هو أو ثنتان فلا غرم في الأصح وإن شهد هو وأربع بمال فقيل: كرضاع والأصح هو نصف وهن نصف سواء رجعن معه أو وحدهن وإن رجع ثنتان فالأصح لا غرم وأن شهود إحصان أو صفة مع شهود تعليق طلاق وعتق لا يغرمون.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 165;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 166, 'كتاب الدعوى والبينات', 'كتاب الدعوى والبينات');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'تشترط الدعوى عند قاض في عقوبة كقصاص وقذف وإن استحق عينا فله أخذها إن لم يخف فتنة وإلا وجب الرفع إلى قاض أو دينا على غير ممتنع من الأداء طالبه ولا يحل أخذ شيء له أو على منكر ولا بينة أخذ جنس حقه من ماله وكذا غير جنسه إن فقده على المذهب أو على مقر ممتنع أو منكر وله بينة فكذلك وقيل: يجب الرفع إلى قاض وإذا جاز الأخذ فله كسر باب ونقب جدار لا يصل المال إلا به ثم المأخوذ من جنسه يتملكه ومن غيره يبيعه وقيل: يجب رفعه إلى قاض يبيعه والمأخوذ مضمون عليه في الأصح فيضمنه إن تلف قبل تملكه وبيعه ولا يأخذ فوق حقه إن أمكن الاقتصار وله أخذ مال غريم غريمه والأظهر أن المدعي من يخالف قوله الظاهر والمدعى عليه من يوافقه فإذا أسلم زوجان قبل وطء فقال أسلمنا مع فالنكاح باق وقالت مرتبا فهو مدع ومتى ادعى نقدا اشترط بيان جنس ونوع وقدر وصحة وتكسر إن اختلفت بهما قيمته أو عينا تنضبط كحيوان وصفها بصفة السلم.

وقيل: يجب معها ذكر القيمة فإن تلفت وهي متقومة وجب ذكر القيمة أو نكاحا لم يكف الإطلاق على الأصح بل يقول نكحتها بولي مرشد وشاهدي عدل ورضاها إن كان يشترط فإن كانت أمة فالأصح وجوب ذكر العجز عن طول وخوف عنت أو عقدا ماليا كبيع وهبة كفى ms242

الإطلاق في الأصح ومن قامت عليه بينة ليس له تحليف المدعي فإن ادعى أداء أو إبراء أو شراء عين أو هبتها وإقباضها حلفه على نفيه وكذا لو ادعى علمه بفسق شاهده أو كذبه في الأصح وإذا استمهل ليأتي بدافع أمهل ثلاثة أيام ولو ادعى رق بالغ فقال أنا حر فالقول قوله أو رق صغير ليس في يده لم يقبل إلا ببينة أو في يده حكم له به إن لم يعرف استنادها إلى التقاط فلو أنكر الصغير وهو مميز فإنكاره لغو وقيل: كبالغ ولا تسمع دعوى دين مؤجل في الأصح.

فصل

أصر المدعى عليه على السكوت عن جواب الدعوى جعل كمنكر ناكل فإن ادعى عشرة فقال لا تلزمني العشرة لم يكف حتى يقول ولا بعضها وكذا يحلف فإن حلف على نفي العشرة واقتصر عليه فناكل فيحلف المدعي على استحقاق دون عشرة بجزء ويأخذه وإذا ادعى مالا مضافا إلى سبب كأقرضتك كذا كفاه في الجواب لا تستحق علي شيئا أو شفعة كفاه لا تستحق علي شيئا أو لا تستحق تسلم الشقص ويحلف على حسب جوابه هذا فإن أجاب بنفي السبب المذكور حلف عليه.

وقيل: له حلف بالنفي المطلق ولو كان بيده مرهون أو مكرى وادعاه مالكه كفاه لا يلزمني تسليمه فلو اعترف بالملك وادعى الرهن والإجارة فالصحيح أنه لا يقبل إلا ببينة فإن عجز عنها وخاف أولا إن اعترف بالملك مجده الرهن وإلا جاز فحيلته أن يقول إن ادعيت ملكا مطلقا فلا يلزمني تسليم وإن ادعيت مرهونا فاذكره لأجيب وإذا ادعى عليه عينا

فقال ليس هي لي أو هي لرجل لا أعرفه أو لابني الطفل أو وقف على الفقراء أو مسجد كذا في الأصح أنه لا تنصرف الخصومة ولا تنزع منه بل يحلفه المدعي أنه لا يلزمه التسليم إن لم تكن بينة وإن أقر به لمعين حاضر يمكن مخاصمته وتحليفه سئل فإن صدقه صارت الخصومة معه وإن كذبه ترك في يد المقر وقيل: يسلم إلى المدعي وقيل: يحفظه الحاكم لظهور مالك وإن ms243 أقر به لغائب فالأصح انصراف الخصومة عنه ويوقف الأمر حتى يقدم الغائب فإن كان للمدعي بينة قضى بها وهو قضاء على غائب فيحلف معه وقيل: على حاضر وما قبل إقرار عبد به كعقوبة فالدعوى عليه وعليه الجواب ومالا كأرش فعلى السيد.

فصل

تغلظ يمين مدع ومدعى عليه فيما ليس بمال ولا يقصد به مال وفي مال يبلغ نصاب زكاة وسبق بيان التغليظ في اللعان ويحلف على البت في فعله وكذا فعل غيره إن كان إثباتا وإن كان نفيا فعلى نفي العلم ولو ادعى دينا لمورثه فقال أبرأني حلف على نفي العلم بالبراءة ولو قال جنى عبدك علي بما يوجب كذا فالأصح حلفه على البت.

قلت: ولو قال جنت بهيمتك حلف على البت قطعا والله أعلم ويجوز البت بظن مؤكد يعتمد خطه أو خط أبيه وتعتبر نية القاضي المستحلف فلو ورى أو تأول خلافها أواستثنى بحيث لا يسمع القاضي لم يدفع إثم اليمين الفاجرة ومن توجهت عليه يمين لو أقر بمطلوبها لزمه فأنكر حلف ولا يحلف قاض على تركه الظلم في حكمه ولا شاهد أنه لم يكذب ولو قال مدعى عليه أنا صبي لم يحلف ووقف حتى يبلغ واليمين تفيد قطع الخصومة في الحال لا براءة فلو حلفه ثم أقام بينة حكم بها ولو قال المدعى عليه قد حلفني مرة فليحلف أنه لم يحلفني مكن في الأصح وإذا نكل حلف المدعي وقضى له ولا يقضي

بنكوله والنكول أن يقول أنا ناكل أو يقول له القاضي احلف فيقول لا أحلف فإن سكت حكم القاضي بنكوله وقوله للمدعي احلف حكم بنكوله واليمين المردودة في قوله كبينة وفي الأظهر كإقرار المدعى عليه فلو أقام المدعى عليه بعدها بينة بأداء أو إبراء لم تسمع فإن لم يحلف المدعي ولم يتعلل بشيء سقط حقه من اليمين وليس له مطالبة الخصم وإن تعلل بإقامة بينة أو مراجعة حساب أمهل ثلاثة أيام وقيل: أبدا وإن استمهل المدعى عليه حين استحلف لينظر حسابه لم يمهل وقيل: ثلاثة ولو استمهل ms244 في ابتداء الجواب أمهل إلى آخر المجلس ومن طولب بزكاة فادعى دفعها إلى ساع آخر أو غلط خارص وألزمناه اليمين فنكل وتعذر رد اليمين فالأصح أنها تؤخذ منه ولو ادعى ولى صبي دينا له فأنكر ونكل لم يحلف المولي وقيل: يحلف وقيل: إن ادعى مباشرة سببه حلف.

فصل

ادعيا عينا في يد ثالث وأقام كل منهما بينة سقطتا وفي قول تستعملان ففي قول تقسم وقول يقرع وقول توقف حتى تبين أو يصطلحا ولو كانت في يدهما وأقاما بينتين بقيت كما كانت ولو كانت بيده فأقام غيره بها بينة وهو بينة قدم صاحب اليد ولا تسمع بينته إلا بعد بينة

المدعي. ولو أزيلت يده ببينة ثم أقام بينة بملكه مسندا إلى ما قبل إزالة يده واعتذر بغيبة شهوده سمعت وقدمت وقيل: لا ولو قال الخارج هو ملكيك اشتريته منك فقال بل ملكي وأقاما بينتين قدم الخارج ومن أقر لغيره بشيء ثم ادعاه لم تسمع إلا أن يذكر انتقالا ومن اخذ منه مال ببينة ثم ادعاه لم يشترط ذكر الانتقال في الأصح والمذهب أن زيادة عدد شهود أحدهما لا ترجع وكذا لو كان لأحدهما رجلان وللآخر رجل وامرأتان فإن كان للآخر شاهد ويمين رجح الشاهدان في الأظهر ولو شهدت لأحدهما بملك من سنة وللآخر من أكثر فالأظهر ترجح الأكثر ولصاحبها الأجرة والزيادة الحادثة من يومئذ ولو أطلقت بينة وأرخت بينة فالمذهب أنهما سواء وأنه لو كان لصاحب متأخرة التاريخ يد قدم وأنها لو شهدت بملكه أمس ولم تتعرض للحال لم تسمع حتى يقولوا لو يزل ملكه أو لا نعلم مزيلا له وتجوز الشهادة بملكه الآن استصحابا لما سبق من إرث وشراء وغيرهما ولو شهدت بإقراره أمس بالملك له استديم ولو أقامها بملك دابة أو وشجرة لم يستحق ثمرة موجودة ولا ولدا منفصلا ويستحق حملا في الأصح ولو اشترى شيئا فأخذ منه بحجة مطلقة رجع على بائعه بالثمن وقيل: لا إلا إذا ادعى في ملك سابق على الشراء ولو ادعى ملكا مطلقا فشهدوا ms245 له مع سببه لم يضر وإن ذكر سببا وهم سببا آخر ضر.

فصل

قال آجرتك البيت بعشرة قال بل جميع الدار بالعشرة وأقاما بينتين تعارضتا وفي قول يقدم المستأجر ولو ادعيا شيئا في يد ثالث وأقام كل منهما بينة أنه اشتراه ووزن له ثمنه فإن اختلف تاريخ حكم للأسبق وإلا تعارضتا ولو قال كل منهما بعتكه بكذا أو أقامهما فإن

اتحد تاريخهما تعارضتا وإن اختلف لزمه الثمنان وكذا إن أطلقتا أو إحداهما في الأصح.

ولو مات عن ابنين مسلم ونصراني فقال كل منهما مات على ديني فإن عرف أنه كان نصرانيا صدق النصراني فإن أقاما بينتين مطلقتين قدم المسلم وإن قيدت أن آخر كلامه إسلام وعكسته الأخرى تعارضتا وإن لم يعرف دينه وأقام كل بينة أنه مات على دينه تعارضتا.

ولو مات نصراني عن ابنين مسلم ونصراني فقال المسلم أسلمت بعد موته فالميراث بيننا فقال النصراني بل قبله صدق المسلم بيمينه وإن أقاماهما قدم النصراني فلو اتفقا على إسلام الابن في رمضان وقال المسلم مات الأب في شعبان وقال النصراني في شوال صدق النصراني وتقدم بينة المسلم على بينته ولو مات عن أبوين كافرين وابنين مسلمين فقال كل مات على ديننا صدق الأبوان باليمين وفي قول يوقف حتى يبين أو يصطلحوا.

ولو شهدت أنه أعتق في مرض موته سالما وأخرى غانما وكل واحد ثلث ماله فإن اختلف تاريخ قدم الأسبق وإن اتحد أقرع وإن أطلقتا قيل: يقرع وقيل: في قول يعتق من كل نصفه.

قلت: المذهب يعتق من كل نصفه والله أعلم ولو شهد أجنبيان أنه أوصى بعتق سالم وهو ثلث ووارثان حائزان أنه رجع عن ذلك ووصى بعتق غانم وهو ثلثه ثبتت لغانم فإن كان الوارثان فاسقين لم يثبت الرجوع فيعتق سالم ومن غانم ثلث ماله بعد سالم.

فصل

شرط لقائف مسلم عدل مجرب والأصح اشتراط حر ذكر لا عدد ولا كونه مدلجيا فإذا تداعيا مجهولا عرض عليه وكذا لو اشتركا في وطء فولدت ممكنا منهما وتنازعاه بأن وطئا ms246 بشبهة أو مشتركا لهما ولو وطىء زوجته وطلق فوطئها آخر بشبهة أو نكاح فاسد أو أمته فباعها فوطئها المشتري ولم يستبرىء واحد منهما وكذا لو وطىء منكوحة في الأصح فإذا ولدت لما بين ستة أشهر وأربع سنين من وطأيهما وادعياه عرض عليه فإن تخلل بين وطأيهما حيضة فللثاني إلا أن يكون الأول جاوز في نكاح صحيح وسواء فيهما اتفقا إسلاما وحرية أم لا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 166;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 167, 'كتاب العتق', 'كتاب العتق');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'إنما يصح من مطلق التصرف ويصح تعليقه وإضافته إلى جزء فيعتق كله وصريحه تحرير وإعتاق وكذا فك رقبة في الأصح ولا يحتاج إلى نية ويحتاج إليها كنايته وهي لا ملك لي عليك لا سلطان لا سبيل لا خدمة أنت سائبة أنت مولاي وكذا كل صريح أو كناية للطلاق وقوله لعبد أنت حرة ولأمة أنت حر صريح ولو قال عتقك إليك أو خيرتك ونوى تفويض العتق إليه فأعتق نفسه في المجلس عتق أو أعتقتك على ألف أو أنت حر على ألف فقبل أو قال له العبد أعتقني على ألف فأجابه عتق في الحال ولزمه ألف ولو قال بعتك نفسك بألف فقال اشتريت فالمذهب صحة لبيع ويعتق في الحال وعليه الألف والولاء لسيده ولو قال لحامل أعتقتك أو أعتقك دون حملك عتقا ولو اعتقه عتق دونها ولو كانت لرجل والحمل لآخر لم يعتق الآخر وإذا كان بينهما عبد فاعتق نصيبهما كله أو نصيبه عتق نصيبه فإن كان معسرا بقي الباقي لشريكه والأسرى إليه أو إلى ما أيسر به وعليه قيمة ذلك يوم الاعتقاق وتقع السراية بنفس الإعتاق وفي قول بأداء القيمة وقول إن دفعها بان أنها بالإعتاق واستيلاد أحد الشريكين الموسر يسري وعليه قيمة نصيب شريكه وحصته من مهر مثل وتجري الأقوال في وقت حصول السراية فعلى الأول والثالث: لا تجب قيمة

حصته من الولد ولا يسري تدبير ولا يمنع السراية دين مستغرق في الأظهر ولو قال لشريكه الموسر أعتقت نصيبك فعليك قيمة نصيبي فأنكر صدق بيمينه فلا عتق نصيبه ويعتق نصيب المدعي بإقراره إن قلنا يسري ms247 بالإعتاق ولا يسري إلى نصيب المنكر ولو قال لشريكه إن أعتقت نصيبك فنصيبي حر بعد نصيبك فاعتق الشريك وهو موسر سرى إلى نصيب الأول إن قلنا السراية بالإعتاق وعليه قيمته ولو قال فنصيبي حرا جله فاعتق الشريك فإن كان المعلق معسر اعتق نصيب كل عنه والولاء لهما.

وكذا إن كان موسرا وأبطلنا الدور وإلا فلا يعتق شيء ولو كان عبد لرجل نصفه ولآخر ثلثه ولآخر سدسه فاعتق الآخران نصيبهما معا فالقيمة عليهما نصفان على المذهب وشرط السراية إعتاقه باختياره فلو ورث بعض ولده لم يسروا لمريض معسر إلا في ثلث ماله والميت معسر فلو أوصى بعتق نصيبه لم يصر.

فصل

إذا ملك أهل تبرع أصله أو فرعه عتق ولا يشتري لطفل قريبه ولو وهب له أو وصى له فإن كان كاسبا فعلى الولي قبوله ويعتق وينفق من كسبه وإلا فإن كان الصبي معسرا وجب القبول ونفقته في بيت المال أو موسرا حرم ولو ملك في مرض موته قريبه بلا عوض عتق من ثلثه وقيل: من رأس المال أو بعوض بلا محاباة فمن ثلثه ولا يرث فإن كان عليه دين فقيل: لا يصح الشراء والأصح صحته ولا يعتق بل يباع للدين أو بمحاباة فقدرها كهبة والباقي من الثلث ولو وهب لعبد بعض قريب سيده فقبل وقلنا يستقبل به عتق وسرى وعلى سيده قيمة باقيه.

فصل

أعتق في مرض موته عبدا لا يملك غيره عتق ثلثه فإن كان عليه دين مستغرق لم يعتق شيء منه ولو أعتق ثلاثة لا يملك غيرهم قيمتهم سواء عتق أحدهم بقرعة وكذا لو قال أعتقت ثلثكم أو ثلثكم حر ولو قال أعتقت ثلث كل عبد أقرع وقيل: يعتق من كل ثلثه والقرعة أن يؤخذ ثلاث رقاع متساوية يكتب في ثنتين رق وفي واحدة عتق وتدرج في بنادق كما سبق وتخرج واحدة باسم أحدهم فإن خرج العتق عتق ورق الآخران أو الرق رق وأخرجت أخرى باسم آخر ويجوز أن يكتب أسماؤهم ثم تخرج رقعة على الحرية فمن خرج ms248 اسمه عتق ورقا وإن كانوا ثلاثة قيمة واحد مائة وآخر مائتان وآخر ثلثمائة أقرع بسهمي رق وسهم عتق فإن خرج العتق لذي المائتين عتق ورقا أو للثالث عتق ثلثاه أو للأول عتق ثم يقرع بين الآخرين بسهم رق وسهم عتق فمن خرج تمم منه الثلث وإن كانوا فوق ثلاثة وأمكن توزيعهم بالعدد والقيمة كستة قيمتهم سواء جعلوا اثنين اثنين أو بالقيمة دون العدد كستة قيمة أحدهم مائة وقيمة اثنين مائة وثلاثة مائة جعل الأول جزأ والاثنان جزأ والثلاثة جزأ وإن تعذر بالقيمة كأربعة قيمتهم سواء ففي قول يجزؤن ثلاثة أجزاء واحد وواحد واثنان فإن خرج العتق لواحد عتق ثم أقرع لتتميم الثلث أو للاثنين رق الآخران ثم أقرع بينهم فيعتق

من خرج له العتق وثلث الآخر وفي قول يكتب اسم كل عبد في رقعة فيعتق من خرج أولا وثلث الثاني.

قلت: أظهرهما الأول والله أعلم والقولان في استحباب وقيل: إيجاب وإذا أعتقنا بعضهم بقرعة فظهر مال وخرج كلهم من الثلث عتقوا ولهم كسبهم من يوم الإعتاق ولا يرجع الوارث بما أنفق عليهم وإن خرج بما ظهر عبد آخر أقرع ومن عتق بقرعة حكم بعتقه من يوم الإعتاق وتعتبر قيمته حينئذ وله كسبه من يومئذ غير محسوب من الثلث ومن بقي رقيقا قوم يوم الموت وحسب من الثلثين هو وكسبه الباقي قبل الموت لا الحادث بعده فلو أعتق ثلاثة لا يملك غيرهم قيمة كل مائة وكسب أحدهم مائة أقرع فإن خرج العتق للكاسب عتق وله المائة وإن خرج لغيره عتق ثم أقرع فإن خرجت لغيره عتق ثلثه وإن خرجت له عتق ربعه وتبعه ربع كسبه.

فصل

من عتق عليه رقيق باعتاق أو كتابة وتدبير واستيلاد وقرابه وسراية فولاؤه له ثم لعصبته ولا ترث امرأة بولاء إلا من عتيقها وأولاده وعتقائه فإن عتق عليها أبوها ثم أعتق عبدا فمات بعد موت الأب تبلا وارث فماله للبنت والولاء لأعلى العصبات ومن مسه رق فلا ولاء عليه إلا لمعتقه وعصبته ولو نكح عبد معتقة ms249 فأتت بولد فولاؤه لمولى الأم فإن أعتق الأب انجر إلى مواليه ولو مات الأب رقيقا وعتق الجد انجر إلى مواليه فإن أعتق الجد والأب رقيقا انجر فإن أعتق الأب بعده انجر إلى مواليه وقيل: يبقى لمولى الأم حتى يموت الأب فينجر إلى موالي الجد ولو ملك هذا الولد أباه جر ولاء إخوته إليه وكذا ولاء نفسه في الأصح.

قلت: الأصح المنصوص لا يجره. والله أعلم.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 167;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 168, 'كتاب التدبير', 'كتاب التدبير');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'صريحه أنت حر بعد موتي أو إذا مت أو متى مت فأنت حر أو أعتقتك بعد موتي وكذا دبرتك أو أنت مدبر على المذهب ويصح بكناية عتق مع نية كخليت سبيلك بعد موتي ويجوز مقيدا كان مت في ذا الشهر أو المرض فأنت حر ومعلقا كان دخلت فأنت حر بعد موتي فإن وجدت الصفة ومات عتق وإلا فلا ويشترط الدخول قبل موت السيد فإن قال إن مت ثم دخلت فأنت حر اشترط دخول بعد الموت وهو على التراخي وليس للوارث بيعه قبل الدخول ولو قال إذا مت ومضى شهر فأنت حر فللوارث استخدامه في الشهر لا بيعه ولو قال إن شئت فأنت مدبر أو أنت حر بعد موتي إن شئت اشترطت المشيئة متصلة فإن قال متى شئت فللتراخي ولو قالا لعبدهما إذا متنا فأنت حر لم يعتق حتى يموتا فإن مات أحدهما فليس لوارثه بيع نصيبه ولا يصح تدبير مجنون وصبي لا يميز وكذا مميز في الأظهر ويصح من سفيه وكافر أصلى وتدبير المرتد يبني على أقوال ملكه.

ولو دبر ثم ارتد لم يبطل على المذهب ولو ارتد المدبر لم يبطل والحربي حمل مدبره إلى دارهم ولو كان لكافر عبد مسلم فدبره نقض وبيع عليه ولو دبر كافر كافر فأسلم ولم

يرجع السيد في التدبير نزع من يد سيده وصرف كسبه إليه وفي قول يباع وله بيع المدبر والتدبير تعليق عتق بصفة وفي قول وصية فلو باعه ثم ملكه لم يعد التدبير على المذهب ولو رجع عنه بقول كأبطلته فسخته نقضته رجعت فيه ms250 صح إن قلنا وصية وإلا فلا ولو علق مدبر بصفة صح وعتق بالأسبق من الموت والصفة وله وطء مدبرة ولا يكون رجوعا فإن أولدها بطل تدبيره ولا يصح تدبير أم ولد ويصح تدبير مكاتب وكتابة مدبر.

فصل

ولدت مدبرة من نكاح أو زنا لا يثبت للولد حكم التدبير في الأظهر ولو كانت حاملا ثبت له حكم التدبير على المذهب فإن ماتت أو رجع في تدبيرها دام تدبيره وقيل: إن رجع وهو متصل فلا ولو دبر حملا صح فإن مات عتق دون الأم وإن باعها صح وكان رجوعا عنه ولو ولدت المعلق عتقها لم يعتق الولد وفي قول إن عتقت بالصفة عتق ولا يتبع مدبرا ولده وجنايته كجناية قن ويعتق بالموت من الثلث كله أو بعضه بعد الدين ولو علق عتقا على صفة تختص بالمرض كإن دخلت في مرض موتي فأنت حر عتق من الثلث وإن احتملت الصحة فوجدت في المرض فمن رأس المال في الأظهر ولو ادعى عبده التدبير فأنكر فليس برجوع بل يحلف ولو وجد مع مدبر مال فقال كسبته بعد موت السيد وقال الوارث قبله صدق بيمينه وإن أقاما بينتين قدمت بينته.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 168;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 169, 'كتاب الكتابة', 'كتاب الكتابة');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'هي مستحبة إن طلبها رقيق أمين قوي على كسب قيل: أو غير قوي ولا تكره بحال وصيغتها كاتبتك على كذا منجما إذا أديته فأنت حر ويبين عدد النجوم وقسط كل نجم ولو ترك لفظ التعليق ونواه جاز ولا يكفي لفظ كتابة بلا تعليق ولا نية على المذهب ويقول المكاتب قبلت وشرطهما تكليف وإطلاق وكتابة المريض من الثلث فإن كان له مثلاه صحت كتابة كله فإن لم يملك غيره وأدى في حياته مائتين وقيمته مائة عتق وإن أدى مائة عتق ثلثاه ولو كاتب مرتد بنى على أقوال ملكه فإن وقفناه بطلت على الجديد ولا تصح كتابة مرهون ومكري وشرط العوض كونه دينا مؤجلا ولو منفعة ومنجما بنجمين فأكثر.

وقيل: إن ملك بعضه وباقيه حر لم يشترط أجل وتنجيم ولو كاتب على خدمة شهر ودينار عند ms251 انقضائه صحت أو على أن يبيعه كذا فسدت ولو قال كاتبتك وبعتك هذا الثوب بألف ونجم الألف وعلق الحرية بأدائه فالمذهب صحة الكتاب دون البيع ولو كاتب عبيدا على عوض منجم وعلق عتقهم بأدائه فالنص صحتها ويوزع على قيمتهم يوم الكتابة فمن أدى حصته عتق ومن عجز رق وتصح كتابة بعض من باقيه حر فلو كاتب كله صح في الرق في

الأظهر. ولو كاتب بعض رقيق فسدت إن كان باقيه لغيره ولم يأذن وكذا إن أذن أو كان له على المذهب ولو كاتباه معا أو وكلا صح إن اتفقت للنجوم وجعل المال على نسبة ملكيهما فلو عجز فعجزه أحدهما وأراد الآخر إبقاءه فكابتداء عقد وقيل: يجوز ولو أبرأ من نصيبه أو أعتقه عتق نصيبه وقوم الباقي إن كان موسرا.

فصل

يلزم السيد أن يحط عنه جزءا من المال أو يدفعه إليه والحط أولى وفي النجم الأخير أليق والأصح أنه يكفي ما يقع عليه الاسم ولا يختلف بحسب المال وإن وقت وجوبه قبل العتق ويستحب الربع وإلا فالسبع ويحرم وطء مكاتبته ولا حد فيه ويجب مهر والولد حر ولا تجب قيمته على المذهب وصارت مستولدة مكاتبة فإن عجزت عتقت بموته وولدها من نكاح وزنا مكاتب في الأظهر يتبعها رقا وعتقا وليس عليه شيء والحق فيه للسيد وفي قول لها فلو قتل فقيمته لذي الحق والمذهب أن أرش الجناية عليه وكسبه ومهره ينفق منها عليه وما فضل وقف فإن عتق فله وإلا فللسيد ولا يعتق شيء من المكاتب حتى يؤدي الجميع ولو أتى بمال فقال السيد هذا حرام ولا بينة حلف المكاتب أنه حلال ويقال للسيد يأخذه أو يبرئه عنه فإن أبى قبضه القاضي فإن نكل المكاتب حلف السيد ولو خرج المؤدي مستحقا رجع السيد ببدله فإن كان في النجم الأخير بان أن العتق لم يقع وإن كان قال عند أخذه أنت حر وإن خرج معيبا فله رده وأخذ بدله ولا يتزوج إلا بإذن سيده ولا يتسرى بإذنه على المذهب.

وله شراء ms252 الجواري لتجارة فإن وطئها فلا حد والولد نسيب فإن ولدته في الكتابة أو بعد عتقه لدون ستة أشهر تبعه رقا وعتقا ولا تصير مستولدة في الأظهر وإن ولدته بعد العتق لفوق ستة أشهر وكان يطؤها فهو حر وهي أم ولد ولو عجل النجوم لم يجبر السيد على القبول إن كان له في الامتناع غرض كمؤنة حفظه أو خوف عليه وإلا فيجبر فإن أبى قبضه القاضي ولو عجل بعضها ليبرئه من الباقي فأبرأ لم يصح الدفع ولا الإبراء ولا يصح بيع النجوم ولا الاعتياض عنها فلو باع وأدى إلى المشتري لم يعتق في الأظهر ويطالب السيد المكاتب والمكاتب المشتري بما أخذ منه ولا يصح بيع رقبته في الجديد فلو باع فأدى إلى المشتري ففي عتقه القولان وهبته كبيعه وليس له بيع ما في يد المكاتب وإعتاق عبده وتزويج أمته ولو قال له رجل أعتق مكاتبتك على كذا ففعل عتق ولزمه ما التزم.

فصل

الكتابة لازمة من جهة السيد ليس له فسخها إلا أن يعجز عن الأداء وجائزة للمكاتب فله ترك الأداء وإن كان معه وفاء فإذا عجز نفسه فللسيد الصبر والفسخ بنفسه وإن شاء بالحاكم وللمكاتب الفسخ في الأصح ولو استمهل المكاتب عند حلول النجم استحب إمهاله فإن أمهل ثم أراد الفسخ فله وإن كان معه عروض أمهله ليبيعها فإن عرض كساد فله أن لا يزيد في المهلة على ثلاثة أيام وإن كان ماله غائبا أمهله إلى الإحضار إن كان دون مرحلتين وإلا فلو حل النجم وهو غائب فللسيد الفسخ فلو كان له مال حاضر فليس للقاضي الأداء منه ولا تنفسخ بجنون المكاتب ويؤدي القاضي إن وجد له مالا ولا بجنون السيد

ويدفع إلى وليه ولا يعتق بالدفع إليه ولو قتل سيده فلوارثه قصاص فإن عفا على دية أو قتل خطأ أخذها مما معه فإن لم يكن فله تعجيزه في الأصح أو قطع طرفه فاقتصاصه والدية كما سبق ولو قتل أجنبيا أو قطعه فعفا على مال أو كان خطأ أخذ مما ms253 معه ومما سيكسبه الأقل من قيمته والأرض فإن لم يكن معه شيء وسأل المستحق تعجيزه عجزه القاضي وبيع بقدر الأرش فإن بقي منه شيء بقيت فيه الكتابة وللسيد فداؤه وإبقاؤه مكاتبا ولو أعتقه بعد الجناية أو أبرأه عتق ولزمه الفداء ولو قتل المكاتب بطلت ومات رقيقا ولسيده قصاص على قاتله المكافىء وإلا فالقيمة ويستقل بكل تصرف لا تبرع فيه ولا خطر وإلا فلا ويصح بإذن سيده في الأظهر ولو اشترى من يعتق على سيده صح فإن عجز وصار لسيده عتق أو عليه لم يصح بلا إذن وبإذن فيه القولان فإن صح تكاتب عليه ولا يصح إعتاقه وكتابته بإذن على المذهب.

فصل

الكتابة الفاسدة لشرط أو عوض أو أجل فاسد كالصحيحة في استقلاله بالكسب وأخذ أرش الجناية عليه ومهر شبهة وفي أنه يعتق بالأداء ويتبعه كسبه وكالتعليق في أنه لا يعتق بإبراء وتبطل بموت سيده وتصح الوصية برقبته ولا يصرف إليه من سهم المكاتبين وتخالفها في أن للسيد فسخها وأنه لا يملك ما يأخذه بل يرجع المكاتب به إن كان متقوما وهو عليه بقيمته يوم العتق فإن تجانسا فأقوال التقاص ويرجع صاحب الفضل به.

قلت: أصح أقوال التقاض سقوط أحد الدينين بالآخر بلا رضا والثاني برضاهما والثالث: برضا أحدهما والرابع: لا يسقط والله أعلم فإن فسخها السيد فليشهد فلو أدى المال فقال السيد كنت فسخت فأنكره صدق العبد بيمينه والأصح بطلان الفاسدة بجنون السيد وإغمائه والحجر عليه لا بجنون العبد ولو ادعى كتابة فأنكره سيده أو وارثه صدقا ويحلف الوارث على نفي العلم ولو اختلفا في قدر النجوم أو صفتها تحالفا ثم إن لم يكن قبض ما يدعيه لم تنفسخ الكتابة في الأصح بل إن لم يتفقا فسخ القاضي وإن كان قبضه وقال المكاتب بعض المقبوض وديعة عتق ورجع هو بما أدى والسيد بقيمته وقد يتقاصان ولو قال كاتبتك وأنا مجنون أو محجور علي فأنكر العبد صدق السيد إن عرف سبق ما ادعاه وإلا فالعبد ولو قال السيد وضعت عنك النجم ms254 الأول أو قال البعض فقال بل الآخر أو الكل صدق السيد ولو مات عن ابنين وعبد فقال كاتبني أبوكما فإن أنكرا صدقا وإن صدقاه فمكاتب فإن أعتق أحدهما نصيبه فالأصح لا يعتق بل يوقف فإن أدى نصيب الآخر عتق كله وولاؤه للأب وإن عجز قوم على المعتق إن كان موسرا وإلا فنصيبه حر والباقي قن للآخر.

قلت: بل الأظهر العتق والله أعلم وإن صدقه أحدهما فنصيبه مكاتب ونصيب المكذب قن فان أعتقه المصدق فالمذهب أنه يقوم عليه إن كان موسرا.', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 169;
INSERT OR IGNORE INTO pesantren_bab (kitab_slug, bab_order, name_id, name_ar) VALUES ('minhajultalibin', 170, 'كتاب أمهات الأولاد', 'كتاب أمهات الأولاد');
INSERT OR IGNORE INTO pesantren_matn (bab_id, matn_order, title_id, title_ar, text_ar, translation_id, explanation_id, quran_refs_json, hadits_refs_json) SELECT id, 1, NULL, NULL, 'إذا أحبل أمته فولدت حيا أو ميتا أو ما تجب فيه غرة عتقت بموت السيد أو أمة غيره بنكاح فالولد رقيق ولا تصير أم ولد إذا ملكها أو بشبهة فالولد حر ولا تصير أم ولد إذا ملكها في الأظهر وله وطء أم الولد واستخدامها وإجارتها وأرش جناية عليها وكذا تزويجها بغير إذنها في الأصح ويحرم بيعها ورهنها وهبتها ولو ولدت من زوج أو زنا فالود للسيد يعتق بموته كهي وأولادها قبل الإستيلاد من زنا أو زوج لا يعتقون بموت السيد وله بيعهم وعتق المستولدة من رأس المال. والله أعلم.

بعد حمد ذوي الجلال ومفيض الخير ومفيد النوال وشكره وإن كنا لا نفي بما تقتضيه إنعامه ولا نبلغ كنه حقه في ذرة مما أفادها إكرامه والصلاة والسلام على واسطة عقد النبيين سيدنا محمد المبعوث رحمة للعالمين، وعلى آله سفينة النجاة وأصحابه ذوي النفوس المزكاة، فقد تم بحمده تعالى طبع متن المنهاج في فقه الإمام محمد بن إدريس الشافعي رحمه الله وأثابه رضاه. وهو الكتاب الذي عليه معول المتأخرين وحاز من سلاسة العبارة وجمع الأحكام ما جعله عمدة المفتين، وهو أشهر من أن ينوه بذكره أو أن يعرف منتسب لعلم بقدره وكيف لا وهو إمام المتأخرين ومرجع الفضلاء المحققين مهذب مذهب الشافعية بلا افتراء وأحد الشيخين المرجوع لترجيحه من غير افتراء الإمام محي الدين يحيى النووي قدس الله أسراره وأفاض عليه من جزيل إحسانه أنواره.  ms255', NULL, NULL, NULL, NULL FROM pesantren_bab WHERE kitab_slug = 'minhajultalibin' AND bab_order = 170;
