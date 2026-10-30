import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { authService } from "@/features/auth/services";
import { UserRole } from "@/features/auth/types";

const ROLE_MAP: Record<string, UserRole> = {
  aluno: "STUDENT",
  professor: "TEACHER",
  diretoria: "ADMIN",
};

export function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("aluno");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTeacher = role === "professor";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isTeacher && (!bio.trim() || !hourlyRate)) {
      setError("Professores precisam informar uma bio e o valor da hora/aula.");
      return;
    }

    setIsSubmitting(true);

    try {
      const session = await authService.register({
        name,
        email,
        password,
        role: ROLE_MAP[role],
        ...(isTeacher && {
          bio: bio.trim(),
          hourlyRate: Number(hourlyRate),
        }),
      });

      const destination =
        session.user.role === "TEACHER" ? "/teachers" : "/dashboard";
      navigate(destination);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível concluir o cadastro. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      title="Cadastro" 
      description="Preencha os dados abaixo para começar a usar a plataforma."
    >
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-sm text-danger">
            {error}
          </div>
        )}

        <Input 
          id="name"
          name="name"
          type="text" 
          label="Nome completo" 
          placeholder="Seu nome" 
          minLength={2}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required 
        />
        
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
          placeholder="Mínimo de 6 caracteres" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required 
        />

        <Select 
          id="role"
          name="role"
          label="Perfil de Acesso"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          options={[
            { value: "aluno", label: "Aluno" },
            { value: "professor", label: "Professor" },
            { value: "diretoria", label: "Diretoria" },
          ]}
        />

        {isTeacher && (
          <>
            <Textarea
              id="bio"
              name="bio"
              label="Sobre você"
              placeholder="Conte um pouco da sua experiência (mínimo de 10 caracteres)"
              minLength={10}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              required={isTeacher}
            />

            <Input
              id="hourlyRate"
              name="hourlyRate"
              type="number"
              min={1}
              step="0.01"
              label="Valor da hora/aula (R$)"
              placeholder="50"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              required={isTeacher}
            />
          </>
        )}
        
        <Button 
          type="submit" 
          variant="secondary" 
          disabled={isSubmitting}
          className="w-full h-14 mt-4 text-lg font-archivo font-bold rounded-xl bg-secondary hover:bg-secondary-dark transition-colors disabled:opacity-60"
        >
          {isSubmitting ? "Enviando..." : "Concluir cadastro"}
        </Button>
      </form>

      <footer className="mt-8 text-center text-sm text-text-complement">
        Já tem uma conta? <Link to="/login" className="text-primary font-bold hover:underline">Fazer login</Link>
      </footer>
    </AuthLayout>
  );
}
