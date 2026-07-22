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
    <div className="space-y-4">
      {/* Hero — today's score */}
      <SectionCard className="!p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-caption uppercase tracking-wider text-muted-foreground">
              {t('analytics.todayScore')}
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-semibold tabular-nums text-primary leading-none">
                {todayScore}
              </span>
              <span className="text-[13px] font-medium text-foreground/70">
                {getScoreLabel(todayScore)}
              </span>
            </div>
            <Progress value={todayScore} className="h-2 mt-3 bg-muted" />
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {getTrendDirection() === 'up' && <TrendingUp className="w-4 h-4 text-primary" />}
            {getTrendDirection() === 'down' && <TrendingDown className="w-4 h-4 text-destructive" />}
            <span className="text-2xl">{getScoreEmoji(todayScore)}</span>
          </div>
        </div>
      </SectionCard>

      {/* Historical Trend Chart */}
      <SectionCard
        icon={TrendingUp}
        title={t('analytics.historicalTrends')}
        action={
          <div className="flex gap-1 p-0.5 rounded-full bg-muted">
            {(['7d','30d','all'] as const).map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={cn(
                  "px-2.5 h-7 rounded-full text-[11px] font-medium transition-all",
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
        <div className="h-56 -mx-1">
            {filteredHistoricalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredHistoricalData}>
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
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
                  <Legend />
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
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                   <p>{t('analytics.noDataYet')}</p>
                   <p className="text-xs">{t('analytics.startLogging')}</p>
                </div>
              </div>
            )}
        </div>
      </SectionCard>

      {/* Food & Stool Scores */}
      <div className="grid grid-cols-2 gap-3">
        <SectionCard className="!p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-caption uppercase tracking-wider text-muted-foreground">
              {t('analytics.foodScore')}
            </p>
            <div className="h-7 w-7 rounded-full bg-primary-soft flex items-center justify-center">
              <Apple className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-primary tabular-nums leading-none">
            {foodScore !== null ? foodScore : '--'}
          </p>
          <Progress value={foodScore || 0} className="h-1.5 mt-3" />
        </SectionCard>
        <SectionCard className="!p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-caption uppercase tracking-wider text-muted-foreground">
              {t('analytics.stoolScore')}
            </p>
            <div className="h-7 w-7 rounded-full bg-accent/20 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-accent-foreground" />
            </div>
          </div>
          <p className="text-3xl font-semibold text-primary tabular-nums leading-none">
            {stoolScore !== null ? stoolScore : '--'}
          </p>
          <Progress value={stoolScore || 0} className="h-1.5 mt-3" />
        </SectionCard>
      </div>

      {/* Food Intake Summary */}
      <SectionCard icon={Heart} title={t('analytics.foodSummary')}>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="rounded-2xl bg-primary-soft/60 p-3">
            <p className="text-caption text-muted-foreground">{t('analytics.totalMeals')}</p>
            <p className="text-2xl font-semibold text-primary tabular-nums">{foodSummary.totalMeals}</p>
          </div>
          <div className="rounded-2xl bg-primary-soft/60 p-3">
            <p className="text-caption text-muted-foreground">{t('analytics.foodVariety')}</p>
            <p className="text-2xl font-semibold text-primary tabular-nums">{foodSummary.varietyScore}%</p>
          </div>
        </div>

        {foodSummary.topFoods.length > 0 && (
          <div className="mb-3">
            <p className="text-caption text-muted-foreground mb-1.5">{t('analytics.mostCommonFoods')}</p>
            <div className="flex flex-wrap gap-1.5">
              {foodSummary.topFoods.map((food, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-soft text-primary rounded-full text-[12px] font-medium"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-caption text-muted-foreground">{t('analytics.fiberFoods')}</p>
            <p className="text-[15px] font-semibold text-primary">
              {foodSummary.fiberFoods} {t('analytics.servings')}
            </p>
          </div>
          <div>
            <p className="text-caption text-muted-foreground">{t('analytics.processedFoods')}</p>
            <p className={cn(
              "text-[15px] font-semibold",
              foodSummary.processedRatio > 30 ? "text-destructive" : "text-primary"
            )}>
              {foodSummary.processedRatio}%
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Monthly Activity Calendar */}
      <MonthlyActivityCalendar foodLogs={foodLogs} stoolLogs={stoolLogs} onEntryAdded={handleEntryAdded} />

      {/* Personalized Suggestions */}
      <SectionCard icon={Sparkles} title={t('analytics.personalizedRecommendations')}>
        <div className="space-y-2 mb-4">
          {getPersonalizedSuggestions().map((suggestion, index) => (
            <div key={index} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <p className="text-[14px] text-foreground/80 leading-relaxed">{suggestion}</p>
            </div>
          ))}
        </div>
        <Button onClick={onSwitchToChat} className="w-full" size="lg">
          <MessageCircle className="w-4 h-4 mr-2" />
          {t('analytics.askGutCoach')}
        </Button>
      </SectionCard>
    </div>
  );
};

export default Analytics;
