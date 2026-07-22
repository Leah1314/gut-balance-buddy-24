import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseAssistantResponse, type AssistantSection } from "./parseAssistant";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

/**
 * Two-layer AI experience (Apple Health / Oura style):
 *
 *  Layer 1 (Glance, always shown):
 *    • one-sentence summary
 *    • recommendation score dial
 *    • up to 3 key recommendation cards
 *    • one Gutly Tip
 *    • "View Full Analysis" button
 *
 *  Layer 2 (Drawer, on demand):
 *    • every parsed section with full markdown
 */
export default function AssistantResponse({ content }: { content: string }) {
  const sections = useMemo(() => parseAssistantResponse(content), [content]);

  const summary = sections.find((s) => s.kind === "summary") as
    | Extract<AssistantSection, { kind: "summary" }>
    | undefined;

  const keyItems = pickKeyRecommendations(sections);
  const tip = sections.find((s) => s.kind === "tip") as
    | Extract<AssistantSection, { kind: "tip" }>
    | undefined;

  const score = useMemo(() => deriveScore(content, summary?.tone), [content, summary?.tone]);

  return (
    <div className="w-full max-w-[42rem]">
      <div className="rounded-[22px] bg-card shadow-soft border border-border/40 p-4 sm:p-5 space-y-4 sm:space-y-5">
        {/* Hero: summary + score dial */}
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1.5">
              Gutly's Take
            </p>
            <p className="text-[16px] sm:text-[18px] font-semibold leading-[1.4] tracking-tight text-foreground break-words">
              {summary?.text ?? firstLine(content)}
            </p>
          </div>
          <ScoreDial score={score.value} label={score.label} tone={score.tone} />
        </div>

        {/* Key recommendations */}
        {keyItems.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Key Recommendations
            </p>
            <div className="space-y-2">
              {keyItems.map((k, i) => (
                <KeyRecCard key={i} tone={k.tone} text={k.text} />
              ))}
            </div>
          </div>
        )}

        {/* Gutly Tip */}
        {tip && <TipCard title={tip.title} text={tip.text} />}

        {/* View full analysis */}
        <FullAnalysisDrawer sections={sections} summary={summary?.text} />
      </div>
    </div>
  );
}

/* --------------------------- Score derivation --------------------------- */

function deriveScore(
  content: string,
  tone?: "positive" | "negative" | "neutral",
): { value: number; label: string; tone: "positive" | "neutral" | "negative" } {
  // Look for explicit numeric scores: "score: 82", "82/100", "8/10", "rating 7"
  const hundred = content.match(/(?:score|rating)[^\d]{0,6}(\d{1,3})\s*(?:\/\s*100)?/i);
  const tenth = content.match(/(\d{1,2})\s*\/\s*10\b/);
  let value: number | null = null;
  if (hundred) {
    const v = parseInt(hundred[1], 10);
    if (v >= 0 && v <= 100) value = v;
  }
  if (value === null && tenth) {
    const v = parseInt(tenth[1], 10);
    if (v >= 0 && v <= 10) value = v * 10;
  }
  if (value === null) {
    value = tone === "positive" ? 86 : tone === "negative" ? 42 : 68;
  }
  const t: "positive" | "neutral" | "negative" =
    value >= 75 ? "positive" : value >= 55 ? "neutral" : "negative";
  const label = value >= 85 ? "Great" : value >= 70 ? "Good" : value >= 50 ? "Fair" : "Caution";
  return { value, label, tone: t };
}

function ScoreDial({
  score,
  label,
  tone,
}: {
  score: number;
  label: string;
  tone: "positive" | "neutral" | "negative";
}) {
  const size = 64;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = c * pct;
  const color =
    tone === "positive"
      ? "hsl(var(--primary))"
      : tone === "negative"
      ? "hsl(25 85% 55%)"
      : "hsl(var(--accent))";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          stroke="hsl(var(--muted))"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          stroke={color}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{ transition: "stroke-dasharray 500ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[20px] font-bold tabular-nums leading-none text-foreground">
          {score}
        </span>
        <span
          className="text-[9px] font-semibold uppercase tracking-wider mt-0.5"
          style={{ color }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/* ---------------------- Key recommendation picking ---------------------- */

type KeyItem = { tone: "good" | "avoid" | "neutral"; text: string };

function pickKeyRecommendations(sections: AssistantSection[]): KeyItem[] {
  const items: KeyItem[] = [];
  for (const s of sections) {
    if (items.length >= 3) break;
    if (s.kind === "good") {
      for (const it of s.items) {
        if (items.length >= 3) break;
        items.push({ tone: "good", text: it });
      }
    } else if (s.kind === "avoid") {
      for (const it of s.items) {
        if (items.length >= 3) break;
        items.push({ tone: "avoid", text: it });
      }
    }
  }
  if (items.length < 2) {
    for (const s of sections) {
      if (items.length >= 3) break;
      if (s.kind === "recommendation") {
        for (const it of s.items) {
          if (items.length >= 3) break;
          items.push({ tone: "neutral", text: it });
        }
      }
    }
  }
  return items.map((i) => ({ ...i, text: shorten(i.text, 140) }));
}

function shorten(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd() + "…";
}

function firstLine(text: string) {
  return text.split(/\r?\n/).find((l) => l.trim()) ?? text;
}

function KeyRecCard({ tone, text }: KeyItem) {
  const cfg = {
    good: {
      bg: "bg-primary-soft/70 border-primary/15",
      chipBg: "bg-primary/15 text-primary",
      icon: <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />,
    },
    avoid: {
      bg: "bg-[hsl(30_95%_96%)] border-[hsl(30_80%_82%)]/60",
      chipBg: "bg-[hsl(25_85%_45%)]/15 text-[hsl(25_75%_35%)]",
      icon: <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.5} />,
    },
    neutral: {
      bg: "bg-muted/60 border-border/40",
      chipBg: "bg-foreground/10 text-foreground/70",
      icon: <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />,
    },
  }[tone];
  return (
    <div className={cn("rounded-2xl border p-3 flex gap-2.5 items-start", cfg.bg)}>
      <span
        className={cn(
          "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
          cfg.chipBg,
        )}
      >
        {cfg.icon}
      </span>
      <p className="text-[14.5px] leading-[1.5] text-foreground flex-1 min-w-0">
        <InlineMarkdown text={text} />
      </p>
    </div>
  );
}

/* ---------------------------- Full analysis ----------------------------- */

function FullAnalysisDrawer({
  sections,
  summary,
}: {
  sections: AssistantSection[];
  summary?: string;
}) {
  const [open, setOpen] = useState(false);
  const detailSections = sections.filter((s) => s.kind !== "summary");
  if (detailSections.length === 0) return null;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          className={cn(
            "w-full mt-1 h-11 rounded-2xl bg-foreground text-background",
            "text-[14px] font-semibold tracking-tight",
            "flex items-center justify-center gap-1.5",
            "active:scale-[0.99] transition-transform",
          )}
        >
          View Full Analysis
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[92vh]">
        <DrawerHeader className="text-left pb-2">
          <DrawerTitle className="text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Full Analysis
          </DrawerTitle>
          {summary && (
            <p className="text-[18px] font-semibold leading-[1.35] tracking-tight text-foreground mt-1">
              {summary}
            </p>
          )}
        </DrawerHeader>
        <div className="px-4 pb-8 overflow-y-auto space-y-3.5">
          {detailSections.map((s, i) => (
            <SectionRenderer key={i} section={s} />
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function SectionRenderer({ section }: { section: AssistantSection }) {
  switch (section.kind) {
    case "summary":
      return null;
    case "recommendation":
      return (
        <RecommendationCard title={section.title} body={section.body} items={section.items} />
      );
    case "good":
      return (
        <ChecklistCard tone="good" title={section.title} items={section.items} body={section.body} />
      );
    case "avoid":
      return (
        <ChecklistCard tone="avoid" title={section.title} items={section.items} body={section.body} />
      );
    case "tip":
      return <TipCard title={section.title} text={section.text} />;
    case "details":
      return <DetailsCard title={section.title} body={section.body} />;
  }
}

/* ---------------------------- Recommendation ---------------------------- */

function RecommendationCard({
  title,
  body,
  items,
}: {
  title: string;
  body: string;
  items: string[];
}) {
  const hasBody = !!body?.trim();
  const hasItems = items.length > 0;
  if (!hasBody && !hasItems) return null;

  return (
    <div className="rounded-[18px] bg-card shadow-soft border border-border/40 p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-6 rounded-lg bg-primary-soft flex items-center justify-center">
          <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2.25} />
        </div>
        <h4 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
      </div>
      {hasBody && <Prose>{clampParagraphs(body)}</Prose>}
      {hasItems && (
        <ul className={cn("space-y-1.5", hasBody && "mt-2.5")}>
          {items.map((it, i) => (
            <li key={i} className="flex gap-2 text-[14.5px] leading-[1.55] text-foreground/90">
              <span className="mt-[9px] h-1 w-1 rounded-full bg-foreground/40 shrink-0" />
              <InlineMarkdown text={it} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------- Checklist ------------------------------ */

function ChecklistCard({
  tone,
  title,
  items,
  body,
}: {
  tone: "good" | "avoid";
  title: string;
  items: string[];
  body?: string;
}) {
  const isGood = tone === "good";
  const Icon = isGood ? CheckCircle2 : AlertTriangle;
  const list = items.length ? items : body ? [body] : [];
  if (!list.length) return null;

  return (
    <div
      className={cn(
        "rounded-[18px] p-4 border",
        isGood
          ? "bg-primary-soft/70 border-primary/15"
          : "bg-[hsl(30_95%_96%)] border-[hsl(30_80%_82%)]/60"
      )}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <Icon
          className={cn("h-4 w-4", isGood ? "text-primary" : "text-[hsl(25_85%_45%)]")}
          strokeWidth={2.25}
        />
        <h4
          className={cn(
            "text-[14px] font-semibold tracking-tight",
            isGood ? "text-primary" : "text-[hsl(25_75%_35%)]"
          )}
        >
          {title}
        </h4>
      </div>
      <ul className="space-y-2">
        {list.map((it, i) => (
          <li
            key={i}
            className={cn(
              "flex gap-2.5 items-start rounded-xl px-3 py-2 bg-card/80",
              "text-[14.5px] leading-[1.5] text-foreground"
            )}
          >
            <span
              className={cn(
                "mt-[3px] h-4 w-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                isGood
                  ? "bg-primary/15 text-primary"
                  : "bg-[hsl(25_85%_45%)]/15 text-[hsl(25_75%_35%)]"
              )}
            >
              {isGood ? "✓" : "!"}
            </span>
            <span className="flex-1 min-w-0">
              <InlineMarkdown text={it} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* --------------------------------- Tip ---------------------------------- */

function TipCard({ title, text }: { title: string; text: string }) {
  if (!text?.trim()) return null;
  return (
    <div className="rounded-[18px] bg-accent/15 border border-accent/25 p-4 flex gap-3">
      <div className="h-8 w-8 shrink-0 rounded-xl bg-accent/40 flex items-center justify-center">
        <Lightbulb className="h-4 w-4 text-accent-foreground" strokeWidth={2.25} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold uppercase tracking-wider text-accent-foreground/80 mb-1">
          Gutly Tip · {title}
        </p>
        <p className="text-[14.5px] leading-[1.55] text-foreground/90">
          <InlineMarkdown text={text} />
        </p>
      </div>
    </div>
  );
}

/* ------------------------------- Details -------------------------------- */

function DetailsCard({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  if (!body?.trim()) return null;
  return (
    <div className="rounded-[18px] bg-muted/50 border border-border/40 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-[13.5px] font-semibold text-foreground/80">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 -mt-1">
          <Prose>{body}</Prose>
        </div>
      )}
    </div>
  );
}

/* --------------------------- shared primitives -------------------------- */

// Limit any paragraph to ~3 lines-worth of prose by joining short paras nicely.
function clampParagraphs(body: string): string {
  return body.trim();
}

function Prose({ children }: { children: string }) {
  return (
    <div
      className="text-[14.5px] leading-[1.6] text-foreground/85
        [&_p]:my-1.5 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0
        [&_strong]:font-semibold [&_strong]:text-foreground
        [&_ul]:my-1.5 [&_ul]:pl-4 [&_ul]:list-disc [&_ul]:space-y-1
        [&_ol]:my-1.5 [&_ol]:pl-4 [&_ol]:list-decimal [&_ol]:space-y-1
        [&_li]:leading-[1.55]
        [&_code]:text-[13px] [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded
        [&_a]:text-primary [&_a]:underline"
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}

function InlineMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <span>{children}</span>,
        strong: ({ children }) => (
          <strong className="font-semibold text-foreground">{children}</strong>
        ),
        a: ({ children, href }) => (
          <a href={href} className="text-primary underline" target="_blank" rel="noreferrer">
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="text-[13px] bg-muted px-1 py-0.5 rounded">{children}</code>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}