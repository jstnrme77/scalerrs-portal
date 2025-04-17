import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        {/* Expose environment variables to the client */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.env = {
                AIRTABLE_API_KEY: "${process.env.AIRTABLE_API_KEY || ''}",
                AIRTABLE_BASE_ID: "${process.env.AIRTABLE_BASE_ID || ''}",
                NEXT_PUBLIC_USE_MOCK_DATA: "false"
              }
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
