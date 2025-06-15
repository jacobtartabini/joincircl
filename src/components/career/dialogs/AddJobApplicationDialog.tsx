
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
      <DialogContent className="max-w-md rounded-2xl border border-gray-100 shadow-xl p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-0 border-b border-gray-100">
          <DialogTitle className="text-lg font-bold text-gray-900">Add Job Application</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-60px)] py-0">
          <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job_title" className="block font-medium text-gray-700">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => handleInputChange('job_title', e.target.value)}
                  placeholder="e.g. Software Engineer"
                  className="h-12 px-4 border-gray-200 rounded-lg bg-white focus-visible:ring-blue-500"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_name" className="block font-medium text-gray-700">
                  Company <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="e.g. Google"
                  className="h-12 px-4 border-gray-200 rounded-lg bg-white focus-visible:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="block font-medium text-gray-700">
                Status
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger className="h-12 px-4 border-gray-200 rounded-lg bg-white">
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

            <div className="space-y-2">
              <Label htmlFor="applied_date" className="block font-medium text-gray-700">
                Applied Date
              </Label>
              <Input
                id="applied_date"
                type="date"
                value={formData.applied_date || ''}
                onChange={(e) => handleInputChange('applied_date', e.target.value)}
                className="h-12 px-4 border-gray-200 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salary_range" className="block font-medium text-gray-700">Salary Range</Label>
              <Input
                id="salary_range"
                value={formData.salary_range || ''}
                onChange={(e) => handleInputChange('salary_range', e.target.value)}
                placeholder="e.g. $80k - $120k"
                className="h-12 px-4 border-gray-200 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_url" className="block font-medium text-gray-700">Job URL</Label>
              <Input
                id="job_url"
                type="url"
                value={formData.job_url || ''}
                onChange={(e) => handleInputChange('job_url', e.target.value)}
                placeholder="https://..."
                className="h-12 px-4 border-gray-200 rounded-lg bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_description" className="block font-medium text-gray-700">Job Description</Label>
              <Textarea
                id="job_description"
                value={formData.job_description || ''}
                onChange={(e) => handleInputChange('job_description', e.target.value)}
                placeholder="Paste the full job description here..."
                className="min-h-[92px] px-4 py-3 border-gray-200 rounded-lg bg-white"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label className="block font-medium text-gray-700">
                Interviewers (from your contacts)
              </Label>
              <MultiContactSelector
                contacts={contacts}
                selectedContacts={selectedInterviewers}
                onSelectionChange={setSelectedInterviewers}
                label=""
                placeholder="Search for interviewer contacts..."
                className="w-full"
              />
              <p className="text-xs mt-1 text-muted-foreground">
                Select contacts from your Circl who will be interviewing you for this position.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="block font-medium text-gray-700">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this application..."
                className="min-h-[72px] px-4 py-3 border-gray-200 rounded-lg bg-white"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-12 rounded-full font-semibold"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 h-12 rounded-full font-semibold bg-blue-600 text-white hover:bg-blue-700">
                Add Application
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
