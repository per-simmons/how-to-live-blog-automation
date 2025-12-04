'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function transcribeAudio(formData: FormData): Promise<{
  success: boolean;
  text?: string;
  error?: string;
}> {
  try {
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return { success: false, error: 'No audio file provided' };
    }

    // Check file size (25MB limit for Whisper)
    if (audioFile.size > 25 * 1024 * 1024) {
      return { success: false, error: 'Audio file must be less than 25MB' };
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'text',
    });

    return {
      success: true,
      text: transcription as unknown as string,
    };
  } catch (error) {
    console.error('Transcription error:', error);

    if (error instanceof Error) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to transcribe audio' };
  }
}
