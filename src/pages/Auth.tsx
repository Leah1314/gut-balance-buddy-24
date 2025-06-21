
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Check your email to confirm your account!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
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
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" style={{ color: '#2E2E2E' }}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border"
                  style={{ borderColor: '#D3D3D3' }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" style={{ color: '#2E2E2E' }}>Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border"
                  style={{ borderColor: '#D3D3D3' }}
                />
              </div>
              <Button
                type="submit"
                className="w-full text-white font-medium"
                disabled={loading}
                style={{ backgroundColor: '#4A7C59' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5B8C6B';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#4A7C59';
                }}
              >
                {loading ? "Loading..." : (isLogin ? "Sign In" : "Sign Up")}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
                style={{ color: '#2E2E2E' }}
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
