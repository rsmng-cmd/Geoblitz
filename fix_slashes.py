import os

base_dir = 'c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2'

for root, _, files in os.walk(f'{base_dir}/js'):
    for file in files:
        if file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace literal '\n' with actual newline
            content = content.replace('\\\\n', '\\n')
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)

# Also fix index.html removing firestore_matchmaking_agent.js
with open(f'{base_dir}/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<script src="firestore_matchmaking_agent.js"></script>', '')
with open(f'{base_dir}/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Fixed slashes and cleaned index.html")
