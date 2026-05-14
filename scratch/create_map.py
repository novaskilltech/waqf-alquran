import os
import json
import glob

def get_surah_mapping():
    base_dir = r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps"
    mapping = {}
    
    # Use glob to find all content.md files
    files = glob.glob(os.path.join(base_dir, "*", "content.md"))
    print(f"Checking {len(files)} files...")
    
    for content_path in files:
        try:
            with open(content_path, 'r', encoding='utf-8') as f:
                content = f.read()
                print(f"Checking {content_path}, length {len(content)}")
                # Relaxed check
                if "quran-uthmani" not in content.lower(): 
                    print("  No quran-uthmani found")
                    continue
                
                # Extract JSON
                parts = content.split('---')
                if len(parts) < 2: 
                    print("  No --- found")
                    continue
                
                json_str = parts[-1].strip()
                data = json.loads(json_str)
                if 'data' in data and 'number' in data:
                    surah_num = data['data']['number']
                    print(f"  Found Surah {surah_num}")
                    mapping[surah_num] = content_path
        except Exception as e:
            print(f"Error reading {content_path}: {e}")
            continue
            
    return mapping

if __name__ == "__main__":
    mapping = get_surah_mapping()
    print(f"Found {len(mapping)} surahs.")
    # Sort mapping
    sorted_mapping = {k: mapping[k] for k in sorted(mapping.keys())}
    with open("c:/Users/P C/Documents/الوقف و الابتدا/scratch/surah_map.json", "w", encoding="utf-8") as f:
        json.dump(sorted_mapping, f, indent=2)
    print("Mapping saved to scratch/surah_map.json")
