---
inclusion: always
---

# Tech Stack

## Vanilla JS Game (Primary Implementation)

- **Frontend**: HTML5 Canvas, vanilla JavaScript (ES6+), CSS3
- **Audio**: Web Audio API with Howler.js integration
- **Storage**: localStorage for high scores
- **No build step required** - runs directly in browser

## React/Express Scaffold (Secondary)

### Frontend
- **Framework**: React 18 with TypeScript
- **3D Graphics**: Three.js, React Three Fiber, React Three Drei
- **UI Components**: Radix UI, shadcn/ui components
- **Styling**: Tailwind CSS with custom theme
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: Wouter
- **Build Tool**: Vite 5

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Database**: PostgreSQL with Drizzle ORM
- **Session**: express-session with connect-pg-simple
- **Authentication**: Passport.js (local strategy)

### Development Tools
- **TypeScript**: Strict mode enabled
- **Package Manager**: npm
- **Database Migrations**: Drizzle Kit
- **Dev Server**: tsx for hot reload

## Common Commands

```bash
# Development
npm run dev              # Start dev server (Express + Vite)

# Production
npm run build            # Build client and server
npm start                # Run production server

# Database
npm run db:push          # Push schema changes to database

# Type Checking
npm run check            # Run TypeScript compiler check
```

## Project Configuration

- **Port**: Server runs on port 5000 (hardcoded)
- **Module System**: ESM (type: "module" in package.json)
- **Path Aliases**: `@/*` → `client/src/*`, `@shared/*` → `shared/*`
- **Asset Support**: GLTF/GLB models, MP3/OGG/WAV audio files
