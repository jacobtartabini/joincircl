
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Eye, EyeOff, Shield, Smartphone } from "lucide-react";
import { use2FA, TwoFactorSetup } from "@/hooks/use2FA";
import { useToast } from "@/hooks/use-toast";

interface TwoFactorSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function TwoFactorSetupDialog({ open, onOpenChange, onComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [verificationCode, setVerificationCode] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodesSaved, setBackupCodesSaved] = useState(false);
  const { loading, setupData, enable2FA, verify2FA } = use2FA();
  const { toast } = useToast();

  const handleStartSetup = async () => {
    try {
      await enable2FA();
      setStep('verify');
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code",
        variant: "destructive",
      });
      return;
    }

    const success = await verify2FA(verificationCode);
    if (success) {
      setStep('backup');
    }
  };

  const handleComplete = () => {
    if (!backupCodesSaved) {
      toast({
        title: "Warning",
        description: "Please save your backup codes before continuing",
        variant: "destructive",
      });
      return;
    }
    
    onComplete();
    onOpenChange(false);
    // Reset state
    setStep('setup');
    setVerificationCode("");
    setShowBackupCodes(false);
    setBackupCodesSaved(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  const downloadBackupCodes = () => {
    if (!setupData?.backupCodes) return;
    
    const codesText = setupData.backupCodes.join('\n');
    const blob = new Blob([`Circl 2FA Backup Codes\n\n${codesText}\n\nSave these codes in a secure location. Each code can only be used once.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'circl-2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setBackupCodesSaved(true);
    toast({
      title: "Downloaded",
      description: "Backup codes saved to your device",
    });
  };

  const QRCodeDisplay = ({ qrCode }: { qrCode: string }) => {
    // For a real implementation, you'd use a QR code library like qrcode
    // For now, we'll show the URL that would generate the QR code
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 w-64 h-64 flex items-center justify-center">
          <div className="text-center">
            <Smartphone className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600">QR Code would appear here</p>
            <p className="text-xs text-gray-500 mt-2">Use your authenticator app to scan</p>
          </div>
        </div>
        
        <div className="w-full space-y-2">
          <Label className="text-sm font-medium">Manual Entry Key</Label>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-gray-100 rounded border text-xs font-mono break-all">
              {setupData?.secret}
            </code>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => copyToClipboard(setupData?.secret || '')}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enable Two-Factor Authentication
          </DialogTitle>
        </DialogHeader>

        {step === 'setup' && (
          <div className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication adds an extra layer of security to your account by requiring a code from your phone in addition to your password.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h4 className="font-medium">What you'll need:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  An authenticator app (Google Authenticator, Authy, etc.)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Your phone or tablet
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  A secure place to store backup codes
                </li>
              </ul>
            </div>

            <Button 
              onClick={handleStartSetup} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Setting up..." : "Start Setup"}
            </Button>
          </div>
        )}

        {step === 'verify' && setupData && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h4 className="font-medium">Scan QR Code</h4>
              <QRCodeDisplay qrCode={setupData.qrCode} />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode" className="text-sm font-medium">
                  Enter verification code from your authenticator app
                </Label>
                <div className="flex justify-center">
                  <InputOTP 
                    maxLength={6} 
                    value={verificationCode} 
                    onChange={setVerificationCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button 
                onClick={handleVerifyCode} 
                disabled={!verificationCode || verificationCode.length !== 6 || loading}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify & Enable"}
              </Button>
            </div>
          </div>
        )}

        {step === 'backup' && setupData && (
          <div className="space-y-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                2FA has been enabled successfully! Please save your backup codes in a secure location.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  Backup Codes
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                  >
                    {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {showBackupCodes && (
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {setupData.backupCodes.map((code, index) => (
                      <div key={index} className="p-2 bg-gray-100 rounded text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(setupData.backupCodes.join('\n'))}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Codes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={downloadBackupCodes}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                <Alert>
                  <AlertDescription className="text-sm">
                    • Each backup code can only be used once<br/>
                    • Store them in a secure location<br/>
                    • Use them if you lose access to your authenticator app
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Button 
              onClick={handleComplete}
              disabled={!backupCodesSaved}
              className="w-full"
            >
              Complete Setup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
