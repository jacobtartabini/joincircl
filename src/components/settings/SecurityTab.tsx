
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Lock, 
  Eye, 
  AlertTriangle, 
  Smartphone, 
  Key,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const SecurityTab = () => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const securityItems = [
    {
      icon: Lock,
      title: "Password",
      description: "Strong password with 12+ characters",
      status: "secure",
      action: "Change"
    },
    {
      icon: Smartphone,
      title: "Two-Factor Authentication",
      description: "Add an extra layer of security",
      status: "disabled",
      action: "Enable"
    },
    {
      icon: Eye,
      title: "Login Activity",
      description: "Monitor recent login attempts",
      status: "active",
      action: "View"
    },
    {
      icon: Key,
      title: "API Keys",
      description: "Manage application access",
      status: "none",
      action: "Manage"
    }
  ];

  const handlePasswordChange = () => {
    console.log("Changing password:", passwordForm);
  };

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Security Status</CardTitle>
              <p className="text-sm text-gray-600">Your account security is in good shape</p>
            </div>
            <Badge variant="secondary" className="ml-auto bg-green-50 text-green-700 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {securityItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    item.status === 'secure' || item.status === 'active' ? 'bg-green-50' :
                    item.status === 'disabled' ? 'bg-amber-50' : 'bg-gray-50'
                  }`}>
                    <item.icon className={`h-4 w-4 ${
                      item.status === 'secure' || item.status === 'active' ? 'text-green-600' :
                      item.status === 'disabled' ? 'text-amber-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.status === 'secure' || item.status === 'active' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : item.status === 'disabled' ? (
                    <XCircle className="h-4 w-4 text-amber-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-gray-400" />
                  )}
                  <Button variant="outline" size="sm">
                    {item.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">
              Current Password
            </Label>
            <Input
              id="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
              New Password
            </Label>
            <Input
              id="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              className="border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handlePasswordChange} className="bg-blue-600 hover:bg-blue-700">
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security Resources */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Security Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start text-left h-auto py-3"
              asChild
            >
              <Link to="/security">
                <Lock className="mr-3 h-4 w-4" />
                <div>
                  <p className="font-medium">Security Guide</p>
                  <p className="text-sm text-gray-500">Learn about best practices and security features</p>
                </div>
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-left h-auto py-3"
              disabled
            >
              <Eye className="mr-3 h-4 w-4" />
              <div>
                <p className="font-medium">Login History</p>
                <p className="text-sm text-gray-500">View recent login attempts and sessions</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;
