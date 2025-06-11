import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
interface EmailIntegrationSectionProps {
  onConnectGmail: () => void;
  onConnectOutlook: () => void;
  isGmailConnected: boolean;
  isOutlookConnected: boolean;
}
const EmailIntegrationSection = ({
  onConnectGmail,
  onConnectOutlook,
  isGmailConnected,
  isOutlookConnected
}: EmailIntegrationSectionProps) => {
  const {
    toast
  } = useToast();
  return <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Mail className="h-5 w-5 text-primary" />
        <div>
          <CardTitle>Email Integration</CardTitle>
          <CardDescription>
            Connect your email accounts to sync contacts and interactions
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" alt="Gmail logo" className="h-5 w-5" />
              <h4 className="font-medium">Gmail</h4>
              {isGmailConnected && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>}
            </div>
            <Button variant={isGmailConnected ? "outline" : "default"} size="sm" onClick={onConnectGmail} className="rounded-full bg-[#30a2ed]">
              {isGmailConnected ? "Reconnect" : "Connect Gmail"}
            </Button>
          </div>
          {isGmailConnected && <p className="mt-2 text-sm text-muted-foreground">
              Your Gmail contacts and interactions are being synced with Circl.
            </p>}
        </div>
        
        <div className="border p-4 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" alt="Outlook logo" className="h-5 w-5" />
              <h4 className="font-medium">Microsoft Outlook</h4>
              {isOutlookConnected && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Connected
                </Badge>}
            </div>
            <Button variant={isOutlookConnected ? "outline" : "default"} size="sm" onClick={onConnectOutlook} className="rounded-full">
              {isOutlookConnected ? "Reconnect" : "Connect Outlook"}
            </Button>
          </div>
          {isOutlookConnected && <p className="mt-2 text-sm text-muted-foreground">
              Your Outlook contacts and interactions are being synced with Circl.
            </p>}
        </div>
        
        <div className="mt-4 text-sm">
          <p>Connecting your email accounts will:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Import and update your contacts automatically</li>
            <li>Add email exchanges to contact timelines</li>
            <li>Include calendar events in contact histories</li>
            <li>Keep your network information up to date</li>
          </ul>
        </div>
      </CardContent>
    </Card>;
};
export default EmailIntegrationSection;