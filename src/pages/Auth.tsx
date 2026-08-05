import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import GutlyLogoMark from "@/components/gutly/GutlyLogoMark";

const benefits = [
  "Connect meals, symptoms and digestion",
  "Notice patterns without judgment",
  "Get supportive, explainable AI guidance",
];

const Auth = ({ previewMode = false }: { previewMode?: boolean }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signUp, signIn } = useAuth();
  const [params] = useSearchParams();
  const rawNext = params.get("next") ?? "";
  // Only allow same-origin relative paths.
  const next = /^\/(?!\/)/.test(rawNext) ? rawNext : "/";

  useEffect(() => {
    if (user && !previewMode) navigate(next);
  }, [user, navigate, previewMode, next]);

  const handleEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { error } = isLogin ? await signIn(email, password) : await signUp(email, password, next);
      if (error) {
        let errorMessage = error.message;
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Invalid email or password. Please check your credentials.";
        } else if (error.message.includes("User already registered")) {
          errorMessage = "An account with this email already exists. Please sign in instead.";
        } else if (error.message.includes("Password should be at least")) {
          errorMessage = "Password must be at least 6 characters long.";
        }
        throw new Error(errorMessage);
      }
      if (isLogin) {
        toast({ title: "Welcome back!", description: "You've been signed in successfully." });
        navigate(next);
      } else {
        toast({ title: "Account created!", description: "Please check your email to confirm your account." });
      }
    } catch (error) {
      toast({
        title: "Authentication error",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[32px] border border-border/60 bg-card shadow-card sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col">
          <div className="relative z-10 flex items-center gap-3">
            <GutlyLogoMark className="size-12 ring-1 ring-white/20" />
            <div>
              <p className="font-display text-3xl font-semibold leading-none">Gutly</p>
              <p className="mt-1 text-sm text-white/70">Your gut health companion</p>
            </div>
          </div>

          <div className="relative z-10 my-auto max-w-lg py-12">
            <Badge className="mb-6 border-white/20 bg-white/15 text-white hover:bg-white/15">
              <Sparkles data-icon="inline-start" />
              Small signals, clearer patterns
            </Badge>
            <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight">
              Understand what helps you feel your best.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/75">
              Bring meals, symptoms and digestion into one calm, private space.
            </p>
            <div className="mt-8 flex flex-col gap-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-full bg-white/15">
                    <Check aria-hidden="true" />
                  </span>
                  <span className="text-white/90">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 flex items-center gap-2 text-sm text-white/65">
            <ShieldCheck aria-hidden="true" />
            Your health data stays private and under your control.
          </p>
          <div className="absolute -bottom-24 -right-24 size-96 rounded-full bg-white/10" />
          <div className="absolute -right-4 top-24 size-44 rounded-full bg-white/5" />
        </section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-10 lg:px-14">
          <Card className="w-full max-w-md shadow-none">
            <CardHeader className="gap-3 px-0 pb-7 pt-0">
              <div className="mb-3 flex items-center gap-3 lg:hidden">
                <GutlyLogoMark className="size-11" />
                <span className="font-display text-3xl font-semibold">Gutly</span>
              </div>
              <div>
                <CardTitle className="text-3xl tracking-tight">
                  {isLogin ? "Welcome back" : "Create your account"}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {isLogin
                    ? "Continue building a clearer picture of your gut health."
                    : "Start with a private space for your everyday health patterns."}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="px-0">
              <form onSubmit={handleEmailAuth} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="you@example.com"
                    className="h-12"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="password">Password</Label>
                    {isLogin && (
                      <button type="button" className="text-sm font-medium text-primary hover:underline">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      placeholder={isLogin ? "Enter your password" : "At least 6 characters"}
                      minLength={isLogin ? undefined : 6}
                      className="h-12 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute right-0 top-0"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                    </Button>
                  </div>
                </div>

                {!isLogin && (
                  <Alert className="border-primary/15 bg-primary-soft/35">
                    <LockKeyhole className="text-primary" aria-hidden="true" />
                    <AlertDescription>
                      We’ll ask a few optional questions after signup to personalize your experience.
                    </AlertDescription>
                  </Alert>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
                  {!loading && <ArrowRight data-icon="inline-end" />}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="mt-7 flex-col gap-5 px-0 pb-0">
              <div className="flex w-full items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setIsLogin((value) => !value)}
                disabled={loading}
              >
                {isLogin ? "Create a new account" : "Sign in instead"}
              </Button>
              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Gutly offers wellness information, not medical diagnosis. By continuing, you agree to our privacy policy and terms.
              </p>
            </CardFooter>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default Auth;
