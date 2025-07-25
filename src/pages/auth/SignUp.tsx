import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, Navigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/radix-checkbox";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignupComplete, setIsSignupComplete] = useState(false);
  const {
    signUp,
    signInWithGoogle,
    signInWithLinkedIn,
    user
  } = useAuth();
  const {
    toast
  } = useToast();

  // If user is already signed in, redirect to the home page
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    if (!acceptTerms) {
      toast({
        title: "Terms and Conditions",
        description: "Please accept the terms and conditions to continue",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      await signUp(email, password, fullName);
      setIsSignupComplete(true);
      // Navigate is handled by auth state change or verification flow
    } catch (error) {
      console.error("Error signing up:", error);
      setIsSignupComplete(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleLinkedInSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithLinkedIn();
    } catch (error) {
      console.error("Error signing in with LinkedIn:", error);
    } finally {
      setIsLoading(false);
    }
  };
  if (isSignupComplete) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-xl bg-white backdrop-blur-sm">
            <CardHeader className="space-y-6 text-center pb-8">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>
              <div className="space-y-3">
                <CardTitle className="text-3xl font-bold text-gray-900">Account Created</CardTitle>
                <CardDescription className="text-gray-600 text-base">
                  Check your email to verify your account
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-center space-y-6 px-8">
              <div className="space-y-4">
                <div className="p-6 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-gray-700 font-medium">
                    We've sent a verification email to <strong>{email}</strong>.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Please check your inbox and click the verification link to activate your account.
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  If you don't see the email, check your spam folder or try again.
                </p>
              </div>
              <Button variant="outline" className="w-full h-12 border-gray-200 hover:bg-gray-50 font-semibold" onClick={() => window.location.href = '/signin'}>
                Go to Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-muted flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="unified-modal">
          <CardHeader className="space-y-6 text-center pb-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-serif text-2xl font-bold">
              </span>
              </div>
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-bold text-gray-900">Create your account</CardTitle>
              <CardDescription className="text-gray-600 text-base">
                Join Circl to manage your relationships
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-8">
            <form onSubmit={handleSignUp} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                <Input id="name" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} disabled={isLoading} required className="h-12 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 rounded-full" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} required className="h-12 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 rounded-full" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} required className="h-12 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 rounded-full" />
              </div>
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Confirm Password</Label>
                <Input id="confirmPassword" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} disabled={isLoading} required className="h-12 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 rounded-full" />
              </div>
              
              <div className="flex items-start space-x-3 pt-2">
                <Checkbox 
                  id="terms" 
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  disabled={isLoading}
                />
                <label htmlFor="terms" className="text-sm leading-relaxed text-gray-700 select-none cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" className="text-gray-900 hover:underline font-semibold">
                    Terms and Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-gray-900 hover:underline font-semibold">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              
              <Button type="submit" disabled={isLoading || !acceptTerms} className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white transition-all duration-200 shadow-lg hover:shadow-xl font-semibold rounded-full">
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground font-medium">
                  or continue with
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button type="button" variant="outline" onClick={handleGoogleSignIn} disabled={isLoading} className="unified-button w-full h-12 border-border hover:bg-accent font-semibold transition-all duration-200 rounded-full">
                <svg viewBox="0 0 24 24" className="h-5 w-5 mr-3" aria-hidden="true">
                  <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25529 2.69 1.28528 6.60998L5.27026 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                  <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                  <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.28 6.60986C0.47 8.22986 0 10.0599 0 11.9999C0 13.9399 0.47 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                  <path d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.2154 17.135 5.2704 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z" fill="#34A853" />
                </svg>
                Sign up with Google
              </Button>

              <Button type="button" variant="outline" onClick={handleLinkedInSignIn} disabled={isLoading} className="unified-button w-full h-12 border-border hover:bg-accent font-semibold transition-all duration-200 rounded-full">
                <svg viewBox="0 0 24 24" className="h-5 w-5 mr-3" fill="#0077B5">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                Sign up with LinkedIn
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-4 pb-8">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/signin" className="text-gray-900 hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>;
}
