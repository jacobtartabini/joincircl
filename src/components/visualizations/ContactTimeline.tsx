
import React from "react";
import { Contact, Interaction } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { EmailInteraction } from "@/hooks/useEmailInteractions";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
}

interface ContactTimelineProps {
  contact: Contact;
  keystones: Keystone[];
  interactions: Interaction[];
  emails: EmailInteraction[];
  calendarEvents: CalendarEvent[];
}

const ContactTimeline: React.FC<ContactTimelineProps> = ({
  contact,
  keystones,
  interactions,
  emails,
  calendarEvents
}) => {
  // This component would implement a timeline visualization
  // For now, we'll return a simple message
  return (
    <div className="p-4 text-center text-muted-foreground">
      <p>Timeline visualization will be displayed here.</p>
      <p className="text-xs mt-2">
        Showing {interactions.length} interactions, {keystones.length} keystones,{" "}
        {emails.length} emails, and {calendarEvents.length} calendar events.
      </p>
    </div>
  );
};

export default ContactTimeline;
