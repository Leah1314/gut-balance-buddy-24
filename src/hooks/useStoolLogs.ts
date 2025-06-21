
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface StoolLog {
  id: string;
  user_id: string;
  bristol_type?: number;
  color?: string;
  consistency?: string;
  notes?: string;
  image_url?: string;
  timestamp?: string;
  created_at: string;
}

export const useStoolLogs = () => {
  const [stoolLogs, setStoolLogs] = useState<StoolLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchStoolLogs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stool_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStoolLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching stool logs:', error);
      toast.error('Failed to load stool logs');
    } finally {
      setLoading(false);
    }
  };

  const addStoolLog = async (stoolLogData: {
    bristol_type?: number;
    color?: string;
    consistency?: string;
    notes?: string;
    image_url?: string;
  }) => {
    if (!user) {
      toast.error('You must be logged in to add stool logs');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('stool_logs')
        .insert({
          user_id: user.id,
          bristol_type: stoolLogData.bristol_type,
          color: stoolLogData.color,
          consistency: stoolLogData.consistency,
          notes: stoolLogData.notes,
          image_url: stoolLogData.image_url,
          timestamp: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Stool log added successfully');
      await fetchStoolLogs(); // Refresh the list
      return data;
    } catch (error: any) {
      console.error('Error adding stool log:', error);
      toast.error('Failed to add stool log');
      return null;
    }
  };

  const deleteStoolLog = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('stool_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success('Stool log deleted successfully');
      await fetchStoolLogs(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting stool log:', error);
      toast.error('Failed to delete stool log');
    }
  };

  useEffect(() => {
    if (user) {
      fetchStoolLogs();
    }
  }, [user]);

  return {
    stoolLogs,
    loading,
    addStoolLog,
    deleteStoolLog,
    refreshStoolLogs: fetchStoolLogs
  };
};
