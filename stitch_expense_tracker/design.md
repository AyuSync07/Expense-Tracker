---
# DESIGN.md
## 1. Design Philosophy & Aesthetic
- Style: Industrial, high-craft minimalism (inspired by Vercel, Linear, and GitHub interfaces).
- Palette Constraints: Strictly monochrome and cool zinc neutrals. Absolutely no purple, violet, indigo, or saturated neon accents.
  - Background Canvas: #09090b (Dark mode) / #fafafa (Light mode)
  - Surface/Card Fill: #121215 (Dark) / #ffffff (Light)
  - Borders/Dividers: 1px solid #27272a (Dark) / #e4e4e7 (Light)
  - Primary Text: #fafafa (Dark) / #09090b (Light)
  - Secondary/Muted Text: #a1a1aa (Dark) / #71717a (Light)
  - Destructive Actions: Subtle muted red (#ef4444) only visible on active/hover states.
- Typography: Strict mono/sans hierarchy.
  - Headings & Labels: Inter, Geist, or system sans-serif.
  - Currency & Numbers: Tabular figures (`font-mono`, e.g., Geist Mono or JetBrains Mono) for perfect visual alignment.
- Spacing & Shapes: Sharp to semi-sharp edges (`rounded-md`, 6px–8px radius), high padding consistency (`p-4` to `p-6`), hairline dividers, and zero heavy drop shadows.
---
## 2. Core Layout Architecture
### A. Global Header
- Left: Monospace application mark (`$ / tracker`) and a subtle live indicator ("Local Storage Sync: Active").
- Right: Current date string formatted as `YYYY-MM-DD` and a clean monochrome session reset button.
### B. Summary Metric Ribbon (3-Column Grid)
- Metric Card 1 (Net Outflow): Large tabular numeric readout of the total accumulated sum with currency symbol (`font-mono text-3xl font-semibold`).
- Metric Card 2 (Dominant Outflow): Top spending category by percentage with a secondary line showing that category's subtotal.
- Metric Card 3 (Log Velocity): Total count of logged items with average transaction spend value.
### C. Workspace View (Asymmetric 5:7 Desktop Grid, Single Column Mobile)
#### Column 1: Transaction Input & Breakdown Analytics
1. Card Component: "Add Transaction"
   - Header: Plain-text card title with keyboard hint shortcut indicator (`[Enter] to submit`).
   - Field 1 (Title): Bordered input field with placeholder "e.g., Domain renewal, Groceries".
   - Field 2 (Amount): Split input group with a fixed currency prefix glyph (`₹` or `$`) and a numeric input step.
   - Field 3 (Category Selection): Clean, native-styled custom select container featuring options:
     - Food & Dining
     - Transportation
     - Utilities & Bills
     - Equipment & Tech
     - Health & Fitness
     - Miscellaneous
   - Action Button: Full-width, high-contrast dark/light inverted button (`bg-zinc-100 text-zinc-900 font-medium hover:bg-zinc-200`) labeled "Record Entry".
2. Card Component: "Allocation Breakdown"
   - Header: Section title with total category tally.
   - Segmented Allocation Bar: A single multi-segmented horizontal bar spanning 100% width, showing proportional fills across categories using varying shades of slate, zinc, and neutral grays (from #27272a to #e4e4e7).
   - Category Breakdown Ledger: Vertical list of active categories showing:
     - Category label
     - Raw amount in monospace
     - Percentage share badge (`[ 34.2% ]`)
#### Column 2: Transaction Ledger & Management
1. Card Component: "Ledger History"
   - Action Sub-header:
     - Live search filter input ("Search entries...")
     - Category filter dropdown ("All Categories")
     - Count display ("Showing N of N entries")
   - Data Table / Feed Layout:
     - Header Row: Subtle uppercase labels (`ITEM`, `CATEGORY`, `DATE`, `AMOUNT`, `ACTION`).
     - Feed Rows:
       - Column A: Expense title with timestamp subtext (`HH:mm`).
       - Column B: Low-contrast neutral badge for Category name (`border border-zinc-700 text-xs px-2 py-0.5`).
       - Column C: Relative or absolute date (`Today`, `Yesterday`, or `Oct 27`).
       - Column D: Monospace right-aligned amount (`-₹1,240.00`).
       - Column E: Low-profile icon action slot with a monochrome trash icon that transitions to muted red only on hover.
   - Zero-State Component:
     - Displays when ledger is empty.
     - Thin wireframe dashed border container with centered monochrome icon, "No expenses recorded", and subtext "Submit the form on the left to start tracking."