import { useState, useMemo, useCallback } from "react";
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
  Clock
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useContacts } from "@/hooks/use-contacts";
import { useToast } from "@/hooks/use-toast";
import { AddJobApplicationDialog } from "@/components/career/dialogs/AddJobApplicationDialog";
import { AddDocumentDialog } from "@/components/career/dialogs/AddDocumentDialog";
import { AddInterviewSessionDialog } from "@/components/career/dialogs/AddInterviewSessionDialog";

export default function CareerHub() {
  const [activeTab, setActiveTab] = useState("opportunities");
  const [isAddApplicationOpen, setIsAddApplicationOpen] = useState(false);
  const [isUploadDocumentOpen, setIsUploadDocumentOpen] = useState(false);
  const [isInterviewSessionOpen, setIsInterviewSessionOpen] = useState(false);
  const isMobile = useIsMobile();
  const { contacts } = useContacts();
  const { toast } = useToast();

  // Calculate stats from user data
  const stats = useMemo(() => {
    const careerContacts = contacts.filter(contact => contact.career_priority === true || contact.career_tags?.length > 0);
    return {
      careerContacts: careerContacts.length,
      activeApplications: 3,
      upcomingInterviews: 1,
      completedSessions: 7,
      overallProgress: 65
    };
  }, [contacts]);

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

  const handleAddApplication = (application: any) => {
    console.log("Adding application:", application);
    setIsAddApplicationOpen(false);
    toast({
      title: "Application Added",
      description: `Your application for ${application.job_title} at ${application.company_name} has been tracked.`,
    });
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
              <TabsList className="grid w-full grid-cols-2 bg-gray-50/80 p-1.5 rounded-2xl">
                <TabsTrigger value="opportunities" className="rounded-xl text-sm">Opportunities</TabsTrigger>
                <TabsTrigger value="prep" className="rounded-xl text-sm">Prep</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-4 space-y-6">
          {/* Quick Actions */}
          <div className="grid gap-3">
            <Button 
              onClick={() => handleQuickAction("Add Application")}
              className="h-16 justify-between p-4 bg-blue-600 hover:bg-blue-700 border-0 rounded-2xl text-white" 
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-white">Track New Opportunity</p>
                  <p className="text-xs text-blue-100">Add your latest application</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-100" />
            </Button>
          </div>

          {/* Stats Overview */}
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="opportunities" className="space-y-6">
              {/* Strategic Insights */}
              <Card className="p-6 bg-purple-50/50 backdrop-blur-sm border-purple-100 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Zap className="h-4 w-4 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">Smart Insights</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                  📌 Great progress! Your networking is paying off. Consider following up with contacts from your recent events - 3 connections haven't heard from you in 2+ weeks.
                </p>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white border-0 rounded-full">
                  View Suggestions
                </Button>
              </Card>

              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Your Applications</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Stay organized and never miss a follow-up
                </p>
              </div>
            </TabsContent>

            <TabsContent value="prep" className="space-y-6">
              <div className="grid gap-4">
                <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Interview Practice</h3>
                      <p className="text-sm text-muted-foreground">AI-powered mock interviews</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleQuickAction("Start Practice")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white border-0 rounded-xl"
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
                      <h3 className="font-semibold text-gray-900">Resume Review</h3>
                      <p className="text-sm text-muted-foreground">Get AI feedback on your resume</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleQuickAction("Upload Resume")}
                    variant="outline" 
                    className="w-full border-gray-200 hover:bg-gray-50 rounded-xl"
                  >
                    Upload Resume
                  </Button>
                </Card>
              </div>
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

          {/* Quick Actions */}
          <div className="flex gap-4">
            <Button 
              onClick={() => handleQuickAction("Add Application")}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full px-6"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Track Opportunity
            </Button>
            
            <Button 
              onClick={() => handleQuickAction("Start Practice")}
              variant="outline"
              className="border-gray-200 hover:bg-gray-50 rounded-full px-6"
              size="lg"
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Practice Interview
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeApplications}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Interviews Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingInterviews}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prep Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overallProgress}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Strategic Insights */}
        <Card className="p-8 bg-purple-50/50 backdrop-blur-sm border-purple-100 rounded-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Smart Career Insights</h3>
          </div>
          <p className="text-gray-700 mb-6 leading-relaxed max-w-3xl">
            🚀 You're making excellent progress! Your network activity has increased 40% this month. Consider reaching out to 3 contacts from your recent networking events who haven't heard from you in 2+ weeks. The best time to follow up is typically Tuesday-Thursday between 10-11 AM.
          </p>
          <div className="flex gap-4">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white border-0 rounded-full">
              View Detailed Insights
            </Button>
            <Button variant="outline" className="border-gray-200 hover:bg-gray-50 rounded-full">
              Schedule Follow-ups
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-gray-50/80 p-1.5 rounded-2xl">
            <TabsTrigger value="opportunities" className="rounded-xl">Opportunities</TabsTrigger>
            <TabsTrigger value="prep" className="rounded-xl">Preparation</TabsTrigger>
          </TabsList>

          <TabsContent value="opportunities" className="mt-8">
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Track Your Applications</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Stay organized, follow up effectively, and never miss an opportunity
              </p>
              <Button 
                onClick={() => handleQuickAction("Add Application")}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full px-8"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Application
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="prep" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="p-8 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Mock Interview</h3>
                    <p className="text-sm text-muted-foreground">AI-powered practice sessions</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleQuickAction("Start Mock Interview")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white border-0 rounded-xl h-12"
                >
                  Start Practice Session
                </Button>
              </Card>

              <Card className="p-8 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl hover:shadow-lg transition-all duration-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Resume Review</h3>
                    <p className="text-sm text-muted-foreground">Get AI feedback and suggestions</p>
                  </div>
                </div>
                <Button 
                  onClick={() => handleQuickAction("Upload Resume")}
                  variant="outline"
                  className="w-full border-gray-200 hover:bg-gray-50 rounded-xl h-12"
                >
                  Upload Resume
                </Button>
              </Card>
            </div>
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
