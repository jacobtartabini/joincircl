
import { Contact } from "@/types/contact";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CircleBadge, getCircleName } from "@/components/ui/circle-badge";
import { format } from "date-fns";
import { Calendar, Mail, Phone, MapPin, Briefcase, GraduationCap, Instagram, Twitter } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ContactInfoProps {
  contact: Contact;
}

export default function ContactInfo({ contact }: ContactInfoProps) {
  // Group media by type for display
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-medium">
              {contact.avatar_url ? <img src={contact.avatar_url} alt={contact.name} className="w-full h-full object-cover rounded-full" /> : contact.name.charAt(0).toUpperCase()}
            </div>
            <CircleBadge type={contact.circle} className="absolute -bottom-1 -right-1 border-2 border-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{contact.name}</h1>
            <p className="text-muted-foreground">{getCircleName(contact.circle)} Circle</p>
            
            {/* Tags below name */}
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {contact.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">BASIC INFORMATION</h3>
          
          {contact.personal_email && <div className="flex items-center gap-2">
              <Mail size={18} className="text-muted-foreground" />
              <span>{contact.personal_email}</span>
            </div>}
          
          {contact.mobile_phone && <div className="flex items-center gap-2">
              <Phone size={18} className="text-muted-foreground" />
              <span>{contact.mobile_phone}</span>
            </div>}
          
          {contact.location && <div className="flex items-center gap-2">
              <MapPin size={18} className="text-muted-foreground" />
              <span>{contact.location}</span>
            </div>}
          
          {contact.last_contact && <div className="flex items-center gap-2">
              <Calendar size={18} className="text-muted-foreground" />
              <span>Last contacted: {format(new Date(contact.last_contact), 'PPP')}</span>
            </div>}
          
          {contact.birthday && <div className="flex items-center gap-2">
              <Calendar size={18} className="text-muted-foreground" />
              <span>Birthday: {format(new Date(contact.birthday), 'PPP')}</span>
            </div>}
          
          {contact.website && <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" x2="22" y1="12" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {contact.website}
              </a>
            </div>}
          
          <div className="flex flex-wrap gap-2 mt-4">
            {contact.linkedin && <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 text-xs hover:bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                LinkedIn
              </a>}
            
            {contact.facebook && <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 text-xs hover:bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                Facebook
              </a>}

            {contact.twitter && <a href={contact.twitter} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 text-xs hover:bg-blue-100">
                <Twitter size={14} className="mr-1" />
                Twitter
              </a>}

            {contact.instagram && <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 text-xs hover:bg-blue-100">
                <Instagram size={14} className="mr-1" />
                Instagram
              </a>}
          </div>
        </div>
        
        {/* Professional Information */}
        {(contact.company_name || contact.job_title || contact.industry || contact.department || contact.work_address) && <div className="mt-6">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4">PROFESSIONAL INFORMATION</h3>
            
            <div className="space-y-3">
              {contact.company_name && <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-muted-foreground" />
                  <div>
                    <span className="font-medium">{contact.company_name}</span>
                    {contact.job_title && <span className="ml-1">• {contact.job_title}</span>}
                  </div>
                </div>}
              
              {contact.industry && !contact.company_name && !contact.job_title && <div className="flex items-center gap-2">
                  <Briefcase size={18} className="text-muted-foreground" />
                  <span>{contact.industry}{contact.department ? ` • ${contact.department}` : ''}</span>
                </div>}
              
              {contact.industry && (contact.company_name || contact.job_title) && <div className="flex items-start gap-2">
                  <div className="w-[18px]"></div>
                  <div>
                    <span>{contact.industry}{contact.department ? ` • ${contact.department}` : ''}</span>
                  </div>
                </div>}
              
              {contact.work_address && <div className="flex items-start gap-2">
                  <MapPin size={18} className="text-muted-foreground mt-0.5" />
                  <span className="whitespace-pre-wrap">{contact.work_address}</span>
                </div>}
            </div>
          </div>}
        
        {/* Education Information */}
        {(contact.university || contact.major || contact.minor || contact.graduation_year) && <div className="mt-6">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4">EDUCATION</h3>
            
            <div className="space-y-3">
              {contact.university && <div className="flex items-center gap-2">
                  <GraduationCap size={18} className="text-muted-foreground" />
                  <span className="font-medium">{contact.university}</span>
                </div>}
              
              {(contact.major || contact.minor) && <div className="flex items-start gap-2">
                  <div className="w-[18px]"></div>
                  <div>
                    {contact.major && <span>{contact.major}</span>}
                    {contact.major && contact.minor && <span> / </span>}
                    {contact.minor && <span>{contact.minor}</span>}
                  </div>
                </div>}
              
              {contact.graduation_year && <div className="flex items-start gap-2">
                  <div className="w-[18px]"></div>
                  <div>
                    <span>Class of {contact.graduation_year}</span>
                  </div>
                </div>}
            </div>
          </div>}

        {/* Relational Context */}
        {(contact.how_met || contact.hobbies_interests) && <div className="mt-6">
            <h3 className="font-semibold text-sm text-muted-foreground mb-4">RELATIONAL CONTEXT</h3>
            
            <div className="space-y-3">
              {contact.how_met && <div>
                  <h4 className="font-medium mb-1">How You Met</h4>
                  <p className="text-sm whitespace-pre-wrap">{contact.how_met}</p>
                </div>}
              
              {contact.hobbies_interests && <div>
                  <h4 className="font-medium mb-1">Hobbies & Interests</h4>
                  <p className="text-sm whitespace-pre-wrap">{contact.hobbies_interests}</p>
                </div>}
            </div>
          </div>}
        
        {/* Notes */}
        {contact.notes && <div className="mt-6">
            <Separator className="mb-4" />
            <h3 className="font-semibold text-sm text-muted-foreground mb-2">NOTES</h3>
            <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
          </div>}
      </CardContent>
    </Card>
  );
}
