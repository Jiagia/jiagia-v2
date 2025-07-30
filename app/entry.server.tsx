import type {AppLoadContext} from '@shopify/remix-oxygen';
import {ServerRouter} from 'react-router';
import {isbot} from 'isbot';
import {renderToReadableStream} from 'react-dom/server';
import {createContentSecurityPolicy} from '@shopify/hydrogen';
import type {EntryContext} from 'react-router';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
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
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://fonts.googleapis.com'
    ],
    scriptSrc: [
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://cdn.shopify.com',
    ],
    connectSrc: [
      'https://klaviyo.com',
      'https://*.klaviyo.com',
      'https://api-js.datadome.co/'
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
      '*',
      'data:',
      'https://cdnjs.cloudflare.com',
      'https://cdn.shopify.com',
    ],
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
      signal: request.signal,
      onError(error) {
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
