
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Moon, 
  Droplets, 
  Activity, 
  Heart,
  Target,
  TrendingUp,
  CheckCircle
} from "lucide-react";

const WellnessCheck = () => {
  const [stressLevel, setStressLevel] = useState([5]);
  const [sleepHours, setSleepHours] = useState([7]);
  const [waterIntake, setWaterIntake] = useState([6]);
  const [exerciseMinutes, setExerciseMinutes] = useState([30]);
  const [isCompleted, setIsCompleted] = useState(false);

  const wellnessMetrics = [
    {
      id: "stress",
      label: "Stress Level",
      value: stressLevel,
      setValue: setStressLevel,
      min: 1,
      max: 10,
      unit: "/10",
      icon: Brain,
      color: "text-purple-600",
      description: "How stressed do you feel today?",
      tips: stressLevel[0] > 7 ? "Consider meditation or deep breathing exercises" : "Great job managing stress!"
    },
    {
      id: "sleep",
      label: "Sleep Duration",
      value: sleepHours,
      setValue: setSleepHours,
      min: 4,
      max: 12,
      unit: "hrs",
      icon: Moon,
      color: "text-indigo-600",
      description: "How many hours did you sleep last night?",
      tips: sleepHours[0] < 7 ? "Aim for 7-9 hours of sleep for optimal gut health" : "Excellent sleep duration!"
    },
    {
      id: "water",
      label: "Water Intake",
      value: waterIntake,
      setValue: setWaterIntake,
      min: 1,
      max: 15,
      unit: "glasses",
      icon: Droplets,
      color: "text-blue-600",
      description: "How many glasses of water have you had today?",
      tips: waterIntake[0] < 8 ? "Try to drink more water for better digestion" : "Great hydration levels!"
    },
    {
      id: "exercise",
      label: "Exercise",
      value: exerciseMinutes,
      setValue: setExerciseMinutes,
      min: 0,
      max: 120,
      unit: "min",
      icon: Activity,
      color: "text-green-600",
      description: "How many minutes of exercise today?",
      tips: exerciseMinutes[0] < 30 ? "Regular exercise helps with digestion" : "Fantastic activity level!"
    }
  ];

  const todayCheckins = [
    { time: "Morning", score: 85, mood: "Good" },
    { time: "Afternoon", score: 72, mood: "Fair" },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const handleCompleteCheckin = () => {
    setIsCompleted(true);
    console.log("Wellness check-in completed:", {
      stress: stressLevel[0],
      sleep: sleepHours[0], 
      water: waterIntake[0],
      exercise: exerciseMinutes[0]
    });
  };

  const calculateOverallScore = () => {
    const stressScore = (10 - stressLevel[0]) * 10;
    const sleepScore = Math.min(sleepHours[0] / 8 * 100, 100);
    const waterScore = Math.min(waterIntake[0] / 8 * 100, 100);
    const exerciseScore = Math.min(exerciseMinutes[0] / 30 * 100, 100);
    
    return Math.round((stressScore + sleepScore + waterScore + exerciseScore) / 4);
  };

  return (
    <div className="space-y-6">
      {/* Wellness Check-in Form */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span>Daily Wellness Check-in</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {wellnessMetrics.map((metric) => (
            <div key={metric.id} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                  <div>
                    <Label className="text-sm font-medium">{metric.label}</Label>
                    <p className="text-xs text-gray-600">{metric.description}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">
                  {metric.value[0]}{metric.unit}
                </Badge>
              </div>
              
              <div className="px-3">
                <Slider
                  value={metric.value}
                  onValueChange={metric.setValue}
                  max={metric.max}
                  min={metric.min}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{metric.min}</span>
                  <span>{metric.max}</span>
                </div>
              </div>
              
              <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                💡 {metric.tips}
              </p>
            </div>
          ))}

          {!isCompleted ? (
            <Button 
              onClick={handleCompleteCheckin}
              className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Complete Check-in
            </Button>
          ) : (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">Check-in Complete!</p>
              <p className="text-sm text-green-600">
                Overall Wellness Score: {calculateOverallScore()}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today's Check-ins */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span>Today's Check-ins</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayCheckins.map((checkin, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{checkin.time}</p>
                <p className="text-sm text-gray-600">Mood: {checkin.mood}</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${getScoreColor(checkin.score)}`}>
                  {checkin.score}%
                </p>
                <p className="text-xs text-gray-500">Wellness Score</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Wellness Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span>Wellness Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">This Week's Trends</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Sleep quality improved by 15%</li>
                <li>• Stress levels decreased</li>
                <li>• Consistent hydration goals</li>
              </ul>
            </div>
            <div className="p-4 bg-white rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Try evening meditation</li>
                <li>• Increase fiber intake</li>
                <li>• Maintain exercise routine</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WellnessCheck;
