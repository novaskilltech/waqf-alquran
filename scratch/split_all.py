import os
import re

sql_file = r'c:\Users\P C\Documents\الوقف و الابتدا\scratch\surahs_62_70_hex.sql'
output_dir = r'c:\Users\P C\Documents\الوقف و الابتدا\scratch\surahs'

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

with open(sql_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Split by "INSERT INTO"
parts = content.split('INSERT INTO')
for part in parts:
    if not part.strip():
        continue
    
    # Re-add INSERT INTO
    full_part = 'INSERT INTO' + part
    
    # Find surah number from the first ayah id, e.g., 's62a1'
    match = re.search(r"'s(\d+)a\d+'", full_part)
    if match:
        surah_num = match.group(1)
        out_path = os.path.join(output_dir, f'surah_{surah_num}.sql')
        with open(out_path, 'w', encoding='utf-8') as f_out:
            f_out.write(full_part.strip())
        # print(f"Saved Surah {surah_num}") # Avoid printing the path with Arabic chars
    else:
        print("No match in part")
