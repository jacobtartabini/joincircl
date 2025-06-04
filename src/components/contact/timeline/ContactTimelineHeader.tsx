import { Check, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  return <div className="py-4 px-6 flex justify-between items-center border-b">
      <div>
        <h1 className="text-xl font-semibold">{contact.name}'s Timeline</h1>
        <p className="text-sm text-muted-foreground">
          {totalEvents} events • {interactionCount} interactions • {keystoneCount} keystones
        </p>
      </div>
      <div className="flex items-center gap-2">
        
        
      </div>
    </div>;
}