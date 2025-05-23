
import { Contact } from "@/types/contact";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, Mail, Phone } from "lucide-react";
import { format } from "date-fns";

interface CircleCardProps {
  contact: Contact;
  onClick: () => void;
  isSelected: boolean;
}

export function CircleCard({ contact, onClick, isSelected }: CircleCardProps) {
  // Get the initials of the contact for the avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Format the last interaction date
  const formatDate = (date: string | undefined) => {
    if (!date) return "No recent interaction";
    const interactionDate = new Date(date);
    return format(interactionDate, 'MMM d, yyyy');
  };
  
  // Determine circle type badge
  const getCircleBadge = () => {
    switch (contact.circle) {
      case "inner":
        return <Badge className="bg-rose-500">Inner</Badge>;
      case "middle": 
        return <Badge className="bg-amber-500">Middle</Badge>;
      case "outer":
        return <Badge className="bg-blue-500">Outer</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-md", 
        isSelected ? "ring-2 ring-primary" : ""
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start">
          <Avatar className="h-12 w-12">
            <AvatarImage src={contact.avatar_url || ''} alt={contact.name} />
            <AvatarFallback>{getInitials(contact.name)}</AvatarFallback>
          </Avatar>
          
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">{contact.name}</h3>
              {getCircleBadge()}
            </div>
            
            <p className="text-sm text-muted-foreground mt-1">
              {contact.job_title ? `${contact.job_title} at ${contact.company_name || ''}` : ''}
            </p>
            
            <div className="flex flex-wrap gap-3 mt-3">
              {contact.personal_email && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Mail className="h-3 w-3 mr-1" />
                  <span>{contact.personal_email}</span>
                </div>
              )}
              
              {contact.mobile_phone && (
                <div className="flex items-center text-xs text-muted-foreground">
                  <Phone className="h-3 w-3 mr-1" />
                  <span>{contact.mobile_phone}</span>
                </div>
              )}
              
              {contact.last_contact && (
                <div className="flex items-center text-xs text-muted-foreground ml-auto">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatDate(contact.last_contact)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
