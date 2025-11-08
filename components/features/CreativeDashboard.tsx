import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  saveImprovementRecord,
  getDailyRecords,
  getMonthlyAverages,
  getRecordByDate,
  type ImprovementRecord,
  type MonthlyAverages,
} from '../../services/improvementTracking';
import { useAuth } from '../../hooks/useAuth';

type ViewMode = 'daily' | 'monthly';

export const CreativeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [showLogForm, setShowLogForm] = useState(false);
  
  const [emotionalScore, setEmotionalScore] = useState(5);
  const [mentalScore, setMentalScore] = useState(5);
  const [physicalScore, setPhysicalScore] = useState(5);
  const [medicalScore, setMedicalScore] = useState(5);
  
  const [emotionalNotes, setEmotionalNotes] = useState('');
  const [mentalNotes, setMentalNotes] = useState('');
  const [physicalNotes, setPhysicalNotes] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [dailyRecords, setDailyRecords] = useState<ImprovementRecord[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyAverages[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const loadDailyRecords = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const records = await getDailyRecords(user.id, 30);
      setDailyRecords(records);
    } catch (error) {
      console.error('Error loading daily records:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMonthlyRecords = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const records = await getMonthlyAverages(user.id, 6);
      setMonthlyRecords(records);
    } catch (error) {
      console.error('Error loading monthly records:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayRecord = async () => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const record = await getRecordByDate(user.id, today);
    
    if (record) {
      setEmotionalScore(record.emotionalScore);
      setMentalScore(record.mentalScore);
      setPhysicalScore(record.physicalScore);
      setMedicalScore(record.medicalScore);
      setEmotionalNotes(record.emotionalNotes || '');
      setMentalNotes(record.mentalNotes || '');
      setPhysicalNotes(record.physicalNotes || '');
      setMedicalNotes(record.medicalNotes || '');
    }
  };

  useEffect(() => {
    if (user) {
      loadDailyRecords();
      loadMonthlyRecords();
      loadTodayRecord();
    }
  }, [user]);

  const handleSaveRecord = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await saveImprovementRecord(user.id, {
        recordDate: selectedDate,
        emotionalScore,
        mentalScore,
        physicalScore,
        medicalScore,
        emotionalNotes,
        mentalNotes,
        physicalNotes,
        medicalNotes,
      });
      
      setSaveMessage('Record saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      
      await loadDailyRecords();
      await loadMonthlyRecords();
      
      setShowLogForm(false);
    } catch (error) {
      console.error('Error saving record:', error);
      setSaveMessage('Error saving record. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const dailyChartData = dailyRecords.map(record => ({
    date: new Date(record.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Emotional: record.emotionalScore,
    Mental: record.mentalScore,
    Physical: record.physicalScore,
    Medical: record.medicalScore,
  }));

  const monthlyChartData = monthlyRecords.map(record => ({
    month: new Date(record.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    Emotional: record.emotionalAvg,
    Mental: record.mentalAvg,
    Physical: record.physicalAvg,
    Medical: record.medicalAvg,
  }));

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 p-6 overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Creative Dashboard
          </h1>
          <button
            onClick={() => setShowLogForm(!showLogForm)}
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
          >
            {showLogForm ? 'Hide Log Form' : 'Log Today\'s Progress'}
          </button>
        </div>

        {saveMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {saveMessage}
          </div>
        )}

        {showLogForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Log Daily Improvements</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-purple-600">
                    😊 Emotional Well-being
                  </label>
                  <span className="text-2xl font-bold text-purple-600">{emotionalScore}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={emotionalScore}
                  onChange={(e) => setEmotionalScore(Number(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <textarea
                  value={emotionalNotes}
                  onChange={(e) => setEmotionalNotes(e.target.value)}
                  placeholder="How are you feeling emotionally today? (optional)"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-blue-600">
                    🧠 Mental Clarity
                  </label>
                  <span className="text-2xl font-bold text-blue-600">{mentalScore}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mentalScore}
                  onChange={(e) => setMentalScore(Number(e.target.value))}
                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <textarea
                  value={mentalNotes}
                  onChange={(e) => setMentalNotes(e.target.value)}
                  placeholder="How is your mental clarity and focus? (optional)"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-green-600">
                    💪 Physical Health
                  </label>
                  <span className="text-2xl font-bold text-green-600">{physicalScore}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={physicalScore}
                  onChange={(e) => setPhysicalScore(Number(e.target.value))}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <textarea
                  value={physicalNotes}
                  onChange={(e) => setPhysicalNotes(e.target.value)}
                  placeholder="How is your physical health and energy? (optional)"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={2}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-pink-600">
                    🏥 Medical Progress
                  </label>
                  <span className="text-2xl font-bold text-pink-600">{medicalScore}/10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={medicalScore}
                  onChange={(e) => setMedicalScore(Number(e.target.value))}
                  className="w-full h-2 bg-pink-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <textarea
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="Any medical improvements or concerns? (optional)"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={2}
                />
              </div>
            </div>

            <button
              onClick={handleSaveRecord}
              disabled={loading}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Progress'}
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'daily'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Daily View (30 Days)
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'monthly'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Monthly View (6 Months)
            </button>
          </div>

          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-500">Loading your progress...</div>
            </div>
          )}

          {!loading && viewMode === 'daily' && (
            <>
              {dailyChartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p className="text-lg mb-2">No daily records yet</p>
                  <p className="text-sm">Start logging your daily progress to see your improvement graph!</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Emotional" stroke="#9333ea" strokeWidth={2} />
                    <Line type="monotone" dataKey="Mental" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Physical" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="Medical" stroke="#ec4899" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          )}

          {!loading && viewMode === 'monthly' && (
            <>
              {monthlyChartData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p className="text-lg mb-2">No monthly data yet</p>
                  <p className="text-sm">Keep logging daily to see your monthly averages!</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="Emotional" stroke="#9333ea" strokeWidth={2} />
                    <Line type="monotone" dataKey="Mental" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Physical" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="Medical" stroke="#ec4899" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </>
          )}
        </div>

        {dailyRecords.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Recent Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const latest = dailyRecords[dailyRecords.length - 1];
                return (
                  <>
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                      <div className="text-sm text-purple-600 font-medium">Emotional</div>
                      <div className="text-3xl font-bold text-purple-700">{latest.emotionalScore}/10</div>
                      {latest.emotionalNotes && (
                        <div className="text-xs text-gray-600 mt-2">{latest.emotionalNotes}</div>
                      )}
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                      <div className="text-sm text-blue-600 font-medium">Mental</div>
                      <div className="text-3xl font-bold text-blue-700">{latest.mentalScore}/10</div>
                      {latest.mentalNotes && (
                        <div className="text-xs text-gray-600 mt-2">{latest.mentalNotes}</div>
                      )}
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                      <div className="text-sm text-green-600 font-medium">Physical</div>
                      <div className="text-3xl font-bold text-green-700">{latest.physicalScore}/10</div>
                      {latest.physicalNotes && (
                        <div className="text-xs text-gray-600 mt-2">{latest.physicalNotes}</div>
                      )}
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-500">
                      <div className="text-sm text-pink-600 font-medium">Medical</div>
                      <div className="text-3xl font-bold text-pink-700">{latest.medicalScore}/10</div>
                      {latest.medicalNotes && (
                        <div className="text-xs text-gray-600 mt-2">{latest.medicalNotes}</div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
