
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

export const DateTimeHeader = () => {
  const now = new Date();
  const dateString = now.toLocaleDateString();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="font-medium">{dateString}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-medium">{timeString}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
