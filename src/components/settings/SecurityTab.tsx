
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Key, Smartphone, AlertTriangle } from "lucide-react";

const SecurityTab = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = () => {
    console.log("Changing password...");
  };

  const handleEnable2FA = () => {
    console.log("Enabling 2FA...");
  };

  return (
    <div className="space-y-8">
      {/* Password Change */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900">Change Password</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-gray-200 focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
              />
            </div>
          </div>
          <Button onClick={handlePasswordChange} className="bg-gray-900 hover:bg-gray-800 text-white">
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Smartphone className="h-5 w-5 text-green-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900">Two-Factor Authentication</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div>
              <h4 className="font-medium text-green-900">Enhance Security</h4>
              <p className="text-sm text-green-700 mt-1">
                Add an extra layer of protection to your account with 2FA
              </p>
            </div>
            <Button variant="outline" onClick={handleEnable2FA} className="border-green-200 text-green-700 hover:bg-green-50">
              Enable 2FA
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-gray-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-gray-900">Active Sessions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Current Session</h4>
                <p className="text-sm text-gray-600">Chrome on macOS • San Francisco, CA</p>
                <p className="text-xs text-gray-500">Active now</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <h4 className="font-medium text-gray-900">Mobile App</h4>
                <p className="text-sm text-gray-600">iPhone • San Francisco, CA</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                Revoke
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border border-red-200 bg-red-50/50 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <CardTitle className="text-lg font-semibold text-red-900">Danger Zone</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-white/80 rounded-lg border border-red-200">
            <div>
              <h4 className="font-medium text-red-900">Delete Account</h4>
              <p className="text-sm text-red-700">Permanently delete your account and all data</p>
            </div>
            <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;
