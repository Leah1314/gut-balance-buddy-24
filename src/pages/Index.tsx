
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity,
  Utensils
} from "lucide-react";
import FoodAnalyzer from "@/components/FoodAnalyzer";
import StoolTracker from "@/components/StoolTracker";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'food' | 'stool'>('food');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/lovable-uploads/98b6daca-32d4-4d0a-aa72-75a1d85b5a10.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">In and Out</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-1">
            Track Your Digestive Health
          </h2>
          <p className="text-base text-gray-600 leading-tight">
            Monitor what goes in and what comes out for optimal gut health
          </p>
        </div>

        {/* Tab Navigation */}
        <Card className="mb-6 bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setActiveTab('food')}
                variant="ghost"
                className={`flex items-center justify-center space-x-2 h-11 rounded-full border transition-all duration-200 ${
                  activeTab === 'food' 
                    ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' 
                    : 'text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Utensils className={`w-4 h-4 stroke-2 ${activeTab === 'food' ? 'scale-105' : ''} transition-transform`} />
                <span className="font-medium">Food In</span>
              </Button>
              <Button
                onClick={() => setActiveTab('stool')}
                variant="ghost"
                className={`flex items-center justify-center space-x-2 h-11 rounded-full border transition-all duration-200 ${
                  activeTab === 'stool' 
                    ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' 
                    : 'text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Activity className={`w-4 h-4 stroke-2 ${activeTab === 'stool' ? 'scale-105' : ''} transition-transform`} />
                <span className="font-medium">Stool Out</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {activeTab === 'food' ? <FoodAnalyzer /> : <StoolTracker />}
      </div>
    </div>
  );
};

export default Index;
