// =============================================================================
// Build It Right — main.js
//
// Entry point. This file is intentionally minimal — it just enforces
// strict mode so all other JS files run in strict mode too.
//
// Script load order in index.html:
//   1. sound.js   — Web Audio sound engine
//   2. scores.js  — Best-score localStorage system
//   3. data.js    — GAME_DATA (levels, stages, materials)
//   4. state.js   — gameState object + initGame, advanceStage, timers
//   5. render.js  — SVG structure drawing (drawWall, drawBridge, etc.)
//   6. ui.js      — renderStage, feedback functions, results summary
//   7. input.js   — Card click, drag-and-drop, touch long-press
//   8. main.js    — This file (loaded last)
// =============================================================================

'use strict';
