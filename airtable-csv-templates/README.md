# Scalerrs Portal - Airtable CSV Templates

This folder contains CSV templates for all tables in the Scalerrs Portal Airtable structure. These templates are designed to help you import data into your Airtable base with the correct structure.

## How to Use These Templates

1. **Review the Structure**: Each CSV file represents a table in the Airtable structure. Review the fields to ensure they match your requirements.

2. **Prepare Your Data**: Format your actual data to match these templates. You can:
   - Use these files as a starting point and replace the example data
   - Export your existing data and reformat it to match these templates
   - Create new data following these structures

3. **Import to Airtable**: 
   - In Airtable, create a new base or use an existing one
   - Create tables with the same names as these CSV files
   - Import each CSV file into its corresponding table
   - Airtable will automatically map columns to fields

4. **Establish Relationships**: After importing, you'll need to:
   - Change field types for relationship fields to "Link to another record"
   - Select the appropriate table to link to
   - Airtable will attempt to match records based on values

## Import Order

For best results, import the CSV files in this order to ensure relationships can be properly established:

1. Clients Table (01-clients-table.csv)
2. Users Table (02-users-table.csv)
3. Content Clusters Table (10-content-clusters-table.csv)
4. Keyword Performance Table (09-keyword-performance-table.csv)
5. URL Performance Table (08-url-performance-table.csv)
6. SEO Growth Models Table (11-seo-growth-models-table.csv)
7. Remaining tables in any order

## Field Types

When setting up your Airtable tables, use these field types:

- **Single Line Text**: For short text fields
- **Long Text**: For descriptions, notes, and other long text
- **Number**: For numeric values
- **Currency**: For monetary values
- **Percent**: For percentage values
- **Date**: For dates without times
- **Date & Time**: For timestamps
- **Single Select**: For fields with predefined options
- **Multiple Select**: For fields with multiple predefined options
- **Checkbox**: For yes/no fields
- **URL**: For web addresses
- **Email**: For email addresses
- **Link to another record**: For relationships between tables
- **Formula**: For calculated fields

## Customization

Feel free to customize these templates to better match your specific requirements:

- Add or remove fields as needed
- Adjust field names to match your terminology
- Modify single select options to match your workflow
- Add additional formula fields for calculations

## Support

If you need assistance with importing these templates or setting up your Airtable base, please contact your Scalerrs project manager.
