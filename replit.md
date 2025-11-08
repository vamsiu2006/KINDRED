# Kindred AI Companion

## Overview
Kindred is an AI-powered companion application leveraging Google's Gemini API to offer empathetic conversations, visual assistance, and sign language translation. Its core purpose is to provide psychological support through voice interaction, camera-based image analysis, and multi-language capabilities. The project aims to create a warm, encouraging, and psychologically supportive interface for users with mental health challenges, physical disabilities, and general wellness needs.

## User Preferences
- None specified yet

## System Architecture

### Tech Stack
- **Frontend**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **AI Service**: Google Gemini API (@google/genai)
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: localStorage for client-side persistence
- **Charts**: Recharts
- **Deployment**: Replit autoscale deployment

### UI/UX Design
The application features a "Therapeutic & Accessible UI" with a greenish-red color palette (`#00ff88`, `#00d9ff`, `#ff3366`, `#ff6b9d`), glass-morphism design elements (frosted cards, gradient borders), and pulsing glow animations. Key accessibility features include large buttons, clear visual hierarchy, high contrast, and larger text inputs. The design incorporates psychological elements like positive reinforcement messages, calming gradients, and clear progress visualization, especially in the "Creative Dashboard" and "Medical Manager" sections.

### Key Features
1.  **Kindred Chat**: Conversational AI with instant voice interaction (using Web Speech API), automatic chat history saving, and access to past 30 days of conversations.
2.  **Creative Dashboard**: Tracks daily improvements across emotional, mental, physical, and medical well-being using a 1-10 scale. It provides 30-day line graphs, 6-month aggregated averages, and "Recent Insights" cards.
    *   **AI Weekly & Monthly Insights**: Generates AI-powered reports analyzing improvement data and chat conversations, offering summaries, personalized recommendations, and trend analysis.
3.  **Visual Assistant**: Camera-based image analysis providing simplified, structured responses for identification, uses, side effects/risks, and precautions.
4.  **Medical Manager**: AI-powered analysis of medical documents (prescriptions, reports) to extract medication schedules. It features a 14-day medication calendar with check-off functionality and safety precaution displays.
5.  **Sign Language Mode**: Provides support for sign language translation.
6.  **Settings**: Allows customization of voice, language, and user preferences, including viewing and clearing chat history.

### System Design Choices
-   Client-side data persistence for chat history, medical data, improvement records, and reports using `localStorage`.
-   Real-time audio responses for chat and image analysis using the browser's Web Speech API, eliminating TTS lag.
-   Intelligent voice selection with multiple options (female/male, various accents) and platform-aware matching.
-   Automatic silence detection for speech recognition for hands-free interaction.
-   Structured AI responses for clarity and user safety (e.g., Visual Assistant).

## External Dependencies
-   **Google Gemini API**: Used for AI chat, image analysis, medical document analysis, and generating weekly/monthly reports.
-   **PostgreSQL**: Database for storing application data via Drizzle ORM.
-   **Recharts**: JavaScript charting library for data visualization in the Creative Dashboard.