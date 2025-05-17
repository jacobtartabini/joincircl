
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SocialPost } from "@/types/socialIntegration";
import { socialIntegrationService } from "@/services/socialIntegrationService";
import { Facebook, Twitter, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SocialFeedSectionProps {
  contactId: string;
}

export default function SocialFeedSection({ contactId }: SocialFeedSectionProps) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadSocialPosts();
  }, [contactId]);

  const loadSocialPosts = async () => {
    try {
      setIsLoading(true);
      const fetchedPosts = await socialIntegrationService.fetchAndSummarizePosts(contactId);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Error loading social posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadSocialPosts();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return <Facebook className="h-4 w-4 text-blue-600" />;
      case "twitter":
        return <Twitter className="h-4 w-4 text-sky-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Social Media Activity</CardTitle>
            <CardDescription>Recent posts from connected platforms</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-muted/40 p-3 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    {getPlatformIcon(post.platform)}
                    <span className="ml-1 capitalize">{post.platform}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(post.posted_at)}
                  </span>
                </div>
                
                <p className="text-sm mb-1">{post.summary}</p>
                
                {post.post_url && (
                  <a 
                    href={post.post_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View original post
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No social media activity found</p>
            <p className="text-sm mt-1">Connect social accounts to see posts</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
