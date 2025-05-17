
import { ContactMedia } from "@/types/contact";
import { FileImage, File } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContactMediaSectionProps {
  contactId: string;
  contactMedia: ContactMedia[];
}

export default function ContactMediaSection({ contactId, contactMedia }: ContactMediaSectionProps) {
  // Group media by type for display
  const images = contactMedia.filter(item => item.is_image);
  const documents = contactMedia.filter(item => !item.is_image);
  
  if (images.length === 0 && documents.length === 0) {
    return null;
  }
  
  return (
    <div>
      {images.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Images</h4>
          <div className="grid grid-cols-3 gap-2">
            {images.map(image => (
              <a key={image.id} href={image.url} target="_blank" rel="noopener noreferrer" className="block">
                <img src={image.url} alt={image.file_name} className="h-24 w-full object-cover rounded border" />
              </a>
            ))}
          </div>
        </div>
      )}
      
      {documents.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Documents</h4>
          <div className="space-y-2">
            {documents.map(doc => (
              <a key={doc.id} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-2 border rounded hover:bg-muted/50">
                <File size={16} className="mr-2 text-blue-600" />
                <span className="text-sm truncate">{doc.file_name}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
