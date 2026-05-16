-- =====================================================
-- CORRECTIF : Sourate 103 (العصر) - Données erronées
-- L'IA avait confondu avec la sourate 104 (الهمزة)
-- Source réelle : Manar al-Huda, page 869
-- =====================================================

-- 1) Supprimer les 3 entrées erronées pour la sourate 103
DELETE FROM "WaqfPoint"
WHERE "ayahId" IN (
  SELECT id FROM "Ayah" WHERE "surahNumber" = 103
)
AND "methodology" = 'BOOKS';

-- 2) Insérer les données correctes depuis le texte source
-- Ayah 2 (خسر) : جائز
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 103 AND "number" = 2), 0, 'BOOKS', 'APPROVED', '{"ruling":"جائز","explanation":"جائز عند بعضهم؛ على أن المراد بالإنسان: الجنس، ومثله في الجواز «الصالحات»، وقيل: لا يجوز؛ لأنَّ التواصي بالحق والصبر قد دخل تحت الأعمال الصالحة، فلا وقف فيها دون آخرها.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');

-- Ayah 3 (آخر السورة) : تام
INSERT INTO "WaqfPoint" ("ayahId", "wordIndex", "methodology", "status", "data")
VALUES ((SELECT id FROM "Ayah" WHERE "surahNumber" = 103 AND "number" = 3), 0, 'BOOKS', 'APPROVED', '{"ruling":"تام","explanation":"آخر السورة.","source":"Manar al-Huda (Ashmuni)","hukumIbtida":"جائز","taalil":""}');
