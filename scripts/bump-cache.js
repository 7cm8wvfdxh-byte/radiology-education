#!/usr/bin/env node
/**
 * Service worker cache versiyonunu otomatik artırır.
 * İçerik değişikliklerinde eski cache'in temizlenmesini sağlar.
 *
 * Kullanım: node scripts/bump-cache.js
 */

const fs = require('fs');
const path = require('path');

const SW_FILE = path.resolve(__dirname, '..', 'sw.js');

const content = fs.readFileSync(SW_FILE, 'utf8');
const match = content.match(/const CACHE_VERSION = (\d+);/);

if (!match) {
  console.error('CACHE_VERSION sw.js dosyasında bulunamadı');
  process.exit(1);
}

const oldVersion = parseInt(match[1]);
const newVersion = oldVersion + 1;
const updated = content.replace(
  `const CACHE_VERSION = ${oldVersion};`,
  `const CACHE_VERSION = ${newVersion};`
);

fs.writeFileSync(SW_FILE, updated, 'utf8');
console.log(`Cache versiyonu güncellendi: v${oldVersion} → v${newVersion}`);
