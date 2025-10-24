import {data, type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {useLoaderData, Link, type MetaFunction} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import type {ProductItemFragment} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

export const meta: MetaFunction<typeof loader> = () => {
  return [{title: `Collections | Jiagia`}];
};

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
async function loadCriticalData({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  const [gearCollection, artifactsCollection] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle: 'gear', first: 50},
    }),
    storefront.query(COLLECTION_QUERY, {
      variables: {handle: 'artifacts-exhibition-1', first: 50},
    }),
  ]);

  return {
    collections: [
      gearCollection.collection,
      artifactsCollection.collection,
    ].filter(Boolean),
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context}: LoaderFunctionArgs) {
  return {};
}

export default function Collection() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <div>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <header className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Shop Collections</h1>
      </header>
      
      {collections.map((collection, collectionIndex) => (
        <section key={collection.id} className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{collection.title}</h2>
            {collection.description && (
              <p className="text-gray-600">{collection.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mx-auto">
            {collection.products.nodes.map((product: ProductItemFragment, index: number) => (
              <ProductItem
                key={product.id}
                product={product}
                loading={index < 8 ? 'eager' : 'lazy'}
              />
            ))}
          </div>
          
          {collectionIndex < collections.length - 1 && (
            <hr className="mt-16 border-t border-gray-300" />
          )}
        </section>
      ))}
    </div>
    <Image
      alt="Shop Collections Background"
      src="https://cdn.shopify.com/s/files/1/0753/7868/8295/files/laboratory.png?v=1760504043"
    />
    </div>
  );
}

function ProductItem({
  product,
  loading,
}: Readonly<{
  product: ProductItemFragment;
  loading?: 'eager' | 'lazy';
}>) {
  const variant = product.variants.nodes[0];
  const variantUrl = useVariantUrl(product.handle, variant.selectedOptions);
  return (
    <Link
      className="block rounded-lg overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-2 focus:outline-black focus:outline-offset-2"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
      aria-label={`View ${product.title}`}
    >
      {product.featuredImage ? (
        <div className="relative w-full bg-gray-100 overflow-hidden">
          <Image
            alt={product.featuredImage.altText || product.title}
            aspectRatio="1/1"
            data={product.featuredImage}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
            className="w-full h-auto block"
          />
        </div>
      ) : (
        <div className="aspect-square flex items-center justify-center bg-gray-200" aria-label="No image available">
          <span className="text-gray-400 text-sm">No image</span>
        </div>
      )}
      <div className="p-4">
        <h4 className="font-semibold text-base sm:text-lg mb-2">{product.title}</h4>
        <div className="text-sm text-gray-600">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
      </div>
    </Link>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    variants(first: 1) {
      nodes {
        selectedOptions {
          name
          value
        }
      }
    }
  }
` as const;

const COLLECTION_QUERY = `#graphql
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(first: $first) {
        nodes {
          ...ProductItem
        }
      }
    }
  }
  ${PRODUCT_ITEM_FRAGMENT}
` as const;
