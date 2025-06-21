
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

interface NotesSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const NotesSection = ({ notes, onNotesChange }: NotesSectionProps) => {
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Notes (Optional)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add any additional notes about symptoms, diet, or other observations..."
          className="min-h-24 resize-none"
        />
      </CardContent>
    </Card>
  );
};
