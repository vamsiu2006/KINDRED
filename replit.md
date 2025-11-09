# Kindred AI Companion

## Overview
Kindred is an AI-powered companion application designed to provide empathetic conversations and visual assistance for psychological support. Leveraging Google's Gemini API, it offers voice interaction, camera-based image analysis, and multi-language capabilities. The project aims to create a warm, encouraging, and psychologically supportive interface for users, particularly those facing mental health challenges, physical disabilities, and general wellness needs.

## User Preferences
- None specified yet

## System Architecture

### UI/UX Design
The application features a "Therapeutic & Accessible UI" with a greenish-red color palette (`#00ff88`, `#00d9ff`, `#ff3366`, `#ff6b9d`), glass-morphism design elements (frosted cards, gradient borders), and pulsing glow animations. Accessibility is prioritized with large buttons, clear visual hierarchy, high contrast, and larger text inputs. The design incorporates psychological elements like positive reinforcement, calming gradients, and clear progress visualization.

### Technical Implementations
- **Tech Stack**: React with TypeScript, Vite, Google Gemini API, PostgreSQL with Drizzle ORM.
- **Frontend**: React 19.2.0, Vite 6.2.0.
- **AI Service**: Google Gemini API (@google/genai).
- **Database**: PostgreSQL with Drizzle ORM.
- **Client-side Storage**: `localStorage` for persistence.
- **Charting**: Recharts.
- **Deployment**: Replit autoscale deployment.

### Feature Specifications
1.  **Kindred Chat**: Conversational AI with instant voice interaction (Web Speech API), automatic chat history saving (30 days).
2.  **Creative Dashboard**: Tracks daily improvements across emotional, mental, physical, and medical well-being (1-10 scale), providing 30-day line graphs, 6-month aggregated averages, and "Recent Insights." Includes AI-powered weekly & monthly reports with personalized recommendations.
3.  **Visual Assistant**: Camera-based image analysis providing structured responses for identification, uses, side effects/risks, and precautions.
4.  **Medical Manager**: AI-powered analysis of medical documents (images, PDFs) to extract and organize medication schedules, featuring a 14-day calendar with check-off functionality and safety precautions.
5.  **Emergency Dashboard**: Provides immediate access to emergency services (911, ambulance, poison control, mental health crisis hotline) with click-to-call. Features location-based hospital/ER finding via Google Maps, panic button, and emergency tips. Includes country-specific emergency contacts for 10 countries with automatic detection.
6.  **User Profile System**: Manages personal information, including profile picture upload (1MB limit), contact details, health information, address, and emergency contacts. Integrated with header for quick access.
7.  **Settings**: Customization of voice, language, preferences, chat history management, and personal profile editing.
8.  **Authentication System**: Dual authentication via Google OAuth 2.0 and email/password with bcrypt hashing, session management using `connect-pg-simple`, and robust security features (httpOnly cookies, CSRF protection, data sanitization).

### System Design Choices
-   Client-side data persistence for most user data using `localStorage` with graceful error handling for quota limits.
-   Profile pictures stored as base64 with a 1MB limit.
-   Real-time audio responses for chat and image analysis using the browser's Web Speech API.
-   Intelligent voice selection and automatic silence detection for speech recognition.
-   Structured AI responses for clarity and safety.

## External Dependencies
-   **Google Gemini API**: For AI chat, image analysis, medical document analysis, and report generation.
-   **PostgreSQL**: Database for application data via Drizzle ORM.
-   **Recharts**: JavaScript charting library for data visualization.
-   **BigDataCloud / ipapi.co**: For country detection in the Emergency Dashboard.
-   **Google Maps**: For finding nearest emergency facilities.