import re

base_dir = 'c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2'

# 1. Clean index.html
with open(f'{base_dir}/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Remove any script tags in the body
# Be careful not to remove the CDN scripts in the head, but we can safely remove any <script>...</script> with content
# and any script tags referencing firestore_matchmaking_agent.js
html = re.sub(r'<script.*?>.*?</script>', '', html, flags=re.DOTALL)
# The above regex might remove ALL scripts. Let's rebuild the head scripts instead.
# Actually, the original index.html only needs the head scripts.
html = re.sub(r'<script.*?>.*?</script>', '', html, flags=re.DOTALL)

# Re-inject the correct scripts at the end of head
head_scripts = """
  <!-- D3 and TopoJSON via CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/topojson-client@3/dist/topojson-client.min.js"></script>
  
  <!-- Firebase SDK via CDN (Compat Mode) -->
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js"></script>
"""
html = html.replace('</head>', head_scripts + '\\n</head>')

# Re-inject bundle.js at the end of body
html = html.replace('</body>', '  <script src="js/bundle.js"></script>\\n</body>')

with open(f'{base_dir}/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Cleaned index.html")
