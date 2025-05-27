
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageCircle, Mail, Clock, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const Contact = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    toast({
      title: "Request Submitted",
      description: "We've received your message and will respond shortly.",
    });
    setTimeout(() => setIsSubmitting(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="hover:bg-gray-200 rounded-xl"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contact Support</h1>
            <p className="text-gray-600 mt-1 text-lg">Get in touch with our team for assistance</p>
          </div>
        </div>
        
        <Card className="border-0 shadow-sm bg-white">
          <CardHeader className="pb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">Get in Touch</CardTitle>
                <p className="text-gray-600 text-lg mt-1">
                  Need help with something specific? Our support team is here to assist you.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 px-8">
            <form 
              action="https://formspree.io/f/xjkwyjoy" 
              method="POST" 
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Your Name</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="Enter your name" 
                    required
                    className="h-12 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email"
                    placeholder="Enter your email" 
                    required
                    className="h-12 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">Subject</Label>
                <Input 
                  id="subject" 
                  name="subject"
                  placeholder="What's this about?" 
                  required
                  className="h-12 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 transition-all duration-200"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="message" className="text-sm font-semibold text-gray-700">Message</Label>
                <textarea 
                  id="message" 
                  name="message"
                  className="w-full min-h-[180px] p-4 border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 resize-none transition-all duration-200" 
                  placeholder="How can we help you?"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl" 
                disabled={isSubmitting}
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
            
            {/* Contact Information */}
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                <Mail className="h-6 w-6 text-gray-600" />
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Email:</span>
                    <span className="text-sm text-gray-600 ml-2">support@joincircl.com</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Hours:</span>
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
