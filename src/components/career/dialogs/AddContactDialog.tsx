
import { useState } from "react";
import { GlassModal } from "@/components/ui/GlassModal";
import { Button } from "@/components/ui/button";
import { GlassInput } from "@/components/ui/GlassInput";
import { GlassTextarea } from "@/components/ui/GlassTextarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus } from "lucide-react";

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
    <GlassModal
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Add Career Contact"
      subtitle="Add a new contact to your professional network"
      icon={UserPlus}
      maxWidth="max-w-lg"
    >
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">Name *</Label>
              <GlassInput
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Contact name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personal_email" className="text-sm font-medium">Email</Label>
              <GlassInput
                id="personal_email"
                type="email"
                value={formData.personal_email}
                onChange={(e) => handleInputChange('personal_email', e.target.value)}
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile_phone" className="text-sm font-medium">Phone</Label>
              <GlassInput
                id="mobile_phone"
                type="tel"
                value={formData.mobile_phone}
                onChange={(e) => handleInputChange('mobile_phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-sm font-medium">Company</Label>
                <GlassInput
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleInputChange('company_name', e.target.value)}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_title" className="text-sm font-medium">Job Title</Label>
                <GlassInput
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => handleInputChange('job_title', e.target.value)}
                  placeholder="Job title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="career_tags" className="text-sm font-medium">Career Tags</Label>
              <GlassInput
                id="career_tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="networking, mentor, recruiter (comma separated)"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="career_priority"
                checked={formData.career_priority}
                onCheckedChange={(checked) => handleInputChange('career_priority', checked)}
              />
              <Label htmlFor="career_priority" className="text-sm font-medium">High Career Priority</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
              <GlassTextarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional notes about this contact..."
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
              Add Contact
            </Button>
          </div>
        </form>
      </div>
    </GlassModal>
  );
}
