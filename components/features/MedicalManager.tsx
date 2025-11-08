import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { fileToBase64 } from '../../utils/helpers';
import { analyzeMedicalDocument, MedicalAnalysisResult, generateMedicationCalendar, MedicationSchedule } from '../../services/medical';
import LoadingSpinner from '../ui/LoadingSpinner';
import MedicationCalendar from './MedicationCalendar';
import SafetyPrecautions from './SafetyPrecautions';

interface MedicalManagerProps {
  user: User;
}

interface StoredData {
  medications: MedicationSchedule[];
  precautions: Array<{
    id: string;
    recommendation: string;
    priority: 'high' | 'medium' | 'low';
    category: 'diet' | 'activity' | 'medication' | 'lifestyle';
    createdAt: string;
  }>;
}

const MedicalManager: React.FC<MedicalManagerProps> = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<'prescription' | 'medical_report'>('prescription');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MedicalAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'calendar' | 'safety'>('upload');
  const [storedData, setStoredData] = useState<StoredData>({ medications: [], precautions: [] });

  const storageKey = `kindred_medical_${user.name}`;

  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        setStoredData(JSON.parse(savedData));
      } catch (error) {
        console.error('Failed to load medical data:', error);
      }
    }
  }, [storageKey]);

  const saveData = (data: StoredData) => {
    setStoredData(data);
    localStorage.setItem(storageKey, JSON.stringify(data));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf'];
      if (validTypes.some(type => file.type === type || file.type.startsWith('image/'))) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please select an image (PNG, JPEG, WEBP) or PDF file');
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(selectedFile);
      const result = await analyzeMedicalDocument(base64Data, selectedFile.type, documentType);
      
      setAnalysisResult(result);

      // Add new data to existing data
      const newMedications = [...storedData.medications, ...result.medications];
      const newPrecautions = [
        ...storedData.precautions,
        ...result.safetyPrecautions.map((p, i) => ({
          id: `${Date.now()}-${i}`,
          ...p,
          createdAt: new Date().toISOString()
        }))
      ];

      saveData({
        medications: newMedications,
        precautions: newPrecautions
      });
      
      setActiveTab('calendar');
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze document. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4 sm:p-6 lg:p-8 overflow-y-auto" style={{
      background: 'linear-gradient(135deg, rgba(10, 20, 30, 0.95) 0%, rgba(15, 25, 35, 0.95) 100%)'
    }}>
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Warm Header */}
        <div className="glass-card p-6 sm:p-8 border-emerald-500/30">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🏥</span>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold gradient-text" style={{
                background: 'linear-gradient(135deg, #00ff88 0%, #00d9ff 50%, #ff3366 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Medical Manager
              </h2>
              <p className="text-gray-400 text-lg mt-1">Manage your medications and health safely</p>
            </div>
          </div>
        </div>

        {/* Large, Accessible Tabs */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-8 py-4 text-lg rounded-xl font-medium transition-all shadow-md hover:scale-105 ${
              activeTab === 'upload'
                ? 'text-white'
                : 'glass-card border-emerald-500/20 text-emerald-300 hover:border-emerald-500/40'
            }`}
            style={{
              background: activeTab === 'upload' 
                ? 'linear-gradient(135deg, #00ff88, #00d9ff)'
                : undefined
            }}
          >
            📤 Upload Document
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-8 py-4 text-lg rounded-xl font-medium transition-all shadow-md hover:scale-105 ${
              activeTab === 'calendar'
                ? 'text-white'
                : 'glass-card border-emerald-500/20 text-emerald-300 hover:border-emerald-500/40'
            }`}
            style={{
              background: activeTab === 'calendar' 
                ? 'linear-gradient(135deg, #00ff88, #00d9ff)'
                : undefined
            }}
          >
            📅 My Medications
          </button>
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-8 py-4 text-lg rounded-xl font-medium transition-all shadow-md hover:scale-105 ${
              activeTab === 'safety'
                ? 'text-white'
                : 'glass-card border-emerald-500/20 text-emerald-300 hover:border-emerald-500/40'
            }`}
            style={{
              background: activeTab === 'safety' 
                ? 'linear-gradient(135deg, #00ff88, #00d9ff)'
                : undefined
            }}
          >
            ⚕️ Safety Info
          </button>
        </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'upload' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Document Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-purple-300">Document Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="prescription"
                    checked={documentType === 'prescription'}
                    onChange={(e) => setDocumentType(e.target.value as 'prescription')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-white">💊 Prescription</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="medical_report"
                    checked={documentType === 'medical_report'}
                    onChange={(e) => setDocumentType(e.target.value as 'medical_report')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-white">📋 Medical Report</span>
                </label>
              </div>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center bg-black/20">
              <input
                type="file"
                accept="image/*,.pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="medical-file-upload"
              />
              <label
                htmlFor="medical-file-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <div className="text-6xl">
                  {selectedFile?.type === 'application/pdf' ? '📑' : '📄'}
                </div>
                <div className="text-purple-300 font-medium">
                  {selectedFile ? selectedFile.name : 'Click to upload a document'}
                </div>
                <div className="text-sm text-gray-400">
                  Supported: Images (PNG, JPG, JPEG, WEBP) and PDF files
                </div>
                <div className="text-xs text-cyan-400 mt-2">
                  💡 Tip: For DOCX files, please convert to PDF first
                </div>
              </label>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300">
                {error}
              </div>
            )}

            {selectedFile && (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <LoadingSpinner size="w-5 h-5" />
                    <span>Analyzing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <span>🤖</span>
                    <span>Analyze with Gemini AI</span>
                  </>
                )}
              </button>
            )}

            {analysisResult && (
              <div className="p-6 bg-black/30 border border-purple-500/30 rounded-lg space-y-4">
                <h3 className="text-lg font-semibold text-purple-300">Analysis Complete ✓</h3>
                <div className="text-white space-y-2">
                  <p className="font-medium">Summary:</p>
                  <p className="text-gray-300">{analysisResult.summary}</p>
                  
                  {analysisResult.medications.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-purple-300">Medications Found: {analysisResult.medications.length}</p>
                    </div>
                  )}
                  
                  {analysisResult.safetyPrecautions.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-pink-300">Safety Precautions: {analysisResult.safetyPrecautions.length}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'calendar' && (
          <MedicationCalendar userId={user.name} medications={storedData.medications} />
        )}

        {activeTab === 'safety' && (
          <SafetyPrecautions userId={user.name} precautions={storedData.precautions} />
        )}
      </div>
      </div>
    </div>
  );
};

export default MedicalManager;
