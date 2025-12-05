'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWizard } from '../WizardProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SectionImage } from '@/types/wizard';

// Split HTML content into paragraphs
function splitHtmlIntoParagraphs(html: string): string[] {
  // Split by closing </p> tags and filter empty strings
  const parts = html.split(/<\/p>/i);
  return parts
    .map(part => {
      const trimmed = part.trim();
      if (!trimmed) return '';
      // Re-add the closing tag if there was content
      return trimmed.includes('<p') ? trimmed + '</p>' : '';
    })
    .filter(p => p.length > 0);
}

// Build final HTML with images peppered throughout
function buildFinalHtml(
  editedContent: string,
  sectionImages: SectionImage[],
  postTitle: string
): string {
  const paragraphs = splitHtmlIntoParagraphs(editedContent);

  if (paragraphs.length === 0) {
    return editedContent;
  }

  // Find images by position
  const headerImage = sectionImages.find(img => img.position === 'header');
  const middle1Image = sectionImages.find(img => img.position === 'middle1');
  const middle2Image = sectionImages.find(img => img.position === 'middle2');
  const closingImage = sectionImages.find(img => img.position === 'closing');

  // Calculate insertion points
  const totalParagraphs = paragraphs.length;

  // Header image: after first paragraph (or at the very top if only 1 paragraph)
  const headerInsertIndex = 1;

  // Middle images: divide remaining paragraphs into thirds
  // Middle1: around 1/3 of the way through
  // Middle2: around 2/3 of the way through
  const middle1InsertIndex = Math.max(2, Math.floor(totalParagraphs * 0.33));
  const middle2InsertIndex = Math.max(3, Math.floor(totalParagraphs * 0.66));

  // Build image HTML helper
  const makeImageHtml = (image: SectionImage | undefined, alt: string) => {
    if (!image) return '';
    return `<img src="data:image/png;base64,${image.base64}" alt="${alt}" style="width: 100%; max-width: 800px; height: auto; margin: 24px 0; border-radius: 8px;" />`;
  };

  // Build the final HTML array
  const result: string[] = [];

  // Add header image at the very top
  if (headerImage) {
    result.push(makeImageHtml(headerImage, postTitle + ' - Header'));
  }

  for (let i = 0; i < paragraphs.length; i++) {
    result.push(paragraphs[i]);

    // Insert middle1 image after its position
    if (i === middle1InsertIndex - 1 && middle1Image) {
      result.push(makeImageHtml(middle1Image, postTitle + ' - Illustration'));
    }

    // Insert middle2 image after its position
    if (i === middle2InsertIndex - 1 && middle2Image) {
      result.push(makeImageHtml(middle2Image, postTitle + ' - Illustration'));
    }
  }

  // Add closing image at the end
  if (closingImage) {
    result.push(makeImageHtml(closingImage, postTitle + ' - Closing'));
  }

  return result.join('\n\n');
}

export function OutputStep() {
  const { state, dispatch } = useWizard();
  const [copied, setCopied] = useState(false);

  // Generate final HTML when step is reached
  useEffect(() => {
    if (state.editedContent && state.sectionImages.length > 0) {
      const finalHtml = buildFinalHtml(
        state.editedContent,
        state.sectionImages,
        state.postTitle
      );
      dispatch({ type: 'SET_FINAL_HTML', payload: finalHtml });
    }
  }, [state.editedContent, state.sectionImages, state.postTitle, dispatch]);

  const handleCopyHtml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.finalHtml);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = state.finalHtml;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [state.finalHtml]);

  const handleDownloadHtml = useCallback(() => {
    const blob = new Blob([state.finalHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${state.postTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state.finalHtml, state.postTitle]);

  const handleStartOver = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  const imageCount = state.sectionImages.length;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Your Blog Post is Ready</h2>
        <p className="text-muted-foreground">
          Copy the HTML and paste it into Beehive
        </p>
      </div>

      {/* Success Card */}
      <Card className="border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-950/20">
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-3">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="font-semibold text-green-700 dark:text-green-400">
                All steps completed
              </p>
              <p className="text-sm text-green-600 dark:text-green-500">
                Your blog post with {imageCount} illustration{imageCount !== 1 ? 's' : ''} is ready to use
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button
          onClick={handleCopyHtml}
          size="lg"
          className="min-w-[200px]"
        >
          {copied ? (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy HTML to Clipboard
            </>
          )}
        </Button>

        <Button
          onClick={handleDownloadHtml}
          variant="outline"
          size="lg"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Download HTML
        </Button>
      </div>

      {/* Preview Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>
            See how your blog post will look, or view the raw HTML
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Visual Preview</TabsTrigger>
              <TabsTrigger value="html">HTML Code</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-4">
              <div className="border rounded-lg p-6 bg-white dark:bg-zinc-950 max-h-[500px] overflow-y-auto">
                <div
                  className="blog-preview max-w-none"
                  dangerouslySetInnerHTML={{ __html: state.finalHtml }}
                />
              </div>
            </TabsContent>

            <TabsContent value="html" className="mt-4">
              <div className="relative">
                <pre className="border rounded-lg p-4 bg-muted overflow-x-auto max-h-[500px] overflow-y-auto text-xs whitespace-pre-wrap break-all">
                  <code>{state.finalHtml || 'No HTML content generated yet'}</code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Start Over */}
      <div className="text-center pt-4">
        <Button onClick={handleStartOver} variant="ghost" size="sm">
          Start Over with New Post
        </Button>
      </div>
    </div>
  );
}
