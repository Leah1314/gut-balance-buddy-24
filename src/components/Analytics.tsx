import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, MessageCircle, Calendar, Target, Apple, Heart, TrendingDown, Sparkles } from 'lucide-react';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useStoolLogs } from '@/hooks/useStoolLogs';
import MonthlyActivityCalendar from './MonthlyActivityCalendar';
import { useTranslation } from 'react-i18next';
import SectionCard from './gutly/SectionCard';
import { cn } from '@/lib/utils';

interface DayScore {
  date: string;
  displayDate: string;
  score: number | null;
  foodScore: number | null;
  stoolScore: number | null;
}

interface FoodSummary {
  totalMeals: number;
  varietyScore: number;
  topFoods: string[];
  processedRatio: number;
  fiberFoods: number;
}

interface AnalyticsProps {
  onSwitchToChat: () => void;
}

const Analytics = ({ onSwitchToChat }: AnalyticsProps) => {
  const { t } = useTranslation();
  const { foodLogs, refreshFoodLogs } = useFoodLogs();
  const { getStoolLogs } = useStoolLogs();
  const [stoolLogs, setStoolLogs] = useState<any[]>([]);
  const [historicalData, setHistoricalData] = useState<DayScore[]>([]);
  const [filteredHistoricalData, setFilteredHistoricalData] = useState<DayScore[]>([]);
  const [todayScore, setTodayScore] = useState(0);
  const [foodScore, setFoodScore] = useState(0);
  const [stoolScore, setStoolScore] = useState(0);
  const [foodSummary, setFoodSummary] = useState<FoodSummary>({
    totalMeals: 0,
    varietyScore: 0,
    topFoods: [],
    processedRatio: 0,
    fiberFoods: 0
  });
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d');

  const fetchStoolLogs = async () => {
    const logs = await getStoolLogs();
    setStoolLogs(logs);
  };

  useEffect(() => {
    fetchStoolLogs();
  }, []);

  const handleEntryAdded = async () => {
    await Promise.all([refreshFoodLogs(), fetchStoolLogs()]);
  };

  useEffect(() => {
    if (foodLogs.length > 0 || stoolLogs.length > 0) {
      calculateHistoricalScores();
      calculateFoodSummary();
    }
  }, [foodLogs, stoolLogs, dateRange]);

  const calculateEnhancedFoodScore = (logs: any[], date: Date): number | null => {
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate.toDateString() === date.toDateString();
    });

    if (dayLogs.length === 0) return null;

    let score = 0;
    
    // Meal frequency scoring (optimal: 3-5 meals)
    const mealCount = dayLogs.length;
    if (mealCount >= 3 && mealCount <= 5) {
      score += 30;
    } else if (mealCount >= 2 && mealCount <= 6) {
      score += 20;
    } else {
      score += 10;
    }

    // Food variety scoring
    const uniqueFoods = new Set(dayLogs.map(log => log.food_name.toLowerCase()));
    const varietyBonus = Math.min(uniqueFoods.size * 8, 30);
    score += varietyBonus;

    // Fiber-rich foods detection
    const fiberFoods = dayLogs.filter(log => 
      /apple|banana|oats|beans|broccoli|spinach|berries|whole grain|quinoa|sweet potato/i.test(log.food_name)
    );
    if (fiberFoods.length > 0) score += 20;

    // Processed food detection (penalty)
    const processedFoods = dayLogs.filter(log => 
      /pizza|burger|fries|chips|soda|candy|processed|fast food|fried/i.test(log.food_name)
    );
    const processedPenalty = Math.min(processedFoods.length * 10, 30);
    score -= processedPenalty;

    // Nutritional analysis bonus
    const hasNutritionalData = dayLogs.some(log => log.analysis_result);
    if (hasNutritionalData) score += 20;

    return Math.max(0, Math.min(score, 100));
  };

  const calculateEnhancedStoolScore = (logs: any[], date: Date): number | null => {
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate.toDateString() === date.toDateString();
    });

    if (dayLogs.length === 0) return null;

    const latestLog = dayLogs[0];
    let score = 0;

    // Bristol type scoring
    const bristolType = latestLog.bristol_type;
    if (bristolType >= 3 && bristolType <= 4) {
      score += 50; // Optimal
    } else if (bristolType === 2 || bristolType === 5) {
      score += 35; // Good
    } else if (bristolType === 1 || bristolType === 6) {
      score += 20; // Concerning
    } else if (bristolType === 7) {
      score += 10; // Critical
    }

    // Color scoring
    const color = latestLog.color?.toLowerCase() || '';
    if (color.includes('brown')) {
      score += 30;
    } else if (color.includes('dark') || color.includes('medium')) {
      score += 20;
    } else if (color.includes('yellow') || color.includes('green')) {
      score += 5;
    }

    // Consistency scoring
    const consistency = latestLog.consistency?.toLowerCase() || '';
    if (consistency.includes('normal') || consistency.includes('soft')) {
      score += 20;
    } else if (consistency.includes('firm')) {
      score += 15;
    } else if (consistency.includes('hard') || consistency.includes('watery')) {
      score += 5;
    }

    return Math.min(score, 100);
  };

  const calculateHistoricalScores = () => {
    const today = new Date();
    const daysToShow = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 60;
    const historical: DayScore[] = [];

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      const dayFoodScore = calculateEnhancedFoodScore(foodLogs, date);
      const dayStoolScore = calculateEnhancedStoolScore(stoolLogs, date);
      
      // Calculate overall score only if at least one score exists
      let dayScore: number | null = null;
      if (dayFoodScore !== null && dayStoolScore !== null) {
        dayScore = Math.round((dayFoodScore + dayStoolScore) / 2);
      } else if (dayFoodScore !== null) {
        dayScore = dayFoodScore;
      } else if (dayStoolScore !== null) {
        dayScore = dayStoolScore;
      }

      historical.push({
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: dayScore,
        foodScore: dayFoodScore,
        stoolScore: dayStoolScore
      });
    }

    setHistoricalData(historical);
    
    // Filter data to only show days with actual scores
    const filtered = filterHistoricalData(historical);
    setFilteredHistoricalData(filtered);
    
    // Set today's scores from the last day in historical data
    const todayData = historical[historical.length - 1];
    setTodayScore(todayData.score || 0);
    setFoodScore(todayData.foodScore);
    setStoolScore(todayData.stoolScore);
  };

  const filterHistoricalData = (data: DayScore[]) => {
    // 完全移除没有任何数据的天数，只保留有记录的天数
    return data.filter(day => day.foodScore !== null || day.stoolScore !== null);
  };

  const calculateFoodSummary = () => {
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentLogs = foodLogs.filter(log => 
      new Date(log.created_at) >= last7Days
    );

    const uniqueFoods = new Set(recentLogs.map(log => log.food_name.toLowerCase()));
    const foodCounts = recentLogs.reduce((acc, log) => {
      const food = log.food_name;
      acc[food] = (acc[food] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topFoods = Object.entries(foodCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([food]) => food);

    const processedCount = recentLogs.filter(log => 
      /pizza|burger|fries|chips|soda|candy|processed|fast food|fried/i.test(log.food_name)
    ).length;

    const fiberCount = recentLogs.filter(log => 
      /apple|banana|oats|beans|broccoli|spinach|berries|whole grain|quinoa|sweet potato/i.test(log.food_name)
    ).length;

    setFoodSummary({
      totalMeals: recentLogs.length,
      varietyScore: Math.round((uniqueFoods.size / Math.max(recentLogs.length, 1)) * 100),
      topFoods,
      processedRatio: Math.round((processedCount / Math.max(recentLogs.length, 1)) * 100),
      fiberFoods: fiberCount
    });
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '💪';
    if (score >= 60) return '👍';
    if (score >= 40) return '⚠️';
    return '🚨';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return t('analytics.excellent');
    if (score >= 60) return t('analytics.good');
    if (score >= 40) return t('analytics.needsAttention');
    return t('analytics.critical');
  };

  const getPersonalizedSuggestions = (): string[] => {
    const suggestions: string[] = [];

    if (stoolScore < 60) {
      if (stoolLogs.length > 0) {
        const recentStool = stoolLogs[0];
        if (recentStool.bristol_type <= 2) {
          suggestions.push(t('analytics.suggestions.addFiber'));
        } else if (recentStool.bristol_type >= 6) {
          suggestions.push(t('analytics.suggestions.eatBinding'));
        }
      }
    }

    if (foodScore < 60) {
      if (foodSummary.varietyScore < 50) {
        suggestions.push(t('analytics.suggestions.aimForVegetables'));
      }
      if (foodSummary.processedRatio > 30) {
        suggestions.push(t('analytics.suggestions.replaceProcessed'));
      }
      if (foodSummary.totalMeals < 21) { // Less than 3 meals/day average
        suggestions.push(t('analytics.suggestions.regularMeals'));
      }
    }

    if (foodSummary.fiberFoods < 3) {
      suggestions.push(t('analytics.suggestions.addFiberFoods'));
    }

    // General tips if doing well
    if (todayScore >= 80) {
      suggestions.push(t('analytics.suggestions.keepUp'));
    }

    return suggestions.slice(0, 3); // Limit to 3 suggestions
  };

  const getTrendDirection = () => {
    if (filteredHistoricalData.length < 7) return null;
    
    const recentData = filteredHistoricalData.slice(-7).filter(day => day.score !== null);
    const previousData = filteredHistoricalData.slice(-14, -7).filter(day => day.score !== null);
    
    if (recentData.length === 0 || previousData.length === 0) return null;
    
    const recent = recentData.reduce((sum, day) => sum + (day.score || 0), 0) / recentData.length;
    const previous = previousData.reduce((sum, day) => sum + (day.score || 0), 0) / previousData.length;
    
    if (recent > previous + 5) return 'up';
    if (recent < previous - 5) return 'down';
    return 'stable';
  };

  return (
    <div className="space-y-3">
      {/* Hero — today's score with inline food/stool split */}
      <SectionCard className="!p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-caption uppercase tracking-wider">
              {t('analytics.todayScore')}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-[52px] font-semibold tabular-nums text-primary leading-none">
                {todayScore}
              </span>
              <span className="text-[13px] font-medium text-foreground/70">
                {getScoreLabel(todayScore)}
              </span>
            </div>
            <Progress value={todayScore} className="h-1.5 mt-3 bg-muted" />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {getTrendDirection() === 'up' && <TrendingUp className="w-4 h-4 text-primary" />}
            {getTrendDirection() === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
            <span className="text-2xl leading-none">{getScoreEmoji(todayScore)}</span>
          </div>
        </div>

        {/* Food + Stool split inside hero */}
        <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary-soft flex items-center justify-center shrink-0">
              <Apple className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t('analytics.foodScore')}</p>
              <p className="text-[20px] font-semibold text-foreground tabular-nums leading-tight">
                {foodScore !== null ? foodScore : '--'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t('analytics.stoolScore')}</p>
              <p className="text-[20px] font-semibold text-foreground tabular-nums leading-tight">
                {stoolScore !== null ? stoolScore : '--'}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Historical Trend Chart */}
      <SectionCard
        icon={TrendingUp}
        title={t('analytics.historicalTrends')}
        action={
          <div className="flex gap-0.5 p-0.5 rounded-full bg-muted">
            {(['7d','30d','all'] as const).map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={cn(
                  "px-2.5 h-6 rounded-full text-[11px] font-medium transition-all",
                  dateRange === r
                    ? "bg-card text-primary shadow-soft"
                    : "text-foreground/60"
                )}
              >
                {t(`analytics.dateRanges.${r}`)}
              </button>
            ))}
          </div>
        }
      >
        {/* Custom legend chips */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-[11px] text-muted-foreground font-medium">{t('analytics.foodScore')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="text-[11px] text-muted-foreground font-medium">{t('analytics.stoolScore')}</span>
          </div>
        </div>
        <div className="h-48 -ml-2">
            {filteredHistoricalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredHistoricalData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    minTickGap={16}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    width={28}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      fontSize: '12px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="foodScore" 
                    stroke="hsl(var(--primary))"
                    strokeWidth={2.5}
                    dot={(props) => {
                      const { payload } = props;
                      if (payload?.foodScore === null || payload?.foodScore === undefined) {
                        return null;
                      }
                      return <circle {...props} fill="hsl(var(--primary))" strokeWidth={2} r={4} />;
                    }}
                     name="Food Score"
                     connectNulls={true}
                   />
                  <Line 
                    type="monotone" 
                    dataKey="stoolScore" 
                    stroke="hsl(var(--accent))"
                    strokeWidth={2.5}
                    dot={(props) => {
                      const { payload } = props;
                      if (payload?.stoolScore === null || payload?.stoolScore === undefined) {
                        return null;
                      }
                      return <circle {...props} fill="hsl(var(--accent))" strokeWidth={2} r={4} />;
                    }}
                     name="Stool Score"
                     connectNulls={true}
                   />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Calendar className="w-7 h-7 mx-auto mb-1.5 opacity-50" />
                  <p className="text-[14px]">{t('analytics.noDataYet')}</p>
                  <p className="text-[12px] opacity-70">{t('analytics.startLogging')}</p>
                </div>
              </div>
            )}
        </div>
      </SectionCard>

      {/* Food Intake Summary — unified 4-up stat row */}
      <SectionCard icon={Heart} title={t('analytics.foodSummary')} description={t('analytics.dateRanges.7d')}>
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { label: t('analytics.totalMeals'), value: foodSummary.totalMeals },
            { label: t('analytics.foodVariety'), value: `${foodSummary.varietyScore}%` },
            { label: t('analytics.fiberFoods'), value: foodSummary.fiberFoods },
            {
              label: t('analytics.processedFoods'),
              value: `${foodSummary.processedRatio}%`,
              danger: foodSummary.processedRatio > 30,
            },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl bg-muted/60 p-2.5 text-center">
              <p className={cn(
                "text-[18px] font-semibold tabular-nums leading-tight",
                s.danger ? "text-destructive" : "text-primary"
              )}>
                {s.value}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5 leading-tight">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {foodSummary.topFoods.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
              {t('analytics.mostCommonFoods')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {foodSummary.topFoods.map((food, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-primary-soft text-primary rounded-full text-[12px] font-medium"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>
        )}
      </SectionCard>

      {/* Monthly Activity Calendar */}
      <MonthlyActivityCalendar foodLogs={foodLogs} stoolLogs={stoolLogs} onEntryAdded={handleEntryAdded} />

      {/* Personalized Suggestions */}
      <SectionCard icon={Sparkles} title={t('analytics.personalizedRecommendations')}>
        <div className="space-y-1.5 mb-3">
          {getPersonalizedSuggestions().map((suggestion, index) => (
            <div key={index} className="flex items-start gap-2.5">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <p className="text-[13.5px] text-foreground/80 leading-snug">{suggestion}</p>
            </div>
          ))}
        </div>
        <Button onClick={onSwitchToChat} className="w-full" size="default">
          <MessageCircle className="w-4 h-4 mr-2" />
          {t('analytics.askGutCoach')}
        </Button>
      </SectionCard>
    </div>
  );
};

export default Analytics;
