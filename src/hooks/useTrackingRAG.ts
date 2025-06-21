
import { useRAG } from './useRAG';
import { supabase } from '@/integrations/supabase/client';

export const useTrackingRAG = () => {
  const { ingestTrackData, ingestImage, captionImage } = useRAG();

  const updateRAGOnTrackingSave = async (trackingData: any, hasImage = false) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated, skipping RAG update');
        return;
      }

      // If there's an image, process it through RAG
      if (hasImage && trackingData.imageData) {
        try {
          // For images, use the new ingestImage method that handles captioning
          await ingestImage(trackingData.imageData, trackingData.type || 'food');
        } catch (error) {
          console.error('Failed to ingest image to RAG:', error);
          // Fallback to text ingestion
          await ingestTrackData({
            ...trackingData,
            note: 'Image analysis failed'
          }, hasImage);
        }
      } else {
        // For text-only data, use standard ingestion
        await ingestTrackData(trackingData, hasImage);
      }
    } catch (error) {
      console.error('Failed to update RAG with tracking data:', error);
    }
  };

  const captionImageForUser = async (imageData: string, contentType = 'food'): Promise<string> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated, skipping image captioning');
        return '';
      }

      return await captionImage(imageData, contentType);
    } catch (error) {
      console.error('Failed to caption image:', error);
      return '';
    }
  };

  return {
    updateRAGOnTrackingSave,
    captionImageForUser
  };
};
