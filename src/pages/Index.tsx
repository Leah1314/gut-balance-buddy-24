
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight,
  Utensils
} from "lucide-react";
import FoodAnalyzer from "@/components/FoodAnalyzer";
import StoolTracker from "@/components/StoolTracker";
import GutHealthCoach from "@/components/GutHealthCoach";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'food' | 'stool'>('food');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F9F8F4' }}>
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: '#D3D3D3' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img 
                src="/lovable-uploads/98b6daca-32d4-4d0a-aa72-75a1d85b5a10.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="text-xl font-semibold" style={{ color: '#2E2E2E' }}>In and Out</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Hero Section */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-1" style={{ color: '#2E2E2E' }}>
            Track Your Digestive Health
          </h2>
          <p className="text-base leading-tight" style={{ color: '#2E2E2E', opacity: 0.6 }}>
            Monitor what goes in and what comes out for optimal gut health
          </p>
        </div>

        {/* Tab Navigation */}
        <Card className="mb-6 bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setActiveTab('food')}
                variant="ghost"
                className={`flex items-center justify-center space-x-2 h-11 rounded-full border transition-all duration-200 ${
                  activeTab === 'food' 
                    ? 'text-white border-transparent hover:opacity-90' 
                    : 'border-opacity-100 hover:border-opacity-100'
                }`}
                style={{
                  backgroundColor: activeTab === 'food' ? '#4A7C59' : 'transparent',
                  borderColor: activeTab === 'food' ? '#4A7C59' : '#D3D3D3',
                  color: activeTab === 'food' ? '#FFFFFF' : '#2E2E2E'
                }}
                onMouseEnter={(e) => {
                  if (activeTab === 'food') {
                    e.currentTarget.style.backgroundColor = '#5B8C6B';
                  } else {
                    e.currentTarget.style.backgroundColor = '#F9F8F4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab === 'food') {
                    e.currentTarget.style.backgroundColor = '#4A7C59';
                  } else {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <Utensils className={`w-4 h-4 stroke-2 ${activeTab === 'food' ? 'scale-105' : ''} transition-transform`} />
                <span className="font-medium">Food In</span>
              </Button>
              <Button
                onClick={() => setActiveTab('stool')}
                variant="ghost"
                className={`flex items-center justify-center space-x-2 h-11 rounded-full border transition-all duration-200 ${
                  activeTab === 'stool' 
                    ? 'text-white border-transparent hover:opacity-90' 
                    : 'border-opacity-100 hover:border-opacity-100'
                }`}
                style={{
                  backgroundColor: activeTab === 'stool' ? '#4A7C59' : 'transparent',
                  borderColor: activeTab === 'stool' ? '#4A7C59' : '#D3D3D3',
                  color: activeTab === 'stool' ? '#FFFFFF' : '#2E2E2E'
                }}
                onMouseEnter={(e) => {
                  if (activeTab === 'stool') {
                    e.currentTarget.style.backgroundColor = '#5B8C6B';
                  } else {
                    e.currentTarget.style.backgroundColor = '#F9F8F4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab === 'stool') {
                    e.currentTarget.style.backgroundColor = '#4A7C59';
                  } else {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <ArrowRight className={`w-4 h-4 stroke-2 ${activeTab === 'stool' ? 'scale-105' : ''} transition-transform`} />
                <span className="font-medium">Stool Out</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {activeTab === 'food' ? <FoodAnalyzer /> : <StoolTracker />}
      </div>

      {/* Floating Chat Coach */}
      <GutHealthCoach />
    </div>
  );
};

export default Index;
