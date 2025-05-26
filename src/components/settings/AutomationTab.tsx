
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Zap, 
  Mail, 
  MessageCircle, 
  Calendar, 
  Users, 
  Settings,
  Clock,
  Smartphone,
  Globe,
  Brain,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { makeService, AutomationPreferences } from "@/services/makeService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function AutomationTab() {
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
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
      loadSuggestions();
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

  const loadSuggestions = async () => {
    try {
      const automationSuggestions = await makeService.getAutomationSuggestions(user!.id);
      setSuggestions(automationSuggestions);
    } catch (error) {
      console.error('Error loading suggestions:', error);
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

  const testAutomation = async (type: 'reconnect' | 'digest' | 'sync') => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      let success = false;
      
      switch (type) {
        case 'reconnect':
          success = await makeService.scheduleReconnectReminders(user.id);
          break;
        case 'digest':
          success = await makeService.generateWeeklyDigest(user.id);
          break;
        case 'sync':
          success = await makeService.syncContactsToExternal(user.id, 'google');
          break;
      }

      if (success) {
        toast.success(`${type} automation triggered successfully`);
        if (type === 'reconnect') {
          loadSuggestions(); // Refresh suggestions after reconnect automation
        }
      } else {
        toast.error(`Failed to trigger ${type} automation`);
      }
    } catch (error) {
      console.error(`Error testing ${type} automation:`, error);
      toast.error(`Failed to test ${type} automation`);
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleRecurringAutomations = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const success = await makeService.scheduleRecurringAutomations(user.id);
      if (success) {
        toast.success('Recurring automations scheduled successfully');
        loadSuggestions();
      } else {
        toast.error('Failed to schedule recurring automations');
      }
    } catch (error) {
      console.error('Error scheduling recurring automations:', error);
      toast.error('Failed to schedule recurring automations');
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
        <h2 className="text-xl font-semibold mb-2">Make.com Automation Settings</h2>
        <p className="text-muted-foreground">
          Configure powerful Make.com automations to enhance your relationship management
        </p>
      </div>

      {/* Integration Status Alert */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Make.com integration is active and connected. Your automations will run securely through Make's platform.
        </AlertDescription>
      </Alert>

      {/* Main Automation Toggle */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Automation Master Control</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="automation-enabled">Enable All Automations</Label>
              <p className="text-sm text-muted-foreground">
                Master switch for all Make.com automation workflows
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
            <Badge variant="outline">Make.com Integration</Badge>
            <Badge variant="outline">OpenRouter AI</Badge>
          </div>

          <Button
            onClick={scheduleRecurringAutomations}
            disabled={isLoading || !preferences.automationsEnabled}
            className="w-full"
          >
            <Brain className="h-4 w-4 mr-2" />
            Run All Automations Now
          </Button>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>AI Automation Suggestions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestions.slice(0, 3).map((suggestion) => (
              <div key={suggestion.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">
                      {suggestion.urgency} priority
                    </Badge>
                    <p className="text-sm">{suggestion.suggestion}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => makeService.markSuggestionAsRead(suggestion.id)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Reconnect Reminders */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Smart Reconnect Reminders</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Reminder Threshold (Days)</Label>
            <Input
              type="number"
              value={preferences.reconnectReminderDays}
              onChange={(e) =>
                setPreferences(prev => ({ 
                  ...prev, 
                  reconnectReminderDays: parseInt(e.target.value) || 30 
                }))
              }
              min="1"
              max="365"
            />
            <p className="text-xs text-muted-foreground">
              Get AI-powered reminders for contacts you haven't spoken to in this many days
            </p>
          </div>

          <div className="space-y-2">
            <Label>Communication Channel</Label>
            <Select
              value={preferences.preferredCommunicationChannel}
              onValueChange={(value: 'email' | 'sms' | 'in-app') =>
                setPreferences(prev => ({ ...prev, preferredCommunicationChannel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email (via Gmail/Outlook)
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    SMS (via Twilio)
                  </div>
                </SelectItem>
                <SelectItem value="in-app">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    In-App Notification
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Uses OpenRouter AI to generate personalized reconnection messages based on your relationship history
            </AlertDescription>
          </Alert>

          <Button
            variant="outline"
            onClick={() => testAutomation('reconnect')}
            disabled={isLoading || !preferences.automationsEnabled}
          >
            <Users className="h-4 w-4 mr-2" />
            Test Reconnect Automation
          </Button>
        </CardContent>
      </Card>

      {/* Weekly Digest */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>AI-Powered Weekly Digest</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="weekly-digest">Enable Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive AI-generated insights about your network activity and suggestions
              </p>
            </div>
            <Switch
              id="weekly-digest"
              checked={preferences.weeklyDigestEnabled}
              onCheckedChange={(checked) =>
                setPreferences(prev => ({ ...prev, weeklyDigestEnabled: checked }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Digest Day</Label>
            <Select
              value={preferences.digestDay}
              onValueChange={(value: 'sunday' | 'monday') =>
                setPreferences(prev => ({ ...prev, digestDay: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sunday">Sunday Morning</SelectItem>
                <SelectItem value="monday">Monday Morning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Weekly digest includes relationship analytics, celebration reminders, and personalized action items
            </AlertDescription>
          </Alert>

          <Button
            variant="outline"
            onClick={() => testAutomation('digest')}
            disabled={isLoading || !preferences.weeklyDigestEnabled}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Generate Test Digest
          </Button>
        </CardContent>
      </Card>

      {/* Contact Sync */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Contact Synchronization</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sync your Circl contacts with external platforms via Make.com automations
          </p>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Supports Google Contacts, Outlook, CRM platforms, and calendar event creation for scheduled reconnects
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => testAutomation('sync')}
              disabled={isLoading || !preferences.automationsEnabled}
            >
              <Globe className="h-4 w-4 mr-2" />
              Test Google Sync
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Future Automation Features */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>Advanced Automation Features</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">Birthday Reminders</h4>
              <p className="text-xs text-muted-foreground">Automatic celebration alerts</p>
              <Badge variant="outline" className="mt-2">Coming Soon</Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">Meeting Scheduling</h4>
              <p className="text-xs text-muted-foreground">Calendar integration for reconnects</p>
              <Badge variant="outline" className="mt-2">Coming Soon</Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">CRM Integration</h4>
              <p className="text-xs text-muted-foreground">Salesforce, HubSpot sync</p>
              <Badge variant="outline" className="mt-2">Coming Soon</Badge>
            </div>
            <div className="p-3 border rounded-lg">
              <h4 className="font-medium mb-1">Social Media Sync</h4>
              <p className="text-xs text-muted-foreground">LinkedIn, Twitter updates</p>
              <Badge variant="outline" className="mt-2">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

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
              Save Automation Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
