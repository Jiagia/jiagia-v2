import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { AnalyticsEvent, useAnalytics } from '@shopify/hydrogen';

export function PageViewTracker() {
  const location = useLocation();
  const { publish, canTrack } = useAnalytics();

  useEffect(() => {
    if (canTrack()) {
      const pageType = getPageType(location.pathname);
      const url = typeof window !== 'undefined' ? window.location.href : '';

      publish(AnalyticsEvent.PAGE_VIEWED, {
        pageType,
        path: location.pathname,
        search: location.search,
        url,
      });
    }
  }, [location.pathname, location.search, publish, canTrack]);

  return null;
}

function getPageType(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname.startsWith('/products/')) return 'product';
  if (pathname.startsWith('/collections/')) return 'collection';
  if (pathname.startsWith('/dreamscapes/')) return 'dreamscape';
  if (pathname.startsWith('/about')) return 'about';
  if (pathname.startsWith('/sounds')) return 'sounds';
  if (pathname.startsWith('/cart')) return 'cart';
  if (pathname.startsWith('/search')) return 'search';
  if (pathname.startsWith('/account')) return 'account';
  if (pathname.startsWith('/blogs/')) return 'blog';
  if (pathname.startsWith('/pages/')) return 'page';
  if (pathname.startsWith('/policies/')) return 'policy';
  return 'other';
}

