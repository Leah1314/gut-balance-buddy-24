import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import QuickQuestions from "./QuickQuestions";
import ImageUploadDialog from "./ImageUploadDialog";
import GutlyMascot from "./gutly/GutlyMascot";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  imageData?: string;
}

const ChatPage = () => {
  // Load chat history from localStorage or use default welcome message
  const loadChatHistory = (): Message[] => {
    try {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultMessage();
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
    return getDefaultMessage();
  };

  const getDefaultMessage = (): Message[] => [
    {
      id: '1',
      content: "Hi! I'm your gut health coach. I can see you have some health data stored. I can help you understand your digestive patterns, suggest meal improvements, and answer questions about your symptoms. What would you like to know?",
      role: 'assistant',
      timestamp: new Date().toISOString()
    }
  ];

  const [messages, setMessages] = useState<Message[]>(loadChatHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, session } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem('chatHistory', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }, [messages]);

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
        <p className="text-muted-foreground">Please log in to access the chat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full animate-fade-in">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-[55vh] sm:min-h-[65vh] pr-1">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start items-start gap-3'}`}
            >
              {message.role === 'assistant' && (
                <div className="shrink-0 mt-1"><GutlyMascot size={32} waving={false} /></div>
              )}
              <div
                className={
                  message.role === 'user'
                    ? "max-w-[85%] rounded-2xl px-4 py-3 bg-primary text-primary-foreground shadow-soft"
                    : "max-w-[90%] text-foreground"
                }
              >
                {message.imageData && (
                  <img
                    src={message.imageData}
                    alt="Uploaded"
                    className="w-full max-w-64 h-auto rounded-2xl mb-2 shadow-soft"
                  />
                )}
                {message.role === 'assistant' ? (
                  <div className="text-[14px] leading-[1.5] space-y-1.5
                    [&_h1]:text-[15px] [&_h1]:font-semibold [&_h1]:mt-2 [&_h1]:mb-1
                    [&_h2]:text-[14px] [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1
                    [&_h3]:text-[14px] [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-0.5 [&_h3]:text-primary
                    [&_p]:my-0.5
                    [&_ul]:my-1 [&_ul]:pl-4 [&_ul]:list-disc [&_ul]:space-y-0.5
                    [&_ol]:my-1 [&_ol]:pl-4 [&_ol]:list-decimal [&_ol]:space-y-0.5
                    [&_li]:my-0 [&_li]:leading-snug
                    [&_strong]:font-semibold [&_strong]:text-foreground
                    [&_code]:text-[13px] [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded
                    [&_hr]:my-2 [&_hr]:border-border">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</div>
                )}
                <div className={`text-[11px] mt-1.5 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-3">
              <GutlyMascot size={32} />
              <div className="flex items-center gap-2 text-muted-foreground text-[15px]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gutly is thinking…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <QuickQuestions onQuestionSelect={handleQuickQuestion} isLoading={isLoading} />

      {/* Composer */}
      <div className="card-soft p-3 flex items-end gap-2">
        <ImageUploadDialog onImageUpload={handleImageUpload} isLoading={isLoading} />
        <form onSubmit={handleSubmit} className="flex-1 flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Gutly about your gut health…"
            className="flex-1 min-h-[52px] max-h-32 resize-none rounded-2xl bg-muted/60 border-0 focus-visible:ring-1 text-[15px] leading-relaxed px-4 py-3"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isLoading}
            className="h-[52px] w-[52px] rounded-2xl"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
