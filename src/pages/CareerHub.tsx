
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Users, 
  FileText, 
  Calendar, 
  MessageSquare,
  Plus,
  TrendingUp,
  Target,
  BookOpen
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import CareerContactsView from "@/components/career/CareerContactsView";
import JobApplicationTracker from "@/components/career/JobApplicationTracker";
import DocumentVault from "@/components/career/DocumentVault";
import InterviewPrep from "@/components/career/InterviewPrep";
import CareerEventMode from "@/components/career/CareerEventMode";

export default function CareerHub() {
  const [activeTab, setActiveTab] = useState("overview");
  const isMobile = useIsMobile();

  const stats = {
    careerContacts: 12,
    activeApplications: 5,
    upcomingInterviews: 2,
    documentsStored: 8
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50/30 dark:from-gray-900 dark:to-blue-900/20 pb-20">
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b border-white/20 dark:border-white/10 p-4 pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Career Hub</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your professional journey</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
              <TabsTrigger value="contacts" className="text-xs">Contacts</TabsTrigger>
              <TabsTrigger value="applications" className="text-xs">Jobs</TabsTrigger>
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
                    <span className="text-sm font-medium">Career Contacts</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.careerContacts}</div>
                </Card>
                
                <Card className="p-4 glass-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Applications</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeApplications}</div>
                </Card>

                <Card className="p-4 glass-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium">Interviews</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingInterviews}</div>
                </Card>

                <Card className="p-4 glass-card">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Documents</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.documentsStored}</div>
                </Card>
              </div>

              <Card className="p-4 glass-card">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Arlo's Career Tips</span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    💡 You haven't reached out to any career contacts this week. Consider sending a quick check-in to 2-3 people.
                  </p>
                  <Button size="sm" variant="outline" className="text-xs">
                    See Suggestions
                  </Button>
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-3">
                <Button 
                  onClick={() => setActiveTab("applications")}
                  className="h-12 glass-card hover:glass-card-enhanced justify-start gap-3"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Add Job Application
                </Button>
                
                <Button 
                  className="h-12 glass-card hover:glass-card-enhanced justify-start gap-3"
                  variant="outline"
                >
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50/30 dark:from-gray-900 dark:to-blue-900/20 pb-20">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 min-h-screen bg-white/60 dark:bg-black/20 backdrop-blur-sm border-r border-white/20 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Career Hub</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your professional journey</p>
            </div>
          </div>

          <nav className="space-y-2 mb-8">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              onClick={() => setActiveTab("overview")}
              className="w-full justify-start gap-3 h-12"
            >
              <TrendingUp className="h-4 w-4" />
              Overview
            </Button>
            
            <Button
              variant={activeTab === "contacts" ? "default" : "ghost"}
              onClick={() => setActiveTab("contacts")}
              className="w-full justify-start gap-3 h-12"
            >
              <Users className="h-4 w-4" />
              Career Contacts
              <Badge variant="secondary" className="ml-auto">{stats.careerContacts}</Badge>
            </Button>

            <Button
              variant={activeTab === "applications" ? "default" : "ghost"}
              onClick={() => setActiveTab("applications")}
              className="w-full justify-start gap-3 h-12"
            >
              <Target className="h-4 w-4" />
              Job Applications
              <Badge variant="secondary" className="ml-auto">{stats.activeApplications}</Badge>
            </Button>

            <Button
              variant={activeTab === "documents" ? "default" : "ghost"}
              onClick={() => setActiveTab("documents")}
              className="w-full justify-start gap-3 h-12"
            >
              <FileText className="h-4 w-4" />
              Document Vault
            </Button>

            <Button
              variant={activeTab === "interview" ? "default" : "ghost"}
              onClick={() => setActiveTab("interview")}
              className="w-full justify-start gap-3 h-12"
            >
              <BookOpen className="h-4 w-4" />
              Interview Prep
            </Button>

            <Button
              variant={activeTab === "events" ? "default" : "ghost"}
              onClick={() => setActiveTab("events")}
              className="w-full justify-start gap-3 h-12"
            >
              <Calendar className="h-4 w-4" />
              Career Events
            </Button>
          </nav>

          <Card className="p-4 glass-card">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Arlo Says</span>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                Great job staying active! You've added 3 new contacts this week. Ready to practice for your upcoming interview?
              </p>
              <Button size="sm" className="w-full">
                Let's Practice
              </Button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Career Overview</h2>
                  <p className="text-gray-600 dark:text-gray-400">Track your professional development</p>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Quick Add
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 glass-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Career Contacts</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.careerContacts}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">+2 this week</p>
                </Card>

                <Card className="p-6 glass-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Applications</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeApplications}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">3 awaiting response</p>
                </Card>

                <Card className="p-6 glass-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming Interviews</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingInterviews}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Next: Tomorrow 2PM</p>
                </Card>

                <Card className="p-6 glass-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Documents</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.documentsStored}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Resume updated today</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 glass-card">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Applied to Software Engineer at Google</span>
                      <span className="text-xs text-gray-500 ml-auto">2h ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Updated resume with new project</span>
                      <span className="text-xs text-gray-500 ml-auto">1d ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">Completed interview prep session</span>
                      <span className="text-xs text-gray-500 ml-auto">2d ago</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 glass-card">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Arlo's Insights</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        💡 Your networking is strong! Consider reaching out to Sarah from Microsoft - it's been 2 weeks since your last interaction.
                      </p>
                      <Button size="sm" variant="outline">
                        Send Message
                      </Button>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        🎯 Great job applying to 3 roles this week! Don't forget to follow up on your Amazon application.
                      </p>
                      <Button size="sm" variant="outline">
                        Set Reminder
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
    </div>
  );
}
