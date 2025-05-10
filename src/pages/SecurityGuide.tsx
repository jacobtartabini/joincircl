
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertTriangle, CheckCircle, LockKeyhole, Users, Database, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { displaySecurityAuditResults } from "@/utils/securityAudit";
import { useEffect, useState } from "react";

export default function SecurityGuide() {
  const { toast } = useToast();
  const [auditResults, setAuditResults] = useState<{
    passed: number;
    warnings: number;
    errors: number;
    total: number;
  } | null>(null);
  
  useEffect(() => {
    // Run security audit on component mount
    const results = displaySecurityAuditResults();
    setAuditResults(results);
  }, []);
  
  const runAudit = () => {
    const results = displaySecurityAuditResults();
    setAuditResults(results);
    
    toast({
      title: "Security Audit Completed",
      description: `Passed: ${results.passed}, Warnings: ${results.warnings}, Errors: ${results.errors}`,
      variant: results.errors === 0 ? "default" : "destructive"
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-6 space-y-10">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Security Guide</h1>
        </div>
        <p className="text-muted-foreground">
          This guide explains the security measures implemented in this application
          and provides best practices for keeping your data secure.
        </p>
      </div>

      {/* Security Audit Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle>Security Audit</CardTitle>
            <CardDescription>Run a basic security check on your current session</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid gap-4">
            <Button 
              onClick={runAudit}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Run Security Audit
            </Button>
            
            {auditResults && (
              <Alert variant={auditResults.errors === 0 ? "default" : "destructive"}>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Audit Results</AlertTitle>
                <AlertDescription className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div>Checks Passed:</div>
                    <div className="font-semibold">{auditResults.passed}</div>
                    <div>Warnings Found:</div>
                    <div className="font-semibold">{auditResults.warnings}</div>
                    <div>Errors Found:</div>
                    <div className="font-semibold">{auditResults.errors}</div>
                  </div>
                  <p className="text-sm mt-2">
                    Check the browser console for detailed results.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Authentication Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <LockKeyhole className="h-5 w-5 text-primary" />
            <CardTitle>Authentication Security</CardTitle>
          </div>
          <CardDescription>
            How we keep your login credentials and sessions secure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Implemented Measures</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Secure OAuth2 flows with proper token handling</li>
              <li>Input validation and sanitization for all form fields</li>
              <li>Rate limiting to prevent brute force attacks</li>
              <li>HTTPS-only cookies with secure attributes</li>
              <li>Session validation and automatic expiration</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Best Practices for Users</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Use strong, unique passwords (12+ characters with mixed types)</li>
              <li>Enable two-factor authentication when available</li>
              <li>Never share your authentication tokens or credentials</li>
              <li>Sign out when using shared or public devices</li>
              <li>Be alert for phishing attempts - verify URLs before entering credentials</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Data Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Data Security</CardTitle>
          </div>
          <CardDescription>
            How we protect your data from unauthorized access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Implemented Measures</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Row-Level Security (RLS) in the database</li>
              <li>Input sanitization to prevent XSS and injection attacks</li>
              <li>Data validation before storage and processing</li>
              <li>HTTPS encryption for data in transit</li>
              <li>Minimal data collection principle - we only store what's necessary</li>
            </ul>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Important Note</h4>
                <p className="text-sm text-yellow-800">
                  Be cautious about what personal information you share within the app.
                  Review privacy settings regularly and report any suspicious activity.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Permissions */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>User Permissions</CardTitle>
          </div>
          <CardDescription>
            How access control works in this application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Permission System</h3>
            <p className="text-sm">
              Our application uses a permission-based system to ensure users can only access
              data they own or have been explicitly granted permission to view. This includes:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm mt-2">
              <li>User-specific data isolation</li>
              <li>Role-based access controls</li>
              <li>Permission validation for all data operations</li>
              <li>Multi-level validation (client-side, API, and database)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Technical Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-primary" />
            <CardTitle>Technical Security</CardTitle>
          </div>
          <CardDescription>
            Advanced security measures implemented in our infrastructure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Security Headers</h3>
            <p className="text-sm">
              We implement security headers to protect against common web vulnerabilities:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm mt-2">
              <li>Content Security Policy (CSP) - Controls allowed content sources</li>
              <li>X-Frame-Options - Prevents clickjacking attacks</li>
              <li>X-Content-Type-Options - Prevents MIME-type sniffing</li>
              <li>Referrer Policy - Controls information in the Referer header</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Dependency Security</h3>
            <p className="text-sm">
              We regularly audit and update our dependencies to mitigate security vulnerabilities.
              Our continuous integration process includes security scanning of all dependencies.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground pt-4 pb-10">
        Last security update: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
