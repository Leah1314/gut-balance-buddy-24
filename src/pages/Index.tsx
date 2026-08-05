import { useEffect, useMemo, useState } from "react";
import {
  Activity,
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
import Analytics from "@/components/Analytics";
import UserMenu from "@/components/UserMenu";
import LanguageSelector from "@/components/LanguageSelector";
import GutlyMascot from "@/components/gutly/GutlyMascot";
import GutlyLogoMark from "@/components/gutly/GutlyLogoMark";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useStoolLogs } from "@/hooks/useStoolLogs";

type MainView = "today" | "insights" | "coach" | "profile";
type NavView = MainView | "log";
type LogView = "food" | "stool";
type TimelineItem = {
  id: string;
  createdAt: string;
  time: string;
  title: string;
  detail: string;
  icon: typeof Utensils;
  tone: string;
};
type DayActivity = {
  key: string;
  label: string;
  count: number;
};

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

const formatTimelineTime = (value: string) =>
  new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const formatHeroDate = (date: Date) =>
  date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

const getGreeting = (date: Date) => {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const formatTimelineDay = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const getFoodTitle = (log: any) => {
  const name = log.food_name || "Food note";
  return name.length > 42 ? `${name.slice(0, 39).trim()}…` : name;
};

const getFoodDetail = (log: any) => {
  const parts = ["Food log"];
  const description = typeof log.description === "string" ? log.description.trim() : "";
  if (description) {
    parts.push(description.length > 48 ? `${description.slice(0, 45).trim()}…` : description);
  }
  parts.push(formatTimelineDay(log.created_at));
  return parts.join(" · ");
};

const getStoolDetail = (log: any) => {
  const parts = ["Stool log"];
  if (log.consistency) parts.push(log.consistency);
  if (log.color) parts.push(log.color);
  parts.push(formatTimelineDay(log.created_at));
  return parts.join(" · ");
};

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const getStartOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const getDaysAgo = (date: Date, days: number) => {
  const next = getStartOfDay(date);
  next.setDate(next.getDate() - days);
  return next;
};

const getStoolTypeLabel = (type?: number | null) => {
  if (!type) return "--";
  return `Type ${type}`;
};

const getStoolStatus = (type?: number | null) => {
  if (!type) return "No log";
  if (type >= 3 && type <= 4) return "Normal";
  if (type === 2 || type === 5) return "Watch";
  return "Check";
};

const getSymptomSeverityFromNotes = (notes?: string | null) => {
  if (!notes?.trim()) return null;
  if (/\b(severe|intense|bad|worse|painful)\b/i.test(notes)) return { label: "Severe", badge: "High" };
  if (/\b(moderate|medium|some|bloated|bloating|cramp|pain|gas|reflux|heartburn)\b/i.test(notes)) {
    return { label: "Moderate", badge: "Medium" };
  }
  if (/\b(mild|little|slight|minor|comfortable|normal|fine|ok)\b/i.test(notes)) return { label: "Mild", badge: "Low" };
  return { label: "Logged", badge: "Logged" };
};

const getSymptomSignal = (symptomNotes?: string | null, stoolLog?: any) => {
  const noteSignal = getSymptomSeverityFromNotes(symptomNotes);
  if (noteSignal) return noteSignal;

  const type = stoolLog?.bristol_type;
  const consistency = `${stoolLog?.consistency ?? ""} ${stoolLog?.notes ?? ""}`.toLowerCase();

  if (!type && !consistency.trim()) return { label: "None logged", badge: "Clear" };

  if (type === 7 || /\b(watery|diarrhea|diarrhoea|urgent)\b/i.test(consistency)) {
    return { label: "Diarrhea", badge: "High" };
  }

  if (type === 6) {
    return { label: "Loose", badge: "Medium" };
  }

  if (type === 1 || /\b(hard|constipat|painful)\b/i.test(consistency)) {
    return { label: "Constipation", badge: "High" };
  }

  if (type === 2) {
    return { label: "Constipation", badge: "Medium" };
  }

  if (type === 5) {
    return { label: "Soft", badge: "Mild" };
  }

  if (type >= 3 && type <= 4) {
    return { label: "Normal", badge: "Clear" };
  }

  return { label: "Logged", badge: "Check" };
};

const getRecentLogCount = (items: { created_at: string }[], start: Date, end: Date) =>
  items.filter((item) => {
    const createdAt = new Date(item.created_at);
    return createdAt >= start && createdAt < end;
  }).length;

const getLoggedDayCount = (items: { created_at: string }[], start: Date, end: Date) => {
  const days = new Set<string>();
  items.forEach((item) => {
    const createdAt = new Date(item.created_at);
    if (createdAt >= start && createdAt < end) {
      days.add(createdAt.toDateString());
    }
  });
  return days.size;
};

const getWeekActivity = (items: { created_at: string }[], today: Date): DayActivity[] =>
  Array.from({ length: 7 }, (_, index) => {
    const day = getDaysAgo(today, 6 - index);
    const nextDay = new Date(day);
    nextDay.setDate(day.getDate() + 1);
    return {
      key: day.toISOString(),
      label: day.toLocaleDateString([], { weekday: "short" }).slice(0, 1),
      count: getRecentLogCount(items, day, nextDay),
    };
  });

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
  const { foodLogs } = useFoodLogs();
  const { getStoolLogs } = useStoolLogs();
  const [stoolLogs, setStoolLogs] = useState<any[]>([]);
  const today = useMemo(() => new Date(), []);
  const heroDate = useMemo(() => formatHeroDate(today), [today]);
  const greeting = useMemo(() => getGreeting(today), [today]);

  useEffect(() => {
    let isMounted = true;

    const loadStoolLogs = async () => {
      const logs = await getStoolLogs();
      if (isMounted) {
        setStoolLogs(logs);
      }
    };

    loadStoolLogs();

    return () => {
      isMounted = false;
    };
  }, []);

  const timelineItems = useMemo<TimelineItem[]>(() => {
    const foodItems: TimelineItem[] = foodLogs.map((log) => ({
      id: `food-${log.id}`,
      createdAt: log.created_at,
      time: formatTimelineTime(log.created_at),
      title: getFoodTitle(log),
      detail: getFoodDetail(log),
      icon: Utensils,
      tone: "bg-orange-100 text-orange-700",
    }));

    const stoolItems: TimelineItem[] = stoolLogs.map((log) => ({
      id: `stool-${log.id}`,
      createdAt: log.created_at,
      time: formatTimelineTime(log.created_at),
      title: `Stool type ${log.bristol_type ?? "recorded"}`,
      detail: getStoolDetail(log),
      icon: Scroll,
      tone: "bg-amber-100 text-amber-800",
    }));

    return [...foodItems, ...stoolItems]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [foodLogs, stoolLogs]);

  const timelineTitle =
    timelineItems.length > 0 &&
    timelineItems.every((item) => new Date(item.createdAt).toDateString() === new Date().toDateString())
      ? "Today’s timeline"
      : "Latest timeline";

  const stoolEntries = useMemo(
    () => stoolLogs.filter((log) => log.bristol_type !== null && log.bristol_type !== undefined),
    [stoolLogs],
  );
  const symptomEntries = useMemo(
    () => stoolLogs.filter((log) => log.notes?.trim() && (log.bristol_type === null || log.bristol_type === undefined)),
    [stoolLogs],
  );
  const latestStool = stoolEntries[0];
  const latestSymptom = symptomEntries[0];
  const symptomSignal = getSymptomSignal(latestSymptom?.notes, latestStool);
  const todayFoodCount = foodLogs.filter((log) => isSameDay(new Date(log.created_at), today)).length;
  const mealsLabel = todayFoodCount > 0 ? `${todayFoodCount} logged` : "No meal yet";
  const mealsBadge = todayFoodCount > 0 ? "Today" : "Add meal";
  const todayHasStoolSignal = stoolEntries.some((log) => {
    const signal = getSymptomSignal(undefined, log);
    return isSameDay(new Date(log.created_at), today) && signal.label !== "Normal" && signal.label !== "None logged";
  });
  const todayLoggedCount = [
    foodLogs.some((log) => isSameDay(new Date(log.created_at), today)),
    stoolEntries.some((log) => isSameDay(new Date(log.created_at), today)),
    symptomEntries.some((log) => isSameDay(new Date(log.created_at), today)) || todayHasStoolSignal,
  ].filter(Boolean).length;
  const remainingToday = Math.max(0, 3 - todayLoggedCount);
  const todayBadge = remainingToday === 0 ? "Done" : `${remainingToday} left`;
  const allActivityLogs = useMemo(
    () => [...foodLogs, ...stoolEntries, ...symptomEntries],
    [foodLogs, stoolEntries, symptomEntries],
  );
  const currentWeekStart = getDaysAgo(today, 6);
  const tomorrowStart = getDaysAgo(today, -1);
  const previousWeekStart = getDaysAgo(today, 13);
  const currentLoggedDays = getLoggedDayCount(allActivityLogs, currentWeekStart, tomorrowStart);
  const previousLoggedDays = getLoggedDayCount(allActivityLogs, previousWeekStart, currentWeekStart);
  const consistencyScore = Math.round((currentLoggedDays / 7) * 100);
  const previousConsistencyScore = Math.round((previousLoggedDays / 7) * 100);
  const consistencyDelta = consistencyScore - previousConsistencyScore;
  const weekActivity = getWeekActivity(allActivityLogs, today);
  const rhythmTitle =
    currentLoggedDays >= 5
      ? "Your gut rhythm is steady"
      : currentLoggedDays >= 3
        ? "Your gut rhythm is building"
        : "Start building your gut rhythm";
  const patternTitle =
    foodLogs.length > 0 && stoolEntries.length > 0
      ? "Meal and stool logs are ready for pattern spotting."
      : "Log meals and stool together to unlock better patterns.";
  const patternDescription =
    foodLogs.length > 0 && stoolEntries.length > 0
      ? "Gutly can compare what you eat with digestion timing as your history grows."
      : "This is an association from your recent logs, not a diagnosis.";

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <section className="relative overflow-hidden rounded-[24px] bg-primary px-5 py-5 text-primary-foreground shadow-card sm:rounded-[28px] sm:px-8 sm:py-9">
        <div className="relative z-10 max-w-xl">
          <Badge className="mb-3 border-white/20 bg-white/15 text-white hover:bg-white/15 sm:mb-4">
            {heroDate}
          </Badge>
          <h1 className="max-w-lg text-[2rem] font-semibold leading-tight tracking-tight sm:text-4xl">
            {greeting}, Leah.
          </h1>
          <p className="mt-2 max-w-md text-base leading-relaxed text-white/80 sm:mt-3">
            Your week is looking consistent. One quick check-in will keep today’s picture complete.
          </p>
          <QuickLogDrawer>
            <Button
              variant="secondary"
              size="lg"
              className="mt-4 bg-white text-primary hover:bg-white/90 sm:mt-6"
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

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="gap-2 p-2.5 min-[390px]:p-3 sm:gap-3 sm:p-5">
            <div className="flex items-center justify-between gap-1.5">
              <span className="flex size-8 items-center justify-center rounded-2xl bg-primary-soft text-primary sm:size-10">
                <Check aria-hidden="true" />
              </span>
              <Badge variant="secondary" className="hidden text-[11px] min-[390px]:inline-flex sm:inline-flex">{todayBadge}</Badge>
            </div>
            <div>
              <CardDescription className="text-[11px] leading-tight sm:text-sm">Today</CardDescription>
              <CardTitle className="mt-0.5 text-[15px] leading-tight min-[390px]:text-base sm:mt-1 sm:text-xl">{todayLoggedCount}/3 logged</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="gap-2 p-2.5 min-[390px]:p-3 sm:gap-3 sm:p-5">
            <div className="flex items-center justify-between gap-1.5">
              <span className="flex size-8 items-center justify-center rounded-2xl bg-orange-100 text-orange-700 sm:size-10">
                <Utensils aria-hidden="true" />
              </span>
              <Badge variant="secondary" className="text-[11px]">{mealsBadge}</Badge>
            </div>
            <div>
              <CardDescription className="text-[11px] leading-tight sm:text-sm">Meals</CardDescription>
              <CardTitle className="mt-0.5 text-[15px] leading-tight min-[390px]:text-base sm:mt-1 sm:text-xl">{mealsLabel}</CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="gap-2 p-2.5 min-[390px]:p-3 sm:gap-3 sm:p-5">
            <div className="flex items-center justify-between gap-1.5">
              <span className="flex size-8 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 sm:size-10">
                <HeartPulse aria-hidden="true" />
              </span>
              <Badge className="bg-primary-soft text-[11px] text-primary hover:bg-primary-soft">{symptomSignal.badge}</Badge>
            </div>
            <div>
              <CardDescription className="text-[11px] leading-tight sm:text-sm">Symptoms</CardDescription>
              <CardTitle className="mt-0.5 text-[15px] leading-tight min-[390px]:text-base sm:mt-1 sm:text-xl">{symptomSignal.label}</CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-[1.35fr_0.65fr]">
        <Card className="border border-border/50 shadow-none">
          <CardHeader className="p-6 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardDescription>This week</CardDescription>
                <CardTitle className="mt-1 text-2xl">{rhythmTitle}</CardTitle>
              </div>
              <Badge className="bg-primary-soft text-primary hover:bg-primary-soft">
                {consistencyDelta > 0 ? "+" : ""}{consistencyDelta}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5 px-6 pb-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Consistency score</span>
                <span className="font-semibold">{consistencyScore} / 100</span>
              </div>
              <Progress value={consistencyScore} className="h-2.5" />
            </div>
            <div className="grid grid-cols-7 gap-2" aria-label="Seven day activity">
              {weekActivity.map((day) => (
                <div key={day.key} className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      "w-full rounded-xl transition-colors",
                      day.count >= 3 ? "h-12 bg-primary/80" : day.count === 2 ? "h-10 bg-primary/65" : day.count === 1 ? "h-8 bg-primary/35" : "h-7 bg-muted"
                    )}
                  />
                  <span className="text-xs text-muted-foreground">{day.label}</span>
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
            <CardTitle className="text-xl leading-snug">{patternTitle}</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {patternDescription}
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
            <CardTitle className="mt-1 text-xl">{timelineTitle}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onInsights}>View history</Button>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          {timelineItems.length > 0 ? (
            <div className="flex flex-col">
              {timelineItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.id}>
                    <div className="grid grid-cols-[64px_38px_1fr] items-center gap-3 py-3 sm:grid-cols-[72px_40px_1fr]">
                      <span className="text-xs font-medium text-muted-foreground">{item.time}</span>
                      <span className={cn("flex size-9 items-center justify-center rounded-2xl sm:size-10", item.tone)}>
                        <Icon aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{item.title}</p>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{item.detail}</p>
                      </div>
                    </div>
                    {index < timelineItems.length - 1 && <Separator />}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl bg-muted/50 px-4 py-5 text-center">
              <p className="font-medium">No recent logs yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Log a meal or stool entry and it will appear here automatically.
              </p>
            </div>
          )}
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
                onClick={() => setActiveMainView(item.id as MainView)}
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
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-3 min-[390px]:px-4 sm:h-16 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5 lg:hidden">
            <GutlyLogoMark className="size-7 shrink-0 min-[390px]:size-8 sm:size-9" />
            <span className="truncate font-display text-[1.55rem] font-semibold leading-none min-[390px]:text-[1.7rem] sm:text-2xl">Gutly</span>
          </div>
          <div className="hidden lg:block">
            <p className="text-sm text-muted-foreground">Personal wellness workspace</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 min-[390px]:gap-2">
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

      <main className="pb-24 lg:ml-64 lg:pb-10">
        <div className="mx-auto w-full max-w-6xl px-3 py-3 min-[390px]:px-4 sm:px-6 sm:py-8">{renderContent()}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/90 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl min-[390px]:px-3 lg:hidden" aria-label="Primary navigation">
        <div className="mx-auto grid w-full max-w-md grid-cols-4 gap-1 py-1.5">
          {mainNavigation.map((item) => {
            const Icon = item.icon;
            const active = activeMainView === item.id;
            if (item.id === "log") {
              return (
                <QuickLogDrawer key={item.id}>
                  <Button variant="ghost" className="h-auto min-h-12 flex-col gap-0.5 rounded-2xl px-2 py-1 text-xs text-muted-foreground">
                    <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
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
                onClick={() => setActiveMainView(item.id as MainView)}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1 text-xs font-medium",
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
