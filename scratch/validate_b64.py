import re

with open('scratch/surahs/surah_67.sql', 'r', encoding='utf-8') as f:
    line = f.readline()
    line = f.readline() # s67a1
    
    # Find all strings in single quotes
    b64_strings = re.findall(r"'([^']*)'", line)
    for i, s in enumerate(b64_strings):
        if len(s) > 10:
            print(f"String {i} (len {len(s)}): {s[:20]}...{s[-20:]}")
            if len(s) % 4 != 0:
                print(f"  WARNING: Length is not a multiple of 4! (Remainder: {len(s) % 4})")
            # Check for invalid characters
            invalid = re.findall(r'[^A-Za-z0-9+/=]', s)
            if invalid:
                print(f"  WARNING: Invalid characters found: {set(invalid)}")
