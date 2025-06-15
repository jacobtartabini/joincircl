import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Target, 
  BookOpen, 
  Plus, 
  TrendingUp, 
  Calendar,
  FileText,
  Star,
  ArrowRight,
  Zap,
  Clock,
  ChevronRight
} from "lucide-react";
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

  // Fetch applications on mount
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
      refetch(); // Refresh the stats
      fetchApplications(); // Refresh applications list
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

  const getApplicationProgress = (app: any) => {
    if (!app.stage_completion) return 0;
    const stages = Object.values(app.stage_completion);
    const completedStages = stages.filter((stage: any) => stage?.completed).length;
    return Math.round((completedStages / 7) * 100); // 7 total stages
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

  if (isMobile) {
    return (
      <div className="min-h-screen refined-web-theme pb-20">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-gray-100 p-4 pt-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Career Hub</h1>
              <p className="text-sm text-muted-foreground">Your professional journey</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-50/80 p-1.5 rounded-2xl">
                <TabsTrigger value="overview" className="rounded-xl text-sm">Overview</TabsTrigger>
                <TabsTrigger value="applications" className="rounded-xl text-sm">Applications</TabsTrigger>
                <TabsTrigger value="tools" className="rounded-xl text-sm">Tools</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="overview" className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{stats.activeApplications}</p>
                      <p className="text-xs text-muted-foreground">Active Apps</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{stats.upcomingInterviews}</p>
                      <p className="text-xs text-muted-foreground">Interviews</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Smart Insights */}
              <Card className="p-6 bg-blue-50/50 backdrop-blur-sm border-blue-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Zap className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Smart Insights</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  {stats.careerContacts > 0 
                    ? `📈 You have ${stats.careerContacts} career contacts! Consider following up with contacts you haven't spoken to recently.`
                    : "🚀 Start building your career network by adding contacts and tracking job applications."
                  }
                </p>
                <Button 
                  onClick={() => handleQuickAction("Add Application")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Track New Opportunity
                </Button>
              </Card>

              {/* Progress Overview */}
              <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Overall Progress</h3>
                  <span className="text-2xl font-bold text-blue-600">{stats.overallProgress}%</span>
                </div>
                <Progress value={stats.overallProgress} className="mb-4" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <span className="text-muted-foreground">Applications: {stats.activeApplications}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-muted-foreground">Sessions: {stats.completedSessions}</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Job Applications</h3>
                <Button 
                  size="sm"
                  onClick={() => setIsAddApplicationOpen(true)}
                  className="rounded-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>

              {applications.length === 0 ? (
                <Card className="p-8 text-center bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">No Applications Yet</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Start your job search journey with guided workflows
                  </p>
                  <Button 
                    onClick={() => setIsAddApplicationOpen(true)}
                    className="rounded-full"
                  >
                    Add Your First Application
                  </Button>
                </Card>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <Card 
                      key={app.id} 
                      className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50/50 transition-colors"
                      onClick={() => setSelectedApplicationId(app.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{app.job_title}</h4>
                              <p className="text-sm text-muted-foreground">{app.company_name}</p>
                            </div>
                            <Badge className="ml-auto">
                              {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-muted-foreground">Progress</span>
                                <span className="text-xs font-medium">{getApplicationProgress(app)}%</span>
                              </div>
                              <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 transition-all duration-300"
                                  style={{ width: `${getApplicationProgress(app)}%` }}
                                />
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TOOLS TAB (MOBILE) */}
            <TabsContent value="tools" className="space-y-6">
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

  // Desktop Version
  return (
    <div className="min-h-screen refined-web-theme">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900">Career Hub</h1>
            <p className="text-muted-foreground text-lg">Your professional journey starts here</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-gray-50/80 p-1.5 rounded-2xl">
              <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
              <TabsTrigger value="applications" className="rounded-xl">Applications</TabsTrigger>
              <TabsTrigger value="tools" className="rounded-xl">Tools</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview" className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Active Apps</p>
                        <p className="text-xl font-bold text-gray-900">{stats.activeApplications}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Interviews</p>
                        <p className="text-xl font-bold text-gray-900">{stats.upcomingInterviews}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sessions</p>
                        <p className="text-xl font-bold text-gray-900">{stats.completedSessions}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <p className="text-xl font-bold text-gray-900">{stats.overallProgress}%</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Smart Insights */}
                <Card className="p-6 bg-blue-50/50 backdrop-blur-sm border-blue-100 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Smart Career Insights</h3>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {stats.careerContacts > 0 
                      ? `🚀 You have ${stats.careerContacts} career contacts and ${stats.activeApplications} active applications! ${stats.completedSessions > 0 ? `Plus ${stats.completedSessions} practice sessions completed. ` : ''}Consider reaching out to contacts you haven't spoken to recently.`
                      : "🚀 Start building your career network by adding contacts, tracking job applications, and practicing for interviews."
                    }
                  </p>
                  <div className="flex gap-4">
                    <Button 
                      onClick={() => handleQuickAction("Add Application")}
                      className="bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full"
                    >
                      Track New Application
                    </Button>
                    <Button variant="outline" className="border-gray-200 hover:bg-gray-50 rounded-full">
                      Schedule Follow-ups
                    </Button>
                  </div>
                </Card>

                {/* Progress Overview */}
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
                    <span className="text-2xl font-bold text-blue-600">{stats.overallProgress}%</span>
                  </div>
                  <Progress value={stats.overallProgress} className="mb-6" />
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{stats.activeApplications}</div>
                      <div className="text-muted-foreground">Applications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{stats.upcomingInterviews}</div>
                      <div className="text-muted-foreground">Interviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">{stats.completedSessions}</div>
                      <div className="text-muted-foreground">Prep Sessions</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Column - Tools */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Career Tools</h3>
                
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Mock Interview</h4>
                      <p className="text-sm text-muted-foreground">AI-powered practice sessions</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleQuickAction("Start Mock Interview")}
                    variant="outline"
                    className="w-full border-gray-200 hover:bg-gray-50 rounded-full"
                  >
                    Start Practice Session
                  </Button>
                </Card>

                <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Resume Review</h4>
                      <p className="text-sm text-muted-foreground">Get AI feedback and suggestions</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleQuickAction("Upload Resume")}
                    variant="outline"
                    className="w-full border-gray-200 hover:bg-gray-50 rounded-full"
                  >
                    Upload Resume
                  </Button>
                </Card>

                <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                      <Target className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Application Tracker</h4>
                      <p className="text-sm text-muted-foreground">Organize your job applications</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleQuickAction("Add Application")}
                    variant="outline"
                    className="w-full border-gray-200 hover:bg-gray-50 rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Application
                  </Button>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Job Applications</h2>
              <Button 
                onClick={() => setIsAddApplicationOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full px-6"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Application
              </Button>
            </div>

            {applications.length === 0 ? (
              <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Applications Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Start your job search journey with guided workflows that help you stay organized 
                  and prepared throughout the entire application process.
                </p>
                <Button 
                  onClick={() => setIsAddApplicationOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full px-8"
                  size="lg"
                >
                  Add Your First Application
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map((app) => (
                  <Card 
                    key={app.id} 
                    className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50/50 transition-all duration-200 group"
                    onClick={() => setSelectedApplicationId(app.id)}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {app.job_title}
                          </h4>
                          <p className="text-muted-foreground">{app.company_name}</p>
                        </div>
                        <Badge className="ml-2">
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm font-medium text-blue-600">{getApplicationProgress(app)}%</span>
                        </div>
                        <Progress value={getApplicationProgress(app)} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {app.workflow_stage?.replace('_', ' ').split(' ').map((word: string) => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ') || 'Getting Started'}
                        </span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Career Tools</h2>
            <CareerToolsView />
          </TabsContent>
        </Tabs>

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
    </div>
  );
}
