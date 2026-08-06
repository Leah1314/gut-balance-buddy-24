
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Utensils, Scroll, Calendar } from "lucide-react";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useStoolLogs } from "@/hooks/useStoolLogs";
import { format } from "date-fns";
import { useTranslation } from 'react-i18next';
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  type: 'food' | 'stool';
  timestamp: string;
  title: string;
  content: string;
  score: number | null;
  details?: any;
}

const clampScore = (score: number) => Math.max(0, Math.min(100, Math.round(score)));

const stringifyAnalysis = (value: unknown) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
};

const normalizeScoreValue = (value: number, scale?: number) => {
  if (scale === 100 && value > 100 && value <= 1000) {
    return clampScore(value / 10);
  }

  if (scale === 10 || (!scale && value <= 10)) {
    return clampScore(value * 10);
  }

  return clampScore(value);
};

const extractScoreFromText = (value: unknown): number | null => {
  const text = stringifyAnalysis(value);
  if (!text) return null;

  const scoreWithScale = text.match(
    /\b(?:gut\s*(?:fit|health)?\s*score|gut\s*health\s*rating|stool\s*health\s*score|health\s*score|rating|score)\b[^\d]{0,24}(\d{1,3}(?:\.\d+)?)(?:\s*\/\s*(100|10)\b)?/i
  );

  if (scoreWithScale) {
    return normalizeScoreValue(Number(scoreWithScale[1]), scoreWithScale[2] ? Number(scoreWithScale[2]) : undefined);
  }

  const jsonScore = text.match(/\b(?:gutHealthRating|healthScore|score|rating)"?\s*[:=]\s*(\d{1,3}(?:\.\d+)?)/i);
  if (jsonScore) {
    return normalizeScoreValue(Number(jsonScore[1]));
  }

  return null;
};

const normalizeHistoricalScoreText = (value: unknown) => {
  const text = stringifyAnalysis(value);

  return text
    .replace(/Gut Health Rating:\s*(\d{1,2})\/10\b/gi, (_, score) => `Gut Fit Score: ${Number(score) * 10}/100`)
    .replace(/Health Score:\s*(\d{1,2})\/10\b/gi, (_, score) => `Stool Health Score: ${Number(score) * 10}/100`);
};

// Fallback scoring for manually logged entries without an AI score (matches Insights)
const BRISTOL_SCORES: Record<number, number> = {
  1: 30,
  2: 50,
  3: 85,
  4: 100,
  5: 70,
  6: 45,
  7: 25,
};

const estimateFoodScore = (text: string): number => {
  let score = 65;
  if (/pizza|burger|fries|chips|soda|candy|processed|fast food|fried|cake|donut|ice cream/i.test(text)) score -= 20;
  if (/apple|banana|oats|beans|broccoli|spinach|berries|whole grain|quinoa|sweet potato|vegetable|salad|yogurt|kefir|lentil/i.test(text)) score += 15;
  return clampScore(score);
};

const LogHistory = () => {
  const { t } = useTranslation();
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stoolLogs, setStoolLogs] = useState<any[]>([]);
  
  const { foodLogs, refreshFoodLogs } = useFoodLogs();
  const { getStoolLogs } = useStoolLogs();

  const fetchStoolLogs = async () => {
    try {
      const logs = await getStoolLogs();
      setStoolLogs(logs);
    } catch (error) {
      console.error('Error fetching stool logs:', error);
      setStoolLogs([]);
    }
  };

  const combineAndSortLogs = () => {
    const combinedLogs: LogEntry[] = [];

    // Add food logs
    if (foodLogs) {
      foodLogs.forEach(log => {
        combinedLogs.push({
          id: log.id,
          type: 'food',
          timestamp: log.created_at,
          title: t('history.foodEntry'),
          content: log.food_name,
          score: extractScoreFromText(log.analysis_result) ?? extractScoreFromText(log.description),
          details: {
            description: log.description,
            analysis_result: log.analysis_result,
            image_url: log.image_url
          }
        });
      });
    }

    // Add stool logs
    if (stoolLogs) {
      stoolLogs.forEach(log => {
        combinedLogs.push({
          id: log.id,
          type: 'stool',
          timestamp: log.created_at,
          title: t('history.stoolEntry'),
          content: log.notes || `Bristol Type ${log.bristol_type || 'N/A'}`,
          score: extractScoreFromText(log.notes),
          details: {
            bristol_type: log.bristol_type,
            color: log.color,
            consistency: log.consistency,
            notes: log.notes,
            image_url: log.image_url
          }
        });
      });
    }

    // Sort by timestamp (newest first)
    combinedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setLogEntries(combinedLogs);
  };

  useEffect(() => {
    fetchStoolLogs();
  }, []);

  useEffect(() => {
    const refreshLogs = () => {
      refreshFoodLogs();
      fetchStoolLogs();
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshLogs();
      }
    };

    window.addEventListener('gutly:logs-updated', refreshLogs);
    window.addEventListener('focus', refreshLogs);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.removeEventListener('gutly:logs-updated', refreshLogs);
      window.removeEventListener('focus', refreshLogs);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [refreshFoodLogs]);

  useEffect(() => {
    combineAndSortLogs();
  }, [foodLogs, stoolLogs]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshFoodLogs(), fetchStoolLogs()]);
    } catch (error) {
      console.error('Error refreshing logs:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return timestamp;
    }
  };

  const renderLogContent = (entry: LogEntry) => {
    if (entry.type === 'food') {
      return (
        <div className="space-y-1.5">
          <p className="text-[15px] font-medium text-foreground">{entry.content}</p>
          {entry.details?.description && (
            <p className="text-[13px] text-muted-foreground">{entry.details.description}</p>
          )}
          {entry.details?.analysis_result && (
            <p className="text-[13px] text-foreground/70 line-clamp-2">
              {normalizeHistoricalScoreText(entry.details.analysis_result)}
            </p>
          )}
        </div>
      );
    } else {
      const details = entry.details;
      return (
        <div className="space-y-1.5">
          {details?.notes && (
            <p className="text-[15px] font-medium text-foreground">{details.notes}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {details?.bristol_type && (
              <span className="text-[12px] px-2 py-0.5 rounded-full bg-primary-soft text-primary font-medium">
                Bristol Type {details.bristol_type}
              </span>
            )}
            {details?.bristol_type && (
              <span className="text-[12px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                1-7 classification
              </span>
            )}
            {details?.consistency && (
              <span className="text-[12px] px-2 py-0.5 rounded-full bg-muted text-foreground/70">
                {details.consistency}
              </span>
            )}
            {details?.color && (
              <span className="text-[12px] px-2 py-0.5 rounded-full bg-muted text-foreground/70">
                {details.color}
              </span>
            )}
          </div>
        </div>
      );
    }
  };

  const filters = [
    { id: 'all' as const, label: t('history.filterAll', 'All') },
    { id: 'food' as const, label: t('history.filterFood', 'Food') },
    { id: 'stool' as const, label: t('history.filterStool', 'Stool') },
  ];
  const [filter, setFilter] = useState<'all' | 'food' | 'stool'>('all');
  const visible = filter === 'all' ? logEntries : logEntries.filter(e => e.type === filter);

  return (
    <div className="space-y-4">
      {/* Filter chips + refresh */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1.5 overflow-x-auto no-scrollbar">
          {filters.map(f => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-3.5 h-8 rounded-full text-[13px] font-medium transition-all active:scale-[0.97] shrink-0",
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-muted text-foreground/70 hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
        </Button>
      </div>

      {/* Log Entries */}
      {visible.length === 0 ? (
        <div className="rounded-[var(--radius)] bg-card shadow-soft p-8 text-center animate-fade-in">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary-soft flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <p className="text-[15px] text-foreground font-medium mb-1">
            {t('history.noLogsFound')}
          </p>
          <p className="text-[13px] text-muted-foreground">
            {t('history.useTabs')}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visible.map((entry) => (
            <div
              key={entry.id}
              className="rounded-[var(--radius)] bg-card shadow-soft p-4 animate-fade-in flex items-start gap-3"
            >
              <div
                className={cn(
                  "shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center",
                  entry.type === 'food' ? "bg-primary-soft" : "bg-accent/20"
                )}
              >
                {entry.type === 'food' ? (
                  <Utensils className="w-5 h-5 text-primary" />
                ) : (
                  <Scroll className="w-5 h-5 text-accent-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-[15px] font-semibold text-foreground truncate">
                    {entry.title}
                  </h3>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {entry.score !== null && (
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                        entry.type === 'food'
                          ? "bg-primary-soft text-primary"
                          : "bg-accent/20 text-accent-foreground"
                      )}>
                        {entry.score}/100
                      </span>
                    )}
                    <span className="text-[11px] text-muted-foreground tabular-nums">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                </div>
                {renderLogContent(entry)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogHistory;
