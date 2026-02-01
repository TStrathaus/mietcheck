// src/app/api/upload-url/route.ts
import { handleUpload } from '@vercel/blob/client';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Validate file type and size before generating upload token
        return {
          allowedContentTypes: ['application/pdf', 'image/jpeg', 'image/png'],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('✅ Blob upload completed:', blob.url);
      },
    });

    return Response.json(jsonResponse);
  } catch (error: any) {
    console.error('❌ Upload URL generation error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
