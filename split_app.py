import os
import re

base_dir = 'c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2'

with open(f'{base_dir}/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Define the mapping of sections to files
section_mapping = [
    ('FIREBASE INIT', 'js/firebase-init.js'),
    ('İNGİLİZCE ÇEVİRİ', 'js/i18n.js'), # already extracted but might have leftovers
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

# We will simply split by `// ===== ` and route the blocks to the appropriate file
blocks = re.split(r'// ===== (.*?) =====', js)

files = {}
# The first block is everything before the first `// =====` comment.
# Put it in js/config.js
files['js/config.js'] = blocks[0]

for i in range(1, len(blocks), 2):
    section_name = blocks[i].strip()
    content = blocks[i+1]
    
    # default fallback
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
    
    # append if exists (because some files get multiple blocks)
    mode = 'a' if os.path.exists(full_path) else 'w'
    with open(full_path, mode, encoding='utf-8') as f:
        f.write(content)

print("App split complete. Remember to delete old app.js or clear it out.")
