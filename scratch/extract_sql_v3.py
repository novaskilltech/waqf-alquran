import os
import sys

# Ensure stdout handles UTF-8
if sys.stdout.encoding != 'utf-8':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def generate_sql_for_range(start_surah, end_surah, output_filename):
    input_path = r'c:\Users\P C\Documents\الوقف و الابتدا\output_hex.sql'
    output_path = os.path.join(r'c:\Users\P C\Documents\الوقف و الابتدا\scratch', output_filename)
    
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    header = lines[0]
    result_lines = []
    for line in lines[1:]:
        if not line.strip() or line.strip() == ';':
            continue
        
        parts = line.split("'")
        if len(parts) > 1:
            id_str = parts[1]
            try:
                surah_num = int(id_str[1:].split('a')[0])
                if start_surah <= surah_num <= end_surah:
                    clean_line = line.strip()
                    if clean_line.endswith('),'):
                        clean_line = clean_line[:-1]
                    result_lines.append(clean_line)
            except:
                continue
    
    if result_lines:
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(header)
            f.write(",\n".join(result_lines))
            f.write(" ON CONFLICT (id) DO UPDATE SET \"textOthmani\" = EXCLUDED.\"textOthmani\", \"textSimple\" = EXCLUDED.\"textSimple\";")
        print(f"Successfully written to {output_filename}")

generate_sql_for_range(62, 62, 'surah_62_v2.sql')
