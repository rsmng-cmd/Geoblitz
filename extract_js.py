import re
import os

base_dir = 'c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2'
with open(f'{base_dir}/extracted_scripts.js', 'r', encoding='utf-8') as f:
    js = f.read()

def extract_and_remove(pattern, name):
    global js
    match = re.search(pattern, js, re.DOTALL)
    if match:
        content = match.group(0)
        js = js.replace(content, '')
        with open(f'{base_dir}/{name}', 'w', encoding='utf-8') as out:
            out.write(content + '\\n')
        print(f"Extracted {name}")
        return True
    print(f"Failed to extract {name}")
    return False

extract_and_remove(r'const firebaseConfig\s*=\s*\{.*?\};', 'js/firebase-init.js')
extract_and_remove(r'const CITIES\s*=\s*\[.*?\];', 'js/data/cities-world.js')
extract_and_remove(r'const EUROPE_CITIES\s*=\s*\[.*?\];', 'js/data/cities-europe.js')
extract_and_remove(r'const TURKEY_CITIES\s*=\s*\[.*?\];', 'js/data/cities-turkey.js')
extract_and_remove(r'const FLAG_COUNTRIES\s*=\s*\[.*?\];', 'js/data/flags.js')
extract_and_remove(r'const COUNTRY_EN\s*=\s*\{.*?\};', 'js/data/country_en.js')
extract_and_remove(r'const CITY_EN\s*=\s*\{.*?\};', 'js/data/city_en.js')
extract_and_remove(r'const T\s*=\s*\{.*?\};\n', 'js/i18n.js')

with open(f'{base_dir}/js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Initial JS extraction done.")
