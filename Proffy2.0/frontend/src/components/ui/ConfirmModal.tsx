import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isLoading ? undefined : onCancel}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-box-base w-full max-w-md rounded-2xl shadow-xl border border-line-in-white overflow-hidden z-10"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-danger" />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-bold font-archivo text-text-title">{title}</h3>
                  <p className="text-text-base mt-2">{description}</p>
                </div>
                <button 
                  onClick={onCancel}
                  disabled={isLoading}
                  className="p-1 text-text-complement hover:bg-background rounded-lg transition-colors bg-transparent border-0 cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 bg-background border-t border-line-in-white flex flex-col sm:flex-row gap-3 justify-end">
              <Button 
                variant="ghost" 
                onClick={onCancel} 
                disabled={isLoading} 
                className="text-text-base bg-transparent border-0 shadow-none hover:bg-line-in-white/50 w-full sm:w-auto"
              >
                {cancelText}
              </Button>
              <Button 
                onClick={onConfirm} 
                loading={isLoading} 
                className="bg-danger hover:bg-danger/90 w-full sm:w-auto"
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
