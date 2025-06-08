
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  MessageSquare,
  Edit,
  Trash2,
  ExternalLink,
  Eye
} from "lucide-react";
import { Contact, Interaction } from "@/types/contact";
import { ContactActivityTimeline } from "./ContactActivityTimeline";

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
  const getCircleColor = (circle: string) => {
    switch (circle) {
      case 'inner':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'middle':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'outer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              {contact.avatar_url ? (
                <img 
                  src={contact.avatar_url} 
                  alt={contact.name} 
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">{contact.name}</h2>
              {contact.job_title && (
                <p className="text-sm text-muted-foreground">{contact.job_title}</p>
              )}
              {contact.company_name && (
                <p className="text-sm text-muted-foreground">{contact.company_name}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant="secondary" 
                  className={`text-xs capitalize ${getCircleColor(contact.circle)}`}
                >
                  {contact.circle} Circle
                </Badge>
                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex gap-1">
                    {contact.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {contact.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{contact.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onViewAll}>
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Contact Information */}
            <Card className="unified-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact.personal_email && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{contact.personal_email}</span>
                  </div>
                )}
                {contact.mobile_phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{contact.mobile_phone}</span>
                  </div>
                )}
                {contact.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{contact.location}</span>
                  </div>
                )}
                {contact.company_name && (
                  <div className="flex items-center gap-3 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{contact.company_name}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Last Contact */}
            <Card className="unified-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Last Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{formatDate(contact.last_contact)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Interactions */}
            <Card className="unified-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Recent Interactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {interactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent interactions</p>
                ) : (
                  <div className="space-y-3">
                    {interactions.slice(0, 3).map((interaction) => (
                      <div key={interaction.id} className="text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground">{interaction.type}</span>
                          <span className="text-muted-foreground text-xs">
                            {formatDate(interaction.date)}
                          </span>
                        </div>
                        {interaction.notes && (
                          <p className="text-muted-foreground mt-1 line-clamp-2">
                            {interaction.notes}
                          </p>
                        )}
                      </div>
                    ))}
                    {interactions.length > 3 && (
                      <Button variant="outline" size="sm" onClick={onViewAll} className="w-full">
                        View All Interactions
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            {(contact.linkedin || contact.twitter || contact.website) && (
              <Card className="unified-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Social & Web</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {contact.linkedin && (
                    <a 
                      href={contact.linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      LinkedIn <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {contact.twitter && (
                    <a 
                      href={`https://twitter.com/${contact.twitter}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      Twitter <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {contact.website && (
                    <a 
                      href={contact.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      Website <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {contact.notes && (
              <Card className="unified-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground whitespace-pre-wrap">{contact.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Replace the old timeline section with the new dynamic timeline */}
      <div className="flex-shrink-0 border-t border-border">
        <ContactActivityTimeline contact={contact} />
      </div>
    </div>
  );
}
