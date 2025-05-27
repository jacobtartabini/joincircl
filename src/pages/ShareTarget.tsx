
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Share, FileText, Link as LinkIcon, CheckCircle } from "lucide-react";

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
    const params = new URLSearchParams(window.location.search);
    const title = params.get('title') || undefined;
    const text = params.get('text') || undefined;
    const url = params.get('url') || undefined;
    
    setShareData({ title, text, url });
    setLoading(false);
    
    if (title || text || url) {
      toast({
        title: "Content shared with Circl",
        description: "The shared content is ready to be processed.",
      });
    }
  }, []);

  const handleProcess = () => {
    toast({
      title: "Processing shared content",
      description: "Your shared content is being processed.",
    });
    
    setTimeout(() => navigate('/circles'), 1500);
  };

  const handleCancel = () => {
    navigate('/circles');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg font-medium">Loading shared content...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
              <Share className="h-10 w-10 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Content Shared with Circl</h1>
          <p className="text-gray-600 text-lg">Review and process the shared content below</p>
        </div>
        
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-6 w-6 text-gray-600" />
              Shared Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {shareData.title && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Title</h3>
                <p className="text-gray-700">{shareData.title}</p>
              </div>
            )}
            
            {shareData.text && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Text</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{shareData.text}</p>
              </div>
            )}
            
            {shareData.url && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  URL
                </h3>
                <a 
                  href={shareData.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {shareData.url}
                </a>
              </div>
            )}
            
            {!shareData.title && !shareData.text && !shareData.url && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No content was shared</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={handleProcess}
            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Process Content
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            className="border-gray-200 hover:bg-gray-50 font-semibold px-8 py-3"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShareTarget;
