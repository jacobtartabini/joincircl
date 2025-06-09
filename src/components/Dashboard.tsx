
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export const Dashboard = () => {
  const { user, profile } = useAuth();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Welcome Back!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Hello {profile?.full_name || user?.email}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You have 0 projects
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No recent activity
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
