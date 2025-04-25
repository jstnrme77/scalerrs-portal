# Airtable Import Instructions (Updated)

I've updated all the CSV files to remove the unnecessary ID fields and added proper primary fields for each table. This will make it easier to import into Airtable.

## Files Included

### Core Tables
1. `users-table.csv` - User information (Primary field: Name)
2. `tasks-table.csv` - Task management data (Primary field: Title)
3. `comments-table.csv` - Comments on tasks (Primary field: Title)
4. `briefs-table.csv` - Content briefs (Primary field: Title)
5. `articles-table.csv` - Articles in production (Primary field: Title)
6. `backlinks-table.csv` - Backlink data (Primary field: Domain)

### KPI Dashboard Tables
7. `kpi-metrics-table.csv` - KPI metrics (Primary field: Metric Name)
8. `kpi-forecasting-table.csv` - Forecasting data (Primary field: Forecast Name)
9. `page-type-performance-table.csv` - Performance by page type (Primary field: Page Type)
10. `funnel-stage-performance-table.csv` - Performance by funnel stage (Primary field: Stage)
11. `page-performance-table.csv` - Top/bottom performing pages (Primary field: Performance Name)
12. `bottleneck-insights-table.csv` - Bottleneck analysis (Primary field: Insight Title)
13. `yearly-projections-table.csv` - Yearly traffic projections (Primary field: Projection Period)

### SEO Layouts Tables
14. `url-performance-table.csv` - URL performance data (Primary field: URL Path)
15. `keyword-performance-table.csv` - Keyword tracking (Primary field: Keyword)
16. `uplift-potential-table.csv` - Traffic uplift potential (Primary field: Uplift Title)
17. `backlink-data-table.csv` - Detailed backlink data (Primary field: Backlink Name)
18. `monthly-planning-table.csv` - Monthly SEO planning (Primary field: Month)

## Import Steps

### 1. Create a New Base in Airtable

Start by creating a new base in Airtable.

### 2. Import Each Table Individually

For each CSV file:

1. Click "+ Add a table" in your Airtable base
2. Click on "Import data" (or the grid icon with an arrow)
3. Select "CSV file"
4. Upload the corresponding CSV file
5. Make sure "Use first row as headers" is checked
6. Enable "Auto-select field types" to let Airtable determine the appropriate field types
7. Click "Import"
8. After import, rename the table to match the file name (without the "-table.csv" part)

### 3. Set Up Relationships Between Tables

After importing all tables, you'll need to set up relationships between them:

1. **Tasks to Users**:
   - In the Tasks table, find the "Assigned To" column
   - Change its field type to "Link to another record"
   - Select the Users table
   - Choose "Name" as the primary field to display

2. **Comments to Tasks**:
   - In the Comments table, find the "Task" column
   - Change its field type to "Link to another record"
   - Select the Tasks table
   - Choose "Title" as the primary field to display

3. **Comments to Users**:
   - In the Comments table, find the "User" column
   - Change its field type to "Link to another record"
   - Select the Users table
   - Choose "Name" as the primary field to display

4. **Articles to Briefs**:
   - In the Articles table, find the "Brief" column
   - Change its field type to "Link to another record"
   - Select the Briefs table
   - Choose "Title" as the primary field to display

5. **Keyword Performance to URL Performance**:
   - In the Keyword Performance table, find the "Target Page" column
   - Change its field type to "Link to another record"
   - Select the URL Performance table
   - Choose "URL Path" as the primary field to display

6. **Uplift Potential to URL Performance**:
   - In the Uplift Potential table, find the "URL" column
   - Change its field type to "Link to another record"
   - Select the URL Performance table
   - Choose "URL Path" as the primary field to display

7. **Uplift Potential to Keyword Performance**:
   - In the Uplift Potential table, find the "Primary Keyword" column
   - Change its field type to "Link to another record"
   - Select the Keyword Performance table
   - Choose "Keyword" as the primary field to display

8. **Bottleneck Insights to Page Type Performance**:
   - In the Bottleneck Insights table, find the "Related Page Type" column
   - Change its field type to "Link to another record"
   - Select the Page Type Performance table
   - Choose "Page Type" as the primary field to display

9. **Backlink Data to URL Performance**:
   - In the Backlink Data table, find the "Target URL" column
   - Change its field type to "Link to another record"
   - Select the URL Performance table
   - Choose "URL Path" as the primary field to display

### 4. Create Views for Each Table

For each table, create different views to organize your data:

1. **For the Tasks table**:
   - Create a view filtered by Status = "To Do"
   - Create a view filtered by Status = "In Progress"
   - Create a view filtered by Status = "Completed"

2. **For the Articles table**:
   - Create a view filtered by Status = "In Production"
   - Create a view filtered by Status = "Review Draft"
   - Create a view filtered by Status = "Live"

3. **For the KPI Metrics table**:
   - Create a view grouped by Trend
   - Create a view sorted by Progress Percentage

4. **For the URL Performance table**:
   - Create a view filtered by Status = "Optimizing"
   - Create a view sorted by Traffic (descending)

### 5. Adjust Field Types as Needed

After import, you may need to adjust some field types:

1. **Date fields**: Make sure date fields are properly formatted
2. **Number fields**: Ensure number fields have the correct formatting (decimal places, currency, etc.)
3. **Single Select fields**: Verify that all options are included in the dropdown
4. **Formula fields**: Set up any formula fields that couldn't be imported directly

## Notes on Primary Fields

Each table now has a clear primary field that Airtable will use as the main identifier for records:

- The primary field is the first column in each CSV file
- Airtable will automatically use this field as the primary field
- This field will be displayed in link fields when connecting records between tables
- Airtable will still generate its own Record IDs behind the scenes
