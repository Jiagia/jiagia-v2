import {defer, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, MetaFunction, NavLink} from '@remix-run/react';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `${data?.criticalData.page?.seo.title}`},
    {description: `${data?.criticalData.page?.seo.description}`},
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const criticalData = await loadCriticalData(args);

  return defer({criticalData});
}

async function loadCriticalData({context}: LoaderFunctionArgs) {
  const {storefront} = context;
  const handle = 'about';

  const [{page}] = await Promise.all([
    storefront.query(PAGE_QUERY, {
      cache: storefront.CacheLong(),
      variables: {handle},
    }),
  ]);

  if (!page) {
    console.error(page);
    throw new Response(null, {status: 404});
  }

  return {
    page,
  };
}

export default function About() {
  const {page} = useLoaderData<typeof loader>().criticalData;

  return (
    <div>
      <div className="mx-8" dangerouslySetInnerHTML={{__html: page.body}} />
      <div className="mt-4 flex justify-center">
        <NavLink
          to="/dreamscapes"
          className="p-2 hover:font-bold border hover:border-2 border-black hover:no-underline"
        >
          &gt; VIEW DREAMSCAPES &lt;
        </NavLink>
      </div>
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page($handle: String!) {
    page(handle: $handle) {
      handle
      body
      seo {
        title
        description
      }
    }
  }
` as const;
