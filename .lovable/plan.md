

## "Got a Query?" Floating Edge Tab with Form

### What We're Building
A floating "Got a Query?" tab fixed to the right edge of the screen on every dashboard. It has a subtle blinking/pulsing animation to draw attention. Clicking it opens a slide-out form where users can submit questions to your research analyst team.

The form auto-fills Name, Designation, and Company from the user profile (mock data for now), and lets users enter/edit Email, Phone, and their Query.

### Approach — Minimal File Changes

**1 new file** + **1 line added to each of the 25 Dashboard.tsx files** + **1 CSS addition to index.css**.

### Files

**New: `src/components/QueryFormTab.tsx`**
- A fixed-position "Got a Query?" tab on the right edge of the viewport (rotated text, sticking out like a side tab)
- CSS animation: pulsing glow/border effect to catch the eye
- On click: opens a Dialog/Sheet with the query form
- Form fields:
  - **Name** (pre-filled, read-only) — from mock profile
  - **Designation** (pre-filled, read-only) — from mock profile
  - **Company** (pre-filled, read-only) — from mock profile
  - **Email** (editable, pre-filled from profile)
  - **Phone** (editable, pre-filled from profile)
  - **Your Query** (textarea, required)
- Header message: "Talk to our Research Analyst"
- Subtitle: "Our team will get in touch within 72 hours"
- Submit button shows a success toast; form resets query field
- Passes the current dashboard title (from `config.title`) so the query is contextual

**Modified: `src/index.css`**
- Add a `@keyframes query-tab-pulse` animation for the blinking/pulsing glow effect

**Modified: Each `src/dashboards/*/Dashboard.tsx` (25 files)**
- Add one import: `import QueryFormTab from "@/components/QueryFormTab";`
- Add `<QueryFormTab dashboardTitle={config.title} />` inside the root `<div>`, just before `</div>`
- This is a single-line addition per file

### Technical Details
- Uses existing shadcn Sheet component for the slide-out panel
- Uses existing Input, Textarea, Label, Button components
- Mock profile data imported from a shared constant (same pattern as MyAccount.tsx)
- The edge tab uses `fixed right-0 top-1/2` positioning with `writing-mode: vertical-rl` for rotated text
- Animation: CSS `pulse` keyframe with alternating opacity/box-shadow for a subtle blink effect
- Fully responsive — tab visible on all screen sizes, form adapts to mobile

### Total changes
- 1 new shared component
- 1 CSS keyframe addition
- 25 single-line insertions (one per dashboard)

