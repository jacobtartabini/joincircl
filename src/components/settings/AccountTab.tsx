
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Account management options will be implemented here.</p>
      </CardContent>
    </Card>
  );
}
