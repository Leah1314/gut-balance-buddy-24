
import { useRAG } from './useRAG';
import { supabase } from '@/integrations/supabase/client';

export const useTrackingRAG = () => {
  const { ingestTrackData, captionImage } = useRAG();

  const updateRAGOnTrackingSave = async (trackingData: any, hasImage = false) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated, skipping RAG update');
        return;
      }

      // If there's an image, we would caption it first
      let processedData = { ...trackingData };
      
      if (hasImage && trackingData.imageData) {
        try {
          const caption = await captionImage(trackingData.imageData, trackingData.type);
          processedData.ai_caption = caption;
        } catch (error) {
          console.error('Failed to caption image:', error);
        }
      }

      // Ingest tracking data to RAG system
      await ingestTrackData(processedData, hasImage);
    } catch (error) {
      console.error('Failed to update RAG with tracking data:', error);
    }
  };

  return {
    updateRAGOnTrackingSave
  };
};
