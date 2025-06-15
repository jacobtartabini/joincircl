
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
  Users,
  Star,
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useContacts } from "@/hooks/use-contacts";
import { useToast } from "@/hooks/use-toast";

export default function CareerHub() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const isMobile = useIsMobile();
  const { contacts } = useContacts();
  const { toast } = useToast();

  // Calculate stats from user data
  const stats = useMemo(() => {
    const careerContacts = contacts.filter(contact => contact.career_priority === true || contact.career_tags?.length > 0);
    return {
      careerContacts: careerContacts.length,
      activeApplications: 0,
      upcomingInterviews: 0,
      completedSessions: 0,
      overallProgress: 25 // Mock progress calculation
    };
  }, [contacts]);

  const handleQuickAction = useCallback((action: string) => {
    console.log(`Quick action: ${action}`);
    toast({
      title: "Action Started",
      description: `${action} has been initiated.`,
    });
  }, [toast]);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/10 pb-20">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 glass-nav bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-white/20 dark:border-white/10 p-4 pt-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Career Hub</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Your path to success</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 glass-card p-1.5 rounded-2xl">
              <TabsTrigger value="dashboard" className="rounded-xl text-sm">Dashboard</TabsTrigger>
              <TabsTrigger value="applications" className="rounded-xl text-sm">Jobs</TabsTrigger>
              <TabsTrigger value="prep" className="rounded-xl text-sm">Prep</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="dashboard" className="space-y-6">
              {/* Progress Overview */}
              <Card className="p-6 glass-card rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Career Progress</h3>
                      <p className="text-sm text-muted-foreground">Keep building momentum</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{stats.overallProgress}%</span>
                </div>
                <Progress value={stats.overallProgress} className="h-3 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 glass-card rounded-xl">
                    <p className="text-xl font-bold text-foreground">{stats.activeApplications}</p>
                    <p className="text-xs text-muted-foreground">Active Applications</p>
                  </div>
                  <div className="text-center p-3 glass-card rounded-xl">
                    <p className="text-xl font-bold text-foreground">{stats.completedSessions}</p>
                    <p className="text-xs text-muted-foreground">Prep Sessions</p>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                <div className="grid gap-3">
                  <Button 
                    onClick={() => setActiveTab("applications")} 
                    className="h-16 glass-card justify-between p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 border-white/20 rounded-2xl" 
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">Track Application</p>
                        <p className="text-xs text-muted-foreground">Add your latest job application</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  
                  <Button 
                    onClick={() => setActiveTab("prep")} 
                    className="h-16 glass-card justify-between p-4 bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 border-white/20 rounded-2xl" 
                    variant="outline"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">Practice Interview</p>
                        <p className="text-xs text-muted-foreground">Prepare for your next opportunity</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Arlo Insights */}
              <Card className="p-6 glass-card rounded-2xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground">Arlo's Tip</h3>
                </div>
                <p className="text-sm text-foreground mb-4 leading-relaxed">
                  {stats.activeApplications === 0 
                    ? "Ready to kickstart your career? Start by tracking your first job application to build momentum!" 
                    : "Great progress! Consider practicing behavioral interview questions to boost your confidence."}
                </p>
                <Button size="sm" className="glass-button rounded-full">
                  Get Started
                </Button>
              </Card>
            </TabsContent>

            <TabsContent value="applications" className="space-y-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Track Your Applications</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Stay organized and never miss a follow-up
                </p>
                <Button 
                  onClick={() => handleQuickAction("Add Application")}
                  className="glass-button rounded-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Application
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="prep" className="space-y-6">
              <div className="grid gap-4">
                <Card className="p-6 glass-card rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                      <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Interview Practice</h3>
                      <p className="text-sm text-muted-foreground">Build confidence with mock interviews</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleQuickAction("Start Practice")}
                    className="w-full glass-button rounded-xl"
                  >
                    Start Practice Session
                  </Button>
                </Card>

                <Card className="p-6 glass-card rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Resume Review</h3>
                      <p className="text-sm text-muted-foreground">Get feedback on your resume</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleQuickAction("Upload Resume")}
                    variant="outline" 
                    className="w-full glass-card rounded-xl"
                  >
                    Upload Resume
                  </Button>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Desktop Version
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/10">
      <div className="flex">
        {/* Simplified Sidebar */}
        <div className="w-80 min-h-screen glass-card bg-white/60 dark:bg-black/20 backdrop-blur-xl border-r border-white/20 dark:border-white/10 p-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Briefcase className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Career Hub</h1>
              <p className="text-sm text-muted-foreground">Your success journey</p>
            </div>
          </div>

          <nav className="space-y-3 mb-12">
            <Button 
              variant={activeTab === "dashboard" ? "default" : "ghost"} 
              onClick={() => setActiveTab("dashboard")} 
              className="w-full justify-start gap-4 h-14 glass-button rounded-2xl"
            >
              <TrendingUp className="h-5 w-5" />
              Dashboard
            </Button>
            
            <Button 
              variant={activeTab === "applications" ? "default" : "ghost"} 
              onClick={() => setActiveTab("applications")} 
              className="w-full justify-start gap-4 h-14 glass-button rounded-2xl"
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
              variant={activeTab === "prep" ? "default" : "ghost"} 
              onClick={() => setActiveTab("prep")} 
              className="w-full justify-start gap-4 h-14 glass-button rounded-2xl"
            >
              <BookOpen className="h-5 w-5" />
              Interview Prep
            </Button>
          </nav>

          {/* Progress Card */}
          <Card className="p-6 glass-card rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">Progress</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall</span>
                <span className="font-medium text-foreground">{stats.overallProgress}%</span>
              </div>
              <Progress value={stats.overallProgress} className="h-2" />
              <Button size="sm" className="w-full glass-button rounded-full">
                View Details
              </Button>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === "dashboard" && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Career Dashboard</h2>
                  <p className="text-muted-foreground">Track your progress and take your next step</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 glass-card rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                      <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Active Applications</p>
                      <p className="text-2xl font-bold text-foreground">{stats.activeApplications}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 glass-card rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Interviews Scheduled</p>
                      <p className="text-2xl font-bold text-foreground">{stats.upcomingInterviews}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 glass-card rounded-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Prep Sessions</p>
                      <p className="text-2xl font-bold text-foreground">{stats.completedSessions}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Action Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-8 glass-card rounded-2xl hover:glass-card-enhanced transition-all duration-200">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <Plus className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Add Application</h3>
                      <p className="text-sm text-muted-foreground">Track a new job opportunity</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setActiveTab("applications")}
                    className="w-full glass-button rounded-xl h-12"
                  >
                    Get Started
                  </Button>
                </Card>

                <Card className="p-8 glass-card rounded-2xl hover:glass-card-enhanced transition-all duration-200">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Practice Interview</h3>
                      <p className="text-sm text-muted-foreground">Build confidence with AI coaching</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setActiveTab("prep")}
                    className="w-full glass-button rounded-xl h-12"
                  >
                    Start Practice
                  </Button>
                </Card>
              </div>

              {/* Arlo Insights */}
              <Card className="p-8 glass-card rounded-2xl bg-gradient-to-r from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Arlo's Career Insights</h3>
                </div>
                <p className="text-sm text-foreground mb-6 leading-relaxed">
                  {stats.activeApplications === 0 
                    ? "🚀 Ready to launch your career? Start by adding your first job application to track your progress and stay organized throughout your job search journey." 
                    : "💪 You're making great progress! Consider scheduling regular interview practice sessions to boost your confidence and improve your chances of success."}
                </p>
                <Button className="glass-button rounded-full">
                  {stats.activeApplications === 0 ?  "Add First Application" : "Schedule Practice"}
                </Button>
              </Card>
            </div>
          )}

          {activeTab === "applications" && (
            <div className="max-w-4xl mx-auto">
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Track Your Job Applications</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Stay organized, follow up effectively, and never miss an opportunity
                </p>
                <Button 
                  onClick={() => handleQuickAction("Add Application")}
                  size="lg"
                  className="glass-button rounded-full px-8"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Application
                </Button>
              </div>
            </div>
          )}

          {activeTab === "prep" && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Interview Preparation</h2>
                <p className="text-muted-foreground">Build confidence and ace your interviews</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-8 glass-card rounded-2xl hover:glass-card-enhanced transition-all duration-200">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Mock Interview</h3>
                      <p className="text-sm text-muted-foreground">Practice with AI-powered questions</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleQuickAction("Start Mock Interview")}
                    className="w-full glass-button rounded-xl h-12"
                  >
                    Start Practice Session
                  </Button>
                </Card>

                <Card className="p-8 glass-card rounded-2xl hover:glass-card-enhanced transition-all duration-200">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Resume Review</h3>
                      <p className="text-sm text-muted-foreground">Get AI feedback on your resume</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleQuickAction("Upload Resume")}
                    variant="outline"
                    className="w-full glass-card rounded-xl h-12"
                  >
                    Upload Resume
                  </Button>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
