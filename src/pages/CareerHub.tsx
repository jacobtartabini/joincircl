
import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCareerData } from "@/hooks/use-career-data";
import { useToast } from "@/hooks/use-toast";
import { AddJobApplicationDialog } from "@/components/career/dialogs/AddJobApplicationDialog";
import { AddDocumentDialog } from "@/components/career/dialogs/AddDocumentDialog";
import { AddInterviewSessionDialog } from "@/components/career/dialogs/AddInterviewSessionDialog";
import { JobApplicationWorkflow } from "@/components/career/JobApplicationWorkflow";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CareerToolsView } from "@/components/career/tools/CareerToolsView";
import { CareerHubHeader } from "@/components/career/CareerHubHeader";
import { CareerOverviewSection } from "@/components/career/CareerOverviewSection";
import { CareerApplicationsSection } from "@/components/career/CareerApplicationsSection";

export default function CareerHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [isAddApplicationOpen, setIsAddApplicationOpen] = useState(false);
  const [isUploadDocumentOpen, setIsUploadDocumentOpen] = useState(false);
  const [isInterviewSessionOpen, setIsInterviewSessionOpen] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const isMobile = useIsMobile();
  const { stats, isLoading, refetch } = useCareerData();
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchApplications = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleQuickAction = useCallback((action: string) => {
    console.log(`Quick action: ${action}`);
    if (action === "Add Application") {
      setIsAddApplicationOpen(true);
    } else if (action === "Upload Resume") {
      setIsUploadDocumentOpen(true);
    } else if (action === "Start Practice" || action === "Start Mock Interview") {
      setIsInterviewSessionOpen(true);
    } else {
      toast({
        title: "Action Started",
        description: `${action} has been initiated.`,
      });
    }
  }, [toast]);

  const handleAddApplication = async (applicationData: any) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to add applications.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('job_applications')
        .insert({
          ...applicationData,
          user_id: user.id,
          job_description: applicationData.job_description || null,
          interviewer_contacts: applicationData.interviewer_contacts || [],
          workflow_stage: 'application_info',
          stage_completion: {}
        });

      if (error) throw error;

      setIsAddApplicationOpen(false);
      refetch();
      fetchApplications();
      toast({
        title: "Application Added",
        description: `Your application for ${applicationData.job_title} at ${applicationData.company_name} has been tracked.`,
      });
    } catch (error) {
      console.error('Error adding application:', error);
      toast({
        title: "Error",
        description: "Failed to add job application. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUploadDocument = (document: any) => {
    console.log("Uploading document:", document);
    setIsUploadDocumentOpen(false);
    toast({
      title: "Document Uploaded",
      description: `${document.document_name} has been uploaded successfully.`,
    });
  };

  const handleStartInterviewSession = (session: any) => {
    console.log("Starting interview session:", session);
    setIsInterviewSessionOpen(false);
    toast({
      title: "Interview Session Started",
      description: `${session.session_title} session is now ready.`,
    });
  };

  // Show workflow view if an application is selected
  if (selectedApplicationId) {
    return (
      <div className="min-h-screen refined-web-theme">
        <div className="max-w-7xl mx-auto p-6">
          <JobApplicationWorkflow 
            applicationId={selectedApplicationId}
            onBack={() => setSelectedApplicationId(null)}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen refined-web-theme flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your career data...</p>
        </div>
      </div>
    );
  }

  const containerClass = isMobile 
    ? "min-h-screen refined-web-theme pb-20"
    : "min-h-screen refined-web-theme";

  const contentClass = isMobile
    ? "max-w-7xl mx-auto p-4 space-y-6"
    : "max-w-7xl mx-auto p-6 space-y-8";

  return (
    <div className={containerClass}>
      <CareerHubHeader 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isMobile={isMobile} 
      />

      <div className={contentClass}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview" className="space-y-6">
            <CareerOverviewSection 
              stats={stats}
              onQuickAction={handleQuickAction}
              isMobile={isMobile}
            />
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <CareerApplicationsSection
              applications={applications}
              onAddApplication={() => setIsAddApplicationOpen(true)}
              onSelectApplication={setSelectedApplicationId}
              isMobile={isMobile}
            />
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            {!isMobile && <h2 className="text-2xl font-bold text-gray-900">Career Tools</h2>}
            <CareerToolsView />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddJobApplicationDialog
        isOpen={isAddApplicationOpen}
        onOpenChange={setIsAddApplicationOpen}
        onAdd={handleAddApplication}
      />
      
      <AddDocumentDialog
        isOpen={isUploadDocumentOpen}
        onOpenChange={setIsUploadDocumentOpen}
        onAdd={handleUploadDocument}
      />
      
      <AddInterviewSessionDialog
        isOpen={isInterviewSessionOpen}
        onOpenChange={setIsInterviewSessionOpen}
        onAdd={handleStartInterviewSession}
      />
    </div>
  );
}
