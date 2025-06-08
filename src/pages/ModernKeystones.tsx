import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, User, MapPin } from "lucide-react";
import { keystoneService } from "@/services/keystoneService";
import { Keystone } from "@/types/keystone";
import { useToast } from "@/hooks/use-toast";
import KeystoneForm from "@/components/keystone/KeystoneForm";
import { KeystoneDetailModal } from "@/components/keystone/KeystoneDetailModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const ModernKeystones = () => {
  const [keystones, setKeystones] = useState<Keystone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedKeystone, setSelectedKeystone] = useState<Keystone | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchKeystones();
  }, []);

  const fetchKeystones = async () => {
    try {
      setIsLoading(true);
      const data = await keystoneService.getKeystones();
      setKeystones(data || []);
    } catch (error) {
      console.error("Error fetching keystones:", error);
      toast({
        title: "Error",
        description: "Failed to load keystones. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeystoneClick = (keystone: Keystone) => {
    setSelectedKeystone(keystone);
    setIsDetailModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'birthday': 'bg-pink-100 text-pink-800 border-pink-200',
      'anniversary': 'bg-purple-100 text-purple-800 border-purple-200',
      'meeting': 'bg-blue-100 text-blue-800 border-blue-200',
      'follow-up': 'bg-green-100 text-green-800 border-green-200',
      'other': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[category?.toLowerCase()] || colors.other;
  };

  const handleEdit = () => {
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedKeystone) return;
    
    try {
      await keystoneService.deleteKeystone(selectedKeystone.id);
      toast({
        title: "Success",
        description: "Keystone deleted successfully",
      });
      setIsDetailModalOpen(false);
      setSelectedKeystone(null);
      fetchKeystones();
    } catch (error) {
      console.error("Error deleting keystone:", error);
      toast({
        title: "Error",
        description: "Failed to delete keystone. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Keystones</h1>
              <p className="text-muted-foreground">Important dates and events in your relationships</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {keystones.length} keystone{keystones.length !== 1 ? 's' : ''} scheduled
            </p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-full shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Keystone
            </Button>
          </div>
        </div>

        {/* Keystones Grid */}
        {keystones.length === 0 ? (
          <Card className="unified-card text-center py-12">
            <CardContent>
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="text-xl mb-2">No keystones yet</CardTitle>
              <CardDescription className="mb-4">
                Start tracking important dates and events in your relationships
              </CardDescription>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="rounded-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Keystone
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keystones.map((keystone) => (
              <Card 
                key={keystone.id} 
                className="unified-card cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                onClick={() => handleKeystoneClick(keystone)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-foreground mb-1 line-clamp-1">
                        {keystone.title}
                      </CardTitle>
                      {keystone.category && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs px-2 py-1 ${getCategoryColor(keystone.category)}`}
                        >
                          {keystone.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Date and Time */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(keystone.date)}</span>
                      <Clock className="h-4 w-4 ml-2" />
                      <span>{formatTime(keystone.date)}</span>
                    </div>

                    {/* Contact Name */}
                    {keystone.contact_id && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Contact Event</span>
                      </div>
                    )}

                    {/* Recurring Badge */}
                    {keystone.is_recurring && (
                      <Badge variant="outline" className="text-xs">
                        Recurring • {keystone.recurrence_frequency}
                      </Badge>
                    )}

                    {/* Notes Preview */}
                    {keystone.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {keystone.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Keystone Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="unified-modal max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Add New Keystone</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-8rem)]">
              <KeystoneForm
                onSuccess={() => {
                  setIsAddModalOpen(false);
                  fetchKeystones();
                }}
                onCancel={() => setIsAddModalOpen(false)}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Edit Keystone Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="unified-modal max-w-2xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Edit Keystone</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-8rem)]">
              <KeystoneForm
                keystone={selectedKeystone}
                onSuccess={() => {
                  setIsEditModalOpen(false);
                  setSelectedKeystone(null);
                  fetchKeystones();
                }}
                onCancel={() => {
                  setIsEditModalOpen(false);
                  setSelectedKeystone(null);
                }}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Keystone Detail Modal */}
        {selectedKeystone && (
          <KeystoneDetailModal
            keystone={selectedKeystone}
            isOpen={isDetailModalOpen}
            onOpenChange={setIsDetailModalOpen}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default ModernKeystones;
