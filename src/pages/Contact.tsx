import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-3xl font-bold">Contact Support</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
          <CardDescription>
            Need help with something specific? Our support team is here to assist you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form 
            action="https://formspree.io/f/xjkwyjoy" 
            method="POST" 
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input 
                  id="name" 
                  name="name"
                  placeholder="Enter your name" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email"
                  placeholder="Enter your email" 
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject" 
                name="subject"
                placeholder="What's this about?" 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <textarea 
                id="message" 
                name="message"
                className="w-full min-h-[150px] p-2 border rounded-md" 
                placeholder="How can we help you?"
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
          
          <div className="mt-8 p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Contact Information</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> support@joincircl.com</p>
              <p><strong>Hours:</strong> Monday–Friday, 9am–5pm EST</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contact;
