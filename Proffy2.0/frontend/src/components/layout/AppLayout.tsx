import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, GraduationCap, BookOpen, Calendar, Menu, X, LogOut, Settings, Fingerprint } from "lucide-react";
import { AnimatedPage } from "./AnimatedPage";
import { Avatar } from "@/components/ui/Avatar";
import { getCurrentUser } from "@/features/auth/currentUser";
import { authService } from "@/features/auth/services";
import { useNavigate } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Professores", href: "/teachers", icon: Users },
  { name: "Alunos", href: "/students", icon: GraduationCap },
  { name: "Disciplinas", href: "/subjects", icon: BookOpen },
  { name: "Horários", href: "/schedules", icon: Calendar },
  { name: "Ponto Eletrônico", href: "/timesheet", icon: Fingerprint },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  function handleLogout() {
    authService.logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      
      {/* Mobile Header / Navbar */}
      <header className="md:hidden flex items-center justify-between p-4 bg-primary text-text-in-primary">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -ml-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <img src="/assets/logo.svg" alt="Proffy" className="h-6" />
        </div>
        <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" ring status="online" />
      </header>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-primary flex flex-col text-text-in-primary transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden md:flex items-center justify-center">
          <img src="/assets/logo.svg" alt="Proffy" className="h-8" />
        </div>

        <nav className="flex-1 mt-8 md:mt-2 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                  isActive 
                    ? "bg-primary-dark text-white shadow-sm" 
                    : "text-primary-lighter hover:bg-primary-dark hover:text-white"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-primary-lighter")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="pt-4 border-t border-primary-dark space-y-2">
            <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-primary-lighter hover:bg-primary-dark hover:text-white transition-all duration-200 font-medium">
              <Settings className="w-5 h-5" />
              Configurações
            </button>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-primary-lighter hover:bg-danger hover:text-white transition-all duration-200 font-medium"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen overflow-hidden">
        {/* Top bar (Desktop) */}
        <header className="hidden md:flex h-20 items-center justify-between px-8 bg-background border-b border-line-in-white shrink-0">
          <h1 className="text-2xl font-bold font-archivo text-text-title">
            {navigation.find(n => location.pathname.startsWith(n.href))?.name || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-text-title">{currentUser.name}</p>
              <p className="text-xs text-text-complement">{currentUser.role}</p>
            </div>
            <Avatar src={currentUser.avatar} name={currentUser.name} size="lg" ring status="online" />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatedPage className="max-w-6xl mx-auto w-full">
            {children}
          </AnimatedPage>
        </div>
      </main>
    </div>
  );
}
