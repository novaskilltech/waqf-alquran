import sys
import os

def hexify_sql(input_file, output_file):
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    for line in lines:
        if line.startswith("('") or line.startswith("INSERT"):
            # This is a bit complex to parse perfectly, but I'll do a simple replacement for strings
            # Actually, I'll just hexify the WHOLE line if it starts with ('
            if line.startswith("('"):
                # Format is ('id', num, surah, 'othmani', 'simple'),
                # I'll just hexify the strings
                parts = line.split("', ")
                # parts[0] = ('id
                # parts[1] = num, surah, 'othmani
                # parts[2] = 'simple'),
                
                # It's better to just hexify the Othmani and Simple columns which are the ones with Arabic
                try:
                    start_paren = line.find("('")
                    first_comma = line.find("', ")
                    id_val = line[start_paren+2:first_comma]
                    
                    remaining = line[first_comma+3:]
                    second_comma = remaining.find(", ")
                    num_val = remaining[:second_comma]
                    
                    remaining = remaining[second_comma+2:]
                    third_comma = remaining.find(", ")
                    surah_val = remaining[:third_comma]
                    
                    remaining = remaining[third_comma+3:] # skip '
                    fourth_comma = remaining.find("', '")
                    othmani_val = remaining[:fourth_comma]
                    
                    remaining = remaining[fourth_comma+4:]
                    fifth_comma = remaining.find("'),")
                    if fifth_comma == -1:
                        fifth_comma = remaining.find("')")
                    simple_val = remaining[:fifth_comma]
                    
                    othmani_hex = othmani_val.encode('utf-8').hex()
                    simple_hex = simple_val.encode('utf-8').hex()
                    
                    new_line = f"('{id_val}', {num_val}, {surah_val}, convert_from(decode('{othmani_hex}', 'hex'), 'UTF8'), convert_from(decode('{simple_hex}', 'hex'), 'UTF8')),\n"
                    new_lines.append(new_line)
                except Exception as e:
                    # Fallback to original if parsing fails
                    new_lines.append(line)
            else:
                new_lines.append(line)
        else:
            new_lines.append(line)
            
    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

if __name__ == "__main__":
    hexify_sql("output.sql", "output_hex.sql")
