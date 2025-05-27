
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useContactDetail } from "@/hooks/useContactDetail";
import { EnhancedContactDetail } from "@/components/contact/EnhancedContactDetail";
import EditContactDialog from "@/components/dialogs/EditContactDialog";
import DeleteContactDialog from "@/components/dialogs/DeleteContactDialog";
import ContactDetailSkeleton from "@/components/contact/ContactDetailSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-t-2xl mt-4 shadow-xl border border-gray-200 overflow-hidden animate-fade-in">
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

  // Desktop two-panel layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        <div className={cn("flex h-[calc(100vh-3rem)] w-full overflow-hidden bg-white rounded-2xl shadow-xl border border-gray-200 animate-fade-in")}>
          {/* Contact Timeline Panel - Left/Center */}
          <div className="flex-1 overflow-hidden min-w-0 max-w-[calc(100%-24rem)] border-r border-gray-200">
            <div className="h-full overflow-y-auto">
              <ContactTimeline 
                contact={contact}
                interactions={interactions}
                keystones={keystones}
                contactMedia={contactMedia}
              />
            </div>
          </div>
          
          {/* Contact Detail Panel - Right Side */}
          <div className="w-96 flex-shrink-0 overflow-hidden">
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
