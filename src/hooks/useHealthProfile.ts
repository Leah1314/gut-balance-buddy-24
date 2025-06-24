
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface HealthProfile {
  id: string;
  user_id: string;
  age?: number;
  gender?: string; // Add gender field
  weight_kg?: number;
  height_cm?: number;
  activity_level?: string;
  medical_conditions?: string[];
  medications?: string[];
  dietary_restrictions?: any;
  dietary_preferences?: any[];
  custom_restrictions?: string;
  recent_tests?: any;
  symptoms_notes?: string;
  created_at: string;
  updated_at: string;
}

export const useHealthProfile = () => {
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchHealthProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_health_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setHealthProfile(data);
    } catch (error: any) {
      console.error('Error fetching health profile:', error);
      toast.error('Failed to load health profile');
    } finally {
      setLoading(false);
    }
  };

  const saveHealthProfile = async (profileData: {
    age?: number;
    gender?: string; // Add gender to the interface
    weight_kg?: number;
    height_cm?: number;
    activity_level?: string;
    medical_conditions?: string[];
    medications?: string[];
    dietary_restrictions?: any;
    dietary_preferences?: any[];
    custom_restrictions?: string;
    symptoms_notes?: string;
  }) => {
    if (!user) {
      toast.error('You must be logged in to save health profile');
      return null;
    }

    try {
      const profilePayload = {
        user_id: user.id,
        ...profileData,
        updated_at: new Date().toISOString()
      };

      let data, error;
      
      if (healthProfile) {
        // Update existing profile
        ({ data, error } = await supabase
          .from('user_health_profiles')
          .update(profilePayload)
          .eq('id', healthProfile.id)
          .eq('user_id', user.id)
          .select()
          .single());
      } else {
        // Create new profile
        ({ data, error } = await supabase
          .from('user_health_profiles')
          .insert(profilePayload)
          .select()
          .single());
      }

      if (error) throw error;
      
      setHealthProfile(data);
      toast.success('Health profile saved successfully');
      return data;
    } catch (error: any) {
      console.error('Error saving health profile:', error);
      toast.error('Failed to save health profile');
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchHealthProfile();
    }
  }, [user]);

  return {
    healthProfile,
    loading,
    saveHealthProfile,
    refreshHealthProfile: fetchHealthProfile
  };
};
