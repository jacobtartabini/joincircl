
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

export function ToolCard({ icon, title, description, onClick }: ToolCardProps) {
  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-gray-100 rounded-2xl flex flex-col items-start gap-4 h-full">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600 mb-2">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Button variant="outline" className="mt-2 rounded-full border-gray-200" onClick={onClick}>
        Open
      </Button>
    </Card>
  );
}
