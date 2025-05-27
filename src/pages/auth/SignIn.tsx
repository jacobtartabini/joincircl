
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Navigate, Link, useNavigate } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { signIn, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      // User state from context is sufficient
      setIsCheckingAuth(false);
    };
    
    checkAuthStatus();
  }, []);

  // If user is already signed in, redirect to the home page
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Show loading while checking authentication status
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      navigate("/");
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      // Note: The redirect to callback page is handled by Supabase OAuth flow
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setIsLoading(false); // Only set loading to false if there's an error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-6 text-center pb-8">
            <div className="flex justify-center">
              <div className="w-16 h-16">
                <img 
                  src="/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png" 
                  alt="Circl" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-gray-900">Welcome back</CardTitle>
              <CardDescription className="text-gray-600">
                Sign in to your Circl account
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSignIn} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <Link to="/auth/forgot-password" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500">
                  or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-gray-200 hover:bg-gray-50 py-3"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 mr-3" aria-hidden="true">
                <path
                  d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25529 2.69 1.28528 6.60998L5.27026 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                  fill="#EA4335"
                />
                <path
                  d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                  fill="#4285F4"
                />
                <path
                  d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.28 6.60986C0.47 8.22986 0 10.0599 0 11.9999C0 13.9399 0.47 15.7699 1.28 17.3899L5.26498 14.2949Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.2154 17.135 5.2704 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z"
                  fill="#34A853"
                />
              </svg>
              Sign in with Google
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center pt-4">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/auth/sign-up" className="text-gray-900 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
