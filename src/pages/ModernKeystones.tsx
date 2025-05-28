import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keystoneService } from "@/services/keystoneService";
import { contactService } from "@/services/contactService";
import { Keystone } from "@/types/keystone";
import { Contact } from "@/types/contact";
import { KeystoneCard } from "@/components/ui/keystone-card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, MoreVertical, Edit, Trash } from "lucide-react";
import { format, isAfter, isBefore, startOfToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import KeystoneForm from "@/components/keystone/KeystoneForm";
import { KeystoneDetailModal } from "@/components/keystone/KeystoneDetailModal";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileKeystones from "./MobileKeystones";

export default function ModernKeystones() {
  const isMobile = useIsMobile();
  
  // If mobile, use the mobile-optimized version
  if (isMobile) {
    return <MobileKeystones />;
  }

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedKeystone, setSelectedKeystone] = useState<Keystone | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingKeystone, setEditingKeystone] = useState<Keystone | null>(null);
  const [deleteConfirmKeystone, setDeleteConfirmKeystone] = useState<Keystone | null>(null);
  const today = startOfToday();

  // Fetch keystones
  const { data: keystones = [], isLoading } = useQuery({
    queryKey: ['keystones'],
    queryFn: keystoneService.getKeystones
  });

  // Fetch contacts for dropdown
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactService.getContacts
  });

  // Create contact lookup map
  const contactMap = useMemo(() => {
    const map = new Map<string, Contact>();
    contacts.forEach(contact => map.set(contact.id, contact));
    return map;
  }, [contacts]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: keystoneService.deleteKeystone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keystones'] });
      toast({
        title: "Keystone deleted",
        description: "The keystone has been successfully deleted."
      });
      setDeleteConfirmKeystone(null);
    },
    onError: (error) => {
      console.error("Error deleting keystone:", error);
      toast({
        title: "Error",
        description: "Failed to delete keystone. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Categorize keystones
  const categorizedKeystones = useMemo(() => {
    const upcoming: Keystone[] = [];
    const past: Keystone[] = [];

    keystones.forEach(keystone => {
      const keystoneDate = new Date(keystone.date);
      if (isAfter(keystoneDate, today) || format(keystoneDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
        upcoming.push(keystone);
      } else {
        past.push(keystone);
      }
    });

    return {
      upcoming: upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      past: past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    };
  }, [keystones, today]);

  const handleKeystoneClick = (keystone: Keystone) => {
    setSelectedKeystone(keystone);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (keystone: Keystone) => {
    setEditingKeystone(keystone);
    setIsFormDialogOpen(true);
  };

  const handleDelete = (keystone: Keystone) => {
    setDeleteConfirmKeystone(keystone);
  };

  const confirmDelete = () => {
    if (deleteConfirmKeystone) {
      deleteMutation.mutate(deleteConfirmKeystone.id);
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['keystones'] });
    setIsFormDialogOpen(false);
    setEditingKeystone(null);
    toast({
      title: editingKeystone ? "Keystone updated" : "Keystone created",
      description: `The keystone has been successfully ${editingKeystone ? "updated" : "created"}.`
    });
  };

  const renderKeystoneCard = (keystone: Keystone, isPast = false) => {
    const contact = keystone.contact_id ? contactMap.get(keystone.contact_id) : null;
    
    return (
      <div key={keystone.id} className="relative group">
        <KeystoneCard
          keystone={{
            id: keystone.id,
            title: keystone.title,
            date: keystone.date,
            category: keystone.category,
            contactId: keystone.contact_id,
            contactName: contact?.name,
            contactAvatar: contact?.avatar_url
          }}
          isPast={isPast}
          onEdit={() => handleKeystoneClick(keystone)}
          className="cursor-pointer"
        />
        
        {/* Three dots menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                handleEdit(keystone);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(keystone);
                }}
                className="text-red-600"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading keystones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Keystones</h1>
            <p className="text-muted-foreground">Important dates and milestones</p>
          </div>
          <Button onClick={() => setIsFormDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Keystone
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Upcoming Keystones */}
          <section>
            <h2 className="text-lg font-semibold mb-4 text-gray-900">
              Upcoming ({categorizedKeystones.upcoming.length})
            </h2>
            {categorizedKeystones.upcoming.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categorizedKeystones.upcoming.map(keystone => renderKeystoneCard(keystone))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming keystones</p>
                <p className="text-sm">Add your first keystone to get started</p>
              </div>
            )}
          </section>

          {/* Past Keystones */}
          {categorizedKeystones.past.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                Past ({categorizedKeystones.past.length})
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categorizedKeystones.past.map(keystone => renderKeystoneCard(keystone, true))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Keystone Detail Modal */}
      <KeystoneDetailModal
        keystone={selectedKeystone}
        isOpen={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onEdit={() => {
          if (selectedKeystone) {
            setIsDetailModalOpen(false);
            handleEdit(selectedKeystone);
          }
        }}
        onDelete={() => {
          if (selectedKeystone) {
            setIsDetailModalOpen(false);
            handleDelete(selectedKeystone);
          }
        }}
      />

      {/* Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingKeystone ? "Edit Keystone" : "Create New Keystone"}
            </DialogTitle>
          </DialogHeader>
          <KeystoneForm
            keystone={editingKeystone}
            contacts={contacts}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsFormDialogOpen(false);
              setEditingKeystone(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmKeystone} onOpenChange={() => setDeleteConfirmKeystone(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Keystone</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirmKeystone?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
