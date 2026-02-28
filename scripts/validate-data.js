#!/usr/bin/env node
/**
 * Veri bütünlüğü doğrulama script'i
 * neurorad.html ve abdomenrad.html dosyalarındaki verileri doğrular.
 *
 * Kontroller:
 * - Hastalık yapıları (id, name, category, pathway, keyPoint, differential, quiz)
 * - Duplike ID kontrolü
 * - Düello yapıları (title, a, b, keyRule/keyDiff)
 * - Sinyal profili yapıları (id, name, signals)
 * - Sinyal quiz yapıları (combo/q, answer/options)
 * - signalBadges anahtarlarının hastalık ID'leri ile eşleşmesi
 * - Çapraz referans tutarlılığı
 *
 * Kullanım: node scripts/validate-data.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let errors = 0;
let warnings = 0;

function error(msg) { console.error('  ❌ HATA:', msg); errors++; }
function warn(msg) { console.warn('  ⚠️  UYARI:', msg); warnings++; }
function ok(msg) { console.log('  ✓', msg); }

function extractArrayBlock(html, pattern) {
  const start = html.indexOf(pattern);
  if (start === -1) return null;
  const arrStart = html.indexOf('[', start);
  let depth = 0, inString = false, escape = false;
  for (let i = arrStart; i < html.length; i++) {
    const ch = html[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"' && !inString) { inString = true; continue; }
    if (ch === '"' && inString) { inString = false; continue; }
    if (inString) continue;
    if (ch === '[') depth++;
    if (ch === ']') { depth--; if (depth === 0) return html.substring(arrStart, i + 1); }
  }
  return null;
}

function extractObjectBlock(html, pattern) {
  const start = html.indexOf(pattern);
  if (start === -1) return null;
  const objStart = html.indexOf('{', start);
  let depth = 0, inString = false, escape = false;
  for (let i = objStart; i < html.length; i++) {
    const ch = html[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === "'" && !inString) { inString = true; continue; }
    if (ch === "'" && inString) { inString = false; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    if (ch === '}') { depth--; if (depth === 0) return html.substring(objStart, i + 1); }
  }
  return null;
}

function safeEval(code) {
  try { return new Function('return ' + code)(); }
  catch (e) { return null; }
}

function validateModule(filename) {
  console.log(`\n📋 ${filename} doğrulanıyor...`);
  const filepath = path.join(ROOT, filename);
  const html = fs.readFileSync(filepath, 'utf8');

  // --- Hastalıklar ---
  const diseasesBlock = extractArrayBlock(html, 'const diseases = [');
  if (!diseasesBlock) { error('diseases dizisi bulunamadı'); return; }
  const diseases = safeEval(diseasesBlock);
  if (!diseases) { error('diseases dizisi parse edilemedi'); return; }
  ok(`${diseases.length} hastalık bulundu`);

  // Duplike ID kontrolü
  const diseaseIds = new Set();
  diseases.forEach(d => {
    if (!d.id) { error(`Hastalık id eksik: ${d.name || 'İsimsiz'}`); return; }
    if (diseaseIds.has(d.id)) { error(`Duplike hastalık ID: "${d.id}"`); }
    diseaseIds.add(d.id);

    if (!d.name) error(`[${d.id}] name eksik`);
    if (!d.category) error(`[${d.id}] category eksik`);
    if (!d.pathway || !Array.isArray(d.pathway)) error(`[${d.id}] pathway eksik veya dizi değil`);
    else {
      d.pathway.forEach((p, i) => {
        if (!p.type) error(`[${d.id}] pathway[${i}].type eksik`);
        if (!p.text) error(`[${d.id}] pathway[${i}].text eksik`);
      });
    }
    if (!d.keyPoint) error(`[${d.id}] keyPoint eksik`);
    if (!d.differential || !Array.isArray(d.differential)) error(`[${d.id}] differential eksik`);
    if (!d.quiz || !d.quiz.q || !d.quiz.a) error(`[${d.id}] quiz eksik veya soru/cevap yok`);
  });
  ok(`ID benzersizlik kontrolü tamamlandı (${diseaseIds.size} benzersiz ID)`);

  // --- Düellolar ---
  const duelsBlock = extractArrayBlock(html, 'const duels = [');
  if (duelsBlock) {
    const duels = safeEval(duelsBlock);
    if (duels) {
      ok(`${duels.length} duel bulundu`);
      const duelTitles = new Set();
      duels.forEach((d, i) => {
        if (!d.title) error(`Duel #${i}: title eksik`);
        if (duelTitles.has(d.title)) warn(`Duplike duel başlığı: "${d.title}"`);
        duelTitles.add(d.title);
        if (!d.a || !d.a.name) error(`Duel "${d.title}": a tarafı eksik`);
        if (!d.b || !d.b.name) error(`Duel "${d.title}": b tarafı eksik`);
        if (!d.keyRule && !d.keyDiff) error(`Duel "${d.title}": keyRule/keyDiff eksik`);
      });
    }
  }

  // --- Sinyal profilleri ---
  const profilesBlock = extractArrayBlock(html, 'const signalProfiles = [');
  if (profilesBlock) {
    const profiles = safeEval(profilesBlock);
    if (profiles) {
      ok(`${profiles.length} sinyal profili bulundu`);
      const profileIds = new Set();
      profiles.forEach((p, i) => {
        if (!p.id) error(`Sinyal profili #${i}: id eksik`);
        if (profileIds.has(p.id)) error(`Duplike sinyal profili ID: "${p.id}"`);
        profileIds.add(p.id);
        if (!p.signals || !Array.isArray(p.signals)) error(`[${p.id}] signals eksik`);
      });
    }
  }

  // --- Sinyal quizleri ---
  const quizzesBlock = extractArrayBlock(html, 'const signalQuizzes = [');
  if (quizzesBlock) {
    const quizzes = safeEval(quizzesBlock);
    if (quizzes) {
      ok(`${quizzes.length} sinyal quiz bulundu`);
      const quizAnswers = new Map();
      quizzes.forEach((q, i) => {
        if (!q.combo && !q.q) warn(`Sinyal quiz #${i}: combo/q eksik`);
        if (!q.answer) warn(`Sinyal quiz #${i}: answer eksik`);
        if (q.answer && quizAnswers.has(q.answer)) {
          warn(`Duplike sinyal quiz cevabı: "${q.answer}" (#${quizAnswers.get(q.answer)} ve #${i})`);
        }
        quizAnswers.set(q.answer, i);
      });
    }
  }

  // --- signalBadges kontrolü ---
  const badgesBlock = extractObjectBlock(html, 'const signalBadges = {');
  if (badgesBlock) {
    // signalBadges anahtarlarını basit regex ile çıkar
    const badgeKeys = badgesBlock.match(/^\s+(\w+)\s*:/gm);
    if (badgeKeys) {
      const keys = badgeKeys.map(k => k.trim().replace(/:$/, ''));
      ok(`${keys.length} sinyal badge bulundu`);
      keys.forEach(key => {
        if (!diseaseIds.has(key)) {
          warn(`signalBadges'da yetim anahtar: "${key}" (diseases dizisinde yok)`);
        }
      });
    }
  }

  return { diseaseCount: diseases.length, diseaseIds };
}

// Ana çalıştırma
console.log('🔍 Veri Bütünlüğü Doğrulama');
console.log('='.repeat(50));

const neuro = validateModule('neurorad.html');
const abd = validateModule('abdomenrad.html');
const thorax = validateModule('thoraxrad.html');

// Çapraz modül kontrolü
const modules = [
  { name: 'Neuro', result: neuro },
  { name: 'Abdomen', result: abd },
  { name: 'Thorax', result: thorax }
].filter(m => m.result);

if (modules.length >= 2) {
  console.log('\n📋 Çapraz modül kontrolleri...');
  for (let i = 0; i < modules.length; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      const overlap = [...modules[i].result.diseaseIds].filter(id => modules[j].result.diseaseIds.has(id));
      if (overlap.length > 0) {
        warn(`${modules[i].name} ↔ ${modules[j].name} ortak ID'ler: ${overlap.join(', ')}`);
      } else {
        ok(`${modules[i].name} ↔ ${modules[j].name} ID çakışması yok`);
      }
    }
  }

  const total = modules.reduce((sum, m) => sum + m.result.diseaseCount, 0);
  const detail = modules.map(m => `${m.name}: ${m.result.diseaseCount}`).join(' + ');
  ok(`Toplam: ${total} hastalık (${detail})`);
}

// Sonuç
console.log('\n' + '='.repeat(50));
if (errors > 0) {
  console.error(`\n💥 ${errors} hata, ${warnings} uyarı bulundu!`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`\n⚠️  ${warnings} uyarı bulundu (hata yok).`);
  process.exit(0);
} else {
  console.log('\n✅ Tüm doğrulamalar başarılı!');
  process.exit(0);
}
