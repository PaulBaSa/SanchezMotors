# CLAUDE.md — SanchezMotors

## Project Overview

**SanchezMotors** is an offline-first mobile workshop management app built with React Native + Expo. It digitizes vehicle reception, task tracking (Kanban), and budget/quoting workflows for automotive workshops. The UI is entirely in Spanish, targeting the Latin American (Mexico) market.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | React Native 0.81.5 / React 19.2.4 |
| Framework | Expo ~54.0.33 (New Architecture enabled) |
| Language | TypeScript (strict mode) |
| Routing | expo-router ^6.0.23 (file-based) |
| State | React Context API (`AppContext`) |
| Persistence | AsyncStorage (offline-first) |
| Camera/Media | expo-camera, expo-image-picker, expo-media-library |
| File System | expo-file-system |
| Export | expo-print (PDF), expo-sharing |
| Animations | react-native-reanimated ^4.2.2 |
| Gestures | react-native-gesture-handler ^2.30.0 |
| Navigation infra | react-native-screens, react-native-safe-area-context |
| Icons | @expo/vector-icons ^15 (Ionicons) |
| Unique IDs | uuid ^9.0.0 |
| Testing | Jest ^30 + ts-jest + @testing-library/react-native |

---

## Project Structure

```
SanchezMotors/
├── app/                            # Expo Router pages
│   ├── _layout.tsx                 # Root layout — wraps AppProvider
│   └── (tabs)/
│       ├── _layout.tsx             # Tab bar config (3 tabs: Recepción, Tareas, Presupuesto)
│       ├── reception.tsx           # Order intake & vehicle inspection
│       ├── tasks.tsx               # Kanban task board
│       └── budget.tsx              # Quotes, costs, PDF/WhatsApp export
│
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── ActionButton.tsx
│   │   ├── FormField.tsx
│   │   ├── OrderCard.tsx
│   │   ├── PhotoGrid.tsx           # 6-slot mandatory inspection photos
│   │   ├── PinModal.tsx            # Admin PIN entry
│   │   ├── StatusBadge.tsx
│   │   └── __tests__/
│   │       ├── OrderCard.test.tsx.skip    # Skipped — requires JSDOM env
│   │       └── StatusBadge.test.tsx.skip  # Skipped — requires JSDOM env
│   ├── constants/
│   │   └── theme.ts                # Colors, spacing, typography tokens
│   ├── storage/
│   │   ├── AppContext.tsx           # Global state (orders, auth, CRUD)
│   │   ├── authStorage.ts          # PIN-based auth (admin / mechanic roles)
│   │   ├── orderStorage.ts         # AsyncStorage CRUD for work orders
│   │   └── __tests__/
│   │       ├── authStorage.test.ts
│   │       └── orderStorage.test.ts
│   ├── types/
│   │   └── index.ts                # WorkOrder, WorkTask, BudgetSummary, etc.
│   └── utils/
│       ├── formatters.ts           # Currency, dates, margin calculations
│       ├── otGenerator.ts          # OT ID format: YYMMDD-##
│       └── __tests__/
│           ├── formatters.test.ts
│           └── otGenerator.test.ts
│
├── assets/                         # Icons and splash screens
├── .github/
│   └── workflows/
│       ├── test.yml                # CI: typecheck + tests on every push/PR
│       └── build-android.yml       # CI: APK + AAB on main/release/tags
├── app.json                        # Expo app manifest
├── babel.config.js                 # Babel: babel-preset-expo + reanimated plugin
├── eas.json                        # EAS build profiles (preview / production)
├── index.ts                        # App entry point
├── jest.config.js                  # Jest config (ts-jest, node env, coverage thresholds)
├── jest.setup.js                   # Jest mocks (AsyncStorage, expo-router, Ionicons)
├── metro.config.js                 # Metro bundler config
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

# Run in browser (web)
npm run web

# TypeScript type check (no emit)
npm run typecheck

# Run test suite
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Generate native Android project
npm run prebuild

# Build signed APK (requires prebuild first)
npm run build:apk

# Build App Bundle (Play Store, requires prebuild first)
npm run build:aab
```

---

## Testing

### Test Suite

The project has a Jest-based test suite for business logic in `src/`. Tests run in Node environment using `ts-jest`.

**Active test files** (run via `npm test`):
- `src/storage/__tests__/authStorage.test.ts` — PIN auth, role management
- `src/storage/__tests__/orderStorage.test.ts` — CRUD, factory functions, daily export
- `src/utils/__tests__/formatters.test.ts` — currency, dates, margins, status labels
- `src/utils/__tests__/otGenerator.test.ts` — OT ID generation, counter increments

**Skipped component tests** (`.skip` extension, not picked up by Jest):
- `src/components/__tests__/OrderCard.test.tsx.skip`
- `src/components/__tests__/StatusBadge.test.tsx.skip`

These component tests need a JSDOM environment and React Native rendering setup that is not yet configured. Remove the `.skip` extension and update `jest.config.js` (`testEnvironment: 'jsdom'` + React Native preset) to activate them.

### Coverage Thresholds

The CI enforces 50% minimum coverage across branches, functions, lines, and statements. Coverage is collected only from `src/**/*.{ts,tsx}` (excluding `*.d.ts`, `index.ts`, and `types/`).

### Test Setup Mocks (`jest.setup.js`)

- `@react-native-async-storage/async-storage` — all methods mocked with `jest.fn()`
- `expo-router` — `useRouter`, `useLocalSearchParams`, `usePathname` mocked
- `@expo/vector-icons` — `Ionicons` returns `null`

### CI Pipeline

**`test.yml`** — runs on every push and pull request to any branch:
1. TypeScript type check (`npm run typecheck`)
2. Test suite (`npm test -- --ci --forceExit`)
3. Uploads coverage report as artifact (7-day retention)

**`build-android.yml`** — runs on `main`, `release/**` branches and `v*` tags:
1. Generates native Android project (`expo prebuild`)
2. Builds release APK → uploads as artifact (30-day retention)
3. Builds release AAB → uploads as artifact (30-day retention)

---

## Key Architecture Decisions

### Offline-First
All data is persisted in AsyncStorage as JSON. The app is designed to work without connectivity. AWS Amplify DataStore + GraphQL sync is planned for a future phase (noted in code comments). The storage key for orders is `workshop_orders`.

### Role-Based Access (RBAC)
Two roles enforced via PIN authentication:
- **admin** — full visibility including real costs and margin data
- **mechanic** — sees only sale prices; cost data is hidden

Default PIN is `"1234"` stored in AsyncStorage under key `admin_pin`. The PIN can be changed via `setAdminPin()` in `authStorage.ts`. Auth state is stored under key `workshop_auth`. Future migration to AWS Cognito is planned.

### Financial Privacy Layer
Each `WorkTask` stores parallel pricing:
- `saleCost` / `laborSaleCost` — client-facing prices (visible to all roles)
- `realCost` / `laborRealCost` — internal costs (admin-only)

Margin is calculated as `(sale - cost) / sale * 100` via `calculateMargin()` in `src/utils/formatters.ts`.

### DynamoDB-Ready Schema
Work orders and tasks use a pk/sk pattern ready for single-table DynamoDB design:
- `WorkOrder`: `pk: "OT#[ID]"`, `sk: "METADATA"`
- `WorkTask`: `pk: "OT#[orderID]"`, `sk: "TASK#[taskID]"`
- `OrderImage`: `pk: "OT#[orderID]"`, `sk: "IMG#[ID]"`

**Do not remove or rename the `pk`/`sk` fields — they are reserved for the DynamoDB migration.**

### OT ID Format
Order IDs are generated as `YYMMDD-##` (date prefix + daily sequence counter). The counter is persisted in AsyncStorage under key `ot_counter`. On storage failure, a random fallback `1–99` is used.

### New Architecture
`newArchEnabled: true` is set in `app.json`. This is required by `react-native-reanimated` v4. Do not disable it.

### Exports and Backup
`orderStorage.ts` exposes `exportDailyData()` which returns a pretty-printed JSON string of all orders created today, suitable for USB/OTG backup.

---

## Data Model

All types are in `src/types/index.ts`:

### Enums / Unions
```typescript
type UserRole = 'admin' | 'mechanic';
type OrderStatus = 'reception' | 'in_progress' | 'completed' | 'delivered';
type TaskStatus = 'pending' | 'in_progress' | 'completed';
type ImageType = 'entry' | 'process';
type PhotoSlot = 'front' | 'rear' | 'left' | 'right' | 'interior_front' | 'interior_rear';
```

### Core Interfaces
- **`WorkOrder`** — top-level order: vehicle info (`VehicleInfo`), client, status, `InspectionPhoto[]`, `WorkTask[]`
- **`WorkTask`** — repair/maintenance item: Kanban status, hours, dual pricing, `TaskPhoto[]`, notes
- **`InspectionPhoto`** — slot + uri + note + timestamp (6 predefined slots)
- **`TaskPhoto`** — evidence photo: id + uri + note + timestamp
- **`OrderImage`** — photo with S3 link for future cloud sync (not used in UI yet)
- **`BudgetSummary`** — aggregated totals: `totalSale`, `totalRealCost`, `margin`, `marginPercentage`
- **`BudgetLineItem`** — per-task line item for the budget tab
- **`AuthState`** — `{ isAuthenticated, role, pin }`
- **`VehicleInfo`** — vin, plates, brand, model, year, color, engine, odometer (all strings)

---

## Theme System (`src/constants/theme.ts`)

```typescript
COLORS      // primary, accent, highlight, status colors, kanban colors, profit/loss
SPACING     // xs(4), sm(8), md(16), lg(24), xl(32), xxl(48)
FONT_SIZES  // xs(12) → title(34)
BORDER_RADIUS // sm(6), md(10), lg(16), xl(24), round(999)
TOUCH_TARGET  // minHeight/minWidth: 60, iconSize: 28, iconSizeLg: 36
```

---

## Global State (`AppContext`)

Exposed via `useApp()` hook. Must be used inside `<AppProvider>`.

```typescript
// Orders
orders: WorkOrder[]           // sorted by createdAt desc
currentOrder: WorkOrder | null
setCurrentOrder(order)
loadOrders(): Promise<void>   // reloads from AsyncStorage
saveCurrentOrder(order)       // saves + reloads orders list
deleteOrder(id)
updateTask(orderId, task)     // upserts task in order, then saves

// Auth
role: UserRole
isAdmin: boolean
login(role, pin?): Promise<boolean>
logout(): Promise<void>
```

---

## AsyncStorage Keys

| Key | Contents |
|---|---|
| `workshop_orders` | `WorkOrder[]` array (all orders) |
| `workshop_auth` | `AuthState` object |
| `admin_pin` | PIN string (defaults to `"1234"`) |
| `ot_counter` | `{ date: "YYMMDD", count: number }` |

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
- **Path alias**: `@/*` maps to the repo root (configured in `tsconfig.json`)
- **Admin UI markers**: Admin-only sections use a red shield icon and "Solo Admin" dividers

---

## Future Roadmap (from code comments)

- AWS Amplify DataStore + GraphQL for cloud sync
- AWS Cognito for proper authentication (replacing PIN)
- S3 for photo storage (`OrderImage.s3Link` already typed)
- Activate skipped component tests (JSDOM env setup needed)
- Expand to iOS builds

---

## Notes for Claude

- Always run `npm run typecheck` after making TypeScript changes
- Always run `npm test` after making changes to `src/` logic
- CI runs both typecheck and tests on every push — changes must pass both
- Do not remove or rename the `pk`/`sk` fields on `WorkOrder`/`WorkTask`/`OrderImage` — they are reserved for DynamoDB migration
- Do not set `newArchEnabled: false` in `app.json` — required by react-native-reanimated v4
- Keep all user-facing strings in Spanish
- Admin-only UI sections are marked with a red shield icon and "Solo Admin" dividers
- The default admin PIN is `"1234"` — never hardcode a different value as default; use `getAdminPin()` from `authStorage.ts`
- Component tests in `__tests__/*.skip` files are intentionally skipped; do not rename them to `.tsx` without also updating the Jest environment
