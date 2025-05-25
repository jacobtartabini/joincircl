
import { useState } from "react";
import { useSignUp, useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, Navigate, useNavigate } from "react-router-dom";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const { signUp, setActive } = useSignUp();
  const { isSignedIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // If user is already signed in, redirect to the home page
  if (isSignedIn) {
    return <Navigate to="/home" replace />;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    if (!signUp) {
      toast({
        title: "Sign up unavailable",
        description: "Please try again later",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const [firstName, ...lastNameParts] = fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ') || '';

      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      // Send email verification
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
      
      toast({
        title: "Verification email sent",
        description: "Please check your email for a verification code",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({
        title: "Sign up failed",
        description: error?.errors?.[0]?.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast({
        title: "Missing verification code",
        description: "Please enter the verification code from your email",
        variant: "destructive",
      });
      return;
    }

    if (!signUp) return;

    setIsLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/home");
      } else {
        console.log("Verification incomplete:", result);
        toast({
          title: "Verification incomplete",
          description: "Please try again or request a new code",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error verifying email:", error);
      toast({
        title: "Verification failed",
        description: error?.errors?.[0]?.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!signUp) return;
    
    setIsLoading(true);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/home",
      });
    } catch (error: any) {
      console.error("Error signing up with Google:", error);
      toast({
        title: "Google sign up failed",
        description: error?.errors?.[0]?.message || "Failed to sign up with Google",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
            <CardDescription>
              We've sent a verification code to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerification} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Verifying..." : "Verify Email"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setPendingVerification(false)}
              >
                ← Back to sign up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12">
              <img 
                src="/lovable-uploads/12af9685-d6d3-4f9d-87cf-0aa29d9c78f8.png" 
                alt="Circl" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Sign up for Circl to manage your relationships
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">
                or continue with
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignUp}
            disabled={isLoading}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true">
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
            Sign up with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
