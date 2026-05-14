import os
import re

sql_files = [f'scratch/surahs/surah_{i}.sql' for i in range(62, 71)]

for sql_file in sql_files:
    if not os.path.exists(sql_file): continue
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Function to remove spaces from base64 strings inside decode('...')
    def clean_b64(match):
        b64 = match.group(1).replace(' ', '').replace('\n', '').replace('\r', '')
        return f"decode('{b64}'"
    
    cleaned_content = re.sub(r"decode\('([^']*)'", clean_b64, content)
    
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write(cleaned_content)
    # print(f"Cleaned {sql_file}")
