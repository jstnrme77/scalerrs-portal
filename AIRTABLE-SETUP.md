# Airtable Integration Setup

This document provides instructions for setting up the Airtable integration for the Scalerrs portal.

## Prerequisites

1. An Airtable account
2. A new Airtable base

## Setup Steps

### 1. Create an Airtable Account

If you don't already have an Airtable account, sign up at [airtable.com](https://airtable.com).

### 2. Create a New Base

1. Log in to your Airtable account
2. Create a new base (you can start with an empty base)
3. Note the Base ID from the URL: `https://airtable.com/{BASE_ID}/...`

### 3. Create Tables

Create the following tables in your Airtable base:

#### Users Table

| Field Name | Field Type     | Options                           |
|------------|----------------|-----------------------------------|
| Name       | Single line text |                                   |
| Email      | Email          |                                   |
| Role       | Single select  | Admin, Client, Team Member        |
| CreatedAt  | Date & Time    |                                   |

#### Tasks Table

| Field Name  | Field Type     | Options                           |
|-------------|----------------|-----------------------------------|
| Name        | Single line text |                                   |
| Description | Long text      |                                   |
| Status      | Single select  | To Do, In Progress, Completed     |
| AssignedTo  | Link to Users  |                                   |
| CreatedAt   | Date & Time    |                                   |

#### Comments Table

| Field Name | Field Type     | Options                           |
|------------|----------------|-----------------------------------|
| Title      | Single line text | (Primary Field)                   |
| Task       | Link to Tasks  |                                   |
| User       | Link to Users  |                                   |
| Comment    | Long text      |                                   |
| CreatedAt  | Created time   | (Automatically set by Airtable)    |

**Important Notes**:
- The first field (Title) must be a text field since Airtable requires the primary field (first column) to be a text field, not a link field.
- When setting up the link fields (Task and User), make sure to:
  1. Select "Link to another record" as the field type
  2. Choose the appropriate table to link to (Tasks or Users)
  3. Allow linking to any record in the selected table
- Airtable will automatically create reciprocal fields in the linked tables

### 4. Add Sample Data

Add the following sample records to your tables:

#### Users Table

1. Admin User (admin@example.com, Role: Admin)
2. Client User (client@example.com, Role: Client)

#### Tasks Table

1. Create content brief (Status: To Do)
2. Review keyword research (Status: In Progress)
3. Update meta descriptions (Status: Completed)

### 5. Create a Personal Access Token

1. Go to your [Airtable account page](https://airtable.com/account)
2. Navigate to the 'Developer Hub' section
3. Click on 'Personal access tokens'
4. Click 'Create new token'
5. Give your token a name (e.g., 'Scalerrs Portal')
6. Set the scopes to include 'data.records:read' and 'data.records:write' for your base
7. Copy the generated token (you won't be able to see it again)

### 6. Configure Environment Variables

1. Update the `.env.local` file with your Airtable Personal Access Token and Base ID:

```
NEXT_PUBLIC_AIRTABLE_API_KEY=your_personal_access_token_here
NEXT_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here
```

**Note**:
- We use the `NEXT_PUBLIC_` prefix to make these environment variables accessible on the client side in Next.js.
- Even though we're using a Personal Access Token, we still use the variable name `AIRTABLE_API_KEY` for compatibility with the Airtable library.

## Testing the Integration

1. Start the development server:

```bash
npm run dev
```

2. Navigate to the login page: http://localhost:3000/login
3. Log in with one of the sample user emails:
   - Email: `admin@example.com` or `client@example.com`
   - Password: Any password will work for this demo (since we don't store passwords in Airtable)
4. Navigate to the Airtable Demo page: http://localhost:3000/airtable-demo
5. Test the following functionality:
   - View tasks
   - Update task status
   - Add comments

## Troubleshooting

If you encounter any issues:

1. Check that your Personal Access Token and Base ID are correct
2. Ensure your Airtable tables are set up correctly
3. Check the browser console for any error messages
4. Verify that your Personal Access Token has the necessary scopes (data.records:read and data.records:write)
5. Make sure you've selected the correct base when setting up the token permissions
