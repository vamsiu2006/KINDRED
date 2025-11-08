import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found in environment variables");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export interface MedicationSchedule {
  medicineName: string;
  dosage: string;
  frequency: string;
  timings: string[];
  instructions: string;
  startDate: string;
  endDate?: string;
}

export interface SafetyPrecaution {
  category: 'diet' | 'activity' | 'medication' | 'lifestyle';
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export interface MedicalAnalysisResult {
  summary: string;
  medications: MedicationSchedule[];
  safetyPrecautions: SafetyPrecaution[];
  doctorName?: string;
  prescribedDate?: string;
}

export const analyzeMedicalDocument = async (
  base64Image: string,
  mimeType: string,
  documentType: 'prescription' | 'medical_report'
): Promise<MedicalAnalysisResult> => {
  try {
    const documentPart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const isPDF = mimeType === 'application/pdf';
    const docType = isPDF ? 'PDF document' : 'image';

    const prompt = documentType === 'prescription' 
      ? `You are KINDRED, a medical assistant AI. Analyze this prescription ${docType} and extract detailed information.

**CRITICAL: Respond ONLY with valid JSON. No additional text before or after the JSON.**

Extract and return a JSON object with this exact structure:
{
  "summary": "Brief summary of the prescription",
  "doctorName": "Doctor's name if visible",
  "prescribedDate": "Date in YYYY-MM-DD format if visible",
  "medications": [
    {
      "medicineName": "Full medicine name",
      "dosage": "Dosage amount (e.g., '500mg', '10ml')",
      "frequency": "How often (e.g., 'twice daily', 'three times daily', 'once at night')",
      "timings": ["morning", "afternoon", "night"],
      "instructions": "Special instructions (e.g., 'take after meals', 'before breakfast')",
      "startDate": "Start date in YYYY-MM-DD format",
      "endDate": "End date in YYYY-MM-DD format or empty if not specified"
    }
  ],
  "safetyPrecautions": [
    {
      "category": "medication",
      "recommendation": "Specific safety advice",
      "priority": "high"
    }
  ]
}

Be thorough and accurate. If information is not clearly visible, use empty strings or arrays.`
      : `You are KINDRED, a medical assistant AI. Analyze this medical report ${docType} and extract health information.

**CRITICAL: Respond ONLY with valid JSON. No additional text before or after the JSON.**

Extract and return a JSON object with this exact structure:
{
  "summary": "Brief summary of the medical report findings",
  "medications": [],
  "safetyPrecautions": [
    {
      "category": "diet" | "activity" | "medication" | "lifestyle",
      "recommendation": "Specific health advice based on the report",
      "priority": "high" | "medium" | "low"
    }
  ]
}

Focus on:
- Key health indicators and their values
- Any abnormal findings
- Recommended lifestyle changes
- Dietary restrictions or recommendations
- Activity limitations or suggestions
- Risk factors identified

Provide actionable, specific safety precautions based on the medical findings.`;

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [documentPart, textPart] },
    });

    const responseText = response.text.trim();
    
    // Try to extract JSON if there's extra text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[0] : responseText;
    
    const result = JSON.parse(jsonText) as MedicalAnalysisResult;
    
    return result;
  } catch (error) {
    console.error("Error analyzing medical document:", error);
    throw new Error("Failed to analyze medical document. Please try again.");
  }
};

export const generateMedicationCalendar = (
  medications: MedicationSchedule[],
  startDate: Date,
  days: number = 30
): Map<string, Array<{
  medicineName: string;
  dosage: string;
  time: string;
  instructions: string;
}>> => {
  const calendar = new Map<string, Array<{
    medicineName: string;
    dosage: string;
    time: string;
    instructions: string;
  }>>();

  medications.forEach(med => {
    // Default to startDate if med.startDate is empty or invalid
    const medStart = med.startDate && med.startDate.trim() !== '' 
      ? new Date(med.startDate) 
      : new Date(startDate);
    
    // Check if the date is valid, if not, default to startDate
    if (isNaN(medStart.getTime())) {
      medStart.setTime(startDate.getTime());
    }
    
    let medEnd = med.endDate && med.endDate.trim() !== '' 
      ? new Date(med.endDate) 
      : null;
    
    // Validate the endDate, if invalid, treat as null (no end date)
    if (medEnd && isNaN(medEnd.getTime())) {
      medEnd = null;
    }

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Check if medication should be taken on this date
      if (currentDate >= medStart && (!medEnd || currentDate <= medEnd)) {
        const dateKey = currentDate.toISOString().split('T')[0];
        
        if (!calendar.has(dateKey)) {
          calendar.set(dateKey, []);
        }

        // Add entries for each timing
        med.timings.forEach(timing => {
          calendar.get(dateKey)!.push({
            medicineName: med.medicineName,
            dosage: med.dosage,
            time: timing,
            instructions: med.instructions,
          });
        });
      }
    }
  });

  return calendar;
};
