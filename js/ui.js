'use strict';

// STAGE RENDERER
// =============================================================================
function renderStage(stageIndex) {
  const level = GAME_DATA.levels[gameState.currentLevelId];
  if (!level) return;
  const stage = level.stages[stageIndex];
  if (!stage) return;

  drawStructure(stageIndex);

  // Shuffle cards
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  const materials = shuffle(stage.materials);

  let html = '';
  materials.forEach(function(m) {
    const cls = 'mat-' + m.id.replace(/[^a-z0-9]/g, '-');
    html += '<button class="card ' + cls + '" draggable="true" data-material-id="' + m.id + '"' +
      ' aria-label="' + m.name + ': ' + m.description.replace(/"/g,'&quot;') + '">' +
      '<span class="card-texture-swatch" aria-hidden="true"></span>' +
      '<span class="card-icon" aria-hidden="true">' + m.icon + '</span>' +
      '<span class="card-name">' + m.name + '</span>' +
      '<span class="card-desc">' + m.description + '</span>' +
      '</button>';
  });
  const cc = document.getElementById('card-container');
  if (cc) cc.innerHTML = html;

  document.querySelectorAll('#card-container .card').forEach(function(card) {
    card.addEventListener('click',      onCardClick);
    card.addEventListener('dragstart',  onCardDragStart);
    card.addEventListener('dragend',    onCardDragEnd);
    card.addEventListener('touchstart', onCardTouchStartLP, { passive: false });
    card.addEventListener('touchmove',  onCardTouchMoveLP,  { passive: false });
    card.addEventListener('touchend',   onCardTouchEndLP);
    card.addEventListener('touchcancel', onCardTouchCancelLP);
  });

  const instrEl = document.getElementById('stage-instruction');
  if (instrEl) instrEl.textContent = stage.instruction;

  gameState.selectedMaterialId = null;
  document.querySelectorAll('.card').forEach(function(c) { c.classList.remove('selected'); });

  const totalStages = level.stages.length;
  const progEl = document.getElementById('stage-progress');
  if (progEl) progEl.textContent = 'Stage ' + (stageIndex + 1) + ' of ' + totalStages;
}

// =============================================================================
// FEEDBACK ENGINE
// =============================================================================
function showSuccessFeedback() {
  const structEl = document.getElementById('structure-display');
  const msgEl    = document.getElementById('feedback-message');
  if (structEl) structEl.classList.add('success-flash');
  if (msgEl) {
    msgEl.textContent = '✓ Correct! Great job! 🎉';
    msgEl.className = 'feedback-message visible feedback-success';
  }
  SOUND.correct();
  setTimeout(function() {
    if (structEl) structEl.classList.remove('success-flash');
    if (msgEl)    msgEl.classList.remove('visible', 'feedback-success');
  }, 1500);
}

function showFailureFeedback(explanation) {
  const structEl = document.getElementById('structure-display');
  const msgEl    = document.getElementById('feedback-message');
  const message  = (explanation != null && explanation !== '')
    ? '❌ ' + explanation
    : "❌ That material isn't right for this stage. Try another!";
  if (structEl) structEl.classList.add('wobble');
  if (msgEl) {
    msgEl.textContent = message;
    msgEl.className = 'feedback-message visible feedback-error';
  }
  SOUND.wrong();
  setTimeout(function() {
    if (structEl) structEl.classList.remove('wobble');
    if (msgEl)    msgEl.classList.remove('visible', 'feedback-error');
  }, 2200);
}

function showSelectCardReminder() {
  const msgEl = document.getElementById('feedback-message');
  if (msgEl) {
    msgEl.textContent = '👆 Pick a material card first!';
    msgEl.className = 'feedback-message visible feedback-reminder';
  }
  setTimeout(function() {
    if (msgEl) msgEl.classList.remove('visible', 'feedback-reminder');
  }, 2000);
}

// =============================================================================
// RESULTS SUMMARY
// =============================================================================
function buildResultsSummary() {
  if (gameState.endTime === null) {
    console.error('buildResultsSummary: endTime is null');
    return;
  }

  const level       = GAME_DATA.levels[gameState.currentLevelId];
  const stages      = level.stages;
  const elapsedSecs = Math.round((gameState.endTime - gameState.startTime) / 1000);
  const totalWrong  = gameState.stageAttempts.reduce(function(s, n) { return s + n; }, 0);

  // Save score and get comparison result
  var scoreResult = SCORES.save(gameState.currentLevelId, elapsedSecs, totalWrong, stages.length);
  var best        = SCORES.get(gameState.currentLevelId);

  var starsCount = scoreResult.stars;
  var starsText  = starsCount === 3 ? '⭐⭐⭐ Perfect!'
                 : starsCount === 2 ? '⭐⭐ Well done!'
                 :                    '⭐ Keep practising!';

  // New best banner
  var newBestHtml = '';
  if (scoreResult.isBetter && !scoreResult.isNew) {
    newBestHtml = '<div class="results-new-best">🎉 New Best Score!</div>';
  } else if (scoreResult.isNew) {
    newBestHtml = '<div class="results-new-best">🏅 First Run Complete!</div>';
  }

  // Previous best comparison
  var prevBestHtml = '';
  if (scoreResult.previous) {
    var prev = scoreResult.previous;
    var timeDiff = prev.time - elapsedSecs;
    var timeLine = timeDiff > 0
      ? '<span class="results-best-improve">▲ ' + timeDiff + 's faster</span>'
      : timeDiff < 0
        ? '<span class="results-best-worse">▼ ' + Math.abs(timeDiff) + 's slower</span>'
        : '<span>Same time</span>';
    var starsBadge = prev.stars === 3 ? '⭐⭐⭐' : prev.stars === 2 ? '⭐⭐' : '⭐';
    prevBestHtml =
      '<div class="results-prev-best">' +
      '<span class="results-prev-label">Previous best:</span> ' +
      starsBadge + ' · ' + prev.time + 's · ' + timeLine +
      '</div>';
  }

  var rows = '';
  stages.forEach(function(stage, i) {
    var tries = (gameState.stageAttempts[i] || 0) + 1;
    var icon  = tries === 1 ? '✅' : tries <= 2 ? '👍' : '💪';
    rows += '<tr><td>' + icon + ' ' + stage.name + '</td>' +
            '<td class="attempts-cell">' + tries + '</td></tr>';
  });

  var html =
    '<div class="results-trophy">🏆</div>' +
    '<h3 class="results-level-title">' + level.title + ' Complete!</h3>' +
    newBestHtml +
    '<p class="results-stars">' + starsText + '</p>' +
    prevBestHtml +
    '<table class="results-table" aria-label="Stage results">' +
    '<thead><tr><th>Stage</th><th class="attempts-cell">Tries</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table>' +
    '<p class="results-time">⏱ Total Time: <strong>' +
      elapsedSecs + ' second' + (elapsedSecs === 1 ? '' : 's') +
    '</strong></p>' +
    '<div class="results-buttons">' +
    '<button id="btn-play-again" class="btn btn-primary">🔄 Play Again</button>' +
    '<button id="btn-choose-level" class="btn btn-secondary">🏠 Choose Level</button>' +
    '</div>';

  var rc = document.getElementById('results-content');
  if (rc) rc.innerHTML = html;

  var pab = document.getElementById('btn-play-again');
  if (pab) pab.addEventListener('click', function() {
    initGame(gameState.currentLevelId); showScreen('game'); renderStage(0);
  });

  var clb = document.getElementById('btn-choose-level');
  if (clb) clb.addEventListener('click', function() { showScreen('levelSelect'); });

  SOUND.celebrate();
  launchConfetti();
}

// =============================================================================
// CONFETTI
// =============================================================================
function launchConfetti() {
  var colours = ['#ff6b6b','#ffd700','#51cf66','#74c0fc','#f06595','#ff922b','#a9e34b','#63e6be'];
  for (var i = 0; i < 80; i++) {
    var piece    = document.createElement('div');
    piece.className = 'confetti-piece';
    var size     = 8  + Math.random() * 8;
    var startX   = Math.random() * 100;
    var drift    = (Math.random() - 0.5) * 200;
    var duration = 1.5 + Math.random() * 1.8;
    var delay    = Math.random() * 0.6;
    var rot      = Math.floor(Math.random() * 360);
    var colour   = colours[Math.floor(Math.random() * colours.length)];
    var shape    = Math.random() > 0.5 ? '50%' : '2px';
    piece.style.cssText = [
      'width:'              + size     + 'px',
      'height:'             + size     + 'px',
      'background:'         + colour,
      'border-radius:'      + shape,
      'left:'               + startX   + 'vw',
      'top:-20px',
      '--drift:'            + drift    + 'px',
      '--rot:'              + rot      + 'deg',
      'animation-duration:' + duration + 's',
      'animation-delay:'    + delay    + 's'
    ].join(';');
    document.body.appendChild(piece);
    piece.addEventListener('animationend', function() { this.remove(); });
  }
}

// =============================================================================
// SETTINGS MODAL
// =============================================================================
(function wireSettings() {
  function init() {
    var btnOpen    = document.getElementById('btn-settings');
    var btnClose   = document.getElementById('btn-settings-close');
    var overlay    = document.getElementById('settings-overlay');
    var muteToggle = document.getElementById('settings-mute-toggle');

    if (!btnOpen || !overlay) return;

    function openSettings() {
      overlay.classList.add('active');
      if (muteToggle) muteToggle.textContent = SOUND.isMuted() ? '🔇 Sound: Off' : '🔊 Sound: On';
    }
    function closeSettings() { overlay.classList.remove('active'); }

    btnOpen.addEventListener('click',  openSettings);
    if (btnClose) btnClose.addEventListener('click', closeSettings);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeSettings(); });

    if (muteToggle) {
      muteToggle.addEventListener('click', function() {
        var muted = SOUND.toggleMute();
        muteToggle.textContent = muted ? '🔇 Sound: Off' : '🔊 Sound: On';
        var gameMuteBtn = document.getElementById('btn-mute');
        if (gameMuteBtn) gameMuteBtn.textContent = muted ? '🔇' : '🔊';
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());

