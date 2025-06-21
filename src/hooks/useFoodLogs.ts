
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface FoodLog {
  id: string;
  user_id: string;
  food_name: string;
  description?: string;
  image_url?: string;
  analysis_result?: any;
  created_at: string;
}

export const useFoodLogs = () => {
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchFoodLogs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFoodLogs(data || []);
    } catch (error: any) {
      console.error('Error fetching food logs:', error);
      toast.error('Failed to load food logs');
    } finally {
      setLoading(false);
    }
  };

  const addFoodLog = async (foodLogData: {
    food_name: string;
    description?: string;
    image_url?: string;
  }) => {
    if (!user) {
      toast.error('You must be logged in to add food logs');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('food_logs')
        .insert({
          user_id: user.id,
          food_name: foodLogData.food_name,
          description: foodLogData.description,
          image_url: foodLogData.image_url
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('Food log added successfully:', data);
      await fetchFoodLogs(); // Refresh the list
      return data;
    } catch (error: any) {
      console.error('Error adding food log:', error);
      return null;
    }
  };

  const deleteFoodLog = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success('Food log deleted successfully');
      await fetchFoodLogs(); // Refresh the list
    } catch (error: any) {
      console.error('Error deleting food log:', error);
      toast.error('Failed to delete food log');
    }
  };

  useEffect(() => {
    if (user) {
      fetchFoodLogs();
    }
  }, [user]);

  return {
    foodLogs,
    loading,
    addFoodLog,
    deleteFoodLog,
    refreshFoodLogs: fetchFoodLogs
  };
};
