# Quarterly Report Page: Development Plan

This plan outlines the tasks required to build the Quarterly Report page, based on the provided scope and feedback. All implementations are expected within the `QuarterlyReportV2.tsx` component unless otherwise specified.

## I. Overall Page Structure & Default View (within `QuarterlyReportV2.tsx`)

-   [ ] **Main Layout:**
    -   [ ] Ensure the page is structured for an "async-read" experience (clear, scannable sections).
    -   [ ] Implement all major sections as collapsible, similar to the `<CollapsibleSection>` component used in `src/components/reports/MonthlyReportV2.tsx` (startLine: 17, endLine: 17).
        *   *Feedback Note: "Collapsable sections" requested.*
-   [ ] **Loom Support:**
    -   [ ] Integrate a section for embedding or linking a Loom video walkthrough.
        *   *Reference: See Loom placeholder in `src/components/reports/MonthlyReportV2.tsx` (startLine: 120, endLine: 125).*
-   [ ] **Visual Enhancements:**
    -   [ ] Throughout development, prioritize clear visual elements and data presentation.
        *   *Feedback Note: "In general these reports need more visual elements to them."*

## II. Layout Sections & Content

### 1. Executive Summary
    *   *Feedback Note: "Executive summary - need another design of information." While implementing the following, consider if the overall presentation meets this feedback. Further design iteration may be needed.*
-   [ ] **KPI Cards (3 total):**
    -   [ ] Implement "Traffic Growth (QoQ/YoY %)" card.
        *   *Leverage/adapt `KPIStrip.tsx` (see `src/components/reports/KPIStrip.tsx`) for percentage change display.*
        *   *Data will need to be QoQ/YoY.*
    -   [ ] Implement "Lead Growth (QoQ/YoY %)" card.
        *   *Leverage/adapt `KPIStrip.tsx`.*
        *   *Data will need to be QoQ/YoY.*
    -   [ ] Implement "Revenue Impact (Pipeline Value)" card.
        *   *This may require a new card design or adaptation of `KPIStrip.tsx` elements if not purely a percentage change.*
-   [ ] **Trendline Chart:**
    -   [ ] Implement a trendline chart displaying Sessions, Leads, and Revenue over the last 4 quarters.
    -   [ ] Ensure minimal labels, clean lines, and focus on deltas.
        *   *Use a charting library like `recharts`, already imported in `src/components/reports/MonthlyReportV2.tsx` (startLine: 15, endLine: 15).*
-   [ ] **Text Block:**
    -   [ ] Add a text block/area for the narrative "actual summary."
-   [ ] **Visual Hierarchy:**
    -   [ ] Ensure the layout order is: KPI Cards → Trendline Chart → Text Block.

### 2. Traffic & Revenue
-   [ ] **Comparison Table:**
    -   [ ] Implement a compact table for QoQ/YoY comparison of traffic, leads, and revenue.
    -   [ ] Add functionality to sort the table by each metric (sessions, leads, revenue).
    -   [ ] Include delta arrows (e.g., up/down arrows) and color-coded changes (e.g., green for positive, red for negative) to reinforce wins/losses.

### 3. Deliverables Roll Up
-   [ ] **Bullet Summary:**
    -   [ ] Display "Number of briefs delivered."
    -   [ ] Display "Number of articles published (average word count)."
    -   [ ] Display "Number of backlinks secured (average DR)."

### 4. Top Performing Pages
-   [ ] **Table View:**
    -   [ ] Implement a table with columns: URL | Traffic | Conversions.
    -   [ ] Ensure the table is ranked by "Traffic" volume in descending order by default.
    -   [ ] Make URLs in the table clickable, opening in a new tab.
    -   [ ] Display deltas for "Conversions" (if applicable, e.g., QoQ change).

### 5. Experiments
-   [ ] **Icon-based Card Grid:**
    -   [ ] Implement a grid of cards (target 2x2 on desktop).
    -   [ ] Each card should represent one experiment and include:
        -   An icon.
        -   A 1-line insight (e.g., "Title tag tests → CTR +1.7 pts").
    -   [ ] Ensure icons used are uniform in style.
    -   [ ] Position the text insight beneath each icon for readability.

### 6. Next Quarter Roadmap
-   [ ] **Narrative Split View:**
    -   [ ] Implement a section titled "Where we are now" for highlighting current positioning (text area).
    -   [ ] Implement a section titled "Where we're heading next" for a bullet list of next quarter priorities.

### 7. Competitor Intel
-   [ ] **Table View:**
    -   [ ] Implement a compact table with columns: Competitor | Keyword Focus | Rank Change (QoQ) | Notable Activity.
    -   [ ] Add functionality to sort the table by "Rank Change (QoQ)."
-   [ ] **Screenshot Capability:**
    -   [ ] Add the ability to include/upload/link screenshots within this section.
        *   *Feedback Note: "Competitor Intel - need ability to add screenshots."*
-   [ ] **Highlight Box:**
    -   [ ] Add a text area below the table for "Key takeaways" (e.g., "Opportunity to outrank Competitor B on Alternatives keywords").

### 8. Risk and Tradeoffs
-   [ ] **Bullet List:**
    -   [ ] Implement a section using a bullet list format to outline risks and tradeoffs.

### 9. TL;DR
-   [ ] **Text Block:**
    -   [ ] Add a concise text block for a "Too Long; Didn't Read" summary of the quarterly report.
        *   *Consider placing this near the top, perhaps within or alongside the Executive Summary, similar to `src/components/reports/MonthlyReportV2.tsx` (startLine: 110, endLine: 113).*

## III. Data Integration
-   [ ] For each section, identify and integrate the necessary data sources.
-   [ ] Ensure data accurately reflects Quarterly (QoQ, YoY) comparisons where specified.

## IV. Review and Refinement
-   [ ] Conduct a thorough review of the implemented Quarterly Report page against all requirements.
-   [ ] Test responsiveness and usability across different screen sizes.
-   [ ] Gather feedback and iterate on design/functionality as needed. 