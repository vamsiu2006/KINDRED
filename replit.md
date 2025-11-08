# Kindred AI Companion

## Overview
Kindred is an AI-powered companion app that uses Google's Gemini API to provide empathetic conversations, visual assistance, and sign language translation. The app features voice interaction, camera-based image analysis, and multi-language support.

## Project Architecture

### Tech Stack
- **Frontend**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 6.2.0
- **AI Service**: Google Gemini API (@google/genai)
- **Deployment**: Configured for Replit autoscale deployment

### Project Structure
```
├── components/
│   ├── auth/           # Authentication components
│   ├── features/       # Feature components (camera, chat, sign language, etc.)
│   ├── main/           # Main app layout (header, sidebar, main app)
│   └── ui/             # Reusable UI components
├── hooks/              # Custom React hooks (auth, speech recognition)
├── services/           # API services (Gemini AI, audio processing)
├── utils/              # Helper utilities
├── types.ts            # TypeScript type definitions
└── constants.ts        # Application constants
```

### Key Features
1. **Kindred Chat**: Conversational AI with voice interaction
2. **Visual Assistant**: Camera-based image analysis for plant identification and object recognition
3. **Sign Language Mode**: Sign language translation support
4. **Settings**: Customizable voice, language, and user preferences

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
- Updated Vite config to use port 5000 for Replit compatibility
- Added HMR client port configuration for proper hot reload
- Set up workflow for development server
- Configured deployment settings for production

## User Preferences
- None specified yet

## Notes
- The app uses Gemini 2.5 Flash for chat and image analysis
- Includes TTS (text-to-speech) support with tone-based voice generation
- Requires microphone and camera permissions for full functionality
