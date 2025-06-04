
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useContactDetail } from "@/hooks/useContactDetail";
import { EnhancedContactDetail } from "@/components/contact/EnhancedContactDetail";
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
    return <ContactDetailSkeleton 
             isLoading={loading}
             error={error || !contact} 
             errorMessage="The contact you're looking for doesn't exist or you don't have access to it." 
           />;
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-full">
          <EnhancedContactDetail 
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-screen overflow-hidden">
          {/* Contact Timeline Panel - Left/Center */}
          <div className="flex-1 overflow-hidden min-w-0 max-w-[calc(100%-28rem)]">
            <div className="h-full overflow-y-auto">
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
          <div className="w-[28rem] flex-shrink-0 bg-white border-l border-gray-100 shadow-sm">
            <EnhancedContactDetail 
              contact={contact}
              interactions={interactions}
              onEdit={() => setIsEditDialogOpen(true)}
              onDelete={() => setIsDeleteDialogOpen(true)}
            />
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
