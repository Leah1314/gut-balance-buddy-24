import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
  tone?: "default" | "soft" | "accent";
}

export const SectionCard = ({ icon: Icon, title, description, action, children, className, tone = "default" }: Props) => {
  const bg = tone === "soft" ? "bg-primary-soft" : tone === "accent" ? "bg-accent/20" : "bg-card";
  return (
    <section className={cn("rounded-[var(--radius)] shadow-soft p-4 animate-fade-in", bg, className)}>
      {(Icon || title || description) && (
        <header className="flex items-start gap-3 mb-3">
          {Icon && (
            <div className="shrink-0 h-9 w-9 rounded-xl bg-primary-soft text-primary flex items-center justify-center">
              <Icon className="w-4 h-4" strokeWidth={2} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && <h3 className="text-[17px] font-semibold text-foreground tracking-tight">{title}</h3>}
            {description && <p className="text-caption mt-0.5">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
};

export default SectionCard;