
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import FoodDiary from "./FoodDiary";
import GutHealthCoach from "./GutHealthCoach";
import GutlySays from "./gutly/GutlySays";

const FoodAnalyzer = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <GutlySays title="Snap your meal 📸">
        Take a photo of what you're eating and I'll analyze it for gut-friendly nutrients.
      </GutlySays>

      <FoodDiary />
      <GutHealthCoach />
    </div>
  );
};

export default FoodAnalyzer;
