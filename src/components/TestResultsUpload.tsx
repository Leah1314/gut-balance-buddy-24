

import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileImage, FileText, Search, Loader2, CheckCircle, AlertTriangle, Info, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TestResult | null>(null);
  const [savedResultId, setSavedResultId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setSelectedFile(file);
        setAnalysisResult(null);
        setSavedResultId(null);
        
        // Show info toast for PDF files
        if (file.type === 'application/pdf') {
          toast.info("PDF files have limited analysis. For best results, please upload an image (JPG/PNG) of your test results.", {
            duration: 5000
          });
        }
      } else {
        toast.error("Please select an image (JPG, PNG) or PDF file");
      }
    }
  };

  const saveTestResultToDatabase = async (result: TestResult) => {
    if (!user || !selectedFile) return null;

    setIsSaving(true);
    try {
      console.log('Saving test result to database...');
      
      // Prepare the data for insertion - let database handle timestamps
      const insertData = {
        user_id: user.id,
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        test_type: result.testType,
        key_findings: result.keyFindings,
        test_values: result.values as any,
        recommendations: result.recommendations,
        concern_level: result.concernLevel,
        summary: result.summary,
        raw_analysis: result as any
      };

      const { data, error } = await supabase
        .from('test_results')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error saving test result:', error);
        toast.error("Failed to save test result to database");
        return null;
      }

      console.log('Test result saved to database:', data);
      setSavedResultId(data.id);
      toast.success("Test result saved successfully!");
      return data;
    } catch (error) {
      console.error('Error saving test result:', error);
      toast.error("Failed to save test result");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const analyzeTestResults = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to analyze test results");
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log('Starting test results analysis...');
      
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const base64 = e.target?.result as string;
          const base64Data = base64.split(',')[1];

          console.log('Calling analyze-test-results function...');
          console.log('File type:', selectedFile.type);
          
          const { data, error } = await supabase.functions.invoke('analyze-test-results', {
            body: { 
              image: base64Data,
              fileType: selectedFile.type
            }
          });

          if (error) {
            console.error('Error analyzing test results:', error);
            toast.error(`Failed to analyze test results: ${error.message || 'Unknown error'}`);
            return;
          }

          console.log('Analysis result received:', data);
          
          if (!data) {
            toast.error("No analysis data received");
            return;
          }

          setAnalysisResult(data);
          toast.success("Test results analyzed successfully! You can now save them to your database.");
          
        } catch (innerError) {
          console.error('Error in file processing:', innerError);
          toast.error("Failed to process the file");
        } finally {
          setIsAnalyzing(false);
        }
      };

      reader.onerror = () => {
        console.error('Error reading file');
        toast.error("Failed to read the file");
        setIsAnalyzing(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Error in analyzeTestResults:', error);
      toast.error("Failed to analyze test results");
      setIsAnalyzing(false);
    }
  };

  const getConcernLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return 'text-green-600';
      case 'high': return 'text-red-600';
      case 'low': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-gray-900">
            <FileText className="w-4 h-4 text-blue-600" />
            {t('health.uploadTestResults')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="test-file" className="text-sm font-medium text-gray-700">
              {t('health.selectTestResultFile')}
            </Label>
            <Input
              id="test-file"
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="mt-1 h-10 text-sm"
            />
            {selectedFile && (
              <div className="flex items-center gap-2 mt-2">
                {selectedFile.type === 'application/pdf' ? (
                  <FileText className="w-4 h-4 text-blue-600" />
                ) : (
                  <FileImage className="w-4 h-4 text-blue-600" />
                )}
                <p className="text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </p>
              </div>
            )}
            
            {selectedFile?.type === 'application/pdf' && (
              <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  <strong>PDF Note:</strong> For best analysis results, consider taking a clear photo of your test results instead of uploading a PDF.
                </p>
              </div>
            )}
          </div>
          
          <Button
            onClick={analyzeTestResults}
            disabled={!selectedFile || isAnalyzing || !user}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-10"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('health.analyzing')}
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                {t('health.analyzeTestResults')}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysisResult && (
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Analysis Results
              </CardTitle>
              {savedResultId && (
                <div className="text-xs text-gray-500">
                  Saved: {new Date().toLocaleString()}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-gray-900 mb-1">
                Test Type: {analysisResult.testType}
              </h4>
              <p className="text-sm text-gray-600">
                {analysisResult.summary}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-600" />
              <span className="font-medium text-sm text-gray-900">Concern Level: </span>
              <span className={`font-semibold text-sm ${getConcernLevelColor(analysisResult.concernLevel)}`}>
                {analysisResult.concernLevel.charAt(0).toUpperCase() + analysisResult.concernLevel.slice(1)}
              </span>
            </div>

            {analysisResult.values && analysisResult.values.length > 0 && (
              <div>
                <h5 className="font-semibold text-sm text-gray-900 mb-2">Test Values:</h5>
                <div className="space-y-2">
                  {analysisResult.values.map((value, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm text-gray-900">{value.parameter}</span>
                        <span className={`font-semibold text-xs px-2 py-1 rounded ${getStatusColor(value.status)}`}>
                          {value.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Value: {value.value} {value.unit}
                      </div>
                      <div className="text-xs text-gray-600">
                        Reference: {value.referenceRange}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysisResult.keyFindings && analysisResult.keyFindings.length > 0 && (
              <div>
                <h5 className="font-semibold text-sm text-gray-900 mb-2">Key Findings:</h5>
                <ul className="list-disc pl-4 space-y-1">
                  {analysisResult.keyFindings.map((finding, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {finding}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
              <div>
                <h5 className="font-semibold text-sm text-gray-900 mb-2">Recommendations:</h5>
                <ul className="list-disc pl-4 space-y-1">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!savedResultId && (
              <div className="pt-3 border-t border-gray-200">
                <Button
                  onClick={() => saveTestResultToDatabase(analysisResult)}
                  disabled={isSaving}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium h-10"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save to Database
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestResultsUpload;

