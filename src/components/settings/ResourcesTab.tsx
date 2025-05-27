
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  HelpCircle, 
  MailQuestion, 
  Bug, 
  Scale, 
  BookOpen, 
  Video, 
  MessageSquare,
  ExternalLink,
  Download,
  Users
} from "lucide-react";

const ResourcesTab = () => {
  const navigate = useNavigate();

  const helpCategories = [
    {
      title: "Getting Started",
      items: [
        { name: "Quick Start Guide", type: "guide" },
        { name: "Video Tutorials", type: "video" },
        { name: "Best Practices", type: "guide" }
      ]
    },
    {
      title: "Features",
      items: [
        { name: "Contact Management", type: "guide" },
        { name: "AI Assistant", type: "guide" },
        { name: "Integrations", type: "guide" }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <HelpCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Help Center</h3>
                <p className="text-sm text-gray-600">Guides, tutorials and FAQs</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <MailQuestion className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Contact Support</h3>
                <p className="text-sm text-gray-600">Get help from our team</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-lg">
                <Bug className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Report Bug</h3>
                <p className="text-sm text-gray-600">Found an issue? Let us know</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Community</h3>
                <p className="text-sm text-gray-600">Connect with other users</p>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Articles */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Popular Help Articles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {helpCategories.map((category, index) => (
            <div key={index} className="space-y-3">
              <h4 className="font-medium text-gray-900">{category.title}</h4>
              <div className="space-y-2">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      {item.type === 'video' ? (
                        <Video className="h-4 w-4 text-gray-500" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-gray-500" />
                      )}
                      <span className="text-sm text-gray-700">{item.name}</span>
                      {item.type === 'video' && (
                        <Badge variant="secondary" className="text-xs">Video</Badge>
                      )}
                    </div>
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-green-900">All systems operational</p>
                <p className="text-sm text-green-700">Last updated: 2 minutes ago</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="border-green-200 text-green-700">
              <ExternalLink className="h-4 w-4 mr-2" />
              Status Page
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Downloads */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Downloads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-3" />
              <div className="text-left">
                <p className="font-medium">Mobile App</p>
                <p className="text-sm text-gray-500">Download for iOS and Android</p>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-3" />
              <div className="text-left">
                <p className="font-medium">Desktop App</p>
                <p className="text-sm text-gray-500">Available for Mac, Windows, and Linux</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Legal */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Legal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/legal')}
            >
              <Scale className="h-4 w-4 mr-3" />
              Terms of Service & Privacy Policy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesTab;
