import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { keystoneService } from "@/services/keystoneService";
import { useToast } from "@/hooks/use-toast";
import { KeystoneCard } from "@/components/ui/keystone-card";
import { Keystone } from "@/types/keystone";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import KeystoneForm from "@/components/keystone/KeystoneForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import KeystoneDetailModal from "@/components/keystone/KeystoneDetailModal";
import { contactService } from "@/services/contactService";
import { Contact } from "@/types/contact";
import { useIsMobile } from "@/hooks/use-mobile";

const Keystones = () => {
  const [keystones, setKeystones] = useState<Keystone[]>([]);
  const [contacts, setContacts] = useState<{[id: string]: Contact}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedKeystone, setSelectedKeystone] = useState<Keystone | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isKeystoneDetailOpen, setIsKeystoneDetailOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    fetchKeystones();
  }, []);

  const fetchKeystones = async () => {
    try {
      setIsLoading(true);
      const data = await keystoneService.getKeystones();
      setKeystones(data);
      
      // Fetch contacts for keystone cards
      const contactIds = data
        .filter(k => k.contact_id)
        .map(k => k.contact_id) as string[];
      
      if (contactIds.length > 0) {
        const uniqueContactIds = [...new Set(contactIds)];
        await fetchContacts(uniqueContactIds);
      }
    } catch (error) {
      console.error("Error fetching keystones:", error);
      toast({
        title: "Error",
        description: "Failed to load keystones. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchContacts = async (contactIds: string[]) => {
    try {
      const contactMap: {[id: string]: Contact} = {};
      
      for (const id of contactIds) {
        try {
          const contact = await contactService.getContact(id);
          contactMap[id] = contact;
        } catch (e) {
          console.error(`Failed to fetch contact with ID ${id}:`, e);
        }
      }
      
      setContacts(contactMap);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const handleAddSuccess = () => {
    setIsAddDialogOpen(false);
    fetchKeystones();
    toast({
      title: "Success",
      description: "Keystone added successfully.",
    });
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedKeystone(null);
    fetchKeystones();
    toast({
      title: "Success",
      description: "Keystone updated successfully.",
    });
  };

  const handleKeystoneClick = (keystone: Keystone) => {
    setSelectedKeystone(keystone);
    setIsKeystoneDetailOpen(true);
  };

  const handleEditKeystone = () => {
    setIsKeystoneDetailOpen(false);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteKeystone = async () => {
    if (!selectedKeystone) return;
    
    try {
      await keystoneService.deleteKeystone(selectedKeystone.id);
      setIsDeleteDialogOpen(false);
      setIsKeystoneDetailOpen(false);
      setIsEditDialogOpen(false);
      setSelectedKeystone(null);
      fetchKeystones();
      toast({
        title: "Success",
        description: "Keystone deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting keystone:", error);
      toast({
        title: "Error",
        description: "Failed to delete keystone. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Use date property if due_date doesn't exist
  const upcomingKeystones = keystones.filter(
    (k) => new Date(k.due_date || k.date) >= new Date()
  );
  const pastKeystones = keystones.filter(
    (k) => new Date(k.due_date || k.date) < new Date()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Keystones</h1>
          <p className="text-muted-foreground">
            Important events and follow-ups with your connections
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} className="mr-1" /> Add Keystone
        </Button>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : upcomingKeystones.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingKeystones.map((keystone) => {
                // Get contact details for this keystone
                const contactDetails = keystone.contact_id && contacts[keystone.contact_id];
                
                return (
                  <KeystoneCard
                    key={keystone.id}
                    keystone={{
                      id: keystone.id,
                      title: keystone.title,
                      date: keystone.due_date || keystone.date,
                      category: keystone.category || undefined,
                      contactId: keystone.contact_id || "",
                      contactName: contactDetails?.name || keystone.contact_name || "",
                      contactAvatar: contactDetails?.avatar_url
                    }}
                    onEdit={() => handleKeystoneClick(keystone)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              <p className="text-muted-foreground">No upcoming keystones.</p>
              <Link 
                to="#" 
                className="text-blue-600 hover:underline text-sm font-medium mt-2 inline-block"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add your first keystone
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : pastKeystones.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastKeystones.map((keystone) => {
                // Get contact details for this keystone
                const contactDetails = keystone.contact_id && contacts[keystone.contact_id];
                
                return (
                  <KeystoneCard
                    key={keystone.id}
                    keystone={{
                      id: keystone.id,
                      title: keystone.title,
                      date: keystone.due_date || keystone.date,
                      category: keystone.category || undefined,
                      contactId: keystone.contact_id || "",
                      contactName: contactDetails?.name || keystone.contact_name || "",
                      contactAvatar: contactDetails?.avatar_url
                    }}
                    onEdit={() => handleKeystoneClick(keystone)}
                    isPast
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-md bg-muted/30">
              <p className="text-muted-foreground">No past keystones found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Dialog/Sheet */}
      {isMobile ? (
        <Sheet open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6">
            <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-muted" />
            <SheetHeader className="mb-4">
              <SheetTitle>Add Keystone</SheetTitle>
            </SheetHeader>
            <KeystoneForm
              onSuccess={handleAddSuccess}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Keystone</DialogTitle>
            </DialogHeader>
            <KeystoneForm
              onSuccess={handleAddSuccess}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog/Sheet */}
      {isMobile ? (
        <Sheet open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <SheetContent side="bottom" className="h-[90vh] overflow-auto pt-6">
            <div className="mx-auto -mt-1 mb-4 h-1.5 w-[60px] rounded-full bg-muted" />
            <SheetHeader className="mb-4">
              <SheetTitle>Edit Keystone</SheetTitle>
            </SheetHeader>
            {selectedKeystone && (
              <KeystoneForm
                keystone={selectedKeystone}
                onSuccess={handleEditSuccess}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setSelectedKeystone(null);
                }}
                onDelete={handleDeleteClick}
              />
            )}
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Keystone</DialogTitle>
            </DialogHeader>
            {selectedKeystone && (
              <KeystoneForm
                keystone={selectedKeystone}
                onSuccess={handleEditSuccess}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setSelectedKeystone(null);
                }}
                onDelete={handleDeleteClick}
              />
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* Add KeystoneDetailModal for viewing keystone details */}
      <KeystoneDetailModal
        keystone={selectedKeystone}
        isOpen={isKeystoneDetailOpen}
        onOpenChange={setIsKeystoneDetailOpen}
        onEdit={handleEditKeystone}
        onDelete={handleDeleteKeystone}
      />
    </div>
  );
};

export default Keystones;
