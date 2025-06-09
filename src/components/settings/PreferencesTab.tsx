
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PreferencesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">User preferences will be implemented here.</p>
      </CardContent>
    </Card>
  );
}
