import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { teacherService } from "@/features/teachers/services";
import { Teacher } from "@/features/teachers/types";
import { Users, Phone, Book, Plus, Edit2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { GlobalLoader } from "@/components/ui/GlobalLoader";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { AnimatePresence, motion } from "motion/react";

export function AdminTeachers() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for deleting
  const [isDeleting, setIsDeleting] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
  
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const loadTeachers = async () => {
    try {
      const allTeachers = await teacherService.search({ subject: "", time: "", weekday: "" });
      setTeachers(allTeachers);
    } catch (error) {
      console.error("Erro ao carregar professores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const confirmDelete = (id: string) => {
    setTeacherToDelete(id);
  };

  const handleDelete = async () => {
    if (!teacherToDelete) return;
    
    setIsDeleting(true);
    try {
      await teacherService.delete(teacherToDelete);
      await loadTeachers();
      showNotification('success', 'Professor excluído com sucesso.');
    } catch (err) {
      showNotification('error', 'Erro ao tentar excluir professor.');
    } finally {
      setIsDeleting(false);
      setTeacherToDelete(null);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/teachers/${id}/edit`);
  };

  return (
    <AppLayout>
      <GlobalLoader isLoading={loading} message="Carregando professores..." />
      
      <ConfirmModal 
        isOpen={!!teacherToDelete}
        title="Excluir professor"
        description="Tem certeza que deseja excluir este professor? Esta ação não poderá ser desfeita e todos os dados vinculados a ele serão perdidos."
        confirmText="Excluir professor"
        onConfirm={handleDelete}
        onCancel={() => setTeacherToDelete(null)}
        isLoading={isDeleting}
      />
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border ${
              notification.type === 'success' 
                ? 'bg-success/10 border-success/20 text-success' 
                : 'bg-danger/10 border-danger/20 text-danger'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-archivo text-text-title">Professores</h1>
          <p className="text-text-base mt-1">Gerenciamento de docentes da plataforma</p>
        </div>
        <Button onClick={() => navigate('/give-classes')} className="flex items-center gap-2 w-full md:w-auto">
          <Plus className="w-5 h-5" />
          Adicionar Professor
        </Button>
      </div>

      <div className="bg-box-base rounded-2xl shadow-sm border border-line-in-white overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-complement">Carregando lista de professores...</div>
        ) : teachers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Users className="w-12 h-12 text-line-in-white mb-4" />
            <p className="text-text-complement">Nenhum professor cadastrado ainda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line-in-white bg-background">
                  <th className="p-4 font-semibold text-text-base text-sm uppercase tracking-wider">Professor</th>
                  <th className="p-4 font-semibold text-text-base text-sm uppercase tracking-wider">Disciplina</th>
                  <th className="p-4 font-semibold text-text-base text-sm uppercase tracking-wider">Contato</th>
                  <th className="p-4 font-semibold text-text-base text-sm uppercase tracking-wider">Preço/h</th>
                  <th className="p-4 font-semibold text-text-base text-sm uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-in-white">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-background/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-lighter border border-line-in-white overflow-hidden shrink-0">
                          {teacher.avatar ? (
                            <img src={teacher.avatar} alt={teacher.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-primary">
                              {teacher.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-text-title text-sm">{teacher.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Book className="w-4 h-4 text-text-complement" />
                        <span className="text-sm text-text-base">{teacher.subject}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-text-complement" />
                        <span className="text-sm text-text-base">{teacher.whatsapp}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-primary">R$ {teacher.cost},00</span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(teacher.id)}
                          className="p-2 text-text-base hover:bg-background hover:text-primary rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                          title="Editar professor"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(teacher.id)}
                          className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                          title="Excluir professor"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
