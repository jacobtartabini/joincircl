
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RelationshipMap from "@/components/visualizations/RelationshipMap";
import { Contact } from "@/types/contact";
import { useRelatedContacts } from "@/hooks/useRelatedContacts";

interface ContactVisualizationsSectionProps {
  contact: Contact;
}

export default function ContactVisualizationsSection({ contact }: ContactVisualizationsSectionProps) {
  const { relatedContacts } = useRelatedContacts(contact.id, 5);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Relationship Map</CardTitle>
      </CardHeader>
      <CardContent>
        <RelationshipMap contact={contact} relatedContacts={relatedContacts} />
        <div className="text-xs text-center text-muted-foreground mt-4">
          This visualization shows {contact.name}'s position in your network relative to other contacts.
        </div>
      </CardContent>
    </Card>
  );
}
