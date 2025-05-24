# Quarterly Reports Tab: Implementation Status & Requirements

This document outlines the current implementation status of the "Quarterly Reports" tab features, as defined by the provided requirements. The analysis is based on `src/app/reports/page.tsx`.

**Overall Status:**
The `src/app/reports/page.tsx` file provides the foundational framework for the Quarterly Reports tab. This includes:
*   Tab navigation to access "Quarterly" reports.
*   Listing and selection of available quarterly reports.
*   A designated content area where the selected quarterly report (rendered via `<QuarterlyReportV2 />`) is displayed.

The specific content, layout, and features detailed in the requirements for the quarterly report view itself are expected to be implemented within the `<QuarterlyReportV2 />` component. **As `QuarterlyReportV2.tsx` was not provided for this analysis, the implementation status of most detailed features listed below is "Cannot Verify" based on `page.tsx` alone. These items represent what needs to be built or confirmed within `QuarterlyReportV2.tsx`.**

---

## I. Core Tab Functionality (Handled by `src/app/reports/page.tsx`)

*   **Purpose:** Strategic checkpoint to align expectations, showcase ROI, and set priorities.
    *   **Status:** Implied by Tab Existence.
    *   **Details:** The presence of a "Quarterly" tab in `page.tsx` indicates a dedicated section for these strategic reviews.
*   **Default View - Structured Page:**
    *   **Status:** Implemented.
    *   **Details:** `page.tsx` provides the main page structure with tab navigation, a list of quarterly reports, and a content display area.

---

## II. Quarterly Report Content & Layout (Expected within `QuarterlyReportV2.tsx`)

The following sections and their features are requirements for the content of an individual quarterly report. Their implementation status depends on the contents of `QuarterlyReportV2.tsx`.

### A. Default View Enhancements (within `QuarterlyReportV2.tsx`)
*   **Loom Support:**
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Integration for embedding or linking Loom videos.
*   **Async-read Layout:**
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Layout optimized for easy asynchronous reading.

### B. Layout Sections (within `QuarterlyReportV2.tsx`)

#### 1. Executive Summary
*   **3 Summary KPI Cards:**
    *   Traffic Growth (QoQ/YoY %).
    *   Lead Growth (QoQ/YoY %).
    *   Revenue Impact (Pipeline Value).
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Create these three specific KPI cards. The `KPIStrip.tsx` component (which `docs/monthly_report_update_tasks.md` indicates is reused for quarterly reports) provides a basis for percentage change cards but may need adaptation for QoQ/YoY and the "Revenue Impact" card.
*   **Trendline Chart:** (Sessions, Leads, Revenue) over the last 4 quarters—minimal labels, clean lines, delta-focused.
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Implement chart using a library like `recharts` (already imported in `page.tsx`).
*   **Text Block for Actual Summary:**
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Add a rich text area or simple text block.
*   **Visual Hierarchy:** Cards → Chart → Text.
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Ensure this visual order in the layout.

#### 2. Traffic & Revenue
*   **Compact Comparison Table (QoQ/YoY view):**
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Table displaying metrics for QoQ/YoY comparison.
*   **Sortable by Metric (sessions, leads, revenue):**
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Add sorting functionality to the table.
*   **Delta Arrows and Colour-coded Changes:**
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Visual indicators for changes in the table.

#### 3. Deliverables Roll Up
*   **Bullet Summary:**
    *   Number of briefs delivered.
    *   Number of articles published (average word count).
    *   Number of backlinks secured (average DR).
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Display these metrics in a bulleted list.

#### 4. Top Performing Pages
*   **Table View:** Columns: URL | Traffic | Conversions. Ranked by traffic volume descending.
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Implement the specified table.
*   **Table Features:**
    *   Clickable URLs.
    *   Deltas for conversions (if applicable).
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Add these interactive elements to the table.

#### 5. Experiments
*   **Grid of Icon-based Cards (2x2 on desktop):** Each card represents one experiment. Icon + 1-line insight.
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Create this card grid layout.
*   **Visual Focus:** Keep icons uniform. Text sits beneath each icon for readability.
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Ensure consistent styling for experiment cards.

#### 6. Next Quarter Roadmap
*   **Narrative Split View:**
    *   "Where we are now" → Highlights the current positioning.
    *   "Where we're heading next" → Bullet list of next quarter priorities.
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Implement this two-part section.

#### 7. Competitor Intel
*   **Table View:** Columns: Competitor | Keyword Focus | Rank Change (QoQ) | Notable Activity. Compact, sortable by rank change.
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Implement the competitor analysis table.
*   **Highlight Box (below table):** Key takeaways.
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Add a text area for key takeaways.

#### 8. Risk and Tradeoffs
*   **Bullet List Format:**
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** Section for listing risks and tradeoffs.

#### 9. TL;DR
*   **Text Block:**
    *   **Status:** Cannot Verify.
    *   **To Implement/Verify:** A concise summary text block.

---

**Summary of Items to Implement/Verify in `QuarterlyReportV2.tsx`:**

*   **Loom Support Integration.**
*   **Optimized Async-Read Layout.**
*   **Executive Summary Section:**
    *   Specific 3 KPI cards (Traffic Growth QoQ/YoY, Lead Growth QoQ/YoY, Revenue Impact).
    *   Trendline chart (Sessions, Leads, Revenue - last 4 quarters).
    *   Text block for the summary.
    *   Correct visual hierarchy.
*   **Traffic & Revenue Section:**
    *   QoQ/YoY comparison table.
    *   Sortable metrics.
    *   Delta arrows and color-coding.
*   **Deliverables Roll Up Section:**
    *   Bullet summary of deliverables (briefs, articles with avg. word count, backlinks with avg. DR).
*   **Top Performing Pages Section:**
    *   Table (URL, Traffic, Conversions, ranked by traffic).
    *   Clickable URLs and conversion deltas.
*   **Experiments Section:**
    *   Grid of icon-based cards with insights and uniform styling.
*   **Next Quarter Roadmap Section:**
    *   Narrative split view for current status and next priorities.
*   **Competitor Intel Section:**
    *   Table with competitor data, rank changes, and sortability.
    *   Highlight box for key takeaways.
*   **Risk and Tradeoffs Section:**
    *   Bullet list format.
*   **TL;DR Section:**
    *   Text block.

**Recommendation:**
Review or create the `QuarterlyReportV2.tsx` component to implement these detailed features for the Quarterly Reports tab. 