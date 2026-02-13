import { useMetaTags } from './useMetaTags';

export function useDocumentTitle(title) {
  useMetaTags({ title });
}
