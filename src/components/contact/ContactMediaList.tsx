
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { contactMediaService } from '@/services/contactMediaService';
import { ContactMedia } from '@/types/contact';
import { FileImage, File, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ContactMediaListProps {
  contactId: string;
}

export default function ContactMediaList({ contactId }: ContactMediaListProps) {
  const [media, setMedia] = useState<ContactMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<ContactMedia | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadMedia = async () => {
      setLoading(true);
      try {
        const mediaData = await contactMediaService.getContactMedia(contactId);
        setMedia(mediaData);
      } catch (error) {
        console.error('Error loading media:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [contactId]);

  const handleDeleteClick = (mediaItem: ContactMedia) => {
    setSelectedMedia(mediaItem);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMedia) return;
    
    try {
      await contactMediaService.deleteContactMedia(selectedMedia.id);
      setMedia(media.filter(item => item.id !== selectedMedia.id));
      toast({
        title: 'File deleted',
        description: 'The file has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the file. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMedia(null);
    }
  };

  // Group media by type for display
  const images = media.filter(item => item.is_image);
  const documents = media.filter(item => !item.is_image);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Files & Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (media.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Files & Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>No files or images added yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Files & Media</CardTitle>
      </CardHeader>
      <CardContent>
        {images.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Images</h4>
            <div className="grid grid-cols-2 gap-2">
              {images.map(image => (
                <div key={image.id} className="relative group">
                  <a 
                    href={image.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img 
                      src={image.url} 
                      alt={image.file_name} 
                      className="h-24 w-full object-cover rounded border"
                    />
                  </a>
                  <Button 
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                    onClick={() => handleDeleteClick(image)}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {documents.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Documents</h4>
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 group">
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center flex-1"
                  >
                    <File size={16} className="mr-2 text-blue-600" />
                    <span className="text-sm truncate">{doc.file_name}</span>
                  </a>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-red-500"
                    onClick={() => handleDeleteClick(doc)}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this file?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this file.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedMedia(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
