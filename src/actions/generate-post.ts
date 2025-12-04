'use server';

import Anthropic from '@anthropic-ai/sdk';
import { KUNAL_STYLE_GUIDE, BLOG_GENERATION_USER_PROMPT } from '@/prompts/kunal-blog-style';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generatePost(transcription: string): Promise<{
  success: boolean;
  content?: string;
  error?: string;
}> {
  try {
    if (!transcription || transcription.trim().length === 0) {
      return { success: false, error: 'No transcription provided' };
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: KUNAL_STYLE_GUIDE,
      messages: [
        {
          role: 'user',
          content: BLOG_GENERATION_USER_PROMPT(transcription),
        },
      ],
    });

    // Extract text content from the response
    const textContent = message.content.find((block) => block.type === 'text');

    if (!textContent || textContent.type !== 'text') {
      return { success: false, error: 'No text content in response' };
    }

    // Clean up the response - strip any prefix before the first HTML tag
    let cleanedContent = textContent.text.trim();

    // Remove markdown code blocks if present
    cleanedContent = cleanedContent.replace(/^```html?\s*/i, '').replace(/\s*```$/i, '');

    // Find the first HTML tag and strip anything before it
    const firstTagIndex = cleanedContent.indexOf('<');
    if (firstTagIndex > 0) {
      cleanedContent = cleanedContent.substring(firstTagIndex);
    }

    // Replace curly quotes with straight quotes
    cleanedContent = cleanedContent
      .replace(/[\u201C\u201D]/g, '"')  // Curly double quotes
      .replace(/[\u2018\u2019]/g, "'"); // Curly single quotes/apostrophes

    return {
      success: true,
      content: cleanedContent,
    };
  } catch (error) {
    console.error('Post generation error:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to generate blog post' };
  }
}
