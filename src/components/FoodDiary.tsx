
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Apple, Coffee, UtensilsCrossed, Camera, Edit, FileText } from "lucide-react";
import FoodImageAnalyzer from "./FoodImageAnalyzer";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { toast } from "sonner";
import SectionCard from "./gutly/SectionCard";

const FoodDiary = () => {
  const { t } = useTranslation();
  const [newFood, setNewFood] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("breakfast");
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);
  const [generalNotes, setGeneralNotes] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const { addFoodLog } = useFoodLogs();

  const mealTypes = [{
    id: "breakfast",
    label: t('food.breakfast'),
    icon: Coffee
  }, {
    id: "lunch",
    label: t('food.lunch'),
    icon: UtensilsCrossed
  }, {
    id: "dinner",
    label: t('food.dinner'),
    icon: UtensilsCrossed
  }, {
    id: "snack",
    label: t('food.snack'),
    icon: Apple
  }];

  const commonFoods = [t('food.commonFoods.rice'), t('food.commonFoods.chicken'), t('food.commonFoods.salad'), t('food.commonFoods.banana'), t('food.commonFoods.apple'), t('food.commonFoods.yogurt'), t('food.commonFoods.oatmeal'), t('food.commonFoods.vegetables'), t('food.commonFoods.nuts'), t('food.commonFoods.bread'), t('food.commonFoods.pasta'), t('food.commonFoods.fish')];

  const handleAddFood = async () => {
    if (!newFood.trim()) {
      toast.error(t('food.enterFoodItem'));
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
      toast.error("请至少选择一个食物项目");
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

  const handleSaveGeneralNote = async () => {
    if (!generalNotes.trim()) {
      toast.error("请输入一些备注或症状");
      return;
    }

    setIsSavingNote(true);

    const noteData = {
      food_name: "General Food Note",
      description: generalNotes.trim()
    };

    console.log('Saving general food note:', noteData);
    const result = await addFoodLog(noteData);
    
    if (result) {
      toast.success("✅ Food note saved successfully!");
      setGeneralNotes("");
      console.log('General note saved:', result);
    } else {
      toast.error("❌ Failed to save note. Please try again.");
      console.error('Failed to save general note');
    }

    setIsSavingNote(false);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="camera" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/70 rounded-2xl p-1">
          <TabsTrigger 
            value="camera" 
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary h-10 text-[13px] font-medium"
          >
            <Camera className="w-4 h-4" />
            <span>{t('food.aiAnalysis')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="manual" 
            className="flex items-center gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:text-primary h-10 text-[13px] font-medium"
          >
            <Edit className="w-4 h-4" />
            <span>{t('food.manualEntry')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="camera" className="mt-4">
          <FoodImageAnalyzer />
        </TabsContent>

        <TabsContent value="manual" className="space-y-4 mt-4">
          {/* General Food Notes/Symptoms */}
          <SectionCard icon={FileText} title={t('food.generalNotes')} description={t('food.generalNotesDescription')}>
            <div className="space-y-2">
              <Textarea
                placeholder={t('food.generalNotesPlaceholder')}
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
                className="min-h-[90px] text-[15px] rounded-2xl resize-none border-border/60 bg-background/60"
                maxLength={500}
              />
              <div className="flex justify-between items-center gap-3">
                <span className="text-caption">
                  {generalNotes.length}/500 {t('common.characters')}
                </span>
                <Button
                  onClick={handleSaveGeneralNote}
                  disabled={!generalNotes.trim() || isSavingNote}
                  className="px-6"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isSavingNote ? t('buttons.saving') : t('food.saveNote')}
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* Add Food Entry */}
          <SectionCard icon={Plus} title={t('food.logFood')}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-caption font-medium text-foreground/80 block">{t('food.mealType')}</Label>
                <div className="grid grid-cols-4 gap-2">
                  {mealTypes.map(meal => (
                    <Button 
                      key={meal.id} 
                      variant={selectedMeal === meal.id ? "default" : "soft"}
                      onClick={() => setSelectedMeal(meal.id)} 
                      className="h-10 gap-1 px-1 justify-center font-medium"
                    >
                      <meal.icon className="w-3.5 h-3.5" />
                      <span className="text-[12px]">{meal.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-caption font-medium text-foreground/80 block">{t('food.whatDidYouEat')}</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder={t('food.enterFoodItem')} 
                    value={newFood} 
                    onChange={e => setNewFood(e.target.value)} 
                    className="flex-1 h-11 text-[15px] rounded-2xl border-border/60 bg-background/60"
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        handleAddFood();
                      }
                    }} 
                  />
                  <Button 
                    onClick={handleAddFood} 
                    disabled={!newFood.trim()} 
                    className="h-11 w-11 p-0 shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-caption font-medium text-foreground/80 block">{t('food.quickAdd')}</Label>
                <div className="grid grid-cols-4 gap-1.5">
                  {commonFoods.map(food => (
                    <Button
                      key={food}
                      variant={selectedFoods.includes(food) ? "default" : "soft"}
                      onClick={() => handleQuickAdd(food)}
                      className="text-[11px] h-8 px-1"
                    >
                      {food}
                    </Button>
                  ))}
                </div>
                
                {selectedFoods.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-caption font-medium text-foreground/80 block">{t('food.selectedFoods')}</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedFoods.map((food, index) => (
                        <Badge
                          key={index}
                          className="bg-primary-soft text-primary border-transparent cursor-pointer hover:bg-primary-soft/80 px-3 py-1.5 text-sm rounded-full"
                          onClick={() => handleRemoveSelectedFood(food)}
                        >
                          {food} ✕
                        </Badge>
                      ))}
                    </div>
                    <Button
                      onClick={handleLogSelectedFoods}
                      className="w-full"
                      size="lg"
                    >
                      {t('food.logSelectedFoods').replace('{count}', selectedFoods.length.toString())}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FoodDiary;
