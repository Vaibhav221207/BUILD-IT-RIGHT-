// =============================================================================
// Build It Right — scores.js
//
// Tracks the player's best score for each level using localStorage.
//
// What gets saved per level:
//   time       — elapsed seconds (lower is better)
//   stars      — 1, 2, or 3 (higher is better; takes priority over time)
//   totalWrong — number of wrong guesses across all stages
//   date       — display date string of when the record was set
//
// A new score only replaces the old one if it is strictly better:
//   more stars, OR same stars with a faster time.
//
// localStorage key: "buildItRight_scores"  (an object keyed by levelId)
// =============================================================================

'use strict';

// SCORES is an IIFE (Immediately Invoked Function Expression).
// This pattern keeps _load, _save, and KEY private — callers only
// see the four public methods returned at the bottom: save, get, getAll, calcStars.
const SCORES = (function() {
  // The key used to read/write the scores object in localStorage.
  var KEY = 'buildItRight_scores';

  // Read the scores object from localStorage.
  // Returns an empty object {} if nothing is stored yet or if parsing fails.
  function _load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(_) { return {}; }
  }

  // Write the scores object back to localStorage.
  // Silently fails if localStorage is unavailable (e.g. private browsing).
  function _save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(_) {}
  }

  // Convert a wrong-guess count into a 1–3 star rating.
  //   0 wrong         → 3 stars (perfect run)
  //   ≤ stageCount    → 2 stars (at most one mistake per stage)
  //   more than that  → 1 star
  function calcStars(totalWrong, stageCount) {
    if (totalWrong === 0)             return 3;
    if (totalWrong <= stageCount)     return 2;
    return 1;
  }

  // Save a completed run for the given level.
  // Returns an object describing the result:
  //   { stars, isNew, isBetter, previous }
  //   isNew     — true if this is the player's first run for this level
  //   isBetter  — true if this run beats the previous best
  //   previous  — the old best score object (or null if isNew)
  function save(levelId, elapsedSecs, totalWrong, stageCount) {
    var data    = _load();
    var stars   = calcStars(totalWrong, stageCount);
    var current = data[levelId]; // may be undefined if first run
    var isBetter = !current ||
                   stars > current.stars ||
                   (stars === current.stars && elapsedSecs < current.time);
    var isNew = !current;

    if (isBetter) {
      data[levelId] = {
        time:       elapsedSecs,
        stars:      stars,
        totalWrong: totalWrong,
        date:       new Date().toLocaleDateString()
      };
      _save(data);
    }
    return { stars: stars, isNew: isNew, isBetter: isBetter, previous: current };
  }

  // Return the best score for one level, or null if never played.
  function get(levelId) {
    return _load()[levelId] || null;
  }

  // Return all saved scores as a plain object keyed by levelId.
  function getAll() { return _load(); }

  // Expose only the public API.
  return { save, get, getAll, calcStars };
}());
