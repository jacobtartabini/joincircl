
import { Phone, Mail, MapPin, Briefcase, Link as LinkIcon, Calendar, MessageSquare, Edit, Trash, Eye, Gift, GraduationCap, Facebook, Instagram, Linkedin } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Contact, Interaction } from "@/types/contact";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EnhancedContactDetailProps {
  contact: Contact;
  interactions?: Interaction[];
  onEdit?: () => void;
  onDelete?: () => void;
  onViewAll?: () => void;
}

export function EnhancedContactDetail({
  contact,
  interactions = [],
  onEdit,
  onDelete,
  onViewAll
}: EnhancedContactDetailProps) {
  const getInteractionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "meeting":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "email":
        return <Mail className="h-4 w-4 text-green-600" />;
      case "phone":
        return <Phone className="h-4 w-4 text-amber-600" />;
      case "note":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header with Actions */}
      <div className="border-b border-gray-100 p-6">
        <div className="flex justify-end gap-2">
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit} 
              className="h-8 px-3 text-xs font-medium border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onDelete} 
              className="h-8 px-3 text-xs font-medium border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash className="h-3.5 w-3.5 mr-1.5" />
              Delete
            </Button>
          )}
          {onViewAll && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewAll} 
              className="h-8 px-3 text-xs font-medium border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View All
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* Profile Header */}
          <div className="text-center pb-6 border-b border-gray-100">
            <Avatar className="h-16 w-16 mx-auto mb-4">
              {contact.avatar_url ? (
                <AvatarImage src={contact.avatar_url} alt={contact.name} />
              ) : (
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {contact.name.charAt(0)}
                </AvatarFallback>
              )}
            </Avatar>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{contact.name}</h2>
            
            {contact.location && (
              <p className="text-sm text-gray-600 mb-3 flex items-center justify-center">
                <MapPin className="h-4 w-4 mr-1.5" />
                {contact.location}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-medium">
                {contact.circle.charAt(0).toUpperCase() + contact.circle.slice(1)} Circle
              </Badge>
              
              {contact.tags && contact.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 text-xs font-medium">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contact Details</h3>
              
              <div className="space-y-3">
                {contact.personal_email && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <Mail className="h-4 w-4 text-green-700" />
                    </div>
                    <span className="text-sm text-gray-900 font-medium">{contact.personal_email}</span>
                  </div>
                )}
                
                {contact.mobile_phone && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Phone className="h-4 w-4 text-blue-700" />
                    </div>
                    <span className="text-sm text-gray-900 font-medium">{contact.mobile_phone}</span>
                  </div>
                )}

                {contact.birthday && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                    <div className="bg-pink-100 p-2 rounded-lg">
                      <Gift className="h-4 w-4 text-pink-700" />
                    </div>
                    <span className="text-sm text-gray-900 font-medium">{new Date(contact.birthday).toLocaleDateString()}</span>
                  </div>
                )}

                {contact.website && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <LinkIcon className="h-4 w-4 text-purple-700" />
                    </div>
                    <span className="text-sm text-gray-900 font-medium truncate">{contact.website}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Professional Info */}
            {(contact.job_title || contact.company_name || contact.industry || contact.department || contact.work_address) && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Professional</h3>
                
                <div className="bg-gray-50 p-4 space-y-3 rounded-xl">
                  {contact.job_title && contact.company_name && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="h-4 w-4 text-gray-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{contact.job_title}</p>
                        <p className="text-sm text-gray-600">{contact.company_name}</p>
                      </div>
                    </div>
                  )}
                  
                  {contact.industry && (
                    <div className="text-sm text-gray-600 pl-7">
                      <span className="font-medium">Industry:</span> {contact.industry}
                    </div>
                  )}

                  {contact.department && (
                    <div className="text-sm text-gray-600 pl-7">
                      <span className="font-medium">Department:</span> {contact.department}
                    </div>
                  )}

                  {contact.work_address && (
                    <div className="text-sm text-gray-600 pl-7">
                      <span className="font-medium">Office:</span> {contact.work_address}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education */}
            {(contact.university || contact.major || contact.minor || contact.graduation_year) && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Education</h3>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  {contact.university && (
                    <div className="flex items-start gap-3">
                      <GraduationCap className="h-4 w-4 text-gray-600 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">{contact.university}</p>
                        {contact.major && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Major:</span> {contact.major}
                            {contact.minor && ` • Minor: ${contact.minor}`}
                          </p>
                        )}
                        {contact.graduation_year && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Graduated:</span> {contact.graduation_year}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Media */}
            {(contact.linkedin || contact.twitter || contact.facebook || contact.instagram) && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Social Media</h3>
                
                <div className="space-y-3">
                  {contact.linkedin && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Linkedin className="h-4 w-4 text-blue-700" />
                      </div>
                      <span className="text-sm text-gray-900 font-medium truncate">{contact.linkedin}</span>
                    </div>
                  )}

                  {contact.twitter && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                      <div className="bg-sky-100 p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-700">
                          <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                        </svg>
                      </div>
                      <span className="text-sm text-gray-900 font-medium">@{contact.twitter}</span>
                    </div>
                  )}

                  {contact.facebook && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Facebook className="h-4 w-4 text-blue-700" />
                      </div>
                      <span className="text-sm text-gray-900 font-medium truncate">{contact.facebook}</span>
                    </div>
                  )}

                  {contact.instagram && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg">
                      <div className="bg-pink-100 p-2 rounded-lg">
                        <Instagram className="h-4 w-4 text-pink-700" />
                      </div>
                      <span className="text-sm text-gray-900 font-medium">@{contact.instagram}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes */}
            {contact.notes && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-700 leading-relaxed">{contact.notes}</p>
                </div>
              </div>
            )}

            {/* How We Met */}
            {contact.how_met && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">How We Met</h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-700 leading-relaxed">{contact.how_met}</p>
                </div>
              </div>
            )}

            {/* Hobbies & Interests */}
            {contact.hobbies_interests && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Hobbies & Interests</h3>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-700 leading-relaxed">{contact.hobbies_interests}</p>
                </div>
              </div>
            )}
            
            {/* Timeline Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Recent Timeline</h3>
              
              {interactions && interactions.length > 0 ? (
                <div className="space-y-3">
                  {interactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 3)
                    .map(interaction => (
                      <div key={interaction.id} className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 pt-1">
                            {getInteractionIcon(interaction.type)}
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                              <span className="font-medium text-sm text-gray-900">{interaction.type}</span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(interaction.date), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{interaction.notes || "No notes"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {interactions.length > 3 && onViewAll && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium" 
                      onClick={onViewAll}
                    >
                      View All {interactions.length} Interactions
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No recent interactions.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
