import os

def generate_sql_for_range(start_surah, end_surah):
    filepath = r'c:\Users\P C\Documents\الوقف و الابتدا\output_hex.sql'
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # The file starts with INSERT INTO...
    # We want to extract lines that match our surah range.
    # Lines look like ('s62a1', ...)
    
    header = lines[0]
    result_lines = []
    for line in lines[1:]:
        if not line.strip() or line.strip() == ';':
            continue
        
        # Extract surah number from 'sXXaYY'
        # The line starts with ('s
        parts = line.split("'")
        if len(parts) > 1:
            id_str = parts[1] # e.g. s62a1
            surah_num = int(id_str[1:].split('a')[0])
            if start_surah <= surah_num <= end_surah:
                # Clean up the line (remove trailing comma if it's the last one we want)
                clean_line = line.strip()
                if clean_line.endswith('),'):
                    clean_line = clean_line[:-1]
                elif clean_line.endswith(')'):
                    pass
                result_lines.append(clean_line)
    
    if result_lines:
        sql = header + ",\n".join(result_lines) + ";"
        print(sql)

# Let's generate for Surah 62
generate_sql_for_range(62, 62)
