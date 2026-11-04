import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AnimatedPage } from "./AnimatedPage";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  illustration?: boolean;
}

export function AuthLayout({ children, title, description, illustration = true }: AuthLayoutProps) {
  return (
    <AnimatedPage className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Branding Side - Hidden on small screens if not enough space, or stacked */}
      <div className="hidden md:flex flex-col justify-center items-center flex-1 bg-primary text-text-in-primary p-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/success-background.svg')] bg-center bg-no-repeat opacity-10"></div>
        
        <div className="relative z-10 max-w-md animate-zoom-in">
          <Link to="/" className="inline-block mb-8 hover:opacity-80 transition-opacity">
            <img src="/assets/logo.svg" alt="Proffy" className="h-20" />
          </Link>
          <h1 className="text-3xl lg:text-4xl font-archivo font-bold leading-tight mb-4 text-title-in-primary">
            Sua plataforma de estudos online.
          </h1>
          <p className="text-lg text-text-in-primary opacity-80">
            Aprenda, ensine e transforme o futuro.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative">
        <Link to="/" className="md:hidden absolute top-6 left-6 h-8 hover:opacity-80">
          <img src="/assets/icons/back.svg" alt="Voltar" className="h-full filter invert" />
        </Link>
        
        <div className="w-full max-w-md bg-box-base rounded-2xl shadow-sm border border-line-in-white p-8">
          <header className="mb-8">
            <h2 className="text-3xl font-archivo font-bold text-text-title mb-2">{title}</h2>
            {description && <p className="text-text-base text-sm">{description}</p>}
          </header>
          
          <main>
            {children}
          </main>
        </div>
      </div>
    </AnimatedPage>
  );
}
