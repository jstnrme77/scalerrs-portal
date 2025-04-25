# URL Performance Table - Import Instructions

## Initial Import

1. Use the simplified CSV file `08-url-performance-table-simplified.csv` for your initial import
2. This file contains only the essential fields to ensure successful import
3. After importing, you'll need to add the remaining fields manually

## Adding Additional Fields

After successfully importing the simplified table, add these additional fields to your URL Performance table:

### SEO Performance Fields
- Clicks Last Month (Number)
- Average Traffic Of Top 3 (Number)
- Conversion Rate (Number - percentage)
- Target KW Score (Number)
- Confidence In Uplift (Number 1-5)

### Page Content Fields
- Page Type (Sub) (Single Line Text)
- H1 Tag (Single Line Text)
- H1 Tag (Old) (Single Line Text)
- Primary CTA (Single Line Text)
- Target Persona (Single Line Text)
- YouTube Target (Checkbox)
- YouTube Video Status (Single Select)

### Meta Data Fields
- Meta Title (Single Line Text)
- Meta Title (Old) (Single Line Text)
- Meta Title Length (Number)
- Meta Title Length (Old) (Number)
- Meta Description (Long Text)
- Meta Description (Old) (Long Text)
- Meta Description Length (Number)
- Meta Description Length (Old) (Number)

### URL Management Fields
- New/Refresh (Single Select)
- Old URL (Single Line Text)
- URL Action (Single Select)
- URL Status (Single Select)
- Internal Link Status (Single Select)

## Sample Data for Additional Fields

Here's the data for the first record (/blog/seo-strategy-2024) to help you fill in the additional fields:

```
Clicks Last Month: 980
Average Traffic Of Top 3: 3800
Conversion Rate: 2.4
Page Type (Sub): Strategy Guide
H1 Tag: SEO Strategy Guide for 2024
H1 Tag (Old): SEO Tips and Tricks
Meta Title: SEO Strategy Guide for 2024 | Example Client
Meta Title (Old): SEO Tips | Example Client
Meta Title Length: 42
Meta Title Length (Old): 25
Meta Description: Learn the latest SEO strategies for 2024 to boost your organic traffic and conversions. Expert tips from Example Client.
Meta Description (Old): Tips for better SEO results.
Meta Description Length: 120
Meta Description Length (Old): 35
New/Refresh: Refresh
Old URL: /blog/seo-tips
URL Action: 301 Redirect
URL Status: Live
Internal Link Status: Complete
Primary CTA: Free Consultation
Target Persona: Marketing Manager
YouTube Target: TRUE
YouTube Video Status: Live
Target KW Score: 4
Confidence In Uplift: 4
```

## Alternative Approach

If you prefer to import all data at once, you can:

1. Split the data into multiple related tables (e.g., URL Basic Info, URL Meta Data, URL Performance Metrics)
2. Import each table separately
3. Link the tables using the URL Path as the common field

## Troubleshooting Import Issues

If you're still having trouble importing:

1. **Check for special characters**: Remove any special characters from your CSV
2. **Verify CSV format**: Ensure your CSV is properly formatted (try opening and saving in Excel)
3. **Reduce columns**: Start with even fewer columns and gradually add more
4. **Try different import methods**: Try importing directly from Excel or Google Sheets
5. **Manual entry**: For a small number of records, consider manual entry for the initial setup
