import os
import requests

# I'll use the MCP tool execute_sql indirectly if I can, but I'll just print it for now or use a script to call the MCP tool?
# Actually, I'll just write a script that reads the file and I'll copy-paste the output here.
# But wait, I can just use a script to split the SQL into 5-Ayah chunks to be safe.

def split_sql(filename, chunk_size=5):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    header = lines[0] # INSERT INTO...
    footer = lines[-1] # ON CONFLICT...
    data_lines = lines[1:-1]
    
    # Each data line ends with ,\n except the last one which might be different.
    # We need to clean the commas.
    
    for i in range(0, len(data_lines), chunk_size):
        chunk = data_lines[i:i+chunk_size]
        # Clean the last comma in the chunk
        chunk_str = "".join(chunk).strip()
        if chunk_str.endswith(','):
            chunk_str = chunk_str[:-1]
        
        print(f"--- CHUNK {i//chunk_size + 1} ---")
        print(header + chunk_str + "\n" + footer)
        print("-----------------------")

split_sql('scratch/surahs/surah_67.sql')
