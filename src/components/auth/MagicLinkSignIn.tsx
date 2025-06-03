
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, CheckCircle, AlertCircle } from "lucide-react";

interface MagicLinkSignInProps {
  onSuccess?: () => void;
}

export default function MagicLinkSignIn({ onSuccess }: MagicLinkSignInProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signInWithMagicLink } = useAuth();
  const { toast } = useToast();

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signInWithMagicLink(email);
      
      if (error) {
        setError(error.message || "Failed to send magic link");
        toast({
          title: "Error",
          description: error.message || "Failed to send magic link",
          variant: "destructive",
        });
      } else {
        setIsEmailSent(true);
        toast({
          title: "Magic link sent!",
          description: "Check your email for a sign-in link",
        });
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error("Magic link error:", error);
      setError(error.message || "An unexpected error occurred");
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
          <p className="text-sm text-gray-600">
            We've sent a magic link to <strong>{email}</strong>
          </p>
          <p className="text-xs text-gray-500">
            Click the link in your email to sign in. The link will expire in 24 hours.
          </p>
        </div>

        <Button 
          variant="outline" 
          onClick={() => {
            setIsEmailSent(false);
            setEmail("");
          }}
          className="w-full"
        >
          Try a different email
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sign in with Magic Link</h3>
          <p className="text-sm text-gray-600">
            Enter your email and we'll send you a secure sign-in link
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="magic-email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <Input
            id="magic-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            className="h-12 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200 rounded-full"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email}
          className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl rounded-full"
        >
          {isLoading ? "Sending magic link..." : "Send Magic Link"}
        </Button>
      </form>
    </div>
  );
}
