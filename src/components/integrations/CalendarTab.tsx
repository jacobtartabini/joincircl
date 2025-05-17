
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { googleService } from "@/services/googleService";
import { calendarService } from "@/services/calendarService";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGoogleIntegrations } from "@/hooks/useGoogleIntegrations";

interface CalendarTabProps {
  onOpenCalendarDialog: () => void;
}

const CalendarTab: React.FC<CalendarTabProps> = ({ onOpenCalendarDialog }) => {
  const { toast } = useToast();
  const { 
    isCalendarConnected, 
    isLoading, 
    isSyncing, 
    error,
    connectCalendar, 
    syncCalendar, 
    disconnectCalendar,
    refreshIntegrationStatus 
  } = useGoogleIntegrations();
  
  // Check if we need to refresh the status based on URL parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const provider = params.get('provider');
    if (provider === 'calendar') {
      refreshIntegrationStatus();
    }
  }, [refreshIntegrationStatus]);

  return (
    <div className="space-y-6">
      {/* Error display */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Google Calendar Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" 
            alt="Google Calendar" 
            className="h-6 w-6"
          />
          <div>
            <CardTitle>Google Calendar</CardTitle>
            <CardDescription>
              Sync your Google Calendar events with your contacts
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
                  {isCalendarConnected 
                    ? "Your Google Calendar is connected" 
                    : "Connect your Google Calendar to sync events"}
                </p>
                {isCalendarConnected && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Connected
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-3">
                {isCalendarConnected ? (
                  <>
                    <Button 
                      onClick={syncCalendar} 
                      variant="default"
                      disabled={isSyncing}
                    >
                      <RefreshCw className={`mr-1.5 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
                      Sync Events
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={disconnectCalendar}
                    >
                      Disconnect
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={connectCalendar}
                    disabled={isSyncing}
                  >
                    Connect Google Calendar
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Apple Calendar Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <svg className="w-6 h-6 text-gray-800" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.5 8.25h-15v9.75c0 .414.336.75.75.75h13.5c.414 0 .75-.336.75-.75v-9.75z" />
            <path d="M8.25 3.75h7.5a.75.75 0 0 1 .75.75v2.25h-9V4.5a.75.75 0 0 1 .75-.75z" />
            <path d="M12 12.75a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75z" />
            <path d="M14.25 12.75a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75z" />
            <path d="M9.75 12.75a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75z" />
          </svg>
          <div>
            <CardTitle>Apple Calendar</CardTitle>
            <CardDescription>
              Export events to Apple Calendar
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Export your events to Apple Calendar. This allows you to view your events in your Apple Calendar app.
          </p>
          <Button
            onClick={() => {
              toast({
                title: "Calendar Export",
                description: "You'll be able to export events to Apple Calendar individually.",
              });
            }}
          >
            Export to Apple Calendar
          </Button>
        </CardContent>
      </Card>
      
      {/* Outlook Calendar Integration */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg" 
            alt="Outlook" 
            className="h-6 w-6"
          />
          <div>
            <CardTitle>Outlook Calendar</CardTitle>
            <CardDescription>
              Export events to Outlook Calendar
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Export your events to Outlook Calendar. This allows you to view your events in your Outlook Calendar app.
          </p>
          <Button
            onClick={() => {
              toast({
                title: "Calendar Export",
                description: "You'll be able to export events to Outlook Calendar individually.",
              });
            }}
          >
            Export to Outlook Calendar
          </Button>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>About Calendar Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              Calendar integration helps you keep track of your interactions with contacts:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Automatically add calendar events with contacts to their timelines</li>
              <li>See upcoming meetings with contacts</li>
              <li>Keep track of past meetings</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarTab;
