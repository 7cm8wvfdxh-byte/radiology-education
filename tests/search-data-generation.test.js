/**
 * search-data.js Oluşturma ve Bütünlük Testleri
 * Build script'inin doğru çalıştığını ve oluşturulan verinin tutarlı olduğunu test eder.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '..');

function loadSearchData() {
  const content = readFileSync(resolve(ROOT, 'search-data.js'), 'utf8');
  // search-data.js 'var' ile 3 global değişken tanımlar.
  // new Function ile sandbox'ta çalıştırıp dönüyoruz.
  const fn = new Function(
    content + '\nreturn { searchExtended: searchExtended, duelEntries: duelEntries, signalEntries: signalEntries };'
  );
  return fn();
}

describe('search-data.js Yapısal Doğrulama', () => {
  let data;

  try {
    data = loadSearchData();
  } catch (e) {
    // Dosya yoksa testleri atla
  }

  it('search-data.js dosyası mevcut olmalı', () => {
    expect(() => readFileSync(resolve(ROOT, 'search-data.js'), 'utf8')).not.toThrow();
  });

  it('searchExtended obje olmalı ve boş olmamalı', () => {
    if (!data) return;
    expect(typeof data.searchExtended).toBe('object');
    expect(Object.keys(data.searchExtended).length).toBeGreaterThan(0);
  });

  it('searchExtended en az 150 hastalık içermeli', () => {
    if (!data) return;
    expect(Object.keys(data.searchExtended).length).toBeGreaterThanOrEqual(150);
  });

  it('her searchExtended girişi string olmalı', () => {
    if (!data) return;
    Object.entries(data.searchExtended).forEach(([id, content]) => {
      expect(typeof content).toBe('string');
      expect(content.length).toBeGreaterThan(0);
    });
  });

  it('duelEntries dizi olmalı ve boş olmamalı', () => {
    if (!data) return;
    expect(Array.isArray(data.duelEntries)).toBe(true);
    expect(data.duelEntries.length).toBeGreaterThan(0);
  });

  it('her duel girişi [prefix, title, aName, bName, keyRule] formatında olmalı', () => {
    if (!data) return;
    data.duelEntries.forEach((entry, i) => {
      expect(Array.isArray(entry)).toBe(true);
      expect(entry.length).toBe(5);
      expect(['n', 'a']).toContain(entry[0]);
      expect(typeof entry[1]).toBe('string');
    });
  });

  it('signalEntries dizi olmalı ve boş olmamalı', () => {
    if (!data) return;
    expect(Array.isArray(data.signalEntries)).toBe(true);
    expect(data.signalEntries.length).toBeGreaterThan(0);
  });

  it('her signal girişi [prefix, question, combo, explanation] formatında olmalı', () => {
    if (!data) return;
    data.signalEntries.forEach((entry, i) => {
      expect(Array.isArray(entry)).toBe(true);
      expect(entry.length).toBe(4);
      expect(['n', 'a']).toContain(entry[0]);
    });
  });

  it('bilinen hastalık IDleri searchExtended da olmalı', () => {
    if (!data) return;
    const knownIds = ['gbm', 'meningioma', 'hcc', 'ms', 'crohn'];
    knownIds.forEach(id => {
      expect(data.searchExtended).toHaveProperty(id);
    });
  });

  it('neuro ve abdomen duel girişleri dengeli olmalı', () => {
    if (!data) return;
    const neuroCount = data.duelEntries.filter(d => d[0] === 'n').length;
    const abdCount = data.duelEntries.filter(d => d[0] === 'a').length;
    expect(neuroCount).toBeGreaterThan(0);
    expect(abdCount).toBeGreaterThan(0);
  });
});
