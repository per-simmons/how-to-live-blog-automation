export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

export interface WizardState {
  currentStep: WizardStep;

  // Step 1: Voice
  audioBlob: Blob | null;
  audioUrl: string | null;
  audioSource: 'recorded' | 'uploaded' | null;

  // Step 2: Transcription
  transcription: string;
  isTranscribing: boolean;
  transcriptionError: string | null;

  // Step 3: Generated Post
  generatedContent: string;
  isGenerating: boolean;
  generateError: string | null;

  // Step 4: Edited Content
  editedContent: string;
  postTitle: string;

  // Step 5: Image
  imageBase64: string | null;
  isGeneratingImage: boolean;
  imageError: string | null;

  // Step 6: Output
  finalHtml: string;
}

export type WizardAction =
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'SET_AUDIO'; payload: { blob: Blob; url: string; source: 'recorded' | 'uploaded' } }
  | { type: 'CLEAR_AUDIO' }
  | { type: 'START_TRANSCRIBING' }
  | { type: 'SET_TRANSCRIPTION'; payload: string }
  | { type: 'SET_TRANSCRIPTION_ERROR'; payload: string }
  | { type: 'UPDATE_TRANSCRIPTION'; payload: string }
  | { type: 'START_GENERATING' }
  | { type: 'SET_GENERATED_CONTENT'; payload: string }
  | { type: 'SET_GENERATE_ERROR'; payload: string }
  | { type: 'SET_EDITED_CONTENT'; payload: string }
  | { type: 'SET_POST_TITLE'; payload: string }
  | { type: 'START_GENERATING_IMAGE' }
  | { type: 'SET_IMAGE'; payload: string }
  | { type: 'SET_IMAGE_ERROR'; payload: string }
  | { type: 'SET_FINAL_HTML'; payload: string }
  | { type: 'RESET' };

export const STEP_LABELS: Record<WizardStep, string> = {
  1: 'Voice',
  2: 'Transcribe',
  3: 'Generate',
  4: 'Edit',
  5: 'Image',
  6: 'Output',
};
