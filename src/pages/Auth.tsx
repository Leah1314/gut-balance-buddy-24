
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Lock, Phone, KeyRound } from "lucide-react";
import GutlyMascot from "@/components/gutly/GutlyMascot";

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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col px-6 py-10 max-w-sm mx-auto w-full">
        {/* Branding */}
        <div className="flex flex-col items-center mb-10 mt-6 animate-fade-in">
          <GutlyMascot size={72} />
          <h1 className="text-hero text-foreground mt-5 mb-1">Gutly</h1>
          <p className="text-caption mb-8">Gut Time · your AI gut health companion</p>
          <h2 className="text-card-title text-foreground text-center">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
        </div>

        <div className="flex-1 flex flex-col">
          <Tabs
            value={authMethod}
            onValueChange={(v) => {
              setAuthMethod(v as "email" | "phone");
              setOtpSent(false);
              setOtp("");
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/70 rounded-2xl p-1">
              <TabsTrigger value="email" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-soft">
                <Mail className="w-4 h-4 mr-2" /> Email
              </TabsTrigger>
              <TabsTrigger value="phone" className="rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-soft">
                <Phone className="w-4 h-4 mr-2" /> Phone
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="mt-6">
              <form onSubmit={handleEmailAuth} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground text-[15px] font-medium">
                    <Mail className="w-4 h-4 inline mr-2" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full h-12 text-base bg-card rounded-2xl"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground text-[15px] font-medium">
                    <Lock className="w-4 h-4 inline mr-2" /> Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full h-12 text-base bg-card rounded-2xl"
                    placeholder={isLogin ? "Your password" : "Create a password (6+ characters)"}
                    minLength={isLogin ? undefined : 6}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
              </form>
            </TabsContent>

            <TabsContent value="phone" className="mt-6">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground text-[15px] font-medium">
                      <Phone className="w-4 h-4 inline mr-2" /> Phone number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full h-12 text-base bg-card rounded-2xl"
                      placeholder="+14155551234"
                    />
                    <p className="text-caption">Include your country code (e.g. +1 for US).</p>
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? "Sending..." : isLogin ? "Send sign-in code" : "Send sign-up code"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-foreground text-[15px] font-medium">
                      <KeyRound className="w-4 h-4 inline mr-2" /> Verification code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="w-full h-12 text-base bg-card rounded-2xl tracking-widest text-center"
                      placeholder="123456"
                      maxLength={8}
                    />
                    <p className="text-caption">Code sent to {normalizePhone(phone)}.</p>
                  </div>
                  <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Verify & continue"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => { setOtpSent(false); setOtp(""); }}
                    disabled={loading}
                  >
                    Use a different number
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => { setIsLogin(!isLogin); setOtpSent(false); setOtp(""); }}
            className="text-[15px]"
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
