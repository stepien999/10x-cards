import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface GenerateFormProps {
  onSubmit: (text: string) => void;
}

interface FormState {
  text: string;
  isValid: boolean;
}

export function GenerateForm({ onSubmit }: GenerateFormProps) {
  const [state, setState] = useState<FormState>({
    text: '',
    isValid: false
  });

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    setState({
      text,
      isValid: text.length >= 1000 && text.length <= 10000
    });
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (state.isValid) {
      onSubmit(state.text);
    }
  };

  const charactersCount = state.text.length;
  const minChars = 1000;
  const maxChars = 10000;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Wprowadź tekst do wygenerowania fiszek</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={state.text}
            onChange={handleTextChange}
            placeholder="Wprowadź tekst (minimum 1000 znaków, maksimum 10000 znaków)..."
            className="min-h-[200px]"
          />
          <div className="mt-2 text-sm text-gray-600">
            Liczba znaków: {charactersCount} / {maxChars}
            {charactersCount < minChars && (
              <span className="text-red-500 ml-2">
                Wymagane minimum {minChars} znaków
              </span>
            )}
            {charactersCount > maxChars && (
              <span className="text-red-500 ml-2">
                Przekroczono limit {maxChars} znaków
              </span>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={!state.isValid}
          >
            Generuj fiszki
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
} 