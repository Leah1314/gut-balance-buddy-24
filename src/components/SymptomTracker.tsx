
import { useState } from "react";
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [selectedSymptom, setSelectedSymptom] = useState("");
  const [severity, setSeverity] = useState([3]);
  const [notes, setNotes] = useState("");

  const commonSymptoms = [
    t('symptoms.common.bloating'),
    t('symptoms.common.cramping'),
    t('symptoms.common.nausea'),
    t('symptoms.common.heartburn'),
    t('symptoms.common.gas'),
    t('symptoms.common.constipation'),
    t('symptoms.common.diarrhea'),
    t('symptoms.common.stomachPain'),
    t('symptoms.common.fatigue'),
    t('symptoms.common.headache')
  ];

  const recentEntries = [
    { 
      symptom: t('symptoms.common.bloating'), 
      severity: 4, 
      time: "2 hours ago", 
      date: t('common.today'),
      notes: "After lunch, feeling quite uncomfortable" 
    },
    { 
      symptom: "Energy Level", 
      severity: 8, 
      time: t('common.morning'), 
      date: t('common.today'),
      notes: "Feeling great after good sleep" 
    },
    { 
      symptom: t('symptoms.common.stomachPain'), 
      severity: 2, 
      time: t('common.yesterday'), 
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
            <span>{t('symptoms.title')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Symptom Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('symptoms.selectSymptom')}</Label>
            <Input
              placeholder={t('symptoms.placeholder')}
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
              {t('symptoms.severityLevel')}: {severity[0]}/10
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
                <span>{t('symptoms.severityScale.mild')}</span>
                <span>{t('symptoms.severityScale.moderate')}</span>
                <span>{t('symptoms.severityScale.severe')}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('symptoms.notesOptional')}</Label>
            <Textarea
              placeholder={t('symptoms.notesPlaceholder')}
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
            {t('buttons.logSymptom')}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-green-600" />
            <span>{t('symptoms.recentEntries')}</span>
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
            {t('buttons.viewAllEntries')}
          </Button>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-blue-50 to-teal-50 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 mb-1">{t('symptoms.insight')}</h3>
              <p className="text-sm text-gray-700">
                {t('symptoms.insightMessage')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SymptomTracker;
