
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Twitter, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TwitterAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TwitterAuthDialog: React.FC<TwitterAuthDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleTwitterConnect = async () => {
    try {
      setIsConnecting(true);

      // Generate PKCE challenge for security
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateRandomString();

      // Store PKCE verifier and state for later verification
      localStorage.setItem('twitter_code_verifier', codeVerifier);
      localStorage.setItem('twitter_auth_state', state);

      // Twitter OAuth 2.0 configuration
      const clientId = 'RmNzRlpWUGJ2d05ITXpKdGJlMDY6MTpjaQ';
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`);
      const scope = encodeURIComponent('tweet.read users.read offline.access');

      // Build Twitter OAuth URL
      const twitterAuthUrl = `https://twitter.com/i/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scope}&` +
        `state=${state}&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256`;

      console.log('Opening Twitter auth URL:', twitterAuthUrl);

      // Open Twitter authorization in the same window
      window.location.href = twitterAuthUrl;

    } catch (error) {
      console.error('Error initiating Twitter OAuth:', error);
      setIsConnecting(false);
      toast({
        title: "Connection Error",
        description: "Failed to initiate Twitter authentication",
        variant: "destructive",
      });
    }
  };

  // Generate PKCE code verifier
  const generateCodeVerifier = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  // Generate PKCE code challenge
  const generateCodeChallenge = async (verifier: string): Promise<string> => {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  // Generate random state parameter
  const generateRandomString = (): string => {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <Twitter className="h-5 w-5 text-sky-600" />
            </div>
            <DialogTitle>Connect Twitter Account</DialogTitle>
          </div>
          <DialogDescription>
            Connect your Twitter account to enable social features and import your connections.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What you'll get:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Import your Twitter connections as contacts</li>
              <li>• Track social interactions with your network</li>
              <li>• View recent activity from your connections</li>
              <li>• Enhanced contact profiles with social data</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleTwitterConnect}
              disabled={isConnecting}
              className="w-full"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Authorize with Twitter
                </>
              )}
            </Button>

            <Button variant="outline" onClick={onClose} disabled={isConnecting}>
              Cancel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              By connecting your Twitter account, you agree to Twitter's terms of service.
              We only access public information and connections you've made available.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
