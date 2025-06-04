
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
      case "meeting": return <Coffee className="h-4 w-4 text-green-500" />;
      case "email": return <Mail className="h-4 w-4 text-blue-500" />;
      case "phone": return <Phone className="h-4 w-4 text-amber-500" />;
      case "note": return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default: return <Hash className="h-4 w-4 text-gray-400" />;
    }
  };

  const ContactInfoItem = ({ icon: Icon, label, value, href }: { 
    icon: any; 
    label: string; 
    value: string; 
    href?: string;
  }) => {
    const content = (
      <div className="flex items-center gap-3 py-2 hover:bg-gray-50/50 rounded-lg transition-colors px-3 -mx-3">
        <Icon className="h-4 w-4 text-gray-400" />
        <div className="flex-1 min-w-0">
          <span className="text-sm text-gray-900">{value}</span>
          <span className="text-xs text-gray-500 ml-2">({label})</span>
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
      <ScrollArea className="h-screen">
        <div className="px-8 py-12">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-16">
            <div className="flex items-center gap-8">
              <Avatar className="h-20 w-20">
                {contact.avatar_url ? (
                  <AvatarImage src={contact.avatar_url} alt={contact.name} />
                ) : (
                  <AvatarFallback className="text-2xl font-light bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {contact.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="space-y-2">
                <h1 className="text-3xl font-light text-gray-900">{contact.name}</h1>
                {contact.job_title && contact.company_name && (
                  <p className="text-lg text-gray-600">
                    {contact.job_title} at {contact.company_name}
                  </p>
                )}
                {contact.location && (
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {contact.location}
                  </p>
                )}
                <div className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {contact.circle.charAt(0).toUpperCase() + contact.circle.slice(1)} Circle
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddInteractionOpen(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Interaction
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddKeystoneOpen(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Keystone
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onEdit}
                className="text-gray-600 hover:text-gray-900"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-16">
            {/* Left Column - Contact Information */}
            <div className="col-span-4 space-y-12">
              {/* Contact Details */}
              {(contact.personal_email || contact.mobile_phone || contact.website) && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">Contact</h2>
                  <div className="space-y-1">
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
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">Professional</h2>
                  <div className="space-y-1">
                    {contact.company_name && (
                      <ContactInfoItem 
                        icon={Building} 
                        label="Company" 
                        value={contact.company_name}
                      />
                    )}
                    {contact.industry && (
                      <ContactInfoItem 
                        icon={Briefcase} 
                        label="Industry" 
                        value={contact.industry}
                      />
                    )}
                    {contact.department && (
                      <ContactInfoItem 
                        icon={Briefcase} 
                        label="Department" 
                        value={contact.department}
                      />
                    )}
                    {contact.work_address && (
                      <ContactInfoItem 
                        icon={MapPin} 
                        label="Office" 
                        value={contact.work_address}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Education */}
              {(contact.university || contact.major || contact.graduation_year) && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">Education</h2>
                  <div className="space-y-1">
                    {contact.university && (
                      <ContactInfoItem 
                        icon={GraduationCap} 
                        label="University" 
                        value={contact.university}
                      />
                    )}
                    {contact.major && (
                      <ContactInfoItem 
                        icon={GraduationCap} 
                        label="Major" 
                        value={`${contact.major}${contact.minor ? ` • Minor: ${contact.minor}` : ''}`}
                      />
                    )}
                    {contact.graduation_year && (
                      <ContactInfoItem 
                        icon={Calendar} 
                        label="Graduated" 
                        value={contact.graduation_year.toString()}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Personal Information */}
              {(contact.birthday || contact.how_met || contact.hobbies_interests) && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">Personal</h2>
                  <div className="space-y-3">
                    {contact.birthday && (
                      <ContactInfoItem 
                        icon={Gift} 
                        label="Birthday" 
                        value={new Date(contact.birthday).toLocaleDateString()}
                      />
                    )}
                    {contact.how_met && (
                      <div className="py-2">
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">How We Met</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{contact.how_met}</p>
                      </div>
                    )}
                    {contact.hobbies_interests && (
                      <div className="py-2">
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Interests</p>
                        <p className="text-sm text-gray-700 leading-relaxed">{contact.hobbies_interests}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social Media */}
              {(contact.linkedin || contact.twitter || contact.facebook || contact.instagram) && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">Social</h2>
                  <div className="space-y-1">
                    {contact.linkedin && (
                      <ContactInfoItem 
                        icon={Linkedin} 
                        label="LinkedIn" 
                        value={contact.linkedin}
                        href={contact.linkedin}
                      />
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
                      <ContactInfoItem 
                        icon={Facebook} 
                        label="Facebook" 
                        value={contact.facebook}
                        href={contact.facebook}
                      />
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
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">Notes</h2>
                  <div className="py-4 px-6 bg-gray-50/50 rounded-xl">
                    <p className="text-sm text-gray-700 leading-relaxed">{contact.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Timeline */}
            <div className="col-span-8">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-light text-gray-900">Timeline</h2>
                  <p className="text-sm text-gray-500">
                    {timelineItems.length} events • {interactions.length} interactions • {keystones.length} keystones
                  </p>
                </div>

                {timelineItems.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No timeline events yet</p>
                    <p className="text-sm mt-1">Interactions, keystones, and media will appear here as you add them.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {timelineItems.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-b-0">
                        <div className="flex-shrink-0 mt-1">
                          {item.icon}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(item.date, { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                          <p className="text-xs text-gray-400">
                            {format(item.date, 'PPP')}
                          </p>
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

      {/* Add Interaction Dialog */}
      <Dialog open={isAddInteractionOpen} onOpenChange={setIsAddInteractionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Interaction</DialogTitle>
          </DialogHeader>
          <InteractionForm 
            contact={contact} 
            onSuccess={async () => {
              await onInteractionAdded();
              setIsAddInteractionOpen(false);
            }} 
            onCancel={() => setIsAddInteractionOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Add Keystone Dialog */}
      <Dialog open={isAddKeystoneOpen} onOpenChange={setIsAddKeystoneOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Keystone</DialogTitle>
          </DialogHeader>
          <KeystoneForm 
            contact={contact} 
            onSuccess={async () => {
              await onKeystoneAdded();
              setIsAddKeystoneOpen(false);
            }} 
            onCancel={() => setIsAddKeystoneOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
