
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

  const commonFoods = ["Rice", "Chicken", "Salad", "Banana", "Apple", "Yogurt", "Oatmeal", "Vegetables", "Nuts", "Bread", "Pasta", "Fish"];

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

    toast.success(`✅ Successfully logged ${selectedFoods.length} food item${selectedFoods.length > 1 ? 's' : ''} to your ${selectedMeal}!`);
    setSelectedFoods([]);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="camera" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm h-12">
          <TabsTrigger 
            value="camera" 
            className="flex items-center space-x-2 data-[state=active]:bg-green-600 data-[state=active]:text-white h-10 text-sm"
          >
            <Camera className="w-4 h-4" />
            <span>AI Analysis</span>
          </TabsTrigger>
          <TabsTrigger 
            value="manual" 
            className="flex items-center space-x-2 data-[state=active]:bg-green-600 data-[state=active]:text-white h-10 text-sm"
          >
            <Edit className="w-4 h-4" />
            <span>Manual Entry</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="camera">
          <FoodImageAnalyzer />
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          {/* Add Food Entry - More mobile friendly */}
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Plus className="w-5 h-5 text-green-600" />
                <span>Log Food</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900 text-left block">Meal Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  {mealTypes.map(meal => (
                    <Button 
                      key={meal.id} 
                      variant={selectedMeal === meal.id ? "default" : "outline"} 
                      size="lg" 
                      onClick={() => setSelectedMeal(meal.id)} 
                      className="text-neutral-950 bg-neutral-50 font-normal h-12 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <meal.icon className="w-4 h-4" />
                      <span className="font-normal text-sm">{meal.label}</span>
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
                    className="flex-1 bg-white border-gray-300 text-gray-900 placeholder-gray-500 h-12 text-sm rounded-lg" 
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        handleAddFood();
                      }
                    }} 
                  />
                  <Button 
                    onClick={handleAddFood} 
                    disabled={!newFood.trim()} 
                    className="bg-green-600 text-white hover:bg-green-700 h-12 w-12 rounded-lg"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900 text-left block">Quick Add</Label>
                <div className="grid grid-cols-3 gap-2">
                  {commonFoods.map(food => (
                    <Button 
                      key={food} 
                      variant={selectedFoods.includes(food) ? "default" : "outline"}
                      size="sm" 
                      onClick={() => handleQuickAdd(food)} 
                      className={`text-xs h-10 rounded-lg ${selectedFoods.includes(food) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {food}
                    </Button>
                  ))}
                </div>
                
                {selectedFoods.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <Label className="text-sm font-medium text-gray-900 text-left block">Selected Foods</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedFoods.map((food, index) => (
                        <Badge 
                          key={index} 
                          className="bg-green-100 text-green-800 border-green-300 cursor-pointer hover:bg-green-200 px-3 py-1 text-sm"
                          onClick={() => handleRemoveSelectedFood(food)}
                        >
                          {food} ✕
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      onClick={handleLogSelectedFoods}
                      className="w-full bg-green-600 text-white hover:bg-green-700 font-medium h-12 rounded-lg"
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
