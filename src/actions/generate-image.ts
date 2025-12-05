'use server';

import { SectionImage, ImagePosition } from '@/types/wizard';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Split HTML content into 4 roughly equal sections
function splitContentIntoSections(htmlContent: string): string[] {
  // Remove HTML tags and get plain text
  const plainText = htmlContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Split by sentences (rough approximation)
  const sentences = plainText.split(/(?<=[.!?])\s+/);

  if (sentences.length < 4) {
    // If very short, just divide the text into 4 parts
    const chunkSize = Math.ceil(plainText.length / 4);
    return [
      plainText.slice(0, chunkSize),
      plainText.slice(chunkSize, chunkSize * 2),
      plainText.slice(chunkSize * 2, chunkSize * 3),
      plainText.slice(chunkSize * 3),
    ].filter(s => s.trim().length > 0);
  }

  // Divide sentences into 4 groups
  const sectionsCount = 4;
  const sentencesPerSection = Math.ceil(sentences.length / sectionsCount);

  const sections: string[] = [];
  for (let i = 0; i < sectionsCount; i++) {
    const start = i * sentencesPerSection;
    const end = Math.min(start + sentencesPerSection, sentences.length);
    const sectionSentences = sentences.slice(start, end);
    if (sectionSentences.length > 0) {
      sections.push(sectionSentences.join(' '));
    }
  }

  return sections;
}

// Generate a single image using Gemini Imagen 3
async function generateSingleImage(
  sectionContent: string,
  position: ImagePosition
): Promise<{ success: boolean; base64?: string; error?: string }> {
  try {
    // Create a prompt that captures the essence of this section
    const contextSummary = sectionContent.slice(0, 300);

    const prompt = `Hand-painted watercolor illustration inspired by this contemplative theme: "${contextSummary}".

Style requirements:
- Soft washes of color with visible paper texture
- Light ink linework
- Calm, everyday slice-of-life atmosphere
- Natural lighting with a slightly cinematic perspective
- Muted, harmonious palette with gentle blues, greens, and warm neutrals
- No harsh shadows or heavy outlines
- Clean and modern but cozy overall feel
- Evocative and meditative mood
- No text or words in the image
- Landscape orientation (wider than tall)`;

    // Use Imagen 3 API via REST
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: '16:9',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return { success: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();

    if (!data.predictions || data.predictions.length === 0) {
      return { success: false, error: 'No image generated' };
    }

    // Imagen 3 returns base64 in bytesBase64Encoded field
    const imageBase64 = data.predictions[0].bytesBase64Encoded;

    if (!imageBase64) {
      return { success: false, error: 'No image data in response' };
    }

    return { success: true, base64: imageBase64 };
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image'
    };
  }
}

// Generate all 4 section images
export async function generateAllSectionImages(blogContent: string): Promise<{
  success: boolean;
  images?: SectionImage[];
  error?: string;
}> {
  try {
    if (!blogContent || blogContent.trim().length === 0) {
      return { success: false, error: 'No blog content provided' };
    }

    if (!GEMINI_API_KEY) {
      return { success: false, error: 'Gemini API key not configured' };
    }

    const sections = splitContentIntoSections(blogContent);
    const positions: ImagePosition[] = ['header', 'middle1', 'middle2', 'closing'];

    const images: SectionImage[] = [];
    const errors: string[] = [];

    // Generate images sequentially to avoid rate limits
    for (let i = 0; i < Math.min(sections.length, 4); i++) {
      const position = positions[i];
      const sectionContent = sections[i] || '';

      console.log(`Generating image ${i + 1}/4 for position: ${position}`);

      const result = await generateSingleImage(sectionContent, position);

      if (result.success && result.base64) {
        images.push({
          base64: result.base64,
          position,
          sectionContent: sectionContent.slice(0, 200), // Store summary
        });
      } else {
        errors.push(`Image ${i + 1} (${position}): ${result.error}`);
      }

      // Small delay between requests to avoid rate limiting
      if (i < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (images.length === 0) {
      return {
        success: false,
        error: errors.length > 0 ? errors.join('; ') : 'Failed to generate any images'
      };
    }

    return { success: true, images };
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate images'
    };
  }
}

// Generate a single image for a specific section (for regeneration)
export async function generateSectionImage(
  sectionContent: string,
  position: ImagePosition
): Promise<{
  success: boolean;
  image?: SectionImage;
  error?: string;
}> {
  try {
    if (!sectionContent || sectionContent.trim().length === 0) {
      return { success: false, error: 'No content provided' };
    }

    if (!GEMINI_API_KEY) {
      return { success: false, error: 'Gemini API key not configured' };
    }

    const result = await generateSingleImage(sectionContent, position);

    if (result.success && result.base64) {
      return {
        success: true,
        image: {
          base64: result.base64,
          position,
          sectionContent: sectionContent.slice(0, 200),
        },
      };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error('Image generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image'
    };
  }
}

// Legacy function for backwards compatibility
export async function generateImage(blogContent: string): Promise<{
  success: boolean;
  imageBase64?: string;
  error?: string;
}> {
  const result = await generateAllSectionImages(blogContent);

  if (result.success && result.images && result.images.length > 0) {
    // Return the header image for legacy compatibility
    return { success: true, imageBase64: result.images[0].base64 };
  }

  return { success: false, error: result.error };
}
