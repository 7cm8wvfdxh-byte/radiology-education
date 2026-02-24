/**
 * Veri Bütünlüğü Testleri
 * Hastalık, düello ve quiz veri yapılarının doğruluğunu kontrol eder
 */
import { describe, it, expect } from 'vitest';
import { validateDisease, validateDuel, validateSignalQuiz } from '../src/core.js';
import {
  validDisease, validDisease2, validAbdomenDisease,
  invalidDisease, validDuel, validSignalQuiz, invalidSignalQuiz,
  neuroCategories, abdomenCategories, testDiseases
} from './fixtures.js';

describe('Hastalık Veri Doğrulama', () => {
  it('geçerli nöroradyoloji hastalığını kabul etmeli', () => {
    const errors = validateDisease(validDisease);
    expect(errors).toEqual([]);
  });

  it('geçerli ikinci hastalığı kabul etmeli', () => {
    const errors = validateDisease(validDisease2);
    expect(errors).toEqual([]);
  });

  it('geçerli abdomen hastalığını kabul etmeli', () => {
    const errors = validateDisease(validAbdomenDisease);
    expect(errors).toEqual([]);
  });

  it('eksik alanları olan hastalıkta hata döndürmeli', () => {
    const errors = validateDisease(invalidDisease);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('category'))).toBe(true);
    expect(errors.some(e => e.includes('pathway'))).toBe(true);
    expect(errors.some(e => e.includes('keyPoint'))).toBe(true);
    expect(errors.some(e => e.includes('differential'))).toBe(true);
    expect(errors.some(e => e.includes('quiz'))).toBe(true);
  });

  it('id alanı olmayan hastalıkta hata döndürmeli', () => {
    const errors = validateDisease({ name: "Test", category: "tumor" });
    expect(errors.some(e => e.includes('id'))).toBe(true);
  });

  it('pathway dizi olmadığında hata döndürmeli', () => {
    const errors = validateDisease({
      id: "test", name: "Test", category: "tumor",
      pathway: "string değil", keyPoint: "test",
      differential: [], quiz: { q: "?", a: "!" }
    });
    expect(errors.some(e => e.includes('pathway'))).toBe(true);
  });

  it('pathway elemanlarında tip/etiket/metin kontrolü yapmalı', () => {
    const errors = validateDisease({
      id: "test", name: "Test", category: "tumor",
      pathway: [{ type: "histo" }], // label ve text eksik
      keyPoint: "test",
      differential: [],
      quiz: { q: "?", a: "!" }
    });
    expect(errors.some(e => e.includes('label'))).toBe(true);
    expect(errors.some(e => e.includes('text'))).toBe(true);
  });

  it('quiz sorusu veya cevabı eksik olduğunda hata döndürmeli', () => {
    const errors = validateDisease({
      id: "test", name: "Test", category: "tumor",
      pathway: [{ type: "a", label: "b", text: "c" }],
      keyPoint: "test", differential: [],
      quiz: { q: "soru var ama cevap yok" }
    });
    expect(errors.some(e => e.includes('quiz'))).toBe(true);
  });

  it('her hastalığın benzersiz id değeri olmalı', () => {
    const ids = testDiseases.map(d => d.id);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  it('her hastalığın boş olmayan name alanı olmalı', () => {
    testDiseases.forEach(d => {
      expect(d.name).toBeTruthy();
      expect(d.name.length).toBeGreaterThan(0);
    });
  });

  it('her hastalık pathway dizisinde en az 1 eleman olmalı', () => {
    testDiseases.forEach(d => {
      expect(d.pathway.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('Düello Veri Doğrulama', () => {
  it('geçerli düello nesnesini kabul etmeli', () => {
    const errors = validateDuel(validDuel);
    expect(errors).toEqual([]);
  });

  it('başlık olmayan düelloda hata döndürmeli', () => {
    const errors = validateDuel({
      a: { name: "X" }, b: { name: "Y" }, keyDiff: "fark"
    });
    expect(errors.some(e => e.includes('title'))).toBe(true);
  });

  it('a tarafı eksik düelloda hata döndürmeli', () => {
    const errors = validateDuel({
      title: "Test", b: { name: "Y" }, keyDiff: "fark"
    });
    expect(errors.some(e => e.includes('a tarafı'))).toBe(true);
  });

  it('b tarafı eksik düelloda hata döndürmeli', () => {
    const errors = validateDuel({
      title: "Test", a: { name: "X" }, keyDiff: "fark"
    });
    expect(errors.some(e => e.includes('b tarafı'))).toBe(true);
  });

  it('keyDiff eksik düelloda hata döndürmeli', () => {
    const errors = validateDuel({
      title: "Test", a: { name: "X" }, b: { name: "Y" }
    });
    expect(errors.some(e => e.includes('keyDiff'))).toBe(true);
  });
});

describe('Sinyal Quiz Doğrulama', () => {
  it('geçerli sinyal quizini kabul etmeli', () => {
    const errors = validateSignalQuiz(validSignalQuiz);
    expect(errors).toEqual([]);
  });

  it('tek seçenekli quizde hata döndürmeli', () => {
    const errors = validateSignalQuiz({
      q: "Test?",
      options: ["Tek"],
      answer: 0
    });
    expect(errors.some(e => e.includes('en az 2'))).toBe(true);
  });

  it('geçersiz cevap indeksinde hata döndürmeli', () => {
    const errors = validateSignalQuiz(invalidSignalQuiz);
    expect(errors.some(e => e.includes('answer indeksi'))).toBe(true);
  });

  it('options olmayan quizde hata döndürmeli', () => {
    const errors = validateSignalQuiz({ q: "Test?" });
    expect(errors.some(e => e.includes('options'))).toBe(true);
  });

  it('soru olmayan quizde hata döndürmeli', () => {
    const errors = validateSignalQuiz({ options: ["A", "B"], answer: 0 });
    expect(errors.some(e => e.includes('soru'))).toBe(true);
  });
});

describe('Kategori Veri Bütünlüğü', () => {
  it('nöro kategorilerinin gerekli alanları olmalı', () => {
    Object.entries(neuroCategories).forEach(([key, cat]) => {
      expect(cat.icon).toBeTruthy();
      expect(cat.color).toBeTruthy();
      expect(cat.title).toBeTruthy();
      expect(cat.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('abdomen kategorilerinin gerekli alanları olmalı', () => {
    Object.entries(abdomenCategories).forEach(([key, cat]) => {
      expect(cat.icon).toBeTruthy();
      expect(cat.color).toBeTruthy();
      expect(cat.title).toBeTruthy();
      expect(cat.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('hastalık kategorileri tanımlı kategoriler içinde olmalı', () => {
    const allCategories = { ...neuroCategories, ...abdomenCategories };
    testDiseases.forEach(d => {
      expect(allCategories).toHaveProperty(d.category);
    });
  });
});
