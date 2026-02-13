import { useEffect } from 'react';

const SUFFIX = ' | World Cup 2026';
const DEFAULT_TITLE = 'World Cup 2026 Fan Companion';
const SITE_NAME = 'World Cup 2026 Fan Companion';

/**
 * Find an existing meta tag or create one if it doesn't exist.
 * @param {string} attr  - The attribute name to match ('name' or 'property')
 * @param {string} value - The attribute value to match (e.g. 'description', 'og:title')
 * @returns {HTMLMetaElement}
 */
function getOrCreateMeta(attr, value) {
  let el = document.querySelector(`meta[${attr}="${value}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, value);
    document.head.appendChild(el);
  }
  return el;
}

/**
 * Dynamically update document title, meta description, Open Graph, and Twitter card tags.
 *
 * @param {Object} options
 * @param {string} [options.title]       - Page title (suffix ' | World Cup 2026' is appended automatically)
 * @param {string} [options.description] - Meta description for the page
 */
export function useMetaTags({ title, description } = {}) {
  useEffect(() => {
    const prevTitle = document.title;

    // --- Document title ---
    const fullTitle = title ? title + SUFFIX : DEFAULT_TITLE;
    document.title = fullTitle;

    // --- Meta description ---
    const metaDesc = getOrCreateMeta('name', 'description');
    const prevDesc = metaDesc.getAttribute('content');
    if (description) {
      metaDesc.setAttribute('content', description);
    }

    // --- Open Graph ---
    const ogTitle = getOrCreateMeta('property', 'og:title');
    const prevOgTitle = ogTitle.getAttribute('content');
    ogTitle.setAttribute('content', fullTitle);

    const ogDesc = getOrCreateMeta('property', 'og:description');
    const prevOgDesc = ogDesc.getAttribute('content');
    if (description) {
      ogDesc.setAttribute('content', description);
    }

    const ogType = getOrCreateMeta('property', 'og:type');
    const prevOgType = ogType.getAttribute('content');
    ogType.setAttribute('content', 'website');

    const ogSiteName = getOrCreateMeta('property', 'og:site_name');
    const prevOgSiteName = ogSiteName.getAttribute('content');
    ogSiteName.setAttribute('content', SITE_NAME);

    // --- Twitter Card ---
    const twCard = getOrCreateMeta('name', 'twitter:card');
    const prevTwCard = twCard.getAttribute('content');
    twCard.setAttribute('content', 'summary');

    const twTitle = getOrCreateMeta('name', 'twitter:title');
    const prevTwTitle = twTitle.getAttribute('content');
    twTitle.setAttribute('content', fullTitle);

    const twDesc = getOrCreateMeta('name', 'twitter:description');
    const prevTwDesc = twDesc.getAttribute('content');
    if (description) {
      twDesc.setAttribute('content', description);
    }

    // --- Cleanup: restore previous values on unmount ---
    return () => {
      document.title = prevTitle;
      metaDesc.setAttribute('content', prevDesc || '');
      ogTitle.setAttribute('content', prevOgTitle || '');
      ogDesc.setAttribute('content', prevOgDesc || '');
      ogType.setAttribute('content', prevOgType || '');
      ogSiteName.setAttribute('content', prevOgSiteName || '');
      twCard.setAttribute('content', prevTwCard || '');
      twTitle.setAttribute('content', prevTwTitle || '');
      twDesc.setAttribute('content', prevTwDesc || '');
    };
  }, [title, description]);
}
