import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Eye, Activity, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface SecurityDashboardData {
  totalEvents: number;
  eventsByType: Record<string, number>;
  timeline: Array<{ time: string; count: number }>;
  recentEvents: Array<{
    id: string;
    type: string;
    occurred_at: string;
    details: any;
    client_ip?: string;
  }>;
}

interface SecurityAnalysis {
  riskLevel: 'low' | 'medium' | 'high';
  patterns: string[];
  recommendations: string[];
  eventCounts: Record<string, number>;
}

export function SecurityDashboard() {
  const [dashboardData, setDashboardData] = useState<SecurityDashboardData | null>(null);
  const [analysis, setAnalysis] = useState<SecurityAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  useEffect(() => {
    fetchSecurityData();
  }, [timeRange]);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard data
      const { data: dashboardResponse, error: dashboardError } = await supabase.functions
        .invoke('security-monitor', {
          body: { action: 'dashboard', timeRange }
        });

      if (dashboardError) {
        console.error('Error fetching dashboard data:', dashboardError);
      } else {
        setDashboardData(dashboardResponse);
      }

      // Fetch security analysis
      const { data: analysisResponse, error: analysisError } = await supabase.functions
        .invoke('security-monitor', {
          body: { action: 'analyze_patterns' }
        });

      if (analysisError) {
        console.error('Error fetching analysis:', analysisError);
      } else {
        setAnalysis(analysisResponse);
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'failed_login': return <AlertTriangle className="w-4 h-4" />;
      case 'rate_limit_exceeded': return <TrendingUp className="w-4 h-4" />;
      case 'unauthorized_access': return <Shield className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const formatEventType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor your account security and activity</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as '1h' | '24h' | '7d')}>
            <TabsList>
              <TabsTrigger value="1h">1 Hour</TabsTrigger>
              <TabsTrigger value="24h">24 Hours</TabsTrigger>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={fetchSecurityData} variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Risk Assessment */}
      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Risk Assessment
            </CardTitle>
            <CardDescription>
              Current security risk level and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <Badge variant={getRiskBadgeVariant(analysis.riskLevel)} className="text-sm">
                {analysis.riskLevel.toUpperCase()} RISK
              </Badge>
              <span className="text-sm text-muted-foreground">
                Based on activity in the last 24 hours
              </span>
            </div>

            {analysis.patterns.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Detected Patterns</h4>
                <ul className="space-y-1">
                  {analysis.patterns.map((pattern, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recommendations</h4>
                <ul className="space-y-1">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <Shield className="w-3 h-3" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Events Overview */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                In the last {timeRange === '1h' ? 'hour' : timeRange === '24h' ? '24 hours' : '7 days'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Event Types</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(dashboardData.eventsByType).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Different event types detected
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.recentEvents.length > 0 ? 'Recent' : 'None'}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.recentEvents.length > 0 
                  ? new Date(dashboardData.recentEvents[0].occurred_at).toLocaleTimeString()
                  : 'No recent activity'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Event Details */}
      <Tabs defaultValue="types" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="types">Event Types</TabsTrigger>
          <TabsTrigger value="recent">Recent Events</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events by Type</CardTitle>
              <CardDescription>
                Breakdown of security events in the selected time range
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData && Object.keys(dashboardData.eventsByType).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(dashboardData.eventsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getEventTypeIcon(type)}
                        <span className="font-medium">{formatEventType(type)}</span>
                      </div>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No security events in the selected time range
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Latest security events and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardData && dashboardData.recentEvents.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.recentEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      {getEventTypeIcon(event.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{formatEventType(event.type)}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.occurred_at).toLocaleString()}
                          </span>
                        </div>
                        {event.client_ip && (
                          <p className="text-sm text-muted-foreground">
                            IP: {event.client_ip}
                          </p>
                        )}
                        {event.details && Object.keys(event.details).length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {JSON.stringify(event.details, null, 2)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No recent security events
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}