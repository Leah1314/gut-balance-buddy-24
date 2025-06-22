import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageCircle, Send, Loader2, Database } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useFoodLogsWithRAG } from "@/hooks/useFoodLogsWithRAG";
import { useStoolLogs } from "@/hooks/useStoolLogs";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface UserData {
  healthProfile: any;
  foodLogs: any[];
  stoolLogs: any[];
  userId: string;
  email: string;
}

const GutHealthCoach = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [allUserData, setAllUserData] = useState<UserData>({
    healthProfile: null,
    foodLogs: [],
    stoolLogs: [],
    userId: '',
    email: ''
  });
  
  const { foodLogs } = useFoodLogsWithRAG();
  const { getStoolLogs } = useStoolLogs();

  // Fetch all user data including health profile, food logs, and stool logs
  const fetchAllUserData = async (): Promise<UserData> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          healthProfile: null,
          foodLogs: [],
          stoolLogs: [],
          userId: '',
          email: ''
        };
      }

      console.log('Fetching user data for chat...');

      // Fetch health profile
      const { data: healthProfile } = await supabase
        .from('user_health_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Fetch stool logs
      const stoolLogs = await getStoolLogs();

      // Combine all user data
      const userData: UserData = {
        healthProfile: healthProfile || null,
        foodLogs: foodLogs || [],
        stoolLogs: stoolLogs || [],
        userId: user.id,
        email: user.email || ''
      };

      setAllUserData(userData);
      console.log('User data fetched for chat:', {
        hasHealthProfile: !!userData.healthProfile,
        foodLogsCount: userData.foodLogs.length,
        stoolLogsCount: userData.stoolLogs.length
      });
      
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {
        healthProfile: null,
        foodLogs: [],
        stoolLogs: [],
        userId: '',
        email: ''
      };
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Fetch all user data first
        const userData = await fetchAllUserData();
        
        const hasData = !!(userData.healthProfile || userData.foodLogs?.length > 0 || userData.stoolLogs?.length > 0);
        
        const welcomeMessage = {
          id: '1',
          content: `Hi! I'm your gut health coach. ${
            hasData 
              ? "I can see you have health data and tracking history. I'll use this information to provide personalized advice!" 
              : "I can help you understand digestive patterns and suggest improvements. Start tracking your food and symptoms to get personalized insights!"
          } What would you like to know about your gut health?`,
          role: 'assistant' as const,
          timestamp: new Date()
        };
        
        setMessages([welcomeMessage]);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setMessages([{
          id: '1',
          content: "Hi! I'm your gut health coach. I can help you understand your digestive patterns and answer questions about symptoms. What would you like to know?",
          role: 'assistant',
          timestamp: new Date()
        }]);
      }
    };

    if (isOpen) {
      initializeChat();
    }
  }, [isOpen, foodLogs]);

  const quickPrompts = [
    "Analyze my recent meal patterns",
    "Help me understand my symptoms", 
    "Suggest foods for better digestion",
    "What should I track daily?"
  ];

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Prepare comprehensive user context
      let contextualMessage = textToSend;
      
      // Add health profile context if available
      if (allUserData.healthProfile) {
        const profile = allUserData.healthProfile;
        contextualMessage += '\n\n--- Health Profile Context ---\n';
        if (profile.age) contextualMessage += `Age: ${profile.age}\n`;
        if (profile.medical_conditions) contextualMessage += `Medical Conditions: ${profile.medical_conditions.join(', ')}\n`;
        if (profile.dietary_restrictions) contextualMessage += `Dietary Restrictions: ${JSON.stringify(profile.dietary_restrictions)}\n`;
        if (profile.medications) contextualMessage += `Medications: ${profile.medications.join(', ')}\n`;
        if (profile.symptoms_notes) contextualMessage += `Symptoms Notes: ${profile.symptoms_notes}\n`;
      }

      // Add recent food logs context
      if (allUserData.foodLogs && allUserData.foodLogs.length > 0) {
        contextualMessage += '\n--- Recent Food Logs ---\n';
        const recentFoodLogs = allUserData.foodLogs.slice(0, 5); // Last 5 entries
        recentFoodLogs.forEach((log: any) => {
          contextualMessage += `Food: ${log.food_name}`;
          if (log.description) contextualMessage += ` - ${log.description}`;
          if (log.analysis_result) contextualMessage += ` [AI Analysis: ${typeof log.analysis_result === 'string' ? log.analysis_result : JSON.stringify(log.analysis_result)}]`;
          contextualMessage += `\n`;
        });
      }

      // Add recent stool logs context
      if (allUserData.stoolLogs && allUserData.stoolLogs.length > 0) {
        contextualMessage += '\n--- Recent Stool Logs ---\n';
        const recentStoolLogs = allUserData.stoolLogs.slice(0, 5); // Last 5 entries
        recentStoolLogs.forEach((log: any) => {
          contextualMessage += `Bristol Type: ${log.bristol_type}, Color: ${log.color}, Consistency: ${log.consistency}`;
          if (log.notes) contextualMessage += ` - Notes: ${log.notes}`;
          contextualMessage += `\n`;
        });
      }

      console.log('Sending contextual message to AI:', {
        originalMessage: textToSend,
        hasHealthProfile: !!allUserData.healthProfile,
        foodLogsCount: allUserData.foodLogs?.length || 0,
        stoolLogsCount: allUserData.stoolLogs?.length || 0,
        contextualMessageLength: contextualMessage.length
      });

      const { data, error } = await supabase.functions.invoke('gut-health-chat', {
        body: { 
          message: contextualMessage,
          conversationHistory: messages.slice(-5), // Last 5 messages for context
          hasUserData: !!(allUserData.healthProfile || allUserData.foodLogs?.length > 0 || allUserData.stoolLogs?.length > 0),
          userData: allUserData
        }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data || !data.response) {
        console.error('No response received from AI service:', data);
        throw new Error('No response received from AI service');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error("Sorry, I'm having trouble connecting to the AI service. Please try again.");
      
      // Add error message to chat
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

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 z-50"
          style={{
            backgroundColor: '#4A7C59',
            color: '#FFFFFF'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5B8C6B';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4A7C59';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-md bg-white" style={{ borderColor: '#D3D3D3' }}>
        <SheetHeader className="pb-4" style={{ borderBottomColor: '#D3D3D3' }}>
          <SheetTitle className="flex items-center justify-between" style={{ color: '#2E2E2E' }}>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" style={{ color: '#4A7C59' }} />
              Gut Health Coach
            </div>
            {(allUserData.healthProfile || allUserData.foodLogs?.length > 0 || allUserData.stoolLogs?.length > 0) && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <Database className="w-3 h-3" />
                <span>Data Connected</span>
              </div>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full max-h-[calc(100vh-120px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'text-white'
                      : 'border'
                  }`}
                  style={{
                    backgroundColor: message.role === 'user' ? '#4A7C59' : '#F9F8F4',
                    borderColor: message.role === 'assistant' ? '#D3D3D3' : 'transparent',
                    color: message.role === 'user' ? '#FFFFFF' : '#2E2E2E'
                  }}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div
                  className="p-3 rounded-lg border flex items-center gap-2"
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
            <div className="py-4 border-t" style={{ borderColor: '#D3D3D3' }}>
              <p className="text-sm font-medium mb-2" style={{ color: '#2E2E2E' }}>Quick questions:</p>
              <div className="grid grid-cols-1 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickPrompt(prompt)}
                    className="text-left justify-start h-auto p-2 text-xs"
                    style={{
                      borderColor: '#D3D3D3',
                      color: '#2E2E2E',
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F9F8F4';
                      e.currentTarget.style.borderColor = '#4A7C59';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = '#D3D3D3';
                    }}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="pt-4 border-t" style={{ borderColor: '#D3D3D3' }}>
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
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
                className="shrink-0"
                style={{
                  backgroundColor: '#4A7C59',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#5B8C6B';
                  }
                }}
                onMouseLeave={(e) => {
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
      </SheetContent>
    </Sheet>
  );
};

export default GutHealthCoach;
