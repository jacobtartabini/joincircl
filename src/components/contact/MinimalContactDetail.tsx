
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Contact, Interaction } from "@/types/contact";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { ArrowLeft, Phone, Mail, MapPin, Edit, Trash, MessageSquare, Calendar, Coffee, Hash, User, MoreVertical, Building, GraduationCap, Gift, Globe } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";

interface MinimalContactDetailProps {
  contact: Contact;
  interactions: Interaction[];
  onEdit: () => void;
  onDelete: () => void;
}

export function MinimalContactDetail({
  contact,
  interactions,
  onEdit,
  onDelete
}: MinimalContactDetailProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showActions, setShowActions] = useState(false);

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/circles');
    }
  };

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

  const getCircleColor = (circle: string) => {
    switch (circle) {
      case 'inner':
        return 'bg-green-500';
      case 'middle':
        return 'bg-yellow-500';
      case 'outer':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
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
      <div className="unified-button flex items-center gap-3 py-3 px-4 transition-all duration-200 hover:bg-white/30 dark:hover:bg-white/5 rounded-xl">
        <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-base font-medium text-foreground block truncate">{value}</span>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </div>
    );

    if (href) {
      return <a href={href} target="_blank" rel="noopener noreferrer" className="block">{content}</a>;
    }
    return content;
  };

  return (
    <div className="min-h-screen refined-web-theme">
      <div className="h-full flex flex-col">
        {/* Header with back button and actions */}
        <div className="glass-card-enhanced flex items-center justify-between p-4 sticky top-0 z-10">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack} 
            className="unified-button p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowActions(!showActions)} 
              className="unified-button p-2"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
            
            {showActions && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="absolute right-0 top-12 unified-modal p-2 z-20 min-w-[120px]"
              >
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { onEdit(); setShowActions(false); }} 
                  className="unified-button w-full justify-start text-left p-2 h-auto"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { onDelete(); setShowActions(false); }} 
                  className="unified-button w-full justify-start text-left p-2 h-auto text-destructive hover:text-destructive"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {/* Contact Header */}
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <Avatar className="h-20 w-20 mx-auto border-2 border-white/20 dark:border-white/10">
                  {contact.avatar_url ? (
                    <AvatarImage src={contact.avatar_url} alt={contact.name} />
                  ) : (
                    <AvatarFallback className="text-xl bg-gradient-to-br from-[#0daeec] to-[#0daeec]/70 text-white font-medium">
                      {contact.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className={cn("absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-card", getCircleColor(contact.circle || 'outer'))} />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {contact.name}
                </h1>
                {contact.job_title && contact.company_name && (
                  <p className="text-lg text-muted-foreground font-medium">
                    {contact.job_title} at {contact.company_name}
                  </p>
                )}
                {contact.location && (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {contact.location}
                  </p>
                )}
                <Badge variant="secondary" className="text-sm bg-[#0daeec]/10 text-[#0daeec] border border-[#0daeec]/20">
                  {contact.circle.charAt(0).toUpperCase() + contact.circle.slice(1)} Circle
                </Badge>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="grid grid-cols-2 gap-3">
              {contact.personal_email && (
                <Button 
                  onClick={() => window.open(`mailto:${contact.personal_email}`)} 
                  className="unified-button h-12 flex items-center gap-2 rounded-xl bg-[#0daeec] hover:bg-[#0daeec]/90 text-white"
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
              )}
              {contact.mobile_phone && (
                <Button 
                  variant="outline"
                  onClick={() => window.open(`tel:${contact.mobile_phone}`)} 
                  className="unified-button h-12 flex items-center gap-2 rounded-xl"
                >
                  <Phone className="h-4 w-4" />
                  Call
                </Button>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              
              {/* About Tab Content */}
              <TabsContent value="about" className="space-y-4 mt-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Contact Information</h2>
                  <div className="unified-container space-y-2 p-4 rounded-xl">
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
                {(contact.company_name || contact.job_title || contact.industry || contact.department) && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Professional</h2>
                    <div className="unified-container space-y-2 p-4 rounded-xl">
                      {contact.company_name && (
                        <ContactInfoItem 
                          icon={Building} 
                          label="Company" 
                          value={contact.company_name} 
                        />
                      )}
                      {contact.job_title && (
                        <ContactInfoItem 
                          icon={User} 
                          label="Job Title" 
                          value={contact.job_title} 
                        />
                      )}
                      {contact.industry && (
                        <ContactInfoItem 
                          icon={User} 
                          label="Industry" 
                          value={contact.industry} 
                        />
                      )}
                      {contact.department && (
                        <ContactInfoItem 
                          icon={User} 
                          label="Department" 
                          value={contact.department} 
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Education */}
                {(contact.university || contact.major || contact.minor || contact.graduation_year) && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Education</h2>
                    <div className="unified-container space-y-2 p-4 rounded-xl">
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
                    <h2 className="text-lg font-semibold text-foreground">Personal</h2>
                    <div className="unified-container space-y-3 p-4 rounded-xl">
                      {contact.birthday && (
                        <ContactInfoItem 
                          icon={Gift} 
                          label="Birthday" 
                          value={format(new Date(contact.birthday), 'MMM dd, yyyy')} 
                        />
                      )}
                      {contact.how_met && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">How We Met</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{contact.how_met}</p>
                        </div>
                      )}
                      {contact.hobbies_interests && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">Interests</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{contact.hobbies_interests}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {contact.tags && contact.tags.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {contact.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="rounded-full bg-[#0daeec]/10 text-[#0daeec] border border-[#0daeec]/20">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {contact.notes && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Notes</h2>
                    <div className="unified-container p-4 rounded-xl">
                      <p className="text-foreground leading-relaxed">{contact.notes}</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Timeline Tab Content */}
              <TabsContent value="timeline" className="mt-6">
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                  {interactions.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                      <p>No recent interactions</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {interactions.map((interaction) => (
                        <div key={interaction.id} className="unified-container flex gap-3 p-4 rounded-xl">
                          <div className="flex-shrink-0 mt-1">
                            {getInteractionIcon(interaction.type)}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-foreground">
                                {interaction.type.charAt(0).toUpperCase() + interaction.type.slice(1)}
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(interaction.date), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{interaction.notes}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
