// =============================================================================
// Build It Right — state.js
//
// Central game state and all functions that read or mutate it.
// Every other file reads gameState but only this file should write to it
// (except for selectedMaterialId, which input.js sets via setSelectedMaterial).
//
// Also contains:
//   - Screen manager (showScreen)
//   - Level button wiring
//   - Toolbar button wiring (Home, Restart)
//   - Best-score badge injection on the level select page
// =============================================================================

'use strict';

// ---- Game State ----
// A single object that holds everything about the current play session.
// Initialised (or reset) by initGame() each time the player starts a level.
const gameState = {
  currentLevelId:     null,  // which level is active: "wall" | "bridge" | "dam" | "skyscraper"
  currentStageIndex:  0,     // which stage the player is on (0-based)
  selectedMaterialId: null,  // the material card the player last tapped (or null)
  stageAttempts:      [],    // wrong guesses per stage — e.g. [0, 2, 1] means stage 1 took 3 tries
  startTime:          null,  // Date.now() timestamp when the level began
  endTime:            null   // Date.now() timestamp when the last stage was completed
};

// Reset all state and start a fresh game session for the given level.
// Called every time the player picks a level (or hits Restart).
function initGame(levelId) {
  const level = GAME_DATA.levels[levelId];
  if (!level) { console.error('Unknown level ID: ' + levelId); return; }

  gameState.currentLevelId     = levelId;
  gameState.currentStageIndex  = 0;
  gameState.selectedMaterialId = null;
  // One counter per stage, all starting at 0 (wrong guesses are added later).
  gameState.stageAttempts      = new Array(level.stages.length).fill(0);
  gameState.startTime          = Date.now();
  gameState.endTime            = null;

  // Update the level title and "Stage 1 of N" progress text in the header.
  const titleEl = document.getElementById('level-title');
  if (titleEl) titleEl.textContent = level.title;
  const progEl = document.getElementById('stage-progress');
  if (progEl) progEl.textContent = 'Stage 1 of ' + level.stages.length;
}

// Wire each level-select card button to start the corresponding level.
['wall','bridge','dam','skyscraper'].forEach(function(id) {
  const btn = document.getElementById('btn-level-' + id);
  if (btn) btn.addEventListener('click', function() {
    initGame(id);
    showScreen('game');
    renderStage(0); // draw stage 0 (the first stage) straight away
  });
});

// ---- Best-score badges on level cards ----
// Reads saved scores and injects a small gold badge onto each level card
// showing the player's best star rating and time for that level.
function refreshLevelScoreBadges() {
  ['wall','bridge','dam','skyscraper'].forEach(function(id) {
    var card = document.getElementById('btn-level-' + id);
    if (!card) return;

    // Remove any badge from a previous visit to this screen.
    var old = card.querySelector('.ls-best-badge');
    if (old) old.remove();

    var best = SCORES.get(id);
    if (!best) return; // player hasn't completed this level yet

    var starsStr = best.stars === 3 ? '⭐⭐⭐' : best.stars === 2 ? '⭐⭐' : '⭐';
    var badge = document.createElement('div');
    badge.className = 'ls-best-badge';
    badge.innerHTML = '<span class="ls-best-icon">🏅</span>' +
                      '<span>' + starsStr + ' · ' + best.time + 's</span>';
    card.querySelector('.ls-card-body').appendChild(badge);
  });
}

// Extend showScreen to also refresh score badges whenever the level-select
// page is displayed (so newly earned scores appear immediately after a run).
var _origShowScreen = showScreen;
showScreen = function(name) {
  _origShowScreen(name);
  if (name === 'levelSelect') refreshLevelScoreBadges();
};

// Wire game-screen toolbar buttons
document.addEventListener('DOMContentLoaded', function() {
  var btnHome       = document.getElementById('btn-home');
  var btnRestart    = document.getElementById('btn-restart');
  var btnBackStart  = document.getElementById('btn-back-to-start');

  if (btnHome) btnHome.addEventListener('click', function() {
    showScreen('levelSelect');
  });
  if (btnRestart) btnRestart.addEventListener('click', function() {
    if (gameState.currentLevelId) {
      initGame(gameState.currentLevelId);
      showScreen('game');
      renderStage(0);
    }
  });
  if (btnBackStart) btnBackStart.addEventListener('click', function() {
    showScreen('start');
  });
});

function setSelectedMaterial(materialId) { gameState.selectedMaterialId = materialId; }

function checkPlacement() {
  const level = GAME_DATA.levels[gameState.currentLevelId];
  if (!level) return false;
  const stage = level.stages[gameState.currentStageIndex];
  if (!stage) return false;
  return stage.correctIds.includes(gameState.selectedMaterialId);
}

function advanceStage() {
  gameState.currentStageIndex += 1;
  const totalStages = GAME_DATA.levels[gameState.currentLevelId].stages.length;
  if (gameState.currentStageIndex >= totalStages) {
    stopTimer(); buildResultsSummary(); showScreen('results');
  } else {
    renderStage(gameState.currentStageIndex);
    const progEl = document.getElementById('stage-progress');
    if (progEl) progEl.textContent = 'Stage ' + (gameState.currentStageIndex + 1) + ' of ' + totalStages;
  }
}

function startTimer()  { gameState.startTime = Date.now(); }
function stopTimer()   { gameState.endTime   = Date.now(); }
function incrementAttempts(i) { gameState.stageAttempts[i] += 1; }

// =============================================================================
