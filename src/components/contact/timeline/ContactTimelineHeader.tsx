
import { Contact } from "@/types/contact";

interface ContactTimelineHeaderProps {
  contact: Contact;
  totalEvents: number;
  interactionCount: number;
  keystoneCount: number;
}

export function ContactTimelineHeader({
  contact,
  totalEvents,
  interactionCount,
  keystoneCount
}: ContactTimelineHeaderProps) {
  return (
    <div className="p-4 border-b border-border bg-card">
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Activity Timeline
          </h2>
          <p className="text-sm text-muted-foreground">
            Recent activity with {contact.name}
          </p>
        </div>
        
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-muted-foreground">{totalEvents} total events</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">{interactionCount} interactions</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="text-muted-foreground">{keystoneCount} keystones</span>
          </div>
        </div>
      </div>
    </div>
  );
}
