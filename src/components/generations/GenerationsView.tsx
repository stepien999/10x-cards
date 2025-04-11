import { useState } from 'react';
import type { FlashcardProposalDto, GenerationCreateResponseDto, FlashcardsCreateCommand, FlashcardCreateDto } from '../../types';
import { GenerateForm } from '@/components/generations/GenerateForm';
import { SkeletonLoader } from './SkeletonLoader';
import { FlashcardsList } from './FlashcardsList';
import { ActionButtons } from './ActionButtons';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';

interface GenerationViewState {
  loading: boolean;
  error: string | null;
  proposals: FlashcardProposalDto[];
  acceptedCards: Set<number>;
  generationId: number | null;
  saving: boolean;
}

export function GenerationsView() {
  const [state, setState] = useState<GenerationViewState>({
    loading: false,
    error: null,
    proposals: [],
    acceptedCards: new Set(),
    generationId: null,
    saving: false
  });

  const handleGenerateSubmit = async (text: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('Wystąpił błąd podczas generowania fiszek');
      }

      const data: GenerationCreateResponseDto = await response.json();
      setState(prev => ({
        ...prev,
        loading: false,
        proposals: data.flashcards_proposals,
        acceptedCards: new Set(),
        generationId: data.generation_id
      }));
      toast.success('Pomyślnie wygenerowano propozycje fiszek');
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Wystąpił nieznany błąd'
      }));
    }
  };

  const handleAccept = (flashcard: FlashcardProposalDto, index: number) => {
    setState(prev => ({
      ...prev,
      acceptedCards: new Set(prev.acceptedCards).add(index)
    }));
  };

  const createFlashcardsPayload = (selectedProposals: FlashcardProposalDto[]): FlashcardsCreateCommand => {
    return {
      flashcards: selectedProposals.map(proposal => ({
        front: proposal.front,
        back: proposal.back,
        source: proposal.source,
        generation_id: state.generationId
      }))
    };
  };

  const saveFlashcards = async (flashcards: FlashcardCreateDto[]) => {
    const response = await fetch('/api/flashcards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ flashcards })
    });

    if (!response.ok) {
      throw new Error('Wystąpił błąd podczas zapisywania fiszek');
    }
  };

  const handleSaveAll = async () => {
    try {
      setState(prev => ({ ...prev, saving: true, error: null }));
      const payload = createFlashcardsPayload(state.proposals);
      await saveFlashcards(payload.flashcards);
      setState(prev => ({ 
        ...prev, 
        saving: false,
        proposals: [],
        acceptedCards: new Set(),
        generationId: null
      }));
      toast.success(`Pomyślnie zapisano ${state.proposals.length} fiszek`);
    } catch (error) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania fiszek'
      }));
    }
  };

  const handleSaveAccepted = async () => {
    try {
      setState(prev => ({ ...prev, saving: true, error: null }));
      const acceptedProposals = state.proposals.filter((_, index) => state.acceptedCards.has(index));
      const payload = createFlashcardsPayload(acceptedProposals);
      await saveFlashcards(payload.flashcards);
      setState(prev => ({ 
        ...prev, 
        saving: false,
        proposals: [],
        acceptedCards: new Set(),
        generationId: null
      }));
      toast.success(`Pomyślnie zapisano ${acceptedProposals.length} fiszek`);
    } catch (error) {
      setState(prev => ({
        ...prev,
        saving: false,
        error: error instanceof Error ? error.message : 'Wystąpił błąd podczas zapisywania fiszek'
      }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Generowanie fiszek AI</h1>
      
      <GenerateForm onSubmit={handleGenerateSubmit} />

      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
            role="alert"
          >
            <span className="block sm:inline">{state.error}</span>
          </motion.div>
        )}

        {state.loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-8"
          >
            <SkeletonLoader />
          </motion.div>
        )}

        {state.proposals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="mt-8">
              <FlashcardsList
                proposals={state.proposals}
                onAccept={handleAccept}
              />
            </div>
            <ActionButtons
              proposals={state.proposals}
              acceptedCards={state.acceptedCards}
              onSaveAll={handleSaveAll}
              onSaveAccepted={handleSaveAccepted}
              disabled={state.saving}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 