
import { useState } from "react";
import { GlassModal } from "@/components/ui/GlassModal";
import { Button } from "@/components/ui/button";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassTextarea } from "@/components/ui/GlassTextarea";
import { Label } from "@/components/ui/label";
import { GlassSelect, GlassSelectContent, GlassSelectItem, GlassSelectTrigger, GlassSelectValue } from "@/components/ui/GlassSelect";
import { MultiContactSelector } from "@/components/ui/multi-contact-selector";
import { useContacts } from "@/hooks/use-contacts";
import { Contact } from "@/types/contact";
import { Briefcase } from "lucide-react";

interface JobApplication {
  job_title: string;
  company_name: string;
  status: 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';
  applied_date?: string;
  interview_date?: string;
  salary_range?: string;
  job_url?: string;
  job_description?: string;
  notes?: string;
  interviewer_contacts?: string[];
}

interface AddJobApplicationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (application: JobApplication) => void;
}

export function AddJobApplicationDialog({
  isOpen,
  onOpenChange,
  onAdd
}: AddJobApplicationDialogProps) {
  const [formData, setFormData] = useState<JobApplication>({
    job_title: '',
    company_name: '',
    status: 'applied',
    interviewer_contacts: []
  });
  const [selectedInterviewers, setSelectedInterviewers] = useState<Contact[]>([]);
  const { contacts } = useContacts();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.job_title && formData.company_name) {
      const applicationData = {
        ...formData,
        interviewer_contacts: selectedInterviewers.map(contact => contact.id)
      };
      onAdd(applicationData);
      setFormData({
        job_title: '',
        company_name: '',
        status: 'applied',
        interviewer_contacts: []
      });
      setSelectedInterviewers([]);
    }
  };

  const handleInputChange = (field: keyof JobApplication, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <GlassModal 
      open={isOpen} 
      onOpenChange={onOpenChange}
      title="Add Job Application"
      subtitle="Track your job application progress"
      icon={Briefcase}
      maxWidth="max-w-lg"
    >
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="job_title" className="text-sm font-medium">
                Job Title *
              </Label>
              <GlassInput
                id="job_title"
                value={formData.job_title}
                onChange={e => handleInputChange('job_title', e.target.value)}
                placeholder="e.g. Software Engineer"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-sm font-medium">
                Company *
              </Label>
              <GlassInput
                id="company_name"
                value={formData.company_name}
                onChange={e => handleInputChange('company_name', e.target.value)}
                placeholder="e.g. Google"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">Status</Label>
              <GlassSelect value={formData.status} onValueChange={value => handleInputChange('status', value)}>
                <GlassSelectTrigger>
                  <GlassSelectValue />
                </GlassSelectTrigger>
                <GlassSelectContent>
                  <GlassSelectItem value="applied">Applied</GlassSelectItem>
                  <GlassSelectItem value="interviewing">Interviewing</GlassSelectItem>
                  <GlassSelectItem value="offer">Offer</GlassSelectItem>
                  <GlassSelectItem value="rejected">Rejected</GlassSelectItem>
                  <GlassSelectItem value="withdrawn">Withdrawn</GlassSelectItem>
                </GlassSelectContent>
              </GlassSelect>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="applied_date" className="text-sm font-medium">Applied Date</Label>
                <GlassInput
                  id="applied_date"
                  type="date"
                  value={formData.applied_date || ''}
                  onChange={e => handleInputChange('applied_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="interview_date" className="text-sm font-medium">Interview Date</Label>
                <GlassInput
                  id="interview_date"
                  type="date"
                  value={formData.interview_date || ''}
                  onChange={e => handleInputChange('interview_date', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_range" className="text-sm font-medium">Salary Range</Label>
              <GlassInput
                id="salary_range"
                value={formData.salary_range || ''}
                onChange={e => handleInputChange('salary_range', e.target.value)}
                placeholder="e.g. $80k - $120k"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_url" className="text-sm font-medium">Job URL</Label>
              <GlassInput
                id="job_url"
                type="url"
                value={formData.job_url || ''}
                onChange={e => handleInputChange('job_url', e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Interviewers</Label>
              <div className="rounded-xl border-2 border-white/40 dark:border-white/25 bg-white/50 dark:bg-white/8 backdrop-blur-sm p-3">
                <MultiContactSelector
                  contacts={contacts}
                  selectedContacts={selectedInterviewers}
                  onSelectionChange={setSelectedInterviewers}
                  label=""
                  placeholder="Search for interviewer contacts..."
                  className="w-full bg-transparent border-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_description" className="text-sm font-medium">Job Description</Label>
              <GlassTextarea
                id="job_description"
                value={formData.job_description || ''}
                onChange={e => handleInputChange('job_description', e.target.value)}
                placeholder="Paste the full job description here..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
              <GlassTextarea
                id="notes"
                value={formData.notes || ''}
                onChange={e => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this application..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-full bg-white/20 border-white/40 backdrop-blur-sm hover:bg-white/30"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-white border-0"
            >
              Add Application
            </Button>
          </div>
        </form>
      </div>
    </GlassModal>
  );
}
