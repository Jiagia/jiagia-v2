import { Link, useNavigate } from 'react-router';
import {type MappedProductOptions} from '@shopify/hydrogen';
import type {
  Maybe,
  ProductOptionValueSwatch,
} from '@shopify/hydrogen/storefront-api-types';
import {AddToCartButton} from './AddToCartButton';
import {useAside} from './Aside';
import type {ProductFragment} from 'storefrontapi.generated';
import {trackAddedToCart} from '~/components/KlaviyoOnsite';

export function ProductForm({
  productOptions,
  selectedVariant,
}: {
  productOptions: MappedProductOptions[];
  selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
}) {
  const navigate = useNavigate();
  const {open} = useAside();

  // klaviyo - track adding to cart
  const handleAtc = function () {
    trackAddedToCart(productOptions)
  } 
  return (
    <div className="flex flex-col space-y-6">
      {productOptions.map((option) => {
        // If there is only a single value in the option values, don't display the option
        if (option.optionValues.length === 1) return null;

        const optionLabel = option.name.toLowerCase() === 'color' ? 'PRODUCT COLOR:' : 
                           option.name.toLowerCase() === 'size' ? 'Size:' : 
                           `${option.name.toUpperCase()}:`;

        return (
          <div className="space-y-3" key={option.name}>
            <h5 className="text-sm font-semibold uppercase tracking-wide text-gray-800 mb-3">{optionLabel}</h5>
            <div className="flex flex-wrap gap-2">
              {option.optionValues.map((value) => {
                // console.log("value", JSON.stringify(value, null, 2))
                const {
                  name,
                  handle,
                  variantUriQuery,
                  selected,
                  available,
                  exists,
                  isDifferentProduct,
                  swatch,
                } = value;

                if (isDifferentProduct) {
                  // SEO
                  // When the variant is a combined listing child product
                  // that leads to a different url, we need to render it
                  // as an anchor tag
                  return (
                    <Link
                      className={`px-4 py-3 border-2 bg-white cursor-pointer transition-all text-sm font-medium uppercase tracking-wide min-w-12 text-center hover:border-gray-800 hover:bg-gray-50 ${
                        selected 
                          ? 'border-black' 
                          : 'border-gray-200'
                      } ${
                        available ? 'opacity-100' : 'opacity-30'
                      }`}
                      key={option.name + name}
                      prefetch="intent"
                      preventScrollReset
                      replace
                      to={`/products/${handle}?${variantUriQuery}`}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </Link>
                  );
                } else {
                  // SEO
                  // When the variant is an update to the search param,
                  // render it as a button with javascript navigating to
                  // the variant so that SEO bots do not index these as
                  // duplicated links
                  return (
                    <button
                      type="button"
                      className={`px-4 py-3 border-2 bg-white cursor-pointer transition-all text-sm font-medium uppercase tracking-wide min-w-12 text-center hover:border-gray-800 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white ${
                        selected 
                          ? 'border-black' 
                          : 'border-gray-200'
                      } ${
                        available ? 'opacity-100' : 'opacity-30'
                      } ${
                        exists && !selected ? 'cursor-pointer' : ''
                      }`}
                      key={option.name + name}
                      disabled={!exists}
                      onClick={() => {
                        if (!selected) {
                          navigate(`?${variantUriQuery}`, {
                            replace: true,
                            preventScrollReset: true,
                          });
                        }
                      }}
                    >
                      <ProductOptionSwatch swatch={swatch} name={name} />
                    </button>
                  );
                }
              })}
            </div>
          </div>
        );
      })}
      <div className="mt-4">
        <AddToCartButton
          disabled={!selectedVariant || !selectedVariant.availableForSale}
          onClick={() => {
            open('cart');
          }}
          analytics={{
            products: [selectedVariant],
            totalValue: parseFloat(selectedVariant?.price?.amount || '0'),
          }}
          lines={
            selectedVariant
              ? [
                  {
                    merchandiseId: selectedVariant.id,
                    quantity: 1,
                    selectedVariant,
                  },
                ]
              : []
          }
        >
          {selectedVariant?.availableForSale ? 'Add to cart' : 'Sold out'}
        </AddToCartButton>
      </div>
    </div>
  );
}

function ProductOptionSwatch({
  swatch,
  name,
}: {
  swatch?: Maybe<ProductOptionValueSwatch> | undefined;
  name: string;
}) {
  const image = swatch?.image?.previewImage?.url;
  const color = swatch?.color;

  if (!image && !color) return name;

  return (
    <div
      aria-label={name}
      className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: color || 'transparent',
      }}
    >
      {!!image && <img src={image} alt={name} className="w-full h-full object-cover" />}
    </div>
  );
}