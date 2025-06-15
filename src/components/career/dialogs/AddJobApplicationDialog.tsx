
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiContactSelector } from "@/components/ui/multi-contact-selector";
import { useContacts } from "@/hooks/use-contacts";
import { Contact } from "@/types/contact";
import { ScrollArea } from "@/components/ui/scroll-area";

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

export function AddJobApplicationDialog({ isOpen, onOpenChange, onAdd }: AddJobApplicationDialogProps) {
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Job Application</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title *</Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => handleInputChange('job_title', e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="glass-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="e.g. Google"
                  className="glass-input"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applied_date">Applied Date</Label>
                <Input
                  id="applied_date"
                  type="date"
                  value={formData.applied_date || ''}
                  onChange={(e) => handleInputChange('applied_date', e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_range">Salary Range</Label>
                <Input
                  id="salary_range"
                  value={formData.salary_range || ''}
                  onChange={(e) => handleInputChange('salary_range', e.target.value)}
                  placeholder="e.g. $80k - $120k"
                  className="glass-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_url">Job URL</Label>
              <Input
                id="job_url"
                type="url"
                value={formData.job_url || ''}
                onChange={(e) => handleInputChange('job_url', e.target.value)}
                placeholder="https://..."
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_description">Job Description</Label>
              <Textarea
                id="job_description"
                value={formData.job_description || ''}
                onChange={(e) => handleInputChange('job_description', e.target.value)}
                placeholder="Paste the full job description here..."
                className="glass-input min-h-[100px]"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <MultiContactSelector
                contacts={contacts}
                selectedContacts={selectedInterviewers}
                onSelectionChange={setSelectedInterviewers}
                label="Interviewers (from your contacts)"
                placeholder="Search for interviewer contacts..."
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Select contacts from your Circl who will be interviewing you for this position
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this application..."
                className="glass-input min-h-[80px]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 glass-button">
                Add Application
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
