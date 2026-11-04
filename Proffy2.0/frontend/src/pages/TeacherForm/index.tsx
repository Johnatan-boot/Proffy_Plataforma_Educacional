import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { AlertCircle } from "lucide-react";
import { teacherService } from "@/features/teachers/services";
import { subjectService } from "@/features/subjects/services";
import { availabilityService } from "@/features/availability/services";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { GlobalLoader } from "@/components/ui/GlobalLoader";

export function TeacherForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [scheduleItems, setScheduleItems] = useState([
    { weekday: "", from: "", to: "" }
  ]);
  const [subjects, setSubjects] = useState<{ value: string; label: string }[]>([]);
  const [subjectsLoaded, setSubjectsLoaded] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(isEditMode);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",
    whatsapp: "",
    bio: "",
    subject: "",
    cost: ""
  });

  useEffect(() => {
    subjectService.getAll()
      .then(subjects => {
        setSubjects(subjects.map(s => ({ value: s.id, label: s.name })));
        setSubjectsLoaded(true);
      })
      .catch(() => {
        setSubjectsLoaded(true);
        setError("Não foi possível carregar as matérias. Verifique se o backend está rodando.");
      });

    if (isEditMode && id) {
      loadTeacherData(id);
    }
  }, [id, isEditMode]);

  const loadTeacherData = async (teacherId: string) => {
    try {
      const teacher = await teacherService.getById(teacherId);
      if (teacher) {
        setFormData({
          name: teacher.name,
          email: teacher.email || "",
          avatar: teacher.avatar,
          whatsapp: teacher.whatsapp,
          bio: teacher.bio,
          subject: teacher.subjectId || "",
          cost: String(teacher.cost)
        });
      }

      const availabilities = await availabilityService.getByTeacherId(teacherId);
      if (availabilities.length > 0) {
        setScheduleItems(
          availabilities.map(a => ({
            weekday: String(a.weekDay),
            from: a.from,
            to: a.to,
          }))
        );
      }
    } catch (err) {
      setError("Erro ao carregar os dados do professor.");
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  function addNewScheduleItem() {
    setScheduleItems([
      ...scheduleItems,
      { weekday: "", from: "", to: "" }
    ]);
  }

  function updateScheduleItemValue(position: number, field: string, value: string) {
    const updatedScheduleItems = scheduleItems.map((scheduleItem, index) => {
      if (index === position) {
        return { ...scheduleItem, [field]: value };
      }
      return scheduleItem;
    });
    setScheduleItems(updatedScheduleItems);
  }

  const handleSaveClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const { schedule: _schedule, ...rest } = { ...formData, cost: Number(formData.cost), schedule: scheduleItems };
    void _schedule;
    const payload = rest;

    try {
      let teacherId = id;

      if (isEditMode && id) {
        await teacherService.update(id, payload);
      } else {
        const created = await teacherService.create(payload);
        teacherId = created.id;
      }

      if (teacherId) {
        await availabilityService.replaceAll(teacherId, scheduleItems);
      }

      setSuccess(true);
      
      setTimeout(() => {
        if (isEditMode) navigate('/teachers');
        else navigate('/study');
      }, 1000);
      
    } catch (err: any) {
      setError(err.message || "Erro inesperado ao salvar cadastro.");
    } finally {
      setLoading(false);
    }
  };

  if (isPageLoading) {
    return <GlobalLoader isLoading={true} message="Carregando dados..." />;
  }

  return (
    <AnimatedPage className="min-h-screen w-full bg-background flex flex-col items-center">
      <PageHeader 
        title={isEditMode ? "Atualize seus dados de professor" : "Que incrível que você quer dar aulas"}
        description={isEditMode ? "Preencha o formulário para atualizar seu perfil." : "O primeiro passo, é preencher esse formulário de inscrição"}
      />
      
      <main className="bg-box-base w-[90%] max-w-3xl rounded-xl mx-auto -mt-8 md:-mt-12 pt-10 md:pt-16 mb-12 shadow-sm border border-line-in-white">
        <form id="create-class" onSubmit={handleSaveClass}>
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
              <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg flex items-center gap-3">
                <span className="text-sm font-bold">Cadastro {isEditMode ? "atualizado" : "salvo"} com sucesso!</span>
              </div>
            </div>
          )}

          <fieldset className="border-0 px-6 md:px-16">
            <legend className="font-bold text-2xl font-archivo text-text-title mb-6 pb-4 border-b border-line-in-white w-full flex items-center justify-between">
              Seus dados
            </legend>

            <Input 
              name="name"
              label="Nome completo" 
              required
              value={formData.name}
              onChange={handleInputChange}
            />

            <div className="mt-6">
              <Input 
                name="email"
                label="E-mail"
                type="email"
                required
                disabled={isEditMode}
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="mt-6">
              <Input 
                name="avatar"
                label={<>Link da sua foto <small className="text-sm font-normal text-text-complement">(comece com https://)</small></>} 
                type="url"
                required
                value={formData.avatar}
                onChange={handleInputChange}
              />
            </div>

            <div className="mt-6">
              <Input 
                name="whatsapp"
                label={<>WhatsApp <small className="text-sm font-normal text-text-complement">(somente números)</small></>} 
                type="number"
                required
                value={formData.whatsapp}
                onChange={handleInputChange}
              />
            </div>

            <Textarea 
              name="bio"
              label="Biografia (mínimo de 10 caracteres)"
              required
              minLength={10}
              value={formData.bio}
              onChange={handleInputChange}
            />
          </fieldset>

          <fieldset className="border-0 px-6 md:px-16 mt-16">
            <legend className="font-bold text-2xl font-archivo text-text-title mb-6 pb-4 border-b border-line-in-white w-full flex items-center justify-between">
              Sobre a aula
            </legend>
            
            <Select 
              name="subject"
              label="Matéria"
              required
              value={formData.subject}
              onChange={handleInputChange}
              options={subjects}
            />
            {subjectsLoaded && subjects.length === 0 && (
              <p className="text-xs text-danger mt-2">
                Nenhuma matéria cadastrada ainda. Cadastre em <a href="/subjects" className="underline font-bold">Disciplinas</a> (ou rode <code>npm run db:seed</code> no backend).
              </p>
            )}

            <div className="mt-6">
              <Input 
                name="cost"
                label={<>Custo da sua hora/aula <small className="text-sm font-normal text-text-complement">(R$)</small></>} 
                type="number"
                required
                value={formData.cost}
                onChange={handleInputChange}
              />
            </div>
          </fieldset>

          <fieldset className="border-0 px-6 md:px-16 mt-12 md:mt-16">
            <legend className="font-bold text-xl md:text-2xl font-archivo text-text-title mb-6 pb-4 border-b border-line-in-white w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              Horários disponíveis
              <button 
                type="button" 
                onClick={addNewScheduleItem}
                className="bg-transparent border-0 text-primary font-bold text-sm md:text-base font-archivo cursor-pointer hover:text-primary-dark hover:-translate-y-1 transition-all flex items-center justify-center"
              >
                + Novo Horário
              </button>
            </legend>

            {scheduleItems.map((scheduleItem, index) => (
              <div key={index} className="schedule-item grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-4 md:gap-6 border-b border-line-in-white pb-6 mb-6 md:border-b-0 md:pb-0 md:mb-4">
                <Select 
                  name="weekday[]"
                  label="Dia da semana"
                  required
                  value={scheduleItem.weekday}
                  onChange={(e) => updateScheduleItemValue(index, "weekday", e.target.value)}
                  options={[
                    { value: "0", label: "Domingo" },
                    { value: "1", label: "Segunda-feira" },
                    { value: "2", label: "Terça-feira" },
                    { value: "3", label: "Quarta-feira" },
                    { value: "4", label: "Quinta-feira" },
                    { value: "5", label: "Sexta-feira" },
                    { value: "6", label: "Sábado" },
                  ]}
                />

                <div className="mt-6 md:mt-0">
                  <Input 
                    type="time" 
                    name="time_from[]"
                    label="Das"
                    required
                    value={scheduleItem.from}
                    onChange={(e) => updateScheduleItemValue(index, "from", e.target.value)}
                  />
                </div>

                <div className="mt-6 md:mt-0">
                  <Input 
                    type="time" 
                    name="time_to[]"
                    label="Até"
                    required
                    value={scheduleItem.to}
                    onChange={(e) => updateScheduleItemValue(index, "to", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </fieldset>
        </form>

        <footer className="px-6 py-8 md:p-10 lg:px-16 bg-box-footer border-t border-line-in-white mt-12 md:mt-16 flex flex-col md:flex-row md:items-center md:justify-between rounded-b-xl gap-6">
          <p className="flex items-center justify-center md:justify-start text-sm leading-relaxed text-text-complement">
            <img 
              src="/assets/icons/warning.svg" 
              alt="Aviso importante" 
              className="mr-4"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <AlertCircle className="hidden mr-5 text-primary w-8 h-8" />
            <span>
              Importante!<br/>
              Preencha todos os dados
            </span>
          </p>
          <Button 
            type="submit" 
            form="create-class"
            variant="secondary"
            loading={loading}
            className="w-full md:w-[200px] h-[56px] text-[16px] font-archivo font-bold mt-8 md:mt-0"
          >
            {isEditMode ? "Atualizar" : "Salvar cadastro"}
          </Button>
        </footer>
      </main>
    </AnimatedPage>
  );
}
