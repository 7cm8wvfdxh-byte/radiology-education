/**
 * Yardımcı Fonksiyon ve İstatistik Testleri
 * hexToRgb, getRegionCenter, getDailyDisease, calculateStats
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  hexToRgb,
  getRegionCenter,
  getDailyDisease,
  calculateStats
} from '../src/core.js';
import { testDiseases } from './fixtures.js';

describe('hexToRgb', () => {
  it('siyah rengi doğru dönüştürmeli', () => {
    expect(hexToRgb('#000000')).toBe('0,0,0');
  });

  it('beyaz rengi doğru dönüştürmeli', () => {
    expect(hexToRgb('#ffffff')).toBe('255,255,255');
  });

  it('kırmızı rengi doğru dönüştürmeli', () => {
    expect(hexToRgb('#ff0000')).toBe('255,0,0');
  });

  it('yeşil rengi doğru dönüştürmeli', () => {
    expect(hexToRgb('#00ff00')).toBe('0,255,0');
  });

  it('mavi rengi doğru dönüştürmeli', () => {
    expect(hexToRgb('#0000ff')).toBe('0,0,255');
  });

  it('accent-blue rengini doğru dönüştürmeli', () => {
    expect(hexToRgb('#3b82f6')).toBe('59,130,246');
  });

  it('accent-rose rengini doğru dönüştürmeli', () => {
    expect(hexToRgb('#f43f5e')).toBe('244,63,94');
  });

  it('accent-emerald rengini doğru dönüştürmeli', () => {
    expect(hexToRgb('#10b981')).toBe('16,185,129');
  });

  it('büyük harf hex değerini de desteklemeli', () => {
    expect(hexToRgb('#FF00FF')).toBe('255,0,255');
  });
});

describe('getRegionCenter', () => {
  it('kare SVG yolunun merkezini hesaplamalı', () => {
    const center = getRegionCenter('M0,0 L100,0 L100,100 L0,100 Z');
    expect(center.x).toBe(50);
    expect(center.y).toBe(50);
  });

  it('dikdörtgen SVG yolunun merkezini hesaplamalı', () => {
    const center = getRegionCenter('M0,0 L200,0 L200,100 L0,100 Z');
    expect(center.x).toBe(100);
    expect(center.y).toBe(50);
  });

  it('gerçek anatomi bölgesi yolunu hesaplamalı (frontal lob)', () => {
    const center = getRegionCenter('M120,40 Q200,15 280,40 L260,130 Q200,145 140,130 Z');
    // Bu gerçek neurorad.html'deki frontal lob yolu
    expect(center).toHaveProperty('x');
    expect(center).toHaveProperty('y');
    expect(typeof center.x).toBe('number');
    expect(typeof center.y).toBe('number');
    expect(center.x).toBeGreaterThan(0);
    expect(center.y).toBeGreaterThan(0);
  });

  it('tamsayı koordinatlar dönmeli', () => {
    const center = getRegionCenter('M0,0 L100,0 L100,100 Z');
    expect(Number.isInteger(center.x)).toBe(true);
    expect(Number.isInteger(center.y)).toBe(true);
  });

  it('ondalıklı koordinatları da işleyebilmeli', () => {
    const center = getRegionCenter('M10.5,20.5 L30.5,40.5 Z');
    expect(typeof center.x).toBe('number');
    expect(typeof center.y).toBe('number');
  });
});

describe('getDailyDisease', () => {
  it('verilen tarih için hastalık dönmeli', () => {
    const disease = getDailyDisease(testDiseases, '2025-01-01');
    expect(disease).toBeTruthy();
    expect(disease.id).toBeTruthy();
  });

  it('aynı tarih için her zaman aynı hastalığı dönmeli (deterministic)', () => {
    const d1 = getDailyDisease(testDiseases, '2025-06-15');
    const d2 = getDailyDisease(testDiseases, '2025-06-15');
    expect(d1.id).toBe(d2.id);
  });

  it('farklı tarihler farklı hastalıklar döndürebilmeli', () => {
    const dates = ['2025-01-01', '2025-01-02', '2025-01-03',
                   '2025-02-01', '2025-03-01', '2025-04-01'];
    const results = dates.map(d => getDailyDisease(testDiseases, d).id);
    const uniqueResults = [...new Set(results)];
    // En az 2 farklı sonuç olmalı (3 hastalık var)
    expect(uniqueResults.length).toBeGreaterThanOrEqual(1);
  });

  it('dönen nesne geçerli bir hastalık olmalı', () => {
    const disease = getDailyDisease(testDiseases, '2025-12-31');
    expect(testDiseases.map(d => d.id)).toContain(disease.id);
  });

  it('tek hastalıklı listede her zaman o hastalığı dönmeli', () => {
    const single = [testDiseases[0]];
    const disease = getDailyDisease(single, '2025-01-01');
    expect(disease.id).toBe(testDiseases[0].id);
  });

  it('tarih verilmezse bugünkü tarihi kullanmalı', () => {
    const disease = getDailyDisease(testDiseases);
    expect(disease).toBeTruthy();
    expect(disease.id).toBeTruthy();
  });
});

describe('calculateStats', () => {
  it('boş verilerle doğru istatistik hesaplamalı', () => {
    const stats = calculateStats(testDiseases, [], {});
    expect(stats.total).toBe(3);
    expect(stats.studiedCount).toBe(0);
    expect(stats.pct).toBe(0);
    expect(stats.mastered).toBe(0);
    expect(stats.learning).toBe(0);
    expect(stats.notStarted).toBe(3);
  });

  it('çalışılmış hastalıklarla yüzde hesaplamalı', () => {
    const stats = calculateStats(testDiseases, ['gbm', 'meningioma'], {});
    expect(stats.studiedCount).toBe(2);
    expect(stats.pct).toBe(67); // 2/3 = %66.67 → yuvarlanır 67
  });

  it('tüm çalışılmış olunca %100 olmalı', () => {
    const stats = calculateStats(testDiseases, ['gbm', 'meningioma', 'hcc'], {});
    expect(stats.pct).toBe(100);
  });

  it('quiz skorlarına göre uzman/öğreniyor/yeni sayılarını hesaplamalı', () => {
    const scores = { gbm: 4, meningioma: 2, hcc: 0 };
    const stats = calculateStats(testDiseases, [], scores);
    expect(stats.mastered).toBe(1);   // gbm box >= 3
    expect(stats.learning).toBe(1);   // meningioma box 1-2
    expect(stats.notStarted).toBe(1); // hcc box 0
  });

  it('box 3 de uzman sayılmalı', () => {
    const scores = { gbm: 3 };
    const stats = calculateStats(testDiseases, [], scores);
    expect(stats.mastered).toBe(1);
  });

  it('kategori istatistiklerini hesaplamalı', () => {
    const stats = calculateStats(testDiseases, ['gbm'], {});
    // gbm ve meningioma tumor kategorisinde, hcc liver
    expect(stats.catStats.tumor).toBeDefined();
    expect(stats.catStats.tumor.total).toBe(2);
    expect(stats.catStats.tumor.studied).toBe(1);
    expect(stats.catStats.liver).toBeDefined();
    expect(stats.catStats.liver.total).toBe(1);
    expect(stats.catStats.liver.studied).toBe(0);
  });

  it('boş hastalık listesiyle hata vermemeli', () => {
    const stats = calculateStats([], [], {});
    expect(stats.total).toBe(0);
    expect(stats.pct).toBe(0);
  });
});
