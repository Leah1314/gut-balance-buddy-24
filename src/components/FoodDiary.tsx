import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Apple, 
  Clock, 
  Coffee, 
  UtensilsCrossed,
  Search,
  Star,
  AlertTriangle,
  Camera
} from "lucide-react";
import FoodImageAnalyzer from "./FoodImageAnalyzer";
import { useFoodLogsWithRAG } from "@/hooks/useFoodLogsWithRAG";
import { toast } from "sonner";

const FoodDiary = () => {
  const [newFood, setNewFood] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const { addFoodLog, foodLogs } = useFoodLogsWithRAG();

  const mealTypes = [
    { id: "breakfast", label: "Breakfast", icon: Coffee },
    { id: "lunch", label: "Lunch", icon: UtensilsCrossed },
    { id: "dinner", label: "Dinner", icon: UtensilsCrossed },
    { id: "snack", label: "Snack", icon: Apple },
  ];

  const commonFoods = [
    "Banana", "Apple", "Yogurt", "Oatmeal", "Salad", "Chicken", 
    "Rice", "Vegetables", "Nuts", "Bread", "Pasta", "Fish"
  ];

  const triggerFoods = [
    { food: "Dairy", frequency: 4, severity: "High" },
    { food: "Spicy Foods", frequency: 3, severity: "Medium" },
    { food: "Beans", frequency: 2, severity: "Low" },
  ];

  const handleAddFood = async () => {
    if (newFood.trim()) {
      const foodLogData = {
        food_name: newFood,
        description: `${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} entry`,
        entry_type: selectedMeal,
        notes: `Manually logged ${selectedMeal} item`
      };

      const result = await addFoodLog(foodLogData);
      
      if (result) {
        toast.success(`${newFood} added to your ${selectedMeal} log!`);
        setNewFood("");
      }
    }
  };

  const handleQuickAdd = async (food: string) => {
    const foodLogData = {
      food_name: food,
      description: `${selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} entry`,
      entry_type: selectedMeal,
      notes: `Quick-added ${selectedMeal} item`
    };

    const result = await addFoodLog(foodLogData);
    
    if (result) {
      toast.success(`${food} added to your ${selectedMeal} log!`);
    }
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  // Group today's food logs by meal type
  const todayMeals = foodLogs
    .filter(log => {
      const today = new Date().toDateString();
      const logDate = new Date(log.created_at).toDateString();
      return today === logDate;
    })
    .reduce((acc, log) => {
      const mealType = log.entry_type || 'other';
      if (!acc[mealType]) {
        acc[mealType] = [];
      }
      acc[mealType].push(log);
      return acc;
    }, {} as Record<string, typeof foodLogs>);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
          <TabsTrigger 
            value="manual" 
            className="flex items-center space-x-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Entry</span>
          </TabsTrigger>
          <TabsTrigger 
            value="camera" 
            className="flex items-center space-x-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
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
                <Label className="text-sm font-medium">Meal Type</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {mealTypes.map((meal) => (
                    <Button
                      key={meal.id}
                      variant={selectedMeal === meal.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedMeal(meal.id)}
                      className="flex items-center space-x-2"
                    >
                      <meal.icon className="w-4 h-4" />
                      <span>{meal.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">What did you eat?</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter food item..."
                    value={newFood}
                    onChange={(e) => setNewFood(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddFood();
                      }
                    }}
                  />
                  <Button onClick={handleAddFood} disabled={!newFood.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Quick Add</Label>
                <div className="flex flex-wrap gap-2">
                  {commonFoods.map((food) => (
                    <Button
                      key={food}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAdd(food)}
                      className="text-xs"
                    >
                      {food}
                    </Button>
                  ))}
                </div>
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
              <Badge 
                variant={trigger.severity === "High" ? "destructive" : 
                        trigger.severity === "Medium" ? "default" : "secondary"}
              >
                {trigger.severity}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Food Search */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-purple-600" />
            <span>Food Database</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              Search our database of foods and their gut health impact
            </p>
            <Button variant="outline">
              Browse Food Database
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodDiary;
