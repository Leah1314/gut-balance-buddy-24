
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ConsistencySelectorProps {
  selectedConsistency: string | null;
  onConsistencySelect: (consistency: string) => void;
}

export const ConsistencySelector = ({ selectedConsistency, onConsistencySelect }: ConsistencySelectorProps) => {
  const consistencies = [
    { value: "hard", label: "Hard", description: "Difficult to pass" },
    { value: "normal", label: "Normal", description: "Easy to pass" },
    { value: "soft", label: "Soft", description: "Very easy to pass" },
    { value: "watery", label: "Watery", description: "Liquid consistency" }
  ];

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Consistency</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {consistencies.map((item) => (
            <div
              key={item.value}
              onClick={() => onConsistencySelect(item.value)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors text-center ${
                selectedConsistency === item.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="font-semibold">{item.label}</div>
              <div className="text-sm text-gray-600">{item.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
