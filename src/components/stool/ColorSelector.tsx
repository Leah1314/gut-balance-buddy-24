
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ColorSelectorProps {
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
}

export const ColorSelector = ({ selectedColor, onColorSelect }: ColorSelectorProps) => {
  const colors = [
    { value: "brown", label: "Brown", bgColor: "bg-amber-700", description: "Normal" },
    { value: "green", label: "Green", bgColor: "bg-green-600", description: "Fast transit" },
    { value: "yellow", label: "Yellow", bgColor: "bg-yellow-500", description: "Fat malabsorption" },
    { value: "red", label: "Red", bgColor: "bg-red-600", description: "Blood present" },
    { value: "black", label: "Black", bgColor: "bg-gray-900", description: "Upper GI bleeding" },
    { value: "pale", label: "Pale/Clay", bgColor: "bg-gray-300", description: "Bile duct issue" }
  ];

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Color</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {colors.map((item) => (
            <div
              key={item.value}
              onClick={() => onColorSelect(item.value)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-colors text-center ${
                selectedColor === item.value
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`w-8 h-8 ${item.bgColor} rounded-full mx-auto mb-2`}></div>
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-xs text-gray-600">{item.description}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
