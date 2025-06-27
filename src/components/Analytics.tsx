
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp, MessageCircle, Calendar, Target } from 'lucide-react';
import { useFoodLogs } from '@/hooks/useFoodLogs';
import { useStoolLogs } from '@/hooks/useStoolLogs';

interface DayScore {
  date: string;
  score: number;
  foodScore: number;
  stoolScore: number;
}

interface AnalyticsProps {
  onSwitchToChat: () => void;
}

const Analytics = ({ onSwitchToChat }: AnalyticsProps) => {
  const { foodLogs } = useFoodLogs();
  const { getStoolLogs } = useStoolLogs();
  const [stoolLogs, setStoolLogs] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<DayScore[]>([]);
  const [todayScore, setTodayScore] = useState(0);
  const [foodScore, setFoodScore] = useState(0);
  const [stoolScore, setStoolScore] = useState(0);

  useEffect(() => {
    const fetchStoolLogs = async () => {
      const logs = await getStoolLogs();
      setStoolLogs(logs);
    };
    fetchStoolLogs();
  }, []);

  useEffect(() => {
    if (foodLogs.length > 0 || stoolLogs.length > 0) {
      calculateScores();
    }
  }, [foodLogs, stoolLogs]);

  const calculateFoodScore = (logs: any[], date: Date): number => {
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate.toDateString() === date.toDateString();
    });

    if (dayLogs.length === 0) return 0;

    // Simple scoring based on number of meals and timing
    let score = Math.min(dayLogs.length * 25, 100); // Max 100 for 4+ meals
    
    // Bonus for variety (different food names)
    const uniqueFoods = new Set(dayLogs.map(log => log.food_name.toLowerCase()));
    if (uniqueFoods.size >= 3) score += 10;
    
    return Math.min(score, 100);
  };

  const calculateStoolScore = (logs: any[], date: Date): number => {
    const dayLogs = logs.filter(log => {
      const logDate = new Date(log.created_at);
      return logDate.toDateString() === date.toDateString();
    });

    if (dayLogs.length === 0) return 0;

    const latestLog = dayLogs[0]; // Most recent
    let score = 50; // Base score

    // Bristol type scoring (3-4 are ideal)
    if (latestLog.bristol_type >= 3 && latestLog.bristol_type <= 4) {
      score += 30;
    } else if (latestLog.bristol_type >= 2 && latestLog.bristol_type <= 5) {
      score += 15;
    }

    // Color scoring (brown is ideal)
    if (latestLog.color?.toLowerCase().includes('brown')) {
      score += 20;
    }

    return Math.min(score, 100);
  };

  const calculateScores = () => {
    const today = new Date();
    const last7Days: DayScore[] = [];

    // Calculate scores for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      const dayFoodScore = calculateFoodScore(foodLogs, date);
      const dayStoolScore = calculateStoolScore(stoolLogs, date);
      const dayScore = Math.round((dayFoodScore + dayStoolScore) / 2);

      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        score: dayScore,
        foodScore: dayFoodScore,
        stoolScore: dayStoolScore
      });
    }

    setWeeklyData(last7Days);
    
    // Set today's scores
    const todayData = last7Days[last7Days.length - 1];
    setTodayScore(todayData.score);
    setFoodScore(todayData.foodScore);
    setStoolScore(todayData.stoolScore);
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '💪';
    if (score >= 60) return '👍';
    if (score >= 40) return '⚠️';
    return '🚨';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Attention';
    return 'Critical';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2" style={{ color: '#2E2E2E' }}>
          Your Analytics
        </h2>
        <p className="text-sm" style={{ color: '#2E2E2E', opacity: 0.7 }}>
          Track your digestive health progress
        </p>
      </div>

      {/* Today's Score Card */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span style={{ color: '#2E2E2E' }}>Today's Health Score</span>
            <span className="text-2xl">{getScoreEmoji(todayScore)}</span>
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
            style={{ 
              backgroundColor: '#F0F0F0',
            }}
          />
        </CardContent>
      </Card>

      {/* Food & Stool Scores */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#2E2E2E' }}>
              Food Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold" style={{ color: '#4A7C59' }}>
                {foodScore}
              </span>
              <Target className="w-4 h-4" style={{ color: '#4A7C59' }} />
            </div>
            <Progress value={foodScore} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium" style={{ color: '#2E2E2E' }}>
              Stool Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-bold" style={{ color: '#4A7C59' }}>
                {stoolScore}
              </span>
              <Calendar className="w-4 h-4" style={{ color: '#4A7C59' }} />
            </div>
            <Progress value={stoolScore} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trend Chart */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" style={{ color: '#4A7C59' }} />
            <span style={{ color: '#2E2E2E' }}>7-Day Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#2E2E2E' }}
                />
                <YAxis hide />
                <Bar 
                  dataKey="score" 
                  fill="#4A7C59"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Insights & Action */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3" style={{ color: '#2E2E2E' }}>
            Quick Insights
          </h3>
          <div className="space-y-2 mb-4">
            {todayScore < 60 && (
              <p className="text-sm" style={{ color: '#2E2E2E', opacity: 0.8 }}>
                • Consider logging more meals throughout the day
              </p>
            )}
            {stoolScore < 50 && (
              <p className="text-sm" style={{ color: '#2E2E2E', opacity: 0.8 }}>
                • Your stool patterns could use attention
              </p>
            )}
            {todayScore >= 80 && (
              <p className="text-sm" style={{ color: '#2E2E2E', opacity: 0.8 }}>
                • Great job! Keep up the healthy habits
              </p>
            )}
          </div>
          <Button 
            onClick={onSwitchToChat}
            className="w-full flex items-center justify-center space-x-2"
            style={{ backgroundColor: '#4A7C59' }}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Ask Gut Coach</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
