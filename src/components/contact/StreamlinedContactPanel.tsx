
import { useState } from "react";
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactTimeline } from "./ContactTimeline";
import { ContactLocationMap } from "./ContactLocationMap";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Edit, 
  Trash, 
  Building, 
  User, 
  ExternalLink,
  Calendar,
  ArrowRight
} from "lucide-react";

interface StreamlinedContactPanelProps {
  contact: Contact;
  interactions: Interaction[];
  keystones: Keystone[];
  contactMedia: ContactMedia[];
  onEdit: () => void;
  onDelete: () => void;
  onViewMore: () => void;
}

export function StreamlinedContactPanel({
  contact,
  interactions,
  keystones,
  contactMedia,
  onEdit,
  onDelete,
  onViewMore
}: StreamlinedContactPanelProps) {
  const [activeTab, setActiveTab] = useState("about");

  const getCircleBadge = (circle: string) => {
    switch (circle) {
      case "inner":
        return <Badge className="bg-[#2664EB] text-white hover:bg-[#1d4ed8] border-0">Inner</Badge>;
      case "middle":
        return <Badge className="bg-[#16A34A] text-white hover:bg-[#15803d] border-0">Middle</Badge>;
      case "outer":
        return <Badge className="bg-[#9CA3AF] text-white hover:bg-[#6b7280] border-0">Outer</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-card dark:bg-card">
      {/* Contact Header */}
      <div className="flex-shrink-0 p-6 pb-4">
        <div className="space-y-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 border border-white/20 dark:border-white/10">
              {contact.avatar_url ? (
                <AvatarImage src={contact.avatar_url} alt={contact.name} />
              ) : (
                <AvatarFallback className="text-lg font-medium bg-gradient-to-br from-[#0daeec] to-[#0daeec]/70 text-white">
                  {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate bg-gradient-to-r from-[#0daeec] to-[#0891b2] bg-clip-text text-inherit">
                {contact.name}
              </h2>
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

            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={onEdit} className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Circle Badge */}
          <div className="flex items-center justify-between">
            {getCircleBadge(contact.circle)}
          </div>

          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          {/* About Tab Content */}
          <TabsContent value="about" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-6 pt-0 space-y-6">
                {/* Quick Actions */}
                {(contact.personal_email || contact.mobile_phone) && (
                  <div className="grid grid-cols-2 gap-2">
                    {contact.personal_email && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(`mailto:${contact.personal_email}`)}
                        className="justify-start gap-2 h-9 rounded-full"
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
                        className="justify-start gap-2 h-9 rounded-full"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </Button>
                    )}
                  </div>
                )}

                <Separator />

                {/* Contact Information */}
                {(contact.personal_email || contact.mobile_phone || contact.website) && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-foreground">Contact Information</h3>
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
                          <a 
                            href={contact.website} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-primary hover:underline truncate"
                          >
                            {contact.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location with Map */}
                {contact.location && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-foreground">Location</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{contact.location}</span>
                      </div>
                      <ContactLocationMap 
                        location={contact.location} 
                        height="150px"
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Professional Information */}
                {(contact.company_name || contact.industry || contact.department) && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-foreground">Professional Details</h3>
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

                {/* Personal Details */}
                {contact.birthday && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-foreground">Personal Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">Birthday: {new Date(contact.birthday).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {contact.tags && contact.tags.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-foreground">Tags</h3>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags.slice(0, 8).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {contact.tags.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{contact.tags.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {contact.notes && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-foreground">Notes</h3>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm text-foreground leading-relaxed">
                        {contact.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* View More Link */}
                <div className="pt-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onViewMore}
                    className="text-sm text-muted-foreground hover:text-foreground p-0 h-auto font-normal"
                  >
                    View full contact details
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Timeline Tab Content */}
          <TabsContent value="timeline" className="h-full m-0">
            <ContactTimeline 
              contact={contact}
              interactions={interactions}
              keystones={keystones}
              contactMedia={contactMedia}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
