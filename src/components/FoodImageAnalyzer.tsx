import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Zap,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useFoodLogs } from "@/hooks/useFoodLogs";

interface NutritionData {
  foodItems: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  insights: string[];
  gutHealthRating: number;
}

const FoodImageAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);
  const [userNotes, setUserNotes] = useState<string>("");
  const { addFoodLog } = useFoodLogs();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setNutritionData(null);
      setUserNotes("");
      
      toast.success(`✅ Image uploaded successfully! Ready for analysis.`);
      console.log('Image uploaded:', file.name, file.size, 'bytes');
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
      toast.error("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const base64Image = await convertImageToBase64(selectedImage);
      
      console.log('Calling Supabase edge function for image analysis...');
      
      const { data, error } = await supabase.functions.invoke('analyze-food-image', {
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

      console.log('Analysis result:', data);
      setNutritionData(data);
      toast.success("✅ Food analysis completed successfully!");
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("❌ Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveAnalysisToLog = async () => {
    if (!nutritionData || !selectedImage) {
      toast.error("No analysis data to save");
      return;
    }

    const imageUrl = URL.createObjectURL(selectedImage);
    
    const nutritionInfo = `Nutrition: ${nutritionData.calories} cal, ${nutritionData.protein}g protein, ${nutritionData.carbs}g carbs, ${nutritionData.fat}g fat`;
    const aiAnalysis = `AI Analysis - Gut Health Rating: ${nutritionData.gutHealthRating}/10. ${nutritionData.insights.join('. ')}`;
    
    // Combine nutrition info, AI analysis, and user notes
    let fullDescription = nutritionInfo;
    if (aiAnalysis) {
      fullDescription += `. ${aiAnalysis}`;
    }
    if (userNotes?.trim()) {
      fullDescription += `. User Notes: ${userNotes.trim()}`;
    }
    
    const foodLogData = {
      food_name: nutritionData.foodItems.join(', '),
      description: fullDescription,
      image_url: imageUrl
    };

    console.log('Saving analysis to food log:', foodLogData);
    const result = await addFoodLog(foodLogData);
    
    if (result) {
      toast.success("✅ Food analysis saved to your log successfully!");
      console.log('Analysis saved to log:', result);
      setSelectedImage(null);
      setImagePreview(null);
      setNutritionData(null);
      setUserNotes("");
    } else {
      toast.error("❌ Failed to save food analysis. Please try again.");
      console.error('Failed to save analysis to log');
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-600 bg-green-50";
    if (rating >= 6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="space-y-4">
      {/* Image Upload - Mobile optimized */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Camera className="w-5 h-5 text-blue-600" />
            <span>AI Food Image Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Upload Food Image</Label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500 text-center px-4">
                    <span className="font-semibold">Tap to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 10MB)</p>
                </div>
                <Input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </label>
            </div>
          </div>

          {imagePreview && (
            <div className="space-y-4">
              <img
                src={imagePreview}
                alt="Food preview"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 h-12 rounded-lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nutrition Results - More compact for mobile */}
      {nutritionData && (
        <div className="space-y-4">
          {/* Food Items Identified */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center space-x-2 text-base">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Identified Foods</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {nutritionData.foodItems.map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Nutrition Facts - Mobile grid */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Nutrition Facts</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-xl font-bold text-blue-600">{nutritionData.calories}</p>
                  <p className="text-xs text-gray-600">Calories</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-xl font-bold text-green-600">{nutritionData.protein}g</p>
                  <p className="text-xs text-gray-600">Protein</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-xl font-bold text-yellow-600">{nutritionData.carbs}g</p>
                  <p className="text-xs text-gray-600">Carbs</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xl font-bold text-purple-600">{nutritionData.fat}g</p>
                  <p className="text-xs text-gray-600">Fat</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-xl font-bold text-orange-600">{nutritionData.fiber}g</p>
                  <p className="text-xs text-gray-600">Fiber</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-xl font-bold text-red-600">{nutritionData.sugar}g</p>
                  <p className="text-xs text-gray-600">Sugar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gut Health Rating */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Gut Health Rating</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={`text-center p-4 rounded-lg ${getRatingColor(nutritionData.gutHealthRating)}`}>
                <div className="text-2xl font-bold mb-2">
                  {nutritionData.gutHealthRating}/10
                </div>
                <p className="text-sm">
                  {nutritionData.gutHealthRating >= 8 ? "Excellent for gut health!" :
                   nutritionData.gutHealthRating >= 6 ? "Good choice with some benefits" :
                   "Consider healthier alternatives"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights - Compact */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {nutritionData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="Add any corrections or additional details about your meal... (e.g., 'Had extra sauce on the side', 'Portion was larger than shown', 'Actually grilled, not fried')"
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {userNotes.length}/500 characters
              </div>
            </CardContent>
          </Card>

          {/* Save to Log Button */}
          <div className="text-center pt-2">
            <Button 
              onClick={saveAnalysisToLog}
              className="w-full h-12 text-white font-medium transition-colors rounded-lg"
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
              <Save className="w-5 h-5 mr-2 stroke-2" />
              Save to My Log
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodImageAnalyzer;
