
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Mail, 
  MessageCircle, 
  Calendar, 
  Users, 
  Settings,
  Clock,
  CheckCircle,
  Info
} from "lucide-react";
import { makeService, AutomationPreferences } from "@/services/makeService";
import { enhancedMakeService } from "@/services/enhancedMakeService";
import { emailService } from "@/services/emailService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function EnhancedAutomationTab() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<AutomationPreferences>({
    userId: user?.id || '',
    reconnectReminderDays: 30,
    weeklyDigestEnabled: true,
    preferredCommunicationChannel: 'email',
    digestDay: 'sunday',
    automationsEnabled: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [emailHistory, setEmailHistory] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
      loadEmailHistory();
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    setIsLoading(true);
    try {
      const userPrefs = await makeService.getUserAutomationPreferences(user!.id);
      if (userPrefs) {
        setPreferences(userPrefs);
      }
    } catch (error) {
      console.error('Error loading automation preferences:', error);
      toast.error('Failed to load automation preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmailHistory = async () => {
    try {
      const history = await emailService.getEmailHistory(user!.id, 10);
      setEmailHistory(history);
    } catch (error) {
      console.error('Error loading email history:', error);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const success = await makeService.updateAutomationPreferences(preferences);
      if (success) {
        toast.success('Automation preferences saved successfully');
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const testEmailAutomation = async (type: 'reconnect' | 'digest' | 'onboarding') => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      let success = false;
      
      switch (type) {
        case 'reconnect':
          success = await enhancedMakeService.scheduleReconnectRemindersWithEmail(user.id);
          break;
        case 'digest':
          success = await enhancedMakeService.generateWeeklyDigestWithEmail(user.id);
          break;
        case 'onboarding':
          success = await enhancedMakeService.sendOnboardingEmail(user.id);
          break;
      }

      if (success) {
        toast.success(`${type} email sent successfully`);
        loadEmailHistory(); // Refresh email history
      } else {
        toast.error(`Failed to send ${type} email`);
      }
    } catch (error) {
      console.error(`Error testing ${type} email:`, error);
      toast.error(`Failed to test ${type} email`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !preferences.userId) {
    return <div className="flex items-center justify-center p-8">Loading automation settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Email & Automation Settings</h2>
        <p className="text-muted-foreground">
          Configure powerful email automations powered by Resend and Make.com
        </p>
      </div>

      {/* Integration Status Alert */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Resend email integration is active. Make.com automation is connected. Your emails will be delivered reliably.
        </AlertDescription>
      </Alert>

      {/* Master Control */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Mail className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Email Automation Control</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="automation-enabled">Enable All Email Automations</Label>
              <p className="text-sm text-muted-foreground">
                Master switch for all automated emails and notifications
              </p>
            </div>
            <Switch
              id="automation-enabled"
              checked={preferences.automationsEnabled}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, automationsEnabled: checked }))
              }
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Badge variant={preferences.automationsEnabled ? "default" : "secondary"}>
              {preferences.automationsEnabled ? "Active" : "Inactive"}
            </Badge>
            <Badge variant="outline">Resend Integration</Badge>
            <Badge variant="outline">Make.com Automation</Badge>
            <Badge variant="outline">AI-Powered Content</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Email Types */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Reconnect Reminders */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Reconnect Reminders</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              AI-powered email reminders with personalized message suggestions
            </p>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Includes dynamic content, last contact dates, and AI-generated reconnection suggestions
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              onClick={() => testEmailAutomation('reconnect')}
              disabled={isLoading || !preferences.automationsEnabled}
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              Send Test Reconnect Email
            </Button>
          </CardContent>
        </Card>

        {/* Weekly Digest */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Weekly Digest</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Personalized weekly summary with activity stats and recommendations
            </p>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Includes interaction summaries, network stats, and actionable insights
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              onClick={() => testEmailAutomation('digest')}
              disabled={isLoading || !preferences.weeklyDigestEnabled}
              className="w-full"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Send Test Weekly Digest
            </Button>
          </CardContent>
        </Card>

        {/* Onboarding Email */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Welcome Onboarding</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Welcome email introducing Circl features and getting started guide
            </p>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Automatically sent to new users upon successful sign-up
              </AlertDescription>
            </Alert>

            <Button
              variant="outline"
              onClick={() => testEmailAutomation('onboarding')}
              disabled={isLoading}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Test Welcome Email
            </Button>
          </CardContent>
        </Card>

        {/* Security Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Security Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Important security alerts for login events and account changes
            </p>
            
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Automatically triggered for logins, password changes, and security events
              </AlertDescription>
            </Alert>

            <Badge variant="outline" className="w-full justify-center py-2">
              Automatically Triggered
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Email History */}
      {emailHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Email Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {emailHistory.slice(0, 5).map((email) => (
                <div key={email.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant={email.status === 'sent' ? 'default' : 'destructive'}>
                      {email.status}
                    </Badge>
                    <span className="text-sm">{email.email_type.replace('_', ' ')}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(email.sent_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={isSaving}>
          {isSaving ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Settings className="h-4 w-4 mr-2" />
              Save Email Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
