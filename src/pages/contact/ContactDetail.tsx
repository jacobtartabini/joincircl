
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
import { Calendar, Mail, Phone, Edit, Trash, PlusCircle } from "lucide-react";

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
          {/* Contact Information */}
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
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={18} className="text-muted-foreground" />
                    <span>{contact.email}</span>
                  </div>
                )}
                
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={18} className="text-muted-foreground" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                
                {contact.last_contact && (
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-muted-foreground" />
                    <span>Last contacted: {format(new Date(contact.last_contact), 'PPP')}</span>
                  </div>
                )}
                
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
                
                {contact.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="font-medium mb-2">Notes</h3>
                    <p className="text-sm whitespace-pre-wrap">{contact.notes}</p>
                  </div>
                )}
              </div>
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
