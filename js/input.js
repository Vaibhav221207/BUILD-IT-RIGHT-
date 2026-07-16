'use strict';

// CARD INTERACTION — click + drag + long-press touch drag
// =============================================================================

// Detect touch device
var _isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

// Tap-prompt management — shows "Now tap the structure! ☝️" above structure
function showTapPrompt() {
  removeTapPrompt();
  var structDisplay = document.getElementById('structure-display');
  if (!structDisplay) return;
  var prompt = document.createElement('div');
  prompt.className = 'tap-prompt';
  prompt.textContent = 'Now tap the structure! ☝️';
  prompt.id = 'tap-prompt';
  structDisplay.style.position = 'relative';
  structDisplay.appendChild(prompt);
}
function removeTapPrompt() {
  var old = document.getElementById('tap-prompt');
  if (old) old.remove();
}

function onCardClick(e) {
  // On touch devices, ignore click events from touch — we handle them in touchend
  if (_isTouchDevice && e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
  document.querySelectorAll('.card').forEach(function(c) { c.classList.remove('selected'); });
  e.currentTarget.classList.add('selected');
  setSelectedMaterial(e.currentTarget.dataset.materialId);
  SOUND.cardPick();
  showTapPrompt();
}

const _drag = { materialId: null, ghost: null, touchCard: null, badge: null };

function onCardDragStart(e) {
  _drag.materialId = e.currentTarget.dataset.materialId;
  e.dataTransfer.setData('text/plain', _drag.materialId);
  e.dataTransfer.effectAllowed = 'copy';

  // Create a small compact badge (icon only) as the drag image
  const card = e.currentTarget;
  const icon = card.querySelector('.card-icon');
  const iconText = icon ? icon.textContent : '📦';

  const badge = document.createElement('div');
  badge.style.cssText = [
    'position:fixed', 'left:-200px', 'top:-200px',
    'width:44px', 'height:44px',
    'border-radius:50%',
    'background:#FFFDE7',
    'border:2.5px solid #FFD700',
    'box-shadow:0 3px 10px rgba(0,0,0,0.25)',
    'display:flex', 'align-items:center', 'justify-content:center',
    'font-size:1.4rem', 'line-height:1',
    'pointer-events:none', 'z-index:9999'
  ].join(';');
  badge.textContent = iconText;
  document.body.appendChild(badge);
  _drag.badge = badge;

  if (e.dataTransfer.setDragImage) {
    e.dataTransfer.setDragImage(badge, 30, 30);
  }

  SOUND.cardPick();
}

function onCardDragEnd(e) {
  if (_drag.badge) { _drag.badge.remove(); _drag.badge = null; }
  _drag.materialId = null;
}

// =============================================================================
// LONG-PRESS TOUCH DRAG — hold 400ms to drag, quick tap = select
// =============================================================================
var _lp = {
  timer: null,         // setTimeout ID for long-press delay
  startX: 0,           // finger start X
  startY: 0,           // finger start Y
  isDragging: false,    // has the long-press threshold been met?
  card: null,           // the card element being touched
  materialId: null,     // the material ID
  ghost: null,          // floating drag ghost badge
  moved: false          // did finger move significantly before threshold?
};

var LONG_PRESS_MS = 400;   // hold 400ms before drag activates
var MOVE_THRESHOLD = 10;   // px of movement that cancels long-press

function onCardTouchStartLP(e) {
  // Don't prevent default here — allows scroll to work naturally!
  var card = e.currentTarget;
  var touch = e.touches[0];

  _lp.card = card;
  _lp.materialId = card.dataset.materialId;
  _lp.startX = touch.clientX;
  _lp.startY = touch.clientY;
  _lp.isDragging = false;
  _lp.moved = false;

  // Start long-press timer — if held 400ms without moving, activate drag
  _lp.timer = setTimeout(function() {
    if (_lp.moved) return; // finger moved too much, cancel
    _lp.isDragging = true;
    card.classList.add('long-press-active');
    SOUND.cardPick();

    // Create drag ghost badge
    var icon = card.querySelector('.card-icon');
    var iconText = icon ? icon.textContent : '📦';
    var ghost = document.createElement('div');
    ghost.className = 'drag-ghost-badge';
    ghost.textContent = iconText;
    ghost.style.cssText = [
      'position:fixed',
      'left:' + (_lp.startX - 22) + 'px',
      'top:'  + (_lp.startY - 22) + 'px',
      'width:44px', 'height:44px',
      'border-radius:50%',
      'background:#FFFDE7',
      'border:2.5px solid #FFD700',
      'box-shadow:0 4px 14px rgba(0,0,0,0.3)',
      'display:flex', 'align-items:center', 'justify-content:center',
      'font-size:1.4rem', 'line-height:1',
      'pointer-events:none', 'z-index:9999',
      'transform:scale(1.15)'
    ].join(';');
    document.body.appendChild(ghost);
    _lp.ghost = ghost;

    // Prevent scrolling now that drag is active
    e.preventDefault && e.preventDefault();
  }, LONG_PRESS_MS);
}

function onCardTouchMoveLP(e) {
  var touch = e.touches[0];
  var dx = Math.abs(touch.clientX - _lp.startX);
  var dy = Math.abs(touch.clientY - _lp.startY);

  if (_lp.isDragging) {
    // Drag mode active — move the ghost, prevent scroll
    e.preventDefault();
    if (_lp.ghost) {
      _lp.ghost.style.left = (touch.clientX - 22) + 'px';
      _lp.ghost.style.top  = (touch.clientY - 22) + 'px';
    }
  } else {
    // Not yet dragging — check if moved too far (cancels long-press, allows scroll)
    if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
      _lp.moved = true;
      clearTimeout(_lp.timer);
      _lp.timer = null;
      if (_lp.card) _lp.card.classList.remove('long-press-active');
    }
  }
}

function onCardTouchEndLP(e) {
  clearTimeout(_lp.timer);
  _lp.timer = null;

  if (_lp.isDragging) {
    // DRAG ended — check if dropped on structure
    var touch = e.changedTouches[0];
    if (_lp.ghost) { _lp.ghost.remove(); _lp.ghost = null; }
    if (_lp.card) _lp.card.classList.remove('long-press-active');

    var zone = document.getElementById('structure-display');
    if (zone && _lp.materialId) {
      var r = zone.getBoundingClientRect();
      if (touch.clientX >= r.left && touch.clientX <= r.right &&
          touch.clientY >= r.top  && touch.clientY <= r.bottom) {
        document.querySelectorAll('.card').forEach(function(c) { c.classList.remove('selected'); });
        if (_lp.card) _lp.card.classList.add('selected');
        setSelectedMaterial(_lp.materialId);
        removeTapPrompt();
        attemptPlacement();
      }
    }
  } else if (!_lp.moved) {
    // QUICK TAP — select card (same as click)
    e.preventDefault(); // prevent ghost click
    document.querySelectorAll('.card').forEach(function(c) { c.classList.remove('selected'); });
    if (_lp.card) _lp.card.classList.add('selected');
    setSelectedMaterial(_lp.materialId);
    SOUND.cardPick();
    showTapPrompt();
  }
  // else: _lp.moved === true — user was scrolling, do nothing

  _lp.isDragging = false;
  _lp.card = null;
  _lp.materialId = null;
  _lp.moved = false;
}

function onCardTouchCancelLP() {
  clearTimeout(_lp.timer);
  _lp.timer = null;
  if (_lp.ghost) { _lp.ghost.remove(); _lp.ghost = null; }
  if (_lp.card) _lp.card.classList.remove('long-press-active');
  _lp.isDragging = false;
  _lp.card = null;
  _lp.materialId = null;
  _lp.moved = false;
}

// Wire drop zone
(function() {
  function init() {
    const zone = document.getElementById('structure-display');
    if (!zone) return;
    zone.addEventListener('dragover',  function(e) { e.preventDefault(); zone.classList.add('drag-over'); });
    zone.addEventListener('dragleave', function()   { zone.classList.remove('drag-over'); });
    zone.addEventListener('drop',      function(e) {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      if (!id) return;
      document.querySelectorAll('.card').forEach(function(c) {
        c.classList.remove('selected');
        if (c.dataset.materialId === id) c.classList.add('selected');
      });
      setSelectedMaterial(id);
      removeTapPrompt();
      attemptPlacement();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());

// =============================================================================
// PLACEMENT LOGIC
// =============================================================================
function attemptPlacement() {
  if (gameState.selectedMaterialId === null) {
    showSelectCardReminder();
    return;
  }

  if (checkPlacement()) {
    markSlotFilled(gameState.currentStageIndex);
    removeTapPrompt();
    showSuccessFeedback();
    setTimeout(function() { advanceStage(); }, 650);
  } else {
    const level = GAME_DATA.levels[gameState.currentLevelId];
    const stage = level.stages[gameState.currentStageIndex];
    const explanation = stage.failureReasons[gameState.selectedMaterialId];
    incrementAttempts(gameState.currentStageIndex);
    showFailureFeedback(explanation);
    gameState.selectedMaterialId = null;
    document.querySelectorAll('.card').forEach(function(c) { c.classList.remove('selected'); });
  }
}

// =============================================================================