
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Plus, MapPin } from "lucide-react";

export default function CareerEventMode() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Career Events</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track networking events and new connections
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Log New Event
        </Button>
      </div>

      {/* Coming Soon Placeholder */}
      <Card className="p-12 text-center glass-card">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Career Event Tracking Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Quickly log contacts met at career fairs, networking events, and company visits
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant="outline" size="sm">
            <MapPin className="h-3 w-3 mr-1" />
            Quick Add Contact
          </Button>
          <Button variant="outline" size="sm">
            <Users className="h-3 w-3 mr-1" />
            Event Summary
          </Button>
        </div>
      </Card>
    </div>
  );
}
