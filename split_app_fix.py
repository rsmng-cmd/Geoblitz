import os
import re

base_dir = 'c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2'

# We have the original extracted JS in extract_scripts.js? No, I overwrote it in extract_js.py.
# Wait, I wrote the remaining JS to js/app.js in extract_js.py.
# So I should read from js/app.js, store it in memory, delete js/app.js, and then write.

with open(f'{base_dir}/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Let's clean the old duplicates by taking only the first half if it was doubled
# Actually, since I appended, the original 450KB is at the top. But let's just re-extract from extracted_scripts.js
with open(f'{base_dir}/extracted_scripts.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Remove the data arrays that we already extracted to avoid duplication
js = re.sub(r'const firebaseConfig\s*=\s*\{.*?\};', '', js, flags=re.DOTALL)
js = re.sub(r'const CITIES\s*=\s*\[.*?\];', '', js, flags=re.DOTALL)
js = re.sub(r'const EUROPE_CITIES\s*=\s*\[.*?\];', '', js, flags=re.DOTALL)
js = re.sub(r'const TURKEY_DISTRICTS\s*=\s*\[.*?\];', '', js, flags=re.DOTALL)
js = re.sub(r'const FLAG_COUNTRIES\s*=\s*\[.*?\];', '', js, flags=re.DOTALL)
js = re.sub(r'const COUNTRY_EN\s*=\s*\{.*?\};', '', js, flags=re.DOTALL)
js = re.sub(r'const CITY_EN\s*=\s*\{.*?\};', '', js, flags=re.DOTALL)
js = re.sub(r'const T\s*=\s*\{.*?\};\n', '', js, flags=re.DOTALL)

# Now remove any files that were appended to
for root, _, files in os.walk(f'{base_dir}/js'):
    for file in files:
        if file not in ['cities-world.js', 'cities-europe.js', 'cities-turkey.js', 'flags.js', 'country_en.js', 'city_en.js', 'firebase-init.js', 'i18n.js']:
            os.remove(os.path.join(root, file))

section_mapping = [
    ('FIREBASE INIT', 'js/firebase-init.js'),
    ('İNGİLİZCE ÇEVİRİ', 'js/i18n.js'),
    ('DİL SİSTEMİ', 'js/ui/options.js'),
    ('BENİ HATIRLA', 'js/auth.js'),
    ('KEYBIND SİSTEMİ', 'js/ui/options.js'),
    ('PREMIUM & REKLAM SİSTEMİ', 'js/ui/ads.js'),
    ('GOOGLE ADS FUNCTIONS', 'js/ui/ads.js'),
    ('OYUNCU PROFİL SİSTEMİ', 'js/ui/leaderboard.js'),
    ('TAM EKRAN', 'js/ui/welcome.js'),
    ('iOS KEYBOARD', 'js/ui/welcome.js'),
    ('END AUTH', 'js/auth.js'),
    ('D3 MAP', 'js/map/map-world.js'),
    ('TIMER', 'js/game/timer.js'),
    ('COMBO', 'js/game/combo.js'),
    ('SKOR ÇARPANI', 'js/game/scoring.js'),
    ('CLICK', 'js/game/question.js'),
    ('DISTANCE & SCORE', 'js/game/scoring.js'),
    ('UI', 'js/ui/overlay.js'),
    ('OYUN MODU', 'js/game/level.js'),
    ('TÜRKİYE İLÇELERİ', 'js/map/map-turkey.js'),
    ('MULTIPLAYER SİSTEMİ', 'js/multiplayer/mp-game.js'),
    ('MULTIPLAYER: handleClickAtLonLat VE handleMapClick', 'js/multiplayer/mp-game.js')
]

blocks = re.split(r'// ===== (.*?) =====', js)

files = {}
files['js/config.js'] = blocks[0]

for i in range(1, len(blocks), 2):
    section_name = blocks[i].strip()
    content = blocks[i+1]
    
    target_file = 'js/app.js'
    for key, path in section_mapping:
        if key in section_name:
            target_file = path
            break
            
    if target_file not in files:
        files[target_file] = ''
    files[target_file] += f'\\n// ===== {section_name} =====\\n' + content

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    
    mode = 'a' if os.path.exists(full_path) else 'w'
    with open(full_path, mode, encoding='utf-8') as f:
        f.write(content)

print("App correctly split.")
