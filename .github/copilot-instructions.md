# Copilot instructions for this repo

## Big picture architecture
- Next.js (Pages Router) app under src/pages with page-level data fetching in `getServerSideProps` (see src/pages/r/[communityId]/index.tsx).
- UI is built with Chakra UI + custom theme (src/chakra/theme.ts); avoid Tailwind in this repo.
- Global app shell is in src/pages/_app.tsx: `RecoilRoot` wraps the app and `Layout` adds the navbar.
- State is managed with Recoil atoms in src/atoms (e.g., `postState`, `communityState`) and accessed via hooks in src/hooks.
- Firebase is the backend: client SDK configured in src/firebase/clientApp.ts (env vars are `NEXT_PUBLIC_FIREBASE_*`).
- Firebase Cloud Functions live in functions/src (compiled to functions/lib); auth trigger example in functions/src/index.ts.

## Data flow & patterns
- Firestore reads/writes are done in hooks and components (e.g., `usePosts`, `useCommunityData`) and update Recoil state.
- Voting uses batched writes and optimistic local updates in `usePosts` (src/hooks/usePosts.tsx).
- Community membership uses batched writes and `increment` for member counts in `useCommunityData` (src/hooks/useCommunityData.tsx).
- Use `safe-json-stringify` to serialize Firestore timestamps for SSR props (src/pages/r/[communityId]/index.tsx).

## Project-specific conventions
- Path alias `@/` maps to src/ (tsconfig.json). Prefer this for imports.
- Components are grouped by feature in src/components (Community, Posts, Modal, Layout). Navbar lives in a folder named src/components/Navbar.tsx/.
- Firebase error strings are mapped to UX messages in src/firebase/errors.ts; reuse this map for auth UI.

## Developer workflows
- App dev server: `npm run dev` (root package.json).
- App build/start: `npm run build`, `npm run start`.
- Functions: `npm --prefix functions run build` and emulator via `npm --prefix functions run serve`.

## Integration points
- Firebase Auth/Firestore/Storage are used throughout; use the shared instances from src/firebase/clientApp.ts.
- Storage uploads for community images use `uploadString` and then `getDownloadURL` (src/components/Community/About.tsx).
