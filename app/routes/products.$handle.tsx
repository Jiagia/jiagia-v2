import {useEffect} from 'react';
import {type LoaderFunctionArgs} from '@shopify/remix-oxygen';
import { useLoaderData, type MetaFunction } from 'react-router';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImageGallery} from '~/components/ProductImageGallery';
import {ProductForm} from '~/components/ProductForm';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {trackViewedProduct} from '~/components/KlaviyoOnsite';

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `${data?.product.title ?? ''} | Jiagia Studios`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({
  context,
  params,
  request,
}: LoaderFunctionArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: LoaderFunctionArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  // useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product;

  useEffect(() => {
    trackViewedProduct(selectedVariant);
  },[selectedVariant]);


  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Product Images Section - Takes up 3 columns */}
        <div className="lg:col-span-3 relative">
          <div className="sticky top-8">
            <ProductImageGallery 
              images={product.images?.nodes || []} 
              productTitle={product.title}
            />
          </div>
        </div>

        {/* Product Details Section - Takes up 2 columns */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div className="pb-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-wide">{title}</h1>
            <div className="text-xl font-semibold">
              <div className="text-sm text-gray-600 mb-1 uppercase tracking-wide">Sale price</div>
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
            </div>
          </div>

          <div className="h-px bg-gray-200 w-full"></div>

          {/* Product Description */}
          {descriptionHtml && (
            <div className="space-y-4">
              <h3 className="text-base font-bold uppercase tracking-wide text-gray-800">DESCRIPTION</h3>
              <div className="text-sm leading-relaxed text-gray-600" dangerouslySetInnerHTML={{__html: descriptionHtml}} />
            </div>
          )}

          <div className="h-px bg-gray-200 w-full mb-4"></div>

          {/* Product Note */}
          <div className="space-y-4">
            <h3 className="text-base font-bold uppercase tracking-wide text-gray-800">PRODUCT NOTE</h3>
            <p className="text-sm text-gray-600 italic leading-relaxed">Due to the made-to-order nature of this product, please allow us up to 3 business weeks for production and fulfillment.</p>
          </div>

          <div className="h-px bg-gray-200 w-full"></div>

          {/* Return Policy */}
          <div className="space-y-4">
            <h3 className="text-base font-bold uppercase tracking-wide text-gray-800">RETURN POLICY</h3>
            <div className="text-sm leading-relaxed text-gray-600">
              <p>We accept returns within 30 days of purchase. Items must be unworn, unwashed, and in their original condition with all tags attached.</p>
            </div>
          </div>

          <div className="h-px bg-gray-200 w-full"></div>

          {/* Product Form */}
          <div className="py-2">
            <ProductForm
              productOptions={productOptions}
              selectedVariant={selectedVariant}
            />
          </div>

        </div>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 20) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;