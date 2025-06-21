
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Lock, Chrome } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signUp, signIn, signInWithGoogle } = useAuth();

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
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password);

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
          description: "You've been signed in successfully.",
        });
        navigate("/");
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
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
            <img 
              src="/lovable-uploads/98b6daca-32d4-4d0a-aa72-75a1d85b5a10.png" 
              alt="Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-brand-text mb-2">In and Out</h1>
          <h2 className="text-3xl font-semibold text-brand-text text-center">
            {isLogin ? "Welcome back" : "Create account"}
          </h2>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col space-y-6">
          {/* Google Sign In */}
          <Button
            onClick={handleGoogleAuth}
            disabled={loading}
            variant="outline"
            className="w-full h-12 flex items-center justify-center space-x-3 text-base border-brand-border bg-brand-surface"
          >
            <Chrome className="w-5 h-5" />
            <span>Continue with Google</span>
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full bg-brand-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-brand-background px-4 text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-brand-text text-base font-medium">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 text-base bg-brand-surface border-brand-border text-brand-text"
                placeholder="Enter your email"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-brand-text text-base font-medium">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
            </Button>
          </form>
        </div>

        {/* Bottom section */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => setIsLogin(!isLogin)}
            className="text-base text-brand-text hover:bg-transparent"
            disabled={loading}
          >
            {isLogin 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
