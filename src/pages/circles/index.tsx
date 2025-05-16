
import { useCirclesState } from "./hooks/useCirclesState";
import CirclesHeader from "./components/CirclesHeader";
import { CircleDialogs } from "./components/CircleDialogs";
import { CirclesTabContent } from "./CirclesTabContent";
import { CirclesTabs } from "./CirclesTabs";
import SearchFilterBar from "./SearchFilterBar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useMemo, useEffect } from "react";
import { useDuplicateContacts } from "@/hooks/useDuplicateContacts";

const Circles = () => {
  const {
    contacts,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedTags,
    setSelectedTags,
    availableTags,
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
    fetchContacts,
    handleAddInteraction,
    handleViewInsights
  } = useCirclesState();

  // Use the duplicate contacts hook to check for duplicates
  const { duplicatePairs, isLoading: isDuplicatesLoading } = useDuplicateContacts();
  
  // Determine if we have duplicates to show
  const hasDuplicates = useMemo(() => {
    return duplicatePairs.length > 0;
  }, [duplicatePairs]);

  const isMobile = useIsMobile();
  
  // Ensure we have safe values for props
  const safeSelectedTags = useMemo(() => 
    Array.isArray(selectedTags) ? selectedTags : []
  , [selectedTags]);
  
  const safeAvailableTags = useMemo(() =>
    Array.isArray(availableTags) ? availableTags : []
  , [availableTags]);
  
  const safeSearchQuery = useMemo(() =>
    typeof searchQuery === 'string' ? searchQuery : ''
  , [searchQuery]);
  
  const safeContacts = useMemo(() => 
    Array.isArray(contacts) ? contacts.filter(Boolean) : []
  , [contacts]);

  // Create proper filter structure expected by SearchFilterBar
  const [selectedFilters, setSelectedFilters] = useState({
    tags: [],
    locations: [],
    companies: [],
    industries: []
  });

  const handleFiltersChange = (filters) => {
    // We're no longer using tags but keeping the structure for compatibility
    setSelectedTags([]); // Reset tags since we're not using them anymore
    setSelectedFilters(filters);
  };

  // Log to help debug
  console.log("Rendering Circles component with contacts:", safeContacts?.length || 0);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <CirclesHeader 
        onAddContact={() => setIsAddDialogOpen(true)} 
        hasDuplicates={hasDuplicates}
      />

      <SearchFilterBar 
        allTags={[]} // Empty array since we're not using tags
        allLocations={[]} // Using empty arrays as fallbacks, data will be populated from contacts
        allCompanies={[]}
        allIndustries={[]}
        selectedFilters={selectedFilters}
        onFiltersChange={handleFiltersChange}
        onAddContact={() => setIsAddDialogOpen(true)}
        onRefresh={fetchContacts}
        searchQuery={safeSearchQuery}
        onSearchChange={setSearchQuery}
        contacts={safeContacts} // Always pass a valid array
      />

      <CirclesTabs>
        <CirclesTabContent 
          value="all" 
          contacts={safeContacts}
          searchQuery={safeSearchQuery}
          selectedTags={[]} // Pass empty array since we're not using tags anymore
          isLoading={isLoading}
          onAddInteraction={handleAddInteraction}
          onViewInsights={handleViewInsights}
          onAddContact={() => setIsAddDialogOpen(true)}
        />
        <CirclesTabContent 
          value="inner" 
          contacts={safeContacts}
          searchQuery={safeSearchQuery}
          selectedTags={[]}
          isLoading={isLoading}
          onAddInteraction={handleAddInteraction}
          onViewInsights={handleViewInsights}
          onAddContact={() => setIsAddDialogOpen(true)}
        />
        <CirclesTabContent 
          value="middle" 
          contacts={safeContacts}
          searchQuery={safeSearchQuery}
          selectedTags={[]}
          isLoading={isLoading}
          onAddInteraction={handleAddInteraction}
          onViewInsights={handleViewInsights}
          onAddContact={() => setIsAddDialogOpen(true)}
        />
        <CirclesTabContent 
          value="outer" 
          contacts={safeContacts}
          searchQuery={safeSearchQuery}
          selectedTags={[]}
          isLoading={isLoading}
          onAddInteraction={handleAddInteraction}
          onViewInsights={handleViewInsights}
          onAddContact={() => setIsAddDialogOpen(true)}
        />
      </CirclesTabs>

      <CircleDialogs 
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isInteractionDialogOpen={isInteractionDialogOpen}
        setIsInteractionDialogOpen={setIsInteractionDialogOpen}
        isInsightsDialogOpen={isInsightsDialogOpen}
        setIsInsightsDialogOpen={setIsInsightsDialogOpen}
        selectedContact={selectedContact}
        setSelectedContact={setSelectedContact}
        onFetchContacts={fetchContacts}
      />
    </div>
  );
};

export default Circles;
