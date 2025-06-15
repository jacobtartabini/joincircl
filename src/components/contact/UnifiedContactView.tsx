
import { Phone, Mail, MapPin, Briefcase, Calendar, MessageSquare, Edit, Trash, Gift, GraduationCap, Facebook, Instagram, Linkedin, Globe, Building, Plus, Clock, Bell, FileText, Coffee, Hash } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { formatDistanceToNow, format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InteractionForm from "@/components/interaction/InteractionForm";
import KeystoneForm from "@/components/keystone/KeystoneForm";
import { GradientText } from "@/components/ui/gradient-text";

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
      <div className="unified-button flex items-center gap-3 py-3 px-4 transition-all duration-200 hover:bg-white/50 dark:hover:bg-white/10 rounded-xl">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">{value}</span>
          <span className="text-xs text-muted-foreground ml-2">({label})</span>
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
      description: item.notes || `${item.category} keystone`,
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
          <div className="max-w-7xl mx-auto px-8 py-12">
            {/* Header Section */}
            <div className="glass-card-enhanced p-8 mb-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-8">
                  <Avatar className="h-20 w-20 border-2 border-white/20 dark:border-white/10">
                    {contact.avatar_url ? (
                      <AvatarImage src={contact.avatar_url} alt={contact.name} />
                    ) : (
                      <AvatarFallback className="text-2xl font-medium bg-gradient-to-br from-[#0daeec] to-[#0daeec]/70 text-white">
                        {contact.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="space-y-3">
                    <GradientText className="text-3xl font-bold">
                      {contact.name}
                    </GradientText>
                    {contact.job_title && contact.company_name && (
                      <p className="text-lg text-muted-foreground font-medium">
                        {contact.job_title} at {contact.company_name}
                      </p>
                    )}
                    {contact.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {contact.location}
                      </p>
                    )}
                    <div className="inline-flex px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#0daeec]/10 to-[#0daeec]/5 text-[#0daeec] border border-[#0daeec]/20">
                      {contact.circle.charAt(0).toUpperCase() + contact.circle.slice(1)} Circle
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button 
                    onClick={() => setIsAddInteractionOpen(true)} 
                    className="unified-button px-6 py-2 bg-gradient-to-r from-[#0daeec]/90 to-[#0daeec]/70 hover:from-[#0daeec] hover:to-[#0daeec]/90 text-white rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Interaction
                  </Button>
                  <Button 
                    onClick={() => setIsAddKeystoneOpen(true)} 
                    variant="outline" 
                    className="unified-button px-6 py-2 rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                  <Button 
                    onClick={onEdit} 
                    variant="outline" 
                    className="unified-button px-6 py-2 rounded-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    onClick={onDelete} 
                    variant="outline" 
                    className="unified-button px-6 py-2 rounded-full text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-12 gap-8">
              {/* Left Column - Contact Information */}
              <div className="col-span-4 space-y-6">
                {/* Contact Details */}
                {(contact.personal_email || contact.mobile_phone || contact.website) && (
                  <div className="glass-card-enhanced p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Contact Information</h2>
                    <div className="space-y-2">
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
                )}

                {/* Professional Information */}
                {(contact.company_name || contact.industry || contact.department || contact.work_address) && (
                  <div className="glass-card-enhanced p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Professional</h2>
                    <div className="space-y-2">
                      {contact.company_name && (
                        <ContactInfoItem icon={Building} label="Company" value={contact.company_name} />
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

                {/* Education */}
                {(contact.university || contact.major || contact.graduation_year) && (
                  <div className="glass-card-enhanced p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Education</h2>
                    <div className="space-y-2">
                      {contact.university && (
                        <ContactInfoItem icon={GraduationCap} label="University" value={contact.university} />
                      )}
                      {contact.major && (
                        <ContactInfoItem 
                          icon={GraduationCap} 
                          label="Major" 
                          value={`${contact.major}${contact.minor ? ` • Minor: ${contact.minor}` : ''}`} 
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
                  <div className="glass-card-enhanced p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Personal</h2>
                    <div className="space-y-4">
                      {contact.birthday && (
                        <ContactInfoItem 
                          icon={Gift} 
                          label="Birthday" 
                          value={new Date(contact.birthday).toLocaleDateString()} 
                        />
                      )}
                      {contact.how_met && (
                        <div className="unified-container p-4 rounded-xl">
                          <p className="text-sm font-medium text-foreground mb-2">How We Met</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{contact.how_met}</p>
                        </div>
                      )}
                      {contact.hobbies_interests && (
                        <div className="unified-container p-4 rounded-xl">
                          <p className="text-sm font-medium text-foreground mb-2">Interests</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{contact.hobbies_interests}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Social Media */}
                {(contact.linkedin || contact.twitter || contact.facebook || contact.instagram) && (
                  <div className="glass-card-enhanced p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Social Media</h2>
                    <div className="space-y-2">
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

                {/* Notes */}
                {contact.notes && (
                  <div className="glass-card-enhanced p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Notes</h2>
                    <div className="unified-container p-4 rounded-xl">
                      <p className="text-sm text-foreground leading-relaxed">{contact.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Timeline */}
              <div className="col-span-8">
                <div className="glass-card-enhanced p-8">
                  <div className="flex items-center justify-between mb-8">
                    <GradientText className="text-2xl font-bold">Timeline</GradientText>
                    <p className="text-sm text-muted-foreground">
                      {timelineItems.length} events • {interactions.length} interactions • {keystones.length} keystones
                    </p>
                  </div>

                  {timelineItems.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-lg font-medium">No timeline events yet</p>
                      <p className="text-sm mt-1">Interactions, keystones, and media will appear here as you add them.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {timelineItems.map(item => (
                        <div key={item.id} className="unified-container p-4 rounded-xl">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0 mt-1">
                              {item.icon}
                            </div>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-foreground">{item.title}</h3>
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(item.date, { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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
