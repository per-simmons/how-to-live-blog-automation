'use client';

import { useCallback, useEffect } from 'react';
import { useWizard } from '../WizardProvider';
import { generateAllSectionImages } from '@/actions/generate-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IMAGE_POSITIONS } from '@/types/wizard';

const POSITION_LABELS: Record<string, string> = {
  header: 'Header Image',
  middle1: 'Middle Image 1',
  middle2: 'Middle Image 2',
  closing: 'Closing Image',
};

export function ImageStep() {
  const { state, dispatch } = useWizard();

  const handleGenerateImages = useCallback(async () => {
    if (!state.editedContent) return;

    dispatch({ type: 'START_GENERATING_IMAGE', payload: 0 });
    dispatch({ type: 'CLEAR_SECTION_IMAGES' });

    try {
      const result = await generateAllSectionImages(state.editedContent);

      if (result.success && result.images) {
        dispatch({ type: 'SET_ALL_SECTION_IMAGES', payload: result.images });
      } else {
        dispatch({
          type: 'SET_IMAGE_ERROR',
          payload: result.error || 'Failed to generate images',
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

  // Auto-generate images when step is reached and no images exist
  useEffect(() => {
    if (
      state.editedContent &&
      state.sectionImages.length === 0 &&
      !state.isGeneratingImage &&
      !state.imageError
    ) {
      handleGenerateImages();
    }
  }, [state.editedContent, state.sectionImages.length, state.isGeneratingImage, state.imageError, handleGenerateImages]);

  const completedCount = state.sectionImages.length;
  const totalCount = 4;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Generate Illustrations</h2>
        <p className="text-muted-foreground">
          Creating 4 watercolor illustrations for your blog post
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
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <div className="text-center">
                <p className="text-lg font-medium">Creating your illustrations...</p>
                <p className="text-sm text-muted-foreground">
                  Generating {completedCount + 1} of {totalCount} images
                </p>
              </div>
              {/* Progress indicator */}
              <div className="flex gap-2 mt-4">
                {IMAGE_POSITIONS.map((pos, idx) => (
                  <div
                    key={pos}
                    className={`w-3 h-3 rounded-full ${
                      idx < completedCount
                        ? 'bg-green-500'
                        : idx === completedCount
                        ? 'bg-primary animate-pulse'
                        : 'bg-muted'
                    }`}
                  />
                ))}
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
            <Button onClick={handleGenerateImages} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generated Images Grid */}
      {!state.isGeneratingImage && state.sectionImages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">
              Generated Illustrations ({completedCount}/{totalCount})
            </h3>
            <Button onClick={handleGenerateImages} variant="outline" size="sm">
              Regenerate All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {IMAGE_POSITIONS.map((position) => {
              const image = state.sectionImages.find(img => img.position === position);

              return (
                <Card key={position}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {POSITION_LABELS[position]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {image ? (
                      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                        <img
                          src={`data:image/png;base64,${image.base64}`}
                          alt={POSITION_LABELS[position]}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video flex items-center justify-center bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Not generated</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {completedCount < totalCount && (
            <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
              {totalCount - completedCount} image(s) failed to generate. You can proceed or try regenerating.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
