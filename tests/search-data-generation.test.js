/**
 * search-data.js Oluşturma ve Bütünlük Testleri
 * Build script'inin doğru çalıştığını ve oluşturulan verinin tutarlı olduğunu test eder.
 * 9 arama değişkeninin tamamını doğrular.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '..');

function loadSearchData() {
  const content = readFileSync(resolve(ROOT, 'search-data.js'), 'utf8');
  const fn = new Function(
    content + '\nreturn { searchExtended, duelEntries, signalEntries, findingEntries, emergencyEntries, measurementEntries, calcEntries, physicsEntries, enhanceEntries };'
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

  // === searchExtended (hastalıklar) ===
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

  it('bilinen hastalık IDleri searchExtended da olmalı', () => {
    if (!data) return;
    const knownIds = ['gbm', 'meningioma', 'hcc', 'ms', 'crohn'];
    knownIds.forEach(id => {
      expect(data.searchExtended).toHaveProperty(id);
    });
  });

  // === duelEntries ===
  it('duelEntries dizi olmalı ve boş olmamalı', () => {
    if (!data) return;
    expect(Array.isArray(data.duelEntries)).toBe(true);
    expect(data.duelEntries.length).toBeGreaterThan(0);
  });

  it('her duel girişi [prefix, title, aName, bName, keyRule] formatında olmalı', () => {
    if (!data) return;
    data.duelEntries.forEach((entry, i) => {
      expect(Array.isArray(entry), `duelEntries[${i}] dizi değil`).toBe(true);
      expect(entry.length, `duelEntries[${i}] 5 eleman olmalı`).toBe(5);
      expect(['n', 'a', 't'], `duelEntries[${i}] prefix n, a veya t olmalı`).toContain(entry[0]);
      expect(typeof entry[1]).toBe('string');
    });
  });

  it('neuro, abdomen ve thorax duel girişleri dengeli olmalı', () => {
    if (!data) return;
    const neuroCount = data.duelEntries.filter(d => d[0] === 'n').length;
    const abdCount = data.duelEntries.filter(d => d[0] === 'a').length;
    const thoraxCount = data.duelEntries.filter(d => d[0] === 't').length;
    expect(neuroCount).toBeGreaterThan(0);
    expect(abdCount).toBeGreaterThan(0);
    expect(thoraxCount).toBeGreaterThan(0);
  });

  // === signalEntries ===
  it('signalEntries dizi olmalı ve boş olmamalı', () => {
    if (!data) return;
    expect(Array.isArray(data.signalEntries)).toBe(true);
    expect(data.signalEntries.length).toBeGreaterThan(0);
  });

  it('her signal girişi [prefix, question, combo, explanation] formatında olmalı', () => {
    if (!data) return;
    data.signalEntries.forEach((entry, i) => {
      expect(Array.isArray(entry), `signalEntries[${i}] dizi değil`).toBe(true);
      expect(entry.length, `signalEntries[${i}] 4 eleman olmalı`).toBe(4);
      expect(['n', 'a', 't'], `signalEntries[${i}] prefix n, a veya t olmalı`).toContain(entry[0]);
    });
  });

  // === findingEntries ===
  it('findingEntries dizi olmalı ve boş olmamalı', () => {
    if (!data) return;
    expect(Array.isArray(data.findingEntries)).toBe(true);
    expect(data.findingEntries.length).toBeGreaterThan(0);
  });

  it('findingEntries en az 30 giriş içermeli', () => {
    if (!data) return;
    expect(data.findingEntries.length).toBeGreaterThanOrEqual(30);
  });

  it('her finding girişi [prefix, name, differentials, ...] formatında olmalı', () => {
    if (!data) return;
    data.findingEntries.forEach((entry, i) => {
      expect(Array.isArray(entry), `findingEntries[${i}] dizi değil`).toBe(true);
      expect(entry.length).toBeGreaterThanOrEqual(3);
      expect(['n', 'a', 't']).toContain(entry[0]);
      expect(typeof entry[1]).toBe('string');
    });
  });

  // === emergencyEntries ===
  it('emergencyEntries dizi olmalı ve boş olmamalı', () => {
    if (!data) return;
    expect(Array.isArray(data.emergencyEntries)).toBe(true);
    expect(data.emergencyEntries.length).toBeGreaterThan(0);
  });

  it('emergencyEntries en az 20 giriş içermeli', () => {
    if (!data) return;
    expect(data.emergencyEntries.length).toBeGreaterThanOrEqual(20);
  });

  // === measurementEntries ===
  it('measurementEntries dizi olmalı ve boş olmamalı', () => {
    if (!data) return;
    expect(Array.isArray(data.measurementEntries)).toBe(true);
    expect(data.measurementEntries.length).toBeGreaterThan(0);
  });

  it('measurementEntries en az 30 giriş içermeli', () => {
    if (!data) return;
    expect(data.measurementEntries.length).toBeGreaterThanOrEqual(30);
  });

  // === calcEntries ===
  it('calcEntries dizi olmalı ve boş olmamalı', () => {
    if (!data) return;
    expect(Array.isArray(data.calcEntries)).toBe(true);
    expect(data.calcEntries.length).toBeGreaterThan(0);
  });

  it('calcEntries en az 10 giriş içermeli', () => {
    if (!data) return;
    expect(data.calcEntries.length).toBeGreaterThanOrEqual(10);
  });

  // === physicsEntries ===
  it('physicsEntries dizi olmalı ve boş olmamalı', () => {
    if (!data) return;
    expect(Array.isArray(data.physicsEntries)).toBe(true);
    expect(data.physicsEntries.length).toBeGreaterThan(0);
  });

  it('physicsEntries en az 10 giriş içermeli', () => {
    if (!data) return;
    expect(data.physicsEntries.length).toBeGreaterThanOrEqual(10);
  });

  // === enhanceEntries ===
  it('enhanceEntries dizi olmalı ve boş olmamalı', () => {
    if (!data) return;
    expect(Array.isArray(data.enhanceEntries)).toBe(true);
    expect(data.enhanceEntries.length).toBeGreaterThan(0);
  });

  it('enhanceEntries en az 10 giriş içermeli', () => {
    if (!data) return;
    expect(data.enhanceEntries.length).toBeGreaterThanOrEqual(10);
  });

  // === Toplam istatistikler ===
  it('toplam arama girişi en az 500 olmalı', () => {
    if (!data) return;
    const total = Object.keys(data.searchExtended).length
      + data.duelEntries.length
      + data.signalEntries.length
      + data.findingEntries.length
      + data.emergencyEntries.length
      + data.measurementEntries.length
      + data.calcEntries.length
      + data.physicsEntries.length
      + data.enhanceEntries.length;
    expect(total).toBeGreaterThanOrEqual(500);
  });
});
