
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Plus } from "lucide-react";
import { ApplicationCard } from "./ApplicationCard";

interface Application {
  id: string;
  job_title: string;
  company_name: string;
  status: string;
  workflow_stage?: string;
  stage_completion?: any;
}

interface CareerApplicationsSectionProps {
  applications: Application[];
  onAddApplication: () => void;
  onSelectApplication: (id: string) => void;
  isMobile: boolean;
}

export function CareerApplicationsSection({ 
  applications, 
  onAddApplication, 
  onSelectApplication, 
  isMobile 
}: CareerApplicationsSectionProps) {
  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Job Applications</h3>
          <Button 
            size="sm"
            onClick={onAddApplication}
            className="rounded-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Application
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
              onClick={onAddApplication}
              className="rounded-full"
            >
              Add Your First Application
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onSelect={onSelectApplication}
                isMobile={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Job Applications</h2>
        <Button 
          onClick={onAddApplication}
          className="bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full px-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          Application
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
            onClick={onAddApplication}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0 rounded-full px-8"
            size="lg"
          >
            Add Your First Application
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onSelect={onSelectApplication}
              isMobile={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
