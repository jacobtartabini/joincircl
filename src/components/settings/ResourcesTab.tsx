import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Video, MessageCircle, Mail, FileText, ExternalLink, HelpCircle, Users, Lightbulb, Phone } from "lucide-react";

const ResourcesTab = () => {
  const resources = [{
    category: "Getting Started",
    items: [{
      title: "Quick Start Guide",
      description: "Learn the basics of Circl in 5 minutes",
      icon: BookOpen,
      link: "#",
      type: "guide"
    }, {
      title: "Onboarding Tutorial",
      description: "Interactive tutorial to get you started",
      icon: Video,
      link: "#",
      type: "tutorial"
    }, {
      title: "Best Practices",
      description: "Tips for effective relationship management",
      icon: Lightbulb,
      link: "#",
      type: "guide"
    }]
  }, {
    category: "Documentation",
    items: [{
      title: "User Manual",
      description: "Complete guide to all features",
      icon: FileText,
      link: "#",
      type: "documentation"
    }, {
      title: "API Documentation",
      description: "Integrate with our REST API",
      icon: FileText,
      link: "#",
      type: "documentation"
    }, {
      title: "FAQ",
      description: "Frequently asked questions",
      icon: HelpCircle,
      link: "#",
      type: "faq"
    }]
  }, {
    category: "Support",
    items: [{
      title: "Help Center",
      description: "Search our knowledge base",
      icon: MessageCircle,
      link: "#",
      type: "support"
    }, {
      title: "Contact Support",
      description: "Get help from our team",
      icon: Mail,
      link: "mailto:support@joincircl.com",
      type: "contact"
    }, {
      title: "Schedule a Call",
      description: "Book a 1-on-1 demo or support session",
      icon: Phone,
      link: "#",
      type: "booking"
    }]
  }, {
    category: "Community",
    items: [{
      title: "User Community",
      description: "Connect with other Circl users",
      icon: Users,
      link: "#",
      type: "community"
    }, {
      title: "Feature Requests",
      description: "Suggest new features",
      icon: Lightbulb,
      link: "#",
      type: "feedback"
    }]
  }];
  const getIconColor = (type: string) => {
    switch (type) {
      case 'guide':
        return 'text-blue-600 bg-blue-100';
      case 'tutorial':
        return 'text-green-600 bg-green-100';
      case 'documentation':
        return 'text-purple-600 bg-purple-100';
      case 'faq':
        return 'text-yellow-600 bg-yellow-100';
      case 'support':
        return 'text-red-600 bg-red-100';
      case 'contact':
        return 'text-gray-600 bg-gray-100';
      case 'booking':
        return 'text-indigo-600 bg-indigo-100';
      case 'community':
        return 'text-pink-600 bg-pink-100';
      case 'feedback':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  const handleResourceClick = (link: string) => {
    if (link.startsWith('mailto:')) {
      window.location.href = link;
    } else if (link.startsWith('http')) {
      window.open(link, '_blank');
    } else {
      // Handle internal links or show placeholder
      console.log('Navigate to:', link);
    }
  };
  return (
    <div className="space-y-10">
      {resources.map(category => (
        <Card key={category.category} className="border border-gray-200 shadow-sm bg-white">
          <CardHeader className="pb-8">
            <CardTitle className="text-xl font-semibold text-gray-900">{category.category}</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {category.items.map(item => (
                <div 
                  key={item.title} 
                  className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer group" 
                  onClick={() => handleResourceClick(item.link)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getIconColor(item.type)}`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h4>
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Contact Support CTA */}
      <Card className="border border-gray-200 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-10">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="h-10 w-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Need More Help?</h3>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Our support team is here to help you get the most out of Circl. 
              Don't hesitate to reach out with any questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => handleResourceClick('mailto:support@joincircl.com')} 
                className="bg-blue-600 hover:bg-blue-700 rounded-full px-8 py-3 text-base"
                size="lg"
              >
                <Mail className="h-5 w-5 mr-2" />
                Email Support
              </Button>
              <Button 
                variant="outline" 
                onClick={() => handleResourceClick('#')} 
                className="border-blue-200 text-blue-700 hover:bg-blue-50 rounded-full px-8 py-3 text-base"
                size="lg"
              >
                <Video className="h-5 w-5 mr-2" />
                Schedule Demo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesTab;
