export type ScreenType = 'start' | 'sector' | 'crisis' | 'agents' | 'system';

export type AgentStatus = 'HAZIR' | 'YOLDA' | 'MEŞGUL' | 'SOĞUMADA';

export interface Agent {
  id: string;
  name: string;
  codename: string;
  avatarChar?: string;
  materialIcon?: string;
  roleDescription: string;
  color: string;
  textColor: string;
  borderColor: string;
  bgTagColor: string;
  status: AgentStatus;
  cooldownSeconds: number;
  maxCooldown: number;
  energyPercent: number;
  assignedIncidentId?: string | null;
  targetNodeId?: string | null;
  stats: {
    security: number;
    speed: number;
    architecture: number;
    database: number;
  };
  specialAbility: string;
  quote: string;
}

export type BuildingNodeId = 
  | 'randevu' 
  | 'odeme' 
  | 'bildirim' 
  | 'laboratuvar' 
  | 'hastane' 
  | 'hasta_kayit' 
  | 'veritabani';

export interface BuildingNode {
  id: BuildingNodeId;
  name: string;
  displayName: string;
  description: string;
  status: 'optimal' | 'warning' | 'critical' | 'intervening';
  healthPercent: number;
  queueCount: number;
  x: number;
  y: number;
  width: number;
  height: number;
  activeCrisisId?: string;
  assignedAgentName?: string;
}

export interface Incident {
  id: string;
  title: string;
  nodeId: BuildingNodeId;
  nodeName: string;
  severity: 'KRİTİK' | 'YÜKSEK' | 'ORTA';
  totalTime: number;
  remainingTime: number;
  requirements: {
    label1: string;
    value1: number;
    label2: string;
    value2: number;
  };
  damagePercent: number;
  pointsReward: number;
  isMainObjective?: boolean;
  assignedAgentId?: string | null;
  assignedAgentName?: string | null;
  progressPercent: number;
  activePath?: boolean;
}

export interface DecisionRecord {
  id: string;
  title: string;
  type: 'MİMARİ' | 'GÜVENLİK' | 'PATLADI' | 'PERFORMANS';
  success: boolean;
  scoreOrDamage: string;
  description: string;
  reason: string;
  timestamp: string;
  icon: string;
}

export interface GameSettings {
  role: 'Geliştirici' | 'Sistem Mimarı' | 'DevOps Nöbetçisi' | 'Güvenlik Lideri';
  difficulty: 'Normal' | 'Kolay' | 'Kaos' | 'Gerçek Zamanlı';
  preset: 'Yeni başladım' | 'Hızlı Müdahale' | 'Gece Vardiyası';
  soundEnabled: boolean;
  crtEnabled: boolean;
  gameSpeed: number;
}
