import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { TrendingUp, MessageCircle, Calendar, Target, Apple, Heart, TrendingDown } from 'lucide-react';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useStoolLogs } from '@/hooks/useStoolLogs';
import MonthlyActivityCalendar from './MonthlyActivityCalendar';
import { useTranslation } from 'react-i18next';

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
  const { foodLogs } = useFoodLogs();
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

  useEffect(() => {
    const fetchStoolLogs = async () => {
      const logs = await getStoolLogs();
      setStoolLogs(logs);
    };
    fetchStoolLogs();
  }, []);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2" style={{ color: '#2E2E2E' }}>
          {t('analytics.title')}
        </h2>
        <p className="text-sm" style={{ color: '#2E2E2E', opacity: 0.7 }}>
          {t('analytics.subtitle')}
        </p>
      </div>

      {/* Today's Score Card */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span style={{ color: '#2E2E2E' }}>{t('analytics.todayScore')}</span>
            <div className="flex items-center space-x-2">
              {getTrendDirection() === 'up' && <TrendingUp className="w-5 h-5" style={{ color: '#4A7C59' }} />}
              {getTrendDirection() === 'down' && <TrendingDown className="w-5 h-5" style={{ color: '#E74C3C' }} />}
              <span className="text-2xl">{getScoreEmoji(todayScore)}</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-bold" style={{ color: '#4A7C59' }}>
              {todayScore}
            </span>
            <span className="text-sm font-medium" style={{ color: '#2E2E2E' }}>
              {getScoreLabel(todayScore)}
            </span>
          </div>
          <Progress 
            value={todayScore} 
            className="h-3"
            style={{ backgroundColor: '#F0F0F0' }}
          />
        </CardContent>
      </Card>

      {/* Historical Trend Chart */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" style={{ color: '#4A7C59' }} />
              <span style={{ color: '#2E2E2E' }}>{t('analytics.historicalTrends')}</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={dateRange === '7d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange('7d')}
                style={dateRange === '7d' ? { backgroundColor: '#4A7C59' } : {}}
              >
                {t('analytics.dateRanges.7d')}
              </Button>
              <Button
                variant={dateRange === '30d' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange('30d')}
                style={dateRange === '30d' ? { backgroundColor: '#4A7C59' } : {}}
              >
                {t('analytics.dateRanges.30d')}
              </Button>
              <Button
                variant={dateRange === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange('all')}
                style={dateRange === 'all' ? { backgroundColor: '#4A7C59' } : {}}
              >
                {t('analytics.dateRanges.all')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {filteredHistoricalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredHistoricalData}>
                  <XAxis 
                    dataKey="displayDate" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#2E2E2E' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#2E2E2E' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #D3D3D3',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="foodScore" 
                    stroke="#4A7C59" 
                    strokeWidth={2}
                    dot={(props) => {
                      const { payload } = props;
                      if (payload?.foodScore === null || payload?.foodScore === undefined) {
                        return null;
                      }
                      return <circle {...props} fill="#4A7C59" strokeWidth={2} r={4} />;
                    }}
                     name="Food Score"
                     connectNulls={true}
                   />
                  <Line 
                    type="monotone" 
                    dataKey="stoolScore" 
                    stroke="#FF8C42" 
                    strokeWidth={2}
                    dot={(props) => {
                      const { payload } = props;
                      if (payload?.stoolScore === null || payload?.stoolScore === undefined) {
                        return null;
                      }
                      return <circle {...props} fill="#FF8C42" strokeWidth={2} r={4} />;
                    }}
                     name="Stool Score"
                     connectNulls={true}
                   />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                   <p>{t('analytics.noDataYet')}</p>
                   <p className="text-xs">{t('analytics.startLogging')}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Food & Stool Scores */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#2E2E2E' }}>
              {t('analytics.foodScore')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold" style={{ color: '#4A7C59' }}>
                {foodScore !== null ? foodScore : '--'}
              </span>
              <Apple className="w-4 h-4" style={{ color: '#4A7C59' }} />
            </div>
            <Progress value={foodScore || 0} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#2E2E2E' }}>
              {t('analytics.stoolScore')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold" style={{ color: '#4A7C59' }}>
                {stoolScore !== null ? stoolScore : '--'}
              </span>
              <Target className="w-4 h-4" style={{ color: '#4A7C59' }} />
            </div>
            <Progress value={stoolScore || 0} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Food Intake Summary */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5" style={{ color: '#4A7C59' }} />
            <span style={{ color: '#2E2E2E' }}>{t('analytics.foodSummary')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">{t('analytics.totalMeals')}</p>
              <p className="text-2xl font-bold" style={{ color: '#4A7C59' }}>{foodSummary.totalMeals}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('analytics.foodVariety')}</p>
              <p className="text-2xl font-bold" style={{ color: '#4A7C59' }}>{foodSummary.varietyScore}%</p>
            </div>
          </div>
          
          {foodSummary.topFoods.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">{t('analytics.mostCommonFoods')}:</p>
              <div className="flex flex-wrap gap-2">
                {foodSummary.topFoods.map((food, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
                  >
                    {food}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
               <p className="text-sm text-gray-600">{t('analytics.fiberFoods')}</p>
               <p className="font-semibold" style={{ color: '#4A7C59' }}>{foodSummary.fiberFoods} {t('analytics.servings')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t('analytics.processedFoods')}</p>
              <p className="font-semibold" style={{ color: foodSummary.processedRatio > 30 ? '#E74C3C' : '#4A7C59' }}>
                {foodSummary.processedRatio}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Activity Calendar */}
      <MonthlyActivityCalendar foodLogs={foodLogs} stoolLogs={stoolLogs} />

      {/* Personalized Suggestions */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center space-x-2" style={{ color: '#2E2E2E' }}>
            <Calendar className="w-4 h-4" />
            <span>{t('analytics.personalizedRecommendations')}</span>
          </h3>
          <div className="space-y-2 mb-4">
            {getPersonalizedSuggestions().map((suggestion, index) => (
              <p key={index} className="text-sm flex items-start space-x-2" style={{ color: '#2E2E2E', opacity: 0.8 }}>
                <span className="text-green-600 font-bold">•</span>
                <span>{suggestion}</span>
              </p>
            ))}
          </div>
          <Button 
            onClick={onSwitchToChat}
            className="w-full flex items-center justify-center space-x-2"
            style={{ backgroundColor: '#4A7C59' }}
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t('analytics.askGutCoach')}</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
