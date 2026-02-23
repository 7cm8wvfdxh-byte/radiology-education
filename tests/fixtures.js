/**
 * Test veri sabitleri (fixture'lar)
 * Her iki modülden temsili veri yapıları
 */

// Geçerli hastalık nesnesi örneği
export const validDisease = {
  id: "gbm",
  name: "Glioblastom (GBM)",
  category: "tumor",
  tag: "critical",
  tagText: "Kritik",
  pathway: [
    {
      type: "histo",
      label: "Histopatoloji",
      text: "WHO Grade 4 diffüz astrositik tümör.",
      detail: "Tümör hücreleri VEGF salgılar"
    },
    {
      type: "tissue",
      label: "Doku Değişikliği",
      text: "Merkez: koagülatif nekroz.",
      detail: "Nekroz: hipoksi → hücre ölümü"
    },
    {
      type: "signal",
      label: "Sinyal/Dansite Karşılığı",
      text: "Nekrotik merkez: T1↓, T2↑. DWI: kısıtlanma.",
      detail: "Fenestrasyonlu damarlardan Gd sızar"
    },
    {
      type: "finding",
      label: "Görüntüleme Bulgusu",
      text: "İrregüler kalın halka tarzı kontrastlanma (ring enhancement).",
      detail: "DWI'da solid kısımda kısıtlanma"
    }
  ],
  keyPoint: "GBM'de ring enhancement'ın nedeni: Merkez nekroz.",
  differential: [
    "Beyin absesi — düzgün ince halka",
    "Metastaz — genellikle multipl",
    "Lenfoma — genellikle homojen kontrastlanır"
  ],
  protocol: "MR: Aksiyel T1, T2, FLAIR, DWI/ADC, T1 kontrastlı.",
  quiz: {
    q: "GBM'de neden DWI'da solid kısımda difüzyon kısıtlanması görülür?",
    a: "Yüksek selülarite nedeniyle ekstraselüler alan daralmıştır."
  }
};

// İkinci geçerli hastalık nesnesi
export const validDisease2 = {
  id: "meningioma",
  name: "Menenjiyom",
  category: "tumor",
  tag: "common",
  tagText: "Sık",
  pathway: [
    {
      type: "histo",
      label: "Histopatoloji",
      text: "Araknoid cap hücrelerinden köken alır.",
      detail: "Ekstra-aksiyel tümör"
    },
    {
      type: "tissue",
      label: "Doku Değişikliği",
      text: "Sıkı paketlenmiş hücreler → solid homojen kitle.",
      detail: "Solid yapı + düşük su içeriği"
    },
    {
      type: "signal",
      label: "Sinyal/Dansite Karşılığı",
      text: "BT: hiperdens. MR: T1 izointens.",
      detail: "BT'de hiperdens olması: yüksek hücre yoğunluğu"
    },
    {
      type: "finding",
      label: "Görüntüleme Bulgusu",
      text: "Geniş dural tabanlı ekstra-aksiyel kitle. Dural tail sign.",
      detail: "Dural tail: reaktif vasküler konjesyon"
    }
  ],
  keyPoint: "Menenjiyomun ekstra-aksiyel olduğunu anlamak kritik.",
  differential: [
    "Dural metastaz — genellikle bilinen primer malignitesi olan hastada",
    "Hemanjiyoperisitom — dar dural taban"
  ],
  protocol: "BT + MR T1, T2, FLAIR, T1 kontrastlı.",
  quiz: {
    q: "Menenjiyom neden BT'de hiperdens görünür?",
    a: "Sıkı paketlenmiş meningoteliyal hücreler + psammoma cisimleri."
  }
};

// Abdomen hastalık nesnesi
export const validAbdomenDisease = {
  id: "hcc",
  name: "Hepatosellüler Karsinom (HCC)",
  category: "liver",
  tag: "critical",
  tagText: "Kritik",
  pathway: [
    {
      type: "histo",
      label: "Histopatoloji",
      text: "Hepatositlerden köken alır.",
      detail: "En sık siroz zemininde gelişir"
    },
    {
      type: "tissue",
      label: "Doku Değişikliği",
      text: "Arteryel neovaskülarizasyon.",
      detail: "VEGF kaynaklı damar oluşumu"
    },
    {
      type: "signal",
      label: "Sinyal/Dansite Karşılığı",
      text: "Arteryel fazda parlak, portal fazda wash-out.",
      detail: "Dual blood supply değişikliği"
    },
    {
      type: "finding",
      label: "Görüntüleme Bulgusu",
      text: "Arteryel hipervasküler lezyon + wash-out + kapsül.",
      detail: "LI-RADS kategorilerine göre değerlendirilir"
    }
  ],
  keyPoint: "HCC tanısında wash-in/wash-out paterni kritik.",
  differential: [
    "FNH — santral skar, wash-out yok",
    "Hemanjiom — periferik nodüler kontrastlanma"
  ],
  protocol: "Dinamik kontrastlı MR: arteryel, portal, gecikmiş faz.",
  quiz: {
    q: "HCC neden arteryel fazda parlak görünür?",
    a: "Normal KC portal ven dominant, HCC arteryel neovaskül dominant."
  }
};

// Eksik alanları olan hastalık
export const invalidDisease = {
  id: "incomplete",
  name: "Eksik Hastalık"
  // category, pathway, keyPoint, differential, quiz eksik
};

// Geçerli düello nesnesi
export const validDuel = {
  title: "GBM vs Beyin Absesi",
  icon: "⚔️",
  category: "tumor",
  difficulty: "high",
  a: {
    name: "GBM",
    features: [
      "İrregüler kalın halka enhancement",
      "DWI: periferde kısıtlanma"
    ]
  },
  b: {
    name: "Beyin Absesi",
    features: [
      "İnce düzgün halka enhancement",
      "DWI: merkezde kısıtlanma (pü)"
    ]
  },
  keyDiff: "DWI merkezde parlak → abse; koyu → GBM nekrozu."
};

// Geçerli sinyal quiz nesnesi
export const validSignalQuiz = {
  q: "T1'de parlak görünen yapılar hangisidir?",
  options: ["Yağ", "BOS", "Hava", "Kalsifikasyon"],
  answer: 0,
  explanation: "Yağ T1'de parlak görünür."
};

// Geçersiz sinyal quiz
export const invalidSignalQuiz = {
  q: "Eksik quiz",
  options: ["Tek seçenek"],
  answer: 5 // out of bounds
};

// Neuro kategorileri
export const neuroCategories = {
  tumor: { icon: "🔬", color: "#f43f5e", title: "Tümörler" },
  demyelinating: { icon: "⚡", color: "#8b5cf6", title: "Demyelinizan Hastalıklar" },
  vascular: { icon: "🩸", color: "#ef4444", title: "Vasküler Patolojiler" },
  infectious: { icon: "🦠", color: "#f59e0b", title: "Enfeksiyöz Hastalıklar" },
  congenital: { icon: "🧒", color: "#06b6d4", title: "Konjenital Anomaliler" },
  degenerative: { icon: "🧓", color: "#10b981", title: "Dejeneratif Hastalıklar" },
  spinal: { icon: "🦴", color: "#ec4899", title: "Spinal Patolojiler" },
  daily: { icon: "📋", color: "#64748b", title: "Günlük Pratik / Yaşlanma" }
};

// Abdomen kategorileri
export const abdomenCategories = {
  liver: { icon: "🫁", color: "#f43f5e", title: "Karaciğer" },
  pancreas: { icon: "🟡", color: "#f59e0b", title: "Pankreas" },
  kidney: { icon: "🫘", color: "#8b5cf6", title: "Böbrek" },
  bowel: { icon: "🔴", color: "#ef4444", title: "Barsak & Mezenter" },
  biliary: { icon: "💚", color: "#10b981", title: "Safra Yolları" },
  vascular: { icon: "🩸", color: "#dc2626", title: "Vasküler" },
  peritoneum: { icon: "🔵", color: "#3b82f6", title: "Periton & Retroperiton" },
  adrenal: { icon: "🟡", color: "#eab308", title: "Adrenal" },
  spleen: { icon: "🟣", color: "#a855f7", title: "Dalak" },
  gynecologic: { icon: "🩷", color: "#ec4899", title: "Jinekolojik" },
  pelvic: { icon: "🔷", color: "#0ea5e9", title: "Pelvik-Ürolojik" },
  usg: { icon: "🔊", color: "#06b6d4", title: "USG Acil/Temel" },
  pediatric: { icon: "👶", color: "#f472b6", title: "Pediatrik" }
};

// Arama sinonim haritası (test için küçültülmüş)
export const testSearchSynonyms = {
  'parlak': ['hiperintens', 'bright', 'hyperintense'],
  'koyu': ['hipointens', 'dark', 'hypointense'],
  'kanama': ['hemoraji', 'hematom', 'hemorrhage'],
  'tümör': ['kitle', 'neoplazm', 'mass', 'tumor', 'lezyon'],
  'ms': ['multipl skleroz', 'demyelinizasyon', 'plak'],
  'dwi': ['difüzyon', 'diffusion', 'kısıtlanma', 'restriction'],
  'kontrastlanma': ['enhancement', 'gadolinyum', 'kontrast', 'boyanma'],
  'ring': ['halka', 'ring enhancement', 'çevre kontrastlanma'],
  'gbm': ['glioblastom', 'glioblastoma', 'grade 4']
};

// Test hastalık listesi
export const testDiseases = [validDisease, validDisease2, validAbdomenDisease];
