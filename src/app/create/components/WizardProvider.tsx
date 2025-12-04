'use client';

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { WizardState, WizardAction, WizardStep } from '@/types/wizard';

const initialState: WizardState = {
  currentStep: 1,
  audioBlob: null,
  audioUrl: null,
  audioSource: null,
  transcription: '',
  isTranscribing: false,
  transcriptionError: null,
  generatedContent: '',
  isGenerating: false,
  generateError: null,
  editedContent: '',
  postTitle: '',
  imageBase64: null,
  isGeneratingImage: false,
  imageError: null,
  finalHtml: '',
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };

    case 'SET_AUDIO':
      return {
        ...state,
        audioBlob: action.payload.blob,
        audioUrl: action.payload.url,
        audioSource: action.payload.source,
      };

    case 'CLEAR_AUDIO':
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
      return {
        ...state,
        audioBlob: null,
        audioUrl: null,
        audioSource: null,
      };

    case 'START_TRANSCRIBING':
      return {
        ...state,
        isTranscribing: true,
        transcriptionError: null,
      };

    case 'SET_TRANSCRIPTION':
      return {
        ...state,
        transcription: action.payload,
        isTranscribing: false,
        transcriptionError: null,
      };

    case 'SET_TRANSCRIPTION_ERROR':
      return {
        ...state,
        isTranscribing: false,
        transcriptionError: action.payload,
      };

    case 'UPDATE_TRANSCRIPTION':
      return { ...state, transcription: action.payload };

    case 'START_GENERATING':
      return {
        ...state,
        isGenerating: true,
        generateError: null,
      };

    case 'SET_GENERATED_CONTENT':
      return {
        ...state,
        generatedContent: action.payload,
        editedContent: action.payload,
        isGenerating: false,
        generateError: null,
      };

    case 'SET_GENERATE_ERROR':
      return {
        ...state,
        isGenerating: false,
        generateError: action.payload,
      };

    case 'SET_EDITED_CONTENT':
      return { ...state, editedContent: action.payload };

    case 'SET_POST_TITLE':
      return { ...state, postTitle: action.payload };

    case 'START_GENERATING_IMAGE':
      return {
        ...state,
        isGeneratingImage: true,
        imageError: null,
      };

    case 'SET_IMAGE':
      return {
        ...state,
        imageBase64: action.payload,
        isGeneratingImage: false,
        imageError: null,
      };

    case 'SET_IMAGE_ERROR':
      return {
        ...state,
        isGeneratingImage: false,
        imageError: action.payload,
      };

    case 'SET_FINAL_HTML':
      return { ...state, finalHtml: action.payload };

    case 'RESET':
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
      return initialState;

    default:
      return state;
  }
}

interface WizardContextValue {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: () => boolean;
  canGoPrev: () => boolean;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const goToStep = useCallback((step: WizardStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const nextStep = useCallback(() => {
    if (state.currentStep < 6) {
      dispatch({ type: 'SET_STEP', payload: (state.currentStep + 1) as WizardStep });
    }
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_STEP', payload: (state.currentStep - 1) as WizardStep });
    }
  }, [state.currentStep]);

  const canGoNext = useCallback(() => {
    switch (state.currentStep) {
      case 1:
        return state.audioBlob !== null;
      case 2:
        return state.transcription.trim().length > 0 && !state.isTranscribing;
      case 3:
        return state.generatedContent.length > 0 && !state.isGenerating;
      case 4:
        return state.editedContent.length > 0;
      case 5:
        return state.imageBase64 !== null && !state.isGeneratingImage;
      case 6:
        return false;
      default:
        return false;
    }
  }, [state]);

  const canGoPrev = useCallback(() => {
    return state.currentStep > 1;
  }, [state.currentStep]);

  return (
    <WizardContext.Provider
      value={{
        state,
        dispatch,
        goToStep,
        nextStep,
        prevStep,
        canGoNext,
        canGoPrev,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
}
