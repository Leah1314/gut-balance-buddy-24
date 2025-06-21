
import { useEffect } from 'react';
import { useRAG } from './useRAG';
import { supabase } from '@/integrations/supabase/client';

export const useHealthProfileRAG = () => {
  const { ingestHealthProfile } = useRAG();

  const updateRA­GOnProfileSave = async (profileData: any) => {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('User not authenticated, skipping RAG update');
        return;
      }

      // Ingest health profile data to RAG system
      await ingestHealthProfile(profileData);
    } catch (error) {
      console.error('Failed to update RAG with health profile:', error);
    }
  };

  return {
    updateRAGOnProfileSave
  };
};
