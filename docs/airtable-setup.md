# Airtable Setup for Scalerrs Portal

This document provides instructions for setting up Airtable to work with the Scalerrs portal.

## Creating a Personal Access Token

Airtable now recommends using Personal Access Tokens instead of API keys. Here's how to create one:

1. Log in to your Airtable account
2. Click on your account icon in the top right corner
3. Select "Developer hub"
4. Click on "Personal access tokens" in the left sidebar
5. Click "Create new token"
6. Give your token a name (e.g., "Scalerrs Portal")
7. Set the scopes:
   - `data.records:read` (to read records)
   - `data.records:write` (to create/update records)
   - `schema.bases:read` (to read base schema)
8. Click "Create token"
9. Copy the token (it will only be shown once)

## Setting Up Environment Variables

1. Create or update the `.env.local` file in the root of your project with the following variables:

```
# Server-side environment variables
AIRTABLE_API_KEY=your_personal_access_token
AIRTABLE_BASE_ID=your_base_id

# Client-side environment variables (needed for browser access)
NEXT_PUBLIC_AIRTABLE_API_KEY=your_personal_access_token
NEXT_PUBLIC_AIRTABLE_BASE_ID=your_base_id
NEXT_PUBLIC_USE_MOCK_DATA=false
```

2. Replace `your_personal_access_token` with the token you created
3. Replace `your_base_id` with your Airtable base ID (found in the API documentation for your base)

## Finding Your Base ID

1. Go to [airtable.com/api](https://airtable.com/api)
2. Select the base you want to use
3. In the API documentation, you'll see "The ID of this base is appXXXXXXXXXXXXX"
4. Copy this ID and use it as your `AIRTABLE_BASE_ID`

## Setting Up Tables

Follow the schema defined in `docs/airtable-schema.md` to set up your tables with the correct fields.

## Troubleshooting

### Authorization Issues

If you see an error like "You are not authorized to perform this operation", check the following:

1. Make sure your personal access token has the correct scopes
2. Verify that the token is correctly set in both environment variables
3. Check that you have access to the base you're trying to connect to
4. Try creating a new token with all required permissions

### Table Not Found

If you see an error like "Table not found", check the following:

1. Make sure you've created all the required tables in your Airtable base
2. Verify that the table names match exactly what's defined in the code
3. Check that your base ID is correct

### Rate Limit Exceeded

If you see an error about rate limits, Airtable has a limit of 5 requests per second. The code includes retry logic, but you might need to reduce the frequency of requests if you're hitting this limit consistently.

## Using Mock Data During Development

If you want to use mock data instead of connecting to Airtable during development, set:

```
NEXT_PUBLIC_USE_MOCK_DATA=true
```

This will bypass all Airtable API calls and use the mock data defined in the codebase.
