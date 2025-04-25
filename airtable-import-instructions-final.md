# Airtable Import Instructions (Final)

I've updated the CSV files to address the issue with Single Select fields as primary fields in Airtable. Here are the key changes:

## Changes Made

1. **Page Type Performance Table**:
   - Added "Page Type Name" as the primary field (text)
   - Added "Page Type Category" as a field that can be set as a Single Select
   - Updated the Bottleneck Insights table to reference the new primary field

2. **Funnel Stage Performance Table**:
   - Added "Funnel Stage Name" as the primary field (text)
   - Added "Stage Category" as a field that can be set as a Single Select

3. **Backlink Tables**:
   - Note that there are two backlink tables: `backlinks-table.csv` and `backlink-data-table.csv`
   - Recommendation: Use only `backlink-data-table.csv` as it's more comprehensive

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

### 3. Set Up Field Types

After importing each table, you'll need to set up some field types:

1. **For Single Select fields**:
   - Page Type Category in Page Type Performance table
   - Stage Category in Funnel Stage Performance table
   - Status fields in various tables
   - Priority fields in various tables

2. **For Date fields**:
   - Make sure date fields are properly formatted
   - Some may need to be changed from text to date format

3. **For Number fields**:
   - Ensure number fields have the correct formatting (decimal places, currency, etc.)
   - Set percentage fields to show as percentages

### 4. Set Up Relationships Between Tables

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
   - Choose "Page Type Name" as the primary field to display

9. **Backlink Data to URL Performance**:
   - In the Backlink Data table, find the "Target URL" column
   - Change its field type to "Link to another record"
   - Select the URL Performance table
   - Choose "URL Path" as the primary field to display

### 5. Create Views for Each Table

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

5. **For the Page Type Performance table**:
   - Create a view grouped by Page Type Category
   - Create a view sorted by Traffic (descending)

6. **For the Funnel Stage Performance table**:
   - Create a view grouped by Stage Category
   - Create a view sorted by Conversion Rate (descending)

## Notes on Primary Fields and Single Select Fields

Airtable has a limitation where primary fields cannot be Single Select fields. To work around this:

1. We've added text-based primary fields (like "Page Type Name" and "Funnel Stage Name")
2. We've added separate category fields that can be set as Single Select fields
3. This approach gives you both a descriptive primary field and the ability to use Single Select for filtering and grouping

## Recommendation for Backlink Tables

Since there are two backlink tables, we recommend:

1. Use only the more detailed `backlink-data-table.csv` and ignore `backlinks-table.csv`
2. The detailed version includes all the fields from the basic version plus additional useful information
