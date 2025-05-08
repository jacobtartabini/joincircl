
import { useState } from "react";
import { Contact, Interaction } from "@/types/contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InteractionForm from "@/components/interaction/InteractionForm";
import InteractionDetailModal from "@/components/interaction/InteractionDetailModal";

interface ContactInteractionsProps {
  interactions: Interaction[];
  contact: Contact;
  onInteractionAdded: () => Promise<void>;
}

export default function ContactInteractions({ interactions, contact, onInteractionAdded }: ContactInteractionsProps) {
  const [isAddInteractionDialogOpen, setIsAddInteractionDialogOpen] = useState(false);
  const [isEditInteractionDialogOpen, setIsEditInteractionDialogOpen] = useState(false);
  const [selectedInteraction, setSelectedInteraction] = useState<Interaction | null>(null);
  const [isInteractionDetailOpen, setIsInteractionDetailOpen] = useState(false);

  const handleInteractionClick = (interaction: Interaction) => {
    setSelectedInteraction(interaction);
    setIsInteractionDetailOpen(true);
  };

  const handleEditInteraction = () => {
    setIsInteractionDetailOpen(false);
    setIsEditInteractionDialogOpen(true);
  };

  const handleDeleteInteraction = async () => {
    if (!selectedInteraction?.id) return;
    
    // Close modal
    setIsInteractionDetailOpen(false);
    
    // Then refresh interactions after delete
    await onInteractionAdded();
    setSelectedInteraction(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Interactions</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setIsAddInteractionDialogOpen(true)}>
            <PlusCircle size={16} className="mr-1" />
            Log Interaction
          </Button>
        </CardHeader>
        <CardContent>
          {interactions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No interactions logged yet.</p>
              <p className="text-sm">Log calls, emails, meetings, or any other interactions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interactions.map(interaction => (
                <div 
                  key={interaction.id}
                  className="flex w-full justify-between items-start hover:bg-muted/50 p-2 rounded-md transition-colors cursor-pointer"
                  onClick={() => handleInteractionClick(interaction)}
                >
                  <div className="flex items-start">
                    <p className="font-medium capitalize">{interaction.type}</p>
                    <p className="text-sm text-muted-foreground ml-2 py-[2px]">
                      {format(new Date(interaction.date), 'PPP')}
                    </p>
                  </div>
                  <ChevronDown size={16} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Interaction Dialog */}
      <Dialog open={isAddInteractionDialogOpen} onOpenChange={setIsAddInteractionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Interaction</DialogTitle>
          </DialogHeader>
          <InteractionForm contact={contact} onSuccess={onInteractionAdded} onCancel={() => setIsAddInteractionDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Interaction Dialog */}
      <Dialog open={isEditInteractionDialogOpen} onOpenChange={setIsEditInteractionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Interaction</DialogTitle>
          </DialogHeader>
          {selectedInteraction && (
            <InteractionForm 
              interaction={selectedInteraction}
              contact={contact} 
              onSuccess={() => {
                onInteractionAdded();
                setIsEditInteractionDialogOpen(false);
                setSelectedInteraction(null);
              }} 
              onCancel={() => {
                setIsEditInteractionDialogOpen(false);
                setSelectedInteraction(null);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Interaction Detail Modal */}
      <InteractionDetailModal
        interaction={selectedInteraction}
        isOpen={isInteractionDetailOpen}
        onOpenChange={setIsInteractionDetailOpen}
        onEdit={handleEditInteraction}
        onDelete={handleDeleteInteraction}
      />
    </>
  );
}
