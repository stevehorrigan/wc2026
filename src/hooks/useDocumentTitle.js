import { useEffect } from 'react';

const SUFFIX = ' | World Cup 2026';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? title + SUFFIX : 'World Cup 2026 Fan Companion';
  }, [title]);
}
