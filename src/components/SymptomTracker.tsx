
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  Plus, 
  Activity, 
  AlertCircle, 
  Smile, 
  Meh, 
  Frown,
  Calendar,
  Clock
} from "lucide-react";

const SymptomTracker = () => {
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [severity, setSeverity] = useState([3]);
  const [notes, setNotes] = useState("");

  const commonSymptoms = [
    "Bloating", "Cramping", "Nausea", "Heartburn", "Gas", 
    "Constipation", "Diarrhea", "Stomach Pain", "Fatigue", "Headache"
  ];

  const recentEntries = [
    { 
      symptom: "Bloating", 
      severity: 4, 
      time: "2 hours ago", 
      date: "Today",
      notes: "After lunch, feeling quite uncomfortable" 
    },
    { 
      symptom: "Energy Level", 
      severity: 8, 
      time: "Morning", 
      date: "Today",
      notes: "Feeling great after good sleep" 
    },
    { 
      symptom: "Stomach Pain", 
      severity: 2, 
      time: "Yesterday", 
      date: "Dec 19",
      notes: "Mild discomfort, went away quickly" 
    },
  ];

  const getSeverityIcon = (level: number) => {
    if (level <= 3) return <Smile className="w-4 h-4 text-green-500" />;
    if (level <= 6) return <Meh className="w-4 h-4 text-yellow-500" />;
    return <Frown className="w-4 h-4 text-red-500" />;
  };

  const getSeverityColor = (level: number) => {
    if (level <= 3) return "bg-green-100 text-green-800";
    if (level <= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const handleLogSymptom = () => {
    if (selectedSymptom) {
      console.log("Logging symptom:", { selectedSymptom, severity: severity[0], notes });
      // Here you would typically save to a database
      setSelectedSymptom("");
      setSeverity([3]);
      setNotes("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Log Symptom */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-blue-600" />
            <span>Log New Symptom</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Symptom Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select or enter symptom</Label>
            <Input
              placeholder="Enter symptom or select from below"
              value={selectedSymptom}
              onChange={(e) => setSelectedSymptom(e.target.value)}
              className="mb-3"
            />
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((symptom) => (
                <Button
                  key={symptom}
                  variant={selectedSymptom === symptom ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSymptom(symptom)}
                  className="text-xs"
                >
                  {symptom}
                </Button>
              ))}
            </div>
          </div>

          {/* Severity Scale */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Severity Level: {severity[0]}/10
            </Label>
            <div className="px-3">
              <Slider
                value={severity}
                onValueChange={setSeverity}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Notes (optional)</Label>
            <Textarea
              placeholder="Any additional details about the symptom..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Button 
            onClick={handleLogSymptom}
            className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
            disabled={!selectedSymptom}
          >
            <Activity className="w-4 h-4 mr-2" />
            Log Symptom
          </Button>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span>Recent Entries</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentEntries.map((entry, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-medium text-gray-900">{entry.symptom}</h3>
                    {getSeverityIcon(entry.severity)}
                    <Badge className={getSeverityColor(entry.severity)}>
                      {entry.severity}/10
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{entry.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{entry.time}</span>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-sm text-gray-700 bg-white p-2 rounded">
                      {entry.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full">
            View All Entries
          </Button>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Insight</h3>
              <p className="text-sm text-gray-700">
                You've logged bloating 3 times this week, typically 2-3 hours after meals. 
                Consider tracking what you eat to identify potential triggers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SymptomTracker;
