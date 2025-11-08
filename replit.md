# Kindred AI Companion

## Overview
Kindred is an AI-powered companion app that uses Google's Gemini API to provide empathetic conversations, visual assistance, and sign language translation. The app features voice interaction, camera-based image analysis, and multi-language support.

## Project Architecture

### Tech Stack
- **Frontend**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **AI Service**: Google Gemini API (@google/genai)
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: localStorage for client-side data persistence (chat history, medical data)
- **Deployment**: Configured for Replit autoscale deployment

### Project Structure
```
├── components/
│   ├── auth/           # Authentication components
│   ├── features/       # Feature components (camera, chat, sign language, medical manager, etc.)
│   ├── main/           # Main app layout (header, sidebar, main app)
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks (auth, speech recognition)
├── services/           # API services (Gemini AI, audio processing, medical analysis, chat history)
│   ├── gemini.ts       # Gemini AI chat and image analysis
│   ├── medical.ts      # Medical document analysis and medication scheduling
│   ├── audio.ts        # Audio processing and speech synthesis
│   └── chatHistory.ts  # Chat history storage and retrieval
├── shared/             # Database schema (Drizzle ORM)
│   └── schema.ts       # Medical reports, prescriptions, medications, schedules, chat messages
├── server/             # Server utilities
│   └── storage.ts      # Database connection (PostgreSQL)
├── utils/              # Helper utilities
├── types.ts            # TypeScript type definitions
└── constants.ts        # Application constants
```

### Key Features
1. **Kindred Chat**: Conversational AI with voice interaction
   - Automatic chat history saving
   - Access past conversations (up to 30 days) in Settings
2. **Visual Assistant**: Camera-based image analysis with simplified, structured responses:
   - What is it? (Identification)
   - What's it used for? (Uses and benefits)
   - Side Effects & Risks (Safety information)
   - What to Avoid (Precautions)
3. **Medical Manager**: AI-powered medical document analysis and medication tracking:
   - Upload and analyze prescriptions and medical reports
   - Automatic medication schedule extraction via Gemini AI
   - 14-day medication calendar with check-off functionality
   - Safety precautions and warnings display
   - Client-side data persistence via localStorage
4. **Sign Language Mode**: Sign language translation support
5. **Chat History**: View and browse past conversations
   - Day-by-day organization of past 30 days
   - Accessible through Settings
   - User and Kindred messages clearly distinguished
   - Timestamps and message counts for each day
6. **Settings**: Customizable voice, language, and user preferences
   - View chat history (past 30 days)
   - Clear all chat history

## Development Setup

### Environment Variables
- `GEMINI_API_KEY`: Required for Gemini API access (configured in Replit Secrets)

### Running Locally
The app runs on port 5000 with hot module replacement (HMR) enabled:
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Deployment
This project is configured for Replit's autoscale deployment:
- **Build Command**: `npm run build`
- **Run Command**: `npx vite preview --host 0.0.0.0 --port 5000`
- **Port**: 5000 (configured for Replit's webview)

## Recent Changes (November 8, 2025)
- Configured project for Replit environment
- Updated Vite config to use port 5000 for Replit compatibility and added `allowedHosts: true` for proxy support
- Added HMR client port configuration for proper hot reload
- Set up workflow for development server
- Configured deployment settings for production
- **Eliminated TTS lag completely**:
  - Replaced Gemini TTS API (1-3 second delay) with browser's Web Speech API
  - Audio now plays instantly when text appears - zero waiting time
  - All responses have immediate audio: chat, image analysis, errors, quick replies
  - Maintained voice mode flow and all existing functionality
  - Speech quality provided by user's browser/OS native TTS engine
- Simplified visual assistant image analysis:
  - Restructured responses into 4 clear sections: What is it?, What's it used for?, Side Effects & Risks, What to Avoid
  - Uses simple, everyday language instead of technical jargon
  - Provides practical, concise information focused on user safety and understanding
- **Added Medical Manager feature**:
  - Created PostgreSQL database schema with Drizzle ORM for medical data
  - Tables: medical_reports, prescriptions, medications, medication_schedule, safety_recommendations
  - Implemented Gemini AI medical document analysis (services/medical.ts)
  - Analyzes prescription images and medical reports
  - Extracts medications, dosages, timing, safety precautions automatically
  - Built three-tab Medical Manager interface:
    * Upload tab: Image upload for prescriptions/reports with AI analysis
    * Calendar tab: 14-day medication schedule with check-off tracking
    * Safety tab: Priority-based safety precautions display
  - Client-side data persistence using localStorage
  - Integrated Medical Manager into app navigation with sidebar icon
- **Fixed environment variable access**:
  - Updated Vite config to properly expose GEMINI_API_KEY to browser via import.meta.env
  - Added TypeScript definitions for Vite environment variables (vite-env.d.ts)
  - Changed from process.env to import.meta.env for browser compatibility
- **Added Chat History feature**:
  - Created chat_messages table in PostgreSQL database (ready for backend integration)
  - Implemented chat history service with localStorage persistence
  - All chat messages automatically saved with timestamps
  - Built ChatHistory component with day-by-day organization
  - Integrated into Settings with toggle view for past 30 days
  - Updated KindredChat to save all user and AI messages
  - Clear chat history now clears both localStorage entries

## User Preferences
- None specified yet

## Notes
- The app uses Gemini 2.5 Flash for chat and image analysis
- Includes TTS (text-to-speech) support with tone-based voice generation
- Requires microphone and camera permissions for full functionality

## Technical Limitations
- **API Key Exposure**: As a frontend-only React application, the Gemini API key is embedded in the browser bundle via Vite's build process. This is standard for client-side apps but means the key is technically accessible to users who inspect the bundled code. For production use, consider:
  - Adding domain restrictions to the API key in Google Cloud Console
  - Implementing a backend proxy server to handle Gemini API calls server-side
  - Using API quotas and monitoring to prevent abuse
