
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Camera,
  Upload,
  Loader2,
  CheckCircle,
  Sparkles,
  Save,
  Info,
  Lightbulb,
  Leaf
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useStoolLogs } from "@/hooks/useStoolLogs";
import SuccessCard from "./stool/SuccessCard";
import SectionCard from "./gutly/SectionCard";
import GutlySays from "./gutly/GutlySays";
import StatNumber from "./gutly/StatNumber";

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

  return (
    <div className="space-y-6">
      {/* Success Card Overlay */}
      {showSuccessCard && (
        <SuccessCard 
          onClose={handleCloseSuccessCard}
          streakDays={streakDays}
        />
      )}

      {/* Intro */}
      {!imagePreview && !analysisData && (
        <GutlySays title={t('stool.aiStoolAnalysis')}>
          {t('stool.uploadStoolPhoto')}
        </GutlySays>
      )}

      {/* Upload zone */}
      {!imagePreview && (
        <label className="block cursor-pointer group">
          <div className="rounded-[var(--radius)] bg-card shadow-soft border-2 border-dashed border-primary/25 hover:border-primary/50 hover:bg-primary-soft/30 transition-all p-8 text-center animate-fade-in">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-primary-soft text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Upload className="w-6 h-6" strokeWidth={2} />
            </div>
            <p className="text-[15px] text-foreground">
              <span className="font-semibold text-primary">{t('stool.clickToUpload')}</span>{" "}
              <span className="text-muted-foreground">{t('stool.uploadStoolPhoto')}</span>
            </p>
            <p className="text-caption mt-1">{t('food.maxFileSize')}</p>
          </div>
          <Input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
        </label>
      )}

      {/* Preview + analyze */}
      {imagePreview && !analysisData && (
        <div className="space-y-4 animate-fade-in">
          <div className="relative rounded-[var(--radius)] overflow-hidden shadow-card">
            <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
          </div>
          <div className="flex gap-3">
            <label className="flex-1">
              <div className="h-12 rounded-full bg-primary-soft text-primary-soft-foreground text-sm font-medium flex items-center justify-center gap-2 cursor-pointer hover:bg-primary-soft/80 transition-colors active:scale-[0.98]">
                <Camera className="w-4 h-4" />
                {t('food.retake') || 'Retake'}
              </div>
              <Input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
            </label>
            <Button onClick={analyzeImage} disabled={isAnalyzing} className="flex-1">
              {isAnalyzing ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('stool.analyzingWithAI')}</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />{t('food.analyzeWithAI')}</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Not stool */}
      {isNotStoolImage && (
        <SectionCard icon={Info} title={t('stool.notStool')} tone="accent">
          <p className="text-body text-foreground/80">{notStoolMessage}</p>
          <p className="text-caption mt-2">{t('stool.pleaseUploadStool')}</p>
        </SectionCard>
      )}

      {/* Analysis results */}
      {analysisData && (
        <div className="space-y-6 animate-fade-in">
          {imagePreview && (
            <div className="rounded-[var(--radius)] overflow-hidden shadow-card">
              <img src={imagePreview} alt="Analyzed" className="w-full h-56 object-cover" />
            </div>
          )}

          <GutlySays title={t('stool.healthScore')}>
            {analysisData.insights?.[0] || t('stool.stoolAnalysisCompleted')}
          </GutlySays>

          <SectionCard>
            <StatNumber
              value={analysisData.healthScore * 10}
              max={100}
              label={t('stool.healthScore')}
              suffix="/100"
            />
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border/40">
              <div className="text-center">
                <p className="text-caption mb-1">{t('stool.bristolStoolType')}</p>
                <p className="text-lg font-semibold text-foreground">Type {analysisData.bristolType}</p>
              </div>
              <div className="text-center">
                <p className="text-caption mb-1">{t('stool.consistency')}</p>
                <p className="text-lg font-semibold text-foreground capitalize">{analysisData.consistency}</p>
              </div>
              <div className="text-center">
                <p className="text-caption mb-1">{t('stool.color')}</p>
                <p className="text-lg font-semibold text-foreground capitalize">{analysisData.color}</p>
              </div>
            </div>
            <p className="text-caption text-center mt-3">{getBristolDescription(analysisData.bristolType)}</p>
          </SectionCard>

          <SectionCard icon={Lightbulb} title={t('food.aiInsights')}>
            <ul className="space-y-3">
              {analysisData.insights.map((insight, i) => (
                <li key={i} className="flex gap-3 text-body">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <span className="text-foreground/80">{insight}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard icon={Leaf} title={t('stool.recommendations')} tone="soft">
            <ul className="space-y-3">
              {analysisData.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 text-body">
                  <CheckCircle className="w-4 h-4 mt-1 text-primary shrink-0" />
                  <span className="text-foreground/80">{rec}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title={t('stool.symptomsAndNotes')}>
            <Textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder={`${t('stool.addSymptoms')} ${t('stool.stomachPainExample')}`}
              className="min-h-[90px] text-[15px] rounded-2xl resize-none border-border/60 bg-background/60"
              maxLength={500}
            />
            <div className="text-right text-caption mt-2">
              {userNotes.length}/500 {t('common.characters')}
            </div>
          </SectionCard>

          <div className="text-center pt-2">
            <Button onClick={saveAnalysisToLog} disabled={isSaving} size="lg" className="px-10">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? t('buttons.saving') : t('food.saveToLog')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoolImageAnalyzer;
