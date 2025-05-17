
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  
  const handleTwitterLogin = () => {
    setIsAuthenticating(true);
    
    // Generate a random state value for CSRF protection
    const state = Math.random().toString(36).substring(2);
    localStorage.setItem("twitter_auth_state", state);
    
    // Build the authorization URL
    const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("client_id", CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
    authUrl.searchParams.append("scope", SCOPES.join(" "));
    authUrl.searchParams.append("state", state);
    authUrl.searchParams.append("code_challenge", "challenge"); // Would be generated in a real app
    authUrl.searchParams.append("code_challenge_method", "S256");
    
    // In a real app, we would open a popup or redirect to this URL
    console.log("Twitter OAuth URL:", authUrl.toString());
    
    // For demo purposes, simulate a successful auth after a short delay
    setTimeout(() => {
      setIsAuthenticating(false);
      onOpenChange(false);
      
      // Simulate a successful connection
      toast({
        title: "Twitter Connected",
        description: "Successfully connected to Twitter as @circl_user",
      });
    }, 2000);
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
