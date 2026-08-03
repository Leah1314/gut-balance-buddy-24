import { useState } from "react";
import {
  Activity,
  Apple,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleUserRound,
  FileText,
  HeartPulse,
  Home,
  MessageCircle,
  Plus,
  Scroll,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import FoodAnalyzer from "@/components/FoodAnalyzer";
import StoolTracker from "@/components/StoolTracker";
import ChatPage from "@/components/ChatPage";
import HealthProfile from "@/components/HealthProfile";
import LogHistory from "@/components/LogHistory";
import Analytics from "@/components/Analytics";
import UserMenu from "@/components/UserMenu";
import LanguageSelector from "@/components/LanguageSelector";
import GutlyMascot from "@/components/gutly/GutlyMascot";
import GutlyLogoMark from "@/components/gutly/GutlyLogoMark";

type MainView = "today" | "insights" | "coach" | "profile";
type NavView = MainView | "log";
type LogView = "food" | "stool";

const mainNavigation = [
  { id: "today" as NavView, label: "Today", icon: Home },
  { id: "log" as NavView, label: "Log", icon: Plus },
  { id: "insights" as NavView, label: "Insights", icon: BarChart3 },
  { id: "coach" as NavView, label: "Coach", icon: MessageCircle },
];

const logOptions = [
  {
    id: "food",
    label: "Meal",
    description: "What you ate or drank",
    icon: Utensils,
    tone: "bg-orange-100 text-orange-700",
  },
  {
    id: "symptom",
    label: "Symptom",
    description: "How your body feels",
    icon: HeartPulse,
    tone: "bg-rose-100 text-rose-700",
  },
  {
    id: "stool",
    label: "Stool",
    description: "Type, color and comfort",
    icon: Scroll,
    tone: "bg-amber-100 text-amber-800",
  },
  {
    id: "wellness",
    label: "Wellness",
    description: "Mood, sleep and stress",
    icon: Activity,
    tone: "bg-sky-100 text-sky-700",
  },
  {
    id: "test",
    label: "Test result",
    description: "Upload a health report",
    icon: FileText,
    tone: "bg-violet-100 text-violet-700",
  },
];

function QuickLogDrawer({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [selectedLogView, setSelectedLogView] = useState<LogView | null>(null);

  const resetDrawer = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSelectedLogView(null);
    }
  };

  const choose = (id: string) => {
    if (id === "food" || id === "stool") {
      setSelectedLogView(id);
    }
  };

  return (
    <Drawer open={open} onOpenChange={resetDrawer}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="mx-auto max-h-[92svh] max-w-2xl rounded-t-[28px] border-border/60">
        <DrawerHeader className="px-6 pb-3 pt-2 text-left">
          {selectedLogView ? (
            <div className="flex items-start gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-0.5 rounded-full"
                aria-label="Back to log options"
                onClick={() => setSelectedLogView(null)}
              >
                <ArrowLeft aria-hidden="true" />
              </Button>
              <div>
                <DrawerTitle className="text-2xl">
                  {selectedLogView === "food" ? "Log food" : "Log stool"}
                </DrawerTitle>
                <DrawerDescription>
                  Add the detail and return to your dashboard when you are done.
                </DrawerDescription>
              </div>
            </div>
          ) : (
            <>
              <DrawerTitle className="text-2xl">What would you like to log?</DrawerTitle>
              <DrawerDescription>
                Choose one. Most entries take less than a minute.
              </DrawerDescription>
            </>
          )}
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-8 sm:px-6">
          {selectedLogView ? (
            selectedLogView === "food" ? <FoodAnalyzer /> : <StoolTracker />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {logOptions.map((option) => {
                const Icon = option.icon;
                const enabled = option.id === "food" || option.id === "stool";
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => choose(option.id)}
                    disabled={!enabled}
                    className="group flex min-h-20 items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 text-left transition-colors hover:border-primary/30 hover:bg-primary-soft/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className={cn("flex size-11 items-center justify-center rounded-2xl", option.tone)}>
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-foreground">{option.label}</span>
                      <span className="block text-sm text-muted-foreground">{option.description}</span>
                    </span>
                    {enabled ? (
                      <ChevronRight className="text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    ) : (
                      <Badge variant="secondary">Soon</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function TodayOverview({
  onInsights,
  onCoach,
}: {
  onInsights: () => void;
  onCoach: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[28px] bg-primary px-6 py-7 text-primary-foreground shadow-card sm:px-8 sm:py-9">
        <div className="relative z-10 max-w-xl">
          <Badge className="mb-4 border-white/20 bg-white/15 text-white hover:bg-white/15">
            Tuesday, July 28
          </Badge>
          <h1 className="max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
            Good afternoon, Leah.
          </h1>
          <p className="mt-3 max-w-md text-base leading-relaxed text-white/80">
            Your week is looking consistent. One quick check-in will keep today’s picture complete.
          </p>
          <QuickLogDrawer>
            <Button
              variant="secondary"
              size="lg"
              className="mt-6 bg-white text-primary hover:bg-white/90"
            >
              <Plus data-icon="inline-start" />
              Log something
            </Button>
          </QuickLogDrawer>
        </div>
        <div className="absolute -bottom-6 right-4 hidden opacity-90 sm:block">
          <GutlyMascot size={150} waving={false} />
        </div>
        <div className="absolute -right-16 -top-24 size-64 rounded-full bg-white/10" />
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <Check aria-hidden="true" />
              </span>
              <Badge variant="secondary">1 remaining</Badge>
            </div>
            <div>
              <CardDescription>Today’s picture</CardDescription>
              <CardTitle className="mt-1 text-xl">2 of 3 logged</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                <Scroll aria-hidden="true" />
              </span>
              <Badge variant="secondary">Normal</Badge>
            </div>
            <div>
              <CardDescription>Last bowel movement</CardDescription>
              <CardTitle className="mt-1 text-xl">Type 4 · 9:10 AM</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="gap-3 p-5">
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">
                <HeartPulse aria-hidden="true" />
              </span>
              <Badge className="bg-primary-soft text-primary hover:bg-primary-soft">Low</Badge>
            </div>
            <div>
              <CardDescription>Symptoms today</CardDescription>
              <CardTitle className="mt-1 text-xl">Mild bloating</CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardDescription>This week</CardDescription>
                <CardTitle className="mt-1 text-2xl">Your gut rhythm is steadier</CardTitle>
              </div>
              <Badge className="bg-primary-soft text-primary hover:bg-primary-soft">+12%</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 px-6 pb-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Consistency score</span>
                <span className="font-semibold">78 / 100</span>
              </div>
              <Progress value={78} className="h-2.5" />
            </div>
            <div className="grid grid-cols-7 gap-2" aria-label="Seven day activity">
              {["W", "T", "F", "S", "S", "M", "T"].map((day, index) => (
                <div key={`${day}-${index}`} className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-full rounded-xl",
                      index < 5 ? "h-12 bg-primary/80" : index === 6 ? "h-9 bg-primary/35" : "h-7 bg-muted"
                    )}
                  />
                  <span className="text-xs text-muted-foreground">{day}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t border-border/50 px-6 py-4">
            <Button variant="ghost" className="ml-auto" onClick={onInsights}>
              View all insights
              <ArrowRight data-icon="inline-end" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="border border-primary/15 bg-primary-soft/35 shadow-none">
          <CardHeader className="p-6 pb-3">
            <span className="mb-2 flex size-10 items-center justify-center rounded-2xl bg-card text-primary shadow-soft">
              <Sparkles aria-hidden="true" />
            </span>
            <CardDescription>Pattern worth noticing</CardDescription>
            <CardTitle className="text-xl leading-snug">Fiber-rich breakfasts align with calmer afternoons.</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              This is an association from your recent logs, not a diagnosis.
            </p>
          </CardContent>
          <CardFooter className="px-6 pb-6">
            <Button variant="outline" className="w-full bg-card" onClick={onCoach}>
              Ask your coach
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="border border-border/50 shadow-none">
        <CardHeader className="flex-row items-center justify-between gap-4 p-6 pb-4">
          <div>
            <CardDescription>Recent activity</CardDescription>
            <CardTitle className="mt-1 text-xl">Today’s timeline</CardTitle>
          </div>
          <Button variant="ghost" size="sm">View history</Button>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="flex flex-col">
            {[
              { time: "8:10 AM", title: "Oats, berries and yogurt", detail: "Breakfast · 3 plants", icon: Utensils },
              { time: "10:45 AM", title: "Feeling comfortable", detail: "Symptom check-in · Mild bloating", icon: HeartPulse },
              { time: "1:20 PM", title: "Grain bowl and greens", detail: "Lunch · 4 plants", icon: Apple },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.time}>
                  <div className="grid grid-cols-[72px_40px_1fr] items-center gap-3 py-3">
                    <span className="text-xs font-medium text-muted-foreground">{item.time}</span>
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-muted text-foreground">
                      <Icon aria-hidden="true" />
                    </span>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                  {index < 2 && <Separator />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Alert className="border-border/60 bg-card">
        <ShieldCheck className="text-primary" aria-hidden="true" />
        <AlertDescription>
          Gutly provides wellness insights, not medical diagnosis. Seek professional care for persistent or severe symptoms.
        </AlertDescription>
      </Alert>
    </div>
  );
}

const Index = () => {
  const [activeMainView, setActiveMainView] = useState<MainView>("today");

  const renderContent = () => {
    if (activeMainView === "today") {
      return (
        <TodayOverview
          onInsights={() => setActiveMainView("insights")}
          onCoach={() => setActiveMainView("coach")}
        />
      );
    }
    if (activeMainView === "insights") {
      return <Analytics onSwitchToChat={() => setActiveMainView("coach")} />;
    }
    if (activeMainView === "coach") return <ChatPage />;
    if (activeMainView === "profile") return <HealthProfile />;
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border/60 bg-card px-4 py-6 lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-2">
          <GutlyLogoMark />
          <div>
            <p className="font-display text-2xl font-semibold leading-none">Gutly</p>
            <p className="mt-1 text-xs text-muted-foreground">Your gut health companion</p>
          </div>
        </div>
        <nav className="mt-9 flex flex-col gap-1" aria-label="Primary navigation">
          {mainNavigation.map((item) => {
            const Icon = item.icon;
            const active = activeMainView === item.id;
            if (item.id === "log") {
              return (
                <QuickLogDrawer key={item.id}>
                  <button
                    type="button"
                    className="flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <Icon aria-hidden="true" />
                    {item.label}
                  </button>
                </QuickLogDrawer>
              );
            }
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveMainView(item.id)}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-medium transition-colors",
                  active ? "bg-primary-soft text-primary-soft-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <Card className="mt-auto border border-primary/15 bg-primary-soft/35 shadow-none">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base">Your data stays yours</CardTitle>
            <CardDescription>Review privacy and export options anytime.</CardDescription>
          </CardHeader>
          <CardFooter className="p-4 pt-2">
            <Button variant="ghost" size="sm" className="px-0 text-primary">Privacy settings</Button>
          </CardFooter>
        </Card>
      </aside>

      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/85 backdrop-blur-xl lg:ml-64">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <GutlyLogoMark className="size-9" />
            <span className="font-display text-2xl font-semibold">Gutly</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm text-muted-foreground">Personal wellness workspace</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <UserMenu />
            <Button
              variant={activeMainView === "profile" ? "soft" : "ghost"}
              size="icon"
              aria-label="Open health profile"
              aria-pressed={activeMainView === "profile"}
              onClick={() => setActiveMainView("profile")}
            >
              <CircleUserRound aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>

      <main className="pb-28 lg:ml-64 lg:pb-10">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{renderContent()}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/90 px-3 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden" aria-label="Primary navigation">
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-1 py-2">
          {mainNavigation.map((item) => {
            const Icon = item.icon;
            const active = activeMainView === item.id;
            if (item.id === "log") {
              return (
                <QuickLogDrawer key={item.id}>
                  <Button variant="ghost" className="h-auto min-h-14 flex-col gap-1 rounded-2xl px-2 py-1 text-xs text-muted-foreground">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Plus aria-hidden="true" />
                    </span>
                    Log
                  </Button>
                </QuickLogDrawer>
              );
            }
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveMainView(item.id)}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1 text-xs font-medium",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Index;
