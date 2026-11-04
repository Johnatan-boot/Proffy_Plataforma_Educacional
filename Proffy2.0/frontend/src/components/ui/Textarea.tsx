import { TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: React.ReactNode;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="relative group flex flex-col mt-6 focus-within:after:content-[''] focus-within:after:w-[calc(100%-32px)] focus-within:after:h-[2px] focus-within:after:bg-primary-light focus-within:after:absolute focus-within:after:left-[16px] focus-within:after:right-[16px] focus-within:after:bottom-0">
        <label htmlFor={inputId} className="text-[14px] text-text-complement">
          {label}
        </label>
        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "w-full h-[160px] mt-2 rounded-lg border border-line-in-white bg-input-background p-4 text-[16px] font-archivo text-text-base outline-none resize-y",
            error && "border-danger",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-danger mt-1">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
