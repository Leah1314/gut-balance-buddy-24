
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Database, 
  Send, 
  CheckCircle, 
  XCircle, 
  Loader2,
  TestTube,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { useRAG } from "@/hooks/useRAG";
import { useTrackingRAG } from "@/hooks/useTrackingRAG";

const RAGTestingPanel = () => {
  const [testQuery, setTestQuery] = useState("");
  const [testData, setTestData] = useState("");
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'unknown' | 'healthy' | 'unavailable'>('unknown');
  const [testResults, setTestResults] = useState<any[]>([]);
  
  const { isLoading, checkUserData, retrieveUserData, ingestTrackData } = useRAG();
  const { updateRAGOnTrackingSave, isUpdating } = useTrackingRAG();

  const performHealthCheck = async () => {
    setIsHealthChecking(true);
    try {
      // Test basic RAG service connectivity
      const dataStatus = await checkUserData();
      
      if (dataStatus) {
        setHealthStatus('healthy');
        toast.success("RAG service is healthy and responsive");
      } else {
        setHealthStatus('unavailable');
        toast.error("RAG service is not responding");
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus('unavailable');
      toast.error("RAG service health check failed");
    } finally {
      setIsHealthChecking(false);
    }
  };

  const testDataIngestion = async () => {
    if (!testData.trim()) {
      toast.error("Please enter test data to ingest");
      return;
    }

    try {
      const testTrackingData = {
        type: 'food',
        food_name: 'Test Food',
        description: testData,
        notes: 'RAG test data',
        timestamp: new Date().toISOString()
      };

      const result = await updateRAGOnTrackingSave(testTrackingData, false);
      
      if (result?.success) {
        toast.success("Test data ingested successfully");
        setTestResults(prev => [...prev, {
          type: 'ingestion',
          status: 'success',
          data: testTrackingData,
          timestamp: new Date().toISOString()
        }]);
      } else {
        toast.error("Data ingestion failed");
        setTestResults(prev => [...prev, {
          type: 'ingestion',
          status: 'failed',
          error: result?.error,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Test ingestion failed:', error);
      toast.error("Test ingestion failed");
    }
  };

  const testDataRetrieval = async () => {
    if (!testQuery.trim()) {
      toast.error("Please enter a test query");
      return;
    }

    try {
      const results = await retrieveUserData(testQuery, 3);
      
      toast.success("Data retrieval completed");
      setTestResults(prev => [...prev, {
        type: 'retrieval',
        status: 'success',
        query: testQuery,
        results,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      console.error('Test retrieval failed:', error);
      toast.error("Test retrieval failed");
      setTestResults(prev => [...prev, {
        type: 'retrieval',
        status: 'failed',
        query: testQuery,
        error,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const clearTestResults = () => {
    setTestResults([]);
    toast.success("Test results cleared");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'unavailable': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-50 text-green-700 border-green-200';
      case 'unavailable': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>RAG Service Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(healthStatus)}
              <Badge className={getStatusColor(healthStatus)}>
                {healthStatus === 'healthy' ? 'Healthy' : 
                 healthStatus === 'unavailable' ? 'Unavailable' : 'Unknown'}
              </Badge>
            </div>
            <Button 
              onClick={performHealthCheck}
              disabled={isHealthChecking}
              variant="outline"
              size="sm"
            >
              {isHealthChecking ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <TestTube className="w-4 h-4 mr-2" />
              )}
              Health Check
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Ingestion Test */}
      <Card>
        <CardHeader>
          <CardTitle>Test Data Ingestion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter test data to ingest (e.g., 'Had a bowl of oatmeal with berries for breakfast')"
            value={testData}
            onChange={(e) => setTestData(e.target.value)}
            rows={3}
          />
          <Button 
            onClick={testDataIngestion}
            disabled={isUpdating || !testData.trim()}
            className="w-full"
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            Test Ingestion
          </Button>
        </CardContent>
      </Card>

      {/* Data Retrieval Test */}
      <Card>
        <CardHeader>
          <CardTitle>Test Data Retrieval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter test query (e.g., 'breakfast foods', 'recent meals')"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
          />
          <Button 
            onClick={testDataRetrieval}
            disabled={isLoading || !testQuery.trim()}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Search className="w-4 h-4 mr-2" />
            )}
            Test Retrieval
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Test Results</span>
              <Button 
                onClick={clearTestResults}
                variant="outline"
                size="sm"
              >
                Clear Results
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                      {result.type} - {result.status}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {result.query && (
                    <p className="text-sm mb-2"><strong>Query:</strong> {result.query}</p>
                  )}
                  
                  {result.results && (
                    <div className="text-sm">
                      <strong>Results:</strong>
                      <pre className="text-xs mt-1 p-2 bg-gray-50 rounded overflow-x-auto">
                        {JSON.stringify(result.results, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {result.error && (
                    <p className="text-sm text-red-600">
                      <strong>Error:</strong> {result.error.toString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RAGTestingPanel;
