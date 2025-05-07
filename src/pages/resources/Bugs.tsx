
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export default function Bugs() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    bugType: "",
    description: "",
    email: "",
    steps: "",
    device: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Bug Report Submitted",
      description: "Thank you for helping us improve Circl!"
    });
    
    setFormData({
      bugType: "",
      description: "",
      email: "",
      steps: "",
      device: ""
    });
    
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Report a Bug</h1>
          <p className="text-muted-foreground">
            Help us improve by reporting issues
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bug Report Form</CardTitle>
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
                placeholder="Where should we respond?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bugType">Bug Type*</Label>
              <Select
                value={formData.bugType}
                onValueChange={(value) => handleSelectChange("bugType", value)}
              >
                <SelectTrigger id="bugType">
                  <SelectValue placeholder="Select the type of issue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UI/Display Issue">UI/Display Issue</SelectItem>
                  <SelectItem value="Performance Problem">Performance Problem</SelectItem>
                  <SelectItem value="Feature Not Working">Feature Not Working</SelectItem>
                  <SelectItem value="Data Issue">Data Issue</SelectItem>
                  <SelectItem value="Authentication Problem">Authentication Problem</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Bug Description*</Label>
              <textarea 
                id="description"
                name="description"
                className="w-full min-h-[100px] p-2 border rounded-md" 
                placeholder="Please describe what happened and what you expected to happen"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="steps">Steps to Reproduce</Label>
              <textarea 
                id="steps"
                name="steps"
                className="w-full min-h-[100px] p-2 border rounded-md" 
                placeholder="1. Go to... 
2. Click on...
3. Observe that..."
                value={formData.steps}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="device">Device/Browser Information</Label>
              <Input
                id="device"
                name="device"
                value={formData.device}
                onChange={handleChange}
                placeholder="e.g., Chrome 98 on Windows 11"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Bug Report"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
