
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { user } = useAuth();

  // If user is already signed in, redirect to home page
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      // Use Supabase auth resetPassword with redirectTo pointing to our reset password page
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      setIsEmailSent(true);
    } catch (error) {
      console.error("Error resetting password:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-6 text-center pb-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center text-white font-serif text-2xl">
                C
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-gray-900">Reset Password</CardTitle>
              <CardDescription className="text-gray-600">
                {isEmailSent
                  ? "Check your email for a reset link"
                  : "Enter your email and we'll send you a reset link"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isEmailSent ? (
              <div className="text-center space-y-6">
                <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                  <p className="font-medium">Password reset email sent!</p>
                  <p className="text-sm mt-1">Please check your inbox.</p>
                </div>
                <p className="text-sm text-gray-600">
                  If you don't see it, check your spam folder or try again.
                </p>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                    className="border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pt-4">
            <p className="text-sm text-gray-600">
              Remembered your password?{" "}
              <Link to="/auth/sign-in" className="text-gray-900 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
