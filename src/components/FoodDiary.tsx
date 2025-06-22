
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Apple, Coffee, UtensilsCrossed, Camera, Edit } from "lucide-react";
import FoodImageAnalyzer from "./FoodImageAnalyzer";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { toast } from "sonner";

const FoodDiary = () => {
  const [newFood, setNewFood] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const { addFoodLog } = useFoodLogs();

  const mealTypes = [{
    id: "breakfast",
    label: "Breakfast",
    icon: Coffee
  }, {
    id: "lunch",
    label: "Lunch",
    icon: UtensilsCrossed
  }, {
    id: "dinner",
    label: "Dinner",
    icon: UtensilsCrossed
  }, {
    id: "snack",
    label: "Snack",
    icon: Apple
  }];

  const commonFoods = ["Banana", "Apple", "Yogurt", "Oatmeal", "Salad", "Chicken", "Rice", "Vegetables", "Nuts", "Bread", "Pasta", "Fish"];

  const handleAddFood = async () => {
    if (!newFood.trim()) {
      toast.error("Please enter a food name");
      return;
    }

    const foodLogData = {
      food_name: newFood,
      description: `${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} entry`
    };

    console.log('Adding food log:', foodLogData);
    const result = await addFoodLog(foodLogData);
    
    if (result) {
      toast.success(`✅ Successfully added "${newFood}" to your ${selectedMeal} log!`);
      setNewFood("");
      console.log('Food log added successfully:', result);
    } else {
      toast.error("❌ Failed to add food item. Please try again.");
      console.error('Failed to add food log');
    }
  };

  const handleQuickAdd = (food: string) => {
    if (!selectedFoods.includes(food)) {
      setSelectedFoods([...selectedFoods, food]);
    }
  };

  const handleRemoveSelectedFood = (food: string) => {
    setSelectedFoods(selectedFoods.filter(f => f !== food));
  };

  const handleLogSelectedFoods = async () => {
    if (selectedFoods.length === 0) {
      toast.error("Please select at least one food item");
      return;
    }

    // Log each selected food
    for (const food of selectedFoods) {
      const foodLogData = {
        food_name: food,
        description: `${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} entry`
      };

      console.log('Quick adding food:', foodLogData);
      const result = await addFoodLog(foodLogData);
      
      if (!result) {
        toast.error(`❌ Failed to add "${food}". Please try again.`);
        console.error('Quick add failed for:', food);
        return;
      }
    }

    // Show success and reset form
    toast.success(`✅ Successfully logged ${selectedFoods.length} food item${selectedFoods.length > 1 ? 's' : ''} to your ${selectedMeal}!`);
    setSelectedFoods([]);
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
          <FoodImageAnalyzer />
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          {/* Add Food Entry */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="w-5 h-5 text-green-600" />
                <span>Log Food</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900 text-left block">Meal Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {mealTypes.map(meal => (
                    <Button 
                      key={meal.id} 
                      variant={selectedMeal === meal.id ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setSelectedMeal(meal.id)} 
                      className="text-neutral-950 bg-neutral-50 font-normal"
                    >
                      <meal.icon className="w-4 h-4" />
                      <span className="font-normal">{meal.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900 text-left block">What did you eat?</Label>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Enter food item..." 
                    value={newFood} 
                    onChange={e => setNewFood(e.target.value)} 
                    className="flex-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500" 
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        handleAddFood();
                      }
                    }} 
                  />
                  <Button 
                    onClick={handleAddFood} 
                    disabled={!newFood.trim()} 
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900 text-left block">Quick Add</Label>
                <div className="flex flex-wrap gap-2">
                  {commonFoods.map(food => (
                    <Button 
                      key={food} 
                      variant={selectedFoods.includes(food) ? "default" : "outline"}
                      size="sm" 
                      onClick={() => handleQuickAdd(food)} 
                      className={`text-xs ${selectedFoods.includes(food) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {food}
                    </Button>
                  ))}
                </div>
                
                {selectedFoods.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <Label className="text-sm font-medium text-gray-900 text-left block">Selected Foods</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedFoods.map((food, index) => (
                        <Badge 
                          key={index} 
                          className="bg-green-100 text-green-800 border-green-300 cursor-pointer hover:bg-green-200"
                          onClick={() => handleRemoveSelectedFood(food)}
                        >
                          {food} ✕
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      onClick={handleLogSelectedFoods}
                      className="w-full bg-green-600 text-white hover:bg-green-700 font-medium"
                      size="lg"
                    >
                      Log Food ({selectedFoods.length} item{selectedFoods.length > 1 ? 's' : ''})
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FoodDiary;
