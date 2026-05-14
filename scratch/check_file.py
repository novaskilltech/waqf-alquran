import re

def check_file_hex(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = re.compile(r"decode\('([a-fA-F0-9]*)', 'hex'\)")
    matches = pattern.findall(content)
    
    errors = []
    for i, match in enumerate(matches):
        if len(match) % 2 != 0:
            errors.append((i, len(match), match[:20]))
            
    return errors

filepath = r'c:\Users\P C\Documents\الوقف و الابتدا\scratch\surahs_62_63.sql'
errs = check_file_hex(filepath)
if errs:
    print(f"Found {len(errs)} errors in file:")
    for i, length, snippet in errs:
        print(f"Match {i}: length {length}, snippet {snippet}")
else:
    print("No errors found in file.")
