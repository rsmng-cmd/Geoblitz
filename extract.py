import re

with open('c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/_reference_old.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Find styles
styles = re.findall(r'<style[^>]*>(.*?)</style>', content, re.DOTALL)
with open('c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/extracted_styles.css', 'w', encoding='utf-8') as f:
    f.write('\n'.join(styles))

# Find scripts
scripts = re.findall(r'<script[^>]*>(.*?)</script>', content, re.DOTALL)
with open('c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/extracted_scripts.js', 'w', encoding='utf-8') as f:
    f.write('\n'.join(scripts))

# Body
body_match = re.search(r'<body[^>]*>(.*?)</body>', content, re.DOTALL)
if body_match:
    with open('c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/extracted_body.html', 'w', encoding='utf-8') as f:
        f.write(body_match.group(1))

print("Extraction complete!")
