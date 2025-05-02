# Airtable Schema Analysis and Mapping Prompt

## Objective
Analyze the schema of the new Airtable base (Base ID: `appUtQLunL1f05FrQ`) and determine what data points can be mapped to the existing Scalerrs portal.

## Steps to Perform

1. **Connect to Airtable**
   - Use the provided API key: `patDzIkqPGxe1t5jl.fe3e6fa1c25d7438e70de845827f7dcfa8ffb3d14baf0e17bff380bca8459175`
   - Access base ID: `appUtQLunL1f05FrQ`

2. **Analyze Each Table's Schema**
   For each table in the new base:
   - List all fields and their types
   - Identify primary and linked fields
   - Note any special configurations (formulas, lookups, etc.)

3. **Compare with Portal Requirements**
   Cross-reference with:
   - Current integration tables (Users, Tasks, Comments, Briefs, Articles, Backlinks, KPI Metrics, URL Performance, Keyword Performance)
   - CSV templates in `airtable-csv-templates/`
   - Existing API routes in `src/app/api/`

4. **Mapping Assessment**
   For each table:
   - Identify direct field matches
   - Note fields that need transformation
   - Highlight required fields that are missing
   - Flag any schema incompatibilities

5. **Special Considerations**
   - Pay attention to linked record fields
   - Note any field naming inconsistencies
   - Check for required fields that can't be null

## Expected Output

1. **Table-by-Table Analysis**
   For each table:
   ```markdown
   ### [Table Name]
   - **Status**: [Matches/Partial Match/New/Missing]
   - **Fields**:
     - [Field Name]: [Type] → [Maps to Portal Field]/[Needs Transformation]/[No Match]
     - ...
   - **Notes**: [Any special considerations]
   ```

2. **Summary**
   - List of tables that can be directly mapped
   - Tables needing schema adjustments
   - Missing tables that need to be created
   - Recommended mapping strategy

3. **Action Items**
   - Schema changes needed in Airtable
   - Code changes needed in portal
   - Data migration steps required

## Additional Instructions
- Focus first on the core tables currently used by the portal
- Provide clear recommendations for handling schema differences
- Suggest fallback strategies for missing data
- Include examples of transformed data where needed