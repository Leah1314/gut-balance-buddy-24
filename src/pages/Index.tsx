
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity,
  MessageCircle,
  Utensils,
  ArrowRight,
  User
} from "lucide-react";
import FoodAnalyzer from "@/components/FoodAnalyzer";
import StoolTracker from "@/components/StoolTracker";
import ChatPage from "@/components/ChatPage";
import HealthProfile from "@/components/HealthProfile";

const Index = () => {
  const [activeMainTab, setActiveMainTab] = useState<'track' | 'chat' | 'health'>('track');
  const [activeTrackTab, setActiveTrackTab] = useState<'food' | 'stool'>('food');

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: '#F9F8F4' }}>
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
        {activeMainTab === 'track' ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-1" style={{ color: '#2E2E2E' }}>
                Track Your Digestive Health
              </h2>
              <p className="text-base leading-tight" style={{ color: '#2E2E2E', opacity: 0.6 }}>
                Monitor what goes in and what comes out for optimal gut health
              </p>
            </div>

            {/* Track Sub-Tab Navigation */}
            <Card className="mb-6 bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
              <CardContent className="p-3">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setActiveTrackTab('food')}
                    variant="ghost"
                    className={`flex items-center justify-center space-x-2 h-11 rounded-full border transition-all duration-200 ${
                      activeTrackTab === 'food' 
                        ? 'text-white border-transparent hover:opacity-90' 
                        : 'border-opacity-100 hover:border-opacity-100'
                    }`}
                    style={{
                      backgroundColor: activeTrackTab === 'food' ? '#4A7C59' : 'transparent',
                      borderColor: activeTrackTab === 'food' ? '#4A7C59' : '#D3D3D3',
                      color: activeTrackTab === 'food' ? '#FFFFFF' : '#2E2E2E'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTrackTab === 'food') {
                        e.currentTarget.style.backgroundColor = '#5B8C6B';
                      } else {
                        e.currentTarget.style.backgroundColor = '#F9F8F4';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTrackTab === 'food') {
                        e.currentTarget.style.backgroundColor = '#4A7C59';
                      } else {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Utensils className={`w-4 h-4 stroke-2 ${activeTrackTab === 'food' ? 'scale-105' : ''} transition-transform`} />
                    <span className="font-medium">Food In</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTrackTab('stool')}
                    variant="ghost"
                    className={`flex items-center justify-center space-x-2 h-11 rounded-full border transition-all duration-200 ${
                      activeTrackTab === 'stool' 
                        ? 'text-white border-transparent hover:opacity-90' 
                        : 'border-opacity-100 hover:border-opacity-100'
                    }`}
                    style={{
                      backgroundColor: activeTrackTab === 'stool' ? '#4A7C59' : 'transparent',
                      borderColor: activeTrackTab === 'stool' ? '#4A7C59' : '#D3D3D3',
                      color: activeTrackTab === 'stool' ? '#FFFFFF' : '#2E2E2E'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTrackTab === 'stool') {
                        e.currentTarget.style.backgroundColor = '#5B8C6B';
                      } else {
                        e.currentTarget.style.backgroundColor = '#F9F8F4';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTrackTab === 'stool') {
                        e.currentTarget.style.backgroundColor = '#4A7C59';
                      } else {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <ArrowRight className={`w-4 h-4 stroke-2 ${activeTrackTab === 'stool' ? 'scale-105' : ''} transition-transform`} />
                    <span className="font-medium">Stool Out</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Track Content */}
            {activeTrackTab === 'food' ? <FoodAnalyzer /> : <StoolTracker />}
          </>
        ) : activeMainTab === 'chat' ? (
          <ChatPage />
        ) : (
          <HealthProfile />
        )}
      </div>

      {/* Bottom Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50" style={{ borderColor: '#D3D3D3' }}>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-0">
            <button
              onClick={() => setActiveMainTab('track')}
              className={`flex flex-col items-center justify-center py-3 transition-all duration-200 ${
                activeMainTab === 'track' ? 'opacity-100' : 'opacity-60'
              }`}
              style={{
                color: activeMainTab === 'track' ? '#4A7C59' : '#2E2E2E'
              }}
            >
              <Activity className={`w-6 h-6 mb-1 stroke-2 ${activeMainTab === 'track' ? 'scale-105' : ''} transition-transform`} />
              <span className="text-xs font-medium">Track</span>
            </button>
            <button
              onClick={() => setActiveMainTab('chat')}
              className={`flex flex-col items-center justify-center py-3 transition-all duration-200 ${
                activeMainTab === 'chat' ? 'opacity-100' : 'opacity-60'
              }`}
              style={{
                color: activeMainTab === 'chat' ? '#4A7C59' : '#2E2E2E'
              }}
            >
              <MessageCircle className={`w-6 h-6 mb-1 stroke-2 ${activeMainTab === 'chat' ? 'scale-105' : ''} transition-transform`} />
              <span className="text-xs font-medium">Chat</span>
            </button>
            <button
              onClick={() => setActiveMainTab('health')}
              className={`flex flex-col items-center justify-center py-3 transition-all duration-200 ${
                activeMainTab === 'health' ? 'opacity-100' : 'opacity-60'
              }`}
              style={{
                color: activeMainTab === 'health' ? '#4A7C59' : '#2E2E2E'
              }}
            >
              <User className={`w-6 h-6 mb-1 stroke-2 ${activeMainTab === 'health' ? 'scale-105' : ''} transition-transform`} />
              <span className="text-xs font-medium">Health</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
