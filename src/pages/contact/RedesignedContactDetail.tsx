
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useContactDetail } from "@/hooks/useContactDetail";
import { ThreePanelLayout } from "@/components/layout/ThreePanelLayout";
import { Navbar } from "@/components/navigation/Navbar";
import { EnhancedActivityFeed } from "@/components/activity/EnhancedActivityFeed";
import { EnhancedContactDetail } from "@/components/contact/EnhancedContactDetail";
import EditContactDialog from "@/components/dialogs/EditContactDialog";
import DeleteContactDialog from "@/components/dialogs/DeleteContactDialog";
import ContactDetailSkeleton from "@/components/contact/ContactDetailSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";

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

  return (
    <div className="h-full animate-fade-in overflow-hidden">
      <ThreePanelLayout
        leftPanel={<Navbar />}
        middlePanel={
          <div className="panel-container">
            <EnhancedActivityFeed 
              onSelectActivity={handleSelectActivity}
            />
          </div>
        }
        rightPanel={
          <EnhancedContactDetail 
            contact={contact}
            interactions={interactions}
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
        }
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
