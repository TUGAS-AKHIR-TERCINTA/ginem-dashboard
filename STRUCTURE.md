# Project Structure

Industry-standard React + Vite + TypeScript layout. **Pages** live in `src/pages/`; feature-specific logic and UI stay in `src/features/`.

```
src/
├── assets/                  # Static assets
│   ├── images/
│   ├── fonts/
│   └── icons/
├── components/              # Reusable UI components
│   ├── common/              # Breadcrumb, buttons, modals, etc.
│   └── layout/              # AppLayout, AuthLayout
├── features/                # Feature modules (no pages here)
│   ├── devices/
│   │   └── components/      # DeviceCard, FormDevice, DeleteModalDevice
│   ├── embedding/
│   │   └── components/
│   └── chat/
│       └── components/
├── pages/                   # Route-level views only
│   ├── auth/
│   ├── dashboard/
│   ├── devices/
│   ├── admins/
│   ├── embedding/
│   ├── logger/
│   ├── scheduler/
│   ├── settings/
│   ├── profile/
│   ├── chat/
│   └── NotFound/
├── routes/                  # Routing configuration
│   ├── AppRoutes.tsx
│   └── routes.ts
├── hooks/                   # Global custom hooks
│   ├── api/                 # Generic TanStack Query hooks
│   └── services/            # Domain hooks (useDevices, useAdmins, …)
├── context/                 # React Context providers
├── services/                # API layer & domain services
│   ├── api.ts                 # Axios instance + apiClient helpers
│   ├── authService.ts         # Auth endpoints (login, register)
│   ├── adminService.ts        # Admin CRUD
│   ├── profileService.ts      # User profile
│   ├── deviceService.ts       # Device CRUD & detail
│   ├── dashboardService.ts    # Stats & logs
│   ├── loggerService.ts       # App logs
│   ├── schedulerService.ts    # Scheduler logs
│   ├── embeddingService.ts    # Vector indexing
│   ├── settingsService.ts     # WhatsApp & settings
│   ├── chatService.ts         # Chat API
│   ├── types.ts               # Shared API types
│   ├── query-keys.ts          # TanStack Query cache keys
│   └── query-client.ts        # QueryClient singleton
├── utils/                   # Helpers & validators
├── types/                   # TypeScript interfaces
├── styles/                  # Theme & global styles
├── config/                  # App configuration (env)
├── providers/               # App-level providers (Query, App context)
├── test/                    # Vitest setup & helpers
├── App.tsx
└── main.tsx
```

## Conventions

| Concern | Location |
|---------|----------|
| Route screens | `src/pages/<domain>/` |
| Feature UI/logic | `src/features/<domain>/components/` |
| Shared UI | `src/components/common/` |
| API calls | `@/hooks/services` (domain) + `@/hooks/api` (generic) |
| Domain API | `*Service.ts` in `@/services/` — one service per page/domain |
| Route paths | `@/routes/routes` (`ROUTES` constant) |
| Imports | `@/` alias → `src/` |

## Adding a new page

1. Create view in `src/pages/<domain>/MyPage.tsx`
2. Add route constant in `src/routes/routes.ts`
3. Register lazy route in `src/routes/AppRoutes.tsx`
4. If needed, add feature components under `src/features/<domain>/components/`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm test` | Tests (watch) |
| `npm run test:run` | Tests (CI) |
