import { useCallback, useState } from 'react';

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=533&fit=crop';

/** Thumbnail URL (…/product-images/thumbnails/x.webp) → original (…/product-images/x.webp). */
export function thumbnailToOriginal(url: string): string {
  return url.replace('/thumbnails/', '/');
}

/**
 * Image src with a two-step fallback for product thumbnails:
 * thumbnail → original full-size image → FALLBACK_IMAGE. Each step happens at
 * most once per src, so a broken fallback can't cause an error/reload loop.
 */
export function useImageFallback(src: string | null | undefined) {
  const initial = src || FALLBACK_IMAGE;
  // stage 0 = given src, 1 = original (thumbnail stripped), 2 = placeholder
  const [state, setState] = useState<{ for: string; stage: 0 | 1 | 2 }>({ for: initial, stage: 0 });
  const stage = state.for === initial ? state.stage : 0;

  const original = thumbnailToOriginal(initial);
  const current = stage === 0 ? initial : stage === 1 ? original : FALLBACK_IMAGE;

  const onError = useCallback(() => {
    setState((prev) => {
      const prevStage = prev.for === initial ? prev.stage : 0;
      if (prevStage === 0 && original !== initial) return { for: initial, stage: 1 };
      if (prevStage < 2 && initial !== FALLBACK_IMAGE) return { for: initial, stage: 2 };
      return prev;
    });
  }, [initial, original]);

  return { src: current, onError };
}
