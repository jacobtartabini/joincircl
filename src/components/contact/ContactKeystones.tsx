
import { useState } from "react";
import { Keystone } from "@/types/keystone";
import { Contact } from "@/types/contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Calendar } from "lucide-react";
import { format } from "date-fns";
import KeystoneDetailModal from "@/components/keystone/KeystoneDetailModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import KeystoneForm from "@/components/keystone/KeystoneForm";

interface ContactKeystonesProps {
  keystones: Keystone[];
  contact: Contact;
  onKeystoneAdded: () => Promise<void>;
}

export default function ContactKeystones({ keystones, contact, onKeystoneAdded }: ContactKeystonesProps) {
  const [isAddKeystoneDialogOpen, setIsAddKeystoneDialogOpen] = useState(false);
  const [isEditKeystoneDialogOpen, setIsEditKeystoneDialogOpen] = useState(false);
  const [selectedKeystone, setSelectedKeystone] = useState<Keystone | null>(null);
  const [isKeystoneDetailOpen, setIsKeystoneDetailOpen] = useState(false);

  const handleKeystoneClick = (keystone: Keystone) => {
    setSelectedKeystone(keystone);
    setIsKeystoneDetailOpen(true);
  };

  const handleEditKeystone = () => {
    setIsKeystoneDetailOpen(false);
    setIsEditKeystoneDialogOpen(true);
  };

  const handleDeleteKeystone = async () => {
    if (!selectedKeystone?.id) return;
    
    // Close modal
    setIsKeystoneDetailOpen(false);
    
    // Then perform refresh after delete
    await onKeystoneAdded();
    setSelectedKeystone(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium">Keystones</CardTitle>
          <Button size="sm" variant="outline" onClick={() => setIsAddKeystoneDialogOpen(true)}>
            <PlusCircle size={16} className="mr-1" />
            Add Keystone
          </Button>
        </CardHeader>
        <CardContent>
          {keystones.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No keystones added yet.</p>
              <p className="text-sm">Add important events or milestones for this contact.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {keystones.map(keystone => (
                <div 
                  key={keystone.id}
                  className="flex gap-3 items-start hover:bg-muted/50 p-2 rounded-md transition-colors cursor-pointer"
                  onClick={() => handleKeystoneClick(keystone)}
                >
                  <div className="bg-blue-100 text-blue-800 p-2 rounded-md flex-shrink-0">
                    <Calendar size={16} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <p className="font-medium">{keystone.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(keystone.date), 'PPP')}
                      {keystone.category && ` · ${keystone.category}`}
                      {keystone.is_recurring && ` · Recurring (${keystone.recurrence_frequency})`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Keystone Dialog */}
      <Dialog open={isAddKeystoneDialogOpen} onOpenChange={setIsAddKeystoneDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Keystone</DialogTitle>
          </DialogHeader>
          <KeystoneForm contact={contact} onSuccess={onKeystoneAdded} onCancel={() => setIsAddKeystoneDialogOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Edit Keystone Dialog */}
      <Dialog open={isEditKeystoneDialogOpen} onOpenChange={setIsEditKeystoneDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Keystone</DialogTitle>
          </DialogHeader>
          <KeystoneForm 
            keystone={selectedKeystone || undefined} 
            contact={contact} 
            onSuccess={onKeystoneAdded} 
            onCancel={() => {
              setIsEditKeystoneDialogOpen(false);
              setSelectedKeystone(null);
            }} 
          />
        </DialogContent>
      </Dialog>

      {/* Keystone Detail Modal */}
      <KeystoneDetailModal
        keystone={selectedKeystone}
        isOpen={isKeystoneDetailOpen}
        onOpenChange={setIsKeystoneDetailOpen}
        onEdit={handleEditKeystone}
        onDelete={handleDeleteKeystone}
      />
    </>
  );
}
