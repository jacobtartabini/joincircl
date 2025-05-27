
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bug, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Bugs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    bugType: "",
    description: "",
    steps: "",
    email: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, bugType: value }));
  };

  const handleToast = () => {
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
            <h1 className="text-2xl font-semibold text-gray-900">Report a Bug</h1>
            <p className="text-gray-600 mt-1">Help us improve Circl by reporting issues you encounter</p>
          </div>
        </div>
        
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Bug className="h-5 w-5 text-red-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">Bug Report</CardTitle>
            </div>
            <p className="text-gray-600">
              Found something that's not working correctly? Let us know so we can fix it.
            </p>
          </CardHeader>
          <CardContent className="space-y-8">
            <form
              action="https://formspree.io/f/mqaqndap"
              method="POST"
              className="space-y-6"
              onSubmit={handleToast}
            >
              {/* Hidden redirect */}
              <input type="hidden" name="_next" value="." />

              <div className="space-y-2">
                <Label htmlFor="bugType" className="text-sm font-medium text-gray-700">Bug Type</Label>
                <Select
                  value={formData.bugType}
                  onValueChange={handleSelectChange}
                  required
                >
                  <SelectTrigger className="border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900">
                    <SelectValue placeholder="Select bug type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UI/Display Issue">UI/Display Issue</SelectItem>
                    <SelectItem value="Performance Problem">Performance Problem</SelectItem>
                    <SelectItem value="Feature Not Working">Feature Not Working</SelectItem>
                    <SelectItem value="App Crash">App Crash</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="bugType" value={formData.bugType} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">Bug Description</Label>
                <textarea 
                  id="description" 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none" 
                  placeholder="Please describe what happened..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="steps" className="text-sm font-medium text-gray-700">Steps to Reproduce</Label>
                <textarea 
                  id="steps" 
                  name="steps"
                  value={formData.steps}
                  onChange={handleChange}
                  className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none" 
                  placeholder="Please list the steps to reproduce this issue..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Your Email (optional)</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email if you'd like us to follow up"
                  className="border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>
              
              <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3">
                Submit Bug Report
              </Button>
            </form>

            {/* Tips Section */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900 mb-2">Before Submitting</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                    <li>Check if you're using the latest version of the app</li>
                    <li>Try refreshing the page or logging out and back in</li>
                    <li>Clear your browser cache and cookies</li>
                    <li>Check if the issue persists in a different browser</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Bugs;
