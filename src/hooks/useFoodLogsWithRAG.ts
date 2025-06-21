
import { useFoodLogs as useOriginalFoodLogs } from './useFoodLogs';
import { useTrackingRAG } from './useTrackingRAG';

export const useFoodLogsWithRAG = () => {
  const originalHook = useOriginalFoodLogs();
  const { updateRAGOnTrackingSave } = useTrackingRAG();

  const addFoodLog = async (foodLogData: any) => {
    // Save to database first
    const result = await originalHook.addFoodLog(foodLogData);
    
    if (result) {
      // Update RAG with the food data
      const ragData = {
        type: 'food',
        food_name: foodLogData.food_name,
        description: foodLogData.description,
        notes: foodLogData.notes || `Added to food history`,
        timestamp: new Date().toISOString(),
        imageData: foodLogData.image_url ? foodLogData.image_url.split(',')[1] : null
      };

      await updateRAGOnTrackingSave(ragData, !!foodLogData.image_url);
    }

    return result;
  };

  return {
    ...originalHook,
    addFoodLog
  };
};
