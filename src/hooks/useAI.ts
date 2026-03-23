import { useState, useCallback } from 'react';
import { askAIStream, AIModel } from '../services/aiService';

export function useAI() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(async (
    prompt: string, 
    onChunk: (chunk: string) => void,
    options?: {
      context?: string;
      language?: 'en' | 'ar';
      model?: AIModel;
    }
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      await askAIStream(
        prompt,
        onChunk,
        options?.context,
        options?.language,
        undefined,
        options?.model
      );
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { ask, isLoading, error };
}
