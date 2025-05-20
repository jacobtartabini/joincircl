
import { Phone, Mail, MapPin, Briefcase, Link as LinkIcon, Calendar, MessageSquare } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Contact, Interaction } from "@/types/contact";
import { formatDistanceToNow } from "date-fns";

interface EnhancedContactDetailProps {
  contact: Contact;
  interactions?: Interaction[];
}

export function EnhancedContactDetail({ contact, interactions = [] }: EnhancedContactDetailProps) {
  const getCircleColor = (circle: string) => {
    switch (circle) {
      case "inner": return "bg-rose-500";
      case "middle": return "bg-amber-500";
      case "outer": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getInteractionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "meeting": return <Calendar className="h-4 w-4 text-blue-500" />;
      case "email": return <Mail className="h-4 w-4 text-green-500" />;
      case "phone": return <Phone className="h-4 w-4 text-amber-500" />;
      case "note": return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-6 bg-white">
      {/* Profile Header */}
      <div className="p-6 flex flex-col items-center border-b">
        <Avatar className="h-24 w-24 mb-4">
          {contact.avatar_url ? (
            <AvatarImage src={contact.avatar_url} alt={contact.name} />
          ) : (
            <AvatarFallback className="text-3xl">
              {contact.name.charAt(0)}
            </AvatarFallback>
          )}
        </Avatar>
        
        <h2 className="text-xl font-semibold">{contact.name}</h2>
        
        {contact.location && (
          <p className="text-sm text-muted-foreground mt-1">
            {contact.location}
          </p>
        )}
        
        <div className="flex gap-2 mt-3">
          <Badge variant="outline" className="rounded-full">
            {contact.circle.charAt(0).toUpperCase() + contact.circle.slice(1)} Circle
          </Badge>
          
          {contact.tags && contact.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-full">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Timeline Section */}
      <div className="p-6 border-b">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">Timeline</h3>
        
        {interactions && interactions.length > 0 ? (
          <div className="space-y-4">
            {interactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((interaction) => (
                <div key={interaction.id} className="flex gap-3">
                  <div className="flex-shrink-0 pt-0.5">
                    {getInteractionIcon(interaction.type)}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{interaction.type}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(interaction.date), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{interaction.notes || "No notes"}</p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent interactions.</p>
        )}
      </div>
      
      {/* Sources Section */}
      <div className="p-6 border-b">
        <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">Sources</h3>
        
        <p className="text-sm mb-4">
          You've met {contact.name} {interactions.filter(i => i.type === "meeting").length} times, 
          exchanged {interactions.filter(i => i.type === "email").length} emails
          {contact.twitter && ", and follow each other on Twitter"}.
        </p>
        
        {/* Contact Details */}
        <div className="space-y-3">
          {contact.personal_email && (
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-1.5 rounded-full">
                <Mail className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm">{contact.personal_email}</span>
            </div>
          )}
          
          {contact.twitter && (
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-1.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </div>
              <span className="text-sm">@{contact.twitter}</span>
            </div>
          )}
          
          {contact.mobile_phone && (
            <div className="flex items-center gap-3">
              <div className="bg-gray-100 p-1.5 rounded-full">
                <Phone className="h-4 w-4 text-gray-600" />
              </div>
              <span className="text-sm">{contact.mobile_phone}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Contact Info */}
      {contact.job_title && contact.company_name && (
        <div className="p-6">
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">Professional</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{contact.job_title} at {contact.company_name}</span>
            </div>
            
            {contact.industry && (
              <div className="flex items-center gap-3 pl-7">
                <span className="text-sm text-muted-foreground">{contact.industry}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
