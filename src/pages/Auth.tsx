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
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F9F8F4' }}>
      <div className="w-full max-w-md px-4">
        <Card className="bg-white shadow-lg" style={{ borderColor: '#D3D3D3' }}>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/98b6daca-32d4-4d0a-aa72-75a1d85b5a10.png" 
                  alt="Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <h1 className="text-xl font-semibold" style={{ color: '#2E2E2E' }}>In and Out</h1>
            </div>
            <CardTitle className="text-2xl font-semibold" style={{ color: '#2E2E2E' }}>
              {isLogin ? "Welcome back" : "Create account"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Google Sign In */}
            <Button
              onClick={handleGoogleAuth}
              disabled={loading}
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
              style={{ borderColor: '#D3D3D3' }}
            >
              <Chrome className="w-4 h-4" />
              <span>Continue with Google</span>
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: '#2E2E2E' }}>
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border"
                  style={{ borderColor: '#D3D3D3', backgroundColor: '#FFFFFF', color: '#2E2E2E' }}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: '#2E2E2E' }}>
                  <Lock className="w-4 h-4 inline mr-2" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white border"
                  style={{ borderColor: '#D3D3D3', backgroundColor: '#FFFFFF', color: '#2E2E2E' }}
                  placeholder={isLogin ? "Enter your password" : "Create a password (min. 6 characters)"}
                  minLength={isLogin ? undefined : 6}
                />
              </div>
              <Button
                type="submit"
                className="w-full text-white font-medium"
                disabled={loading}
                style={{ backgroundColor: '#4A7C59' }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#5B8C6B';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = '#4A7C59';
                  }
                }}
              >
                {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </form>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
                style={{ color: '#2E2E2E' }}
                disabled={loading}
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
