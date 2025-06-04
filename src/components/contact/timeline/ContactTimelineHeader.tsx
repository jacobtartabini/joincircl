
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
    <div className="pb-8 border-b border-gray-100">
      <div className="space-y-2">
        <h1 className="text-2xl font-light text-gray-900">
          {contact.name}'s Timeline
        </h1>
        <p className="text-sm text-gray-500">
          {totalEvents} events • {interactionCount} interactions • {keystoneCount} keystones
        </p>
      </div>
    </div>
  );
}
