import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import GutlyMascot from "./GutlyMascot";

interface Props {
  title?: string;
  children: ReactNode;
  tone?: "default" | "celebrate" | "gentle";
  className?: string;
}

// AI-persona callout — mascot + speech bubble. Emoji only allowed inside this component.
export const GutlySays = ({ title, children, tone = "default", className }: Props) => {
  const bg =
    tone === "celebrate"
      ? "bg-primary-soft"
      : tone === "gentle"
      ? "bg-secondary"
      : "bg-card";
  return (
    <div className={cn("flex items-start gap-3 animate-fade-in", className)}>
      <div className="shrink-0 mt-1">
        <GutlyMascot size={44} />
      </div>
      <div className={cn("relative flex-1 rounded-[var(--radius)] px-5 py-4 shadow-soft", bg)}>
        {title && (
          <div className="font-semibold text-foreground mb-1 text-[17px] leading-snug">{title}</div>
        )}
        <div className="text-[15px] leading-relaxed text-foreground/80">{children}</div>
      </div>
    </div>
  );
};

export default GutlySays;