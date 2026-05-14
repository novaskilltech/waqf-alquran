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

def to_hex(text):
    return text.encode('utf-8').hex()

def process_surahs(surah_range, folder_mapping):
    all_ayahs = {}
    for surah_num in surah_range:
        if surah_num not in folder_mapping:
            print(f"Skipping Surah {surah_num}, folder not found.")
            continue
            
        filepath = folder_mapping[surah_num]
        print(f"Processing Surah {surah_num} from {filepath}")
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                json_str = content.split('---')[-1].strip()
                data = json.loads(json_str)
                ayahs_data = data['data']['ayahs']
                
                all_ayahs[surah_num] = []
                for ayah in ayahs_data:
                    all_ayahs[surah_num].append({
                        'number': ayah['numberInSurah'],
                        'text': ayah['text'],
                        'text_simple': normalize_arabic(ayah['text'])
                    })
        except Exception as e:
            print(f"Error processing Surah {surah_num}: {e}")
            
    if all_ayahs:
        output_file = f"c:/Users/P C/Documents/الوقف و الابتدا/scratch/surahs_{surah_range.start}_{surah_range.stop-1}_hex.sql"
        with open(output_file, 'w', encoding='utf-8') as f:
            for surah_num, ayahs in all_ayahs.items():
                f.write('INSERT INTO public."Ayah" (id, number, "surahNumber", "textOthmani", "textSimple") VALUES\n')
                sql_lines = []
                for ayah in ayahs:
                    num_in_surah = ayah['number']
                    ayah_id = f"s{surah_num}a{num_in_surah}"
                    import base64
                    def to_b64(text):
                        return base64.b64encode(text.encode('utf-8')).decode('utf-8')

                    oth_b64 = to_b64(ayah['text'])
                    sim_b64 = to_b64(ayah['text_simple'])
                    
                    line = f"('{ayah_id}', {num_in_surah}, {surah_num}, " \
                           f"convert_from(decode('{oth_b64}', 'base64'), 'UTF8'), " \
                           f"convert_from(decode('{sim_b64}', 'base64'), 'UTF8'))"
                    sql_lines.append(line)
                
                f.write(',\n'.join(sql_lines))
                f.write('\nON CONFLICT (id) DO UPDATE SET "textOthmani" = EXCLUDED."textOthmani", "textSimple" = EXCLUDED."textSimple";\n\n')
        print(f"SQL saved to {output_file}")

if __name__ == "__main__":
    # Mapping manually for now based on previous investigation
    mapping = {
        61: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\277\content.md",
        62: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\278\content.md",
        63: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\279\content.md",
        64: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\280\content.md",
        65: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\281\content.md",
        66: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\282\content.md",
        67: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\283\content.md",
        68: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\284\content.md",
        69: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\285\content.md",
        70: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\286\content.md"
    }
    process_surahs(range(62, 71), mapping)
