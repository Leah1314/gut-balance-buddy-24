import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save,
  Calendar,
  Clock,
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

const StoolTracker = () => {
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
    <div className="space-y-6">
      {/* Success Card Overlay */}
      {showSuccessCard && (
        <SuccessCard 
          onClose={handleCloseSuccessCard}
          streakDays={streakDays}
        />
      )}

      <Tabs defaultValue="camera" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
          <TabsTrigger 
            value="camera" 
            className="flex items-center space-x-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            <Camera className="w-4 h-4" />
            <span>AI Analysis</span>
          </TabsTrigger>
          <TabsTrigger 
            value="manual" 
            className="flex items-center space-x-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            <Edit className="w-4 h-4" />
            <span>Manual Entry</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="camera">
          <StoolImageAnalyzer />
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          {/* General Bowel/Digestive Symptoms */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <FileText className="w-5 h-5 text-orange-600" />
                <span>General Bowel/Digestive Symptoms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900 text-left block">
                  Log any digestive symptoms, discomfort, or general observations
                </Label>
                <Textarea
                  placeholder="Example: Abdominal cramping this morning, constipated for 2 days, digestive discomfort after eating, feeling irregular today..."
                  value={generalSymptoms}
                  onChange={(e) => setGeneralSymptoms(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 min-h-[100px] text-sm rounded-lg resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {generalSymptoms.length}/500 characters
                  </span>
                  <Button 
                    onClick={handleSaveGeneralSymptom}
                    disabled={!generalSymptoms.trim() || isSavingSymptom}
                    className="bg-orange-600 text-white hover:bg-orange-700 font-medium h-10 px-6 rounded-lg"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {isSavingSymptom ? 'Saving...' : 'Save Symptom'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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

          {/* Notes */}
          <NotesSection
            notes={notes}
            onNotesChange={setNotes}
          />

          {/* Save Button */}
          <div className="text-center pt-4">
            <Button 
              onClick={handleSave}
              disabled={isSaving || !selectedType || !selectedConsistency || !selectedColor}
              className="px-8 py-3 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#4A7C59'
              }}
              onMouseEnter={(e) => {
                if (!isSaving && selectedType && selectedConsistency && selectedColor) {
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
              {isSaving ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoolTracker;
