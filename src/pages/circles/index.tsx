
import { useCirclesState } from "./hooks/useCirclesState";
import { CirclesHeader } from "./components/CirclesHeader";
import { CircleDialogs } from "./components/CircleDialogs";
import { CirclesTabContent } from "./CirclesTabContent";
import { CirclesTabs } from "./CirclesTabs";
import SearchFilterBar from "./SearchFilterBar";
import { useIsMobile } from "@/hooks/use-mobile";

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

  const isMobile = useIsMobile();
  
  // Ensure we have safe values for props
  const safeSelectedTags = Array.isArray(selectedTags) ? selectedTags : [];
  const safeAvailableTags = Array.isArray(availableTags) ? availableTags : [];
  const safeSearchQuery = typeof searchQuery === 'string' ? searchQuery : '';
  const safeContacts = Array.isArray(contacts) ? contacts.filter(Boolean) : [];

  // Create proper filter structure expected by SearchFilterBar
  const selectedFilters = {
    tags: [],
    locations: [],
    companies: [],
    industries: []
  };

  const handleFiltersChange = (filters) => {
    // We're no longer using tags but keeping the structure for compatibility
    setSelectedTags([]); // Reset tags since we're not using them anymore
    
    // Update the filters state in useCirclesState if needed in the future
    // You could add more logic here if you want to handle filters in the parent component
  };

  // Log to help debug
  console.log("Rendering Circles component with contacts:", safeContacts?.length || 0);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <CirclesHeader onAddContact={() => setIsAddDialogOpen(true)} />

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
