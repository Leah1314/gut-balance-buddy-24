
import { useHealthProfile as useOriginalHealthProfile } from './useHealthProfile';
import { useHealthProfileRAG } from './useHealthProfileRAG';

export const useHealthProfile = () => {
  const originalHook = useOriginalHealthProfile();
  const { updateRAGOnProfileSave } = useHealthProfileRAG();

  const saveHealthProfile = async (profileData: any) => {
    // Save to database first
    const result = await originalHook.saveHealthProfile(profileData);
    
    if (result) {
      // Update RAG with the health profile data
      await updateRAGOnProfileSave(profileData);
    }

    return result;
  };

  return {
    ...originalHook,
    saveHealthProfile
  };
};
