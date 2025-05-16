
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EmailConnectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  provider: "gmail" | "outlook";
  onSuccess?: () => void;
}

export function EmailConnectionDialog({
  isOpen,
  onOpenChange,
  provider,
  onSuccess
}: EmailConnectionDialogProps) {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const providerName = provider === "gmail" ? "Gmail" : "Microsoft Outlook";
  const providerLogo = provider === "gmail" 
    ? "https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg"
    : "https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg";
  
  const handleConnect = async () => {
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter both email and password to connect.",
        variant: "destructive",
      });
      return;
    }
    
    setIsConnecting(true);
    
    // In a real app, this would use OAuth2 flow instead of collecting credentials directly
    try {
      // For demo purposes, we'll simulate a successful connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, we'd store tokens securely in the database
      const { data: userSession } = await supabase.auth.getSession();
      
      if (userSession?.session) {
        // Example: store token info (in a real app this would be OAuth tokens)
        await supabase.from('user_email_tokens').upsert({
          user_id: userSession.session.user.id,
          provider: provider,
          access_token: "demo-token",
          refresh_token: "demo-refresh-token",
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        });
      }
      
      toast({
        title: "Connected successfully",
        description: `Your ${providerName} account is now connected with Circl.`,
      });
      
      // Initialize sync process
      toast({
        title: "Syncing contacts",
        description: `We're importing your contacts from ${providerName}. This may take a few minutes.`,
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
      
      // In a real app, we'd trigger a background sync process here
    } catch (error) {
      console.error(`Error connecting to ${providerName}:`, error);
      toast({
        title: "Connection failed",
        description: `We couldn't connect to your ${providerName} account. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
      setEmail("");
      setPassword("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <img src={providerLogo} alt={providerName} className="h-6 w-6" />
            <DialogTitle>Connect {providerName}</DialogTitle>
          </div>
          <DialogDescription>
            Connect your {providerName} account to import contacts and sync interactions.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            This will allow Circl to:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Access your contacts</li>
            <li>View your email history to update contact interactions</li>
            <li>View your calendar events</li>
            <li>Add contact information to your Circl profile</li>
          </ul>
          
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isConnecting}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isConnecting}
            />
            <p className="text-xs text-muted-foreground">
              Note: In a production app, we would use OAuth instead of directly collecting credentials.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isConnecting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Connect
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
