export interface ImprovementRecord {
  id: string;
  userId: string;
  recordDate: string; // YYYY-MM-DD format
  emotionalScore: number; // 1-10
  mentalScore: number; // 1-10
  physicalScore: number; // 1-10
  medicalScore: number; // 1-10
  emotionalNotes?: string;
  mentalNotes?: string;
  physicalNotes?: string;
  medicalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyImprovementInput {
  recordDate: string;
  emotionalScore: number;
  mentalScore: number;
  physicalScore: number;
  medicalScore: number;
  emotionalNotes?: string;
  mentalNotes?: string;
  physicalNotes?: string;
  medicalNotes?: string;
}

export interface MonthlyAverages {
  month: string; // YYYY-MM format
  emotionalAvg: number;
  mentalAvg: number;
  physicalAvg: number;
  medicalAvg: number;
}

const STORAGE_KEY_PREFIX = 'kindred_improvements_';

export const saveImprovementRecord = async (
  userId: string,
  record: DailyImprovementInput
): Promise<ImprovementRecord> => {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    const existingData = localStorage.getItem(storageKey);
    const records: ImprovementRecord[] = existingData ? JSON.parse(existingData) : [];
    
    const existingRecordIndex = records.findIndex(
      r => r.recordDate === record.recordDate
    );
    
    const now = new Date();
    
    if (existingRecordIndex >= 0) {
      const updatedRecord: ImprovementRecord = {
        ...records[existingRecordIndex],
        ...record,
        updatedAt: now,
      };
      records[existingRecordIndex] = updatedRecord;
      localStorage.setItem(storageKey, JSON.stringify(records));
      return updatedRecord;
    } else {
      const newRecord: ImprovementRecord = {
        id: `improvement-${Date.now()}-${Math.random()}`,
        userId,
        ...record,
        createdAt: now,
        updatedAt: now,
      };
      records.push(newRecord);
      localStorage.setItem(storageKey, JSON.stringify(records));
      return newRecord;
    }
  } catch (error) {
    console.error('Error saving improvement record:', error);
    throw error;
  }
};

export const getDailyRecords = async (
  userId: string,
  days: number = 30
): Promise<ImprovementRecord[]> => {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    const existingData = localStorage.getItem(storageKey);
    
    if (!existingData) {
      return [];
    }
    
    const records: ImprovementRecord[] = JSON.parse(existingData);
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];
    
    const recentRecords = records
      .filter(record => record.recordDate >= cutoffDateString)
      .map(record => ({
        ...record,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
      }))
      .sort((a, b) => a.recordDate.localeCompare(b.recordDate));
    
    return recentRecords;
  } catch (error) {
    console.error('Error fetching daily records:', error);
    return [];
  }
};

export const getMonthlyAverages = async (
  userId: string,
  months: number = 6
): Promise<MonthlyAverages[]> => {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    const existingData = localStorage.getItem(storageKey);
    
    if (!existingData) {
      return [];
    }
    
    const records: ImprovementRecord[] = JSON.parse(existingData);
    
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];
    
    const recentRecords = records.filter(record => record.recordDate >= cutoffDateString);
    
    const monthlyData: Map<string, {
      emotional: number[];
      mental: number[];
      physical: number[];
      medical: number[];
    }> = new Map();
    
    recentRecords.forEach(record => {
      const monthKey = record.recordDate.substring(0, 7); // YYYY-MM
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          emotional: [],
          mental: [],
          physical: [],
          medical: [],
        });
      }
      
      const month = monthlyData.get(monthKey)!;
      month.emotional.push(record.emotionalScore);
      month.mental.push(record.mentalScore);
      month.physical.push(record.physicalScore);
      month.medical.push(record.medicalScore);
    });
    
    const monthlyAverages: MonthlyAverages[] = Array.from(monthlyData.entries())
      .map(([month, scores]) => ({
        month,
        emotionalAvg: parseFloat((scores.emotional.reduce((a, b) => a + b, 0) / scores.emotional.length).toFixed(1)),
        mentalAvg: parseFloat((scores.mental.reduce((a, b) => a + b, 0) / scores.mental.length).toFixed(1)),
        physicalAvg: parseFloat((scores.physical.reduce((a, b) => a + b, 0) / scores.physical.length).toFixed(1)),
        medicalAvg: parseFloat((scores.medical.reduce((a, b) => a + b, 0) / scores.medical.length).toFixed(1)),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    return monthlyAverages;
  } catch (error) {
    console.error('Error calculating monthly averages:', error);
    return [];
  }
};

export const getRecordByDate = async (
  userId: string,
  date: string
): Promise<ImprovementRecord | null> => {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    const existingData = localStorage.getItem(storageKey);
    
    if (!existingData) {
      return null;
    }
    
    const records: ImprovementRecord[] = JSON.parse(existingData);
    const record = records.find(r => r.recordDate === date);
    
    return record ? {
      ...record,
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
    } : null;
  } catch (error) {
    console.error('Error fetching record by date:', error);
    return null;
  }
};

export const deleteAllRecords = async (userId: string): Promise<void> => {
  try {
    const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Error deleting improvement records:', error);
  }
};
