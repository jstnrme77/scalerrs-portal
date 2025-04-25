import { NextRequest, NextResponse } from 'next/server';
import { getArticles, updateArticleStatus } from '@/lib/airtable';
import { mockArticles } from '@/lib/mock-data';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('API route: Fetching articles from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    const articles = await getArticles();

    if (!articles || articles.length === 0) {
      console.log('API route: No articles found, using mock data');
      return NextResponse.json({ articles: mockArticles });
    }

    console.log(`API route: Found ${articles.length} articles`);
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    console.log('API route: Error fetching articles, using mock data');
    return NextResponse.json({ articles: mockArticles });
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
