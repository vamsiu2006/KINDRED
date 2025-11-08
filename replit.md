# Kindred AI Companion

## Overview
Kindred is an AI-powered companion application leveraging Google's Gemini API to offer empathetic conversations and visual assistance. Its core purpose is to provide psychological support through voice interaction, camera-based image analysis, and multi-language capabilities. The project aims to create a warm, encouraging, and psychologically supportive interface for users with mental health challenges, physical disabilities, and general wellness needs.

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
5.  **Settings**: Allows customization of voice, language, and user preferences, including viewing and clearing chat history.

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

## Deployment Configuration
- **Deployment Type**: Autoscale deployment for simple, stateless website
- **Build Command**: `npm run build`
- **Run Command**: `npx vite preview --host 0.0.0.0 --port 5000`
- **Port**: 5000 (configured for Replit's webview)

## Recent Changes (November 8, 2025 - Latest)
- **Medical Manager PDF Support**:
  - Added PDF file upload support for prescriptions and medical reports
  - File validation now accepts: Images (PNG, JPG, JPEG, WEBP) and PDF files
  - Dynamic file icon: Shows 📑 for PDFs, 📄 for images
  - Helpful user guidance: Tip to convert DOCX files to PDF before uploading
  - Gemini API natively analyzes PDF documents without conversion
  - Maintained existing image analysis functionality
  - Clear error messages for unsupported file types
  - Updated UI text to be more inclusive ("document" vs "image")

## Previous Dashboard Changes (November 8, 2025)
- **Complete Dashboard Glassmorphism Redesign**:
  - **AI Weekly Insights**: Redesigned with cyan-themed glassmorphism, large gradient buttons (px-6 py-3), glass-card report cards with colorful left borders, gradient text headings, and encouraging empty states with large emojis
  - **Monthly Status Reports**: Redesigned with emerald-themed glassmorphism, large gradient buttons, glass-card report cards, "Celebrate Your Wins!" achievement section, and encouraging empty states
  - **Recent Insights**: Redesigned with purple-pink gradient theme, glass-card insight boxes with gradient score displays (text-4xl), hover effects on borders, and emoji indicators for each category
  - **Report Cards Redesign**: All weekly and monthly report cards now feature:
    * Glass-card containers with hover border effects
    * Colorful left borders (border-l-4) for visual distinction and accessibility
    * Gradient score badges with glassmorphism styling
    * Larger, more readable text (text-base for content, text-lg for headings)
    * Gradient text for section headings using inline styles
    * Improved spacing and padding (p-5, p-6)
    * Leading-relaxed for better readability
  - **Empty States**: Large emojis (text-6xl), encouraging messages, and positive tone throughout
  - **Complete Visual Cohesion**: All Creative Dashboard sections now share consistent glassmorphism design with therapeutic color gradients

## Previous Changes (November 8, 2025)
- **Complete Therapeutic & Accessible UI Redesign**:
  - **Design Philosophy**: Created a warm, encouraging, and psychologically supportive interface specifically for people with mental health challenges, physical disabilities, and wellness needs
  - **Custom Circuit Tree Logo**: Implemented user-provided circuit tree icon throughout the app with pulsing glow animations
  - **Greenish-Red Color Palette**:
    * Primary green: #00ff88 (emerald) - represents growth and healing
    * Primary teal: #00d9ff (cyan) - represents calm and clarity
    * Accent red: #ff3366 - represents vitality and energy
    * Accent pink: #ff6b9d - represents compassion and care
  - **Glass-Morphism Design**: Frosted glass cards with backdrop blur, gradient borders, and depth
  - **Accessibility Features**:
    * Large buttons (px-8 py-4+) for easy tapping
    * Clear visual hierarchy with sections
    * High contrast text and borders
    * Larger text inputs and sliders
    * Visual feedback for all interactions
  - **Therapeutic Dashboard**:
    * Encouraging messages based on scores ("You're doing amazingly well! 🌟")
    * Large, colorful wellness trackers with emoji indicators
    * Progress visualization with gradient sliders
    * Warm, supportive language throughout
    * Achievement celebrations and positive reinforcement
  - **Medical Manager Redesign**:
    * Large, accessible tabs for easy navigation
    * Clear sections for uploads, medications, and safety
    * Simplified document upload interface
    * Visual medication cards with check-off functionality
  - **Animated Elements**: floating logo, pulsing glows, gradient shifts, smooth transitions (300ms)
  - **Components Redesigned**:
    * Sidebar: Circuit tree logo, greenish-red gradients, glowing icons
    * Header: Gradient username display
    * Chat Interface: Glass-card bubbles, gradient buttons, animated mic
    * Auth Screen: Circuit tree logo, glass-card design
    * Creative Dashboard: Large wellness trackers, encouraging messages, accessible sliders
    * Medical Manager: Large tabs, clear sections, therapeutic language
    * Settings: Organized sections, larger inputs, friendly guidance

## Earlier Changes (November 8, 2025)
- Configured project for Replit environment
- Updated Vite config to use port 5000 for Replit compatibility and added `allowedHosts: true` for proxy support