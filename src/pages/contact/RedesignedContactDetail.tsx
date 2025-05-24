
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useContactDetail } from "@/hooks/useContactDetail";
import { EnhancedActivityFeed } from "@/components/activity/EnhancedActivityFeed";
import { EnhancedContactDetail } from "@/components/contact/EnhancedContactDetail";
import EditContactDialog from "@/components/dialogs/EditContactDialog";
import DeleteContactDialog from "@/components/dialogs/DeleteContactDialog";
import ContactDetailSkeleton from "@/components/contact/ContactDetailSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

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

  const handleSelectActivity = (activity: any) => {
    console.log("Selected activity:", activity);
  };

  if (isMobile) {
    return (
      <div className="h-full animate-fade-in overflow-hidden">
        <EnhancedContactDetail 
          contact={contact}
          interactions={interactions}
          onEdit={() => setIsEditDialogOpen(true)}
          onDelete={() => setIsDeleteDialogOpen(true)}
        />
        
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
    <div className="h-full animate-fade-in overflow-hidden">
      <div className={cn("flex h-full w-full overflow-hidden")}>
        {/* Main Content Panel - Left Side */}
        <div className="flex-1 overflow-hidden min-w-0 max-w-[calc(100%-20rem)] border-r bg-white/95 backdrop-blur-sm">
          <div className="panel-container">
            <EnhancedActivityFeed 
              onSelectActivity={handleSelectActivity}
            />
          </div>
        </div>
        
        {/* Contact Detail Panel - Right Side */}
        <div className="w-80 flex-shrink-0 bg-white/95 backdrop-blur-sm overflow-hidden">
          <EnhancedContactDetail 
            contact={contact}
            interactions={interactions}
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
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
