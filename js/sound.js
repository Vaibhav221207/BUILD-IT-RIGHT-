'use strict';

// SOUND — Web Audio synthesis (no audio files needed)
// =============================================================================
const SOUND = (function () {
  let _ctx = null;
  let _muted = false;
  try { _muted = localStorage.getItem('buildItRight_muted') === 'true'; } catch (_) {}

  function _getCtx() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  function _tone(type, freq, endFreq, duration, gain, startTime) {
    const ctx = _getCtx();
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (endFreq !== freq) osc.frequency.linearRampToValueAtTime(endFreq, startTime + duration);
    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(gain, startTime + 0.005);
    env.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.connect(env); env.connect(ctx.destination);
    osc.start(startTime); osc.stop(startTime + duration + 0.01);
  }

  function cardPick() {
    if (_muted) return;
    try { const ctx = _getCtx(); _tone('sine', 440, 440, 0.08, 0.25, ctx.currentTime); } catch (_) {}
  }
  function correct() {
    if (_muted) return;
    try {
      const ctx = _getCtx(); const t = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach(function(f, i) { _tone('sine', f, f, 0.12, 0.35, t + i * 0.11); });
    } catch (_) {}
  }
  function wrong() {
    if (_muted) return;
    try { const ctx = _getCtx(); _tone('sawtooth', 150, 80, 0.30, 0.30, ctx.currentTime); } catch (_) {}
  }
  function celebrate() {
    if (_muted) return;
    try {
      const ctx = _getCtx(); const t = ctx.currentTime;
      [523.25, 587.33, 659.25, 783.99, 1046.5].forEach(function(f, i) { _tone('triangle', f, f, 0.12, 0.40, t + i * 0.055); });
    } catch (_) {}
  }
  function buttonClick() {
    if (_muted) return;
    try { const ctx = _getCtx(); _tone('sine', 600, 600, 0.06, 0.20, ctx.currentTime); } catch (_) {}
  }
  function toggleMute() {
    _muted = !_muted;
    try { localStorage.setItem('buildItRight_muted', _muted); } catch (_) {}
    return _muted;
  }
  function isMuted() { return _muted; }
  return { cardPick, correct, wrong, celebrate, buttonClick, toggleMute, isMuted };
}());

// Wire mute button
(function wireMuteButton() {
  function init() {
    var btn = document.getElementById('btn-mute');
    if (!btn) return;
    btn.textContent = SOUND.isMuted() ? '🔇' : '🔊';
    btn.addEventListener('click', function() {
      btn.textContent = SOUND.toggleMute() ? '🔇' : '🔊';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());

// Button click sound (delegated)
document.addEventListener('click', function(e) {
  var el = e.target;
  while (el && el !== document.body) {
    if (el.classList && el.classList.contains('btn')) { SOUND.buttonClick(); return; }
    el = el.parentElement;
  }
}, true);

// =============================================================================