
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Message Sent",
      description: "We've received your message and will respond soon."
    });
    
    setFormData({
      subject: "",
      email: "",
      message: ""
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Contact Support</h1>
          <p className="text-muted-foreground">
            Get in touch with our team
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send us a message</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Your Email*</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject*</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="What's this about?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message*</Label>
              <textarea 
                id="message"
                name="message"
                className="w-full min-h-[150px] p-2 border rounded-md" 
                placeholder="How can we help you?"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Submit Request"}
            </Button>
          </form>
          
          <div className="mt-6 border-t pt-6">
            <h3 className="font-medium mb-2">Other ways to reach us</h3>
            <div className="space-y-1 text-sm">
              <p>Email: support@circl.com</p>
              <p>Phone: +1 (555) 123-4567</p>
              <p>Business hours: Monday - Friday, 9am - 5pm EST</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
