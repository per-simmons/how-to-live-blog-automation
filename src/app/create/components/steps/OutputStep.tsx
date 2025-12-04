'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWizard } from '../WizardProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function OutputStep() {
  const { state, dispatch } = useWizard();
  const [copied, setCopied] = useState(false);

  // Generate final HTML when step is reached
  useEffect(() => {
    if (state.editedContent && state.imageBase64) {
      const imageDataUrl = `data:image/png;base64,${state.imageBase64}`;

      const finalHtml = `<img src="${imageDataUrl}" alt="${state.postTitle}" style="width: 100%; max-width: 800px; height: auto; margin-bottom: 24px; border-radius: 8px;" />

${state.editedContent}`;

      dispatch({ type: 'SET_FINAL_HTML', payload: finalHtml });
    }
  }, [state.editedContent, state.imageBase64, state.postTitle, dispatch]);

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
                Your blog post with image is ready to use
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
