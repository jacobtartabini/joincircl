
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, HelpCircle, MessageSquare, Video, FileText, ExternalLink, GraduationCap, Phone, Mail } from "lucide-react";

const ResourcesTab = () => {
  const resources = [
    {
      title: "Getting Started Guide",
      description: "Complete onboarding guide for new users",
      icon: GraduationCap,
      color: "text-green-600",
      bgColor: "bg-green-100",
      link: "/help/getting-started",
      external: false
    },
    {
      title: "Help Center",
      description: "Find answers to common questions and tutorials",
      icon: HelpCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      link: "/help",
      external: false
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides and feature demos",
      icon: Video,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      link: "https://youtube.com/@joincircl",
      external: true
    },
    {
      title: "User Documentation",
      description: "Comprehensive documentation and feature guides",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      link: "https://docs.joincircl.com",
      external: true
    },
    {
      title: "Contact Support",
      description: "Get help from our support team",
      icon: MessageSquare,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      link: "/contact",
      external: false
    },
    {
      title: "Email Support",
      description: "Send us an email for detailed assistance",
      icon: Mail,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      link: "mailto:support@joincircl.com",
      external: true
    }
  ];

  const faqs = [
    {
      question: "How do I import my contacts?",
      answer: "You can import contacts from various sources including CSV files, Google Contacts, and Outlook. Go to the Integrations tab to connect your accounts."
    },
    {
      question: "What's the difference between circles?",
      answer: "Circles help you organize contacts by relationship strength: Inner (close relationships), Core (regular contacts), and Outer (acquaintances)."
    },
    {
      question: "How do I track interactions?",
      answer: "Click on any contact and use the 'Add Interaction' button to log meetings, calls, messages, or any other form of communication."
    },
    {
      question: "Can I export my data?",
      answer: "Yes! Go to Account settings and use the 'Export Data' feature to download all your contacts and interaction history."
    },
    {
      question: "How do I set up keystones?",
      answer: "Keystones are important dates or reminders. You can add them from the Keystones page or directly from a contact's profile."
    }
  ];

  const learningPaths = [
    {
      title: "New User Path",
      description: "Perfect for users just getting started with Circl",
      steps: ["Account setup", "Import contacts", "Create first circle", "Log interactions"],
      icon: GraduationCap
    },
    {
      title: "Advanced Features",
      description: "Learn about AI insights, automation, and advanced workflows",
      steps: ["AI relationship insights", "Automation setup", "Advanced filtering", "Team collaboration"],
      icon: BookOpen
    },
    {
      title: "Integration Master",
      description: "Connect all your tools and platforms",
      steps: ["Email integration", "Calendar sync", "Social platforms", "API usage"],
      icon: ExternalLink
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
                    className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors h-full"
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
                  <a 
                    href={resource.link} 
                    className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors h-full"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${resource.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <resource.icon className={`h-5 w-5 ${resource.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 group-hover:text-gray-700">{resource.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      </div>
                    </div>
                  </a>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Paths */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold text-gray-900">Learning Paths</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningPaths.map((path) => (
              <div key={path.title} className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <path.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{path.title}</h4>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{path.description}</p>
                <div className="space-y-2">
                  {path.steps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Start Learning
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Frequently Asked Questions */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold text-gray-900">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-sm text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold text-gray-900">Need More Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Phone Support</h4>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Get immediate help from our support team during business hours.
              </p>
              <p className="text-blue-900 font-medium">+1 (555) 123-4567</p>
              <p className="text-xs text-blue-600">Mon-Fri 9AM-6PM EST</p>
            </div>
            
            <div className="p-6 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-5 w-5 text-green-600" />
                <h4 className="font-medium text-green-900">Email Support</h4>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Send us detailed questions and we'll get back to you within 24 hours.
              </p>
              <a href="mailto:support@joincircl.com" className="text-green-900 font-medium hover:underline">
                support@joincircl.com
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResourcesTab;
