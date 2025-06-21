
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useTrackingRAG = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();

  const updateRAGOnTrackingSave = async (trackingData: any, includeImage: boolean = false) => {
    if (!user) {
      console.error('No authenticated user found for RAG update');
      return;
    }

    setIsUpdating(true);
    
    try {
      console.log('Updating RAG with tracking data for user:', user.id);
      console.log('Tracking data:', trackingData);

      // Send data directly to RAG service without action parameter
      const ragPayload = {
        type: trackingData.type,
        data: {
          ...trackingData,
          user_id: user.id,
          timestamp: trackingData.timestamp || new Date().toISOString()
        },
        include_image: includeImage
      };

      const { data, error } = await supabase.functions.invoke('rag-service', {
        body: ragPayload
      });

      if (error) {
        console.error('RAG service error:', error);
        // Don't throw error - RAG is optional functionality
        return { success: false, error };
      }

      console.log('RAG update result:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Error updating RAG:', error);
      // Don't throw error - RAG is optional functionality
      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateRAGOnTrackingSave,
    isUpdating
  };
};
