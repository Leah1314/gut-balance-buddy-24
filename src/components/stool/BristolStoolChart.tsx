
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BristolStoolChartProps {
  selectedType: number | null;
  onTypeSelect: (type: number) => void;
}

export const BristolStoolChart = ({ selectedType, onTypeSelect }: BristolStoolChartProps) => {
  const bristolTypes = [
    { type: 1, description: "Separate hard lumps", severity: "Severe constipation" },
    { type: 2, description: "Sausage-shaped but lumpy", severity: "Mild constipation" },
    { type: 3, description: "Like a sausage with cracks", severity: "Normal" },
    { type: 4, description: "Smooth, soft sausage", severity: "Normal" },
    { type: 5, description: "Soft blobs with clear edges", severity: "Lacking fiber" },
    { type: 6, description: "Fluffy pieces with ragged edges", severity: "Mild diarrhea" },
    { type: 7, description: "Watery, no solid pieces", severity: "Severe diarrhea" }
  ];

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Bristol Stool Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {bristolTypes.map((item) => (
            <div
              key={item.type}
              onClick={() => onTypeSelect(item.type)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedType === item.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">Type {item.type}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {item.severity}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
