'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Extract a brief summary from the blog content for the image prompt
function extractImageContext(htmlContent: string): string {
  // Remove HTML tags and get plain text
  const plainText = htmlContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Get first 200 characters as context
  const context = plainText.slice(0, 200);

  return context;
}

export async function generateImage(blogContent: string): Promise<{
  success: boolean;
  imageBase64?: string;
  error?: string;
}> {
  try {
    if (!blogContent || blogContent.trim().length === 0) {
      return { success: false, error: 'No blog content provided' };
    }

    const context = extractImageContext(blogContent);

    const prompt = `Hand-painted watercolor illustration inspired by this contemplative theme: "${context}".

Style requirements:
- Soft washes of color with visible paper texture
- Light ink linework
- Calm, everyday slice-of-life atmosphere
- Natural lighting with a slightly cinematic perspective
- Muted, harmonious palette with gentle blues, greens, and warm neutrals
- No harsh shadows or heavy outlines
- Clean and modern but cozy overall feel
- Evocative and meditative mood
- No text or words in the image`;

    const result = await openai.images.generate({
      model: 'gpt-image-1',
      prompt,
      size: '1536x1024',
      quality: 'high',
      n: 1,
    });

    if (!result.data || result.data.length === 0) {
      return { success: false, error: 'No image generated' };
    }

    const imageData = result.data[0];

    // Handle both URL and base64 responses
    if (imageData.b64_json) {
      return {
        success: true,
        imageBase64: imageData.b64_json,
      };
    } else if (imageData.url) {
      // If we get a URL, fetch and convert to base64
      const response = await fetch(imageData.url);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      return {
        success: true,
        imageBase64: base64,
      };
    }

    return { success: false, error: 'No image data in response' };
  } catch (error) {
    console.error('Image generation error:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to generate image' };
  }
}
