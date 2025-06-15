
import { useState, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, FileText, Calendar, MessageSquare, Plus, TrendingUp, Target, BookOpen, Star } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useContacts } from "@/hooks/use-contacts";
import CareerContactsView from "@/components/career/CareerContactsView";
import JobApplicationTracker from "@/components/career/JobApplicationTracker";
import DocumentVault from "@/components/career/DocumentVault";
import InterviewPrep from "@/components/career/InterviewPrep";
import CareerEventMode from "@/components/career/CareerEventMode";
import { AddContactDialog } from "@/components/career/dialogs/AddContactDialog";
import { AddDocumentDialog } from "@/components/career/dialogs/AddDocumentDialog";
import { AddEventDialog } from "@/components/career/dialogs/AddEventDialog";
import { AddInterviewSessionDialog } from "@/components/career/dialogs/AddInterviewSessionDialog";
import { useToast } from "@/hooks/use-toast";

export default function CareerHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();
  const { contacts, addContact } = useContacts();
  const { toast } = useToast();

  // Dialog states
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [showAddDocumentDialog, setShowAddDocumentDialog] = useState(false);
  const [showAddEventDialog, setShowAddEventDialog] = useState(false);
  const [showAddInterviewDialog, setShowAddInterviewDialog] = useState(false);

  // Calculate stats from user data
  const stats = useMemo(() => {
    const careerContacts = contacts.filter(contact => contact.career_priority === true || contact.career_tags?.length > 0);
    return {
      careerContacts: careerContacts.length,
      activeApplications: 0,
      upcomingInterviews: 0,
      documentsStored: 0
    };
  }, [contacts]);

  // Quick add handlers
  const handleQuickAdd = () => {
    setActiveTab("applications");
  };

  const handleAddContact = useCallback(async (contactData: any) => {
    try {
      await addContact({
        ...contactData,
        circle: 'outer',
        user_id: ''
      });
      setShowAddContactDialog(false);
      toast({
        title: "Contact Added",
        description: "Career contact has been successfully added.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    }
  }, [addContact, toast]);

  const handleAddDocument = useCallback((documentData: any) => {
    console.log('Adding document:', documentData);
    setShowAddDocumentDialog(false);
    toast({
      title: "Document Uploaded",
      description: `${documentData.document_name} has been uploaded successfully.`,
    });
  }, [toast]);

  const handleAddEvent = useCallback((eventData: any) => {
    console.log('Adding event:', eventData);
    setShowAddEventDialog(false);
    toast({
      title: "Event Added",
      description: `${eventData.event_name} has been added to your calendar.`,
    });
  }, [toast]);

  const handleAddInterviewSession = useCallback((sessionData: any) => {
    console.log('Starting interview session:', sessionData);
    setShowAddInterviewDialog(false);
    setActiveTab("interview");
    toast({
      title: "Session Started",
      description: `${sessionData.session_title} interview session has been created.`,
    });
  }, [toast]);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/10 pb-20">
        <div className="sticky top-0 z-10 glass-card bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-white/20 dark:border-white/10 p-6 pt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Career Hub</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your professional journey</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-card-enhanced p-1.5 rounded-2xl">
              <TabsTrigger value="overview" className="rounded-xl text-sm">Overview</TabsTrigger>
              <TabsTrigger value="contacts" className="rounded-xl text-sm">Network</TabsTrigger>
              <TabsTrigger value="applications" className="rounded-xl text-sm">Jobs</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-6 space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="overview" className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 glass-card-enhanced rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Network</p>
                      <p className="text-2xl font-bold text-foreground">{stats.careerContacts}</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 glass-card-enhanced rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Applications</p>
                      <p className="text-2xl font-bold text-foreground">{stats.activeApplications}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 glass-card-enhanced rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Interviews</p>
                      <p className="text-2xl font-bold text-foreground">{stats.upcomingInterviews}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 glass-card-enhanced rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Documents</p>
                      <p className="text-2xl font-bold text-foreground">{stats.documentsStored}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Arlo Insights */}
              <Card className="p-8 glass-card-enhanced rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Arlo's Insights</h3>
                </div>
                <div className="glass-card bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                  <p className="text-sm text-foreground mb-4 leading-relaxed">
                    {stats.careerContacts === 0 
                      ? "✨ Ready to accelerate your career? Start by adding your professional contacts to unlock personalized networking insights and opportunities." 
                      : "🚀 Your professional network is growing! Consider reaching out to 2-3 contacts you haven't connected with recently to strengthen your relationships."}
                  </p>
                  <Button 
                    size="sm" 
                    className="glass-button rounded-full font-medium"
                    onClick={() => stats.careerContacts === 0 ? setShowAddContactDialog(true) : null}
                  >
                    {stats.careerContacts === 0 ? "Add Your Network" : "Get Suggestions"}
                  </Button>
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4">
                  <Button 
                    onClick={handleQuickAdd} 
                    className="h-16 glass-card-enhanced hover:glass-card justify-start gap-4 bg-transparent border-white/20 rounded-2xl transition-all duration-200" 
                    variant="outline"
                  >
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <Plus className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Add Job Application</p>
                      <p className="text-xs text-muted-foreground">Track your next opportunity</p>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => setShowAddInterviewDialog(true)} 
                    className="h-16 glass-card-enhanced hover:glass-card justify-start gap-4 bg-transparent border-white/20 rounded-2xl transition-all duration-200" 
                    variant="outline"
                  >
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-foreground">Practice Interviews</p>
                      <p className="text-xs text-muted-foreground">Boost your confidence</p>
                    </div>
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contacts">
              <CareerContactsView />
            </TabsContent>

            <TabsContent value="applications">
              <JobApplicationTracker />
            </TabsContent>
          </Tabs>
        </div>

        {/* Dialogs */}
        <AddContactDialog 
          isOpen={showAddContactDialog} 
          onOpenChange={setShowAddContactDialog}
          onAdd={handleAddContact}
        />
        <AddDocumentDialog 
          isOpen={showAddDocumentDialog} 
          onOpenChange={setShowAddDocumentDialog}
          onAdd={handleAddDocument}
        />
        <AddEventDialog 
          isOpen={showAddEventDialog} 
          onOpenChange={setShowAddEventDialog}
          onAdd={handleAddEvent}
        />
        <AddInterviewSessionDialog 
          isOpen={showAddInterviewDialog} 
          onOpenChange={setShowAddInterviewDialog}
          onAdd={handleAddInterviewSession}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/10 pb-20">
      <div className="flex">
        {/* Refined Sidebar */}
        <div className="w-80 min-h-screen glass-card-enhanced bg-white/60 dark:bg-black/20 backdrop-blur-xl border-r border-white/20 dark:border-white/10 p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Briefcase className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Career Hub</h1>
              <p className="text-sm text-muted-foreground">Professional growth</p>
            </div>
          </div>

          <nav className="space-y-3 mb-12">
            <Button 
              variant={activeTab === "overview" ? "default" : "ghost"} 
              onClick={() => setActiveTab("overview")} 
              className="w-full justify-start gap-4 h-14 glass-button rounded-2xl font-medium"
            >
              <TrendingUp className="h-5 w-5" />
              Overview
            </Button>
            
            <Button 
              variant={activeTab === "contacts" ? "default" : "ghost"} 
              onClick={() => setActiveTab("contacts")} 
              className="w-full justify-start gap-4 h-14 glass-button rounded-2xl font-medium"
            >
              <Users className="h-5 w-5" />
              Professional Network
              {stats.careerContacts > 0 && (
                <Badge variant="secondary" className="ml-auto rounded-full">
                  {stats.careerContacts}
                </Badge>
              )}
            </Button>

            <Button 
              variant={activeTab === "applications" ? "default" : "ghost"} 
              onClick={() => setActiveTab("applications")} 
              className="w-full justify-start gap-4 h-14 glass-button rounded-2xl font-medium"
            >
              <Target className="h-5 w-5" />
              Job Applications
              {stats.activeApplications > 0 && (
                <Badge variant="secondary" className="ml-auto rounded-full">
                  {stats.activeApplications}
                </Badge>
              )}
            </Button>

            <Button 
              variant={activeTab === "documents" ? "default" : "ghost"} 
              onClick={() => setActiveTab("documents")} 
              className="w-full justify-start gap-4 h-14 glass-button rounded-2xl font-medium"
            >
              <FileText className="h-5 w-5" />
              Document Vault
            </Button>

            <Button 
              variant={activeTab === "interview" ? "default" : "ghost"} 
              onClick={() => setActiveTab("interview")} 
              className="w-full justify-start gap-4 h-14 glass-button rounded-2xl font-medium"
            >
              <BookOpen className="h-5 w-5" />
              Interview Prep
            </Button>

            <Button 
              variant={activeTab === "events" ? "default" : "ghost"} 
              onClick={() => setActiveTab("events")} 
              className="w-full justify-start gap-4 h-14 glass-button rounded-2xl font-medium"
            >
              <Calendar className="h-5 w-5" />
              Career Events
            </Button>
          </nav>

          {/* Arlo Insights Sidebar */}
          <Card className="p-6 glass-card-enhanced rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">Arlo Says</span>
            </div>
            <div className="glass-card bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
              <p className="text-sm text-foreground mb-4 leading-relaxed">
                {stats.careerContacts === 0 
                  ? "Ready to elevate your career? Start building your professional network today!" 
                  : "Excellent progress! You're building meaningful professional relationships."}
              </p>
              <Button 
                size="sm" 
                className="w-full glass-button rounded-full font-medium" 
                onClick={() => stats.careerContacts === 0 ? setShowAddContactDialog(true) : setShowAddInterviewDialog(true)}
              >
                {stats.careerContacts === 0 ? "Get Started" : "Practice Interview"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === "overview" && (
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Career Overview</h2>
                  <p className="text-muted-foreground">Track your professional development journey</p>
                </div>
                <Button className="gap-3 glass-button rounded-full h-12 px-6 font-medium" onClick={handleQuickAdd}>
                  <Plus className="h-4 w-4" />
                  Quick Add
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-8 glass-card-enhanced rounded-2xl hover:glass-card transition-all duration-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Professional Network</p>
                      <p className="text-3xl font-bold text-foreground">{stats.careerContacts}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.careerContacts === 0 ? "Build your first connection" : "Growing your influence"}
                  </p>
                </Card>

                <Card className="p-8 glass-card-enhanced rounded-2xl hover:glass-card transition-all duration-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Active Applications</p>
                      <p className="text-3xl font-bold text-foreground">{stats.activeApplications}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeApplications === 0 ? "Ready to apply?" : "Tracking progress"}
                  </p>
                </Card>

                <Card className="p-8 glass-card-enhanced rounded-2xl hover:glass-card transition-all duration-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Upcoming Interviews</p>
                      <p className="text-3xl font-bold text-foreground">{stats.upcomingInterviews}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.upcomingInterviews === 0 ? "Practice makes perfect" : "You've got this!"}
                  </p>
                </Card>

                <Card className="p-8 glass-card-enhanced rounded-2xl hover:glass-card transition-all duration-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Documents</p>
                      <p className="text-3xl font-bold text-foreground">{stats.documentsStored}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.documentsStored === 0 ? "Upload your resume" : "Well organized"}
                  </p>
                </Card>
              </div>

              {/* Enhanced Insights Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-8 glass-card-enhanced rounded-2xl">
                  <h3 className="font-semibold text-foreground mb-6 text-lg">Recent Activity</h3>
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-sm text-muted-foreground mb-2">No recent activity</p>
                    <p className="text-xs text-muted-foreground">
                      Start adding applications or contacts to see your progress here
                    </p>
                  </div>
                </Card>

                <Card className="p-8 glass-card-enhanced rounded-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">Arlo's Strategic Insights</h3>
                  </div>
                  <div className="space-y-6">
                    <div className="glass-card bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6">
                      <p className="text-sm text-foreground mb-4 leading-relaxed">
                        {stats.careerContacts === 0 
                          ? "💡 Building a strong professional network is the foundation of career success. Start by adding 3-5 key contacts to unlock personalized networking strategies." 
                          : "💡 Excellent networking progress! Consider scheduling coffee chats with contacts you haven't spoken to in the last 3 months to strengthen your relationships."}
                      </p>
                      <Button size="sm" className="glass-button rounded-full font-medium">
                        {stats.careerContacts === 0 ? "Build Network" : "Schedule Outreach"}
                      </Button>
                    </div>
                    <div className="glass-card bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6">
                      <p className="text-sm text-foreground mb-4 leading-relaxed">
                        {stats.activeApplications === 0 
                          ? "🎯 Ready to take the next step? Upload your resume and start tracking applications to stay organized and focused." 
                          : "🎯 Great job staying organized! Don't forget to follow up on applications after 1-2 weeks."}
                      </p>
                      <Button size="sm" className="glass-button rounded-full font-medium">
                        {stats.activeApplications === 0 ? "Upload Resume" : "Set Reminder"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "contacts" && <CareerContactsView />}
          {activeTab === "applications" && <JobApplicationTracker />}
          {activeTab === "documents" && <DocumentVault />}
          {activeTab === "interview" && <InterviewPrep />}
          {activeTab === "events" && <CareerEventMode />}
        </div>
      </div>

      {/* Dialogs */}
      <AddContactDialog 
        isOpen={showAddContactDialog} 
        onOpenChange={setShowAddContactDialog}
        onAdd={handleAddContact}
      />
      <AddDocumentDialog 
        isOpen={showAddDocumentDialog} 
        onOpenChange={setShowAddDocumentDialog}
        onAdd={handleAddDocument}
      />
      <AddEventDialog 
        isOpen={showAddEventDialog} 
        onOpenChange={setShowAddEventDialog}
        onAdd={handleAddEvent}
      />
      <AddInterviewSessionDialog 
        isOpen={showAddInterviewDialog} 
        onOpenChange={setShowAddInterviewDialog}
        onAdd={handleAddInterviewSession}
      />
    </div>
  );
}
