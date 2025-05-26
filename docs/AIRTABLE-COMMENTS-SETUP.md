# Airtable Comments System Setup Guide

## Overview
This document provides complete setup instructions for the Airtable Comments implementation in the Scalerrs Portal.

## Prerequisites
- Airtable account with API access
- Airtable base with appropriate permissions
- Node.js environment for the portal application

## Environment Variables

### Required Airtable Configuration
```env
# Primary Airtable credentials (server-side)
AIRTABLE_API_KEY=your_airtable_api_key_here
AIRTABLE_BASE_ID=your_airtable_base_id_here

# Alternative public environment variables (client-side usage)
NEXT_PUBLIC_AIRTABLE_API_KEY=your_airtable_api_key_here
NEXT_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id_here
```

### Optional Configuration
```env
# Feature flags
ENABLE_AIRTABLE_COMMENTS=true
ENABLE_MOCK_DATA=false

# Performance settings
MAX_COMMENTS_PER_REQUEST=50
COMMENTS_CACHE_TIMEOUT=300000
COMMENTS_RATE_LIMIT=4
```

## Airtable Setup

### Required Permissions
Your Airtable API key must have the following permissions:
- **Read access** to the Comments table
- **Write access** to the Comments table  
- **Read access** to base schema

### Required Table Structure
Create a table named **"Comments"** with the following fields:

| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| Comment | Long text | Yes | The comment content |
| Author | Single line text | Yes | Name of the comment author |
| CreatedTime | Date and time | Yes | When the comment was created |
| ContentType | Single line text | No | Type of content being commented on |
| RecordID | Single line text | Yes | ID of the record being commented on |

### Field Configuration Details

**Comment Field:**
- Type: Long text
- Allow line breaks: Yes
- Rich text formatting: Optional

**Author Field:**
- Type: Single line text
- Max length: 100 characters

**CreatedTime Field:**
- Type: Date and time
- Include time: Yes
- Use GMT: Recommended
- Format: ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)

**ContentType Field:**
- Type: Single line text
- Max length: 50 characters
- Examples: "keywords", "briefs", "articles", "backlinks"

**RecordID Field:**
- Type: Single line text
- Max length: 50 characters
- This should contain the ID of the record from other tables

## API Endpoints

### Get Comments
**Endpoint:** `GET /api/airtable-comments`
**Parameters:**
- `recordId` (required): The ID of the record to fetch comments for

**Response:**
```json
{
  "comments": [
    {
      "id": "recXXXXXXXXXXXXXX",
      "text": "This is a sample comment",
      "author": "John Doe",
      "timestamp": "12/15/2023",
      "contentType": "keywords",
      "recordId": "recYYYYYYYYYYYYYY",
      "createdAt": "2023-12-15T10:30:00.000Z"
    }
  ],
  "recordId": "recYYYYYYYYYYYYYY",
  "total": 1
}
```

### Add Comment
**Endpoint:** `POST /api/airtable-comments/add`
**Body:**
```json
{
  "recordId": "recYYYYYYYYYYYYYY",
  "text": "This is a new comment",
  "contentType": "keywords"
}
```

**Response:**
```json
{
  "comment": {
    "id": "recXXXXXXXXXXXXXX",
    "text": "This is a new comment",
    "author": "Current User",
    "timestamp": "12/15/2023",
    "contentType": "keywords",
    "recordId": "recYYYYYYYYYYYYYY",
    "createdAt": "2023-12-15T10:30:00.000Z"
  },
  "success": true
}
```

## Integration Points

### Approvals Page
The comments system is integrated into the approvals page for:
- **Keywords** content type
- **Briefs** content type

### ConversationHistoryModal
The modal supports both legacy and Airtable comment systems:
- Toggle between systems using `useAirtableComments` prop
- Enhanced UI with avatar generation and timestamp formatting
- Real-time refresh capabilities

### Components Used
- `ConversationHistoryModal` - Main modal component
- `CommentsList` - Enhanced comments display
- `AirtableCommentItem` - Individual comment rendering
- `CommentSkeleton` - Loading state component

## Features

### Core Functionality
- ✅ Fetch comments for any record ID
- ✅ Add new comments with author attribution
- ✅ Real-time comment count tracking
- ✅ Backward compatibility with legacy system

### Enhanced UI/UX
- ✅ Avatar generation based on author names
- ✅ Consistent color coding for users
- ✅ Timestamp formatting (relative and absolute)
- ✅ Loading states with skeleton loaders
- ✅ Error handling with retry mechanisms
- ✅ Auto-refresh capabilities
- ✅ Unread comment indicators

### Performance Features
- ✅ Client-side caching with TTL
- ✅ Rate limiting (4 requests per second)
- ✅ Retry logic with exponential backoff
- ✅ Request timeout handling (10 seconds)
- ✅ Batch operations for multiple records

## Testing

### Manual Testing
1. **Verify Environment Setup:**
   ```bash
   # Check if Airtable credentials are configured
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        "https://api.airtable.com/v0/YOUR_BASE_ID/Comments?maxRecords=1"
   ```

2. **Test Comment Creation:**
   - Navigate to Approvals page
   - Open any keyword or brief item
   - Click comment icon to open modal
   - Toggle to "Airtable Comments (New)"
   - Add a test comment
   - Verify it appears in Airtable

3. **Test Comment Retrieval:**
   - Refresh the modal
   - Verify comments load correctly
   - Check avatar generation and timestamps

### API Testing
```bash
# Test GET endpoint
curl "http://localhost:3000/api/airtable-comments?recordId=YOUR_RECORD_ID"

# Test POST endpoint  
curl -X POST "http://localhost:3000/api/airtable-comments/add" \
     -H "Content-Type: application/json" \
     -d '{"recordId":"YOUR_RECORD_ID","text":"Test comment","contentType":"keywords"}'
```

## Troubleshooting

### Common Issues

**Error: "Missing Airtable credentials"**
- Verify `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` are set
- Check that environment variables are properly loaded

**Error: "Table 'Comments' not found"**
- Ensure the Comments table exists in your Airtable base
- Verify the table name is exactly "Comments" (case-sensitive)

**Error: "Field 'X' not found"**
- Check all required fields exist in the Comments table
- Verify field names match exactly (case-sensitive)

**Comments not loading**
- Check browser console for API errors
- Verify network connectivity to Airtable
- Check rate limiting hasn't been exceeded

**Comments not saving**
- Verify write permissions on the Comments table
- Check that all required fields are being provided
- Ensure RecordID is valid

### Debug Mode
Enable debug logging by setting:
```env
LOG_LEVEL=debug
ENABLE_API_LOGGING=true
```

## Migration from Legacy System

### Feature Flag
Use the `useAirtableComments` prop to control which system is used:
```jsx
<ConversationHistoryModal
  useAirtableComments={true} // Use new Airtable system
  // ... other props
/>
```

### Data Migration
Legacy comments are not automatically migrated. To migrate:
1. Export existing comments from the legacy system
2. Transform to Airtable format
3. Import using the Airtable API or CSV import

### Rollback Plan
If issues occur, rollback by:
1. Setting `useAirtableComments={false}` 
2. Removing Airtable environment variables
3. The system will gracefully fallback to legacy comments

## Performance Considerations

### Caching Strategy
- Comments are cached for 5 minutes by default
- Cache is invalidated when new comments are added
- Use `refreshComments()` to force refresh

### Rate Limiting
- Maximum 4 requests per second to Airtable
- Automatic retry with exponential backoff
- Request timeout of 10 seconds

### Optimization Tips
- Use batch operations for multiple records
- Implement pagination for large comment lists
- Consider WebSocket integration for real-time updates

## Security

### API Key Security
- Never expose Airtable API keys in client-side code
- Use environment variables for all credentials
- Rotate API keys regularly

### Data Validation
- All inputs are sanitized and validated
- RecordID format is verified
- Comment length limits are enforced

### Access Control
- Comments inherit permissions from the parent record
- User authentication is handled by the portal system
- Author attribution is based on current user context

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Verify Airtable table structure
4. Contact the development team

Last updated: December 2023 