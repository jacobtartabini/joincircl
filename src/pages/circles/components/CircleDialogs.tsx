
import { useState } from "react";
import { Contact } from "@/types/contact";
import { AddContactDialog } from "../dialogs/AddContactDialog";
import { EditContactDialog } from "../dialogs/EditContactDialog";
import { InteractionDialog } from "../dialogs/InteractionDialog";
import { InsightsDialog } from "../dialogs/InsightsDialog";

interface CircleDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (value: boolean) => void;
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (value: boolean) => void;
  isInteractionDialogOpen: boolean;
  setIsInteractionDialogOpen: (value: boolean) => void;
  isInsightsDialogOpen: boolean;
  setIsInsightsDialogOpen: (value: boolean) => void;
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact | null) => void;
  onFetchContacts: () => void;
}

export function CircleDialogs({
  isAddDialogOpen,
  setIsAddDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  isInteractionDialogOpen,
  setIsInteractionDialogOpen,
  isInsightsDialogOpen,
  setIsInsightsDialogOpen,
  selectedContact,
  setSelectedContact,
  onFetchContacts
}: CircleDialogsProps) {
  const handleDialogSuccess = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsInteractionDialogOpen(false);
    setSelectedContact(null);
    onFetchContacts();
  };

  return (
    <>
      <AddContactDialog 
        isOpen={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onSuccess={handleDialogSuccess}
      />

      <EditContactDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        contact={selectedContact}
        onSuccess={handleDialogSuccess}
        onCancel={() => {
          setIsEditDialogOpen(false);
          setSelectedContact(null);
        }}
      />

      <InteractionDialog 
        isOpen={isInteractionDialogOpen}
        onOpenChange={setIsInteractionDialogOpen}
        contact={selectedContact}
        onSuccess={handleDialogSuccess}
        onCancel={() => {
          setIsInteractionDialogOpen(false);
          setSelectedContact(null);
        }}
      />

      <InsightsDialog 
        isOpen={isInsightsDialogOpen}
        onOpenChange={setIsInsightsDialogOpen}
        contact={selectedContact}
      />
    </>
  );
}
