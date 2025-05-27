
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, HelpCircle, MessageSquare, Video, FileText, ExternalLink, Users, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const ResourcesTab = () => {
  const resources = [
    {
      title: "Help Center",
      description: "Find answers to common questions and learn how to use Circl",
      icon: HelpCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      link: "/help",
      external: false
    },
    {
      title: "Contact Support",
      description: "Get help from our support team",
      icon: MessageSquare,
      color: "text-green-600",
      bgColor: "bg-green-100",
      link: "/contact",
      external: false
    },
    {
      title: "Report Bug",
      description: "Found an issue? Let us know so we can fix it",
      icon: FileText,
      color: "text-red-600",
      bgColor: "bg-red-100",
      link: "/bugs",
      external: false
    },
    {
      title: "API Documentation",
      description: "Integrate Circl with your applications",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      link: "https://docs.circl.dev",
      external: true
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides and tutorials",
      icon: Video,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      link: "https://youtube.com/circl",
      external: true
    },
    {
      title: "Community Forum",
      description: "Connect with other Circl users and share tips",
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      link: "https://community.circl.dev",
      external: true
    }
  ];

  const quickActions = [
    {
      title: "Keyboard Shortcuts",
      description: "Learn time-saving keyboard shortcuts",
      icon: Zap,
      action: () => console.log("Show shortcuts")
    },
    {
      title: "Export Data",
      description: "Download your contacts and data",
      icon: FileText,
      action: () => console.log("Export data")
    },
    {
      title: "Feature Requests",
      description: "Suggest new features for Circl",
      icon: MessageSquare,
      action: () => console.log("Submit feature request")
    }
  ];

  return (
    <div className="space-y-8">
      {/* Help & Support */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold text-gray-900">Help & Support</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <div key={resource.title} className="group">
                {resource.external ? (
                  <a 
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${resource.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <resource.icon className={`h-5 w-5 ${resource.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 group-hover:text-gray-700">{resource.title}</h4>
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      </div>
                    </div>
                  </a>
                ) : (
                  <Link to={resource.link} className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${resource.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <resource.icon className={`h-5 w-5 ${resource.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 group-hover:text-gray-700">{resource.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quickActions.map((action) => (
              <div key={action.title} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <action.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{action.title}</h4>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={action.action} className="border-gray-200 hover:bg-gray-100">
                  Open
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold text-gray-900">System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <h4 className="font-medium text-green-900">All Systems Operational</h4>
                  <p className="text-sm text-green-700">All services are running normally</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                <ExternalLink className="h-4 w-4 mr-2" />
                Status Page
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">API Response Time</span>
                  <span className="text-sm text-green-600">142ms</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Uptime</span>
                  <span className="text-sm text-green-600">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesTab;
