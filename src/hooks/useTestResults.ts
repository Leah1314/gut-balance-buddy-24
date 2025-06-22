
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface TestResult {
  id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  test_type?: string;
  key_findings?: string[];
  test_values?: any;
  recommendations?: string[];
  concern_level?: string;
  summary?: string;
  raw_analysis?: any;
  created_at: string;
  updated_at: string;
}

export const useTestResults = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchTestResults = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestResults(data || []);
    } catch (error: any) {
      console.error('Error fetching test results:', error);
      toast.error('Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  const deleteTestResult = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('test_results')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setTestResults(prev => prev.filter(result => result.id !== id));
      toast.success('Test result deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Error deleting test result:', error);
      toast.error('Failed to delete test result');
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchTestResults();
    }
  }, [user]);

  return {
    testResults,
    loading,
    fetchTestResults,
    deleteTestResult
  };
};
