import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { timesheetService } from "@/features/timesheet/services";
import { TimeEntry, MonthlySummary, AttendanceStatus } from "@/features/timesheet/types";
import { Clock, LogIn, LogOut, CheckCircle2, AlertCircle, XCircle, Timer, Users } from "lucide-react";
import { motion } from "motion/react";

const STATUS_CONFIG: Record<AttendanceStatus, { label: string; variant: any; icon: any }> = {
  presente: { label: "Presente", variant: "success", icon: CheckCircle2 },
  em_andamento: { label: "Em andamento", variant: "info", icon: Timer },
  atrasado: { label: "Atrasado", variant: "warning", icon: AlertCircle },
  ausente: { label: "Ausente", variant: "danger", icon: XCircle },
  concluido: { label: "Concluído", variant: "default", icon: CheckCircle2 },
};

export function AdminTimesheet() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [summary, setSummary] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([timesheetService.getToday(), timesheetService.getMonthlySummary()])
      .then(([todayEntries, monthlySummary]) => {
        setEntries(todayEntries);
        setSummary(monthlySummary);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const presentes = entries.filter(e => e.status === "presente" || e.status === "em_andamento" || e.status === "concluido").length;
    const atrasados = entries.filter(e => e.status === "atrasado").length;
    const ausentes = entries.filter(e => e.status === "ausente").length;
    const horasHoje = entries.reduce((sum, e) => sum + timesheetService.computeWorkedHours(e), 0);
    return { presentes, atrasados, ausentes, horasHoje };
  }, [entries]);

  const handleClockIn = async (id: string) => {
    setActionLoadingId(id);
    try {
      const updated = await timesheetService.clockIn(id);
      setEntries(prev => prev.map(e => e.id === id ? updated : e));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleClockOut = async (id: string) => {
    setActionLoadingId(id);
    try {
      const updated = await timesheetService.clockOut(id);
      setEntries(prev => prev.map(e => e.id === id ? updated : e));
    } finally {
      setActionLoadingId(null);
    }
  };

  const statCards = [
    { title: "Presentes hoje", value: stats.presentes, icon: Users, color: "text-success", bg: "bg-success/10" },
    { title: "Atrasos", value: stats.atrasados, icon: AlertCircle, color: "text-warning", bg: "bg-warning/10" },
    { title: "Ausências", value: stats.ausentes, icon: XCircle, color: "text-danger", bg: "bg-danger/10" },
    { title: "Horas registradas hoje", value: `${stats.horasHoje.toFixed(1)}h`, icon: Clock, color: "text-primary", bg: "bg-primary-lighter/20" },
  ];

  return (
    <AppLayout>
      <GlobalLoader isLoading={loading} message="Carregando ponto eletrônico..." />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-archivo text-text-title">Ponto Eletrônico</h1>
          <p className="text-text-base mt-1">Gestão de entrada, saída e frequência dos professores</p>
        </div>
        <div className="flex items-center gap-3 bg-box-base border border-line-in-white rounded-xl px-5 py-3 shrink-0">
          <Clock className="w-5 h-5 text-primary" />
          <div>
            <p className="text-lg font-bold font-archivo text-text-title leading-none tabular-nums">
              {now.toLocaleTimeString('pt-BR')}
            </p>
            <p className="text-xs text-text-complement mt-1">
              {now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}
            </p>
          </div>
        </div>
      </div>

      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-box-base p-6 rounded-2xl shadow-sm border border-line-in-white flex items-center gap-4"
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

          {/* Registros de hoje */}
          <div className="bg-box-base rounded-2xl shadow-sm border border-line-in-white overflow-hidden mb-8">
            <div className="p-6 border-b border-line-in-white">
              <h2 className="text-lg font-bold font-archivo text-text-title">Registros de hoje</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line-in-white bg-background">
                    <th className="p-4 font-semibold text-text-base text-sm uppercase tracking-wider">Professor</th>
                    <th className="p-4 font-semibold text-text-base text-sm uppercase tracking-wider">Disciplina</th>
                    <th className="p-4 font-semibold text-text-base text-sm uppercase tracking-wider">Entrada</th>
                    <th className="p-4 font-semibold text-text-base text-sm uppercase tracking-wider">Saída</th>
                    <th className="p-4 font-semibold text-text-base text-sm uppercase tracking-wider">Status</th>
                    <th className="p-4 font-semibold text-text-base text-sm uppercase tracking-wider text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-in-white">
                  {entries.map((entry) => {
                    const config = STATUS_CONFIG[entry.status];
                    const StatusIcon = config.icon;
                    return (
                      <tr key={entry.id} className="hover:bg-background/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar src={entry.teacherAvatar} name={entry.teacherName} size="sm" />
                            <p className="font-bold text-text-title text-sm">{entry.teacherName}</p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-text-base">{entry.subject}</td>
                        <td className="p-4 text-sm text-text-base tabular-nums">
                          {entry.clockIn || "—"}
                          <span className="text-xs text-text-complement ml-1">(prev. {entry.expectedIn})</span>
                        </td>
                        <td className="p-4 text-sm text-text-base tabular-nums">
                          {entry.clockOut || "—"}
                          <span className="text-xs text-text-complement ml-1">(prev. {entry.expectedOut})</span>
                        </td>
                        <td className="p-4">
                          <Badge variant={config.variant} className="gap-1">
                            <StatusIcon className="w-3.5 h-3.5" />
                            {config.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!entry.clockIn && (
                              <Button
                                variant="secondary"
                                loading={actionLoadingId === entry.id}
                                onClick={() => handleClockIn(entry.id)}
                                className="h-9 px-3 text-xs gap-1.5"
                              >
                                <LogIn className="w-3.5 h-3.5" /> Entrada
                              </Button>
                            )}
                            {entry.clockIn && !entry.clockOut && (
                              <Button
                                variant="ghost"
                                loading={actionLoadingId === entry.id}
                                onClick={() => handleClockOut(entry.id)}
                                className="h-9 px-3 text-xs gap-1.5 border border-line-in-white"
                              >
                                <LogOut className="w-3.5 h-3.5" /> Saída
                              </Button>
                            )}
                            {entry.clockIn && entry.clockOut && (
                              <span className="text-xs text-text-complement font-medium">
                                {timesheetService.computeWorkedHours(entry).toFixed(1)}h trabalhadas
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Resumo mensal */}
          <div className="bg-box-base rounded-2xl shadow-sm border border-line-in-white overflow-hidden">
            <div className="p-6 border-b border-line-in-white">
              <h2 className="text-lg font-bold font-archivo text-text-title">Resumo mensal de frequência</h2>
              <p className="text-sm text-text-complement mt-1">Horas trabalhadas x horas previstas no mês corrente</p>
            </div>
            <div className="p-6 space-y-5">
              {summary.map((s) => {
                const pct = Math.min(100, Math.round((s.hoursWorked / s.hoursExpected) * 100));
                return (
                  <div key={s.teacherId} className="flex items-center gap-4">
                    <Avatar src={s.teacherAvatar} name={s.teacherName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5 gap-2 flex-wrap">
                        <p className="font-bold text-text-title text-sm truncate">{s.teacherName}</p>
                        <span className="text-xs text-text-complement whitespace-nowrap">
                          {s.hoursWorked}h / {s.hoursExpected}h
                          {s.absences > 0 && <span className="text-danger ml-2">• {s.absences} falta(s)</span>}
                          {s.lateArrivals > 0 && <span className="text-warning ml-2">• {s.lateArrivals} atraso(s)</span>}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          className={`h-full rounded-full ${pct >= 90 ? "bg-success" : pct >= 70 ? "bg-warning" : "bg-danger"}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </AppLayout>
  );
}
