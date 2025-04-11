import { useState, memo } from 'react';
import type { FlashcardProposalDto } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FlashcardsListProps {
  proposals: FlashcardProposalDto[];
  onAccept?: (flashcard: FlashcardProposalDto, index: number) => void;
  onReject?: (flashcard: FlashcardProposalDto, index: number) => void;
}

const FlashcardItem = memo(function FlashcardItem({
  flashcard,
  index,
  isAccepted,
  isRejected,
  onAccept,
  onReject
}: {
  flashcard: FlashcardProposalDto;
  index: number;
  isAccepted: boolean;
  isRejected: boolean;
  onAccept?: (flashcard: FlashcardProposalDto, index: number) => void;
  onReject?: (flashcard: FlashcardProposalDto, index: number) => void;
}) {
  return (
    <Card 
      className={`
        ${isAccepted ? 'border-green-500' : ''}
        ${isRejected ? 'border-red-500' : ''}
      `}
    >
      <CardHeader>
        <CardTitle className="text-lg">Przód fiszki</CardTitle>
        <p className="mt-2">{flashcard.front}</p>
      </CardHeader>
      <CardContent>
        <h4 className="font-semibold mb-2">Tył fiszki</h4>
        <p>{flashcard.back}</p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {!isRejected && (
          <Button
            variant={isAccepted ? "outline" : "default"}
            onClick={() => onAccept?.(flashcard, index)}
            disabled={isAccepted}
          >
            {isAccepted ? 'Zaakceptowano' : 'Akceptuj'}
          </Button>
        )}
        {!isAccepted && (
          <Button
            variant="destructive"
            onClick={() => onReject?.(flashcard, index)}
            disabled={isRejected}
          >
            {isRejected ? 'Odrzucono' : 'Odrzuć'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
});

export const FlashcardsList = memo(function FlashcardsList({ proposals, onAccept, onReject }: FlashcardsListProps) {
  const [acceptedCards, setAcceptedCards] = useState<Set<number>>(new Set());
  const [rejectedCards, setRejectedCards] = useState<Set<number>>(new Set());

  const handleAccept = (flashcard: FlashcardProposalDto, index: number) => {
    setAcceptedCards(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    onAccept?.(flashcard, index);
  };

  const handleReject = (flashcard: FlashcardProposalDto, index: number) => {
    setRejectedCards(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    onReject?.(flashcard, index);
  };

  return (
    <div className="space-y-4">
      {proposals.map((flashcard, index) => (
        <FlashcardItem
          key={index}
          flashcard={flashcard}
          index={index}
          isAccepted={acceptedCards.has(index)}
          isRejected={rejectedCards.has(index)}
          onAccept={handleAccept}
          onReject={handleReject}
        />
      ))}
    </div>
  );
}); 