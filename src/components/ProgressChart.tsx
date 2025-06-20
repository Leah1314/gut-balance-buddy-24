
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

const ProgressChart = () => {
  const weeklyData = [
    { day: "Mon", wellness: 65, symptoms: 3 },
    { day: "Tue", wellness: 72, symptoms: 2 },
    { day: "Wed", wellness: 68, symptoms: 4 },
    { day: "Thu", wellness: 78, symptoms: 1 },
    { day: "Fri", wellness: 82, symptoms: 1 },
    { day: "Sat", wellness: 75, symptoms: 2 },
    { day: "Sun", wellness: 80, symptoms: 1 }
  ];

  const monthlyTrends = [
    { week: "Week 1", score: 68 },
    { week: "Week 2", score: 72 },
    { week: "Week 3", score: 75 },
    { week: "Week 4", score: 78 }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Wellness Trend */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span>Weekly Wellness Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}${name === 'wellness' ? '%' : ''}`, 
                    name === 'wellness' ? 'Wellness Score' : 'Symptom Count'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="wellness" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Your wellness score has improved by 23% this week!
          </p>
        </CardContent>
      </Card>

      {/* Daily Symptom Count */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Daily Symptom Count</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Symptoms']}
                />
                <Bar 
                  dataKey="symptoms" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Symptoms decreased by 67% compared to last week
          </p>
        </CardContent>
      </Card>

      {/* Monthly Progress */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span>Monthly Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis domain={[60, 85]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Average Score']} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">+15%</p>
              <p className="text-sm text-gray-600">Overall Improvement</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-sm text-gray-600">Consecutive Good Days</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">78%</p>
              <p className="text-sm text-gray-600">Current Wellness Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressChart;
