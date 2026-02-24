# CLAUDE.md — SanchezMotors

## Project Overview

**SanchezMotors** is an offline-first mobile workshop management app built with React Native + Expo. It digitizes vehicle reception, task tracking (Kanban), and budget/quoting workflows for automotive workshops. The UI is entirely in Spanish, targeting the Latin American (Mexico) market.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | React Native 0.81.5 / React 19.1.0 |
| Framework | Expo ~54.0.33 (New Architecture enabled) |
| Language | TypeScript (strict mode) |
| Routing | expo-router ^6.0.23 (file-based) |
| State | React Context API (`AppContext`) |
| Persistence | AsyncStorage ^2.2.0 (offline-first) |
| Camera/Media | expo-camera, expo-image-picker, expo-media-library |
| File System | expo-file-system |
| Export | expo-print (PDF), expo-sharing |
| Deep Linking | expo-linking ^8.0.11 |
| Crypto | expo-crypto ^15.0.8 |
| Animations | react-native-reanimated ~4.1.1 |
| Worklets | react-native-worklets ^0.7.4 (required by reanimated v4) |
| Gestures | react-native-gesture-handler ~2.28.0 |
| Navigation infra | react-native-screens, react-native-safe-area-context |
| Icons | @expo/vector-icons ^15 (Ionicons) |
| Unique IDs | uuid ^9.0.0 + custom `src/utils/uuid.ts` shim |
| Build config | expo-build-properties ^1.0.10 |
| Testing | Jest ~29.7.0 + ts-jest + @testing-library/react-native |

---

## Project Structure

```
SanchezMotors/
├── app/                            # Expo Router pages
│   ├── _layout.tsx                 # Root layout — wraps AppProvider
│   ├── index.tsx                   # Entry redirect to /(tabs)/reception
│   ├── +not-found.tsx              # 404 not-found screen
│   └── (tabs)/
│       ├── _layout.tsx             # Tab bar config (3 tabs: Recepción, Tareas, Presupuesto)
│       ├── reception.tsx           # Order intake & vehicle inspection
│       ├── tasks.tsx               # Kanban task board
│       └── budget.tsx              # Quotes, costs, PDF/WhatsApp export
│
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── ActionButton.tsx        # Variants: primary, secondary, danger, success
│   │   ├── FormField.tsx           # Labeled TextInput with optional required marker
│   │   ├── OrderCard.tsx           # Order list card with status, vehicle, task stats
│   │   ├── OrderView.tsx           # Full-screen inline read-only order viewer (pinch-zoom photos)
│   │   ├── OrderViewModal.tsx      # Modal overlay read-only order viewer
│   │   ├── PhotoGrid.tsx           # 6-slot mandatory inspection photos
│   │   ├── PinModal.tsx            # Admin PIN entry (4–6 digit, numeric, secure)
│   │   ├── StatusBadge.tsx         # Colored pill badge for order/task status
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
│   │   └── index.ts                # WorkOrder, WorkTask, BudgetSummary, PHOTO_SLOT_LABELS, etc.
│   └── utils/
│       ├── formatters.ts           # Currency, dates, margin calculations
│       ├── otGenerator.ts          # OT ID format: YYMMDD-##
│       ├── uuid.ts                 # UUID v4 generator (Math.random-based, RN-compatible)
│       └── __tests__/
│           ├── formatters.test.ts
│           └── otGenerator.test.ts
│
├── assets/                         # Icons and splash screens
├── scripts/
│   └── build-and-install-android.sh  # Local dev build + ADB install script
├── .github/
│   └── workflows/
│       ├── test.yml                # CI: typecheck + tests on every push/PR
│       └── build-android.yml       # CI: Release + Debug APKs on main/release/tags (+ manual dispatch)
├── app.json                        # Expo app manifest (scheme: "workshop-manager")
├── babel.config.js                 # Babel: babel-preset-expo + reanimated plugin
├── eas.json                        # EAS build profiles (preview / production)
├── index.ts                        # App entry point
├── jest.config.js                  # Jest config (ts-jest, node env, coverage thresholds)
├── jest.setup.js                   # Jest mocks (AsyncStorage, expo-router, Ionicons, console.error)
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

# Build and install directly on a connected Android device (debug by default)
npm run build:android:debug
# Pass a build type argument: debug or release
bash scripts/build-and-install-android.sh debug
bash scripts/build-and-install-android.sh release
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

- `@react-native-async-storage/async-storage` — all methods mocked with `jest.fn()` (setItem, getItem, removeItem, getAllKeys, clear, multiSet, multiGet)
- `expo-router` — `useRouter`, `useLocalSearchParams`, `usePathname` mocked
- `@expo/vector-icons` — `Ionicons` returns `null`
- `console.error` — suppressed for ReactDOM.render and Non-serializable values warnings during tests

### CI Pipeline

**`test.yml`** — runs on every push and pull request to any branch (Node 22):
1. TypeScript type check (`npm run typecheck`)
2. Test suite (`npm test -- --ci --forceExit`)
3. Uploads coverage report as artifact (7-day retention)

**`build-android.yml`** — runs on `main`, `release/**` branches, `v*` tags, and manual `workflow_dispatch` (Node 22, Java 17):
1. Sets up Android SDK
2. Installs dependencies (`npm ci --legacy-peer-deps`)
3. Generates native Android project (`expo prebuild`)
4. Caches Gradle dependencies
5. Builds release APK → uploads as artifact (30-day retention)
6. Builds debug APK → uploads as artifact (30-day retention)
7. Prints build summary to GitHub Step Summary with artifact paths and sizes

> **Note:** The AAB (App Bundle) build step is currently **disabled** (commented out) in `build-android.yml`. Only APKs are produced by CI.

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

### Read-Only Order View
Two components provide read-only display of a `WorkOrder`:
- **`OrderView`** — full-screen inline renderer (not a Modal). Supports pinch-to-zoom and pan on inspection photos via raw touch event handling. Has a pencil icon button in the header to trigger edit mode. Used as the primary view-only display.
- **`OrderViewModal`** — modal overlay variant (slide animation). Photo preview is tap-to-open, no zoom. Has an "Editar Orden" footer button. Kept for reference; `OrderView` is the current production choice.

Both components accept `{ order, onClose, onEdit }` props and display: client info, vehicle info, reason for visit, inspection photos, and task summary.

### UUID Generation
`src/utils/uuid.ts` exports `generateUUID()` — a UUID v4 implementation using `Math.random()`. This is used internally by `orderStorage.ts` to create task IDs. It avoids the `crypto.getRandomValues()` dependency that can cause issues in some React Native/Jest environments. The `uuid` npm package is still listed as a dependency but `generateUUID()` from this utility is the canonical source for new IDs.

### Android Target Configuration
Configured via `expo-build-properties` plugin in `app.json`:
- `compileSdkVersion`: 35
- `targetSdkVersion`: 35
- `minSdkVersion`: 24
- `buildToolsVersion`: 35.0.0
- `kotlinVersion`: 2.0.21
- `ndkVersion`: 27.0.12077973
- `sourceCompatibility`: VERSION_21
- `targetCompatibility`: VERSION_21
- `extraGradleProperties`: `kotlin.compose.compiler.suppressKotlinVersionCompatibilityCheck=true`

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

### Constants
```typescript
PHOTO_SLOT_LABELS: Record<PhotoSlot, string>
// Maps slot keys to Spanish labels:
// front → 'Frontal', rear → 'Trasera', left → 'Lateral Izquierdo',
// right → 'Lateral Derecho', interior_front → 'Interior Frontal', interior_rear → 'Interior Trasero'
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

## Storage API Reference

### `orderStorage.ts`

| Function | Description |
|---|---|
| `getAllOrders()` | Returns all `WorkOrder[]` from AsyncStorage |
| `getOrderById(id)` | Finds a single order by ID |
| `saveOrder(order)` | Upserts a `WorkOrder` (updates `updatedAt` on update) |
| `deleteOrder(id)` | Removes an order by ID |
| `createEmptyOrder(otId)` | Factory — returns a blank `WorkOrder` with DynamoDB keys set |
| `createEmptyTask(orderId)` | Factory — returns a blank `WorkTask` with a new UUID and DynamoDB keys set |
| `exportDailyData()` | Returns pretty-printed JSON of today's orders for USB/OTG backup |

### `authStorage.ts`

| Function | Description |
|---|---|
| `getAuthState()` | Returns current `AuthState` from AsyncStorage (defaults to unauthenticated mechanic) |
| `loginAsAdmin(pin)` | Validates PIN against stored PIN; persists admin session; returns `boolean` |
| `loginAsMechanic()` | Persists mechanic session (no PIN required) |
| `logout()` | Removes auth state from AsyncStorage |
| `getAdminPin()` | Returns stored PIN or default `"1234"` |
| `setAdminPin(pin)` | Persists a new admin PIN |
| `isAdmin()` | Convenience function; returns `true` if current role is `'admin'` |

---

## Utility Functions (`src/utils/formatters.ts`)

| Function | Description |
|---|---|
| `formatCurrency(amount)` | Formats number as `$1,234.56` |
| `formatDate(isoString)` | Formats ISO date in Spanish (es-MX locale), e.g. `"22 feb. 2026"` |
| `formatDateTime(isoString)` | Formats ISO datetime in Spanish with time, e.g. `"22 feb. 2026, 10:30 a. m."` |
| `formatHours(hours)` | Converts decimal hours to `"2h 30m"` format |
| `calculateMargin(sale, cost)` | Returns `(sale - cost) / sale * 100`; returns `0` if sale is `0` |
| `getStatusLabel(status)` | Maps status keys to Spanish labels (Recepción, En Proceso, Finalizado, Entregado, Pendiente) |

---

## Utility Functions (`src/utils/uuid.ts`)

| Function | Description |
|---|---|
| `generateUUID()` | Generates a UUID v4 using `Math.random()`; safe in React Native and Jest environments |

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

Exposed via `useApp()` hook. Must be used inside `<AppProvider>` (provided in `app/_layout.tsx`).

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
isAdmin: boolean              // computed: role === 'admin'
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
- **Photos**: Compressed at 0.7 quality; stored as local URIs; picker shows Alert with Camera / Galería options
- **Time tracking**: Stored as decimal hours (e.g., `2.5` = 2h 30m); displayed via `formatHours()`
- **Kanban columns**: `pending` (yellow) → `in_progress` (blue) → `completed` (green)
- **WhatsApp integration**: Mexico prefix (`52`) hardcoded; validates phone before deep-link
- **Path alias**: `@/*` maps to the repo root (configured in `tsconfig.json`)
- **Admin UI markers**: Admin-only sections use a red shield icon and "Solo Admin" dividers
- **npm install**: Always use `--legacy-peer-deps` flag (required due to peer dependency conflicts)

---

## App Manifest Notes (`app.json`)

- **Scheme**: `"workshop-manager"` (deep-link URL scheme)
- **New Architecture**: `newArchEnabled: true` — required by react-native-reanimated v4; do not disable
- **Android permissions**: CAMERA, storage, RECORD_AUDIO, READ_MEDIA_IMAGES, READ_MEDIA_VIDEO, READ_MEDIA_AUDIO, READ_MEDIA_VISUAL_USER_SELECTED
- **iOS**: Camera, photo library, and microphone usage descriptions provided (in Spanish)
- **Package ID**: `com.tuinsomnia.workshopmanager`

---

## EAS Build Config (`eas.json`)

| Profile | Output | Distribution |
|---|---|---|
| `preview` | APK | Internal |
| `production` | AAB (App Bundle) | — |

CLI version requirement: `>= 15.0.0`. `appVersionSource: "remote"`.

---

## Local Build Script (`scripts/build-and-install-android.sh`)

A convenience shell script that mirrors the CI build pipeline for local development:

1. Installs dependencies with `npm install --legacy-peer-deps`
2. Runs `expo prebuild --platform android --clean`
3. Patches `android/build.gradle` to inject SDK version ext block if missing
4. Builds the APK (debug or release) via Gradle
5. Verifies the APK exists at the expected output path
6. Checks for connected adb devices
7. Installs the APK on the first connected device via `adb install -r`

Usage: `npm run build:android:debug` (defaults to release build; pass `debug` or `release` as argument).

---

## Future Roadmap (from code comments)

- AWS Amplify DataStore + GraphQL for cloud sync
- AWS Cognito for proper authentication (replacing PIN)
- S3 for photo storage (`OrderImage.s3Link` already typed)
- Activate skipped component tests (JSDOM env setup needed)
- Expand to iOS builds
- Re-enable AAB (App Bundle) CI build when Play Store distribution is ready

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
- `createEmptyOrder(otId)` and `createEmptyTask(orderId)` are the canonical factory functions for new records — use them to ensure pk/sk fields are set correctly
- Use `generateUUID()` from `src/utils/uuid.ts` for new IDs inside `src/` — it avoids the `crypto.getRandomValues()` issue in React Native and Jest
- Always pass `--legacy-peer-deps` when running `npm install` or `npm ci`
- The AAB build is currently disabled in CI; do not assume AAB artifacts are produced automatically
- CI builds both a Release APK and a Debug APK on every qualifying push
