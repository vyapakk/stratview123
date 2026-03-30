

## Make "Got a Query?" Tab Smaller on Mobile

### Change
In `src/components/QueryFormTab.tsx`, add responsive Tailwind classes to the trigger button to reduce its size on mobile screens:

- Padding: `px-2 py-2 sm:px-3 sm:py-4`
- Font size: `text-xs sm:text-sm`
- Icon: `h-4 w-4 sm:h-5 sm:w-5`
- Gap: `gap-1 sm:gap-2`

**1 file changed**, no other files touched.

