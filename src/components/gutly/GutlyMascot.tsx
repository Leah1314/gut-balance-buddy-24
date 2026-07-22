import { cn } from "@/lib/utils";

interface Props {
  size?: number;
  waving?: boolean;
  className?: string;
}

// Friendly green blob mascot — soft, rounded, delightful.
export const GutlyMascot = ({ size = 56, waving = true, className }: Props) => (
  <div
    className={cn("inline-block", waving && "animate-wave", className)}
    style={{ width: size, height: size }}
    aria-hidden
  >
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none">
      <defs>
        <linearGradient id="gm-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(149 55% 62%)" />
          <stop offset="100%" stopColor="hsl(149 45% 45%)" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="58" rx="18" ry="3" fill="hsl(149 39% 40% / 0.12)" />
      <path
        d="M32 6c-11 0-20 8.5-20 22 0 12 8 22 20 22s20-10 20-22C52 14.5 43 6 32 6z"
        fill="url(#gm-body)"
      />
      <circle cx="25" cy="28" r="2.6" fill="#1D1D1F" />
      <circle cx="39" cy="28" r="2.6" fill="#1D1D1F" />
      <circle cx="25.8" cy="27.2" r="0.9" fill="#fff" />
      <circle cx="39.8" cy="27.2" r="0.9" fill="#fff" />
      <path d="M26 36c1.6 2.4 4 3.6 6 3.6s4.4-1.2 6-3.6" stroke="#1D1D1F" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      <circle cx="18" cy="34" r="2" fill="hsl(0 70% 78%)" opacity="0.7" />
      <circle cx="46" cy="34" r="2" fill="hsl(0 70% 78%)" opacity="0.7" />
    </svg>
  </div>
);

export default GutlyMascot;