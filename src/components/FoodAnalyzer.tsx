
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Loader2, 
  Zap,
  Brain,
  Heart
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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

const FoodAnalyzer = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null);

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
      
      const { data, error } = await supabase.functions.invoke('analyze-food-image', {
        body: { image: base64Image }
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze image');
      }

      setNutritionData(data);
      toast.success("Food analysis complete!");
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-600 bg-green-50 border-green-200";
    if (rating >= 6) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setNutritionData(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Camera className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> your food photo
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

          {imagePreview && (
            <div className="mt-6 space-y-4">
              <img
                src={imagePreview}
                alt="Food preview"
                className="w-full h-64 object-cover rounded-xl border shadow-sm"
              />
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium py-3 text-lg"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Analyze Food
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {nutritionData && (
        <div className="space-y-6">
          {/* Gut Health Score */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-xl">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gut Health Score</h3>
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold border-2 ${getRatingColor(nutritionData.gutHealthRating)}`}>
                {nutritionData.gutHealthRating}/10
              </div>
            </CardContent>
          </Card>

          {/* Food Items */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Identified Foods</h3>
              <div className="flex flex-wrap gap-2">
                {nutritionData.foodItems.map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-0 shadow-lg">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 text-green-600 mr-2" />
                AI Insights
              </h3>
              <div className="space-y-3">
                {nutritionData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <div className="text-center pt-4">
            <Button onClick={resetAnalysis} variant="outline" className="px-8">
              Analyze Another Food
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodAnalyzer;
