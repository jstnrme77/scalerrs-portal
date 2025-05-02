# Previous Airtable Configuration Backup

## Environment Variables
```
AIRTABLE_API_KEY=patqy7ZJYDeMGRytK.c1b179191942edb6036729dd354759474477d71333d7031e70a2cc47c5b4e644
AIRTABLE_BASE_ID=appMRsu00KNlqAg3A
NEXT_PUBLIC_AIRTABLE_API_KEY=patqy7ZJYDeMGRytK.c1b179191942edb6036729dd354759474477d71333d7031e70a2cc47c5b4e644
NEXT_PUBLIC_AIRTABLE_BASE_ID=appMRsu00KNlqAg3A
```

## Table Structure
The previous Airtable base contained the following tables:

1. Users
2. Tasks
3. Comments
4. Briefs
5. Articles
6. Backlinks
7. KPI Metrics
8. URL Performance
9. Keyword Performance
10. Monthly Projections

## Key Field Mappings

### Briefs Table
- Title: Primary field
- SEO Strategist: User reference
- Due Date: Date field
- Document Link: URL field
- Month: Single select field
- Status: Single select field with options (In Progress, Needs Input, Review Brief, Brief Approved)
- Client: Reference to client
- Content Writer: User reference
- Content Editor: User reference

### Articles Table
- Title: Primary field
- Writer: User reference
- Editor: User reference
- Word Count: Number field
- Due Date: Date field
- Document Link: URL field
- Article URL: URL field
- Month: Single select field
- Status: Single select field with options (In Production, Review Draft, Draft Approved, To Be Published, Live)
- Brief: Reference to brief

### Backlinks Table
- Domain: Primary field
- Domain Rating: Number field
- Link Type: Single select field with options (Guest Post, Directory, Niche Edit)
- Target Page: URL field
- Status: Single select field with options (Live, Scheduled, Rejected)
- Went Live On: Date field
- Month: Single select field
- Notes: Long text field

### KPI Metrics Table
- Metric Name: Primary field
- Current Value: Number field
- Previous Value: Number field
- Change Percentage: Number field
- Target Value: Number field
- Trend: Single select field
- Unit: Text field
- Client: Reference to client
- Date: Date field

### URL Performance Table
- URL Path: Primary field
- Page Title: Text field
- Clicks: Number field
- Impressions: Number field
- CTR: Number field
- Average Position: Number field
- Client: Reference to client
- Date: Date field

### Keyword Performance Table
- Keyword: Primary field
- Volume: Number field
- Difficulty: Number field
- Current Position: Number field
- Previous Position: Number field
- Position Change: Number field
- URL: URL field
- Client: Reference to client
- Date: Date field

### Monthly Projections Table
- Month: Text field
- Year: Text field
- Current Trajectory: Number field
- KPI Goal/Target: Number field
- Required Trajectory: Number field
- Client: Reference to client
