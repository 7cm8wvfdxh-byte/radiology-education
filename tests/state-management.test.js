/**
 * localStorage / Durum Yönetimi Testleri
 * Favoriler, çalışılmış hastalıklar ve tema yönetimi
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  createFavoritesManager,
  createStudiedTracker,
  createThemeManager
} from '../src/core.js';

describe('Favoriler Yönetimi', () => {
  let favs;

  beforeEach(() => {
    localStorage.clear();
    favs = createFavoritesManager('test_favorites');
  });

  it('başlangıçta boş favori listesi dönmeli', () => {
    expect(favs.getFavorites()).toEqual([]);
  });

  it('favori ekleyebilmeli', () => {
    favs.toggleFavorite('gbm');
    expect(favs.getFavorites()).toContain('gbm');
  });

  it('favori çıkarabilmeli (toggle)', () => {
    favs.toggleFavorite('gbm');
    favs.toggleFavorite('gbm');
    expect(favs.getFavorites()).not.toContain('gbm');
  });

  it('birden fazla favori ekleyebilmeli', () => {
    favs.toggleFavorite('gbm');
    favs.toggleFavorite('meningioma');
    favs.toggleFavorite('hcc');
    const list = favs.getFavorites();
    expect(list).toContain('gbm');
    expect(list).toContain('meningioma');
    expect(list).toContain('hcc');
    expect(list.length).toBe(3);
  });

  it('aynı favoriyi iki kez eklemekle kaldırmalı', () => {
    favs.toggleFavorite('gbm');
    favs.toggleFavorite('gbm');
    expect(favs.getFavorites().length).toBe(0);
  });

  it('isFavorite doğru sonuç dönmeli', () => {
    expect(favs.isFavorite('gbm')).toBe(false);
    favs.toggleFavorite('gbm');
    expect(favs.isFavorite('gbm')).toBe(true);
    favs.toggleFavorite('gbm');
    expect(favs.isFavorite('gbm')).toBe(false);
  });

  it('localStorage\'a kaydedilmeli', () => {
    favs.toggleFavorite('gbm');
    const stored = JSON.parse(localStorage.getItem('test_favorites'));
    expect(stored).toContain('gbm');
  });

  it('bozuk localStorage verisini tolere etmeli', () => {
    localStorage.setItem('test_favorites', 'bozuk json{{{');
    const favs2 = createFavoritesManager('test_favorites');
    expect(favs2.getFavorites()).toEqual([]);
  });

  it('farklı modüller birbirini etkilememeli', () => {
    const neuroFavs = createFavoritesManager('neurorad_favorites');
    const abdFavs = createFavoritesManager('abdrad_favorites');
    neuroFavs.toggleFavorite('gbm');
    abdFavs.toggleFavorite('hcc');
    expect(neuroFavs.getFavorites()).toEqual(['gbm']);
    expect(abdFavs.getFavorites()).toEqual(['hcc']);
  });
});

describe('Çalışılmış Hastalık Takipçisi', () => {
  let tracker;

  beforeEach(() => {
    localStorage.clear();
    tracker = createStudiedTracker('test_studied');
  });

  it('başlangıçta boş liste dönmeli', () => {
    expect(tracker.getStudied()).toEqual([]);
    expect(tracker.getCount()).toBe(0);
  });

  it('hastalık çalışıldı olarak işaretleyebilmeli', () => {
    tracker.toggleStudied('gbm');
    expect(tracker.isStudied('gbm')).toBe(true);
    expect(tracker.getCount()).toBe(1);
  });

  it('çalışıldı işaretini kaldırabilmeli (toggle)', () => {
    tracker.toggleStudied('gbm');
    tracker.toggleStudied('gbm');
    expect(tracker.isStudied('gbm')).toBe(false);
    expect(tracker.getCount()).toBe(0);
  });

  it('birden fazla hastalığı işaretleyebilmeli', () => {
    tracker.toggleStudied('gbm');
    tracker.toggleStudied('meningioma');
    tracker.toggleStudied('hcc');
    expect(tracker.getCount()).toBe(3);
    expect(tracker.isStudied('gbm')).toBe(true);
    expect(tracker.isStudied('meningioma')).toBe(true);
    expect(tracker.isStudied('hcc')).toBe(true);
  });

  it('localStorage\'a kaydedilmeli', () => {
    tracker.toggleStudied('gbm');
    const stored = JSON.parse(localStorage.getItem('test_studied'));
    expect(stored).toContain('gbm');
  });

  it('reset tüm ilerlemeyi silmeli', () => {
    tracker.toggleStudied('gbm');
    tracker.toggleStudied('meningioma');
    tracker.reset();
    expect(tracker.getCount()).toBe(0);
    expect(tracker.isStudied('gbm')).toBe(false);
  });

  it('getStudied kopya dizi dönmeli (orijinali değiştirmemeli)', () => {
    tracker.toggleStudied('gbm');
    const list = tracker.getStudied();
    list.push('fake');
    expect(tracker.getCount()).toBe(1); // orijinal etkilenmemeli
  });

  it('yeniden yükleme sonrası veriler korunmalı', () => {
    tracker.toggleStudied('gbm');
    tracker.toggleStudied('meningioma');

    const tracker2 = createStudiedTracker('test_studied');
    expect(tracker2.isStudied('gbm')).toBe(true);
    expect(tracker2.isStudied('meningioma')).toBe(true);
    expect(tracker2.getCount()).toBe(2);
  });

  it('farklı modüller birbirini etkilememeli', () => {
    const neuroTracker = createStudiedTracker('neurorad_studied');
    const abdTracker = createStudiedTracker('abdrad_studied');
    neuroTracker.toggleStudied('gbm');
    abdTracker.toggleStudied('hcc');
    expect(neuroTracker.getCount()).toBe(1);
    expect(abdTracker.getCount()).toBe(1);
    expect(neuroTracker.isStudied('hcc')).toBe(false);
    expect(abdTracker.isStudied('gbm')).toBe(false);
  });
});

describe('Tema Yönetimi', () => {
  let theme;

  beforeEach(() => {
    localStorage.clear();
    theme = createThemeManager('test_theme');
  });

  it('varsayılan tema karanlık olmalı', () => {
    expect(theme.getTheme()).toBe('dark');
    expect(theme.isLight()).toBe(false);
  });

  it('tema değiştirebilmeli', () => {
    const next = theme.toggleTheme();
    expect(next).toBe('light');
    expect(theme.isLight()).toBe(true);
  });

  it('iki kez değiştirme orijinal temaya dönmeli', () => {
    theme.toggleTheme(); // light
    theme.toggleTheme(); // dark
    expect(theme.getTheme()).toBe('dark');
    expect(theme.isLight()).toBe(false);
  });

  it('tema tercihi localStorage\'a kaydedilmeli', () => {
    theme.toggleTheme();
    expect(localStorage.getItem('test_theme')).toBe('light');
  });

  it('mevcut tema tercihini yükleyebilmeli', () => {
    localStorage.setItem('test_theme', 'light');
    const theme2 = createThemeManager('test_theme');
    expect(theme2.isLight()).toBe(true);
  });

  it('farklı modüller birbirini etkilememeli', () => {
    const neuroTheme = createThemeManager('neurorad_theme');
    const abdTheme = createThemeManager('abdrad_theme');
    neuroTheme.toggleTheme();
    expect(neuroTheme.isLight()).toBe(true);
    expect(abdTheme.isLight()).toBe(false);
  });
});
