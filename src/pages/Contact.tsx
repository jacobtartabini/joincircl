
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageCircle, Mail, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true);
    toast({
      title: "Request Submitted",
      description: "We've received your message and will respond shortly.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Contact Support</h1>
            <p className="text-gray-600 mt-1">Get in touch with our team for assistance</p>
          </div>
        </div>
        
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">Get in Touch</CardTitle>
            </div>
            <p className="text-gray-600">
              Need help with something specific? Our support team is here to assist you.
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <form 
              action="https://formspree.io/f/xjkwyjoy" 
              method="POST" 
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Your Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="Enter your name" 
                    required
                    className="border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email"
                    placeholder="Enter your email" 
                    required
                    className="border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</Label>
                <Input 
                  id="subject" 
                  name="subject"
                  placeholder="What's this about?" 
                  required
                  className="border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message</Label>
                <textarea 
                  id="message" 
                  name="message"
                  className="w-full min-h-[150px] p-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none" 
                  placeholder="How can we help you?"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
            
            {/* Contact Information */}
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-600" />
                Contact Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <span className="text-sm text-gray-600 ml-2">support@joincircl.com</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Hours:</span>
                    <span className="text-sm text-gray-600 ml-2">Monday–Friday, 9am–5pm EST</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Contact;
