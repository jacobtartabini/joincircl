import { useState } from "react";
import { Contact, Interaction } from "@/types/contact";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MoreHorizontal, Phone, Mail, MapPin, Edit, Trash, MessageSquare, Calendar, Coffee, Hash, User, Building, ExternalLink, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";
import { GradientText } from "@/components/ui/gradient-text";

interface EnhancedContactDetailProps {
  contact: Contact;
  interactions: Interaction[];
  onEdit: () => void;
  onDelete: () => void;
  onViewAll: () => void;
}

export function EnhancedContactDetail({
  contact,
  interactions,
  onEdit,
  onDelete,
  onViewAll
}: EnhancedContactDetailProps) {
  const isMobile = useIsMobile();
  const [showMobilePanel, setShowMobilePanel] = useState(false);

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
        return <Hash className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCircleColor = (circle: string) => {
    switch (circle) {
      case "inner":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "middle":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "outer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const ContactInfoSection = () => (
    <div className="space-y-4">
      {/* Contact Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border border-white/20 dark:border-white/10">
            {contact.avatar_url ? (
              <AvatarImage src={contact.avatar_url} alt={contact.name} />
            ) : (
              <AvatarFallback className="text-lg font-medium bg-gradient-to-br from-[#0daeec] to-[#0daeec]/70 text-white">
                {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <GradientText className="text-lg font-bold truncate">
              {contact.name}
            </GradientText>
            {contact.job_title && contact.company_name && (
              <p className="text-sm text-muted-foreground truncate">
                {contact.job_title} at {contact.company_name}
              </p>
            )}
            {contact.location && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {contact.location}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-gradient-to-r from-[#0daeec]/10 to-[#0daeec]/5 text-[#0daeec] border border-[#0daeec]/20">
            {contact.circle.charAt(0).toUpperCase() + contact.circle.slice(1)} Circle
          </Badge>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={onEdit} className="unified-button h-8 w-8 p-0">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="unified-button h-8 w-8 p-0 text-destructive hover:text-destructive">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        {contact.personal_email && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(`mailto:${contact.personal_email}`)} 
            className="unified-button justify-start gap-2 h-9 rounded-full"
          >
            <Mail className="h-4 w-4" />
            Email
          </Button>
        )}
        {contact.mobile_phone && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(`tel:${contact.mobile_phone}`)} 
            className="unified-button justify-start gap-2 h-9 rounded-full"
          >
            <Phone className="h-4 w-4" />
            Call
          </Button>
        )}
      </div>

      <Separator />
    </div>
  );

  const ContactDetailsSection = () => (
    <div className="space-y-4">
      {/* Contact Information */}
      {(contact.personal_email || contact.mobile_phone || contact.website) && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Contact Details</h3>
          <div className="space-y-2">
            {contact.personal_email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground truncate">{contact.personal_email}</span>
              </div>
            )}
            {contact.mobile_phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{contact.mobile_phone}</span>
              </div>
            )}
            {contact.website && (
              <div className="flex items-center gap-2 text-sm">
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                  {contact.website}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Professional Information */}
      {(contact.company_name || contact.industry || contact.department) && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Professional</h3>
          <div className="space-y-2">
            {contact.company_name && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{contact.company_name}</span>
              </div>
            )}
            {contact.industry && (
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{contact.industry}</span>
              </div>
            )}
            {contact.department && (
              <div className="text-sm text-muted-foreground pl-6">
                {contact.department}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {contact.tags && contact.tags.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Tags</h3>
          <div className="flex flex-wrap gap-1">
            {contact.tags.slice(0, 6).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs bg-gradient-to-r from-[#0daeec]/10 to-[#0daeec]/5 text-[#0daeec] border border-[#0daeec]/20">
                {tag}
              </Badge>
            ))}
            {contact.tags.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{contact.tags.length - 6} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {contact.notes && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">Notes</h3>
          <div className="unified-container p-3 rounded-lg">
            <p className="text-sm text-foreground leading-relaxed line-clamp-4">
              {contact.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const RecentActivitySection = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Recent Activity</h3>
      {interactions.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent interactions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interactions.slice(0, 3).map(interaction => (
            <div key={interaction.id} className="unified-container flex gap-3 p-3 rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {getInteractionIcon(interaction.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">
                    {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(interaction.date), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {interaction.notes}
                </p>
              </div>
            </div>
          ))}
          {interactions.length > 3 && (
            <Button variant="ghost" size="sm" onClick={onViewAll} className="unified-button w-full text-sm text-muted-foreground hover:text-foreground">
              View all {interactions.length} interactions
            </Button>
          )}
        </div>
      )}
    </div>
  );

  // Mobile overlay
  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed inset-0 bg-background z-50 flex flex-col refined-web-theme"
        >
          {/* Mobile Header */}
          <div className="glass-card-enhanced flex items-center justify-between p-4">
            <h1 className="text-lg font-semibold text-foreground">Contact Details</h1>
            <Button variant="ghost" size="sm" onClick={() => setShowMobilePanel(false)} className="unified-button h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mobile Content */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <ContactInfoSection />
              <ContactDetailsSection />
              <RecentActivitySection />
            </div>
          </ScrollArea>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Desktop panel
  return (
    <div className="h-full flex flex-col glass-card-enhanced">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border dark:border-border">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-foreground">Contact Details</h2>
          <Button variant="ghost" size="sm" onClick={onViewAll} className="unified-button text-xs text-muted-foreground hover:text-foreground rounded-full">
            View More
          </Button>
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <ContactInfoSection />
          <ContactDetailsSection />
          <RecentActivitySection />
        </div>
      </ScrollArea>
    </div>
  );
}
