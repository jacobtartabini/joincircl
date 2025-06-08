import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, User } from "lucide-react";
import { keystoneService } from "@/services/keystoneService";
import { Keystone } from "@/types/keystone";
import { useToast } from "@/hooks/use-toast";
import KeystoneForm from "@/components/keystone/KeystoneForm";
import { KeystoneDetailModal } from "@/components/keystone/KeystoneDetailModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KeystoneFilters } from "@/components/keystone/KeystoneFilters";

const MobileKeystones = () => {
  const [keystones, setKeystones] = useState<Keystone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedKeystone, setSelectedKeystone] = useState<Keystone | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  // New state for filtering and search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "past">("all");

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

  // Filter and search keystones
  const filteredKeystones = useMemo(() => {
    let result = keystones;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(keystone => 
        keystone.title.toLowerCase().includes(query) ||
        keystone.notes?.toLowerCase().includes(query) ||
        keystone.category?.toLowerCase().includes(query) ||
        keystone.contact_name?.toLowerCase().includes(query)
      );
    }

    // Apply time-based filter
    const now = new Date();
    if (activeFilter === "upcoming") {
      result = result.filter(keystone => new Date(keystone.date) >= now);
    } else if (activeFilter === "past") {
      result = result.filter(keystone => new Date(keystone.date) < now);
    }

    // Sort by date
    return result.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      if (activeFilter === "past") {
        return dateB - dateA; // Recent first for past
      } else {
        return dateA - dateB; // Upcoming first for upcoming/all
      }
    });
  }, [keystones, searchQuery, activeFilter]);

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
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-card border-b border-border shadow-sm">
          <div className="p-4">
            {/* Page Header */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-foreground">Keystones</h1>
                  <p className="text-sm text-muted-foreground">Important dates & events</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredKeystones.length} keystone{filteredKeystones.length !== 1 ? 's' : ''}
              </p>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                size="sm"
                className="rounded-full"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>

            {/* Search and Filter Controls */}
            <KeystoneFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 pb-20">
              {filteredKeystones.length === 0 ? (
                <Card className="unified-card text-center py-8">
                  <CardContent>
                    <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <CardTitle className="text-lg mb-2">
                      {searchQuery || activeFilter !== "all" ? "No keystones found" : "No keystones yet"}
                    </CardTitle>
                    <CardDescription className="mb-4 text-sm">
                      {searchQuery || activeFilter !== "all" 
                        ? "Try adjusting your search or filter"
                        : "Track important dates and events"
                      }
                    </CardDescription>
                    {!searchQuery && activeFilter === "all" && (
                      <Button 
                        onClick={() => setIsAddModalOpen(true)}
                        size="sm"
                        className="rounded-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add First Keystone
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredKeystones.map((keystone) => (
                    <Card 
                      key={keystone.id} 
                      className="unified-card cursor-pointer hover:shadow-sm transition-shadow"
                      onClick={() => handleKeystoneClick(keystone)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-base font-semibold text-foreground mb-1 line-clamp-1">
                              {keystone.title}
                            </CardTitle>
                            {keystone.category && (
                              <Badge 
                                variant="secondary" 
                                className={`text-xs px-2 py-0.5 ${getCategoryColor(keystone.category)}`}
                              >
                                {keystone.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {/* Date and Time */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(keystone.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(keystone.date)}</span>
                            </div>
                          </div>

                          {/* Contact Name */}
                          {keystone.contact_id && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span>Contact Event</span>
                            </div>
                          )}

                          {/* Recurring Badge */}
                          {keystone.is_recurring && (
                            <Badge variant="outline" className="text-xs w-fit">
                              Recurring
                            </Badge>
                          )}

                          {/* Notes Preview */}
                          {keystone.notes && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {keystone.notes}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Add Keystone Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="unified-modal max-w-sm max-h-[90vh] mx-4">
            <DialogHeader>
              <DialogTitle>Add Keystone</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-6rem)]">
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
          <DialogContent className="unified-modal max-w-sm max-h-[90vh] mx-4">
            <DialogHeader>
              <DialogTitle>Edit Keystone</DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[calc(90vh-6rem)]">
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

export default MobileKeystones;
