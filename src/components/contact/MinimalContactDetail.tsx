
import { Phone, Mail, MapPin, Briefcase, Link as LinkIcon, Calendar, MessageSquare, Edit, Trash, Gift, GraduationCap, Facebook, Instagram, Linkedin, Globe, Building } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Contact, Interaction } from "@/types/contact";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MinimalContactDetailProps {
  contact: Contact;
  interactions?: Interaction[];
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MinimalContactDetail({
  contact,
  interactions = [],
  onEdit,
  onDelete
}: MinimalContactDetailProps) {
  const getInteractionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "meeting":
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "email":
        return <Mail className="h-4 w-4 text-green-500" />;
      case "phone":
        return <Phone className="h-4 w-4 text-amber-500" />;
      case "note":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-400" />;
    }
  };

  const ContactField = ({ icon: Icon, label, value, href }: { 
    icon: any; 
    label: string; 
    value: string; 
    href?: string;
  }) => {
    const content = (
      <div className="group flex items-center gap-4 py-4 hover:bg-gray-50/50 rounded-lg transition-colors px-2 -mx-2">
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
          <Icon className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </div>
      </div>
    );

    if (href) {
      return <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
    }
    return content;
  };

  return (
    <div className="h-full bg-white">
      {/* Header Actions */}
      <div className="flex justify-end gap-3 p-8 pb-6">
        {onEdit && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onEdit}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
        {onDelete && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 px-8 pb-8">
        <div className="space-y-12">
          {/* Profile Header */}
          <div className="text-center space-y-6">
            <Avatar className="h-24 w-24 mx-auto">
              {contact.avatar_url ? (
                <AvatarImage src={contact.avatar_url} alt={contact.name} />
              ) : (
                <AvatarFallback className="text-2xl font-light bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {contact.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-light text-gray-900">{contact.name}</h1>
              {contact.job_title && contact.company_name && (
                <p className="text-gray-600 font-medium">
                  {contact.job_title} at {contact.company_name}
                </p>
              )}
              {contact.location && (
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {contact.location}
                </p>
              )}
            </div>

            <div className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              {contact.circle.charAt(0).toUpperCase() + contact.circle.slice(1)} Circle
            </div>
          </div>

          {/* Contact Information */}
          {(contact.personal_email || contact.mobile_phone || contact.website) && (
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-gray-900 mb-6 tracking-wide uppercase">Contact</h2>
              <div className="space-y-1">
                {contact.personal_email && (
                  <ContactField 
                    icon={Mail} 
                    label="Email" 
                    value={contact.personal_email}
                    href={`mailto:${contact.personal_email}`}
                  />
                )}
                {contact.mobile_phone && (
                  <ContactField 
                    icon={Phone} 
                    label="Phone" 
                    value={contact.mobile_phone}
                    href={`tel:${contact.mobile_phone}`}
                  />
                )}
                {contact.website && (
                  <ContactField 
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
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-gray-900 mb-6 tracking-wide uppercase">Professional</h2>
              <div className="space-y-1">
                {contact.company_name && (
                  <ContactField 
                    icon={Building} 
                    label="Company" 
                    value={contact.company_name}
                  />
                )}
                {contact.industry && (
                  <ContactField 
                    icon={Briefcase} 
                    label="Industry" 
                    value={contact.industry}
                  />
                )}
                {contact.department && (
                  <ContactField 
                    icon={Briefcase} 
                    label="Department" 
                    value={contact.department}
                  />
                )}
                {contact.work_address && (
                  <ContactField 
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
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-gray-900 mb-6 tracking-wide uppercase">Education</h2>
              <div className="space-y-1">
                {contact.university && (
                  <ContactField 
                    icon={GraduationCap} 
                    label="University" 
                    value={contact.university}
                  />
                )}
                {contact.major && (
                  <ContactField 
                    icon={GraduationCap} 
                    label="Major" 
                    value={`${contact.major}${contact.minor ? ` • Minor: ${contact.minor}` : ''}`}
                  />
                )}
                {contact.graduation_year && (
                  <ContactField 
                    icon={Calendar} 
                    label="Graduated" 
                    value={contact.graduation_year.toString()}
                  />
                )}
              </div>
            </div>
          )}

          {/* Personal */}
          {(contact.birthday || contact.how_met || contact.hobbies_interests) && (
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-gray-900 mb-6 tracking-wide uppercase">Personal</h2>
              <div className="space-y-1">
                {contact.birthday && (
                  <ContactField 
                    icon={Gift} 
                    label="Birthday" 
                    value={new Date(contact.birthday).toLocaleDateString()}
                  />
                )}
                {contact.how_met && (
                  <div className="py-4">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">How We Met</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{contact.how_met}</p>
                  </div>
                )}
                {contact.hobbies_interests && (
                  <div className="py-4">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Interests</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{contact.hobbies_interests}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Media */}
          {(contact.linkedin || contact.twitter || contact.facebook || contact.instagram) && (
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-gray-900 mb-6 tracking-wide uppercase">Social</h2>
              <div className="space-y-1">
                {contact.linkedin && (
                  <ContactField 
                    icon={Linkedin} 
                    label="LinkedIn" 
                    value={contact.linkedin}
                    href={contact.linkedin}
                  />
                )}
                {contact.twitter && (
                  <ContactField 
                    icon={MessageSquare} 
                    label="Twitter" 
                    value={`@${contact.twitter}`}
                    href={`https://twitter.com/${contact.twitter}`}
                  />
                )}
                {contact.facebook && (
                  <ContactField 
                    icon={Facebook} 
                    label="Facebook" 
                    value={contact.facebook}
                    href={contact.facebook}
                  />
                )}
                {contact.instagram && (
                  <ContactField 
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

          {/* Recent Activity */}
          {interactions && interactions.length > 0 && (
            <div className="space-y-6">
              <h2 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">Recent Activity</h2>
              <div className="space-y-4">
                {interactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 5)
                  .map((interaction) => (
                    <div key={interaction.id} className="flex gap-4 py-4">
                      <div className="flex-shrink-0 mt-1">
                        {getInteractionIcon(interaction.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {interaction.type}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(interaction.date), { addSuffix: true })}
                          </span>
                        </div>
                        {interaction.notes && (
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {interaction.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
