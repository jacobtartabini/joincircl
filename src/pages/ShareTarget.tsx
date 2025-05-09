
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const ShareTarget = () => {
  const [loading, setLoading] = useState(true);
  const [shareData, setShareData] = useState<{
    title?: string;
    text?: string;
    url?: string;
    files?: FileList;
  }>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Extract shared data from URL params
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title') || undefined;
    const text = params.get('text') || undefined;
    const url = params.get('url') || undefined;
    
    setShareData({ title, text, url });
    setLoading(false);
    
    // Show toast notification
    if (title || text || url) {
      toast({
        title: "Content shared with Circl",
        description: "The shared content is ready to be processed.",
      });
    }
  }, []);

  const handleProcess = () => {
    // Here you would process the shared data
    // For example, creating a contact from a vCard file
    // or importing contacts from a CSV file
    
    toast({
      title: "Processing shared content",
      description: "Your shared content is being processed.",
    });
    
    // Navigate to circles after processing
    setTimeout(() => navigate('/circles'), 1500);
  };

  const handleCancel = () => {
    navigate('/circles');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Content Shared with Circl</h1>
      
      <Card className="p-6 mb-6">
        {shareData.title && (
          <div className="mb-4">
            <h2 className="font-semibold text-lg">Title</h2>
            <p>{shareData.title}</p>
          </div>
        )}
        
        {shareData.text && (
          <div className="mb-4">
            <h2 className="font-semibold text-lg">Text</h2>
            <p className="whitespace-pre-wrap">{shareData.text}</p>
          </div>
        )}
        
        {shareData.url && (
          <div className="mb-4">
            <h2 className="font-semibold text-lg">URL</h2>
            <a href={shareData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              {shareData.url}
            </a>
          </div>
        )}
      </Card>
      
      <div className="flex gap-4">
        <Button onClick={handleProcess}>Process Content</Button>
        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
      </div>
    </div>
  );
};

export default ShareTarget;
