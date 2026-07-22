
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save,
  Camera,
  Edit,
  FileText
} from "lucide-react";
import { toast } from "sonner";
import { StoolEntry } from "@/types/stool";
import { DateTimeHeader } from "./stool/DateTimeHeader";
import { BristolStoolChart } from "./stool/BristolStoolChart";
import { ConsistencySelector } from "./stool/ConsistencySelector";
import { ColorSelector } from "./stool/ColorSelector";
import { PhotoUpload } from "./stool/PhotoUpload";
import { NotesSection } from "./stool/NotesSection";
import StoolImageAnalyzer from "./StoolImageAnalyzer";
import SuccessCard from "./stool/SuccessCard";
import { useStoolLogs } from "@/hooks/useStoolLogs";
import SectionCard from "./gutly/SectionCard";

const StoolTracker = () => {
  const { t } = useTranslation();
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedConsistency, setSelectedConsistency] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [streakDays, setStreakDays] = useState(1);
  const [generalSymptoms, setGeneralSymptoms] = useState("");
  const [isSavingSymptom, setIsSavingSymptom] = useState(false);
  const { addStoolLog, calculateCurrentStreak } = useStoolLogs();

  const handleSave = async () => {
    if (!selectedType || !selectedConsistency || !selectedColor) {
      toast.error("Please fill in all required fields (Bristol type, consistency, and color)");
      return;
    }

    setIsSaving(true);
    
    try {
      // Convert photo to URL if available (simplified for now)
      const imageUrl = photos.length > 0 ? URL.createObjectURL(photos[0]) : undefined;

      const stoolLogData = {
        bristol_type: selectedType,
        consistency: selectedConsistency,
        color: selectedColor,
        notes: notes || undefined,
        image_url: imageUrl
      };

      console.log('Saving stool log:', stoolLogData);
      const result = await addStoolLog(stoolLogData);
      
      if (result) {
        console.log('Stool log saved:', result);
        
        // Calculate real streak after saving
        const currentStreak = await calculateCurrentStreak();
        setStreakDays(currentStreak);
        
        // Show success card instead of toast
        setShowSuccessCard(true);
        
        // Reset form
        setSelectedType(null);
        setSelectedConsistency(null);
        setSelectedColor(null);
        setNotes("");
        setPhotos([]);
      } else {
        toast.error("Failed to save stool entry. Please try again.");
        console.error('Failed to save stool log');
      }
    } catch (error) {
      console.error('Error saving stool log:', error);
      toast.error("An error occurred while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoAdd = (file: File) => {
    setPhotos(prev => [...prev, file]);
  };

  const handlePhotoRemove = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleCloseSuccessCard = () => {
    setShowSuccessCard(false);
  };

  const handleSaveGeneralSymptom = async () => {
    if (!generalSymptoms.trim()) {
      toast.error("Please enter some symptoms or notes");
      return;
    }

    setIsSavingSymptom(true);

    const symptomData = {
      bristol_type: null,
      consistency: null,
      color: null,
      notes: generalSymptoms.trim(),
      image_url: undefined
    };

    console.log('Saving general symptom:', symptomData);
    const result = await addStoolLog(symptomData);
    
    if (result) {
      toast.success("✅ Symptom note saved successfully!");
      setGeneralSymptoms("");
      console.log('General symptom saved:', result);
    } else {
      toast.error("❌ Failed to save symptom note. Please try again.");
      console.error('Failed to save general symptom');
    }

    setIsSavingSymptom(false);
  };

  return (
    <div className="space-y-4">
      {/* Success Card Overlay */}
      {showSuccessCard && (
        <SuccessCard 
          onClose={handleCloseSuccessCard}
          streakDays={streakDays}
        />
      )}

      <Tabs defaultValue="camera" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/70 rounded-2xl p-1">
          <TabsTrigger 
            value="camera" 
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary h-10 text-[13px] font-medium"
          >
            <Camera className="w-4 h-4" />
            <span>{t('food.aiAnalysis')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="manual" 
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary h-10 text-[13px] font-medium"
          >
            <Edit className="w-4 h-4" />
            <span>{t('food.manualEntry')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="camera" className="mt-4">
          <StoolImageAnalyzer />
        </TabsContent>

        <TabsContent value="manual" className="space-y-4 mt-4">
          <SectionCard icon={FileText} title={t('stool.generalSymptoms')} description={t('stool.generalSymptomsDescription')}>
            <div className="space-y-2">
              <Textarea
                placeholder={t('stool.generalSymptomsPlaceholder')}
                value={generalSymptoms}
                onChange={(e) => setGeneralSymptoms(e.target.value)}
                className="min-h-[90px] text-[15px] rounded-2xl resize-none border-border/60 bg-background/60"
                maxLength={500}
              />
              <div className="flex justify-between items-center gap-3">
                <span className="text-caption">
                  {generalSymptoms.length}/500 {t('common.characters')}
                </span>
                <Button
                  onClick={handleSaveGeneralSymptom}
                  disabled={!generalSymptoms.trim() || isSavingSymptom}
                  className="px-6"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isSavingSymptom ? t('buttons.saving') : t('stool.saveSymptom')}
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* Date/Time Header */}
          <DateTimeHeader />

          {/* Bristol Stool Chart */}
          <BristolStoolChart 
            selectedType={selectedType}
            onTypeSelect={setSelectedType}
          />

          {/* Consistency */}
          <ConsistencySelector
            selectedConsistency={selectedConsistency}
            onConsistencySelect={setSelectedConsistency}
          />

          {/* Color */}
          <ColorSelector
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
          />

          {/* Photo Upload */}
          <PhotoUpload
            photos={photos}
            onPhotoAdd={handlePhotoAdd}
            onPhotoRemove={handlePhotoRemove}
          />

          {/* Save Button */}
          <div className="text-center pt-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || !selectedType || !selectedConsistency || !selectedColor}
              size="lg"
              className="px-10"
            >
              <Save className="w-4 h-4 mr-2 stroke-2" />
              {isSaving ? t('buttons.saving') : t('buttons.saveEntry')}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoolTracker;
