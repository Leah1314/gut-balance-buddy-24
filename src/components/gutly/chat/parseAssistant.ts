// Heuristic parser that turns an AI markdown reply into scannable UI sections.
// Backend/prompt is untouched — this only shapes how the text is displayed.

export type AssistantSection =
  | { kind: "summary"; text: string; tone: "positive" | "negative" | "neutral" }
  | { kind: "recommendation"; title: string; body: string; items: string[] }
  | { kind: "good"; title: string; items: string[]; body?: string }
  | { kind: "avoid"; title: string; items: string[]; body?: string }
  | { kind: "tip"; title: string; text: string }
  | { kind: "details"; title: string; body: string };

const LEADING_EMOJI =
  /^([\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2700}-\u{27BF}✅❌⚠️🟢🟡🔴💡⭐🍽️📌🚫👍👎])\s*/u;

const POSITIVE_HINTS = /^(yes|great|good|perfect|excellent|absolutely|👍|✅|🟢)/i;
const NEGATIVE_HINTS = /^(no|avoid|not recommended|be careful|not a good|👎|❌|🚫|🔴|⚠️)/i;

function detectTone(text: string): "positive" | "negative" | "neutral" {
  const t = text.trim();
  if (NEGATIVE_HINTS.test(t)) return "negative";
  if (POSITIVE_HINTS.test(t)) return "positive";
  return "neutral";
}

function stripEmoji(text: string): string {
  return text.replace(LEADING_EMOJI, "").trim();
}

function extractBullets(body: string): string[] {
  const lines = body.split(/\r?\n/);
  const items: string[] = [];
  let current: string | null = null;
  for (const raw of lines) {
    const m = raw.match(/^\s*(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (m) {
      if (current) items.push(current.trim());
      current = m[1];
    } else if (current !== null && raw.trim()) {
      current += " " + raw.trim();
    } else if (current) {
      items.push(current.trim());
      current = null;
    }
  }
  if (current) items.push(current.trim());
  return items.filter(Boolean);
}

function stripBullets(body: string): string {
  return body
    .split(/\r?\n/)
    .filter((l) => !/^\s*(?:[-*•]|\d+[.)])\s+/.test(l))
    .join("\n")
    .trim();
}

function classifyHeading(heading: string): AssistantSection["kind"] {
  const h = heading.toLowerCase();
  if (/tip|advice|remember|note|gutly says|pro tip/.test(h)) return "tip";
  if (/avoid|limit|watch|skip|warning|careful|caution|don'?t|reduce|caution|red flag/.test(h))
    return "avoid";
  if (/good|eat|enjoy|recommend|include|best|great|try|do this|choose|opt for|go for/.test(h))
    return "good";
  if (/detail|why|background|explanation|more info|about|how it|science|deep dive/.test(h))
    return "details";
  return "recommendation";
}

function splitParagraphs(body: string): string[] {
  return body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

// First sentence up to ~140 chars.
function firstSentence(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  const m = cleaned.match(/^(.{1,180}?[.!?])(\s|$)/);
  return (m ? m[1] : cleaned).slice(0, 200);
}

export function parseAssistantResponse(content: string): AssistantSection[] {
  const trimmed = (content || "").trim();
  if (!trimmed) return [];

  // Split on markdown headings (H1–H4). Preserve the intro before first heading.
  const parts: { heading: string | null; body: string }[] = [];
  const headingRe = /^(#{1,4})\s+(.+)$/gm;
  let lastIndex = 0;
  let lastHeading: string | null = null;
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(trimmed)) !== null) {
    parts.push({ heading: lastHeading, body: trimmed.slice(lastIndex, match.index).trim() });
    lastHeading = match[2].trim();
    lastIndex = match.index + match[0].length;
  }
  parts.push({ heading: lastHeading, body: trimmed.slice(lastIndex).trim() });

  const sections: AssistantSection[] = [];

  // Intro block (before any heading)
  const intro = parts.shift();
  if (intro && intro.body) {
    const paragraphs = splitParagraphs(intro.body);
    const leadRaw = paragraphs.shift() || "";
    const leadFirst = firstSentence(leadRaw);
    sections.push({
      kind: "summary",
      text: stripEmoji(leadFirst),
      tone: detectTone(leadRaw),
    });

    // If the lead paragraph continued past the first sentence, keep the rest as a soft recommendation
    const restOfLead = leadRaw.slice(leadFirst.length).trim();
    const introBullets = extractBullets(intro.body);
    const restParas = paragraphs.join("\n\n");
    const combined = [restOfLead, stripBullets(restParas)].filter(Boolean).join("\n\n").trim();

    if (introBullets.length || combined) {
      sections.push({
        kind: "recommendation",
        title: "Here's the take",
        body: combined,
        items: introBullets,
      });
    }
  }

  for (const p of parts) {
    if (!p.heading && !p.body) continue;
    const kind = p.heading ? classifyHeading(p.heading) : "recommendation";
    const title = p.heading ? stripEmoji(p.heading) : "More";
    const items = extractBullets(p.body);
    const body = stripBullets(p.body);

    switch (kind) {
      case "tip":
        sections.push({
          kind: "tip",
          title,
          text: items.length ? items.join(" • ") : body,
        });
        break;
      case "avoid":
        sections.push({ kind: "avoid", title, items, body: items.length ? undefined : body });
        break;
      case "good":
        sections.push({ kind: "good", title, items, body: items.length ? undefined : body });
        break;
      case "details":
        sections.push({ kind: "details", title, body: p.body });
        break;
      default:
        sections.push({ kind: "recommendation", title, body, items });
    }
  }

  // If we somehow have zero sections, fall back to a single summary.
  if (sections.length === 0) {
    sections.push({ kind: "summary", text: trimmed, tone: "neutral" });
  }

  return sections;
}