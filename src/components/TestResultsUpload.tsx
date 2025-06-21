
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileImage, Upload, Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  testType: string;
  keyFindings: string[];
  values: Array<{
    parameter: string;
    value: string;
    unit: string;
    referenceRange: string;
    status: string;
  }>;
  recommendations: string[];
  concernLevel: string;
  summary: string;
}

const TestResultsUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TestResult | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setAnalysisResult(null);
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  const analyzeTestResults = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1];

        const { data, error } = await supabase.functions.invoke('analyze-test-results', {
          body: { image: base64Data }
        });

        if (error) {
          console.error('Error analyzing test results:', error);
          toast.error("Failed to analyze test results");
          return;
        }

        setAnalysisResult(data);
        toast.success("Test results analyzed successfully!");
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error analyzing test results:', error);
      toast.error("Failed to analyze test results");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConcernLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'high': return 'text-red-400';
      default: return 'text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return 'text-green-400';
      case 'high': return 'text-red-400';
      case 'low': return 'text-orange-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-sm" style={{ borderColor: '#D3D3D3' }}>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2" style={{ color: '#2E2E2E' }}>
            <FileImage className="w-5 h-5" style={{ color: '#4A7C59' }} />
            Upload Test Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="test-image">Select Test Result Image</Label>
            <Input
              id="test-image"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mt-1 bg-gray-600 text-white border-gray-500 file:bg-gray-700 file:text-white file:border-0"
            />
            {selectedFile && (
              <p className="text-sm mt-1" style={{ color: '#4A7C59' }}>
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
          
          <Button
            onClick={analyzeTestResults}
            disabled={!selectedFile || isAnalyzing}
            className="w-full text-white font-medium"
            style={{ backgroundColor: '#4A7C59' }}
            onMouseEnter={(e) => {
              if (!isAnalyzing && selectedFile) {
                e.currentTarget.style.backgroundColor = '#5B8C6B';
              }
            }}
            onMouseLeave={(e) => {
              if (!isAnalyzing && selectedFile) {
                e.currentTarget.style.backgroundColor = '#4A7C59';
              }
            }}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Analyze Test Results
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card className="bg-gray-800 shadow-sm border border-gray-600">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-white">Test Type: {analysisResult.testType}</h4>
              <p className="text-sm text-white">
                {analysisResult.summary}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-white" />
              <span className="font-medium text-white">Concern Level: </span>
              <span className={`font-semibold ${getConcernLevelColor(analysisResult.concernLevel)}`}>
                {analysisResult.concernLevel.charAt(0).toUpperCase() + analysisResult.concernLevel.slice(1)}
              </span>
            </div>

            {analysisResult.values && analysisResult.values.length > 0 && (
              <div>
                <h5 className="font-semibold mb-2 text-white">Test Values:</h5>
                <div className="space-y-2">
                  {analysisResult.values.map((value, index) => (
                    <div key={index} className="bg-gray-700 p-3 rounded-md border border-gray-600">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-white">{value.parameter}</span>
                        <span className={`font-semibold ${getStatusColor(value.status)}`}>
                          {value.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm text-white">
                        Value: {value.value} {value.unit}
                      </div>
                      <div className="text-sm text-white">
                        Reference: {value.referenceRange}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.keyFindings && analysisResult.keyFindings.length > 0 && (
              <div>
                <h5 className="font-semibold mb-2 text-white">Key Findings:</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {analysisResult.keyFindings.map((finding, index) => (
                    <li key={index} className="text-sm text-white">
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div>
                <h5 className="font-semibold mb-2 text-white">Recommendations:</h5>
                <ul className="list-disc pl-5 space-y-1">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-white">
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestResultsUpload;
