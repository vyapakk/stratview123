

## Simplified "Got a Query?" — Zero Dashboard Edits

### Problem
Adding `<QueryFormTab>` to all 25 Dashboard.tsx files is tedious and error-prone.

### Solution
Render `QueryFormTab` **once in App.tsx**, inside the `<BrowserRouter>`, and have it auto-detect the current dashboard from the URL using `useLocation` + the existing `dashboardRegistry`.

- On dashboard routes: tab is visible, title is derived from the registry
- On non-dashboard routes: tab is hidden (renders nothing)

### Changes

**Modified: `src/components/QueryFormTab.tsx`**
- Remove the `dashboardTitle` prop
- Add internal logic: use `useLocation()` to get current path, look up matching entry in `dashboardRegistry`, extract title
- If no match (not on a dashboard page), return `null`

**Modified: `src/App.tsx`** (1 line)
- Add `<QueryFormTab />` next to `<Toaster />` and `<Sonner />`, inside `<BrowserRouter>` (so `useLocation` works)

**Modified: All 25 `src/dashboards/*/Dashboard.tsx`**
- Remove the `<QueryFormTab dashboardTitle={config.title} />` line and its import (cleanup)

### Total
- 1 component refactored (self-detecting)
- 1 line added to App.tsx
- 25 lines + imports **removed** from dashboards (simplification)
- Net result: QueryFormTab lives in one place, works everywhere, zero per-dashboard maintenance

