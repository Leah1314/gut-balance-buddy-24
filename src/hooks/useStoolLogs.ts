
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStoolLogs = () => {
  const [isLoading, setIsLoading] = useState(false);

  const addStoolLog = async (stoolData: {
    bristol_type: number;
    consistency: string;
    color: string;
    notes?: string;
    image_url?: string;
  }) => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to save stool entries');
        return null;
      }

      const { data, error } = await supabase
        .from('stool_logs')
        .insert({
          user_id: user.id,
          bristol_type: stoolData.bristol_type,
          consistency: stoolData.consistency,
          color: stoolData.color,
          notes: stoolData.notes,
          image_url: stoolData.image_url
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding stool log:', error);
        toast.error('Failed to save stool entry');
        return null;
      }

      console.log('Stool log saved successfully:', data);
      toast.success('Stool entry saved successfully!');
      return data;
    } catch (error) {
      console.error('Error in addStoolLog:', error);
      toast.error('An error occurred while saving');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getStoolLogs = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('stool_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching stool logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStoolLogs:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addStoolLog,
    getStoolLogs,
    isLoading
  };
};
