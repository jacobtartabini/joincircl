import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building, Calendar, ExternalLink, Edit, Trash2 } from "lucide-react";
import { useContacts } from "@/hooks/use-contacts";
import { AddJobApplicationDialog } from "./dialogs/AddJobApplicationDialog";
interface JobApplication {
  id: string;
  job_title: string;
  company_name: string;
  status: 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  applied_date?: string;
  interview_date?: string;
  salary_range?: string;
  job_url?: string;
  notes?: string;
}
export default function JobApplicationTracker() {
  const {
    contacts
  } = useContacts();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const handleAddApplication = useCallback((newApp: Omit<JobApplication, 'id'>) => {
    const application: JobApplication = {
      ...newApp,
      id: Date.now().toString()
    };
    setApplications(prev => [application, ...prev]);
    setShowAddDialog(false);
  }, []);
  const getStatusColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'interviewing':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'offer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  return <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Job Applications</h3>
        <Button onClick={() => setShowAddDialog(true)} size="sm" className="gap-2 glass-button rounded-full">
          <Plus className="h-4 w-4" />
          Add Application
        </Button>
      </div>

      {applications.length === 0 ? <Card className="p-8 text-center glass-card rounded-2xl">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium text-foreground mb-2">No Applications Yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Start tracking your job applications to stay organized
          </p>
          <Button onClick={() => setShowAddDialog(true)} className="glass-button rounded-full">
            Add Your First Application
          </Button>
        </Card> : <div className="grid grid-cols-1 gap-3">
          {applications.map(app => <Card key={app.id} className="p-4 glass-card hover:glass-card-enhanced transition-all duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{app.job_title}</h4>
                      <p className="text-sm text-muted-foreground truncate">{app.company_name}</p>
                    </div>
                    <Badge className={getStatusColor(app.status)}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                    {app.applied_date && <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Applied {new Date(app.applied_date).toLocaleDateString()}</span>
                      </div>}
                    {app.salary_range && <div>
                        <span className="font-medium">Salary:</span> {app.salary_range}
                      </div>}
                  </div>

                  {app.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                      {app.notes}
                    </p>}
                </div>

                <div className="flex items-center gap-1 ml-4">
                  {app.job_url && <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <ExternalLink className="h-4 w-4" />
                    </Button>}
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>)}
        </div>}

      <AddJobApplicationDialog isOpen={showAddDialog} onOpenChange={setShowAddDialog} onAdd={handleAddApplication} />
    </div>;
}