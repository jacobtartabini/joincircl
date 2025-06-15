
import { Phone, Mail, MapPin, Briefcase, Calendar, MessageSquare, Edit, Trash, Gift, GraduationCap, Facebook, Instagram, Linkedin, Globe, Building, Plus, Clock, Bell, FileText, Coffee, Hash } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { formatDistanceToNow, format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InteractionForm from "@/components/interaction/InteractionForm";
import KeystoneForm from "@/components/keystone/KeystoneForm";

interface UnifiedContactViewProps {
  contact: Contact;
  interactions: Interaction[];
  keystones: Keystone[];
  contactMedia: ContactMedia[];
  onEdit: () => void;
  onDelete: () => void;
  onKeystoneAdded: () => Promise<void>;
  onInteractionAdded: () => Promise<void>;
}

export function UnifiedContactView({
  contact,
  interactions,
  keystones,
  contactMedia,
  onEdit,
  onDelete,
  onKeystoneAdded,
  onInteractionAdded
}: UnifiedContactViewProps) {
  const [isAddInteractionOpen, setIsAddInteractionOpen] = useState(false);
  const [isAddKeystoneOpen, setIsAddKeystoneOpen] = useState(false);

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
    const content = (
      <div className="unified-button flex items-center gap-3 py-2 px-3 transition-all duration-200 hover:bg-white/30 dark:hover:bg-white/5 rounded-lg">
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground block truncate">{value}</span>
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
      </div>
    );

    if (href) {
      return <a href={href} target="_blank" rel="noopener noreferrer" className="block">{content}</a>;
    }
    return content;
  };

  // Combine and sort all timeline items
  const timelineItems = [
    ...interactions.map(item => ({
      id: `interaction-${item.id}`,
      type: "interaction" as const,
      date: new Date(item.date),
      title: `${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`,
      description: item.notes || "No notes provided",
      icon: getInteractionIcon(item.type),
      data: item
    })),
    ...keystones.map(item => ({
      id: `keystone-${item.id}`,
      type: "keystone" as const,
      date: new Date(item.date),
      title: item.title,
      description: item.notes || `${item.category} event`,
      icon: <Bell className="h-4 w-4 text-amber-500" />,
      data: item
    })),
    ...contactMedia.map(item => ({
      id: `media-${item.id}`,
      type: "media" as const,
      date: new Date(item.created_at || Date.now()),
      title: `Media: ${item.file_name}`,
      description: `${item.file_type} file`,
      icon: <FileText className="h-4 w-4 text-purple-500" />,
      data: item
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <>
      <div className="min-h-screen refined-web-theme">
        <ScrollArea className="h-screen">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Header Section */}
            <div className="glass-card-enhanced p-6 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-16 w-16 border-2 border-white/20 dark:border-white/10">
                    {contact.avatar_url ? (
                      <AvatarImage src={contact.avatar_url} alt={contact.name} />
                    ) : (
                      <AvatarFallback className="text-xl font-medium bg-gradient-to-br from-[#0daeec] to-[#0daeec]/70 text-white">
                        {contact.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="space-y-2">
                    <h1 className="text-2xl font-bold text-foreground">
                      {contact.name}
                    </h1>
                    {contact.job_title && contact.company_name && (
                      <p className="text-base text-muted-foreground font-medium">
                        {contact.job_title} at {contact.company_name}
                      </p>
                    )}
                    {contact.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {contact.location}
                      </p>
                    )}
                    <div className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-[#0daeec]/10 text-[#0daeec] border border-[#0daeec]/20">
                      {contact.circle.charAt(0).toUpperCase() + contact.circle.slice(1)} Circle
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    onClick={() => setIsAddInteractionOpen(true)} 
                    className="unified-button px-4 py-2 bg-[#0daeec] hover:bg-[#0daeec]/90 text-white rounded-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Interaction
                  </Button>
                  <Button 
                    onClick={() => setIsAddKeystoneOpen(true)} 
                    variant="outline" 
                    className="unified-button px-4 py-2 rounded-lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                  <Button 
                    onClick={onEdit} 
                    variant="outline" 
                    className="unified-button px-4 py-2 rounded-lg"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    onClick={onDelete} 
                    variant="outline" 
                    className="unified-button px-4 py-2 rounded-lg text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content with Tabs */}
            <div className="glass-card-enhanced p-6">
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>
                
                {/* About Tab Content */}
                <TabsContent value="about" className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Contact Information */}
                    <div className="space-y-6">
                      {/* Contact Details */}
                      <div className="unified-container p-5 rounded-lg">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
                        <div className="space-y-3">
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
                          {contact.website && (
                            <ContactInfoItem 
                              icon={Globe} 
                              label="Website" 
                              value={contact.website} 
                              href={contact.website} 
                            />
                          )}
                        </div>
                      </div>

                      {/* Professional Information */}
                      {(contact.company_name || contact.industry || contact.department || contact.work_address) && (
                        <div className="unified-container p-5 rounded-lg">
                          <h2 className="text-lg font-semibold text-foreground mb-4">Professional</h2>
                          <div className="space-y-3">
                            {contact.company_name && (
                              <ContactInfoItem icon={Building} label="Company" value={contact.company_name} />
                            )}
                            {contact.job_title && (
                              <ContactInfoItem icon={Briefcase} label="Job Title" value={contact.job_title} />
                            )}
                            {contact.industry && (
                              <ContactInfoItem icon={Briefcase} label="Industry" value={contact.industry} />
                            )}
                            {contact.department && (
                              <ContactInfoItem icon={Briefcase} label="Department" value={contact.department} />
                            )}
                            {contact.work_address && (
                              <ContactInfoItem icon={MapPin} label="Office" value={contact.work_address} />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Social Media */}
                      {(contact.linkedin || contact.twitter || contact.facebook || contact.instagram) && (
                        <div className="unified-container p-5 rounded-lg">
                          <h2 className="text-lg font-semibold text-foreground mb-4">Social Media</h2>
                          <div className="space-y-3">
                            {contact.linkedin && (
                              <ContactInfoItem icon={Linkedin} label="LinkedIn" value={contact.linkedin} href={contact.linkedin} />
                            )}
                            {contact.twitter && (
                              <ContactInfoItem 
                                icon={MessageSquare} 
                                label="Twitter" 
                                value={`@${contact.twitter}`} 
                                href={`https://twitter.com/${contact.twitter}`} 
                              />
                            )}
                            {contact.facebook && (
                              <ContactInfoItem icon={Facebook} label="Facebook" value={contact.facebook} href={contact.facebook} />
                            )}
                            {contact.instagram && (
                              <ContactInfoItem 
                                icon={Instagram} 
                                label="Instagram" 
                                value={`@${contact.instagram}`} 
                                href={`https://instagram.com/${contact.instagram}`} 
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Education */}
                      {(contact.university || contact.major || contact.minor || contact.graduation_year) && (
                        <div className="unified-container p-5 rounded-lg">
                          <h2 className="text-lg font-semibold text-foreground mb-4">Education</h2>
                          <div className="space-y-3">
                            {contact.university && (
                              <ContactInfoItem icon={GraduationCap} label="University" value={contact.university} />
                            )}
                            {contact.major && (
                              <ContactInfoItem 
                                icon={GraduationCap} 
                                label="Major" 
                                value={contact.major} 
                              />
                            )}
                            {contact.minor && (
                              <ContactInfoItem 
                                icon={GraduationCap} 
                                label="Minor" 
                                value={contact.minor} 
                              />
                            )}
                            {contact.graduation_year && (
                              <ContactInfoItem icon={Calendar} label="Graduated" value={contact.graduation_year.toString()} />
                            )}
                          </div>
                        </div>
                      )}

                      {/* Personal Information */}
                      {(contact.birthday || contact.how_met || contact.hobbies_interests) && (
                        <div className="unified-container p-5 rounded-lg">
                          <h2 className="text-lg font-semibold text-foreground mb-4">Personal</h2>
                          <div className="space-y-3">
                            {contact.birthday && (
                              <ContactInfoItem 
                                icon={Gift} 
                                label="Birthday" 
                                value={format(new Date(contact.birthday), 'MMM dd, yyyy')} 
                              />
                            )}
                            {contact.how_met && (
                              <div className="unified-container p-3 rounded-lg">
                                <p className="text-sm font-medium text-foreground mb-1">How We Met</p>
                                <p className="text-sm text-muted-foreground">{contact.how_met}</p>
                              </div>
                            )}
                            {contact.hobbies_interests && (
                              <div className="unified-container p-3 rounded-lg">
                                <p className="text-sm font-medium text-foreground mb-1">Interests</p>
                                <p className="text-sm text-muted-foreground">{contact.hobbies_interests}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {contact.tags && contact.tags.length > 0 && (
                        <div className="unified-container p-5 rounded-lg">
                          <h2 className="text-lg font-semibold text-foreground mb-4">Tags</h2>
                          <div className="flex flex-wrap gap-2">
                            {contact.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 text-xs font-medium bg-[#0daeec]/10 text-[#0daeec] border border-[#0daeec]/20 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {contact.notes && (
                        <div className="unified-container p-5 rounded-lg">
                          <h2 className="text-lg font-semibold text-foreground mb-4">Notes</h2>
                          <div className="unified-container p-3 rounded-lg">
                            <p className="text-sm text-foreground leading-relaxed">{contact.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                {/* Timeline Tab Content */}
                <TabsContent value="timeline">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-foreground">Timeline</h2>
                    <p className="text-sm text-muted-foreground">
                      {timelineItems.length} events
                    </p>
                  </div>

                  {timelineItems.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-lg font-medium">No timeline events yet</p>
                      <p className="text-sm mt-1">Interactions and events will appear here as you add them.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {timelineItems.map(item => (
                        <div key={item.id} className="unified-container p-4 rounded-lg border-l-4 border-[#0daeec]/30">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">
                              {item.icon}
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(item.date, { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(item.date, 'MMM dd, yyyy • h:mm a')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Dialogs */}
      <Dialog open={isAddInteractionOpen} onOpenChange={setIsAddInteractionOpen}>
        <DialogContent className="glass-card-enhanced border-white/20 dark:border-white/15">
          <DialogHeader>
            <DialogTitle>Add Interaction</DialogTitle>
          </DialogHeader>
          <InteractionForm
            contact={contact}
            onSuccess={() => {
              setIsAddInteractionOpen(false);
              onInteractionAdded();
            }}
            onCancel={() => setIsAddInteractionOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddKeystoneOpen} onOpenChange={setIsAddKeystoneOpen}>
        <DialogContent className="glass-card-enhanced border-white/20 dark:border-white/15">
          <DialogHeader>
            <DialogTitle>Add Keystone</DialogTitle>
          </DialogHeader>
          <KeystoneForm
            contact={contact}
            onSuccess={() => {
              setIsAddKeystoneOpen(false);
              onKeystoneAdded();
            }}
            onCancel={() => setIsAddKeystoneOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
