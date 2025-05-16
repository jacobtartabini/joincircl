
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RelationshipMap from "@/components/visualizations/RelationshipMap";
import ContactTimeline from "@/components/visualizations/ContactTimeline";
import { Contact, Interaction } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { useRelatedContacts } from "@/hooks/useRelatedContacts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmailInteractions } from "@/hooks/useEmailInteractions";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

interface ContactVisualizationsSectionProps {
  contact: Contact;
  interactions: Interaction[];
  keystones: Keystone[];
}

export default function ContactVisualizationsSection({ 
  contact,
  interactions,
  keystones 
}: ContactVisualizationsSectionProps) {
  const { relatedContacts } = useRelatedContacts(contact.id, 5);
  const { emailInteractions } = useEmailInteractions(contact.id);
  const { calendarEvents } = useCalendarEvents(contact.id);
  const [activeTab, setActiveTab] = useState("relationship");
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Contact Insights</CardTitle>
            <TabsList>
              <TabsTrigger value="relationship">Relationship Map</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
          </div>
          
          {/* The TabsContent components must be inside the Tabs component, not inside the CardContent which is outside of Tabs */}
          <TabsContent value="relationship" className="mt-0">
            <RelationshipMap contact={contact} relatedContacts={relatedContacts} />
            <div className="text-xs text-center text-muted-foreground mt-4">
              This visualization shows {contact.name}'s position in your network relative to other contacts.
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-0">
            <ContactTimeline 
              contact={contact}
              keystones={keystones}
              interactions={interactions}
              emails={emailInteractions}
              calendarEvents={calendarEvents}
            />
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  );
}
