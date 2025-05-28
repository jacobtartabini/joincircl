
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Key, Smartphone, Loader2, QrCode, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserSessions } from "@/hooks/useUserSessions";
import { use2FA } from "@/hooks/use2FA";

const SecurityTab = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showSetup2FA, setShowSetup2FA] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const { sessions, loading: sessionsLoading, terminateSession } = useUserSessions();
  const { loading: twoFALoading, setupData, enable2FA, verify2FA, disable2FA } = use2FA();
  const { toast } = useToast();

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ 
        password: newPassword 
      });

      if (error) throw error;

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Failed to change password",
        variant: "destructive",
      });
    }
    setChangingPassword(false);
  };

  const handleSetup2FA = async () => {
    try {
      await enable2FA();
      setShowSetup2FA(true);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleVerify2FA = async () => {
    const success = await verify2FA(verificationCode);
    if (success) {
      setTwoFAEnabled(true);
      setShowSetup2FA(false);
      setVerificationCode("");
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
      return;
    }
    
    const success = await disable2FA(currentPassword);
    if (success) {
      setTwoFAEnabled(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceInfo = (deviceInfo?: string) => {
    if (!deviceInfo) return "Unknown Device";
    try {
      const parsed = JSON.parse(deviceInfo);
      return `${parsed.browser || 'Unknown'} on ${parsed.os || 'Unknown'}`;
    } catch {
      return deviceInfo;
    }
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
          <Button 
            onClick={handlePasswordChange} 
            disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {changingPassword ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Updating...
              </>
            ) : (
              'Update Password'
            )}
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
              <h4 className="font-medium text-green-900">
                {twoFAEnabled ? '2FA Enabled' : 'Enhance Security'}
              </h4>
              <p className="text-sm text-green-700 mt-1">
                {twoFAEnabled 
                  ? 'Your account is protected with two-factor authentication'
                  : 'Add an extra layer of protection to your account with 2FA'
                }
              </p>
            </div>
            {twoFAEnabled ? (
              <Button 
                variant="outline" 
                onClick={handleDisable2FA} 
                disabled={twoFALoading}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                {twoFALoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Disable 2FA
              </Button>
            ) : (
              <Dialog open={showSetup2FA} onOpenChange={setShowSetup2FA}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    onClick={handleSetup2FA} 
                    disabled={twoFALoading}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    {twoFALoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Enable 2FA
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {setupData && (
                      <>
                        <div className="text-center">
                          <div className="bg-white p-4 rounded-lg border inline-block">
                            <QrCode className="h-32 w-32 mx-auto" />
                            <p className="text-xs text-gray-500 mt-2">QR Code would appear here</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Manual Entry Key</Label>
                          <div className="flex items-center gap-2">
                            <Input 
                              value={setupData.secret} 
                              readOnly 
                              className="font-mono text-xs"
                            />
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => copyToClipboard(setupData.secret)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="verificationCode" className="text-sm font-medium">Verification Code</Label>
                          <Input
                            id="verificationCode"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                          />
                        </div>

                        <Button 
                          onClick={handleVerify2FA} 
                          disabled={!verificationCode || verificationCode.length !== 6 || twoFALoading}
                          className="w-full"
                        >
                          {twoFALoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : null}
                          Verify & Enable
                        </Button>
                      </>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
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
          {sessionsLoading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No active sessions found
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session, index) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {index === 0 ? "Current Session" : "Session"}
                    </h4>
                    <p className="text-sm text-gray-600">{getDeviceInfo(session.device_info)}</p>
                    <p className="text-xs text-gray-500">
                      {session.location || 'Unknown location'} • Last active: {formatDate(session.last_active)}
                    </p>
                  </div>
                  {index === 0 ? (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => terminateSession(session.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;
