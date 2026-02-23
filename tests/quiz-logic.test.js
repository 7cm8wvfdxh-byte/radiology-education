/**
 * Quiz Mantığı (Leitner Sistemi) Testleri
 * promoteQuiz, demoteQuiz, getSmartQuizPool fonksiyonlarını test eder
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { createQuizManager } from '../src/core.js';
import { testDiseases } from './fixtures.js';

describe('Quiz Manager - Temel İşlemler', () => {
  let quiz;

  beforeEach(() => {
    localStorage.clear();
    quiz = createQuizManager('test');
  });

  it('yeni hastalığın kutu değeri 0 olmalı', () => {
    expect(quiz.getQuizBox('gbm')).toBe(0);
  });

  it('bilinmeyen id için kutu değeri 0 dönmeli', () => {
    expect(quiz.getQuizBox('mevcut_olmayan')).toBe(0);
  });

  it('promoteQuiz kutu değerini 1 artırmalı', () => {
    quiz.promoteQuiz('gbm');
    expect(quiz.getQuizBox('gbm')).toBe(1);
  });

  it('ardışık promote çağrıları kutu değerini artırmalı', () => {
    quiz.promoteQuiz('gbm');
    quiz.promoteQuiz('gbm');
    quiz.promoteQuiz('gbm');
    expect(quiz.getQuizBox('gbm')).toBe(3);
  });

  it('kutu değeri maksimum 4 olmalı (sınır koruması)', () => {
    for (let i = 0; i < 10; i++) {
      quiz.promoteQuiz('gbm');
    }
    expect(quiz.getQuizBox('gbm')).toBe(4);
  });

  it('demoteQuiz kutu değerini 0 yapmalı', () => {
    quiz.promoteQuiz('gbm');
    quiz.promoteQuiz('gbm');
    quiz.promoteQuiz('gbm');
    expect(quiz.getQuizBox('gbm')).toBe(3);
    quiz.demoteQuiz('gbm');
    expect(quiz.getQuizBox('gbm')).toBe(0);
  });

  it('demoteQuiz zaten 0 olan kutuyu bozmamamlı', () => {
    quiz.demoteQuiz('gbm');
    expect(quiz.getQuizBox('gbm')).toBe(0);
  });

  it('farklı hastalıklar bağımsız kutu değerlerine sahip olmalı', () => {
    quiz.promoteQuiz('gbm');
    quiz.promoteQuiz('gbm');
    quiz.promoteQuiz('meningioma');
    expect(quiz.getQuizBox('gbm')).toBe(2);
    expect(quiz.getQuizBox('meningioma')).toBe(1);
  });
});

describe('Quiz Manager - localStorage Kalıcılığı', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('promote sonrası değer localStorage\'a kaydedilmeli', () => {
    const quiz = createQuizManager('test');
    quiz.promoteQuiz('gbm');
    const stored = JSON.parse(localStorage.getItem('test_quiz_scores'));
    expect(stored.gbm).toBe(1);
  });

  it('demote sonrası değer localStorage\'a kaydedilmeli', () => {
    const quiz = createQuizManager('test');
    quiz.promoteQuiz('gbm');
    quiz.demoteQuiz('gbm');
    const stored = JSON.parse(localStorage.getItem('test_quiz_scores'));
    expect(stored.gbm).toBe(0);
  });

  it('yeniden yükleme sonrası değerler korunmalı', () => {
    const quiz1 = createQuizManager('test');
    quiz1.promoteQuiz('gbm');
    quiz1.promoteQuiz('gbm');

    const quiz2 = createQuizManager('test');
    expect(quiz2.getQuizBox('gbm')).toBe(2);
  });

  it('reset tüm skorları silmeli', () => {
    const quiz = createQuizManager('test');
    quiz.promoteQuiz('gbm');
    quiz.promoteQuiz('meningioma');
    quiz.reset();
    expect(quiz.getQuizBox('gbm')).toBe(0);
    expect(quiz.getQuizBox('meningioma')).toBe(0);
  });

  it('farklı prefix\'ler birbirini etkilememeli', () => {
    const neuroQuiz = createQuizManager('neurorad');
    const abdQuiz = createQuizManager('abdrad');
    neuroQuiz.promoteQuiz('gbm');
    abdQuiz.promoteQuiz('hcc');
    expect(neuroQuiz.getQuizBox('hcc')).toBe(0);
    expect(abdQuiz.getQuizBox('gbm')).toBe(0);
  });
});

describe('Quiz Manager - Leitner Aralıklı Tekrar Havuzu', () => {
  let quiz;

  beforeEach(() => {
    localStorage.clear();
    quiz = createQuizManager('test');
  });

  it('kutu 0 (yeni) her oturumda görünmeli', () => {
    for (let session = 0; session < 20; session++) {
      localStorage.setItem('test_quiz_session', session.toString());
      const pool = quiz.getSmartQuizPool(testDiseases);
      expect(pool.map(d => d.id)).toContain('gbm');
    }
  });

  it('kutu 1 her 2. oturumda görünmeli', () => {
    quiz.promoteQuiz('gbm'); // box 1

    // Çift oturumlarda görünmeli
    localStorage.setItem('test_quiz_session', '0');
    let pool = quiz.getSmartQuizPool(testDiseases);
    expect(pool.map(d => d.id)).toContain('gbm');

    // Tek oturumlarda görünmemeli
    localStorage.setItem('test_quiz_session', '1');
    pool = quiz.getSmartQuizPool(testDiseases);
    expect(pool.map(d => d.id)).not.toContain('gbm');

    // Tekrar çift oturumda
    localStorage.setItem('test_quiz_session', '2');
    pool = quiz.getSmartQuizPool(testDiseases);
    expect(pool.map(d => d.id)).toContain('gbm');
  });

  it('kutu 2 her 4. oturumda görünmeli', () => {
    quiz.promoteQuiz('gbm');
    quiz.promoteQuiz('gbm'); // box 2

    localStorage.setItem('test_quiz_session', '0');
    expect(quiz.getSmartQuizPool(testDiseases).map(d => d.id)).toContain('gbm');

    localStorage.setItem('test_quiz_session', '1');
    expect(quiz.getSmartQuizPool(testDiseases).map(d => d.id)).not.toContain('gbm');

    localStorage.setItem('test_quiz_session', '3');
    expect(quiz.getSmartQuizPool(testDiseases).map(d => d.id)).not.toContain('gbm');

    localStorage.setItem('test_quiz_session', '4');
    expect(quiz.getSmartQuizPool(testDiseases).map(d => d.id)).toContain('gbm');
  });

  it('kutu 3 her 8. oturumda görünmeli', () => {
    quiz.promoteQuiz('gbm');
    quiz.promoteQuiz('gbm');
    quiz.promoteQuiz('gbm'); // box 3

    localStorage.setItem('test_quiz_session', '0');
    expect(quiz.getSmartQuizPool(testDiseases).map(d => d.id)).toContain('gbm');

    localStorage.setItem('test_quiz_session', '7');
    expect(quiz.getSmartQuizPool(testDiseases).map(d => d.id)).not.toContain('gbm');

    localStorage.setItem('test_quiz_session', '8');
    expect(quiz.getSmartQuizPool(testDiseases).map(d => d.id)).toContain('gbm');
  });

  it('kutu 4 (uzmanlaşmış) her 16. oturumda görünmeli', () => {
    quiz.promoteQuiz('gbm');
    quiz.promoteQuiz('gbm');
    quiz.promoteQuiz('gbm');
    quiz.promoteQuiz('gbm'); // box 4

    localStorage.setItem('test_quiz_session', '0');
    expect(quiz.getSmartQuizPool(testDiseases).map(d => d.id)).toContain('gbm');

    localStorage.setItem('test_quiz_session', '1');
    expect(quiz.getSmartQuizPool(testDiseases).map(d => d.id)).not.toContain('gbm');

    localStorage.setItem('test_quiz_session', '16');
    expect(quiz.getSmartQuizPool(testDiseases).map(d => d.id)).toContain('gbm');
  });

  it('oturum yoksa (ilk kullanım) tüm hastalıklar havuzda olmalı', () => {
    const pool = quiz.getSmartQuizPool(testDiseases);
    expect(pool.length).toBe(testDiseases.length);
  });

  it('karışık kutu seviyelerinde doğru filtreleme yapmalı', () => {
    quiz.promoteQuiz('gbm');           // box 1
    quiz.promoteQuiz('meningioma');     // box 1
    quiz.promoteQuiz('meningioma');     // box 2
    // hcc kalır box 0

    localStorage.setItem('test_quiz_session', '1'); // tek numara
    const pool = quiz.getSmartQuizPool(testDiseases);
    // box 0 (hcc) her zaman: dahil
    // box 1 (gbm) çift oturumda: hariç (oturum 1 tek)
    // box 2 (meningioma) her 4: hariç (1 % 4 != 0)
    expect(pool.map(d => d.id)).toContain('hcc');
    expect(pool.map(d => d.id)).not.toContain('gbm');
    expect(pool.map(d => d.id)).not.toContain('meningioma');
  });
});

describe('Quiz Manager - getScores', () => {
  it('tüm skorları obje olarak dönmeli', () => {
    localStorage.clear();
    const quiz = createQuizManager('test');
    quiz.promoteQuiz('gbm');
    quiz.promoteQuiz('meningioma');
    quiz.promoteQuiz('meningioma');
    const scores = quiz.getScores();
    expect(scores).toEqual({ gbm: 1, meningioma: 2 });
  });

  it('dönen obje orijinal veriyi değiştirmemeli', () => {
    localStorage.clear();
    const quiz = createQuizManager('test');
    quiz.promoteQuiz('gbm');
    const scores = quiz.getScores();
    scores.gbm = 999;
    expect(quiz.getQuizBox('gbm')).toBe(1); // orijinal değişmemeli
  });
});
