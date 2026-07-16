'use strict';

// SCORES — Best score per level stored in localStorage
// Score = { time: seconds, stars: 1|2|3, totalWrong: n, date: ISO string }
// Lower time + fewer wrong = better. Stars take priority.
// =============================================================================
const SCORES = (function() {
  var KEY = 'buildItRight_scores';

  function _load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(_) { return {}; }
  }
  function _save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch(_) {}
  }

  // Returns star count (1-3) from totalWrong and stageCount
  function calcStars(totalWrong, stageCount) {
    if (totalWrong === 0)             return 3;
    if (totalWrong <= stageCount)     return 2;
    return 1;
  }

  // Save a completed run. Only updates if this run is better (more stars, or same stars + less time).
  function save(levelId, elapsedSecs, totalWrong, stageCount) {
    var data    = _load();
    var stars   = calcStars(totalWrong, stageCount);
    var current = data[levelId];
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

  // Get best score for a level (or null)
  function get(levelId) {
    return _load()[levelId] || null;
  }

  // Get all scores
  function getAll() { return _load(); }

  return { save, get, getAll, calcStars };
}());

// =============================================================================