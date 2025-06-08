
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SecurityMonitor } from '@/services/security/securityMonitor';
import { AdvancedRateLimiter } from '@/services/security/advancedRateLimiter';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export function SecurityDashboard() {
  const [securityData, setSecurityData] = useState({
    score: 100,
    factors: [],
    recentEvents: [],
    rateLimitStatus: {}
  });

  useEffect(() => {
    const updateSecurityData = () => {
      const { score, factors } = SecurityMonitor.getSecurityScore();
      const recentEvents = SecurityMonitor.getRecentEvents(60);
      
      setSecurityData({
        score,
        factors,
        recentEvents,
        rateLimitStatus: {}
      });
    };

    updateSecurityData();
    const interval = setInterval(updateSecurityData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <Shield className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getScoreIcon(securityData.score)}
            Security Overview
          </CardTitle>
          <CardDescription>
            Real-time security monitoring and threat detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Security Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(securityData.score)}`}>
                {securityData.score}/100
              </span>
            </div>
            
            {securityData.factors.length > 0 && (
              <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {securityData.factors.map((factor, index) => (
                      <li key={index} className="text-sm">{factor}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>
            Security events from the last hour
          </CardDescription>
        </CardHeader>
        <CardContent>
          {securityData.recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No security events detected</p>
          ) : (
            <div className="space-y-2">
              {securityData.recentEvents.slice(0, 10).map((event: any, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      event.severity === 'critical' ? 'destructive' :
                      event.severity === 'high' ? 'destructive' :
                      event.severity === 'medium' ? 'secondary' : 'outline'
                    }>
                      {event.severity}
                    </Badge>
                    <span className="text-sm">{event.type.replace('_', ' ')}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Features Active</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Row Level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Rate Limiting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Input Validation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Audit Logging</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Session Management</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Security Headers</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
