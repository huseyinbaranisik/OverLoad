import { Agent, BuildingNode, Incident, DecisionRecord, GameSettings } from '../types';

export const initialAgents: Agent[] = [
  {
    id: 'claude',
    name: 'Claude',
    codename: 'OP-CLAUDE',
    avatarChar: 'C',
    roleDescription: 'Mimari & Mantık / Geri Alma',
    color: '#d97757',
    textColor: '#ffffff',
    borderColor: '#0b1220',
    bgTagColor: '#5fe39a',
    status: 'HAZIR',
    cooldownSeconds: 0,
    maxCooldown: 15,
    energyPercent: 100,
    stats: { security: 4, speed: 3, architecture: 5, database: 4 },
    specialAbility: 'Eski Sürüme Anında Geri Dönüş (Rollback)',
    quote: 'Sakin ol, önce mimariyi bilinen, kararlı duruma geri alalım.'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    codename: 'OP-GEMINI',
    materialIcon: 'auto_awesome',
    roleDescription: 'Multimodal & Gerçek Zamanlı Hız',
    color: '#8f7cf6',
    textColor: '#ffffff',
    borderColor: '#0b1220',
    bgTagColor: '#3fe0c5',
    status: 'YOLDA',
    cooldownSeconds: 0,
    maxCooldown: 12,
    energyPercent: 80,
    assignedIncidentId: 'inc-randevu-1',
    targetNodeId: 'randevu',
    stats: { security: 4, speed: 5, architecture: 4, database: 4 },
    specialAbility: 'Ultra-Hızlı Log Tarama & Telemetri İyileştirme',
    quote: 'Tüm logları ve telemetri akışlarını tek saniyede birleştirdim.'
  },
  {
    id: 'gpt',
    name: 'GPT',
    codename: 'OP-GPT4',
    materialIcon: 'all_inclusive',
    roleDescription: 'Genel Operasyon & Entegrasyon',
    color: '#10a37f',
    textColor: '#ffffff',
    borderColor: '#0b1220',
    bgTagColor: '#293643',
    status: 'SOĞUMADA',
    cooldownSeconds: 6,
    maxCooldown: 14,
    energyPercent: 45,
    stats: { security: 4, speed: 4, architecture: 4, database: 4 },
    specialAbility: 'API Kuyruk Düzenleme & Otomatik Yama',
    quote: 'Entegrasyon katmanındaki zaman aşımlarını yeniden yapılandırıyorum.'
  },
  {
    id: 'llama',
    name: 'Llama',
    codename: 'OP-LLAMA',
    avatarChar: '🦙',
    roleDescription: 'Yerel Güvenlik & Veri İzolasyonu',
    color: '#3b82f6',
    textColor: '#ffffff',
    borderColor: '#0b1220',
    bgTagColor: '#5fe39a',
    status: 'HAZIR',
    cooldownSeconds: 0,
    maxCooldown: 16,
    energyPercent: 90,
    stats: { security: 5, speed: 3, architecture: 3, database: 5 },
    specialAbility: 'Ağ İzolasyonu & Yerel Şifreleme Kilidi',
    quote: 'Hasta kayıtları ve kimlikler yerel bölmede kilitlendi.'
  },
  {
    id: 'mistral',
    name: 'Mistral',
    codename: 'OP-MISTRAL',
    materialIcon: 'air',
    roleDescription: 'Hafif & Hızlı Uç Sunucu Müdahalesi',
    color: '#ffaf00',
    textColor: '#0b1220',
    borderColor: '#0b1220',
    bgTagColor: '#293643',
    status: 'MEŞGUL',
    cooldownSeconds: 12,
    maxCooldown: 18,
    energyPercent: 20,
    stats: { security: 3, speed: 5, architecture: 3, database: 3 },
    specialAbility: 'Uç Noktada Oran Sınırlama (Rate Limiting)',
    quote: 'Gelen 10.000 şüpheli istek kenar sunucularda düşürüldü.'
  }
];

export const initialBuildingNodes: BuildingNode[] = [
  {
    id: 'randevu',
    name: 'Randevu',
    displayName: 'Randevu Servisi',
    description: 'Poliklinik randevu alma ve hekim takvimi mikroservisi.',
    status: 'critical',
    healthPercent: 35,
    queueCount: 1420,
    x: 12,
    y: 16,
    width: 88,
    height: 72,
    activeCrisisId: 'inc-randevu-1'
  },
  {
    id: 'odeme',
    name: 'Ödeme',
    displayName: 'Ödeme Ağ Geçidi',
    description: 'SGK ve özel sigorta tahsilat sistemi.',
    status: 'optimal',
    healthPercent: 88,
    queueCount: 42,
    x: 142,
    y: 16,
    width: 84,
    height: 72
  },
  {
    id: 'bildirim',
    name: 'Bildirim',
    displayName: 'Bildirim & SMS Servisi',
    description: 'Hasta SMS doğrulama ve kritik hekim uyarı motoru.',
    status: 'warning',
    healthPercent: 62,
    queueCount: 520,
    x: 248,
    y: 16,
    width: 84,
    height: 72
  },
  {
    id: 'laboratuvar',
    name: 'Laboratuvar',
    displayName: 'Lab Sonuç Analiz Pipeline',
    description: 'Kan, biyokimya ve patoloji tahlil sonuçları kuyruğu.',
    status: 'optimal',
    healthPercent: 94,
    queueCount: 18,
    x: 12,
    y: 138,
    width: 88,
    height: 68
  },
  {
    id: 'hastane',
    name: 'HASTANE',
    displayName: 'Merkezi Komuta Kompleksi',
    description: 'Şehir hastanesi ana veri merkezi ve orkestrasyon çekirdeği.',
    status: 'optimal',
    healthPercent: 98,
    queueCount: 0,
    x: 134,
    y: 130,
    width: 98,
    height: 82
  },
  {
    id: 'hasta_kayit',
    name: 'Hasta Kayıt',
    displayName: 'Hasta Kayıt & Triyaj',
    description: 'Acil servis ve poliklinik ilk giriş terminali.',
    status: 'warning',
    healthPercent: 54,
    queueCount: 290,
    x: 248,
    y: 138,
    width: 84,
    height: 68
  },
  {
    id: 'veritabani',
    name: 'Veritabanı',
    displayName: 'Ana Sağlık Veritabanı Kümesi',
    description: 'PostgreSQL ve Redis önbellek replikasyon havuzu.',
    status: 'optimal',
    healthPercent: 82,
    queueCount: 65,
    x: 12,
    y: 246,
    width: 88,
    height: 64
  }
];

export const initialIncidents: Incident[] = [
  {
    id: 'inc-randevu-1',
    title: 'Şifre deneme saldırısı',
    nodeId: 'randevu',
    nodeName: 'Randevu',
    severity: 'KRİTİK',
    totalTime: 30,
    remainingTime: 23,
    requirements: {
      label1: 'Güvenlik',
      value1: 5,
      label2: 'Hız',
      value2: 3
    },
    damagePercent: 18,
    pointsReward: 20,
    isMainObjective: true,
    assignedAgentId: 'gemini',
    assignedAgentName: 'Gemini',
    progressPercent: 40,
    activePath: true
  },
  {
    id: 'inc-hasta-kayit-1',
    title: 'Triyaj Kuyruk Taşması',
    nodeId: 'hasta_kayit',
    nodeName: 'Hasta Kayıt',
    severity: 'ORTA',
    totalTime: 45,
    remainingTime: 38,
    requirements: {
      label1: 'Mimari',
      value1: 4,
      label2: 'Hız',
      value2: 4
    },
    damagePercent: 10,
    pointsReward: 15,
    isMainObjective: false,
    progressPercent: 0,
    activePath: false
  }
];

export const initialDecisionRecords: DecisionRecord[] = [
  {
    id: 'dec-1',
    title: 'KARAR 1 · MİMARİ · Eski sürüme geri dön',
    type: 'MİMARİ',
    success: true,
    scoreOrDamage: 'BAŞARILI · +15 Puan',
    description: "Sistem 08:25'te eski sürümle ayağa kalktı.",
    reason: 'Geri almak seni bilinen, çalışan bir duruma götürür.',
    timestamp: '08:25',
    icon: 'update'
  },
  {
    id: 'dec-2',
    title: 'PATLADI · Ödeme kuyruğu birikti',
    type: 'PATLADI',
    success: false,
    scoreOrDamage: 'HASAR: %12 Aşırı Yük',
    description: 'Banka API zaman aşımına uğradı, 142 hasta beklemede kaldı.',
    reason: 'Yetersiz kuyruk ölçekleme ve geç müdahale.',
    timestamp: '09:40',
    icon: 'warning'
  },
  {
    id: 'dec-3',
    title: 'KARAR 2 · GÜVENLİK · IP Bloklama & Captcha',
    type: 'GÜVENLİK',
    success: true,
    scoreOrDamage: 'BAŞARILI · +20 Puan',
    description: 'Botnet trafiği %98 oranında kesildi.',
    reason: 'Saniyede 4000 geçersiz giriş tespit edildi.',
    timestamp: '11:15',
    icon: 'security'
  }
];

export const defaultSettings: GameSettings = {
  role: 'Geliştirici',
  difficulty: 'Normal',
  preset: 'Yeni başladım',
  soundEnabled: true,
  crtEnabled: true,
  gameSpeed: 1
};
