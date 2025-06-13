import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Users, FileText, Calendar, MessageSquare, Plus, TrendingUp, Target, BookOpen } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useContacts } from "@/hooks/use-contacts";
import CareerContactsView from "@/components/career/CareerContactsView";
import JobApplicationTracker from "@/components/career/JobApplicationTracker";
import DocumentVault from "@/components/career/DocumentVault";
import InterviewPrep from "@/components/career/InterviewPrep";
import CareerEventMode from "@/components/career/CareerEventMode";
export default function CareerHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();
  const {
    contacts
  } = useContacts();

  // Calculate real stats from user data
  const stats = useMemo(() => {
    const careerContacts = contacts.filter(contact => contact.career_priority === true || contact.career_tags?.length > 0);
    return {
      careerContacts: careerContacts.length,
      activeApplications: 0,
      // This would come from job applications state
      upcomingInterviews: 0,
      // This would come from interview sessions
      documentsStored: 0 // This would come from documents state
    };
  }, [contacts]);
  const recentActivity = [
    // This would be populated from real user activity data
  ];
  if (isMobile) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20 pb-20">
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b border-white/20 dark:border-white/10 p-4 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Career Hub</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your professional journey</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-card p-1 rounded-2xl">
              <TabsTrigger value="overview" className="rounded-xl">Overview</TabsTrigger>
              <TabsTrigger value="contacts" className="rounded-xl">Contacts</TabsTrigger>
              <TabsTrigger value="applications" className="rounded-xl">Jobs</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Card className="p-4 glass-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-foreground">Career Contacts</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stats.careerContacts}</div>
                </Card>
                
                <Card className="p-4 glass-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-foreground">Applications</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stats.activeApplications}</div>
                </Card>

                <Card className="p-4 glass-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-foreground">Interviews</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stats.upcomingInterviews}</div>
                </Card>

                <Card className="p-4 glass-card">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-foreground">Documents</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stats.documentsStored}</div>
                </Card>
              </div>

              <Card className="p-4 glass-card">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-foreground">Arlo's Career Tips</span>
                </div>
                <div className="glass-card bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-3">
                  <p className="text-sm text-foreground mb-2">
                    {stats.careerContacts === 0 ? "💡 Start building your network! Add your first career contact to get personalized suggestions." : "💡 Great progress on your network! Consider reaching out to 2-3 contacts you haven't spoken to recently."}
                  </p>
                  <Button size="sm" variant="outline" className="text-xs glass-button">
                    {stats.careerContacts === 0 ? "Add Contact" : "See Suggestions"}
                  </Button>
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-3">
                <Button onClick={() => setActiveTab("applications")} className="h-12 glass-card hover:glass-card-enhanced justify-start gap-3 bg-transparent border-white/20" variant="outline">
                  <Plus className="h-4 w-4" />
                  Add Job Application
                </Button>
                
                <Button onClick={() => setActiveTab("interview")} className="h-12 glass-card hover:glass-card-enhanced justify-start gap-3 bg-transparent border-white/20" variant="outline">
                  <BookOpen className="h-4 w-4" />
                  Start Interview Prep
                </Button>
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
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20 pb-20">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 min-h-screen glass-card bg-white/60 dark:bg-black/20 backdrop-blur-sm border-r border-white/20 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Career Hub</h1>
              <p className="text-sm text-muted-foreground">Your professional journey</p>
            </div>
          </div>

          <nav className="space-y-2 mb-8">
            <Button variant={activeTab === "overview" ? "default" : "ghost"} onClick={() => setActiveTab("overview")} className="w-full justify-start gap-3 h-12 glass-button rounded-full">
              <TrendingUp className="h-4 w-4" />
              Overview
            </Button>
            
            <Button variant={activeTab === "contacts" ? "default" : "ghost"} onClick={() => setActiveTab("contacts")} className="w-full justify-start gap-3 h-12 glass-button rounded-full">
              <Users className="h-4 w-4" />
              Career Contacts
              {stats.careerContacts > 0 && <Badge variant="secondary" className="ml-auto">{stats.careerContacts}</Badge>}
            </Button>

            <Button variant={activeTab === "applications" ? "default" : "ghost"} onClick={() => setActiveTab("applications")} className="w-full justify-start gap-3 h-12 glass-button rounded-full">
              <Target className="h-4 w-4" />
              Job Applications
              {stats.activeApplications > 0 && <Badge variant="secondary" className="ml-auto">{stats.activeApplications}</Badge>}
            </Button>

            <Button variant={activeTab === "documents" ? "default" : "ghost"} onClick={() => setActiveTab("documents")} className="w-full justify-start gap-3 h-12 glass-button rounded-full">
              <FileText className="h-4 w-4" />
              Document Vault
            </Button>

            <Button variant={activeTab === "interview" ? "default" : "ghost"} onClick={() => setActiveTab("interview")} className="w-full justify-start gap-3 h-12 glass-button rounded-full">
              <BookOpen className="h-4 w-4" />
              Interview Prep
            </Button>

            <Button variant={activeTab === "events" ? "default" : "ghost"} onClick={() => setActiveTab("events")} className="w-full justify-start gap-3 h-12 glass-button rounded-full">
              <Calendar className="h-4 w-4" />
              Career Events
            </Button>
          </nav>

          <Card className="p-4 glass-card">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-foreground">Arlo Says</span>
            </div>
            <div className="glass-card bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-3">
              <p className="text-sm text-foreground mb-3">
                {stats.careerContacts === 0 ? "Ready to boost your career? Start by adding some professional contacts!" : "Great job staying active! You're building a strong professional network."}
              </p>
              <Button size="sm" className="w-full glass-button rounded-full">
                {stats.careerContacts === 0 ? "Get Started" : "Let's Practice"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === "overview" && <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Career Overview</h2>
                  <p className="text-muted-foreground">Track your professional development</p>
                </div>
                <Button className="gap-2 glass-button rounded-full">
                  <Plus className="h-4 w-4" />
                  Quick Add
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 glass-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Career Contacts</p>
                      <p className="text-2xl font-bold text-foreground">{stats.careerContacts}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.careerContacts === 0 ? "Add your first contact" : "Growing your network"}
                  </p>
                </Card>

                <Card className="p-6 glass-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                      <Target className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Applications</p>
                      <p className="text-2xl font-bold text-foreground">{stats.activeApplications}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeApplications === 0 ? "Ready to apply?" : "Keep tracking progress"}
                  </p>
                </Card>

                <Card className="p-6 glass-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Upcoming Interviews</p>
                      <p className="text-2xl font-bold text-foreground">{stats.upcomingInterviews}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.upcomingInterviews === 0 ? "Practice makes perfect" : "Good luck!"}
                  </p>
                </Card>

                <Card className="p-6 glass-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Documents</p>
                      <p className="text-2xl font-bold text-foreground">{stats.documentsStored}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.documentsStored === 0 ? "Upload your resume" : "Well organized"}
                  </p>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 glass-card">
                  <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
                  {recentActivity.length === 0 ? <div className="text-center py-8">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Start adding applications or contacts to see activity here
                      </p>
                    </div> : <div className="space-y-3">
                      {recentActivity.map((activity, index) => <div key={index} className="flex items-center gap-3 p-3 glass-card rounded-xl">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-foreground">{activity}</span>
                        </div>)}
                    </div>}
                </Card>

                <Card className="p-6 glass-card">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-foreground">Arlo's Insights</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="glass-card bg-blue-50/50 dark:bg-blue-900/20 rounded-xl p-4">
                      <p className="text-sm text-foreground mb-2">
                        {stats.careerContacts === 0 ? "💡 Start by adding 3-5 professional contacts. This will help you track your network and get personalized advice." : "💡 Consider reaching out to contacts you haven't spoken to recently. Maintaining relationships is key to career success."}
                      </p>
                      <Button size="sm" variant="outline" className="glass-button rounded-full">
                        {stats.careerContacts === 0 ? "Add Contacts" : "Send Message"}
                      </Button>
                    </div>
                    <div className="glass-card bg-green-50/50 dark:bg-green-900/20 rounded-xl p-4">
                      <p className="text-sm text-foreground mb-2">
                        {stats.activeApplications === 0 ? "🎯 Ready to apply for roles? Upload your resume first, then start tracking applications." : "🎯 Great job staying organized with your applications! Don't forget to follow up."}
                      </p>
                      <Button size="sm" variant="outline" className="glass-button rounded-full">
                        {stats.activeApplications === 0 ? "Upload Resume" : "Set Reminder"}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </div>}

          {activeTab === "contacts" && <CareerContactsView />}
          {activeTab === "applications" && <JobApplicationTracker />}
          {activeTab === "documents" && <DocumentVault />}
          {activeTab === "interview" && <InterviewPrep />}
          {activeTab === "events" && <CareerEventMode />}
        </div>
      </div>
    </div>;
}