import { FinanceSnapshot, RevenueByCourse, CostBreakdownItem } from '../types';

// Baseline realista para uma escola de médio porte. Estes valores simulam
// a alimentação em tempo real que, futuramente, virá de um endpoint
// (ex: WebSocket ou polling em /finance/live) conectado ao ERP financeiro.
const BASELINE = {
  revenuePerClass: 92,
  costPerClass: 54,
  materialCost: 38,
  courseValue: 420,
  totalRevenue: 18400,
  totalCost: 10650,
  classesToday: 46,
};

function jitter(value: number, pct: number) {
  const delta = value * pct * (Math.random() * 2 - 1);
  return Math.max(0, value + delta);
}

let lastSnapshot: FinanceSnapshot | null = null;

function nextSnapshot(): FinanceSnapshot {
  const base = lastSnapshot ?? { ...BASELINE, timestamp: Date.now() };

  const snapshot: FinanceSnapshot = {
    timestamp: Date.now(),
    revenuePerClass: Number(jitter(base.revenuePerClass, 0.04).toFixed(2)),
    costPerClass: Number(jitter(base.costPerClass, 0.03).toFixed(2)),
    materialCost: Number(jitter(base.materialCost, 0.02).toFixed(2)),
    courseValue: Number(jitter(base.courseValue, 0.015).toFixed(2)),
    totalRevenue: Number((base.totalRevenue + Math.random() * 180).toFixed(2)),
    totalCost: Number((base.totalCost + Math.random() * 95).toFixed(2)),
    classesToday: base.classesToday + (Math.random() > 0.7 ? 1 : 0),
  };

  lastSnapshot = snapshot;
  return snapshot;
}

const REVENUE_BY_COURSE: RevenueByCourse[] = [
  { course: "Matemática", revenue: 5200, cost: 2600 },
  { course: "Português", revenue: 4600, cost: 2300 },
  { course: "Química", revenue: 3900, cost: 2100 },
  { course: "Programação", revenue: 5400, cost: 2200 },
  { course: "Física", revenue: 3100, cost: 1800 },
  { course: "Biologia", revenue: 2800, cost: 1500 },
];

const COST_BREAKDOWN: CostBreakdownItem[] = [
  { name: "Professores", value: 58, color: "#8257E5" },
  { name: "Material/Apostila", value: 18, color: "#04D361" },
  { name: "Estrutura", value: 12, color: "#3D8EE3" },
  { name: "Marketing", value: 7, color: "#FFB84D" },
  { name: "Administrativo", value: 5, color: "#E33D3D" },
];

export const financeService = {
  // Retorna um histórico inicial (últimos N pontos) para popular o gráfico
  // assim que a tela carrega, simulando dados que já vinham sendo coletados.
  getInitialHistory: async (points: number = 20): Promise<FinanceSnapshot[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    lastSnapshot = null;
    const history: FinanceSnapshot[] = [];
    for (let i = 0; i < points; i++) {
      history.push(nextSnapshot());
    }
    return history;
  },

  // Simula um feed em tempo real. Troque por uma conexão WebSocket real
  // (ex: new WebSocket('wss://api.proffy.com/finance/live')) quando o
  // backend disponibilizar o canal — mantendo o mesmo callback(snapshot).
  subscribe: (callback: (snapshot: FinanceSnapshot) => void, intervalMs: number = 3000) => {
    const interval = setInterval(() => {
      callback(nextSnapshot());
    }, intervalMs);
    return () => clearInterval(interval);
  },

  getRevenueByCourse: async (): Promise<RevenueByCourse[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return REVENUE_BY_COURSE.map(c => ({
      ...c,
      revenue: Number(jitter(c.revenue, 0.03).toFixed(0)),
      cost: Number(jitter(c.cost, 0.03).toFixed(0)),
    }));
  },

  getCostBreakdown: async (): Promise<CostBreakdownItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return COST_BREAKDOWN;
  },
};
