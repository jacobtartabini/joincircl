import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Trash2, Eye, MapPin, Building, Briefcase, Mail, Phone, Globe, Linkedin, Facebook, Clock, Calendar } from "lucide-react";
import { Contact } from "@/types/contact";
import { cn } from "@/lib/utils";
interface Interaction {
  id: string;
  user_id: string;
  contact_id: string;
  type: string;
  notes: string;
  date: string;
  created_at: string;
}
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
  const [activeTab, setActiveTab] = useState("about");
  const getCircleColor = (circle: string) => {
    switch (circle) {
      case 'inner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'middle':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'outer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={contact.avatar_url || ""} alt={contact.name} />
            <AvatarFallback className="text-lg font-semibold">
              {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-foreground truncate">
              {contact.name}
            </h2>
            {contact.job_title && <p className="text-sm text-muted-foreground">{contact.job_title}</p>}
            {contact.company_name && <p className="text-sm text-muted-foreground">{contact.company_name}</p>}
            
            <div className="flex items-center gap-2 mt-2">
              <Badge className={cn("text-xs", getCircleColor(contact.circle))}>
                {contact.circle} circle
              </Badge>
              {contact.last_contact && <span className="text-xs text-muted-foreground">
                  Last contact: {formatDate(contact.last_contact)}
                </span>}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1 rounded-full">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onViewAll} className="flex-1 rounded-full">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete} className="rounded-full">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-6 mt-4 rounded-full">
          <TabsTrigger value="about" className="rounded-full">About</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-full">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Contact Information</h3>
                <div className="space-y-2">
                  {contact.personal_email && <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{contact.personal_email}</span>
                    </div>}
                  {contact.mobile_phone && <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{contact.mobile_phone}</span>
                    </div>}
                  {contact.location && <div className="flex items-center gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{contact.location}</span>
                    </div>}
                </div>
              </div>

              {/* Professional Information */}
              {(contact.company_name || contact.job_title || contact.industry) && <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Professional</h3>
                  <div className="space-y-2">
                    {contact.company_name && <div className="flex items-center gap-3 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{contact.company_name}</span>
                      </div>}
                    {contact.job_title && <div className="flex items-center gap-3 text-sm">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{contact.job_title}</span>
                      </div>}
                    {contact.industry && <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">Industry:</span>
                        <span className="text-foreground">{contact.industry}</span>
                      </div>}
                  </div>
                </div>}

              {/* Social Links */}
              {(contact.linkedin || contact.website || contact.facebook) && <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Social & Web</h3>
                  <div className="space-y-2">
                    {contact.linkedin && <div className="flex items-center gap-3 text-sm">
                        <Linkedin className="h-4 w-4 text-muted-foreground" />
                        <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          LinkedIn
                        </a>
                      </div>}
                    {contact.website && <div className="flex items-center gap-3 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          Website
                        </a>
                      </div>}
                    {contact.facebook && <div className="flex items-center gap-3 text-sm">
                        <Facebook className="h-4 w-4 text-muted-foreground" />
                        <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                          Facebook
                        </a>
                      </div>}
                  </div>
                </div>}

              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag, index) => <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>)}
                  </div>
                </div>}

              {/* Notes */}
              {contact.notes && <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Notes</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {contact.notes}
                  </p>
                </div>}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="timeline" className="flex-1 mt-0">
          <ScrollArea className="h-full">
            <div className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
              {interactions.length > 0 ? <div className="space-y-4">
                  {interactions.map(interaction => <div key={interaction.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {interaction.type}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(interaction.date)}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTime(interaction.date)}
                          </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {interaction.notes}
                        </p>
                      </div>
                    </div>)}
                </div> : <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Interactions will appear here as you add them
                  </p>
                </div>}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>;
}