import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { subjectService } from "@/features/subjects/services";
import { Subject } from "@/features/subjects/types";
import { BookOpen, Trash2, Plus, AlertCircle, CheckCircle2, Pencil, X, Check } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { AnimatePresence, motion } from "motion/react";
import { GlobalLoader } from "@/components/ui/GlobalLoader";

export function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newSubject, setNewSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // States for delete action
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const loadSubjects = async () => {
    try {
      const data = await subjectService.getAll();
      setSubjects(data);
    } catch (error) {
      console.error("Erro ao carregar disciplinas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      await subjectService.create({ name: newSubject });
      setNewSubject("");
      await loadSubjects();
      showNotification('success', 'Disciplina criada com sucesso!');
    } catch (err: any) {
      setError(err.message || "Erro ao criar disciplina.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setEditingName(subject.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async () => {
    if (!editingId || !editingName.trim()) return;

    setIsSavingEdit(true);
    try {
      await subjectService.update(editingId, { name: editingName.trim() });
      await loadSubjects();
      showNotification('success', 'Disciplina atualizada com sucesso!');
      cancelEdit();
    } catch (err: any) {
      showNotification('error', err.message || 'Erro ao atualizar disciplina.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const confirmDelete = (id: string) => {
    setSubjectToDelete(id);
  };

  const handleDelete = async () => {
    if (!subjectToDelete) return;
    
    setIsDeleting(true);
    try {
      await subjectService.delete(subjectToDelete);
      await loadSubjects();
      showNotification('success', 'Disciplina excluída com sucesso.');
    } catch (err) {
      showNotification('error', 'Erro ao excluir disciplina.');
    } finally {
      setIsDeleting(false);
      setSubjectToDelete(null);
    }
  };

  return (
    <AppLayout>
      <GlobalLoader isLoading={loading} message="Carregando disciplinas..." />
      
      <ConfirmModal 
        isOpen={!!subjectToDelete}
        title="Excluir disciplina"
        description="Tem certeza que deseja excluir esta disciplina? Esta ação não poderá ser desfeita."
        confirmText="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setSubjectToDelete(null)}
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
          <h1 className="text-2xl md:text-3xl font-bold font-archivo text-text-title">Disciplinas</h1>
          <p className="text-text-base mt-1">Gerenciamento das matérias oferecidas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Adição */}
        <div className="lg:col-span-1">
          <form onSubmit={handleCreate} className="bg-box-base p-6 rounded-2xl shadow-sm border border-line-in-white sticky top-24">
            <h2 className="text-lg font-bold font-archivo text-text-title mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Nova Disciplina
            </h2>
            
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-lg flex items-center gap-3 mb-6 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Input 
              name="name" 
              label="Nome da Disciplina" 
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Ex: Física Quântica"
              required 
            />
            
            <Button 
              type="submit" 
              className="w-full mt-6"
              loading={isSubmitting}
              disabled={!newSubject.trim()}
            >
              Adicionar
            </Button>
          </form>
        </div>

        {/* Lista de Disciplinas */}
        <div className="lg:col-span-2 bg-box-base rounded-2xl shadow-sm border border-line-in-white overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-text-complement">Carregando disciplinas...</div>
          ) : subjects.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <BookOpen className="w-12 h-12 text-line-in-white mb-4" />
              <p className="text-text-complement">Nenhuma disciplina cadastrada.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line-in-white bg-background">
                    <th className="p-4 font-semibold text-text-base text-sm uppercase tracking-wider">Nome</th>
                    <th className="p-4 font-semibold text-text-base text-sm uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-in-white">
                  {subjects.map((subject) => (
                    <tr key={subject.id} className="hover:bg-background/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-secondary" />
                          </div>
                          {editingId === subject.id ? (
                            <input
                              autoFocus
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit();
                                if (e.key === "Escape") cancelEdit();
                              }}
                              className="bg-background border border-line-in-white rounded-lg px-3 py-1.5 text-sm font-bold text-text-title w-full max-w-xs"
                            />
                          ) : (
                            <div>
                              <p className="font-bold text-text-title text-sm">{subject.name}</p>
                              <p className="text-xs text-text-complement">ID: {subject.id}</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        {editingId === subject.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={saveEdit}
                              disabled={isSavingEdit || !editingName.trim()}
                              className="p-2 text-success hover:bg-success/10 rounded-lg transition-colors cursor-pointer border-0 bg-transparent disabled:opacity-50"
                              title="Salvar"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={isSavingEdit}
                              className="p-2 text-text-complement hover:bg-background rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                              title="Cancelar"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEdit(subject)}
                              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                              title="Editar disciplina"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => confirmDelete(subject.id)}
                              className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer border-0 bg-transparent"
                              title="Excluir disciplina"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
