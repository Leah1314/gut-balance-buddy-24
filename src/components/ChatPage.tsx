
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2, Database } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useStoolLogs } from "@/hooks/useStoolLogs";
import QuickQuestions from "./QuickQuestions";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUserData, setHasUserData] = useState({
    health_info: false,
    track_history: false
  });
  
  const { foodLogs } = useFoodLogs();
  const { getStoolLogs } = useStoolLogs();

  useEffect(() => {
    const checkForUserData = async () => {
      try {
        console.log('Checking for user data...');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found');
          return;
        }

        console.log('User found:', user.id);

        // Check for health profile
        const { data: healthProfile, error: healthError } = await supabase
          .from('user_health_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (healthError) {
          console.log('Health profile error:', healthError);
        } else {
          console.log('Health profile found:', healthProfile);
        }

        // Check for tracking data
        const stoolLogs = await getStoolLogs();
        console.log('Food logs count:', foodLogs?.length || 0);
        console.log('Stool logs count:', stoolLogs?.length || 0);
        
        const userDataStatus = {
          health_info: !!healthProfile,
          track_history: !!(foodLogs?.length > 0 || stoolLogs?.length > 0)
        };
        
        console.log('User data status:', userDataStatus);
        setHasUserData(userDataStatus);

        const hasAnyData = userDataStatus.health_info || userDataStatus.track_history;
        const greetingMessage = hasAnyData 
          ? "Hi! I'm your gut health coach. I can see you have some health data stored. I can help you understand your digestive patterns, suggest meal improvements, and answer questions about your symptoms. What would you like to know?"
          : "Hi! I'm your gut health coach. I can help you understand your digestive patterns, suggest meal improvements, and answer questions about symptoms. You can add more information in the 'Track' or 'Health' tabs to get more personalized advice. What would you like to know?";
        
        setMessages([{
          id: '1',
          content: greetingMessage,
          role: 'assistant',
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('Failed to check user data:', error);
        setMessages([{
          id: '1',
          content: "Hi! I'm your gut health coach. I can help you understand your digestive patterns, suggest meal improvements, and answer questions about symptoms. What would you like to know?",
          role: 'assistant',
          timestamp: new Date()
        }]);
      }
    };
    
    checkForUserData();
  }, [foodLogs, getStoolLogs]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    console.log('=== SENDING MESSAGE ===');
    console.log('Message:', textToSend);

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) {
      setInputMessage("");
    }
    setIsLoading(true);

    try {
      console.log('Calling gut-health-chat function...');
      const { data, error } = await supabase.functions.invoke('gut-health-chat', {
        body: {
          message: textToSend,
          conversationHistory: messages,
          includeUserData: true // Enable user data analysis
        }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (!data || !data.response) {
        console.error('No response data:', data);
        throw new Error('No response received from AI service');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      console.log('Adding assistant message:', assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(`Sorry, I'm having trouble responding: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <MessageCircle className="w-8 h-8" style={{ color: '#4A7C59' }} />
          <h2 className="text-2xl font-semibold" style={{ color: '#2E2E2E' }}>
            Gut Health Coach
          </h2>
          {(hasUserData.health_info || hasUserData.track_history) && (
            <div title="Your data is available">
              <Database className="w-5 h-5" style={{ color: '#4A7C59' }} />
            </div>
          )}
        </div>
        <p className="text-base leading-tight" style={{ color: '#2E2E2E', opacity: 0.6 }}>
          Get personalized advice for your digestive wellness
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 max-h-[calc(100vh-300px)]">
        {messages.map(message => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              style={{
                backgroundColor: message.role === 'user' ? '#4A7C59' : '#F9F8F4',
                borderColor: message.role === 'assistant' ? '#D3D3D3' : 'transparent',
                color: message.role === 'user' ? '#FFFFFF' : '#2E2E2E'
              }} 
              className="py-[16px] px-[16px] rounded-md max-w-[80%]"
            >
              <p className="text-sm leading-relaxed text-left whitespace-pre-wrap">
                {message.content}
              </p>
              <p className="text-xs mt-2 opacity-70 text-left">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div 
              className="p-4 rounded-lg border flex items-center gap-2" 
              style={{
                backgroundColor: '#F9F8F4',
                borderColor: '#D3D3D3',
                color: '#2E2E2E'
              }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing your data...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="mb-6">
          <QuickQuestions 
            onQuestionSelect={sendMessage}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Input */}
      <div className="border-t pt-4" style={{ borderColor: '#D3D3D3' }}>
        <div className="flex gap-3">
          <Input 
            value={inputMessage} 
            onChange={e => setInputMessage(e.target.value)} 
            onKeyPress={handleKeyPress} 
            placeholder="Ask me about your gut health..." 
            className="flex-1" 
            style={{
              borderColor: '#D3D3D3',
              backgroundColor: '#FFFFFF',
              color: '#2E2E2E'
            }} 
            disabled={isLoading} 
          />
          <Button 
            onClick={() => sendMessage()} 
            disabled={!inputMessage.trim() || isLoading} 
            className="shrink-0 px-4" 
            style={{
              backgroundColor: '#4A7C59',
              color: '#FFFFFF'
            }} 
            onMouseEnter={e => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#5B8C6B';
              }
            }} 
            onMouseLeave={e => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.backgroundColor = '#4A7C59';
              }
            }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
