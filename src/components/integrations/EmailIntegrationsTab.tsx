
import React, { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useGoogleIntegrations } from "@/hooks/useGoogleIntegrations";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "react-router-dom";

interface EmailIntegrationsTabProps {
  onOpenGmailDialog: () => void;
  onOpenOutlookDialog: () => void;
}

const EmailIntegrationsTab: React.FC<EmailIntegrationsTabProps> = ({ 
  onOpenGmailDialog, 
  onOpenOutlookDialog 
}) => {
  const { 
    isGmailConnected, 
    isLoading, 
    isSyncing,
    connectGmail,
    syncGmail,
    disconnectGmail,
    refreshIntegrationStatus
  } = useGoogleIntegrations();
  
  const [searchParams] = useSearchParams();

  // Check if we need to refresh the status
  useEffect(() => {
    const provider = searchParams.get('provider');
    if (provider === 'gmail') {
      refreshIntegrationStatus();
    }
  }, [searchParams, refreshIntegrationStatus]);

  return (
    <div className="space-y-6">
      {/* Gmail Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" 
            alt="Gmail logo" 
            className="h-6 w-6"
          />
          <div>
            <CardTitle>Gmail Integration</CardTitle>
            <CardDescription>
              Connect your Gmail account to sync contacts and interactions
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-28" />
            </div>
          ) : (
            <>
              <div className="flex items-center">
                <p className="text-sm flex-1">
                  {isGmailConnected 
                    ? "Your Gmail account is connected" 
                    : "Connect your Gmail account to sync emails and contacts"}
                </p>
                {isGmailConnected && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Connected
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                {isGmailConnected ? (
                  <>
                    <Button 
                      onClick={async () => {
                        await syncGmail();
                      }} 
                      variant="default"
                      disabled={isSyncing}
                    >
                      <RefreshCw className={`mr-1.5 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                      Sync Emails
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={disconnectGmail}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button onClick={connectGmail}>
                    Connect Gmail
                  </Button>
                )}
              </div>
              
              {isGmailConnected && (
                <p className="text-xs text-muted-foreground mt-2">
                  Gmail connection only imports contacts from emails and adds email exchanges to contact timelines.
                  Your email content remains private.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Outlook Email Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" 
            alt="Outlook logo" 
            className="h-6 w-6"
          />
          <div>
            <CardTitle>Outlook Integration</CardTitle>
            <CardDescription>
              Connect your Outlook account to sync contacts and interactions
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm">
              Connect your Outlook account to sync emails and contacts
            </p>
          </div>
          <Button onClick={onOpenOutlookDialog}>
            Connect Outlook
          </Button>
          <p className="text-xs text-muted-foreground">
            Coming soon - Outlook integration will be available in a future update
          </p>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Email Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              Email integration helps you keep your contacts organized:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Import and update your contacts automatically from email history</li>
              <li>Add email exchanges to contact timelines</li>
              <li>Track your communication history with each contact</li>
              <li>Keep your network information up to date</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              Your email content remains private. We only use email headers to improve contact organization.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailIntegrationsTab;
