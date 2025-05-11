
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionStrength } from "@/types/contact";
import { ArrowUpCircle, MinusCircle, ArrowDownCircle, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ConnectionInsightsProps {
  strength?: ConnectionStrength;
}

export default function ConnectionInsights({ strength }: ConnectionInsightsProps) {
  // If no strength data is provided, show a message
  if (!strength) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Connection Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No connection data available. Add interactions to generate insights.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">Connection Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection Strength</span>
            <StrengthBadge strength={strength.level} />
          </div>
          
          <Progress value={Math.min(100, Math.max(10, strength.score))} className={`h-2.5 ${getStrengthProgressClass(strength.level)}`} />
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Suggestions</h4>
            <ul className="space-y-2">
              {strength.suggestions.slice(0, 3).map((suggestion, index) => (
                <li key={index} className="text-sm flex">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StrengthBadge({ strength }: { strength: 'weak' | 'moderate' | 'strong' | 'very-strong' }) {
  if (strength === 'very-strong') {
    return (
      <div className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full text-xs font-medium">
        <CheckCircle size={14} className="mr-1" />
        Very Strong
      </div>
    );
  }
  
  if (strength === 'strong') {
    return (
      <div className="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-medium">
        <ArrowUpCircle size={14} className="mr-1" />
        Strong
      </div>
    );
  }
  
  if (strength === 'moderate') {
    return (
      <div className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-medium">
        <MinusCircle size={14} className="mr-1" />
        Moderate
      </div>
    );
  }
  
  return (
    <div className="flex items-center text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-medium">
      <ArrowDownCircle size={14} className="mr-1" />
      Needs Work
    </div>
  );
}

function getStrengthProgressClass(strength: 'weak' | 'moderate' | 'strong' | 'very-strong') {
  switch (strength) {
    case 'very-strong': return '[&>div]:bg-emerald-700';
    case 'strong': return '[&>div]:bg-green-500';
    case 'moderate': return '[&>div]:bg-amber-500';
    case 'weak': return '[&>div]:bg-red-500';
    default: return '[&>div]:bg-gray-500';
  }
}
