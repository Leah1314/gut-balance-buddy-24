
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
  Zap
} from "lucide-react";
import { toast } from "sonner";

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
  const [apiKey, setApiKey] = useState("");

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
        resolve(base64.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeImage = async () => {
    if (!selectedImage || !apiKey.trim()) {
      toast.error("Please select an image and enter your OpenAI API key");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const base64Image = await convertImageToBase64(selectedImage);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this food image and provide detailed nutrition information. Return ONLY a JSON object with this exact structure:
{
  "foodItems": ["list of food items identified"],
  "calories": estimated_total_calories_number,
  "protein": protein_grams_number,
  "carbs": carbs_grams_number,
  "fat": fat_grams_number,
  "fiber": fiber_grams_number,
  "sugar": sugar_grams_number,
  "insights": ["gut health insights", "nutritional benefits", "potential concerns"],
  "gutHealthRating": rating_from_1_to_10
}

Focus on gut health implications and be as accurate as possible with nutrition estimates.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      // Parse the JSON response
      const nutritionInfo = JSON.parse(content);
      setNutritionData(nutritionInfo);
      toast.success("Food analysis complete!");
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error("Failed to analyze image. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-green-600 bg-green-50";
    if (rating >= 6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="space-y-6">
      {/* API Key Input */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-2">OpenAI API Key Required</h3>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter your OpenAI API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-white"
                />
                <p className="text-xs text-gray-600">
                  Your API key is stored locally and used only for this analysis.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Upload */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <span>Food Image Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Upload Food Image</Label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
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
            <div className="space-y-3">
              <img
                src={imagePreview}
                alt="Food preview"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing || !apiKey.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nutrition Results */}
      {nutritionData && (
        <div className="space-y-4">
          {/* Food Items Identified */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Identified Foods</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {nutritionData.foodItems.map((item, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Nutrition Facts */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Nutrition Facts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{nutritionData.calories}</p>
                  <p className="text-sm text-gray-600">Calories</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{nutritionData.protein}g</p>
                  <p className="text-sm text-gray-600">Protein</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{nutritionData.carbs}g</p>
                  <p className="text-sm text-gray-600">Carbs</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{nutritionData.fat}g</p>
                  <p className="text-sm text-gray-600">Fat</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{nutritionData.fiber}g</p>
                  <p className="text-sm text-gray-600">Fiber</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{nutritionData.sugar}g</p>
                  <p className="text-sm text-gray-600">Sugar</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gut Health Rating */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Gut Health Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-center p-4 rounded-lg ${getRatingColor(nutritionData.gutHealthRating)}`}>
                <div className="text-3xl font-bold mb-2">
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

          {/* AI Insights */}
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nutritionData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FoodImageAnalyzer;
