
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, TrendingUp, Apple, Activity } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useStoolLogs } from "@/hooks/useStoolLogs";

interface DayScore {
  date: string;
  foodScore: number;
  stoolScore: number;
  day: string;
}

const Analytics = () => {
  const [todayScore, setTodayScore] = useState(85);
  const [foodScore, setFoodScore] = useState(82);
  const [stoolScore, setStoolScore] = useState(88);
  const [weeklyData, setWeeklyData] = useState<DayScore[]>([]);
  const { foodLogs } = useFoodLogs();
  const { getStoolLogs } = useStoolLogs();

  useEffect(() => {
    // Generate mock weekly data for the trend chart
    const generateWeeklyData = () => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const data = days.map((day, index) => ({
        date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        foodScore: Math.floor(Math.random() * 30 + 70), // 70-100
        stoolScore: Math.floor(Math.random() * 30 + 70), // 70-100
        day
      }));
      setWeeklyData(data);
    };

    generateWeeklyData();
  }, []);

  const getScoreStatus = (score: number) => {
    if (score >= 80) return { emoji: "💪", text: "Great", color: "bg-green-500" };
    if (score >= 60) return { emoji: "⚠️", text: "Needs Attention", color: "bg-yellow-500" };
    return { emoji: "🚨", text: "Critical", color: "bg-red-500" };
  };

  const getDigestiveSummary = () => {
    if (todayScore >= 80) return "Healthy meals and good stool quality. Keep it up! 🌟";
    if (todayScore >= 60) return "Good progress, but some areas need attention.";
    return "Multiple digestive concerns detected. Consider consulting with your gut coach.";
  };

  const getFoodTip = () => {
    const tips = [
      "Try adding more fiber-rich vegetables tomorrow! 🥬",
      "Great balance today! Keep spacing meals evenly.",
      "Consider reducing processed foods for better digestion.",
      "Add fermented foods like yogurt or kefir for gut health! 🥛"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const getStoolTip = () => {
    if (stoolScore >= 85) return "Excellent stool quality! Your gut is happy! 😊";
    if (stoolScore >= 70) return "Good consistency, but monitor color changes.";
    return "Dark color or unusual consistency detected - monitor closely and consider hydration.";
  };

  const handleAskGutCoach = () => {
    const message = `Based on my analytics: Food Score: ${foodScore}/100, Stool Score: ${stoolScore}/100, Overall Digestive Score: ${todayScore}/100. Can you provide personalized recommendations to improve my gut health?`;
    
    // Dispatch custom event to open gut health coach with message
    window.dispatchEvent(new CustomEvent('sendHealthCoachMessage', {
      detail: { message }
    }));
  };

  const status = getScoreStatus(todayScore);

  const chartConfig = {
    foodScore: {
      label: "Food Score",
      color: "#10b981"
    },
    stoolScore: {
      label: "Stool Score", 
      color: "#3b82f6"
    }
  };

  return (
    <div className="space-y-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600 text-sm">Track your digestive health journey</p>
      </div>

      {/* Digestive Health Summary */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Today's Digestive Score
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{status.emoji}</span>
              <Badge className={`${status.color} text-white font-medium`}>
                {status.text}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{todayScore}/100</div>
            <Progress value={todayScore} className="h-3 bg-gray-200" style={{ backgroundColor: '#e5e7eb' }}>
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                style={{ width: `${todayScore}%` }}
              />
            </Progress>
          </div>
          <p className="text-center text-gray-700 text-sm bg-green-50 p-3 rounded-lg">
            {getDigestiveSummary()}
          </p>
        </CardContent>
      </Card>

      {/* Food Score Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Apple className="w-5 h-5 text-orange-500" />
            Food Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-orange-600">{foodScore}/100</span>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              Balance • Timing • Fiber
            </Badge>
          </div>
          <Progress value={foodScore} className="h-2">
            <div 
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
              style={{ width: `${foodScore}%` }}
            />
          </Progress>
          <p className="text-sm text-gray-600 bg-orange-50 p-2 rounded-md">
            💡 {getFoodTip()}
          </p>
        </CardContent>
      </Card>

      {/* Stool Score Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-blue-500" />
            Stool Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-600">{stoolScore}/100</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Bristol • Color • Consistency
            </Badge>
          </div>
          <Progress value={stoolScore} className="h-2">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
              style={{ width: `${stoolScore}%` }}
            />
          </Progress>
          <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded-md">
            💡 {getStoolTip()}
          </p>
        </CardContent>
      </Card>

      {/* Mini Trend Chart */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-green-600" />
            7-Day Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <YAxis 
                  domain={[50, 100]}
                  axisLine={false}
                  tickLine={false}
                  className="text-xs"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="foodScore" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="stoolScore" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="flex justify-center gap-6 mt-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Food Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">Stool Score</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-lg">
        <CardContent className="p-6 text-center space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-2">Need Personalized Advice?</h3>
            <p className="text-green-100 text-sm">
              Get tailored recommendations based on your analytics
            </p>
          </div>
          <Button 
            onClick={handleAskGutCoach}
            className="bg-white text-green-600 hover:bg-green-50 font-medium px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Ask Gut Coach
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
