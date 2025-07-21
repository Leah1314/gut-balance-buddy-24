
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Camera, Edit } from "lucide-react";
import FoodImageAnalyzer from "./FoodImageAnalyzer";
import FoodDiary from "./FoodDiary";
import GutHealthCoach from "./GutHealthCoach";

const FoodAnalyzer = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">{t('food.title')}</h2>
      </div>
      
      <FoodDiary />
      <GutHealthCoach />
    </div>
  );
};

export default FoodAnalyzer;
