
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { RateLimiter } from "@/services/security/rateLimiter";
import { SecurityUtils } from "@/services/security";

export function EnhancedSignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null);

  const { signIn } = useSecureAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Check rate limiting before attempt
    const rateLimitStatus = RateLimiter.isAllowed(email.toLowerCase(), 'auth');
    if (!rateLimitStatus.allowed) {
      setError(`Too many failed attempts. Please try again in ${rateLimitStatus.retryAfter} seconds.`);
      setRateLimitInfo(rateLimitStatus);
      setLoading(false);
      return;
    }

    try {
      // Validate input
      if (!email || !password) {
        throw new Error('Please fill in all fields');
      }

      if (!SecurityUtils.isSecureContext()) {
        setError('Please use HTTPS for secure authentication');
        setLoading(false);
        return;
      }

      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      
      // Update rate limit info after failed attempt
      const newStatus = RateLimiter.getStatus(email.toLowerCase(), 'auth');
      setRateLimitInfo(newStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Security indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="h-4 w-4" />
        <span>Secure authentication with rate limiting</span>
      </div>

      {/* Rate limiting warning */}
      {rateLimitInfo && rateLimitInfo.attempts > 2 && (
        <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {rateLimitInfo.attempts} failed attempts detected. 
            {rateLimitInfo.maxAttempts - rateLimitInfo.attempts} attempts remaining.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
          className="unified-input"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            className="unified-input pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full unified-button"
        disabled={loading || (rateLimitInfo?.blockedUntil && Date.now() < rateLimitInfo.blockedUntil)}
      >
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
