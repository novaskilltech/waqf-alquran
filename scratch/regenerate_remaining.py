import json
import os
import re
import base64

def normalize_arabic(text):
    if not text: return ""
    text = re.sub(r'[\u064B-\u065F\u0670]', '', text)
    text = text.replace('\u0640', '')
    text = re.sub(r'[\u0622\u0623\u0625]', '\u0627', text)
    text = text.replace('\u0624', '\u0648')
    text = text.replace('\u0626', '\u064A')
    text = text.replace('\u0629', '\u0647')
    text = text.replace('\u0649', '\u064A')
    return text.strip()

def split_b64(b64_str):
    # REMOVE ALL WHITESPACE JUST IN CASE
    b64_str = "".join(b64_str.split())
    # Split into 60-char chunks
    chunks = [b64_str[i:i+60] for i in range(0, len(b64_str), 60)]
    return " || ".join([f"'{chunk}'" for chunk in chunks])

def generate_sql_for_surah(surah_num, filepath):
    print(f"Generating SQL for Surah {surah_num}...")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # The JSON is usually at the end of the content.md files
            json_str = content.split('---')[-1].strip()
            data = json.loads(json_str)
            ayahs_data = data['data']['ayahs']
            
            output_dir = 'scratch/surahs'
            os.makedirs(output_dir, exist_ok=True)
            output_file = os.path.join(output_dir, f"surah_{surah_num}.sql")
            
            with open(output_file, 'w', encoding='utf-8') as out:
                out.write('INSERT INTO public."Ayah" (id, number, "surahNumber", "textOthmani", "textSimple") VALUES\n')
                sql_lines = []
                for ayah in ayahs_data:
                    num_in_surah = ayah['numberInSurah']
                    ayah_id = f"s{surah_num}a{num_in_surah}"
                    
                    oth_raw = ayah['text'].strip()
                    sim_raw = normalize_arabic(oth_raw)
                    
                    # Ensure NO whitespace in the base64 output
                    oth_b64 = base64.b64encode(oth_raw.encode('utf-8')).decode('utf-8').replace(' ', '').replace('\n', '')
                    sim_b64 = base64.b64encode(sim_raw.encode('utf-8')).decode('utf-8').replace(' ', '').replace('\n', '')
                    
                    line = f"('{ayah_id}', {num_in_surah}, {surah_num}, " \
                           f"convert_from(decode({split_b64(oth_b64)}, 'base64'), 'UTF8'), " \
                           f"convert_from(decode({split_b64(sim_b64)}, 'base64'), 'UTF8'))"
                    sql_lines.append(line)
                
                out.write(',\n'.join(sql_lines))
                out.write('\nON CONFLICT (id) DO UPDATE SET "textOthmani" = EXCLUDED."textOthmani", "textSimple" = EXCLUDED."textSimple";\n')
            print(f"Saved to {output_file}")
    except Exception as e:
        print(f"Error for Surah {surah_num}: {e}")

if __name__ == "__main__":
    mapping = {
        66: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\282\content.md",
        67: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\283\content.md",
        68: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\284\content.md",
        69: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\285\content.md",
        70: r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\286\content.md"
    }
    for s_num, path in mapping.items():
        generate_sql_for_surah(s_num, path)
