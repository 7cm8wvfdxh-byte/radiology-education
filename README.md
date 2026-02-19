# 🧠 Radiology Education Platform

**PATHO → IMAGING BRIDGE** — İnteraktif Radyoloji Eğitim Platformu

Radyoloji asistanları için tasarlanmış, kapsamlı ve interaktif web tabanlı eğitim aracı. Histopatolojiden görüntüleme bulgularına sistematik köprü kurarak radyolojik tanıyı öğretir.

## 🌐 Canlı Demo

**[▶ Platformu Aç](https://7cm8wvfdxh-byte.github.io/radiology-education/)**

> GitHub Pages'i etkinleştirdikten sonra yukarıdaki linki güncelleyin.

---

## 📦 İçerik

### 🧠 NeuroRad — Nöroradyoloji
- **81 hastalık** — tümörler, vasküler, demyelinizan, enfeksiyöz, dejeneratif, konjenital, spinal
- Anatomi atlası (aksiyel, posterior fossa, sellar — interaktif SVG harita)
- 6 kontrastlanma paterni (ring, homojen, leptomeningeal, non-enhancing, kranial sinir, pachymeningeal)
- Sinyal atlası, düello modu, akıllı quiz, bulgu bulucu, varyant sayfası
- MR fizik, artefakt, ölçüm rehberleri, acil bulgular, evreleme sistemleri

### 🫁 AbdomenRad — Abdominopelvik Radyoloji
- **80 hastalık** — 13 kategori (karaciğer, safra, pankreas, böbrek, barsak, vasküler, periton, adrenal, dalak, jinekolojik, pelvik, USG, pediatrik)
- Normal anatomi atlası (9 organ — segmentasyon, landmarklar, ölçüler, varyantlar)
- 8 kontrastlanma paterni (wash-in/out, sentripetal, gecikmeli, stealth, ring, hepatobilier, böbrek, pankreas fazları)
- 34 hastalıkta USG bulguları kutusu
- Pitfalls & Mimics (36 tuzak), Protokol Rehberi (23 senaryo)
- Post-op Anatomi (11 cerrahi), Vaka Simülatörü (9 interaktif vaka)
- Düello, sinyal quiz, bulgu bulucu, evreleme, rapor şablonları, hesaplayıcılar

---

## 📊 Platform İstatistikleri

| Metrik | NeuroRad | AbdomenRad | Toplam |
|--------|----------|------------|--------|
| Hastalık | 81 | 80 | **161** |
| Satır | 8,770 | 7,214 | **15,984** |
| Boyut | 588KB | 619KB | **1.21MB** |
| Kontrast Patern | 6 | 8 | **14** |
| Anatomi | 3 bölge | 9 organ | **12** |
| Düello | 30+ | 40 | **70+** |
| Quiz | 81 | 37+ | **118+** |

---

## 🚀 Kullanım

### Seçenek 1: GitHub Pages (Önerilen)
1. Bu repoyu fork edin
2. Settings → Pages → Source: `main` branch → Save
3. `https://7cm8wvfdxh-byte.github.io/radiology-education/` adresinden erişin

### Seçenek 2: Lokal
```bash
git clone https://github.com/7cm8wvfdxh-byte/radiology-education.git
cd radiology-education
# Herhangi bir tarayıcıda açın:
open index.html
```

### Seçenek 3: Mobil
Dosyaları telefona indirip doğrudan tarayıcıda açabilirsiniz. Tüm platformlar **tek HTML dosyası** — sunucu veya kurulum gerektirmez.

---

## 🏗 Teknik Özellikler

- **Sıfır bağımlılık** — harici kütüphane veya framework kullanılmaz
- **Tek dosya mimarisi** — her platform tek bir HTML dosyasında (CSS + JS inline)
- **Offline çalışır** — internet bağlantısı gerektirmez
- **Mobil uyumlu** — responsive tasarım, dokunmatik optimize
- **Progressive study tracking** — localStorage ile çalışma ilerlemesi kaydı
- **Akıllı arama** — Türkçe/İngilizce/Latince terimlerde fuzzy search

---

## 📱 Modüller

| Modül | Açıklama |
|-------|----------|
| 📖 Konular | Hastalık kartları — histopatoloji → görüntüleme pathway |
| ⚔️ Düello | İki benzer hastalığı karşılaştır, farkları öğren |
| 🔍 Bulgu Bulucu | Semptom/bulgu gir → ayırıcı tanı listesi |
| 🎯 Quiz | Akıllı tekrar sistemi — çalışılmamışlara öncelik |
| 📊 İstatistik | Çalışma ilerlemesi takibi |
| 🧬 Sinyal Atlası | MR sinyal profilleri + sinyal quiz |
| 🫀 Anatomi | Normal anatomi, ölçüler, varyantlar |
| 💉 Kontrast | Kontrastlanma paternleri atlası |
| ⚠️ Pitfalls | Klasik tuzaklar ve mimikler |
| 📋 Protokol | Klinik senaryo → görüntüleme protokolü |
| 🔪 Post-op | Cerrahi sonrası normal ve alarm bulguları |
| 🧩 Vaka | İnteraktif case-based learning |
| 🚨 Acil | Acil radyolojik bulgular ve zaman pencereleri |
| 📐 Evreleme | TNM ve radyolojik evreleme sistemleri |
| 🧮 Hesaplama | Klinik hesaplayıcılar (LI-RADS, AAST, vb.) |
| 📝 Rapor | Yapılandırılmış rapor şablonları |
| ⚛️ Fizik | MR/BT fizik konuları |
| 👻 Artefakt | MR + USG artefaktları |

---

## 🎯 Hedef Kitle

- Radyoloji asistanları (TUS sonrası uzmanlık eğitimi)
- Radyoloji board sınavına hazırlanan hekimler
- Radyolojiye ilgi duyan tıp öğrencileri

---

## 📄 Lisans

Bu proje eğitim amaçlıdır. Ticari kullanım için izin alınmalıdır.

---

*Radyoloji eğitiminde histopatoloji-görüntüleme köprüsü kurarak tanısal düşünceyi güçlendirmeyi hedefler.*
