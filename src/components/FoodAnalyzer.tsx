
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
    if (rating >= 8) return { color: '#4A7C59', backgroundColor: '#F9F8F4', borderColor: '#4A7C59' };
    if (rating >= 6) return { color: '#B8860B', backgroundColor: '#FFF8DC', borderColor: '#DAA520' };
    return { color: '#DC143C', backgroundColor: '#FFE4E1', borderColor: '#DC143C' };
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
      <Card className="bg-white shadow-sm hover:shadow-md transition-all duration-200" 
            style={{ borderColor: '#D3D3D3' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#4A7C59';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#D3D3D3';
            }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-36 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:border-opacity-100"
                   style={{ 
                     backgroundColor: '#F9F8F4',
                     borderColor: '#D3D3D3'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.backgroundColor = '#FFFFFF';
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.backgroundColor = '#F9F8F4';
                   }}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Camera className="w-8 h-8 mb-2 stroke-2" style={{ color: '#2E2E2E', opacity: 0.6 }} />
                <p className="mb-1 text-sm font-medium" style={{ color: '#2E2E2E' }}>
                  Click to upload your food photo
                </p>
                <p className="text-xs" style={{ color: '#2E2E2E', opacity: 0.6 }}>PNG, JPG, JPEG (MAX. 10MB)</p>
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
              className="text-sm font-medium transition-colors"
              style={{ 
                color: '#4A7C59'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#5B8C6B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#4A7C59';
              }}
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
                className="focus:ring-2 focus:ring-offset-2 placeholder:text-white"
                style={{
                  borderColor: '#D3D3D3',
                  backgroundColor: '#A0A0A0',
                  color: '#FFFFFF',
                  '--tw-ring-color': '#4A7C59'
                } as React.CSSProperties}
              />
              <Button
                onClick={analyzeText}
                disabled={isAnalyzing || !textInput.trim()}
                className="w-full font-medium transition-colors"
                style={{
                  backgroundColor: '#4A7C59',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#5B8C6B';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#4A7C59';
                  }
                }}
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
                className="w-full h-64 object-cover rounded-lg border"
                style={{ borderColor: '#D3D3D3' }}
              />
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full font-medium transition-colors"
                style={{
                  backgroundColor: '#4A7C59',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#5B8C6B';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#4A7C59';
                  }
                }}
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
          <Card className="shadow-sm" 
                style={{ 
                  backgroundColor: '#F9F8F4', 
                  borderColor: '#4A7C59' 
                }}>
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 mx-auto mb-3 stroke-2" style={{ color: '#4A7C59' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#2E2E2E' }}>Gut Health Score</h3>
              <div className="inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold border"
                   style={getRatingColor(nutritionData.gutHealthRating)}>
                {nutritionData.gutHealthRating}/10
              </div>
            </CardContent>
          </Card>

          {/* Food Items */}
          <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3" style={{ color: '#2E2E2E' }}>Identified Foods</h3>
              <div className="flex flex-wrap gap-2">
                {nutritionData.foodItems.map((item, index) => (
                  <Badge key={index} variant="secondary" 
                         className="text-sm px-3 py-1"
                         style={{ 
                           backgroundColor: '#F9F8F4', 
                           color: '#2E2E2E',
                           borderColor: '#D3D3D3'
                         }}>
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="shadow-sm" 
                style={{ 
                  backgroundColor: '#F9F8F4', 
                  borderColor: '#4A7C59' 
                }}>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center" style={{ color: '#2E2E2E' }}>
                <Brain className="w-5 h-5 mr-2 stroke-2" style={{ color: '#4A7C59' }} />
                AI Insights
              </h3>
              <div className="space-y-3">
                {nutritionData.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border"
                       style={{ borderColor: '#D3D3D3' }}>
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                         style={{ backgroundColor: '#4A7C59' }}></div>
                    <p className="text-sm" style={{ color: '#2E2E2E' }}>{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reset Button */}
          <div className="text-center pt-4">
            <Button onClick={resetAnalysis} 
                    variant="outline" 
                    className="px-8 transition-colors"
                    style={{
                      borderColor: '#D3D3D3',
                      color: '#2E2E2E',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9F8F4';
                      e.currentTarget.style.borderColor = '#4A7C59';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = '#D3D3D3';
                    }}>
              Analyze Another Food
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodAnalyzer;
