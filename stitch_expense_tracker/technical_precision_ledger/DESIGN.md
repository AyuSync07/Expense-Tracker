---
name: Technical Precision Ledger
colors:
  surface: '#131316'
  surface-dim: '#131316'
  surface-bright: '#39393c'
  surface-container-lowest: '#0e0e11'
  surface-container-low: '#1b1b1e'
  surface-container: '#1f1f22'
  surface-container-high: '#2a2a2d'
  surface-container-highest: '#353438'
  on-surface: '#e4e1e6'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e4e1e6'
  inverse-on-surface: '#303033'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c6c6cf'
  on-secondary: '#2f3037'
  secondary-container: '#45464e'
  on-secondary-container: '#b4b4bd'
  tertiary: '#ffffff'
  on-tertiary: '#32302d'
  tertiary-container: '#e7e1dd'
  on-tertiary-container: '#676460'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e2e1eb'
  secondary-fixed-dim: '#c6c6cf'
  on-secondary-fixed: '#1a1b22'
  on-secondary-fixed-variant: '#45464e'
  tertiary-fixed: '#e7e1dd'
  tertiary-fixed-dim: '#cbc6c1'
  on-tertiary-fixed: '#1d1b19'
  on-tertiary-fixed-variant: '#494643'
  background: '#131316'
  on-background: '#e4e1e6'
  surface-variant: '#353438'
  canvas-bg: '#09090b'
  surface-bg: '#121215'
  border-subtle: '#27272a'
  text-primary: '#fafafa'
  text-muted: '#a1a1aa'
  destructive-hover: '#ef4444'
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-mono-lg:
    fontFamily: JetBrains Mono
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  label-mono-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-mono-xs:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
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
