
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Activity, MessageCircle, Utensils, Scroll, User, Calendar, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
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

  const trackTabs = [
    { id: 'food' as const, label: t('track.tabs.foodIn'), icon: Utensils },
    { id: 'stool' as const, label: t('track.tabs.stoolOut'), icon: Scroll },
    { id: 'history' as const, label: t('track.tabs.history'), icon: Calendar },
  ];

  const mainTabs = [
    { id: 'track' as const, label: t('navigation.track'), icon: Activity },
    { id: 'analytics' as const, label: t('navigation.analytics'), icon: BarChart3 },
    { id: 'chat' as const, label: t('navigation.chat'), icon: MessageCircle },
    { id: 'health' as const, label: t('navigation.health'), icon: User },
  ];

  return (
    <div className="min-h-screen pb-24 bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-xl z-40 px-5 py-3 safe-area-top border-b border-border/40">
        <div className="flex items-center justify-between max-w-screen-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-primary-soft flex items-center justify-center">
              <img src="/lovable-uploads/98b6daca-32d4-4d0a-aa72-75a1d85b5a10.png" alt="Gutly" className="w-6 h-6 object-contain" />
            </div>
            <h1 className="text-[22px] font-semibold text-foreground tracking-tight">{t('app.title')}</h1>
          </div>
          <div className="flex items-center space-x-2">
            <LanguageSelector />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-screen-md px-5 mx-auto pt-[72px] pb-4 animate-fade-in">
        {activeMainTab === 'track' ? (
          <>
            {/* Hero */}
            <div className="mb-4 mt-3">
              <h2 className="text-[24px] font-semibold leading-tight text-foreground tracking-tight">{t('track.title')}</h2>
              <p className="text-[14px] text-muted-foreground mt-0.5">{t('track.subtitle')}</p>
            </div>

            {/* Track segmented control */}
            <div className="mb-4 p-1 rounded-2xl bg-muted/70 grid grid-cols-3 gap-1">
              {trackTabs.map(tab => {
                const Icon = tab.icon;
                const active = activeTrackTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTrackTab(tab.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-0.5 h-12 rounded-xl transition-all duration-200 active:scale-[0.97]",
                      active
                        ? "bg-card text-primary shadow-soft"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    <span className="text-[12px] font-medium">{tab.label}</span>
                  </button>
                );
              })}
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
          <ChatPage />
        ) : activeMainTab === 'health' ? (
          <HealthProfile />
        ) : (
          <Analytics onSwitchToChat={handleSwitchToChat} />
        )}
      </div>

      {/* Bottom Tab Navigation — Apple HIG */}
      <div className="fixed bottom-0 left-0 right-0 z-50 w-full safe-area-bottom bg-card/85 backdrop-blur-xl border-t border-border/40">
        <div className="w-full max-w-screen-md px-3 mx-auto">
          <div className="grid grid-cols-4 gap-1 py-1.5">
            {mainTabs.map(tab => {
              const Icon = tab.icon;
              const active = activeMainTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveMainTab(tab.id)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 py-1 rounded-2xl transition-all duration-200 active:scale-95",
                    active ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-10 h-7 rounded-full transition-colors",
                    active && "bg-primary-soft"
                  )}>
                    <Icon className="w-5 h-5" strokeWidth={2.2} />
                  </div>
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
