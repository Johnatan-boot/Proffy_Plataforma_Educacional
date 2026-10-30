import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar } from "@/components/ui/Avatar";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { scheduleService } from "@/features/schedules/services";
import { ScheduleEntry, ScheduleStatus, STATUS_LABELS, WEEKDAYS, WEEKDAYS_SHORT } from "@/features/schedules/types";
import { Calendar, MapPin, Plus, CheckCircle2, XCircle, Trash2, Check, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { motion } from "motion/react";

// Segunda (1) a Sábado (6) — dias letivos da escola
const VISIBLE_WEEKDAYS = [1, 2, 3, 4, 5, 6];

export function AdminSchedules() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState<number>(() => {
    const today = new Date().getDay();
    return VISIBLE_WEEKDAYS.includes(today) ? today : 1;
  });

  const navigate = useNavigate();
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ScheduleEntry | null>(null);

  const reload = () =>
    scheduleService.getAll()
      .then(setSchedule)
      .catch(() => setActionError("Erro ao carregar a grade de horários."))
      .finally(() => setLoading(false));

  useEffect(() => {
    reload();
  }, []);

  const changeStatus = async (entry: ScheduleEntry, status: ScheduleStatus) => {
    setBusyId(entry.id);
    setActionError("");
    try {
      await scheduleService.updateStatus(entry.id, status);
      await reload();
    } catch (err: any) {
      setActionError(err.message || "Não foi possível atualizar a aula.");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusyId(toDelete.id);
    try {
      await scheduleService.delete(toDelete.id);
      setToDelete(null);
      await reload();
    } catch (err: any) {
      setActionError(err.message || "Não foi possível excluir a aula.");
    } finally {
      setBusyId(null);
    }
  };

  // Aulas canceladas saem da grade (continuam na lista de aulas agendadas).
  const visible = useMemo(() => schedule.filter(s => s.status !== "CANCELLED"), [schedule]);
  const lessons = useMemo(
    () => schedule
      .filter(s => s.source === "aula")
      .sort((a, b) => (b.scheduledAt ?? "").localeCompare(a.scheduledAt ?? "")),
    [schedule]
  );

  const timeSlots = useMemo(
    () => Array.from(new Set(visible.map(s => s.from))).sort(),
    [visible]
  );

  const grid = useMemo(() => {
    const map = new Map<string, ScheduleEntry[]>();
    visible.forEach(entry => {
      const key = `${entry.weekday}-${entry.from}`;
      map.set(key, [...(map.get(key) ?? []), entry]);
    });
    return map;
  }, [visible]);

  const subjectsLegend = useMemo(() => {
    const seen = new Map<string, string>();
    visible.forEach(s => seen.set(s.subject, s.subjectColor));
    return Array.from(seen.entries());
  }, [visible]);

  const dayEntries = useMemo(
    () => visible.filter(s => s.weekday === activeDay).sort((a, b) => a.from.localeCompare(b.from)),
    [visible, activeDay]
  );

  return (
    <AppLayout>
      <GlobalLoader isLoading={loading} message="Carregando grade de horários..." />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-archivo text-text-title">Horários</h1>
          <p className="text-text-base mt-1">Cronograma semanal de disciplinas e professores</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-box-base border border-line-in-white rounded-xl px-4 py-2 shrink-0">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-text-title">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
            </span>
          </div>
          <Button variant="secondary" onClick={() => navigate('/schedules/new')} className="h-11 px-5 gap-2">
            <Plus className="w-4 h-4" /> Agendar aula
          </Button>
        </div>
      </div>

      {!loading && (
        <>
          {/* Legenda de disciplinas */}
          <div className="flex flex-wrap gap-3 mb-6">
            {subjectsLegend.map(([subject, color]) => (
              <div key={subject} className="flex items-center gap-2 bg-box-base border border-line-in-white rounded-full pl-2 pr-3 py-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs font-medium text-text-base">{subject}</span>
              </div>
            ))}
          </div>

          {/* Mobile: seletor de dia + lista */}
          <div className="md:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1">
              {VISIBLE_WEEKDAYS.map(day => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold font-archivo border transition-colors cursor-pointer ${
                    activeDay === day
                      ? "bg-primary text-white border-primary"
                      : "bg-box-base text-text-base border-line-in-white"
                  }`}
                >
                  {WEEKDAYS_SHORT[day]}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {dayEntries.length === 0 ? (
                <div className="bg-box-base rounded-2xl border border-line-in-white p-8 text-center text-text-complement text-sm">
                  Nenhuma aula cadastrada para {WEEKDAYS[activeDay]}.
                </div>
              ) : (
                dayEntries.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-box-base rounded-2xl border border-line-in-white p-4 flex gap-4 shadow-sm"
                  >
                    <div className="w-1.5 rounded-full shrink-0" style={{ backgroundColor: entry.subjectColor }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-bold text-text-title">{entry.subject}</p>
                        <span className="text-xs font-semibold text-text-complement whitespace-nowrap">{entry.from} - {entry.to}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar src={entry.teacherAvatar} name={entry.teacherName} size="sm" />
                        <span className="text-sm text-text-base truncate">{entry.teacherName}</span>
                      </div>
                      {entry.room && (
                        <div className="flex items-center gap-1.5 text-xs text-text-complement">
                          <MapPin className="w-3.5 h-3.5" />
                          {entry.room}
                        </div>
                      )}
                      {entry.source === 'disponibilidade' && (
                        <span className="inline-block mt-1 text-[10px] font-semibold text-primary bg-primary-lighter/20 rounded-full px-2 py-0.5">Disponível</span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Desktop: grade semanal completa */}
          <div className="hidden md:block bg-box-base rounded-2xl shadow-sm border border-line-in-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-background border-b border-line-in-white">
                    <th className="p-3 text-left text-xs font-semibold text-text-complement uppercase tracking-wider w-24">Horário</th>
                    {VISIBLE_WEEKDAYS.map(day => (
                      <th key={day} className="p-3 text-left text-sm font-bold text-text-title font-archivo">
                        {WEEKDAYS[day]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot, rowIndex) => (
                    <tr key={slot} className="border-b border-line-in-white last:border-0">
                      <td className="p-3 align-top">
                        <span className="text-xs font-bold text-text-complement whitespace-nowrap">{slot}</span>
                      </td>
                      {VISIBLE_WEEKDAYS.map(day => {
                        const cellEntries = grid.get(`${day}-${slot}`) ?? [];
                        return (
                          <td key={day} className="p-2 align-top">
                            {cellEntries.length > 0 ? (
                              <div className="space-y-2">
                                {cellEntries.map(entry => (
                                  <motion.div
                                    key={entry.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: rowIndex * 0.03 }}
                                    className="rounded-xl border border-line-in-white p-3 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-default"
                                    style={{ backgroundColor: `${entry.subjectColor}14`, borderColor: `${entry.subjectColor}40` }}
                                  >
                                    <p className="font-bold text-text-title text-sm mb-1 truncate">{entry.subject}</p>
                                    <p className="text-[11px] text-text-complement mb-2">{entry.from} – {entry.to}</p>
                                    <div className="flex items-center gap-2 mb-1">
                                      <Avatar src={entry.teacherAvatar} name={entry.teacherName} size="sm" />
                                      <span className="text-xs text-text-base truncate">{entry.teacherName}</span>
                                    </div>
                                    {entry.room && (
                                      <div className="flex items-center gap-1 text-[11px] text-text-complement">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{entry.room}</span>
                                      </div>
                                    )}
                                    {entry.source === 'disponibilidade' && (
                                      <span className="inline-block mt-1 text-[10px] font-semibold text-primary bg-primary-lighter/20 rounded-full px-2 py-0.5">Disponível</span>
                                    )}
                                  </motion.div>
                                ))}
                              </div>
                            ) : (
                              <div className="h-full min-h-[92px] rounded-xl border border-dashed border-line-in-white/70 flex items-center justify-center">
                                <span className="text-[11px] text-text-complement/60">Livre</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {actionError && (
            <div className="mt-6 bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" /> {actionError}
            </div>
          )}

          {/* Aulas agendadas */}
          <div className="bg-box-base rounded-2xl shadow-sm border border-line-in-white overflow-hidden mt-8">
            <div className="p-6 border-b border-line-in-white">
              <h2 className="text-lg font-bold font-archivo text-text-title">Aulas agendadas</h2>
              <p className="text-sm text-text-complement mt-1">Confirme, conclua, cancele ou exclua aulas</p>
            </div>
            {lessons.length === 0 ? (
              <div className="p-10 text-center text-text-complement text-sm">
                Nenhuma aula agendada ainda. Clique em <strong>Agendar aula</strong> para criar a primeira.
              </div>
            ) : (
              <div className="divide-y divide-line-in-white">
                {lessons.map(l => {
                  const date = l.scheduledAt ? new Date(l.scheduledAt) : null;
                  const variant = l.status === "CONFIRMED" ? "info" : l.status === "COMPLETED" ? "success" : l.status === "CANCELLED" ? "danger" : "warning";
                  return (
                    <div key={l.id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="w-1.5 self-stretch rounded-full hidden md:block" style={{ backgroundColor: l.subjectColor }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-text-title">{l.subject}</p>
                          <Badge variant={variant as any}>{STATUS_LABELS[l.status ?? "PENDING"]}</Badge>
                        </div>
                        <p className="text-sm text-text-base mt-1">
                          {date?.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })} · {l.from}–{l.to}
                          {l.room && ` · ${l.room}`}{l.className && ` · ${l.className}`}
                        </p>
                        <p className="text-xs text-text-complement mt-1">
                          Prof. {l.teacherName} · Aluno: {l.studentName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {l.status === "PENDING" && (
                          <Button variant="ghost" loading={busyId === l.id} onClick={() => changeStatus(l, "CONFIRMED")} className="h-9 px-3 text-xs gap-1.5 border border-line-in-white">
                            <Check className="w-3.5 h-3.5" /> Confirmar
                          </Button>
                        )}
                        {(l.status === "PENDING" || l.status === "CONFIRMED") && (
                          <Button variant="ghost" loading={busyId === l.id} onClick={() => changeStatus(l, "COMPLETED")} className="h-9 px-3 text-xs gap-1.5 border border-line-in-white">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Concluir
                          </Button>
                        )}
                        {l.status !== "CANCELLED" && l.status !== "COMPLETED" && (
                          <Button variant="ghost" loading={busyId === l.id} onClick={() => changeStatus(l, "CANCELLED")} className="h-9 px-3 text-xs gap-1.5 border border-line-in-white">
                            <XCircle className="w-3.5 h-3.5" /> Cancelar
                          </Button>
                        )}
                        <button
                          onClick={() => setToDelete(l)}
                          className="p-2 text-text-base hover:bg-background hover:text-danger rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                          title="Excluir aula"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <ConfirmModal
            isOpen={Boolean(toDelete)}
            title="Excluir aula"
            description={`Tem certeza que deseja excluir a aula de ${toDelete?.subject ?? ""}? Esta ação não pode ser desfeita.`}
            onConfirm={confirmDelete}
            onCancel={() => setToDelete(null)}
            confirmText="Excluir"
            isLoading={busyId === toDelete?.id}
          />
        </>
      )}
    </AppLayout>
  );
}
