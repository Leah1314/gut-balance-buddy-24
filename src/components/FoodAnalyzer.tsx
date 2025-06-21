
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  UtensilsCrossed,
  Camera,
  Edit
} from "lucide-react";
import FoodImageAnalyzer from "./FoodImageAnalyzer";
import FoodDiary from "./FoodDiary";
import GutHealthCoach from "./GutHealthCoach";
import { useTrackingRAG } from "@/hooks/useTrackingRAG";

const FoodAnalyzer = () => {
  const [activeTab, setActiveTab] = useState("manual");
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger 
            value="manual" 
            className="flex items-center space-x-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
            style={{
              backgroundColor: activeTab === 'manual' ? '#4A7C59' : 'transparent',
              color: activeTab === 'manual' ? '#FFFFFF' : '#2E2E2E'
            }}
          >
            <Edit className="w-4 h-4" />
            <span>Manual Entry</span>
          </TabsTrigger>
          <TabsTrigger 
            value="camera" 
            className="flex items-center space-x-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
            style={{
              backgroundColor: activeTab === 'camera' ? '#4A7C59' : 'transparent',
              color: activeTab === 'camera' ? '#FFFFFF' : '#2E2E2E'
            }}
          >
            <Camera className="w-4 h-4" />
            <span>AI Analysis</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <FoodDiary />
        </TabsContent>

        <TabsContent value="camera">
          <FoodImageAnalyzer />
        </TabsContent>
      </Tabs>

      <GutHealthCoach />
    </div>
  );
};

export default FoodAnalyzer;
