
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Activity,
  Calendar,
  Clock,
  Droplets,
  Target,
  TrendingUp,
  Camera
} from "lucide-react";
import { toast } from "sonner";

interface StoolEntry {
  id: string;
  date: string;
  time: string;
  type: number; // Bristol Stool Scale 1-7
  consistency: string;
  color: string;
  photo?: string;
  notes?: string;
}

const StoolTracker = () => {
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [entries, setEntries] = useState<StoolEntry[]>([]);

  const bristolTypes = [
    { type: 1, description: "Separate hard lumps", consistency: "Very constipated", color: "text-red-600" },
    { type: 2, description: "Lumpy and sausage-like", consistency: "Slightly constipated", color: "text-orange-600" },
    { type: 3, description: "Sausage with cracks", consistency: "Normal", color: "text-yellow-600" },
    { type: 4, description: "Smooth, soft sausage", consistency: "Ideal", color: "text-green-600" },
    { type: 5, description: "Soft blobs with clear-cut edges", consistency: "Lacking fiber", color: "text-blue-600" },
    { type: 6, description: "Mushy consistency with ragged edges", consistency: "Mild diarrhea", color: "text-purple-600" },
    { type: 7, description: "Liquid consistency with no solid pieces", consistency: "Severe diarrhea", color: "text-red-600" },
  ];

  const stoolColors = [
    { name: "Brown", value: "brown", bg: "bg-amber-700" },
    { name: "Light Brown", value: "light-brown", bg: "bg-amber-500" },
    { name: "Dark Brown", value: "dark-brown", bg: "bg-amber-900" },
    { name: "Green", value: "green", bg: "bg-green-600" },
    { name: "Yellow", value: "yellow", bg: "bg-yellow-500" },
    { name: "Red", value: "red", bg: "bg-red-600" },
    { name: "Black", value: "black", bg: "bg-gray-900" },
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addEntry = () => {
    if (!selectedType || !selectedColor) {
      toast.error("Please select both stool type and color");
      return;
    }

    const now = new Date();
    const newEntry: StoolEntry = {
      id: crypto.randomUUID(),
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: selectedType,
      consistency: bristolTypes.find(t => t.type === selectedType)?.consistency || "",
      color: selectedColor,
      photo: imagePreview || undefined,
    };

    setEntries([newEntry, ...entries]);
    setSelectedType(null);
    setSelectedColor("");
    setSelectedImage(null);
    setImagePreview(null);
    toast.success("Stool entry logged successfully!");
  };

  const getHealthInsight = () => {
    if (entries.length === 0) return null;
    
    const recentEntries = entries.slice(0, 7); // Last 7 entries
    const idealCount = recentEntries.filter(e => e.type === 3 || e.type === 4).length;
    const percentage = Math.round((idealCount / recentEntries.length) * 100);
    
    return {
      percentage,
      message: percentage >= 70 ? "Excellent digestive health!" : 
               percentage >= 50 ? "Good, but could improve" : 
               "Consider dietary adjustments"
    };
  };

  const insight = getHealthInsight();

  return (
    <div className="space-y-6">
      {/* Health Insight */}
      {insight && (
        <Card className="bg-green-50 border border-green-200 shadow-sm">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-3 stroke-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Digestive Health Score</h3>
            <div className="text-2xl font-bold text-green-600 mb-2">{insight.percentage}%</div>
            <p className="text-sm text-gray-600">{insight.message}</p>
          </CardContent>
        </Card>
      )}

      {/* Photo Upload Section */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Camera className="w-5 h-5 text-green-600 mr-2 stroke-2" />
            Take Photo (Optional)
          </h3>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border border-gray-200 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Camera className="w-8 h-8 mb-3 text-gray-400 stroke-2" />
                <p className="mb-2 text-sm text-gray-700 font-medium">
                  Click to take photo or upload
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</p>
              </div>
              <Input
                type="file"
                className="hidden"
                accept="image/*"
                capture="environment"
                onChange={handleImageSelect}
              />
            </label>
          </div>

          {imagePreview && (
            <div className="mt-4">
              <img
                src={imagePreview}
                alt="Stool photo"
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bristol Stool Scale */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 text-green-600 mr-2 stroke-2" />
            Bristol Stool Scale
          </h3>
          <div className="space-y-3">
            {bristolTypes.map((item) => (
              <button
                key={item.type}
                onClick={() => setSelectedType(item.type)}
                className={`w-full p-3 rounded-lg border transition-all ${
                  selectedType === item.type
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between text-left">
                  <div>
                    <div className="font-medium">Type {item.type}</div>
                    <div className="text-sm text-gray-600">{item.description}</div>
                  </div>
                  <Badge className={`${item.color} bg-gray-100`}>
                    {item.consistency}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Selection */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Droplets className="w-5 h-5 text-green-600 mr-2 stroke-2" />
            Stool Color
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {stoolColors.map((color) => (
              <button
                key={color.value}
                onClick={() => setSelectedColor(color.value)}
                className={`p-3 rounded-lg border transition-all ${
                  selectedColor === color.value
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${color.bg}`}></div>
                  <span className="text-sm font-medium">{color.name}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Entry Button */}
      <Button
        onClick={addEntry}
        disabled={!selectedType || !selectedColor}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 text-lg"
      >
        <Activity className="w-5 h-5 mr-2 stroke-2" />
        Log Stool Entry
      </Button>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 text-green-600 mr-2 stroke-2" />
              Recent Entries
            </h3>
            <div className="space-y-3">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">Type {entry.type} - {entry.consistency}</div>
                      <div className="text-sm text-gray-600 flex items-center space-x-2">
                        <Calendar className="w-4 h-4 stroke-2" />
                        <span>{entry.date}</span>
                        <Clock className="w-4 h-4 stroke-2" />
                        <span>{entry.time}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">{entry.color.replace('-', ' ')}</Badge>
                  </div>
                  {entry.photo && (
                    <img
                      src={entry.photo}
                      alt="Stool entry"
                      className="w-full h-24 object-cover rounded-lg mt-2 border border-gray-200"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StoolTracker;
