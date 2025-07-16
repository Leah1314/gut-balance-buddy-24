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
      <Card className="flex-1 bg-gray-50 shadow-sm border-0">
        <CardContent className="p-4 h-80 overflow-y-auto">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex animate-in slide-in-from-left-2 duration-500 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`max-w-[90%] rounded-2xl shadow-sm ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white ml-8'
                      : 'bg-white text-gray-800 mr-8 border border-gray-100'
                  }`}
                  style={{
                    padding: '16px 20px',
                    fontSize: message.role === 'assistant' ? '17px' : '16px',
                    lineHeight: '1.5',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                  }}
                >
                  {message.imageData && (
                    <div className="mb-4">
                      <img 
                        src={message.imageData} 
                        alt="Uploaded food" 
                        className="w-full max-w-64 h-auto rounded-xl shadow-sm"
                      />
                    </div>
                  )}
                  
                  <div className="text-left">
                    {message.role === 'assistant' ? (
                      <div 
                        className="assistant-message"
                        dangerouslySetInnerHTML={{
                          __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600; color: #1f2937;">$1</strong>')
                            .replace(/### (.*?)\n/g, '<h3 style="font-weight: 700; font-size: 1.1em; margin: 20px 0 12px 0; color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">$1</h3>')
                            .replace(/- (.*?)(?=\n|$)/g, '<div style="margin: 8px 0; padding-left: 20px; position: relative; color: #374151;"><span style="position: absolute; left: 0; color: #6b7280; font-weight: 600;">•</span>$1</div>')
                            .replace(/\n\n/g, '<div style="margin: 16px 0;"></div>')
                            .replace(/\n/g, '<br/>')
                        }}
                        style={{
                          color: '#111827',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word'
                        }}
                      />
                    ) : (
                      <div style={{ 
                        wordWrap: 'break-word', 
                        overflowWrap: 'break-word'
                      }}>
                        {message.content}
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className={`text-xs mt-3 ${
                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}
                    style={{ textAlign: 'right' }}
                  >
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-in slide-in-from-left-2 duration-300">
                <div 
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 mr-8 flex items-center space-x-3"
                  style={{ padding: '16px 20px' }}
                >
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  <span 
                    className="text-gray-600"
                    style={{ 
                      fontSize: '17px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}
                  >
                    Thinking...
                  </span>
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
