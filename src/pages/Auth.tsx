import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, BookOpen, Trophy } from "lucide-react";
import characterHope from "@/assets/character-hope.png";

export default function Auth() {
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;
    const displayName = formData.get("display-name") as string;

    const { error } = await signUp(email, password, displayName);

    setIsLoading(false);

    if (!error) {
      navigate("/");
    }
  };

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("signin-email") as string;
    const password = formData.get("signin-password") as string;

    const { error } = await signIn(email, password);

    setIsLoading(false);

    if (!error) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12">
      <div className="container max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Branding */}
          <div className="text-center lg:text-left space-y-6">
            <div className="flex justify-center lg:justify-start">
              <img
                src={characterHope}
                alt="Hope - Your guiding light"
                className="w-48 h-48 object-contain animate-float"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Welcome to{" "}
              <span className="gradient-primary bg-clip-text text-transparent">
                Scripture Quest
              </span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Make Bible memorization fun, engaging, and rewarding through interactive games!
            </p>
            <div className="flex flex-col gap-4 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-bold">8 Interactive Games</p>
                  <p className="text-sm text-muted-foreground">Multiple ways to learn</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-success" />
                </div>
                <div className="text-left">
                  <p className="font-bold">Daily Streaks & Rewards</p>
                  <p className="text-sm text-muted-foreground">Build lasting habits</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-bold">XP & Leveling System</p>
                  <p className="text-sm text-muted-foreground">Track your progress</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth forms */}
          <Card className="p-8">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      name="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      name="signin-password"
                      type="password"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gradient-primary text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      name="display-name"
                      type="text"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      name="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      name="signup-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gradient-primary text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    By signing up, you agree to memorize Scripture and have fun doing it! 🎮
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
