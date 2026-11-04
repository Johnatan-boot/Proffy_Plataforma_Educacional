import { InputHTMLAttributes, forwardRef, useId, useState } from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  labelClassName?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, labelClassName, error, helperText, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordType = type === "password";
    const currentType = isPasswordType ? (showPassword ? "text" : "password") : type;

    return (
      <div className="relative group flex flex-col focus-within:after:content-[''] focus-within:after:w-[calc(100%-32px)] focus-within:after:h-[2px] focus-within:after:bg-primary-light focus-within:after:absolute focus-within:after:left-[16px] focus-within:after:right-[16px] focus-within:after:bottom-0">
        <label htmlFor={inputId} className={cn("text-[14px] text-text-complement", labelClassName)}>
          {label}
        </label>
        <div className="relative w-full">
          <input
            id={inputId}
            ref={ref}
            type={currentType}
            className={cn(
              "w-full h-[56px] mt-2 rounded-lg border border-line-in-white bg-input-background px-4 text-[16px] font-archivo text-text-base outline-none",
              isPasswordType && "pr-12",
              error && "border-danger focus:ring-danger",
              className
            )}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 mt-1 text-text-complement hover:text-primary transition-colors bg-transparent border-0 cursor-pointer"
              aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && <p className="text-sm text-danger mt-1">{error}</p>}
        {!error && helperText && <p className="text-sm text-text-muted mt-1">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
