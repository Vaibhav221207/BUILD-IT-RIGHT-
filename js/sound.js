// =============================================================================
// Build It Right — sound.js
//
// All sound effects are synthesised in real time using the Web Audio API.
// No audio files are needed — every sound is generated from scratch using
// oscillators and gain envelopes.
//
// Why Web Audio instead of <audio> tags?
//   - Zero external files to host
//   - Instant playback (no buffering or loading delays)
//   - Works offline once the page is loaded
//
// Browser autoplay policy note:
//   AudioContext must be created (or resumed) after a user gesture.
//   We create it lazily inside _getCtx() on the first sound call, which
//   always happens after a tap/click, so autoplay restrictions are avoided.
// =============================================================================

'use strict';

// SOUND is an IIFE so _ctx, _muted, _getCtx, and _tone stay private.
// Only the public methods (cardPick, correct, wrong, etc.) are exported.
const SOUND = (function () {
  let _ctx   = null;   // AudioContext — created lazily on first sound call
  let _muted = false;  // whether the player has muted sound

  // Restore the mute preference the player set in a previous session.
  try { _muted = localStorage.getItem('buildItRight_muted') === 'true'; } catch (_) {}

  // Return the shared AudioContext, creating it if necessary.
  // Also resumes a suspended context (browsers suspend it until user interaction).
  function _getCtx() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  }

  // Play a single synthesised note.
  //
  // type      — oscillator waveform: 'sine' (pure tone), 'sawtooth' (buzzy),
  //             'triangle' (soft), 'square' (harsh)
  // freq      — starting pitch in Hz  (440 = concert A, 523 = middle C)
  // endFreq   — ending pitch; if different from freq the note bends in pitch
  // duration  — how long the note plays, in seconds
  // gain      — peak volume, 0–1
  // startTime — AudioContext timestamp when to start (ctx.currentTime = now)
  function _tone(type, freq, endFreq, duration, gain, startTime) {
    const ctx = _getCtx();

    // Oscillator generates the raw waveform at the chosen frequency.
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    // If endFreq ≠ freq, smoothly slide pitch over the note's duration.
    if (endFreq !== freq) {
      osc.frequency.linearRampToValueAtTime(endFreq, startTime + duration);
    }

    // Gain node controls the volume envelope (attack → sustain → fade out).
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, startTime);                          // start silent
    env.gain.linearRampToValueAtTime(gain, startTime + 0.005);      // quick attack (5 ms)
    env.gain.linearRampToValueAtTime(0,    startTime + duration);   // fade to silence

    // Connect the audio graph: oscillator → gain → speakers.
    osc.connect(env);
    env.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01); // tiny buffer prevents audio glitches
  }

  // Short bright click — played when the player taps a material card.
  function cardPick() {
    if (_muted) return;
    try { const ctx = _getCtx(); _tone('sine', 440, 440, 0.08, 0.25, ctx.currentTime); } catch (_) {}
  }

  // Cheerful ascending 3-note ding (C5 → E5 → G5) — played on a correct placement.
  function correct() {
    if (_muted) return;
    try {
      const ctx = _getCtx();
      const t   = ctx.currentTime;
      // Play C5, E5, G5 spaced 110 ms apart — a quick major chord arpeggio.
      [523.25, 659.25, 783.99].forEach(function(f, i) {
        _tone('sine', f, f, 0.12, 0.35, t + i * 0.11);
      });
    } catch (_) {}
  }

  // Low buzzy thud with downward pitch bend — played on a wrong placement.
  function wrong() {
    if (_muted) return;
    try {
      const ctx = _getCtx();
      // Sawtooth wave (harsh/buzzy) + pitch drops from 150 Hz to 80 Hz.
      _tone('sawtooth', 150, 80, 0.30, 0.30, ctx.currentTime);
    } catch (_) {}
  }

  // Fast upward fanfare (C D E G C) — played when a level is completed.
  function celebrate() {
    if (_muted) return;
    try {
      const ctx = _getCtx();
      const t   = ctx.currentTime;
      // Five notes played 55 ms apart — feels like a quick victory jingle.
      [523.25, 587.33, 659.25, 783.99, 1046.5].forEach(function(f, i) {
        _tone('triangle', f, f, 0.12, 0.40, t + i * 0.055);
      });
    } catch (_) {}
  }

  // Soft subtle click — played on any button press.
  function buttonClick() {
    if (_muted) return;
    try { const ctx = _getCtx(); _tone('sine', 600, 600, 0.06, 0.20, ctx.currentTime); } catch (_) {}
  }

  // Toggle mute on/off, save the new state, and return the new muted value.
  function toggleMute() {
    _muted = !_muted;
    try { localStorage.setItem('buildItRight_muted', _muted); } catch (_) {}
    return _muted;
  }

  // Return whether sound is currently muted.
  function isMuted() { return _muted; }

  // Public API — everything else (_ctx, _tone, etc.) stays private.
  return { cardPick, correct, wrong, celebrate, buttonClick, toggleMute, isMuted };
}());

// ---- Mute button wiring ----
// Runs as soon as the DOM is ready (or immediately if it already is).
(function wireMuteButton() {
  function init() {
    var btn = document.getElementById('btn-mute');
    if (!btn) return;
    // Reflect the stored mute state on page load.
    btn.textContent = SOUND.isMuted() ? '🔇' : '🔊';
    btn.addEventListener('click', function() {
      // Toggle and update the button icon.
      btn.textContent = SOUND.toggleMute() ? '🔇' : '🔊';
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}());

// ---- Global button-click sound ----
// Using event capture (third arg = true) so this fires before the button's
// own listener, giving immediate audio feedback on every .btn tap.
document.addEventListener('click', function(e) {
  var el = e.target;
  // Walk up the DOM tree — the click target might be a <span> inside <button>.
  while (el && el !== document.body) {
    if (el.classList && el.classList.contains('btn')) {
      SOUND.buttonClick();
      return;
    }
    el = el.parentElement;
  }
}, true); // capture phase
