
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useContactDetail } from "@/hooks/useContactDetail";
import { MinimalContactDetail } from "@/components/contact/MinimalContactDetail";
import EditContactDialog from "@/components/dialogs/EditContactDialog";
import DeleteContactDialog from "@/components/dialogs/DeleteContactDialog";
import ContactDetailSkeleton from "@/components/contact/ContactDetailSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { UnifiedContactView } from "@/components/contact/UnifiedContactView";

export default function RedesignedContactDetail() {
  const { id } = useParams<{ id: string }>();
  const isMobile = useIsMobile();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const {
    contact,
    interactions,
    keystones,
    contactMedia,
    loading,
    error,
    handleDelete,
    handleContactUpdate,
    handleKeystoneAdded,
    handleInteractionAdded
  } = useContactDetail(id);

  // Show loading or error states
  if (loading || error || !contact) {
    return (
      <ContactDetailSkeleton 
        isLoading={loading}
        error={error || !contact} 
        errorMessage="The contact you're looking for doesn't exist or you don't have access to it." 
      />
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="h-full">
          <MinimalContactDetail 
            contact={contact} 
            interactions={interactions}
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
        </div>
        
        {/* Dialogs */}
        <EditContactDialog
          contact={contact}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onContactUpdate={handleContactUpdate}
        />
        
        <DeleteContactDialog
          contact={contact}
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onDelete={handleDelete}
        />
      </div>
    );
  }

  // Desktop unified layout
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto">
        <UnifiedContactView 
          contact={contact} 
          interactions={interactions}
          keystones={keystones}
          contactMedia={contactMedia}
          onEdit={() => setIsEditDialogOpen(true)}
          onDelete={() => setIsDeleteDialogOpen(true)}
          onKeystoneAdded={handleKeystoneAdded}
          onInteractionAdded={handleInteractionAdded}
        />
      </div>
      
      {/* Dialogs */}
      <EditContactDialog
        contact={contact}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onContactUpdate={handleContactUpdate}
      />
      
      <DeleteContactDialog
        contact={contact}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
      />
    </div>
  );
}
