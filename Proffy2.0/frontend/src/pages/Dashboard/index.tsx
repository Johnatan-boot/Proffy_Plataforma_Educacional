import { useState, useEffect, useMemo, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar } from "@/components/ui/Avatar";
import {
  Users, BookOpen, Clock, GraduationCap, Wallet, TrendingDown, TrendingUp,
  Package, Tag, Radio, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";
import { teacherService } from "@/features/teachers/services";
import { studentService } from "@/features/students/services";
import { subjectService } from "@/features/subjects/services";
import { scheduleService } from "@/features/schedules/services";
import { reportService, OverviewReport } from "@/features/reports";
import { financeService } from "@/features/finance/services";
import { FinanceSnapshot, RevenueByCourse, CostBreakdownItem } from "@/features/finance/types";
import { motion } from "motion/react";

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function Dashboard() {
  const [teacherCount, setTeacherCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [subjectCount, setSubjectCount] = useState(0);
  const [classesToday, setClassesToday] = useState(0);
  const [report, setReport] = useState<OverviewReport | null>(null);
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState<FinanceSnapshot[]>([]);
  const [revenueByCourse, setRevenueByCourse] = useState<RevenueByCourse[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdownItem[]>([]);
  const firstSnapshotRef = useRef<FinanceSnapshot | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [teachers, students, subjects, schedules, hist, byCourse, breakdown, overview] = await Promise.all([
          teacherService.getTotal(),
          studentService.getAll(),
          subjectService.getAll(),
          scheduleService.getLessons(),
          financeService.getInitialHistory(20),
          financeService.getRevenueByCourse(),
          financeService.getCostBreakdown(),
          reportService.overview().catch(() => null),
        ]);
        setReport(overview);
        setTeacherCount(teachers);
        setStudentCount(students.length);
        setSubjectCount(subjects.length);
        const today = new Date().toDateString();
        setClassesToday(
          schedules.filter(s => s.status !== "CANCELLED" && s.scheduledAt && new Date(s.scheduledAt).toDateString() === today).length
        );
        setHistory(hist);
        firstSnapshotRef.current = hist[0] ?? null;
        setRevenueByCourse(byCourse);
        setCostBreakdown(breakdown);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = financeService.subscribe((snapshot) => {
      setHistory(prev => [...prev.slice(-29), snapshot]);
    }, 3000);
    return unsubscribe;
  }, []);

  const latest = history[history.length - 1];
  const first = firstSnapshotRef.current;

  const trendPct = (currentVal?: number, baseVal?: number) => {
    if (!currentVal || !baseVal) return 0;
    return ((currentVal - baseVal) / baseVal) * 100;
  };

  const overviewStats = [
    { title: "Professores", value: teacherCount, icon: Users, color: "text-primary", bg: "bg-primary-lighter/20" },
    { title: "Alunos Matriculados", value: studentCount, icon: GraduationCap, color: "text-secondary", bg: "bg-secondary/15" },
    { title: "Disciplinas Ativas", value: subjectCount, icon: BookOpen, color: "text-info", bg: "bg-info/15" },
    { title: "Aulas Hoje", value: classesToday, icon: Clock, color: "text-warning", bg: "bg-warning/15" },
  ];

  const kpiCards = latest ? [
    {
      title: "Faturamento por Aula",
      value: currency.format(latest.revenuePerClass),
      trend: trendPct(latest.revenuePerClass, first?.revenuePerClass),
      icon: TrendingUp,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      title: "Custo por Aula",
      value: currency.format(latest.costPerClass),
      trend: trendPct(latest.costPerClass, first?.costPerClass),
      invert: true,
      icon: TrendingDown,
      color: "text-danger",
      bg: "bg-danger/10",
    },
    {
      title: "Custo de Material/Apostila",
      value: currency.format(latest.materialCost),
      trend: trendPct(latest.materialCost, first?.materialCost),
      invert: true,
      icon: Package,
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      title: "Ticket Médio dos Cursos",
      value: currency.format(latest.courseValue),
      trend: trendPct(latest.courseValue, first?.courseValue),
      icon: Tag,
      color: "text-primary",
      bg: "bg-primary-lighter/15",
    },
  ] : [];

  const margin = latest ? latest.totalRevenue - latest.totalCost : 0;
  const marginPct = latest && latest.totalRevenue > 0 ? (margin / latest.totalRevenue) * 100 : 0;

  const chartData = useMemo(
    () => history.map(h => ({
      time: formatTime(h.timestamp),
      Faturamento: Number(h.totalRevenue.toFixed(0)),
      Custo: Number(h.totalCost.toFixed(0)),
    })),
    [history]
  );

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px] text-text-complement">
          Carregando painel financeiro...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Cabeçalho com indicador ao vivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-archivo text-text-title">Visão Geral</h1>
          <p className="text-text-base mt-1">Indicadores operacionais e financeiros da escola</p>
        </div>
        <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-full px-4 py-2 shrink-0 w-fit">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
          </span>
          <span className="text-xs font-bold text-success uppercase tracking-wide flex items-center gap-1">
            <Radio className="w-3.5 h-3.5" /> Dados reais da API
          </span>
        </div>
      </div>

      {/* Stats operacionais (Professores, Alunos, Disciplinas, Aulas Hoje — dados reais da API) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {overviewStats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-box-base p-6 rounded-2xl shadow-sm border border-line-in-white flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-text-complement text-sm font-medium">{stat.title}</p>
              <h3 className="text-2xl font-bold font-archivo text-text-title mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Custos reais — calculados no backend a partir das aulas agendadas
          (valor/hora do professor × duração). */}
      <div className="flex items-center gap-2 mb-4 mt-4">
        <Wallet className="w-5 h-5 text-text-title" />
        <h2 className="text-lg font-bold font-archivo text-text-title">Custos Reais de Aulas</h2>
        <span className="text-[10px] font-bold uppercase tracking-wide text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
          Dados reais
        </span>
      </div>
      {report && report.activeLessons > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="grid grid-cols-2 gap-4 lg:col-span-1 content-start">
            {[
              { label: "Aulas ativas", value: String(report.activeLessons) },
              { label: "Horas de aula", value: `${report.totalHours.toFixed(1)}h` },
              { label: "Custo total", value: currency.format(report.totalCost) },
              { label: "Custo médio/aula", value: currency.format(report.avgCostPerLesson) },
            ].map(k => (
              <div key={k.label} className="bg-box-base p-5 rounded-2xl shadow-sm border border-line-in-white">
                <p className="text-text-complement text-xs font-medium">{k.label}</p>
                <h3 className="text-xl font-bold font-archivo text-text-title mt-1 tabular-nums">{k.value}</h3>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 bg-box-base rounded-2xl shadow-sm border border-line-in-white p-6">
            <h3 className="text-base font-bold font-archivo text-text-title mb-4">Custo por disciplina</h3>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.costBySubject} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6E6F0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9C98A6" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9C98A6" }} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip formatter={(value: number) => currency.format(value)} contentStyle={{ borderRadius: 12, border: "1px solid #E6E6F0", fontSize: 13 }} />
                  <Bar dataKey="cost" name="Custo" fill="#8257E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-box-base rounded-2xl border border-line-in-white p-6 mb-8 text-sm text-text-complement">
          Ainda não há aulas agendadas. Agende aulas em <strong>Horários → Agendar aula</strong> para ver os custos reais aqui.
        </div>
      )}

      {/* KPIs financeiros — o backend não modela faturamento/custo; mantido como
          simulação até existir um domínio financeiro real na API. */}
      <div className="flex items-center gap-2 mb-4 mt-4">
        <Wallet className="w-5 h-5 text-text-title" />
        <h2 className="text-lg font-bold font-archivo text-text-title">Indicadores Financeiros</h2>
        <span className="text-[10px] font-bold uppercase tracking-wide text-text-complement bg-background border border-line-in-white px-2 py-0.5 rounded-full">
          Simulação — sem endpoint financeiro no backend
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpiCards.map((kpi, i) => {
          const isPositive = kpi.invert ? kpi.trend <= 0 : kpi.trend >= 0;
          return (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-box-base p-6 rounded-2xl shadow-sm border border-line-in-white"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${kpi.bg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-bold ${isPositive ? "text-success" : "text-danger"}`}>
                  {kpi.trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {Math.abs(kpi.trend).toFixed(1)}%
                </span>
              </div>
              <p className="text-text-complement text-sm font-medium">{kpi.title}</p>
              <h3 className="text-2xl font-bold font-archivo text-text-title mt-1 tabular-nums">{kpi.value}</h3>
            </motion.div>
          );
        })}
      </div>

      {/* Gráfico principal + breakdown de custos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-box-base rounded-2xl shadow-sm border border-line-in-white p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-line-in-white flex-wrap gap-2">
            <h2 className="text-xl font-bold font-archivo text-text-title">Faturamento x Custo (acumulado do dia)</h2>
            {latest && (
              <div className="text-right">
                <p className="text-xs text-text-complement">Margem atual</p>
                <p className={`text-lg font-bold font-archivo ${marginPct >= 0 ? "text-success" : "text-danger"}`}>
                  {currency.format(margin)} <span className="text-sm">({marginPct.toFixed(1)}%)</span>
                </p>
              </div>
            )}
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#04D361" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#04D361" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E33D3D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E33D3D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E6E6F0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#9C98A6" }} minTickGap={30} />
                <YAxis tick={{ fontSize: 11, fill: "#9C98A6" }} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  formatter={(value: number) => currency.format(value)}
                  contentStyle={{ borderRadius: 12, border: "1px solid #E6E6F0", fontFamily: "Poppins, sans-serif", fontSize: 13 }}
                />
                <Area type="monotone" dataKey="Faturamento" stroke="#04D361" strokeWidth={2} fill="url(#colorRevenue)" isAnimationActive={false} />
                <Area type="monotone" dataKey="Custo" stroke="#E33D3D" strokeWidth={2} fill="url(#colorCost)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-box-base rounded-2xl shadow-sm border border-line-in-white p-6 md:p-8">
          <h2 className="text-xl font-bold font-archivo text-text-title mb-6 pb-4 border-b border-line-in-white">
            Composição de Custos
          </h2>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {costBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {costBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-text-base">{item.name}</span>
                </div>
                <span className="font-bold text-text-title">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Faturamento por disciplina */}
      <div className="bg-box-base rounded-2xl shadow-sm border border-line-in-white p-6 md:p-8 mb-8">
        <h2 className="text-xl font-bold font-archivo text-text-title mb-6 pb-4 border-b border-line-in-white">
          Faturamento x Custo por Disciplina
        </h2>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueByCourse} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E6E6F0" vertical={false} />
              <XAxis dataKey="course" tick={{ fontSize: 11, fill: "#9C98A6" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9C98A6" }} tickFormatter={(v) => `R$${v}`} />
              <Tooltip
                formatter={(value: number) => currency.format(value)}
                contentStyle={{ borderRadius: 12, border: "1px solid #E6E6F0", fontFamily: "Poppins, sans-serif", fontSize: 13 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="revenue" name="Faturamento" fill="#8257E5" radius={[6, 6, 0, 0]} />
              <Bar dataKey="cost" name="Custo" fill="#FFB84D" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Professores recentes + avisos */}
      <RecentPanels />
    </AppLayout>
  );
}

function RecentPanels() {
  const [recentTeachers, setRecentTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherService.getRecent(3).then(setRecentTeachers).finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-box-base rounded-2xl shadow-sm border border-line-in-white p-6 md:p-8">
        <h2 className="text-xl font-bold font-archivo text-text-title mb-6 pb-4 border-b border-line-in-white">
          Professores Recentes
        </h2>
        <div className="space-y-6">
          {loading ? (
            <p className="text-text-complement text-sm">Carregando...</p>
          ) : recentTeachers.length === 0 ? (
            <p className="text-text-complement text-sm">Nenhum professor cadastrado ainda.</p>
          ) : (
            recentTeachers.map((teacher) => (
              <div key={teacher.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar src={teacher.avatar} name={teacher.name} size="lg" />
                  <div>
                    <p className="font-bold text-text-title">{teacher.name}</p>
                    <p className="text-sm text-text-base">{teacher.subject}</p>
                  </div>
                </div>
                <span className="text-xs text-text-complement font-medium bg-background px-3 py-1 rounded-full border border-line-in-white">
                  Novo
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-box-base rounded-2xl shadow-sm border border-line-in-white p-6 md:p-8">
        <h2 className="text-xl font-bold font-archivo text-text-title mb-6 pb-4 border-b border-line-in-white">
          Avisos
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-primary-lighter/30 rounded-xl border border-primary-lighter/50">
            <h4 className="font-bold text-primary text-sm mb-1">Nova Matéria Adicionada</h4>
            <p className="text-sm text-text-base">Física Quântica agora está disponível no catálogo.</p>
          </div>
          <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/20">
            <h4 className="font-bold text-secondary text-sm mb-1">Dica da semana</h4>
            <p className="text-sm text-text-base">Complete seu perfil para atrair mais alunos para suas aulas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
