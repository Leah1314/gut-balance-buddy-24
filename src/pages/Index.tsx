
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Activity,
  Utensils,
  Heart
} from "lucide-react";
import FoodAnalyzer from "@/components/FoodAnalyzer";
import StoolTracker from "@/components/StoolTracker";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'food' | 'stool'>('food');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">In and Out</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <img 
              src="/lovable-uploads/98b6daca-32d4-4d0a-aa72-75a1d85b5a10.png" 
              alt="Logo" 
              className="w-16 h-16 mx-auto mb-4 object-contain"
            />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Track Your Digestive Health
            </h2>
            <p className="text-lg text-gray-600">
              Monitor what goes in and what comes out for optimal gut health
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-2">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => setActiveTab('food')}
                variant={activeTab === 'food' ? 'default' : 'ghost'}
                className={`flex items-center justify-center space-x-2 h-12 ${
                  activeTab === 'food' 
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white' 
                    : 'text-gray-600'
                }`}
              >
                <Utensils className="w-5 h-5" />
                <span>Food In</span>
              </Button>
              <Button
                onClick={() => setActiveTab('stool')}
                variant={activeTab === 'stool' ? 'default' : 'ghost'}
                className={`flex items-center justify-center space-x-2 h-12 ${
                  activeTab === 'stool' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'text-gray-600'
                }`}
              >
                <Activity className="w-5 h-5" />
                <span>Stool Out</span>
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
