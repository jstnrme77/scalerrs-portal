# Airtable Integration

This directory contains the code for integrating with Airtable. The code has been refactored from a single large file (`airtable.ts`) into a more modular structure.

## Directory Structure

```
src/lib/airtable/
├── index.ts                  # Main export file
├── config.ts                 # Configuration and initialization
├── types.ts                  # Type definitions
├── utils.ts                  # Utility functions
├── mock-data.ts              # Mock data for fallbacks
├── monthly-projections.ts    # Monthly projections functions
├── tables/                   # Table-specific modules
│   ├── users.ts              # User-related functions
│   ├── clients.ts            # Client-related functions
│   ├── tasks.ts              # Task-related functions
│   ├── comments.ts           # Comment-related functions
│   ├── content-workflow.ts   # Brief-related functions
│   ├── articles.ts           # Article-related functions
│   ├── backlinks.ts          # Backlink-related functions
│   ├── approvals.ts          # Approval-related functions
│   └── kpi.ts                # KPI metrics and reporting functions
```

## Usage

Import the functions you need from the main index file:

```typescript
import { 
  getUsers, 
  getClients, 
  getTasks, 
  getBriefs, 
  getArticles, 
  getBacklinks 
} from '@/lib/airtable';
```

## Available Functions

### User Management
- `getUsers()` - Get all users
- `getUserByEmail(email)` - Get a user by email
- `createUser(userData)` - Create a new user

### Client Management
- `getClients()` - Get all clients

### Task Management
- `getTasks(userId, userRole, clientIds)` - Get tasks filtered by user and client
- `updateTaskStatus(taskId, status)` - Update a task's status
- `addComment(taskId, userId, comment)` - Add a comment to a task
- `getCommentsByTask(taskId)` - Get comments for a task

### Content Workflow
- `getBriefs(userId, userRole, clientIds, month)` - Get briefs filtered by user, client, and month
- `updateBriefStatus(briefId, status)` - Update a brief's status
- `getArticles(userId, userRole, clientIds, month)` - Get articles filtered by user, client, and month
- `updateArticleStatus(articleId, status)` - Update an article's status
- `getBacklinks(month)` - Get backlinks filtered by month
- `updateBacklinkStatus(backlinkId, status)` - Update a backlink's status

### Approvals
- `getApprovalItems(params)` - Get approval items with pagination

### KPI and Reporting
- `getKPIMetrics(clientIds, month)` - Get KPI metrics filtered by client and month
- `getURLPerformance(clientIds)` - Get URL performance data filtered by client
- `getKeywordPerformance(clientIds)` - Get keyword performance data filtered by client
- `getClusters()` - Get clusters data
- `getMonthlyProjections()` - Get monthly projections data

## Configuration

The Airtable integration is configured in `config.ts`. It uses the following environment variables:

- `AIRTABLE_API_KEY` or `NEXT_PUBLIC_AIRTABLE_API_KEY` - Airtable API key (personal access token)
- `AIRTABLE_BASE_ID` or `NEXT_PUBLIC_AIRTABLE_BASE_ID` - Airtable base ID

## Mock Data

If Airtable credentials are not available, the functions will fall back to using mock data from `mock-data.ts`. This is useful for development and testing.

## Error Handling

All functions include error handling that will log the error and fall back to mock data if there's an issue with the Airtable API.
