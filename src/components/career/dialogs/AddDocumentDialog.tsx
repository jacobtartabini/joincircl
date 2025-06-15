
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentFormData {
  document_name: string;
  document_type: 'resume' | 'cover_letter' | 'portfolio' | 'reference' | 'other';
  file: File | null;
}

interface AddDocumentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (document: DocumentFormData) => void;
}

export function AddDocumentDialog({ isOpen, onOpenChange, onAdd }: AddDocumentDialogProps) {
  const [formData, setFormData] = useState<DocumentFormData>({
    document_name: '',
    document_type: 'resume',
    file: null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.document_name && formData.file) {
      onAdd(formData);
      setFormData({
        document_name: '',
        document_type: 'resume',
        file: null
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, file }));
  };

  const handleInputChange = (field: keyof DocumentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Upload Document</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document_name">Document Name *</Label>
            <Input
              id="document_name"
              value={formData.document_name}
              onChange={(e) => handleInputChange('document_name', e.target.value)}
              placeholder="e.g. Software Engineer Resume 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_type">Document Type</Label>
            <Select value={formData.document_type} onValueChange={(value) => handleInputChange('document_type', value)}>
              <SelectTrigger className="bg-white/40 dark:bg-white/5 border-white/30 dark:border-white/15 backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resume">Resume</SelectItem>
                <SelectItem value="cover_letter">Cover Letter</SelectItem>
                <SelectItem value="portfolio">Portfolio</SelectItem>
                <SelectItem value="reference">Reference</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              required
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX, TXT
            </p>
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
              Upload Document
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
