# Airtable Schema for Scalerrs Portal

This document outlines the Airtable schema used for the Scalerrs portal. It includes all tables, fields, and relationships needed for the portal to function correctly.

## Tables

### Users

| Field Name | Field Type | Description |
|------------|------------|-------------|
| Name | Single Line Text | User's full name |
| Email | Email | User's email address |
| Role | Single Select | User's role (Admin, Client) |

### Tasks

| Field Name | Field Type | Description |
|------------|------------|-------------|
| Title | Single Line Text | Task title |
| Description | Long Text | Task description |
| Status | Single Select | Task status (Not Started, In Progress, Blocked, Done) |
| AssignedTo | Link to Users | User assigned to the task |
| Priority | Single Select | Task priority (High, Medium, Low) |
| Impact | Number | Impact score (1-5) |
| Effort | Single Select | Effort required (S, M, L) |
| Notes | Long Text | Additional notes |
| ReferenceLinks | Long Text | Reference links (one per line) |
| DateLogged | Date | Date the task was logged |
| CompletedDate | Date | Date the task was completed |
| Category | Single Select | Task category (Technical SEO, CRO, Strategy/Ad Hoc) |

### Comments

| Field Name | Field Type | Description |
|------------|------------|-------------|
| Title | Single Line Text | Comment title (auto-generated) |
| Task | Link to Tasks | Task the comment is for |
| User | Link to Users | User who made the comment |
| Comment | Long Text | Comment text |
| CreatedAt | Created Time | Time the comment was created |

### Briefs

| Field Name | Field Type | Description |
|------------|------------|-------------|
| Title | Single Line Text | Brief title |
| SEOStrategist | Single Line Text | SEO strategist name |
| DueDate | Date | Brief due date |
| DocumentLink | URL | Link to the brief document |
| Month | Single Select | Month the brief is for |
| Status | Single Select | Brief status (Not Started, In Progress, Needs Input, Ready for Writer, Complete) |

### Articles

| Field Name | Field Type | Description |
|------------|------------|-------------|
| Title | Single Line Text | Article title |
| Writer | Link to Users | Writer assigned to the article |
| WordCount | Number | Article word count |
| DueDate | Date | Article due date |
| DocumentLink | URL | Link to the article document |
| ArticleURL | URL | URL where the article is published |
| Month | Single Select | Month the article is for |
| Status | Single Select | Article status (Not Started, In Production, Review Draft, Client Review, Published) |
| Brief | Link to Briefs | Brief the article is based on |

### Backlinks

| Field Name | Field Type | Description |
|------------|------------|-------------|
| Domain | Single Line Text | Domain of the backlink |
| DomainRating | Number | Domain rating (0-100) |
| LinkType | Single Select | Type of backlink (Guest Post, Resource, Directory, etc.) |
| TargetPage | URL | Page the backlink points to |
| Status | Single Select | Backlink status (Prospecting, Outreach, In Progress, Live) |
| WentLiveOn | Date | Date the backlink went live |
| Month | Single Select | Month the backlink is for |
| Notes | Long Text | Additional notes |

### KPI Metrics

| Field Name | Field Type | Description |
|------------|------------|-------------|
| MetricName | Single Select | Name of the metric (Organic Clicks, Conversion Rate, Estimated Leads, SQLs, Revenue Impact, Traffic Growth YoY, MoM Performance) |
| CurrentValue | Number | Current value of the metric |
| PreviousValue | Number | Previous value of the metric |
| ChangePercentage | Number | Percentage change from previous to current |
| Goal | Number | Goal value for the metric |
| Client | Link to Users | Client the metric is for |
| Date | Date | Date the metric is for |
| Unit | Single Select | Unit of measurement ($, %, none) |

### URL Performance

| Field Name | Field Type | Description |
|------------|------------|-------------|
| URLPath | Single Line Text | Path of the URL |
| PageTitle | Single Line Text | Title of the page |
| PageType | Single Select | Type of page (Blog, Feature, Solution, High-Intent) |
| Clicks | Number | Number of clicks |
| Impressions | Number | Number of impressions |
| CTR | Number | Click-through rate |
| AveragePosition | Number | Average position in search results |
| Client | Link to Users | Client the URL is for |
| Date | Date | Date the performance is for |

### Keyword Performance

| Field Name | Field Type | Description |
|------------|------------|-------------|
| Keyword | Single Line Text | Keyword |
| Volume | Number | Search volume |
| Difficulty | Number | Keyword difficulty (0-100) |
| CurrentPosition | Number | Current position in search results |
| PreviousPosition | Number | Previous position in search results |
| PositionChange | Number | Change in position |
| URL | Single Line Text | URL ranking for the keyword |
| Client | Link to Users | Client the keyword is for |
| Date | Date | Date the performance is for |

## Setting Up Airtable

1. Create a new Airtable base
2. Create each table with the fields listed above
3. Set up the relationships between tables
4. Add sample data to test the portal

## Environment Variables

Make sure to set the following environment variables:

```
AIRTABLE_API_KEY=your_api_key
AIRTABLE_BASE_ID=your_base_id
```

## Adding KPI Metrics

To ensure the KPI Dashboard works correctly, add the following metrics to the KPI Metrics table:

1. Organic Clicks
2. Conversion Rate (with Unit set to %)
3. Estimated Leads
4. SQLs
5. Revenue Impact (with Unit set to $)
6. Traffic Growth YoY (with Unit set to %)
7. MoM Performance (with Unit set to %)

For each metric, make sure to set the CurrentValue, PreviousValue, ChangePercentage, and Goal fields.
