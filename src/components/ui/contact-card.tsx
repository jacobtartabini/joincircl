
import { Contact } from "@/types/contact";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Verified } from "lucide-react";

interface ContactCardProps {
  contact: Contact;
  onAddNote: () => void;
  onViewInsights: () => void;
  onMarkComplete: () => void;
}

export const ContactCard = ({
  contact,
  onAddNote,
  onViewInsights,
  onMarkComplete,
}: ContactCardProps) => {
  return (
    <Card className="card-hover">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={contact.avatar_url || ''} alt={contact.name} />
              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{contact.name}</h3>
              {contact.job_title && (
                <p className="text-sm text-muted-foreground">{contact.job_title}</p>
              )}
            </div>
          </div>
          {contact.circle === "inner" && (
            <Verified className="text-blue-500" size={20} />
          )}
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onAddNote}
            className="w-full text-sm whitespace-nowrap"
          >
            Log Interaction
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewInsights}
            className="w-full text-sm whitespace-nowrap"
          >
            View Insights
          </Button>
          <Button 
            size="sm" 
            onClick={onMarkComplete}
            className="w-full text-sm whitespace-nowrap"
          >
            View Contact
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
