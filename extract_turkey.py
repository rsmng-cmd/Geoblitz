import re

base_dir = 'c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2'
with open(f'{base_dir}/js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

match = re.search(r'const TURKEY_DISTRICTS\s*=\s*\[.*?\];', js, re.DOTALL)
if match:
    content = match.group(0)
    js = js.replace(content, '')
    with open(f'{base_dir}/js/data/cities-turkey.js', 'w', encoding='utf-8') as out:
        out.write(content + '\\n')
    
    with open(f'{base_dir}/js/app.js', 'w', encoding='utf-8') as out:
        out.write(js)
    print("Extracted js/data/cities-turkey.js")
else:
    print("Failed to extract TURKEY_DISTRICTS")
