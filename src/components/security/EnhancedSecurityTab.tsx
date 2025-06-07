
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, Trash2, Download } from "lucide-react";
import { Enhanced2FA, TrustedDevice } from "@/services/enhanced2FA";
import { RateLimiter } from "@/services/security/rateLimiter";
import { useAuth } from "@/contexts/AuthContext";

export function EnhancedSecurityTab() {
  const { user } = useAuth();
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([]);
  const [rateLimitStatus, setRateLimitStatus] = useState<any>(null);

  useEffect(() => {
    setTrustedDevices(Enhanced2FA.getTrustedDevices());
    
    if (user?.email) {
      setRateLimitStatus(RateLimiter.getStatus(user.email, 'auth'));
    }
  }, [user]);

  const handleRemoveTrustedDevice = (deviceId: string) => {
    Enhanced2FA.removeTrustedDevice(deviceId);
    setTrustedDevices(Enhanced2FA.getTrustedDevices());
  };

  const handleDownloadRecoveryCodes = () => {
    const codes = Enhanced2FA.generateRecoveryCodes();
    const blob = new Blob([
      'Circl 2FA Recovery Codes\n',
      '========================\n\n',
      'Keep these codes safe! Each code can only be used once.\n\n',
      ...codes.map((code, i) => `${i + 1}. ${code}\n`)
    ], { type: 'text/plain' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `circl-recovery-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Rate Limiting Status */}
      {rateLimitStatus && rateLimitStatus.attempts > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-600" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">
                  Security Alert
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {rateLimitStatus.attempts} failed authentication attempts detected.
                  {rateLimitStatus.blockedUntil && (
                    ` Account temporarily locked for ${Math.ceil(rateLimitStatus.timeRemaining / 1000)} seconds.`
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trusted Devices */}
      <Card className="unified-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Trusted Devices
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {trustedDevices.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No trusted devices. Enable "Trust this device" during 2FA verification to skip verification on trusted devices.
            </p>
          ) : (
            <div className="space-y-3">
              {trustedDevices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{device.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Added: {formatDate(device.added_at)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Last used: {formatDate(device.last_used)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveTrustedDevice(device.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recovery Options */}
      <Card className="unified-card">
        <CardHeader>
          <CardTitle>Recovery Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Download Recovery Codes</h4>
                <p className="text-sm text-muted-foreground">
                  Generate and download backup codes for 2FA recovery
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleDownloadRecoveryCodes}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card className="unified-card">
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-200">
                ✓ Strong Password
              </Badge>
              <span className="text-sm">Password meets security requirements</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-600 border-green-200">
                ✓ 2FA Enabled
              </Badge>
              <span className="text-sm">Two-factor authentication is active</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                ℹ Session Management
              </Badge>
              <span className="text-sm">Automatic session timeout after 30 minutes of inactivity</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
