
import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCirclesState } from "./hooks/useCirclesState";
import { Contact } from "@/types/contact";
import { AddContactDialog } from "./dialogs/AddContactDialog";
import { EditContactDialog } from "./dialogs/EditContactDialog";
import { InteractionDialog } from "./dialogs/InteractionDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileCard, MobileCardContent } from "@/components/ui/mobile-card";
import { MobileInput } from "@/components/ui/mobile-input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, User, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function MobileOptimizedCircles() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const tagFilter = searchParams.get('tag');
  
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
    fetchContacts,
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
        const matchesSearch = (
          contact.name?.toLowerCase().includes(query) ||
          contact.personal_email?.toLowerCase().includes(query) ||
          contact.company_name?.toLowerCase().includes(query)
        );
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

  const getCircleColor = (circle: string) => {
    switch (circle) {
      case 'inner': return 'bg-red-500';
      case 'middle': return 'bg-yellow-500';
      case 'outer': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const handleContactTap = (contact: Contact) => {
    // Navigate directly to the contact detail page
    navigate(`/contacts/${contact.id}`);
  };

  const ContactCard = ({ contact }: { contact: Contact }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <MobileCard 
        isPressable
        onClick={() => handleContactTap(contact)}
        className="mb-3 active:scale-95 transition-transform duration-150"
      >
        <MobileCardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                {contact.avatar_url ? (
                  <AvatarImage src={contact.avatar_url} alt={contact.name} />
                ) : (
                  <AvatarFallback className="bg-gray-100">
                    <User className="h-5 w-5 text-gray-500" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className={cn(
                "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                getCircleColor(contact.circle || 'outer')
              )} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
              {contact.company_name && (
                <p className="text-sm text-gray-600 truncate">{contact.company_name}</p>
              )}
              {contact.job_title && (
                <p className="text-xs text-gray-500 truncate">{contact.job_title}</p>
              )}
              
              {contact.tags && contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {contact.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {contact.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{contact.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-2">
              {contact.personal_email && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`mailto:${contact.personal_email}`);
                  }}
                >
                  <Mail className="h-4 w-4" />
                </Button>
              )}
              {contact.mobile_phone && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`tel:${contact.mobile_phone}`);
                  }}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </MobileCardContent>
      </MobileCard>
    </motion.div>
  );

  if (!isMobile) {
    return null;
  }

  return (
    <>
      <div className="h-full flex flex-col bg-gray-50">
        {/* Search Header */}
        <div className="bg-white border-b border-gray-100 p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <MobileInput
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
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
                  {['all', 'inner', 'middle', 'outer'].map((filter) => (
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

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredSortedContacts.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredSortedContacts.map((contact) => (
                <ContactCard key={contact.id} contact={contact} />
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
              <p className="text-gray-600 mb-6">
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
