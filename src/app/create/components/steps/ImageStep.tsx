'use client';

import { useCallback, useEffect } from 'react';
import { useWizard } from '../WizardProvider';
import { generateImage } from '@/actions/generate-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function ImageStep() {
  const { state, dispatch } = useWizard();

  const handleGenerateImage = useCallback(async () => {
    if (!state.editedContent) return;

    dispatch({ type: 'START_GENERATING_IMAGE' });

    try {
      const result = await generateImage(state.editedContent);

      if (result.success && result.imageBase64) {
        dispatch({ type: 'SET_IMAGE', payload: result.imageBase64 });
      } else {
        dispatch({
          type: 'SET_IMAGE_ERROR',
          payload: result.error || 'Failed to generate image',
        });
      }
    } catch (error) {
      console.error('Image generation error:', error);
      dispatch({
        type: 'SET_IMAGE_ERROR',
        payload: 'An unexpected error occurred during image generation',
      });
    }
  }, [state.editedContent, dispatch]);

  // Auto-generate image when step is reached and no image exists
  useEffect(() => {
    if (
      state.editedContent &&
      !state.imageBase64 &&
      !state.isGeneratingImage &&
      !state.imageError
    ) {
      handleGenerateImage();
    }
  }, [state.editedContent, state.imageBase64, state.isGeneratingImage, state.imageError, handleGenerateImage]);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Generate Illustration</h2>
        <p className="text-muted-foreground">
          Creating a watercolor illustration for your blog post
        </p>
      </div>

      {/* Content Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Post</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground line-clamp-3">
            <strong>{state.postTitle}</strong>
            <span className="mx-2">-</span>
            {state.editedContent.replace(/<[^>]*>/g, '').slice(0, 200)}...
          </div>
        </CardContent>
      </Card>

      {/* Image Generation Loading State */}
      {state.isGeneratingImage && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <div className="text-center">
                <p className="text-lg font-medium">Creating your illustration...</p>
                <p className="text-sm text-muted-foreground">
                  Generating a watercolor-style image based on your content
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Generation Error */}
      {state.imageError && (
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
              Image Generation Failed
            </CardTitle>
            <CardDescription className="text-destructive/80">
              {state.imageError}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerateImage} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Image */}
      {!state.isGeneratingImage && state.imageBase64 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Illustration</span>
              <span className="text-sm font-normal text-muted-foreground">
                1536 x 1024
              </span>
            </CardTitle>
            <CardDescription>
              This watercolor illustration will be included with your blog post
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-muted">
              <img
                src={`data:image/png;base64,${state.imageBase64}`}
                alt="Generated illustration"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleGenerateImage} variant="outline" size="sm">
                Regenerate Image
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
