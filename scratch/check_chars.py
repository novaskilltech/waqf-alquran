import re

with open('scratch/surahs/surah_65.sql', 'r', encoding='utf-8') as f:
    content = f.read()

b64 = re.search(r"decode\('([^']*)'", content).group(1)
print(f"First 30 chars: {repr(b64[:30])}")
for i, char in enumerate(b64[:30]):
    print(f"Char {i}: {repr(char)} (hex: {hex(ord(char))})")
