import re
import os

def split_b64(match):
    b64 = match.group(1).replace(' ', '').replace('\n', '').replace('\r', '')
    chunks = [b64[i:i+60] for i in range(0, len(b64), 60)]
    joined = "' || '".join(chunks)
    return f"decode('{joined}'"

sql_files = [f'scratch/surahs/surah_{i}.sql' for i in range(62, 71)]

for sql_file in sql_files:
    if not os.path.exists(sql_file): continue
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    cleaned_content = re.sub(r"decode\('([^']*)'", split_b64, content)
    
    with open(sql_file, 'w', encoding='utf-8') as f:
        f.write(cleaned_content)
    print(f"Split {sql_file}")
