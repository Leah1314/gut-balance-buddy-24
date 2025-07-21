
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, MessageCircle, Utensils, Scroll, User, Calendar, BarChart3 } from "lucide-react";
import FoodAnalyzer from "@/components/FoodAnalyzer";
import StoolTracker from "@/components/StoolTracker";
import ChatPage from "@/components/ChatPage";
import HealthProfile from "@/components/HealthProfile";
import LogHistory from "@/components/LogHistory";
import Analytics from "@/components/Analytics";
import UserMenu from "@/components/UserMenu";
import LanguageSelector from "@/components/LanguageSelector";

const Index = () => {
  const { t } = useTranslation();
  const [activeMainTab, setActiveMainTab] = useState<'track' | 'chat' | 'health' | 'analytics'>('track');
  const [activeTrackTab, setActiveTrackTab] = useState<'food' | 'stool' | 'history'>('food');

  const handleSwitchToChat = () => {
    setActiveMainTab('chat');
  };

  return (
    <div className="min-h-screen pb-24" style={{
      backgroundColor: '#F9F8F4'
    }}>
      {/* Header - Fixed with padding for mobile */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-40 px-4 py-3 safe-area-top" style={{
        borderColor: '#D3D3D3'
      }}>
        <div className="flex items-center justify-between max-w-screen-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/lovable-uploads/98b6daca-32d4-4d0a-aa72-75a1d85b5a10.png" alt="Logo" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="text-xl font-semibold" style={{
              color: '#2E2E2E'
            }}>{t('app.title')}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <LanguageSelector />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content - Added top padding for fixed header */}
      <div className="w-full max-w-screen-md px-4 mx-auto pt-20 pb-6">
        {activeMainTab === 'track' ? (
          <>
            {/* Hero Section - More compact for mobile */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-2" style={{
                color: '#2E2E2E'
              }}>
                {t('track.title')}
              </h2>
              <p className="text-sm leading-relaxed px-4" style={{
                color: '#2E2E2E',
                opacity: 0.7
              }}>
                {t('track.subtitle')}
              </p>
            </div>

            {/* Track Sub-Tab Navigation - Larger touch targets */}
            <div className="mb-6">
              <Card className="bg-white shadow-sm" style={{
                borderColor: '#D3D3D3'
              }}>
                <CardContent className="p-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      onClick={() => setActiveTrackTab('food')} 
                      variant="ghost" 
                      className={`flex flex-col items-center justify-center space-y-1 h-16 rounded-xl border transition-all duration-200 ${activeTrackTab === 'food' ? 'text-white border-transparent hover:opacity-90' : 'border-opacity-100 hover:border-opacity-100'}`} 
                      style={{
                        backgroundColor: activeTrackTab === 'food' ? '#4A7C59' : 'transparent',
                        borderColor: activeTrackTab === 'food' ? '#4A7C59' : '#D3D3D3',
                        color: activeTrackTab === 'food' ? '#FFFFFF' : '#2E2E2E'
                      }} 
                      onMouseEnter={e => {
                        if (activeTrackTab === 'food') {
                          e.currentTarget.style.backgroundColor = '#5B8C6B';
                        } else {
                          e.currentTarget.style.backgroundColor = '#F9F8F4';
                        }
                      }} 
                      onMouseLeave={e => {
                        if (activeTrackTab === 'food') {
                          e.currentTarget.style.backgroundColor = '#4A7C59';
                        } else {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <Utensils className={`w-5 h-5 stroke-2 ${activeTrackTab === 'food' ? 'scale-105' : ''} transition-transform`} />
                      <span className="font-medium text-xs">{t('track.tabs.foodIn')}</span>
                    </Button>
                    <Button 
                      onClick={() => setActiveTrackTab('stool')} 
                      variant="ghost" 
                      className={`flex flex-col items-center justify-center space-y-1 h-16 rounded-xl border transition-all duration-200 ${activeTrackTab === 'stool' ? 'text-white border-transparent hover:opacity-90' : 'border-opacity-100 hover:border-opacity-100'}`} 
                      style={{
                        backgroundColor: activeTrackTab === 'stool' ? '#4A7C59' : 'transparent',
                        borderColor: activeTrackTab === 'stool' ? '#4A7C59' : '#D3D3D3',
                        color: activeTrackTab === 'stool' ? '#FFFFFF' : '#2E2E2E'
                      }} 
                      onMouseEnter={e => {
                        if (activeTrackTab === 'stool') {
                          e.currentTarget.style.backgroundColor = '#5B8C6B';
                        } else {
                          e.currentTarget.style.backgroundColor = '#F9F8F4';
                        }
                      }} 
                      onMouseLeave={e => {
                        if (activeTrackTab === 'stool') {
                          e.currentTarget.style.backgroundColor = '#4A7C59';
                        } else {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <Scroll className={`w-5 h-5 stroke-2 ${activeTrackTab === 'stool' ? 'scale-105' : ''} transition-transform`} />
                      <span className="font-medium text-xs">{t('track.tabs.stoolOut')}</span>
                    </Button>
                    <Button 
                      onClick={() => setActiveTrackTab('history')} 
                      variant="ghost" 
                      className={`flex flex-col items-center justify-center space-y-1 h-16 rounded-xl border transition-all duration-200 ${activeTrackTab === 'history' ? 'text-white border-transparent hover:opacity-90' : 'border-opacity-100 hover:border-opacity-100'}`} 
                      style={{
                        backgroundColor: activeTrackTab === 'history' ? '#4A7C59' : 'transparent',
                        borderColor: activeTrackTab === 'history' ? '#4A7C59' : '#D3D3D3',
                        color: activeTrackTab === 'history' ? '#FFFFFF' : '#2E2E2E'
                      }} 
                      onMouseEnter={e => {
                        if (activeTrackTab === 'history') {
                          e.currentTarget.style.backgroundColor = '#5B8C6B';
                        } else {
                          e.currentTarget.style.backgroundColor = '#F9F8F4';
                        }
                      }} 
                      onMouseLeave={e => {
                        if (activeTrackTab === 'history') {
                          e.currentTarget.style.backgroundColor = '#4A7C59';
                        } else {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <Calendar className={`w-5 h-5 stroke-2 ${activeTrackTab === 'history' ? 'scale-105' : ''} transition-transform`} />
                      <span className="font-medium text-xs">{t('track.tabs.history')}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Track Content */}
            <div>
              {activeTrackTab === 'food' ? (
                <FoodAnalyzer />
              ) : activeTrackTab === 'stool' ? (
                <StoolTracker />
              ) : (
                <LogHistory />
              )}
            </div>
          </>
        ) : activeMainTab === 'chat' ? (
          <div>
            <ChatPage />
          </div>
        ) : activeMainTab === 'health' ? (
          <div>
            <HealthProfile />
          </div>
        ) : (
          <div>
            <Analytics onSwitchToChat={handleSwitchToChat} />
          </div>
        )}
      </div>

      {/* Bottom Tab Navigation - Updated to 4 columns */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 w-full safe-area-bottom" style={{
        borderColor: '#D3D3D3'
      }}>
        <div className="w-full max-w-screen-md px-4 mx-auto">
          <div className="grid grid-cols-4 gap-0">
            <button 
              onClick={() => setActiveMainTab('track')} 
              className={`flex flex-col items-center justify-center py-4 transition-all duration-200 ${activeMainTab === 'track' ? 'opacity-100' : 'opacity-60'}`} 
              style={{
                color: activeMainTab === 'track' ? '#4A7C59' : '#2E2E2E'
              }}
            >
              <Activity className={`w-6 h-6 mb-1 stroke-2 ${activeMainTab === 'track' ? 'scale-105' : ''} transition-transform`} />
              <span className="text-xs font-medium">{t('navigation.track')}</span>
            </button>
            <button 
              onClick={() => setActiveMainTab('analytics')} 
              className={`flex flex-col items-center justify-center py-4 transition-all duration-200 ${activeMainTab === 'analytics' ? 'opacity-100' : 'opacity-60'}`} 
              style={{
                color: activeMainTab === 'analytics' ? '#4A7C59' : '#2E2E2E'
              }}
            >
              <BarChart3 className={`w-6 h-6 mb-1 stroke-2 ${activeMainTab === 'analytics' ? 'scale-105' : ''} transition-transform`} />
              <span className="text-xs font-medium">{t('navigation.analytics')}</span>
            </button>
            <button 
              onClick={() => setActiveMainTab('chat')} 
              className={`flex flex-col items-center justify-center py-4 transition-all duration-200 ${activeMainTab === 'chat' ? 'opacity-100' : 'opacity-60'}`} 
              style={{
                color: activeMainTab === 'chat' ? '#4A7C59' : '#2E2E2E'
              }}
            >
              <MessageCircle className={`w-6 h-6 mb-1 stroke-2 ${activeMainTab === 'chat' ? 'scale-105' : ''} transition-transform`} />
              <span className="text-xs font-medium">{t('navigation.chat')}</span>
            </button>
            <button 
              onClick={() => setActiveMainTab('health')} 
              className={`flex flex-col items-center justify-center py-4 transition-all duration-200 ${activeMainTab === 'health' ? 'opacity-100' : 'opacity-60'}`} 
              style={{
                color: activeMainTab === 'health' ? '#4A7C59' : '#2E2E2E'
              }}
            >
              <User className={`w-6 h-6 mb-1 stroke-2 ${activeMainTab === 'health' ? 'scale-105' : ''} transition-transform`} />
              <span className="text-xs font-medium">{t('navigation.health')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
