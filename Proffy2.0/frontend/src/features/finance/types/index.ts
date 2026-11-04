export interface FinanceSnapshot {
  timestamp: number;
  revenuePerClass: number;   // faturamento médio por aula (R$)
  costPerClass: number;      // custo médio por aula (professor + estrutura) (R$)
  materialCost: number;      // custo de material/apostila por aluno (R$)
  courseValue: number;       // ticket médio dos cursos/mensalidades (R$)
  totalRevenue: number;      // faturamento acumulado do dia (R$)
  totalCost: number;         // custo acumulado do dia (R$)
  classesToday: number;
}

export interface RevenueByCourse {
  course: string;
  revenue: number;
  cost: number;
}

export interface CostBreakdownItem {
  name: string;
  value: number;
  color: string;
}
