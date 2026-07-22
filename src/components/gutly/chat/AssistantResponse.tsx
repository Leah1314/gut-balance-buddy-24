import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseAssistantResponse, type AssistantSection } from "./parseAssistant";

/**
 * Renders an AI markdown reply as scannable Gutly cards:
 * summary → recommendation → good / avoid → tip → collapsible details.
 * The backend response is not modified — only its presentation.
 */
export default function AssistantResponse({ content }: { content: string }) {
  const sections = parseAssistantResponse(content);

  return (
    <div className="space-y-3.5 max-w-[min(100%,42rem)]">
      {sections.map((s, i) => (
        <SectionRenderer key={i} section={s} />
      ))}
    </div>
  );
}

function SectionRenderer({ section }: { section: AssistantSection }) {
  switch (section.kind) {
    case "summary":
      return <SummaryBlock text={section.text} tone={section.tone} />;
    case "recommendation":
      return (
        <RecommendationCard title={section.title} body={section.body} items={section.items} />
      );
    case "good":
      return <ChecklistCard tone="good" title={section.title} items={section.items} body={section.body} />;
    case "avoid":
      return <ChecklistCard tone="avoid" title={section.title} items={section.items} body={section.body} />;
    case "tip":
      return <TipCard title={section.title} text={section.text} />;
    case "details":
      return <DetailsCard title={section.title} body={section.body} />;
  }
}

/* ------------------------------- Summary -------------------------------- */

function SummaryBlock({
  text,
  tone,
}: {
  text: string;
  tone: "positive" | "negative" | "neutral";
}) {
  const dot =
    tone === "positive"
      ? "bg-primary"
      : tone === "negative"
      ? "bg-destructive"
      : "bg-accent";
  return (
    <div className="flex items-start gap-2.5">
      <span
        className={cn(
          "mt-[7px] h-2.5 w-2.5 rounded-full shrink-0",
          dot,
          "shadow-[0_0_0_4px_hsl(var(--primary)/0.10)]"
        )}
      />
      <p className="text-[17px] font-semibold text-foreground leading-[1.4] tracking-tight">
        {text}
      </p>
    </div>
  );
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