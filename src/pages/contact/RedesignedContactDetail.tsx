
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useContactDetail } from "@/hooks/useContactDetail";
import { MinimalContactDetail } from "@/components/contact/MinimalContactDetail";
import EditContactDialog from "@/components/dialogs/EditContactDialog";
import DeleteContactDialog from "@/components/dialogs/DeleteContactDialog";
import ContactDetailSkeleton from "@/components/contact/ContactDetailSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { ContactTimeline } from "@/components/contact/ContactTimeline";

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

  // Desktop clean, modern layout
  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex h-[calc(100vh-8rem)] gap-8 overflow-hidden">
          {/* Contact Timeline Panel - Left/Center */}
          <div className="flex-1 overflow-hidden min-w-0">
            <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">
              <div className="p-8">
                <ContactTimeline 
                  contact={contact} 
                  interactions={interactions} 
                  keystones={keystones} 
                  contactMedia={contactMedia} 
                />
              </div>
            </div>
          </div>
          
          {/* Contact Detail Panel - Right Side */}
          <div className="w-96 flex-shrink-0">
            <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <MinimalContactDetail 
                contact={contact} 
                interactions={interactions}
                onEdit={() => setIsEditDialogOpen(true)}
                onDelete={() => setIsDeleteDialogOpen(true)}
              />
            </div>
          </div>
        </div>
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
