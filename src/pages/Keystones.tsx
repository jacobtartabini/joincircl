
import { Button } from "@/components/ui/button";
import { KeystoneCard } from "@/components/ui/keystone-card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { keystoneService } from "@/services/keystoneService";
import { Keystone } from "@/types/keystone";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Calendar, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { contactService } from "@/services/contactService";
import { Contact } from "@/types/contact";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

const Keystones = () => {
  const { toast } = useToast();
  const [keystones, setKeystones] = useState<Keystone[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedKeystone, setSelectedKeystone] = useState<Keystone | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    title: string;
    date: string;
    category?: string;
    contact_id?: string;
    is_recurring: boolean;
    recurrence_frequency?: string;
  }>({
    title: "",
    date: new Date().toISOString().split('T')[0],
    category: "",
    contact_id: undefined,
    is_recurring: false,
    recurrence_frequency: undefined
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [keystonesData, contactsData] = await Promise.all([
          keystoneService.getKeystones(),
          contactService.getContacts()
        ]);
        setKeystones(keystonesData);
        setContacts(contactsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load keystones. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleKeystoneClick = (keystone: Keystone) => {
    setSelectedKeystone(keystone);
    setFormData({
      title: keystone.title,
      date: new Date(keystone.date).toISOString().split('T')[0],
      category: keystone.category,
      contact_id: keystone.contact_id,
      is_recurring: keystone.is_recurring || false,
      recurrence_frequency: keystone.recurrence_frequency
    });
    setIsViewDialogOpen(true);
  };

  const handleAddKeystone = () => {
    setIsAddDialogOpen(true);
    setFormData({
      title: "",
      date: new Date().toISOString().split('T')[0],
      category: "",
      contact_id: undefined,
      is_recurring: false,
      recurrence_frequency: undefined
    });
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value || undefined }));
  };

  const toggleRecurring = () => {
    setFormData((prev) => ({
      ...prev,
      is_recurring: !prev.is_recurring,
      recurrence_frequency: !prev.is_recurring ? "Monthly" : undefined
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Convert date string to proper format
      const keystoneToSave = {
        ...formData,
        date: new Date(formData.date).toISOString(),
      };

      await keystoneService.createKeystone(keystoneToSave as any);
      
      const updatedKeystones = await keystoneService.getKeystones();
      setKeystones(updatedKeystones);
      
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Keystone added successfully",
      });
    } catch (error) {
      console.error("Error adding keystone:", error);
      toast({
        title: "Error",
        description: "Failed to add keystone. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateKeystone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedKeystone) return;
    
    try {
      // Convert form data to update format
      const updateData = {
        title: formData.title,
        date: new Date(formData.date).toISOString(),
        category: formData.category,
        contact_id: formData.contact_id,
        is_recurring: formData.is_recurring,
        recurrence_frequency: formData.is_recurring ? formData.recurrence_frequency : undefined
      };
      
      await keystoneService.updateKeystone(selectedKeystone.id, updateData);
      
      const updatedKeystones = await keystoneService.getKeystones();
      setKeystones(updatedKeystones);
      
      setIsViewDialogOpen(false);
      toast({
        title: "Success",
        description: "Keystone updated successfully",
      });
    } catch (error) {
      console.error("Error updating keystone:", error);
      toast({
        title: "Error",
        description: "Failed to update keystone. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteKeystone = async () => {
    if (!selectedKeystone) return;
    
    try {
      await keystoneService.deleteKeystone(selectedKeystone.id);
      
      const updatedKeystones = await keystoneService.getKeystones();
      setKeystones(updatedKeystones);
      
      setIsViewDialogOpen(false);
      toast({
        title: "Success",
        description: "Keystone deleted successfully",
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

  const getContactName = (contactId?: string) => {
    if (!contactId) return null;
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || null;
  };

  const addKeystoneDialog = (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Keystone</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date*</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleFormChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Birthday">Birthday</SelectItem>
                <SelectItem value="Anniversary">Anniversary</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Holiday">Holiday</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contact">Related Contact</Label>
            <Select
              value={formData.contact_id}
              onValueChange={(value) => handleSelectChange("contact_id", value)}
            >
              <SelectTrigger id="contact">
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map(contact => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="is_recurring">Recurring</Label>
              <Switch
                id="is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={toggleRecurring}
              />
            </div>
            
            {formData.is_recurring && (
              <div className="mt-2">
                <Label htmlFor="recurrence_frequency">Frequency</Label>
                <Select
                  value={formData.recurrence_frequency}
                  onValueChange={(value) => handleSelectChange("recurrence_frequency", value)}
                >
                  <SelectTrigger id="recurrence_frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Biweekly">Biweekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Bimonthly">Bimonthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              Create Keystone
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  const viewKeystoneDialog = selectedKeystone && (
    <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keystone Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdateKeystone} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title*</Label>
            <Input
              id="edit-title"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-date">Date*</Label>
            <Input
              id="edit-date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleFormChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select
              value={formData.category || ""}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger id="edit-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Birthday">Birthday</SelectItem>
                <SelectItem value="Anniversary">Anniversary</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Holiday">Holiday</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-contact">Related Contact</Label>
            <Select
              value={formData.contact_id || ""}
              onValueChange={(value) => handleSelectChange("contact_id", value)}
            >
              <SelectTrigger id="edit-contact">
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map(contact => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="edit_is_recurring">Recurring</Label>
              <Switch
                id="edit_is_recurring"
                checked={formData.is_recurring}
                onCheckedChange={toggleRecurring}
              />
            </div>
            
            {formData.is_recurring && (
              <div className="mt-2">
                <Label htmlFor="edit_recurrence_frequency">Frequency</Label>
                <Select
                  value={formData.recurrence_frequency}
                  onValueChange={(value) => handleSelectChange("recurrence_frequency", value)}
                >
                  <SelectTrigger id="edit_recurrence_frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Biweekly">Biweekly</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                    <SelectItem value="Bimonthly">Bimonthly</SelectItem>
                    <SelectItem value="Quarterly">Quarterly</SelectItem>
                    <SelectItem value="Yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex justify-between gap-2 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteKeystone}
            >
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Update Keystone
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Keystones</h1>
          <p className="text-muted-foreground">
            Important events and milestones
          </p>
        </div>
        <Button size="sm" onClick={handleAddKeystone}>
          <Plus size={16} className="mr-1" /> Add Keystone
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : keystones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {keystones.map((keystone) => (
            <div 
              key={keystone.id} 
              className="cursor-pointer"
              onClick={() => handleKeystoneClick(keystone)}
            >
              <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-800 p-2 rounded-md">
                    <CalendarIcon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{keystone.title}</h3>
                      {keystone.is_recurring && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {keystone.recurrence_frequency}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span>{format(new Date(keystone.date), 'PPP')}</span>
                      {keystone.category && <span className="ml-2">• {keystone.category}</span>}
                    </div>
                    {keystone.contact_id && (
                      <div className="text-sm mt-1">
                        Contact: {getContactName(keystone.contact_id)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-md bg-muted/30">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <Calendar className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No keystones yet</h3>
          <p className="text-muted-foreground mb-4">
            Track important dates and milestones related to your contacts
          </p>
          <Button onClick={handleAddKeystone}>
            <Plus size={16} className="mr-1" /> Add Your First Keystone
          </Button>
        </div>
      )}

      {addKeystoneDialog}
      {viewKeystoneDialog}
    </div>
  );
};

export default Keystones;
