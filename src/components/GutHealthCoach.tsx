
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const GutHealthCoach = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: '1',
        content: "Hi! I'm your gut health coach. I can help you with digestive health questions and nutrition advice. What would you like to know?",
        role: 'assistant' as const,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Listen for custom events from test results
  useEffect(() => {
    const handleSendMessage = (event: CustomEvent) => {
      if (event.detail?.message) {
        setIsOpen(true);
        // Wait for the sheet to open, then send the message
        setTimeout(() => {
          sendMessage(event.detail.message);
        }, 300);
      }
    };

    window.addEventListener('sendHealthCoachMessage', handleSendMessage as EventListener);
    
    return () => {
      window.removeEventListener('sendHealthCoachMessage', handleSendMessage as EventListener);
    };
  }, []);

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
    setInputMessage("");
    setIsLoading(true);

    try {
      // Simple request - just the message
      const requestPayload = { 
        message: textToSend
      };

      console.log('Calling Supabase function with:', requestPayload);

      const { data, error } = await supabase.functions.invoke('gut-health-chat', {
        body: requestPayload
      });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Function error: ${error.message}`);
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
      toast.error(`Sorry, I'm having trouble connecting: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          data-testid="health-coach-trigger"
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
          <SheetTitle className="flex items-center gap-2" style={{ color: '#2E2E2E' }}>
            <MessageCircle className="w-5 h-5" style={{ color: '#4A7C59' }} />
            Gut Health Coach
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
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="pt-4 border-t" style={{ borderColor: '#D3D3D3' }}>
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about gut health..."
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
