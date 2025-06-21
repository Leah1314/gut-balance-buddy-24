import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function HealthProfile() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState("");

  const removeMedicalCondition = (conditionToRemove: string) => {
    setMedicalConditions(medicalConditions.filter(condition => condition !== conditionToRemove));
  };

  const addMedicalCondition = (condition: string) => {
    if (condition.trim() && !medicalConditions.includes(condition.trim())) {
      setMedicalConditions([...medicalConditions, condition.trim()]);
      setNewCondition("");
    }
  };

  const handleSave = () => {
    alert('Profile saved!');
  };

  return (
    <div className="space-y-6">
      {/* Basic Info Section */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#2E2E2E' }}>
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" style={{ color: '#2E2E2E' }}>Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border"
                style={{ borderColor: '#D3D3D3' }}
              />
            </div>
            <div>
              <Label htmlFor="age" style={{ color: '#2E2E2E' }}>Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="border"
                style={{ borderColor: '#D3D3D3' }}
              />
            </div>
            <div>
              <Label htmlFor="gender" style={{ color: '#2E2E2E' }}>Gender</Label>
              <Input
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="border"
                style={{ borderColor: '#D3D3D3' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Conditions Section */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#2E2E2E' }}>
            Medical Conditions
          </h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {medicalConditions.map((condition, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="px-3 py-1"
                  style={{ backgroundColor: '#F9F8F4', color: '#2E2E2E', borderColor: '#D3D3D3' }}
                >
                  {condition}
                  <button
                    onClick={() => removeMedicalCondition(condition)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="Add medical condition"
                className="flex-1"
                style={{ borderColor: '#D3D3D3' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMedicalCondition(newCondition);
                  }
                }}
              />
              <Button
                onClick={() => addMedicalCondition(newCondition)}
                size="sm"
                style={{ backgroundColor: '#4A7C59', color: 'white' }}
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="text-center">
        <Button
          onClick={handleSave}
          style={{ backgroundColor: '#4A7C59', color: 'white' }}
        >
          Save Profile
        </Button>
      </div>
    </div>
  );
}
