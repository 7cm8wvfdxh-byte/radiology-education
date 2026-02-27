/**
 * Service Worker Yapısal Doğrulama Testleri
 * sw.js dosyasının doğru yapılandırıldığını test eder.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '..');

describe('Service Worker Yapılandırması', () => {
  const swContent = readFileSync(resolve(ROOT, 'sw.js'), 'utf8');

  it('CACHE_VERSION tanımlı olmalı', () => {
    expect(swContent).toMatch(/const CACHE_VERSION = \d+;/);
  });

  it('CACHE_NAME CACHE_VERSION kullanmalı', () => {
    expect(swContent).toContain("'radiology-edu-v' + CACHE_VERSION");
  });

  it('temel asset listesi tüm HTML dosyalarını içermeli', () => {
    expect(swContent).toContain('/index.html');
    expect(swContent).toContain('/neurorad.html');
    expect(swContent).toContain('/abdomenrad.html');
  });

  it('search-data.js asset listesinde olmalı', () => {
    expect(swContent).toContain('/search-data.js');
  });

  it('manifest.json asset listesinde olmalı', () => {
    expect(swContent).toContain('/manifest.json');
  });

  it('install event handler mevcut olmalı', () => {
    expect(swContent).toContain("addEventListener('install'");
  });

  it('activate event handler eski cache temizliği yapmalı', () => {
    expect(swContent).toContain("addEventListener('activate'");
    expect(swContent).toContain('caches.delete');
  });

  it('fetch event handler mevcut olmalı', () => {
    expect(swContent).toContain("addEventListener('fetch'");
  });

  it('skipWaiting çağrılmalı', () => {
    expect(swContent).toContain('self.skipWaiting()');
  });

  it('clients.claim çağrılmalı', () => {
    expect(swContent).toContain('self.clients.claim()');
  });
});

describe('PWA Manifest Doğrulama', () => {
  const manifest = JSON.parse(readFileSync(resolve(ROOT, 'manifest.json'), 'utf8'));

  it('name alanı olmalı', () => {
    expect(manifest.name).toBeTruthy();
  });

  it('short_name alanı olmalı', () => {
    expect(manifest.short_name).toBeTruthy();
  });

  it('start_url index.html olmalı', () => {
    expect(manifest.start_url).toBe('/index.html');
  });

  it('display standalone olmalı', () => {
    expect(manifest.display).toBe('standalone');
  });

  it('en az bir ikon tanımlı olmalı', () => {
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(1);
  });

  it('categories medical içermeli', () => {
    expect(manifest.categories).toContain('medical');
  });
});
