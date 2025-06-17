import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCirclesState } from "./hooks/useCirclesState";
import { Contact } from "@/types/contact";
import { AddContactDialog } from "./dialogs/AddContactDialog";
import { EditContactDialog } from "./dialogs/EditContactDialog";
import { InteractionDialog } from "./dialogs/InteractionDialog";
import { SyncContactsButton } from "@/components/circles/SyncContactsButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCard, MobileCardContent } from "@/components/ui/mobile-card";
import { MobileInput } from "@/components/ui/mobile-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, User, Phone, Mail, Edit, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { usePagination } from "@/hooks/use-pagination";
import { ContactsPagination } from "@/components/ui/contacts-pagination";

export default function MobileOptimizedCircles() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag');
  const [swipedContactId, setSwipedContactId] = useState<string | null>(null);

  // Add debug logging
  useEffect(() => {
    console.log('MobileOptimizedCircles: Component mounted');
    console.log('MobileOptimizedCircles: isMobile =', isMobile);
    console.log('MobileOptimizedCircles: window.innerWidth =', window.innerWidth);
  }, [isMobile]);
  
  const {
    contacts,
    isLoading,
    searchQuery,
    setSearchQuery,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isInteractionDialogOpen,
    setIsInteractionDialogOpen,
    selectedContact,
    setSelectedContact,
    fetchContacts
  } = useCirclesState();
  const [filterBy, setFilterBy] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    if (tagFilter) {
      setFilterBy(tagFilter);
    }
  }, [tagFilter]);
  
  const filteredSortedContacts = useMemo(() => {
    if (!contacts) return [];
    let result = contacts.filter(contact => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = contact.name?.toLowerCase().includes(query) || 
                             contact.personal_email?.toLowerCase().includes(query) || 
                             contact.company_name?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      const activeTagFilter = tagFilter || filterBy;
      if (activeTagFilter && activeTagFilter !== 'all') {
        if (!contact.tags || !contact.tags.includes(activeTagFilter)) {
          return false;
        }
      }
      return true;
    });
    return [...result].sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "recent") {
        const dateA = a.last_contact ? new Date(a.last_contact).getTime() : 0;
        const dateB = b.last_contact ? new Date(b.last_contact).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });
  }, [contacts, searchQuery, filterBy, tagFilter, sortBy]);

  // Add pagination
  const {
    currentPage,
    totalPages,
    paginatedContacts,
    goToPage,
    hasNextPage,
    hasPreviousPage,
    totalContacts,
    itemsPerPage,
    resetToFirstPage,
  } = usePagination({
    contacts: filteredSortedContacts,
    itemsPerPage: 100,
  });

  // Reset pagination when filters or search change
  useEffect(() => {
    resetToFirstPage();
  }, [searchQuery, filterBy, tagFilter, sortBy, resetToFirstPage]);
  
  const getCircleColor = (circle: string) => {
    switch (circle) {
      case 'inner':
        return 'bg-red-500';
      case 'middle':
        return 'bg-yellow-500';
      case 'outer':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const handleContactTap = (contact: Contact) => {
    console.log('Contact tapped:', contact.id);
    // Pass navigation state to maintain back button context
    navigate(`/contact/${contact.id}`, {
      state: {
        from: '/circles'
      }
    });
  };

  const SwipeableContactCard = ({ contact }: { contact: Contact }) => {
    const [startX, setStartX] = useState(0);
    const [currentX, setCurrentX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const isRevealed = swipedContactId === contact.id;

    const handleTouchStart = (e: React.TouchEvent) => {
      setStartX(e.touches[0].clientX);
      setCurrentX(0);
      setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return;
      const diffX = startX - e.touches[0].clientX;
      if (diffX > 0) {
        setCurrentX(Math.min(diffX, 160)); // Limit swipe distance
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      if (currentX > 80) {
        setSwipedContactId(contact.id);
        setCurrentX(160);
      } else {
        setCurrentX(0);
        setSwipedContactId(null);
      }
    };

    const handleCardTap = () => {
      if (isRevealed) {
        setSwipedContactId(null);
        setCurrentX(0);
      } else {
        handleContactTap(contact);
      }
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedContact(contact);
      setIsEditDialogOpen(true);
      setSwipedContactId(null);
      setCurrentX(0);
    };

    const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Handle delete logic here
      setSwipedContactId(null);
      setCurrentX(0);
    };

    return (
      <motion.div 
        layout 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -20 }} 
        className="relative overflow-hidden mb-3 rounded-2xl"
      >
        {/* Action buttons */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          <motion.div 
            className="flex h-full" 
            initial={{ x: 160 }} 
            animate={{ x: isRevealed ? 0 : 160 }} 
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleEdit} 
              className="h-full rounded-none bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 px-6 flex flex-col items-center justify-center gap-1 shadow-lg transition-all duration-200 active:scale-95"
            >
              <Edit className="h-5 w-5" />
              <span className="text-xs font-medium">Edit</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDelete} 
              className="h-full rounded-none bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white border-0 px-6 flex flex-col items-center justify-center gap-1 shadow-lg transition-all duration-200 active:scale-95"
            >
              <Trash className="h-5 w-5" />
              <span className="text-xs font-medium">Delete</span>
            </Button>
          </motion.div>
        </div>

        {/* Main card */}
        <motion.div 
          ref={cardRef} 
          className="relative z-10" 
          style={{ transform: `translateX(-${isDragging ? currentX : isRevealed ? 160 : 0}px)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <MobileCard isPressable onClick={handleCardTap} className="active:scale-95 transition-transform duration-150 cursor-pointer">
            <MobileCardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                    {contact.avatar_url ? (
                      <AvatarImage src={contact.avatar_url} alt={contact.name} />
                    ) : (
                      <AvatarFallback className="bg-muted dark:bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className={cn("absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background", getCircleColor(contact.circle || 'outer'))} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground dark:text-foreground truncate">{contact.name}</h3>
                  {contact.company_name && <p className="text-sm text-muted-foreground dark:text-muted-foreground truncate">{contact.company_name}</p>}
                  {contact.job_title && <p className="text-xs text-muted-foreground dark:text-muted-foreground truncate">{contact.job_title}</p>}
                  
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {contact.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs rounded-full">
                          {tag}
                        </Badge>
                      ))}
                      {contact.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs rounded-full">
                          +{contact.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2">
                  {contact.personal_email && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={e => {
                      e.stopPropagation();
                      window.open(`mailto:${contact.personal_email}`);
                    }}>
                      <Mail className="h-4 w-4" />
                    </Button>
                  )}
                  {contact.mobile_phone && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={e => {
                      e.stopPropagation();
                      window.open(`tel:${contact.mobile_phone}`);
                    }}>
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </MobileCardContent>
          </MobileCard>
        </motion.div>
      </motion.div>
    );
  };

  // Always render the mobile UI with debug info
  console.log('MobileOptimizedCircles: Rendering mobile UI');
  return (
    <>
      <div className="h-full flex flex-col bg-background dark:bg-background pb-safe">
        {/* Search Header */}
        <div className="bg-card dark:bg-card border-b border-border dark:border-border p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <MobileInput 
              placeholder="Search contacts..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="pl-10 pr-4 rounded-full" 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)} 
              className="flex items-center gap-2 rounded-full"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            
            <div className="flex items-center gap-2">
              <SyncContactsButton onContactsImported={fetchContacts} />
              <Button 
                onClick={() => setIsAddDialogOpen(true)} 
                size="sm" 
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 rounded-full"
              >
                <Plus className="h-4 w-4" />
                Add Contact
              </Button>
            </div>
          </div>
          
          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                className="overflow-hidden"
              >
                <div className="flex gap-2 pt-2">
                  {['all', 'inner', 'middle', 'outer'].map(filter => (
                    <Button 
                      key={filter} 
                      variant={filterBy === filter ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => setFilterBy(filter === 'all' ? null : filter)} 
                      className="capitalize"
                    >
                      {filter}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Contact List with bottom padding for nav */}
        <div className="flex-1 overflow-y-auto p-4 pb-20">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card dark:bg-card rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted dark:bg-muted rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted dark:bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted dark:bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : paginatedContacts.length > 0 ? (
            <>
              <AnimatePresence mode="popLayout">
                {paginatedContacts.map(contact => (
                  <SwipeableContactCard key={contact.id} contact={contact} />
                ))}
              </AnimatePresence>
              
              <ContactsPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                totalContacts={totalContacts}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No contacts found</h3>
              <p className="text-muted-foreground dark:text-muted-foreground mb-6">
                {searchQuery ? "Try adjusting your search" : "Add your first contact to get started"}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <AddContactDialog 
        isOpen={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        onSuccess={fetchContacts} 
      />
      
      <EditContactDialog 
        isOpen={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
        contact={selectedContact} 
        onSuccess={fetchContacts} 
        onCancel={() => setIsEditDialogOpen(false)} 
      />
      
      <InteractionDialog 
        isOpen={isInteractionDialogOpen} 
        onOpenChange={setIsInteractionDialogOpen} 
        contact={selectedContact} 
        onSuccess={fetchContacts} 
        onCancel={() => setIsInteractionDialogOpen(false)} 
      />
    </>
  );
}
