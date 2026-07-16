'use strict';

// GAME STATE
// =============================================================================
const gameState = {
  currentLevelId: null,
  currentStageIndex: 0,
  selectedMaterialId: null,
  stageAttempts: [],
  startTime: null,
  endTime: null
};

function initGame(levelId) {
  const level = GAME_DATA.levels[levelId];
  if (!level) { console.error('Unknown level ID: ' + levelId); return; }
  gameState.currentLevelId    = levelId;
  gameState.currentStageIndex = 0;
  gameState.selectedMaterialId= null;
  gameState.stageAttempts     = new Array(level.stages.length).fill(0);
  gameState.startTime         = Date.now();
  gameState.endTime           = null;
  const titleEl = document.getElementById('level-title');
  if (titleEl) titleEl.textContent = level.title;
  const progEl = document.getElementById('stage-progress');
  if (progEl) progEl.textContent = 'Stage 1 of ' + level.stages.length;
}

// Wire level buttons
['wall','bridge','dam','skyscraper'].forEach(function(id) {
  const btn = document.getElementById('btn-level-' + id);
  if (btn) btn.addEventListener('click', function() {
    initGame(id); showScreen('game'); renderStage(0);
  });
});

// Inject best score badges on level cards whenever level select is shown
function refreshLevelScoreBadges() {
  ['wall','bridge','dam','skyscraper'].forEach(function(id) {
    var card = document.getElementById('btn-level-' + id);
    if (!card) return;
    // Remove old badge if any
    var old = card.querySelector('.ls-best-badge');
    if (old) old.remove();
    var best = SCORES.get(id);
    if (!best) return;
    var starsStr = best.stars === 3 ? '⭐⭐⭐' : best.stars === 2 ? '⭐⭐' : '⭐';
    var badge = document.createElement('div');
    badge.className = 'ls-best-badge';
    badge.innerHTML = '<span class="ls-best-icon">🏅</span>' +
                      '<span>' + starsStr + ' · ' + best.time + 's</span>';
    card.querySelector('.ls-card-body').appendChild(badge);
  });
}

// Monkey-patch showScreen to refresh badges when levelSelect is shown
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