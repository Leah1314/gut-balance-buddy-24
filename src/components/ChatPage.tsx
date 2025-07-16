import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import QuickQuestions from "./QuickQuestions";
import ImageUploadDialog from "./ImageUploadDialog";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  imageData?: string;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your gut health coach. I can see you have some health data stored. I can help you understand your digestive patterns, suggest meal improvements, and answer questions about your symptoms. What would you like to know?",
      role: 'assistant',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, session } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string, includeUserData: boolean = true, imageData?: string) => {
    if ((!messageText.trim() && !imageData) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      role: 'user',
      timestamp: new Date().toISOString(),
      imageData
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setInput("");

    try {
      console.log('Sending message to chat function:', messageText);
      console.log('Include user data:', includeUserData);
      console.log('User session:', session ? 'Present' : 'Not present');

      const { data, error } = await supabase.functions.invoke('gut-health-chat', {
        body: {
          message: messageText,
          conversationHistory: messages,
          includeUserData: includeUserData,
          imageData: imageData
        },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`
        } : {}
      });

      console.log('Chat function response:', data);
      console.log('Chat function error:', error);

      if (error) {
        console.error('Error calling chat function:', error);
        throw error;
      }

      if (data?.response) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: 'assistant',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('No response received from chat function');
      }

    } catch (error) {
      console.error('Error in sendMessage:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      
      // Add error message to chat
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I encountered an error. Please try again.",
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input, true);
  };

  const handleQuickQuestion = async (question: string) => {
    console.log('Quick question selected:', question);
    await sendMessage(question, true);
  };

  const handleImageUpload = async (imageData: string, context?: string) => {
    console.log('Image uploaded with context:', context);
    const messageText = context ? `${context}\n\n[Image uploaded]` : '[Image uploaded]';
    await sendMessage(messageText, true, imageData);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <p>Please log in to access the chat.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Chat Messages - Optimized for mobile */}
      <Card className="flex-1 bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardContent className="p-3 h-80 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'text-white'
                      : 'bg-gray-100'
                  }`}
                  style={{
                    backgroundColor: message.role === 'user' ? '#4A7C59' : '#F3F4F6',
                    color: message.role === 'user' ? '#FFFFFF' : '#2E2E2E'
                  }}
                >
                  {message.imageData && (
                    <div className="mb-3">
                      <img 
                        src={message.imageData} 
                        alt="Uploaded food" 
                        className="w-full max-w-48 h-auto rounded-lg"
                      />
                    </div>
                  )}
                  <div 
                    className={`whitespace-pre-wrap leading-relaxed ${
                      message.role === 'assistant' 
                        ? 'text-base font-normal' 
                        : 'text-sm'
                    }`}
                    style={{
                      lineHeight: message.role === 'assistant' ? '1.6' : '1.4',
                      fontFamily: message.role === 'assistant' 
                        ? '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                        : 'inherit'
                    }}
                  >
                    {message.role === 'assistant' ? (
                      <div 
                        dangerouslySetInnerHTML={{
                          __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/### (.*?)\n/g, '<h3 style="font-weight: 600; font-size: 1.1em; margin: 16px 0 8px 0; color: #1f2937;">$1</h3>')
                            .replace(/- (.*?)(?=\n|$)/g, '<div style="margin: 4px 0; padding-left: 16px; position: relative;"><span style="position: absolute; left: 0; color: #374151;">•</span>$1</div>')
                            .replace(/\n\n/g, '<div style="margin: 12px 0;"></div>')
                            .replace(/\n/g, '<br/>')
                        }}
                      />
                    ) : (
                      message.content
                    )}
                  </div>
                  <div className="text-xs mt-2 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm" style={{ color: '#2E2E2E' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Quick Questions */}
      <QuickQuestions onQuestionSelect={handleQuickQuestion} isLoading={isLoading} />

      {/* Message Input - Mobile optimized */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardContent className="p-3">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <ImageUploadDialog 
              onImageUpload={handleImageUpload} 
              isLoading={isLoading}
            />
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about your gut health..."
              className="flex-1 min-h-[48px] max-h-32 resize-none rounded-lg text-sm"
              style={{
                borderColor: '#D3D3D3',
                color: '#2E2E2E'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="self-end text-white h-12 w-12 rounded-lg"
              style={{
                backgroundColor: '#4A7C59',
                borderColor: '#4A7C59'
              }}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPage;
