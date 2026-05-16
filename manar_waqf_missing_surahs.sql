-- =====================================================
-- Points de Waqf manquants : Sourates 94, 104, 108
-- Source : Manar al-Huda (Ashmuni) - Livre ID 6496
-- Extraction manuelle depuis le texte source
-- Date : 2026-05-16
-- =====================================================

-- =====================================================
-- SOURATE 94 - الانشراح (Al-Inshirah) - 8 ayahs
-- =====================================================

-- Pas de waqf de صدرك (1) à ذكرك (4) car tout est lié par le عطف et l'استفهام
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 94 AND "number" = 4), 0, 'BOOKS', 'APPROVED', '{"ruling":"ليس بوقف","explanation":"لا يوقف على صدرك لأنَّ ما بعده معطوف على ما قبله، وداخل معه في اتساق الكلام الواقع عليه الاستفهام.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');

-- يسرا الأول (5)
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 94 AND "number" = 5), 0, 'BOOKS', 'APPROVED', '{"ruling":"كاف","explanation":"من قال: لا يوقف على شيء من أول السورة إلى يسرًا الأول لوجود الفاء يعني في الدنيا. ثم قال: إنَّ مع العسر يسرًا يعني في الآخرة لقوله في الحديث: لن يغلب عسر يسرين.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');

-- يسرا الثاني (6)
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 94 AND "number" = 6), 0, 'BOOKS', 'APPROVED', '{"ruling":"كاف","explanation":"من قال الوقف على يسرا الثاني، قال: لأنَّ إذا في جوابها الفاء فتضمنت معنى الشرط.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');

-- فانصب (7)
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 94 AND "number" = 7), 0, 'BOOKS', 'APPROVED', '{"ruling":"جائز","explanation":"","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');

-- فارغب (8) - آخر السورة
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 94 AND "number" = 8), 0, 'BOOKS', 'APPROVED', '{"ruling":"تام","explanation":"آخر السورة.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');


-- =====================================================
-- SOURATE 104 - الهمزة (Al-Humazah) - 9 ayahs
-- =====================================================

-- لمزة (1)
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 104 AND "number" = 1), 0, 'BOOKS', 'APPROVED', '{"ruling":"حسن","explanation":"حسن، إن رفع ما بعده خبر مبتدأ محذوف، أي: هو الذي جمع، أو نصب على الذم، وليس بوقف إن جعل بدل معرفة من نكرة.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');

-- وعدده (2)
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 104 AND "number" = 2), 0, 'BOOKS', 'APPROVED', '{"ruling":"كاف","explanation":"كاف، على استئناف ما بعده، وليس بوقف إن جعل حالًا من فاعل جمع.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');

-- أخلده (3) + كلا (4)
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 104 AND "number" = 4), 0, 'BOOKS', 'APPROVED', '{"ruling":"تام","explanation":"تام؛ لأنَّ كلَّا هنا حرف ردع وزجر عن حسبانه الفاسد، فهي بمعنى: النفي، أي: لا يخلده ماله.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');

-- في الحطمة (4)
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 104 AND "number" = 4), 1, 'BOOKS', 'APPROVED', '{"ruling":"كاف","explanation":"","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');

-- ما الحطمة (5)
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 104 AND "number" = 5), 0, 'BOOKS', 'APPROVED', '{"ruling":"كاف","explanation":"أكفى مما قبله، ويبتدئ: نار الله، بتقدير: هي نار الله. والوقف على الموقدة قبيح؛ لأنَّ ما بعده صفة والصفة والموصوف كالشيء الواحد.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');

-- الأفئدة (7)
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 104 AND "number" = 7), 0, 'BOOKS', 'APPROVED', '{"ruling":"صالح","explanation":"","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');

-- مؤصدة (8)
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 104 AND "number" = 8), 0, 'BOOKS', 'APPROVED', '{"ruling":"ليس بوقف","explanation":"ليس بوقف؛ لأنَّ ما بعده صفة لـ نار الله.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');

-- ممددة (9) - آخر السورة
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 104 AND "number" = 9), 0, 'BOOKS', 'APPROVED', '{"ruling":"تام","explanation":"آخر السورة.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');


-- =====================================================
-- SOURATE 108 - الكوثر (Al-Kawthar) - 3 ayahs
-- =====================================================

-- الكوثر (1)
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 108 AND "number" = 1), 0, 'BOOKS', 'APPROVED', '{"ruling":"جائز","explanation":"لم ينص عليه أحد، وله حيثيتان: من حيث الابتداء بالفاء ليس بوقف؛ لأنَّ الفاء السببية في مقام لام العلة. ومن حيث كونه رأس آية وفيه التفات من التكلم إلى الغيبية، وذلك من مقتضيات الابتداء، يجوز الوقف عليه.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');

-- وانحر (2)
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 108 AND "number" = 2), 0, 'BOOKS', 'APPROVED', '{"ruling":"جائز","explanation":"جائز، وقال أبو عمرو: تام للابتداء بأن.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');

-- الأبتر (3) - آخر السورة
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 108 AND "number" = 3), 0, 'BOOKS', 'APPROVED', '{"ruling":"تام","explanation":"آخر السورة.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');
