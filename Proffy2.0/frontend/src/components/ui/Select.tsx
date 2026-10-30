import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: React.ReactNode;
  labelClassName?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, labelClassName, options, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="relative group flex flex-col focus-within:after:content-[''] focus-within:after:w-[calc(100%-32px)] focus-within:after:h-[2px] focus-within:after:bg-primary-light focus-within:after:absolute focus-within:after:left-[16px] focus-within:after:right-[16px] focus-within:after:bottom-0">
        <label htmlFor={inputId} className={cn("text-[14px] text-text-complement", labelClassName)}>
          {label}
        </label>
        <select
          id={inputId}
          ref={ref}
          className={cn(
            "w-full h-[56px] mt-2 rounded-lg border border-line-in-white bg-input-background px-4 text-[16px] font-archivo text-text-base outline-none",
            error && "border-danger",
            className
          )}
          {...props}
        >
          <option value="" disabled hidden>Selecione uma opção</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-sm text-danger mt-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
