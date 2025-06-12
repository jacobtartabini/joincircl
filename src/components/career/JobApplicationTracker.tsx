
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Building, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ExternalLink,
  User,
  Eye
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface JobApplication {
  id: string;
  company_name: string;
  job_title: string;
  status: string;
  applied_date: string;
  interview_date?: string;
  follow_up_date?: string;
  notes?: string;
  salary_range?: string;
  job_url?: string;
  contact_id?: string;
  created_at: string;
  updated_at: string;
}

export default function JobApplicationTracker() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    if (user) {
      loadApplications();
    }
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading job applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300', icon: Clock };
      case 'interviewing':
        return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', icon: AlertCircle };
      case 'offer':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', icon: CheckCircle };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', icon: XCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', icon: Clock };
    }
  };

  const filteredApplications = applications.filter(app => 
    selectedStatus === "all" || app.status.toLowerCase() === selectedStatus
  );

  const statusCounts = {
    applied: applications.filter(app => app.status.toLowerCase() === 'applied').length,
    interviewing: applications.filter(app => app.status.toLowerCase() === 'interviewing').length,
    offer: applications.filter(app => app.status.toLowerCase() === 'offer').length,
    rejected: applications.filter(app => app.status.toLowerCase() === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6 glass-card">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job Applications</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Track your job search progress ({applications.length} applications)
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Application
        </Button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Applied</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{statusCounts.applied}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Interviewing</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{statusCounts.interviewing}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Offers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{statusCounts.offer}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 glass-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{statusCounts.rejected}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("all")}
        >
          All ({applications.length})
        </Button>
        <Button
          variant={selectedStatus === "applied" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("applied")}
        >
          Applied ({statusCounts.applied})
        </Button>
        <Button
          variant={selectedStatus === "interviewing" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("interviewing")}
        >
          Interviewing ({statusCounts.interviewing})
        </Button>
        <Button
          variant={selectedStatus === "offer" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("offer")}
        >
          Offers ({statusCounts.offer})
        </Button>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application) => {
          const statusConfig = getStatusConfig(application.status);
          const StatusIcon = statusConfig.icon;

          return (
            <Card key={application.id} className="p-6 glass-card hover:glass-card-enhanced transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                    <Building className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {application.job_title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{application.company_name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {application.applied_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Applied: {format(new Date(application.applied_date), 'MMM d, yyyy')}</span>
                  </div>
                )}

                {application.interview_date && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>Interview: {format(new Date(application.interview_date), 'MMM d, h:mm a')}</span>
                  </div>
                )}

                {application.salary_range && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>💰 {application.salary_range}</span>
                  </div>
                )}
              </div>

              {application.notes && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{application.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {application.job_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={application.job_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Job
                      </a>
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <User className="h-3 w-3 mr-1" />
                    Contact
                  </Button>
                </div>

                <div className="text-xs text-gray-500">
                  Updated {format(new Date(application.updated_at), 'MMM d')}
                </div>
              </div>

              {/* Arlo Suggestions */}
              {application.status === 'applied' && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 Arlo suggests: It's been 5 days since you applied. Consider following up with the hiring manager.
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {filteredApplications.length === 0 && (
        <Card className="p-12 text-center glass-card">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {selectedStatus === "all" ? "No Applications Yet" : `No ${selectedStatus} Applications`}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {selectedStatus === "all" 
              ? "Start tracking your job applications to stay organized"
              : `You don't have any applications in the ${selectedStatus} status`
            }
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Application
          </Button>
        </Card>
      )}
    </div>
  );
}
