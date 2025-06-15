
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface ContactFormData {
  name: string;
  personal_email: string;
  mobile_phone: string;
  company_name: string;
  job_title: string;
  career_priority: boolean;
  career_tags: string[];
  notes: string;
}

interface AddContactDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (contact: ContactFormData) => void;
}

export function AddContactDialog({ isOpen, onOpenChange, onAdd }: AddContactDialogProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    personal_email: '',
    mobile_phone: '',
    company_name: '',
    job_title: '',
    career_priority: true,
    career_tags: [],
    notes: ''
  });

  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name) {
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
      onAdd({ ...formData, career_tags: tags });
      setFormData({
        name: '',
        personal_email: '',
        mobile_phone: '',
        company_name: '',
        job_title: '',
        career_priority: true,
        career_tags: [],
        notes: ''
      });
      setTagsInput('');
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Career Contact</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Contact name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal_email">Email</Label>
            <Input
              id="personal_email"
              type="email"
              value={formData.personal_email}
              onChange={(e) => handleInputChange('personal_email', e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile_phone">Phone</Label>
            <Input
              id="mobile_phone"
              type="tel"
              value={formData.mobile_phone}
              onChange={(e) => handleInputChange('mobile_phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Company name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_title">Job Title</Label>
              <Input
                id="job_title"
                value={formData.job_title}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
                placeholder="Job title"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="career_tags">Career Tags</Label>
            <Input
              id="career_tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="networking, mentor, recruiter (comma separated)"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="career_priority"
              checked={formData.career_priority}
              onCheckedChange={(checked) => handleInputChange('career_priority', checked)}
            />
            <Label htmlFor="career_priority">High Career Priority</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this contact..."
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
              Add Contact
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
