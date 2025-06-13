
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InterviewSessionFormData {
  session_title: string;
  session_type: 'common' | 'behavioral' | 'technical' | 'custom';
  duration_minutes: number;
}

interface AddInterviewSessionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (session: InterviewSessionFormData) => void;
}

export function AddInterviewSessionDialog({ isOpen, onOpenChange, onAdd }: AddInterviewSessionDialogProps) {
  const [formData, setFormData] = useState<InterviewSessionFormData>({
    session_title: '',
    session_type: 'common',
    duration_minutes: 15
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.session_title) {
      onAdd(formData);
      setFormData({
        session_title: '',
        session_type: 'common',
        duration_minutes: 15
      });
    }
  };

  const handleInputChange = (field: keyof InterviewSessionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getSessionDescription = (type: string) => {
    switch (type) {
      case 'common':
        return 'Standard interview questions and answers';
      case 'behavioral':
        return 'STAR method and behavioral scenarios';
      case 'technical':
        return 'Role-specific technical challenges';
      case 'custom':
        return 'Custom question set';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">New Interview Session</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session_title">Session Title *</Label>
            <Input
              id="session_title"
              value={formData.session_title}
              onChange={(e) => handleInputChange('session_title', e.target.value)}
              placeholder="e.g. Software Engineer Prep"
              className="glass-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session_type">Session Type</Label>
            <Select value={formData.session_type} onValueChange={(value) => handleInputChange('session_type', value)}>
              <SelectTrigger className="glass-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="common">Common Questions</SelectItem>
                <SelectItem value="behavioral">Behavioral Questions</SelectItem>
                <SelectItem value="technical">Technical Questions</SelectItem>
                <SelectItem value="custom">Custom Session</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getSessionDescription(formData.session_type)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Duration (minutes)</Label>
            <Select value={formData.duration_minutes.toString()} onValueChange={(value) => handleInputChange('duration_minutes', parseInt(value))}>
              <SelectTrigger className="glass-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="20">20 minutes</SelectItem>
                <SelectItem value="25">25 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
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
              Start Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
