
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEmailProviders } from "@/hooks/useEmailProviders";

interface EmailIntegrationsTabProps {
  onOpenGmailDialog: () => void;
  onOpenOutlookDialog: () => void;
}

const EmailIntegrationsTab: React.FC<EmailIntegrationsTabProps> = ({ 
  onOpenGmailDialog, 
  onOpenOutlookDialog 
}) => {
  const { isGmailConnected, isOutlookConnected } = useEmailProviders();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Providers</CardTitle>
        <CardDescription>
          Connect your email providers to sync contacts and interactions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-500 font-bold">G</span>
            </div>
            <div>
              <h3 className="font-medium">Gmail</h3>
              <p className="text-sm text-muted-foreground">
                {isGmailConnected ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <Button onClick={onOpenGmailDialog}>
            {isGmailConnected ? "Reconfigure" : "Connect"}
          </Button>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-500 font-bold">O</span>
            </div>
            <div>
              <h3 className="font-medium">Outlook</h3>
              <p className="text-sm text-muted-foreground">
                {isOutlookConnected ? "Connected" : "Not connected"}
              </p>
            </div>
          </div>
          <Button onClick={onOpenOutlookDialog}>
            {isOutlookConnected ? "Reconfigure" : "Connect"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailIntegrationsTab;
