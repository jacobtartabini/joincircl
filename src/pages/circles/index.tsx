
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
  const safeContacts = Array.isArray(contacts) ? contacts : [];

  // Create proper filter structure expected by SearchFilterBar
  const selectedFilters = {
    tags: safeSelectedTags,
    locations: [],
    companies: [],
    industries: []
  };

  const handleFiltersChange = (filters) => {
    // We're only using tags for now
    setSelectedTags(filters.tags);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <CirclesHeader onAddContact={() => setIsAddDialogOpen(true)} />

      <SearchFilterBar 
        allTags={safeAvailableTags}
        allLocations={[]}
        allCompanies={[]}
        allIndustries={[]}
        selectedFilters={selectedFilters}
        onFiltersChange={handleFiltersChange}
        onAddContact={() => setIsAddDialogOpen(true)}
        onRefresh={fetchContacts}
        searchQuery={safeSearchQuery}
        onSearchChange={setSearchQuery}
      />

      <CirclesTabs>
        <CirclesTabContent 
          value="all" 
          contacts={safeContacts}
          searchQuery={safeSearchQuery}
          selectedTags={safeSelectedTags}
          isLoading={isLoading}
          onAddInteraction={handleAddInteraction}
          onViewInsights={handleViewInsights}
          onAddContact={() => setIsAddDialogOpen(true)}
        />
        <CirclesTabContent 
          value="inner" 
          contacts={safeContacts}
          searchQuery={safeSearchQuery}
          selectedTags={safeSelectedTags}
          isLoading={isLoading}
          onAddInteraction={handleAddInteraction}
          onViewInsights={handleViewInsights}
          onAddContact={() => setIsAddDialogOpen(true)}
        />
        <CirclesTabContent 
          value="middle" 
          contacts={safeContacts}
          searchQuery={safeSearchQuery}
          selectedTags={safeSelectedTags}
          isLoading={isLoading}
          onAddInteraction={handleAddInteraction}
          onViewInsights={handleViewInsights}
          onAddContact={() => setIsAddDialogOpen(true)}
        />
        <CirclesTabContent 
          value="outer" 
          contacts={safeContacts}
          searchQuery={safeSearchQuery}
          selectedTags={safeSelectedTags}
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
