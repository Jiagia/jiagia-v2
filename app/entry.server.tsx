import type {EntryContext, AppLoadContext} from '@shopify/remix-oxygen';
import {RemixServer} from '@remix-run/react';
import isbot from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  context: AppLoadContext,
) {
  const {nonce, header, NonceProvider} = createContentSecurityPolicy({
    shop: {
      checkoutDomain: context.env.PUBLIC_CHECKOUT_DOMAIN,
      storeDomain: context.env.PUBLIC_STORE_DOMAIN,
    },
    defaultSrc:[
      "'self'",
      'https://geo.captcha-delivery.com',
    ],
    styleSrc: [
      "'self'",
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://fonts.googleapis.com'
    ],
    scriptSrc: [
      "'self'",
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://cdn.shopify.com'
    ],
    connectSrc: [
      "*", // need to change
      'https://klaviyo.com',
      'https://*.klaviyo.com'
    ],
    fontSrc: [
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com/'
    ],
    workerSrc: [
      'blob:',
    ],
    imgSrc: [
      "'self'",
      'https://cdnjs.cloudflare.com',
      'https://cdn.shopify.com',
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <RemixServer context={remixContext} url={request.url} />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
        // eslint-disable-next-line no-console
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get('user-agent'))) {
    await body.allReady;
  }

  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Content-Security-Policy', header);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
