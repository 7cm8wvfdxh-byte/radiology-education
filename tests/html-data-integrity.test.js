/**
 * HTML Dosyaları Veri Bütünlüğü Testleri
 * neurorad.html ve abdomenrad.html'deki verilerin yapısal doğruluğunu test eder.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '..');

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

function safeEval(code) {
  try { return new Function('return ' + code)(); }
  catch (e) { return null; }
}

function loadDiseases(filename) {
  const html = readFileSync(resolve(ROOT, filename), 'utf8');
  const block = extractArrayBlock(html, 'const diseases = [');
  return block ? safeEval(block) : null;
}

function loadDuels(filename) {
  const html = readFileSync(resolve(ROOT, filename), 'utf8');
  const block = extractArrayBlock(html, 'const duels = [');
  return block ? safeEval(block) : null;
}

function loadSignalProfiles(filename) {
  const html = readFileSync(resolve(ROOT, filename), 'utf8');
  const block = extractArrayBlock(html, 'const signalProfiles = [');
  return block ? safeEval(block) : null;
}

describe('NeuroRad Veri Bütünlüğü', () => {
  const diseases = loadDiseases('neurorad.html');
  const duels = loadDuels('neurorad.html');
  const profiles = loadSignalProfiles('neurorad.html');

  it('diseases dizisi yüklenebilmeli', () => {
    expect(diseases).not.toBeNull();
    expect(Array.isArray(diseases)).toBe(true);
  });

  it('en az 70 hastalık olmalı', () => {
    expect(diseases.length).toBeGreaterThanOrEqual(70);
  });

  it('hastalık IDleri benzersiz olmalı', () => {
    const ids = diseases.map(d => d.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  it('her hastalıkta zorunlu alanlar olmalı', () => {
    diseases.forEach(d => {
      expect(d.id, `Hastalık ${d.name}: id eksik`).toBeTruthy();
      expect(d.name, `${d.id}: name eksik`).toBeTruthy();
      expect(d.category, `${d.id}: category eksik`).toBeTruthy();
      expect(Array.isArray(d.pathway), `${d.id}: pathway dizi değil`).toBe(true);
      expect(d.keyPoint, `${d.id}: keyPoint eksik`).toBeTruthy();
      expect(Array.isArray(d.differential), `${d.id}: differential dizi değil`).toBe(true);
      expect(d.quiz, `${d.id}: quiz eksik`).toBeTruthy();
      expect(d.quiz.q, `${d.id}: quiz.q eksik`).toBeTruthy();
      expect(d.quiz.a, `${d.id}: quiz.a eksik`).toBeTruthy();
    });
  });

  it('duels dizisi yüklenebilmeli ve en az 50 duel olmalı', () => {
    expect(duels).not.toBeNull();
    expect(duels.length).toBeGreaterThanOrEqual(50);
  });

  it('duel başlıkları benzersiz olmalı', () => {
    const titles = duels.map(d => d.title);
    const unique = [...new Set(titles)];
    expect(titles.length).toBe(unique.length);
  });

  it('her düelloda zorunlu alanlar olmalı', () => {
    duels.forEach(d => {
      expect(d.title, 'duel title eksik').toBeTruthy();
      expect(d.a && d.a.name, `Duel "${d.title}": a.name eksik`).toBeTruthy();
      expect(d.b && d.b.name, `Duel "${d.title}": b.name eksik`).toBeTruthy();
      expect(d.keyRule || d.keyDiff, `Duel "${d.title}": keyRule/keyDiff eksik`).toBeTruthy();
    });
  });

  it('sinyal profilleri yüklenebilmeli ve en az 35 profil olmalı', () => {
    expect(profiles).not.toBeNull();
    expect(profiles.length).toBeGreaterThanOrEqual(35);
  });

  it('sinyal profili IDleri benzersiz olmalı', () => {
    const ids = profiles.map(p => p.id);
    const unique = [...new Set(ids)];
    expect(ids.length).toBe(unique.length);
  });
});

describe('AbdomenRad Veri Bütünlüğü', () => {
  const diseases = loadDiseases('abdomenrad.html');
  const duels = loadDuels('abdomenrad.html');
  const profiles = loadSignalProfiles('abdomenrad.html');

  it('diseases dizisi yüklenebilmeli', () => {
    expect(diseases).not.toBeNull();
    expect(Array.isArray(diseases)).toBe(true);
  });

  it('en az 80 hastalık olmalı', () => {
    expect(diseases.length).toBeGreaterThanOrEqual(80);
  });

  it('hastalık IDleri benzersiz olmalı', () => {
    const ids = diseases.map(d => d.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  it('her hastalıkta zorunlu alanlar olmalı', () => {
    diseases.forEach(d => {
      expect(d.id, `Hastalık ${d.name}: id eksik`).toBeTruthy();
      expect(d.name, `${d.id}: name eksik`).toBeTruthy();
      expect(d.category, `${d.id}: category eksik`).toBeTruthy();
      expect(Array.isArray(d.pathway), `${d.id}: pathway dizi değil`).toBe(true);
      expect(d.keyPoint, `${d.id}: keyPoint eksik`).toBeTruthy();
      expect(Array.isArray(d.differential), `${d.id}: differential dizi değil`).toBe(true);
      expect(d.quiz, `${d.id}: quiz eksik`).toBeTruthy();
      expect(d.quiz.q, `${d.id}: quiz.q eksik`).toBeTruthy();
      expect(d.quiz.a, `${d.id}: quiz.a eksik`).toBeTruthy();
    });
  });

  it('duels dizisi yüklenebilmeli ve en az 45 duel olmalı', () => {
    expect(duels).not.toBeNull();
    expect(duels.length).toBeGreaterThanOrEqual(45);
  });

  it('duel başlıkları benzersiz olmalı', () => {
    const titles = duels.map(d => d.title);
    const unique = [...new Set(titles)];
    expect(titles.length).toBe(unique.length);
  });

  it('sinyal profilleri yüklenebilmeli ve en az 35 profil olmalı', () => {
    expect(profiles).not.toBeNull();
    expect(profiles.length).toBeGreaterThanOrEqual(35);
  });
});

describe('Çapraz Modül Tutarlılığı', () => {
  const neuroDiseases = loadDiseases('neurorad.html');
  const abdDiseases = loadDiseases('abdomenrad.html');

  it('modüller arası hastalık ID çakışması olmamalı', () => {
    const neuroIds = new Set(neuroDiseases.map(d => d.id));
    const abdIds = abdDiseases.map(d => d.id);
    const overlap = abdIds.filter(id => neuroIds.has(id));
    expect(overlap).toEqual([]);
  });

  it('toplam hastalık sayısı index.html searchIndex ile eşleşmeli', () => {
    const totalFromModules = neuroDiseases.length + abdDiseases.length;
    const indexHtml = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
    const neuroCount = (indexHtml.match(/m:"neuro"/g) || []).length;
    const abdCount = (indexHtml.match(/m:"abdomen"/g) || []).length;
    expect(totalFromModules).toBe(neuroCount + abdCount);
  });
});
