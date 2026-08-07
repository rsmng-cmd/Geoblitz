import os
import re

base_dir = 'c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2'

# 1. index.html
with open(f'{base_dir}/extracted_body.html', 'r', encoding='utf-8') as f:
    body_content = f.read()

index_html = f"""<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="GeoMeister">
  <meta name="theme-color" content="#0a0e1a">
  
  <meta http-equiv="X-Content-Type-Options" content="nosniff">
  <meta http-equiv="X-XSS-Protection" content="1; mode=block">
  <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin">
  
  <title>GeoMeister — Geography Game</title>
  
  <!-- D3 and TopoJSON via CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js"></script>
  
  <!-- Firebase SDK via CDN (Compat Mode) -->
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
  
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">
  
  <link rel="stylesheet" href="css/variables.css">
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/modals.css">
  <link rel="stylesheet" href="css/toast.css">
  <link rel="stylesheet" href="css/game.css">
  <link rel="stylesheet" href="css/leaderboard.css">
  <link rel="stylesheet" href="css/flag.css">
  <link rel="stylesheet" href="css/responsive.css">
</head>
<body>
{body_content}
  <!-- Scripts will be concatenated here by build.js or included separately during dev -->
</body>
</html>"""

with open(f'{base_dir}/index.html', 'w', encoding='utf-8') as f:
    f.write(index_html)

# 2. Extract CSS chunks
with open(f'{base_dir}/extracted_styles.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

def write_file(path, content):
    with open(f'{base_dir}/{path}', 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\\n')

write_file('css/variables.css', re.search(r'(:root \{.*?\})', css_content, re.DOTALL).group(1) if re.search(r'(:root \{.*?\})', css_content, re.DOTALL) else '')

# We will just split the CSS manually or put the whole thing in base.css for now to ensure we don't lose anything.
# Let's put everything in base.css initially, and then I will create a script to split it properly.
write_file('css/base.css', css_content)

print("index.html and CSS base created.")
