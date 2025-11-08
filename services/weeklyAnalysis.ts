import { GoogleGenAI } from '@google/genai';
import { getDailyRecords, type ImprovementRecord } from './improvementTracking';
import { getChatHistory, type ChatDay } from './chatHistory';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY;
const genAI = new GoogleGenAI({ apiKey: API_KEY! });

export interface WeeklyReport {
  id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  emotionalSummary: string;
  mentalSummary: string;
  physicalSummary: string;
  medicalSummary: string;
  overallSummary: string;
  emotionalAverage: number;
  mentalAverage: number;
  physicalAverage: number;
  medicalAverage: number;
  recommendations: string;
  actionItems: string;
  conversationInsights: string;
  createdAt: Date;
}

export interface MonthlyReport {
  id: string;
  userId: string;
  month: string;
  emotionalSummary: string;
  mentalSummary: string;
  physicalSummary: string;
  medicalSummary: string;
  overallSummary: string;
  emotionalAverage: number;
  mentalAverage: number;
  physicalAverage: number;
  medicalAverage: number;
  weeklyReportsCount: number;
  trends: string;
  achievements: string;
  areasForImprovement: string;
  createdAt: Date;
}

const WEEKLY_REPORTS_STORAGE_KEY = 'kindred_weekly_reports_';
const MONTHLY_REPORTS_STORAGE_KEY = 'kindred_monthly_reports_';

const getWeekDates = (): { startDate: string; endDate: string } => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - diff);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return {
    startDate: weekStart.toISOString().split('T')[0],
    endDate: weekEnd.toISOString().split('T')[0],
  };
};

export const generateWeeklyReport = async (userId: string): Promise<WeeklyReport> => {
  try {
    const { startDate, endDate } = getWeekDates();
    
    const improvementRecords = await getDailyRecords(userId, 7);
    
    const chatHistory = await getChatHistory(userId, 7);
    
    if (improvementRecords.length === 0) {
      throw new Error('No improvement data found for this week. Please log at least one day before generating a report.');
    }
    
    const emotionalScores = improvementRecords.map(r => r.emotionalScore);
    const mentalScores = improvementRecords.map(r => r.mentalScore);
    const physicalScores = improvementRecords.map(r => r.physicalScore);
    const medicalScores = improvementRecords.map(r => r.medicalScore);
    
    const emotionalAvg = Math.round(emotionalScores.reduce((a, b) => a + b, 0) / emotionalScores.length);
    const mentalAvg = Math.round(mentalScores.reduce((a, b) => a + b, 0) / mentalScores.length);
    const physicalAvg = Math.round(physicalScores.reduce((a, b) => a + b, 0) / physicalScores.length);
    const medicalAvg = Math.round(medicalScores.reduce((a, b) => a + b, 0) / medicalScores.length);
    
    const improvementDataText = improvementRecords.map(record => {
      return `Date: ${record.recordDate}
- Emotional: ${record.emotionalScore}/10 ${record.emotionalNotes ? `(${record.emotionalNotes})` : ''}
- Mental: ${record.mentalScore}/10 ${record.mentalNotes ? `(${record.mentalNotes})` : ''}
- Physical: ${record.physicalScore}/10 ${record.physicalNotes ? `(${record.physicalNotes})` : ''}
- Medical: ${record.medicalScore}/10 ${record.medicalNotes ? `(${record.medicalNotes})` : ''}`;
    }).join('\n\n');
    
    const conversationText = chatHistory.map(day => {
      return `Date: ${day.date}\nConversations:\n${day.messages.map(msg => 
        `${msg.sender === 'user' ? 'User' : 'Kindred'}: ${msg.message}`
      ).join('\n')}`;
    }).join('\n\n');
    
    const prompt = `You are Kindred, an empathetic AI health companion. Analyze the following weekly data and provide a comprehensive wellness report.

**IMPROVEMENT DATA (Week of ${startDate} to ${endDate}):**
${improvementDataText}

**CONVERSATION HISTORY:**
${conversationText.length > 0 ? conversationText : 'No conversations this week.'}

**AVERAGES:**
- Emotional: ${emotionalAvg}/10
- Mental: ${mentalAvg}/10
- Physical: ${physicalAvg}/10
- Medical: ${medicalAvg}/10

Please provide a detailed analysis in the following JSON format:
{
  "emotionalSummary": "A warm, empathetic summary of their emotional journey this week (2-3 sentences)",
  "mentalSummary": "Analysis of their mental clarity and cognitive state this week (2-3 sentences)",
  "physicalSummary": "Insights about their physical health and energy levels (2-3 sentences)",
  "medicalSummary": "Summary of medical progress and health management (2-3 sentences)",
  "overallSummary": "A holistic overview of their week, highlighting patterns and connections between dimensions (3-4 sentences)",
  "conversationInsights": "Key themes, concerns, or positive moments from their conversations with you (2-3 sentences, or 'No significant patterns' if limited data)",
  "recommendations": "3-5 specific, actionable recommendations for improving their well-being next week. Each on a new line starting with '•'",
  "actionItems": "3-5 concrete action items they can take this week. Each on a new line starting with '•'. Be specific and achievable."
}

Be encouraging, compassionate, and focus on their strengths while gently addressing areas for growth. Use warm, personal language.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user' as const, parts: [{ text: prompt }] }],
    });
    
    const responseText = result.response?.text();
    if (!responseText) {
      throw new Error('No response from AI');
    }
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    const report: WeeklyReport = {
      id: `weekly-${Date.now()}-${Math.random()}`,
      userId,
      weekStartDate: startDate,
      weekEndDate: endDate,
      emotionalSummary: analysis.emotionalSummary,
      mentalSummary: analysis.mentalSummary,
      physicalSummary: analysis.physicalSummary,
      medicalSummary: analysis.medicalSummary,
      overallSummary: analysis.overallSummary,
      emotionalAverage: emotionalAvg,
      mentalAverage: mentalAvg,
      physicalAverage: physicalAvg,
      medicalAverage: medicalAvg,
      recommendations: analysis.recommendations,
      actionItems: analysis.actionItems,
      conversationInsights: analysis.conversationInsights || '',
      createdAt: new Date(),
    };
    
    const storageKey = `${WEEKLY_REPORTS_STORAGE_KEY}${userId}`;
    const existingReports: WeeklyReport[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existingReports.push(report);
    localStorage.setItem(storageKey, JSON.stringify(existingReports));
    
    return report;
  } catch (error) {
    console.error('Error generating weekly report:', error);
    throw error;
  }
};

export const getWeeklyReports = async (userId: string, limit: number = 10): Promise<WeeklyReport[]> => {
  try {
    const storageKey = `${WEEKLY_REPORTS_STORAGE_KEY}${userId}`;
    const reports: WeeklyReport[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    return reports
      .map(report => ({
        ...report,
        createdAt: new Date(report.createdAt),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching weekly reports:', error);
    return [];
  }
};

export const generateMonthlyReport = async (userId: string, month: string): Promise<MonthlyReport> => {
  try {
    const weeklyReports = await getWeeklyReports(userId, 52);
    
    const monthlyWeeklyReports = weeklyReports.filter(report => 
      report.weekStartDate.startsWith(month)
    );
    
    if (monthlyWeeklyReports.length === 0) {
      throw new Error('No weekly reports found for this month. Generate weekly reports first.');
    }
    
    const emotionalAvg = Math.round(
      monthlyWeeklyReports.reduce((sum, r) => sum + r.emotionalAverage, 0) / monthlyWeeklyReports.length
    );
    const mentalAvg = Math.round(
      monthlyWeeklyReports.reduce((sum, r) => sum + r.mentalAverage, 0) / monthlyWeeklyReports.length
    );
    const physicalAvg = Math.round(
      monthlyWeeklyReports.reduce((sum, r) => sum + r.physicalAverage, 0) / monthlyWeeklyReports.length
    );
    const medicalAvg = Math.round(
      monthlyWeeklyReports.reduce((sum, r) => sum + r.medicalAverage, 0) / monthlyWeeklyReports.length
    );
    
    const summariesText = monthlyWeeklyReports.map((report, index) => {
      return `Week ${index + 1} (${report.weekStartDate} to ${report.weekEndDate}):
- Emotional: ${report.emotionalAverage}/10 - ${report.emotionalSummary}
- Mental: ${report.mentalAverage}/10 - ${report.mentalSummary}
- Physical: ${report.physicalAverage}/10 - ${report.physicalSummary}
- Medical: ${report.medicalAverage}/10 - ${report.medicalSummary}`;
    }).join('\n\n');
    
    const prompt = `You are Kindred, an empathetic AI health companion. Analyze the following monthly wellness data and provide a comprehensive monthly report.

**MONTHLY DATA (${month}):**
${summariesText}

**MONTHLY AVERAGES:**
- Emotional: ${emotionalAvg}/10
- Mental: ${mentalAvg}/10
- Physical: ${physicalAvg}/10
- Medical: ${medicalAvg}/10

**Number of Weekly Reports:** ${monthlyWeeklyReports.length}

Please provide a detailed monthly analysis in the following JSON format:
{
  "emotionalSummary": "Overview of emotional patterns and growth this month (3-4 sentences)",
  "mentalSummary": "Analysis of mental health trends and cognitive patterns (3-4 sentences)",
  "physicalSummary": "Summary of physical health and energy level trends (3-4 sentences)",
  "medicalSummary": "Overview of medical progress and health management (3-4 sentences)",
  "overallSummary": "A holistic view of their month, highlighting key themes and overall trajectory (4-5 sentences)",
  "trends": "3-5 significant trends observed across the month. Each on a new line starting with '•'",
  "achievements": "3-5 accomplishments, improvements, or positive moments to celebrate. Each on a new line starting with '•'",
  "areasForImprovement": "2-3 gentle suggestions for areas to focus on next month. Each on a new line starting with '•'"
}

Be encouraging and celebrate progress while providing constructive insights. Focus on growth and patterns.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user' as const, parts: [{ text: prompt }] }],
    });
    
    const responseText = result.response?.text();
    if (!responseText) {
      throw new Error('No response from AI');
    }
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);
    
    const report: MonthlyReport = {
      id: `monthly-${Date.now()}-${Math.random()}`,
      userId,
      month,
      emotionalSummary: analysis.emotionalSummary,
      mentalSummary: analysis.mentalSummary,
      physicalSummary: analysis.physicalSummary,
      medicalSummary: analysis.medicalSummary,
      overallSummary: analysis.overallSummary,
      emotionalAverage: emotionalAvg,
      mentalAverage: mentalAvg,
      physicalAverage: physicalAvg,
      medicalAverage: medicalAvg,
      weeklyReportsCount: monthlyWeeklyReports.length,
      trends: analysis.trends,
      achievements: analysis.achievements || '',
      areasForImprovement: analysis.areasForImprovement || '',
      createdAt: new Date(),
    };
    
    const storageKey = `${MONTHLY_REPORTS_STORAGE_KEY}${userId}`;
    const existingReports: MonthlyReport[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const existingIndex = existingReports.findIndex(r => r.month === month);
    if (existingIndex >= 0) {
      existingReports[existingIndex] = report;
    } else {
      existingReports.push(report);
    }
    
    localStorage.setItem(storageKey, JSON.stringify(existingReports));
    
    return report;
  } catch (error) {
    console.error('Error generating monthly report:', error);
    throw error;
  }
};

export const getMonthlyReports = async (userId: string): Promise<MonthlyReport[]> => {
  try {
    const storageKey = `${MONTHLY_REPORTS_STORAGE_KEY}${userId}`;
    const reports: MonthlyReport[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    return reports
      .map(report => ({
        ...report,
        createdAt: new Date(report.createdAt),
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
  } catch (error) {
    console.error('Error fetching monthly reports:', error);
    return [];
  }
};
