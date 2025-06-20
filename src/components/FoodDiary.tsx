
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Apple, 
  Clock, 
  Coffee, 
  UtensilsCrossed,
  Search,
  Star,
  AlertTriangle
} from "lucide-react";

const FoodDiary = () => {
  const [newFood, setNewFood] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("breakfast");

  const mealTypes = [
    { id: "breakfast", label: "Breakfast", icon: Coffee },
    { id: "lunch", label: "Lunch", icon: UtensilsCrossed },
    { id: "dinner", label: "Dinner", icon: UtensilsCrossed },
    { id: "snack", label: "Snack", icon: Apple },
  ];

  const todayMeals = [
    {
      meal: "Breakfast",
      time: "8:30 AM",
      foods: ["Oatmeal with berries", "Greek yogurt", "Green tea"],
      symptoms: [],
      rating: 5
    },
    {
      meal: "Lunch", 
      time: "12:30 PM",
      foods: ["Quinoa salad", "Grilled chicken", "Mixed vegetables"],
      symptoms: ["Bloating"],
      rating: 3
    },
    {
      meal: "Snack",
      time: "3:00 PM", 
      foods: ["Apple slices", "Almonds"],
      symptoms: [],
      rating: 5
    }
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

  const handleAddFood = () => {
    if (newFood.trim()) {
      console.log("Adding food:", { food: newFood, meal: selectedMeal });
      setNewFood("");
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

  return (
    <div className="space-y-6">
      {/* Add Food Entry */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-green-600" />
            <span>Log Food</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Meal Type Selection */}
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

          {/* Food Input */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">What did you eat?</Label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter food item..."
                value={newFood}
                onChange={(e) => setNewFood(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddFood} disabled={!newFood.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Add Common Foods */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Quick Add</Label>
            <div className="flex flex-wrap gap-2">
              {commonFoods.map((food) => (
                <Button
                  key={food}
                  variant="outline"
                  size="sm"
                  onClick={() => setNewFood(food)}
                  className="text-xs"
                >
                  {food}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Meals */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UtensilsCrossed className="w-5 h-5 text-blue-600" />
            <span>Today's Meals</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayMeals.map((meal, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">{meal.meal}</h3>
                    <div className="flex items-center space-x-1">
                      {getRatingStars(meal.rating)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>{meal.time}</span>
                  </div>
                </div>
                {meal.symptoms.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Symptoms
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {meal.foods.map((food, foodIndex) => (
                    <Badge key={foodIndex} variant="secondary" className="text-xs">
                      {food}
                    </Badge>
                  ))}
                </div>
                
                {meal.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className="text-xs text-gray-600">Symptoms:</span>
                    {meal.symptoms.map((symptom, symptomIndex) => (
                      <Badge key={symptomIndex} variant="destructive" className="text-xs">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
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
