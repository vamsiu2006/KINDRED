import React, { useState, useEffect } from 'react';
import { MedicationSchedule, generateMedicationCalendar } from '../../services/medical';

interface MedicationCalendarProps {
  userId: string;
  medications: MedicationSchedule[];
}

interface DaySchedule {
  date: string;
  medications: Array<{
    medicineName: string;
    dosage: string;
    time: string;
    taken: boolean;
    instructions: string;
  }>;
}

const MedicationCalendar: React.FC<MedicationCalendarProps> = ({ userId, medications }) => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const storageKey = `kindred_medication_taken_${userId}`;

  useEffect(() => {
    if (medications.length > 0) {
      // Generate calendar for next 14 days
      const calendar = generateMedicationCalendar(medications, new Date(), 14);
      
      // Load taken status from localStorage
      const takenData = localStorage.getItem(storageKey);
      const takenMap = takenData ? JSON.parse(takenData) : {};

      const scheduleArray: DaySchedule[] = [];
      calendar.forEach((meds, dateStr) => {
        scheduleArray.push({
          date: dateStr,
          medications: meds.map((med, idx) => ({
            ...med,
            taken: takenMap[`${dateStr}-${med.medicineName}-${med.time}`] || false
          }))
        });
      });

      // Sort by date
      scheduleArray.sort((a, b) => a.date.localeCompare(b.date));
      setSchedule(scheduleArray);
    }
  }, [medications, userId, storageKey]);

  const toggleMedication = (date: string, medicineName: string, time: string, currentStatus: boolean) => {
    const key = `${date}-${medicineName}-${time}`;
    const takenData = localStorage.getItem(storageKey);
    const takenMap = takenData ? JSON.parse(takenData) : {};
    
    takenMap[key] = !currentStatus;
    localStorage.setItem(storageKey, JSON.stringify(takenMap));
    
    // Update state
    setSchedule(prev => prev.map(day => {
      if (day.date === date) {
        return {
          ...day,
          medications: day.medications.map(med => {
            if (med.medicineName === medicineName && med.time === time) {
              return { ...med, taken: !currentStatus };
            }
            return med;
          })
        };
      }
      return day;
    }));
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (schedule.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📅</div>
        <div className="text-xl text-purple-300 mb-2">No medications scheduled</div>
        <div className="text-gray-400">Upload a prescription to get started</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Your Medication Schedule</h3>
        <p className="text-purple-300">Stay on track with your prescribed medications</p>
      </div>

      <div className="space-y-4">
        {schedule.map((day) => (
          <div key={day.date} className="bg-black/30 border border-purple-500/30 rounded-lg overflow-hidden">
            <div className="bg-purple-600/20 px-4 py-3 border-b border-purple-500/30">
              <h4 className="text-lg font-semibold text-purple-300">{formatDate(day.date)}</h4>
              <div className="text-sm text-gray-400">{day.date}</div>
            </div>
            
            <div className="p-4 space-y-3">
              {day.medications.sort((a, b) => a.time.localeCompare(b.time)).map((med, idx) => (
                <div
                  key={`${med.medicineName}-${med.time}-${idx}`}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-all ${
                    med.taken
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-purple-500/5 border border-purple-500/20 hover:border-purple-500/40'
                  }`}
                >
                  <button
                    onClick={() => toggleMedication(day.date, med.medicineName, med.time, med.taken)}
                    className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      med.taken
                        ? 'bg-green-500 border-green-500'
                        : 'border-purple-500/50 hover:border-purple-500'
                    }`}
                  >
                    {med.taken && <span className="text-white text-sm">✓</span>}
                  </button>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h5 className={`font-semibold ${med.taken ? 'text-green-300 line-through' : 'text-white'}`}>
                          {med.medicineName}
                        </h5>
                        <div className="text-sm text-purple-300 mt-1">
                          <span className="font-medium">{med.dosage}</span>
                          {med.instructions && <span className="text-gray-400"> • {med.instructions}</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg font-bold text-purple-300 capitalize">{med.time}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicationCalendar;
