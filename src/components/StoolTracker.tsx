
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save,
  Calendar,
  Clock,
  Camera,
  Edit
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
import { useStoolLogs } from "@/hooks/useStoolLogs";

const StoolTracker = () => {
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedConsistency, setSelectedConsistency] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const { addStoolLog } = useStoolLogs();

  const handleSave = async () => {
    if (!selectedType || !selectedConsistency || !selectedColor) {
      toast.error("Please fill in all fields");
      return;
    }

    // Convert photo to URL if available (simplified for now)
    const imageUrl = photos.length > 0 ? URL.createObjectURL(photos[0]) : undefined;

    const stoolLogData = {
      bristol_type: selectedType,
      consistency: selectedConsistency,
      color: selectedColor,
      notes: notes || undefined,
      image_url: imageUrl
    };

    const result = await addStoolLog(stoolLogData);
    
    if (result) {
      toast.success("Stool entry saved successfully!");
      
      // Reset form
      setSelectedType(null);
      setSelectedConsistency(null);
      setSelectedColor(null);
      setNotes("");
      setPhotos([]);
    }
  };

  const handlePhotoAdd = (file: File) => {
    setPhotos(prev => [...prev, file]);
  };

  const handlePhotoRemove = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
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
              className="px-8 py-3 text-white font-medium transition-colors"
              style={{
                backgroundColor: '#4A7C59'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5B8C6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4A7C59';
              }}
            >
              <Save className="w-4 h-4 mr-2 stroke-2" />
              Save Entry
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StoolTracker;
