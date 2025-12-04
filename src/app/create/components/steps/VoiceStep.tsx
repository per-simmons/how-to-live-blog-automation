'use client';

import { useCallback, useRef, useState } from 'react';
import { useWizard } from '../WizardProvider';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VoiceStep() {
  const { state, dispatch } = useWizard();
  const {
    isRecording,
    isPaused,
    audioBlob,
    audioUrl,
    duration,
    error: recorderError,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
  } = useAudioRecorder();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleRecordingComplete = useCallback(() => {
    if (audioBlob && audioUrl) {
      dispatch({
        type: 'SET_AUDIO',
        payload: { blob: audioBlob, url: audioUrl, source: 'recorded' },
      });
    }
  }, [audioBlob, audioUrl, dispatch]);

  const handleStopRecording = useCallback(() => {
    stopRecording();
    // The effect will handle setting the audio after stopRecording completes
  }, [stopRecording]);

  // Effect to set audio after recording stops
  const handleConfirmRecording = useCallback(() => {
    if (audioBlob && audioUrl) {
      dispatch({
        type: 'SET_AUDIO',
        payload: { blob: audioBlob, url: audioUrl, source: 'recorded' },
      });
    }
  }, [audioBlob, audioUrl, dispatch]);

  const processFile = useCallback(
    (file: File) => {
      // Validate file type - accept audio files AND text files
      const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/m4a', 'audio/mp4', 'audio/ogg', 'audio/flac'];
      const isAudio = validAudioTypes.some((type) => file.type.includes(type.split('/')[1]));
      const isText = file.type === 'text/plain' || file.name.endsWith('.txt');

      if (!isAudio && !isText) {
        alert('Please upload a valid audio file (MP3, WAV, WebM, M4A, OGG, FLAC) or text file (TXT)');
        return;
      }

      // Validate file size (25MB limit)
      if (file.size > 25 * 1024 * 1024) {
        alert('File must be less than 25MB');
        return;
      }

      const url = URL.createObjectURL(file);
      dispatch({
        type: 'SET_AUDIO',
        payload: { blob: file, url, source: 'uploaded' },
      });
    },
    [dispatch]
  );

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragActive(false);

      const file = event.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [processFile]
  );

  const handleClearAudio = useCallback(() => {
    dispatch({ type: 'CLEAR_AUDIO' });
    clearRecording();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [dispatch, clearRecording]);

  const hasAudio = state.audioBlob !== null;
  const hasRecordedAudio = audioBlob !== null && !hasAudio;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Record or Upload Your Voice Note</h2>
        <p className="text-muted-foreground">
          Share your thoughts and we will transform them into a blog post
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Record Option */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              Record Audio
            </CardTitle>
            <CardDescription>
              Record directly from your microphone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recorderError && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md">
                {recorderError}
              </div>
            )}

            {isRecording && (
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <span className="text-lg font-mono">{formatDuration(duration)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isPaused ? 'Paused' : 'Recording...'}
                </p>
              </div>
            )}

            {hasRecordedAudio && !isRecording && (
              <div className="space-y-3">
                <audio src={audioUrl || undefined} controls className="w-full" />
                <div className="flex gap-2">
                  <Button
                    onClick={handleConfirmRecording}
                    className="flex-1"
                    variant="default"
                  >
                    Use This Recording
                  </Button>
                  <Button onClick={clearRecording} variant="outline">
                    Discard
                  </Button>
                </div>
              </div>
            )}

            {!isRecording && !hasRecordedAudio && !hasAudio && (
              <Button
                onClick={startRecording}
                className="w-full"
                size="lg"
              >
                Start Recording
              </Button>
            )}

            {isRecording && (
              <div className="flex gap-2">
                {isPaused ? (
                  <Button onClick={resumeRecording} variant="outline" className="flex-1">
                    Resume
                  </Button>
                ) : (
                  <Button onClick={pauseRecording} variant="outline" className="flex-1">
                    Pause
                  </Button>
                )}
                <Button onClick={handleStopRecording} variant="destructive" className="flex-1">
                  Stop
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Option */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Upload Audio
            </CardTitle>
            <CardDescription>
              Upload an existing audio file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.txt,text/plain"
              onChange={handleFileUpload}
              className="hidden"
              id="audio-upload"
            />

            {!hasAudio && (
              <label
                htmlFor="audio-upload"
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-primary bg-primary/20 scale-[1.02] shadow-lg shadow-primary/20'
                    : 'border-muted-foreground/30 hover:bg-muted/50 hover:border-muted-foreground/50'
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className={`w-8 h-8 mb-2 transition-all duration-200 ${
                      isDragActive
                        ? 'text-primary scale-110'
                        : 'text-muted-foreground'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className={`text-sm font-medium transition-colors duration-200 ${
                    isDragActive
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}>
                    {isDragActive ? 'Drop your file here!' : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    MP3, WAV, WebM, M4A, TXT (max 25MB)
                  </p>
                </div>
              </label>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Audio Preview */}
      {hasAudio && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green-500"
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
                Audio Ready
              </span>
              <span className="text-sm font-normal text-muted-foreground">
                {state.audioSource === 'recorded' ? 'Recorded' : 'Uploaded'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <audio src={state.audioUrl || undefined} controls className="w-full" />
            <Button onClick={handleClearAudio} variant="outline" className="w-full">
              Remove and Start Over
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
