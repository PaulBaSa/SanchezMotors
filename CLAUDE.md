# CLAUDE.md — SanchezMotors

## Project Overview

**SanchezMotors** is an offline-first mobile workshop management app built with React Native + Expo. It digitizes vehicle reception, task tracking (Kanban), and budget/quoting workflows for automotive workshops. The UI is entirely in Spanish, targeting the Latin American (Mexico) market.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | React Native 0.81.5 / React 19.1.0 |
| Framework | Expo ~54.0.33 |
| Language | TypeScript (strict mode) |
| Routing | expo-router 6 (file-based) |
| State | React Context API (`AppContext`) |
| Persistence | AsyncStorage (offline-first) |
| Camera/Media | expo-camera, expo-image-picker, expo-media-library |
| Export | expo-print (PDF), expo-sharing |
| Icons | @expo/vector-icons (Ionicons) |
| Unique IDs | uuid 13 |

---

## Project Structure

```
SanchezMotors/
├── app/                        # Expo Router pages
│   ├── _layout.tsx             # Root layout — wraps AppProvider
│   └── (tabs)/
│       ├── _layout.tsx         # Tab bar config (3 tabs)
│       ├── reception.tsx       # Order intake & vehicle inspection
│       ├── tasks.tsx           # Kanban task board
│       └── budget.tsx          # Quotes, costs, PDF/WhatsApp export
│
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── ActionButton.tsx
│   │   ├── FormField.tsx
│   │   ├── OrderCard.tsx
│   │   ├── PhotoGrid.tsx       # 6-slot mandatory inspection photos
│   │   ├── PinModal.tsx        # Admin PIN entry
│   │   └── StatusBadge.tsx
│   ├── constants/
│   │   └── theme.ts            # Colors, spacing, typography tokens
│   ├── storage/
│   │   ├── AppContext.tsx      # Global state (orders, auth, CRUD)
│   │   ├── authStorage.ts      # PIN-based auth (admin / mechanic roles)
│   │   └── orderStorage.ts     # AsyncStorage CRUD for work orders
│   ├── types/
│   │   └── index.ts            # WorkOrder, WorkTask, BudgetSummary, etc.
│   └── utils/
│       ├── formatters.ts       # Currency, dates, margin calculations
│       └── otGenerator.ts      # OT ID format: YYMMDD-##
│
├── assets/                     # Icons and splash screens
├── app.json                    # Expo app manifest
├── eas.json                    # EAS build profiles (preview / production)
├── package.json
├── package-lock.json
└── tsconfig.json
```

---

## Common Commands

```bash
# Start development server
npm start

# Run on Android emulator / device
npm run android

# Run on iOS simulator
npm run ios

# TypeScript type check (no emit)
npm run typecheck

# Generate native Android project
npm run prebuild

# Build signed APK
npm run build:apk

# Build App Bundle (Play Store)
npm run build:aab
```

---

## Key Architecture Decisions

### Offline-First
All data is persisted in AsyncStorage as JSON. The app is designed to work without connectivity. AWS Amplify DataStore + GraphQL sync is planned for a future phase (noted in code comments).

### Role-Based Access (RBAC)
Two roles enforced via PIN authentication:
- **admin** — full visibility including real costs and margin data
- **mechanic** — sees only sale prices; cost data is hidden

Default PIN is `"1234"` (stored in AsyncStorage). Future migration to AWS Cognito is planned.

### Financial Privacy Layer
Each work order stores parallel pricing:
- `saleCost` / `laborSaleCost` — client-facing prices
- `realCost` / `laborRealCost` — internal costs (admin-only)

Margin calculations and profit/loss color coding are computed in `src/utils/formatters.ts`.

### DynamoDB-Ready Schema
Work orders and tasks use a pk/sk pattern ready for single-table DynamoDB design:
- WorkOrder: `pk: "OT#[ID]"`, `sk: "METADATA"`
- WorkTask: `pk: "OT#[orderID]"`, `sk: "TASK#[taskID]"`

### OT ID Format
Order IDs are generated as `YYMMDD-##` (date + daily sequence counter stored in AsyncStorage).

---

## Data Model

Key types are defined in `src/types/index.ts`:

- **WorkOrder** — top-level order with vehicle info, client, photos, status, tasks
- **WorkTask** — individual repair/maintenance item with Kanban status, time tracking, evidence photos
- **BudgetSummary** — aggregated totals for the budget tab
- **OrderImage** — photo URI + optional S3 link (for future sync)

---

## Conventions

- **Touch targets**: Minimum 60px (`TOUCH_TARGET` constant in theme)
- **Language**: All UI text, labels, and messages are in Spanish
- **Styling**: React Native `StyleSheet` only — no external CSS libraries
- **Components**: Functional components + React hooks; composition over inheritance
- **Photos**: Compressed at 0.7 quality; stored as local URIs
- **Time tracking**: Stored as decimal hours (e.g., `2.5` = 2h 30m); displayed via `formatHours()`
- **Kanban columns**: `pending` (yellow) → `in_progress` (blue) → `completed` (green)
- **WhatsApp integration**: Mexico prefix (`52`) hardcoded; validates phone before deep-link

---

## Future Roadmap (from code comments)

- AWS Amplify DataStore + GraphQL for cloud sync
- AWS Cognito for proper authentication (replacing PIN)
- S3 for photo storage (`OrderImage.s3Link` already typed)
- Expand to iOS builds

---

## Notes for Claude

- Always run `npm run typecheck` after making TypeScript changes
- The app has no test suite currently — validate changes manually via the emulator
- Do not remove or rename the pk/sk fields on `WorkOrder`/`WorkTask` — they are reserved for the DynamoDB migration
- Keep all user-facing strings in Spanish
- Admin-only UI sections are marked with a red shield icon and "Solo Admin" dividers
