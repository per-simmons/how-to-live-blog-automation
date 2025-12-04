'use client';

import { useCallback, useEffect } from 'react';
import { useWizard } from '../WizardProvider';
import { transcribeAudio } from '@/actions/transcribe';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export function TranscribeStep() {
  const { state, dispatch } = useWizard();

  // Check if the uploaded file is a text file
  const isTextFile = state.audioBlob?.type === 'text/plain' ||
    (state.audioBlob instanceof File && (state.audioBlob as File).name?.endsWith('.txt'));

  const handleTranscribe = useCallback(async () => {
    if (!state.audioBlob) return;

    dispatch({ type: 'START_TRANSCRIBING' });

    try {
      // If it's a text file, read it directly instead of transcribing
      if (state.audioBlob.type === 'text/plain' ||
          (state.audioBlob instanceof File && (state.audioBlob as File).name?.endsWith('.txt'))) {
        const text = await state.audioBlob.text();
        dispatch({ type: 'SET_TRANSCRIPTION', payload: text });
        return;
      }

      const formData = new FormData();

      // Determine file extension based on MIME type
      const mimeType = state.audioBlob.type || 'audio/webm';
      const extension = mimeType.includes('mp4') ? 'mp4'
        : mimeType.includes('webm') ? 'webm'
        : mimeType.includes('wav') ? 'wav'
        : mimeType.includes('mp3') || mimeType.includes('mpeg') ? 'mp3'
        : 'webm';

      const file = new File([state.audioBlob], `recording.${extension}`, {
        type: mimeType,
      });

      formData.append('audio', file);

      const result = await transcribeAudio(formData);

      if (result.success && result.text) {
        dispatch({ type: 'SET_TRANSCRIPTION', payload: result.text });
      } else {
        dispatch({
          type: 'SET_TRANSCRIPTION_ERROR',
          payload: result.error || 'Transcription failed',
        });
      }
    } catch (error) {
      console.error('Transcription error:', error);
      dispatch({
        type: 'SET_TRANSCRIPTION_ERROR',
        payload: 'An unexpected error occurred during transcription',
      });
    }
  }, [state.audioBlob, dispatch]);

  const handleTranscriptionChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      dispatch({ type: 'UPDATE_TRANSCRIPTION', payload: e.target.value });
    },
    [dispatch]
  );

  // Auto-transcribe when step is reached and no transcription exists
  useEffect(() => {
    if (
      state.audioBlob &&
      !state.transcription &&
      !state.isTranscribing &&
      !state.transcriptionError
    ) {
      handleTranscribe();
    }
  }, [state.audioBlob, state.transcription, state.isTranscribing, state.transcriptionError, handleTranscribe]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Transcription</h2>
        <p className="text-muted-foreground">
          Review and edit the transcription before generating your post
        </p>
      </div>

      {/* Audio Preview */}
      {state.audioUrl && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <audio src={state.audioUrl} controls className="w-full" />
          </CardContent>
        </Card>
      )}

      {/* Transcription Loading State */}
      {state.isTranscribing && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <div className="text-center">
                <p className="text-lg font-medium">Transcribing your audio...</p>
                <p className="text-sm text-muted-foreground">
                  This may take a moment depending on the length
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcription Error */}
      {state.transcriptionError && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Transcription Failed
            </CardTitle>
            <CardDescription className="text-destructive/80">
              {state.transcriptionError}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleTranscribe} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Transcription Result */}
      {!state.isTranscribing && state.transcription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Transcription</span>
              <span className="text-sm font-normal text-muted-foreground">
                {state.transcription.split(/\s+/).filter(Boolean).length} words
              </span>
            </CardTitle>
            <CardDescription>
              You can edit the transcription below before generating your blog post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={state.transcription}
              onChange={handleTranscriptionChange}
              className="min-h-[200px] resize-y"
              placeholder="Transcription will appear here..."
            />
            <div className="flex justify-end">
              <Button onClick={handleTranscribe} variant="outline" size="sm">
                Re-transcribe
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Audio State */}
      {!state.audioBlob && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p>No audio to transcribe.</p>
              <p className="text-sm">Please go back and record or upload audio first.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
