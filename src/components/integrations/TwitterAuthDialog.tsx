
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TwitterAuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TwitterAuthDialog({ isOpen, onOpenChange }: TwitterAuthDialogProps) {
  const { toast } = useToast();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Twitter OAuth credentials
  const CLIENT_ID = "RmNzRlpWUGJ2d05ITXpKdGJlMDY6MTpjaQ";
  const REDIRECT_URI = "https://app.joincircl.com/auth/callback";
  const SCOPES = ["tweet.read", "users.read", "follows.read", "offline.access"];
  
  // Function to generate a random string for PKCE code_verifier
  const generateCodeVerifier = (): string => {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => 
      ('0' + (byte & 0xFF).toString(16)).slice(-2)
    ).join('');
  };
  
  // Function to create code_challenge from code_verifier using SHA-256
  const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    
    // Convert digest to base64url encoding
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  };
  
  const handleTwitterLogin = async () => {
    try {
      setIsAuthenticating(true);
      
      // Generate a random state value for CSRF protection
      const state = Math.random().toString(36).substring(2);
      localStorage.setItem("twitter_auth_state", state);
      
      // Generate code_verifier and code_challenge for PKCE
      const codeVerifier = generateCodeVerifier();
      localStorage.setItem("twitter_code_verifier", codeVerifier);
      
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      
      // Build the authorization URL
      const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
      authUrl.searchParams.append("response_type", "code");
      authUrl.searchParams.append("client_id", CLIENT_ID);
      authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
      authUrl.searchParams.append("scope", SCOPES.join(" "));
      authUrl.searchParams.append("state", state);
      authUrl.searchParams.append("code_challenge", codeChallenge);
      authUrl.searchParams.append("code_challenge_method", "S256");
      
      // Open the OAuth URL in a new window
      window.location.href = authUrl.toString();
    } catch (error) {
      console.error("Error initiating Twitter auth:", error);
      setIsAuthenticating(false);
      toast({
        title: "Authentication Error",
        description: "Failed to initiate Twitter authentication.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5 text-sky-500" />
            Connect to Twitter
          </DialogTitle>
          <DialogDescription>
            Link your Twitter account to import contacts and view tweets.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="bg-sky-50 p-4 rounded-md text-sm text-sky-800">
              <p className="font-medium mb-1">What you're authorizing:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Read your tweets and timeline</li>
                <li>See who you follow and your followers</li>
                <li>Read your public profile information</li>
                <li>Will not post or tweet on your behalf</li>
              </ul>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Your Twitter credentials are securely stored and can be revoked at any time.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="bg-sky-500 hover:bg-sky-600"
            onClick={handleTwitterLogin}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? (
              <>
                <span className="animate-spin mr-2">●</span>
                Connecting...
              </>
            ) : (
              <>
                <Twitter className="h-4 w-4 mr-2" />
                Connect Twitter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
