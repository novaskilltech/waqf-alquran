import base64
import json

filepath = r'C:\Users\P C\.gemini\antigravity\brain\a2384a09-af7d-4f9f-ae9c-d52ba7c4cc7e\.system_generated\steps\280\content.md'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()
    data = json.loads(content.split('---')[-1].strip())
    text = data['data']['ayahs'][0]['text']
    
    b64 = base64.b64encode(text.encode('utf-8')).decode('utf-8')
    print(f"Length: {len(b64)}")
    print(f"Has spaces: {' ' in b64}")
    
    # Check each character
    for i, char in enumerate(b64):
        if not (('A' <= char <= 'Z') or ('a' <= char <= 'z') or ('0' <= char <= '9') or char in '+/='):
            print(f"Invalid B64 char at {i}: {repr(char)} (hex: {hex(ord(char))})")
