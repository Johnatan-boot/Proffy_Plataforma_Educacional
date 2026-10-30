import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { authService } from "@/features/auth/services";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const session = await authService.login({ email, password });
      const destination =
        session.user.role === "TEACHER" ? "/teachers" : "/dashboard";
      navigate(destination);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível fazer login. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      title="Fazer login" 
      description="Bem-vindo de volta! Insira suas credenciais para acessar sua conta."
    >
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <Input 
          id="email"
          name="email"
          type="email" 
          label="E-mail" 
          placeholder="exemplo@email.com" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        
        <Input 
          id="password"
          name="password"
          type="password" 
          label="Senha" 
          placeholder="Sua senha secreta" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />

        <div className="flex items-center justify-between mt-2 mb-4">
          <label className="flex items-center gap-2 text-sm text-text-complement cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-line-in-white text-primary focus:ring-primary" />
            Lembrar-me
          </label>
          <a href="#" className="text-sm text-primary font-bold hover:underline">Esqueci minha senha</a>
        </div>
        
        <Button 
          type="submit" 
          variant="secondary" 
          disabled={isSubmitting}
          className="w-full h-14 text-lg font-archivo font-bold rounded-xl bg-secondary hover:bg-secondary-dark transition-colors disabled:opacity-60"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <footer className="mt-8 text-center text-sm text-text-complement">
        Não tem uma conta? <Link to="/register" className="text-primary font-bold hover:underline">Cadastre-se</Link>
      </footer>
    </AuthLayout>
  );
}
