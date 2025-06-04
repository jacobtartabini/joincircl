
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/contact";
import { contactService } from "@/services/contactService";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";

interface InteractionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  contact: Contact | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InteractionDialog({
  isOpen,
  onOpenChange,
  contact,
  onSuccess,
  onCancel,
}: InteractionDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedTab, setSelectedTab] = useState("note");
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contact?.id) {
      toast({
        title: "Error",
        description: "Contact information missing",
        variant: "destructive",
      });
      return;
    }
    
    if (notes.trim() === "") {
      toast({
        title: "Required Field",
        description: "Please add some notes about the interaction",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      await contactService.addInteraction({
        contact_id: contact.id,
        type: selectedTab,
        notes: notes,
        date: new Date().toISOString()
      });
      
      toast({
        title: "Interaction Saved",
        description: "Your interaction has been recorded successfully.",
      });
      
      onSuccess();
      onOpenChange(false);
      setNotes("");
      setSelectedTab("note");
    } catch (error) {
      console.error("Error adding interaction:", error);
      toast({
        title: "Error",
        description: "Failed to save interaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
    setNotes("");
    setSelectedTab("note");
  };
  
  if (!contact) return null;

  const content = (
    <form onSubmit={handleSubmit}>
      <div className="py-4">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="note" className={isMobile ? "py-3" : ""}>Note</TabsTrigger>
            <TabsTrigger value="call" className={isMobile ? "py-3" : ""}>Call</TabsTrigger>
            <TabsTrigger value="meeting" className={isMobile ? "py-3" : ""}>Meeting</TabsTrigger>
          </TabsList>
          <TabsContent value="note" className="mt-4">
            <Textarea
              placeholder="What did you discuss with this contact?"
              className="min-h-32"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </TabsContent>
          <TabsContent value="call" className="mt-4">
            <Textarea
              placeholder="What did you discuss during the call?"
              className="min-h-32"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </TabsContent>
          <TabsContent value="meeting" className="mt-4">
            <Textarea
              placeholder="What happened during the meeting?"
              className="min-h-32"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isSubmitting}
          className={isMobile ? "min-h-12 py-3 px-4" : ""}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className={isMobile ? "min-h-12 py-3 px-4" : ""}
        >
          {isSubmitting ? "Saving..." : "Save Interaction"}
        </Button>
      </div>
    </form>
  );

  // For mobile devices, use Sheet (bottom drawer)
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[80vh] pb-safe-area-bottom">
          <SheetHeader className="pb-4">
            <SheetTitle>Add Interaction</SheetTitle>
            <SheetDescription>
              Record an interaction with {contact.name}
            </SheetDescription>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  // For desktop devices, use Dialog (modal)
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Interaction</DialogTitle>
          <DialogDescription>
            Record an interaction with {contact.name}
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
