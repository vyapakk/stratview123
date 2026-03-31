

## Phase 2: Wire Up Authentication

Replace all mock auth with real Supabase Auth. Create auth context, protect routes, and wire up existing pages.

---

### New Files

**1. `src/hooks/useAuth.tsx`** — Auth context provider
- Uses `supabase.auth.onAuthStateChange()` listener (set up BEFORE `getSession()`)
- Stores `session`, `user`, `profile` (from profiles table), `role` (from user_roles table), `isLoading`
- Exposes `signOut()`, `isAdmin` boolean
- Fetches profile and role after auth state changes
- Provides `AuthProvider` wrapper and `useAuth()` hook

**2. `src/pages/ResetPassword.tsx`** — New password reset page
- Checks for `type=recovery` in URL hash params
- Form with new password + confirm password (reuse existing password validation UI pattern from SignUp)
- Calls `supabase.auth.updateUser({ password })` on submit
- Redirects to login on success
- Same split-panel layout as ForgotPassword for consistency

**3. `src/components/ProtectedRoute.tsx`** — Route guard component
- Wraps children, checks `useAuth()` for active session
- If loading, shows spinner
- If no session, redirects to `/`
- Optional `requireAdmin` prop that also checks role

---

### Modified Files

**4. `src/App.tsx`**
- Wrap everything inside `<BrowserRouter>` with `<AuthProvider>`
- Add `/reset-password` route
- Wrap `/dashboard`, `/my-account`, `/dataset/:datasetId`, and all dashboard registry routes with `<ProtectedRoute>`

**5. `src/components/LoginForm.tsx`**
- Replace mock `setTimeout` with `supabase.auth.signInWithPassword({ email, password })`
- Show error toast on failure (invalid credentials, etc.)
- On success, navigation happens automatically via auth state change

**6. `src/pages/SignUp.tsx`**
- Replace mock `setTimeout` with `supabase.auth.signUp({ email, password, options: { data: { name, company, designation, phone, industry }, emailRedirectTo: window.location.origin } })`
- Show success message ("Check your email to confirm") or error
- The `handle_new_user` trigger auto-creates profile + assigns 'user' role

**7. `src/pages/ForgotPassword.tsx`**
- Replace mock with `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`
- Rest of the UI stays the same

**8. `src/components/DashboardHeader.tsx`**
- Replace hardcoded "John Doe" with `useAuth().profile?.name`
- Replace mock `handleLogout` with `supabase.auth.signOut()` + navigate to `/`

**9. `src/pages/MyAccount.tsx`**
- Replace `mockProfile` with real data from `useAuth().profile`
- Wire `handleSave` to `supabase.from('profiles').update(...)` 
- Email remains read-only (from auth)

---

### Technical Details

- Auth listener pattern: `onAuthStateChange` registered first, then `getSession()` called — prevents race conditions
- Session persistence: already configured in `supabase/client.ts` with `persistSession: true`
- Profile fetch uses `.select('*').eq('id', user.id).single()` on the profiles table
- Role check uses the existing `has_role()` DB function via `.rpc('has_role', { _user_id, _role: 'admin' })`
- No database changes needed — Phase 1 schema is complete

---

### What This Enables

After Phase 2:
- Real user signup with email confirmation
- Real login/logout with session persistence
- Password reset flow (forgot → email → reset page)
- Protected routes (unauthenticated users redirected to login)
- Real user profile on My Account and header
- Foundation ready for Phase 3 (access control) and Phase 4 (admin panel)

