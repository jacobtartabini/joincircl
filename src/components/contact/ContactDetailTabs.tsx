
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Contact, Interaction } from "@/types/contact";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, MapPin, Building, Briefcase, Mail, Phone, Globe, ExternalLink, Edit, Trash2, Eye } from "lucide-react";

interface ContactDetailTabsProps {
  contact: Contact;
  interactions: Interaction[];
  onEdit?: () => void;
  onDelete?: () => void;
  onViewAll?: () => void;
}

export function ContactDetailTabs({ contact, interactions, onEdit, onDelete, onViewAll }: ContactDetailTabsProps) {
  const [activeTab, setActiveTab] = useState("about");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCircleColor = (circle: string) => {
    switch (circle) {
      case 'inner': return 'bg-green-500';
      case 'middle': return 'bg-yellow-500';
      case 'outer': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Contact Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
              {contact.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{contact.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${getCircleColor(contact.circle)}`}></div>
                <span className="text-sm text-muted-foreground capitalize">{contact.circle} Circle</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onViewAll && (
              <Button variant="ghost" size="sm" onClick={onViewAll}>
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {contact.job_title && contact.company_name && (
          <p className="text-sm text-muted-foreground mb-2">
            {contact.job_title} at {contact.company_name}
          </p>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mx-6 mt-4 grid w-full grid-cols-2">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="flex-1 mt-4">
          <ScrollArea className="h-full px-6">
            <div className="space-y-6 pb-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Contact Information</h3>
                <div className="space-y-2">
                  {contact.personal_email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{contact.personal_email}</span>
                    </div>
                  )}
                  {contact.mobile_phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{contact.mobile_phone}</span>
                    </div>
                  )}
                  {contact.location && (
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{contact.location}</span>
                    </div>
                  )}
                  {contact.website && (
                    <div className="flex items-center gap-3 text-sm">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={contact.website} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline flex items-center gap-1">
                        {contact.website}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              {(contact.company_name || contact.job_title || contact.industry) && (
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Professional</h3>
                  <div className="space-y-2">
                    {contact.company_name && (
                      <div className="flex items-center gap-3 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{contact.company_name}</span>
                      </div>
                    )}
                    {contact.job_title && (
                      <div className="flex items-center gap-3 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{contact.job_title}</span>
                      </div>
                    )}
                    {contact.industry && (
                      <div className="text-sm text-muted-foreground ml-7">
                        Industry: {contact.industry}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Personal Information */}
              {(contact.birthday || contact.hobbies_interests || contact.how_met) && (
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Personal</h3>
                  <div className="space-y-2">
                    {contact.birthday && (
                      <div className="flex items-center gap-3 text-sm">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Birthday: {formatDate(contact.birthday)}
                        </span>
                      </div>
                    )}
                    {contact.how_met && (
                      <div className="text-sm">
                        <span className="font-medium text-foreground">How we met:</span>
                        <p className="text-muted-foreground mt-1">{contact.how_met}</p>
                      </div>
                    )}
                    {contact.hobbies_interests && (
                      <div className="text-sm">
                        <span className="font-medium text-foreground">Interests:</span>
                        <p className="text-muted-foreground mt-1">{contact.hobbies_interests}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {contact.notes && (
                <div className="space-y-3">
                  <h3 className="font-medium text-foreground">Notes</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {contact.notes}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="timeline" className="flex-1 mt-4">
          <ScrollArea className="h-full px-6">
            <div className="space-y-4 pb-6">
              <h3 className="font-medium text-foreground">Recent Activity</h3>
              {interactions.length > 0 ? (
                <div className="space-y-4">
                  {interactions.map((interaction) => (
                    <div key={interaction.id} className="border-l-2 border-muted pl-4 pb-4 relative">
                      <div className="absolute -left-2 top-0 w-3 h-3 bg-primary rounded-full"></div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm text-foreground">
                          {interaction.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(interaction.date)}
                        </span>
                      </div>
                      {interaction.notes && (
                        <p className="text-sm text-muted-foreground">
                          {interaction.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-2">No interactions yet</p>
                  <p className="text-xs text-muted-foreground">
                    Start building your relationship history
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
