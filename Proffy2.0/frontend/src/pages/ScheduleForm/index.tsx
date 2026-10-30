import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { AlertCircle, Info } from "lucide-react";
import { teacherService } from "@/features/teachers/services";
import { studentService } from "@/features/students/services";
import { subjectService } from "@/features/subjects/services";
import { scheduleService } from "@/features/schedules/services";
import { Teacher } from "@/features/teachers/types";
import { Student } from "@/features/students/types";
import { Subject } from "@/features/subjects/types";
import { WEEKDAYS } from "@/features/schedules/types";

const DURATIONS = [
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "1 hora" },
  { value: "90", label: "1 hora e 30 min" },
  { value: "120", label: "2 horas" },
];

export function ScheduleForm() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    teacherId: "",
    studentId: "",
    subjectId: "",
    startsAt: "",
    duration: "60",
    room: "",
    className: "",
  });

  useEffect(() => {
    Promise.all([teacherService.search({}), studentService.getAll(), subjectService.getAll()])
      .then(([t, st, su]) => {
        setTeachers(t);
        setStudents(st);
        setSubjects(su);
      })
      .catch(() => setError("Erro ao carregar professores, alunos e disciplinas."))
      .finally(() => setPageLoading(false));
  }, []);

  const selectedTeacher = useMemo(
    () => teachers.find(t => t.id === form.teacherId),
    [teachers, form.teacherId]
  );

  // Disciplinas que o professor leciona; se ele não tem nenhuma vinculada,
  // libera todas para não travar o agendamento.
  const subjectOptions = useMemo(() => {
    const taught = selectedTeacher?.subjects ?? [];
    const list = taught.length > 0 ? taught : subjects;
    return list.map(s => ({ value: s.id, label: s.name }));
  }, [selectedTeacher, subjects]);

  const availabilityWarning = useMemo(() => {
    if (!selectedTeacher || !form.startsAt) return "";
    const slots = selectedTeacher.availabilities ?? [];
    if (slots.length === 0) return "Este professor ainda não cadastrou horários disponíveis.";

    const start = new Date(form.startsAt);
    const hhmm = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
    const fits = slots.some(a => a.weekDay === start.getDay() && a.from <= hhmm && hhmm < a.to);

    return fits ? "" : "Atenção: este horário está fora da disponibilidade cadastrada do professor.";
  }, [selectedTeacher, form.startsAt]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === "teacherId") next.subjectId = "";
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await scheduleService.create({
        teacherId: form.teacherId,
        studentId: form.studentId,
        subjectId: form.subjectId,
        scheduledAt: new Date(form.startsAt).toISOString(),
        duration: Number(form.duration),
        room: form.room.trim(),
        className: form.className.trim(),
      });
      setSuccess(true);
      setTimeout(() => navigate("/schedules"), 900);
    } catch (err: any) {
      setError(err.message || "Erro inesperado ao agendar a aula.");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) return <GlobalLoader isLoading={true} message="Carregando dados..." />;

  return (
    <AnimatedPage className="min-h-screen w-full bg-background flex flex-col items-center">
      <PageHeader
        title="Agendar nova aula"
        description="Escolha professor, aluno, disciplina e horário. Conflitos de agenda são verificados automaticamente."
      />

      <main className="bg-box-base w-[90%] max-w-2xl rounded-xl mx-auto -mt-8 md:-mt-12 pt-10 md:pt-12 mb-12 shadow-sm border border-line-in-white">
        <form id="schedule-form" onSubmit={handleSubmit}>
          {error && (
            <div className="px-6 md:px-16 mb-6">
              <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="px-6 md:px-16 mb-6">
              <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg">
                <span className="text-sm font-bold">Aula agendada com sucesso!</span>
              </div>
            </div>
          )}

          <fieldset className="border-0 px-6 md:px-16 pb-10 md:pb-16">
            <legend className="font-bold text-2xl font-archivo text-text-title mb-6 pb-4 border-b border-line-in-white w-full">
              Dados da aula
            </legend>

            <Select name="teacherId" label="Professor" required value={form.teacherId} onChange={handleChange}
              options={teachers.map(t => ({ value: t.id, label: t.name }))} />

            {selectedTeacher && (selectedTeacher.availabilities?.length ?? 0) > 0 && (
              <p className="text-xs text-text-complement mt-3">
                Disponível: {selectedTeacher.availabilities!.map(a => `${WEEKDAYS[a.weekDay]} ${a.from}–${a.to}`).join(" · ")}
              </p>
            )}

            <div className="mt-6">
              <Select name="subjectId" label="Disciplina" required value={form.subjectId} onChange={handleChange}
                options={subjectOptions} disabled={!form.teacherId} />
            </div>

            <div className="mt-6">
              <Select name="studentId" label="Aluno" required value={form.studentId} onChange={handleChange}
                options={students.map(s => ({ value: s.id, label: s.name }))} />
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input name="startsAt" type="datetime-local" label="Data e hora" required value={form.startsAt} onChange={handleChange} />
              <Select name="duration" label="Duração" required value={form.duration} onChange={handleChange} options={DURATIONS} />
            </div>

            {availabilityWarning && (
              <div className="mt-4 flex items-start gap-2 text-xs text-warning bg-warning/10 border border-warning/20 rounded-lg p-3">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{availabilityWarning}</span>
              </div>
            )}

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input name="room" label={<>Sala <small className="text-text-complement">(opcional)</small></>} value={form.room} onChange={handleChange} />
              <Input name="className" label={<>Turma <small className="text-text-complement">(opcional)</small></>} value={form.className} onChange={handleChange} />
            </div>
          </fieldset>
        </form>

        <footer className="px-6 py-8 md:px-16 bg-box-footer border-t border-line-in-white flex flex-col md:flex-row md:items-center md:justify-between rounded-b-xl gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate("/schedules")} className="border border-line-in-white w-full md:w-auto">
            Cancelar
          </Button>
          <Button type="submit" form="schedule-form" variant="secondary" loading={loading}
            className="w-full md:w-[200px] h-[56px] text-[16px] font-archivo font-bold">
            Agendar aula
          </Button>
        </footer>
      </main>
    </AnimatedPage>
  );
}
