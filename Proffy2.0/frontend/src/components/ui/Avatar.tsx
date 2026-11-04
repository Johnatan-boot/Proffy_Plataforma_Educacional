import { useState } from "react";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
  status?: "online" | "offline" | "busy" | null;
}

const sizeStyles = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

const statusStyles = {
  online: "bg-success",
  offline: "bg-text-complement",
  busy: "bg-danger",
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ src, name, size = "md", className, ring = false, status = null }: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(src) && !imgError;

  return (
    <div className={cn("relative shrink-0", sizeStyles[size], className)}>
      <div
        className={cn(
          "w-full h-full rounded-full overflow-hidden flex items-center justify-center font-bold shrink-0",
          "bg-primary-lighter text-white",
          ring && "ring-2 ring-white/70 ring-offset-2 ring-offset-primary"
        )}
      >
        {showImage ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-box-base",
            statusStyles[status]
          )}
        />
      )}
    </div>
  );
}
