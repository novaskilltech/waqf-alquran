import re
import os

def validate_hex_sql(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return []
        
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # regex to find decode('...', 'hex')
    pattern = re.compile(r"decode\('([a-fA-F0-9]*)', 'hex'\)")
    
    errors = []
    for i, line in enumerate(lines, 1):
        matches = pattern.findall(line)
        for match in matches:
            if len(match) % 2 != 0:
                errors.append((i, match))
    
    return errors

filepath = r'c:\Users\P C\Documents\الوقف و الابتدا\output_hex.sql'
errors = validate_hex_sql(filepath)
if errors:
    print(f"Found {len(errors)} errors:")
    for line_num, hex_str in errors:
        print(f"Line {line_num}: Hex string length {len(hex_str)} (odd!) -> {hex_str[:20]}...")
else:
    print("No odd-length hex strings found in output_hex.sql.")
