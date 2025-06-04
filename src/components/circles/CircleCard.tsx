
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

  // Determine circle type badge with improved styling
  const getCircleBadge = () => {
    switch (contact.circle) {
      case "inner":
        return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs py-0.5 px-2 font-medium">Inner</Badge>;
      case "middle":
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs py-0.5 px-2 font-medium">Middle</Badge>;
      case "outer":
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-0.5 px-2 font-medium">Outer</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 border-0 shadow-sm hover:shadow-md hover:-translate-y-0.5", 
        isSelected 
          ? "ring-2 ring-blue-500 shadow-md bg-blue-50/50" 
          : "hover:shadow-lg bg-white"
      )} 
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 flex-shrink-0 border-2 border-white shadow-sm">
            <AvatarImage src={contact.avatar_url || ''} alt={contact.name} />
            <AvatarFallback className="text-sm font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {getInitials(contact.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate text-base mb-1">
                  {contact.name}
                </h3>
                {(contact.job_title || contact.company_name) && (
                  <p className="text-sm text-gray-600 truncate">
                    {contact.job_title ? `${contact.job_title}${contact.company_name ? ` at ${contact.company_name}` : ''}` : contact.company_name}
                  </p>
                )}
              </div>
              <div className="ml-3 flex-shrink-0">
                {getCircleBadge()}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
              {contact.personal_email && (
                <div className="flex items-center gap-1.5 min-w-0">
                  <Mail className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                  <span className="truncate max-w-[120px]">{contact.personal_email}</span>
                </div>
              )}
              
              {contact.mobile_phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                  <span className="truncate">{contact.mobile_phone}</span>
                </div>
              )}
              
              {contact.last_contact && (
                <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-medium">{formatDate(contact.last_contact)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
