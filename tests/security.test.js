/**
 * Güvenlik Testleri
 * XSS koruması, HTML escape ve hata yakalayıcı güvenliği
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '..');

describe('XSS Koruması — escHtml fonksiyonu', () => {
  // index.html'deki escHtml fonksiyonunu simüle ediyoruz
  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  it('< ve > karakterlerini escape etmeli', () => {
    expect(escHtml('<script>alert("xss")</script>')).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  });

  it('& karakterini escape etmeli', () => {
    expect(escHtml('a & b')).toBe('a &amp; b');
  });

  it('" karakterini escape etmeli', () => {
    expect(escHtml('data-id="test"')).toBe('data-id=&quot;test&quot;');
  });

  it('normal metni değiştirmemeli', () => {
    expect(escHtml('GBM hastalığı')).toBe('GBM hastalığı');
  });

  it('boş string ile çalışmalı', () => {
    expect(escHtml('')).toBe('');
  });

  it('img onerror XSS denemesini engellemeli', () => {
    const malicious = '<img src=x onerror="alert(document.cookie)">';
    const result = escHtml(malicious);
    // < ve > escape edildiği için tarayıcı bunu HTML olarak parse etmez
    expect(result).not.toContain('<img');
    expect(result).toContain('&lt;img');
    expect(result).toContain('&quot;');
  });
});

describe('XSS Koruması — findContext fonksiyonu', () => {
  // index.html'deki findContext mantığını simüle ediyoruz
  function escHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function findContext(text, query) {
    if (!text) return '';
    var idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return '';
    var start = Math.max(0, idx - 30);
    var end = Math.min(text.length, idx + query.length + 50);
    var snippet = (start > 0 ? '...' : '') + text.substring(start, end) + (end < text.length ? '...' : '');
    var re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return escHtml(snippet).replace(re, '<mark>$1</mark>');
  }

  it('arama terimini <mark> ile vurgulamalı', () => {
    const result = findContext('GBM bir beyin tümörüdür', 'GBM');
    expect(result).toContain('<mark>GBM</mark>');
  });

  it('HTML içeren metni escape etmeli', () => {
    const result = findContext('Test <script>alert("xss")</script> metin', 'Test');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('boş metin için boş string döndürmeli', () => {
    expect(findContext('', 'test')).toBe('');
    expect(findContext(null, 'test')).toBe('');
  });

  it('eşleşme bulunamazsa boş string döndürmeli', () => {
    expect(findContext('bu bir test metnidir', 'zzz')).toBe('');
  });

  it('regex özel karakterleri soruna yol açmamalı', () => {
    expect(() => findContext('test (parantez) metin', '(parantez)')).not.toThrow();
    expect(() => findContext('test [brackets] metin', '[brackets]')).not.toThrow();
    expect(() => findContext('test a+b metin', 'a+b')).not.toThrow();
  });
});

describe('XSS Koruması — Hata Yakalayıcılar', () => {
  it('neurorad.html window.onerror msg parametresini escape etmeli', () => {
    const html = readFileSync(resolve(ROOT, 'neurorad.html'), 'utf8');
    // window.onerror handler'ında safeMsg kullanılmalı
    const onerrorMatch = html.match(/window\.onerror\s*=\s*function\s*\([\s\S]*?\};/);
    expect(onerrorMatch).not.toBeNull();
    const handler = onerrorMatch[0];
    // msg doğrudan innerHTML'e yazılmamalı, escape edilmeli
    expect(handler).toContain('replace');
    expect(handler).toContain('&lt;');
  });

  it('abdomenrad.html window.onerror msg parametresini escape etmeli', () => {
    const html = readFileSync(resolve(ROOT, 'abdomenrad.html'), 'utf8');
    const onerrorMatch = html.match(/window\.onerror\s*=\s*function\s*\([\s\S]*?\};/);
    expect(onerrorMatch).not.toBeNull();
    const handler = onerrorMatch[0];
    expect(handler).toContain('replace');
    expect(handler).toContain('&lt;');
  });

  it('neurorad.html render catch bloğu error.message escape etmeli', () => {
    const html = readFileSync(resolve(ROOT, 'neurorad.html'), 'utf8');
    // safeMsg = (e.message||'').replace... pattern'i bulunmalı
    expect(html).toContain("safeMsg = (e.message||'').replace");
  });

  it('abdomenrad.html render catch bloğu error.message escape etmeli', () => {
    const html = readFileSync(resolve(ROOT, 'abdomenrad.html'), 'utf8');
    expect(html).toContain("safeMsg = (e.message||'').replace");
  });
});

describe('XSS Koruması — index.html escHtml kullanımı', () => {
  it('arama sonuçlarında r.name escHtml ile sarılmalı', () => {
    const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
    expect(html).toContain('escHtml(r.name)');
  });

  it('arama sonuçlarında r.cat escHtml ile sarılmalı', () => {
    const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
    expect(html).toContain('escHtml(r.cat)');
  });

  it('escHtml fonksiyonu tanımlı olmalı', () => {
    const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
    expect(html).toMatch(/function\s+escHtml\s*\(/);
  });

  it('navigateResult URL parametrelerini encodeURIComponent ile kodlamalı', () => {
    const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
    expect(html).toContain('encodeURIComponent(result.id)');
  });
});
