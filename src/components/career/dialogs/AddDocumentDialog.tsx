
import { useState } from "react";
import { GlassModal } from "@/components/ui/GlassModal";
import { Button } from "@/components/ui/button";
import { GlassInput } from "@/components/ui/GlassInput";
import { Label } from "@/components/ui/label";
import { GlassSelect, GlassSelectContent, GlassSelectItem, GlassSelectTrigger, GlassSelectValue } from "@/components/ui/GlassSelect";
import { FileText } from "lucide-react";

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
    <GlassModal
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Upload Document"
      subtitle="Add documents to your career toolkit"
      icon={FileText}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document_name">Document Name *</Label>
            <GlassInput
              id="document_name"
              value={formData.document_name}
              onChange={(e) => handleInputChange('document_name', e.target.value)}
              placeholder="e.g. Software Engineer Resume 2024"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document_type">Document Type</Label>
            <GlassSelect value={formData.document_type} onValueChange={(value) => handleInputChange('document_type', value)}>
              <GlassSelectTrigger>
                <GlassSelectValue />
              </GlassSelectTrigger>
              <GlassSelectContent>
                <GlassSelectItem value="resume">Resume</GlassSelectItem>
                <GlassSelectItem value="cover_letter">Cover Letter</GlassSelectItem>
                <GlassSelectItem value="portfolio">Portfolio</GlassSelectItem>
                <GlassSelectItem value="reference">Reference</GlassSelectItem>
                <GlassSelectItem value="other">Other</GlassSelectItem>
              </GlassSelectContent>
            </GlassSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">File *</Label>
            <GlassInput
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              required
              className="file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-full bg-white/20 border-white/30 backdrop-blur-sm hover:bg-white/30"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
          >
            Upload Document
          </Button>
        </div>
      </form>
    </GlassModal>
  );
}
