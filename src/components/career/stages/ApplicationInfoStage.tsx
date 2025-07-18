import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { FileText, Upload, CheckCircle } from "lucide-react";
import { JobApplicationWorkflow, WorkflowStage } from "@/hooks/use-job-application-workflow";
import GradientIconBg from "../GradientIconBg";
import { Atom } from "lucide-react";
interface ApplicationInfoStageProps {
  workflow: JobApplicationWorkflow;
  onUpdate: (stage: WorkflowStage, progress: number, completed?: boolean) => void;
}
export function ApplicationInfoStage({
  workflow,
  onUpdate
}: ApplicationInfoStageProps) {
  const [jobDescription, setJobDescription] = useState(workflow.job_description || '');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const completion = workflow.stage_completion.application_info;
  const isCompleted = completion?.completed || false;
  useEffect(() => {
    // Calculate progress based on filled fields
    let progress = 0;
    if (workflow.job_title) progress += 25;
    if (workflow.company_name) progress += 25;
    if (jobDescription) progress += 25;
    if (applicationDeadline) progress += 25;
    if (progress !== (completion?.progress || 0)) {
      onUpdate('application_info', progress);
    }
  }, [workflow.job_title, workflow.company_name, jobDescription, applicationDeadline]);
  const handleSave = () => {
    const progress = 100;
    onUpdate('application_info', progress, true);
    setHasUnsavedChanges(false);
  };
  return <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Application Information</h4>
        {isCompleted && <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Complete</span>
          </div>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="job_title">Job Title</Label>
            <Input id="job_title" value={workflow.job_title} disabled className="h-12 px-4 border border-gray-200 rounded-lg bg-white/50 focus-visible:ring-primary disabled:opacity-60" />
          </div>

          <div>
            <Label htmlFor="company_name">Company</Label>
            <Input id="company_name" value={workflow.company_name} disabled className="h-12 px-4 border border-gray-200 rounded-lg bg-white/50 focus-visible:ring-primary disabled:opacity-60" />
          </div>

          <div>
            <Label htmlFor="deadline">Application Deadline</Label>
            <Input id="deadline" type="date" value={applicationDeadline} onChange={e => {
            setApplicationDeadline(e.target.value);
            setHasUnsavedChanges(true);
          }} className="h-12 px-4 border border-gray-200 rounded-lg bg-white focus-visible:ring-primary" />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="job_description">Job Description</Label>
            <Textarea id="job_description" placeholder="Paste the full job description here..." value={jobDescription} onChange={e => {
            setJobDescription(e.target.value);
            setHasUnsavedChanges(true);
          }} className="min-h-[200px] px-4 py-3 border border-gray-200 rounded-lg bg-white focus-visible:ring-primary resize-none" />
          </div>
        </div>
      </div>

      {/* AI Analysis Preview */}
      {jobDescription && <Card className="p-4 bg-primary-50/50 border-primary-100">
          <div className="flex items-center gap-2 mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="atom-gradient-app-info" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0092ca" />
                  <stop offset="50%" stopColor="#a21caf" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <Atom className="w-full h-full" stroke="url(#atom-gradient-app-info)" strokeWidth="2" />
            </svg>
            <span className="text-sm font-medium text-primary-900">Arlo's Analysis</span>
          </div>
          <p className="text-sm text-primary-800">
            I've analyzed this job description and identified key requirements. Once you complete this stage,
            I'll help you tailor your resume and prepare targeted responses.
          </p>
        </Card>}

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={!hasUnsavedChanges && isCompleted} className="rounded-full">
          {isCompleted ? 'Update Information' : 'Save & Continue'}
        </Button>
        
        <Button variant="outline" className="rounded-full" onClick={() => {/* Handle file upload */}}>
          <Upload className="h-4 w-4 mr-2" />
          Upload JD File
        </Button>
      </div>
    </div>;
}
