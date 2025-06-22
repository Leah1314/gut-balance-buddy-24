
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

  const calculateCurrentStreak = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return 0;
      }

      const { data, error } = await supabase
        .from('stool_logs')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return 0;
      }

      // Group logs by date (ignoring time)
      const logsByDate = new Map<string, boolean>();
      data.forEach(log => {
        const date = new Date(log.created_at).toDateString();
        logsByDate.set(date, true);
      });

      // Calculate streak starting from today
      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < 365; i++) { // Check up to a year back
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateString = checkDate.toDateString();
        
        if (logsByDate.has(dateString)) {
          streak++;
        } else {
          // If we miss a day, break the streak
          // But allow for today not being logged yet if it's the first day
          if (i === 0) {
            continue; // Skip today if no log yet
          }
          break;
        }
      }

      return streak;
    } catch (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }
  };

  return {
    addStoolLog,
    getStoolLogs,
    calculateCurrentStreak,
    isLoading
  };
};
