
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const SecurityTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
          <CardDescription>
            Manage your account security settings and view security information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Lock className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="font-medium">Security Guide</h4>
                  <p className="text-sm text-muted-foreground">
                    Learn about best practices and security features
                  </p>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link to="/security">
                  View Guide
                </Link>
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium">Login Activity</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor recent login attempts and sessions
                  </p>
                </div>
              </div>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <Button variant="outline" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTab;
