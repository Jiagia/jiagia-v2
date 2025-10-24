import {useLoaderData, Link} from 'react-router';
import {data, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return data({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, request}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });

  const [{collections}] = await Promise.all([
    context.storefront.query(COLLECTIONS_QUERY, {
      variables: paginationVariables,
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {collections};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Collections() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Collections</h1>
        <p className="text-gray-600">Browse our curated collections</p>
      </header>
      <PaginatedResourceSection connection={collections}>
        {({node: collection, index}: {node: CollectionFragment; index: number}) => (
          <CollectionItem
            key={collection.id}
            collection={collection}
            index={index}
          />
        )}
      </PaginatedResourceSection>
    </div>
  );
}

function CollectionItem({
  collection,
  index,
}: Readonly<{
  collection: CollectionFragment;
  index: number;
}>) {
  return (
    <Link
      className="block rounded-lg overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-2 focus:outline-black focus:outline-offset-2"
      key={collection.id}
      to={`/collections/${collection.handle}`}
      prefetch="intent"
      aria-label={`View ${collection.title} collection`}
    >
      {collection?.image ? (
        <div className="relative w-full bg-gray-100 overflow-hidden">
          <Image
            alt={collection.image.altText || collection.title}
            aspectRatio="1/1"
            data={collection.image}
            loading={index < 8 ? 'eager' : undefined}
            className="w-full h-auto block"
          />
        </div>
      ) : (
        <div className="aspect-square flex items-center justify-center bg-gray-200" aria-label="No image available">
          <span className="text-gray-400 text-sm">No image</span>
        </div>
      )}
      <div className="p-4">
        <h5 className="font-semibold text-lg">{collection.title}</h5>
      </div>
    </Link>
  );
}

const COLLECTIONS_QUERY = `#graphql
  fragment Collection on Collection {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }
  }
  query StoreCollections(
    $country: CountryCode
    $endCursor: String
    $first: Int
    $language: LanguageCode
    $last: Int
    $startCursor: String
  ) @inContext(country: $country, language: $language) {
    collections(
      first: $first,
      last: $last,
      before: $startCursor,
      after: $endCursor
    ) {
      nodes {
        ...Collection
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
` as const;
