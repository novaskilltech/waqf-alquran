import os
import re

directory = 'scratch/surahs'
for filename in os.listdir(directory):
    if filename.endswith('.sql'):
        path = os.path.join(directory, filename)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Regex to find everything between single quotes
        def clean_long_strings(match):
            s = match.group(1)
            # if the string is long, it's likely base64 data
            if len(s) > 10:
                # Remove all whitespace including spaces, tabs, newlines
                return f"'{re.sub(r'\s+', '', s)}'"
            return f"'{s}'"
        
        new_content = re.sub(r"'([^']*)'", clean_long_strings, content)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
print("Cleaned all long quoted strings.")
