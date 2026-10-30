import { motion, AnimatePresence } from "motion/react";

interface GlobalLoaderProps {
  isLoading: boolean;
  message?: string;
}

export function GlobalLoader({ isLoading, message = "Carregando..." }: GlobalLoaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <div className="relative flex items-center justify-center">
            {/* Outer rings */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute w-24 h-24 border-[3px] border-transparent border-t-primary border-l-primary rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute w-16 h-16 border-[3px] border-transparent border-b-secondary border-r-secondary rounded-full"
            />
            {/* Center pulsing core */}
            <motion.div 
              animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="w-8 h-8 bg-primary rounded-full"
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 font-archivo font-bold text-text-title text-lg"
          >
            {message}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
