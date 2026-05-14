with open('scratch/surahs/surah_67.sql', 'r', encoding='utf-8') as f:
    line = f.readline()
    line = f.readline() # s67a1
    print(f"Slice 340-360: {repr(line[340:360])}")
    print(f"Char at 346: {repr(line[346])} (ord: {ord(line[346])})")
