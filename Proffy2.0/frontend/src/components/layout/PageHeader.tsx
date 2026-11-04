import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col bg-primary pt-6 pb-12 md:pb-24 w-full", className)}>
      <div className="w-[90%] max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="h-8 transition-opacity hover:opacity-60 flex items-center">
          <img 
            src="/assets/icons/back.svg" 
            alt="Voltar"
            className="h-[16px]"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <ArrowLeft className="hidden w-6 h-6 text-white" />
        </Link>
        <div className="flex items-center">
          <img 
            src="/assets/logo.svg" 
            alt="Proffy"
            className="h-[16px]"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden text-white font-bold text-xl">Proffy</span>
        </div>
      </div>

      <div className="w-[90%] max-w-3xl mx-auto mt-12 mb-8 flex-1 flex flex-col justify-center relative">
        <strong className="font-archivo font-bold text-3xl md:text-4xl leading-tight text-title-in-primary md:max-w-sm">
          {title}
        </strong>
        {description && (
          <p className="max-w-md text-sm md:text-base leading-relaxed text-text-in-primary mt-4 md:mt-6">
            {description}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}
