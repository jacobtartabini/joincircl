import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleBadge, getCircleName } from "@/components/ui/circle-badge";
import { format } from "date-fns";
import { contactService } from "@/services/contactService";
import { keystoneService } from "@/services/keystoneService";
import { Contact, Interaction } from "@/types/contact";
import { Keystone } from "@/types/keystone";
import { useToast } from "@/hooks/use-toast";
import ConnectionInsights from "@/components/contact/ConnectionInsights";
import { calculateConnectionStrength } from "@/utils/connectionStrength";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ContactForm from "@/components/contact/ContactForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Calendar, Mail, Phone, Edit, Trash, PlusCircle, Briefcase, GraduationCap, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contact, setContact] = useState<Contact | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [keystones, setKeystones] = useState<Keystone[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  useEffect(() => {
    async function loadContactData() {
      if (!id) return;
      
      setLoading(true);
      try {
        const contactData = await contactService.getContact(id);
        const interactionsData = await contactService.getInteractionsByContactId(id);
        const keystonesData = await keystoneService.getKeystonesByContactId(id);
        
        setContact(contactData);
        setInteractions(interactionsData);
        setKeystones(keystonesData);
      } catch (error) {
        console.error("Error loading contact data:", error);
        toast({
          title: "Error",
          description: "Could not load contact data. Please try again.",
          variant: "destructive",
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
        description: "The contact has been successfully deleted.",
      });
      navigate("/circles");
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const connectionStrength = contact ? calculateConnectionStrength(contact, interactions) : null;
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading contact details...</p>
        </div>
      </div>
    );
  }
  
  if (!contact) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Contact not found</h2>
        <p className="mb-6">The contact you're looking for doesn't exist or you don't have access to it.</p>
        <Link to="/circles">
          <Button>Back to Contacts</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <Link to="/circles" className="text-sm text-blue-600 hover:underline flex items-center">
          ← Back to Contacts
        </Link>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit size={16} className="mr-1" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
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
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <CircleBadge 
                    type={contact.circle} 
                    className="absolute -bottom-1 -right-1 border-2 border-white w-7 h-7"
                  />
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
                
                {contact.personal_email && (
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-muted-foreground" />
                    <span>{contact.personal_email}</span>
                  </div>
                )}
                
                {contact.mobile_phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-muted-foreground" />
                    <span>{contact.mobile_phone}</span>
                  </div>
                )}
                
                {contact.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-muted-foreground" />
                    <span>{contact.location}</span>
                  </div>
                )}
                
                {contact.last_contact && (
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-muted-foreground" />
                    <span>Last contacted: {format(new Date(contact.last_contact), 'PPP')}</span>
                  </div>
                )}
                
                {contact.birthday && (
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-muted-foreground" />
                    <span>Birthday: {format(new Date(contact.birthday), 'PPP')}</span>
                  </div>
                )}
                
                {contact.website && (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" x2="22" y1="12" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {contact.website}
                    </a>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2 mt-4">
                  {contact.linkedin && (
                    <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 text-xs hover:bg-blue-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                        <rect width="4" height="12" x="2" y="9" />
                        <circle cx="4" cy="4" r="2" />
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  
                  {contact.facebook && (
                    <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 text-xs hover:bg-blue-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                      Facebook
                    </a>
                  )}
                </div>
                
                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {contact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Professional Information */}
              {(contact.company_name || contact.job_title || contact.industry || contact.department || contact.work_address) && (
                <div className="mt-6">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-4">PROFESSIONAL INFORMATION</h3>
                  
                  <div className="space-y-3">
                    {contact.company_name && (
                      <div className="flex items-center gap-2">
                        <Briefcase size={18} className="text-muted-foreground" />
                        <div>
                          <span className="font-medium">{contact.company_name}</span>
                          {contact.job_title && <span className="ml-1">• {contact.job_title}</span>}
                        </div>
                      </div>
                    )}
                    
                    {contact.industry && !contact.company_name && !contact.job_title && (
                      <div className="flex items-center gap-2">
                        <Briefcase size={18} className="text-muted-foreground" />
                        <span>{contact.industry}{contact.department ? ` • ${contact.department}` : ''}</span>
                      </div>
                    )}
                    
                    {(contact.industry && (contact.company_name || contact.job_title)) && (
                      <div className="flex items-start gap-2">
                        <div className="w-[18px]"></div>
                        <div>
                          <span>{contact.industry}{contact.department ? ` • ${contact.department}` : ''}</span>
                        </div>
                      </div>
                    )}
                    
                    {contact.work_address && (
                      <div className="flex items-start gap-2">
                        <MapPin size={18} className="text-muted-foreground mt-0.5" />
                        <span className="whitespace-pre-wrap">{contact.work_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Education Information */}
              {(contact.university || contact.major || contact.minor || contact.graduation_year) && (
                <div className="mt-6">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-4">EDUCATION</h3>
                  
                  <div className="space-y-3">
                    {contact.university && (
                      <div className="flex items-center gap-2">
                        <GraduationCap size={18} className="text-muted-foreground" />
                        <span className="font-medium">{contact.university}</span>
                      </div>
                    )}
                    
                    {(contact.major || contact.minor) && (
                      <div className="flex items-start gap-2">
                        <div className="w-[18px]"></div>
                        <div>
                          {contact.major && <span>{contact.major}</span>}
                          {contact.major && contact.minor && <span> / </span>}
                          {contact.minor && <span>{contact.minor}</span>}
                        </div>
                      </div>
                    )}
                    
                    {contact.graduation_year && (
                      <div className="flex items-start gap-2">
                        <div className="w-[18px]"></div>
                        <div>
                          <span>Class of {contact.graduation_year}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Relational Context */}
              {contact.how_met && (
                <div className="mt-6">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-4">RELATIONAL CONTEXT</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1">How You Met</h4>
                      <p className="text-sm whitespace-pre-wrap">{contact.how_met}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Notes */}
              {contact.notes && (
                <div className="mt-6">
                  <Separator className="mb-4" />
                  <h3 className="font-semibold text-sm text-muted-foreground mb-2">NOTES</h3>
                  <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Keystones */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Keystones</CardTitle>
              <Button size="sm" variant="outline">
                <PlusCircle size={16} className="mr-1" />
                Add Keystone
              </Button>
            </CardHeader>
            <CardContent>
              {keystones.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No keystones added yet.</p>
                  <p className="text-sm">Add important events or milestones for this contact.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {keystones.map((keystone) => (
                    <div key={keystone.id} className="flex gap-3 items-start">
                      <div className="bg-blue-100 text-blue-800 p-2 rounded-md">
                        <Calendar size={16} />
                      </div>
                      <div>
                        <p className="font-medium">{keystone.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(keystone.date), 'PPP')}
                          {keystone.category && ` · ${keystone.category}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Interactions */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-medium">Interactions</CardTitle>
              <Button size="sm" variant="outline">
                <PlusCircle size={16} className="mr-1" />
                Log Interaction
              </Button>
            </CardHeader>
            <CardContent>
              {interactions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No interactions logged yet.</p>
                  <p className="text-sm">Log calls, emails, meetings, or any other interactions.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {interactions.map((interaction) => (
                    <div key={interaction.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium capitalize">{interaction.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(interaction.date), 'PPP')}
                        </p>
                      </div>
                      {interaction.notes && (
                        <p className="text-sm mt-1">{interaction.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
            onSuccess={() => {
              setIsEditDialogOpen(false);
              // Refresh the contact data
              if (id) {
                contactService.getContact(id).then(setContact);
              }
            }}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
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
    </div>
  );
}
