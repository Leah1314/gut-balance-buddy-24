
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Camera, Edit, TestTube } from "lucide-react";
import FoodImageAnalyzer from "./FoodImageAnalyzer";
import FoodDiary from "./FoodDiary";
import GutHealthCoach from "./GutHealthCoach";
import RAGTestingPanel from "./RAGTestingPanel";
import { useTrackingRAG } from "@/hooks/useTrackingRAG";

const FoodAnalyzer = () => {
  const [showTesting, setShowTesting] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Food Tracking</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTesting(!showTesting)}
          className="flex items-center gap-2"
        >
          <TestTube className="w-4 h-4" />
          {showTesting ? 'Hide' : 'Show'} RAG Testing
        </Button>
      </div>
      
      {showTesting && (
        <Card>
          <CardHeader>
            <CardTitle>RAG System Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <RAGTestingPanel />
          </CardContent>
        </Card>
      )}
      
      <FoodDiary />
      <GutHealthCoach />
    </div>
  );
};

export default FoodAnalyzer;
