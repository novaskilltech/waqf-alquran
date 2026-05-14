import json
import os
import re

def normalize_arabic(text):
    if not text: return ""
    # Tashkeel
    text = re.sub(r'[\u064B-\u065F\u0670]', '', text)
    # Tatweel
    text = text.replace('\u0640', '')
    # Alifs
    text = re.sub(r'[\u0622\u0623\u0625]', '\u0627', text)
    # Others
    text = text.replace('\u0624', '\u0648')
    text = text.replace('\u0626', '\u064A')
    text = text.replace('\u0629', '\u0647')
    text = text.replace('\u0649', '\u064A')
    return text.strip()

def process_files(file_indices):
    sql_lines = []
    for idx in file_indices:
        filepath = f"C:/Users/P C/.gemini/antigravity/brain/a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e/.system_generated/steps/{idx}/content.md"
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # Extract JSON from markdown
            json_str = content.split('---')[-1].strip()
            data = json.loads(json_str)
            surah_num = data['data']['number']
            ayahs = data['data']['ayahs']
            for ayah in ayahs:
                num_in_surah = ayah['numberInSurah']
                text_othmani = ayah['text'].replace("'", "''")
                text_simple = normalize_arabic(ayah['text']).replace("'", "''")
                ayah_id = f"s{surah_num}a{num_in_surah}"
                sql_lines.append(f"('{ayah_id}', {num_in_surah}, {surah_num}, '{text_othmani}', '{text_simple}')")
    
    if sql_lines:
        output_file = "c:/Users/P C/Documents/الوقف و الابتدا/scratch/output.sql"
        with open(output_file, 'w', encoding='utf-8') as out:
            out.write("INSERT INTO public.\"Ayah\" (id, number, \"surahNumber\", \"textOthmani\", \"textSimple\") VALUES\n")
            out.write(",\n".join(sql_lines))
            out.write("\nON CONFLICT (id) DO UPDATE SET \"textOthmani\" = EXCLUDED.\"textOthmani\", \"textSimple\" = EXCLUDED.\"textSimple\";\n")

if __name__ == "__main__":
    # Indices for steps 277 to 286 (Surahs 61-70)
    process_files(range(278, 287)) # Batch 2 partial: 62-70
