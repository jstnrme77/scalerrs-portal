import { NextRequest, NextResponse } from 'next/server';
import { getArticles, updateArticleStatus } from '@/lib/airtable';
import { mockArticles } from '@/lib/mock-data';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching articles from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);

    // Get user information from the request
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userClient = request.headers.get('x-user-client');

    // Get month from query parameters
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('User Client:', userClient);
    console.log('Month filter:', month);

    // Parse client IDs if present
    const clientIds = userClient ? JSON.parse(userClient) : [];

    // Fetch articles with user filtering and month filtering
    const articles = await getArticles(userId, userRole, clientIds, month);

    if (!articles || articles.length === 0) {
      console.log('API route: No articles found, using mock data');

      // Filter mock data based on user role and ID
      let filteredMockArticles = [...mockArticles];

      if (userId && userRole) {
        // For client users, filter by client IDs
        if (userRole === 'Client' && clientIds.length > 0) {
          filteredMockArticles = mockArticles.filter(article => {
            // Check if article has client field that matches any of the user's clients
            if (article.Client) {
              if (Array.isArray(article.Client)) {
                return article.Client.some(client => clientIds.includes(client));
              } else {
                return clientIds.includes(article.Client);
              }
            }
            return false;
          });
        }
        // For non-admin users who aren't clients, only show articles assigned to them
        else if (userRole !== 'Admin') {
          filteredMockArticles = mockArticles.filter(article => {
            // Check if the article is assigned to this user
            return (
              (article.Writer && article.Writer === userId) ||
              (article.Editor && article.Editor === userId)
            );
          });
        }
      }

      const response = NextResponse.json({ articles: filteredMockArticles });
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      return response;
    }

    console.log(`API route: Found ${articles.length} articles`);

    // Create response with cache control headers
    const response = NextResponse.json({ articles });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  } catch (error) {
    console.error('Error fetching articles:', error);
    console.log('API route: Error fetching articles, using mock data');
    const response = NextResponse.json({ articles: mockArticles });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { articleId, status } = await request.json();

    if (!articleId || !status) {
      return NextResponse.json(
        { error: 'Article ID and status are required' },
        { status: 400 }
      );
    }

    const updatedArticle = await updateArticleStatus(articleId, status);
    return NextResponse.json({ article: updatedArticle });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}
