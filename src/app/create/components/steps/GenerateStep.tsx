'use client';

import { useCallback, useEffect } from 'react';
import { useWizard } from '../WizardProvider';
import { generatePost } from '@/actions/generate-post';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function GenerateStep() {
  const { state, dispatch } = useWizard();

  const handleGenerate = useCallback(async () => {
    if (!state.transcription) return;

    dispatch({ type: 'START_GENERATING' });

    try {
      const result = await generatePost(state.transcription);

      if (result.success && result.content) {
        dispatch({ type: 'SET_GENERATED_CONTENT', payload: result.content });

        // Extract title from the generated content
        const titleMatch = result.content.match(/<h1[^>]*>(.*?)<\/h1>/i);
        if (titleMatch) {
          dispatch({ type: 'SET_POST_TITLE', payload: titleMatch[1] });
        }
      } else {
        dispatch({
          type: 'SET_GENERATE_ERROR',
          payload: result.error || 'Failed to generate blog post',
        });
      }
    } catch (error) {
      console.error('Generation error:', error);
      dispatch({
        type: 'SET_GENERATE_ERROR',
        payload: 'An unexpected error occurred during generation',
      });
    }
  }, [state.transcription, dispatch]);

  // Auto-generate when step is reached and no content exists
  useEffect(() => {
    if (
      state.transcription &&
      !state.generatedContent &&
      !state.isGenerating &&
      !state.generateError
    ) {
      handleGenerate();
    }
  }, [state.transcription, state.generatedContent, state.isGenerating, state.generateError, handleGenerate]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Generate Blog Post</h2>
        <p className="text-muted-foreground">
          Claude is transforming your voice note into a blog post
        </p>
      </div>

      {/* Transcription Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Transcription</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {state.transcription || 'No transcription available'}
          </p>
        </CardContent>
      </Card>

      {/* Generation Loading State */}
      {state.isGenerating && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <div className="text-center">
                <p className="text-lg font-medium">Writing your blog post...</p>
                <p className="text-sm text-muted-foreground">
                  Claude is crafting content in your authentic voice
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generation Error */}
      {state.generateError && (
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
              Generation Failed
            </CardTitle>
            <CardDescription className="text-destructive/80">
              {state.generateError}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerate} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Content Preview */}
      {!state.isGenerating && state.generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Blog Post</span>
              <span className="text-sm font-normal text-muted-foreground">
                {state.generatedContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length} words
              </span>
            </CardTitle>
            <CardDescription>
              Review the generated content below. You can edit it in the next step.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className="blog-preview max-h-[400px] overflow-y-auto p-4 bg-muted/50 rounded-lg"
              dangerouslySetInnerHTML={{ __html: state.generatedContent }}
            />
            <div className="flex justify-end">
              <Button onClick={handleGenerate} variant="outline" size="sm">
                Regenerate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Transcription State */}
      {!state.transcription && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p>No transcription available.</p>
              <p className="text-sm">Please go back and complete the transcription step first.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
