
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Bugs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    bugType: "",
    description: "",
    steps: "",
    email: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, bugType: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Bug Report Submitted",
        description: "Thank you for helping us improve Circl!",
      });
      setFormData({
        bugType: "",
        description: "",
        steps: "",
        email: ""
      });
      setIsSubmitting(false);
    }, 1000);
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
        <h1 className="text-3xl font-bold">Report a Bug</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Bug Report</CardTitle>
          <CardDescription>
            Found something that's not working correctly? Let us know so we can fix it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bugType">Bug Type</Label>
              <Select
                value={formData.bugType}
                onValueChange={handleSelectChange}
                required
              >
                <SelectTrigger id="bugType">
                  <SelectValue placeholder="Select bug type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ui">UI/Display Issue</SelectItem>
                  <SelectItem value="performance">Performance Problem</SelectItem>
                  <SelectItem value="feature">Feature Not Working</SelectItem>
                  <SelectItem value="crash">App Crash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Bug Description</Label>
              <textarea 
                id="description" 
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full min-h-[100px] p-2 border rounded-md" 
                placeholder="Please describe what happened..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="steps">Steps to Reproduce</Label>
              <textarea 
                id="steps" 
                name="steps"
                value={formData.steps}
                onChange={handleChange}
                className="w-full min-h-[100px] p-2 border rounded-md" 
                placeholder="Please list the steps to reproduce this issue..."
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Your Email (optional)</Label>
              <Input 
                id="email" 
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email if you'd like us to follow up" 
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Bug Report"}
            </Button>
          </form>
          
          <div className="mt-8 p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Before Submitting</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Check if you're using the latest version of the app</li>
              <li>Try refreshing the page or logging out and back in</li>
              <li>Clear your browser cache and cookies</li>
              <li>Check if the issue persists in a different browser</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Bugs;
