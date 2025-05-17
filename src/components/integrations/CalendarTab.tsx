
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface CalendarTabProps {
  onOpenCalendarDialog: () => void;
}

const CalendarTab: React.FC<CalendarTabProps> = ({ onOpenCalendarDialog }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <div>
          <CardTitle>Calendar Integration</CardTitle>
          <CardDescription>
            Connect your calendar to sync events and interactions
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">
          Connect your calendar to keep track of your connections and important events.
        </p>
        <Button onClick={onOpenCalendarDialog}>
          Connect Calendar
        </Button>
      </CardContent>
    </Card>
  );
};

export default CalendarTab;
