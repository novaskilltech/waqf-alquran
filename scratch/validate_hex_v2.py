import re

filepath = "c:/Users/P C/Documents/الوقف و الابتدا/scratch/surahs_62_70_hex.sql"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()
    
hex_matches = re.findall(r"decode\('([0-9a-fA-F]+)', 'hex'\)", content)
for i, h in enumerate(hex_matches):
    if len(h) % 2 != 0:
        print(f"Error at index {i}: length {len(h)} is ODD! Hex starts with: {h[:20]}")
    #else:
    #    print(f"Index {i}: length {len(h)} is EVEN.")

print("Validation complete.")
