
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import GutlyMascot from "@/components/gutly/GutlyMascot";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex-1 flex flex-col px-6 pt-4 pb-4 max-w-sm mx-auto w-full">
        {/* Branding */}
        <div className="flex flex-col items-center mb-4 animate-fade-in">
          <div className="animate-breathe">
            <GutlyMascot size={44} />
          </div>
          <h1 className="font-display text-[32px] leading-none font-semibold text-foreground mt-2 tracking-[-0.02em]">Gutly</h1>
          <p className="text-caption mt-1">Gut Time · your AI gut health companion</p>
        </div>

        <h2 className="text-[22px] font-semibold text-foreground mb-3 tracking-tight">
          {isLogin ? "Welcome back" : "Create account"}
        </h2>

        <div className="flex-1 flex flex-col">
          <form onSubmit={handleEmailAuth} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-[12px] font-medium tracking-wide uppercase text-muted-foreground pl-1">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-[12px] font-medium tracking-wide uppercase text-muted-foreground pl-1">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder={isLogin ? "Your password" : "6+ characters"}
                    minLength={isLogin ? undefined : 6}
                  />
                </div>

                <Button type="submit" size="lg" className="w-full mt-1" disabled={loading}>
                  {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
                </Button>
          </form>
        </div>

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[14px] font-medium text-muted-foreground h-9"
            disabled={loading}
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
