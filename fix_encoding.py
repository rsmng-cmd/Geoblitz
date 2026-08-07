import os

base_dir = 'c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2'

for root, _, files in os.walk(f'{base_dir}/js'):
    for file in files:
        if file.endswith('.js'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Fix mangled regex
            content = content.replace('/^[a-zA-Z0-9_Ã€-É]+$/', '/^[a-zA-Z0-9_À-ÿ]+$/')
            content = content.replace('/^[a-zA-Z0-9_?-?]+$/', '/^[a-zA-Z0-9_À-ÿ]+$/')
            content = content.replace('?', '') # clean up any stray broken chars
            
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)

print("Fixed encodings in JS.")
