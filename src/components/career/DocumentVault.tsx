
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Download, Edit, Trash2, Upload } from "lucide-react";

interface Document {
  id: string;
  document_name: string;
  document_type: 'resume' | 'cover_letter' | 'portfolio' | 'reference' | 'other';
  file_size?: number;
  created_at: string;
}

export default function DocumentVault() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const getDocumentIcon = (type: Document['document_type']) => {
    return <FileText className="h-4 w-4" />;
  };

  const getDocumentTypeColor = (type: Document['document_type']) => {
    switch (type) {
      case 'resume': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cover_letter': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'portfolio': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'reference': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${kb.toFixed(1)} KB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Document Vault</h3>
        <Button 
          onClick={() => setShowUploadDialog(true)}
          className="gap-2 glass-button"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card className="p-8 text-center glass-card">
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium text-foreground mb-2">No Documents Yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Upload your resume, cover letters, and other career documents
          </p>
          <Button onClick={() => setShowUploadDialog(true)} className="glass-button">
            Upload Your First Document
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {documents.map((doc) => (
            <Card key={doc.id} className="p-4 glass-card hover:glass-card-enhanced transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {getDocumentIcon(doc.document_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{doc.document_name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getDocumentTypeColor(doc.document_type)}>
                        {doc.document_type.replace('_', ' ')}
                      </Badge>
                      {doc.file_size && (
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(doc.file_size)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
