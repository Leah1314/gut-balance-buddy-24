
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  TrendingUp, 
  Calendar, 
  Apple, 
  Activity,
  Brain,
  Moon,
  Droplets,
  Plus,
  BarChart3,
  BookOpen,
  Target
} from "lucide-react";
import SymptomTracker from "@/components/SymptomTracker";
import FoodDiary from "@/components/FoodDiary";
import WellnessCheck from "@/components/WellnessCheck";
import ProgressChart from "@/components/ProgressChart";
import EducationHub from "@/components/EducationHub";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock data for demonstration
  const todayScore = 75;
  const weeklyTrend = 8;
  const streakDays = 12;

  const quickStats = [
    { label: "Today's Wellness", value: `${todayScore}%`, icon: Heart, color: "text-green-600" },
    { label: "Weekly Trend", value: `+${weeklyTrend}%`, icon: TrendingUp, color: "text-blue-600" },
    { label: "Current Streak", value: `${streakDays} days`, icon: Target, color: "text-purple-600" },
  ];

  const recentSymptoms = [
    { symptom: "Bloating", severity: "Mild", time: "2 hours ago" },
    { symptom: "Energy Level", severity: "Good", time: "Morning" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GutWell</h1>
                <p className="text-sm text-gray-600">Your digestive health companion</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600">
              <Plus className="w-4 h-4 mr-2" />
              Quick Log
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="symptoms" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Symptoms</span>
            </TabsTrigger>
            <TabsTrigger value="food" className="flex items-center space-x-2">
              <Apple className="w-4 h-4" />
              <span className="hidden sm:inline">Food</span>
            </TabsTrigger>
            <TabsTrigger value="wellness" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Wellness</span>
            </TabsTrigger>
            <TabsTrigger value="learn" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Learn</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickStats.map((stat, index) => (
                <Card key={index} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Wellness Score */}
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-green-600" />
                    <span>Today's Wellness Score</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">{todayScore}%</div>
                    <Progress value={todayScore} className="w-full h-3" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                      <p className="text-gray-600">Hydration</p>
                      <p className="font-semibold">Good</p>
                    </div>
                    <div className="text-center">
                      <Moon className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                      <p className="text-gray-600">Sleep</p>
                      <p className="font-semibold">7.5h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentSymptoms.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.symptom}</p>
                        <p className="text-sm text-gray-600">{item.time}</p>
                      </div>
                      <Badge variant={item.severity === "Good" ? "default" : "secondary"}>
                        {item.severity}
                      </Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All Activity
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Progress Chart */}
            <ProgressChart />
          </TabsContent>

          {/* Symptoms Tab */}
          <TabsContent value="symptoms">
            <SymptomTracker />
          </TabsContent>

          {/* Food Tab */}
          <TabsContent value="food">
            <FoodDiary />
          </TabsContent>

          {/* Wellness Tab */}
          <TabsContent value="wellness">
            <WellnessCheck />
          </TabsContent>

          {/* Learn Tab */}
          <TabsContent value="learn">
            <EducationHub />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
