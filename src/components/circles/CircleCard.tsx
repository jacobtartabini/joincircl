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
export function CircleCard({
  contact,
  onClick,
  isSelected
}: CircleCardProps) {
  // Get the initials of the contact for the avatar fallback
  const getInitials = (name: string) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase().slice(0, 2);
  };

  // Format the last interaction date
  const formatDate = (date: string | undefined) => {
    if (!date) return "No recent interaction";
    const interactionDate = new Date(date);
    return format(interactionDate, 'MMM d');
  };

  // Determine circle type badge
  const getCircleBadge = () => {
    switch (contact.circle) {
      case "inner":
        return <Badge className="bg-rose-500 text-xs py-0 px-1">Inner</Badge>;
      case "middle":
        return <Badge className="bg-amber-500 text-xs py-0 px-1">Middle</Badge>;
      case "outer":
        return <Badge className="bg-blue-500 text-xs py-0 px-1">Outer</Badge>;
      default:
        return null;
    }
  };
  return <Card className={cn("cursor-pointer transition-all duration-200 hover:shadow-md contact-card border-0 shadow-sm", isSelected ? "ring-2 ring-primary shadow-md" : "hover:shadow-lg")} onClick={onClick}>
      <CardContent className="p-3 rounded-2xl">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={contact.avatar_url || ''} alt={contact.name} />
            <AvatarFallback className="text-xs font-medium">{getInitials(contact.name)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium text-sm truncate pr-2">{contact.name}</h3>
              {getCircleBadge()}
            </div>
            
            {(contact.job_title || contact.company_name) && <p className="text-xs text-muted-foreground truncate mb-2">
                {contact.job_title ? `${contact.job_title}${contact.company_name ? ` at ${contact.company_name}` : ''}` : contact.company_name}
              </p>}
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {contact.personal_email && <div className="flex items-center gap-1 min-w-0">
                  <Mail className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate max-w-[100px]">{contact.personal_email}</span>
                </div>}
              
              {contact.mobile_phone && <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{contact.mobile_phone}</span>
                </div>}
              
              {contact.last_contact && <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(contact.last_contact)}</span>
                </div>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}