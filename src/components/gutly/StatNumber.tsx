import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  label?: string;
  sublabel?: string;
  max?: number;
  animate?: boolean;
  className?: string;
}

export const StatNumber = ({ value, label, sublabel, max = 100, animate = true, className }: Props) => {
  const [display, setDisplay] = useState(animate ? 0 : value);

  useEffect(() => {
    if (!animate) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const duration = 900;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, animate]);

  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="number-emphasis text-primary">{display}</div>
      {label && <div className="text-caption mt-1 uppercase tracking-wider text-muted-foreground">{label}</div>}
      {sublabel && <div className="text-[15px] text-foreground/70 mt-2">{sublabel}</div>}
      <div className="mt-4 h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary animate-progress transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default StatNumber;