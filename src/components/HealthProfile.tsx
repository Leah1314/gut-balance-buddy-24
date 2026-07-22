
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
import { useTranslation } from 'react-i18next';

const HealthProfile = () => {
  const { t } = useTranslation();
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
  const [expandedSection, setExpandedSection] = useState<string>(''); // Changed from 'basic' to empty string
  const [showSaveButton, setShowSaveButton] = useState(false);

  // Load profile data when it's available
  useEffect(() => {
    if (profile) {
      console.log('Loading profile data:', profile);
      setFormData({
        age: profile.age?.toString() || '',
        gender: profile.gender || '', // Load gender from profile
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
    { value: 'male', label: t('health.genderOptions.male') },
    { value: 'female', label: t('health.genderOptions.female') },
    { value: 'non-binary', label: t('health.genderOptions.nonBinary') },
    { value: 'prefer-not-to-say', label: t('health.genderOptions.preferNotToSay') },
  ];

  const dietaryOptions = [
    t('health.dietaryOptions.vegetarian'),
    t('health.dietaryOptions.vegan'), 
    t('health.dietaryOptions.glutenFree'),
    t('health.dietaryOptions.dairyFree'),
    t('health.dietaryOptions.nutFree'),
    t('health.dietaryOptions.lowFodmap'),
    t('health.dietaryOptions.keto'),
    t('health.dietaryOptions.mediterranean')
  ];
  
  const activityLevels = [{
    value: 'sedentary',
    label: t('health.activityLevels.sedentary'),
    description: t('health.activityLevels.sedentaryDesc')
  }, {
    value: 'light',
    label: t('health.activityLevels.light'),
    description: t('health.activityLevels.lightDesc')
  }, {
    value: 'moderate',
    label: t('health.activityLevels.moderate'),
    description: t('health.activityLevels.moderateDesc')
  }, {
    value: 'active',
    label: t('health.activityLevels.active'),
    description: t('health.activityLevels.activeDesc')
  }, {
    value: 'very_active',
    label: t('health.activityLevels.veryActive'),
    description: t('health.activityLevels.veryActiveDesc')
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
      toast.error(t('health.errorAddingCondition'));
      return;
    }
    setFormData(prev => ({
      ...prev,
      medical_conditions: [...prev.medical_conditions, newCondition.trim()]
    }));
    setNewCondition('');
    setHasUnsavedChanges(true);
    toast.success(`✅ ${t('health.conditionAdded')}`);
  };

  const removeMedicalCondition = (index: number) => {
    const condition = formData.medical_conditions[index];
    setFormData(prev => ({
      ...prev,
      medical_conditions: prev.medical_conditions.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
    toast.success(`✅ ${t('health.conditionRemoved')}`);
  };

  const addMedication = () => {
    if (!newMedication.trim()) {
      toast.error(t('health.errorAddingMedication'));
      return;
    }
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication.trim()]
    }));
    setNewMedication('');
    setHasUnsavedChanges(true);
    toast.success(`✅ ${t('health.medicationAdded')}`);
  };

  const removeMedication = (index: number) => {
    const medication = formData.medications[index];
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
    toast.success(`✅ ${t('health.medicationRemoved')}`);
  };

  const handleSave = async () => {
    try {
      const profileData = {
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null, // Include gender in save operation
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
        toast.success(`✅ ${t('health.profileSaved')}`);
        setHasUnsavedChanges(false);
        console.log('Health profile saved successfully:', result);
      } else {
        toast.error(`❌ ${t('health.profileSaveError')}`);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(`❌ ${t('health.profileSaveError')}`);
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
        return parts.length > 0 ? `🧍 ${parts.join(' · ')}` : t('health.notFilled');
      case 'activity':
        return formData.activity_level 
          ? `💪 ${activityLevels.find(a => a.value === formData.activity_level)?.label}`
          : `💪 ${t('health.notSelected')}`;
      case 'dietary':
        const activeRestrictions = Object.keys(formData.dietary_restrictions).filter(key => formData.dietary_restrictions[key]);
        return activeRestrictions.length > 0 ? `🥗 ${activeRestrictions.length} ${t('health.restrictions')}` : `🥗 ${t('health.none')}`;
      case 'medical':
        return formData.medical_conditions.length > 0 ? `🏥 ${formData.medical_conditions.length}${t('health.conditions')}` : `🏥 ${t('health.none')}`;
      case 'medications':
        return formData.medications.length > 0 ? `💊 ${formData.medications.length}${t('health.medications')}` : `💊 ${t('health.none')}`;
      default:
        return '';
    }
  };

  return (
    <div className="pb-24 px-1">
      {/* Header - More compact */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-1 text-foreground">{t('health.title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('health.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <Collapsible open={expandedSection === 'basic'} onOpenChange={() => toggleSection('basic')}>
          <Card className="bg-card border-border/60 shadow-soft rounded-3xl overflow-hidden">
            <CollapsibleTrigger asChild>
              <CardHeader className="py-4 px-5 cursor-pointer hover:bg-muted/40 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-primary" />
                    <span>{t('health.basicInfo')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground font-normal">
                      {getSummaryText('basic')}
                    </span>
                    {expandedSection === 'basic' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-5 pb-6">
                <div className="space-y-6">
                  {/* Age */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      {t('health.age')}
                    </Label>
                    <Input 
                      type="number" 
                      placeholder={t('health.enterAge')} 
                      value={formData.age} 
                      onChange={e => handleInputChange('age', e.target.value)} 
                      className="h-12 text-sm"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center">
                      <User className="w-4 h-4 mr-2 text-primary" />
                      {t('health.gender')}
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder={t('health.selectGender')} />
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

                  {/* Weight */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center">
                      <Scale className="w-4 h-4 mr-2 text-primary" />
                      {t('health.weight')}
                    </Label>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder={t('health.enterWeight')} 
                      value={formData.weight_kg} 
                      onChange={e => handleInputChange('weight_kg', e.target.value)} 
                      className="h-12 text-sm"
                    />
                  </div>

                  {/* Height */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground flex items-center">
                      <Ruler className="w-4 h-4 mr-2 text-primary" />
                      {t('health.height')}
                    </Label>
                    <Input 
                      type="number" 
                      placeholder={t('health.enterHeight')} 
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
          <Card className="bg-card border-border/60 shadow-soft rounded-3xl overflow-hidden">
            <CollapsibleTrigger asChild>
              <CardHeader className="py-4 px-5 cursor-pointer hover:bg-muted/40 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-primary" />
                    <span>{t('health.activityLevel')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground font-normal">
                      {getSummaryText('activity')}
                    </span>
                    {expandedSection === 'activity' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-5 pb-5">
                <div className="space-y-2.5">
                  {activityLevels.map(level => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => handleInputChange('activity_level', level.value)}
                      className={`w-full text-left rounded-2xl border transition-all py-3.5 px-4 ${
                        formData.activity_level === level.value
                          ? 'bg-primary text-primary-foreground border-primary shadow-soft'
                          : 'bg-card text-foreground border-border hover:border-primary/40 hover:bg-muted/40'
                      }`}
                    >
                      <p className="font-medium text-sm leading-tight">{level.label}</p>
                      <p className={`text-xs mt-0.5 ${formData.activity_level === level.value ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {level.description}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Dietary Restrictions */}
        <Collapsible open={expandedSection === 'dietary'} onOpenChange={() => toggleSection('dietary')}>
          <Card className="bg-card border-border/60 shadow-soft rounded-3xl overflow-hidden">
            <CollapsibleTrigger asChild>
              <CardHeader className="py-4 px-5 cursor-pointer hover:bg-muted/40 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <span>🥗</span>
                    <span>{t('health.dietaryRestrictions')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground font-normal">
                      {getSummaryText('dietary')}
                    </span>
                    {expandedSection === 'dietary' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {dietaryOptions.map(option => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleDietaryRestrictionToggle(option)}
                      className={`text-xs h-10 rounded-full border transition-all font-medium ${
                        formData.dietary_restrictions[option]
                          ? 'bg-primary text-primary-foreground border-primary shadow-soft'
                          : 'bg-card text-foreground border-border hover:border-primary/40'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">{t('health.customNotes')}</Label>
                  <Textarea 
                    placeholder={t('health.anyOtherRestrictions')} 
                    value={formData.custom_restrictions} 
                    onChange={e => handleInputChange('custom_restrictions', e.target.value)} 
                    className="text-sm min-h-[60px] rounded-2xl"
                    rows={2}
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Medical Conditions */}
        <Collapsible open={expandedSection === 'medical'} onOpenChange={() => toggleSection('medical')}>
          <Card className="bg-card border-border/60 shadow-soft rounded-3xl overflow-hidden">
            <CollapsibleTrigger asChild>
              <CardHeader className="py-4 px-5 cursor-pointer hover:bg-muted/40 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-primary" />
                    <span>{t('health.medicalConditions')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground font-normal">
                      {getSummaryText('medical')}
                    </span>
                    {expandedSection === 'medical' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-5 pb-5">
                <div className="flex space-x-2 mb-3">
                  <Input 
                    placeholder={t('health.addMedicalCondition')} 
                    value={newCondition} 
                    onChange={e => setNewCondition(e.target.value)} 
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        addMedicalCondition();
                      }
                    }} 
                    className="h-11 text-sm rounded-full"
                  />
                  <Button
                    onClick={addMedicalCondition}
                    disabled={!newCondition.trim()}
                    size="icon"
                    className="h-11 w-11 rounded-full shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {formData.medical_conditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs rounded-full px-3 py-1 bg-primary/10 text-primary hover:bg-primary/15">
                      <span>{condition}</span>
                      <button onClick={() => removeMedicalCondition(index)} className="ml-1 hover:text-destructive">
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
          <Card className="bg-card border-border/60 shadow-soft rounded-3xl overflow-hidden">
            <CollapsibleTrigger asChild>
              <CardHeader className="py-4 px-5 cursor-pointer hover:bg-muted/40 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <span>💊</span>
                    <span>{t('health.medicationsAndSymptoms')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground font-normal">
                      {getSummaryText('medications')}
                    </span>
                    {expandedSection === 'medications' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-5 pb-5">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">{t('health.currentMedications')}</Label>
                    <div className="flex space-x-2 mb-2">
                      <Input 
                        placeholder={t('health.addMedication')} 
                        value={newMedication} 
                        onChange={e => setNewMedication(e.target.value)} 
                        onKeyPress={e => {
                          if (e.key === 'Enter') {
                            addMedication();
                          }
                        }} 
                        className="h-11 text-sm rounded-full"
                      />
                      <Button
                        onClick={addMedication}
                        disabled={!newMedication.trim()}
                        size="icon"
                        className="h-11 w-11 rounded-full shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {formData.medications.map((medication, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs rounded-full px-3 py-1 bg-primary/10 text-primary hover:bg-primary/15">
                          <span>{medication}</span>
                          <button onClick={() => removeMedication(index)} className="ml-1 hover:text-destructive">
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-foreground mb-2 block">{t('health.currentSymptoms')}</Label>
                    <Textarea 
                      placeholder={t('health.describeSymptoms')} 
                      value={formData.symptoms_notes} 
                      onChange={e => handleInputChange('symptoms_notes', e.target.value)} 
                      className="text-sm min-h-[80px] rounded-2xl"
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
          <Card className="bg-card border-border/60 shadow-soft rounded-3xl overflow-hidden">
            <CollapsibleTrigger asChild>
              <CardHeader className="py-4 px-5 cursor-pointer hover:bg-muted/40 transition-colors">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>{t('health.testResults')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground font-normal">📄 {t('health.uploadFiles')}</span>
                    {expandedSection === 'uploads' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-5 pb-5">
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
            size="lg"
            className="px-6 h-12 rounded-full shadow-lg"
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
