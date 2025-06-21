
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useHealthProfile } from '@/hooks/useHealthProfile';
import { useHealthProfileRAG } from '@/hooks/useHealthProfileRAG';

export default function HealthProfile() {
  const { healthProfile, loading, saveHealthProfile } = useHealthProfile();
  const { updateRAGOnProfileSave } = useHealthProfileRAG();
  
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [customRestrictions, setCustomRestrictions] = useState("");
  const [symptomsNotes, setSymptomsNotes] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");

  // Load existing profile data
  useEffect(() => {
    if (healthProfile) {
      setAge(healthProfile.age?.toString() || "");
      setWeight(healthProfile.weight_kg?.toString() || "");
      setHeight(healthProfile.height_cm?.toString() || "");
      setActivityLevel(healthProfile.activity_level || "");
      setMedicalConditions(healthProfile.medical_conditions || []);
      setMedications(healthProfile.medications || []);
      setCustomRestrictions(healthProfile.custom_restrictions || "");
      setSymptomsNotes(healthProfile.symptoms_notes || "");
    }
  }, [healthProfile]);

  const addMedicalCondition = (condition: string) => {
    if (condition.trim() && !medicalConditions.includes(condition.trim())) {
      setMedicalConditions([...medicalConditions, condition.trim()]);
      setNewCondition("");
    }
  };

  const removeMedicalCondition = (conditionToRemove: string) => {
    setMedicalConditions(medicalConditions.filter(condition => condition !== conditionToRemove));
  };

  const addMedication = (medication: string) => {
    if (medication.trim() && !medications.includes(medication.trim())) {
      setMedications([...medications, medication.trim()]);
      setNewMedication("");
    }
  };

  const removeMedication = (medicationToRemove: string) => {
    setMedications(medications.filter(medication => medication !== medicationToRemove));
  };

  const handleSave = async () => {
    const profileData = {
      age: age ? parseInt(age) : undefined,
      weight_kg: weight ? parseFloat(weight) : undefined,
      height_cm: height ? parseFloat(height) : undefined,
      activity_level: activityLevel || undefined,
      medical_conditions: medicalConditions.length > 0 ? medicalConditions : undefined,
      medications: medications.length > 0 ? medications : undefined,
      custom_restrictions: customRestrictions || undefined,
      symptoms_notes: symptomsNotes || undefined,
    };

    const result = await saveHealthProfile(profileData);
    if (result) {
      // Update RAG system with new profile data
      await updateRAGOnProfileSave(profileData);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Basic Info Section */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#2E2E2E' }}>
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="age" style={{ color: '#2E2E2E' }}>Age</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="border"
                style={{ borderColor: '#D3D3D3', backgroundColor: '#FFFFFF', color: '#2E2E2E' }}
                placeholder="Enter your age"
              />
            </div>
            <div>
              <Label htmlFor="weight" style={{ color: '#2E2E2E' }}>Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="border"
                style={{ borderColor: '#D3D3D3', backgroundColor: '#FFFFFF', color: '#2E2E2E' }}
                placeholder="Enter weight in kg"
              />
            </div>
            <div>
              <Label htmlFor="height" style={{ color: '#2E2E2E' }}>Height (cm)</Label>
              <Input
                id="height"
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="border"
                style={{ borderColor: '#D3D3D3', backgroundColor: '#FFFFFF', color: '#2E2E2E' }}
                placeholder="Enter height in cm"
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="activity" style={{ color: '#2E2E2E' }}>Activity Level</Label>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger className="border" style={{ borderColor: '#D3D3D3', backgroundColor: '#FFFFFF', color: '#2E2E2E' }}>
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary</SelectItem>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="very_active">Very Active</SelectItem>
              </SelectContent>
            </Select>
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
                className="flex-1 border"
                style={{ borderColor: '#D3D3D3', backgroundColor: '#FFFFFF', color: '#2E2E2E' }}
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

      {/* Medications Section */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#2E2E2E' }}>
            Current Medications
          </h3>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {medications.map((medication, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="px-3 py-1"
                  style={{ backgroundColor: '#F9F8F4', color: '#2E2E2E', borderColor: '#D3D3D3' }}
                >
                  {medication}
                  <button
                    onClick={() => removeMedication(medication)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                placeholder="Add medication"
                className="flex-1 border"
                style={{ borderColor: '#D3D3D3', backgroundColor: '#FFFFFF', color: '#2E2E2E' }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMedication(newMedication);
                  }
                }}
              />
              <Button
                onClick={() => addMedication(newMedication)}
                size="sm"
                style={{ backgroundColor: '#4A7C59', color: 'white' }}
              >
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dietary & Additional Notes */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#2E2E2E' }}>
            Additional Information
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="restrictions" style={{ color: '#2E2E2E' }}>Dietary Restrictions</Label>
              <Textarea
                id="restrictions"
                value={customRestrictions}
                onChange={(e) => setCustomRestrictions(e.target.value)}
                placeholder="Describe any dietary restrictions or preferences..."
                className="border"
                style={{ borderColor: '#D3D3D3', backgroundColor: '#FFFFFF', color: '#2E2E2E' }}
              />
            </div>
            <div>
              <Label htmlFor="symptoms" style={{ color: '#2E2E2E' }}>Symptoms & Notes</Label>
              <Textarea
                id="symptoms"
                value={symptomsNotes}
                onChange={(e) => setSymptomsNotes(e.target.value)}
                placeholder="Describe any symptoms, concerns, or additional notes..."
                className="border"
                style={{ borderColor: '#D3D3D3', backgroundColor: '#FFFFFF', color: '#2E2E2E' }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="text-center">
        <Button
          onClick={handleSave}
          size="lg"
          style={{ backgroundColor: '#4A7C59', color: 'white' }}
        >
          Save Health Profile
        </Button>
      </div>
    </div>
  );
}
