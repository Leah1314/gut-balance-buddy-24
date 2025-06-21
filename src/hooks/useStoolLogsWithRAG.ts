
import { useStoolLogs as useOriginalStoolLogs } from './useStoolLogs';
import { useTrackingRAG } from './useTrackingRAG';

export const useStoolLogs = () => {
  const originalHook = useOriginalStoolLogs();
  const { updateRAGOnTrackingSave } = useTrackingRAG();

  const addStoolLog = async (stoolLogData: any) => {
    // Save to database first
    const result = await originalHook.addStoolLog(stoolLogData);
    
    if (result) {
      // Update RAG with the stool data
      const ragData = {
        type: 'stool',
        bristol_type: stoolLogData.bristol_type,
        consistency: stoolLogData.consistency,
        color: stoolLogData.color,
        notes: stoolLogData.notes,
        timestamp: new Date().toISOString(),
        imageData: stoolLogData.image_url ? stoolLogData.image_url.split(',')[1] : null
      };

      await updateRAGOnTrackingSave(ragData, !!stoolLogData.image_url);
    }

    return result;
  };

  return {
    ...originalHook,
    addStoolLog
  };
};
