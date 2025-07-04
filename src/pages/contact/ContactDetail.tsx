
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useContactDetail } from "@/hooks/useContactDetail";
import EditContactDialog from "@/components/dialogs/EditContactDialog";
import DeleteContactDialog from "@/components/dialogs/DeleteContactDialog";
import ContactDetailSkeleton from "@/components/contact/ContactDetailSkeleton";
import ContactDetailHeader from "@/components/contact/ContactDetailHeader";
import ContactDetailContent from "@/components/contact/ContactDetailContent";

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
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

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8 animate-fade-in">
        {/* Header with navigation and actions */}
        <ContactDetailHeader 
          onEditClick={() => setIsEditDialogOpen(true)}
          onDeleteClick={() => setIsDeleteDialogOpen(true)}
        />
        
        {/* Main content in a unified card */}
        <div className="unified-card p-8">
          <ContactDetailContent 
            contact={contact}
            interactions={interactions}
            keystones={keystones}
            contactMedia={contactMedia}
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
    </div>
  );
}
