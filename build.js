const fs = require('fs');
const path = require('path');

const jsFiles = [
  'js/config.js',
  'js/i18n.js',
  'js/data/cities-world.js',
  'js/data/cities-europe.js',
  'js/data/cities-turkey.js',
  'js/data/flags.js',
  'js/data/map-data-fallback.js',
  'js/firebase-init.js',
  'js/auth.js',
  'js/map/map-cache.js',
  'js/map/map-world.js',
  'js/map/map-europe.js',
  'js/map/map-turkey.js',
  'js/map/map-markers.js',
  'js/map/map-utils.js',
  'js/game/state.js',
  'js/game/scoring.js',
  'js/game/timer.js',
  'js/game/combo.js',
  'js/game/question.js',
  'js/game/level.js',
  'js/game/flag-game.js',
  'js/multiplayer/mp-state.js',
  'js/multiplayer/mp-bot.js',
  'js/multiplayer/mp-lobby.js',
  'js/multiplayer/mp-matchmaking.js',
  'js/multiplayer/mp-game.js',
  'js/multiplayer/mp-sync.js',
  'js/multiplayer/mp-elo.js',
  'js/multiplayer/mp-ui.js',
  'js/ui/welcome.js',
  'js/ui/overlay.js',
  'js/ui/main-menu.js',
  'js/ui/leaderboard.js',
  'js/ui/options.js',
  'js/ui/ads.js',
  'js/app.js'
];

const cssFiles = [
  'css/variables.css',
  'css/base.css',
  'css/layout.css',
  'css/modals.css',
  'css/toast.css',
  'css/game.css',
  'css/leaderboard.css',
  'css/flag.css',
  'css/responsive.css'
];

console.log('Building bundle.js...');
let bundleJsContent = '';
jsFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    bundleJsContent += `/* --- ${file} --- */\n` + fs.readFileSync(file, 'utf8') + '\n\n';
  } else {
    console.warn(`File missing: ${file}`);
  }
});

fs.writeFileSync('bundle.js', bundleJsContent, 'utf8');

console.log('Building bundle.css...');
let bundleCssContent = '';
cssFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    bundleCssContent += `/* --- ${file} --- */\n` + fs.readFileSync(file, 'utf8') + '\n\n';
  }
});

fs.writeFileSync('bundle.css', bundleCssContent, 'utf8');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else if (exists) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
  }
}

// Copy to www
console.log('Copying to www/...');
if (!fs.existsSync('www')) fs.mkdirSync('www');
fs.copyFileSync('index.html', 'www/index.html');
fs.copyFileSync('bundle.js', 'www/bundle.js');
fs.copyFileSync('bundle.css', 'www/bundle.css');

if (fs.existsSync('css')) copyRecursiveSync('css', 'www/css');
if (fs.existsSync('js')) copyRecursiveSync('js', 'www/js');

// Copy to android assets
const androidDir = 'android/app/src/main/assets/public';
if (fs.existsSync('android')) {
  console.log('Copying to android assets...');
  copyRecursiveSync('www', androidDir);
}

console.log('Build complete!');
