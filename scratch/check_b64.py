import re

with open('scratch/surahs/surah_64.sql', 'r', encoding='utf-8') as f:
    content = f.read()

b64_strings = re.findall(r"decode\('([^']*)'", content)
for i, s in enumerate(b64_strings):
    if ' ' in s:
        print(f"Found space in b64 string #{i}: {s[:20]}...")
    else:
        # print(f"String #{i} is clean")
        pass

print("Check finished.")
