'use client';

import { useCallback } from 'react';
import { useWizard } from '../WizardProvider';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function EditStep() {
  const { state, dispatch } = useWizard();

  const handleContentChange = useCallback(
    (html: string) => {
      dispatch({ type: 'SET_EDITED_CONTENT', payload: html });
    },
    [dispatch]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'SET_POST_TITLE', payload: e.target.value });
    },
    [dispatch]
  );

  const wordCount = state.editedContent
    .replace(/<[^>]*>/g, '')
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Edit Your Post</h2>
        <p className="text-muted-foreground">
          Fine-tune your blog post before generating the image
        </p>
      </div>

      {/* Title Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Post Title</CardTitle>
          <CardDescription>
            This will be used as the main heading of your blog post
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={state.postTitle}
            onChange={handleTitleChange}
            placeholder="Enter your post title..."
            className="text-lg"
          />
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Content Editor</span>
            <span className="text-sm font-normal text-muted-foreground">
              {wordCount} words
            </span>
          </CardTitle>
          <CardDescription>
            Use the toolbar to format your text with bold, italics, headings, and links
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TipTapEditor
            content={state.editedContent}
            onChange={handleContentChange}
          />
        </CardContent>
      </Card>

    </div>
  );
}
