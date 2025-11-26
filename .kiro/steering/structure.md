---
inclusion: always
---

# Project Structure

## Root Level

```
/
├── js/                    # Vanilla JS Tetris game logic
├── client/                # React frontend application
├── server/                # Express backend
├── shared/                # Shared types/schemas
├── attached_assets/       # Project documentation assets
├── index.html             # Vanilla game entry point
├── style.css              # Vanilla game styles
└── package.json           # Dependencies and scripts
```

## Vanilla JS Game (`/js`)

- `main.js` - Application entry point, game loop, renderer
- `tetris.js` - Core game logic, state management, combo system
- `tetromino.js` - Tetromino shapes, rotation, piece bag
- `controls.js` - Keyboard and touch input handling
- `sound.js` - Audio management, dynamic music system
- `utils.js` - Helper functions, storage, formatting

## React Frontend (`/client`)

```
client/
├── src/
│   ├── components/ui/     # Radix UI components (shadcn)
│   ├── lib/
│   │   ├── stores/        # Zustand stores (useAudio, useGame)
│   │   ├── queryClient.ts # React Query setup
│   │   └── utils.ts       # Utility functions
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Route components
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # React entry point
│   └── index.css          # Global styles (Tailwind)
├── public/                # Static assets
│   ├── fonts/             # Font files (Inter)
│   ├── geometries/        # 3D models (GLTF)
│   ├── sounds/            # Audio files
│   └── textures/          # Image textures
└── index.html             # HTML entry point
```

## Backend (`/server`)

- `index.ts` - Express server setup, middleware, static file serving
- `routes.ts` - API route registration
- `storage.ts` - Database interface/abstraction
- `vite.ts` - Vite dev server integration

## Shared (`/shared`)

- `schema.ts` - Drizzle ORM database schema definitions

## Key Conventions

### File Organization
- UI components follow shadcn/ui structure in `client/src/components/ui/`
- Game logic is modular and separated by concern in `/js`
- Backend routes should be prefixed with `/api`

### Naming
- React components: PascalCase (e.g., `App.tsx`)
- Vanilla JS: camelCase classes (e.g., `TetrisGame`)
- Stores: `use` prefix (e.g., `useGame.tsx`)
- Constants: UPPER_SNAKE_CASE

### Import Paths
- Use `@/` alias for client source imports
- Use `@shared/` alias for shared code
- Relative imports for local files

### Static Assets
- Vanilla game assets served from root
- React app assets in `client/public/`
- Server serves vanilla game by default, React app requires build
