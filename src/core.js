/**
 * Radiology Education Platform - Core Shared Functions
 * Both neurorad.html and abdomenrad.html share these logic patterns.
 * This module extracts them for testability.
 */

// ===== QUIZ LOGIC (Leitner System) =====

function createQuizManager(storagePrefix) {
  let quizScores = {};

  function load() {
    try {
      quizScores = JSON.parse(localStorage.getItem(storagePrefix + '_quiz_scores') || '{}');
    } catch (e) {
      quizScores = {};
    }
  }

  function getQuizBox(id) {
    return quizScores[id] || 0;
  }

  function promoteQuiz(id) {
    quizScores[id] = Math.min((quizScores[id] || 0) + 1, 4);
    localStorage.setItem(storagePrefix + '_quiz_scores', JSON.stringify(quizScores));
  }

  function demoteQuiz(id) {
    quizScores[id] = 0;
    localStorage.setItem(storagePrefix + '_quiz_scores', JSON.stringify(quizScores));
  }

  function getSmartQuizPool(diseases) {
    const session = parseInt(localStorage.getItem(storagePrefix + '_quiz_session') || '0');
    return diseases.filter(function (d) {
      const box = getQuizBox(d.id);
      if (box === 0) return true;
      if (box === 1) return session % 2 === 0;
      if (box === 2) return session % 4 === 0;
      if (box === 3) return session % 8 === 0;
      return session % 16 === 0; // mastered
    });
  }

  function reset() {
    quizScores = {};
    localStorage.setItem(storagePrefix + '_quiz_scores', '{}');
    localStorage.setItem(storagePrefix + '_quiz_session', '0');
  }

  function getScores() {
    return { ...quizScores };
  }

  load();

  return {
    getQuizBox,
    promoteQuiz,
    demoteQuiz,
    getSmartQuizPool,
    reset,
    load,
    getScores
  };
}

// ===== SMART SEARCH =====

function createSmartSearch(diseases, searchSynonyms) {
  return function smartSearch(term) {
    if (!term) return diseases;
    var words = term.toLowerCase().split(/\s+/);

    // Expand each word with synonyms
    var expandedWords = [];
    words.forEach(function (w) {
      expandedWords.push(w);
      Object.keys(searchSynonyms).forEach(function (key) {
        if (key.includes(w) || w.includes(key)) {
          searchSynonyms[key].forEach(function (syn) {
            expandedWords.push(syn);
          });
        }
      });
    });

    return diseases.filter(function (d) {
      var searchIn = [
        d.name || '', d.keyPoint || '', d.id || '',
        (d.pathway || []).map(function (p) { return (p.text || '') + ' ' + (p.detail || ''); }).join(' '),
        (d.differential || []).join(' '),
        d.protocol || '',
        (d.quiz ? d.quiz.q + ' ' + d.quiz.a : ''),
        d.tagText || '', d.category || ''
      ].join(' ').toLowerCase();

      return expandedWords.some(function (ew) { return searchIn.includes(ew); });
    });
  };
}

// ===== DAILY DISEASE =====

function getDailyDisease(diseases, dateStr) {
  var today = dateStr || new Date().toISOString().slice(0, 10);
  var seed = 7;
  for (var i = 0; i < today.length; i++) seed += today.charCodeAt(i);
  return diseases[seed % diseases.length];
}

// ===== FAVORITES =====

function createFavoritesManager(storageKey) {
  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch (e) {
      return [];
    }
  }

  function toggleFavorite(id) {
    var favs = getFavorites();
    var idx = favs.indexOf(id);
    if (idx === -1) favs.push(id);
    else favs.splice(idx, 1);
    localStorage.setItem(storageKey, JSON.stringify(favs));
    return favs;
  }

  function isFavorite(id) {
    return getFavorites().indexOf(id) !== -1;
  }

  return { getFavorites, toggleFavorite, isFavorite };
}

// ===== STUDIED TRACKER =====

function createStudiedTracker(storageKey) {
  let studied = [];

  function load() {
    try {
      studied = JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch (e) {
      studied = [];
    }
  }

  function toggleStudied(id) {
    if (studied.includes(id)) {
      studied = studied.filter(function (s) { return s !== id; });
    } else {
      studied.push(id);
    }
    localStorage.setItem(storageKey, JSON.stringify(studied));
    return studied;
  }

  function isStudied(id) {
    return studied.includes(id);
  }

  function getStudied() {
    return [...studied];
  }

  function getCount() {
    return studied.length;
  }

  function reset() {
    studied = [];
    localStorage.setItem(storageKey, '[]');
  }

  load();

  return { toggleStudied, isStudied, getStudied, getCount, reset, load };
}

// ===== THEME MANAGER =====

function createThemeManager(storageKey) {
  function getTheme() {
    return localStorage.getItem(storageKey) || 'dark';
  }

  function toggleTheme() {
    var current = getTheme();
    var next = current === 'light' ? 'dark' : 'light';
    localStorage.setItem(storageKey, next);
    return next;
  }

  function isLight() {
    return getTheme() === 'light';
  }

  return { getTheme, toggleTheme, isLight };
}

// ===== UTILITY FUNCTIONS =====

function hexToRgb(hex) {
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return r + ',' + g + ',' + b;
}

function getRegionCenter(path) {
  const nums = path.match(/[\d.]+/g).map(Number);
  let sumX = 0, sumY = 0, count = 0;
  for (let i = 0; i < nums.length - 1; i += 2) {
    sumX += nums[i];
    sumY += nums[i + 1];
    count++;
  }
  return { x: Math.round(sumX / count), y: Math.round(sumY / count) };
}

// ===== DATA VALIDATION =====

function validateDisease(disease) {
  const errors = [];
  if (!disease.id) errors.push('id alanı eksik');
  if (!disease.name) errors.push('name alanı eksik');
  if (!disease.category) errors.push('category alanı eksik');
  if (!disease.pathway || !Array.isArray(disease.pathway)) {
    errors.push('pathway alanı eksik veya dizi değil');
  } else {
    disease.pathway.forEach(function (p, i) {
      if (!p.type) errors.push('pathway[' + i + '].type eksik');
      if (!p.label) errors.push('pathway[' + i + '].label eksik');
      if (!p.text) errors.push('pathway[' + i + '].text eksik');
    });
  }
  if (!disease.keyPoint) errors.push('keyPoint alanı eksik');
  if (!disease.differential || !Array.isArray(disease.differential)) {
    errors.push('differential alanı eksik veya dizi değil');
  }
  if (!disease.quiz || !disease.quiz.q || !disease.quiz.a) {
    errors.push('quiz alanı eksik veya eksik soru/cevap');
  }
  return errors;
}

function validateDuel(duel, diseaseIds) {
  const errors = [];
  if (!duel.title) errors.push('title alanı eksik');
  if (!duel.a || !duel.a.name) errors.push('a tarafı eksik');
  if (!duel.b || !duel.b.name) errors.push('b tarafı eksik');
  if (!duel.keyDiff) errors.push('keyDiff alanı eksik');
  return errors;
}

function validateSignalQuiz(quiz) {
  const errors = [];
  if (!quiz.q) errors.push('soru (q) eksik');
  if (!quiz.options || !Array.isArray(quiz.options)) {
    errors.push('options alanı eksik veya dizi değil');
  } else {
    if (quiz.options.length < 2) errors.push('en az 2 seçenek olmalı');
    if (quiz.answer !== undefined && (quiz.answer < 0 || quiz.answer >= quiz.options.length)) {
      errors.push('answer indeksi geçersiz (0-' + (quiz.options.length - 1) + ' arası olmalı)');
    }
  }
  return errors;
}

// ===== STATISTICS CALCULATOR =====

function calculateStats(diseases, studiedIds, quizScores) {
  const total = diseases.length;
  const studiedCount = studiedIds.length;
  const pct = total > 0 ? Math.round(studiedCount / total * 100) : 0;

  const getBox = function (id) { return quizScores[id] || 0; };
  const mastered = diseases.filter(function (d) { return getBox(d.id) >= 3; }).length;
  const learning = diseases.filter(function (d) { var b = getBox(d.id); return b > 0 && b < 3; }).length;
  const notStarted = diseases.filter(function (d) { return getBox(d.id) === 0; }).length;

  const catStats = {};
  diseases.forEach(function (d) {
    if (!catStats[d.category]) catStats[d.category] = { total: 0, studied: 0 };
    catStats[d.category].total++;
    if (studiedIds.indexOf(d.id) !== -1) catStats[d.category].studied++;
  });

  return { total, studiedCount, pct, mastered, learning, notStarted, catStats };
}

// ===== EXPORTS =====

export {
  createQuizManager,
  createSmartSearch,
  getDailyDisease,
  createFavoritesManager,
  createStudiedTracker,
  createThemeManager,
  hexToRgb,
  getRegionCenter,
  validateDisease,
  validateDuel,
  validateSignalQuiz,
  calculateStats
};
