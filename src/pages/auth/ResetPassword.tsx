import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, Lock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
export default function ResetPassword() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAccessToken, setHasAccessToken] = useState(false);
  useEffect(() => {
    const hasToken = window.location.hash.includes("#access_token=");
    setHasAccessToken(hasToken);
    const checkGoogleUser = async () => {
      if (!user) return;
      try {
        const {
          data: session
        } = await supabase.auth.getSession();
        const provider = session?.session?.user?.app_metadata?.provider;
        setIsGoogleUser(provider === 'google');
      } catch (error) {
        console.error("Error checking user provider:", error);
      }
    };
    checkGoogleUser();
  }, [user]);
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
      const {
        error
      } = await supabase.auth.updateUser({
        password
      });
      if (error) throw error;
      toast({
        title: "Password updated successfully",
        description: "You can now log in with your new password."
      });
      navigate("/auth/sign-in");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setError(error.message || "Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white backdrop-blur-sm">
          <CardHeader className="space-y-6 text-center pb-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                <Lock className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-bold text-gray-900">Reset Password</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Enter your new password below
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-8">
            {isGoogleUser ? <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-xl flex flex-col items-center">
                <AlertCircle className="text-blue-600 mb-4" size={32} />
                <div className="space-y-3">
                  <p className="font-semibold text-blue-900 text-lg">
                    You signed in with Google
                  </p>
                  <p className="text-sm text-blue-700">
                    Google accounts don't have passwords to reset. Please continue to sign in with Google.
                  </p>
                </div>
                <Button variant="outline" className="mt-6 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold" onClick={() => navigate('/auth/sign-in')}>
                  Go to Sign In
                </Button>
              </div> : <form onSubmit={handleResetPassword} className="space-y-5">
                {error && <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-start">
                    <AlertCircle className="text-red-600 mr-3 flex-shrink-0 mt-0.5" size={18} />
                    <span className="text-sm font-medium">{error}</span>
                  </div>}
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">New Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={isSubmitting} required className="h-12 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 rounded-full" />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={isSubmitting} required className="h-12 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 rounded-full" />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl rounded-full">
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </form>}
          </CardContent>
          <CardFooter className="flex justify-center pt-4 pb-8">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Link to="/signin" className="text-gray-900 hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>;
}