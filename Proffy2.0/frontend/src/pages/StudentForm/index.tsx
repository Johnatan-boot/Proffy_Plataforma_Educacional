import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { AlertCircle } from "lucide-react";
import { studentService } from "@/features/students/services";
import { AnimatedPage } from "@/components/layout/AnimatedPage";
import { GlobalLoader } from "@/components/ui/GlobalLoader";

export function StudentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(isEditMode);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",
    whatsapp: "",
  });

  useEffect(() => {
    if (isEditMode && id) {
      loadStudentData(id);
    }
  }, [id, isEditMode]);

  const loadStudentData = async (studentId: string) => {
    try {
      const student = await studentService.getById(studentId);
      if (student) {
        setFormData({
          name: student.name,
          email: student.email,
          avatar: student.avatar || "",
          whatsapp: student.whatsapp,
        });
      } else {
        setError("Aluno não encontrado.");
      }
    } catch (err) {
      setError("Erro ao carregar os dados do aluno.");
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      if (isEditMode && id) {
        await studentService.update(id, formData);
      } else {
        await studentService.create(formData);
      }
      setSuccess(true);
      setTimeout(() => navigate('/students'), 900);
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
        title={isEditMode ? "Atualizar dados do aluno" : "Cadastrar novo aluno"}
        description={isEditMode ? "Altere as informações do estudante abaixo." : "Preencha o formulário para adicionar um novo aluno à plataforma."}
      />

      <main className="bg-box-base w-[90%] max-w-2xl rounded-xl mx-auto -mt-8 md:-mt-12 pt-10 md:pt-12 mb-12 shadow-sm border border-line-in-white">
        <form id="student-form" onSubmit={handleSubmit}>
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
                <span className="text-sm font-bold">Aluno {isEditMode ? "atualizado" : "cadastrado"} com sucesso!</span>
              </div>
            </div>
          )}

          <fieldset className="border-0 px-6 md:px-16 pb-10 md:pb-16">
            <legend className="font-bold text-2xl font-archivo text-text-title mb-6 pb-4 border-b border-line-in-white w-full">
              Dados do aluno
            </legend>

            <div className="flex justify-center mb-6">
              <Avatar src={formData.avatar} name={formData.name || "Aluno"} size="xl" />
            </div>

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
                type="email"
                label="E-mail"
                required
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="mt-6">
              <Input
                name="avatar"
                label={<>Link da foto <small className="text-sm font-normal text-text-complement">(opcional, comece com https://)</small></>}
                type="url"
                value={formData.avatar}
                onChange={handleInputChange}
              />
            </div>

            <div className="mt-6">
              <Input
                name="whatsapp"
                label={<>WhatsApp <small className="text-sm font-normal text-text-complement">(somente números)</small></>}
                type="tel"
                required
                value={formData.whatsapp}
                onChange={handleInputChange}
              />
            </div>
          </fieldset>
        </form>

        <footer className="px-6 py-8 md:px-16 bg-box-footer border-t border-line-in-white flex flex-col md:flex-row md:items-center md:justify-between rounded-b-xl gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/students')}
            className="border border-line-in-white w-full md:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="student-form"
            variant="secondary"
            loading={loading}
            className="w-full md:w-[200px] h-[56px] text-[16px] font-archivo font-bold"
          >
            {isEditMode ? "Atualizar" : "Salvar aluno"}
          </Button>
        </footer>
      </main>
    </AnimatedPage>
  );
}
