#!/usr/bin/env node
/**
 * search-data.js otomatik oluşturucu
 * neurorad.html ve abdomenrad.html dosyalarından arama verilerini çıkarır.
 *
 * Kullanım: node scripts/generate-search-data.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const NEURO_FILE = path.join(ROOT, 'neurorad.html');
const ABD_FILE = path.join(ROOT, 'abdomenrad.html');
const THORAX_FILE = path.join(ROOT, 'thoraxrad.html');
const OUTPUT_FILE = path.join(ROOT, 'search-data.js');

function extractArrayBlock(html, pattern) {
  const start = html.indexOf(pattern);
  if (start === -1) return null;
  const arrStart = html.indexOf('[', start);
  let depth = 0;
  let inString = false;
  let escape = false;
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

function safeEval(code) {
  try {
    return new Function('return ' + code)();
  } catch (e) {
    console.error('Eval hatası:', e.message);
    return null;
  }
}

function extractDiseases(html) {
  const block = extractArrayBlock(html, 'const diseases = [');
  if (!block) { console.error('diseases dizisi bulunamadı'); return []; }
  return safeEval(block) || [];
}

function extractDuels(html) {
  const block = extractArrayBlock(html, 'const duels = [');
  if (!block) return [];
  return safeEval(block) || [];
}

function extractSignalQuizzes(html) {
  const block = extractArrayBlock(html, 'const signalQuizzes = [');
  if (!block) return [];
  return safeEval(block) || [];
}

function extractFindings(html) {
  const block = extractArrayBlock(html, 'const findings = [');
  if (!block) return [];
  return safeEval(block) || [];
}

function extractEmergency(html, varName) {
  const block = extractArrayBlock(html, 'const ' + varName + ' = [');
  if (!block) return [];
  return safeEval(block) || [];
}

function extractMeasurements(html, varName) {
  const block = extractArrayBlock(html, 'const ' + varName + ' = [');
  if (!block) return [];
  return safeEval(block) || [];
}

function extractCalcs(html, varName) {
  const block = extractArrayBlock(html, 'const ' + varName + ' = [');
  if (!block) return [];
  return safeEval(block) || [];
}

function extractPhysics(html, varName) {
  const block = extractArrayBlock(html, 'const ' + varName + ' = [');
  if (!block) return [];
  return safeEval(block) || [];
}

function extractEnhancePatterns(html, varName) {
  const block = extractArrayBlock(html, 'const ' + varName + ' = [');
  if (!block) return [];
  return safeEval(block) || [];
}

function buildSearchExtended(diseases) {
  const result = {};
  diseases.forEach(d => {
    if (!d.id) return;
    const parts = [];
    parts.push(d.keyPoint || '');
    parts.push((d.differential || []).join(','));
    parts.push((d.pathway || []).map(p => (p.text || '') + ',' + (p.detail || '')).join('|'));
    if (d.quiz) parts.push(d.quiz.q || '');
    parts.push(d.tagText || '');
    parts.push(d.protocol || '');
    result[d.id] = parts.join('|');
  });
  return result;
}

function buildDuelEntries(duels, modulePrefix) {
  return duels.map(d => {
    const title = d.title || '';
    const aName = d.a ? d.a.name : '';
    const bName = d.b ? d.b.name : '';
    const keyRule = d.keyRule || d.keyDiff || '';
    return [modulePrefix, title, aName, bName, keyRule];
  });
}

function buildSignalEntries(quizzes, modulePrefix) {
  return quizzes.map(q => {
    const question = q.q || '';
    const combo = q.combo || '';
    const explanation = q.explanation || q.exp || '';
    return [modulePrefix, question, combo, explanation];
  });
}

// Build finding entries: [modulePrefix, findingName, diseasesText, decisionTree]
function buildFindingEntries(findings, modulePrefix) {
  return findings.map(f => {
    const name = f.finding || '';
    const diseasesText = (f.diseases || f.causes || []).map(d => {
      return (d.name || '') + ' ' + (d.key || d.clue || '');
    }).join(', ');
    const extra = f.decisionTree || f.description || '';
    return [modulePrefix, name, diseasesText, extra];
  });
}

// Build emergency entries: [modulePrefix, category, finding, action, look]
function buildEmergencyEntries(emergencyData, modulePrefix) {
  const entries = [];
  emergencyData.forEach(cat => {
    const category = cat.category || '';
    (cat.items || []).forEach(item => {
      entries.push([
        modulePrefix,
        category,
        item.finding || '',
        item.action || '',
        (item.look || '') + ' ' + (item.tip || '')
      ]);
    });
  });
  return entries;
}

// Build measurement entries: [modulePrefix, category, name, searchText]
function buildMeasurementEntries(measData, modulePrefix) {
  const entries = [];
  measData.forEach(cat => {
    const category = cat.category || '';
    (cat.items || []).forEach(item => {
      const searchText = [
        item.name || '',
        item.where || '',
        item.how || '',
        item.normal || '',
        item.abnormal || '',
        item.clinical || ''
      ].join(' ');
      entries.push([modulePrefix, category, item.name || '', searchText]);
    });
  });
  return entries;
}

// Build calculator entries: [modulePrefix, name, description]
function buildCalcEntries(calcs, modulePrefix) {
  return calcs.map(c => {
    return [modulePrefix, c.name || c.id || '', c.desc || c.description || ''];
  });
}

// Build physics entries: [modulePrefix, title, searchText]
function buildPhysicsEntries(topics, modulePrefix) {
  return topics.map(t => {
    const rulesText = (t.rules || []).map(r => {
      return (r.signal || '') + ' ' + (r.examples || '') + ' ' + (r.mechanism || '');
    }).join(' ');
    const searchText = [
      t.concept || '',
      rulesText,
      t.clinicalPearl || ''
    ].join(' ');
    return [modulePrefix, t.title || '', searchText];
  });
}

// Build enhance pattern entries: [modulePrefix, pattern, searchText]
function buildEnhanceEntries(patterns, modulePrefix) {
  return patterns.map(p => {
    const lesionsText = (p.lesions || []).map(l => {
      return (l.name || '') + ' ' + (l.detail || '');
    }).join(' ');
    const searchText = [
      p.curve || '',
      lesionsText,
      p.keyRule || '',
      p.pitfall || ''
    ].join(' ');
    return [modulePrefix, p.pattern || '', searchText];
  });
}

// Ana fonksiyon
function main() {
  console.log('search-data.js oluşturuluyor...');

  const neuroHtml = fs.readFileSync(NEURO_FILE, 'utf8');
  const abdHtml = fs.readFileSync(ABD_FILE, 'utf8');
  const thoraxHtml = fs.existsSync(THORAX_FILE) ? fs.readFileSync(THORAX_FILE, 'utf8') : '';

  // === Hastalıklar ===
  const neuroDiseases = extractDiseases(neuroHtml);
  const abdDiseases = extractDiseases(abdHtml);
  const thoraxDiseases = thoraxHtml ? extractDiseases(thoraxHtml) : [];
  console.log(`  NeuroRad: ${neuroDiseases.length} hastalık`);
  console.log(`  AbdomenRad: ${abdDiseases.length} hastalık`);
  console.log(`  ThoraxRad: ${thoraxDiseases.length} hastalık`);

  const extended = {};
  Object.assign(extended, buildSearchExtended(neuroDiseases));
  Object.assign(extended, buildSearchExtended(abdDiseases));
  Object.assign(extended, buildSearchExtended(thoraxDiseases));

  // === Düellolar ===
  const neuroDuels = extractDuels(neuroHtml);
  const abdDuels = extractDuels(abdHtml);
  const thoraxDuels = thoraxHtml ? extractDuels(thoraxHtml) : [];
  console.log(`  NeuroRad: ${neuroDuels.length} duel`);
  console.log(`  AbdomenRad: ${abdDuels.length} duel`);
  console.log(`  ThoraxRad: ${thoraxDuels.length} duel`);
  const duelEntries = [
    ...buildDuelEntries(neuroDuels, 'n'),
    ...buildDuelEntries(abdDuels, 'a'),
    ...buildDuelEntries(thoraxDuels, 't')
  ];

  // === Sinyal Quizleri ===
  const neuroSignalQ = extractSignalQuizzes(neuroHtml);
  const abdSignalQ = extractSignalQuizzes(abdHtml);
  const thoraxSignalQ = thoraxHtml ? extractSignalQuizzes(thoraxHtml) : [];
  console.log(`  NeuroRad: ${neuroSignalQ.length} sinyal quiz`);
  console.log(`  AbdomenRad: ${abdSignalQ.length} sinyal quiz`);
  console.log(`  ThoraxRad: ${thoraxSignalQ.length} sinyal quiz`);
  const signalEntries = [
    ...buildSignalEntries(neuroSignalQ, 'n'),
    ...buildSignalEntries(abdSignalQ, 'a'),
    ...buildSignalEntries(thoraxSignalQ, 't')
  ];

  // === Bulgular (Findings) ===
  const neuroFindings = extractFindings(neuroHtml);
  const abdFindings = extractFindings(abdHtml);
  const thoraxFindings = thoraxHtml ? extractFindings(thoraxHtml) : [];
  console.log(`  NeuroRad: ${neuroFindings.length} bulgu`);
  console.log(`  AbdomenRad: ${abdFindings.length} bulgu`);
  console.log(`  ThoraxRad: ${thoraxFindings.length} bulgu`);
  const findingEntries = [
    ...buildFindingEntries(neuroFindings, 'n'),
    ...buildFindingEntries(abdFindings, 'a'),
    ...buildFindingEntries(thoraxFindings, 't')
  ];

  // === Acil Bulgular ===
  const neuroEmergency = extractEmergency(neuroHtml, 'neuroEmergencyFindings');
  const abdEmergency = extractEmergency(abdHtml, 'emergencyFindings');
  const thoraxEmergency = thoraxHtml ? extractEmergency(thoraxHtml, 'emergencyFindings') : [];
  const emergencyEntries = [
    ...buildEmergencyEntries(neuroEmergency, 'n'),
    ...buildEmergencyEntries(abdEmergency, 'a'),
    ...buildEmergencyEntries(thoraxEmergency, 't')
  ];
  console.log(`  Acil bulgular: ${emergencyEntries.length}`);

  // === Ölçümler ===
  const neuroMeas = extractMeasurements(neuroHtml, 'measurements');
  const abdMeas = extractMeasurements(abdHtml, 'measurements');
  const thoraxMeas = thoraxHtml ? extractMeasurements(thoraxHtml, 'measurements') : [];
  const measurementEntries = [
    ...buildMeasurementEntries(neuroMeas, 'n'),
    ...buildMeasurementEntries(abdMeas, 'a'),
    ...buildMeasurementEntries(thoraxMeas, 't')
  ];
  console.log(`  Ölçümler: ${measurementEntries.length}`);

  // === Hesaplayıcılar ===
  const neuroCalcs = extractCalcs(neuroHtml, 'neuroCalcs');
  const abdCalcs = extractCalcs(abdHtml, 'abdCalcs');
  const thoraxCalcs = thoraxHtml ? extractCalcs(thoraxHtml, 'thoraxCalcs') : [];
  const calcEntries = [
    ...buildCalcEntries(neuroCalcs, 'n'),
    ...buildCalcEntries(abdCalcs, 'a'),
    ...buildCalcEntries(thoraxCalcs, 't')
  ];
  console.log(`  Hesaplayıcılar: ${calcEntries.length}`);

  // === Fizik Konuları ===
  const neuroPhysics = extractPhysics(neuroHtml, 'mrPhysicsTopics');
  const abdPhysics = extractPhysics(abdHtml, 'abdPhysicsTopics');
  const thoraxPhysics = thoraxHtml ? extractPhysics(thoraxHtml, 'thoraxPhysicsTopics') : [];
  const physicsEntries = [
    ...buildPhysicsEntries(neuroPhysics, 'n'),
    ...buildPhysicsEntries(abdPhysics, 'a'),
    ...buildPhysicsEntries(thoraxPhysics, 't')
  ];
  console.log(`  Fizik konuları: ${physicsEntries.length}`);

  // === Kontrastlanma Paternleri ===
  const neuroEnhance = extractEnhancePatterns(neuroHtml, 'neuroEnhancePatterns');
  const abdEnhance = extractEnhancePatterns(abdHtml, 'enhancePatterns');
  const thoraxEnhance = thoraxHtml ? extractEnhancePatterns(thoraxHtml, 'enhancePatterns') : [];
  const enhanceEntries = [
    ...buildEnhanceEntries(neuroEnhance, 'n'),
    ...buildEnhanceEntries(abdEnhance, 'a'),
    ...buildEnhanceEntries(thoraxEnhance, 't')
  ];
  console.log(`  Kontrastlanma paternleri: ${enhanceEntries.length}`);

  // === Dosyayı yaz ===
  const output = [
    '// Global Search Data - Auto-generated by scripts/generate-search-data.js',
    '// Bu dosya otomatik oluşturulmuştur.',
    '// Bu dosyayı elle düzenlemeyin. Yeniden oluşturmak için: npm run build:search',
    'var searchExtended = ' + JSON.stringify(extended) + ';',
    '',
    'var duelEntries = ' + JSON.stringify(duelEntries) + ';',
    '',
    'var signalEntries = ' + JSON.stringify(signalEntries) + ';',
    '',
    'var findingEntries = ' + JSON.stringify(findingEntries) + ';',
    '',
    'var emergencyEntries = ' + JSON.stringify(emergencyEntries) + ';',
    '',
    'var measurementEntries = ' + JSON.stringify(measurementEntries) + ';',
    '',
    'var calcEntries = ' + JSON.stringify(calcEntries) + ';',
    '',
    'var physicsEntries = ' + JSON.stringify(physicsEntries) + ';',
    '',
    'var enhanceEntries = ' + JSON.stringify(enhanceEntries) + ';',
    ''
  ].join('\n');

  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');

  const sizeKB = Math.round(output.length / 1024);
  const totalEntries = Object.keys(extended).length + duelEntries.length + signalEntries.length +
    findingEntries.length + emergencyEntries.length + measurementEntries.length +
    calcEntries.length + physicsEntries.length + enhanceEntries.length;
  console.log(`\nsearch-data.js oluşturuldu (${sizeKB} KB)`);
  console.log(`  ${Object.keys(extended).length} hastalık arama verisi`);
  console.log(`  ${duelEntries.length} duel girişi`);
  console.log(`  ${signalEntries.length} sinyal quiz girişi`);
  console.log(`  ${findingEntries.length} bulgu girişi`);
  console.log(`  ${emergencyEntries.length} acil bulgu girişi`);
  console.log(`  ${measurementEntries.length} ölçüm girişi`);
  console.log(`  ${calcEntries.length} hesaplayıcı girişi`);
  console.log(`  ${physicsEntries.length} fizik konusu girişi`);
  console.log(`  ${enhanceEntries.length} kontrastlanma paterni girişi`);
  console.log(`  TOPLAM: ${totalEntries} arama girişi`);
}

main();
