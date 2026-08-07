# Implementation Plan: Fix APK Compatibility and Online Europe Mode Tap Detection

Fix two major issues in **GeoMeister**:
1. **APK Device Compatibility**: Fix app crashes and blank map screens on various Android devices caused by external CDN script dependencies, lack of offline map data fallbacks, and Android WebView cleartext/CORS restrictions.
2. **Europe Online & Map Tap Detection**: Fix the bug where taps/clicks on the Europe map in Online and Solo modes fail to register due to broken `pointercancel` / `activePointers` event handling, and fix incorrect city pool selection in multiplayer lobby creation where non-European world cities were selected for Europe mode.

## User Review Required

> [!IMPORTANT]
> **Key Architectural Changes**:
> - **Local Script & Map Bundling**: Libraries (`d3`, `topojson-client`) and map TopoJSON data will be bundled locally so the application functions 100% offline on any Android device without relying on external CDNs.
> - **Tap & Drag Event Architecture**: Pointer event listeners in `map-europe.js` and `map-world.js` will be rewritten to eliminate fragile `pointercancel` counter resets that caused taps to be ignored on Android WebViews.
> - **Mode-based City Pool**: `getCitiesForMode(mode)` will ensure Europe mode selects from `EUROPE_CITIES` (and Turkey mode from `TURKEY_CITIES`) in both Solo and Multiplayer modes.

---

## Proposed Changes

### Map & Interaction System

#### [MODIFY] [map-europe.js](file:///c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/js/map/map-europe.js)
- Fix touch/tap detection: Replace fragile `pointercancel` counter logic with robust tap detection (handling tap displacement up to 22px to accommodate mobile finger touch contact area).
- Remove restrictive `.filter(e => !e.type.startsWith('touch'))` on D3 zoom that interferes with touch events.
- Add local fallback for `europe-50m` TopoJSON data when offline or CDN fetch fails.

#### [MODIFY] [map-world.js](file:///c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/js/map/map-world.js)
- Align tap/click detection logic with `map-europe.js` to ensure reliable mobile WebView performance.
- Add local fallback for `world-110m` TopoJSON data.

#### [NEW] [map-data-fallback.js](file:///c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/js/map/map-data-fallback.js)
- Provide bundled fallback map dataset for offline execution on devices without internet access.

---

### Game Logic & Multiplayer System

#### [MODIFY] [question.js](file:///c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/js/game/question.js)
- Implement `getCitiesForMode(mode)` utility function.
- Update question selection in `loadQuestion()` and `nextQuestion()` to use `getCitiesForMode(activeMode)`.

#### [MODIFY] [level.js](file:///c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/js/game/level.js)
- Update `startLevel()` to choose cities matching the active game mode.

#### [MODIFY] [mp-lobby.js](file:///c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/js/multiplayer/mp-lobby.js)
- Update `mpCreateLobby()` to pick questions using `getCitiesForMode(activeMode)` so Online Europe mode selects European cities.

#### [MODIFY] [mp-bot.js](file:///c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/js/multiplayer/mp-bot.js)
- Update `startBotMatch()` to select questions matching the active game mode (`activeMode`).

---

### APK & Offline Dependencies

#### [NEW] [d3.min.js](file:///c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/js/lib/d3.min.js)
#### [NEW] [topojson-client.min.js](file:///c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/js/lib/topojson-client.min.js)
- Add standalone minified D3.js and TopoJSON libraries to `js/lib/` for offline execution.

#### [MODIFY] [index.html](file:///c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/index.html)
- Update script tags to load local `d3.min.js` and `topojson-client.min.js` prior to `bundle.js`.

#### [MODIFY] [AndroidManifest.xml](file:///c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/android/app/src/main/AndroidManifest.xml)
- Add `android:usesCleartextTraffic="true"` to application tag for network compatibility on all Android OS versions.

#### [MODIFY] [build.js](file:///c:/Users/rsmng/OneDrive/Masaüstü/GEOMEISTER-V2/build.js)
- Add local libraries and map fallback files to build process and asset sync script.

---

## Verification Plan

### Automated Build & Sync Verification
- Execute `node build.js` to ensure bundle generation completes with 0 errors.
- Check generated output files in `www/` and `android/app/src/main/assets/public/`.

### Manual Interaction & Mode Verification
1. **Europe Online & Solo Mode Tap Verification**:
   - Verify tapping anywhere on Europe map in Europe Solo and Online/Bot modes immediately places a guess marker and registers answer.
   - Verify zooming in/out with buttons and pinch gestures works smoothly without breaking tap detection.
2. **City Selection Verification**:
   - Start Online Europe mode and verify all 12 generated questions are European cities (Paris, Berlin, Rome, Madrid, etc.) and NOT distant world cities (Tokyo, Sydney).
3. **Offline / Device Compatibility Verification**:
   - Confirm application loads and displays maps even when device network connection is disabled.
