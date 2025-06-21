
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Camera, Edit } from "lucide-react";
import FoodDiary from "./FoodDiary";
import GutHealthCoach from "./GutHealthCoach";
import { useTrackingRAG } from "@/hooks/useTrackingRAG";

const FoodAnalyzer = () => {
  return (
    <div className="space-y-6">
      <FoodDiary />
      <GutHealthCoach />
    </div>
  );
};

export default FoodAnalyzer;
