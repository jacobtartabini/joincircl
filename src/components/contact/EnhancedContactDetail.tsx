import { Phone, Mail, MapPin, Briefcase, Link as LinkIcon, Calendar, MessageSquare, Edit, Trash, Eye, Gift, GraduationCap, Facebook, Instagram, Linkedin } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Contact, Interaction } from "@/types/contact";
import { formatDistanceToNow } from "date-fns";
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
        return <Calendar className="h-4 w-4 text-blue-500" />;
      case "email":
        return <Mail className="h-4 w-4 text-green-500" />;
      case "phone":
        return <Phone className="h-4 w-4 text-amber-500" />;
      case "note":
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };
  return <div className="h-full flex flex-col bg-white">
      {/* Action Buttons Header */}
      <div className="panel-header">
        <div className="flex justify-end gap-2">
          {onEdit && <Button variant="outline" size="sm" onClick={onEdit} className="text-xs rounded-full">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>}
          {onDelete && <Button variant="outline" size="sm" onClick={onDelete} className="text-xs rounded-full">
              <Trash className="h-3 w-3 mr-1" />
              Delete
            </Button>}
          {onViewAll && <Button variant="outline" size="sm" onClick={onViewAll} className="text-xs rounded-full">
              <Eye className="h-3 w-3 mr-1" />
              View All
            </Button>}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="panel-content space-y-4">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center pb-4 border-b">
          <Avatar className="h-16 w-16 mb-3">
            {contact.avatar_url ? <AvatarImage src={contact.avatar_url} alt={contact.name} /> : <AvatarFallback className="text-lg font-medium">
                {contact.name.charAt(0)}
              </AvatarFallback>}
          </Avatar>
          
          <h2 className="text-lg font-semibold">{contact.name}</h2>
          
          {contact.location && <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center">
              <MapPin className="h-3 w-3 mr-1" />
              {contact.location}
            </p>}
          
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            <Badge variant="outline" className="rounded-full text-xs">
              {contact.circle.charAt(0).toUpperCase() + contact.circle.slice(1)} Circle
            </Badge>
            
            {contact.tags && contact.tags.map(tag => <Badge key={tag} variant="secondary" className="rounded-full text-xs">
                {tag}
              </Badge>)}
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Contact Details</h3>
          
          <div className="space-y-2">
            {contact.personal_email && <div className="flex items-center gap-3">
                <div className="bg-green-100 p-1.5 rounded-full flex-shrink-0">
                  <Mail className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-sm truncate">{contact.personal_email}</span>
              </div>}
            
            {contact.mobile_phone && <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-1.5 rounded-full flex-shrink-0">
                  <Phone className="h-3 w-3 text-gray-600" />
                </div>
                <span className="text-sm">{contact.mobile_phone}</span>
              </div>}

            {contact.birthday && <div className="flex items-center gap-3">
                <div className="bg-pink-100 p-1.5 rounded-full flex-shrink-0">
                  <Gift className="h-3 w-3 text-pink-600" />
                </div>
                <span className="text-sm">{new Date(contact.birthday).toLocaleDateString()}</span>
              </div>}

            {contact.website && <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0">
                  <LinkIcon className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-sm truncate">{contact.website}</span>
              </div>}
          </div>
        </div>
        
        {/* Professional Info */}
        {(contact.job_title || contact.company_name || contact.industry || contact.department || contact.work_address) && <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Professional</h3>
            
            <div className="space-y-2">
              {contact.job_title && contact.company_name && <div className="flex items-start gap-2">
                  <Briefcase className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{contact.job_title} at {contact.company_name}</span>
                </div>}
              
              {contact.industry && <div className="text-sm text-muted-foreground pl-5">
                  Industry: {contact.industry}
                </div>}

              {contact.department && <div className="text-sm text-muted-foreground pl-5">
                  Department: {contact.department}
                </div>}

              {contact.work_address && <div className="text-sm text-muted-foreground pl-5">
                  Office: {contact.work_address}
                </div>}
            </div>
          </div>}

        {/* Education */}
        {(contact.university || contact.major || contact.minor || contact.graduation_year) && <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Education</h3>
            
            <div className="space-y-2">
              {contact.university && <div className="flex items-start gap-2">
                  <GraduationCap className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div>{contact.university}</div>
                    {contact.major && <div className="text-muted-foreground">
                        Major: {contact.major}
                        {contact.minor && ` • Minor: ${contact.minor}`}
                      </div>}
                    {contact.graduation_year && <div className="text-muted-foreground">
                        Graduated: {contact.graduation_year}
                      </div>}
                  </div>
                </div>}
            </div>
          </div>}

        {/* Social Media */}
        {(contact.linkedin || contact.twitter || contact.facebook || contact.instagram) && <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Social Media</h3>
            
            <div className="space-y-2">
              {contact.linkedin && <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0">
                    <Linkedin className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-sm truncate">{contact.linkedin}</span>
                </div>}

              {contact.twitter && <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </div>
                  <span className="text-sm">@{contact.twitter}</span>
                </div>}

              {contact.facebook && <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-1.5 rounded-full flex-shrink-0">
                    <Facebook className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-sm truncate">{contact.facebook}</span>
                </div>}

              {contact.instagram && <div className="flex items-center gap-3">
                  <div className="bg-pink-100 p-1.5 rounded-full flex-shrink-0">
                    <Instagram className="h-3 w-3 text-pink-600" />
                  </div>
                  <span className="text-sm">@{contact.instagram}</span>
                </div>}
            </div>
          </div>}

        {/* Notes */}
        {contact.notes && <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Notes</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{contact.notes}</p>
          </div>}

        {/* How We Met */}
        {contact.how_met && <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">How We Met</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{contact.how_met}</p>
          </div>}

        {/* Hobbies & Interests */}
        {contact.hobbies_interests && <div className="space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Hobbies & Interests</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{contact.hobbies_interests}</p>
          </div>}
        
        {/* Timeline Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">Recent Timeline</h3>
          
          {interactions && interactions.length > 0 ? <div className="space-y-3">
              {interactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3) // Show only the 3 most recent
          .map(interaction => <div key={interaction.id} className="flex gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      {getInteractionIcon(interaction.type)}
                    </div>
                    
                    <div className="flex-1 space-y-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{interaction.type}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatDistanceToNow(new Date(interaction.date), {
                    addSuffix: true
                  })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{interaction.notes || "No notes"}</p>
                    </div>
                  </div>)}
              {interactions.length > 3 && onViewAll && <Button variant="ghost" size="sm" className="w-full text-xs mt-2" onClick={onViewAll}>
                  View All {interactions.length} Interactions
                </Button>}
            </div> : <p className="text-sm text-muted-foreground">No recent interactions.</p>}
        </div>
      </div>
    </div>;
}