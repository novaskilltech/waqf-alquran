import json
import os

filepath = r"C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\278\content.md"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()
    json_str = content.split('---')[-1].strip()
    data = json.loads(json_str)
    ayah = data['data']['ayahs'][6] # Ayah 7
    text = ayah['text']
    print(f"Original text: {text}")
    h = text.encode('utf-8').hex()
    print(f"Hex: {h}")
    print(f"Length: {len(h)}")
    if len(h) % 2 != 0:
        print("ALERT: ODD LENGTH!")
