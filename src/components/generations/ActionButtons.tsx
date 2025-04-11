import { memo } from 'react';
import { Button } from "@/components/ui/button";
import type { FlashcardProposalDto } from "../../types";
import { Loader2 } from "lucide-react";

interface ActionButtonsProps {
  proposals: FlashcardProposalDto[];
  acceptedCards: Set<number>;
  onSaveAll: () => void;
  onSaveAccepted: () => void;
  disabled?: boolean;
}

export const ActionButtons = memo(function ActionButtons({
  proposals,
  acceptedCards,
  onSaveAll,
  onSaveAccepted,
  disabled = false
}: ActionButtonsProps) {
  const hasAcceptedCards = acceptedCards.size > 0;
  const hasProposals = proposals.length > 0;

  return (
    <div className="flex justify-end space-x-4 mt-6">
      <Button
        variant="outline"
        onClick={onSaveAccepted}
        disabled={disabled || !hasAcceptedCards}
      >
        {disabled ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Zapisz zaakceptowane ({acceptedCards.size})
      </Button>
      <Button
        onClick={onSaveAll}
        disabled={disabled || !hasProposals}
      >
        {disabled ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Zapisz wszystkie ({proposals.length})
      </Button>
    </div>
  );
}); 