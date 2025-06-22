import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  User, Heart, Scale, Ruler, Calendar, AlertCircle, Plus, X, Save, 
  FileText, ChevronDown, ChevronUp 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import TestResultsUpload from "./TestResultsUpload";

const HealthProfile = () => {
  const {
    healthProfile: profile,
    saveHealthProfile: updateProfile,
    loading
  } = useHealthProfile();
  
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string>('basic');
  const [showSaveButton, setShowSaveButton] = useState(false);

  // Load profile data when it's available
  useEffect(() => {
    if (profile) {
      console.log('Loading profile data:', profile);
      setFormData({
        age: profile.age?.toString() || '',
        gender: profile.gender || '',
        weight_kg: profile.weight_kg?.toString() || '',
        height_cm: profile.height_cm?.toString() || '',
        activity_level: profile.activity_level || '',
        dietary_restrictions: profile.dietary_restrictions || {},
        medical_conditions: profile.medical_conditions || [],
        medications: profile.medications || [],
        symptoms_notes: profile.symptoms_notes || '',
        custom_restrictions: profile.custom_restrictions || ''
      });
      setHasUnsavedChanges(false);
    }
  }, [profile]);

  // Show/hide save button with animation
  useEffect(() => {
    if (hasUnsavedChanges) {
      setShowSaveButton(true);
    } else {
      const timer = setTimeout(() => setShowSaveButton(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges]);

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
  ];

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free', 'Low-FODMAP', 'Keto', 'Mediterranean'];
  
  const activityLevels = [{
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Little to no exercise'
  }, {
    value: 'light',
    label: 'Light',
    description: '1-3 days/week'
  }, {
    value: 'moderate',
    label: 'Moderate',
    description: '3-5 days/week'
  }, {
    value: 'active',
    label: 'Active',
    description: '6-7 days/week'
  }, {
    value: 'very_active',
    label: 'Very Active',
    description: '2x/day or intense'
  }];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleDietaryRestrictionToggle = (restriction: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_restrictions: {
        ...prev.dietary_restrictions,
        [restriction]: !prev.dietary_restrictions[restriction]
      }
    }));
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
    toast.success(`✅ Medical condition "${newCondition}" added successfully!`);
  };

  const removeMedicalCondition = (index: number) => {
    const condition = formData.medical_conditions[index];
    setFormData(prev => ({
      ...prev,
      medical_conditions: prev.medical_conditions.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
    toast.success(`✅ Medical condition "${condition}" removed successfully!`);
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
    setHasUnsavedChanges(true);
    toast.success(`✅ Medication "${newMedication}" added successfully!`);
  };

  const removeMedication = (index: number) => {
    const medication = formData.medications[index];
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
    toast.success(`✅ Medication "${medication}" removed successfully!`);
  };

  const handleSave = async () => {
    try {
      const profileData = {
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : null,
        height_cm: formData.height_cm ? parseFloat(formData.height_cm) : null,
        activity_level: formData.activity_level || null,
        dietary_restrictions: formData.dietary_restrictions,
        medical_conditions: formData.medical_conditions,
        medications: formData.medications,
        symptoms_notes: formData.symptoms_notes || null,
        custom_restrictions: formData.custom_restrictions || null
      };
      
      console.log('Saving health profile with data:', profileData);
      const result = await updateProfile(profileData);
      if (result) {
        toast.success("✅ Health profile saved successfully!");
        setHasUnsavedChanges(false);
        console.log('Health profile saved successfully:', result);
      } else {
        toast.error("❌ Failed to save health profile. Please try again.");
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("❌ Failed to save health profile. Please try again.");
    }
  };

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection('');
    } else {
      setExpandedSection(section);
    }
  };

  const getSummaryText = (section: string) => {
    switch (section) {
      case 'basic':
        const parts = [];
        if (formData.age) parts.push(`${formData.age}y`);
        if (formData.weight_kg) parts.push(`${formData.weight_kg}kg`);
        if (formData.height_cm) parts.push(`${formData.height_cm}cm`);
        return parts.length > 0 ? `🧍 ${parts.join(' · ')}` : 'Not filled';
      case 'activity':
        return formData.activity_level 
          ? `💪 ${activityLevels.find(a => a.value === formData.activity_level)?.label}`
          : '💪 Not selected';
      case 'dietary':
        const activeRestrictions = Object.keys(formData.dietary_restrictions).filter(key => formData.dietary_restrictions[key]);
        return activeRestrictions.length > 0 ? `🥗 ${activeRestrictions.length} restrictions` : '🥗 None';
      case 'medical':
        return formData.medical_conditions.length > 0 ? `🏥 ${formData.medical_conditions.length} conditions` : '🏥 None';
      case 'medications':
        return formData.medications.length > 0 ? `💊 ${formData.medications.length} medications` : '💊 None';
      default:
        return '';
    }
  };

  return (
    <div className="pb-24 px-1">
      {/* Header - More compact */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-1 text-gray-900">Health Profile</h2>
        <p className="text-sm text-gray-600">
          Personalize your gut health journey
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Collapsible open={expandedSection === 'basic'} onOpenChange={() => toggleSection('basic')}>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CollapsibleTrigger asChild>
              <CardHeader className="py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Basic Information</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-normal">
                      {getSummaryText('basic')}
                    </span>
                    {expandedSection === 'basic' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-4 pb-6">
                <div className="space-y-6">
                  {/* Age - Full width on mobile */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Age
                    </Label>
                    <Input 
                      type="number" 
                      placeholder="Enter your age" 
                      value={formData.age} 
                      onChange={e => handleInputChange('age', e.target.value)} 
                      className="h-12 text-sm"
                    />
                  </div>

                  {/* Gender - Dropdown */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        {genderOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Weight - Full width on mobile */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      <Scale className="w-4 h-4 mr-2" />
                      Weight (kg)
                    </Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="Enter your weight in kg" 
                      value={formData.weight_kg} 
                      onChange={e => handleInputChange('weight_kg', e.target.value)} 
                      className="h-12 text-sm"
                    />
                  </div>

                  {/* Height - Full width on mobile */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700 flex items-center">
                      <Ruler className="w-4 h-4 mr-2" />
                      Height (cm)
                    </Label>
                    <Input 
                      type="number" 
                      placeholder="Enter your height in cm" 
                      value={formData.height_cm} 
                      onChange={e => handleInputChange('height_cm', e.target.value)} 
                      className="h-12 text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Activity Level */}
        <Collapsible open={expandedSection === 'activity'} onOpenChange={() => toggleSection('activity')}>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CollapsibleTrigger asChild>
              <CardHeader className="py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-600" />
                    <span>Activity Level</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-normal">
                      {getSummaryText('activity')}
                    </span>
                    {expandedSection === 'activity' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-4 pb-4">
                <div className="space-y-2">
                  {activityLevels.map(level => (
                    <Button 
                      key={level.value} 
                      variant={formData.activity_level === level.value ? "default" : "outline"} 
                      onClick={() => handleInputChange('activity_level', level.value)} 
                      className={`w-full h-auto py-3 px-3 text-left justify-start ${
                        formData.activity_level === level.value 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="w-full text-left">
                        <p className="font-medium text-sm">{level.label}</p>
                        <p className="text-xs opacity-80">{level.description}</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Dietary Restrictions */}
        <Collapsible open={expandedSection === 'dietary'} onOpenChange={() => toggleSection('dietary')}>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CollapsibleTrigger asChild>
              <CardHeader className="py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <span>🥗</span>
                    <span>Dietary Restrictions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-normal">
                      {getSummaryText('dietary')}
                    </span>
                    {expandedSection === 'dietary' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {dietaryOptions.map(option => (
                    <Button 
                      key={option} 
                      variant={formData.dietary_restrictions[option] ? "default" : "outline"} 
                      onClick={() => handleDietaryRestrictionToggle(option)} 
                      className={`text-xs h-9 ${formData.dietary_restrictions[option] ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'}`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Custom Notes</Label>
                  <Textarea 
                    placeholder="Any other dietary restrictions..." 
                    value={formData.custom_restrictions} 
                    onChange={e => handleInputChange('custom_restrictions', e.target.value)} 
                    className="text-sm min-h-[60px]"
                    rows={2}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Medical Conditions */}
        <Collapsible open={expandedSection === 'medical'} onOpenChange={() => toggleSection('medical')}>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CollapsibleTrigger asChild>
              <CardHeader className="py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-600" />
                    <span>Medical Conditions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-normal">
                      {getSummaryText('medical')}
                    </span>
                    {expandedSection === 'medical' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-4 pb-4">
                <div className="flex space-x-2 mb-3">
                  <Input 
                    placeholder="Add medical condition..." 
                    value={newCondition} 
                    onChange={e => setNewCondition(e.target.value)} 
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        addMedicalCondition();
                      }
                    }} 
                    className="h-9 text-sm"
                  />
                  <Button 
                    onClick={addMedicalCondition} 
                    disabled={!newCondition.trim()} 
                    className="bg-green-600 text-white hover:bg-green-700 h-9 px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.medical_conditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1 text-xs">
                      <span>{condition}</span>
                      <button onClick={() => removeMedicalCondition(index)} className="ml-1 hover:text-red-600">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Medications & Symptoms */}
        <Collapsible open={expandedSection === 'medications'} onOpenChange={() => toggleSection('medications')}>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CollapsibleTrigger asChild>
              <CardHeader className="py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <span>💊</span>
                    <span>Medications & Symptoms</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-normal">
                      {getSummaryText('medications')}
                    </span>
                    {expandedSection === 'medications' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Current Medications</Label>
                    <div className="flex space-x-2 mb-2">
                      <Input 
                        placeholder="Add medication..." 
                        value={newMedication} 
                        onChange={e => setNewMedication(e.target.value)} 
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            addMedication();
                          }
                        }} 
                        className="h-9 text-sm"
                      />
                      <Button 
                        onClick={addMedication} 
                        disabled={!newMedication.trim()} 
                        className="bg-green-600 text-white hover:bg-green-700 h-9 px-3"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.medications.map((medication, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center space-x-1 text-xs">
                          <span>{medication}</span>
                          <button onClick={() => removeMedication(index)} className="ml-1 hover:text-red-600">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">Current Symptoms</Label>
                    <Textarea 
                      placeholder="Describe any digestive symptoms or concerns..." 
                      value={formData.symptoms_notes} 
                      onChange={e => handleInputChange('symptoms_notes', e.target.value)} 
                      className="text-sm min-h-[80px]"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Test Results Upload */}
        <Collapsible open={expandedSection === 'uploads'} onOpenChange={() => toggleSection('uploads')}>
          <Card className="bg-white border-gray-200 shadow-sm">
            <CollapsibleTrigger asChild>
              <CardHeader className="py-4 px-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Test Results</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 font-normal">📄 Upload files</span>
                    {expandedSection === 'uploads' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-4 pb-4">
                <TestResultsUpload />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Floating Save Button */}
      {showSaveButton && (
        <div className={`fixed bottom-20 left-1/2 transform -translate-x-1/2 z-40 transition-all duration-300 ${
          hasUnsavedChanges ? 'opacity-100 scale-100' : 'opacity-40 scale-95'
        }`}>
          <Button 
            onClick={handleSave} 
            disabled={loading || !hasUnsavedChanges} 
            className={`px-4 py-2 h-10 rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 ${
              hasUnsavedChanges 
                ? 'bg-green-600/90 hover:bg-green-700 text-white' 
                : 'bg-green-400/60 text-green-800 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default HealthProfile;
