import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Check, X, Eye, EyeOff, CheckCircle } from "lucide-react";
import BackgroundPattern from "@/components/BackgroundPattern";
import stratviewLogo from "@/assets/stratview-logo.png";
import stratviewLogoWhite from "@/assets/stratview-logo-white.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const passwordRules = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*]/.test(p) },
];

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isPasswordValid = passwordRules.every((rule) => rule.test(password));
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid || !passwordsMatch) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setIsSuccess(true);
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to reset password.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative">
        <BackgroundPattern />
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          <div className="space-y-12">
            <div className="animate-fade-in-up">
              <img src={stratviewLogoWhite} alt="Stratview Research" className="h-16 xl:h-20 w-auto" />
            </div>
            <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="space-y-4">
                <h1 className="text-4xl xl:text-5xl font-bold text-primary-foreground leading-tight">
                  Set Your
                  <span className="block text-stratview-mint">New Password</span>
                </h1>
                <p className="text-lg xl:text-xl text-primary-foreground/80 max-w-lg leading-relaxed">
                  Choose a strong password to keep your account secure.
                </p>
              </div>
            </div>
          </div>
          <div className="animate-fade-in-up mt-auto pt-12" style={{ animationDelay: "0.4s" }}>
            <p className="text-sm text-primary-foreground/60">© {new Date().getFullYear()} Stratview Research. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 bg-background">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="lg:hidden flex justify-center mb-8">
            <img src={stratviewLogo} alt="Stratview Research" className="h-14 w-auto" />
          </div>

          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sign In
          </Link>

          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-success/10">
                  <CheckCircle className="h-12 w-12 text-success" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl xl:text-3xl font-bold text-foreground">Password Updated!</h2>
                <p className="text-muted-foreground">Redirecting you to sign in...</p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2 text-center lg:text-left">
                <h2 className="text-2xl xl:text-3xl font-bold text-foreground">Set new password</h2>
                <p className="text-muted-foreground">Enter your new password below.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-foreground">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-background border-border focus:border-secondary focus:ring-secondary/20 transition-all duration-200 pr-12"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 space-y-1">
                      {passwordRules.map((rule, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {rule.test(password) ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-muted-foreground" />}
                          <span className={rule.test(password) ? "text-success" : "text-muted-foreground"}>{rule.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 bg-background border-border focus:border-secondary focus:ring-secondary/20 transition-all duration-200 pr-12"
                      required
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <div className="flex items-center gap-2 text-sm mt-1">
                      {passwordsMatch ? (
                        <><Check className="h-4 w-4 text-success" /><span className="text-success">Passwords match</span></>
                      ) : (
                        <><X className="h-4 w-4 text-destructive" /><span className="text-destructive">Passwords do not match</span></>
                      )}
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={isLoading || !isPasswordValid || !passwordsMatch} className="w-full h-12 gradient-primary hover:opacity-90 text-primary-foreground font-semibold text-base transition-all duration-200">
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Password"}
                </Button>
              </form>
            </>
          )}

          <div className="pt-6 border-t border-border">
            <p className="text-sm text-center text-muted-foreground">
              Remember your password?{" "}
              <Link to="/" className="font-medium text-secondary hover:text-stratview-mint transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
