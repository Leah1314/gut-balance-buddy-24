
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
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");

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
      setShowTextInput(false);
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

  const analyzeText = async () => {
    if (!textInput.trim()) {
      toast.error("Please enter some food items");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Mock analysis for text input - in a real app this would call an API
      const mockData: NutritionData = {
        foodItems: textInput.split(',').map(item => item.trim()),
        calories: 350,
        protein: 15,
        carbs: 45,
        fat: 12,
        fiber: 8,
        sugar: 10,
        insights: [
          "Good fiber content supports digestive health",
          "Balanced macronutrient profile",
          "Consider adding more vegetables for optimal nutrition"
        ],
        gutHealthRating: 7
      };

      setNutritionData(mockData);
      toast.success("Food analysis complete!");
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze food. Please try again.");
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
    setShowTextInput(false);
    setTextInput("");
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-green-300 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-36 border border-gray-200 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Camera className="w-8 h-8 mb-2 text-gray-400 stroke-2" />
                <p className="mb-1 text-sm text-gray-700 font-medium">
                  Click to upload your food photo
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

          <div className="text-center mt-3">
            <button
              onClick={() => setShowTextInput(!showTextInput)}
              className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              or type it in
            </button>
          </div>

          {showTextInput && (
            <div className="mt-4 space-y-3">
              <Input
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter food items (e.g., grilled chicken, brown rice, broccoli)"
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
              <Button
                onClick={analyzeText}
                disabled={isAnalyzing || !textInput.trim()}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2 stroke-2" />
                    Analyze Food
                  </>
                )}
              </Button>
            </div>
          )}

          {imagePreview && (
            <div className="mt-6 space-y-4">
              <img
                src={imagePreview}
                alt="Food preview"
                className="w-full h-64 object-cover rounded-lg border border-gray-200"
              />
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2 stroke-2" />
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
          <Card className="bg-green-50 border border-green-200 shadow-sm">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-green-600 mx-auto mb-3 stroke-2" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gut Health Score</h3>
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold border ${getRatingColor(nutritionData.gutHealthRating)}`}>
                {nutritionData.gutHealthRating}/10
              </div>
            </CardContent>
          </Card>

          {/* Food Items */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Identified Foods</h3>
              <div className="flex flex-wrap gap-2">
                {nutritionData.foodItems.map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1 bg-gray-100 text-gray-700">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="bg-green-50 border border-green-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Brain className="w-5 h-5 text-green-600 mr-2 stroke-2" />
                AI Insights
              </h3>
              <div className="space-y-3">
                {nutritionData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-green-100">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <div className="text-center pt-4">
            <Button onClick={resetAnalysis} variant="outline" className="px-8 border-gray-200 text-gray-600 hover:border-gray-300">
              Analyze Another Food
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodAnalyzer;
