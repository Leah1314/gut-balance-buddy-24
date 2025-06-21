import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Heart, Scale, Ruler, Calendar, AlertCircle, Plus, X, Save, FileText } from "lucide-react";
import { useHealthProfile } from "@/hooks/useHealthProfileWithRAG";
import { toast } from "sonner";
import TestResultsUpload from "./TestResultsUpload";
const HealthProfile = () => {
  const {
    healthProfile: profile,
    saveHealthProfile: updateProfile,
    loading
  } = useHealthProfile();
  const [formData, setFormData] = useState({
    age: '',
    weight_kg: '',
    height_cm: '',
    activity_level: '',
    dietary_restrictions: {} as Record<string, boolean>,
    medical_conditions: [] as string[],
    medications: [] as string[],
    symptoms_notes: '',
    custom_restrictions: ''
  });
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

  // Load profile data when it's available
  useEffect(() => {
    if (profile) {
      setFormData({
        age: profile.age?.toString() || '',
        weight_kg: profile.weight_kg?.toString() || '',
        height_cm: profile.height_cm?.toString() || '',
        activity_level: profile.activity_level || '',
        dietary_restrictions: profile.dietary_restrictions || {},
        medical_conditions: profile.medical_conditions || [],
        medications: profile.medications || [],
        symptoms_notes: profile.symptoms_notes || '',
        custom_restrictions: profile.custom_restrictions || ''
      });
    }
  }, [profile]);
  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-FODMAP', 'Keto', 'Mediterranean'];
  const activityLevels = [{
    value: 'sedentary',
    label: 'Sedentary (little to no exercise)'
  }, {
    value: 'light',
    label: 'Light (1-3 days/week)'
  }, {
    value: 'moderate',
    label: 'Moderate (3-5 days/week)'
  }, {
    value: 'active',
    label: 'Active (6-7 days/week)'
  }, {
    value: 'very_active',
    label: 'Very Active (2x/day or intense exercise)'
  }];
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleDietaryRestrictionToggle = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_restrictions: {
        ...prev.dietary_restrictions,
        [restriction]: !prev.dietary_restrictions[restriction]
      }
    }));
  };
  const addMedicalCondition = () => {
    if (!newCondition.trim()) {
      toast.error("Please enter a medical condition");
      return;
    }
    setFormData(prev => ({
      ...prev,
      medical_conditions: [...prev.medical_conditions, newCondition.trim()]
    }));
    setNewCondition('');
    toast.success(`✅ Medical condition "${newCondition}" added successfully!`);
    console.log('Medical condition added:', newCondition);
  };
  const removeMedicalCondition = (index: number) => {
    const condition = formData.medical_conditions[index];
    setFormData(prev => ({
      ...prev,
      medical_conditions: prev.medical_conditions.filter((_, i) => i !== index)
    }));
    toast.success(`✅ Medical condition "${condition}" removed successfully!`);
    console.log('Medical condition removed:', condition);
  };
  const addMedication = () => {
    if (!newMedication.trim()) {
      toast.error("Please enter a medication");
      return;
    }
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication.trim()]
    }));
    setNewMedication('');
    toast.success(`✅ Medication "${newMedication}" added successfully!`);
    console.log('Medication added:', newMedication);
  };
  const removeMedication = (index: number) => {
    const medication = formData.medications[index];
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
    toast.success(`✅ Medication "${medication}" removed successfully!`);
    console.log('Medication removed:', medication);
  };
  const handleSave = async () => {
    try {
      const profileData = {
        age: formData.age ? parseInt(formData.age) : null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        activity_level: formData.activity_level || null,
        dietary_restrictions: formData.dietary_restrictions,
        medical_conditions: formData.medical_conditions,
        medications: formData.medications,
        symptoms_notes: formData.symptoms_notes || null,
        custom_restrictions: formData.custom_restrictions || null
      };
      console.log('Saving health profile:', profileData);
      const result = await updateProfile(profileData);
      if (result) {
        toast.success("✅ Health profile saved successfully!");
        console.log('Health profile saved:', result);
      } else {
        toast.error("❌ Failed to save health profile. Please try again.");
        console.error('Failed to save health profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("❌ Failed to save health profile. Please try again.");
    }
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-1 text-gray-900">Health Profile</h2>
        <p className="text-base leading-tight text-gray-600">
          Help us personalize your gut health journey
        </p>
      </div>

      {/* Basic Information */}
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
              <Label className="text-sm font-medium text-gray-900">
                <Calendar className="w-4 h-4 inline mr-2" />
                Age
              </Label>
              <Input type="number" placeholder="Enter your age" value={formData.age} onChange={e => handleInputChange('age', e.target.value)} className="bg-white border-gray-300 text-gray-900 placeholder-gray-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                <Scale className="w-4 h-4 inline mr-2" />
                Weight (kg)
              </Label>
              <Input type="number" step="0.1" placeholder="Enter weight" value={formData.weight_kg} onChange={e => handleInputChange('weight_kg', e.target.value)} className="bg-white border-gray-300 text-gray-900 placeholder-gray-500" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">
                <Ruler className="w-4 h-4 inline mr-2" />
                Height (cm)
              </Label>
              <Input type="number" placeholder="Enter height" value={formData.height_cm} onChange={e => handleInputChange('height_cm', e.target.value)} className="bg-white border-gray-300 text-gray-900 placeholder-gray-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Level */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-600" />
            <span>Activity Level</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {activityLevels.map(level => <Button key={level.value} variant={formData.activity_level === level.value ? "default" : "outline"} onClick={() => handleInputChange('activity_level', level.value)} className="">
                <div className="bg-neutral-50 text-slate-950">
                  <p className="font-medium my-[8px]">{level.value.charAt(0).toUpperCase() + level.value.slice(1)}</p>
                  <p className="text-sm opacity-80">{level.label}</p>
                </div>
              </Button>)}
          </div>
        </CardContent>
      </Card>

      {/* Dietary Restrictions */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Dietary Restrictions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dietaryOptions.map(option => <Button key={option} variant={formData.dietary_restrictions[option] ? "default" : "outline"} onClick={() => handleDietaryRestrictionToggle(option)} className={`text-sm ${formData.dietary_restrictions[option] ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'}`}>
                {option}
              </Button>)}
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">Custom Dietary Notes</Label>
            <Textarea placeholder="Any other dietary restrictions or preferences..." value={formData.custom_restrictions} onChange={e => handleInputChange('custom_restrictions', e.target.value)} className="bg-white border-gray-300 text-gray-900 placeholder-gray-500" />
          </div>
        </CardContent>
      </Card>

      {/* Medical Conditions */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <span>Medical Conditions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input placeholder="Add medical condition..." value={newCondition} onChange={e => setNewCondition(e.target.value)} onKeyPress={e => {
            if (e.key === 'Enter') {
              addMedicalCondition();
            }
          }} className="bg-white border-gray-300 text-gray-900 placeholder-gray-500" />
            <Button onClick={addMedicalCondition} disabled={!newCondition.trim()} className="bg-green-600 text-white hover:bg-green-700">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.medical_conditions.map((condition, index) => <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{condition}</span>
                <button onClick={() => removeMedicalCondition(index)} className="ml-1 hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </Badge>)}
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Current Medications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Input placeholder="Add medication..." value={newMedication} onChange={e => setNewMedication(e.target.value)} onKeyPress={e => {
            if (e.key === 'Enter') {
              addMedication();
            }
          }} className="bg-white border-gray-300 text-gray-900 placeholder-gray-500" />
            <Button onClick={addMedication} disabled={!newMedication.trim()} className="bg-green-600 text-white hover:bg-green-700">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.medications.map((medication, index) => <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                <span>{medication}</span>
                <button onClick={() => removeMedication(index)} className="ml-1 hover:text-red-600">
                  <X className="w-3 h-3" />
                </button>
              </Badge>)}
          </div>
        </CardContent>
      </Card>

      {/* Symptoms & Notes */}
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Symptoms & Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-900">Current Symptoms or Concerns</Label>
            <Textarea placeholder="Describe any current digestive symptoms, concerns, or patterns you've noticed..." value={formData.symptoms_notes} onChange={e => handleInputChange('symptoms_notes', e.target.value)} className="bg-white border-gray-300 text-gray-900 placeholder-gray-500" rows={4} />
          </div>
        </CardContent>
      </Card>

      {/* Test Results Upload */}
      <TestResultsUpload />

      {/* Save Button */}
      <div className="text-center pt-4">
        <Button onClick={handleSave} disabled={loading} className="px-8 py-3 text-white font-medium transition-colors bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2 stroke-2" />
          {loading ? 'Saving...' : 'Save Health Profile'}
        </Button>
      </div>
    </div>;
};
export default HealthProfile;