
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RAGData {
  health_info: string[];
  track_history: string[];
}

interface UserDataStatus {
  health_info: boolean;
  track_history: boolean;
}

export const useRAG = () => {
  const [isLoading, setIsLoading] = useState(false);

  const callRAGService = async (action: string, data: any) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('rag-service', {
        body: { action, data }
      });

      if (error) throw error;
      return result;
    } catch (error) {
      console.error('RAG service error:', error);
      toast.error('Unable to process data with RAG service');
      throw error;
    }
  };

  const ingestHealthProfile = async (profileData: Record<string, any>) => {
    setIsLoading(true);
    try {
      // Convert profile data to text
      const profileText = Object.entries(profileData)
        .filter(([_, value]) => value != null && value !== '')
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      await callRAGService('ingest_health_profile', {
        profile_text: profileText
      });

      toast.success('Health profile updated in knowledge base');
    } catch (error) {
      // Error already handled in callRAGService
    } finally {
      setIsLoading(false);
    }
  };

  const ingestTrackData = async (trackData: Record<string, any>, hasImage = false) => {
    setIsLoading(true);
    try {
      // Convert track data to text
      const trackText = Object.entries(trackData)
        .filter(([_, value]) => value != null && value !== '')
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');

      await callRAGService('ingest_track_data', {
        track_text: trackText,
        has_image: hasImage,
        content_type: trackData.type || 'general'
      });

      console.log('Track data ingested to RAG system');
    } catch (error) {
      // Error already handled in callRAGService
    } finally {
      setIsLoading(false);
    }
  };

  const retrieveUserData = async (query: string, nResults = 5): Promise<RAGData> => {
    setIsLoading(true);
    try {
      const result = await callRAGService('retrieve_user_data', {
        query,
        n_results: nResults
      });

      return result || { health_info: [], track_history: [] };
    } catch (error) {
      return { health_info: [], track_history: [] };
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserData = async (): Promise<UserDataStatus> => {
    try {
      const result = await callRAGService('check_user_data', {});
      return result || { health_info: false, track_history: false };
    } catch (error) {
      return { health_info: false, track_history: false };
    }
  };

  const captionImage = async (imageData: string, contentType = 'food'): Promise<string> => {
    setIsLoading(true);
    try {
      const result = await callRAGService('caption_image', {
        image_data: imageData,
        content_type: contentType
      });

      return result.caption || '';
    } catch (error) {
      return '';
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    ingestHealthProfile,
    ingestTrackData,
    retrieveUserData,
    checkUserData,
    captionImage
  };
};
