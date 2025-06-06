import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Contact, Interaction } from "@/types/contact";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Mail, MapPin, Edit, Trash, MessageSquare, Calendar, Coffee, Hash, User, MoreVertical } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
interface MinimalContactDetailProps {
  contact: Contact;
  interactions: Interaction[];
  onEdit: () => void;
  onDelete: () => void;
}
export function MinimalContactDetail({
  contact,
  interactions,
  onEdit,
  onDelete
}: MinimalContactDetailProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showActions, setShowActions] = useState(false);
  const handleBack = () => {
    // Check if there's a previous state or default to circles
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/circles');
    }
  };
  const getInteractionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "meeting":
        return <Coffee className="h-4 w-4 text-green-500" />;
      case "email":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "phone":
        return <Phone className="h-4 w-4 text-amber-500" />;
      case "note":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Hash className="h-4 w-4 text-gray-400" />;
    }
  };
  const getCircleColor = (circle: string) => {
    switch (circle) {
      case 'inner':
        return 'bg-red-500';
      case 'middle':
        return 'bg-yellow-500';
      case 'outer':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };
  const ContactInfoItem = ({
    icon: Icon,
    label,
    value,
    href
  }: {
    icon: any;
    label: string;
    value: string;
    href?: string;
  }) => {
    const content = <div className="flex items-center gap-3 py-3 active:bg-gray-50 transition-colors rounded-full">
        <Icon className="h-5 w-5 text-gray-400" />
        <div className="flex-1 min-w-0">
          <span className="text-base text-gray-900">{value}</span>
          <span className="text-sm text-gray-500 ml-2">({label})</span>
        </div>
      </div>;
    if (href) {
      return <a href={href} target="_blank" rel="noopener noreferrer" className="block">{content}</a>;
    }
    return content;
  };
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={handleBack} className="unified-button p-2 -ml-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setShowActions(!showActions)} className="unified-button p-2">
            <MoreVertical className="h-5 w-5" />
          </Button>
          
          {showActions && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="absolute right-0 top-12 unified-modal p-2 z-20 min-w-[120px]"
            >
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { onEdit(); setShowActions(false); }} 
                className="unified-button w-full justify-start text-left p-2 h-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { onDelete(); setShowActions(false); }} 
                className="unified-button w-full justify-start text-left p-2 h-auto text-destructive hover:text-destructive"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Contact Header */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 mx-auto">
                {contact.avatar_url ? (
                  <AvatarImage src={contact.avatar_url} alt={contact.name} />
                ) : (
                  <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {contact.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className={cn("absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-card", getCircleColor(contact.circle || 'outer'))} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">{contact.name}</h1>
              {contact.job_title && contact.company_name && (
                <p className="text-lg text-muted-foreground">
                  {contact.job_title} at {contact.company_name}
                </p>
              )}
              {contact.location && (
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {contact.location}
                </p>
              )}
              <Badge variant="secondary" className="text-sm">
                {contact.circle.charAt(0).toUpperCase() + contact.circle.slice(1)} Circle
              </Badge>
            </div>
          </div>

          {/* Contact Actions */}
          <div className="grid grid-cols-2 gap-3">
            {contact.personal_email && (
              <Button 
                variant="outline" 
                onClick={() => window.open(`mailto:${contact.personal_email}`)} 
                className="unified-button h-12 flex items-center gap-2 rounded-xl"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
            )}
            {contact.mobile_phone && (
              <Button 
                variant="outline" 
                onClick={() => window.open(`tel:${contact.mobile_phone}`)} 
                className="unified-button h-12 flex items-center gap-2 rounded-xl"
              >
                <Phone className="h-4 w-4" />
                Call
              </Button>
            )}
          </div>

          {/* Contact Details Sections */}
          {(contact.personal_email || contact.mobile_phone || contact.website) && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Contact</h2>
              <div className="unified-container space-y-1">
                {contact.personal_email && (
                  <ContactInfoItem 
                    icon={Mail} 
                    label="Email" 
                    value={contact.personal_email} 
                    href={`mailto:${contact.personal_email}`} 
                  />
                )}
                {contact.mobile_phone && (
                  <ContactInfoItem 
                    icon={Phone} 
                    label="Phone" 
                    value={contact.mobile_phone} 
                    href={`tel:${contact.mobile_phone}`} 
                  />
                )}
              </div>
            </div>
          )}

          {/* Professional Information */}
          {(contact.company_name || contact.industry || contact.department) && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Professional</h2>
              <div className="space-y-1">
                {contact.company_name && (
                  <ContactInfoItem 
                    icon={User} 
                    label="Company" 
                    value={contact.company_name} 
                  />
                )}
                {contact.industry && (
                  <ContactInfoItem 
                    icon={User} 
                    label="Industry" 
                    value={contact.industry} 
                  />
                )}
                {contact.department && (
                  <ContactInfoItem 
                    icon={User} 
                    label="Department" 
                    value={contact.department} 
                  />
                )}
              </div>
            </div>
          )}

          {/* Tags */}
          {contact.tags && contact.tags.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {contact.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {contact.notes && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Notes</h2>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <p className="text-gray-700 leading-relaxed">{contact.notes}</p>
              </div>
            </div>
          )}

          {/* Recent Interactions */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            {interactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>No recent interactions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interactions.slice(0, 5).map((interaction) => (
                  <div key={interaction.id} className="unified-container flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getInteractionIcon(interaction.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-foreground">
                          {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(interaction.date), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{interaction.notes}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
