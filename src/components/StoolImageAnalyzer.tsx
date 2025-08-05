
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Zap,
  Heart,
  Save,
  Info
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useStoolLogs } from "@/hooks/useStoolLogs";
import SuccessCard from "./stool/SuccessCard";

interface StoolAnalysisData {
  bristolType: number;
  consistency: string;
  color: string;
  healthScore: number;
  insights: string[];
  recommendations: string[];
}

const StoolImageAnalyzer = () => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisData, setAnalysisData] = useState<StoolAnalysisData | null>(null);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [streakDays, setStreakDays] = useState(1);
  const [isNotStoolImage, setIsNotStoolImage] = useState(false);
  const [notStoolMessage, setNotStoolMessage] = useState("");
  const [userNotes, setUserNotes] = useState<string>("");
  const { addStoolLog, calculateCurrentStreak } = useStoolLogs();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysisData(null);
      setIsNotStoolImage(false);
      setNotStoolMessage("");
      setUserNotes("");
      toast.success(t('stool.imageUploaded'));
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast.error(t('food.selectImageFirst'));
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Converting image to base64...');
      const base64Image = await convertImageToBase64(selectedImage);
      
      console.log('Calling Supabase edge function for stool analysis...');
      
      const { data, error } = await supabase.functions.invoke('analyze-stool-image', {
        body: {
          image: base64Image
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to analyze image');
      }

      if (!data) {
        throw new Error('No data received from analysis');
      }

      // Check if the response indicates it's not a stool image
      if (data.error && data.isNotStool) {
        setIsNotStoolImage(true);
        setNotStoolMessage(data.error);
        setAnalysisData(null);
        console.log('Image rejected by AI:', data.error);
        return;
      }

      // Check for other errors
      if (data.error) {
        toast.error(data.error);
        console.log('Analysis error:', data.error);
        return;
      }

      console.log('Stool analysis result:', data);
      setAnalysisData(data);
      setIsNotStoolImage(false);
      setNotStoolMessage("");
      toast.success(t('stool.stoolAnalysisCompleted'));
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error(t('stool.analysisImageFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysisToLog = async () => {
    if (!analysisData || !selectedImage) {
      toast.error(t('food.noAnalysisData'));
      return;
    }

    setIsSaving(true);

    try {
      const imageUrl = URL.createObjectURL(selectedImage);
      
      const aiAnalysis = `AI Analysis - Health Score: ${analysisData.healthScore}/10. Insights: ${analysisData.insights.join('. ')}`;
      const combinedNotes = userNotes ? `${aiAnalysis}. User Notes: ${userNotes}` : aiAnalysis;
      
      const stoolLogData = {
        bristol_type: analysisData.bristolType,
        consistency: analysisData.consistency,
        color: analysisData.color,
        notes: combinedNotes,
        image_url: imageUrl
      };

      console.log('Saving AI analysis to log:', stoolLogData);
      const result = await addStoolLog(stoolLogData);
      
      if (result) {
        console.log('AI analysis saved:', result);
        
        // Calculate real streak after saving
        const currentStreak = await calculateCurrentStreak();
        setStreakDays(currentStreak);
        
        // Show success card instead of toast
        setShowSuccessCard(true);
        
        // Reset form
        setSelectedImage(null);
        setImagePreview(null);
        setAnalysisData(null);
        setIsNotStoolImage(false);
        setNotStoolMessage("");
        setUserNotes("");
      } else {
        toast.error("Failed to save analysis. Please try again.");
        console.error('Failed to save AI analysis');
      }
    } catch (error) {
      console.error('Error saving AI analysis:', error);
      toast.error("An error occurred while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSuccessCard = () => {
    setShowSuccessCard(false);
  };

  const getBristolDescription = (type: number) => {
    return t(`stool.bristolDescriptions.${type}`) || "Unknown";
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 8) return { color: '#4A7C59', backgroundColor: '#F9F8F4', borderColor: '#4A7C59' };
    if (score >= 6) return { color: '#B8860B', backgroundColor: '#FFF8DC', borderColor: '#DAA520' };
    return { color: '#DC143C', backgroundColor: '#FFE4E1', borderColor: '#DC143C' };
  };

  return (
    <div className="space-y-6">
      {/* Success Card Overlay */}
      {showSuccessCard && (
        <SuccessCard 
          onClose={handleCloseSuccessCard}
          streakDays={streakDays}
        />
      )}

      {/* Image Upload */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <span>{t('stool.aiStoolAnalysis')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">{t('stool.clickToUpload')}</span> {t('stool.uploadStoolPhoto')}
                </p>
                <p className="text-xs text-gray-500">{t('food.maxFileSize')}</p>
              </div>
              <Input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
            </label>
          </div>

          {imagePreview && (
            <div className="space-y-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('stool.analyzingWithAI')}
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    {t('food.analyzeWithAI')}
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Not Stool Image Message */}
      {isNotStoolImage && (
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="p-6 text-center">
            <Info className="w-8 h-8 mx-auto mb-3 text-blue-500" />
            <h3 className="text-lg font-semibold mb-2 text-blue-700">{t('stool.notStool')}</h3>
            <p className="text-blue-600 mb-4">{notStoolMessage}</p>
            <p className="text-sm text-blue-500">
              {t('stool.pleaseUploadStool')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisData && (
        <div className="space-y-4">
          {/* Health Score */}
          <Card className="shadow-sm" 
                style={{ 
                  backgroundColor: '#F9F8F4', 
                  borderColor: '#4A7C59' 
                }}>
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 mx-auto mb-3 stroke-2" style={{ color: '#4A7C59' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#2E2E2E' }}>{t('stool.healthScore')}</h3>
              <div className="inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold border"
                   style={getHealthScoreColor(analysisData.healthScore)}>
                {analysisData.healthScore}/10
              </div>
            </CardContent>
          </Card>

          {/* Bristol Type Result */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>{t('stool.bristolStoolType')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  Type {analysisData.bristolType}
                </div>
                <p className="text-sm text-gray-600">
                  {getBristolDescription(analysisData.bristolType)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Details */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{t('stool.analysisDetails')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{analysisData.consistency}</p>
                  <p className="text-sm text-gray-600">{t('stool.consistency')}</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-lg font-bold text-yellow-600">{analysisData.color}</p>
                  <p className="text-sm text-gray-600">{t('stool.color')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{t('food.aiInsights')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{t('stool.recommendations')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysisData.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Symptoms & Notes */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{t('stool.symptomsAndNotes')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder={`${t('stool.addSymptoms')} ${t('stool.stomachPainExample')}`}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {userNotes.length}/500 {t('common.characters')}
              </div>
            </CardContent>
          </Card>

          {/* Save to Log Button */}
          <div className="text-center pt-4">
            <Button 
              onClick={saveAnalysisToLog}
              disabled={isSaving}
              className="px-8 py-3 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#4A7C59'
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#5B8C6B';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = '#4A7C59';
                }
              }}
            >
              <Save className="w-4 h-4 mr-2 stroke-2" />
              {isSaving ? t('buttons.saving') : t('food.saveToLog')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoolImageAnalyzer;
