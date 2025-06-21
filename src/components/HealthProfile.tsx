import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  User, 
  Save, 
  Calendar, 
  Weight, 
  Ruler, 
  Activity,
  AlertCircle,
  Plus,
  X,
  Heart,
  Pill,
  FileText,
  TestTube
} from "lucide-react";
import { toast } from "sonner";
import { useHealthProfile } from "@/hooks/useHealthProfileWithRAG";
import TestResultsUpload from "./TestResultsUpload";

const HealthProfile = () => {
  const { healthProfile, saveHealthProfile, isLoading } = useHealthProfile();

  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [customRestrictions, setCustomRestrictions] = useState("");
  const [symptomsNotes, setSymptomsNotes] = useState("");
  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");
  const [newRestriction, setNewRestriction] = useState("");
  const [recentTests, setRecentTests] = useState<string[]>([]);
  
  // Load existing profile data
  useEffect(() => {
    if (healthProfile) {
      setAge(healthProfile.age?.toString() || "");
      setWeight(healthProfile.weight_kg?.toString() || "");
      setHeight(healthProfile.height_cm?.toString() || "");
      setActivityLevel(healthProfile.activity_level || "");
      setMedicalConditions(healthProfile.medical_conditions || []);
      setMedications(healthProfile.medications || []);
      
      // Handle dietary restrictions
      if (healthProfile.dietary_restrictions && typeof healthProfile.dietary_restrictions === 'object') {
        const restrictions = healthProfile.dietary_restrictions as Record<string, any>;
        const restrictionsList = Object.keys(restrictions).filter(key => restrictions[key]);
        setDietaryRestrictions(restrictionsList);
      }
      
      setCustomRestrictions(healthProfile.custom_restrictions || "");
      setSymptomsNotes(healthProfile.symptoms_notes || "");
      
      // Handle recent tests
      if (healthProfile.recent_tests && Array.isArray(healthProfile.recent_tests)) {
        setRecentTests(healthProfile.recent_tests);
      }
    }
  }, [healthProfile]);

  const addMedicalCondition = () => {
    if (newCondition.trim() && !medicalConditions.includes(newCondition.trim())) {
      setMedicalConditions([...medicalConditions, newCondition.trim()]);
      setNewCondition("");
    }
  };

  const removeMedicalCondition = (condition: string) => {
    setMedicalConditions(medicalConditions.filter(c => c !== condition));
  };

  const addMedication = () => {
    if (newMedication.trim() && !medications.includes(newMedication.trim())) {
      setMedications([...medications, newMedication.trim()]);
      setNewMedication("");
    }
  };

  const removeMedication = (medication: string) => {
    setMedications(medications.filter(m => m !== medication));
  };

  const addDietaryRestriction = () => {
    if (newRestriction.trim() && !dietaryRestrictions.includes(newRestriction.trim())) {
      setDietaryRestrictions([...dietaryRestrictions, newRestriction.trim()]);
      setNewRestriction("");
    }
  };

  const removeDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(dietaryRestrictions.filter(r => r !== restriction));
  };

  const commonConditions = [
    "IBS", "IBD", "Crohn's Disease", "Ulcerative Colitis", "GERD", 
    "Celiac Disease", "Lactose Intolerance", "Food Allergies"
  ];

  const commonRestrictions = [
    "Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Low FODMAP", 
    "Keto", "Paleo", "Mediterranean"
  ];

  const activityLevels = [
    { value: "sedentary", label: "Sedentary (little/no exercise)" },
    { value: "light", label: "Lightly active (light exercise 1-3 days/week)" },
    { value: "moderate", label: "Moderately active (moderate exercise 3-5 days/week)" },
    { value: "very", label: "Very active (hard exercise 6-7 days/week)" },
    { value: "extra", label: "Extra active (very hard exercise/sports & physical job)" }
  ];

  const handleSave = async () => {
    const profileData = {
      age: age ? parseInt(age) : null,
      weight_kg: weight ? parseFloat(weight) : null,
      height_cm: height ? parseFloat(height) : null,
      activity_level: activityLevel || null,
      medical_conditions: medicalConditions.length > 0 ? medicalConditions : null,
      medications: medications.length > 0 ? medications : null,
      dietary_restrictions: dietaryRestrictions.reduce((acc, restriction) => {
        acc[restriction] = true;
        return acc;
      }, {} as Record<string, boolean>),
      custom_restrictions: customRestrictions || null,
      symptoms_notes: symptomsNotes || null,
      recent_tests: recentTests.length > 0 ? recentTests : []
    };

    const success = await saveHealthProfile(profileData);
    if (success) {
      toast.success("Health profile saved successfully!");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Basic Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Age</span>
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center space-x-2">
                <Weight className="w-4 h-4" />
                <span>Weight (kg)</span>
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="Enter weight in kg"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height" className="flex items-center space-x-2">
                <Ruler className="w-4 h-4" />
                <span>Height (cm)</span>
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="Enter height in cm"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Activity Level</span>
            </Label>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select your activity level" />
              </SelectTrigger>
              <SelectContent>
                {activityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Medical Conditions */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>Medical Conditions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {medicalConditions.map((condition, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{condition}</span>
                <button
                  onClick={() => removeMedicalCondition(condition)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Add medical condition"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addMedicalCondition();
                }
              }}
            />
            <Button onClick={addMedicalCondition} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Common Conditions</Label>
            <div className="flex flex-wrap gap-2">
              {commonConditions.map((condition) => (
                <Button
                  key={condition}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!medicalConditions.includes(condition)) {
                      setMedicalConditions([...medicalConditions, condition]);
                    }
                  }}
                  className="text-xs"
                  disabled={medicalConditions.includes(condition)}
                >
                  {condition}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="w-5 h-5 text-green-600" />
            <span>Current Medications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {medications.map((medication, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{medication}</span>
                <button
                  onClick={() => removeMedication(medication)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Add medication"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addMedication();
                }
              }}
            />
            <Button onClick={addMedication} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dietary Restrictions */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-pink-600" />
            <span>Dietary Preferences & Restrictions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {dietaryRestrictions.map((restriction, index) => (
              <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{restriction}</span>
                <button
                  onClick={() => removeDietaryRestriction(restriction)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Add dietary restriction"
              value={newRestriction}
              onChange={(e) => setNewRestriction(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addDietaryRestriction();
                }
              }}
            />
            <Button onClick={addDietaryRestriction} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Common Restrictions</Label>
            <div className="flex flex-wrap gap-2">
              {commonRestrictions.map((restriction) => (
                <Button
                  key={restriction}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!dietaryRestrictions.includes(restriction)) {
                      setDietaryRestrictions([...dietaryRestrictions, restriction]);
                    }
                  }}
                  className="text-xs"
                  disabled={dietaryRestrictions.includes(restriction)}
                >
                  {restriction}
                </Button>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <Label htmlFor="customRestrictions">Additional Notes</Label>
            <Textarea
              id="customRestrictions"
              placeholder="Any additional dietary restrictions or preferences..."
              value={customRestrictions}
              onChange={(e) => setCustomRestrictions(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Symptoms & Notes */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-orange-600" />
            <span>Symptoms & Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="symptomsNotes">Current Symptoms or Concerns</Label>
            <Textarea
              id="symptomsNotes"
              placeholder="Describe any symptoms, patterns, or concerns you've noticed..."
              value={symptomsNotes}
              onChange={(e) => setSymptomsNotes(e.target.value)}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Results Upload */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TestTube className="w-5 h-5 text-purple-600" />
            <span>Recent Test Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TestResultsUpload 
            onResultsUpdate={(results) => setRecentTests(results)}
            existingResults={recentTests}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0 shadow-lg">
        <CardContent className="p-6 text-center">
          <Button 
            onClick={handleSave}
            disabled={isLoading}
            className="px-8 py-3 text-white font-medium transition-colors"
            style={{
              backgroundColor: '#4A7C59'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#5B8C6B';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#4A7C59';
              }
            }}
          >
            <Save className="w-4 h-4 mr-2 stroke-2" />
            {isLoading ? "Saving..." : "Save Health Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthProfile;
