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
    <section className={cn("rounded-[var(--radius)] shadow-soft p-6 animate-fade-in", bg, className)}>
      {(Icon || title || description) && (
        <header className="flex items-start gap-3 mb-4">
          {Icon && (
            <div className="shrink-0 h-11 w-11 rounded-2xl bg-primary-soft text-primary flex items-center justify-center">
              <Icon className="w-5 h-5" strokeWidth={2} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && <h3 className="text-card-title text-foreground">{title}</h3>}
            {description && <p className="text-caption mt-1">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      {children}
    </section>
  );
};

export default SectionCard;