import { Link } from "react-router-dom";
import { BookOpen, MonitorPlay, Heart, LogIn, UserPlus } from "lucide-react";
import { AnimatedPage } from "@/components/layout/AnimatedPage";

export function Landing() {
  return (
    <AnimatedPage className="bg-primary flex items-center justify-center min-h-screen overflow-x-hidden p-6 md:p-8">
      <div 
        id="container" 
        className="w-full max-w-2xl lg:max-w-6xl text-text-in-primary animate-fade-in-up 
                   flex flex-col lg:grid lg:grid-cols-[2fr_1fr_2fr] lg:grid-rows-[auto_auto_auto] 
                   lg:gap-x-16 lg:gap-y-0"
      >
        
        {/* Logo Container */}
        <div className="logo-container text-center mb-10 lg:col-start-1 lg:col-end-2 
                        lg:row-start-1 lg:row-end-2 lg:text-left 
                        lg:self-center lg:mb-0 animate-zoom-in">
          
          <h1 className="font-archivo text-5xl md:text-6xl font-bold text-title-in-primary mb-2 flex flex-col md:flex-row items-center justify-center lg:justify-start gap-3">
             {/* If the user uploads /assets/logo.svg it will show, otherwise we have text fallback */}
             <img 
               src="/assets/logo.svg" 
               alt="Proffy" 
               className="h-[100px] object-contain"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.nextElementSibling?.classList.remove('hidden');
               }}
             />
             <span className="hidden">Proffy</span>
          </h1>
          <h2 className="font-poppins font-medium text-2xl md:text-3xl lg:text-4xl leading-tight mt-4 max-w-sm mx-auto lg:mx-0">
            Sua plataforma de estudos online.
          </h2>
        </div>

        {/* Hero Image */}
        <div className="hero-image w-full max-w-md mx-auto lg:max-w-none lg:col-start-2 lg:col-end-4 lg:row-start-1 
                        lg:row-end-2 lg:self-center animate-slide-in-right delay-500 mb-10 lg:mb-0">
          <img 
            src="/assets/landing.svg" 
            alt="Plataforma de Estudos" 
            className="w-full h-auto object-contain lg:h-[350px]"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          {/* Fallback box if image is missing */}
          <div className="hidden w-full h-[250px] min-[1100px]:h-[350px] bg-primary-light rounded-2xl flex items-center justify-center border-2 border-dashed border-primary-lighter">
             <span className="text-text-in-primary text-sm font-medium">/assets/landing.svg</span>
          </div>
        </div>

        {/* Buttons Container */}
        <div className="buttons-container flex flex-wrap justify-center lg:justify-start mb-8 lg:mb-0 
                        lg:col-start-1 lg:col-end-4 lg:row-start-2 lg:row-end-3 lg:mt-10 gap-3 md:gap-4 w-full">
          
          <Link 
            to="/study" 
            className="study flex-1 min-w-[140px] max-w-[240px] h-14 md:h-16 bg-primary-lighter hover:bg-primary-light 
                       hover:scale-105 text-button-text rounded-xl font-bold text-base md:text-lg font-archivo 
                       flex items-center justify-center transition-all duration-200 shadow-sm"
          >
            <img src="/assets/study.svg" alt="" className="w-6 mr-3" 
                 onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
            <BookOpen className="hidden w-6 h-6 mr-3" />
            Estudar
          </Link>

          <Link 
            to="/give-classes" 
            className="give-classes flex-1 min-w-[140px] max-w-[240px] h-14 md:h-16 bg-secondary hover:bg-secondary-dark 
                       hover:scale-105 text-button-text rounded-xl font-bold text-base md:text-lg font-archivo 
                       flex items-center justify-center transition-all duration-200 shadow-sm"
          >
            <img src="/assets/give-classes.svg" alt="" className="w-6 mr-3" 
                 onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
            <MonitorPlay className="hidden w-6 h-6 mr-3" />
            Dar Aulas
          </Link>

          <Link 
            to="/login" 
            className="login flex-1 min-w-[140px] max-w-[240px] h-14 md:h-16 bg-primary-dark hover:bg-primary-darker 
                       hover:scale-105 text-button-text rounded-xl font-bold text-base md:text-lg font-archivo 
                       flex items-center justify-center transition-all duration-200 shadow-sm"
          >
            <LogIn className="w-6 h-6 mr-3" />
            Login
          </Link>

          <Link 
            to="/register" 
            className="register flex-1 min-w-[140px] max-w-[240px] h-14 md:h-16 bg-transparent border-2 border-primary-lighter hover:bg-primary-lighter
                       hover:scale-105 text-button-text rounded-xl font-bold text-base md:text-lg font-archivo 
                       flex items-center justify-center transition-all duration-200 shadow-sm"
          >
            <UserPlus className="w-6 h-6 mr-3" />
            Cadastro
          </Link>

        </div>

        {/* Total Connections */}
        <p className="total-connections text-sm md:text-base lg:text-sm flex justify-center items-center 
                      lg:col-start-1 lg:col-end-4 lg:row-start-3 
                      lg:row-end-4 lg:justify-self-end mt-4 lg:mt-8 animate-fade-in-delayed text-text-in-primary">
          Total de 200 conexões já realizadas
          
          <img src="/assets/purple-heart.svg" alt="Coração roxo" className="ml-2" 
               onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
          <Heart className="hidden ml-[8px] w-5 h-5 text-primary-lighter fill-primary-lighter" />
        </p>

      </div>
    </AnimatedPage>
  );
}
