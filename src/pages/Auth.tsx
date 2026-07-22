
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, Phone, KeyRound } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signUp, signIn } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = isLogin ? await signIn(email, password) : await signUp(email, password);
      if (error) {
        // Handle specific error messages
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
        }
        throw new Error(errorMessage);
      }
      if (isLogin) {
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully."
        });
        navigate("/");
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account."
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const normalizePhone = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    return trimmed.startsWith("+") ? trimmed.replace(/[^\d+]/g, "") : `+${trimmed.replace(/\D/g, "")}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const phoneNumber = normalizePhone(phone);
      if (!/^\+\d{8,15}$/.test(phoneNumber)) {
        throw new Error("Please enter a valid phone number in international format, e.g. +14155551234");
      }
      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneNumber,
        options: { shouldCreateUser: !isLogin },
      });
      if (error) throw error;
      setOtpSent(true);
      toast({ title: "Code sent", description: `We've sent a verification code to ${phoneNumber}.` });
    } catch (error: any) {
      toast({ title: "Could not send code", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const phoneNumber = normalizePhone(phone);
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneNumber,
        token: otp.trim(),
        type: "sms",
      });
      if (error) throw error;
      toast({ title: "Welcome!", description: "You've been signed in successfully." });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Verification failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-background flex flex-col">
      {/* Mobile-first full screen layout */}
      <div className="flex-1 flex flex-col px-6 py-8 max-w-sm mx-auto w-full">
        {/* Logo and branding section */}
        <div className="flex flex-col items-center mb-12 mt-8">
          <div className="w-16 h-16 flex items-center justify-center mb-6">
            <img src="/lovable-uploads/98b6daca-32d4-4d0a-aa72-75a1d85b5a10.png" alt="Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-brand-text mb-1">Gutly</h1>
          <p className="text-sm text-muted-foreground mb-2 italic">Gut Time</p>
          <h2 className="text-3xl font-semibold text-brand-text text-center">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col space-y-4">
          <Tabs
            value={authMethod}
            onValueChange={(v) => {
              setAuthMethod(v as "email" | "phone");
              setOtpSent(false);
              setOtp("");
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-brand-surface">
              <TabsTrigger value="email">
                <Mail className="w-4 h-4 mr-2" /> Email
              </TabsTrigger>
              <TabsTrigger value="phone">
                <Phone className="w-4 h-4 mr-2" /> Phone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-6">
              <form onSubmit={handleEmailAuth} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-brand-text text-base font-medium text-left block">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="w-full h-12 text-base bg-brand-surface border-brand-border text-brand-text" 
                placeholder="Enter your email" 
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-brand-text text-base font-medium text-left block">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="w-full h-12 text-base bg-brand-surface border-brand-border text-brand-text" 
                placeholder={isLogin ? "Enter your password" : "Create a password (min. 6 characters)"} 
                minLength={isLogin ? undefined : 6} 
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 text-white font-semibold text-base bg-brand-accent hover:bg-brand-accent-hover" 
              disabled={loading}
            >
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="mt-6">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-brand-text text-base font-medium text-left block">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full h-12 text-base bg-brand-surface border-brand-border text-brand-text"
                      placeholder="+14155551234"
                    />
                    <p className="text-xs text-brand-text/60 text-left">
                      Include your country code (e.g. +1 for US).
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-white font-semibold text-base bg-brand-accent hover:bg-brand-accent-hover"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : isLogin ? "Send sign-in code" : "Send sign-up code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="otp" className="text-brand-text text-base font-medium text-left block">
                      <KeyRound className="w-4 h-4 inline mr-2" />
                      Verification code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="w-full h-12 text-base bg-brand-surface border-brand-border text-brand-text tracking-widest text-center"
                      placeholder="123456"
                      maxLength={8}
                    />
                    <p className="text-xs text-brand-text/60 text-left">
                      Code sent to {normalizePhone(phone)}.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-white font-semibold text-base bg-brand-accent hover:bg-brand-accent-hover"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify & continue"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-brand-text"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp("");
                    }}
                    disabled={loading}
                  >
                    Use a different number
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom section */}
        <div className="mt-8 text-center">
          <Button 
            variant="ghost" 
            onClick={() => {
              setIsLogin(!isLogin);
              setOtpSent(false);
              setOtp("");
            }}
            className="text-base text-brand-text hover:bg-transparent" 
            disabled={loading}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
