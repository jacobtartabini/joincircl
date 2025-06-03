import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { use2FA } from "@/hooks/use2FA";
import { Shield, ArrowLeft, AlertCircle, Link2 } from "lucide-react";
import MagicLinkSignIn from "@/components/auth/MagicLinkSignIn";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [requires2FA, setRequires2FA] = useState(false);
  const [showBackupCodeInput, setShowBackupCodeInput] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [showMagicLink, setShowMagicLink] = useState(false);
  const {
    signIn,
    signInWithGoogle,
    user
  } = useAuth();
  const {
    verifyLogin2FA
  } = use2FA();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsCheckingAuth(false);
    };
    checkAuthStatus();
  }, []);

  // Redirect if user is already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  if (isCheckingAuth) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication status...</p>
        </div>
      </div>;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!email || !password) {
      setAuthError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Starting sign in process for:', email);

      // If 2FA is required and we have a TOTP code, try 2FA verification
      if (requires2FA && totpCode) {
        console.log('Attempting 2FA verification...');
        const result = await verifyLogin2FA(email, password, totpCode);
        console.log('2FA verification successful');
        
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        
        navigate("/");
        return;
      }

      // Otherwise, try regular sign-in first
      console.log('Attempting regular sign in...');
      const { error: signInError } = await signIn(email, password);
      
      if (signInError) {
        console.error('Sign in error:', signInError);
        
        // Check if this is a 2FA required error
        if (signInError.message && signInError.message.includes('2FA')) {
          console.log('2FA required for this account');
          setRequires2FA(true);
          setAuthError("This account has 2FA enabled. Please enter your verification code.");
          setIsLoading(false);
          return;
        }
        
        // Try 2FA verification as fallback for accounts that might have 2FA
        try {
          console.log('Trying 2FA verification as fallback...');
          const result = await verifyLogin2FA(email, password, '000000');
          
          if (result.requires2FA) {
            console.log('Account requires 2FA');
            setRequires2FA(true);
            setAuthError("This account has 2FA enabled. Please enter your verification code.");
            setIsLoading(false);
            return;
          }
        } catch (twoFAError) {
          console.log('2FA verification failed, showing original error');
          // Show the original sign-in error
          setAuthError(getErrorMessage(signInError));
          setIsLoading(false);
          return;
        }
        
        setAuthError(getErrorMessage(signInError));
      } else {
        console.log('Regular sign in successful');
        
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
        
        navigate("/");
      }
    } catch (error: any) {
      console.error("Unexpected error during sign in:", error);
      setAuthError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackupCodeSignIn = async () => {
    if (!backupCode) {
      setAuthError("Please enter your backup code");
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
      await verifyLogin2FA(email, password, backupCode, true);
      
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Error signing in with backup code:", error);
      setAuthError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      console.log('Starting Google sign in...');
      await signInWithGoogle();
      // The redirect will happen automatically, no need to navigate manually
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      setAuthError(getErrorMessage(error));
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error_description) return error.error_description;
    if (error?.msg) return error.msg;
    return 'An unexpected error occurred. Please try again.';
  };

  const resetForm = () => {
    setRequires2FA(false);
    setTotpCode("");
    setShowBackupCodeInput(false);
    setBackupCode("");
    setAuthError(null);
  };

  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-xl bg-white backdrop-blur-sm">
          <CardHeader className="space-y-6 text-center pb-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shadow-lg rounded-2xl">
                <img alt="Circl" className="w-12 h-12 object-contain" src="/lovable-uploads/b012fafe-a5c2-4486-a208-97fce8761c8e.png" />
              </div>
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl font-bold text-gray-900">
                {requires2FA ? 'Verify Your Identity' : 'Welcome back'}
              </CardTitle>
              <CardDescription className="text-gray-600 text-base">
                {requires2FA ? 'Enter the verification code from your authenticator app' : 'Sign in to your Circl account to continue'}
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8">
            {authError && <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <p className="text-sm text-red-700">{authError}</p>
              </div>}

            {!requires2FA && !showMagicLink && (
              <>
                {/* Regular sign-in form */}
                <form onSubmit={handleSignIn} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                    <Input id="email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} required className="h-12 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 rounded-full" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</Label>
                      <Link to="/forgot" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">
                        Forgot password?
                      </Link>
                    </div>
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} required className="h-12 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 rounded-full" />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl rounded-full">
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      or continue with
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowMagicLink(true)}
                    className="w-full h-12 border-gray-200 hover:bg-gray-50 font-semibold transition-all duration-200 rounded-full"
                  >
                    <Link2 className="h-5 w-5 mr-3" />
                    Sign in with Magic Link
                  </Button>

                  <Button type="button" variant="outline" onClick={handleGoogleSignIn} disabled={isLoading} className="w-full h-12 border-gray-200 hover:bg-gray-50 font-semibold transition-all duration-200 rounded-full">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 mr-3" aria-hidden="true">
                      <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25529 2.69 1.28528 6.60998L5.27026 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                      <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                      <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.28 6.60986C0.47 8.22986 0 10.0599 0 11.9999C0 13.9399 0.47 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                      <path d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.2154 17.135 5.2704 14.29L1.27539 17.385C3.25539 21.31 7.3104 24 12.0004 24Z" fill="#34A853" />
                    </svg>
                    Sign in with Google
                  </Button>
                </div>
              </>
            )}

            {!requires2FA && showMagicLink && (
              <div className="space-y-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowMagicLink(false)} 
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-0 h-auto"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to regular sign in
                </Button>
                <MagicLinkSignIn onSuccess={() => navigate("/")} />
              </div>
            )}

            {requires2FA && (
              <div className="space-y-6">
                {requires2FA && <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Button variant="ghost" size="sm" onClick={resetForm} className="p-0 h-auto text-gray-600 hover:text-gray-900">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                    <span>•</span>
                    <span>Signing in as {email}</span>
                  </div>}

                {!showBackupCodeInput ? (
                  // TOTP code input
                  <div className="space-y-6">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Shield className="h-8 w-8 text-green-600" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Enter 6-digit code from your authenticator app
                        </Label>
                        <div className="flex justify-center">
                          <InputOTP maxLength={6} value={totpCode} onChange={setTotpCode}>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button onClick={handleSignIn} disabled={!totpCode || totpCode.length !== 6 || isLoading} className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold">
                        {isLoading ? "Verifying..." : "Verify & Sign In"}
                      </Button>

                      <Button variant="outline" onClick={() => setShowBackupCodeInput(true)} className="w-full">
                        Use backup code instead
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Backup code input
                  <div className="space-y-6">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <Shield className="h-8 w-8 text-blue-600" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="backupCode" className="text-sm font-medium text-gray-700">
                          Enter your backup code
                        </Label>
                        <Input id="backupCode" type="text" placeholder="Enter backup code" value={backupCode} onChange={e => setBackupCode(e.target.value.toUpperCase())} className="text-center font-mono" maxLength={8} />
                        <p className="text-xs text-gray-500">
                          Backup codes are 8 characters long
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button onClick={handleBackupCodeSignIn} disabled={!backupCode || isLoading} className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold">
                        {isLoading ? "Verifying..." : "Sign In with Backup Code"}
                      </Button>

                      <Button variant="outline" onClick={() => setShowBackupCodeInput(false)} className="w-full">
                        Use authenticator app instead
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          {!requires2FA && (
            <CardFooter className="flex justify-center pt-4 pb-8">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-gray-900 hover:underline font-semibold">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>;
}
