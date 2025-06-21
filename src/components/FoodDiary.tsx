
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Apple, Clock, Coffee, UtensilsCrossed, Search, Star, AlertTriangle, Camera, CheckCircle, ArrowLeft } from "lucide-react";
import FoodImageAnalyzer from "./FoodImageAnalyzer";
import { useFoodLogsWithRAG } from "@/hooks/useFoodLogsWithRAG";
import { toast } from "sonner";

const FoodDiary = () => {
  const [newFood, setNewFood] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [showLoggedState, setShowLoggedState] = useState(false);
  const [lastLoggedSummary, setLastLoggedSummary] = useState<{foods: string[], mealType: string} | null>(null);
  const {
    addFoodLog,
    foodLogs
  } = useFoodLogsWithRAG();

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

  const triggerFoods = [{
    food: "Dairy",
    frequency: 4,
    severity: "High"
  }, {
    food: "Spicy Foods",
    frequency: 3,
    severity: "Medium"
  }, {
    food: "Beans",
    frequency: 2,
    severity: "Low"
  }];

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

    // Show success and transition to logged state
    toast.success(`✅ Successfully logged ${selectedFoods.length} food item${selectedFoods.length > 1 ? 's' : ''} to your ${selectedMeal}!`);
    
    setLastLoggedSummary({
      foods: [...selectedFoods],
      mealType: selectedMeal
    });
    
    setSelectedFoods([]);
    setShowLoggedState(true);
    
    // Auto-hide logged state after 3 seconds
    setTimeout(() => {
      setShowLoggedState(false);
    }, 3000);
  };

  const getRatingStars = (rating: number) => {
    return Array.from({
      length: 5
    }, (_, i) => <Star key={i} className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />);
  };

  // Group today's food logs by meal type based on description
  const todayMeals = (foodLogs || []).filter(log => {
    const today = new Date().toDateString();
    const logDate = new Date(log.created_at).toDateString();
    return today === logDate;
  }).reduce((acc, log) => {
    // Extract meal type from description if it contains meal info
    const mealType = log.description?.toLowerCase().includes('breakfast') ? 'breakfast' :
                    log.description?.toLowerCase().includes('lunch') ? 'lunch' :
                    log.description?.toLowerCase().includes('dinner') ? 'dinner' :
                    log.description?.toLowerCase().includes('snack') ? 'snack' : 'other';
    
    if (!acc[mealType]) {
      acc[mealType] = [];
    }
    acc[mealType].push(log);
    return acc;
  }, {} as Record<string, any[]>);

  // Get unique foods from user's history for personal food database
  const userFoodDatabase = (foodLogs || []).map(log => log.food_name).filter((food, index, array) => array.indexOf(food) === index).sort();

  if (showLoggedState && lastLoggedSummary) {
    return (
      <div className="space-y-6">
        <Card className="bg-green-50 border-green-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-green-800 mb-2">Food Logged Successfully!</h2>
            <p className="text-green-700 mb-4">
              You've logged {lastLoggedSummary.foods.length} item{lastLoggedSummary.foods.length > 1 ? 's' : ''} for {lastLoggedSummary.mealType}
            </p>
            <div className="space-y-2 mb-6">
              <p className="font-medium text-green-800">Logged Items:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {lastLoggedSummary.foods.map((food, index) => (
                  <Badge key={index} className="bg-green-100 text-green-800 border-green-300">
                    {food}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-green-600 capitalize">
                Meal Type: {lastLoggedSummary.mealType}
              </p>
            </div>
            <Button 
              onClick={() => setShowLoggedState(false)}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Food Diary
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="manual" className="flex items-center space-x-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Plus className="w-4 h-4" />
            <span>Manual Entry</span>
          </TabsTrigger>
          <TabsTrigger value="camera" className="flex items-center space-x-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            <Camera className="w-4 h-4" />
            <span>AI Analysis</span>
          </TabsTrigger>
        </TabsList>

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
                <Label className="text-sm font-medium text-gray-900">Meal Type</Label>
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
                <Label className="text-sm font-medium text-gray-900">What did you eat?</Label>
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
                <Label className="text-sm font-medium text-gray-900">Quick Add</Label>
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
                    <Label className="text-sm font-medium text-gray-900">Selected Foods</Label>
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

        <TabsContent value="camera">
          <FoodImageAnalyzer />
        </TabsContent>
      </Tabs>

      {/* Today's Meals */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UtensilsCrossed className="w-5 h-5 text-blue-600" />
            <span>Today's Meals</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.keys(todayMeals).length === 0 ? (
            <p className="text-gray-500 text-center py-4">No meals logged today. Start by adding some food!</p>
          ) : (
            Object.entries(todayMeals).map(([mealType, logs]) => (
              <div key={mealType} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900 capitalize">{mealType}</h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{logs.length} item{logs.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {logs.map((log, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {log.food_name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Potential Trigger Foods */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Potential Trigger Foods</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {triggerFoods.map((trigger, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{trigger.food}</p>
                <p className="text-sm text-gray-600">
                  Associated with symptoms {trigger.frequency} times this week
                </p>
              </div>
              <Badge variant={trigger.severity === "High" ? "destructive" : trigger.severity === "Medium" ? "default" : "secondary"}>
                {trigger.severity}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Personal Food Database */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-purple-600" />
            <span>Your Food History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userFoodDatabase.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                No foods logged yet. Start tracking your meals to build your personal food database!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Foods you've logged previously ({userFoodDatabase.length} items):
              </p>
              <div className="flex flex-wrap gap-2">
                {userFoodDatabase.slice(0, 20).map((food, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleQuickAdd(food)} 
                    className="text-xs bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                  >
                    {food}
                  </Button>
                ))}
              </div>
              {userFoodDatabase.length > 20 && (
                <p className="text-xs text-gray-500">
                  Showing first 20 items. You have {userFoodDatabase.length - 20} more foods in your history.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodDiary;
