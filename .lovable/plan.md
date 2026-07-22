## Gutly Visual Redesign Plan

Scope: visual/presentation only. All features, routes, AI workflows, edge functions, DB schema, hooks and state stay exactly as they are. Every file changed is a UI component, style token, or layout wrapper.

### 1. Design tokens & typography (foundation)

**`src/index.css`** — replace the current palette with the warm Gutly system:
- `--background: 45 33% 97%` (#FAF9F5)
- `--card: 0 0% 100%` (#FFFFFF)
- `--primary: 149 39% 40%` (#3F8F68) + `--primary-soft: 108 40% 89%` (#DDEFD9)
- `--accent: 30 100% 68%` (#FFB45C)
- `--foreground: 240 6% 10%` (#1D1D1F), muted-foreground softer gray
- `--radius: 1.25rem` (20px), add `--shadow-soft`, `--shadow-card`
- Remove hardcoded `#F9F8F4` / `#4A7C59` `body` overrides so semantic tokens win
- Add utility classes: `.card-soft`, `.text-hero`, `.text-section`, `.text-card-title`, `.text-body`, `.text-caption`, `.number-emphasis`

**`index.html`** — add Poppins from Google Fonts (400/500/600/700).
**`tailwind.config.ts`** — set `fontFamily.sans = ['Poppins', ...]`; extend `boxShadow.soft/card`, `borderRadius.xl2 = 20px`, add `primary-soft`, `accent` colors, and the `fade-in`, `scale-in`, `count-up`, `progress-fill` keyframes/animations.

### 2. Shared primitives

- **`src/components/ui/card.tsx`** — bump default radius to 20px, soft shadow, generous padding, no hard border.
- **`src/components/ui/button.tsx`** — larger default height (h-12), pill radius, softer shadows, ripple-ish `active:scale-[0.98]` transition; add `soft` variant using `primary-soft`.
- New **`src/components/gutly/GutlyMascot.tsx`** — small SVG/illustration mascot with `wave` animation, used in empty states and AI-speaking moments.
- New **`src/components/gutly/GutlySays.tsx`** — mascot + speech bubble card ("Great lunch! This meal looks much healthier than yesterday.") used before raw data.
- New **`src/components/gutly/StatNumber.tsx`** — big number-first display (`82` above `Gut Score`) with count-up animation.
- New **`src/components/gutly/SectionCard.tsx`** — icon + title + short description + primary action wrapper used across screens.

### 3. Screen-level visual rework (no logic changes)

For each screen we only restructure JSX/classes and swap in the primitives above. All hooks, handlers, props, and data flow are untouched.

- **`src/pages/Index.tsx`** — replace inline `style={{...}}` colors with tokens; convert track sub-tabs into a soft segmented control (rounded, `primary-soft` for active); apply Apple-HIG-style bottom nav (taller, blurred white, subtle top divider, active pill under icon), keep 4 tabs and handlers unchanged.
- **`src/pages/Auth.tsx`** — centered card, Gutly wordmark + mascot, larger hierarchy, keep email/phone tabs and OTP flow intact.
- **`src/components/FoodAnalyzer.tsx` + `FoodImageAnalyzer.tsx`** — meal photo becomes the hero (~40% viewport, rounded 20px, soft shadow). Below: `GutlySays` intro → big `StatNumber` for Gut Score → "What's good" / "What to improve" chips → primary CTA. Nutrition table moves to a collapsed "Details" card. No changes to analysis calls.
- **`src/components/StoolTracker.tsx` + `stool/*`** — each step (`BristolStoolChart`, `ColorSelector`, `ConsistencySelector`, `PhotoUpload`, `NotesSection`, `SuccessCard`, `DateTimeHeader`) rewrapped in `SectionCard`, softer selection states using `primary-soft`, larger tap targets, keep all props/state.
- **`src/components/ChatPage.tsx`** — assistant messages: no bubble, plain body text on background; user messages: `primary` bg with `primary-foreground`; align camera button (already 52px) inside a soft composer card with generous padding, keep image upload + send logic.
- **`src/components/Analytics.tsx` + `ProgressChart.tsx` + `MonthlyActivityCalendar.tsx`** — lead with `GutlySays` observation, then cards: "What improved", "Foods helping you", "Foods causing symptoms". Charts move below. Calendar cells: rounded, soft, `primary-soft` fills for active days. Backdate dialog kept.
- **`src/components/HealthProfile.tsx` / `UserMenu.tsx` / `LanguageSelector.tsx` / `LogHistory.tsx` / `EducationHub.tsx` / `QuickQuestions.tsx` / `WellnessCheck.tsx` / `SymptomTracker.tsx` / `TestResultsUpload.tsx` / `GutHealthCoach.tsx` / `FoodDiary.tsx` / `ImageUploadDialog.tsx` / `StoolImageAnalyzer.tsx`** — same treatment: token colors, `SectionCard`, Poppins hierarchy, larger spacing, Lucide-only icons (emoji only inside `GutlySays`).

### 4. Motion

Add via existing Tailwind animate utilities (no new deps):
- `animate-fade-in` on screen mount and card enter
- Count-up on `StatNumber` (simple `requestAnimationFrame` inside the component)
- Progress bar width transition on Gut Score
- `active:scale-[0.98]` on buttons
- Mascot `wave` keyframe (rotate ±10°)
- Small confetti burst component triggered on log-success in `SuccessCard` (CSS-only, no library)

### 5. Cleanup rules applied everywhere

- Remove hardcoded hex `style={{ backgroundColor:'#...' }}` and `text-white`/`bg-black` usages; replace with semantic classes.
- Consolidate icons to Lucide; strip stray emojis outside `GutlySays`.
- Increase paddings/margins ~35% (e.g. `p-4`→`p-6`, `space-y-4`→`space-y-6`, `gap-2`→`gap-3`).

### Out of scope (explicitly unchanged)

Supabase client, edge functions, all hooks (`useAuth`, `useFoodLogs`, `useStoolLogs`, `useHealthProfile`, `useTestResults`), i18n keys/values, routing, auth guards, RLS, migrations, package.json deps.

### Verification

- `tsgo` / build passes
- Playwright screenshot pass on `/auth`, `/` (each main tab) at 393×717 to confirm the new visual language matches the reference concept
- Manual click-through: log a meal, log a stool entry, open chat, open analytics — all flows still work

### Deliverable order

1. Tokens + Poppins + Tailwind config
2. Shared primitives (`GutlyMascot`, `GutlySays`, `StatNumber`, `SectionCard`, updated `card`/`button`)
3. Shell: `Index.tsx` bottom nav + track segmented control, `Auth.tsx`
4. Feature screens in the order most-visible-first: FoodAnalyzer → ChatPage → StoolTracker → Analytics/Calendar → HealthProfile → remaining components
5. Motion polish + Playwright verification
