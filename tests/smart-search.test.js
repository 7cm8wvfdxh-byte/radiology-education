/**
 * Akıllı Arama (Smart Search) Testleri
 * Türkçe/Latince sinonim eşleştirme, bulanık arama ve kenar durumları
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createSmartSearch } from '../src/core.js';
import { testDiseases, testSearchSynonyms } from './fixtures.js';

describe('Smart Search - Temel İşlevsellik', () => {
  let smartSearch;

  beforeEach(() => {
    smartSearch = createSmartSearch(testDiseases, testSearchSynonyms);
  });

  it('boş terim tüm hastalıkları döndürmeli', () => {
    const result = smartSearch('');
    expect(result).toEqual(testDiseases);
  });

  it('null/undefined terim tüm hastalıkları döndürmeli', () => {
    expect(smartSearch(null)).toEqual(testDiseases);
    expect(smartSearch(undefined)).toEqual(testDiseases);
  });

  it('hastalık adıyla arama yapabilmeli', () => {
    const result = smartSearch('Glioblastom');
    expect(result.map(d => d.id)).toContain('gbm');
  });

  it('hastalık id ile arama yapabilmeli', () => {
    const result = smartSearch('gbm');
    expect(result.map(d => d.id)).toContain('gbm');
  });

  it('büyük/küçük harf duyarsız arama yapmalı', () => {
    const result1 = smartSearch('GBM');
    const result2 = smartSearch('gbm');
    const result3 = smartSearch('Gbm');
    expect(result1.length).toBe(result2.length);
    expect(result2.length).toBe(result3.length);
  });

  it('pathway metninde arama yapabilmeli', () => {
    const result = smartSearch('nekroz');
    expect(result.map(d => d.id)).toContain('gbm');
  });

  it('keyPoint metninde arama yapabilmeli', () => {
    const result = smartSearch('ring enhancement');
    expect(result.map(d => d.id)).toContain('gbm');
  });

  it('differential metninde arama yapabilmeli', () => {
    const result = smartSearch('absesi');
    expect(result.map(d => d.id)).toContain('gbm');
  });

  it('quiz metninde arama yapabilmeli', () => {
    const result = smartSearch('difüzyon kısıtlanması');
    expect(result.map(d => d.id)).toContain('gbm');
  });

  it('kategori ile arama yapabilmeli', () => {
    const result = smartSearch('tumor');
    expect(result.length).toBeGreaterThanOrEqual(2); // gbm ve meningioma
  });

  it('tagText ile arama yapabilmeli', () => {
    const result = smartSearch('Kritik');
    expect(result.map(d => d.id)).toContain('gbm');
  });

  it('protocol metninde arama yapabilmeli', () => {
    const result = smartSearch('FLAIR');
    expect(result.map(d => d.id)).toContain('gbm');
  });

  it('mevcut olmayan terimde boş dizi döndürmeli', () => {
    const result = smartSearch('zzzqqq_mevcut_olmayan_terim');
    expect(result).toEqual([]);
  });
});

describe('Smart Search - Sinonim Eşleştirme', () => {
  let smartSearch;

  beforeEach(() => {
    smartSearch = createSmartSearch(testDiseases, testSearchSynonyms);
  });

  it('Türkçe sinonim ile arama yapabilmeli (tümör -> kitle)', () => {
    // "tümör" arandığında "kitle", "mass", "neoplazm", "lezyon" da aranmalı
    const result = smartSearch('tümör');
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it('kısaltma ile arama yapabilmeli (dwi -> difüzyon)', () => {
    const result = smartSearch('dwi');
    // DWI sinonimi difüzyon, diffusion, kısıtlanma, restriction
    // gbm pathway'inde "DWI" veya "kısıtlanma" geçiyor
    expect(result.map(d => d.id)).toContain('gbm');
  });

  it('İngilizce terim ile Türkçe eşleştirme yapmalı (ring -> halka)', () => {
    const result = smartSearch('ring');
    // ring sinonimi: halka, ring enhancement, çevre kontrastlanma
    expect(result.map(d => d.id)).toContain('gbm');
  });

  it('kısmi sinonim eşleştirmesi yapmalı', () => {
    // "gbm" sinonimi: glioblastom, glioblastoma, grade 4
    const result = smartSearch('glioblastom');
    expect(result.map(d => d.id)).toContain('gbm');
  });

  it('kontrastlanma sinonimi ile arama yapabilmeli', () => {
    const result = smartSearch('kontrastlanma');
    // enhancement, gadolinyum, kontrast, boyanma hepsi sinonim
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Smart Search - Çoklu Kelime Arama', () => {
  let smartSearch;

  beforeEach(() => {
    smartSearch = createSmartSearch(testDiseases, testSearchSynonyms);
  });

  it('boşlukla ayrılmış çoklu kelime araması yapmalı', () => {
    const result = smartSearch('ring enhancement nekroz');
    expect(result.map(d => d.id)).toContain('gbm');
  });

  it('birden fazla kelimede sinonim genişletme yapmalı', () => {
    const result = smartSearch('tümör dwi');
    // tümör -> kitle/mass/neoplazm + dwi -> difüzyon/kısıtlanma
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Smart Search - Kenar Durumları', () => {
  let smartSearch;

  beforeEach(() => {
    smartSearch = createSmartSearch(testDiseases, testSearchSynonyms);
  });

  it('sadece boşluk içeren arama tüm sonuçları döndürmeli', () => {
    const result = smartSearch('   ');
    // split ile boş stringlere ayrılır, ama expandedWords yine de genişletilir
    // boş string her şeyle eşleşir
    expect(result.length).toBe(testDiseases.length);
  });

  it('özel karakterler hata vermemeli', () => {
    expect(() => smartSearch('(test)')).not.toThrow();
    expect(() => smartSearch('[brackets]')).not.toThrow();
    expect(() => smartSearch('a+b')).not.toThrow();
  });

  it('çok uzun arama terimi hata vermemeli', () => {
    const longTerm = 'a'.repeat(1000);
    expect(() => smartSearch(longTerm)).not.toThrow();
  });

  it('boş hastalık listesiyle arama hata vermemeli', () => {
    const emptySearch = createSmartSearch([], testSearchSynonyms);
    const result = emptySearch('test');
    expect(result).toEqual([]);
  });

  it('boş sinonim haritasıyla arama hata vermemeli', () => {
    const noSynSearch = createSmartSearch(testDiseases, {});
    const result = noSynSearch('gbm');
    expect(result.map(d => d.id)).toContain('gbm');
  });
});
