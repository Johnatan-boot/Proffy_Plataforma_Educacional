import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { subjectService } from "@/features/subjects/services";
import { teacherService } from "@/features/teachers/services";
import { Teacher } from "@/features/teachers/types";
import { WEEKDAYS } from "@/features/schedules/types";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { GlobalLoader } from "@/components/ui/GlobalLoader";

export function TeacherList() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Carrega as matérias reais da API e já lista TODOS os professores
  // cadastrados ao abrir a página (os filtros apenas refinam a lista).
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      try {
        const [subjectList, teacherList] = await Promise.all([
          subjectService.getAll(),
          teacherService.search({}),
        ]);
        setSubjects(subjectList.map(s => ({ value: s.id, label: s.name })));
        setTeachers(teacherList);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar os professores.");
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSearched(true);
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const subject = formData.get("subject") as string;
    const weekday = formData.get("weekday") as string;
    const time = formData.get("time") as string;

    try {
      const response = await teacherService.search({ subject, weekday, time });
      setTeachers(response);
    } catch (err: any) {
      setError(err.message || "Erro inesperado na busca.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage className="min-h-screen w-full bg-background flex flex-col items-center">
      <GlobalLoader isLoading={loading} message="Buscando professores..." />
      <PageHeader title="Esses são os proffys disponíveis.">
        <form id="search-teachers" onSubmit={handleSearch} className="mt-8 md:-mb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end relative z-10">
          <Select 
            name="subject"
            label="Matéria"
            labelClassName="text-text-in-primary"
            defaultValue=""
            options={subjects}
          />
          <div className="mt-[1.4rem] md:mt-0">
            <Select 
              name="weekday"
              label="Dia da semana"
              labelClassName="text-text-in-primary"
              defaultValue=""
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
          </div>
          <div className="mt-[1.4rem] md:mt-0">
            <Input 
              type="time" 
              name="time"
              label="Hora" 
              labelClassName="text-text-in-primary"
            />
          </div>
          <div className="flex items-end">
            <Button 
              type="submit" 
              variant="secondary"
              loading={loading}
              className="w-full h-[56px] mt-2 rounded-lg text-base font-archivo"
            >
              Buscar
            </Button>
          </div>
        </form>
      </PageHeader>
      
      <main className="w-[90%] max-w-3xl mx-auto mt-8 md:mt-16 pb-12">
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {teachers.length === 0 && !loading && !error && (
          <div className="text-center py-12 text-text-complement">
            <p>{hasSearched ? "Nenhum professor encontrado com esses filtros." : "Nenhum professor cadastrado ainda."}</p>
          </div>
        )}

        {teachers.map((teacher) => (
          <article key={teacher.id} className="bg-box-base border border-line-in-white rounded-xl mt-6 overflow-hidden animate-fade-in-up">
            <header className="p-6 md:p-8 flex items-center">
              <img 
                src={teacher.avatar} 
                alt={teacher.name} 
                className="w-20 h-20 rounded-full object-cover" 
              />
              <div className="ml-6">
                <strong className="font-archivo font-bold text-2xl block text-text-title">{teacher.name}</strong>
                <span className="text-base block mt-1 text-text-base">{teacher.subject}</span>
              </div>
            </header>
            
            <p className="px-6 md:px-8 pb-8 text-base md:text-lg leading-relaxed text-text-base whitespace-pre-wrap">
              {teacher.bio}
            </p>
            
            {teacher.availabilities && teacher.availabilities.length > 0 && (
              <div className="px-6 md:px-8 pb-6">
                <p className="text-sm font-semibold text-text-complement mb-3">Horários disponíveis</p>
                <div className="flex flex-wrap gap-2">
                  {teacher.availabilities.map(a => (
                    <span key={a.id} className="text-xs md:text-sm bg-background border border-line-in-white rounded-lg px-3 py-1.5 text-text-base">
                      <strong className="text-text-title">{WEEKDAYS[a.weekDay]}</strong> · {a.from} – {a.to}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <footer className="p-6 md:p-8 bg-box-footer border-t border-line-in-white flex flex-col sm:flex-row items-center justify-between gap-6 mt-4">
              <p className="text-sm md:text-base text-text-complement flex items-center justify-center sm:justify-start w-full sm:w-auto">
                Preço/hora 
                <strong className="text-primary text-xl md:text-2xl font-bold ml-4">R$ {teacher.cost},00</strong>
              </p>
              <a 
                href={`https://wa.me/${teacher.whatsapp}`} 
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-8 h-14 bg-secondary text-button-text border-0 rounded-lg cursor-pointer font-bold text-base font-archivo flex items-center justify-center text-decoration-none hover:bg-secondary-dark transition-colors"
              >
                <img 
                  src="/assets/icons/whatsapp.svg" 
                  alt="Whatsapp" 
                  className="mr-4" 
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                Entrar em contato
              </a>
            </footer>
          </article>
        ))}
      </main>
    </AnimatedPage>
  );
}
