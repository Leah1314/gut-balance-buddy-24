
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Heart, AlertCircle, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TestResultsUpload from "./TestResultsUpload";

interface HealthProfileData {
  dietary_restrictions: Record<string, boolean>;
  custom_restrictions: string;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  activity_level: string;
  medical_conditions: string[];
  medications: string[];
  symptoms_notes: string;
}

const HealthProfile = () => {
  const [profileData, setProfileData] = useState<HealthProfileData>({
    dietary_restrictions: {},
    custom_restrictions: "",
    age: null,
    weight_kg: null,
    height_cm: null,
    activity_level: "",
    medical_conditions: [],
    medications: [],
    symptoms_notes: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newCondition, setNewCondition] = useState("");
  const [newMedication, setNewMedication] = useState("");

  const dietaryOptions = [
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'vegan', label: 'Vegan' },
    { id: 'gluten_free', label: 'Gluten-Free' },
    { id: 'dairy_free', label: 'Dairy-Free' },
    { id: 'lactose_intolerant', label: 'Lactose Intolerant' },
    { id: 'nut_allergy', label: 'Nut Allergy' },
    { id: 'shellfish_allergy', label: 'Shellfish Allergy' },
    { id: 'low_carb', label: 'Low Carb' },
    { id: 'keto', label: 'Ketogenic' },
    { id: 'paleo', label: 'Paleo' }
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little to no exercise)' },
    { value: 'light', label: 'Light (light exercise 1-3 days/week)' },
    { value: 'moderate', label: 'Moderate (moderate exercise 3-5 days/week)' },
    { value: 'active', label: 'Active (hard exercise 6-7 days/week)' },
    { value: 'very_active', label: 'Very Active (very hard exercise, physical job)' }
  ];

  useEffect(() => {
    loadHealthProfile();
  }, []);

  const loadHealthProfile = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_health_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Safely parse dietary restrictions from Json to Record<string, boolean>
        const dietaryRestrictions = data.dietary_restrictions && 
          typeof data.dietary_restrictions === 'object' && 
          !Array.isArray(data.dietary_restrictions) 
          ? data.dietary_restrictions as Record<string, boolean>
          : {};

        setProfileData({
          dietary_restrictions: dietaryRestrictions,
          custom_restrictions: data.custom_restrictions || "",
          age: data.age,
          weight_kg: data.weight_kg,
          height_cm: data.height_cm,
          activity_level: data.activity_level || "",
          medical_conditions: data.medical_conditions || [],
          medications: data.medications || [],
          symptoms_notes: data.symptoms_notes || ""
        });
      }
    } catch (error) {
      console.error('Error loading health profile:', error);
      toast({
        variant: "destructive",
        title: "Failed to load health profile"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveHealthProfile = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "default",
          title: "Please log in to save your health profile",
          className: "bg-amber-50 text-gray-800 border-amber-200"
        });
        return;
      }

      const profilePayload = {
        user_id: user.id,
        dietary_restrictions: profileData.dietary_restrictions,
        custom_restrictions: profileData.custom_restrictions,
        age: profileData.age,
        weight_kg: profileData.weight_kg,
        height_cm: profileData.height_cm,
        activity_level: profileData.activity_level || null,
        medical_conditions: profileData.medical_conditions,
        medications: profileData.medications,
        symptoms_notes: profileData.symptoms_notes
      };

      const { error } = await supabase
        .from('user_health_profiles')
        .upsert(profilePayload, { onConflict: 'user_id' });

      if (error) throw error;

      toast({
        variant: "default",
        title: "Health profile saved successfully!",
        className: "bg-green-50 text-green-800 border-green-200"
      });
    } catch (error) {
      console.error('Error saving health profile:', error);
      toast({
        variant: "destructive",
        title: "Failed to save health profile"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateDietaryRestriction = (restrictionId: string, checked: boolean) => {
    setProfileData(prev => ({
      ...prev,
      dietary_restrictions: {
        ...prev.dietary_restrictions,
        [restrictionId]: checked
      }
    }));
  };

  const addMedicalCondition = () => {
    if (newCondition.trim()) {
      setProfileData(prev => ({
        ...prev,
        medical_conditions: [...prev.medical_conditions, newCondition.trim()]
      }));
      setNewCondition("");
    }
  };

  const removeMedicalCondition = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      medical_conditions: prev.medical_conditions.filter((_, i) => i !== index)
    }));
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setProfileData(prev => ({
        ...prev,
        medications: [...prev.medications, newMedication.trim()]
      }));
      setNewMedication("");
    }
  };

  const removeMedication = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Heart className="w-8 h-8 animate-pulse mx-auto mb-2" style={{ color: '#4A7C59' }} />
          <p>Loading your health profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <User className="w-8 h-8" style={{ color: '#4A7C59' }} />
          <h2 className="text-2xl font-semibold" style={{ color: '#2E2E2E' }}>
            Health Profile
          </h2>
        </div>
        <p className="text-base leading-tight" style={{ color: '#2E2E2E', opacity: 0.6 }}>
          Share your health information for personalized recommendations
        </p>
      </div>

      {/* Test Results Upload */}
      <TestResultsUpload />

      {/* Dietary Restrictions */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2" style={{ color: '#2E2E2E' }}>
            <Heart className="w-5 h-5" style={{ color: '#4A7C59' }} />
            Dietary Restrictions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {dietaryOptions.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={profileData.dietary_restrictions[option.id] || false}
                  onCheckedChange={(checked) => updateDietaryRestriction(option.id, checked as boolean)}
                />
                <Label htmlFor={option.id} className="text-sm">{option.label}</Label>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Label htmlFor="custom-restrictions">Other Dietary Restrictions</Label>
            <Textarea
              id="custom-restrictions"
              placeholder="Any other dietary restrictions or food allergies..."
              value={profileData.custom_restrictions}
              onChange={(e) => setProfileData(prev => ({ ...prev, custom_restrictions: e.target.value }))}
              className="mt-1 bg-gray-600 text-white placeholder:text-gray-300 border-gray-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Personal Metrics */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2" style={{ color: '#2E2E2E' }}>
            <User className="w-5 h-5" style={{ color: '#4A7C59' }} />
            Personal Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                placeholder="Years"
                value={profileData.age || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : null }))}
                className="bg-gray-600 text-white placeholder:text-gray-300 border-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                placeholder="kg"
                value={profileData.weight_kg || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, weight_kg: e.target.value ? parseFloat(e.target.value) : null }))}
                className="bg-gray-600 text-white placeholder:text-gray-300 border-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                placeholder="cm"
                value={profileData.height_cm || ""}
                onChange={(e) => setProfileData(prev => ({ ...prev, height_cm: e.target.value ? parseFloat(e.target.value) : null }))}
                className="bg-gray-600 text-white placeholder:text-gray-300 border-gray-500"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="activity-level">Activity Level</Label>
            <Select value={profileData.activity_level} onValueChange={(value) => setProfileData(prev => ({ ...prev, activity_level: value }))}>
              <SelectTrigger className="bg-gray-600 text-white border-gray-500">
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

      {/* Medical Information */}
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2" style={{ color: '#2E2E2E' }}>
            <AlertCircle className="w-5 h-5" style={{ color: '#4A7C59' }} />
            Medical Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Medical Conditions</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add a medical condition"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMedicalCondition()}
                className="bg-gray-600 text-white placeholder:text-gray-300 border-gray-500"
              />
              <Button 
                onClick={addMedicalCondition} 
                size="sm"
                className="bg-gray-600 text-white border-gray-500 hover:bg-gray-700"
              >
                Add
              </Button>
            </div>
            {profileData.medical_conditions.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {profileData.medical_conditions.map((condition, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                  >
                    {condition}
                    <button
                      onClick={() => removeMedicalCondition(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Current Medications</Label>
            <div className="flex gap-2 mt-1">
              <Input
                placeholder="Add a medication"
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                className="bg-gray-600 text-white placeholder:text-gray-300 border-gray-500"
              />
              <Button 
                onClick={addMedication} 
                size="sm"
                className="bg-gray-600 text-white border-gray-500 hover:bg-gray-700"
              >
                Add
              </Button>
            </div>
            {profileData.medications.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {profileData.medications.map((medication, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                  >
                    {medication}
                    <button
                      onClick={() => removeMedication(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="symptoms">Symptoms & Notes</Label>
            <Textarea
              id="symptoms"
              placeholder="Describe any ongoing symptoms, digestive issues, or additional notes..."
              value={profileData.symptoms_notes}
              onChange={(e) => setProfileData(prev => ({ ...prev, symptoms_notes: e.target.value }))}
              className="mt-1 bg-gray-600 text-white placeholder:text-gray-300 border-gray-500"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={saveHealthProfile}
        disabled={isSaving}
        className="w-full h-12 text-white font-medium"
        style={{ backgroundColor: '#4A7C59' }}
        onMouseEnter={(e) => {
          if (!isSaving) {
            e.currentTarget.style.backgroundColor = '#5B8C6B';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSaving) {
            e.currentTarget.style.backgroundColor = '#4A7C59';
          }
        }}
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Saving...' : 'Save Health Profile'}
      </Button>
    </div>
  );
};

export default HealthProfile;
