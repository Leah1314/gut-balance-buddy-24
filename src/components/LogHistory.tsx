
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Utensils, Scroll, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFoodLogs } from "@/hooks/useFoodLogs";
import { useStoolLogs } from "@/hooks/useStoolLogs";
import { format } from "date-fns";

interface LogEntry {
  id: string;
  type: 'food' | 'stool';
  timestamp: string;
  title: string;
  content: string;
  details?: any;
}

const LogHistory = () => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stoolLogs, setStoolLogs] = useState<any[]>([]);
  
  const { foodLogs, refreshFoodLogs } = useFoodLogs();
  const { getStoolLogs } = useStoolLogs();

  const fetchStoolLogs = async () => {
    try {
      const logs = await getStoolLogs();
      setStoolLogs(logs);
    } catch (error) {
      console.error('Error fetching stool logs:', error);
      setStoolLogs([]);
    }
  };

  const combineAndSortLogs = () => {
    const combinedLogs: LogEntry[] = [];

    // Add food logs
    if (foodLogs) {
      foodLogs.forEach(log => {
        combinedLogs.push({
          id: log.id,
          type: 'food',
          timestamp: log.created_at,
          title: 'Food Entry',
          content: log.food_name,
          details: {
            description: log.description,
            analysis_result: log.analysis_result,
            image_url: log.image_url
          }
        });
      });
    }

    // Add stool logs
    if (stoolLogs) {
      stoolLogs.forEach(log => {
        combinedLogs.push({
          id: log.id,
          type: 'stool',
          timestamp: log.created_at,
          title: 'Stool Entry',
          content: log.notes || `Bristol Type ${log.bristol_type || 'N/A'}`,
          details: {
            bristol_type: log.bristol_type,
            color: log.color,
            consistency: log.consistency,
            notes: log.notes,
            image_url: log.image_url
          }
        });
      });
    }

    // Sort by timestamp (newest first)
    combinedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setLogEntries(combinedLogs);
  };

  useEffect(() => {
    fetchStoolLogs();
  }, []);

  useEffect(() => {
    combineAndSortLogs();
  }, [foodLogs, stoolLogs]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshFoodLogs(), fetchStoolLogs()]);
    } catch (error) {
      console.error('Error refreshing logs:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return timestamp;
    }
  };

  const renderLogContent = (entry: LogEntry) => {
    if (entry.type === 'food') {
      return (
        <div className="space-y-2">
          <p className="font-medium">{entry.content}</p>
          {entry.details?.description && (
            <p className="text-sm text-gray-600">{entry.details.description}</p>
          )}
          {entry.details?.analysis_result && (
            <div className="text-sm">
              <p className="text-gray-700">
                🤖 AI Analysis: {typeof entry.details.analysis_result === 'string' 
                  ? entry.details.analysis_result 
                  : JSON.stringify(entry.details.analysis_result)}
              </p>
            </div>
          )}
        </div>
      );
    } else {
      const details = entry.details;
      return (
        <div className="space-y-2">
          {details?.notes && (
            <p className="font-medium">{details.notes}</p>
          )}
          {details?.bristol_type && (
            <p className="text-sm text-gray-600"><strong>Bristol Type:</strong> {details.bristol_type}</p>
          )}
          {details?.consistency && (
            <p className="text-sm text-gray-600"><strong>Consistency:</strong> {details.consistency}</p>
          )}
          {details?.color && (
            <p className="text-sm text-gray-600"><strong>Color:</strong> {details.color}</p>
          )}
          {typeof details?.analysis_result === 'string' && details.analysis_result.includes('AI Analysis') && (
            <div className="text-sm">
              <p className="text-gray-700">
                🤖 {details.analysis_result}
              </p>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold mb-1" style={{ color: '#2E2E2E' }}>
            Your Log History
          </h2>
          <p className="text-base leading-tight" style={{ color: '#2E2E2E', opacity: 0.6 }}>
            Track your food intake and digestive health over time
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          style={{
            borderColor: '#D3D3D3',
            color: '#2E2E2E',
            backgroundColor: 'transparent'
          }}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Log Entries */}
      <div className="space-y-4">
        {logEntries.length === 0 ? (
          <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                No logs found. Start tracking your food and digestive health!
              </p>
              <p className="text-sm text-gray-500">
                Use the "Food In" and "Stool Out" tabs to log your entries.
              </p>
            </CardContent>
          </Card>
        ) : (
          logEntries.map((entry) => (
            <Card key={entry.id} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full" 
                         style={{ backgroundColor: entry.type === 'food' ? '#E8F5E8' : '#E1F5FE' }}>
                      {entry.type === 'food' ? (
                        <Utensils className="w-5 h-5" style={{ color: '#4A7C59' }} />
                      ) : (
                        <Scroll className="w-5 h-5" style={{ color: '#2196F3' }} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: '#2E2E2E' }}>
                        {entry.title}
                      </h3>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${entry.type === 'food' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
                      >
                        {entry.type === 'food' ? 'Food Log' : 'Stool Log'}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: '#2E2E2E' }}>
                      {formatTimestamp(entry.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="text-left">
                  {renderLogContent(entry)}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default LogHistory;
