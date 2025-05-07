
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleBadge, getCircleName } from "@/components/ui/circle-badge";
import { format } from "date-fns";
import { contactService } from "@/services/contactService";
import { keystoneService } from "@/services/keystoneService";
import { contactMediaService } from "@/services/contactMediaService";
import { Contact, Interaction, ContactMedia } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { useToast } from "@/hooks/use-toast";
import ConnectionInsights from "@/components/contact/ConnectionInsights";
import { calculateConnectionStrength } from "@/utils/connectionStrength";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContactForm from "@/components/contact/ContactForm";
import KeystoneForm from "@/components/keystone/KeystoneForm";
import InteractionForm from "@/components/interaction/InteractionForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar, Mail, Phone, Edit, Trash, PlusCircle, Briefcase, GraduationCap, MapPin, Instagram, Twitter, FileImage, File, ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import KeystoneDetailModal from "@/components/keystone/KeystoneDetailModal";
import InteractionDetailModal from "@/components/interaction/InteractionDetailModal";

export default function ContactDetail() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [keystones, setKeystones] = useState<Keystone[]>([]);
  const [contactMedia, setContactMedia] = useState<ContactMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddKeystoneDialogOpen, setIsAddKeystoneDialogOpen] = useState(false);
  const [isEditKeystoneDialogOpen, setIsEditKeystoneDialogOpen] = useState(false);
  const [selectedKeystone, setSelectedKeystone] = useState<Keystone | null>(null);
  const [isAddInteractionDialogOpen, setIsAddInteractionDialogOpen] = useState(false);
  const [isEditInteractionDialogOpen, setIsEditInteractionDialogOpen] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [expandedKeystoneId, setExpandedKeystoneId] = useState<string | null>(null);
  const [expandedInteractionId, setExpandedInteractionId] = useState<string | null>(null);
  const [isDeleteKeystoneDialogOpen, setIsDeleteKeystoneDialogOpen] = useState(false);
  const [isDeleteInteractionDialogOpen, setIsDeleteInteractionDialogOpen] = useState(false);
  const [isKeystoneDetailOpen, setIsKeystoneDetailOpen] = useState(false);
  const [isInteractionDetailOpen, setIsInteractionDetailOpen] = useState(false);

  useEffect(() => {
    async function loadContactData() {
      if (!id) return;
      setLoading(true);
      try {
        const contactData = await contactService.getContact(id);
        const interactionsData = await contactService.getInteractionsByContactId(id);
        const keystonesData = await keystoneService.getKeystonesByContactId(id);
        let mediaData: ContactMedia[] = [];
        try {
          mediaData = await contactMediaService.getContactMedia(id);
        } catch (error) {
          console.error("Error loading contact media:", error);
          // Don't fail the entire page load if media loading fails
        }
        setContact(contactData);
        setInteractions(interactionsData);
        setKeystones(keystonesData);
        setContactMedia(mediaData);
      } catch (error) {
        console.error("Error loading contact data:", error);
        toast({
          title: "Error",
          description: "Could not load contact data. Please try again.",
          variant: "destructive"
        });
        navigate("/circles");
      } finally {
        setLoading(false);
      }
    }
    loadContactData();
  }, [id, navigate, toast]);
  
  const handleDelete = async () => {
    if (!contact?.id) return;
    try {
      await contactService.deleteContact(contact.id);
      toast({
        title: "Contact deleted",
        description: "The contact has been successfully deleted."
      });
      navigate("/circles");
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteKeystone = async () => {
    if (!selectedKeystone?.id) return;
    try {
      await keystoneService.deleteKeystone(selectedKeystone.id);
      setKeystones(keystones.filter(k => k.id !== selectedKeystone.id));
      setIsDeleteKeystoneDialogOpen(false);
      setIsKeystoneDetailOpen(false);
      setSelectedKeystone(null);
      toast({
        title: "Keystone deleted",
        description: "The keystone has been successfully deleted."
      });
    } catch (error) {
      console.error("Error deleting keystone:", error);
      toast({
        title: "Error",
        description: "Failed to delete keystone. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteInteraction = async () => {
    if (!selectedInteraction?.id) return;
    try {
      // Assuming you have a deleteInteraction method in your service
      await contactService.deleteInteraction(selectedInteraction.id);
      setInteractions(interactions.filter(i => i.id !== selectedInteraction.id));
      setIsDeleteInteractionDialogOpen(false);
      setIsInteractionDetailOpen(false);
      setSelectedInteraction(null);
      toast({
        title: "Interaction deleted",
        description: "The interaction has been successfully deleted."
      });
    } catch (error) {
      console.error("Error deleting interaction:", error);
      toast({
        title: "Error",
        description: "Failed to delete interaction. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleContactUpdate = async (updatedContact: Contact, previousBirthday: string | undefined | null) => {
    if (!id) return;
    try {
      const refreshedContact = await contactService.getContact(id);
      setContact(refreshedContact);
      setIsEditDialogOpen(false);
      
      // Check if birthday was added or changed
      if (updatedContact.birthday && (!previousBirthday || updatedContact.birthday !== previousBirthday)) {
        // Check if there's already a birthday keystone for this contact
        const existingBirthdayKeystone = keystones.find(
          k => k.category === "Birthday" && k.contact_id === contact?.id
        );
        
        if (!existingBirthdayKeystone) {
          try {
            const birthdayDate = new Date(updatedContact.birthday);
            const currentYear = new Date().getFullYear();
            birthdayDate.setFullYear(currentYear);
            
            // If birthday has already passed this year, set for next year
            if (birthdayDate < new Date()) {
              birthdayDate.setFullYear(currentYear + 1);
            }
            
            await keystoneService.createKeystone({
              title: `${updatedContact.name}'s Birthday`,
              date: birthdayDate.toISOString(),
              contact_id: updatedContact.id,
              category: "Birthday",
              is_recurring: true,
              recurrence_frequency: "Yearly"
            });
            
            // Refresh keystones
            const updatedKeystones = await keystoneService.getKeystonesByContactId(id);
            setKeystones(updatedKeystones);
            
            toast({
              title: "Birthday reminder created",
              description: `A yearly reminder for ${updatedContact.name}'s birthday has been added.`
            });
          } catch (error) {
            console.error("Error creating birthday keystone:", error);
          }
        } else {
          // Update existing birthday keystone if date changed
          if (previousBirthday && updatedContact.birthday !== previousBirthday) {
            try {
              const birthdayDate = new Date(updatedContact.birthday);
              const existingDate = new Date(existingBirthdayKeystone.date);
              
              // Keep same month/day but update to current year
              birthdayDate.setFullYear(existingDate.getFullYear());
              
              await keystoneService.updateKeystone(existingBirthdayKeystone.id, {
                title: `${updatedContact.name}'s Birthday`,
                date: birthdayDate.toISOString()
              });
              
              // Refresh keystones
              const updatedKeystones = await keystoneService.getKeystonesByContactId(id);
              setKeystones(updatedKeystones);
            } catch (error) {
              console.error("Error updating birthday keystone:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing contact:", error);
    }
  };
  
  const handleKeystoneAdded = async () => {
    if (!id) return;
    try {
      const updatedKeystones = await keystoneService.getKeystonesByContactId(id);
      setKeystones(updatedKeystones);
      setIsAddKeystoneDialogOpen(false);
      setIsEditKeystoneDialogOpen(false);
      setSelectedKeystone(null);
    } catch (error) {
      console.error("Error refreshing keystones:", error);
    }
  };
  
  const handleInteractionAdded = async () => {
    if (!id) return;
    try {
      const updatedContact = await contactService.getContact(id);
      const updatedInteractions = await contactService.getInteractionsByContactId(id);
      setContact(updatedContact);
      setInteractions(updatedInteractions);
      setIsAddInteractionDialogOpen(false);
    } catch (error) {
      console.error("Error refreshing interactions:", error);
    }
  };

  const handleKeystoneClick = (keystone: Keystone) => {
    setSelectedKeystone(keystone);
    setIsKeystoneDetailOpen(true);
  };
  
  const handleInteractionClick = (interaction: Interaction) => {
    setSelectedInteraction(interaction);
    setIsInteractionDetailOpen(true);
  };
  
  const handleEditKeystone = () => {
    setIsKeystoneDetailOpen(false);
    setIsEditKeystoneDialogOpen(true);
  };
  
  const handleEditInteraction = () => {
    setIsInteractionDetailOpen(false);
    setIsEditInteractionDialogOpen(true);
    // Implement edit interaction logic
  };
  
  const connectionStrength = contact ? calculateConnectionStrength(contact, interactions) : null;
  
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading contact details...</p>
        </div>
      </div>;
  }
  
  if (!contact) {
    return <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Contact not found</h2>
        <p className="mb-6">The contact you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/circles">
          <Button>Back to Contacts</Button>
        </Link>
      </div>;
  }

  // Group media by type for display
  const images = contactMedia.filter(media => media.is_image);
  const documents = contactMedia.filter(media => !media.is_image);
  
  return <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <Link to="/circles" className="text-sm text-blue-600 hover:underline flex items-center">
          ← Back to Contacts
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit size={16} className="mr-1" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash size={16} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information Card */}
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
                
                {contact.tags && contact.tags.length > 0 && <div className="flex flex-wrap gap-2 mt-3">
                    {contact.tags.map(tag => <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {tag}
                      </span>)}
                  </div>}
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

              {/* Files & Images */}
              {(images.length > 0 || documents.length > 0) && <div className="mt-6">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-4">FILES & MEDIA</h3>
                  
                  {images.length > 0 && <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Images</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {images.map(image => <a key={image.id} href={image.url} target="_blank" rel="noopener noreferrer" className="block">
                            <img src={image.url} alt={image.file_name} className="h-24 w-full object-cover rounded border" />
                          </a>)}
                      </div>
                    </div>}
                  
                  {documents.length > 0 && <div>
                      <h4 className="text-sm font-medium mb-2">Documents</h4>
                      <div className="space-y-2">
                        {documents.map(doc => <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 border rounded hover:bg-muted/50">
                            <File size={16} className="mr-2 text-blue-600" />
                            <span className="text-sm truncate">{doc.file_name}</span>
                          </a>)}
                      </div>
                    </div>}
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
          
          {/* Keystones */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Keystones</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setIsAddKeystoneDialogOpen(true)}>
                <PlusCircle size={16} className="mr-1" />
                Add Keystone
              </Button>
            </CardHeader>
            <CardContent>
              {keystones.length === 0 ? <div className="text-center py-6 text-muted-foreground">
                  <p>No keystones added yet.</p>
                  <p className="text-sm">Add important events or milestones for this contact.</p>
                </div> : <div className="space-y-4">
                  {keystones.map(keystone => 
                    <div 
                      key={keystone.id}
                      className="flex gap-3 items-start hover:bg-muted/50 p-2 rounded-md transition-colors cursor-pointer"
                      onClick={() => handleKeystoneClick(keystone)}
                    >
                      <div className="bg-blue-100 text-blue-800 p-2 rounded-md flex-shrink-0">
                        <Calendar size={16} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{keystone.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(keystone.date), 'PPP')}
                          {keystone.category && ` · ${keystone.category}`}
                          {keystone.is_recurring && ` · Recurring (${keystone.recurrence_frequency})`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>}
            </CardContent>
          </Card>
          
          {/* Interactions */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Interactions</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setIsAddInteractionDialogOpen(true)}>
                <PlusCircle size={16} className="mr-1" />
                Log Interaction
              </Button>
            </CardHeader>
            <CardContent>
              {interactions.length === 0 ? <div className="text-center py-6 text-muted-foreground">
                  <p>No interactions logged yet.</p>
                  <p className="text-sm">Log calls, emails, meetings, or any other interactions.</p>
                </div> : <div className="space-y-4">
                  {interactions.map(interaction => 
                    <div 
                      key={interaction.id}
                      className="flex w-full justify-between items-start hover:bg-muted/50 p-2 rounded-md transition-colors cursor-pointer"
                      onClick={() => handleInteractionClick(interaction)}
                    >
                      <div className="flex items-start">
                        <p className="font-medium capitalize">{interaction.type}</p>
                        <p className="text-sm text-muted-foreground ml-2 py-[2px]">
                          {format(new Date(interaction.date), 'PPP')}
                        </p>
                      </div>
                      <ChevronDown size={16} />
                    </div>
                  )}
                </div>}
            </CardContent>
          </Card>
        </div>
        
        <div>
          {/* Connection Insights */}
          {connectionStrength && <ConnectionInsights strength={connectionStrength} />}
          
          {/* Placeholder for future additional widgets */}
        </div>
      </div>
      
      {/* Edit Contact Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <ContactForm 
            contact={contact} 
            onSuccess={(updatedContact) => handleContactUpdate(updatedContact, contact.birthday)} 
            onCancel={() => setIsEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Add Keystone Dialog */}
      <Dialog open={isAddKeystoneDialogOpen} onOpenChange={setIsAddKeystoneDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Keystone</DialogTitle>
          </DialogHeader>
          <KeystoneForm contact={contact} onSuccess={handleKeystoneAdded} onCancel={() => setIsAddKeystoneDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Keystone Dialog */}
      <Dialog open={isEditKeystoneDialogOpen} onOpenChange={setIsEditKeystoneDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Keystone</DialogTitle>
          </DialogHeader>
          <KeystoneForm keystone={selectedKeystone || undefined} contact={contact} onSuccess={handleKeystoneAdded} onCancel={() => {
            setIsEditKeystoneDialogOpen(false);
            setSelectedKeystone(null);
          }} />
        </DialogContent>
      </Dialog>
      
      {/* Add Interaction Dialog */}
      <Dialog open={isAddInteractionDialogOpen} onOpenChange={setIsAddInteractionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Interaction</DialogTitle>
          </DialogHeader>
          <InteractionForm contact={contact} onSuccess={handleInteractionAdded} onCancel={() => setIsAddInteractionDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Delete Contact Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              contact "{contact.name}" and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Keystone Detail Modal */}
      <KeystoneDetailModal
        keystone={selectedKeystone}
        isOpen={isKeystoneDetailOpen}
        onOpenChange={setIsKeystoneDetailOpen}
        onEdit={handleEditKeystone}
        onDelete={handleDeleteKeystone}
      />
      
      {/* Interaction Detail Modal */}
      <InteractionDetailModal
        interaction={selectedInteraction}
        isOpen={isInteractionDetailOpen}
        onOpenChange={setIsInteractionDetailOpen}
        onEdit={handleEditInteraction}
        onDelete={() => {
          // Fix: Wrap the async function call in a synchronous function
          // This ensures we return void instead of Promise<void>
          handleDeleteInteraction().catch(error => {
            console.error("Error in delete interaction handler:", error);
            toast({
              title: "Error",
              description: "Failed to delete interaction. Please try again.",
              variant: "destructive"
            });
          });
        }}
      />
    </div>;
}
