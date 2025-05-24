## Monthly Reports – Static-Data Revamp (Sprint 1)

Legend: `[ ]` = pending `[x]` = done / implemented

### A. KPI strip
- [x] Add ROI on Retainer metric card
- [x] Add CPC Equivalence metric card
- [x] Extract strip into reusable `<KPIStrip>` component (Quarterly will reuse)
- [x] Blue "info" disclaimer under strip for estimated metrics
- [x] Prop/flag to hide ROI & CPC during first 2 months (static toggle for now)

### B. Metrics & Charts
- [x] Delete "Average Keyword Position" everywhere
- [x] Replace with Top-3 + 4-10 keyword bucket bar-chart
- [x] Channel Performance ➜ remove Impressions series, keep Clicks/Leads/Revenue

### C. UX / Information Architecture
- [x] Build generic `<CollapsibleSection>` wrapper
- [x] Default-collapse all sections except Executive Summary + KPI strip
- [x] Add 16×16 icon in front of every section header (reuse lucide-react)
- [x] Ensure long headings wrap on narrow screens (utility classes)

### D. Executive Summary
- [x] Auto-generate bullet list (one per collapsed section)
- [x] Provide "override" textarea (static placeholder for now)

### E. Wins & Cautions
- [x] Separate full-width cards for Wins
- [x] Separate full-width cards for Cautions

### F. Competitor / Market Intel
- [x] Swap rank-change table for free-text "Key Take-aways"
- [x] Support optional screenshot / external link upload (static demo)
- [x] Render 1-N competitor intel cards

### G. Data hooks & Toggles (stubbed)
- [x] Static constants for ROI, CPC, keyword buckets, etc.
- [x] Boolean `includeInReport` per metric (hard-coded list)

### H. Misc / Polish
- [x] Add blue "info" disclaimer blocks for estimated figures across page
- [x] Re-use KPI strip inside Quarterly tab (static)
- [x] Prop-driven theme colours centralised in `reportTheme.ts`


---

Checked-in by AI assistant – 2025-05-24 