import json

filepath = r"c:\Users\P C\Documents\الوقف و الابتدا\scratch\surahs_62_70_hex.sql"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Very simple splitting logic
surahs = content.split('INSERT INTO')
# Surah 62 is index 1
s62_all = surahs[1].split('ON CONFLICT')[0].strip()
# Remove "VALUES\n"
s62_values = s62_all.replace('public."Ayah" (id, number, "surahNumber", "textOthmani", "textSimple") VALUES\n', '').strip()
ayahs = s62_values.split('),\n(')

def save_batch(name, batch):
    with open(f"c:/Users/P C/Documents/الوقف و الابتدا/scratch/{name}.sql", 'w', encoding='utf-8') as out:
        out.write('INSERT INTO public."Ayah" (id, number, "surahNumber", "textOthmani", "textSimple") VALUES\n')
        # Add ( and ) back if needed
        batch_lines = []
        for line in batch:
            if not line.startswith('('): line = '(' + line
            if not line.endswith(')'): line = line + ')'
            batch_lines.append(line)
        out.write(',\n'.join(batch_lines))
        out.write('\nON CONFLICT (id) DO UPDATE SET "textOthmani" = EXCLUDED."textOthmani", "textSimple" = EXCLUDED."textSimple";\n')

save_batch('s62_1_5', ayahs[0:5])
save_batch('s62_6_11', ayahs[5:11])
