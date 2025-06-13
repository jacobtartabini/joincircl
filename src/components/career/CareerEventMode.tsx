import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, MapPin, Users, Edit, Trash2 } from "lucide-react";
interface CareerEvent {
  id: string;
  event_name: string;
  event_type: string;
  event_date: string;
  location?: string;
  contacts_met: number;
  notes?: string;
}
export default function CareerEventMode() {
  const [events, setEvents] = useState<CareerEvent[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const getEventTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'career fair':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'networking':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'conference':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'workshop':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Career Events</h3>
        <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-2 glass-button rounded-full">
          <Plus className="h-4 w-4" />
          Add Event
        </Button>
      </div>

      {events.length === 0 ? <Card className="p-8 text-center glass-card rounded-2xl">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium text-foreground mb-2">No Career Events Yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Track networking events, career fairs, and professional conferences
          </p>
          <Button onClick={() => setShowAddDialog(true)} className="glass-button rounded-full">
            Add Your First Event
          </Button>
        </Card> : <div className="grid grid-cols-1 gap-3">
          {events.map(event => <Card key={event.id} className="p-4 glass-card hover:glass-card-enhanced transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{event.event_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getEventTypeColor(event.event_type)}>
                          {event.event_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(event.event_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    {event.location && <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location}</span>
                      </div>}
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{event.contacts_met} contacts met</span>
                    </div>
                  </div>

                  {event.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {event.notes}
                    </p>}
                </div>

                <div className="flex items-center gap-1 ml-4">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>)}
        </div>}
    </div>;
}