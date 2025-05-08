
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAccessToken, setHasAccessToken] = useState(false);

  useEffect(() => {
    // Check if there's an access token in the URL (from password reset email)
    const hasToken = window.location.hash.includes("#access_token=");
    setHasAccessToken(hasToken);
    
    const checkGoogleUser = async () => {
      if (!user) return;
      
      try {
        const { data: session } = await supabase.auth.getSession();
        const provider = session?.session?.user?.app_metadata?.provider;
        setIsGoogleUser(provider === 'google');
      } catch (error) {
        console.error("Error checking user provider:", error);
      }
    };

    checkGoogleUser();
  }, [user]);

  // If user is already signed in and it's not a password reset flow, redirect to home
  if (user && !hasAccessToken) {
    return <Navigate to="/" replace />;
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;
      
      toast({
        title: "Password updated successfully",
        description: "You can now log in with your new password.",
      });
      
      // Navigate to sign in page
      navigate("/auth/sign-in");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setError(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-circl-blue flex items-center justify-center text-white font-sans text-2xl">C</div>
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGoogleUser ? (
            <div className="text-center p-4 bg-blue-50 rounded-md flex flex-col items-center">
              <AlertCircle className="text-blue-500 mb-2" size={24} />
              <p className="text-blue-800">
                You signed in with Google and don't have a password to reset.
              </p>
              <p className="text-sm text-blue-600 mt-2">
                Please continue to sign in with Google.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/auth/sign-in')}
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm flex items-start">
                  <AlertCircle className="text-red-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/auth/sign-in" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
