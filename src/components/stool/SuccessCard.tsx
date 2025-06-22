
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ThumbsUp, Sparkles, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface SuccessCardProps {
  onClose: () => void;
  streakDays?: number;
}

const SuccessCard = ({ onClose, streakDays = 1 }: SuccessCardProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const messages = [
    "Nice job! 💩 That's one healthy step!",
    "Logged and loaded! 🧻 You're doing great!",
    "Way to go! 🌟 Your gut thanks you!",
    "Fantastic! 💪 Keep tracking that wellness!",
    "Awesome work! 🎉 Health hero in action!"
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);
    setShowSparkles(true);
    
    // Auto-hide after 4 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for exit animation
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20">
      <Card 
        className={`
          relative max-w-sm w-full mx-auto transform transition-all duration-500 ease-out
          ${isVisible ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}
          bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-200 shadow-2xl
        `}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-white/50 transition-colors z-10"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        <CardContent className="p-6 text-center space-y-4">
          {/* Animated icon */}
          <div className="relative flex justify-center">
            <div className={`
              transform transition-all duration-700 ease-out
              ${isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}
              bg-green-500 p-4 rounded-full shadow-lg
            `}>
              <ThumbsUp className="w-8 h-8 text-white" />
            </div>
            
            {/* Sparkles animation */}
            {showSparkles && (
              <>
                <Sparkles className={`
                  absolute top-0 left-0 w-4 h-4 text-yellow-400
                  animate-pulse transition-all duration-1000
                  ${isVisible ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-2 translate-y-2'}
                `} />
                <Sparkles className={`
                  absolute top-0 right-0 w-3 h-3 text-blue-400
                  animate-pulse transition-all duration-1000 delay-200
                  ${isVisible ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-2 translate-y-2'}
                `} />
                <Sparkles className={`
                  absolute bottom-0 left-2 w-3 h-3 text-pink-400
                  animate-pulse transition-all duration-1000 delay-400
                  ${isVisible ? 'opacity-100 translate-x-0 translate-y-0' : 'opacity-0 translate-x-2 translate-y-2'}
                `} />
              </>
            )}
          </div>

          {/* Success message */}
          <div className={`
            transform transition-all duration-500 delay-300
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Entry Saved! 🎉
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              {randomMessage}
            </p>
          </div>

          {/* Progress indicator */}
          {streakDays > 1 && (
            <div className={`
              transform transition-all duration-500 delay-500
              ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
            `}>
              <Badge 
                variant="secondary" 
                className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200 px-4 py-2 text-sm font-medium"
              >
                🔥 {streakDays} days logged in a row!
              </Badge>
            </div>
          )}

          {/* Progress bar animation */}
          <div className={`
            w-full bg-gray-200 rounded-full h-2 overflow-hidden
            transform transition-all duration-500 delay-700
            ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}>
            <div 
              className={`
                h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full
                transform transition-all duration-1000 delay-800
                ${isVisible ? 'translate-x-0' : '-translate-x-full'}
              `}
              style={{ width: `${Math.min((streakDays / 7) * 100, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessCard;
