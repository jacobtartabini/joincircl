
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConnectionStrength } from "@/types/contact";
import { ArrowUpCircle, MinusCircle, ArrowDownCircle } from "lucide-react";

interface ConnectionInsightsProps {
  strength: ConnectionStrength;
}

export default function ConnectionInsights({ strength }: ConnectionInsightsProps) {
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
          
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${getStrengthColor(strength.level)}`} 
              style={{ width: `${Math.min(100, Math.max(10, strength.score))}%` }}
            ></div>
          </div>
          
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

function StrengthBadge({ strength }: { strength: 'weak' | 'moderate' | 'strong' }) {
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

function getStrengthColor(strength: 'weak' | 'moderate' | 'strong') {
  switch (strength) {
    case 'strong': return 'bg-green-500';
    case 'moderate': return 'bg-amber-500';
    case 'weak': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
}
