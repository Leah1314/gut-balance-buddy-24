
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Save,
  Calendar,
  Clock,
  Droplets
} from "lucide-react";
import { toast } from "sonner";

const StoolTracker = () => {
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedConsistency, setSelectedConsistency] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const bristolTypes = [
    { id: 1, name: "Type 1", description: "Separate hard lumps" },
    { id: 2, name: "Type 2", description: "Sausage-shaped but lumpy" },
    { id: 3, name: "Type 3", description: "Like a sausage with cracks" },
    { id: 4, name: "Type 4", description: "Smooth, soft sausage" },
    { id: 5, name: "Type 5", description: "Soft blobs with clear edges" },
    { id: 6, name: "Type 6", description: "Fluffy pieces with ragged edges" },
    { id: 7, name: "Type 7", description: "Watery, no solid pieces" }
  ];

  const consistencies = ["Very Hard", "Hard", "Normal", "Soft", "Very Soft", "Liquid"];
  const colors = ["Brown", "Dark Brown", "Light Brown", "Yellow", "Green", "Black", "Red"];

  const handleSave = () => {
    if (!selectedType || !selectedConsistency || !selectedColor) {
      toast.error("Please fill in all fields");
      return;
    }

    // Here you would save to database
    toast.success("Stool entry saved successfully!");
    
    // Reset form
    setSelectedType(null);
    setSelectedConsistency(null);
    setSelectedColor(null);
    setNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Date/Time Header */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 stroke-2" style={{ color: '#4A7C59' }} />
              <span className="font-medium" style={{ color: '#2E2E2E' }}>
                {new Date().toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 stroke-2" style={{ color: '#4A7C59' }} />
              <span className="font-medium" style={{ color: '#2E2E2E' }}>
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bristol Stool Chart */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4" style={{ color: '#2E2E2E' }}>Bristol Stool Chart</h3>
          <div className="grid grid-cols-1 gap-3">
            {bristolTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`p-4 rounded-lg border text-left transition-all duration-200 ${
                  selectedType === type.id ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: selectedType === type.id ? '#F9F8F4' : '#FFFFFF',
                  borderColor: selectedType === type.id ? '#4A7C59' : '#D3D3D3',
                  '--tw-ring-color': '#4A7C59'
                } as React.CSSProperties}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium" style={{ color: '#2E2E2E' }}>{type.name}</div>
                    <div className="text-sm mt-1" style={{ color: '#2E2E2E', opacity: 0.6 }}>
                      {type.description}
                    </div>
                  </div>
                  {selectedType === type.id && (
                    <Badge className="text-white" style={{ backgroundColor: '#4A7C59' }}>
                      Selected
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Consistency */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4" style={{ color: '#2E2E2E' }}>Consistency</h3>
          <div className="flex flex-wrap gap-2">
            {consistencies.map((consistency) => (
              <button
                key={consistency}
                onClick={() => setSelectedConsistency(consistency)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
                  selectedConsistency === consistency ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: selectedConsistency === consistency ? '#4A7C59' : 'transparent',
                  borderColor: selectedConsistency === consistency ? '#4A7C59' : '#D3D3D3',
                  color: selectedConsistency === consistency ? '#FFFFFF' : '#2E2E2E'
                }}
                onMouseEnter={(e) => {
                  if (selectedConsistency === consistency) {
                    e.currentTarget.style.backgroundColor = '#5B8C6B';
                  } else {
                    e.currentTarget.style.backgroundColor = '#F9F8F4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedConsistency === consistency) {
                    e.currentTarget.style.backgroundColor = '#4A7C59';
                  } else {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {consistency}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4" style={{ color: '#2E2E2E' }}>Color</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
                  selectedColor === color ? 'text-white' : ''
                }`}
                style={{
                  backgroundColor: selectedColor === color ? '#4A7C59' : 'transparent',
                  borderColor: selectedColor === color ? '#4A7C59' : '#D3D3D3',
                  color: selectedColor === color ? '#FFFFFF' : '#2E2E2E'
                }}
                onMouseEnter={(e) => {
                  if (selectedColor === color) {
                    e.currentTarget.style.backgroundColor = '#5B8C6B';
                  } else {
                    e.currentTarget.style.backgroundColor = '#F9F8F4';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedColor === color) {
                    e.currentTarget.style.backgroundColor = '#4A7C59';
                  } else {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {color}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4" style={{ color: '#2E2E2E' }}>Additional Notes (Optional)</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any symptoms, medications, or observations..."
            className="w-full h-24 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-offset-2"
            style={{
              borderColor: '#D3D3D3',
              '--tw-ring-color': '#4A7C59'
            } as React.CSSProperties}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="text-center pt-4">
        <Button 
          onClick={handleSave}
          className="px-8 py-3 text-white font-medium transition-colors"
          style={{
            backgroundColor: '#4A7C59'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5B8C6B';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4A7C59';
          }}
        >
          <Save className="w-4 h-4 mr-2 stroke-2" />
          Save Entry
        </Button>
      </div>
    </div>
  );
};

export default StoolTracker;
