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
import {
  generateWeeklyReport,
  getWeeklyReports,
  generateMonthlyReport,
  getMonthlyReports,
  type WeeklyReport,
  type MonthlyReport,
} from '../../services/weeklyAnalysis';
import { useAuth } from '../../hooks/useAuth';

type ViewMode = 'daily' | 'monthly';

export const CreativeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [showLogForm, setShowLogForm] = useState(false);
  const [showWeeklyInsights, setShowWeeklyInsights] = useState(false);
  const [showMonthlyReports, setShowMonthlyReports] = useState(false);
  
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
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [monthlyReportsList, setMonthlyReportsList] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
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

  const loadWeeklyReports = async () => {
    if (!user) return;
    try {
      const reports = await getWeeklyReports(user.id, 10);
      setWeeklyReports(reports);
    } catch (error) {
      console.error('Error loading weekly reports:', error);
    }
  };

  const loadMonthlyReportsList = async () => {
    if (!user) return;
    try {
      const reports = await getMonthlyReports(user.id);
      setMonthlyReportsList(reports);
    } catch (error) {
      console.error('Error loading monthly reports:', error);
    }
  };

  const handleGenerateWeeklyReport = async () => {
    if (!user) return;
    setGeneratingReport(true);
    try {
      await generateWeeklyReport(user.id);
      await loadWeeklyReports();
      setSaveMessage('Weekly report generated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      setShowWeeklyInsights(true);
    } catch (error: any) {
      console.error('Error generating weekly report:', error);
      setSaveMessage(error.message || 'Error generating report. Please try again.');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleGenerateMonthlyReport = async () => {
    if (!user) return;
    setGeneratingReport(true);
    const currentMonth = new Date().toISOString().substring(0, 7);
    try {
      await generateMonthlyReport(user.id, currentMonth);
      await loadMonthlyReportsList();
      setSaveMessage('Monthly report generated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
      setShowMonthlyReports(true);
    } catch (error: any) {
      console.error('Error generating monthly report:', error);
      setSaveMessage(error.message || 'Error generating monthly report. Please try again.');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setGeneratingReport(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDailyRecords();
      loadMonthlyRecords();
      loadTodayRecord();
      loadWeeklyReports();
      loadMonthlyReportsList();
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

  const getEncouragingMessage = (score: number) => {
    if (score >= 8) return "You're doing amazingly well! 🌟";
    if (score >= 6) return "You're making great progress! 💪";
    if (score >= 4) return "Every step forward counts! 🌱";
    return "Tomorrow is a new day full of possibilities! 🌅";
  };

  const latestRecord = dailyRecords.length > 0 ? dailyRecords[dailyRecords.length - 1] : null;

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto" style={{
      background: 'linear-gradient(135deg, rgba(10, 20, 30, 0.95) 0%, rgba(15, 25, 35, 0.95) 100%)'
    }}>
      <div className="max-w-7xl mx-auto w-full space-y-6">
        {/* Warm Welcome Header */}
        <div className="glass-card p-6 sm:p-8 border-emerald-500/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2" style={{
                background: 'linear-gradient(135deg, #00ff88 0%, #00d9ff 50%, #ff3366 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Your Wellness Journey 🌱
              </h1>
              <p className="text-gray-400 text-lg">Track your daily progress and celebrate every step forward</p>
            </div>
            <button
              onClick={() => setShowLogForm(!showLogForm)}
              className="btn-primary text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
              style={{
                background: showLogForm 
                  ? 'linear-gradient(135deg, #ff3366, #ff6b9d)'
                  : 'linear-gradient(135deg, #00ff88, #00d9ff)',
                minWidth: '200px'
              }}
            >
              {showLogForm ? '✕ Close Form' : '✨ Log Today'}
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {saveMessage && (
          <div className="glass-card p-6 border-emerald-500/50 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✨</span>
              <p className="text-emerald-300 text-lg font-medium">{saveMessage}</p>
            </div>
          </div>
        )}

        {/* Log Form - Therapeutic Design */}
        {showLogForm && (
          <div className="glass-card p-6 sm:p-8 border-emerald-500/30 space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="text-4xl">📝</div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-emerald-300">How Are You Feeling Today?</h2>
                <p className="text-gray-400 mt-1">Your feelings matter. Track your progress, one day at a time.</p>
              </div>
            </div>
            
            {/* Date Selector */}
            <div>
              <label className="block text-lg font-medium text-emerald-300 mb-3">
                📅 Select Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="input-glass w-full px-6 py-4 text-lg rounded-xl"
              />
            </div>

            {/* Wellness Trackers - Large, Accessible Design */}
            <div className="space-y-8">
              {/* Emotional Well-being */}
              <div className="glass-card p-6 border-l-4" style={{borderLeftColor: '#a855f7'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">😊</span>
                    <label className="text-xl sm:text-2xl font-bold text-purple-400">
                      Emotional Well-being
                    </label>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl sm:text-5xl font-bold gradient-text" style={{
                      background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {emotionalScore}
                    </div>
                    <div className="text-sm text-purple-300">{getEncouragingMessage(emotionalScore)}</div>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={emotionalScore}
                  onChange={(e) => setEmotionalScore(Number(e.target.value))}
                  className="w-full h-4 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #ec4899 ${emotionalScore * 10}%, rgba(255,255,255,0.1) ${emotionalScore * 10}%)`
                  }}
                />
                <textarea
                  value={emotionalNotes}
                  onChange={(e) => setEmotionalNotes(e.target.value)}
                  placeholder="How are you feeling emotionally? Share your thoughts... (optional)"
                  className="input-glass w-full mt-4 px-4 py-3 text-base rounded-xl"
                  rows={3}
                />
              </div>

              {/* Mental Clarity */}
              <div className="glass-card p-6 border-l-4" style={{borderLeftColor: '#3b82f6'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🧠</span>
                    <label className="text-xl sm:text-2xl font-bold text-blue-400">
                      Mental Clarity
                    </label>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl sm:text-5xl font-bold gradient-text" style={{
                      background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {mentalScore}
                    </div>
                    <div className="text-sm text-blue-300">{getEncouragingMessage(mentalScore)}</div>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={mentalScore}
                  onChange={(e) => setMentalScore(Number(e.target.value))}
                  className="w-full h-4 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #06b6d4 ${mentalScore * 10}%, rgba(255,255,255,0.1) ${mentalScore * 10}%)`
                  }}
                />
                <textarea
                  value={mentalNotes}
                  onChange={(e) => setMentalNotes(e.target.value)}
                  placeholder="How is your mental clarity and focus today? (optional)"
                  className="input-glass w-full mt-4 px-4 py-3 text-base rounded-xl"
                  rows={3}
                />
              </div>

              {/* Physical Health */}
              <div className="glass-card p-6 border-l-4" style={{borderLeftColor: '#22c55e'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">💪</span>
                    <label className="text-xl sm:text-2xl font-bold text-green-400">
                      Physical Health
                    </label>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl sm:text-5xl font-bold gradient-text" style={{
                      background: 'linear-gradient(135deg, #22c55e, #10b981)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {physicalScore}
                    </div>
                    <div className="text-sm text-green-300">{getEncouragingMessage(physicalScore)}</div>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={physicalScore}
                  onChange={(e) => setPhysicalScore(Number(e.target.value))}
                  className="w-full h-4 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #22c55e 0%, #10b981 ${physicalScore * 10}%, rgba(255,255,255,0.1) ${physicalScore * 10}%)`
                  }}
                />
                <textarea
                  value={physicalNotes}
                  onChange={(e) => setPhysicalNotes(e.target.value)}
                  placeholder="How is your physical health and energy? (optional)"
                  className="input-glass w-full mt-4 px-4 py-3 text-base rounded-xl"
                  rows={3}
                />
              </div>

              {/* Medical Progress */}
              <div className="glass-card p-6 border-l-4" style={{borderLeftColor: '#f472b6'}}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">🏥</span>
                    <label className="text-xl sm:text-2xl font-bold text-pink-400">
                      Medical Progress
                    </label>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl sm:text-5xl font-bold gradient-text" style={{
                      background: 'linear-gradient(135deg, #f472b6, #ec4899)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      {medicalScore}
                    </div>
                    <div className="text-sm text-pink-300">{getEncouragingMessage(medicalScore)}</div>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={medicalScore}
                  onChange={(e) => setMedicalScore(Number(e.target.value))}
                  className="w-full h-4 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f472b6 0%, #ec4899 ${medicalScore * 10}%, rgba(255,255,255,0.1) ${medicalScore * 10}%)`
                  }}
                />
                <textarea
                  value={medicalNotes}
                  onChange={(e) => setMedicalNotes(e.target.value)}
                  placeholder="How is your medical progress? Any improvements or concerns? (optional)"
                  className="input-glass w-full mt-4 px-4 py-3 text-base rounded-xl"
                  rows={3}
                />
              </div>
            </div>

            {/* Save Button - Large & Encouraging */}
            <button
              onClick={handleSaveRecord}
              disabled={loading}
              className="w-full mt-8 px-8 py-5 text-xl font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: loading 
                  ? 'linear-gradient(135deg, #6b7280, #9ca3af)'
                  : 'linear-gradient(135deg, #00ff88, #00d9ff)'
              }}
            >
              {loading ? '💫 Saving Your Progress...' : '✨ Save My Progress'}
            </button>
          </div>
        )}

        {/* Progress Charts - Visual & Encouraging */}
        <div className="glass-card p-6 sm:p-8 border-emerald-500/30">
          <h2 className="text-2xl sm:text-3xl font-bold text-emerald-300 mb-6">📊 Your Progress Over Time</h2>
          
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-6 py-3 text-lg rounded-xl font-medium transition-all shadow-md hover:scale-105 ${
                viewMode === 'daily'
                  ? 'text-white'
                  : 'glass-card border-emerald-500/20 text-emerald-300 hover:border-emerald-500/40'
              }`}
              style={{
                background: viewMode === 'daily' 
                  ? 'linear-gradient(135deg, #00ff88, #00d9ff)'
                  : undefined
              }}
            >
              📅 Last 30 Days
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-6 py-3 text-lg rounded-xl font-medium transition-all shadow-md hover:scale-105 ${
                viewMode === 'monthly'
                  ? 'text-white'
                  : 'glass-card border-emerald-500/20 text-emerald-300 hover:border-emerald-500/40'
              }`}
              style={{
                background: viewMode === 'monthly' 
                  ? 'linear-gradient(135deg, #00ff88, #00d9ff)'
                  : undefined
              }}
            >
              📈 Last 6 Months
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

        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">🤖 AI Weekly Insights</h3>
            <div className="flex gap-3">
              <button
                onClick={handleGenerateWeeklyReport}
                disabled={generatingReport}
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingReport ? 'Generating...' : 'Generate Weekly Report'}
              </button>
              <button
                onClick={() => setShowWeeklyInsights(!showWeeklyInsights)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                {showWeeklyInsights ? 'Hide' : 'Show'} Reports
              </button>
            </div>
          </div>

          {showWeeklyInsights && weeklyReports.length > 0 && (
            <div className="space-y-4 mt-4">
              {weeklyReports.slice(0, 3).map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Week of {new Date(report.weekStartDate).toLocaleDateString()} - {new Date(report.weekEndDate).toLocaleDateString()}
                    </h4>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Emotional: {report.emotionalAverage}/10</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Mental: {report.mentalAverage}/10</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Physical: {report.physicalAverage}/10</span>
                      <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded">Medical: {report.medicalAverage}/10</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-sm font-medium text-purple-800 mb-1">😊 Emotional Summary</p>
                      <p className="text-sm text-gray-700">{report.emotionalSummary}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium text-blue-800 mb-1">🧠 Mental Summary</p>
                      <p className="text-sm text-gray-700">{report.mentalSummary}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm font-medium text-green-800 mb-1">💪 Physical Summary</p>
                      <p className="text-sm text-gray-700">{report.physicalSummary}</p>
                    </div>
                    <div className="bg-pink-50 p-3 rounded">
                      <p className="text-sm font-medium text-pink-800 mb-1">🏥 Medical Summary</p>
                      <p className="text-sm text-gray-700">{report.medicalSummary}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium text-gray-800 mb-2">📊 Overall Summary</p>
                    <p className="text-sm text-gray-700">{report.overallSummary}</p>
                  </div>

                  {report.conversationInsights && (
                    <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                      <p className="text-sm font-medium text-indigo-800 mb-2">💬 Conversation Insights</p>
                      <p className="text-sm text-gray-700">{report.conversationInsights}</p>
                    </div>
                  )}

                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium text-yellow-800 mb-2">💡 Recommendations for Next Week</p>
                    <div className="text-sm text-gray-700 whitespace-pre-line">{report.recommendations}</div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-800 mb-2">✅ Action Items</p>
                    <div className="text-sm text-gray-700 whitespace-pre-line">{report.actionItems}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showWeeklyInsights && weeklyReports.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg mb-2">No weekly reports yet</p>
              <p className="text-sm">Generate your first weekly report to get AI-powered insights!</p>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800">📅 Monthly Status Reports</h3>
            <div className="flex gap-3">
              <button
                onClick={handleGenerateMonthlyReport}
                disabled={generatingReport}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingReport ? 'Generating...' : 'Generate Monthly Report'}
              </button>
              <button
                onClick={() => setShowMonthlyReports(!showMonthlyReports)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                {showMonthlyReports ? 'Hide' : 'Show'} Reports
              </button>
            </div>
          </div>

          {showMonthlyReports && monthlyReportsList.length > 0 && (
            <div className="space-y-4 mt-4">
              {monthlyReportsList.slice(0, 3).map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {new Date(report.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h4>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">Emotional: {report.emotionalAverage}/10</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Mental: {report.mentalAverage}/10</span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Physical: {report.physicalAverage}/10</span>
                      <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded">Medical: {report.medicalAverage}/10</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium text-gray-800 mb-2">📊 Monthly Overview ({report.weeklyReportsCount} weeks tracked)</p>
                    <p className="text-sm text-gray-700">{report.overallSummary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-purple-50 p-3 rounded">
                      <p className="text-sm font-medium text-purple-800 mb-1">Emotional Journey</p>
                      <p className="text-sm text-gray-700">{report.emotionalSummary}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium text-blue-800 mb-1">Mental Patterns</p>
                      <p className="text-sm text-gray-700">{report.mentalSummary}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded">
                      <p className="text-sm font-medium text-green-800 mb-1">Physical Health</p>
                      <p className="text-sm text-gray-700">{report.physicalSummary}</p>
                    </div>
                    <div className="bg-pink-50 p-3 rounded">
                      <p className="text-sm font-medium text-pink-800 mb-1">Medical Progress</p>
                      <p className="text-sm text-gray-700">{report.medicalSummary}</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium text-blue-800 mb-2">📈 Trends</p>
                    <div className="text-sm text-gray-700 whitespace-pre-line">{report.trends}</div>
                  </div>

                  {report.achievements && (
                    <div className="bg-green-50 p-4 rounded-lg mb-4">
                      <p className="text-sm font-medium text-green-800 mb-2">🎉 Achievements</p>
                      <div className="text-sm text-gray-700 whitespace-pre-line">{report.achievements}</div>
                    </div>
                  )}

                  {report.areasForImprovement && (
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm font-medium text-yellow-800 mb-2">🎯 Areas for Growth</p>
                      <div className="text-sm text-gray-700 whitespace-pre-line">{report.areasForImprovement}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {showMonthlyReports && monthlyReportsList.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-lg mb-2">No monthly reports yet</p>
              <p className="text-sm">Generate weekly reports first, then create monthly summaries!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
