import {Suspense} from 'react';
import {Await, NavLink} from '@remix-run/react';
import type {FooterQuery, HeaderQuery} from 'storefrontapi.generated';

interface FooterProps {
  footer: Promise<FooterQuery | null>;
  header: HeaderQuery;
  publicStoreDomain: string;
  newsletterLink: string;
}

export function Footer({
  footer: footerPromise,
  header,
  publicStoreDomain,
  newsletterLink,
}: FooterProps) {

  const FBLink: string = 'https://www.facebook.com/profile.php?id=100083105601746';
  const IGLink: string = 'https://www.instagram.com/jiagia_studios/';
  const XLink: string = 'https://twitter.com/jiagia_studios';
  return (
    <Suspense>
      <Await resolve={footerPromise}>
        {(footer) => (
          <footer className="footer border-t border-black grid md:grid-cols-3 gap-y-4 justify-items-center items-center pt-2 dark:text-white  overflow-hidden mb-[32px]">
            <div className="px-8">
              <div className={newsletterLink} style={{maxWidth: '100vw'}}></div>
            </div>
            <div className="justify-self-center py-4 md:pt-0">
              <SocialIcon FacebookLink={FBLink} InstaLink={IGLink} XLink={XLink} />
            </div>
            {footer?.menu && header.shop.primaryDomain?.url && (
              <FooterMenu
                menu={footer.menu}
                primaryDomainUrl={header.shop.primaryDomain.url}
                publicStoreDomain={publicStoreDomain}
              />
            )}
          </footer>
        )}
      </Await>
    </Suspense>
  );
}

function FooterMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
}: {
  menu: FooterQuery['menu'];
  primaryDomainUrl: FooterProps['header']['shop']['primaryDomain']['url'];
  publicStoreDomain: string;
}) {
  return (
    <nav className="text-center md:text-right justify-items-center flex flex-col" role="navigation">
      {(menu || FALLBACK_FOOTER_MENU).items.map((item) => {
        if (!item.url) return null;
        // if the url is internal, we strip the domain
        const url =
          item.url.includes('myshopify.com') ||
          item.url.includes(publicStoreDomain) ||
          item.url.includes(primaryDomainUrl)
            ? new URL(item.url).pathname
            : item.url;
        const isExternal = !url.startsWith('/');
        return isExternal ? (
          <a href={url} key={item.id} rel="noopener noreferrer" target="_blank">
            {item.title}
          </a>
        ) : (
          <NavLink
            end
            key={item.id}
            prefetch="intent"
            style={activeLinkStyle}
            to={url}
          >
            {item.title}
          </NavLink>
        );
      })}
    </nav>
  );
}

function SocialIcon(
  {FacebookLink, InstaLink, XLink} 
  : {
    FacebookLink: string,
    InstaLink: string, 
    XLink: string,
  }) {
  return (
    <div className="social-icons">
      <a
        target="_blank"
        href={FacebookLink}
        className="social-link m-3 md:m-5 w-7 h-7"
        rel="noreferrer"
      >
        <div className="w-7 h-7" style={{display: 'inline-block'}}>
          <svg
            aria-hidden="true"
            focusable="false"
            className="icon icon-facebook"
            viewBox="0 0 18 18"
          >
            <path
              fill="currentColor"
              d="M16.42.61c.27 0 .5.1.69.28.19.2.28.42.28.7v15.44c0 .27-.1.5-.28.69a.94.94 0 01-.7.28h-4.39v-6.7h2.25l.31-2.65h-2.56v-1.7c0-.4.1-.72.28-.93.18-.2.5-.32 1-.32h1.37V3.35c-.6-.06-1.27-.1-2.01-.1-1.01 0-1.83.3-2.45.9-.62.6-.93 1.44-.93 2.53v1.97H7.04v2.65h2.24V18H.98c-.28 0-.5-.1-.7-.28a.94.94 0 01-.28-.7V1.59c0-.27.1-.5.28-.69a.94.94 0 01.7-.28h15.44z"
            ></path>
          </svg>
        </div>
      </a>
      <a
        target="_blank"
        href={InstaLink}
        className="social-link m-3 md:m-5 w-7 h-7"
        rel="noreferrer"
      >
        <div className="w-7 h-7" style={{display: 'inline-block'}}>
          <svg
            aria-hidden="true"
            focusable="false"
            className="icon icon-instagram"
            viewBox="0 0 18 18"
          >
            <path
              fill="currentColor"
              d="M8.77 1.58c2.34 0 2.62.01 3.54.05.86.04 1.32.18 1.63.3.41.17.7.35 1.01.66.3.3.5.6.65 1 .12.32.27.78.3 1.64.05.92.06 1.2.06 3.54s-.01 2.62-.05 3.54a4.79 4.79 0 01-.3 1.63c-.17.41-.35.7-.66 1.01-.3.3-.6.5-1.01.66-.31.12-.77.26-1.63.3-.92.04-1.2.05-3.54.05s-2.62 0-3.55-.05a4.79 4.79 0 01-1.62-.3c-.42-.16-.7-.35-1.01-.66-.31-.3-.5-.6-.66-1a4.87 4.87 0 01-.3-1.64c-.04-.92-.05-1.2-.05-3.54s0-2.62.05-3.54c.04-.86.18-1.32.3-1.63.16-.41.35-.7.66-1.01.3-.3.6-.5 1-.65.32-.12.78-.27 1.63-.3.93-.05 1.2-.06 3.55-.06zm0-1.58C6.39 0 6.09.01 5.15.05c-.93.04-1.57.2-2.13.4-.57.23-1.06.54-1.55 1.02C1 1.96.7 2.45.46 3.02c-.22.56-.37 1.2-.4 2.13C0 6.1 0 6.4 0 8.77s.01 2.68.05 3.61c.04.94.2 1.57.4 2.13.23.58.54 1.07 1.02 1.56.49.48.98.78 1.55 1.01.56.22 1.2.37 2.13.4.94.05 1.24.06 3.62.06 2.39 0 2.68-.01 3.62-.05.93-.04 1.57-.2 2.13-.41a4.27 4.27 0 001.55-1.01c.49-.49.79-.98 1.01-1.56.22-.55.37-1.19.41-2.13.04-.93.05-1.23.05-3.61 0-2.39 0-2.68-.05-3.62a6.47 6.47 0 00-.4-2.13 4.27 4.27 0 00-1.02-1.55A4.35 4.35 0 0014.52.46a6.43 6.43 0 00-2.13-.41A69 69 0 008.77 0z"
            ></path>
            <path
              fill="currentColor"
              d="M8.8 4a4.5 4.5 0 100 9 4.5 4.5 0 000-9zm0 7.43a2.92 2.92 0 110-5.85 2.92 2.92 0 010 5.85zM13.43 5a1.05 1.05 0 100-2.1 1.05 1.05 0 000 2.1z"
            ></path>
          </svg>
        </div>
      </a>
      <a
        target="_blank"
        href={XLink}
        className="social-link m-3 md:m-5 w-7 h-7"
        rel="noreferrer"
      >
        <div className="w-7 h-7" style={{display: 'inline-block'}}>
          <svg
            className="icon icon-x"
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
            imageRendering="optimizeQuality"
            fillRule="evenodd"
            clipRule="evenodd"
            viewBox="0 0 512 462.799"
          >
            {/* <rect fill="currentColor" width="512" height="509.64" rx="115.61" ry="115.61" /> */}
            <path 
            xmlns="http://www.w3.org/2000/svg" 
            fillRule="nonzero" 
            fill="currentColor"
            d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z"/>
          </svg>
        </div>
      </a>
    </div>
  );
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

function activeLinkStyle({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return {
    fontWeight: isActive ? 'bold' : undefined,
    color: isPending ? 'grey' : 'white',
  };
}
