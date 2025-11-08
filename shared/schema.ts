import { pgTable, text, timestamp, serial, integer, date, time, boolean } from 'drizzle-orm/pg-core';

export const medicalReports = pgTable('medical_reports', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileData: text('file_data').notNull(), // Base64 encoded file
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  analysisResult: text('analysis_result'),
  safetyPrecautions: text('safety_precautions'),
});

export const prescriptions = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileData: text('file_data').notNull(), // Base64 encoded file
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  analysisResult: text('analysis_result'),
  doctorName: text('doctor_name'),
  prescribedDate: date('prescribed_date'),
});

export const medications = pgTable('medications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  prescriptionId: integer('prescription_id').references(() => prescriptions.id),
  medicineName: text('medicine_name').notNull(),
  dosage: text('dosage').notNull(),
  frequency: text('frequency').notNull(), // e.g., "twice daily", "three times daily"
  startDate: date('start_date').notNull(),
  endDate: date('end_date'),
  instructions: text('instructions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const medicationSchedule = pgTable('medication_schedule', {
  id: serial('id').primaryKey(),
  medicationId: integer('medication_id').references(() => medications.id).notNull(),
  userId: text('user_id').notNull(),
  scheduledDate: date('scheduled_date').notNull(),
  scheduledTime: time('scheduled_time').notNull(),
  taken: boolean('taken').default(false).notNull(),
  notes: text('notes'),
});

export const safetyRecommendations = pgTable('safety_recommendations', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  medicalReportId: integer('medical_report_id').references(() => medicalReports.id),
  prescriptionId: integer('prescription_id').references(() => prescriptions.id),
  recommendation: text('recommendation').notNull(),
  priority: text('priority').notNull(), // 'high', 'medium', 'low'
  category: text('category').notNull(), // 'diet', 'activity', 'medication', 'lifestyle'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  sender: text('sender').notNull(), // 'user' or 'kindred'
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const improvementRecords = pgTable('improvement_records', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  recordDate: date('record_date').notNull(),
  emotionalScore: integer('emotional_score').notNull(), // 1-10 scale
  mentalScore: integer('mental_score').notNull(), // 1-10 scale
  physicalScore: integer('physical_score').notNull(), // 1-10 scale
  medicalScore: integer('medical_score').notNull(), // 1-10 scale
  emotionalNotes: text('emotional_notes'),
  mentalNotes: text('mental_notes'),
  physicalNotes: text('physical_notes'),
  medicalNotes: text('medical_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const weeklyReports = pgTable('weekly_reports', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  weekStartDate: date('week_start_date').notNull(),
  weekEndDate: date('week_end_date').notNull(),
  emotionalSummary: text('emotional_summary').notNull(),
  mentalSummary: text('mental_summary').notNull(),
  physicalSummary: text('physical_summary').notNull(),
  medicalSummary: text('medical_summary').notNull(),
  overallSummary: text('overall_summary').notNull(),
  emotionalAverage: integer('emotional_average').notNull(),
  mentalAverage: integer('mental_average').notNull(),
  physicalAverage: integer('physical_average').notNull(),
  medicalAverage: integer('medical_average').notNull(),
  recommendations: text('recommendations').notNull(),
  actionItems: text('action_items').notNull(),
  conversationInsights: text('conversation_insights'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const monthlyReports = pgTable('monthly_reports', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  month: text('month').notNull(), // YYYY-MM format
  emotionalSummary: text('emotional_summary').notNull(),
  mentalSummary: text('mental_summary').notNull(),
  physicalSummary: text('physical_summary').notNull(),
  medicalSummary: text('medical_summary').notNull(),
  overallSummary: text('overall_summary').notNull(),
  emotionalAverage: integer('emotional_average').notNull(),
  mentalAverage: integer('mental_average').notNull(),
  physicalAverage: integer('physical_average').notNull(),
  medicalAverage: integer('medical_average').notNull(),
  weeklyReportsCount: integer('weekly_reports_count').notNull(),
  trends: text('trends').notNull(),
  achievements: text('achievements'),
  areasForImprovement: text('areas_for_improvement'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
