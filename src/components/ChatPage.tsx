import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Loader2, Database } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRAG } from "@/hooks/useRAG";

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
  const [hasUserData, setHasUserData] = useState({ health_info: false, track_history: false });
  const { checkUserData, retrieveUserData } = useRAG();

  // Check for user data on component mount
  useEffect(() => {
    const checkForUserData = async () => {
      try {
        const userDataStatus = await checkUserData();
        setHasUserData(userDataStatus);
        
        // Set initial greeting message with data availability flag
        const hasAnyData = userDataStatus.health_info || userDataStatus.track_history;
        const greetingMessage = hasAnyData 
          ? "Hi! I'm your gut health coach. I can see you have some health data stored. I can help you understand your digestive patterns, suggest meal improvements, and answer questions about your symptoms. What would you like to know? {we_have_your_data}"
          : "Hi! I'm your gut health coach. I can help you understand your digestive patterns, suggest meal improvements, and answer questions about symptoms. You can add more information in the 'Track' or 'Health' tabs to get more personalized advice. What would you like to know?";

        setMessages([{
          id: '1',
          content: greetingMessage,
          role: 'assistant',
          timestamp: new Date()
        }]);
      } catch (error) {
        // Fallback to default greeting
        setMessages([{
          id: '1',
          content: "Hi! I'm your gut health coach. I can help you understand your digestive patterns, suggest meal improvements, and answer questions about symptoms. What would you like to know?",
          role: 'assistant',
          timestamp: new Date()
        }]);
      }
    };

    checkForUserData();
  }, []);

  const quickPrompts = [
    "Analyze my recent meal patterns",
    "Help me understand my symptoms",
    "Suggest foods for better digestion",
    "What should I track daily?"
  ];

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const originalMessage = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    try {
      // Retrieve relevant user data from RAG system
      let contextualQuery = originalMessage;
      
      if (hasUserData.health_info || hasUserData.track_history) {
        try {
          const ragData = await retrieveUserData(originalMessage);
          
          // Append user context to the query
          let contextAddition = "\n\n--- User Context ---\n";
          
          if (ragData.health_info.length > 0) {
            contextAddition += "Health Profile:\n" + ragData.health_info.join('\n') + "\n";
          }
          
          if (ragData.track_history.length > 0) {
            contextAddition += "Recent Tracking History:\n" + ragData.track_history.join('\n') + "\n";
          }
          
          contextualQuery = originalMessage + contextAddition;
        } catch (error) {
          console.log('RAG retrieval failed, proceeding with original message');
        }
      }

      const { data, error } = await supabase.functions.invoke('gut-health-chat', {
        body: { 
          message: contextualQuery,
          conversationHistory: messages 
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error("Sorry, I'm having trouble responding right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
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
            <Database className="w-5 h-5" style={{ color: '#4A7C59' }} title="Your data is available" />
          )}
        </div>
        <p className="text-base leading-tight" style={{ color: '#2E2E2E', opacity: 0.6 }}>
          Get personalized advice for your digestive wellness
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 max-h-[calc(100vh-300px)]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-lg ${
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
              <p className="text-sm leading-relaxed">
                {message.content.replace('{we_have_your_data}', '')}
              </p>
              <p className="text-xs mt-2 opacity-70">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      {messages.length === 1 && (
        <div className="mb-6">
          <p className="text-sm font-medium mb-3" style={{ color: '#2E2E2E' }}>Quick questions:</p>
          <div className="grid grid-cols-1 gap-2">
            {quickPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickPrompt(prompt)}
                className="text-left justify-start h-auto p-3 text-sm"
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
      <div className="border-t pt-4" style={{ borderColor: '#D3D3D3' }}>
        <div className="flex gap-3">
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
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="shrink-0 px-4"
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
  );
};

export default ChatPage;
